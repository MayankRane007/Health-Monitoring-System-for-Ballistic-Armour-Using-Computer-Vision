
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import {
  Layers3,
  CalendarDays,
  AlertTriangle,
  ShieldCheck,
  Upload,
  Image as ImageIcon,
  FileText,
  ArrowUpRight,
  Users,
  Activity,
} from "lucide-react";

const stats = [
  {
    title: "Total Panels",
    value: "1,248",
    change: "+12%",
    icon: Layers3,
    color: "text-emerald-400",
    bg: "bg-emerald-500/15",
  },
  {
    title: "Inspected This Month",
    value: "342",
    change: "+8%",
    icon: CalendarDays,
    color: "text-blue-400",
    bg: "bg-blue-500/15",
  },
  {
    title: "Damaged Panels",
    value: "118",
    change: "+5%",
    icon: AlertTriangle,
    color: "text-red-400",
    bg: "bg-red-500/15",
  },
  {
    title: "Healthy Panels",
    value: "1,130",
    change: "+13%",
    icon: ShieldCheck,
    color: "text-emerald-400",
    bg: "bg-emerald-500/15",
  },
];

const healthData = [
  { name: "Healthy", value: 1130, color: "#22c55e" },
  { name: "Damaged", value: 118, color: "#ef4444" },
];

const trendData = [
  { day: "Oct 16", total: 205, damaged: 52 },
  { day: "Oct 17", total: 230, damaged: 70 },
  { day: "Oct 18", total: 248, damaged: 80 },
  { day: "Oct 19", total: 265, damaged: 95 },
  { day: "Oct 20", total: 275, damaged: 102 },
  { day: "Oct 21", total: 310, damaged: 105 },
  { day: "Oct 22", total: 342, damaged: 118 },
];

const inspections = [
  {
    id: "BR-2026-1047",
    date: "06 Nov 2026",
    inspector: "Mayank Rane",
    damage: "Crack, Delamination",
    severity: "Class 2",
    status: "Damaged",
  },
  {
    id: "BR-2026-1046",
    date: "05 Nov 2026",
    inspector: "Priya Sharma",
    damage: "No Damage",
    severity: "Class 0",
    status: "Healthy",
  },
  {
    id: "BR-2026-1045",
    date: "04 Nov 2026",
    inspector: "Rohan Mehta",
    damage: "Spall",
    severity: "Class 3",
    status: "Damaged",
  },
  {
    id: "BR-2026-1044",
    date: "03 Nov 2026",
    inspector: "Sneha Iyer",
    damage: "Minor Surface Crack",
    severity: "Class 1",
    status: "Under Review",
  },
];

const inspectors = [
  { initials: "MR", name: "Mayank Rane", total: 342, damaged: 28, healthy: 314 },
  { initials: "PS", name: "Priya Sharma", total: 298, damaged: 24, healthy: 274 },
  { initials: "RM", name: "Rohan Mehta", total: 276, damaged: 32, healthy: 244 },
  { initials: "SI", name: "Sneha Iyer", total: 332, damaged: 34, healthy: 298 },
];

