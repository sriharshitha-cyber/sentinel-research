// Multi-Agent Pipeline Status Tracker Component using safe SentinelIcon
window.AgentPipelineStatus = function ({ agentStatuses, blockedCount, allowedCount, isRunning, theme }) {
  if (!agentStatuses && !isRunning) return null;

  const isLight = theme === "light";

  const agentsList = [
    { key: "Identity Agent", label: "Identity Agent", icon: "user-check" },
    { key: "Security Threat Detection", label: "Security Threat Detection", icon: "shield-alert", isGate: true },
    { key: "Query Understanding Agent", label: "Query Understanding", icon: "search" },
    { key: "Authorization Gate", label: "Authorization Gate", icon: "shield-alert", isGate: true },
    { key: "Document Retrieval Agent", label: "Document Retrieval", icon: "file-text" },
    { key: "Output Security Check", label: "Output Security Check", icon: "shield" },
    { key: "Evidence Analysis Agent", label: "Evidence Analysis", icon: "layers" },
    { key: "Version & Conflict Agent", label: "Version & Conflict", icon: "git-commit" },
    { key: "Answer Agent", label: "Answer Agent", icon: "bot" },
    { key: "Citation Agent", label: "Citation Agent", icon: "bookmark" },
    { key: "Audit Agent", label: "Audit Agent", icon: "history" }
  ];

  const getStatusBadge = (statusStr, isGate) => {
    const s = (statusStr || "Pending").toLowerCase();
    if (s.includes("violation") || s.includes("denied") || s.includes("blocked")) {
      return React.createElement(
        "span",
        { className: "px-2 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1 font-mono" },
        React.createElement(window.SentinelIcon, { name: "shield-x", className: "w-3 h-3 text-rose-500" }),
        statusStr
      );
    }
    if (s.includes("processing")) {
      return React.createElement(
        "span",
        { className: "px-2 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1 font-mono" },
        React.createElement("span", { className: "w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" }),
        "Processing"
      );
    }
    if (s.includes("completed")) {
      return React.createElement(
        "span",
        { className: "px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-mono" },
        React.createElement(window.SentinelIcon, { name: "check", className: "w-3 h-3 text-emerald-500" }),
        statusStr
      );
    }
    if (s.includes("partial")) {
      return React.createElement(
        "span",
        { className: "px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1 font-mono" },
        React.createElement(window.SentinelIcon, { name: "alert-circle", className: "w-3 h-3 text-amber-500" }),
        statusStr
      );
    }
    return React.createElement(
      "span",
      { className: `px-2 py-0.5 rounded text-[10px] font-mono ${isLight ? "bg-slate-100 text-slate-500" : "bg-slate-800 text-slate-400"}` },
      "Pending"
    );
  };

  return React.createElement(
    "div",
    { className: `glass-panel rounded-2xl p-5 border mb-6 transition-colors ${
      isLight ? "bg-white border-slate-200 shadow-sm" : "border-slate-800"
    }` },
    React.createElement(
      "div",
      { className: `flex items-center justify-between mb-4 pb-3 border-b ${isLight ? "border-slate-200" : "border-slate-800"}` },
      React.createElement(
        "div",
        { className: "flex items-center gap-2" },
        React.createElement(window.SentinelIcon, { name: "cpu", className: "w-4 h-4 text-blue-500" }),
        React.createElement("h3", { className: `text-sm font-bold tracking-tight uppercase ${isLight ? "text-slate-900" : "text-white"}` }, "AI Research Pipeline Telemetry")
      ),
      (blockedCount > 0 || allowedCount > 0) &&
        React.createElement(
          "div",
          { className: `text-xs font-mono px-3 py-1 rounded-lg border flex items-center gap-3 ${
            isLight ? "bg-slate-50 border-slate-200" : "bg-slate-900 border-slate-800"
          }` },
          React.createElement("span", { className: "text-slate-500" }, `Candidates: ${blockedCount + allowedCount}`),
          React.createElement("span", { className: "text-emerald-500 font-semibold" }, `✓ ${allowedCount} Authorized`),
          blockedCount > 0 &&
            React.createElement("span", { className: "text-rose-500 font-semibold flex items-center gap-1" },
              React.createElement("span", { className: "w-2 h-2 rounded-full bg-rose-500" }),
              `🛡️ ${blockedCount} Blocked Before AI`
            )
        )
    ),

    // Grid of Agents
    React.createElement(
      "div",
      { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5" },
      agentsList.map((agent) => {
        const status = agentStatuses ? agentStatuses[agent.key] : "Pending";
        const isAuthGate = agent.isGate;
        return React.createElement(
          "div",
          {
            key: agent.key,
            className: `p-2.5 rounded-xl border font-mono transition-all ${
              isAuthGate && (status || "").toLowerCase().includes("block")
                ? isLight ? "bg-rose-50 border-rose-200" : "bg-rose-950/30 border-rose-500/40"
                : (status || "").toLowerCase().includes("completed")
                ? isLight ? "bg-slate-50 border-slate-200" : "bg-slate-900/60 border-slate-800"
                : (status || "").toLowerCase().includes("processing")
                ? isLight ? "bg-blue-50 border-blue-200" : "bg-blue-950/40 border-blue-500/50"
                : isLight ? "bg-white border-slate-200" : "bg-slate-900/30 border-slate-800/50"
            }`
          },
          React.createElement(
            "div",
            { className: "flex items-center justify-between gap-1 mb-1.5" },
            React.createElement(
              "div",
              { className: `flex items-center gap-1.5 text-xs font-medium truncate ${isLight ? "text-slate-700" : "text-slate-200"}` },
              React.createElement(window.SentinelIcon, { name: agent.icon, className: "w-3.5 h-3.5 text-blue-500 flex-shrink-0" }),
              React.createElement("span", { className: "truncate", title: agent.label }, agent.label)
            )
          ),
          React.createElement(
            "div",
            null,
            getStatusBadge(status, isAuthGate)
          )
        );
      })
    )
  );
};
