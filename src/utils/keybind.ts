export function normalizeActionKeybind(rawValue: unknown): string {
  if (typeof rawValue !== "string") {
    return "";
  }
  return rawValue.trim();
}

export function formatKeybindLabel(code: string): string {
  if (!code) {
    return "Unset";
  }
  if (code.startsWith("Key")) {
    return code.slice(3).toUpperCase();
  }
  if (code.startsWith("Digit")) {
    return code.slice(5);
  }
  if (code.startsWith("Numpad")) {
    return `Num ${code.slice(6)}`;
  }
  const aliases: Record<string, string> = {
    Space: "Space",
    Escape: "Esc",
    Backquote: "`",
    Minus: "-",
    Equal: "=",
    BracketLeft: "[",
    BracketRight: "]",
    Semicolon: ";",
    Quote: "'",
    Comma: ",",
    Period: ".",
    Slash: "/",
    Backslash: "\\"
  };
  return aliases[code] || code;
}
