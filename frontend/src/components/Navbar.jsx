import { Search } from "lucide-react";
import { useState } from "react";
import { MenuToggle } from "./Sidebar";
import { Button } from "./ui";

function Navbar({
  pageTitle,
  onOpenNav,
  onSearchSubmit,
  apiStatus,
}) {
  const [query, setQuery] = useState("");

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-forest-900/95 backdrop-blur">
      <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
        <MenuToggle onClick={onOpenNav} />

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink">{pageTitle}</p>
          <p className="hidden text-xs text-muted sm:block">
            Live records from the inspection API
          </p>
        </div>

        <form
          className="hidden min-w-0 max-w-md flex-1 md:block"
          onSubmit={(event) => {
            event.preventDefault();
            onSearchSubmit(query);
          }}
        >
          <label htmlFor="global-search" className="sr-only">
            Search inspections
          </label>
          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <input
              id="global-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search inspections by ID, panel, inspector, or status"
              className="w-full rounded-lg border border-line bg-forest py-2 pr-3 pl-9 text-sm outline-none placeholder:text-muted/70 focus:border-accent"
            />
          </div>
        </form>

        <Button
          variant="secondary"
          className="hidden sm:inline-flex"
          onClick={() => onSearchSubmit(query)}
        >
          Find
        </Button>

        <p
          className="hidden items-center gap-2 text-xs text-muted xl:flex"
          title={apiStatus.label}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              apiStatus.ok ? "bg-accent" : apiStatus.checking ? "bg-warning" : "bg-danger"
            }`}
            aria-hidden="true"
          />
          <span>{apiStatus.label}</span>
        </p>
      </div>
    </header>
  );
}

export default Navbar;
