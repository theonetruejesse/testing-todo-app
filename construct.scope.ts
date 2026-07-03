import { defineConstructOperations, defineConstructScope } from "@construct/sdk";

export const operations = defineConstructOperations([
  {
    kind: "resource",
    id: "todos.list",
    title: "List todos",
    description: "Read the visible todo list.",
  },
  {
    kind: "action",
    id: "todos.mutate",
    title: "Mutate todos",
    description: "Create, complete, or delete todo items.",
  },
]);

export default defineConstructScope({
  read: {
    allow: ["src/**", "src/app/globals.css", "package.json", "next.config.ts", "tsconfig.json"],
    deny: [".env*", "**/.env*", ".git/**", "node_modules/**", ".next/**"],
  },
  scripts: {
    allow: ["typecheck", "build"],
    review: ["lint", "check"],
    deny: ["dev", "start"],
  },
});
