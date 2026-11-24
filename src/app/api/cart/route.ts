import { hasLocale } from "next-intl";
import { validateCartLines } from "@/lib/cart";
import { loadCartDetails } from "@/lib/cart/load-details";
import { routing } from "@/lib/routing";

const MAX_BODY_BYTES = 16 * 1024;

async function readCartRequest(request: Request): Promise<unknown> {
  const reader = request.body?.getReader();
  if (!reader) throw new SyntaxError("Missing body");
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let bytes = 0;
  let text = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) return JSON.parse(text + decoder.decode());
      bytes += value.byteLength;
      if (bytes > MAX_BODY_BYTES) return undefined;
      text += decoder.decode(value, { stream: true });
    }
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}

export async function POST(request: Request) {
  if (Number(request.headers.get("content-length")) > MAX_BODY_BYTES) {
    return new Response(null, { status: 413 });
  }

  let body: unknown;
  try {
    body = await readCartRequest(request);
  } catch {
    return new Response(null, { status: 400 });
  }

  if (body === undefined) return new Response(null, { status: 413 });
  if (!body || typeof body !== "object" || !("locale" in body) || !("items" in body)
    || typeof body.locale !== "string" || !hasLocale(routing.locales, body.locale)) {
    return new Response(null, { status: 400 });
  }

  const lines = validateCartLines(body.items);
  if (!lines) return new Response(null, { status: 400 });

  try {
    return Response.json(await loadCartDetails(lines, body.locale), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Could not load cart catalog", error);
    return new Response(null, { status: 503 });
  }
}
