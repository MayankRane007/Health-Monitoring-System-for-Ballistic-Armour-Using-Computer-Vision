import { ArrowRight, Shield } from "lucide-react";
import { useState } from "react";

import { Alert, Button, Field } from "../components/ui";
import { inputClassName } from "../lib/classes";

function Login({
  onLogin,
  onRegister,
  error,
  loading,
  onModeChange,
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    (isRegistering ? onRegister : onLogin)(email.trim(), password);
  }

  function toggleMode() {
    setIsRegistering((registering) => !registering);
    onModeChange();
  }

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-forest px-4 py-10 text-ink">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        aria-hidden="true"
      >
        <div className="absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <section className="relative w-full max-w-md">
        <div className="mb-7 flex items-center justify-center gap-3">
          <div className="rounded-xl border border-accent/20 bg-accent/10 p-3 text-accent">
            <Shield size={25} aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wide">
              ARMOUR<span className="text-accent">WATCH</span>
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-forest-900/95 p-6 shadow-2xl shadow-black/20 sm:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight">
              {isRegistering ? "Create your account" : "Sign in to ArmourWatch"}
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted">
              {isRegistering
                ? "Create an account to access ArmourWatch."
                : "Sign in with your email and password."}
            </p>
          </div>

          {error ? (
            <div className="mb-5">
              <Alert title={isRegistering ? "Could not create account" : "Sign-in failed"}>
                {error}
              </Alert>
            </div>
          ) : null}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <Field label="Email address" htmlFor="login-email">
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@example.com"
                className={inputClassName(false)}
              />
            </Field>

            <Field label="Password" htmlFor="login-password">
              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete={isRegistering ? "new-password" : "current-password"}
                required
                minLength={isRegistering ? 12 : undefined}
                maxLength={1024}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={
                  isRegistering
                    ? "At least 12 characters"
                    : "Enter your password"
                }
                className={inputClassName(false)}
                aria-describedby={isRegistering ? "password-hint" : undefined}
              />
              {isRegistering ? (
                <p id="password-hint" className="mt-1.5 text-xs text-muted">
                  Use at least 12 characters.
                </p>
              ) : null}
            </Field>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? isRegistering
                  ? "Creating account…"
                  : "Signing in…"
                : isRegistering
                  ? "Create account"
                  : "Sign in"}
              {!loading ? <ArrowRight size={16} aria-hidden="true" /> : null}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-muted">
            {isRegistering ? "Already have an account?" : "New to ArmourWatch?"}{" "}
            <button
              type="button"
              onClick={toggleMode}
              className="font-medium text-accent underline-offset-4 hover:underline"
            >
              {isRegistering ? "Sign in" : "Create an account"}
            </button>
          </p>
        </div>
      </section>
    </main>
  );
}

export default Login;
