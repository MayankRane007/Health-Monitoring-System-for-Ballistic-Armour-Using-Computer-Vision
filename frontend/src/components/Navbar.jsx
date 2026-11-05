
import {
  Search,
  Bell,
  UserCircle,
  ChevronDown,
} from "lucide-react";

function Navbar() {
  return (
    <header className="h-[72px] bg-[#0c1b16] border-b border-emerald-900/40 flex items-center justify-between px-8">

      {/* Search */}
      <div className="relative w-80">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
        />
        <input
          type="text"
          placeholder="Search by Panel ID..."
          className="w-full bg-[#14251e] border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 outline-none focus:border-emerald-500/60"
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-6">

        {/* Notifications */}
        <button className="relative text-gray-400 hover:text-emerald-400 transition">
          <Bell size={21} />
          <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
            3
          </span>
        </button>

        {/* Inspector Profile */}
        <button className="flex items-center gap-3 text-left">
          <UserCircle size={35} className="text-emerald-400" />

          <div>
            <p className="text-sm font-semibold text-white">
              Inspector
            </p>
            <p className="text-xs text-gray-500">
              Inspection Manager
            </p>
          </div>

          <ChevronDown size={16} className="text-gray-500" />
        </button>

      </div>
    </header>
  );
}

export default Navbar;
