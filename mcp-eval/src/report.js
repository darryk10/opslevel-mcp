import Handlebars from "handlebars";
import { marked } from "marked";
import { writeFile } from "node:fs/promises";

const HANDLEBARS_OPTIONS = {
  noEscape: true,
  strict: true,
};

const pageTemplate = Handlebars.compile(
  `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
  * {
    font-family: sans-serif;
  }
  body {
    display:flex;
    justify-content: center;
  }
  .container {
    max-width: 1024px;
  }
  .outline {
    border: black solid 1px;
    margin: 4px;
    padding: 8px 12px;
  }
  code {
    background-color: #f5f5f5;
    padding: 2px 4px;
    border-radius: 4px;
  }
  pre {
    background-color: #f5f5f5;
    padding: 10px;
    border-radius: 5px;
    white-space: pre-wrap;
    overflow-x: auto;
  }
  </style>
</head>
<body>
<div class="container">
<h1>mcp-eval Report</h1>

<div class="outline">
  {{#with prompts.[0]}}
  <p>Run at: <code>{{run_at}}</code></p>
  <p>Model: <code>{{model_config.model}}</code></p>
  {{/with}}
</div>

<div>
  <p>jump to prompt:</p>
  <ul>
  {{#each prompts}}
    <li><a href="#{{this.prompt.slug}}">{{this.prompt.slug}}</a></li>
  {{/each}}
  </ul>
</div>
{{#each renderedPrompts}}
  {{this}}
{{/each}}
</div>
</body>
</html>`,
  HANDLEBARS_OPTIONS,
);

const promptTemplate = Handlebars.compile(
  `
<div>
<h1 id="{{prompt.slug}}">{{prompt.slug}}</h1>
<p><a href="{{prompt.slug}}.json">raw json record</a></p>
{{#each rendered_messages}}
<div class="outline">
  {{this}}
</div>
{{/each}}

</div>
`,
  HANDLEBARS_OPTIONS,
);

const userTextTemplate = Handlebars.compile(
  `
<div class="userText">
<p><strong>&lt;user&gt;</strong> {{this}}</p>
</div>
`,
  HANDLEBARS_OPTIONS,
);

const userToolResultTemplate = Handlebars.compile(
  `
<div class="userToolResult">
  <p>
    <strong>&lt;tool result&gt;</strong>
    <details>
      <summary>show</summary>
      <pre>{{this}}</pre>
    </details>
  </p>
</div>
`,
  HANDLEBARS_OPTIONS,
);

const assistantTextTemplate = Handlebars.compile(
  `
<div class="assistantText">
  <p><strong>&lt;llm&gt;</strong></p>
  {{this}}
</div>
`,
  HANDLEBARS_OPTIONS,
);

const assistantToolUse = Handlebars.compile(
  `
<div class="assistantToolResult">
<p>
  <strong>&lt;tool call&gt;</strong> <code>{{name}}</code> with <code>{{input}}</code>
</p>
</div>
`,
  HANDLEBARS_OPTIONS,
);

function renderMessage(message) {
  if (message.role === "user") {
    if (typeof message.content === "string") {
      return userTextTemplate(message.content);
    } else {
      return message.content.map((m) => {
        if (m.type === "text") {
          return userTextTemplate(m.text);
        } else if (m.type === "tool_result") {
          const toolResult = JSON.stringify(
            JSON.parse(m.content[0].text),
            null,
            2,
          );
          return userToolResultTemplate(toolResult);
        } else {
          return `Unexpected user message format: <pre>${m}</pre>`;
        }
      });
    }
  } else if (message.role === "assistant") {
    return message.content.flatMap((m) => {
      if (m.type === "text") {
        return assistantTextTemplate(marked.parse(m.text));
      } else if (m.type === "tool_use") {
        return assistantToolUse({
          ...m,
          input: JSON.stringify(m.input, null, 2),
        });
      } else {
        return `Unexpected assistant message format: <pre>${message}</pre>`;
      }
    });
  }
  throw "Unexpected message role: " + message.role;
}

export function renderReport(prompts) {
  const renderedPrompts = prompts.map((prompt) => {
    return promptTemplate({
      ...prompt,
      rendered_messages: prompt.raw_messages.flatMap(renderMessage),
    });
  });
  const html = pageTemplate({ prompts, renderedPrompts });
  return html;
}

export async function saveReport(path, report) {
  const filePath = `${path}/report.html`;
  await writeFile(filePath, report);
  console.log("Report saved to:", filePath);
}
