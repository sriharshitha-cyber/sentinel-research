// Answer Display & Citations Component with Safe SentinelIcon & Multi-line Markdown support
function renderVisualAnalytics(data, isLight) {
  if (!data) return null;
  const title = data.title || "Monthly Analysis";
  const unit = data.unit || "";
  const year = data.year || "2026";
  const monthly_breakdown = data.monthly_breakdown || [];
  const pie_chart = data.pie_chart || [];
  const kpis = data.kpis || [];

  // Monthly Bar Chart Calculations
  const maxVal = Math.max(...monthly_breakdown.map(m => Math.max(m.value || 0, m.target || 0)), 10) * 1.18;
  const chartHeight = 140;
  const chartWidth = 520;
  const barWidth = monthly_breakdown.length > 8 ? 24 : 34;
  const step = monthly_breakdown.length > 1 ? (chartWidth - 60) / (monthly_breakdown.length - 1) : 40;

  // Donut chart calculations
  const totalPie = pie_chart.reduce((acc, slice) => acc + (slice.value || 0), 0) || 1;
  const circumference = 2 * Math.PI * 40; // ~251.327
  let cumulativeOffset = 0;

  return React.createElement(
    "div",
    {
      className: `mt-4 p-4 rounded-xl border transition-all ${
        isLight ? "bg-slate-50/80 border-slate-200" : "bg-slate-900/60 border-slate-800"
      }`
    },

    // Header
    React.createElement(
      "div",
      { className: `flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b gap-2 mb-4 ${isLight ? "border-slate-200" : "border-slate-800"}` },
      React.createElement(
        "div",
        { className: "flex items-center gap-2" },
        React.createElement(window.SentinelIcon, { name: "bar-chart-2", className: "w-4 h-4 text-blue-500" }),
        React.createElement(
          "h4",
          { className: `text-xs font-bold font-mono uppercase tracking-wide ${isLight ? "text-slate-800" : "text-white"}` },
          `Visual Analysis • ${year} Trajectory`
        ),
        unit && React.createElement(
          "span",
          { className: "text-[10px] px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 font-mono font-medium" },
          unit
        )
      ),
      React.createElement(
        "span",
        { className: `text-[11px] font-sans italic ${isLight ? "text-slate-500" : "text-slate-400"}` },
        title
      )
    ),

    // KPI Summary Metrics Cards
    kpis && kpis.length > 0 && React.createElement(
      "div",
      { className: "grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-4" },
      kpis.map((kpi, idx) =>
        React.createElement(
          "div",
          {
            key: idx,
            className: `p-2.5 rounded-lg border ${
              isLight ? "bg-white border-slate-200" : "bg-slate-800/60 border-slate-700/60"
            }`
          },
          React.createElement("div", { className: `text-[10px] font-mono uppercase ${isLight ? "text-slate-500" : "text-slate-400"}` }, kpi.label),
          React.createElement("div", { className: `text-base font-bold font-mono mt-0.5 ${isLight ? "text-slate-900" : "text-white"}` }, kpi.value),
          kpi.change && React.createElement(
            "div",
            { className: `text-[10px] mt-0.5 font-mono ${kpi.isPositive ? "text-emerald-500" : "text-rose-400"}` },
            kpi.change
          )
        )
      )
    ),

    // Responsive Charts Layout: Monthly Bar Chart & Annual Donut Distribution
    React.createElement(
      "div",
      { className: "grid grid-cols-1 lg:grid-cols-5 gap-4" },

      // Monthly Bar Chart (3 cols on desktop)
      React.createElement(
        "div",
        {
          className: `lg:col-span-3 p-3 rounded-lg border flex flex-col justify-between ${
            isLight ? "bg-white border-slate-200" : "bg-slate-950/50 border-slate-800/80"
          }`
        },
        React.createElement("div", { className: "flex items-center justify-between mb-2 text-[11px] font-mono text-slate-400" },
          React.createElement("span", { className: "font-semibold" }, `Monthly Analysis (${year})`),
          React.createElement("div", { className: "flex items-center gap-3 text-[10px]" },
            React.createElement("span", { className: "flex items-center gap-1" },
              React.createElement("span", { className: "w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block" }),
              "Actual"
            ),
            React.createElement("span", { className: "flex items-center gap-1" },
              React.createElement("span", { className: "w-2.5 h-1 bg-amber-400 inline-block" }),
              "Target"
            )
          )
        ),
        React.createElement(
          "div",
          { className: "w-full overflow-x-auto" },
          React.createElement(
            "svg",
            {
              viewBox: `0 0 ${chartWidth} ${chartHeight + 45}`,
              className: "w-full h-auto min-w-[320px]",
              style: { overflow: "visible" }
            },
            // Grid lines
            [0.25, 0.5, 0.75, 1.0].map((ratio, i) => {
              const y = chartHeight - (chartHeight * ratio);
              return React.createElement("line", {
                key: i,
                x1: 20,
                y1: y + 15,
                x2: chartWidth - 10,
                y2: y + 15,
                stroke: isLight ? "#e2e8f0" : "#1e293b",
                strokeDasharray: "3 3",
                strokeWidth: 1
              });
            }),
            // Bars & Targets
            monthly_breakdown.map((item, idx) => {
              const x = 30 + idx * step;
              const barH = Math.max(6, ((item.value || 0) / maxVal) * chartHeight);
              const barY = chartHeight - barH + 15;
              const targetY = item.target ? chartHeight - (((item.target || 0) / maxVal) * chartHeight) + 15 : null;
              const isProj = item.status === "projected" || item.month.includes("Proj");

              return React.createElement(
                "g",
                { key: idx, className: "group" },
                // Bar
                React.createElement("rect", {
                  x: x - barWidth / 2,
                  y: barY,
                  width: barWidth,
                  height: barH,
                  rx: 4,
                  fill: isProj ? (isLight ? "#f59e0b" : "#d97706") : (isLight ? "#3b82f6" : "#2563eb"),
                  opacity: isProj ? 0.85 : 0.95
                }),
                // Target dash marker
                targetY !== null && React.createElement("line", {
                  x1: x - barWidth / 2 - 2,
                  y1: targetY,
                  x2: x + barWidth / 2 + 2,
                  y2: targetY,
                  stroke: "#fbbf24",
                  strokeWidth: 2.5,
                  strokeLinecap: "round"
                }),
                // Value text on top
                React.createElement("text", {
                  x: x,
                  y: barY - 4,
                  textAnchor: "middle",
                  fontSize: "9",
                  fill: isLight ? "#475569" : "#94a3b8",
                  fontFamily: "monospace"
                }, item.value),
                // Month label below
                React.createElement("text", {
                  x: x,
                  y: chartHeight + 30,
                  textAnchor: "middle",
                  fontSize: "9",
                  fontWeight: isProj ? "bold" : "normal",
                  fill: isProj ? (isLight ? "#b45309" : "#fbbf24") : (isLight ? "#64748b" : "#94a3b8"),
                  fontFamily: "monospace"
                }, item.month)
              );
            })
          )
        )
      ),

      // Donut Pie Chart (2 cols on desktop)
      React.createElement(
        "div",
        {
          className: `lg:col-span-2 p-3 rounded-lg border flex flex-col justify-between ${
            isLight ? "bg-white border-slate-200" : "bg-slate-950/50 border-slate-800/80"
          }`
        },
        React.createElement("div", { className: "text-[11px] font-mono text-slate-400 font-semibold mb-2" },
          `Annual ${year} Distribution`
        ),
        React.createElement(
          "div",
          { className: "flex items-center justify-center my-1" },
          React.createElement(
            "svg",
            {
              viewBox: "0 0 100 100",
              className: "w-28 h-28 transform -rotate-90"
            },
            pie_chart.map((slice, idx) => {
              const dash = (slice.value / totalPie) * circumference;
              const offset = cumulativeOffset;
              cumulativeOffset += dash;
              return React.createElement("circle", {
                key: idx,
                cx: 50,
                cy: 50,
                r: 40,
                fill: "transparent",
                stroke: slice.color,
                strokeWidth: 16,
                strokeDasharray: `${dash} ${circumference}`,
                strokeDashoffset: `-${offset}`,
                className: "transition-all duration-500"
              });
            })
          )
        ),
        // Pie Chart Legend
        React.createElement(
          "div",
          { className: "space-y-1.5 mt-2" },
          pie_chart.map((slice, idx) => {
            const pct = Math.round((slice.value / totalPie) * 100);
            return React.createElement(
              "div",
              { key: idx, className: "flex items-center justify-between text-[10px] font-mono" },
              React.createElement("div", { className: "flex items-center gap-1.5 truncate mr-2" },
                React.createElement("span", {
                  className: "w-2 h-2 rounded-full flex-shrink-0",
                  style: { backgroundColor: slice.color }
                }),
                React.createElement("span", { className: `truncate ${isLight ? "text-slate-700" : "text-slate-300"}` }, slice.label)
              ),
              React.createElement("span", { className: `font-bold ${isLight ? "text-slate-800" : "text-white"}` }, `${pct}%`)
            );
          })
        )
      )
    )
  );
}

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
          response.event_type === "SECURITY_VIOLATION" || response.status === "DENIED"
            ? isLight ? "bg-rose-100 text-rose-700" : "bg-rose-500/10 text-rose-400"
            : isAccessLimited
            ? isLight ? "bg-amber-100 text-amber-700" : "bg-amber-500/10 text-amber-400"
            : isLight ? "bg-blue-100 text-blue-700" : "bg-blue-500/10 text-blue-400"
        }` },
          React.createElement(window.SentinelIcon, { name: (response.event_type === "SECURITY_VIOLATION" || response.status === "DENIED") ? "shield-alert" : isAccessLimited ? "shield-alert" : "bot", className: "w-4 h-4" })
        ),
        React.createElement(
          "div",
          null,
          React.createElement("h3", { className: `text-sm font-bold tracking-tight uppercase ${isLight ? "text-slate-900" : "text-white"}` },
            response.event_type === "SECURITY_VIOLATION" ? "Security Violation Blocked" : "Sentinel Intelligence Response"
          ),
          React.createElement("div", { className: `text-[11px] font-mono ${isLight ? "text-slate-400" : "text-slate-500"}` }, `Request ID: ${response.request_id || "N/A"}`)
        )
      ),
      React.createElement(
        "span",
        {
          className: `px-2.5 py-1 rounded-lg text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1 ${
            response.event_type === "SECURITY_VIOLATION"
              ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
              : response.status === "SUCCESS"
              ? isLight ? "bg-emerald-100 text-emerald-700 border border-emerald-300" : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              : response.status === "ACCESS_LIMITED"
              ? isLight ? "bg-amber-100 text-amber-700 border border-amber-300" : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              : isLight ? "bg-rose-100 text-rose-700 border border-rose-300" : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
          }`
        },
        response.event_type === "SECURITY_VIOLATION" ? `ACCESS DENIED (${response.threat_type || "VIOLATION"})` : response.status
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
          response.event_type === "SECURITY_VIOLATION"
            ? `SECURITY VIOLATION DETECTED: ${response.threat_type || "POLICY_BREACH"}`
            : "SECURITY GUARDRAIL INTERVENTION: Prompt Injection Neutralized"
        ),
        response.guardrail_warnings.map((w, idx) =>
          React.createElement("div", { key: idx, className: `text-[11px] pl-6 ${isLight ? "text-slate-600" : "text-slate-300"}` }, `• ${w}`)
        )
      ),

    // Two-Tier / Two-Step Granular Verification Notice
    response.content_redacted &&
      React.createElement(
        "div",
        { className: `p-3.5 rounded-xl border text-xs font-mono flex items-start gap-2.5 ${
          isLight ? "bg-amber-50 border-amber-300 text-amber-900" : "bg-amber-950/40 border-amber-500/40 text-amber-200"
        }` },
        React.createElement(window.SentinelIcon, { name: "shield-alert", className: `w-4 h-4 flex-shrink-0 mt-0.5 ${isLight ? "text-amber-600" : "text-amber-400"}` }),
        React.createElement(
          "div",
          { className: "space-y-1 leading-relaxed" },
          React.createElement("div", { className: "font-bold flex items-center gap-2" },
            "TWO-STEP VERIFICATION ACTIVE • GRANULAR REDACTION APPLIED",
            React.createElement("span", { className: "text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40" },
              `${response.redacted_sections_count || 1} Section(s) Masked`
            )
          ),
          React.createElement("div", { className: "text-[11px] opacity-90" },
            response.two_tier_status || "Step 1: Document access authorized. Step 2: Content-level redaction masked sections requiring higher clearance."
          )
        )
      ),

    // Final Synthesized Answer Box
    React.createElement(
      "div",
      { className: `p-4 rounded-xl border ${
        response.event_type === "SECURITY_VIOLATION"
          ? "bg-rose-950/20 border-rose-500/50"
          : isAccessLimited
          ? isLight ? "bg-amber-50/60 border-amber-200" : "bg-slate-900/80 border-amber-500/30"
          : isLight ? "bg-slate-50 border-slate-200" : "bg-slate-900/80 border-slate-700/50"
      }` },
      React.createElement("div", { className: `text-xs font-bold font-mono uppercase mb-2 ${
        response.event_type === "SECURITY_VIOLATION" ? "text-rose-400" : isLight ? "text-slate-500" : "text-slate-400"
      }` }, response.event_type === "SECURITY_VIOLATION" ? "Security Decision:" : "Synthesized Output:"),
      React.createElement(
        "div",
        { className: `text-sm leading-relaxed whitespace-pre-line font-sans ${
          response.event_type === "SECURITY_VIOLATION" ? "text-rose-300 font-semibold" : isLight ? "text-slate-900" : "text-slate-100"
        }` },
        response.answer
      )
    ),

    // Rich Monthly Analysis & Graphical Visualizations (Year 2026)
    response.visual_data && renderVisualAnalytics(response.visual_data, isLight),

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
                React.createElement(
                  "div",
                  { className: `text-[11px] mt-0.5 ${isLight ? "text-slate-500" : "text-slate-400"}` },
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
          "Under Sentinel security policy, confidential/restricted document existence or content is strictly withheld from unauthorized roles. A persistent security audit record has been logged for administrative review."
        )
      )
  );
};
