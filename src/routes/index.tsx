import { createFileRoute, Link } from "@tanstack/react-router";
import { authClient } from "#/lib/auth-client";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const { data: session, isPending } = authClient.useSession();

  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <section className="island-shell rise-in relative overflow-hidden rounded-[2rem] px-6 py-10 sm:px-10 sm:py-14">
        <div className="pointer-events-none absolute -left-20 -top-24 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(79,184,178,0.32),transparent_66%)]" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(47,106,74,0.18),transparent_66%)]" />
        <p className="island-kicker mb-3">Welcome</p>
        <h1 className="display-title mb-5 max-w-3xl text-4xl leading-[1.02] font-bold tracking-tight text-[var(--sea-ink)] sm:text-6xl">
          Diagnostics Platform
        </h1>
        <p className="mb-8 max-w-2xl text-base text-[var(--sea-ink-soft)] sm:text-lg">
          A diagnostic tool platform for managing and analyzing various diagnostic data.
        </p>
        <div className="flex flex-wrap gap-3">
          {isPending ? (
            <div className="h-10 w-32 bg-neutral-200 animate-pulse rounded-full" />
          ) : session?.user ? (
            <div className="flex items-center gap-4">
              <span className="text-[var(--sea-ink-soft)]">
                Welcome, {session.user.name || session.user.email}
              </span>
            </div>
          ) : (
            <>
              <Link
                to="/sign-up"
                className="rounded-full border border-[rgba(50,143,151,0.3)] bg-[rgba(79,184,178,0.14)] px-5 py-2.5 text-sm font-semibold text-[var(--lagoon-deep)] no-underline transition hover:-translate-y-0.5 hover:bg-[rgba(79,184,178,0.24)]"
              >
                Get Started
              </Link>
              <Link
                to="/sign-in"
                className="rounded-full border border-[rgba(23,58,64,0.2)] bg-white/50 px-5 py-2.5 text-sm font-semibold text-[var(--sea-ink)] no-underline transition hover:-translate-y-0.5 hover:border-[rgba(23,58,64,0.35)]"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          ["Real-time Diagnostics", "Monitor system health and performance metrics in real-time."],
          ["Automated Analysis", "AI-powered analysis to identify issues and recommend solutions."],
          [
            "Comprehensive Reports",
            "Generate detailed reports and export data in multiple formats.",
          ],
        ].map(([title, desc], index) => (
          <article
            key={title}
            className="island-shell feature-card rise-in rounded-2xl p-5"
            style={{ animationDelay: `${index * 90 + 80}ms` }}
          >
            <h2 className="mb-2 text-base font-semibold text-[var(--sea-ink)]">{title}</h2>
            <p className="m-0 text-sm text-[var(--sea-ink-soft)]">{desc}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
