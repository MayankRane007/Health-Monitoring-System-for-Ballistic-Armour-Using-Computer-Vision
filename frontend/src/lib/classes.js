export function inputClassName(error) {
  return `w-full rounded-lg border bg-forest px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-muted/70 ${
    error
      ? "border-danger/50 focus:border-danger"
      : "border-line focus:border-accent"
  }`;
}
