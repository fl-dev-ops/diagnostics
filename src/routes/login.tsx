import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { authClient } from "#/lib/auth-client";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
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
        setError(err.message ?? "Login failed");
        return;
      }

      window.location.href = "/";
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: "2rem", maxWidth: "400px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "1.5rem" }}>Login</h1>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        {error && (
          <div
            style={{
              padding: "0.75rem",
              backgroundColor: "#fee",
              borderRadius: "4px",
              color: "#c00",
              fontSize: "0.875rem",
            }}
          >
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="email"
            style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.875rem" }}
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "1rem",
            }}
          />
        </div>

        <div>
          <label
            htmlFor="password"
            style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.875rem" }}
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "1rem",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "0.75rem",
            backgroundColor: "#333",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            fontSize: "1rem",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Signing in..." : "Login"}
        </button>

        <p style={{ fontSize: "0.875rem", textAlign: "center" }}>
          Don't have an account?{" "}
          <a href="/register" style={{ color: "#333", fontWeight: "bold" }}>
            Register
          </a>
        </p>
      </form>
    </main>
  );
}
