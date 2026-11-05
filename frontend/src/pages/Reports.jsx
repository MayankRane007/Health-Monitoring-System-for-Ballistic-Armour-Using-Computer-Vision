
import { useEffect, useState } from "react";
import {
  FileText,
  ClipboardList,
  CheckCircle,
  Clock,
  Download,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import { getInspections } from "../services/api";

function Reports() {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchInspections = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getInspections();
      setInspections(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to load report data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspections();
  }, []);

  const completedCount = inspections.filter(
    (item) => String(item.status).toLowerCase() === "completed"
  ).length;

  const pendingCount = inspections.filter(
    (item) => String(item.status).toLowerCase() === "pending"
  ).length;

  const otherCount = inspections.length - completedCount - pendingCount;

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    return Number.isNaN(parsedDate.getTime())
      ? "—"
      : parsedDate.toLocaleString();
  };

  const downloadReport = () => {
    if (inspections.length === 0) return;

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

    const escapeCSV = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const csvContent = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) => row.map(escapeCSV).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "armour-inspection-report.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  const statusStyle = (status) => {
    const value = String(status || "").toLowerCase();

    if (value === "completed") {
      return "bg-emerald-500/10 text-emerald-400";
    }

    if (value === "pending") {
      return "bg-yellow-500/10 text-yellow-400";
    }

    return "bg-gray-500/10 text-gray-400";
  };

  return (
    <div className="min-h-screen bg-[#07130f] text-white p-6 md:p-8">

      {/* Heading */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-gray-400 text-sm mt-1">
            Inspection summaries and downloadable records.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={fetchInspections}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#263b31] bg-[#11231a] hover:bg-[#193326] text-sm disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>

          <button
            onClick={downloadReport}
            disabled={loading || inspections.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 flex gap-3">
          <AlertCircle size={20} className="text-red-400" />
          <div>
            <p className="text-red-400 font-medium">
              Could not load report data
            </p>
            <p className="text-gray-400 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">

        <div className="bg-[#102019] border border-[#263b31] rounded-xl p-5">
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-400 text-sm">Total Inspections</p>
            <ClipboardList size={21} className="text-emerald-400" />
          </div>
          <h2 className="text-3xl font-bold">
            {loading ? "—" : inspections.length}
          </h2>
          <p className="text-gray-500 text-xs mt-2">All registered records</p>
        </div>

        <div className="bg-[#102019] border border-[#263b31] rounded-xl p-5">
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-400 text-sm">Completed</p>
            <CheckCircle size={21} className="text-emerald-400" />
          </div>
          <h2 className="text-3xl font-bold text-emerald-400">
            {loading ? "—" : completedCount}
          </h2>
          <p className="text-gray-500 text-xs mt-2">Completed inspections</p>
        </div>

        <div className="bg-[#102019] border border-[#263b31] rounded-xl p-5">
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-400 text-sm">Pending</p>
            <Clock size={21} className="text-yellow-400" />
          </div>
          <h2 className="text-3xl font-bold text-yellow-400">
            {loading ? "—" : pendingCount}
          </h2>
          <p className="text-gray-500 text-xs mt-2">Awaiting completion</p>
        </div>

        <div className="bg-[#102019] border border-[#263b31] rounded-xl p-5">
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-400 text-sm">Other Statuses</p>
            <FileText size={21} className="text-blue-400" />
          </div>
          <h2 className="text-3xl font-bold text-blue-400">
            {loading ? "—" : otherCount}
          </h2>
          <p className="text-gray-500 text-xs mt-2">Other recorded statuses</p>
        </div>

      </div>

      {/* Report Table */}
      <div className="bg-[#102019] border border-[#263b31] rounded-xl overflow-hidden">

        <div className="p-5 border-b border-[#263b31]">
          <h2 className="font-semibold">Inspection Report</h2>
          <p className="text-gray-500 text-sm mt-1">
            Overview of registered inspection records.
          </p>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw
              size={28}
              className="animate-spin text-emerald-400 mx-auto mb-3"
            />
            <p className="text-gray-400 text-sm">Loading report data...</p>
          </div>
        ) : inspections.length === 0 ? (
          <div className="p-12 text-center">
            <FileText
              size={36}
              className="text-gray-600 mx-auto mb-3"
            />
            <p className="text-gray-300 font-medium">
              No report records available
            </p>
            <p className="text-gray-500 text-sm mt-1">
              Inspection records will appear here when available.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#0b1912] text-gray-400 text-xs uppercase tracking-wider">
                  <th className="px-5 py-4 font-medium">Inspection ID</th>
                  <th className="px-5 py-4 font-medium">Panel ID</th>
                  <th className="px-5 py-4 font-medium">Inspector</th>
                  <th className="px-5 py-4 font-medium">Date</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                </tr>
              </thead>

              <tbody>
                {inspections.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t border-[#263b31] hover:bg-[#15291e] transition"
                  >
                    <td className="px-5 py-4 text-sm text-emerald-400">
                      #{item.id}
                    </td>

                    <td className="px-5 py-4 text-sm text-white">
                      {item.panel_id || "—"}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-300">
                      {item.inspector_name || "Not specified"}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-400">
                      {formatDate(item.inspection_date)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusStyle(item.status)}`}
                      >
                        {item.status || "Unknown"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-gray-500 text-xs mt-4">
        Report figures are calculated from the inspection records returned by the backend.
      </p>
    </div>
  );
}

export default Reports;
