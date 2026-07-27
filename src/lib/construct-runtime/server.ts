import { createConstructNextRuntimeServer } from "@construct/sdk/next/server";

export const constructRuntime = createConstructNextRuntimeServer({
  environment: process.env,
  surfaceId: "todos.main",
});
