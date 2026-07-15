"use client";

import { useEffect, useState, type FormEvent } from "react";
import { DEFAULT_SITE_CONFIG, type SiteConfig } from "@/lib/site-config-defaults";

const AUTH_KEY = "bolzoy_admin_authed";
const PASSWORD_KEY = "bolzoy_admin_password";

const FIELDS: { key: keyof SiteConfig; label: string; multiline?: boolean }[] = [
  { key: "question", label: "Question", multiline: true },
  { key: "yesButtonText", label: "YES Button Text" },
  { key: "noButtonText", label: "NO Button Text" },
  { key: "successMessage", label: "Success Message", multiline: true },
  { key: "psMessage", label: "PS Message", multiline: true },
  { key: "location", label: "Location" },
  { key: "date", label: "Date" },
  { key: "time", label: "Time" },
  { key: "mapsUrl", label: "Google Maps URL" },
];

type AuthState = "checking" | "authed" | "unauthed";

export default function AdminPage() {
  const [auth, setAuth] = useState<AuthState>("checking");

  // localStorage doesn't exist during SSR, so auth status can only be known
  // after mount — rendering null until then keeps the server and initial
  // client render identical, avoiding a hydration mismatch between the
  // Login and Editor views.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time client-only read, not a derived/external subscription
    setAuth(localStorage.getItem(AUTH_KEY) === "true" ? "authed" : "unauthed");
  }, []);

  if (auth === "checking") return null;

  return auth === "authed" ? (
    <Editor onLogout={() => setAuth("unauthed")} />
  ) : (
    <Login onSuccess={() => setAuth("authed")} />
  );
}

function Login({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        localStorage.setItem(AUTH_KEY, "true");
        localStorage.setItem(PASSWORD_KEY, password);
        onSuccess();
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#0b0103] px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl"
      >
        <h1 className="mb-1 text-lg font-medium text-[#f4e8e4]">Admin</h1>
        <p className="mb-6 text-sm text-[#f4e8e4]/50">Enter password to continue</p>

        <input
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError(false);
          }}
          autoFocus
          placeholder="Password"
          className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm text-[#f4e8e4] outline-none placeholder:text-[#f4e8e4]/30 focus:border-[#c8a165]/60"
        />

        {error && <p className="mt-2 text-sm text-rose-400">Incorrect password.</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-5 w-full rounded-lg bg-[#c8a165] py-3 text-sm font-medium text-[#1c1108] transition hover:bg-[#dcb676] disabled:opacity-50"
        >
          Log In
        </button>
      </form>
    </div>
  );
}

function Editor({ onLogout }: { onLogout: () => void }) {
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_SITE_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/config")
      .then((res) => res.json())
      .then((data: SiteConfig) => {
        if (!cancelled) setConfig(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function handleChange(key: keyof SiteConfig, value: string) {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setStatus("idle");
  }

  async function handleSave() {
    setSaving(true);
    setStatus("idle");
    try {
      const password = localStorage.getItem(PASSWORD_KEY) ?? "";
      const res = await fetch("/api/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify(config),
      });
      setStatus(res.ok ? "saved" : "error");
    } catch {
      setStatus("error");
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(PASSWORD_KEY);
    onLogout();
  }

  if (loading) {
    return <div className="flex min-h-dvh items-center justify-center bg-[#0b0103]" />;
  }

  return (
    <div className="min-h-dvh bg-[#0b0103] px-6 py-12">
      <div className="mx-auto flex max-w-xl flex-col gap-8">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-medium text-[#f4e8e4]">Edit Invitation</h1>
          <button
            type="button"
            onClick={handleLogout}
            className="text-sm text-[#f4e8e4]/40 transition hover:text-[#f4e8e4]/70"
          >
            Log out
          </button>
        </div>

        <div className="flex flex-col gap-5">
          {FIELDS.map(({ key, label, multiline }) => (
            <label key={key} className="flex flex-col gap-1.5">
              <span className="text-xs font-medium uppercase tracking-wider text-[#f4e8e4]/45">
                {label}
              </span>
              {multiline ? (
                <textarea
                  value={config[key]}
                  onChange={(e) => handleChange(key, e.target.value)}
                  rows={2}
                  className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-[#f4e8e4] outline-none focus:border-[#c8a165]/60"
                />
              ) : (
                <input
                  type="text"
                  value={config[key]}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-[#f4e8e4] outline-none focus:border-[#c8a165]/60"
                />
              )}
            </label>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-[#c8a165] px-6 py-3 text-sm font-medium text-[#1c1108] transition hover:bg-[#dcb676] disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
          {status === "saved" && <span className="text-sm text-emerald-400">Saved.</span>}
          {status === "error" && <span className="text-sm text-rose-400">Failed to save.</span>}
        </div>
      </div>
    </div>
  );
}
