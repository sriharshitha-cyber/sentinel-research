// My Access Component with safe SentinelIcon
window.MyAccessView = function ({ employee, theme }) {
  const isLight = theme === "light";
  const clearanceLevels = [
    { name: "Public", rank: 0, desc: "General enterprise documents, ethics charters, public overviews" },
    { name: "Internal", rank: 1, desc: "Departmental forecasts, operational schedules, technical roadmaps" },
    { name: "Confidential", rank: 2, desc: "Security architecture, audit logs, confidential partner contracts" },
    { name: "Restricted", rank: 3, desc: "Executive board materials, unreleased M&A valuations, proprietary IP" },
  ];

  const empRank = clearanceLevels.find((c) => c.name.toLowerCase() === (employee.clearance || "").toLowerCase())?.rank ?? 1;

  return React.createElement(
    "div",
    { className: `rounded-xl p-6 border mb-6 font-mono text-xs transition-colors ${
      isLight ? "bg-white border-slate-200 shadow-sm text-slate-800" : "bg-slate-900 border-slate-800 text-slate-100"
    }` },
    
    // Header
    React.createElement(
      "div",
      { className: `flex items-center gap-3 mb-6 pb-4 border-b ${isLight ? "border-slate-200" : "border-slate-800"}` },
      React.createElement(
        "div",
        { className: "w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center" },
        React.createElement(window.SentinelIcon, { name: "shield-check", className: "w-6 h-6" })
      ),
      React.createElement(
        "div",
        null,
        React.createElement("h2", { className: "text-base font-bold uppercase tracking-wide font-sans" }, "Employee Authorization Boundary"),
        React.createElement("p", { className: "text-slate-400 text-xs mt-0.5" }, "Clearance credentials synchronized from Company Employee Directory")
      )
    ),

    // Profile summary
    React.createElement(
      "div",
      { className: "grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6" },
      React.createElement(
        "div",
        { className: `p-3.5 rounded-xl border ${isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"}` },
        React.createElement("div", { className: "text-[10px] text-slate-400 uppercase" }, "Assigned Clearance"),
        React.createElement("div", { className: "text-base font-bold text-blue-600 dark:text-blue-400 mt-1" }, employee.clearance),
        React.createElement("div", { className: "text-[10px] text-slate-400 mt-0.5" }, `Rank Level ${empRank} of 3`)
      ),
      React.createElement(
        "div",
        { className: `p-3.5 rounded-xl border ${isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"}` },
        React.createElement("div", { className: "text-[10px] text-slate-400 uppercase" }, "Authorized Department"),
        React.createElement("div", { className: `text-base font-bold mt-1 ${isLight ? "text-slate-800" : "text-white"}` }, employee.department),
        React.createElement("div", { className: "text-[10px] text-slate-400 mt-0.5" }, "Enforces department-level scoping")
      ),
      React.createElement(
        "div",
        { className: `p-3.5 rounded-xl border ${isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"}` },
        React.createElement("div", { className: "text-[10px] text-slate-400 uppercase" }, "Authorized Role"),
        React.createElement("div", { className: `text-base font-bold mt-1 ${isLight ? "text-slate-800" : "text-white"}` }, employee.role),
        React.createElement("div", { className: "text-[10px] text-slate-400 mt-0.5" }, "Role-based action entitlements")
      )
    ),

    // Clearance Hierarchy Grid
    React.createElement(
      "div",
      { className: "space-y-3" },
      React.createElement("div", { className: "text-xs font-bold text-slate-400 uppercase tracking-wider mb-2" }, "Classification Access Matrix:"),
      clearanceLevels.map((lvl) => {
        const isAccessible = empRank >= lvl.rank;
        return React.createElement(
          "div",
          {
            key: lvl.name,
            className: `p-3.5 rounded-xl border flex items-center justify-between gap-4 transition-all ${
              isAccessible
                ? isLight
                  ? "bg-slate-50 border-emerald-300"
                  : "bg-slate-950 border-emerald-500/30"
                : isLight
                ? "bg-slate-100 border-slate-200 opacity-50"
                : "bg-slate-950/40 border-slate-800 opacity-50"
            }`
          },
          React.createElement(
            "div",
            { className: "flex items-center gap-3" },
            React.createElement(
              "div",
              { className: `w-7 h-7 rounded-lg flex items-center justify-center ${isAccessible ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-slate-200 dark:bg-slate-800 text-slate-400"}` },
              React.createElement(window.SentinelIcon, { name: isAccessible ? "check" : "x", className: "w-4 h-4" })
            ),
            React.createElement(
              "div",
              null,
              React.createElement("div", { className: `font-bold text-xs flex items-center gap-2 ${isLight ? "text-slate-900" : "text-slate-200"}` },
                lvl.name,
                isAccessible && React.createElement("span", { className: "text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200" }, "Accessible")
              ),
              React.createElement("div", { className: "text-[11px] text-slate-400 mt-0.5" }, lvl.desc)
            )
          ),
          React.createElement(
            "span",
            { className: `px-2.5 py-1 rounded text-[11px] font-semibold ${isAccessible ? "text-emerald-600 bg-emerald-50 border border-emerald-200" : "text-rose-600 bg-rose-50 border border-rose-200"}` },
            isAccessible ? "PERMITTED" : "RESTRICTED"
          )
        );
      })
    ),

    // Non-disclosure security note
    React.createElement(
      "div",
      { className: `mt-6 p-3 rounded-xl border text-[11px] text-slate-400 flex items-center gap-2 ${
        isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"
      }` },
      React.createElement(window.SentinelIcon, { name: "shield", className: "w-4 h-4 text-blue-500 flex-shrink-0" }),
      "Sentinel guarantees zero metadata leakage: restricted document titles and details are hidden from unauthorized tiers."
    )
  );
};
