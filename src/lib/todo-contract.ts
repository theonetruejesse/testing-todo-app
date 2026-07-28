import { z } from "zod";

// The shared contract is host-owned application vocabulary. Both API routes
// and client UI import it without coupling browser code to the server store.
export const todoSchema = z.object({
  id: z.string().uuid().describe("Stable todo identifier"),
  title: z.string().min(1).max(120).describe("Short description of the work item"),
  completed: z.boolean().describe("Whether the work item is complete"),
  priority: z.boolean().describe("Whether the work item is marked as a priority"),
});

export const createTodoInputSchema = z.object({
  title: z.string().trim().min(1).max(120).describe("Title of the new work item"),
  priority: z.boolean().optional().describe("Whether the new work item is a priority"),
});

export const updateTodoFieldsSchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  completed: z.boolean().optional(),
  priority: z.boolean().optional(),
});

export type Todo = z.infer<typeof todoSchema>;
