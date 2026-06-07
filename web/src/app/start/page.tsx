"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  JobCreationForm,
  type JobFormInitial,
} from "@/components/JobCreationForm";
import { startAudit, type StartAuditInput } from "./actions";

const PENDING_KEY = "pendingAudit";
const DEV_LOGIN = process.env.NEXT_PUBLIC_ENABLE_DEV_LOGIN === "true";

export default function StartPage() {
  const router = useRouter();
  const finalizingRef = useRef(false);

  const [ready, setReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [initial, setInitial] = useState<JobFormInitial | undefined>();
  const [pendingPayload, setPendingPayload] = useState<StartAuditInput | null>(
    null,
  );

  const [showAuth, setShowAuth] = useState(false);
  const [devEmail, setDevEmail] = useState("dev@example.com");
  const [devPassword, setDevPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // On load: resolve session, prefill from profile, and finish a pending audit
  // if we just came back from an auth redirect.
  useEffect(() => {
    const supabase = createClient();
    (async () => {
      if (new URLSearchParams(window.location.search).get("error") === "auth") {
        setError("Sign-in failed. Please try again.");
      }
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();
        if (profile) {
          setInitial({
            age: profile.age != null ? String(profile.age) : "",
            gender: profile.gender ?? "",
            race: profile.race ?? "",
            orientation: profile.sexual_orientation ?? "",
            country: profile.country ?? "",
          });
        }
        const pending = sessionStorage.getItem(PENDING_KEY);
        if (pending) {
          try {
            await finalize(JSON.parse(pending) as StartAuditInput);
            return;
          } catch {
            sessionStorage.removeItem(PENDING_KEY);
          }
        }
      }
      setReady(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function finalize(payload: StartAuditInput) {
    if (finalizingRef.current) return;
    finalizingRef.current = true;
    setSubmitting(true);
    const result = await startAudit(payload);
    if ("jobId" in result) {
      sessionStorage.removeItem(PENDING_KEY);
      router.push(`/portal/jobs/${result.jobId}`);
    } else {
      finalizingRef.current = false;
      setSubmitting(false);
      setError(result.error);
    }
  }

  function handleSubmit(payload: StartAuditInput) {
    setError(null);
    if (userId) {
      finalize(payload);
    } else {
      setPendingPayload(payload);
      sessionStorage.setItem(PENDING_KEY, JSON.stringify(payload));
      setShowAuth(true);
    }
  }

  async function handleX() {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "x",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/start`,
        scopes: "users.read tweet.read offline.access",
      },
    });
    if (error) setError(error.message);
  }

  async function handleDevAuth(e: React.FormEvent) {
    e.preventDefault();
    if (!pendingPayload) return;
    setError(null);
    setSubmitting(true);
    const supabase = createClient();
    const signIn = await supabase.auth.signInWithPassword({
      email: devEmail,
      password: devPassword,
    });
    if (signIn.error) {
      const signUp = await supabase.auth.signUp({
        email: devEmail,
        password: devPassword,
      });
      if (signUp.error) {
        setSubmitting(false);
        setError(signUp.error.message);
        return;
      }
    }
    await finalize(pendingPayload);
  }

  if (!ready) {
    return (
      <main className="flex flex-1 items-center justify-center p-6 text-zinc-500">
        Loading…
      </main>
    );
  }

  const field =
    "w-full rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700";

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Start an audit</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Tell us a bit about you so we can judge what counts as risky, then pick
        what to scan for.
      </p>

      <JobCreationForm
        initial={initial}
        submitting={submitting}
        error={error}
        onSubmit={handleSubmit}
      />

      {showAuth && !userId && (
        <div className="mt-8 rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
          <h2 className="text-sm font-medium">Sign in to start your audit</h2>
          <p className="mt-1 text-xs text-zinc-500">
            We need access to your X account to scan it.
          </p>
          <button
            onClick={handleX}
            disabled={submitting}
            className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-full bg-black px-6 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 dark:bg-white dark:text-black"
          >
            Continue with X
          </button>

          {DEV_LOGIN && (
            <form
              onSubmit={handleDevAuth}
              className="mt-5 space-y-3 border-t border-zinc-200 pt-5 dark:border-zinc-800"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                Dev login (local only)
              </p>
              <input
                type="email"
                value={devEmail}
                onChange={(e) => setDevEmail(e.target.value)}
                placeholder="email"
                className={field}
                required
              />
              <input
                type="password"
                value={devPassword}
                onChange={(e) => setDevPassword(e.target.value)}
                placeholder="password (min 6 chars)"
                minLength={6}
                className={field}
                required
              />
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex h-10 w-full items-center justify-center rounded-full border border-zinc-300 px-6 text-sm font-medium transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
              >
                {submitting ? "Signing in…" : "Sign in / sign up"}
              </button>
            </form>
          )}
        </div>
      )}
    </main>
  );
}
