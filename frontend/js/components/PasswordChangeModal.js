// Password Change Modal Component with safe SentinelIcon
window.PasswordChangeModal = function ({ employee, onPasswordChanged, onCancel, theme }) {
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const isLight = theme === "light";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword === "XYZ@2026") {
      setError("New password cannot be the temporary default password.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await window.SentinelAPI.changePassword(employee.employee_id, newPassword, confirmPassword);
      onPasswordChanged();
    } catch (err) {
      setError(err.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  return React.createElement(
    "div",
    { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm" },
    React.createElement(
      "div",
      { className: `w-full max-w-md rounded-xl p-6 border shadow-2xl relative ${
        isLight ? "bg-white border-slate-200 text-slate-800" : "bg-slate-900 border-slate-800 text-slate-100"
      }` },

      React.createElement(
        "div",
        { className: "flex items-start gap-3 mb-4" },
        React.createElement(
          "div",
          { className: "p-2 rounded-lg bg-amber-500/10 text-amber-600 border border-amber-500/20" },
          React.createElement(window.SentinelIcon, { name: "key-round", className: "w-6 h-6" })
        ),
        React.createElement(
          "div",
          null,
          React.createElement("h3", { className: "text-base font-bold" }, "Password Update Required"),
          React.createElement("p", { className: "text-xs text-amber-600 dark:text-amber-400 mt-0.5" }, "Temporary Security Credential Detected")
        )
      ),

      React.createElement(
        "div",
        { className: `p-3 rounded-lg border text-xs mb-5 ${
          isLight ? "bg-amber-50 border-amber-200 text-amber-800" : "bg-amber-950/40 border-amber-800 text-amber-200"
        }` },
        "Your company-issued temporary password must be changed before accessing internal repositories."
      ),

      error &&
        React.createElement(
          "div",
          { className: "mb-4 p-2.5 rounded-lg bg-red-50 dark:bg-rose-950/70 border border-red-200 dark:border-rose-900 text-red-700 dark:text-rose-300 text-xs" },
          error
        ),

      React.createElement(
        "form",
        { onSubmit: handleSubmit, className: "space-y-4 text-xs" },
        React.createElement(
          "div",
          null,
          React.createElement("label", { className: "block text-slate-400 mb-1" }, "New Password"),
          React.createElement("input", {
            type: "password",
            value: newPassword,
            onChange: (e) => setNewPassword(e.target.value),
            placeholder: "Enter new permanent password",
            required: true,
            className: `w-full px-3 py-2 rounded-lg border ${
              isLight ? "bg-white border-slate-300 text-slate-900" : "bg-slate-950 border-slate-700 text-white"
            }`
          })
        ),

        React.createElement(
          "div",
          null,
          React.createElement("label", { className: "block text-slate-400 mb-1" }, "Confirm Password"),
          React.createElement("input", {
            type: "password",
            value: confirmPassword,
            onChange: (e) => setConfirmPassword(e.target.value),
            placeholder: "Re-enter new password",
            required: true,
            className: `w-full px-3 py-2 rounded-lg border ${
              isLight ? "bg-white border-slate-300 text-slate-900" : "bg-slate-950 border-slate-700 text-white"
            }`
          })
        ),

        React.createElement(
          "div",
          { className: "pt-2 flex items-center justify-end gap-2" },
          onCancel &&
            React.createElement(
              "button",
              {
                type: "button",
                onClick: onCancel,
                className: `px-4 py-2 rounded-lg border text-xs ${
                  isLight ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700" : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
                }`
              },
              "Later"
            ),
          React.createElement(
            "button",
            {
              type: "submit",
              disabled: loading,
              className: "px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition-colors shadow-sm"
            },
            loading ? "Updating..." : "Update Password"
          )
        )
      )
    )
  );
};
