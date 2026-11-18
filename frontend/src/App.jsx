import { useEffect, useState } from "react";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import InspectionDetail from "./components/InspectionDetail";
import NewInspection from "./pages/NewInspection";
import InspectionHistory from "./pages/InspectionHistory";
import Reports from "./pages/Reports";
import Login from "./pages/Login";
import { Alert, LoadingBlock } from "./components/ui";
import {
  checkHealth,
  getCurrentUser,
  signIn,
  signOut,
  signUp,
} from "./services/api";

const PAGE_TITLES = {
  "New Inspection": "New inspection",
  "Inspection History": "Inspection history",
  Reports: "Reports",
};

function App() {
  const [activePage, setActivePage] = useState("New Inspection");
  const [navOpen, setNavOpen] = useState(false);
  const [historyQuery, setHistoryQuery] = useState("");
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [authError, setAuthError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState({
    checking: true,
    ok: false,
    label: "Checking API…",
  });

  useEffect(() => {
    let cancelled = false;
    checkHealth()
      .then(() => {
        if (!cancelled) {
          setApiStatus({ checking: false, ok: true, label: "API connected" });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setApiStatus({
            checking: false,
            ok: false,
            label: "API unreachable",
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    getCurrentUser()
      .then((user) => {
        if (!cancelled) {
          setCurrentUser(user);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setAuthError(error.message);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setAuthChecking(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function handleSessionExpired() {
      setCurrentUser(null);
      setSelectedInspection(null);
      setAuthError("Your session expired. Please sign in again.");
    }

    window.addEventListener("armourwatch:session-expired", handleSessionExpired);
    return () => {
      window.removeEventListener(
        "armourwatch:session-expired",
        handleSessionExpired
      );
    };
  }, []);

  async function handleLogin(email, password) {
    setLoginLoading(true);
    setAuthError("");
    try {
      const user = await signIn(email, password);
      setCurrentUser(user);
      setActivePage("New Inspection");
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleRegister(email, password) {
    setLoginLoading(true);
    setAuthError("");
    try {
      const user = await signUp(email, password);
      setCurrentUser(user);
      setActivePage("New Inspection");
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleLogout() {
    setAuthError("");
    try {
      await signOut();
      setCurrentUser(null);
      setSelectedInspection(null);
      setActivePage("New Inspection");
    } catch (error) {
      setAuthError(error.message);
    }
  }

  const renderPage = () => {
    switch (activePage) {
      case "New Inspection":
        return <NewInspection />;
      case "Inspection History":
        return (
          <InspectionHistory
            key={historyQuery}
            searchSeed={historyQuery}
            onOpenInspection={setSelectedInspection}
          />
        );
      case "Reports":
        return <Reports onOpenInspection={setSelectedInspection} />;
      default:
        return <NewInspection />;
    }
  };

  if (authChecking) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-forest text-ink">
        <LoadingBlock label="Checking your session…" />
      </main>
    );
  }

  if (!currentUser) {
    return (
      <Login
        onLogin={handleLogin}
        onRegister={handleRegister}
        error={authError}
        loading={loginLoading}
        onModeChange={() => setAuthError("")}
      />
    );
  }

  return (
    <div className="flex min-h-dvh bg-forest text-ink">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-accent focus:px-3 focus:py-2 focus:text-forest"
      >
        Skip to main content
      </a>

      <Sidebar
        activePage={activePage}
        open={navOpen}
        onClose={() => setNavOpen(false)}
        onNavigate={setActivePage}
        onLogout={handleLogout}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar
          pageTitle={PAGE_TITLES[activePage] || activePage}
          onOpenNav={() => setNavOpen(true)}
          apiStatus={apiStatus}
          onSearchSubmit={(query) => {
            setHistoryQuery(query);
            setActivePage("Inspection History");
            setNavOpen(false);
          }}
        />

        <main id="main-content" className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {authError ? (
            <div className="mb-5">
              <Alert title="Could not log out">{authError}</Alert>
            </div>
          ) : null}
          {renderPage()}
        </main>
      </div>

      {selectedInspection ? (
        <InspectionDetail
          key={selectedInspection.id}
          inspection={selectedInspection}
          onClose={() => setSelectedInspection(null)}
        />
      ) : null}
    </div>
  );
}

export default App;
