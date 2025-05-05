export const PROMPTS = [
  { slug: "who", query: "Who works at opslevel?" },
  {
    slug: "slow_service_debug_missing",
    query:
      "My x service is experiencing slowness, where should I start looking?",
  },
  {
    slug: "slow_service_debug",
    query:
      "My rails service is experiencing slowness, where should I start looking?",
  },
  {
    slug: "slow_service_related",
    query:
      "My Rails monolith service is experiencing slowness, are any related objects having an incident?",
  },
  {
    slug: "actions",
    query: "I need to rollback OpsSight, how can I do that?",
  },
  {
    slug: "service_deps",
    query:
      "opslevel-runner is throwing errors when trying to pull jobs, which service is responsible for this?",
  },
  {
    slug: "system_diagram",
    query:
      "Generate a system summary and whole system diagrams based on the services, infra and relationships/dependencies in opslevel.",
  },
  {
    slug: "feature_impl_help",
    query:
      "I’m trying to implement throttling feature into simplekiq service. How should I get started?",
  },
  {
    slug: "recommend_dep_rails",
    query: "What is the recommended/approved version of rails?",
  },
  {
    slug: "recommend_dep_go",
    query: "What is the recommended/approved version of cobra?",
  },
  {
    slug: "new_mcp",
    query: "I want to create an mcp server, how can I do this?",
  },
  {
    slug: "new_service",
    query: "I want to create a new rails service, how can I do this?",
  },
  {
    slug: "service_ownership",
    query: "Who owns backstage?",
  },
  {
    slug: "incident_page",
    query: "How do I page the on-call engineer?",
  },
];
