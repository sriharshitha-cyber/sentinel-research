// Sidebar Navigation Component with safe SentinelIcon
window.Sidebar = function ({ currentTab, onSelectTab, isAdmin, theme, onLogout }) {
  const isLight = theme === "light";
  const navItems = [
    { id: "overview", label: "Dashboard", icon: "layout-dashboard" },
    { id: "ask-ai", label: "Ask AI", icon: "sparkles", highlight: true },
    { id: "my-requests", label: "My Requests", icon: "message-square" },
    { id: "my-access", label: "My Access", icon: "shield-alert" },
    { id: "audit-history", label: "Audit History", icon: "file-text" },
  ];

  if (isAdmin) {
    navItems.push({ id: "admin-audit", label: "Admin Audit", icon: "shield", adminOnly: true });
  }

  navItems.push({ id: "settings", label: "Settings", icon: "settings" });

  return React.createElement(
    "aside",
    { className: `w-64 border-r flex flex-col justify-between p-4 flex-shrink-0 transition-colors ${
      isLight ? "bg-white border-slate-200" : "bg-slate-900 border-slate-800"
    }` },
    React.createElement(
      "div",
      { className: "space-y-1 flex-1" },
      React.createElement(
        "div",
        { className: `text-[11px] uppercase font-bold tracking-wider px-3 py-2 ${isLight ? "text-slate-400" : "text-slate-500"}` },
        "Research Navigation"
      ),
      navItems.map((item) => {
        const active = currentTab === item.id;
        return React.createElement(
          "button",
          {
            key: item.id,
            onClick: () => onSelectTab(item.id),
            className: `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
              active
                ? isLight
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "bg-blue-600/15 text-blue-400 font-semibold border border-blue-500/30"
                : item.adminOnly
                ? isLight
                  ? "text-red-600 hover:bg-red-50"
                  : "text-red-400 hover:bg-red-950/30"
                : isLight
                ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`
          },
          React.createElement(window.SentinelIcon, { name: item.icon, className: `w-4 h-4 ${active ? (isLight ? "text-blue-600" : "text-blue-400") : ""}` }),
          React.createElement("span", { className: "flex-1 text-left" }, item.label),
          item.highlight &&
            React.createElement("span", { className: "w-1.5 h-1.5 rounded-full bg-blue-500" }),
          item.adminOnly &&
            React.createElement("span", { className: `text-[9px] px-1 rounded font-bold ${isLight ? "bg-red-100 text-red-700" : "bg-red-900/60 text-red-300"}` }, "ADMIN")
        );
      }),
      React.createElement(
        "button",
        {
          onClick: onLogout,
          className: `w-full mt-3 flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
            isLight
              ? "text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200"
              : "text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-900/40"
          }`,
          title: "Sign out of your session"
        },
        React.createElement(window.SentinelIcon, { name: "log-out", className: "w-4 h-4 text-red-500" }),
        React.createElement("span", null, "Log Out")
      )
    ),

    // Bottom Compliance Indicator
    React.createElement(
      "div",
      { className: `p-3.5 rounded-xl border text-xs space-y-1.5 mt-4 ${
        isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"
      }` },
      React.createElement(
        "div",
        { className: "flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-xs" },
        React.createElement(window.SentinelIcon, { name: "lock", className: "w-3.5 h-3.5" }),
        "Deterministic Security Gate"
      ),
      React.createElement(
        "p",
        { className: `text-[11px] leading-snug ${isLight ? "text-slate-500" : "text-slate-400"}` },
        "Security violations and unauthorized document context are blocked deterministically before reaching any LLM."
      )
    )
  );
};
