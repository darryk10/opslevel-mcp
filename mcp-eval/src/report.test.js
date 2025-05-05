const example = {
  prompt: {
    slug: "employees",
    query: "Who works at opslevel",
  },
  response:
    "Based on the information retrieved from the OpsLevel account, there are 2 users registered:\n\n1. **Alice**\n   - Email: alice@opslevel.com\n   - Role: Admin\n\n2. **Foobar**\n   - Email: foobar@example.com\n   - Role: Team Member\n\nThese are the individuals who have accounts in this OpsLevel system. Alice appears to have administrator privileges, while Foobar is a regular team member.",
  raw_messages: [
    {
      role: "user",
      content: "Who works at opslevel",
    },
    {
      role: "assistant",
      content: [
        {
          type: "text",
          text: "I'll help you find information about who works at OpsLevel. Let me retrieve the list of users in the OpsLevel account.",
        },
        {
          type: "tool_use",
          id: "toolu_013HeznQfrB3tLQbRaDfvPdi",
          name: "users",
          input: {},
        },
      ],
    },
    {
      role: "user",
      content: [
        {
          type: "tool_result",
          tool_use_id: "toolu_013HeznQfrB3tLQbRaDfvPdi",
          content: [
            {
              type: "text",
              text: '[{"Id":"Z2lkOi8vb3BzbGV2ZWwvVXNlci8x","Email":"alice@opslevel.com","HTMLUrl":"http://app.opslevel.local:3000/users/1","Name":"Alice","Role":"admin"},{"Id":"Z2lkOi8vb3BzbGV2ZWwvVXNlci8y","Email":"foobar@example.com","HTMLUrl":"http://app.opslevel.local:3000/users/2","Name":"Foobar","Role":"team_member"}]',
            },
          ],
        },
      ],
    },
    {
      role: "assistant",
      content: [
        {
          type: "text",
          text: "Based on the information retrieved from the OpsLevel account, there are 2 users registered:\n\n1. **Alice**\n   - Email: alice@opslevel.com\n   - Role: Admin\n\n2. **Foobar**\n   - Email: foobar@example.com\n   - Role: Team Member\n\nThese are the individuals who have accounts in this OpsLevel system. Alice appears to have administrator privileges, while Foobar is a regular team member.",
        },
      ],
    },
  ],
  run_at: "2025-04-21T17:57:49.157Z",
  ops_level_mcp_version: "unknown",
  model_config: {
    model: "claude-3-7-sonnet-20250219",
    max_tokens: 1000,
  },
};

import { renderReport } from "./report.js";

describe("Report", () => {
  it("should render the report correctly", () => {
    renderReport([example]);
  });
});
