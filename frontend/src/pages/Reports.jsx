import { FileText } from "lucide-react";

import {
  Alert,
  Button,
  Card,
  CardHeader,
  EmptyState,
  LoadingBlock,
  PageHeader,
  RefreshButton,
  StatusBadge,
} from "../components/ui";
import { dateRangeLabel, displayName, formatDateTime } from "../lib/format";
import { useApiList } from "../hooks/useApiList";
import { getInspections } from "../services/api";

function countByStatus(inspections, status) {
  return inspections.filter(
    (item) => String(item.status || "").toLowerCase() === status
  ).length;
}

function downloadCsv(inspections) {
  const headers = [
    "Inspection ID",
    "Panel ID",
    "Inspector",
    "Inspection Date",
    "Status",
  ];
  const rows = inspections.map((item) => [
    item.id,
    item.panel_id,
    item.inspector_name || "",
    item.inspection_date || "",
    item.status || "",
  ]);
  const escapeCSV = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const csvContent = [
    headers.map(escapeCSV).join(","),
    ...rows.map((row) => row.map(escapeCSV).join(",")),
  ].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "armour-inspection-report.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function Reports({ onOpenInspection }) {
  const { data, loading, error, reload } = useApiList(getInspections);
  const completedCount = countByStatus(data, "completed");
  const pendingCount = countByStatus(data, "pending");
  const otherCount = data.length - completedCount - pendingCount;
  const range = dateRangeLabel(data, (item) => item.inspection_date);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Summary"
        title="Reports"
        description={`Figures are computed from current inspection API records. Date range: ${range}.`}
        actions={
          <>
            <RefreshButton loading={loading} onClick={reload} />
            <Button
              onClick={() => downloadCsv(data)}
              disabled={loading || data.length === 0}
            >
              Export CSV
            </Button>
          </>
        }
      />

      {error ? (
        <Alert title="Could not load report data">{error}</Alert>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Total inspections", loading ? "—" : data.length, "All returned records"],
          ["Completed", loading ? "—" : completedCount, "Status equals completed"],
          ["Pending", loading ? "—" : pendingCount, "Status equals pending"],
          ["Other statuses", loading ? "—" : otherCount, "Any other recorded value"],
        ].map(([title, value, hint]) => (
          <Card key={title} className="p-5">
            <p className="text-sm text-muted">{title}</p>
            <p className="mt-2 text-3xl font-semibold">{value}</p>
            <p className="mt-2 text-xs text-muted">{hint}</p>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <h2 className="font-semibold">Unavailable in this API</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
          <li>PDF report export is not provided. CSV download lists the fields above.</li>
          <li>Damage class, annotated photos, and health scores are not returned.</li>
          <li>Inspector performance rankings cannot be verified beyond names on records.</li>
        </ul>
      </Card>

      <Card>
        <CardHeader
          title="Inspection report table"
          description="Same fields as the inspections API: id, panel_id, inspector_name, inspection_date, status."
        />
        {loading ? (
          <LoadingBlock label="Loading report data…" />
        ) : data.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No report records available"
            description="Summaries appear when at least one inspection exists."
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
                  {data.map((item) => (
                    <tr key={item.id} className="border-t border-line">
                      <td className="px-5 py-3 font-mono text-accent">#{item.id}</td>
                      <td className="px-5 py-3">{item.panel_id || "—"}</td>
                      <td className="px-5 py-3 text-muted">
                        {displayName(item.inspector_name)}
                      </td>
                      <td className="px-5 py-3 text-muted">
                        {formatDateTime(item.inspection_date)}
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Button
                          variant="ghost"
                          className="px-2 py-1"
                          onClick={() => onOpenInspection(item)}
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
              {data.map((item) => (
                <li key={item.id} className="space-y-2 px-5 py-4">
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-sm text-accent">#{item.id}</p>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="text-sm">{item.panel_id}</p>
                  <p className="text-xs text-muted">
                    {displayName(item.inspector_name)} ·{" "}
                    {formatDateTime(item.inspection_date)}
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

export default Reports;
