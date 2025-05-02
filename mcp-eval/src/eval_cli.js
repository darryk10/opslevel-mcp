import { mkdir, writeFile } from "node:fs/promises";

import { Command, Option } from "commander";
import dotenv from "dotenv";

import { MCPClient } from "./mcp_client.js";
import { PROMPTS } from "./prompts.js";
import { renderReport, saveReport } from "./report.js";

dotenv.config();

const program = new Command();

program
  .name("mcp-eval")
  .description("mcp evaluation tool from opslevel")
  .version("0.0.1")
  .addOption(
    new Option("--debug", "Enable debug logging").env("DEBUG").default(false),
  )
  .addOption(
    new Option("--anthropic-api-key <key>", "Anthropic API key")
      .env("ANTHROPIC_API_KEY")
      .makeOptionMandatory(true),
  )
  .addOption(
    new Option("--anthropic-model <model>", "Anthropic model")
      .env("ANTHROPIC_MODEL")
      .default("claude-3-7-sonnet-20250219"),
  )
  .addOption(
    new Option("--mcp-server-path <path>", "Path to MCP server binary")
      .env("MCP_SERVER_PATH")
      .makeOptionMandatory(true),
  )
  .addOption(
    new Option("--opslevel-api-token <token>", "OpsLevel API token")
      .env("OPSLEVEL_API_TOKEN")
      .makeOptionMandatory(true),
  )
  .addOption(
    new Option("--opslevel-app-url <url>", "OpsLevel app URL for local development or self-hosted")
      .env("OPSLEVEL_APP_URL")
  )
  .addOption(
    new Option("--slugs <slugs...>", "Prompt Slugs to run, defaults to all"),
  );

const saveResult = async (folder, fileName, data) => {
  const filePath = `${folder}/${fileName}.json`;
  await writeFile(filePath, JSON.stringify(data, null, 2));
  console.log("Result saved to:", filePath);
};

const packageResult = (prompt, messages, version, model_config) => {
  // maybe we can extract tool calls and results
  return {
    prompt: prompt,
    response: messages[messages.length - 1]["content"][0]["text"],
    raw_messages: messages,
    run_at: new Date().toISOString(),
    ops_level_mcp_version: version,
    model_config: model_config,
  };
};

async function main() {
  console.log("Starting MCP eval client");

  program.parse(process.argv);
  const {
    anthropicApiKey,
    anthropicModel,
    mcpServerPath,
    opslevelApiToken,
    opslevelAppUrl,
    debug,
    slugs,
  } = program.opts();

  const mcpClient = new MCPClient(anthropicApiKey, anthropicModel, debug);
  const results = [];
  const now = new Date();

  // easiest way I can think of to get yyyy-mm-dd-hh-mm
  const folder = `results/${now.toISOString().slice(0, 16)}`
    .replace(/:/g, "-")
    .replace("T", "_");
  await mkdir(folder, { recursive: true });
  console.log("Saving results to folder:", folder);

  try {
    await mcpClient.connectToServer(mcpServerPath, [], {
      OPSLEVEL_API_TOKEN: opslevelApiToken,
      OPSLEVEL_APP_URL: opslevelAppUrl,
    });

    const version = await mcpClient.mcp.getServerVersion()["version"];

    // Filter prompts based on slugs if provided
    const filteredPrompts = slugs
      ? PROMPTS.filter((prompt) => slugs.includes(prompt.slug))
      : PROMPTS;

    for (const prompt of filteredPrompts) {
      console.log("Prompt: ", prompt.query);
      const messages = await mcpClient.processQuery(prompt.query);
      const result = packageResult(
        prompt,
        messages,
        version,
        mcpClient.modelConfig(),
      );
      saveResult(folder, prompt.slug, result);
      results.push(result);
    }
  } finally {
    await mcpClient.cleanup();
  }

  const report = renderReport(results);
  saveReport(folder, report);
}

main();
