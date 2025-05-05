import fs from "fs/promises";
import { readFileSync } from "node:fs";
import { renderReport, saveReport } from "./report.js";

async function main() {
  console.log("Starting report CLI...");
  // path to results folder from process.argv[2]
  const resultsFolder = process.argv[2];
  if (!resultsFolder) {
    console.error(
      "No path to results folder provided - pass it as an argument",
    );
    process.exit(1);
  }

  const results = [];
  const files = await fs.readdir(resultsFolder);
  // filter for .json files
  const jsonFiles = files.filter((file) => file.endsWith(".json"));
  jsonFiles.forEach((file) => {
    const filePath = `${resultsFolder}/${file}`;
    const data = JSON.parse(readFileSync(filePath, "utf8"));
    results.push(data);
  });

  saveReport(resultsFolder, renderReport(results));
}

main();
