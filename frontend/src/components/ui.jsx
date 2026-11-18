import { AlertCircle, Loader2, RefreshCw, Search } from "lucide-react";
import { inputClassName } from "../lib/classes";

export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink sm:text-[1.7rem]">
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}

export function Card({ className = "", children }) {
  return (
    <section
      className={`rounded-2xl border border-line/80 bg-forest-800/90 shadow-[0_1px_0_rgba(255,255,255,0.03)] ${className}`}
    >
      {children}
    </section>
  );
}

export function CardHeader({ title, description, action }) {
  return (
    <div className="flex flex-col gap-3 border-b border-line/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-base font-semibold text-ink">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-muted">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function Button({
  children,
  variant = "primary",
  type = "button",
  className = "",
  ...props
}) {
  const styles = {
    primary:
      "bg-accent text-forest hover:bg-[#63c089] disabled:bg-accent/40 disabled:text-forest/70",
    secondary:
      "border border-line bg-forest-700 text-ink hover:border-accent/40 hover:bg-forest-700/80",
    ghost: "text-muted hover:bg-white/5 hover:text-ink",
    danger:
      "border border-danger/30 bg-danger/10 text-danger hover:bg-danger/15",
  };

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function IconButton({ label, children, className = "", ...props }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border border-transparent text-muted transition-colors hover:border-line hover:bg-white/5 hover:text-ink disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Field({ label, hint, error, htmlFor, children }) {
  return (
    <div>
      {label ? (
        <label htmlFor={htmlFor} className="mb-2 block text-sm text-muted">
          {label}
        </label>
      ) : null}
      {children}
      {error ? (
        <p className="mt-1.5 text-xs text-danger" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export function StatusBadge({ status }) {
  const value = String(status || "Unknown");
  const tone = value.toLowerCase();
  const styles =
    tone === "completed"
      ? "border-accent/25 bg-accent/10 text-accent"
      : tone === "pending"
        ? "border-warning/25 bg-warning/10 text-warning"
        : tone === "failed" || tone === "error"
          ? "border-danger/25 bg-danger/10 text-danger"
          : "border-line bg-white/5 text-muted";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${styles}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      <span>{value}</span>
    </span>
  );
}

export function Alert({ tone = "danger", title, children, action }) {
  const styles =
    tone === "ok"
      ? "border-accent/25 bg-accent/10 text-accent"
      : tone === "warn"
        ? "border-warning/25 bg-warning/10 text-warning"
        : "border-danger/25 bg-danger/10 text-danger";

  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${styles}`}
    >
      <AlertCircle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        {title ? <p className="font-medium">{title}</p> : null}
        <div className={title ? "mt-1 text-ink/80" : ""}>{children}</div>
        {action ? <div className="mt-2">{action}</div> : null}
      </div>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="px-6 py-14 text-center">
      {Icon ? (
        <Icon size={32} className="mx-auto mb-3 text-muted/50" aria-hidden="true" />
      ) : null}
      <p className="font-medium text-ink">{title}</p>
      {description ? (
        <p className="mx-auto mt-1 max-w-md text-sm text-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function LoadingBlock({ label = "Loading records…" }) {
  return (
    <div className="px-6 py-14 text-center text-muted">
      <Loader2
        size={26}
        className="mx-auto mb-3 animate-spin text-accent motion-reduce:animate-none"
        aria-hidden="true"
      />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function RefreshButton({ onClick, loading, children = "Refresh" }) {
  return (
    <Button variant="secondary" onClick={onClick} disabled={loading}>
      <RefreshCw
        size={16}
        className={loading ? "animate-spin motion-reduce:animate-none" : ""}
        aria-hidden="true"
      />
      {children}
    </Button>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder,
  id = "search",
  label = "Search",
}) {
  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Search
        size={16}
        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted"
        aria-hidden="true"
      />
      <input
        id={id}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={`${inputClassName(false)} pl-9`}
      />
    </div>
  );
}
