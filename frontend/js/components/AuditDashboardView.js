// Comprehensive Admin Audit Dashboard with safe SentinelIcon
window.AuditDashboardView = function ({ currentEmployee, initialSelectedRecord, theme }) {
  const [logs, setLogs] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedRecord, setSelectedRecord] = React.useState(initialSelectedRecord || null);

  const isLight = theme === "light";

  // Filters
  const [filterEmployee, setFilterEmployee] = React.useState("");
  const [filterDept, setFilterDept] = React.useState("ALL");
  const [filterStatus, setFilterStatus] = React.useState("ALL");
  const [searchQuery, setSearchQuery] = React.useState("");

  React.useEffect(() => {
    loadAuditLogs();
  }, []);

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      const records = await window.SentinelAPI.getAuditLogs({
        user_id: filterEmployee || undefined,
        department: filterDept !== "ALL" ? filterDept : undefined,
        status: filterStatus !== "ALL" ? filterStatus : undefined,
        search: searchQuery || undefined,
      });
      setLogs(records);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status, record) => {
    if (record && record.event_type === "SECURITY_VIOLATION") {
      return React.createElement(
        "span",
        { className: "px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 font-mono inline-flex items-center gap-1" },
        React.createElement(window.SentinelIcon, { name: "shield-alert", className: "w-3 h-3 text-rose-400" }),
        record.threat_type ? `VIOLATION: ${record.threat_type}` : "SECURITY VIOLATION"
      );
    }
    switch ((status || "").toUpperCase()) {
      case "SUCCESS":
        return React.createElement("span", { className: "px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30 font-mono" }, "SUCCESS");
      case "ACCESS_LIMITED":
        return React.createElement("span", { className: "px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-500/30 font-mono" }, "ACCESS LIMITED");
      case "DENIED":
        return React.createElement("span", { className: "px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-500/30 font-mono" }, "ACCESS DENIED");
      default:
        return React.createElement("span", { className: "px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 font-mono" }, status);
    }
  };

  return React.createElement(
    "div",
    { className: `space-y-6 font-mono text-xs ${isLight ? "text-slate-800" : "text-slate-100"}` },
    
    // Header
    React.createElement(
      "div",
      { className: `rounded-xl p-6 border transition-colors ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-900 border-slate-800"}` },
      React.createElement(
        "div",
        { className: `flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b ${isLight ? "border-slate-200" : "border-slate-800"}` },
        React.createElement(
          "div",
          null,
          React.createElement("h2", { className: "text-base font-bold uppercase tracking-tight flex items-center gap-2 font-sans" },
            React.createElement(window.SentinelIcon, { name: "shield", className: "w-5 h-5 text-rose-500" }),
            "Sentinel Enterprise Audit & Compliance Ledger"
          ),
          React.createElement("p", { className: "text-slate-400 text-xs mt-0.5" },
            "Tamper-resistant ledger logging every retrieval query, authorization gate decision, and synthesized response."
          )
        ),
        React.createElement(
          "button",
          {
            onClick: loadAuditLogs,
            className: `px-3 py-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition-colors ${
              isLight ? "bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-700" : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
            }`
          },
          React.createElement(window.SentinelIcon, { name: "refresh-cw", className: "w-3.5 h-3.5" }),
          "Refresh Ledger"
        )
      ),

      // Filter Controls Bar
      React.createElement(
        "div",
        { className: "grid grid-cols-1 sm:grid-cols-4 gap-3 mt-4" },
        React.createElement(
          "div",
          null,
          React.createElement("label", { className: "block text-[10px] text-slate-400 uppercase mb-1" }, "Filter Employee ID"),
          React.createElement("input", {
            type: "text",
            value: filterEmployee,
            onChange: (e) => setFilterEmployee(e.target.value),
            placeholder: "e.g. U102, U205",
            className: `w-full px-2.5 py-1.5 rounded-lg border text-xs ${
              isLight ? "bg-white border-slate-300 text-slate-900" : "bg-slate-950 border-slate-800 text-white"
            }`
          })
        ),
        React.createElement(
          "div",
          null,
          React.createElement("label", { className: "block text-[10px] text-slate-400 uppercase mb-1" }, "Department"),
          React.createElement("select", {
            value: filterDept,
            onChange: (e) => setFilterDept(e.target.value),
            className: `w-full px-2.5 py-1.5 rounded-lg border text-xs ${
              isLight ? "bg-white border-slate-300 text-slate-900" : "bg-slate-950 border-slate-800 text-white"
            }`
          },
            React.createElement("option", { value: "ALL" }, "All Departments"),
            React.createElement("option", { value: "Finance" }, "Finance"),
            React.createElement("option", { value: "Marketing" }, "Marketing"),
            React.createElement("option", { value: "Engineering" }, "Engineering"),
            React.createElement("option", { value: "Executive" }, "Executive")
          )
        ),
        React.createElement(
          "div",
          null,
          React.createElement("label", { className: "block text-[10px] text-slate-400 uppercase mb-1" }, "Audit Status"),
          React.createElement("select", {
            value: filterStatus,
            onChange: (e) => setFilterStatus(e.target.value),
            className: `w-full px-2.5 py-1.5 rounded-lg border text-xs ${
              isLight ? "bg-white border-slate-300 text-slate-900" : "bg-slate-950 border-slate-800 text-white"
            }`
          },
            React.createElement("option", { value: "ALL" }, "All Statuses"),
            React.createElement("option", { value: "SUCCESS" }, "SUCCESS"),
            React.createElement("option", { value: "ACCESS_LIMITED" }, "ACCESS LIMITED"),
            React.createElement("option", { value: "DENIED" }, "DENIED")
          )
        ),
        React.createElement(
          "div",
          null,
          React.createElement("label", { className: "block text-[10px] text-slate-400 uppercase mb-1" }, "Search Keyword"),
          React.createElement("input", {
            type: "text",
            value: searchQuery,
            onChange: (e) => setSearchQuery(e.target.value),
            placeholder: "Search question or answer...",
            className: `w-full px-2.5 py-1.5 rounded-lg border text-xs ${
              isLight ? "bg-white border-slate-300 text-slate-900" : "bg-slate-950 border-slate-800 text-white"
            }`
          })
        )
      )
    ),

    // Audit Table
    React.createElement(
      "div",
      { className: `rounded-xl border overflow-hidden transition-colors ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-900 border-slate-800"}` },
      React.createElement(
        "div",
        { className: "overflow-x-auto" },
        React.createElement(
          "table",
          { className: "w-full text-left border-collapse" },
          React.createElement(
            "thead",
            { className: `border-b text-[10px] uppercase font-mono tracking-wider ${
              isLight ? "bg-slate-50 border-slate-200 text-slate-500" : "bg-slate-950 border-slate-800 text-slate-400"
            }` },
            React.createElement(
              "tr",
              null,
              React.createElement("th", { className: "p-3 pl-4" }, "Request ID"),
              React.createElement("th", { className: "p-3" }, "Timestamp"),
              React.createElement("th", { className: "p-3" }, "Employee"),
              React.createElement("th", { className: "p-3" }, "Question"),
              React.createElement("th", { className: "p-3" }, "Candidates"),
              React.createElement("th", { className: "p-3" }, "Decisions"),
              React.createElement("th", { className: "p-3" }, "Evidence Used"),
              React.createElement("th", { className: "p-3" }, "Status"),
              React.createElement("th", { className: "p-3 pr-4 text-right" }, "Action")
            )
          ),
          React.createElement(
            "tbody",
            { className: `divide-y ${isLight ? "divide-slate-200" : "divide-slate-800/60"}` },
            loading &&
              React.createElement("tr", null, React.createElement("td", { colSpan: 9, className: "p-8 text-center text-slate-500" }, "Loading audit records...")),
            !loading && logs.length === 0 &&
              React.createElement("tr", null, React.createElement("td", { colSpan: 9, className: "p-8 text-center text-slate-500" }, "No matching audit records found.")),
            !loading &&
              logs.map((record) => {
                const allowedCount = (record.authorization_decisions || []).filter((d) => d.decision === "ALLOW").length;
                const deniedCount = (record.authorization_decisions || []).filter((d) => d.decision === "DENY").length;
                return React.createElement(
                  "tr",
                  {
                    key: record.request_id,
                    className: `transition-colors ${isLight ? "hover:bg-slate-50" : "hover:bg-slate-800/40"}`
                  },
                  React.createElement("td", { className: "p-3 pl-4 font-bold text-blue-600 dark:text-blue-400 font-mono text-[11px]" }, record.request_id),
                  React.createElement("td", { className: "p-3 text-slate-400 text-[11px]" }, record.timestamp ? new Date(record.timestamp).toLocaleTimeString() : "-"),
                  React.createElement("td", { className: "p-3" },
                    React.createElement("div", { className: `font-semibold text-xs ${isLight ? "text-slate-800" : "text-slate-200"}` }, record.user_id),
                    React.createElement("div", { className: "text-[10px] text-slate-400" }, `${record.department} • ${record.clearance}`)
                  ),
                  React.createElement("td", { className: `p-3 max-w-xs truncate font-sans text-xs ${isLight ? "text-slate-700" : "text-slate-300"}` }, record.question),
                  React.createElement("td", { className: "p-3 text-slate-400 text-xs" },
                    (record.documents_considered || []).join(", ") || "-"
                  ),
                  React.createElement("td", { className: "p-3" },
                    React.createElement("div", { className: "flex items-center gap-1.5 text-[11px]" },
                      allowedCount > 0 && React.createElement("span", { className: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/30" }, `${allowedCount} ALLOW`),
                      deniedCount > 0 && React.createElement("span", { className: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-500/30" }, `${deniedCount} DENY`)
                    )
                  ),
                  React.createElement("td", { className: `p-3 text-xs ${isLight ? "text-slate-700" : "text-slate-300"}` },
                    (record.evidence_used || []).join(", ") || "None"
                  ),
                  React.createElement("td", { className: "p-3" }, getStatusBadge(record.status, record)),
                  React.createElement("td", { className: "p-3 pr-4 text-right" },
                    React.createElement(
                      "button",
                      {
                        onClick: () => setSelectedRecord(record),
                        className: `px-2.5 py-1 rounded-lg border text-xs transition-colors ${
                          isLight ? "bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700" : "bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border-blue-500/30"
                        }`
                      },
                      "Inspect"
                    )
                  )
                );
              })
          )
        )
      )
    ),

    // Visual Request Timeline Modal
    selectedRecord &&
      React.createElement(
        "div",
        { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm" },
        React.createElement(
          "div",
          { className: `w-full max-w-2xl rounded-xl p-6 border shadow-2xl max-h-[90vh] overflow-y-auto relative ${
            isLight ? "bg-white border-slate-200 text-slate-800" : "bg-slate-900 border-slate-800 text-slate-100"
          }` },

          React.createElement(
            "div",
            { className: `flex items-start justify-between pb-4 mb-4 border-b ${isLight ? "border-slate-200" : "border-slate-800"}` },
            React.createElement(
              "div",
              null,
              React.createElement("div", { className: "flex items-center gap-2 flex-wrap" },
                React.createElement("h3", { className: "text-base font-bold font-sans tracking-tight" }, `REQUEST AUDIT TRAIL: ${selectedRecord.request_id}`),
                getStatusBadge(selectedRecord.status, selectedRecord)
              ),
              React.createElement("div", { className: "text-xs text-slate-400 mt-1 font-mono" },
                `Employee: ${selectedRecord.employee_name || selectedRecord.user_name || selectedRecord.user_id} (${selectedRecord.user_id} • ${selectedRecord.department} • ${selectedRecord.role} • ${selectedRecord.clearance})`
              )
            ),
            React.createElement(
              "button",
              { onClick: () => setSelectedRecord(null), className: "text-slate-400 hover:text-slate-600 p-1 rounded-lg" },
              React.createElement(window.SentinelIcon, { name: "x", className: "w-5 h-5" })
            )
          ),

          // Security Violation Banner (if applicable)
          selectedRecord.event_type === "SECURITY_VIOLATION" &&
            React.createElement(
              "div",
              { className: "mb-6 p-4 rounded-xl border border-rose-500/40 bg-rose-500/10 text-xs font-mono space-y-2" },
              React.createElement(
                "div",
                { className: "flex items-center gap-2 text-rose-400 font-bold uppercase" },
                React.createElement(window.SentinelIcon, { name: "shield-alert", className: "w-4 h-4 text-rose-500" }),
                `SECURITY VIOLATION DETECTED: ${selectedRecord.threat_type || "POLICY_BREACH"}`
              ),
              React.createElement(
                "div",
                { className: "grid grid-cols-2 gap-2 pt-1 text-[11px] text-slate-300" },
                React.createElement("div", null, React.createElement("span", { className: "text-slate-400" }, "Authorization: "), React.createElement("span", { className: "font-bold text-rose-400" }, selectedRecord.authorization_status || "DENIED")),
                React.createElement("div", null, React.createElement("span", { className: "text-slate-400" }, "Action Taken: "), React.createElement("span", { className: "font-bold text-rose-400" }, selectedRecord.action || "REQUEST_BLOCKED")),
                React.createElement("div", null, React.createElement("span", { className: "text-slate-400" }, "Documents Accessed: "), React.createElement("span", { className: "font-bold text-emerald-400" }, "NONE (0)")),
                React.createElement("div", null, React.createElement("span", { className: "text-slate-400" }, "Log Immutability: "), React.createElement("span", { className: "font-bold text-blue-400" }, "IMMUTABLE & PERSISTED"))
              )
            ),

          // User Query & Answer Grounding
          React.createElement(
            "div",
            { className: `space-y-3 mb-6 p-4 rounded-xl border text-xs font-mono ${
              isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"
            }` },
            React.createElement("div", null,
              React.createElement("span", { className: "text-slate-400 uppercase text-[10px]" }, "User Query: "),
              React.createElement("span", { className: `font-semibold ${isLight ? "text-slate-900" : "text-slate-100"}` }, `"${selectedRecord.request || selectedRecord.question}"`)
            ),
            React.createElement("div", null,
              React.createElement("span", { className: "text-slate-400 uppercase text-[10px]" }, "Synthesized Output: "),
              React.createElement("span", { className: `whitespace-pre-line ${selectedRecord.event_type === "SECURITY_VIOLATION" ? "text-rose-400 font-bold" : isLight ? "text-slate-700" : "text-slate-300"}` }, selectedRecord.answer)
            ),
            React.createElement("div", { className: "flex items-center gap-4 text-[11px] pt-1" },
              React.createElement("span", { className: "text-slate-400" }, `Considered: ${(selectedRecord.documents_considered || []).join(", ") || "None"}`),
              React.createElement("span", { className: "text-emerald-600 dark:text-emerald-400" }, `Evidence Ingested: ${(selectedRecord.documents_accessed && selectedRecord.documents_accessed.length > 0 ? selectedRecord.documents_accessed.join(", ") : (selectedRecord.evidence_used || []).join(", ")) || "Zero"}`)
            )
          ),

          // Visual Timeline Breakdown
          React.createElement(
            "div",
            null,
            React.createElement("h4", { className: "text-xs font-bold font-mono uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2" },
              React.createElement(window.SentinelIcon, { name: "clock", className: "w-4 h-4 text-blue-500" }),
              "Visual Request Execution Timeline:"
            ),
            React.createElement(
              "div",
              { className: `relative border-l-2 ml-3 space-y-4 pl-4 font-mono text-xs ${isLight ? "border-slate-200" : "border-slate-800"}` },
              (selectedRecord.timeline || []).map((event, idx) => {
                const isDenied = event.event_type === "DENIED";
                const isSuccess = event.event_type === "SUCCESS";
                const isWarning = event.event_type === "WARNING";
                return React.createElement(
                  "div",
                  { key: idx, className: "relative" },
                  // Timeline Node Dot
                  React.createElement("div", {
                    className: `absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full border-2 ${
                      isLight ? "border-white" : "border-slate-900"
                    } ${
                      isDenied
                        ? "bg-rose-500"
                        : isSuccess
                        ? "bg-emerald-500"
                        : isWarning
                        ? "bg-amber-400"
                        : "bg-blue-500"
                    }`
                  }),
                  React.createElement(
                    "div",
                    { className: `p-2.5 rounded-lg border ${
                      isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950/60 border-slate-800"
                    }` },
                    React.createElement(
                      "div",
                      { className: "flex items-center justify-between text-[11px] mb-1" },
                      React.createElement("span", { className: "font-bold text-blue-600 dark:text-blue-400 font-mono" }, event.timestamp),
                      React.createElement("span", { className: `text-[10px] px-1.5 py-0.5 rounded ${
                        isLight ? "bg-slate-200 text-slate-600" : "bg-slate-800 text-slate-400"
                      }` }, event.agent_name)
                    ),
                    React.createElement(
                      "div",
                      { className: `leading-relaxed ${isDenied ? "text-rose-600 dark:text-rose-300 font-semibold" : isLight ? "text-slate-700" : "text-slate-300"}` },
                      event.message
                    )
                  )
                );
              })
            )
          ),

          // Close button
          React.createElement(
            "div",
            { className: `mt-6 pt-4 border-t text-right ${isLight ? "border-slate-200" : "border-slate-800"}` },
            React.createElement(
              "button",
              {
                onClick: () => setSelectedRecord(null),
                className: `px-4 py-2 rounded-lg border text-xs font-mono transition-colors ${
                  isLight ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700" : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200"
                }`
              },
              "Close Timeline Inspector"
            )
          )
        )
      )
  );
};
