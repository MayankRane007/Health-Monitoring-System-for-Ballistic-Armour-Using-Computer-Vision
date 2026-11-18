import {
  ClipboardList,
  FileBarChart,
  LogOut,
  Menu,
  Shield,
  Upload,
  X,
} from "lucide-react";

const primaryItems = [
  { name: "New Inspection", icon: Upload },
  { name: "Inspection History", icon: ClipboardList },
  { name: "Reports", icon: FileBarChart },
];

function NavButton({ item, active, onNavigate, onClose }) {
  const Icon = item.icon;
  const isActive = active === item.name;

  return (
    <button
      type="button"
      onClick={() => {
        onNavigate(item.name);
        onClose?.();
      }}
      aria-current={isActive ? "page" : undefined}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
        isActive
          ? "bg-accent/15 text-accent"
          : "text-muted hover:bg-white/5 hover:text-ink"
      }`}
    >
      <Icon size={18} aria-hidden="true" />
      <span className="flex-1">{item.name}</span>
      {item.pending ? (
        <span className="rounded border border-line px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted">
          Soon
        </span>
      ) : null}
    </button>
  );
}

function Sidebar({ activePage, onNavigate, onLogout, open, onClose }) {
  return (
    <>
      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          aria-label="Close navigation"
          onClick={onClose}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[17.5rem] flex-col border-r border-line bg-forest-900 transition-transform lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-accent/15 p-2 text-accent">
              <Shield size={22} aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-wide">
                ARMOUR<span className="text-accent">WATCH</span>
              </p>
              <p className="text-[10px] uppercase tracking-[0.16em] text-muted">
                Inspection operations
              </p>
            </div>
          </div>
          <button
            type="button"
            className="rounded-lg p-2 text-muted hover:bg-white/5 hover:text-ink lg:hidden"
            aria-label="Close navigation"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5" aria-label="Primary">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
            Workspace
          </p>
          <div className="space-y-1">
            {primaryItems.map((item) => (
              <NavButton
                key={item.name}
                item={item}
                active={activePage}
                onNavigate={onNavigate}
                onClose={onClose}
              />
            ))}
          </div>
        </nav>

        <div className="border-t border-line px-3 py-4">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
            Account
          </p>
          <button
            type="button"
            onClick={() => {
              onLogout();
              onClose?.();
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-muted transition-colors hover:bg-white/5 hover:text-ink"
          >
            <LogOut size={18} aria-hidden="true" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export function MenuToggle({ onClick }) {
  return (
    <button
      type="button"
      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line text-ink lg:hidden"
      aria-label="Open navigation"
      onClick={onClick}
    >
      <Menu size={18} />
    </button>
  );
}

export default Sidebar;
