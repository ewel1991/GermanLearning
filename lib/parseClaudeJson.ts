// Claude is instructed to return raw JSON, but on longer/messier inputs it
// sometimes wraps the response in a ```json ... ``` fence anyway. Stripping
// an optional fence before parsing is cheaper than fighting the model for
// 100% prompt compliance.
export function parseClaudeJson<T>(raw: string): T {
  const fenced = raw.trim().match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return JSON.parse(fenced ? fenced[1] : raw) as T;
}
