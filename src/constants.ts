export const PRESETS = [
  ["854 x 480", 854, 480],
  ["960 x 540", 960, 540],
  ["1280 x 720", 1280, 720],
  ["1366 x 768", 1366, 768],
  ["1600 x 900", 1600, 900],
  ["1920 x 1080", 1920, 1080],
  ["2560 x 1440", 2560, 1440],
  ["3440 x 1440", 3440, 1440],
  ["3840 x 2160", 3840, 2160]
];

export const DEFAULT_RESOLUTION = [1920, 1080];
export const MIN_WIDTH = 300;
export const MAX_WIDTH = 7680;
export const MIN_HEIGHT = 240;
export const MAX_HEIGHT = 16384;
export const TALL_RESOLUTION = [384, 16384];
export const MIRROR_VISIBLE_VARIANTS = new Set(["wide", "thin", "tall"]);
export const FORCED_MODE = "f3pie";
export const FORCED_FPS_CAP = 250;
export const FORCED_BACKGROUND_URL = "public/background.png";
export const FORCED_TALL_BACKGROUND_URL = "public/tall.png";
export const MIRRORS_STORAGE_KEY = "f3pie.mirrors.v1";
export const RESOLUTION_STORAGE_KEY = "f3pie.baseResolution.v1";
export const ACTION_KEYBINDS_STORAGE_KEY = "f3pie.actionKeybinds.v1";
export const TALL_OVERLAY_STORAGE_KEY = "f3pie.tallOverlay.v1";
export const THEME_SETTINGS_STORAGE_KEY = "f3pie.themeSettings.v1";
export const WINDOW_SETTINGS_STORAGE_KEY = "f3pie.windowSettings.v1";
export const MAX_MIRROR_COLOR_KEYS = 10;
export const MIRROR_KEY_TOLERANCE = 4;
export const MIN_SCREEN_ZOOM = 1;
export const MAX_SCREEN_ZOOM = 8;
export const SCREEN_ZOOM_STEP = 0.25;
export const EYE_PROJECTOR_SIZE = Object.freeze({ width: 60, height: 580 });
export const TALL_PROJECTOR_HEIGHT_RATIO = 0.37;
export const TALL_PROJECTOR_ASPECT = 1.75;
export const MIRROR_POSITION_LIMIT = 5000;
export const MIRROR_SIZE_LIMIT = 5000;
export const MIRROR_MIN_SIZE = 0.5;

export const DEFAULT_ACTION_KEYBINDS = Object.freeze({
  openNinjabrain: "",
  thin: "",
  wide: "",
  tall: ""
});

export const DEFAULT_TALL_OVERLAY_SETTINGS = Object.freeze({
  canvasWidth: 1920,
  canvasHeight: 1080,
  colorA: "#ffb0c5",
  colorB: "#99cdf0",
  textColor: "#000000",
  pixelCount: 9,
  pixelHeight: 8,
  opacityPixels: 100,
  opacityText: 100,
  textSize: 40,
  fontStyle: "Inter-400"
});

export const DEFAULT_THEME_SETTINGS = Object.freeze({
  background_type: "color",
  background: "#000000ff",
  background_alpha: 1,
  background_png: "",
  cursor_theme: "",
  cursor_icon: "",
  cursor_size: 0,
  ninb_anchor_type: "string",
  ninb_anchor_position: "",
  ninb_anchor_x: "",
  ninb_anchor_y: "",
  ninb_opacity: 1.0
});

export const DEFAULT_WINDOW_SETTINGS = Object.freeze({
  fullscreen_width: 0,
  fullscreen_height: 0
});

export const ACTION_KEYS = Object.freeze({
  openNinjabrain: "openNinjabrain",
  thin: "thin",
  wide: "wide",
  tall: "tall"
});

export const DEFAULT_PIE_PATH = ["root", "gameRenderer", "level", "entities"];

export const PIE_COLOR_OVERRIDES = Object.freeze({
  entities: 0xE446C4,
  unspecified: 0x46CE66,
  blockentities: 0xEC6E4E,
  destroyentities: 0xCC6C46,
  prepare: 0x111311
});

export const PROFILER_TREE = {
  name: "root",
  children: [
    {
      name: "gameRenderer",
      local: 100,
      children: [
        {
          name: "level",
          local: 100,
          children: [
            {
              name: "entities",
              local: 100,
              children: [
                { name: "entities", local: 52.80 },
                { name: "blockentities", local: 19.60 },
                { name: "destroyentities", local: 16.20 },
                { name: "prepare", local: 11.40, hiddenOnPie: true }
              ]
            }
          ]
        }
      ]
    }
  ]
};
