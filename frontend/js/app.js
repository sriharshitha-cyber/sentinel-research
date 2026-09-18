// Main Sentinel Research Application (Clean Enterprise Theme - No Profile Switching)
const { useState, useEffect } = React;

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentTab, setCurrentTab] = useState("ask-ai");
  const [lastResponse, setLastResponse] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showMismatchModal, setShowMismatchModal] = useState(false);
  const [inspectRecord, setInspectRecord] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem("sentinel_theme") || "dark");
  const [stats, setStats] = useState({
    total: 12,
    authorized: 10,
    limited: 2,
  });

  const isLight = theme === "light";

  // Apply theme to body element
  useEffect(() => {
    if (theme === "light") {
      document.body.classList.add("theme-light");
    } else {
      document.body.classList.remove("theme-light");
    }
    localStorage.setItem("sentinel_theme", theme);
  }, [theme]);

  // Initial user session restoration
  useEffect(() => {
    const saved = localStorage.getItem("sentinel_user");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCurrentUser(parsed);
        if (parsed.must_change_password) {
          setShowPasswordModal(true);
        }
      } catch (e) {}
    }
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    localStorage.setItem("sentinel_user", JSON.stringify(user));
    if (user.must_change_password) {
      setShowPasswordModal(true);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLastResponse(null);
    localStorage.removeItem("sentinel_user");
  };

  const handleQueryComplete = (response) => {
    setLastResponse(response);
    setStats((prev) => ({
      total: prev.total + 1,
      authorized: prev.authorized + (response.status === "SUCCESS" ? 1 : 0),
      limited: prev.limited + (response.status !== "SUCCESS" ? 1 : 0),
    }));
  };

  // If not logged in, show LoginView
  if (!currentUser) {
    return React.createElement(
      "div",
      { className: `min-h-screen ${isLight ? "bg-slate-50" : "bg-slate-950"}` },
      React.createElement(window.LoginView, {
        onLoginSuccess: handleLoginSuccess,
        onOpenMismatchDemo: () => setShowMismatchModal(true),
        theme: theme,
      }),
      showMismatchModal &&
        React.createElement(window.ProfileMismatchModal, {
          onClose: () => setShowMismatchModal(false),
          theme: theme,
        })
    );
  }

  return React.createElement(
    "div",
    { className: `min-h-screen flex flex-col transition-colors duration-200 ${
      isLight ? "bg-slate-50 text-slate-900" : "bg-slate-950 text-slate-100"
    }` },

    // Header
    React.createElement(window.Header, {
      employee: currentUser,
      onLogout: handleLogout,
      theme: theme,
      onToggleTheme: toggleTheme,
    }),

    // Main Workspace Layout
    React.createElement(
      "div",
      { className: "flex-1 flex overflow-hidden" },
      
      // Sidebar
      React.createElement(window.Sidebar, {
        currentTab: currentTab,
        onSelectTab: setCurrentTab,
        isAdmin: currentUser.is_admin || currentUser.clearance === "Restricted",
        theme: theme,
        onLogout: handleLogout,
      }),

      // Main Content Area
      React.createElement(
        "main",
        { className: "flex-1 overflow-y-auto p-6 max-w-7xl mx-auto w-full" },
        
        // Employee Profile Card (Always at top of dashboard)
        React.createElement(window.EmployeeProfileCard, { employee: currentUser, theme: theme }),

        // View Content Switching
        currentTab === "overview" &&
          React.createElement(
            "div",
            { className: "space-y-6" },
            // Overview KPI Cards
            React.createElement(
              "div",
              { className: "grid grid-cols-1 sm:grid-cols-3 gap-4" },
              React.createElement(
                "div",
                { className: `glass-panel p-5 rounded-xl border ${isLight ? "bg-white border-slate-200" : "border-slate-800"}` },
                React.createElement("div", { className: "text-xs uppercase font-medium text-slate-400" }, "Requests Today"),
                React.createElement("div", { className: "text-2xl font-bold mt-1" }, stats.total),
                React.createElement("div", { className: "text-xs text-blue-500 mt-1" }, "● Monitored active session")
              ),
              React.createElement(
                "div",
                { className: `glass-panel p-5 rounded-xl border ${isLight ? "bg-white border-slate-200" : "border-slate-800"}` },
                React.createElement("div", { className: "text-xs uppercase font-medium text-slate-400" }, "Authorized Requests"),
                React.createElement("div", { className: "text-2xl font-bold text-emerald-500 mt-1" }, stats.authorized),
                React.createElement("div", { className: "text-xs text-emerald-600 mt-1" }, "✓ Grounded in authorized sources")
              ),
              React.createElement(
                "div",
                { className: `glass-panel p-5 rounded-xl border ${isLight ? "bg-white border-slate-200" : "border-slate-800"}` },
                React.createElement("div", { className: "text-xs uppercase font-medium text-slate-400" }, "Access-Limited Requests"),
                React.createElement("div", { className: "text-2xl font-bold text-amber-500 mt-1" }, stats.limited),
                React.createElement("div", { className: "text-xs text-amber-600 mt-1" }, "🛡️ Blocked Before AI")
              )
            ),
            React.createElement(window.AskAIView, {
              employee: currentUser,
              onQueryComplete: handleQueryComplete,
              theme: theme,
            }),
            lastResponse && React.createElement(window.SecurityFlowVisualizer, {
              authorizationDecisions: lastResponse.authorization_decisions,
              blockedCount: lastResponse.blocked_count,
              allowedCount: lastResponse.allowed_count,
              theme: theme,
            }),
            lastResponse && React.createElement(window.AnswerDisplay, { response: lastResponse, theme: theme })
          ),

        currentTab === "ask-ai" &&
          React.createElement(
            "div",
            { className: "space-y-6" },
            React.createElement(window.AskAIView, {
              employee: currentUser,
              onQueryComplete: handleQueryComplete,
              theme: theme,
            }),
            lastResponse &&
              React.createElement(window.AgentPipelineStatus, {
                agentStatuses: lastResponse.agent_statuses,
                blockedCount: lastResponse.blocked_count,
                allowedCount: lastResponse.allowed_count,
                isRunning: false,
                theme: theme,
              }),
            lastResponse &&
              React.createElement(window.SecurityFlowVisualizer, {
                authorizationDecisions: lastResponse.authorization_decisions,
                blockedCount: lastResponse.blocked_count,
                allowedCount: lastResponse.allowed_count,
                theme: theme,
              }),
            lastResponse && React.createElement(window.AnswerDisplay, { response: lastResponse, theme: theme })
          ),

        currentTab === "my-requests" &&
          React.createElement(window.MyRequestsView, {
            employee: currentUser,
            onViewDetail: (r) => setInspectRecord(r),
            theme: theme,
          }),

        currentTab === "my-access" &&
          React.createElement(window.MyAccessView, { employee: currentUser, theme: theme }),

        currentTab === "audit-history" &&
          React.createElement(window.AuditDashboardView, {
            currentEmployee: currentUser,
            initialSelectedRecord: inspectRecord,
            theme: theme,
          }),

        currentTab === "security-flow" &&
          React.createElement(
            "div",
            { className: "space-y-6" },
            React.createElement(window.SecurityFlowVisualizer, {
              authorizationDecisions: lastResponse ? lastResponse.authorization_decisions : [
                {
                  document_id: "DOC-201",
                  title: "Q4 Revenue Forecast",
                  classification: "Restricted",
                  decision: "DENY",
                  reason: "Insufficient clearance (Required: Restricted, Employee: Internal)",
                  evaluated_clearance: currentUser.clearance,
                  evaluated_department: currentUser.department,
                  evaluated_role: currentUser.role
                },
                {
                  document_id: "DOC-101",
                  title: "Q4 Revenue Forecast",
                  classification: "Internal",
                  decision: currentUser.department === "Finance" ? "ALLOW" : "DENY",
                  reason: currentUser.department === "Finance" ? "Authorized" : "Department mismatch",
                  evaluated_clearance: currentUser.clearance,
                  evaluated_department: currentUser.department,
                  evaluated_role: currentUser.role
                }
              ],
              blockedCount: 1,
              allowedCount: currentUser.department === "Finance" ? 1 : 0,
              theme: theme,
            })
          ),

        currentTab === "admin-audit" &&
          React.createElement(window.AuditDashboardView, {
            currentEmployee: currentUser,
            initialSelectedRecord: inspectRecord,
            theme: theme,
          }),

        currentTab === "settings" &&
          React.createElement(
            "div",
            { className: `glass-panel rounded-xl p-6 border text-xs space-y-4 ${
              isLight ? "bg-white border-slate-200" : "border-slate-800"
            }` },
            React.createElement("h3", { className: "text-base font-bold" }, "System Settings & Appearance"),
            React.createElement("p", { className: isLight ? "text-slate-500" : "text-slate-400" }, "Manage display preferences and security controls."),
            React.createElement(
              "div",
              { className: "flex items-center gap-3 pt-2" },
              React.createElement(
                "button",
                {
                  onClick: toggleTheme,
                  className: `px-4 py-2 rounded-lg border flex items-center gap-2 ${
                    isLight ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800" : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200"
                  }`
                },
                React.createElement(window.SentinelIcon, { name: isLight ? "moon" : "sun", className: "w-4 h-4" }),
                `Current Theme: ${isLight ? "Light Mode" : "Dark Mode"} (Click to switch)`
              )
            ),
            React.createElement(
              "div",
              { className: "pt-2 space-x-3" },
              React.createElement(
                "button",
                {
                  onClick: () => setShowPasswordModal(true),
                  className: "px-4 py-2 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-600/30"
                },
                "Update Account Password"
              ),
              React.createElement(
                "button",
                {
                  onClick: () => setShowMismatchModal(true),
                  className: "px-4 py-2 rounded-lg bg-red-600/10 hover:bg-red-600/20 text-red-600 dark:text-red-400 border border-red-600/30"
                },
                "Test Profile Mismatch Simulator"
              )
            )
          )
      )
    ),

    // Modals
    showPasswordModal &&
      React.createElement(window.PasswordChangeModal, {
        employee: currentUser,
        onPasswordChanged: () => {
          setShowPasswordModal(false);
          setCurrentUser((prev) => ({ ...prev, must_change_password: false }));
        },
        onCancel: () => setShowPasswordModal(false),
        theme: theme,
      }),

    showMismatchModal &&
      React.createElement(window.ProfileMismatchModal, {
        onClose: () => setShowMismatchModal(false),
        theme: theme,
      }),

    // Request Inspector Modal
    inspectRecord &&
      React.createElement(window.AuditDashboardView, {
        currentEmployee: currentUser,
        initialSelectedRecord: inspectRecord,
        theme: theme,
      })
  );
}

// Single Mount with Error Boundary
const rootElement = document.getElementById("root");
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  const AppNode = React.createElement(App);
  root.render(
    window.SentinelErrorBoundary
      ? React.createElement(window.SentinelErrorBoundary, null, AppNode)
      : AppNode
  );
}
