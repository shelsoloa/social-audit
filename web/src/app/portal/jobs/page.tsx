import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CardList, auditName } from "@/components/CardList";
import { RISK_LABELS, RiskCategory } from "@/lib/audit/types";

/** Map stored category codes to their display labels, dropping unknown codes. */
function categoryLabels(codes: string[] | null): string[] {
  return (codes ?? [])
    .map((c) => RISK_LABELS[c as RiskCategory])
    .filter((label): label is string => Boolean(label));
}

export default async function JobsPage() {
  const supabase = await createClient();
  const { data: jobs } = await supabase
    .from("audit_jobs")
    .select("job_id, status, enabled_categories, created_at")
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Your audits</h1>
        <Link
          href="/portal/jobs/new"
          className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          New audit
        </Link>
      </div>

      {!jobs || jobs.length === 0 ? (
        <p className="mt-6 text-sm text-zinc-500">
          No audits yet.{" "}
          <Link href="/portal/jobs/new" className="underline">
            Start one
          </Link>
          .
        </p>
      ) : (
        <CardList
          className="mt-6"
          items={jobs.map((j) => ({
            href: `/portal/jobs/${j.job_id}`,
            title: auditName(j.created_at),
            subtitle: `#${j.job_id}`,
            status: j.status,
            badges: categoryLabels(j.enabled_categories),
          }))}
        />
      )}
    </main>
  );
}
