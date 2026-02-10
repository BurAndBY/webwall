const DOM_CODE_TO_WAYWALL_KEY: Record<string, string> = {
  Escape: "ESC",
  Backspace: "BACKSPACE",
  Tab: "TAB",
  Enter: "ENTER",
  Space: "SPACE",
  ArrowUp: "UP",
  ArrowDown: "DOWN",
  ArrowLeft: "LEFT",
  ArrowRight: "RIGHT",
  ShiftLeft: "LEFTSHIFT",
  ShiftRight: "RIGHTSHIFT",
  ControlLeft: "LEFTCTRL",
  ControlRight: "RIGHTCTRL",
  AltLeft: "LEFTALT",
  AltRight: "RIGHTALT",
  MetaLeft: "LEFTMETA",
  MetaRight: "RIGHTMETA",
  CapsLock: "CAPSLOCK",
  NumLock: "NUMLOCK",
  ScrollLock: "SCROLLLOCK",
  Insert: "INSERT",
  Delete: "DELETE",
  Home: "HOME",
  End: "END",
  PageUp: "PAGEUP",
  PageDown: "PAGEDOWN",
  PrintScreen: "SYSRQ",
  Pause: "PAUSE",
  Minus: "MINUS",
  Equal: "EQUAL",
  BracketLeft: "LEFTBRACE",
  BracketRight: "RIGHTBRACE",
  Backslash: "BACKSLASH",
  Semicolon: "SEMICOLON",
  Quote: "APOSTROPHE",
  Backquote: "GRAVE",
  Comma: "COMMA",
  Period: "DOT",
  Slash: "SLASH",
  IntlBackslash: "102ND",
  ContextMenu: "COMPOSE"
};

for (let i = 0; i <= 9; i += 1) {
  DOM_CODE_TO_WAYWALL_KEY[`Digit${i}`] = String(i);
  DOM_CODE_TO_WAYWALL_KEY[`Numpad${i}`] = `KP${i}`;
}

for (let i = 1; i <= 12; i += 1) {
  DOM_CODE_TO_WAYWALL_KEY[`F${i}`] = `F${i}`;
}

for (let i = 0; i < 26; i += 1) {
  const char = String.fromCharCode("A".charCodeAt(0) + i);
  DOM_CODE_TO_WAYWALL_KEY[`Key${char}`] = char;
}

DOM_CODE_TO_WAYWALL_KEY.NumpadAdd = "KPPLUS";
DOM_CODE_TO_WAYWALL_KEY.NumpadSubtract = "KPMINUS";
DOM_CODE_TO_WAYWALL_KEY.NumpadMultiply = "KPASTERISK";
DOM_CODE_TO_WAYWALL_KEY.NumpadDivide = "KPSLASH";
DOM_CODE_TO_WAYWALL_KEY.NumpadDecimal = "KPDOT";
DOM_CODE_TO_WAYWALL_KEY.NumpadEnter = "KPENTER";

export function domCodeToWaywallKey(code: unknown): string {
  if (typeof code !== "string" || !code.trim()) {
    return "";
  }
  return DOM_CODE_TO_WAYWALL_KEY[code] || "";
}
