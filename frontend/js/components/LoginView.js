// Anime Office Login View with Live Flying Paper Animation
window.LoginView = function ({ onLoginSuccess, onOpenMismatchDemo }) {
  const [identifier, setIdentifier] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  // Mount Flying Paper Canvas on the office background template
  React.useEffect(() => {
    let cleanup = null;
    if (window.initFlyingPaperCanvas) {
      cleanup = window.initFlyingPaperCanvas("login-flying-paper-canvas");
    }
    return () => {
      if (cleanup && typeof cleanup === "function") {
        cleanup();
      }
    };
  }, []);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setError("Please enter your Employee ID / Email and password.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await window.SentinelAPI.login(identifier, password);
      onLoginSuccess(data.employee);
    } catch (err) {
      setError(err.message || "Authentication failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  const fillQuickDemo = (empId) => {
    setIdentifier(empId);
    setPassword("XYZ@2026");
  };

  return React.createElement(
    "div",
    { className: "min-h-screen relative overflow-hidden flex items-center justify-center p-4 select-none" },

    // 1. Office Background Template Image
    React.createElement(
      "div",
      {
        className: "absolute inset-0 bg-cover bg-center transition-transform duration-1000",
        style: {
          backgroundImage: "url('/assets/office_background.jpg')",
          transform: "scale(1.02)",
        }
      }
    ),

    // 2. Cinematic Anime Atmospheric Lighting & Vignette Overlay
    React.createElement(
      "div",
      {
        className: "absolute inset-0 pointer-events-none",
        style: {
          background: "radial-gradient(ellipse at 30% 40%, rgba(30, 58, 138, 0.25) 0%, rgba(15, 23, 42, 0.70) 65%, rgba(5, 7, 14, 0.90) 100%)",
        }
      }
    ),

    // 3. Live 60 FPS Flying Paper Canvas (Animated like a GIF)
    React.createElement(
      "canvas",
      {
        id: "login-flying-paper-canvas",
        className: "absolute inset-0 w-full h-full pointer-events-none z-10"
      }
    ),

    // 4. Subtle Office Ambience Pill
    React.createElement(
      "div",
      {
        className: "absolute top-6 left-6 z-20 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/60 backdrop-blur-md border border-white/10 text-slate-300 text-xs shadow-lg"
      },
      React.createElement(window.SentinelIcon, { name: "wind", className: "w-3.5 h-3.5 text-blue-400" }),
      React.createElement("span", { className: "font-mono font-medium tracking-wide" }, "Sentinel HQ • Research Office")
    ),

    // 5. Centered Frosted Glass Login Card
    React.createElement(
      "div",
      {
        className: "relative z-20 w-full max-w-md rounded-2xl p-8 backdrop-blur-2xl bg-slate-950/85 border border-white/15 shadow-2xl text-white transition-all"
      },

      // Header Branding
      React.createElement(
        "div",
        { className: "text-center mb-6" },
        React.createElement(
          "div",
          { className: "inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 mb-3 shadow-lg shadow-blue-500/20" },
          React.createElement(window.SentinelIcon, { name: "shield-check", className: "w-6 h-6 text-blue-400" })
        ),
        React.createElement(
          "h1",
          { className: "text-xl font-bold tracking-tight text-white drop-shadow-sm" },
          "SENTINEL RESEARCH"
        ),
        React.createElement(
          "p",
          { className: "text-xs mt-1 text-slate-400" },
          "Secure Enterprise Intelligence Platform"
        )
      ),

      // Security Status Banner
      React.createElement(
        "div",
        { className: "flex items-center justify-between text-[11px] rounded-lg p-2.5 mb-5 bg-slate-900/60 border border-slate-800 text-slate-400 font-mono" },
        React.createElement("span", { className: "flex items-center gap-1.5 text-emerald-400" },
          React.createElement("span", { className: "w-2 h-2 rounded-full bg-emerald-400 animate-pulse" }),
          "Deterministic Gate Active"
        ),
        React.createElement("span", { className: "flex items-center gap-1.5 text-blue-400" },
          React.createElement(window.SentinelIcon, { name: "lock", className: "w-3 h-3 text-blue-400" }),
          "Pre-Retrieval Enforced"
        )
      ),

      // Error Alert
      error &&
        React.createElement(
          "div",
          { className: "mb-4 p-3 rounded-lg bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-center gap-2" },
          React.createElement(window.SentinelIcon, { name: "alert-circle", className: "w-4 h-4 flex-shrink-0 text-rose-400" }),
          React.createElement("span", null, error)
        ),

      // Form
      React.createElement(
        "form",
        { onSubmit: handleSubmit, className: "space-y-4" },
        React.createElement(
          "div",
          null,
          React.createElement("label", { className: "block text-xs font-medium mb-1.5 text-slate-300" }, "Employee ID / Company Email"),
          React.createElement("input", {
            type: "text",
            value: identifier,
            onChange: (e) => setIdentifier(e.target.value),
            placeholder: "e.g. U102, U205, or aarav@xyz.com",
            required: true,
            className: "w-full px-3.5 py-2 rounded-lg border text-sm bg-slate-900/80 border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          })
        ),

        React.createElement(
          "div",
          null,
          React.createElement(
            "div",
            { className: "flex items-center justify-between mb-1.5" },
            React.createElement("label", { className: "text-xs font-medium text-slate-300" }, "Password"),
            React.createElement("span", { className: "text-[10px] text-slate-500" }, "Demo: XYZ@2026")
          ),
          React.createElement("input", {
            type: "password",
            value: password,
            onChange: (e) => setPassword(e.target.value),
            placeholder: "••••••••",
            required: true,
            className: "w-full px-3.5 py-2 rounded-lg border text-sm bg-slate-900/80 border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          })
        ),

        React.createElement(
          "button",
          {
            type: "submit",
            disabled: loading,
            className: "w-full mt-2 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 active:scale-[0.99]"
          },
          loading
            ? React.createElement("span", { className: "animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" })
            : React.createElement(React.Fragment, null,
                React.createElement(window.SentinelIcon, { name: "log-in", className: "w-4 h-4" }),
                React.createElement("span", null, "ENTER SECURE WORKSPACE")
              )
        )
      ),

      // Quick Demo Fill Shortcuts
      React.createElement(
        "div",
        { className: "mt-5 pt-4 border-t border-slate-800/80" },
        React.createElement("div", { className: "text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-wider text-center" }, "Quick Test Profiles:"),
        React.createElement(
          "div",
          { className: "grid grid-cols-3 gap-1.5 text-center" },
          React.createElement(
            "button",
            {
              type: "button",
              onClick: () => fillQuickDemo("U102"),
              className: "py-1 px-2 rounded-md bg-slate-900/70 hover:bg-slate-800 border border-slate-700/80 text-[11px] text-slate-300 transition-colors",
              title: "U102 (Finance, Authorized)"
            },
            "U102 (Finance)"
          ),
          React.createElement(
            "button",
            {
              type: "button",
              onClick: () => fillQuickDemo("U205"),
              className: "py-1 px-2 rounded-md bg-slate-900/70 hover:bg-slate-800 border border-slate-700/80 text-[11px] text-slate-300 transition-colors",
              title: "U205 (Marketing, Blocked)"
            },
            "U205 (Marketing)"
          ),
          React.createElement(
            "button",
            {
              type: "button",
              onClick: () => fillQuickDemo("U301"),
              className: "py-1 px-2 rounded-md bg-slate-900/70 hover:bg-slate-800 border border-slate-700/80 text-[11px] text-slate-300 transition-colors",
              title: "U301 (Finance, Version Conflict)"
            },
            "U301 (Finance)"
          )
        )
      ),

      // Footer
      React.createElement(
        "div",
        { className: "mt-4 text-center" },
        React.createElement(
          "button",
          {
            type: "button",
            onClick: onOpenMismatchDemo,
            className: "text-[11px] text-blue-400 hover:text-blue-300 hover:underline flex items-center justify-center gap-1 mx-auto transition-colors"
          },
          React.createElement(window.SentinelIcon, { name: "shield-alert", className: "w-3.5 h-3.5 text-amber-400" }),
          "Test Identity Cross-Check (Mismatch Demo)"
        )
      )
    )
  );
};
