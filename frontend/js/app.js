// Main Sentinel Research Application (Clean Enterprise Theme - No Profile Switching)
const { useState, useEffect } = React;

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentTab, setCurrentTab] = useState("ask-ai");
  const [lastResponse, setLastResponse] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showMismatchModal, setShowMismatchModal] = useState(false);
  const [inspectRecord, setInspectRecord] = useState(null);
  const [managerAlerts, setManagerAlerts] = useState([]);
  const [showManagerAlertModal, setShowManagerAlertModal] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("sentinel_theme") || "dark");
  const [stats, setStats] = useState({
    total: 12,
    authorized: 10,
    limited: 2,
  });

  const isLight = theme === "light";
  const isAnimated = theme === "animated";
  const isManager = Boolean(currentUser && (currentUser.is_manager || (currentUser.employee_id && currentUser.employee_id.startsWith("M"))));

  // Apply theme to body element (supports "light", "dark", "animated")
  useEffect(() => {
    document.body.classList.remove("theme-light", "theme-animated");
    if (theme === "light") {
      document.body.classList.add("theme-light");
    } else if (theme === "animated") {
      document.body.classList.add("theme-animated");
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

  // Manager Alerts Polling / Loading
  useEffect(() => {
    if (isManager && currentUser) {
      window.SentinelAPI.getManagerAlerts(currentUser.employee_id, currentUser.department)
        .then((alerts) => {
          setManagerAlerts(alerts || []);
          const unread = (alerts || []).filter((a) => !a.dismissed);
          if (unread.length > 0) {
            setShowManagerAlertModal(true);
          }
        })
        .catch(console.error);
    } else {
      setManagerAlerts([]);
      setShowManagerAlertModal(false);
    }
  }, [currentUser?.employee_id, isManager]);

  const handleDismissManagerAlert = async (alertId) => {
    await window.SentinelAPI.dismissManagerAlert(alertId, currentUser?.employee_id);
    setManagerAlerts((prev) =>
      prev.map((a) => (a.alert_id === alertId ? { ...a, dismissed: true } : a))
    );
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : prev === "light" ? "animated" : "dark"));
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
    setManagerAlerts([]);
    setShowManagerAlertModal(false);
    localStorage.removeItem("sentinel_user");
  };

  const handleQueryComplete = (response) => {
    setLastResponse(response);
    setStats((prev) => ({
      total: prev.total + 1,
      authorized: prev.authorized + (response.status === "SUCCESS" ? 1 : 0),
      limited: prev.limited + (response.status !== "SUCCESS" ? 1 : 0),
    }));

    // If active manager, refresh alerts to capture new blocked attempts
    if (isManager && currentUser) {
      window.SentinelAPI.getManagerAlerts(currentUser.employee_id, currentUser.department)
        .then((alerts) => setManagerAlerts(alerts || []))
        .catch(console.error);
    }
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
      managerAlertCount: managerAlerts.filter((a) => !a.dismissed).length,
      onOpenAlerts: () => setShowManagerAlertModal(true),
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
              { className: "pt-2 space-y-2" },
              React.createElement("div", { className: "font-medium text-slate-300" }, "Select Interface Theme:"),
              React.createElement(
                "div",
                { className: "grid grid-cols-1 sm:grid-cols-3 gap-3" },
                // Dark Mode Button
                React.createElement(
                  "button",
                  {
                    onClick: () => setTheme("dark"),
                    className: `p-3 rounded-lg border text-left flex flex-col gap-1.5 transition-all ${
                      theme === "dark"
                        ? "bg-blue-600/20 border-blue-500 text-white ring-1 ring-blue-500"
                        : isLight
                        ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700"
                        : "bg-slate-900/60 hover:bg-slate-800 border-slate-800 text-slate-300"
                    }`
                  },
                  React.createElement(
                    "div",
                    { className: "flex items-center gap-2 font-semibold" },
                    React.createElement(window.SentinelIcon, { name: "moon", className: "w-4 h-4 text-blue-400" }),
                    "Dark Mode"
                  ),
                  React.createElement("div", { className: "text-[11px] opacity-75" }, "Standard high-contrast enterprise dark UI.")
                ),
                // Light Mode Button
                React.createElement(
                  "button",
                  {
                    onClick: () => setTheme("light"),
                    className: `p-3 rounded-lg border text-left flex flex-col gap-1.5 transition-all ${
                      theme === "light"
                        ? "bg-blue-50 border-blue-500 text-blue-900 ring-1 ring-blue-500"
                        : isLight
                        ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700"
                        : "bg-slate-900/60 hover:bg-slate-800 border-slate-800 text-slate-300"
                    }`
                  },
                  React.createElement(
                    "div",
                    { className: "flex items-center gap-2 font-semibold" },
                    React.createElement(window.SentinelIcon, { name: "sun", className: "w-4 h-4 text-amber-500" }),
                    "Light Mode"
                  ),
                  React.createElement("div", { className: "text-[11px] opacity-75" }, "Clean daylight daylight palette.")
                ),
                // Anime Animated Button
                React.createElement(
                  "button",
                  {
                    onClick: () => setTheme("animated"),
                    className: `p-3 rounded-lg border text-left flex flex-col gap-1.5 transition-all ${
                      theme === "animated"
                        ? "bg-indigo-900/40 border-indigo-400 text-white ring-1 ring-indigo-400"
                        : isLight
                        ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700"
                        : "bg-slate-900/60 hover:bg-slate-800 border-slate-800 text-slate-300"
                    }`
                  },
                  React.createElement(
                    "div",
                    { className: "flex items-center gap-2 font-semibold" },
                    React.createElement(window.SentinelIcon, { name: "sparkles", className: "w-4 h-4 text-amber-300" }),
                    "Anime Animated"
                  ),
                  React.createElement("div", { className: "text-[11px] opacity-75" }, "Studio office background with frosted glass.")
                )
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

    // Manager Security Alert Pop-up Modal
    showManagerAlertModal && isManager &&
      React.createElement(window.ManagerAlertModal, {
        manager: currentUser,
        alerts: managerAlerts,
        onClose: () => setShowManagerAlertModal(false),
        onDismissAlert: handleDismissManagerAlert,
        onInspectAlert: (alert) => {
          setShowManagerAlertModal(false);
          setCurrentTab("audit-history");
        },
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
