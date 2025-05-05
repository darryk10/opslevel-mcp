# mcp-eval

Evaluate result of various queries/prompts using opslevel-mcp.

At the moment is just uses Anthropic's Claude API, but OpenAI support should come soon.

## Setup

Copy the `template.env` to `.env` and set the necessary variables.

```sh
ANTHROPIC_API_KEY='' # required
OPSLEVEL_APP_URL='' # optional
OPSLEVEL_API_TOKEN='' # required
MCP_SERVER_PATH='' # required
```

You can also pass these as flags to the command line.
See `yarn eval --help` for more details

## Prompts

Prompts are kept in `prompts.js`. Each prompt has a `slug` and a `query`.

## Running

The `MCP_SERVER_PATH` environment variable is the path on your local file system that points to the MCP server you want to test.

```
yarn run eval
```

If you don't set the `MCP_SERVER_PATH` environment variable, you must provide the path as a command-line argument.

```
yarn run eval path/to/opslevel-mcp
```

If you provide both the `MCP_SERVER_PATH` variable and the command-line argument, the command-line argument takes precedence.

For more detailed logging:

```
DEBUG=true yarn run eval
```

## Results

The results are in the `results` folder. Each run creates a new folder with the time of the run (eg: `2025-04-21T17:57/`).

For each slug in `prompts.js`, there's a `<slug>.json` file. Example:

```json
{
  "prompt": {
    "slug": "employees",
    "query": "Who works at opslevel"
  },
  "response": "Based on the information retrieved from the OpsLevel account, there are 2 users registered:\n\n1. **Alice**\n   - Email: alice@opslevel.com\n   - Role: Admin\n\n2. **Foobar**\n   - Email: foobar@example.com\n   - Role: Team Member\n\nThese are the individuals who have accounts in this OpsLevel system. Alice appears to have administrator privileges, while Foobar is a regular team member.",
  "raw_messages": [
    {
      "role": "user",
      "content": "Who works at opslevel"
    },
    {
      "role": "assistant",
      "content": [
        {
          "type": "text",
          "text": "I'll help you find information about who works at OpsLevel. Let me retrieve the list of users in the OpsLevel account."
        },
        {
          "type": "tool_use",
          "id": "toolu_013HeznQfrB3tLQbRaDfvPdi",
          "name": "users",
          "input": {}
        }
      ]
    },
    {
      "role": "user",
      "content": [
        {
          "type": "tool_result",
          "tool_use_id": "toolu_013HeznQfrB3tLQbRaDfvPdi",
          "content": [
            {
              "type": "text",
              "text": "[{\"Id\":\"Z2lkOi8vb3BzbGV2ZWwvVXNlci8x\",\"Email\":\"alice@opslevel.com\",\"HTMLUrl\":\"http://app.opslevel.local:3000/users/1\",\"Name\":\"Alice\",\"Role\":\"admin\"},{\"Id\":\"Z2lkOi8vb3BzbGV2ZWwvVXNlci8y\",\"Email\":\"foobar@example.com\",\"HTMLUrl\":\"http://app.opslevel.local:3000/users/2\",\"Name\":\"Foobar\",\"Role\":\"team_member\"}]"
            }
          ]
        }
      ]
    },
    {
      "role": "assistant",
      "content": [
        {
          "type": "text",
          "text": "Based on the information retrieved from the OpsLevel account, there are 2 users registered:\n\n1. **Alice**\n   - Email: alice@opslevel.com\n   - Role: Admin\n\n2. **Foobar**\n   - Email: foobar@example.com\n   - Role: Team Member\n\nThese are the individuals who have accounts in this OpsLevel system. Alice appears to have administrator privileges, while Foobar is a regular team member."
        }
      ]
    }
  ],
  "run_at": "2025-04-21T17:57:49.157Z",
  "ops_level_mcp_version": "unknown",
  "model_config": {
    "model": "claude-3-7-sonnet-20250219",
    "max_tokens": 1000
  }
}
```
