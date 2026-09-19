// Top Header Component with Prominent Dedicated Log Out Button
window.Header = function ({ employee, onLogout, theme, onToggleTheme, managerAlertCount = 0, onOpenAlerts }) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const isLight = theme === "light";
  const isManager = employee && (employee.is_manager || employee.employee_id.startsWith("M"));

  return React.createElement(
    "header",
    { className: `h-16 border-b px-6 flex items-center justify-between sticky top-0 z-40 transition-colors ${
      isLight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-900 border-slate-800"
    }` },
    
    // Left Branding
    React.createElement(
      "div",
      { className: "flex items-center gap-3" },
      React.createElement(
        "div",
        { className: "w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm" },
        React.createElement(window.SentinelIcon, { name: "shield-check", className: "w-5 h-5" })
      ),
      React.createElement(
        "div",
        null,
        React.createElement(
          "div",
          { className: `text-base font-bold flex items-center gap-2 ${isLight ? "text-slate-900" : "text-white"}` },
          "SENTINEL RESEARCH"
        ),
        React.createElement(
          "div",
          { className: `text-xs ${isLight ? "text-slate-500" : "text-slate-400"}` },
          "Secure Enterprise Intelligence"
        )
      )
    ),

    // Center Security Motto Banner
    React.createElement(
      "div",
      { className: `hidden md:flex items-center gap-2 px-3 py-1 rounded-full border text-xs ${
        isLight ? "bg-slate-50 border-slate-200 text-slate-600" : "bg-slate-950 border-slate-800 text-slate-400"
      }` },
      React.createElement("span", { className: "w-2 h-2 rounded-full bg-emerald-500" }),
      React.createElement("span", { className: isLight ? "text-slate-700" : "text-slate-300" }, "Deterministic Pre-LLM Authorization"),
      React.createElement("span", { className: "text-slate-400" }, "•"),
      React.createElement("span", { className: "text-blue-600 dark:text-blue-400 font-medium" }, "Zero Unauthorized Context Leakage")
    ),

    // Right Actions
    React.createElement(
      "div",
      { className: "flex items-center gap-3" },

      // Theme Switcher Button (Light / Dark / Anime Animated)
      React.createElement(
        "button",
        {
          onClick: onToggleTheme,
          className: `py-1.5 px-2.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm ${
            theme === "animated"
              ? "bg-gradient-to-r from-blue-900/60 to-indigo-900/60 border-blue-400/50 text-blue-200 hover:border-blue-300"
              : isLight
              ? "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
              : "bg-slate-950 hover:bg-slate-800 border-slate-700 text-slate-300"
          }`,
          title: `Theme: ${theme ? theme.toUpperCase() : "DARK"} (Click to cycle Light / Dark / Anime Animated)`
        },
        React.createElement(window.SentinelIcon, {
          name: theme === "light" ? "sun" : theme === "animated" ? "sparkles" : "moon",
          className: `w-3.5 h-3.5 ${theme === "animated" ? "text-amber-300" : ""}`
        }),
        React.createElement("span", { className: "hidden sm:inline capitalize" },
          theme === "animated" ? "Anime" : theme === "light" ? "Light" : "Dark"
        )
      ),

      // Manager Security Alerts Bell Button (Only rendered for department managers)
      isManager &&
        React.createElement(
          "button",
          {
            type: "button",
            onClick: onOpenAlerts,
            className: `relative py-1.5 px-2.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm ${
              managerAlertCount > 0
                ? "bg-amber-950/60 hover:bg-amber-900/80 border-amber-500/60 text-amber-300 ring-1 ring-amber-500/40"
                : isLight
                ? "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                : "bg-slate-950 hover:bg-slate-800 border-slate-700 text-slate-300"
            }`,
            title: `Department Manager Alerts: ${managerAlertCount} unacknowledged`
          },
          React.createElement(window.SentinelIcon, {
            name: "bell",
            className: `w-3.5 h-3.5 ${managerAlertCount > 0 ? "text-amber-400 animate-bounce" : "text-slate-400"}`
          }),
          React.createElement("span", { className: "hidden sm:inline font-mono font-bold" }, "Manager Alerts"),
          managerAlertCount > 0 &&
            React.createElement(
              "span",
              { className: "px-1.5 py-0.5 rounded-full bg-rose-600 text-white font-mono text-[10px] font-bold shadow-sm" },
              managerAlertCount
            )
        ),

      // Employee Profile Chip
      React.createElement(
        "div",
        { className: `flex items-center gap-2.5 py-1.5 px-3 rounded-lg border text-xs ${
          isLight ? "bg-slate-50 border-slate-200 text-slate-800" : "bg-slate-950 border-slate-800 text-white"
        }` },
        React.createElement(
          "div",
          { className: `w-7 h-7 rounded-md font-bold flex items-center justify-center ${
            isManager ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-blue-600/10 text-blue-600"
          }` },
          employee.name.charAt(0)
        ),
        React.createElement(
          "div",
          { className: "text-left hidden sm:block" },
          React.createElement("div", { className: `font-medium flex items-center gap-1.5 ${isLight ? "text-slate-900" : "text-white"}` },
            employee.name,
            isManager && React.createElement("span", { className: "text-[9px] font-mono px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30" }, "MANAGER")
          ),
          React.createElement("div", { className: "text-[11px] text-slate-400" }, `${employee.department} • ${employee.clearance}`)
        )
      ),

      // PROMINENT DIRECT LOG OUT BUTTON
      React.createElement(
        "button",
        {
          onClick: onLogout,
          className: `px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
            isLight
              ? "bg-red-50 hover:bg-red-100 border-red-200 text-red-700"
              : "bg-rose-950/40 hover:bg-rose-900/60 border-rose-800/60 text-rose-300"
          }`,
          title: "Sign out of your session"
        },
        React.createElement(window.SentinelIcon, { name: "log-out", className: "w-3.5 h-3.5" }),
        React.createElement("span", null, "Log Out")
      )
    )
  );
};
