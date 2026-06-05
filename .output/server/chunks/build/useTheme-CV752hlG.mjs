import { m as useState } from './server.mjs';
import { computed } from 'vue';

const BASE_THEMES = [
  {
    id: "midnight",
    name: "Midnight",
    emoji: "\u{1F311}",
    dark: true,
    bgFrom: "#1a1410",
    bgTo: "#0a0a0a",
    sidebarFrom: "#1c1c1c",
    sidebarTo: "#151515",
    topbarBg: "rgba(14,14,14,0.85)",
    tint: "255 255 255",
    preview: ["#1a1410", "#1c1c1c"]
  },
  {
    id: "abyss",
    name: "Abyss",
    emoji: "\u{1F30A}",
    dark: true,
    bgFrom: "#080e1a",
    bgTo: "#050810",
    sidebarFrom: "#0c1222",
    sidebarTo: "#070d18",
    topbarBg: "rgba(6,9,18,0.9)",
    tint: "255 255 255",
    preview: ["#080e1a", "#0c1222"]
  },
  {
    id: "eclipse",
    name: "Eclipse",
    emoji: "\u{1F52E}",
    dark: true,
    bgFrom: "#0e0818",
    bgTo: "#060310",
    sidebarFrom: "#130c1e",
    sidebarTo: "#0b0714",
    topbarBg: "rgba(8,4,16,0.9)",
    tint: "255 255 255",
    preview: ["#0e0818", "#130c1e"]
  },
  {
    id: "ivory",
    name: "Ivory",
    emoji: "\u2600\uFE0F",
    dark: false,
    bgFrom: "#fdf8ef",
    bgTo: "#f5ede0",
    sidebarFrom: "#fef8ec",
    sidebarTo: "#f9f3e7",
    topbarBg: "rgba(255,255,255,0.9)",
    tint: "0 0 0",
    preview: ["#fdf8ef", "#fef8ec"]
  },
  {
    id: "cloud",
    name: "Cloud",
    emoji: "\u{1F324}",
    dark: false,
    bgFrom: "#f0f5ff",
    bgTo: "#e8edf8",
    sidebarFrom: "#f5f8ff",
    sidebarTo: "#ecf0fc",
    topbarBg: "rgba(248,251,255,0.9)",
    tint: "0 0 0",
    preview: ["#f0f5ff", "#f5f8ff"]
  }
];
const ACCENTS = [
  { id: "gold", name: "Gold", from: "#f59e0b", to: "#d97706", rgb: "245 158 11", btnText: "#000", glow: "245,158,11" },
  { id: "sky", name: "Sky", from: "#38bdf8", to: "#0ea5e9", rgb: "56 189 248", btnText: "#000", glow: "56,189,248" },
  { id: "violet", name: "Violet", from: "#a78bfa", to: "#7c3aed", rgb: "167 139 250", btnText: "#fff", glow: "167,139,250" },
  { id: "rose", name: "Rose", from: "#f43f5e", to: "#e11d48", rgb: "244 63 94", btnText: "#fff", glow: "244,63,94" },
  { id: "emerald", name: "Emerald", from: "#34d399", to: "#059669", rgb: "52 211 153", btnText: "#000", glow: "52,211,153" },
  { id: "cyan", name: "Cyan", from: "#22d3ee", to: "#0891b2", rgb: "34 211 238", btnText: "#000", glow: "34,211,238" },
  { id: "orange", name: "Orange", from: "#fb923c", to: "#ea580c", rgb: "251 146 60", btnText: "#000", glow: "251,146,60" }
];
function useTheme() {
  const baseId = useState("theme_base", () => "midnight");
  const accentId = useState("theme_accent", () => "gold");
  const customHex = useState("theme_custom_hex", () => "#f59e0b");
  const pickerOpen = useState("theme_picker", () => false);
  const currentBase = computed(() => {
    var _a;
    return (_a = BASE_THEMES.find((b) => b.id === baseId.value)) != null ? _a : BASE_THEMES[0];
  });
  const currentAccent = computed(() => {
    var _a;
    return accentId.value === "custom" ? null : (_a = ACCENTS.find((a) => a.id === accentId.value)) != null ? _a : ACCENTS[0];
  });
  const isDark = computed(() => currentBase.value.dark);
  const isDarkRef = computed(() => isDark.value);
  function setBase(id) {
    baseId.value = id;
  }
  function setAccent(id, hex) {
    accentId.value = id;
    if (hex) customHex.value = hex;
  }
  function init() {
    return;
  }
  function toggle() {
    setBase(isDark.value ? "ivory" : "midnight");
  }
  function openPicker() {
    pickerOpen.value = true;
  }
  function closePicker() {
    pickerOpen.value = false;
  }
  return {
    baseId,
    accentId,
    customHex,
    pickerOpen,
    currentBase,
    currentAccent,
    isDark,
    isDarkRef,
    // Keep legacy alias for AppTopbar
    get isDark() {
      return isDarkRef;
    },
    BASE_THEMES,
    ACCENTS,
    setBase,
    setAccent,
    init,
    toggle,
    openPicker,
    closePicker
  };
}

export { useTheme as u };
//# sourceMappingURL=useTheme-CV752hlG.mjs.map
