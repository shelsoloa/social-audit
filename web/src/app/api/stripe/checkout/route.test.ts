/**
 * Tests for POST /api/stripe/checkout
 *
 * Verifies that:
 * - A successful request returns a Stripe session URL.
 * - The amount is read from the server-persisted quote (never from the client).
 * - Only a pending credit_purchases row is inserted — no balance change.
 * - A missing quote returns 422.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/stripe/checkout/route";

// ── Module mocks ──────────────────────────────────────────────────────────────

vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("@/lib/supabase/admin",  () => ({ createAdminClient: vi.fn() }));
vi.mock("@/lib/stripe",          () => ({ getStripe: vi.fn() }));

const { createClient }    = await import("@/lib/supabase/server");
const { createAdminClient } = await import("@/lib/supabase/admin");
const { getStripe }       = await import("@/lib/stripe");

// ── Fixtures ──────────────────────────────────────────────────────────────────

const USER = { id: "user-abc" };

const QUOTE = {
  totalUpfrontUnits: 250,
  deterministic: { units: 200 },
  likes: { suggestedBundleUnits: 50 },
};

const STRIPE_SESSION = { id: "cs_test_session", url: "https://checkout.stripe.com/pay/cs_test" };

function makeSupabaseClient(jobRow: object | null = { job_id: "job1", quote: QUOTE }) {
  const mockQuery = {
    select:      vi.fn().mockReturnThis(),
    eq:          vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: jobRow }),
  };
  return {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: USER } }) },
    from: vi.fn().mockReturnValue(mockQuery),
  };
}

function makeAdminClient() {
  const insertMock = vi.fn().mockResolvedValue({ error: null });
  return {
    from: vi.fn().mockReturnValue({ insert: insertMock }),
    _insertMock: insertMock,
  };
}

function makeStripe() {
  const createSession = vi.fn().mockResolvedValue(STRIPE_SESSION);
  return {
    checkout: { sessions: { create: createSession } },
    _createSession: createSession,
  };
}

function makeRequest(body: object = { jobId: "job1" }) {
  return new Request("http://127.0.0.1:3000/api/stripe/checkout", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("POST /api/stripe/checkout", () => {
  it("returns 200 with the Stripe session URL", async () => {
    const stripe = makeStripe();
    vi.mocked(createClient).mockResolvedValue(makeSupabaseClient() as never);
    vi.mocked(createAdminClient).mockReturnValue(makeAdminClient() as never);
    vi.mocked(getStripe).mockReturnValue(stripe as never);

    const res  = await POST(makeRequest());
    const body = await res.json() as { url: string };

    expect(res.status).toBe(200);
    expect(body.url).toBe(STRIPE_SESSION.url);
  });

  it("reads quantity from server-persisted quote (not client-sent amount)", async () => {
    const stripe = makeStripe();
    vi.mocked(createClient).mockResolvedValue(makeSupabaseClient() as never);
    vi.mocked(createAdminClient).mockReturnValue(makeAdminClient() as never);
    vi.mocked(getStripe).mockReturnValue(stripe as never);

    await POST(makeRequest({ jobId: "job1", credits: 9999 })); // client tries to send credits

    const sessionArgs = stripe._createSession.mock.calls[0]![0] as {
      line_items: Array<{ quantity: number }>;
    };
    // Must use quote.totalUpfrontUnits (250), not the client-supplied 9999
    expect(sessionArgs.line_items[0]!.quantity).toBe(250);
  });

  it("uses STRIPE_MIN_UNITS as floor when quote.totalUpfrontUnits is below it", async () => {
    const tinyQuote = { ...QUOTE, totalUpfrontUnits: 5 }; // below 50 floor
    const stripe = makeStripe();
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseClient({ job_id: "job1", quote: tinyQuote }) as never,
    );
    vi.mocked(createAdminClient).mockReturnValue(makeAdminClient() as never);
    vi.mocked(getStripe).mockReturnValue(stripe as never);

    await POST(makeRequest());

    const sessionArgs = stripe._createSession.mock.calls[0]![0] as {
      line_items: Array<{ quantity: number }>;
    };
    // Floor is STRIPE_MIN_UNITS = 50
    expect(sessionArgs.line_items[0]!.quantity).toBeGreaterThanOrEqual(50);
  });

  it("only inserts a pending credit_purchases row — no balance mutation", async () => {
    const admin = makeAdminClient();
    vi.mocked(createClient).mockResolvedValue(makeSupabaseClient() as never);
    vi.mocked(createAdminClient).mockReturnValue(admin as never);
    vi.mocked(getStripe).mockReturnValue(makeStripe() as never);

    await POST(makeRequest());

    // Assert: admin.from("credit_purchases").insert({ status: "pending", ... })
    expect(admin.from).toHaveBeenCalledWith("credit_purchases");
    const insertCall = admin._insertMock.mock.calls[0]![0] as { status: string };
    expect(insertCall.status).toBe("pending");
    // apply_credit_purchase (balance write) must NOT be called
    expect(admin.from).not.toHaveBeenCalledWith("user_credits");
  });

  it("returns 401 when no authenticated user", async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
      from: vi.fn(),
    } as never);

    const res = await POST(makeRequest());
    expect(res.status).toBe(401);
  });

  it("returns 400 when jobId is missing", async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabaseClient() as never);
    vi.mocked(createAdminClient).mockReturnValue(makeAdminClient() as never);
    vi.mocked(getStripe).mockReturnValue(makeStripe() as never);

    const res = await POST(makeRequest({})); // no jobId
    expect(res.status).toBe(400);
  });

  it("returns 404 when the job is not found", async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabaseClient(null) as never);
    vi.mocked(createAdminClient).mockReturnValue(makeAdminClient() as never);
    vi.mocked(getStripe).mockReturnValue(makeStripe() as never);

    const res = await POST(makeRequest());
    expect(res.status).toBe(404);
  });

  it("returns 422 when the job has no quote yet", async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseClient({ job_id: "job1", quote: null }) as never,
    );
    vi.mocked(createAdminClient).mockReturnValue(makeAdminClient() as never);
    vi.mocked(getStripe).mockReturnValue(makeStripe() as never);

    const res = await POST(makeRequest());
    expect(res.status).toBe(422);
  });
});
