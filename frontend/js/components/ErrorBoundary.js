// React Error Boundary Component to prevent white screens
class SentinelErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Sentinel Captured UI Error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return React.createElement(
        "div",
        { className: "min-h-[400px] flex items-center justify-center p-6" },
        React.createElement(
          "div",
          { className: "max-w-lg w-full p-6 rounded-xl bg-red-950/40 border border-red-800/60 text-red-200 font-mono text-xs space-y-3" },
          React.createElement("div", { className: "text-base font-bold text-red-400 flex items-center gap-2" },
            React.createElement(window.SentinelIcon, { name: "alert-triangle", className: "w-5 h-5" }),
            "UI Render Notice Caught"
          ),
          React.createElement("p", { className: "text-slate-300" },
            "A render exception occurred while displaying results. The application caught it safely:"
          ),
          React.createElement("pre", { className: "p-3 rounded bg-black/60 text-[11px] overflow-x-auto text-red-300" },
            String(this.state.error && this.state.error.message ? this.state.error.message : this.state.error)
          ),
          React.createElement(
            "button",
            {
              onClick: () => this.setState({ hasError: false, error: null }),
              className: "px-4 py-2 rounded bg-red-800 hover:bg-red-700 text-white font-medium text-xs transition-colors"
            },
            "Reset View"
          )
        )
      );
    }
    return this.props.children;
  }
}
window.SentinelErrorBoundary = SentinelErrorBoundary;
