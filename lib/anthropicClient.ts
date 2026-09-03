import Anthropic from "@anthropic-ai/sdk";

// Some Anthropic API keys are "identity-linked" (valid across every
// workspace the person belongs to, rather than scoped to one workspace) and
// the API rejects requests from them unless the target workspace is named
// explicitly via this header. A plain workspace-scoped key doesn't need it.
// Set ANTHROPIC_WORKSPACE_ID (wrkspc_...) in the environment when using an
// identity-linked key — e.g. on Vercel, where this bit us in production.
export function getAnthropicClient(): Anthropic {
  const workspaceId = process.env.ANTHROPIC_WORKSPACE_ID;
  return new Anthropic(
    workspaceId
      ? { defaultHeaders: { "anthropic-workspace-id": workspaceId } }
      : undefined
  );
}

export function describeAnthropicError(err: unknown): string {
  if (err instanceof Anthropic.APIError) {
    return `Anfrage an Claude ist fehlgeschlagen (${err.status}): ${err.message}`;
  }
  return "Anfrage an Claude ist fehlgeschlagen.";
}
