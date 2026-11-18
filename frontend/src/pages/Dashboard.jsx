import { useMemo } from "react";
import {
  Activity,
  CalendarDays,
  ClipboardList,
  FileBarChart,
  Layers3,
  Package,
  ShieldCheck,
  Upload,
  Users,
} from "lucide-react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

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
import {
  dateRangeLabel,
  displayName,
  formatDateTime,
  isInCurrentMonth,
} from "../lib/format";
import { useApiList } from "../hooks/useApiList";
import { getInspections, getPanels } from "../services/api";

const STATUS_COLORS = {
  completed: "#4eae78",
  pending: "#d7a441",
  failed: "#d46a5c",
  other: "#7f9488",
};

function Dashboard({ onNavigate, onOpenInspection }) {
  const panels = useApiList(getPanels);
  const inspections = useApiList(getInspections);
  const loading = panels.loading || inspections.loading;
  const error = panels.error || inspections.error;

  const metrics = useMemo(() => {
    const thisMonth = inspections.data.filter((item) =>
      isInCurrentMonth(item.inspection_date)
    ).length;

    const namedInspectors = new Set(
      inspections.data
        .map((item) => displayName(item.inspector_name, ""))
        .filter(Boolean)
    );

    return [
      {
        title: "Registered panels",
        value: panels.data.length,
        hint: "From the panels API",
        icon: Layers3,
      },
      {
        title: "Inspection records",
        value: inspections.data.length,
        hint: "From the inspections API",
        icon: ClipboardList,
      },
      {
        title: "Logged this month",
        value: thisMonth,
        hint: "Based on inspection date",
        icon: CalendarDays,
      },
      {
        title: "Named inspectors",
        value: namedInspectors.size,
        hint: "Distinct names on records",
        icon: Users,
      },
    ];
  }, [inspections.data, panels.data.length]);

  const statusData = useMemo(() => {
    const counts = {};
    inspections.data.forEach((item) => {
      const key = String(item.status || "Unknown");
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      color:
        STATUS_COLORS[name.toLowerCase()] || STATUS_COLORS.other,
    }));
  }, [inspections.data]);

  const dailyData = useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = 13; i >= 0; i -= 1) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const key = date.toISOString().slice(0, 10);
      days.push({
        key,
        label: date.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
        count: 0,
      });
    }

    const index = Object.fromEntries(days.map((day, i) => [day.key, i]));
    inspections.data.forEach((item) => {
      const parsed = new Date(item.inspection_date);
      if (Number.isNaN(parsed.getTime())) return;
      const key = parsed.toISOString().slice(0, 10);
      if (index[key] !== undefined) days[index[key]].count += 1;
    });

    return days;
  }, [inspections.data]);

  const recent = inspections.data.slice(0, 8);
  const range = dateRangeLabel(inspections.data, (item) => item.inspection_date);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operations"
        title="Inspection dashboard"
        description="Overview of registered panels and inspection records currently stored by the API. Damage classification and health trends are not tracked yet."
        actions={
          <>
            <RefreshButton
              loading={loading}
              onClick={() => {
                panels.reload();
                inspections.reload();
              }}
            />
            <Button onClick={() => onNavigate("New Inspection")}>
              <Upload size={16} aria-hidden="true" />
              New Inspection
            </Button>
          </>
        }
      />

      {error ? (
        <Alert
          title="Could not load live dashboard data"
          action={
            <button
              type="button"
              className="text-sm text-accent underline-offset-2 hover:underline"
              onClick={() => {
                panels.reload();
                inspections.reload();
              }}
            >
              Try again
            </button>
          }
        >
          {error}
        </Alert>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-muted">{item.title}</p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight">
                    {loading ? "—" : item.value}
                  </p>
                  <p className="mt-2 text-xs text-muted">{item.hint}</p>
                </div>
                <div className="rounded-xl bg-accent/10 p-2.5 text-accent">
                  <Icon size={20} aria-hidden="true" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 text-muted" size={18} aria-hidden="true" />
          <div>
            <h2 className="text-sm font-semibold">Not yet tracked</h2>
            <p className="mt-1 text-sm text-muted">
              Damaged-panel counts, armour-health percentages, and predicted
              severity are unavailable. The API stores inspection status only
              (typically Pending after upload) and does not return computer-vision
              results.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Card className="xl:col-span-1">
          <CardHeader
            title="Status mix"
            description="Counts of recorded inspection statuses."
          />
          {loading ? (
            <LoadingBlock label="Loading status mix…" />
          ) : statusData.length === 0 ? (
            <EmptyState
              icon={Activity}
              title="No inspections to chart"
              description="Status distribution appears after the first inspection is created."
            />
          ) : (
            <div className="p-5">
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={58}
                      outerRadius={82}
                      paddingAngle={3}
                      stroke="none"
                    >
                      {statusData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#121c18",
                        border: "1px solid #2a3c34",
                        borderRadius: "8px",
                        color: "#e7eee9",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="space-y-2 text-sm">
                {statusData.map((item) => (
                  <li key={item.name} className="flex justify-between gap-3">
                    <span className="flex items-center gap-2 text-muted">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: item.color }}
                        aria-hidden="true"
                      />
                      {item.name}
                    </span>
                    <span>{item.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader
            title="Inspections logged"
            description={`Daily counts for the last 14 calendar days. Record range: ${range}.`}
          />
          {loading ? (
            <LoadingBlock label="Loading inspection activity…" />
          ) : inspections.data.length === 0 ? (
            <EmptyState
              icon={Activity}
              title="No inspection activity yet"
              description="A 14-day activity chart is shown once inspections exist."
              action={
                <Button onClick={() => onNavigate("New Inspection")}>
                  Create first inspection
                </Button>
              }
            />
          ) : (
            <div className="h-72 p-5 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData}>
                  <CartesianGrid stroke="#2a3c34" vertical={false} />
                  <XAxis dataKey="label" stroke="#93a59b" tick={{ fontSize: 11 }} />
                  <YAxis
                    allowDecimals={false}
                    stroke="#93a59b"
                    tick={{ fontSize: 11 }}
                    width={28}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#121c18",
                      border: "1px solid #2a3c34",
                      borderRadius: "8px",
                      color: "#e7eee9",
                    }}
                  />
                  <Bar dataKey="count" name="Inspections" fill="#4eae78" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Recent inspections"
          description="Latest records returned by GET /inspections/."
          action={
            <Button variant="ghost" onClick={() => onNavigate("Inspection History")}>
              View all
            </Button>
          }
        />
        {loading ? (
          <LoadingBlock />
        ) : recent.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No inspections recorded"
            description="Register a panel and upload front and back photos to create the first record."
            action={
              <Button onClick={() => onNavigate("New Inspection")}>
                New Inspection
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[640px] w-full text-left text-sm">
              <thead className="text-xs tracking-wide text-muted uppercase">
                <tr className="border-b border-line">
                  <th className="px-5 py-3 font-medium">Inspection</th>
                  <th className="px-5 py-3 font-medium">Panel</th>
                  <th className="px-5 py-3 font-medium">Inspector</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">
                    <span className="sr-only">Open</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {recent.map((item) => (
                  <tr key={item.id} className="border-b border-line/70 last:border-0">
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
        )}
      </Card>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Button onClick={() => onNavigate("New Inspection")}>
          <Upload size={16} aria-hidden="true" />
          New Inspection
        </Button>
        <Button variant="secondary" onClick={() => onNavigate("Reports")}>
          <FileBarChart size={16} aria-hidden="true" />
          Reports
        </Button>
        <Button variant="secondary" onClick={() => onNavigate("Armour Inventory")}>
          <Package size={16} aria-hidden="true" />
          Armour Inventory
        </Button>
      </div>
    </div>
  );
}

export default Dashboard;
