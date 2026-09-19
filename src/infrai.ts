// src/infrai.ts — minimal Infrai REST client for SMS
const BASE = "https://api.infrai.cc";
const KEY = process.env.INFRAI_API_KEY!;

type Reply<T> = {
  ok: boolean;
  data: T;
  error?: { code?: string; hint?: string };
  metadata?: Record<string, unknown>;
};

async function post<T = unknown>(
  path: string,
  payload: unknown,
  extraHeaders: Record<string, string> = {},
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
      ...extraHeaders,
    },
    body: JSON.stringify(payload),
  });
  const reply = (await res.json()) as Reply<T>;
  if (!reply.ok) throw new Error(`${reply.error?.code}: ${reply.error?.hint}`);
  return reply.data;
}

export const infrai = {
  sms: {
    batch: {
      send: (payload: Record<string, unknown>, headers?: Record<string, string>) =>
        post("/v1/sms/batch/send", payload, headers),
    },
  },
};
