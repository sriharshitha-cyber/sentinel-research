// Department Manager Security Alert Pop-up Modal
window.ManagerAlertModal = function ({ manager, alerts, onClose, onDismissAlert, onInspectAlert, theme }) {
  const isLight = theme === "light";
  const activeAlerts = (alerts || []).filter((a) => !a.dismissed);

  return React.createElement(
    "div",
    {
      className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in select-none"
    },
    React.createElement(
      "div",
      {
        className: `w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden transition-all ${
          isLight ? "bg-white border-slate-200 text-slate-900" : "bg-slate-900 border-amber-500/40 text-slate-100 shadow-amber-500/10"
        }`
      },

      // Modal Header
      React.createElement(
        "div",
        {
          className: `p-5 border-b flex items-start justify-between ${
            isLight ? "bg-amber-50 border-amber-200" : "bg-amber-950/40 border-amber-500/30"
          }`
        },
        React.createElement(
          "div",
          { className: "flex items-start gap-3" },
          React.createElement(
            "div",
            { className: "w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-500 flex-shrink-0 mt-0.5" },
            React.createElement(window.SentinelIcon, { name: "shield-alert", className: "w-6 h-6 animate-pulse" })
          ),
          React.createElement(
            "div",
            null,
            React.createElement(
              "div",
              { className: "flex items-center gap-2" },
              React.createElement(
                "h3",
                { className: `text-sm font-bold font-mono uppercase tracking-wider ${isLight ? "text-amber-900" : "text-amber-300"}` },
                "SECURITY ALERT • DEPARTMENT MANAGER NOTIFICATION"
              ),
              React.createElement(
                "span",
                { className: "text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold" },
                `${manager.department} Division`
              )
            ),
            React.createElement(
              "p",
              { className: `text-xs mt-1 ${isLight ? "text-amber-800" : "text-slate-300"}` },
              `Attention ${manager.name} (${manager.employee_id}): Unauthorized attempts to access protected ${manager.department} assets were intercepted and blocked by the Deterministic Authorization Gate.`
            )
          )
        ),
        React.createElement(
          "button",
          {
            onClick: onClose,
            className: "p-1 rounded-lg hover:bg-black/10 text-slate-400 hover:text-slate-200 transition-colors"
          },
          React.createElement(window.SentinelIcon, { name: "x", className: "w-5 h-5" })
        )
      ),

      // Alerts Content Body
      React.createElement(
        "div",
        { className: "p-5 max-h-[60vh] overflow-y-auto space-y-3 font-sans" },
        activeAlerts.length === 0
          ? React.createElement(
              "div",
              { className: "text-center py-8 text-slate-400 font-mono text-xs" },
              React.createElement(window.SentinelIcon, { name: "check-circle", className: "w-8 h-8 text-emerald-500 mx-auto mb-2" }),
              "All department security alerts have been reviewed and acknowledged."
            )
          : activeAlerts.map((alert) =>
              React.createElement(
                "div",
                {
                  key: alert.alert_id,
                  className: `p-4 rounded-xl border transition-all ${
                    isLight ? "bg-slate-50 border-slate-200 hover:border-slate-300" : "bg-slate-950/70 border-slate-800 hover:border-amber-500/40"
                  }`
                },
                // Alert Top Row
                React.createElement(
                  "div",
                  { className: "flex items-center justify-between mb-2" },
                  React.createElement(
                    "div",
                    { className: "flex items-center gap-2" },
                    React.createElement(
                      "span",
                      { className: "text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30" },
                      alert.threat_type || "UNAUTHORIZED_ACCESS"
                    ),
                    React.createElement(
                      "span",
                      { className: "text-[11px] font-mono text-slate-400" },
                      `Alert ID: ${alert.alert_id}`
                    )
                  ),
                  React.createElement(
                    "span",
                    { className: "text-[10px] font-mono text-slate-500" },
                    new Date(alert.timestamp).toLocaleString()
                  )
                ),

                // Alert Details
                React.createElement(
                  "div",
                  { className: "text-xs space-y-1 mb-3" },
                  React.createElement(
                    "div",
                    { className: "font-medium" },
                    React.createElement("span", { className: "text-slate-400" }, "Subject: "),
                    React.createElement("span", { className: isLight ? "text-slate-900 font-bold" : "text-white font-bold" }, `${alert.user_name} `),
                    React.createElement("span", { className: "text-[11px] font-mono text-blue-400" }, `(${alert.user_id} • ${alert.user_department || "Staff"})`)
                  ),
                  React.createElement(
                    "div",
                    { className: `p-2.5 rounded-lg border text-[11px] font-mono leading-relaxed ${
                      isLight ? "bg-white border-slate-200 text-slate-800" : "bg-slate-900 border-slate-800 text-amber-200/90"
                    }` },
                    alert.attempted_action
                  )
                ),

                // Action Buttons
                React.createElement(
                  "div",
                  { className: "flex items-center justify-between pt-2 border-t border-slate-800/60" },
                  React.createElement(
                    "div",
                    { className: "flex items-center gap-1.5 text-[10px] font-mono text-emerald-400" },
                    React.createElement("span", { className: "w-2 h-2 rounded-full bg-emerald-500" }),
                    "Zero Context Leaked (Blocked Deterministically)"
                  ),
                  React.createElement(
                    "div",
                    { className: "flex items-center gap-2" },
                    React.createElement(
                      "button",
                      {
                        type: "button",
                        onClick: () => onDismissAlert(alert.alert_id),
                        className: "px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-mono transition-colors border border-slate-700 cursor-pointer"
                      },
                      "Acknowledge & Dismiss"
                    )
                  )
                )
              )
            )
      ),

      // Modal Footer
      React.createElement(
        "div",
        {
          className: `p-4 border-t flex items-center justify-between text-xs ${
            isLight ? "bg-slate-100 border-slate-200" : "bg-slate-950 border-slate-800"
          }`
        },
        React.createElement(
          "span",
          { className: "text-[11px] font-mono text-slate-400" },
          `${activeAlerts.length} pending alert(s) requiring acknowledgment`
        ),
        React.createElement(
          "button",
          {
            type: "button",
            onClick: onClose,
            className: "px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors shadow-sm cursor-pointer"
          },
          "Close Notice"
        )
      )
    )
  );
};
