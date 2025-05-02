import { Anthropic } from "@anthropic-ai/sdk";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

export class MCPClient {
  mcp;
  anthropicClient;
  transport = null;
  tools = [];
  debug = false;

  constructor(anthropicApiKey, anthropicModel, debug = false) {
    this.debug = debug;
    this.anthropicModel = anthropicModel;
    this.anthropicClient = new Anthropic({
      apiKey: anthropicApiKey,
      maxRetries: 0, //default is 2
    });
    this.mcp = new Client({ name: "mcp-eval", version: "1.0.0" });
  }

  debugLog(...args) {
    if (this.debug) {
      console.log(...args);
    }
  }

  async connectToServer(command, args = [], env = {}) {
    try {
      this.transport = new StdioClientTransport({
        command: command,
        args: args,
        env: env,
      });
      await this.mcp.connect(this.transport);

      const toolsResult = await this.mcp.listTools();
      this.tools = toolsResult.tools.map((tool) => {
        return {
          name: tool.name,
          description: tool.description,
          input_schema: tool.inputSchema,
        };
      });
      this.debugLog(
        "Connected to server with tools:",
        this.tools.map(({ name }) => name),
      );
    } catch (e) {
      console.log("Failed to connect to MCP server: ", e);
      throw e;
    }
  }

  // Anthropic model config
  // this is where we can set temperature, enable "thinking" / CoT
  // constrain or force tool use
  // https://docs.anthropic.com/en/api/messages
  modelConfig() {
    return {
      model: this.anthropicModel,
      max_tokens: 1000,
    };
  }

  async callLLM(messages) {
    console.log("Calling LLM");
    this.debugLog(messages);
    let response;
    let tries = 3;
    while (tries > 0) {
      try {
        response = await this.anthropicClient.messages.create({
          ...this.modelConfig(),
          messages,
          tools: this.tools,
        });
        break;
      } catch (e) {
        tries--;
        console.error(`Error calling LLM (${tries} tries remaining)`, e);
        if (e["status"] === 429) {
          const retryAfter = e["headers"]["retry-after"];
          console.log(
            `Rate limit exceeded, retrying after ${retryAfter} seconds`,
          );
          await sleep(retryAfter * 1000);
        }
      }
    }
    this.debugLog("LLM response:");
    this.debugLog(response);
    // we can log cost here in response.usage
    return response;
  }

  async callTool(toolName, toolArgs) {
    console.log(
      `Calling tool "${toolName}" with args: ${JSON.stringify(toolArgs)}`,
    );
    // TODO check if tool result was an error or something
    const result = await this.mcp.callTool({
      name: toolName,
      arguments: toolArgs,
    });
    this.debugLog(`Tool "${toolName}" result:`);
    this.debugLog(result, { depth: null });
    return result;
  }

  async processQuery(query) {
    const messages = [
      {
        role: "user",
        content: query,
      },
    ];

    let keepGoing = true;
    while (keepGoing) {
      const response = await this.callLLM(messages);
      messages.push({
        role: "assistant",
        content: response.content,
      });

      if (response.stop_reason === "tool_use") {
        // process all tool call requests
        for (const content of response.content) {
          if (content.type === "tool_use") {
            const toolName = content.name;
            const toolArgs = content.input;
            const result = await this.callTool(toolName, toolArgs);

            messages.push({
              role: "user",
              content: [
                {
                  type: "tool_result",
                  tool_use_id: content.id,
                  content: result.content,
                  // TODO handle this probably
                  // is_error: result.is_error,
                },
              ],
            });
          }
        }
      } else {
        this.debugLog("LLM stopped with reason:", response.stop_reason);
        keepGoing = false;
      }
    }

    return messages;
  }

  async cleanup() {
    await this.mcp.close();
  }
}
