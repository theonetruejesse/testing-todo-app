import assert from "node:assert/strict";
import test from "node:test";
import { defineConstructManifest } from "./document.js";
import { resolveConstructManifest } from "./resolve.js";
test("surface files inside scope become read-write", () => {
    const resolved = resolveConstructManifest({
        manifest: defineConstructManifest({
            identity: { id: "demo", name: "Demo" },
            scope: {
                read: {
                    allow: ["src/app/**", "package.json"],
                },
            },
            surfaces: [{ id: "todos.main", title: "Todo List" }],
        }),
        surfaceMetadata: {
            "todos.main": {
                additiveRoot: "src/construct/surfaces/todos.main",
                routes: ["/"],
                entrypoints: ["src/app/page.tsx"],
                files: ["src/app/page.tsx", "src/app/components/todo-app.tsx"],
            },
        },
    });
    assert.deepEqual(resolved.resolved.files.filter((rule) => rule.permission === "read-write"), [
        {
            pattern: "src/construct/surfaces/todos.main/**",
            permission: "read-write",
            source: "surface",
            sourceId: "todos.main",
        },
        {
            pattern: "src/app/page.tsx",
            permission: "read-write",
            source: "surface",
            sourceId: "todos.main",
        },
        {
            pattern: "src/app/components/todo-app.tsx",
            permission: "read-write",
            source: "surface",
            sourceId: "todos.main",
        },
    ]);
    assert.deepEqual(resolved.resolved.findings, []);
});
test("surface files outside scope produce findings instead of write authority", () => {
    const resolved = resolveConstructManifest({
        manifest: defineConstructManifest({
            identity: { id: "demo", name: "Demo" },
            scope: {
                read: {
                    allow: ["src/app/**"],
                },
            },
            surfaces: [{ id: "todos.main", title: "Todo List" }],
        }),
        surfaceMetadata: {
            "todos.main": {
                additiveRoot: "src/construct/surfaces/todos.main",
                routes: ["/"],
                entrypoints: ["src/app/page.tsx"],
                files: ["src/app/page.tsx", "src/auth.ts"],
            },
        },
    });
    assert.equal(resolved.resolved.files.some((rule) => rule.pattern === "src/auth.ts" && rule.permission === "read-write"), false);
    assert.deepEqual(resolved.resolved.findings, [
        {
            code: "surface.file-outside-scope",
            severity: "warning",
            surfaceId: "todos.main",
            path: "src/auth.ts",
            message: 'Surface "todos.main" discovered "src/auth.ts", but scope does not allow reading it.',
        },
    ]);
});
test("scope deny blocks surface writes even when a broad scope allow matches", () => {
    const resolved = resolveConstructManifest({
        manifest: defineConstructManifest({
            identity: { id: "demo", name: "Demo" },
            scope: {
                read: {
                    allow: ["src/app/**"],
                    deny: ["src/app/secret.ts"],
                },
            },
            surfaces: [{ id: "todos.main", title: "Todo List" }],
        }),
        surfaceMetadata: {
            "todos.main": {
                additiveRoot: "src/construct/surfaces/todos.main",
                routes: ["/"],
                entrypoints: ["src/app/page.tsx"],
                files: ["src/app/page.tsx", "src/app/secret.ts"],
            },
        },
    });
    assert.equal(resolved.resolved.files.some((rule) => rule.pattern === "src/app/secret.ts" && rule.permission === "read-write"), false);
    assert.deepEqual(resolved.resolved.findings, [
        {
            code: "surface.file-denied-by-scope",
            severity: "warning",
            surfaceId: "todos.main",
            path: "src/app/secret.ts",
            message: 'Surface "todos.main" discovered "src/app/secret.ts", but scope denies it.',
        },
    ]);
});
test("no write-only authority is emitted", () => {
    const resolved = resolveConstructManifest({
        manifest: defineConstructManifest({
            identity: { id: "demo", name: "Demo" },
            scope: {
                read: {
                    allow: [],
                },
            },
            surfaces: [{ id: "todos.main", title: "Todo List" }],
        }),
        surfaceMetadata: {
            "todos.main": {
                additiveRoot: "src/construct/surfaces/todos.main",
                routes: ["/"],
                entrypoints: ["src/app/page.tsx"],
                files: ["src/app/page.tsx"],
            },
        },
    });
    assert.deepEqual(resolved.resolved.files.filter((rule) => rule.permission === "read-write"), [
        {
            pattern: "src/construct/surfaces/todos.main/**",
            permission: "read-write",
            source: "surface",
            sourceId: "todos.main",
        },
    ]);
    assert.equal(resolved.resolved.findings[0]?.code, "surface.file-outside-scope");
});
test("shared surface files produce findings instead of write authority", () => {
    const resolved = resolveConstructManifest({
        manifest: defineConstructManifest({
            identity: { id: "demo", name: "Demo" },
            scope: {
                read: {
                    allow: ["src/app/**"],
                },
            },
            surfaces: [
                { id: "todos.main", title: "Todo List" },
                { id: "notes.main", title: "Notes" },
            ],
        }),
        surfaceMetadata: {
            "todos.main": {
                additiveRoot: "src/construct/surfaces/todos.main",
                routes: ["/todos"],
                entrypoints: ["src/app/todos/page.tsx"],
                files: ["src/app/todos/page.tsx", "src/app/shared/item-card.tsx"],
            },
            "notes.main": {
                additiveRoot: "src/construct/surfaces/notes.main",
                routes: ["/notes"],
                entrypoints: ["src/app/notes/page.tsx"],
                files: ["src/app/notes/page.tsx", "src/app/shared/item-card.tsx"],
            },
        },
    });
    assert.equal(resolved.resolved.files.some((rule) => rule.pattern === "src/app/shared/item-card.tsx" && rule.permission === "read-write"), false);
    assert.deepEqual(resolved.resolved.findings.map((finding) => ({
        code: finding.code,
        surfaceId: finding.surfaceId,
        path: finding.path,
    })), [
        {
            code: "surface.file-shared-by-surfaces",
            surfaceId: "todos.main",
            path: "src/app/shared/item-card.tsx",
        },
        {
            code: "surface.file-shared-by-surfaces",
            surfaceId: "notes.main",
            path: "src/app/shared/item-card.tsx",
        },
    ]);
});
//# sourceMappingURL=resolve.test.js.map