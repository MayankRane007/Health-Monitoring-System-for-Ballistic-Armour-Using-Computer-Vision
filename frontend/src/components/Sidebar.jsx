
import {
  LayoutDashboard,
  Upload,
  ClipboardList,
  Package,
  FileBarChart,
  Users,
  Settings,
  Shield,
  LogOut,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "New Inspection", icon: Upload },
  { name: "Inspection History", icon: ClipboardList },
  { name: "Armour Inventory", icon: Package },
  { name: "Reports", icon: FileBarChart },
];

function Sidebar({ activePage, onNavigate }) {
  return (
    <aside className="w-64 min-h-screen bg-[#091713] text-white border-r border-emerald-900/40 flex flex-col">

      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/15 p-2 rounded-lg">
            <Shield className="text-emerald-400" size={27} />
          </div>

          <div>
            <h1 className="font-bold text-lg tracking-wide">
              ARMOR<span className="text-emerald-400">WATCH</span>
            </h1>
            <p className="text-[10px] text-gray-400 tracking-wider">
              ARMOUR INSPECTION SYSTEM
            </p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="px-3 py-6 flex-1">
        <p className="text-[10px] text-gray-500 font-semibold mb-4 px-3 tracking-widest">
          MAIN MENU
        </p>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.name;

            return (
              <button
                key={item.name}
                onClick={() => onNavigate(item.name)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "text-gray-400 hover:bg-white/5 hover:text-white border border-transparent"
                }`}
              >
                <Icon size={19} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Navigation */}
      <div className="p-4 border-t border-white/10 space-y-2">
        <button
          onClick={() => onNavigate("Inspectors")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition ${
            activePage === "Inspectors"
              ? "bg-emerald-500/20 text-emerald-400"
              : "text-gray-400 hover:bg-white/5 hover:text-white"
          }`}
        >
          <Users size={19} />
          Inspectors
        </button>

        <button
          onClick={() => onNavigate("Settings")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition ${
            activePage === "Settings"
              ? "bg-emerald-500/20 text-emerald-400"
              : "text-gray-400 hover:bg-white/5 hover:text-white"
          }`}
        >
          <Settings size={19} />
          Settings
        </button>

        <button
          onClick={() => onNavigate("Login")}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition"
        >
          <LogOut size={19} />
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;

