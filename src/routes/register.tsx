import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { authClient } from "#/lib/auth-client";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

const inputStyle = {
  width: "100%",
  padding: "0.5rem",
  border: "1px solid #ccc",
  borderRadius: "4px",
  fontSize: "1rem",
};

const buttonStyle = {
  padding: "0.75rem",
  backgroundColor: "#333",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  fontSize: "1rem",
  cursor: "pointer",
};

function RegisterPage() {
  const [step, setStep] = useState<"form" | "otp">("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval>>(null);

  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  function startCooldown() {
    setResendCooldown(60);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownRef.current) clearInterval(cooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Step 1: Create account
      const { error: signUpErr } = await authClient.signUp.email({
        email,
        password,
        name,
        phoneNumber: phone,
      });

      if (signUpErr) {
        setError(signUpErr.message ?? "Registration failed");
        return;
      }

      // Step 2: Send OTP
      const { error: otpErr } = await authClient.phoneNumber.sendOtp({
        phoneNumber: phone,
      });

      if (otpErr) {
        setError(otpErr.message ?? "Failed to send OTP. Please try again.");
        setStep("otp"); // Account created, let them resend
        return;
      }

      startCooldown();
      setStep("otp");
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleOTPSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error: verifyErr } = await authClient.phoneNumber.verify({
        phoneNumber: phone,
        code: otp,
      });

      if (verifyErr) {
        setError(verifyErr.message ?? "Verification failed");
        return;
      }

      window.location.href = "/";
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError("");
    setLoading(true);

    try {
      const { error: otpErr } = await authClient.phoneNumber.sendOtp({
        phoneNumber: phone,
      });

      if (otpErr) {
        setError(otpErr.message ?? "Failed to resend OTP");
        return;
      }

      startCooldown();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: "2rem", maxWidth: "400px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "1.5rem" }}>Register</h1>

      {error && (
        <div
          style={{
            padding: "0.75rem",
            marginBottom: "1rem",
            backgroundColor: "#fee",
            borderRadius: "4px",
            color: "#c00",
            fontSize: "0.875rem",
          }}
        >
          {error}
        </div>
      )}

      {step === "form" && (
        <form
          onSubmit={handleFormSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          <div>
            <label
              htmlFor="name"
              style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.875rem" }}
            >
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

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
              style={inputStyle}
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
              minLength={8}
              style={inputStyle}
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.875rem" }}
            >
              WhatsApp Number
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              placeholder="+1234567890"
              style={inputStyle}
            />
            <p style={{ margin: "0.25rem 0 0", fontSize: "0.75rem", color: "#666" }}>
              Enter in international format (e.g. +1234567890)
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...buttonStyle,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Creating account..." : "Continue"}
          </button>

          <p style={{ fontSize: "0.875rem", textAlign: "center" }}>
            Already have an account?{" "}
            <a href="/login" style={{ color: "#333", fontWeight: "bold" }}>
              Login
            </a>
          </p>
        </form>
      )}

      {step === "otp" && (
        <form
          onSubmit={handleOTPSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          <p style={{ fontSize: "0.875rem", color: "#555" }}>
            We sent a verification code to <strong>{phone}</strong> via WhatsApp.
          </p>

          <div>
            <label
              htmlFor="otp"
              style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.875rem" }}
            >
              Verification Code
            </label>
            <input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              maxLength={6}
              placeholder="123456"
              style={{ ...inputStyle, letterSpacing: "0.5em", textAlign: "center" }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...buttonStyle,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Verifying..." : "Verify"}
          </button>

          <div style={{ textAlign: "center", fontSize: "0.875rem" }}>
            {resendCooldown > 0 ? (
              <p style={{ color: "#666" }}>Resend code in {resendCooldown}s</p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={loading}
                style={{
                  background: "none",
                  border: "none",
                  color: "#333",
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                }}
              >
                Resend Code
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setStep("form");
              setOtp("");
              setError("");
            }}
            style={{
              background: "none",
              border: "none",
              color: "#666",
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
          >
            Back to registration
          </button>
        </form>
      )}
    </main>
  );
}