function Dashboard() {
  return (
    <div className="min-h-screen bg-[#07130f] text-white p-5 md:p-7 space-y-6">

      {/* Welcome */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome, Inspector
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Armour Inspection Command Centre
          </p>
        </div>

        <p className="text-xs text-gray-500">
          NON-DESTRUCTIVE ARMOUR MONITORING
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="bg-[#10231b] border border-emerald-900/50 rounded-xl p-5 flex items-center gap-4"
            >
              <div className={`${item.bg} ${item.color} p-3 rounded-xl`}>
                <Icon size={25} />
              </div>

              <div>
                <p className="text-xs text-gray-400">{item.title}</p>
                <h2 className="text-2xl font-bold mt-1">{item.value}</h2>
                <p className="text-xs text-emerald-400 mt-1">
                  {item.change} <span className="text-gray-500">vs last month</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Armour Health */}
        <div className="bg-[#10231b] border border-emerald-900/50 rounded-xl p-5">
          <h2 className="font-semibold flex items-center gap-2">
            <Activity size={19} className="text-emerald-400" />
            Armour Health Overview
          </h2>

          <div className="h-56 relative mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={healthData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={3}
                  stroke="none"
                >
                  {healthData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#10231b",
                    border: "1px solid #315342",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-2xl font-bold">1,248</p>
              <p className="text-xs text-gray-400">Total Panels</p>
            </div>
          </div>

          <div className="space-y-3 mt-2">
            {healthData.map((item) => (
              <div key={item.name} className="flex justify-between text-sm">
                <span className="flex items-center gap-2 text-gray-300">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  {item.name}
                </span>
                <span className="font-medium">
                  {item.value.toLocaleString()} (
                  {((item.value / 1248) * 100).toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Inspection Trend */}
        <div className="xl:col-span-2 bg-[#10231b] border border-emerald-900/50 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Inspection Trend</h2>
            <span className="text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">
              Last 7 Days
            </span>
          </div>

          <div className="h-72 mt-5">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid stroke="#254035" strokeDasharray="3 3" />
                <XAxis
                  dataKey="day"
                  stroke="#82958b"
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  stroke="#82958b"
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#10231b",
                    border: "1px solid #315342",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  name="Total Inspections"
                  stroke="#4ade80"
                  strokeWidth={3}
                  dot={{ fill: "#4ade80", r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="damaged"
                  name="Damaged Panels"
                  stroke="#f87171"
                  strokeWidth={2}
                  dot={{ fill: "#f87171", r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Inspections and Inspector Details */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Recent Inspection Table */}
        <div className="xl:col-span-2 bg-[#10231b] border border-emerald-900/50 rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold flex items-center gap-2">
              <FileText size={19} className="text-emerald-400" />
              Recent Inspection Records
            </h2>

            <button className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
              View All <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[650px]">
              <thead>
                <tr className="text-gray-500 border-b border-white/10 text-xs">
                  <th className="py-3">Panel ID</th>
                  <th>Date</th>
                  <th>Inspector</th>
                  <th>Damage</th>
                  <th>Severity</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {inspections.map((item) => (
                  <tr key={item.id} className="border-b border-white/5">
                    <td className="py-4 font-medium">{item.id}</td>
                    <td className="text-gray-400">{item.date}</td>
                    <td>{item.inspector}</td>
                    <td className="text-gray-300">{item.damage}</td>
                    <td>
                      <span className="text-xs text-yellow-300 bg-yellow-500/10 px-2 py-1 rounded">
                        {item.severity}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          item.status === "Healthy"
                            ? "bg-emerald-500/15 text-emerald-400"
                            : item.status === "Damaged"
                            ? "bg-red-500/15 text-red-400"
                            : "bg-yellow-500/15 text-yellow-400"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Inspector Details */}
        <div className="bg-[#10231b] border border-emerald-900/50 rounded-xl p-5">
          <h2 className="font-semibold flex items-center gap-2 mb-5">
            <Users size={19} className="text-emerald-400" />
            Inspector-wise Details
          </h2>

          <div className="space-y-5">
            {inspectors.map((person) => (
              <div key={person.initials} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center text-xs font-bold">
                    {person.initials}
                  </div>
                  <div>
                    <p className="text-sm">{person.name}</p>
                    <p className="text-xs text-gray-500">
                      {person.total} inspections
                    </p>
                  </div>
                </div>

                <span className="text-sm text-red-400">
                  {person.damaged} damaged
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-[#10231b] border border-emerald-900/50 rounded-xl p-5">
        <h2 className="font-semibold mb-4">Quick Actions</h2>

        <div className="flex flex-wrap gap-3">
          <button className="flex items-center gap-2 bg-emerald-500 text-black font-semibold px-5 py-3 rounded-lg hover:bg-emerald-400 transition">
            <Upload size={18} />
            New Inspection
          </button>

          <button className="flex items-center gap-2 bg-white/5 border border-white/10 text-gray-200 px-5 py-3 rounded-lg hover:bg-white/10 transition">
            <FileText size={18} />
            View Reports
          </button>

          <button className="flex items-center gap-2 bg-white/5 border border-white/10 text-gray-200 px-5 py-3 rounded-lg hover:bg-white/10 transition">
            <ImageIcon size={18} />
            Armour Inventory
          </button>
        </div>
      </div>

      <p className="text-center text-xs text-gray-600 pb-2">
        ARMORWATCH · Armour Inspection System · Demonstration data
      </p>
    </div>
  );
}

export default Dashboard;
