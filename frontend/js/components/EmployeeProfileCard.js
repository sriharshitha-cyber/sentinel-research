// Employee Profile Card Component with safe SentinelIcon
window.EmployeeProfileCard = function ({ employee, theme }) {
  const isLight = theme === "light";
  const getClearanceClass = (clearance) => {
    switch ((clearance || "").toLowerCase()) {
      case "public": return "badge-clearance-public";
      case "internal": return "badge-clearance-internal";
      case "confidential": return "badge-clearance-confidential";
      case "restricted": return "badge-clearance-restricted";
      default: return "badge-clearance-internal";
    }
  };

  return React.createElement(
    "div",
    { className: `rounded-xl p-5 border mb-6 transition-colors ${
      isLight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-900 border-slate-800"
    }` },

    React.createElement(
      "div",
      { className: "flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4" },

      // Left: Verification status and name
      React.createElement(
        "div",
        { className: "flex items-center gap-4" },
        React.createElement(
          "div",
          { className: "w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400" },
          React.createElement(window.SentinelIcon, { name: "check-circle-2", className: "w-6 h-6" })
        ),
        React.createElement(
          "div",
          null,
          React.createElement(
            "div",
            { className: "flex items-center gap-2" },
            React.createElement("span", { className: "text-xs font-bold font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1" },
              "EMPLOYEE VERIFIED",
              React.createElement(window.SentinelIcon, { name: "check", className: "w-3 h-3" })
            ),
            React.createElement("span", { className: `text-[11px] font-mono px-2 py-0.5 rounded border ${
              isLight ? "bg-slate-100 text-slate-600 border-slate-200" : "bg-slate-950 text-slate-400 border-slate-800"
            }` },
              `ID: ${employee.employee_id}`
            )
          ),
          React.createElement(
            "h2",
            { className: `text-lg font-bold tracking-tight mt-1 ${isLight ? "text-slate-900" : "text-white"}` },
            employee.name
          ),
          React.createElement(
            "div",
            { className: `text-xs ${isLight ? "text-slate-500" : "text-slate-400"}` },
            employee.email
          )
        )
      ),

      // Center: Official Record Grid
      React.createElement(
        "div",
        { className: `grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-lg border font-mono text-xs ${
          isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"
        }` },
        React.createElement(
          "div",
          null,
          React.createElement("div", { className: `text-[10px] uppercase font-bold ${isLight ? "text-slate-400" : "text-slate-500"}` }, "Department"),
          React.createElement("div", { className: `font-semibold mt-0.5 ${isLight ? "text-slate-800" : "text-slate-200"}` }, employee.department)
        ),
        React.createElement(
          "div",
          null,
          React.createElement("div", { className: `text-[10px] uppercase font-bold ${isLight ? "text-slate-400" : "text-slate-500"}` }, "Role"),
          React.createElement("div", { className: `font-semibold mt-0.5 ${isLight ? "text-slate-800" : "text-slate-200"}` }, employee.role)
        ),
        React.createElement(
          "div",
          null,
          React.createElement("div", { className: `text-[10px] uppercase font-bold ${isLight ? "text-slate-400" : "text-slate-500"}` }, "Clearance"),
          React.createElement("div", { className: `font-semibold mt-0.5 inline-block px-1.5 py-0.5 rounded text-[11px] ${getClearanceClass(employee.clearance)}` }, employee.clearance)
        ),
        React.createElement(
          "div",
          null,
          React.createElement("div", { className: `text-[10px] uppercase font-bold ${isLight ? "text-slate-400" : "text-slate-500"}` }, "Status"),
          React.createElement("div", { className: "font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1" },
            React.createElement("span", { className: "w-1.5 h-1.5 rounded-full bg-emerald-500" }),
            employee.status.toUpperCase()
          )
        )
      ),

      // Right: Authoritative Source Pill
      React.createElement(
        "div",
        { className: `text-right flex flex-col justify-center border-t lg:border-t-0 lg:border-l pt-3 lg:pt-0 lg:pl-5 font-mono ${
          isLight ? "border-slate-200" : "border-slate-800"
        }` },
        React.createElement("div", { className: `text-[10px] uppercase font-bold ${isLight ? "text-slate-400" : "text-slate-500"}` }, "Identity Source:"),
        React.createElement(
          "div",
          { className: "text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 justify-end mt-0.5" },
          React.createElement(window.SentinelIcon, { name: "database", className: "w-3 h-3" }),
          "Company Directory"
        ),
        React.createElement("div", { className: `text-[10px] mt-0.5 ${isLight ? "text-slate-400" : "text-slate-500"}` }, "Authoritative Source of Truth")
      )
    )
  );
};
