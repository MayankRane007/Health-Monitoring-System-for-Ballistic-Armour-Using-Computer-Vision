import ArmourInventory from "./pages/ArmourInventory";
import Reports from "./pages/Reports";
import { useState } from "react";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

import Dashboard from "./pages/Dashboard";
import NewInspection from "./pages/NewInspection";
import InspectionHistory from "./pages/InspectionHistory";


function App() {
  const [activePage, setActivePage] = useState("Dashboard");

  const renderPage = () => {
    switch (activePage) {
      case "Dashboard":
        return <Dashboard />;

      case "New Inspection":
        return <NewInspection />;

      case "Inspection History":
        return <InspectionHistory />;

        case "Armour Inventory":
  return <ArmourInventory />;

  case "Reports":
  return <Reports />;

      default:
        return (
          <div className="min-h-screen bg-[#07130f] text-white p-8">
            <h1 className="text-2xl font-bold">{activePage}</h1>
            <p className="text-gray-400 mt-2">
              This page is under development.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#07130f] flex">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
      />

      <div className="flex-1 min-w-0">
        <Navbar />
        {renderPage()}
      </div>
    </div>
  );
}

export default App;
