import { TopBar } from "@/components/TopBar";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Terms of Service — dontcancel.me",
};

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-10 text-lg font-bold tracking-tight">{children}</h2>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 text-sm leading-relaxed text-ink-2">{children}</p>;
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li className="mt-2 text-sm leading-relaxed text-ink-2 before:mr-2 before:content-['—']">
      {children}
    </li>
  );
}

export default function TermsPage() {
  return (
    <>
      <TopBar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-3">
          Last updated June 8, 2026
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">
          Terms of Service
        </h1>
        <P>
          By using dontcancel.me (&ldquo;the Service&rdquo;), you agree to
          these terms. If you don&apos;t agree, don&apos;t use it.
        </P>

        <div className="mt-10 divide-y divide-line">

          {/* What the service is */}
          <section className="pb-8">
            <H2>What this service does</H2>
            <P>
              dontcancel.me connects to the X (Twitter) API using your
              credentials, reads your posts (and optionally your likes and
              reposts), analyzes the text for potentially risky content, and
              shows you a report — in your browser. We surface information; we
              don&apos;t take any action on your account without you explicitly
              initiating it.
            </P>
          </section>

          {/* Your account */}
          <section className="py-8">
            <H2>Your account</H2>
            <P>
              You&apos;re responsible for keeping your login secure and for
              everything that happens under your account. You must be old enough
              to have an X account and to enter into contracts in your
              jurisdiction (generally 13+ for an X account, 18+ to pay for
              credits).
            </P>
          </section>

          {/* Acceptable use */}
          <section className="py-8">
            <H2>What you may not do</H2>
            <P>
              You may use the Service only for reviewing and managing your own
              content. You may not:
            </P>
            <ul className="mt-3 list-none space-y-0 pl-4">
              <Li>Use the Service to scan, surveil, or analyze other people&apos;s accounts without their permission.</Li>
              <Li>Attempt to scrape, crawl, or bulk-export data from the Service or the X API beyond what the X API permits.</Li>
              <Li>Use the Service to harass, stalk, dox, or harm anyone.</Li>
              <Li>Reverse-engineer, resell, or sublicense the Service or the underlying X API access.</Li>
              <Li>Use the Service in any way that violates X&apos;s Terms of Service, Developer Agreement, or Developer Policy.</Li>
              <Li>Attempt to circumvent rate limits, billing, or security controls.</Li>
              <Li>Use the Service for any illegal purpose under applicable law.</Li>
            </ul>
            <P>
              Basically: use it to review your own posts, don&apos;t be a creep,
              and don&apos;t break anything.
            </P>
          </section>

          {/* X API */}
          <section className="py-8">
            <H2>X API access &amp; your consent</H2>
            <P>
              The Service accesses the X API on your behalf using OAuth. By
              connecting your X account, you authorize us to read the content
              you&apos;ve chosen to include in a scan. Your posts pass through
              our servers for analysis but are not stored there. See our{" "}
              <a href="/privacy" className="text-primary underline underline-offset-2">
                Privacy Policy
              </a>{" "}
              for details.
            </P>
            <P>
              You acknowledge that your use of the Service is also subject to
              X&apos;s Terms of Service and Developer Policy. We are not
              affiliated with X Corp.
            </P>
          </section>

          {/* Payments */}
          <section className="py-8">
            <H2>Payments &amp; credits</H2>
            <P>
              Paid scan credits are non-refundable once a scan has begun. If a
              scan fails before completing due to an error on our end, we&apos;ll
              restore your credits. Payments are processed by Stripe — see their
              terms for payment disputes.
            </P>
          </section>

          {/* No warranty */}
          <section className="py-8">
            <H2>No warranty</H2>
            <P>
              The Service is provided <strong>&ldquo;as is&rdquo;</strong> and{" "}
              <strong>&ldquo;as available&rdquo;</strong> without warranties of
              any kind. We don&apos;t guarantee that every risky post will be
              found, that the Service will be uninterrupted or error-free, or
              that our risk assessments are legally or factually accurate. Treat
              the output as a helpful signal, not a legal opinion.
            </P>
          </section>

          {/* Limitation of liability */}
          <section className="py-8">
            <H2>Limitation of liability</H2>
            <P>
              To the fullest extent permitted by law, dontcancel.me and its
              operator are not liable for any indirect, incidental, special, or
              consequential damages arising from your use of the Service —
              including any reputational, employment, or social consequences
              resulting from posts the Service did or did not flag.
            </P>
            <P>
              Our total liability for any claim is limited to the amount you
              paid us in the 30 days before the claim arose, or $10, whichever
              is greater.
            </P>
          </section>

          {/* Termination */}
          <section className="py-8">
            <H2>Termination</H2>
            <P>
              We can suspend or terminate your access at any time if we believe
              you&apos;ve violated these terms, especially the acceptable-use
              rules above. You can stop using the Service at any time — just
              revoke the OAuth access in your X account settings.
            </P>
          </section>

          {/* Changes */}
          <section className="pt-8">
            <H2>Changes to these terms</H2>
            <P>
              We may update these terms occasionally. When we do, we&apos;ll
              update the date at the top of this page. Continued use of the
              Service after a change means you accept the updated terms.
            </P>
            <P>
              Questions? Find <strong>@shelsoloa</strong> on X.
            </P>
          </section>

        </div>
      </main>
      <Footer />
    </>
  );
}
