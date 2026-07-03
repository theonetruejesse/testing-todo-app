import { defineConstructScope } from "@construct/sdk";

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
