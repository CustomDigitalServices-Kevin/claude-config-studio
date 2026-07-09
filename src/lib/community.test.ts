import { describe, it, expect, vi, afterEach } from "vitest";
import { fetchSharedConfigs } from "./community";

/** Construit un fetch mocke retournant une reponse minimale (Response castee). */
function mockFetch(body: { ok: boolean; status?: number; json?: () => unknown }): typeof fetch {
  return vi.fn(
    async () =>
      ({
        ok: body.ok,
        status: body.status ?? (body.ok ? 200 : 500),
        json: async () => body.json?.(),
      }) as unknown as Response,
  ) as unknown as typeof fetch;
}

const validPayload = {
  configs: [
    {
      id: "cfg-1",
      title: "Config Web TS",
      description: "Setup strict pour Next.js",
      locale: "fr",
      permalink: "abc123payload",
      authorName: "Alex",
      createdAt: "2026-07-01T10:00:00.000Z",
    },
  ],
  page: 1,
  pageSize: 20,
  total: 1,
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("community — fetchSharedConfigs", () => {
  it("reponse valide : retourne la page typee", async () => {
    const result = await fetchSharedConfigs(1, mockFetch({ ok: true, json: () => validPayload }));
    expect(result).not.toBeNull();
    expect(result?.total).toBe(1);
    expect(result?.configs[0]?.id).toBe("cfg-1");
    expect(result?.configs[0]?.locale).toBe("fr");
  });

  it("reponse invalide (schema Zod) : retourne null", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const result = await fetchSharedConfigs(
      1,
      mockFetch({ ok: true, json: () => ({ configs: "not-an-array", page: "1" }) }),
    );
    expect(result).toBeNull();
  });

  it("HTTP 500 : retourne null", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const result = await fetchSharedConfigs(1, mockFetch({ ok: false, status: 500 }));
    expect(result).toBeNull();
  });

  it("timeout 8s (AbortController) : retourne null", async () => {
    vi.useFakeTimers();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const hangingFetch: typeof fetch = (_input, init) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => {
          reject(new DOMException("Aborted", "AbortError"));
        });
      });
    const promise = fetchSharedConfigs(1, hangingFetch);
    await vi.advanceTimersByTimeAsync(8000);
    await expect(promise).resolves.toBeNull();
    vi.useRealTimers();
  });
});
