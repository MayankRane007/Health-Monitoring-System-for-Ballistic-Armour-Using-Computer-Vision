import { useMemo, useState } from "react";
import { ClipboardList } from "lucide-react";

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
  StatusBadge,
} from "../components/ui";
import { displayName, formatDateTime } from "../lib/format";
import { useApiList } from "../hooks/useApiList";
import { getInspections } from "../services/api";

function InspectionHistory({ searchSeed = "", onOpenInspection }) {
  const { data, loading, error, reload } = useApiList(getInspections);
  const [searchTerm, setSearchTerm] = useState(searchSeed);
  const [statusFilter, setStatusFilter] = useState("all");

  const statuses = useMemo(() => {
    return [...new Set(data.map((item) => item.status).filter(Boolean))];
  }, [data]);

  const filtered = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    return data.filter((inspection) => {
      const matchesStatus =
        statusFilter === "all" ||
        String(inspection.status || "").toLowerCase() === statusFilter;
      const haystack = [
        inspection.id,
        inspection.panel_id,
        inspection.inspector_name,
        inspection.status,
      ]
        .join(" ")
        .toLowerCase();
      return matchesStatus && (!search || haystack.includes(search));
    });
  }, [data, searchTerm, statusFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Records"
        title="Inspection history"
        description="Inspection ID, panel ID, date, inspector, and status from GET /inspections/."
        actions={<RefreshButton loading={loading} onClick={reload} />}
      />

      <Card className="p-5">
        <p className="text-sm text-muted">Total inspections</p>
        <p className="mt-1 text-3xl font-semibold">{loading ? "—" : data.length}</p>
      </Card>

      <Card className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex-1">
            <SearchInput
              id="history-search"
              label="Search inspections"
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by inspection ID, panel ID, inspector, or status"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={statusFilter === "all" ? "primary" : "secondary"}
              className="py-2"
              onClick={() => setStatusFilter("all")}
            >
              All statuses
            </Button>
            {statuses.map((status) => (
              <Button
                key={status}
                variant={
                  statusFilter === String(status).toLowerCase()
                    ? "primary"
                    : "secondary"
                }
                className="py-2 capitalize"
                onClick={() => setStatusFilter(String(status).toLowerCase())}
              >
                {status}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {error ? (
        <Alert
          title="Could not load inspection history"
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
          title="Inspection records"
          description={`${filtered.length} matching record${filtered.length === 1 ? "" : "s"}`}
        />
        {loading ? (
          <LoadingBlock label="Loading inspection records…" />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No inspections found"
            description={
              searchTerm || statusFilter !== "all"
                ? "Try a different search or status filter."
                : "Registered inspections will appear here after the first upload."
            }
          />
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-[720px] w-full text-left text-sm">
                <thead className="bg-forest-900 text-xs tracking-wide text-muted uppercase">
                  <tr>
                    <th className="px-5 py-3 font-medium">Inspection ID</th>
                    <th className="px-5 py-3 font-medium">Panel ID</th>
                    <th className="px-5 py-3 font-medium">Inspector</th>
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">
                      <span className="sr-only">Open</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((inspection) => (
                    <tr key={inspection.id} className="border-t border-line">
                      <td className="px-5 py-3 font-mono text-accent">
                        #{inspection.id}
                      </td>
                      <td className="px-5 py-3">{inspection.panel_id || "—"}</td>
                      <td className="px-5 py-3 text-muted">
                        {displayName(inspection.inspector_name)}
                      </td>
                      <td className="px-5 py-3 text-muted">
                        {formatDateTime(inspection.inspection_date)}
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge status={inspection.status} />
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Button
                          variant="ghost"
                          className="px-2 py-1"
                          onClick={() => onOpenInspection(inspection)}
                        >
                          Open
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="divide-y divide-line md:hidden">
              {filtered.map((inspection) => (
                <li key={inspection.id} className="space-y-2 px-5 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-mono text-sm text-accent">#{inspection.id}</p>
                    <StatusBadge status={inspection.status} />
                  </div>
                  <p className="text-sm">{inspection.panel_id || "—"}</p>
                  <p className="text-xs text-muted">
                    {displayName(inspection.inspector_name)} ·{" "}
                    {formatDateTime(inspection.inspection_date)}
                  </p>
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => onOpenInspection(inspection)}
                  >
                    Open record
                  </Button>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>
    </div>
  );
}

export default InspectionHistory;
