// Safe React Lucide Icon Component (Does not mutate React DOM tree)
window.SentinelIcon = function ({ name, className = "w-4 h-4" }) {
  if (!name) return null;

  try {
    const toPascal = (str) =>
      str.replace(/(^\w|-\w)/g, (clear) => clear.replace("-", "").toUpperCase());
    const toCamel = (str) =>
      str.replace(/-\w/g, (clear) => clear.replace("-", "").toUpperCase());

    const pascal = toPascal(name);
    const camel = toCamel(name);

    const iconDef =
      window.lucide &&
      window.lucide.icons &&
      (window.lucide.icons[pascal] ||
        window.lucide.icons[name] ||
        window.lucide.icons[camel]);

    if (iconDef && typeof iconDef.toSvg === "function") {
      const svgHtml = iconDef.toSvg({ class: className });
      return React.createElement("span", {
        className: "inline-flex items-center justify-center flex-shrink-0",
        dangerouslySetInnerHTML: { __html: svgHtml },
      });
    }
  } catch (e) {
    // Silently fall back
  }

  return React.createElement("span", { className: `inline-block ${className}` });
};
