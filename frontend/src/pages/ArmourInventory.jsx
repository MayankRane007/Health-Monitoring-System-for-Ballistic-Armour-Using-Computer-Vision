
import { useEffect, useState } from "react";
import {
  Shield,
  Search,
  RefreshCw,
  Package,
  Factory,
  CalendarDays,
  AlertCircle,
} from "lucide-react";

import { getPanels } from "../services/api";

function ArmourInventory() {
  const [panels, setPanels] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPanels = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getPanels();
      setPanels(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to load armour inventory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPanels();
  }, []);

  const filteredPanels = panels.filter((panel) => {
    const search = searchTerm.toLowerCase();

    return (
      String(panel.panel_id || "").toLowerCase().includes(search) ||
      String(panel.material || "").toLowerCase().includes(search) ||
      String(panel.manufacturer || "").toLowerCase().includes(search)
    );
  });

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return date;

    return parsedDate.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-[#07130f] text-white p-6 md:p-8">

      {/* Heading */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Armour Inventory</h1>
          <p className="text-gray-400 text-sm mt-1">
            View and manage registered ballistic armour panels.
          </p>
        </div>

        <button
          onClick={fetchPanels}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-[#263b31] bg-[#11231a] hover:bg-[#193326] text-sm transition disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh Inventory
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-[#102019] border border-[#263b31] rounded-xl p-5">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-500/10 p-3 rounded-lg">
              <Shield size={24} className="text-emerald-400" />
            </div>

            <div>
              <p className="text-gray-400 text-sm">Total Registered Panels</p>
              <h2 className="text-2xl font-bold">{panels.length}</h2>
            </div>
          </div>
        </div>

        <div className="bg-[#102019] border border-[#263b31] rounded-xl p-5">
          <div className="flex items-center gap-4">
            <div className="bg-blue-500/10 p-3 rounded-lg">
              <Package size={24} className="text-blue-400" />
            </div>

            <div>
              <p className="text-gray-400 text-sm">Search Results</p>
              <h2 className="text-2xl font-bold">
                {filteredPanels.length}
              </h2>
            </div>
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
            placeholder="Search by Panel ID, material or manufacturer..."
            className="w-full bg-[#091710] border border-[#263b31] rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle size={20} className="text-red-400 mt-0.5" />

          <div>
            <p className="text-red-400 font-medium">
              Could not load armour inventory
            </p>
            <p className="text-gray-400 text-sm mt-1">{error}</p>

            <button
              onClick={fetchPanels}
              className="text-emerald-400 text-sm mt-2 hover:underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-[#102019] border border-[#263b31] rounded-xl overflow-hidden">

        <div className="p-5 border-b border-[#263b31]">
          <h2 className="font-semibold">Registered Armour Panels</h2>
          <p className="text-gray-500 text-sm mt-1">
            {filteredPanels.length} panel(s) found
          </p>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw
              size={28}
              className="animate-spin text-emerald-400 mx-auto mb-3"
            />
            <p className="text-gray-400 text-sm">
              Loading armour inventory...
            </p>
          </div>
        ) : filteredPanels.length === 0 ? (
          <div className="p-12 text-center">
            <Shield
              size={36}
              className="text-gray-600 mx-auto mb-3"
            />

            <p className="text-gray-300 font-medium">
              No armour panels found
            </p>

            <p className="text-gray-500 text-sm mt-1">
              {searchTerm
                ? "Try a different search term."
                : "Registered panels will appear here."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#0b1912] text-gray-400 text-xs uppercase tracking-wider">
                  <th className="px-5 py-4 font-medium">Panel ID</th>
                  <th className="px-5 py-4 font-medium">Material</th>
                  <th className="px-5 py-4 font-medium">Manufacturer</th>
                  <th className="px-5 py-4 font-medium">Manufacture Date</th>
                </tr>
              </thead>

              <tbody>
                {filteredPanels.map((panel) => (
                  <tr
                    key={panel.id}
                    className="border-t border-[#263b31] hover:bg-[#15291e] transition"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Shield
                          size={16}
                          className="text-emerald-400"
                        />
                        <span className="text-sm font-medium text-white">
                          {panel.panel_id || "—"}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-300">
                      {panel.material || "—"}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-300">
                      <div className="flex items-center gap-2">
                        <Factory size={15} className="text-gray-500" />
                        {panel.manufacturer || "—"}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <CalendarDays size={15} className="text-gray-500" />
                        {formatDate(panel.manufacture_date)}
                      </div>
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

export default ArmourInventory;
