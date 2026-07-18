"use client";

import { ConstructProvider } from "@construct/sdk/react";
import type { ConstructRuntimeArtifactDescriptor } from "@construct/sdk/react";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";
import {
  materializePreviewDescriptor,
  postRuntimeReadyFingerprint,
  PreviewBlobUrls,
} from "@/lib/construct-runtime/preview-client";
import {
  getConstructPreviewSelection,
  type PreviewSelection,
} from "@/lib/construct-runtime/preview-selector";

type ConstructJsonValue =
  | string
  | number
  | boolean
  | null
  | { readonly [key: string]: ConstructJsonValue }
  | readonly ConstructJsonValue[];

type JsonRecord = Record<string, ConstructJsonValue>;

interface LocalConstructProviderProps {
  children: ReactNode;
  hostBuildId: string;
  platformWebOrigin: string;
  previewEnabled: boolean;
}

const subscribeToImmutableSelection = () => () => undefined;

export function LocalConstructProvider({
  children,
  hostBuildId,
  platformWebOrigin,
  previewEnabled,
}: LocalConstructProviderProps) {
  const previewSelection = useSyncExternalStore<PreviewSelection | null>(
    subscribeToImmutableSelection,
    () => getConstructPreviewSelection(document),
    () => null,
  );

  // Do not mount the runtime provider until instrumentation has selected the
  // preview path. The unbound Surface can render its fallback but cannot race
  // an active-assignment request during hydration.
  if (!previewSelection) return children;
  // A document that asked for preview is never allowed to borrow production
  // state, even when this deployment has the preview consumer disabled.
  if (previewSelection.present && !previewEnabled) return children;

  return (
    <ConfiguredConstructProvider
      hostBuildId={hostBuildId}
      platformWebOrigin={platformWebOrigin}
      previewEnabled={previewEnabled}
      previewSelection={previewSelection}
    >
      {children}
    </ConfiguredConstructProvider>
  );
}

function ConfiguredConstructProvider({
  children,
  hostBuildId,
  platformWebOrigin,
  previewEnabled,
  previewSelection,
}: LocalConstructProviderProps & { previewSelection: PreviewSelection }) {
  const [previewBlobs] = useState(() => new PreviewBlobUrls());

  useEffect(() => {
    return () => previewBlobs.revokeAll();
  }, [previewBlobs]);

  const resolveRuntimeArtifact = useCallback(
    async (input: { surfaceId: string }): Promise<ConstructRuntimeArtifactDescriptor | null> => {
      const response = await fetch("/api/construct/runtime-artifacts/resolve", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...input,
          ...(previewSelection.present ? { previewSelector: previewSelection.selector } : {}),
        }),
      });

      if (!response.ok) {
        throw new Error(`Construct runtime artifact resolution failed with ${response.status}.`);
      }

      const descriptor = (await response.json()) as ConstructRuntimeArtifactDescriptor | null;
      if (!descriptor || !previewSelection.present) return descriptor;
      return await materializePreviewDescriptor({
        blobs: previewBlobs,
        descriptor,
        selector: previewSelection.selector,
      });
    },
    [previewBlobs, previewSelection],
  );

  const onSurfaceReady = useCallback(
    (descriptor: ConstructRuntimeArtifactDescriptor, surfaceId: string) => {
      postRuntimeReadyFingerprint({
        artifactId: descriptor.artifactId,
        contentHash: descriptor.contentHash,
        hostBuildId,
        source: previewSelection.present ? "preview" : "active",
        surfaceId,
        targetOrigin: platformWebOrigin,
      });
    },
    [hostBuildId, platformWebOrigin, previewSelection.present],
  );

  return (
    <ConstructProvider
      actionInvalidations={{
        "todos.create": ["todos.list"],
        "todos.update": ["todos.list"],
        "todos.delete": ["todos.list"],
      }}
      onSurfaceReady={previewEnabled ? onSurfaceReady : undefined}
      resolveRuntimeArtifact={resolveRuntimeArtifact}
      resourceHandlers={{
        "todos.list": async () => {
          const response = await fetch("/api/todos");
          if (!response.ok) throw new Error("Failed to load todos.");
          const body = (await response.json()) as { todos: ConstructJsonValue };
          return body.todos;
        },
      }}
      actionHandlers={{
        "todos.create": async (input) => {
          const response = await fetch("/api/todos", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(input),
          });
          if (!response.ok) throw new Error("Failed to create todo.");
          const body = (await response.json()) as { todo: ConstructJsonValue };
          return body.todo;
        },
        "todos.update": async (input) => {
          const body = asRecord(input);
          const id = stringValue(body.id ?? body.todoId);
          if (!id) throw new Error("todos.update requires id or todoId.");

          const response = await fetch(`/api/todos/${encodeURIComponent(id)}`, {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(body),
          });
          if (!response.ok) throw new Error("Failed to update todo.");
          const result = (await response.json()) as { todo: ConstructJsonValue };
          return result.todo;
        },
        "todos.delete": async (input) => {
          const body = asRecord(input);
          const id = stringValue(body.id ?? body.todoId);
          if (!id) throw new Error("todos.delete requires id or todoId.");

          const response = await fetch(`/api/todos/${encodeURIComponent(id)}`, {
            method: "DELETE",
          });
          if (!response.ok) throw new Error("Failed to delete todo.");
          return { ok: true };
        },
      }}
    >
      {children}
    </ConstructProvider>
  );
}

function asRecord(value: ConstructJsonValue): JsonRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as JsonRecord;
}

function stringValue(value: ConstructJsonValue | undefined): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}
