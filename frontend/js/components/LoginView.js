// Clean Enterprise Login View (No Profile Switching)
window.LoginView = function ({ onLoginSuccess, onOpenMismatchDemo }) {
  const [identifier, setIdentifier] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const isLight = document.body.classList.contains("theme-light");

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

  const toggleTheme = () => {
    const next = isLight ? "dark" : "light";
    if (next === "light") {
      document.body.classList.add("theme-light");
    } else {
      document.body.classList.remove("theme-light");
    }
    localStorage.setItem("sentinel_theme", next);
    setIdentifier((prev) => prev); // re-render
  };

  return React.createElement(
    "div",
    { className: "min-h-screen flex items-center justify-center p-4 relative" },
    
    // Top right theme switcher
    React.createElement(
      "div",
      { className: "absolute top-6 right-6" },
      React.createElement(
        "button",
        {
          type: "button",
          onClick: toggleTheme,
          className: `px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-2 transition-colors ${
            isLight ? "bg-white border-slate-300 text-slate-700 hover:bg-slate-50" : "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800"
          }`
        },
        React.createElement("i", { "data-lucide": isLight ? "moon" : "sun", className: "w-3.5 h-3.5" }),
        isLight ? "Dark Mode" : "Light Mode"
      )
    ),

    React.createElement(
      "div",
      { className: `w-full max-w-md rounded-xl p-8 border shadow-lg transition-colors ${
        isLight ? "bg-white border-slate-200" : "bg-slate-900 border-slate-800"
      }` },

      // Header
      React.createElement(
        "div",
        { className: "text-center mb-6" },
        React.createElement(
          "div",
          { className: "inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600/10 text-blue-600 mb-3" },
          React.createElement("i", { "data-lucide": "shield-check", className: "w-6 h-6" })
        ),
        React.createElement(
          "h1",
          { className: `text-xl font-bold tracking-tight ${isLight ? "text-slate-900" : "text-white"}` },
          "SENTINEL RESEARCH"
        ),
        React.createElement(
          "p",
          { className: `text-xs mt-1 ${isLight ? "text-slate-500" : "text-slate-400"}` },
          "Secure Enterprise Intelligence Platform"
        )
      ),

      // Security Status Pills
      React.createElement(
        "div",
        { className: `flex items-center justify-between text-xs rounded-lg p-2.5 mb-5 border font-mono ${
          isLight ? "bg-slate-50 border-slate-200 text-slate-600" : "bg-slate-950 border-slate-800 text-slate-400"
        }` },
        React.createElement("span", { className: "flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400" },
          React.createElement("span", { className: "w-2 h-2 rounded-full bg-emerald-500" }),
          "Secure connection"
        ),
        React.createElement("span", { className: "flex items-center gap-1.5 text-blue-600 dark:text-blue-400" },
          "Company identity verification"
        )
      ),

      // Error Alert
      error &&
        React.createElement(
          "div",
          { className: "mb-4 p-3 rounded-lg bg-red-50 dark:bg-rose-950/70 border border-red-200 dark:border-rose-900 text-red-700 dark:text-rose-300 text-xs flex items-center gap-2" },
          React.createElement("i", { "data-lucide": "alert-triangle", className: "w-4 h-4 flex-shrink-0" }),
          React.createElement("span", null, error)
        ),

      // Form
      React.createElement(
        "form",
        { onSubmit: handleSubmit, className: "space-y-4" },
        React.createElement(
          "div",
          null,
          React.createElement("label", { className: `block text-xs font-medium mb-1.5 ${isLight ? "text-slate-700" : "text-slate-300"}` }, "Employee ID / Company Email"),
          React.createElement("input", {
            type: "text",
            value: identifier,
            onChange: (e) => setIdentifier(e.target.value),
            placeholder: "e.g. U102 or aarav@xyz.com",
            required: true,
            className: `w-full px-3.5 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isLight ? "bg-white border-slate-300 text-slate-900" : "bg-slate-950 border-slate-700 text-white"
            }`
          })
        ),

        React.createElement(
          "div",
          null,
          React.createElement("label", { className: `block text-xs font-medium mb-1.5 ${isLight ? "text-slate-700" : "text-slate-300"}` }, "Password"),
          React.createElement("input", {
            type: "password",
            value: password,
            onChange: (e) => setPassword(e.target.value),
            placeholder: "••••••••",
            required: true,
            className: `w-full px-3.5 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isLight ? "bg-white border-slate-300 text-slate-900" : "bg-slate-950 border-slate-700 text-white"
            }`
          })
        ),

        React.createElement(
          "button",
          {
            type: "submit",
            disabled: loading,
            className: "w-full mt-2 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
          },
          loading
            ? React.createElement("span", { className: "animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" })
            : React.createElement("span", null, "SIGN IN")
        )
      ),

      // Footer
      React.createElement(
        "div",
        { className: `mt-6 pt-4 border-t text-center ${isLight ? "border-slate-200" : "border-slate-800"}` },
        React.createElement(
          "p",
          { className: `text-xs ${isLight ? "text-slate-500" : "text-slate-400"}` },
          "Company-secured AI research platform"
        ),
        React.createElement(
          "button",
          {
            type: "button",
            onClick: onOpenMismatchDemo,
            className: "mt-3 text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center justify-center gap-1 mx-auto"
          },
          React.createElement("i", { "data-lucide": "shield-alert", className: "w-3.5 h-3.5" }),
          "Test Identity Cross-Check (Mismatch Demo)"
        )
      )
    )
  );
};
