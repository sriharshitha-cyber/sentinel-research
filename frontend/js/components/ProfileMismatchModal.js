// Interactive Profile Mismatch Simulation Modal with safe SentinelIcon
window.ProfileMismatchModal = function ({ onClose, theme }) {
  const [employeeId, setEmployeeId] = React.useState("U102");
  const [claimedDept, setClaimedDept] = React.useState("Marketing");
  const [claimedRole, setClaimedRole] = React.useState("Finance");
  const [result, setResult] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  const isLight = theme === "light";

  const handleSimulate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await window.SentinelAPI.verifyClaimedProfile(employeeId, claimedDept, claimedRole);
      setResult(res);
    } catch (err) {
      setResult({ ok: false, data: { error: err.message } });
    } finally {
      setLoading(false);
    }
  };

  return React.createElement(
    "div",
    { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm" },
    React.createElement(
      "div",
      { className: `w-full max-w-lg rounded-xl p-6 border shadow-2xl relative ${
        isLight ? "bg-white border-slate-200 text-slate-800" : "bg-slate-900 border-slate-800 text-slate-100"
      }` },

      React.createElement(
        "div",
        { className: "flex items-start justify-between mb-4" },
        React.createElement(
          "div",
          { className: "flex items-center gap-3" },
          React.createElement(
            "div",
            { className: "p-2 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20" },
            React.createElement(window.SentinelIcon, { name: "shield-alert", className: "w-6 h-6" })
          ),
          React.createElement(
            "div",
            null,
            React.createElement("h3", { className: "text-base font-bold" }, "Identity Cross-Check Simulator"),
            React.createElement("p", { className: "text-xs text-rose-500 mt-0.5" }, "Anti-Tamper & Permission Escalation Defense")
          )
        ),
        React.createElement(
          "button",
          { onClick: onClose, className: "text-slate-400 hover:text-slate-600 p-1 rounded-lg" },
          React.createElement(window.SentinelIcon, { name: "x", className: "w-5 h-5" })
        )
      ),

      React.createElement(
        "p",
        { className: `text-xs p-3 rounded-lg border mb-4 ${
          isLight ? "bg-slate-50 border-slate-200 text-slate-600" : "bg-slate-950 border-slate-800 text-slate-300"
        }` },
        "Demonstrates identity verification defense: when a user claims an unauthorized department or role to escalate privileges, the authoritative Company Directory blocks the request."
      ),

      // Form
      React.createElement(
        "form",
        { onSubmit: handleSimulate, className: "space-y-3 font-mono text-xs" },
        React.createElement(
          "div",
          null,
          React.createElement("label", { className: "block text-slate-400 mb-1" }, "Employee ID"),
          React.createElement("input", {
            type: "text",
            value: employeeId,
            onChange: (e) => setEmployeeId(e.target.value),
            className: `w-full px-3 py-2 rounded-lg border font-mono ${
              isLight ? "bg-white border-slate-300 text-slate-900" : "bg-slate-950 border-slate-700 text-white"
            }`
          })
        ),
        React.createElement(
          "div",
          { className: "grid grid-cols-2 gap-3" },
          React.createElement(
            "div",
            null,
            React.createElement("label", { className: "block text-slate-400 mb-1" }, "Claimed Department"),
            React.createElement("input", {
              type: "text",
              value: claimedDept,
              onChange: (e) => setClaimedDept(e.target.value),
              className: `w-full px-3 py-2 rounded-lg border font-mono ${
                isLight ? "bg-white border-slate-300 text-amber-600" : "bg-slate-950 border-slate-700 text-amber-300"
              }`
            })
          ),
          React.createElement(
            "div",
            null,
            React.createElement("label", { className: "block text-slate-400 mb-1" }, "Claimed Role"),
            React.createElement("input", {
              type: "text",
              value: claimedRole,
              onChange: (e) => setClaimedRole(e.target.value),
              className: `w-full px-3 py-2 rounded-lg border font-mono ${
                isLight ? "bg-white border-slate-300 text-slate-900" : "bg-slate-950 border-slate-700 text-white"
              }`
            })
          )
        ),
        React.createElement(
          "button",
          {
            type: "submit",
            disabled: loading,
            className: "w-full mt-2 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs transition-colors shadow-sm"
          },
          loading ? "Cross-Checking Directory..." : "Execute Verification Cross-Check"
        )
      ),

      // Result Section
      result &&
        React.createElement(
          "div",
          { className: "mt-4 pt-4 border-t border-slate-200 dark:border-slate-800" },
          !result.ok
            ? React.createElement(
                "div",
                { className: "p-4 rounded-xl bg-red-50 dark:bg-rose-950/80 border border-red-200 dark:border-rose-900 font-mono text-xs space-y-2" },
                React.createElement(
                  "div",
                  { className: "flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm" },
                  React.createElement(window.SentinelIcon, { name: "alert-triangle", className: "w-4 h-4" }),
                  "⚠ PROFILE MISMATCH"
                ),
                React.createElement(
                  "div",
                  { className: "text-slate-700 dark:text-slate-300 leading-relaxed" },
                  "The department entered by the employee does not match the organization's employee record."
                ),
                React.createElement(
                  "div",
                  { className: "p-2 rounded bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 text-[11px] text-rose-600 dark:text-rose-300" },
                  "Access verification failed. Authoritative company directory record unchanged."
                ),
                result.data && result.data.official_department &&
                  React.createElement(
                    "div",
                    { className: "text-[11px] text-slate-500 pt-1" },
                    `Official record: Department = ${result.data.official_department}`
                  )
              )
            : React.createElement(
                "div",
                { className: "p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 font-mono text-xs" },
                "✓ Attributes confirmed with Company Employee Directory."
              )
        )
    )
  );
};
