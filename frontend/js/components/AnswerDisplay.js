// Answer Display & Citations Component with Safe SentinelIcon & Multi-line Markdown support
window.AnswerDisplay = function ({ response, theme }) {
  if (!response) return null;

  const isLight = theme === "light";
  const isAccessLimited = response.status === "ACCESS_LIMITED" || response.status === "DENIED";

  return React.createElement(
    "div",
    { className: `glass-panel rounded-2xl p-6 border mb-6 space-y-4 transition-colors duration-200 ${
      isLight ? "bg-white border-slate-200 shadow-sm" : "border-slate-800"
    }` },
    
    // Top Status Header
    React.createElement(
      "div",
      { className: `flex items-center justify-between pb-3 border-b ${isLight ? "border-slate-200" : "border-slate-800"}` },
      React.createElement(
        "div",
        { className: "flex items-center gap-2.5" },
        React.createElement("div", { className: `w-8 h-8 rounded-lg flex items-center justify-center ${
          isAccessLimited
            ? isLight ? "bg-amber-100 text-amber-700" : "bg-amber-500/10 text-amber-400"
            : isLight ? "bg-blue-100 text-blue-700" : "bg-blue-500/10 text-blue-400"
        }` },
          React.createElement(window.SentinelIcon, { name: isAccessLimited ? "shield-alert" : "bot", className: "w-4 h-4" })
        ),
        React.createElement(
          "div",
          null,
          React.createElement("h3", { className: `text-sm font-bold tracking-tight uppercase ${isLight ? "text-slate-900" : "text-white"}` }, "Sentinel Intelligence Response"),
          React.createElement("div", { className: `text-[11px] font-mono ${isLight ? "text-slate-400" : "text-slate-500"}` }, `Request ID: ${response.request_id || "N/A"}`)
        )
      ),
      React.createElement(
        "span",
        {
          className: `px-2.5 py-1 rounded-lg text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1 ${
            response.status === "SUCCESS"
              ? isLight ? "bg-emerald-100 text-emerald-700 border border-emerald-300" : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              : response.status === "ACCESS_LIMITED"
              ? isLight ? "bg-amber-100 text-amber-700 border border-amber-300" : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              : isLight ? "bg-rose-100 text-rose-700 border border-rose-300" : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
          }`
        },
        response.status
      )
    ),

    // Version & Conflict Resolution Notice
    response.conflict_resolution_note &&
      React.createElement(
        "div",
        { className: `p-3.5 rounded-xl border text-xs font-mono flex items-start gap-2.5 ${
          isLight ? "bg-purple-50 border-purple-200 text-purple-900" : "bg-purple-950/40 border-purple-500/40 text-purple-200"
        }` },
        React.createElement(window.SentinelIcon, { name: "git-compare", className: `w-4 h-4 flex-shrink-0 mt-0.5 ${isLight ? "text-purple-600" : "text-purple-400"}` }),
        React.createElement("div", { className: "leading-relaxed" }, response.conflict_resolution_note)
      ),

    // Guardrail Prompt Injection Warning
    response.guardrail_warnings && response.guardrail_warnings.length > 0 &&
      React.createElement(
        "div",
        { className: `p-3.5 rounded-xl border text-xs font-mono space-y-1 ${
          isLight ? "bg-rose-50 border-rose-200 text-rose-900" : "bg-rose-950/50 border-rose-500/50 text-rose-200"
        }` },
        React.createElement(
          "div",
          { className: `flex items-center gap-2 font-bold ${isLight ? "text-rose-700" : "text-rose-400"}` },
          React.createElement(window.SentinelIcon, { name: "shield-ban", className: "w-4 h-4" }),
          "SECURITY GUARDRAIL INTERVENTION: Prompt Injection Neutralized"
        ),
        response.guardrail_warnings.map((w, idx) =>
          React.createElement("div", { key: idx, className: `text-[11px] pl-6 ${isLight ? "text-slate-600" : "text-slate-300"}` }, `• ${w}`)
        )
      ),

    // Final Synthesized Answer Box
    React.createElement(
      "div",
      { className: `p-4 rounded-xl border ${
        isAccessLimited
          ? isLight ? "bg-amber-50/60 border-amber-200" : "bg-slate-900/80 border-amber-500/30"
          : isLight ? "bg-slate-50 border-slate-200" : "bg-slate-900/80 border-slate-700/50"
      }` },
      React.createElement("div", { className: `text-xs font-bold font-mono uppercase mb-2 ${isLight ? "text-slate-500" : "text-slate-400"}` }, "Synthesized Output:"),
      React.createElement(
        "div",
        { className: `text-sm leading-relaxed whitespace-pre-line font-sans ${isLight ? "text-slate-900" : "text-slate-100"}` },
        response.answer
      )
    ),

    // Citations (ONLY authorized documents appear here!)
    response.citations && response.citations.length > 0 &&
      React.createElement(
        "div",
        { className: "pt-2 font-mono" },
        React.createElement("div", { className: `text-xs font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1.5 ${isLight ? "text-slate-600" : "text-slate-400"}` },
          React.createElement(window.SentinelIcon, { name: "bookmark", className: "w-3.5 h-3.5 text-blue-500" }),
          "Verified Authorized Citations:"
        ),
        React.createElement(
          "div",
          { className: "space-y-2" },
          response.citations.map((c) =>
            React.createElement(
              "div",
              {
                key: c.document_id,
                className: `p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                  isLight ? "bg-white border-slate-200" : "bg-slate-900/70 border-slate-800"
                }`
              },
              React.createElement(
                "div",
                null,
                React.createElement("div", { className: `font-semibold text-xs flex items-center gap-2 ${isLight ? "text-slate-800" : "text-slate-200"}` },
                  React.createElement("span", { className: "text-blue-600 dark:text-blue-400 font-bold" }, c.document_id),
                  "•",
                  React.createElement("span", null, c.title),
                  React.createElement("span", { className: "text-[10px] px-1.5 py-0.5 rounded badge-clearance-internal" }, c.classification)
                ),
                React.createElement("div", { className: `text-[11px] mt-0.5 ${isLight ? "text-slate-500" : "text-slate-400"}` },
                  `Version ${c.version} • Effective ${c.effective_date}`
                )
              ),
              React.createElement(
                "div",
                { className: `text-[10px] font-mono px-2 py-1 rounded border self-start sm:self-auto ${
                  isLight ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-emerald-950/40 text-emerald-400 border-emerald-500/30"
                }` },
                "✓ Authorized Source"
              )
            )
          )
        )
      ),

    // Access Limited Clarification Note
    isAccessLimited &&
      React.createElement(
        "div",
        { className: `p-3 rounded-xl border text-[11px] font-mono flex items-start gap-2 ${
          isLight ? "bg-slate-100 border-slate-200 text-slate-600" : "bg-slate-900/60 border-slate-800 text-slate-400"
        }` },
        React.createElement(window.SentinelIcon, { name: "info", className: "w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" }),
        React.createElement("div", null,
          "Under Sentinel zero-trust policy, confidential/restricted document existence or content is strictly withheld from unauthorized roles. A security audit record has been logged for administrative review."
        )
      )
  );
};
