import { useMemo, useState } from "react";
import { Shield } from "lucide-react";

import {
  Alert,
  Button,
  Card,
  CardHeader,
  EmptyState,
  LoadingBlock,
  PageHeader,
  RefreshButton,
  SearchInput,
} from "../components/ui";
import { formatDate } from "../lib/format";
import { useApiList } from "../hooks/useApiList";
import { getPanels } from "../services/api";

function ArmourInventory({ onNavigate }) {
  const { data, loading, error, reload } = useApiList(getPanels);
  const [searchTerm, setSearchTerm] = useState("");
  const [materialFilter, setMaterialFilter] = useState("all");

  const materials = useMemo(() => {
    return [...new Set(data.map((panel) => panel.material).filter(Boolean))];
  }, [data]);

  const filtered = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    return data.filter((panel) => {
      const matchesMaterial =
        materialFilter === "all" ||
        String(panel.material || "").toLowerCase() === materialFilter;
      const haystack = [
        panel.panel_id,
        panel.material,
        panel.manufacturer,
        panel.manufacture_date,
      ]
        .join(" ")
        .toLowerCase();
      return matchesMaterial && (!search || haystack.includes(search));
    });
  }, [data, materialFilter, searchTerm]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Register"
        title="Armour inventory"
        description="Registered panels from GET /panels/: panel ID, material, manufacturer, and manufacture date."
        actions={
          <>
            <RefreshButton loading={loading} onClick={reload}>
              Refresh inventory
            </RefreshButton>
            <Button onClick={() => onNavigate("New Inspection")}>
              Register via inspection
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <p className="text-sm text-muted">Registered panels</p>
          <p className="mt-1 text-3xl font-semibold">{loading ? "—" : data.length}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted">Matching this view</p>
          <p className="mt-1 text-3xl font-semibold">
            {loading ? "—" : filtered.length}
          </p>
        </Card>
      </div>

      <Card className="space-y-3 p-4">
        <SearchInput
          id="inventory-search"
          label="Search panels"
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by panel ID, material, or manufacturer"
        />
        <div className="flex flex-wrap gap-2">
          <Button
            variant={materialFilter === "all" ? "primary" : "secondary"}
            className="py-2"
            onClick={() => setMaterialFilter("all")}
          >
            All materials
          </Button>
          {materials.map((material) => (
            <Button
              key={material}
              variant={
                materialFilter === String(material).toLowerCase()
                  ? "primary"
                  : "secondary"
              }
              className="py-2"
              onClick={() => setMaterialFilter(String(material).toLowerCase())}
            >
              {material}
            </Button>
          ))}
        </div>
      </Card>

      {error ? (
        <Alert
          title="Could not load armour inventory"
          action={
            <button
              type="button"
              className="text-sm text-accent underline-offset-2 hover:underline"
              onClick={reload}
            >
              Try again
            </button>
          }
        >
          {error}
        </Alert>
      ) : null}

      <Card>
        <CardHeader
          title="Registered armour panels"
          description={`${filtered.length} panel${filtered.length === 1 ? "" : "s"}`}
        />
        {loading ? (
          <LoadingBlock label="Loading armour inventory…" />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Shield}
            title="No armour panels found"
            description={
              searchTerm || materialFilter !== "all"
                ? "Try a different search or material filter."
                : "Panels appear here after they are registered during a new inspection."
            }
            action={
              data.length === 0 ? (
                <Button onClick={() => onNavigate("New Inspection")}>
                  Start a new inspection
                </Button>
              ) : null
            }
          />
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-[640px] w-full text-left text-sm">
                <thead className="bg-forest-900 text-xs tracking-wide text-muted uppercase">
                  <tr>
                    <th className="px-5 py-3 font-medium">Panel ID</th>
                    <th className="px-5 py-3 font-medium">Material</th>
                    <th className="px-5 py-3 font-medium">Manufacturer</th>
                    <th className="px-5 py-3 font-medium">Manufacture date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((panel) => (
                    <tr key={panel.id || panel.panel_id} className="border-t border-line">
                      <td className="px-5 py-3 font-medium">{panel.panel_id || "—"}</td>
                      <td className="px-5 py-3 text-muted">{panel.material || "—"}</td>
                      <td className="px-5 py-3 text-muted">
                        {panel.manufacturer || "—"}
                      </td>
                      <td className="px-5 py-3 text-muted">
                        {formatDate(panel.manufacture_date)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="divide-y divide-line md:hidden">
              {filtered.map((panel) => (
                <li key={panel.id || panel.panel_id} className="px-5 py-4">
                  <p className="font-medium">{panel.panel_id || "—"}</p>
                  <p className="mt-1 text-sm text-muted">
                    {panel.material || "Material not recorded"}
                  </p>
                  <p className="text-xs text-muted">
                    {panel.manufacturer || "Manufacturer not recorded"} ·{" "}
                    {formatDate(panel.manufacture_date)}
                  </p>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>
    </div>
  );
}

export default ArmourInventory;
