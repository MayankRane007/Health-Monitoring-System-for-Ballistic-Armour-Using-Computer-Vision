import { useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  ClipboardList,
  CalendarDays,
  UserRound,
  AlertCircle,
} from "lucide-react";

import { getInspections } from "../services/api";

function InspectionHistory() {
  const [inspections, setInspections] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchInspections = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getInspections();
      setInspections(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to load inspection history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspections();
  }, []);

  const filteredInspections = inspections.filter((inspection) => {
    const search = searchTerm.toLowerCase();

    return (
      String(inspection.panel_id || "").toLowerCase().includes(search) ||
      String(inspection.inspector_name || "").toLowerCase().includes(search) ||
      String(inspection.status || "").toLowerCase().includes(search) ||
      String(inspection.id || "").toLowerCase().includes(search)
    );
  });

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "—";

    return parsedDate.toLocaleString();
  };

  const getStatusStyle = (status) => {
    const normalizedStatus = String(status || "").toLowerCase();

    if (normalizedStatus === "completed") {
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    }

    if (normalizedStatus === "pending") {
      return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    }

    if (normalizedStatus === "failed") {
      return "bg-red-500/10 text-red-400 border-red-500/20";
    }

    return "bg-gray-500/10 text-gray-400 border-gray-500/20";
  };

  return (
    <div className="min-h-screen bg-[#07130f] text-white p-6 md:p-8">

      {/* Page Heading */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Inspection History</h1>
          <p className="text-gray-400 text-sm mt-1">
            View and search previously registered armour inspections.
          </p>
        </div>

        <button
          onClick={fetchInspections}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-[#263b31] bg-[#11231a] hover:bg-[#193326] text-sm transition disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Summary Card */}
      <div className="bg-[#102019] border border-[#263b31] rounded-xl p-5 mb-6">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-500/10 p-3 rounded-lg">
            <ClipboardList size={24} className="text-emerald-400" />
          </div>

          <div>
            <p className="text-gray-400 text-sm">Total Inspections</p>
            <h2 className="text-2xl font-bold">
              {inspections.length}
            </h2>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-[#102019] border border-[#263b31] rounded-xl p-4 mb-6">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Panel ID, inspector, status or inspection ID..."
            className="w-full bg-[#091710] border border-[#263b31] rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle size={20} className="text-red-400 mt-0.5" />
          <div>
            <p className="text-red-400 font-medium">
              Could not load inspection history
            </p>
            <p className="text-gray-400 text-sm mt-1">{error}</p>
            <button
              onClick={fetchInspections}
              className="text-emerald-400 text-sm mt-2 hover:underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Inspection Table */}
      <div className="bg-[#102019] border border-[#263b31] rounded-xl overflow-hidden">

        <div className="p-5 border-b border-[#263b31]">
          <h2 className="font-semibold">Inspection Records</h2>
          <p className="text-gray-500 text-sm mt-1">
            {filteredInspections.length} record(s) found
          </p>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw
              size={28}
              className="animate-spin text-emerald-400 mx-auto mb-3"
            />
            <p className="text-gray-400 text-sm">
              Loading inspection records...
            </p>
          </div>
        ) : filteredInspections.length === 0 ? (
          <div className="p-12 text-center">
            <ClipboardList
              size={36}
              className="text-gray-600 mx-auto mb-3"
            />
            <p className="text-gray-300 font-medium">
              No inspections found
            </p>
            <p className="text-gray-500 text-sm mt-1">
              {searchTerm
                ? "Try a different search term."
                : "Registered inspections will appear here."}
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
                  <th className="px-5 py-4 font-medium">Inspection Date</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredInspections.map((inspection) => (
                  <tr
                    key={inspection.id}
                    className="border-t border-[#263b31] hover:bg-[#15291e] transition"
                  >
                    <td className="px-5 py-4 text-sm text-emerald-400 font-medium">
                      #{inspection.id}
                    </td>

                    <td className="px-5 py-4 text-sm font-medium text-white">
                      {inspection.panel_id || "—"}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-300">
                      <div className="flex items-center gap-2">
                        <UserRound size={15} className="text-gray-500" />
                        {inspection.inspector_name || "Not specified"}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <CalendarDays size={15} className="text-gray-500" />
                        {formatDate(inspection.inspection_date)}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full border text-xs font-medium capitalize ${getStatusStyle(
                          inspection.status
                        )}`}
                      >
                        {inspection.status || "Unknown"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

export default InspectionHistory;