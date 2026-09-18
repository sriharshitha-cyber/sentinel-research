// Security Flow Visualizer Component with safe SentinelIcon
window.SecurityFlowVisualizer = function ({ authorizationDecisions, blockedCount, allowedCount, theme }) {
  const isLight = theme === "light";
  const steps = [
    { label: "USER", sub: "Authenticated", icon: "user" },
    { label: "IDENTITY", sub: "Verification", icon: "badge-check" },
    { label: "QUERY", sub: "Understanding", icon: "search" },
    { label: "AUTH GATE", sub: "Pre-Retrieval", icon: "shield-alert", isGate: true },
    { label: "RETRIEVAL", sub: "Authorized Only", icon: "file-check" },
    { label: "EVIDENCE", sub: "Safe Only", icon: "layers" },
    { label: "AI ENGINE", sub: "LLM Boundary", icon: "cpu" },
    { label: "AUDIT LOG", sub: "Immutable", icon: "history" },
  ];

  return React.createElement(
    "div",
    { className: `glass-panel rounded-2xl p-6 border mb-6 transition-colors ${
      isLight ? "bg-white border-slate-200 shadow-sm" : "border-slate-800"
    }` },
    
    // Top Title & Motto
    React.createElement(
      "div",
      { className: `flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6 pb-4 border-b ${isLight ? "border-slate-200" : "border-slate-800"}` },
      React.createElement(
        "div",
        null,
        React.createElement("h3", { className: `text-base font-bold tracking-tight flex items-center gap-2 ${isLight ? "text-slate-900" : "text-white"}` },
          React.createElement(window.SentinelIcon, { name: "git-merge", className: "w-5 h-5 text-blue-500" }),
          "ZERO-TRUST ARCHITECTURAL SECURITY FLOW"
        ),
        React.createElement("p", { className: `text-xs mt-0.5 ${isLight ? "text-slate-500" : "text-slate-400"}` },
          "Strict Physical Separation: Unauthorized Documents Dropped Before LLM Context Ingestion"
        )
      ),
      React.createElement(
        "div",
        { className: `px-3 py-1.5 rounded-lg border text-xs italic ${
          isLight ? "bg-blue-50 border-blue-200 text-blue-800" : "bg-blue-950/40 border-blue-500/30 text-blue-300"
        }` },
        "“The AI can reason over what an employee is allowed to know — but it can never decide what the employee is allowed to know.”"
      )
    ),

    // Pipeline Steps Horizontal Flow
    React.createElement(
      "div",
      { className: "grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 mb-6" },
      steps.map((step) => {
        return React.createElement(
          "div",
          {
            key: step.label,
            className: `p-2.5 rounded-xl border text-center font-mono flex flex-col items-center justify-center transition-all ${
              step.isGate
                ? isLight
                  ? "bg-amber-50 border-amber-300 shadow-sm text-amber-900"
                  : "bg-amber-950/30 border-amber-500/40 text-amber-200"
                : isLight
                ? "bg-slate-50 border-slate-200 text-slate-800"
                : "bg-slate-900/50 border-slate-800 text-slate-200"
            }`
          },
          React.createElement(window.SentinelIcon, { name: step.icon, className: `w-4 h-4 mb-1 ${step.isGate ? "text-amber-500" : "text-blue-500"}` }),
          React.createElement("div", { className: `text-[11px] font-bold uppercase tracking-wider ${isLight ? "text-slate-800" : "text-slate-200"}` }, step.label),
          React.createElement("div", { className: `text-[9px] mt-0.5 ${isLight ? "text-slate-400" : "text-slate-500"}` }, step.sub)
        );
      })
    ),

    // Dynamic Decision Cards
    authorizationDecisions && authorizationDecisions.length > 0 &&
      React.createElement(
        "div",
        { className: `mt-4 pt-4 border-t ${isLight ? "border-slate-200" : "border-slate-800"}` },
        React.createElement(
          "div",
          { className: `text-xs font-bold font-mono uppercase tracking-wider mb-3 flex items-center gap-2 ${isLight ? "text-slate-600" : "text-slate-400"}` },
          React.createElement(window.SentinelIcon, { name: "shield-check", className: "w-4 h-4 text-emerald-500" }),
          "Deterministic Authorization Gate Decisions for this Request:"
        ),
        React.createElement(
          "div",
          { className: "grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs" },
          authorizationDecisions.map((dec) => {
            const isDenied = dec.decision === "DENY";
            return React.createElement(
              "div",
              {
                key: dec.document_id,
                className: `p-4 rounded-xl border relative overflow-hidden transition-all ${
                  isDenied
                    ? "glass-panel-danger border-rose-500/50 shadow-sm"
                    : "glass-panel-success border-emerald-500/40 shadow-sm"
                }`
              },
              
              // Top glowing marker
              React.createElement("div", { className: `absolute top-0 left-0 right-0 h-1 ${isDenied ? "bg-rose-500" : "bg-emerald-500"}` }),

              React.createElement(
                "div",
                { className: "flex items-start justify-between mb-2" },
                React.createElement(
                  "div",
                  null,
                  React.createElement("div", { className: `font-bold text-sm flex items-center gap-2 ${isLight ? "text-slate-900" : "text-white"}` },
                    dec.document_id,
                    React.createElement("span", { className: `text-[10px] px-1.5 py-0.5 rounded ${
                      dec.classification === "Restricted" ? "badge-clearance-restricted" : "badge-clearance-internal"
                    }` }, dec.classification || "Internal")
                  ),
                  dec.title && React.createElement("div", { className: `text-[11px] mt-0.5 ${isLight ? "text-slate-600" : "text-slate-300"}` }, dec.title)
                ),
                React.createElement(
                  "span",
                  {
                    className: `px-2.5 py-1 rounded-lg text-xs font-bold font-mono flex items-center gap-1 ${
                      isDenied
                        ? "bg-rose-600 text-white shadow-sm"
                        : "bg-emerald-600 text-white shadow-sm"
                    }`
                  },
                  isDenied ? React.createElement(window.SentinelIcon, { name: "shield-alert", className: "w-3.5 h-3.5" }) : React.createElement(window.SentinelIcon, { name: "check", className: "w-3.5 h-3.5" }),
                  dec.decision
                )
              ),

              // Rationale
              React.createElement("div", { className: `text-[11px] mb-2 leading-relaxed ${isLight ? "text-slate-700" : "text-slate-300"}` },
                React.createElement("span", { className: isLight ? "text-slate-500 font-semibold" : "text-slate-400" }, "Gate Rationale: "),
                dec.reason
              ),

              // Prominent "BLOCKED BEFORE AI" Graphic
              isDenied &&
                React.createElement(
                  "div",
                  { className: `mt-3 pt-2.5 border flex flex-col items-center justify-center p-2 rounded-lg ${
                    isLight ? "bg-rose-100/80 border-rose-300 text-rose-800" : "bg-rose-950/60 border-rose-600/40 text-rose-300"
                  }` },
                  React.createElement("div", { className: "text-xs font-bold flex items-center gap-1.5 uppercase tracking-wider text-rose-600 dark:text-rose-300" },
                    React.createElement("span", { className: "text-base" }, "🛡️"),
                    "ACCESS DENIED"
                  ),
                  React.createElement("div", { className: "text-[11px] font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1 mt-0.5" },
                    React.createElement("span", { className: "text-base" }, "🚫"),
                    "BLOCKED BEFORE AI (ZERO CONTEXT INGESTION)"
                  )
                ),

              !isDenied &&
                React.createElement(
                  "div",
                  { className: `mt-2 pt-2 border-t flex items-center justify-between text-[11px] ${
                    isLight ? "border-emerald-200 text-emerald-700" : "border-emerald-800/50 text-emerald-300"
                  }` },
                  React.createElement("span", null, "✓ Authorized for Evidence Extraction"),
                  React.createElement("span", { className: isLight ? "text-slate-500" : "text-slate-400" }, "Passed to LLM Grounding")
                )
            );
          })
        )
      )
  );
};
