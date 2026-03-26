import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { authClient } from "#/lib/auth-client";

export const Route = createFileRoute("/sign-in")({
  component: SignInPage,
});

function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error: err } = await authClient.signIn.email({
        email,
        password,
      });

      if (err) {
        setError(err.message ?? "An error occurred");
        return;
      }

      window.location.href = "/";
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <div className="island-shell max-w-md mx-auto rounded-2xl p-6 sm:p-8">
        <div className="text-center mb-8">
          <p className="island-kicker mb-2">Sign In</p>
          <h1 className="display-title text-3xl font-bold text-[var(--sea-ink)]">Welcome back</h1>
          <p className="mt-2 text-[var(--sea-ink-soft)]">
            Don't have an account?{" "}
            <Link to="/sign-up" className="text-[var(--lagoon-deep)] hover:underline">
              Sign up
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[var(--sea-ink)] mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg border border-[var(--line)] bg-white text-[var(--sea-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--lagoon)]"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-[var(--sea-ink)] mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg border border-[var(--line)] bg-white text-[var(--sea-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--lagoon)]"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-[var(--lagoon-deep)] text-white font-semibold hover:bg-[var(--lagoon)] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
