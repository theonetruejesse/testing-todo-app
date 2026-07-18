const PREVIEW_HASH_PREFIX = "#construct-preview=";

export type PreviewSelection =
  | { readonly present: false }
  | { readonly present: true; readonly selector: string };

interface PreviewDocumentLocation {
  hash: string;
  pathname: string;
  search: string;
}

interface PreviewDocumentHistory {
  replaceState(data: unknown, unused: string, url?: string | URL | null): void;
  state: unknown;
}

const previewSelectionSymbol = Symbol.for("construct.previewSelection");

type PreviewDocumentMemory = Record<symbol, PreviewSelection | undefined>;

/**
 * Captures the selector before React hydrates and immediately removes it from
 * the address bar. The WeakMap is document-local memory, never persisted state.
 */
export function captureConstructPreviewSelector(input: {
  document: object;
  history: PreviewDocumentHistory;
  location: PreviewDocumentLocation;
}): PreviewSelection {
  const memory = input.document as PreviewDocumentMemory;
  const existing = memory[previewSelectionSymbol];
  if (existing) return existing;

  const hash = input.location.hash;
  const selection: PreviewSelection = hash.startsWith(PREVIEW_HASH_PREFIX)
    ? { present: true, selector: hash.slice(PREVIEW_HASH_PREFIX.length) }
    : { present: false };
  memory[previewSelectionSymbol] = selection;

  if (selection.present) {
    input.history.replaceState(
      input.history.state,
      "",
      `${input.location.pathname}${input.location.search}`,
    );
  }
  return selection;
}

export function getConstructPreviewSelection(document: object): PreviewSelection {
  return (document as PreviewDocumentMemory)[previewSelectionSymbol] ?? { present: false };
}
