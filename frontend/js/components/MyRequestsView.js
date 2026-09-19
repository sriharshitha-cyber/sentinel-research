// My Requests History View Component with safe SentinelIcon
window.MyRequestsView = function ({ employee, onViewDetail, theme }) {
  const [requests, setRequests] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const isLight = theme === "light";

  React.useEffect(() => {
    loadRequests();
  }, [employee.employee_id]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const logs = await window.SentinelAPI.getAuditLogs({ user_id: employee.employee_id });
      setRequests(logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return React.createElement(
    "div",
    { className: `rounded-xl p-6 border mb-6 font-mono text-xs transition-colors ${
      isLight ? "bg-white border-slate-200 shadow-sm text-slate-800" : "bg-slate-900 border-slate-800 text-slate-100"
    }` },

    React.createElement(
      "div",
      { className: `flex items-center justify-between mb-6 pb-4 border-b ${isLight ? "border-slate-200" : "border-slate-800"}` },
      React.createElement(
        "div",
        null,
        React.createElement("h2", { className: "text-base font-bold font-sans tracking-tight uppercase" }, "My Research Requests"),
        React.createElement("p", { className: "text-slate-400 text-xs mt-0.5" }, `History of queries submitted by ${employee.name} (${employee.employee_id})`)
      ),
      React.createElement(
        "button",
        {
          onClick: loadRequests,
          className: `px-3 py-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition-colors ${
            isLight ? "bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-700" : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
          }`
        },
        React.createElement(window.SentinelIcon, { name: "refresh-cw", className: "w-3.5 h-3.5" }),
        "Refresh"
      )
    ),

    loading && React.createElement("div", { className: "py-12 text-center text-slate-400" }, "Loading your request history..."),

    !loading && requests.length === 0 &&
      React.createElement("div", { className: "py-12 text-center text-slate-500" }, "No previous research requests recorded yet. Try asking Sentinel a question!"),

    !loading && requests.length > 0 &&
      React.createElement(
        "div",
        { className: "space-y-3" },
        requests.map((r) => {
          const isSuccess = r.status === "SUCCESS";
          const isLimited = r.status === "ACCESS_LIMITED";
          return React.createElement(
            "div",
            {
              key: r.request_id,
              className: `p-4 rounded-xl border space-y-2.5 ${
                isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"
              }`
            },
            React.createElement(
              "div",
              { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-2" },
              React.createElement(
                "div",
                { className: "flex items-center gap-2" },
                React.createElement("span", { className: "text-blue-600 dark:text-blue-400 font-bold" }, r.request_id),
                React.createElement("span", { className: "text-slate-400 text-[10px]" }, r.timestamp ? new Date(r.timestamp).toLocaleTimeString() : "")
              ),
              React.createElement(
                "div",
                { className: "flex items-center gap-2" },
                r.event_type === "SECURITY_VIOLATION"
                  ? React.createElement(
                      "span",
                      { className: "px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 inline-flex items-center gap-1" },
                      React.createElement(window.SentinelIcon, { name: "shield-alert", className: "w-3 h-3 text-rose-400" }),
                      r.threat_type ? `VIOLATION: ${r.threat_type}` : "SECURITY VIOLATION"
                    )
                  : React.createElement(
                      "span",
                      { className: `px-2 py-0.5 rounded text-[10px] font-bold ${
                        isSuccess
                          ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                          : isLimited
                          ? "bg-amber-100 text-amber-700 border border-amber-300"
                          : "bg-rose-100 text-rose-700 border border-rose-300"
                      }` },
                      r.status
                    ),
                React.createElement(
                  "button",
                  {
                    onClick: () => onViewDetail(r),
                    className: `px-2 py-0.5 rounded border text-[11px] transition-colors ${
                      isLight ? "bg-white hover:bg-slate-100 border-slate-300 text-slate-700" : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
                    }`
                  },
                  "View Timeline"
                )
              )
            ),

            React.createElement(
              "div",
              { className: `text-sm font-sans font-medium ${isLight ? "text-slate-900" : "text-slate-100"}` },
              `"${r.question}"`
            ),

            React.createElement(
              "div",
              { className: `p-2.5 rounded border text-xs font-sans leading-relaxed whitespace-pre-line ${
                isLight ? "bg-white border-slate-200 text-slate-700" : "bg-slate-900 border-slate-800 text-slate-300"
              }` },
              r.answer
            ),

            r.citations && r.citations.length > 0 &&
              React.createElement(
                "div",
                { className: "text-[11px] text-slate-400 flex items-center gap-2" },
                React.createElement("span", { className: "text-slate-500" }, "Citations:"),
                r.citations.map((c) => React.createElement("span", { key: c.document_id, className: `px-1.5 py-0.5 rounded border ${
                  isLight ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-blue-950 text-blue-300 border-blue-800"
                }` }, `${c.document_id} (v${c.version})`))
              )
          );
        })
      )
  );
};
