// @ts-nocheck
import { getForcedBackgroundDataUrl, getForcedTallBackgroundDataUrl } from "./env";
import { clamp, computeGuiScale, snapCssPixel } from "./utils/math";
import { formatKeybindLabel, normalizeActionKeybind } from "./utils/keybind";
import {
  colorKeyToRgbInt,
  colorKeyToRgbTuple,
  normalizeColorKey,
  normalizeHexColor,
  rgbToHex
} from "./utils/colors";
import { domCodeToWaywallKey } from "./utils/waywall-keycodes";
import { mirrorKeysEqual, normalizeMirrorKeys, parseMirrorNumber } from "./utils/mirror";
import {
  ACTION_KEYS,
  ACTION_KEYBINDS_STORAGE_KEY,
  DEFAULT_ACTION_KEYBINDS,
  DEFAULT_PIE_PATH,
  DEFAULT_RESOLUTION,
  DEFAULT_THEME_SETTINGS,
  DEFAULT_TALL_OVERLAY_SETTINGS,
  DEFAULT_WINDOW_SETTINGS,
  EYE_PROJECTOR_SIZE,
  FORCED_BACKGROUND_URL,
  FORCED_FPS_CAP,
  FORCED_MODE,
  FORCED_TALL_BACKGROUND_URL,
  MAX_HEIGHT,
  MAX_MIRROR_COLOR_KEYS,
  MAX_SCREEN_ZOOM,
  MAX_WIDTH,
  MIN_HEIGHT,
  MIN_SCREEN_ZOOM,
  MIN_WIDTH,
  MIRRORS_STORAGE_KEY,
  MIRROR_KEY_TOLERANCE,
  MIRROR_MIN_SIZE,
  MIRROR_POSITION_LIMIT,
  MIRROR_SIZE_LIMIT,
  MIRROR_VISIBLE_VARIANTS,
  PIE_COLOR_OVERRIDES,
  PRESETS,
  PROFILER_TREE,
  RESOLUTION_STORAGE_KEY,
  SCREEN_ZOOM_STEP,
  THEME_SETTINGS_STORAGE_KEY,
  TALL_OVERLAY_STORAGE_KEY,
  WINDOW_SETTINGS_STORAGE_KEY,
  TALL_PROJECTOR_ASPECT,
  TALL_PROJECTOR_HEIGHT_RATIO,
  TALL_RESOLUTION
} from "./constants";

export function runApp(): void {
      const FORCED_BACKGROUND_DATA_URL = getForcedBackgroundDataUrl();
      const FORCED_TALL_BACKGROUND_DATA_URL = getForcedTallBackgroundDataUrl();

      // Runtime state
      const state = {
        mode: FORCED_MODE,
        windowWidth: DEFAULT_RESOLUTION[0],
        windowHeight: DEFAULT_RESOLUTION[1],
        baseWidth: DEFAULT_RESOLUTION[0],
        baseHeight: DEFAULT_RESOLUTION[1],
        screenZoom: 1,
        screenPanX: 0,
        screenPanY: 0,
        screenPanDrag: null,
        zoomAnchorClientX: null,
        zoomAnchorClientY: null,
        viewportCropMode: "contain",
        displayVariant: "preset",
        guiScaleSetting: 0,
        effectiveGuiScale: 1,
        scaledWidth: DEFAULT_RESOLUTION[0],
        scaledHeight: DEFAULT_RESOLUTION[1],
        integratedServer: true,
        showAltGraphs: false,
        fpsCap: FORCED_FPS_CAP,
        piePath: [...DEFAULT_PIE_PATH],
        graphPushTimer: 0,
        frameMsSamples: [],
        tickMsSamples: [],
        memUsedMb: 2680,
        memAllocatedMb: 3880,
        tickCount: 0,
        lastPieHitboxes: [],
        cameraX: 125.217,
        cameraY: 67.000,
        cameraZ: -302.683,
        yaw: 180.0,
        pitch: 3.0,
        customBgImage: null,
        customBgName: "",
        customBgObjectUrl: "",
        bgLoadError: false,
        tallBgImage: null,
        tallBgLoadError: false,
        actionKeybinds: { ...DEFAULT_ACTION_KEYBINDS },
        keybindCaptureAction: "",
        theme: { ...DEFAULT_THEME_SETTINGS },
        windowSettings: { ...DEFAULT_WINDOW_SETTINGS },
        tallOverlay: { ...DEFAULT_TALL_OVERLAY_SETTINGS },
        mirrors: [],
        mirrorSelectionMode: false,
        mirrorSelectionDrag: null,
        mirrorColorPick: null,
        mirrorOverlayDrag: null,
        mirrorOverlayResize: null,
        suppressNextCanvasClick: false,
        mirrorKeyingBlocked: false,
        lastDevicePixelRatio: Math.max(1, window.devicePixelRatio || 1)
      };

      // DOM references
      const canvas = document.getElementById("screenCanvas");
      const ctx = canvas.getContext("2d", { alpha: false });
      const eyeMeasureOverlayCanvas = document.getElementById("eyeMeasureOverlayCanvas");
      const eyeOverlayCtx = eyeMeasureOverlayCanvas.getContext("2d");
      const eyeMeasureTextCanvas = document.getElementById("eyeMeasureTextCanvas");
      const eyeTextCtx = eyeMeasureTextCanvas.getContext("2d");
      const viewportWrap = document.getElementById("viewportWrap");

      const presetSelect = document.getElementById("presetSelect");
      const widthInput = document.getElementById("widthInput");
      const heightInput = document.getElementById("heightInput");
      const applyResolutionButton = document.getElementById("applyResolution");
      const guiScaleSelect = document.getElementById("guiScaleSelect");
      const wideButton = document.getElementById("wideButton");
      const thinButton = document.getElementById("thinButton");
      const tallButton = document.getElementById("tallButton");
      const resolutionViewToggle = document.getElementById("resolutionViewToggle");
      const resolutionViewBody = document.getElementById("resolutionViewBody");
      const actionsSettingsToggle = document.getElementById("actionsSettingsToggle");
      const actionsSettingsBody = document.getElementById("actionsSettingsBody");
      const openNinjabrainKeybindValue = document.getElementById("openNinjabrainKeybindValue");
      const openNinjabrainKeybindSet = document.getElementById("openNinjabrainKeybindSet");
      const openNinjabrainKeybindClear = document.getElementById("openNinjabrainKeybindClear");
      const thinKeybindValue = document.getElementById("thinKeybindValue");
      const thinKeybindSet = document.getElementById("thinKeybindSet");
      const thinKeybindClear = document.getElementById("thinKeybindClear");
      const wideKeybindValue = document.getElementById("wideKeybindValue");
      const wideKeybindSet = document.getElementById("wideKeybindSet");
      const wideKeybindClear = document.getElementById("wideKeybindClear");
      const tallKeybindValue = document.getElementById("tallKeybindValue");
      const tallKeybindSet = document.getElementById("tallKeybindSet");
      const tallKeybindClear = document.getElementById("tallKeybindClear");
      const themeSettingsToggle = document.getElementById("themeSettingsToggle");
      const themeSettingsBody = document.getElementById("themeSettingsBody");
      const windowSettingsToggle = document.getElementById("windowSettingsToggle");
      const windowSettingsBody = document.getElementById("windowSettingsBody");
      const windowFullscreenWidthInput = document.getElementById("windowFullscreenWidthInput");
      const windowFullscreenHeightInput = document.getElementById("windowFullscreenHeightInput");
      const themeBackgroundTypeSelect = document.getElementById("themeBackgroundTypeSelect");
      const themeBackgroundColorField = document.getElementById("themeBackgroundColorField");
      const themeBackgroundAlphaField = document.getElementById("themeBackgroundAlphaField");
      const themeBackgroundPngField = document.getElementById("themeBackgroundPngField");
      const themeBackgroundInput = document.getElementById("themeBackgroundInput");
      const themeBackgroundAlphaInput = document.getElementById("themeBackgroundAlphaInput");
      const themeBackgroundPngInput = document.getElementById("themeBackgroundPngInput");
      const themeCursorThemeInput = document.getElementById("themeCursorThemeInput");
      const themeCursorIconField = document.getElementById("themeCursorIconField");
      const themeCursorSizeField = document.getElementById("themeCursorSizeField");
      const themeCursorIconInput = document.getElementById("themeCursorIconInput");
      const themeCursorSizeInput = document.getElementById("themeCursorSizeInput");
      const themeNinbAnchorTypeSelect = document.getElementById("themeNinbAnchorTypeSelect");
      const themeNinbAnchorModeField = document.getElementById("themeNinbAnchorModeField");
      const themeNinbAnchorPositionSelect = document.getElementById("themeNinbAnchorPositionSelect");
      const themeNinbAnchorXField = document.getElementById("themeNinbAnchorXField");
      const themeNinbAnchorYField = document.getElementById("themeNinbAnchorYField");
      const themeNinbAnchorXInput = document.getElementById("themeNinbAnchorXInput");
      const themeNinbAnchorYInput = document.getElementById("themeNinbAnchorYInput");
      const themeNinbOpacityInput = document.getElementById("themeNinbOpacityInput");
      const exportWaywallJsonButton = document.getElementById("exportWaywallJsonButton");
      const overlayColorAInput = document.getElementById("overlayColorAInput");
      const overlayColorBInput = document.getElementById("overlayColorBInput");
      const overlayTextColorInput = document.getElementById("overlayTextColorInput");
      const overlayPixelCountInput = document.getElementById("overlayPixelCountInput");
      const overlayPixelHeightInput = document.getElementById("overlayPixelHeightInput");
      const overlayOpacityPixelsInput = document.getElementById("overlayOpacityPixelsInput");
      const overlayOpacityTextInput = document.getElementById("overlayOpacityTextInput");
      const overlayTextSizeInput = document.getElementById("overlayTextSizeInput");
      const overlayFontStyleSelect = document.getElementById("overlayFontStyleSelect");
      const exportTallOverlayButton = document.getElementById("exportTallOverlayButton");
      const zoomOutButton = document.getElementById("zoomOutButton");
      const zoomInButton = document.getElementById("zoomInButton");
      const zoomResetButton = document.getElementById("zoomResetButton");
      const zoomLevelText = document.getElementById("zoomLevelText");
      const mirrorXInput = document.getElementById("mirrorXInput");
      const mirrorYInput = document.getElementById("mirrorYInput");
      const mirrorWInput = document.getElementById("mirrorWInput");
      const mirrorHInput = document.getElementById("mirrorHInput");
      const selectMirrorButton = document.getElementById("selectMirrorButton");
      const addMirrorButton = document.getElementById("addMirrorButton");
      const clearMirrorsButton = document.getElementById("clearMirrorsButton");
      const mirrorsToggle = document.getElementById("mirrorsToggle");
      const mirrorsBody = document.getElementById("mirrorsBody");
      const mirrorSelectionStatus = document.getElementById("mirrorSelectionStatus");
      const mirrorList = document.getElementById("mirrorList");
      const tallOverlaySettingsHome = document.getElementById("tallOverlaySettingsHome");
      const tallOverlaySettingsHost = document.getElementById("tallOverlaySettingsHost");
      const mirrorOverlayLayer = document.getElementById("mirrorOverlayLayer");
      const mirrorSelectionBox = document.getElementById("mirrorSelectionBox");
      const statusText = document.getElementById("statusText");
      const mirrorOverlayContexts = new WeakMap();

      ctx.imageSmoothingEnabled = false;
      eyeOverlayCtx.imageSmoothingEnabled = false;
      eyeTextCtx.imageSmoothingEnabled = true;
      eyeTextCtx.imageSmoothingQuality = "high";

      // Profiler tree helpers
      function deepClone(node) {
        return {
          name: node.name,
          local: node.local,
          hiddenOnPie: node.hiddenOnPie === true,
          children: node.children ? node.children.map(deepClone) : undefined
        };
      }

      function annotateGlobals(node, globalShare) {
        node.global = globalShare;
        if (!Array.isArray(node.children) || node.children.length === 0) {
          return;
        }
        for (const child of node.children) {
          const childGlobal = globalShare * (child.local / 100);
          annotateGlobals(child, childGlobal);
        }
      }

      const profilerRoot = deepClone(PROFILER_TREE);
      profilerRoot.local = 100;
      annotateGlobals(profilerRoot, 100);

      // Shared utilities
      function javaHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i += 1) {
          hash = ((hash * 31) + str.charCodeAt(i)) | 0;
        }
        return hash;
      }

      function colorFromProfilerName(name) {
        const override = PIE_COLOR_OVERRIDES[name.toLowerCase()];
        if (override !== undefined) {
          return override;
        }
        const hash = javaHash(name);
        const rgb = (((hash >>> 0) & 0xAAAAAA) + 4473924) & 0xFFFFFF;
        return rgb;
      }

      function rgbIntToCss(rgb, alpha = 1) {
        const r = (rgb >> 16) & 255;
        const g = (rgb >> 8) & 255;
        const b = rgb & 255;
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      }

      function fillResolutionPresetSelect() {
        for (const preset of PRESETS) {
          const option = document.createElement("option");
          option.value = `${preset[1]}x${preset[2]}`;
          option.textContent = preset[0];
          presetSelect.appendChild(option);
        }
        const custom = document.createElement("option");
        custom.value = "custom";
        custom.textContent = "Custom";
        presetSelect.appendChild(custom);
      }

      function updateScaledResolution() {
        state.effectiveGuiScale = computeGuiScale(state.guiScaleSetting, state.windowWidth, state.windowHeight);
        state.scaledWidth = Math.floor(state.windowWidth / state.effectiveGuiScale);
        state.scaledHeight = Math.floor(state.windowHeight / state.effectiveGuiScale);
      }

      function applyResolution(width, height) {
        state.windowWidth = clamp(Math.floor(width), MIN_WIDTH, MAX_WIDTH);
        state.windowHeight = clamp(Math.floor(height), MIN_HEIGHT, MAX_HEIGHT);

        canvas.width = state.windowWidth;
        canvas.height = state.windowHeight;
        eyeMeasureOverlayCanvas.width = Math.max(1, state.windowWidth);
        eyeMeasureOverlayCanvas.height = Math.max(1, state.windowHeight);
        eyeMeasureTextCanvas.width = Math.max(1, state.windowWidth);
        eyeMeasureTextCanvas.height = Math.max(1, state.windowHeight);

        widthInput.value = String(state.windowWidth);
        heightInput.value = String(state.windowHeight);

        updateScaledResolution();
        updateViewportLayout();
        clampMirrorsAfterResolutionChange();
      }

      function saveBaseResolutionToStorage() {
        try {
          localStorage.setItem(RESOLUTION_STORAGE_KEY, JSON.stringify({
            width: state.baseWidth,
            height: state.baseHeight
          }));
        } catch (error) {
          // Ignore storage errors (private mode/full quota).
        }
      }

      function loadBaseResolutionFromStorage() {
        try {
          const raw = localStorage.getItem(RESOLUTION_STORAGE_KEY);
          if (!raw) {
            return null;
          }
          const parsed = JSON.parse(raw);
          if (!parsed || typeof parsed !== "object") {
            return null;
          }
          const width = clamp(Math.floor(Number(parsed.width)), MIN_WIDTH, MAX_WIDTH);
          const height = clamp(Math.floor(Number(parsed.height)), MIN_HEIGHT, MAX_HEIGHT);
          if (!Number.isFinite(width) || !Number.isFinite(height)) {
            return null;
          }
          return { width, height };
        } catch (error) {
          return null;
        }
      }

      function setBaseResolution(width, height, persist = false) {
        state.baseWidth = clamp(Math.floor(width), MIN_WIDTH, MAX_WIDTH);
        state.baseHeight = clamp(Math.floor(height), MIN_HEIGHT, MAX_HEIGHT);
        syncTallOverlayCanvasSizeToBaseResolution(persist);
        syncTallOverlayControls();
        updateViewportLayout();
        if (persist) {
          saveBaseResolutionToStorage();
        }
      }

      function setViewportCropMode(mode) {
        state.viewportCropMode = mode === "crop" ? "crop" : "contain";
        updateViewportLayout();
      }

      function normalizeActionKeybinds(raw) {
        const parsed = (raw && typeof raw === "object") ? raw : {};
        return {
          openNinjabrain: normalizeActionKeybind(parsed.openNinjabrain),
          thin: normalizeActionKeybind(parsed.thin),
          wide: normalizeActionKeybind(parsed.wide),
          tall: normalizeActionKeybind(parsed.tall)
        };
      }

      function loadActionKeybindsFromStorage() {
        try {
          const raw = localStorage.getItem(ACTION_KEYBINDS_STORAGE_KEY);
          if (!raw) {
            state.actionKeybinds = { ...DEFAULT_ACTION_KEYBINDS };
            return;
          }
          state.actionKeybinds = normalizeActionKeybinds(JSON.parse(raw));
        } catch (error) {
          state.actionKeybinds = { ...DEFAULT_ACTION_KEYBINDS };
        }
      }

      function saveActionKeybindsToStorage() {
        try {
          localStorage.setItem(ACTION_KEYBINDS_STORAGE_KEY, JSON.stringify(state.actionKeybinds));
        } catch (error) {
          // Ignore storage errors (private mode/full quota).
        }
      }

      function updateActionKeybindUi() {
        openNinjabrainKeybindValue.textContent = formatKeybindLabel(state.actionKeybinds.openNinjabrain);
        thinKeybindValue.textContent = formatKeybindLabel(state.actionKeybinds.thin);
        wideKeybindValue.textContent = formatKeybindLabel(state.actionKeybinds.wide);
        tallKeybindValue.textContent = formatKeybindLabel(state.actionKeybinds.tall);

        openNinjabrainKeybindSet.textContent =
          state.keybindCaptureAction === ACTION_KEYS.openNinjabrain ? "Press key..." : "Set";
        thinKeybindSet.textContent =
          state.keybindCaptureAction === ACTION_KEYS.thin ? "Press key..." : "Set";
        wideKeybindSet.textContent =
          state.keybindCaptureAction === ACTION_KEYS.wide ? "Press key..." : "Set";
        tallKeybindSet.textContent =
          state.keybindCaptureAction === ACTION_KEYS.tall ? "Press key..." : "Set";
      }

      function setKeybindCaptureAction(actionKey) {
        state.keybindCaptureAction = state.keybindCaptureAction === actionKey ? "" : actionKey;
        updateActionKeybindUi();
      }

      function setActionKeybind(actionKey, code) {
        state.actionKeybinds[actionKey] = normalizeActionKeybind(code);
        saveActionKeybindsToStorage();
        updateActionKeybindUi();
      }

      function clearActionKeybind(actionKey) {
        setActionKeybind(actionKey, "");
      }

      function findActionForCode(code) {
        if (!code) {
          return "";
        }
        if (state.actionKeybinds.openNinjabrain === code) {
          return ACTION_KEYS.openNinjabrain;
        }
        if (state.actionKeybinds.thin === code) {
          return ACTION_KEYS.thin;
        }
        if (state.actionKeybinds.wide === code) {
          return ACTION_KEYS.wide;
        }
        if (state.actionKeybinds.tall === code) {
          return ACTION_KEYS.tall;
        }
        return "";
      }

      function runAction(actionKey) {
        if (actionKey === ACTION_KEYS.openNinjabrain) {
          return;
        }
        if (actionKey === ACTION_KEYS.wide) {
          if (state.displayVariant === "wide") {
            setDisplayVariant("preset");
            setViewportCropMode("contain");
            applyShortcutResolution(state.baseWidth, state.baseHeight);
            return;
          }
          setDisplayVariant("wide");
          setViewportCropMode("contain");
          applyShortcutResolution(state.baseWidth, 300);
          return;
        }
        if (actionKey === ACTION_KEYS.thin) {
          if (state.displayVariant === "thin") {
            setDisplayVariant("preset");
            setViewportCropMode("contain");
            applyShortcutResolution(state.baseWidth, state.baseHeight);
            return;
          }
          setDisplayVariant("thin");
          setViewportCropMode("contain");
          applyShortcutResolution(350, state.baseHeight);
          return;
        }
        if (actionKey === ACTION_KEYS.tall) {
          if (state.displayVariant === "tall") {
            setDisplayVariant("preset");
            setViewportCropMode("contain");
            applyShortcutResolution(state.baseWidth, state.baseHeight);
            return;
          }
          setDisplayVariant("tall");
          setViewportCropMode("crop");
          applyShortcutResolution(TALL_RESOLUTION[0], TALL_RESOLUTION[1]);
        }
      }

      function shouldIgnoreGlobalKeybind(event) {
        const target = event.target;
        if (!(target instanceof Element)) {
          return false;
        }
        return Boolean(
          target.closest("input, textarea, select") ||
          target.closest("[contenteditable='true']")
        );
      }

      function setCollapsibleState(toggle, body, expanded) {
        if (!toggle || !body) {
          return;
        }
        const isExpanded = Boolean(expanded);
        toggle.setAttribute("aria-expanded", isExpanded ? "true" : "false");
        toggle.textContent = isExpanded ? "▴" : "▾";
        body.hidden = !isExpanded;
      }

      function toggleCollapsibleState(toggle, body) {
        const isExpanded = toggle.getAttribute("aria-expanded") === "true";
        setCollapsibleState(toggle, body, !isExpanded);
      }

      function bindCollapsibleToggle(toggle, body) {
        if (!toggle || !body) {
          return;
        }
        toggle.addEventListener("click", () => {
          toggleCollapsibleState(toggle, body);
        });
        const headerRow = toggle.closest(".card-header-row");
        if (!headerRow) {
          return;
        }
        headerRow.addEventListener("click", (event) => {
          const target = event.target;
          if (!(target instanceof Element)) {
            return;
          }
          if (target.closest("button, a, input, select, textarea, label")) {
            return;
          }
          toggleCollapsibleState(toggle, body);
        });
      }

      function normalizeThemeHex(rawValue, fallback) {
        const value = typeof rawValue === "string" ? rawValue.trim() : "";
        if (/^#[0-9a-fA-F]{6}$/.test(value)) {
          return `${value.toLowerCase()}ff`;
        }
        if (/^#[0-9a-fA-F]{8}$/.test(value)) {
          return value.toLowerCase();
        }
        return fallback;
      }

      function withThemeAlpha(hex8, alpha) {
        const base = /^#[0-9a-fA-F]{8}$/.test(hex8)
          ? hex8.slice(0, 7).toLowerCase()
          : normalizeThemeHex(hex8, DEFAULT_THEME_SETTINGS.background).slice(0, 7);
        const a = clamp(Number(alpha), 0, 1);
        const alphaByte = Math.round(a * 255).toString(16).padStart(2, "0");
        return `${base}${alphaByte}`;
      }

      function alphaFromHex8(hex8) {
        const normalized = normalizeThemeHex(hex8, DEFAULT_THEME_SETTINGS.background);
        const byte = Number.parseInt(normalized.slice(7, 9), 16);
        return clamp(byte / 255, 0, 1);
      }

      function normalizeThemeSettings(raw) {
        const parsed = (raw && typeof raw === "object") ? raw : {};
        const opacityNum = Number(parsed.ninb_opacity);
        const parsedType = typeof parsed.background_type === "string" ? parsed.background_type : "";
        const backgroundType = (parsedType === "image" || parsedType === "color")
          ? parsedType
          : (typeof parsed.background_png === "string" && parsed.background_png.trim() ? "image" : "color");
        const rawBackground = normalizeThemeHex(parsed.background, DEFAULT_THEME_SETTINGS.background);
        const rawBackgroundAlpha = Number(parsed.background_alpha);
        const backgroundAlpha = Number.isFinite(rawBackgroundAlpha)
          ? clamp(rawBackgroundAlpha, 0, 1)
          : alphaFromHex8(rawBackground);
        const background = withThemeAlpha(rawBackground, backgroundAlpha);
        const backgroundPng = typeof parsed.background_png === "string" ? parsed.background_png : DEFAULT_THEME_SETTINGS.background_png;
        const anchorPosRaw = typeof parsed.ninb_anchor_position === "string" ? parsed.ninb_anchor_position : DEFAULT_THEME_SETTINGS.ninb_anchor_position;
        const validPositions = new Set(["", "topleft", "top", "topright", "left", "right", "bottomleft", "bottomright"]);
        const anchorPos = validPositions.has(anchorPosRaw) ? anchorPosRaw : DEFAULT_THEME_SETTINGS.ninb_anchor_position;
        const anchorX = parsed.ninb_anchor_x === "" || parsed.ninb_anchor_x === null || parsed.ninb_anchor_x === undefined
          ? ""
          : String(Math.round(Number(parsed.ninb_anchor_x)));
        const anchorY = parsed.ninb_anchor_y === "" || parsed.ninb_anchor_y === null || parsed.ninb_anchor_y === undefined
          ? ""
          : String(Math.round(Number(parsed.ninb_anchor_y)));
        return {
          background_type: backgroundType,
          background,
          background_alpha: backgroundAlpha,
          background_png: backgroundType === "image" ? backgroundPng : "",
          cursor_theme: typeof parsed.cursor_theme === "string" ? parsed.cursor_theme : DEFAULT_THEME_SETTINGS.cursor_theme,
          cursor_icon: DEFAULT_THEME_SETTINGS.cursor_icon,
          cursor_size: DEFAULT_THEME_SETTINGS.cursor_size,
          ninb_anchor_type: "string",
          ninb_anchor_position: anchorPos,
          ninb_anchor_x: Number.isFinite(Number(anchorX)) ? anchorX : "",
          ninb_anchor_y: Number.isFinite(Number(anchorY)) ? anchorY : "",
          ninb_opacity: Number.isFinite(opacityNum)
            ? clamp(opacityNum, 0, 1)
            : DEFAULT_THEME_SETTINGS.ninb_opacity
        };
      }

      function saveThemeSettingsToStorage() {
        try {
          localStorage.setItem(THEME_SETTINGS_STORAGE_KEY, JSON.stringify(state.theme));
        } catch (error) {
          // Ignore storage errors (private mode/full quota).
        }
      }

      function loadThemeSettingsFromStorage() {
        try {
          const raw = localStorage.getItem(THEME_SETTINGS_STORAGE_KEY);
          if (!raw) {
            state.theme = { ...DEFAULT_THEME_SETTINGS };
            return;
          }
          state.theme = normalizeThemeSettings(JSON.parse(raw));
        } catch (error) {
          state.theme = { ...DEFAULT_THEME_SETTINGS };
        }
      }

      function syncThemeControls() {
        if (!themeBackgroundInput) {
          return;
        }
        themeBackgroundTypeSelect.value = state.theme.background_type;
        themeBackgroundInput.value = state.theme.background.slice(0, 7);
        themeBackgroundAlphaInput.value = Number(state.theme.background_alpha).toFixed(2);
        themeBackgroundPngInput.value = state.theme.background_png;
        themeCursorThemeInput.value = state.theme.cursor_theme;
        if (themeCursorIconInput) {
          themeCursorIconInput.value = state.theme.cursor_icon;
        }
        if (themeCursorSizeInput) {
          themeCursorSizeInput.value = String(state.theme.cursor_size);
        }
        themeNinbAnchorTypeSelect.value = state.theme.ninb_anchor_type;
        themeNinbAnchorPositionSelect.value = state.theme.ninb_anchor_position;
        themeNinbAnchorXInput.value = state.theme.ninb_anchor_x;
        themeNinbAnchorYInput.value = state.theme.ninb_anchor_y;
        themeNinbOpacityInput.value = String(state.theme.ninb_opacity);
        const usingImage = state.theme.background_type === "image";
        if (themeBackgroundColorField) {
          themeBackgroundColorField.hidden = usingImage;
          themeBackgroundColorField.style.display = usingImage ? "none" : "";
        }
        if (themeBackgroundAlphaField) {
          themeBackgroundAlphaField.hidden = usingImage;
          themeBackgroundAlphaField.style.display = usingImage ? "none" : "";
        }
        if (themeBackgroundPngField) {
          themeBackgroundPngField.hidden = !usingImage;
          themeBackgroundPngField.style.display = usingImage ? "" : "none";
        }
        themeBackgroundInput.disabled = usingImage;
        themeBackgroundAlphaInput.disabled = usingImage;
        themeBackgroundPngInput.disabled = !usingImage;
        if (themeCursorIconField) {
          themeCursorIconField.hidden = true;
          themeCursorIconField.style.display = "none";
        }
        if (themeCursorSizeField) {
          themeCursorSizeField.hidden = true;
          themeCursorSizeField.style.display = "none";
        }
        if (themeNinbAnchorModeField) {
          themeNinbAnchorModeField.hidden = true;
          themeNinbAnchorModeField.style.display = "none";
        }
        if (themeNinbAnchorXField) {
          themeNinbAnchorXField.hidden = true;
          themeNinbAnchorXField.style.display = "none";
        }
        if (themeNinbAnchorYField) {
          themeNinbAnchorYField.hidden = true;
          themeNinbAnchorYField.style.display = "none";
        }
      }

      function updateThemeFromControls() {
        const backgroundType = themeBackgroundTypeSelect.value === "image" ? "image" : "color";
        const backgroundPng = backgroundType === "image" ? themeBackgroundPngInput.value : "";
        state.theme = normalizeThemeSettings({
          background_type: backgroundType,
          background: themeBackgroundInput.value,
          background_alpha: themeBackgroundAlphaInput.value,
          background_png: backgroundPng,
          cursor_theme: themeCursorThemeInput.value,
          cursor_icon: "",
          cursor_size: 0,
          ninb_anchor_type: "string",
          ninb_anchor_position: themeNinbAnchorPositionSelect.value,
          ninb_anchor_x: themeNinbAnchorXInput.value,
          ninb_anchor_y: themeNinbAnchorYInput.value,
          ninb_opacity: themeNinbOpacityInput.value
        });
        syncThemeControls();
        saveThemeSettingsToStorage();
      }

      function normalizeWindowSettings(raw) {
        const parsed = (raw && typeof raw === "object") ? raw : {};
        return {
          fullscreen_width: clamp(Math.floor(Number(parsed.fullscreen_width) || 0), 0, MAX_WIDTH),
          fullscreen_height: clamp(Math.floor(Number(parsed.fullscreen_height) || 0), 0, MAX_HEIGHT)
        };
      }

      function loadWindowSettingsFromStorage() {
        try {
          const raw = localStorage.getItem(WINDOW_SETTINGS_STORAGE_KEY);
          if (!raw) {
            state.windowSettings = { ...DEFAULT_WINDOW_SETTINGS };
            return;
          }
          state.windowSettings = normalizeWindowSettings(JSON.parse(raw));
        } catch (error) {
          state.windowSettings = { ...DEFAULT_WINDOW_SETTINGS };
        }
      }

      function saveWindowSettingsToStorage() {
        try {
          localStorage.setItem(WINDOW_SETTINGS_STORAGE_KEY, JSON.stringify(state.windowSettings));
        } catch (error) {
          // Ignore storage errors (private mode/full quota).
        }
      }

      function syncWindowControls() {
        if (!windowFullscreenWidthInput) {
          return;
        }
        windowFullscreenWidthInput.value = String(state.windowSettings.fullscreen_width);
        windowFullscreenHeightInput.value = String(state.windowSettings.fullscreen_height);
      }

      function updateWindowSettingsFromControls() {
        state.windowSettings = normalizeWindowSettings({
          fullscreen_width: windowFullscreenWidthInput.value,
          fullscreen_height: windowFullscreenHeightInput.value
        });
        syncWindowControls();
        saveWindowSettingsToStorage();
      }

      function normalizeTallOverlaySettings(raw) {
        const parsed = (raw && typeof raw === "object") ? raw : {};
        return {
          canvasWidth: clamp(Math.floor(Number(parsed.canvasWidth) || DEFAULT_TALL_OVERLAY_SETTINGS.canvasWidth), 1, 16384),
          canvasHeight: clamp(Math.floor(Number(parsed.canvasHeight) || DEFAULT_TALL_OVERLAY_SETTINGS.canvasHeight), 1, 16384),
          colorA: normalizeHexColor(parsed.colorA, DEFAULT_TALL_OVERLAY_SETTINGS.colorA),
          colorB: normalizeHexColor(parsed.colorB, DEFAULT_TALL_OVERLAY_SETTINGS.colorB),
          textColor: normalizeHexColor(parsed.textColor, DEFAULT_TALL_OVERLAY_SETTINGS.textColor),
          pixelCount: clamp(Math.floor(Number(parsed.pixelCount) || DEFAULT_TALL_OVERLAY_SETTINGS.pixelCount), 1, 50),
          pixelHeight: clamp(Math.floor(Number(parsed.pixelHeight) || DEFAULT_TALL_OVERLAY_SETTINGS.pixelHeight), 1, 50),
          opacityPixels: clamp(Math.floor(Number(parsed.opacityPixels) || DEFAULT_TALL_OVERLAY_SETTINGS.opacityPixels), 0, 100),
          opacityText: clamp(Math.floor(Number(parsed.opacityText) || DEFAULT_TALL_OVERLAY_SETTINGS.opacityText), 0, 100),
          textSize: clamp(Math.floor(Number(parsed.textSize) || DEFAULT_TALL_OVERLAY_SETTINGS.textSize), 1, 200),
          fontStyle: typeof parsed.fontStyle === "string" && parsed.fontStyle ? parsed.fontStyle : DEFAULT_TALL_OVERLAY_SETTINGS.fontStyle
        };
      }

      function loadTallOverlaySettingsFromStorage() {
        try {
          const raw = localStorage.getItem(TALL_OVERLAY_STORAGE_KEY);
          if (!raw) {
            state.tallOverlay = { ...DEFAULT_TALL_OVERLAY_SETTINGS };
            return;
          }
          state.tallOverlay = normalizeTallOverlaySettings(JSON.parse(raw));
        } catch (error) {
          state.tallOverlay = { ...DEFAULT_TALL_OVERLAY_SETTINGS };
        }
      }

      function saveTallOverlaySettingsToStorage() {
        try {
          localStorage.setItem(TALL_OVERLAY_STORAGE_KEY, JSON.stringify(state.tallOverlay));
        } catch (error) {
          // Ignore storage errors (private mode/full quota).
        }
      }

      function syncTallOverlayControls() {
        overlayColorAInput.value = state.tallOverlay.colorA;
        overlayColorBInput.value = state.tallOverlay.colorB;
        overlayTextColorInput.value = state.tallOverlay.textColor;
        overlayPixelCountInput.value = String(state.tallOverlay.pixelCount);
        overlayPixelHeightInput.value = String(state.tallOverlay.pixelHeight);
        overlayOpacityPixelsInput.value = String(state.tallOverlay.opacityPixels);
        overlayOpacityTextInput.value = String(state.tallOverlay.opacityText);
        overlayTextSizeInput.value = String(state.tallOverlay.textSize);
        overlayFontStyleSelect.value = state.tallOverlay.fontStyle;
      }

      function syncTallOverlayCanvasSizeToBaseResolution(persist = false) {
        state.tallOverlay.canvasWidth = state.baseWidth;
        state.tallOverlay.canvasHeight = state.baseHeight;
        if (persist) {
          saveTallOverlaySettingsToStorage();
        }
      }

      function updateTallOverlayFromControls() {
        state.tallOverlay = normalizeTallOverlaySettings({
          canvasWidth: state.baseWidth,
          canvasHeight: state.baseHeight,
          colorA: overlayColorAInput.value,
          colorB: overlayColorBInput.value,
          textColor: overlayTextColorInput.value,
          pixelCount: overlayPixelCountInput.value,
          pixelHeight: overlayPixelHeightInput.value,
          opacityPixels: overlayOpacityPixelsInput.value,
          opacityText: overlayOpacityTextInput.value,
          textSize: overlayTextSizeInput.value,
          fontStyle: overlayFontStyleSelect.value
        });
        syncTallOverlayControls();
        saveTallOverlaySettingsToStorage();
      }

      function renderOverlayGenToCanvas(targetCanvas, targetCtx, options = {}) {
        const safeWidth = Math.max(1, targetCanvas.width);
        const safeHeight = Math.max(1, targetCanvas.height);
        const pixelCount = state.tallOverlay.pixelCount;
        const pixelWidth = safeWidth / 60;
        const pixelHeight = Math.max(1, Math.round((safeHeight * state.tallOverlay.pixelHeight) / 100));
        const pixelY = Math.round((safeHeight / 2) - (pixelHeight / 2));
        const [fontFamily, weightStyle] = state.tallOverlay.fontStyle.split("-");
        let fontWeight = "400";
        let fontStyle = "normal";
        if (weightStyle && weightStyle.endsWith("i")) {
          fontWeight = weightStyle.slice(0, -1);
          fontStyle = "italic";
        } else if (weightStyle) {
          fontWeight = weightStyle;
        }
        const textSize = state.tallOverlay.textSize;
        // Hack: on-screen tall overlay text needs a 4x downscale to match expected visual size.
        const effectiveTextSize = options.overlayPreviewHack ? (textSize / 4) : textSize;
        targetCtx.clearRect(0, 0, safeWidth, safeHeight);
        targetCtx.globalAlpha = 0;
        targetCtx.fillStyle = "#ffffff";
        targetCtx.fillRect(0, 0, safeWidth, safeHeight);
        targetCtx.globalAlpha = 1;

        targetCtx.font = `${fontStyle} ${fontWeight} ${effectiveTextSize}px "${fontFamily || "Inter"}"`;
        targetCtx.textAlign = "center";
        targetCtx.textBaseline = "alphabetic";
        for (let i = -pixelCount; i < pixelCount; i += 1) {
          const pixelX = (safeWidth / 2) + (i * pixelWidth);
          targetCtx.globalAlpha = state.tallOverlay.opacityPixels / 100;
          targetCtx.fillStyle = (Math.abs(i % 2) === 1) ? state.tallOverlay.colorB : state.tallOverlay.colorA;
          targetCtx.fillRect(pixelX, pixelY, pixelWidth, pixelHeight);

          const labelNumber = i < 0 ? Math.abs(i) : i + 1;
          targetCtx.globalAlpha = state.tallOverlay.opacityText / 100;
          targetCtx.fillStyle = state.tallOverlay.textColor;
          const metrics = targetCtx.measureText(String(labelNumber));
          const textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
          const textY = pixelY + (pixelHeight * 0.5) + metrics.actualBoundingBoxAscent - (textHeight * 0.5);
          targetCtx.fillText(String(labelNumber), pixelX + (pixelWidth * 0.5), textY);
        }

        targetCtx.globalAlpha = 1;
        const centerLineWidth = safeWidth * 0.003125;
        targetCtx.fillStyle = "#e8e8e8";
        targetCtx.fillRect(
          (safeWidth / 2) - centerLineWidth,
          0,
          centerLineWidth,
          safeHeight
        );
      }

      function renderTallOverlayToContext(targetCanvas, targetCtx) {
        renderOverlayGenToCanvas(targetCanvas, targetCtx);
      }

      function drawTallEyeOverlay() {
        const show = state.displayVariant === "tall";
        eyeMeasureOverlayCanvas.classList.toggle("hidden", !show);
        eyeMeasureTextCanvas.classList.toggle("hidden", !show);
        eyeOverlayCtx.clearRect(0, 0, eyeMeasureOverlayCanvas.width, eyeMeasureOverlayCanvas.height);
        eyeTextCtx.clearRect(0, 0, eyeMeasureTextCanvas.width, eyeMeasureTextCanvas.height);
        if (!show) {
          return;
        }
        const sourceWidth = Math.min(EYE_PROJECTOR_SIZE.width, canvas.width);
        const sourceHeight = Math.min(EYE_PROJECTOR_SIZE.height, canvas.height);
        const sourceX = Math.floor((canvas.width - sourceWidth) * 0.5);
        const sourceY = Math.floor((canvas.height - sourceHeight) * 0.5);
        eyeOverlayCtx.imageSmoothingEnabled = false;
        eyeOverlayCtx.drawImage(
          canvas,
          sourceX,
          sourceY,
          sourceWidth,
          sourceHeight,
          0,
          0,
          eyeMeasureOverlayCanvas.width,
          eyeMeasureOverlayCanvas.height
        );
        eyeTextCtx.imageSmoothingEnabled = true;
        eyeTextCtx.imageSmoothingQuality = "high";
        renderOverlayGenToCanvas(eyeMeasureTextCanvas, eyeTextCtx, { overlayPreviewHack: true });
      }

      function exportTallOverlayImage() {
        updateTallOverlayFromControls();
        const exportCanvas = document.createElement("canvas");
        exportCanvas.width = state.tallOverlay.canvasWidth;
        exportCanvas.height = state.tallOverlay.canvasHeight;
        const exportCtx = exportCanvas.getContext("2d");
        exportCtx.imageSmoothingEnabled = true;
        exportCtx.imageSmoothingQuality = "high";
        renderTallOverlayToContext(exportCanvas, exportCtx);
        const link = document.createElement("a");
        link.href = exportCanvas.toDataURL("image/png");
        link.download = `eyemeasure-overlay-${exportCanvas.width}x${exportCanvas.height}.png`;
        link.click();
      }

      function resolutionForVariant(variant) {
        if (variant === "thin") {
          return { w: 350, h: state.baseHeight };
        }
        if (variant === "wide") {
          return { w: state.baseWidth, h: 300 };
        }
        if (variant === "tall") {
          return { w: TALL_RESOLUTION[0], h: TALL_RESOLUTION[1] };
        }
        return { w: state.baseWidth, h: state.baseHeight };
      }

      function mirrorToWaywallExport(mirror, variantWidth, variantHeight) {
        const colorkeys = {};
        for (let i = 0; i < mirror.keys.length; i += 1) {
          const key = normalizeColorKey(mirror.keys[i]);
          if (!key) {
            continue;
          }
          // Current editor only stores source key colors, so export identity mapping.
          colorkeys[key] = key;
        }
        return {
          x: Math.round((mirror.screenX / 100) * variantWidth),
          y: Math.round((mirror.screenY / 100) * variantHeight),
          w: Math.max(1, Math.round((mirror.screenW / 100) * variantWidth)),
          h: Math.max(1, Math.round((mirror.screenH / 100) * variantHeight)),
          colorkeys
        };
      }

      function buildWaywallExportResolution(variant) {
        const dims = resolutionForVariant(variant);
        const mirrors = state.mirrors
          .filter((mirror) => mirrorVisibleInVariant(mirror, variant))
          .map((mirror) => mirrorToWaywallExport(mirror, dims.w, dims.h));
        return {
          w: dims.w,
          h: dims.h,
          mirrors
        };
      }

      function buildWaywallExportInput() {
        const entries = [
          ["open_ninjabrain_bot", state.actionKeybinds.openNinjabrain],
          ["thin", state.actionKeybinds.thin],
          ["wide", state.actionKeybinds.wide],
          ["tall", state.actionKeybinds.tall]
        ];
        const input = {};
        for (let i = 0; i < entries.length; i += 1) {
          const [name, domCode] = entries[i];
          const mappedKey = domCodeToWaywallKey(domCode);
          if (mappedKey) {
            input[name] = mappedKey;
          }
        }
        return input;
      }

      function buildWaywallExportTheme() {
        const theme = {};
        if (state.theme.background_type === "image") {
          theme.background_png = state.theme.background_png || "";
        } else {
          theme.background = state.theme.background;
        }
        theme.cursor_theme = state.theme.cursor_theme || "";
        theme.ninb_anchor = state.theme.ninb_anchor_position || "";
        theme.ninb_opacity = state.theme.ninb_opacity;
        return theme;
      }

      function buildWaywallExport() {
        return {
          config: {
            input: buildWaywallExportInput(),
            theme: buildWaywallExportTheme(),
            window: {
              fullscreen_width: state.windowSettings.fullscreen_width,
              fullscreen_height: state.windowSettings.fullscreen_height
            }
          },
          resolutions: {
            preset: buildWaywallExportResolution("preset"),
            thin: buildWaywallExportResolution("thin"),
            wide: buildWaywallExportResolution("wide"),
            tall: buildWaywallExportResolution("tall")
          }
        };
      }

      function exportWaywallConfigJson() {
        const payload = buildWaywallExport();
        const json = `${JSON.stringify(payload, null, 2)}\n`;
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "waywall-config.json";
        link.click();
        URL.revokeObjectURL(url);
      }

      function updateZoomUi() {
        const zoomPercent = Math.round(state.screenZoom * 100);
        zoomLevelText.textContent = `${zoomPercent}%`;
        zoomOutButton.disabled = state.screenZoom <= (MIN_SCREEN_ZOOM + 0.001);
        zoomInButton.disabled = state.screenZoom >= (MAX_SCREEN_ZOOM - 0.001);
        zoomResetButton.disabled = state.screenZoom <= (MIN_SCREEN_ZOOM + 0.001) &&
          Math.abs(state.screenPanX) < 0.5 &&
          Math.abs(state.screenPanY) < 0.5;
      }

      function computeDisplayMetrics(zoom) {
        const safeWindowWidth = Math.max(1, state.windowWidth);
        const safeWindowHeight = Math.max(1, state.windowHeight);
        const containScale = Math.min(
          1,
          state.baseWidth / safeWindowWidth,
          state.baseHeight / safeWindowHeight
        );
        const scale = state.viewportCropMode === "crop" ? 1 : containScale;
        const unzoomedDisplayWidthPercent = (safeWindowWidth * scale * 100) / Math.max(1, state.baseWidth);
        const unzoomedDisplayHeightPercent = (safeWindowHeight * scale * 100) / Math.max(1, state.baseHeight);
        const displayWidthPercent = unzoomedDisplayWidthPercent * zoom;
        const displayHeightPercent = unzoomedDisplayHeightPercent * zoom;
        const viewportWidthPx = Math.max(1, viewportWrap.clientWidth || state.baseWidth);
        const viewportHeightPx = Math.max(1, viewportWrap.clientHeight || state.baseHeight);
        const displayWidthPx = viewportWidthPx * displayWidthPercent / 100;
        const displayHeightPx = viewportHeightPx * displayHeightPercent / 100;
        return {
          displayWidthPercent,
          displayHeightPercent,
          viewportWidthPx,
          viewportHeightPx,
          displayWidthPx,
          displayHeightPx
        };
      }

      function getScreenPanLimits(zoom = state.screenZoom) {
        const metrics = computeDisplayMetrics(zoom);
        return {
          maxPanX: Math.max(0, (metrics.displayWidthPx - metrics.viewportWidthPx) * 0.5),
          maxPanY: Math.max(0, (metrics.displayHeightPx - metrics.viewportHeightPx) * 0.5)
        };
      }

      function setScreenZoom(nextZoom, resetPan = false, anchorClientX = null, anchorClientY = null) {
        const stepped = Math.round(nextZoom / SCREEN_ZOOM_STEP) * SCREEN_ZOOM_STEP;
        const clampedZoom = clamp(stepped, MIN_SCREEN_ZOOM, MAX_SCREEN_ZOOM);
        const unchanged = Math.abs(clampedZoom - state.screenZoom) < 0.001;
        if (unchanged && !resetPan) {
          return;
        }

        const prevMetrics = computeDisplayMetrics(state.screenZoom);
        let nextPanX = state.screenPanX;
        let nextPanY = state.screenPanY;

        const hasAnchor = Number.isFinite(anchorClientX) && Number.isFinite(anchorClientY);
        if (!resetPan && clampedZoom > MIN_SCREEN_ZOOM + 0.001 && hasAnchor) {
          const bounds = viewportWrap.getBoundingClientRect();
          const anchorX = clamp(anchorClientX - bounds.left, 0, Math.max(1, bounds.width));
          const anchorY = clamp(anchorClientY - bounds.top, 0, Math.max(1, bounds.height));
          const centerX = (prevMetrics.viewportWidthPx * 0.5) + state.screenPanX;
          const centerY = (prevMetrics.viewportHeightPx * 0.5) + state.screenPanY;
          const offsetX = anchorX - centerX;
          const offsetY = anchorY - centerY;
          const nextMetrics = computeDisplayMetrics(clampedZoom);
          const ratioX = nextMetrics.displayWidthPx / Math.max(1, prevMetrics.displayWidthPx);
          const ratioY = nextMetrics.displayHeightPx / Math.max(1, prevMetrics.displayHeightPx);
          nextPanX = anchorX - (offsetX * ratioX) - (nextMetrics.viewportWidthPx * 0.5);
          nextPanY = anchorY - (offsetY * ratioY) - (nextMetrics.viewportHeightPx * 0.5);
        } else if (resetPan || clampedZoom <= MIN_SCREEN_ZOOM + 0.001) {
          if (state.screenPanDrag) {
            endScreenPanDrag();
          }
          nextPanX = 0;
          nextPanY = 0;
        }

        state.screenZoom = clampedZoom;
        state.screenPanX = nextPanX;
        state.screenPanY = nextPanY;
        updateViewportLayout();
        updateStatusText();
      }

      function updateViewportLayout() {
        viewportWrap.style.setProperty("--preview-base-width", `${state.baseWidth}px`);
        viewportWrap.style.setProperty("--preview-aspect", `${state.baseWidth} / ${state.baseHeight}`);

        const metrics = computeDisplayMetrics(state.screenZoom);
        const safeWindowWidth = Math.max(1, state.windowWidth);
        const safeWindowHeight = Math.max(1, state.windowHeight);
        const scaleX = metrics.displayWidthPx / safeWindowWidth;
        const scaleY = metrics.displayHeightPx / safeWindowHeight;
        const displayScale = Math.min(scaleX, scaleY);
        const dpr = Math.max(1, window.devicePixelRatio || 1);
        const minCssPixel = 1 / dpr;
        const displayWidthPx = Math.max(minCssPixel, snapCssPixel(safeWindowWidth * displayScale));
        const displayHeightPx = Math.max(minCssPixel, snapCssPixel(safeWindowHeight * displayScale));
        const overlayVisible = state.displayVariant === "tall";
        const overlayGapPx = overlayVisible ? 10 : 0;
        const centeredCanvasLeftPx = snapCssPixel((metrics.viewportWidthPx - displayWidthPx) * 0.5);
        const targetOverlayHeightPx = overlayVisible
          ? Math.max(minCssPixel, snapCssPixel(displayHeightPx * TALL_PROJECTOR_HEIGHT_RATIO))
          : 0;
        const targetOverlayWidthPx = overlayVisible
          ? Math.max(minCssPixel, snapCssPixel(targetOverlayHeightPx * TALL_PROJECTOR_ASPECT))
          : 0;
        const availableLeftPx = Math.max(minCssPixel, snapCssPixel(centeredCanvasLeftPx - overlayGapPx));
        const overlayDisplayWidthPx = overlayVisible
          ? clamp(targetOverlayWidthPx, EYE_PROJECTOR_SIZE.width, availableLeftPx)
          : 0;
        const overlayDisplayHeightPx = overlayVisible
          ? Math.max(minCssPixel, snapCssPixel(overlayDisplayWidthPx / TALL_PROJECTOR_ASPECT))
          : 0;
        const canvasLeftPx = overlayVisible
          ? Math.max(centeredCanvasLeftPx, overlayDisplayWidthPx + overlayGapPx)
          : centeredCanvasLeftPx;
        const canvasTopPx = snapCssPixel((metrics.viewportHeightPx - displayHeightPx) * 0.5);
        const overlayLeftPx = overlayVisible ? snapCssPixel(canvasLeftPx - overlayGapPx - overlayDisplayWidthPx) : canvasLeftPx;
        const overlayTopPx = overlayVisible
          ? snapCssPixel(canvasTopPx + ((displayHeightPx - overlayDisplayHeightPx) * 0.5))
          : canvasTopPx;

        viewportWrap.style.setProperty("--canvas-display-width", `${displayWidthPx}px`);
        viewportWrap.style.setProperty("--canvas-display-height", `${displayHeightPx}px`);
        viewportWrap.style.setProperty("--canvas-left", `${canvasLeftPx}px`);
        viewportWrap.style.setProperty("--canvas-top", `${canvasTopPx}px`);
        viewportWrap.style.setProperty("--overlay-display-width", `${overlayDisplayWidthPx}px`);
        viewportWrap.style.setProperty("--overlay-display-height", `${overlayDisplayHeightPx}px`);
        viewportWrap.style.setProperty("--overlay-left", `${overlayLeftPx}px`);
        viewportWrap.style.setProperty("--overlay-top", `${overlayTopPx}px`);
        canvas.style.imageRendering = "pixelated";

        const overlayBufferWidth = Math.max(1, Math.round(overlayDisplayWidthPx));
        const overlayBufferHeight = Math.max(1, Math.round(overlayDisplayHeightPx));
        if (eyeMeasureOverlayCanvas.width !== overlayBufferWidth || eyeMeasureOverlayCanvas.height !== overlayBufferHeight) {
          eyeMeasureOverlayCanvas.width = overlayBufferWidth;
          eyeMeasureOverlayCanvas.height = overlayBufferHeight;
        }
        if (eyeMeasureTextCanvas.width !== overlayBufferWidth || eyeMeasureTextCanvas.height !== overlayBufferHeight) {
          eyeMeasureTextCanvas.width = overlayBufferWidth;
          eyeMeasureTextCanvas.height = overlayBufferHeight;
          eyeTextCtx.imageSmoothingEnabled = true;
          eyeTextCtx.imageSmoothingQuality = "high";
        }

        const { maxPanX, maxPanY } = getScreenPanLimits();

        state.screenPanX = clamp(state.screenPanX, -maxPanX, maxPanX);
        state.screenPanY = clamp(state.screenPanY, -maxPanY, maxPanY);

        if (state.screenZoom <= MIN_SCREEN_ZOOM + 0.001 && maxPanX < 0.5 && maxPanY < 0.5) {
          state.screenPanX = 0;
          state.screenPanY = 0;
        }

        viewportWrap.style.setProperty("--canvas-pan-x", `${snapCssPixel(state.screenPanX)}px`);
        viewportWrap.style.setProperty("--canvas-pan-y", `${snapCssPixel(state.screenPanY)}px`);
        updateZoomUi();
        renderMirrorOverlays();
        drawMirrorOverlays();
        updateMirrorSelectionBox();
      }

      function refreshViewportLayoutAndMirrors() {
        updateViewportLayout();
        renderMirrorOverlays();
        updateMirrorSelectionBox();
      }

      function syncPresetFromResolution() {
        const base = `${state.baseWidth}x${state.baseHeight}`;
        const match = PRESETS.find((preset) => `${preset[1]}x${preset[2]}` === base);
        presetSelect.value = match ? base : "custom";
      }

      function setDisplayVariant(variant) {
        const next = (variant === "wide" || variant === "thin" || variant === "tall") ? variant : "preset";
        state.displayVariant = next;
      }

      function mirrorsVisibleInCurrentMode() {
        return true;
      }

      function normalizeMirrorVisibility(raw) {
        return (raw === "wide" || raw === "thin" || raw === "tall" || raw === "all")
          ? raw
          : "all";
      }

      function visibilityForNewMirror() {
        return MIRROR_VISIBLE_VARIANTS.has(state.displayVariant)
          ? state.displayVariant
          : "all";
      }

      function mirrorVisibleInVariant(mirror, variant = state.displayVariant) {
        if (!mirror || typeof mirror !== "object") {
          return false;
        }
        const visibility = normalizeMirrorVisibility(mirror.visibleIn);
        return visibility === "all" || visibility === variant;
      }

      function getMirrorsForCurrentVariant() {
        return state.mirrors.filter((mirror) => mirrorVisibleInVariant(mirror));
      }

      function makeMirrorId() {
        return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
      }

      function normalizeMirrorRect(raw) {
        const maxW = Math.max(1, state.windowWidth);
        const maxH = Math.max(1, state.windowHeight);
        const x = clamp(Math.floor(parseMirrorNumber(raw.x, 0)), 0, maxW - 1);
        const y = clamp(Math.floor(parseMirrorNumber(raw.y, 0)), 0, maxH - 1);
        const w = clamp(Math.round(parseMirrorNumber(raw.w, 1)), 1, maxW - x);
        const h = clamp(Math.round(parseMirrorNumber(raw.h, 1)), 1, maxH - y);
        return { x, y, w, h };
      }

      function defaultMirrorPlacement(rect, index) {
        const viewportW = Math.max(1, state.windowWidth);
        const viewportH = Math.max(1, state.windowHeight);
        const offset = index * 2.5;
        const defaultW = (rect.w / viewportW) * 100;
        const defaultH = (rect.h / viewportH) * 100;
        const maxVisibleX = Math.max(0, 100 - defaultW);
        const maxVisibleY = Math.max(0, 100 - defaultH);
        const screenX = clamp(((rect.x / viewportW) * 100) + offset, 0, maxVisibleX);
        const screenY = clamp(((rect.y / viewportH) * 100) + offset, 0, maxVisibleY);
        return {
          screenX,
          screenY,
          screenW: defaultW,
          screenH: defaultH
        };
      }

      function normalizeMirrorPlacement(raw, rect, index = 0) {
        const fallback = defaultMirrorPlacement(rect, index);
        const screenW = clamp(parseMirrorNumber(raw.screenW, fallback.screenW), MIRROR_MIN_SIZE, MIRROR_SIZE_LIMIT);
        const screenH = clamp(parseMirrorNumber(raw.screenH, fallback.screenH), MIRROR_MIN_SIZE, MIRROR_SIZE_LIMIT);
        const screenX = clamp(parseMirrorNumber(raw.screenX, fallback.screenX), -MIRROR_POSITION_LIMIT, MIRROR_POSITION_LIMIT);
        const screenY = clamp(parseMirrorNumber(raw.screenY, fallback.screenY), -MIRROR_POSITION_LIMIT, MIRROR_POSITION_LIMIT);
        return {
          screenX,
          screenY,
          screenW,
          screenH
        };
      }

      function normalizeMirror(raw, index = 0) {
        const rect = normalizeMirrorRect(raw);
        const placement = normalizeMirrorPlacement(raw, rect, index);
        return {
          id: raw.id || makeMirrorId(),
          x: rect.x,
          y: rect.y,
          w: rect.w,
          h: rect.h,
          screenX: placement.screenX,
          screenY: placement.screenY,
          screenW: placement.screenW,
          screenH: placement.screenH,
          visibleIn: normalizeMirrorVisibility(raw.visibleIn),
          keys: normalizeMirrorKeys(raw.keys, MAX_MIRROR_COLOR_KEYS)
        };
      }

      function normalizeStoredMirrorRect(raw) {
        const maxW = Math.max(1, MAX_WIDTH);
        const maxH = Math.max(1, MAX_HEIGHT);
        const x = clamp(Math.floor(parseMirrorNumber(raw?.x, 0)), 0, maxW - 1);
        const y = clamp(Math.floor(parseMirrorNumber(raw?.y, 0)), 0, maxH - 1);
        const w = clamp(Math.round(parseMirrorNumber(raw?.w, 1)), 1, maxW - x);
        const h = clamp(Math.round(parseMirrorNumber(raw?.h, 1)), 1, maxH - y);
        return { x, y, w, h };
      }

      function setMirrorInputValues(rect) {
        mirrorXInput.value = String(rect.x);
        mirrorYInput.value = String(rect.y);
        mirrorWInput.value = String(rect.w);
        mirrorHInput.value = String(rect.h);
      }

      function getMirrorById(mirrorId) {
        return state.mirrors.find((item) => item.id === mirrorId) || null;
      }

      function addMirrorColorKey(mirror, rawColor) {
        const normalized = normalizeColorKey(rawColor);
        console.log("[mirror-pick] addMirrorColorKey input", {
          mirrorId: mirror?.id,
          rawColor,
          normalized,
          existingKeys: Array.isArray(mirror?.keys) ? [...mirror.keys] : null
        });
        if (!normalized) {
          console.log("[mirror-pick] addMirrorColorKey rejected: invalid color");
          return false;
        }
        if (mirror.keys.includes(normalized)) {
          console.log("[mirror-pick] addMirrorColorKey rejected: duplicate color", normalized);
          return false;
        }
        if (mirror.keys.length >= MAX_MIRROR_COLOR_KEYS) {
          console.log("[mirror-pick] addMirrorColorKey rejected: max keys reached");
          return false;
        }
        mirror.keys = [...mirror.keys, normalized];
        console.log("[mirror-pick] addMirrorColorKey success", { mirrorId: mirror.id, keys: [...mirror.keys] });
        saveMirrorsToStorage();
        renderMirrorPanels();
        updateStatusText();
        return true;
      }

      function sampleCanvasColor(x, y) {
        console.log("[mirror-pick] sampleCanvasColor request", { x, y, canvasW: canvas.width, canvasH: canvas.height });
        if (!Number.isFinite(x) || !Number.isFinite(y)) {
          console.log("[mirror-pick] sampleCanvasColor rejected: non-finite coords");
          return null;
        }
        const sx = Math.floor(x);
        const sy = Math.floor(y);
        if (sx < 0 || sy < 0 || sx >= canvas.width || sy >= canvas.height) {
          console.log("[mirror-pick] sampleCanvasColor rejected: out of bounds", { sx, sy });
          return null;
        }
        try {
          const data = ctx.getImageData(sx, sy, 1, 1).data;
          if (state.mirrorKeyingBlocked) {
            state.mirrorKeyingBlocked = false;
            updateStatusText();
          }
          const color = rgbToHex(data[0], data[1], data[2]);
          console.log("[mirror-pick] sampleCanvasColor success", { sx, sy, color, rgba: [data[0], data[1], data[2], data[3]] });
          return color;
        } catch (error) {
          console.log("[mirror-pick] sampleCanvasColor error", error);
          if (!state.mirrorKeyingBlocked) {
            state.mirrorKeyingBlocked = true;
            updateStatusText();
          }
          return null;
        }
      }

      function sampleMirrorSourceColorFromEvent(mirror, overlay, event) {
        const bounds = overlay.getBoundingClientRect();
        const width = Math.max(1, bounds.width);
        const height = Math.max(1, bounds.height);
        const ux = clamp((event.clientX - bounds.left) / width, 0, 1);
        const uy = clamp((event.clientY - bounds.top) / height, 0, 1);
        const rect = normalizeMirrorRect(mirror);
        const px = rect.x + (ux * Math.max(0, rect.w - 1));
        const py = rect.y + (uy * Math.max(0, rect.h - 1));
        console.log("[mirror-pick] sampleMirrorSourceColorFromEvent", {
          mirrorId: mirror?.id,
          overlayBounds: { left: bounds.left, top: bounds.top, width, height },
          ux,
          uy,
          rect,
          sample: { px, py }
        });
        return sampleCanvasColor(px, py);
      }

      function sampleMirrorOverlayColorFromEvent(overlay, event) {
        const overlayCanvas = overlay.querySelector(".mirror-overlay-canvas");
        if (!overlayCanvas) {
          return null;
        }
        const overlayCtx = getMirrorOverlayContext(overlayCanvas);
        if (!overlayCtx) {
          return null;
        }
        const bounds = overlay.getBoundingClientRect();
        const width = Math.max(1, bounds.width);
        const height = Math.max(1, bounds.height);
        const ux = clamp((event.clientX - bounds.left) / width, 0, 1);
        const uy = clamp((event.clientY - bounds.top) / height, 0, 1);
        const sx = clamp(Math.floor(ux * Math.max(1, overlayCanvas.width - 1)), 0, Math.max(0, overlayCanvas.width - 1));
        const sy = clamp(Math.floor(uy * Math.max(1, overlayCanvas.height - 1)), 0, Math.max(0, overlayCanvas.height - 1));
        try {
          const data = overlayCtx.getImageData(sx, sy, 1, 1).data;
          if (data[3] === 0) {
            console.log("[mirror-pick] sampleMirrorOverlayColorFromEvent transparent pixel", { sx, sy });
            return null;
          }
          const color = rgbToHex(data[0], data[1], data[2]);
          console.log("[mirror-pick] sampleMirrorOverlayColorFromEvent success", {
            sx,
            sy,
            color,
            rgba: [data[0], data[1], data[2], data[3]],
            overlaySize: { w: overlayCanvas.width, h: overlayCanvas.height }
          });
          return color;
        } catch (error) {
          console.log("[mirror-pick] sampleMirrorOverlayColorFromEvent error", error);
          return null;
        }
      }

      function saveMirrorsToStorage() {
        try {
          const payload = state.mirrors.map(({ x, y, w, h, screenX, screenY, screenW, screenH, visibleIn, keys }) => ({
            x, y, w, h, screenX, screenY, screenW, screenH, visibleIn, keys
          }));
          localStorage.setItem(MIRRORS_STORAGE_KEY, JSON.stringify(payload));
        } catch (error) {
          // Ignore storage errors (private mode/full quota).
        }
      }

      function loadMirrorsFromStorage() {
        try {
          const raw = localStorage.getItem(MIRRORS_STORAGE_KEY);
          if (!raw) {
            state.mirrors = [];
            return;
          }
          const parsed = JSON.parse(raw);
          if (!Array.isArray(parsed)) {
            state.mirrors = [];
            return;
          }
          state.mirrors = parsed
            .filter((item) => item && typeof item === "object")
            .map((item, index) => {
              if (mirrorVisibleInVariant(item)) {
                return normalizeMirror(item, index);
              }
              const rect = normalizeStoredMirrorRect(item);
              const placement = normalizeMirrorPlacement(item, rect, index);
              return {
                id: item.id || makeMirrorId(),
                x: rect.x,
                y: rect.y,
                w: rect.w,
                h: rect.h,
                screenX: placement.screenX,
                screenY: placement.screenY,
                screenW: placement.screenW,
                screenH: placement.screenH,
                visibleIn: normalizeMirrorVisibility(item.visibleIn),
                keys: normalizeMirrorKeys(item.keys, MAX_MIRROR_COLOR_KEYS)
              };
            });
        } catch (error) {
          state.mirrors = [];
        }
      }

      function getMirrorOverlayContext(overlayCanvas) {
        const cached = mirrorOverlayContexts.get(overlayCanvas);
        if (cached) {
          return cached;
        }
        const created = overlayCanvas.getContext("2d", { willReadFrequently: true });
        if (!created) {
          return null;
        }
        created.imageSmoothingEnabled = false;
        mirrorOverlayContexts.set(overlayCanvas, created);
        return created;
      }

      function getCanvasViewportMetrics() {
        const canvasBounds = canvas.getBoundingClientRect();
        const viewportBounds = viewportWrap.getBoundingClientRect();
        return {
          left: canvasBounds.left - viewportBounds.left,
          top: canvasBounds.top - viewportBounds.top,
          width: Math.max(1, canvasBounds.width),
          height: Math.max(1, canvasBounds.height)
        };
      }

      function renderMirrorOverlays() {
        mirrorOverlayLayer.innerHTML = "";
        const visibleMirrors = getMirrorsForCurrentVariant();
        const canvasMetrics = getCanvasViewportMetrics();
        const dpr = Math.max(1, window.devicePixelRatio || 1);
        const minCssPixel = 1 / dpr;
        const colorPickTargetId = state.mirrorColorPick
          ? state.mirrorColorPick.mirrorId
          : "";
        for (let i = 0; i < visibleMirrors.length; i += 1) {
          const mirror = visibleMirrors[i];
          const overlay = document.createElement("div");
          overlay.className = "mirror-overlay";
          overlay.classList.toggle("keyed", Array.isArray(mirror.keys) && mirror.keys.length > 0);
          overlay.classList.toggle("color-picking-target", colorPickTargetId === mirror.id);
          overlay.dataset.mirrorId = mirror.id;
          const leftPx = snapCssPixel(canvasMetrics.left + ((mirror.screenX / 100) * canvasMetrics.width));
          const topPx = snapCssPixel(canvasMetrics.top + ((mirror.screenY / 100) * canvasMetrics.height));
          const widthPx = Math.max(minCssPixel, snapCssPixel((mirror.screenW / 100) * canvasMetrics.width));
          const heightPx = Math.max(minCssPixel, snapCssPixel((mirror.screenH / 100) * canvasMetrics.height));
          overlay.style.left = `${leftPx}px`;
          overlay.style.top = `${topPx}px`;
          overlay.style.width = `${widthPx}px`;
          overlay.style.height = `${heightPx}px`;

          const overlayCanvas = document.createElement("canvas");
          overlayCanvas.className = "mirror-overlay-canvas";
          overlayCanvas.width = Math.max(1, mirror.w);
          overlayCanvas.height = Math.max(1, mirror.h);
          getMirrorOverlayContext(overlayCanvas);
          overlay.appendChild(overlayCanvas);

          const handles = ["n", "e", "s", "w"];
          for (let handleIndex = 0; handleIndex < handles.length; handleIndex += 1) {
            const handle = handles[handleIndex];
            const resizer = document.createElement("div");
            resizer.className = `mirror-overlay-resizer mirror-overlay-resizer-${handle}`;
            resizer.dataset.handle = handle;
            overlay.appendChild(resizer);
          }

          mirrorOverlayLayer.appendChild(overlay);
        }
      }

      function renderMirrorPanels() {
        mirrorList.innerHTML = "";
        const visibleMirrors = getMirrorsForCurrentVariant();
        const showTallOverlayAsMirror = state.displayVariant === "tall";
        if (tallOverlaySettingsHome) {
          tallOverlaySettingsHome.hidden = !showTallOverlayAsMirror;
        }

        if (showTallOverlayAsMirror && tallOverlaySettingsHost) {
          const row = document.createElement("div");
          row.className = "mirror-item";

          const main = document.createElement("div");
          main.className = "mirror-main";

          const label = document.createElement("span");
          label.className = "mirror-label";
          label.textContent = "#0 Tall overlay";
          main.appendChild(label);
          row.appendChild(main);

          row.appendChild(tallOverlaySettingsHost);
          mirrorList.appendChild(row);
        } else if (tallOverlaySettingsHost && tallOverlaySettingsHome && tallOverlaySettingsHost.parentElement !== tallOverlaySettingsHome) {
          tallOverlaySettingsHome.appendChild(tallOverlaySettingsHost);
        }

        if (state.mirrorColorPick && !visibleMirrors.some((mirror) => mirror.id === state.mirrorColorPick.mirrorId)) {
          state.mirrorColorPick = null;
          updateMirrorSelectionStatus();
        }

        if (!visibleMirrors.length) {
          const empty = document.createElement("div");
          empty.className = "mirror-empty";
          empty.textContent = state.mirrors.length ? "No mirrors in this view." : "No mirrors yet.";
          mirrorList.appendChild(empty);
          renderMirrorOverlays();
          return;
        }

        for (let i = 0; i < visibleMirrors.length; i += 1) {
          const mirror = visibleMirrors[i];
          const row = document.createElement("div");
          row.className = "mirror-item";

          const main = document.createElement("div");
          main.className = "mirror-main";

          const label = document.createElement("span");
          label.className = "mirror-label";
          label.textContent =
            `#${i + 1} src:${mirror.x},${mirror.y},${mirror.w}x${mirror.h} ` +
            `pos:${mirror.screenX.toFixed(1)}%,${mirror.screenY.toFixed(1)}%`;
          main.appendChild(label);

          const actions = document.createElement("div");
          actions.className = "mirror-actions";

          const centerButton = document.createElement("button");
          centerButton.type = "button";
          centerButton.textContent = "Center";
          centerButton.addEventListener("click", () => {
            mirror.screenX = clamp((100 - mirror.screenW) * 0.5, -MIRROR_POSITION_LIMIT, MIRROR_POSITION_LIMIT);
            mirror.screenY = clamp((100 - mirror.screenH) * 0.5, -MIRROR_POSITION_LIMIT, MIRROR_POSITION_LIMIT);
            saveMirrorsToStorage();
            renderMirrorPanels();
            updateStatusText();
          });
          actions.appendChild(centerButton);

          const removeButton = document.createElement("button");
          removeButton.type = "button";
          removeButton.textContent = "Remove";
          removeButton.addEventListener("click", () => {
            state.mirrors = state.mirrors.filter((item) => item.id !== mirror.id);
            saveMirrorsToStorage();
            renderMirrorPanels();
            updateStatusText();
          });
          actions.appendChild(removeButton);
          main.appendChild(actions);
          row.appendChild(main);

          const keyControls = document.createElement("div");
          keyControls.className = "mirror-key-controls";

          const keyInput = document.createElement("input");
          keyInput.type = "color";
          keyInput.value = mirror.keys[0] || "#00ff00";
          keyInput.title = "Color key";
          keyControls.appendChild(keyInput);

          const addKeyButton = document.createElement("button");
          addKeyButton.type = "button";
          addKeyButton.textContent = "Add Key";
          addKeyButton.disabled = mirror.keys.length >= MAX_MIRROR_COLOR_KEYS;
          addKeyButton.addEventListener("click", () => {
            addMirrorColorKey(mirror, keyInput.value);
          });
          keyControls.appendChild(addKeyButton);

          const pickCanvasButton = document.createElement("button");
          pickCanvasButton.type = "button";
          pickCanvasButton.textContent = "Pick Canvas";
          pickCanvasButton.addEventListener("click", () => {
            setMirrorColorPickMode({ mirrorId: mirror.id });
          });
          keyControls.appendChild(pickCanvasButton);

          const clearKeysButton = document.createElement("button");
          clearKeysButton.type = "button";
          clearKeysButton.textContent = "Clear Keys";
          clearKeysButton.disabled = mirror.keys.length === 0;
          clearKeysButton.addEventListener("click", () => {
            if (!mirror.keys.length) {
              return;
            }
            mirror.keys = [];
            saveMirrorsToStorage();
            renderMirrorPanels();
            updateStatusText();
          });
          keyControls.appendChild(clearKeysButton);

          const keyCount = document.createElement("span");
          keyCount.className = "mirror-key-count";
          keyCount.textContent = `${mirror.keys.length}/${MAX_MIRROR_COLOR_KEYS} keys`;
          keyControls.appendChild(keyCount);

          row.appendChild(keyControls);

          if (mirror.keys.length) {
            const keyList = document.createElement("div");
            keyList.className = "mirror-key-list";

            for (let keyIndex = 0; keyIndex < mirror.keys.length; keyIndex += 1) {
              const key = mirror.keys[keyIndex];
              const chip = document.createElement("span");
              chip.className = "mirror-key-chip";

              const swatch = document.createElement("span");
              swatch.className = "mirror-key-swatch";
              swatch.style.setProperty("--key-color", key);
              chip.appendChild(swatch);

              const text = document.createElement("span");
              text.textContent = key.toUpperCase();
              chip.appendChild(text);

              const removeKeyButton = document.createElement("button");
              removeKeyButton.type = "button";
              removeKeyButton.className = "mirror-key-remove";
              removeKeyButton.textContent = "x";
              removeKeyButton.addEventListener("click", () => {
                mirror.keys = mirror.keys.filter((_, idx) => idx !== keyIndex);
                saveMirrorsToStorage();
                renderMirrorPanels();
                updateStatusText();
              });
              chip.appendChild(removeKeyButton);

              keyList.appendChild(chip);
            }
            row.appendChild(keyList);
          }

          mirrorList.appendChild(row);
        }

        renderMirrorOverlays();
        drawMirrorOverlays();
      }

      function applyMirrorColorKeys(overlayCtx, width, height, keys) {
        if (!Array.isArray(keys) || !keys.length) {
          return;
        }
        const keyColors = [];
        const seen = new Set();
        for (let i = 0; i < keys.length; i += 1) {
          const tuple = colorKeyToRgbTuple(keys[i]);
          if (tuple) {
            const variants = [tuple];
            for (let variantIndex = 0; variantIndex < variants.length; variantIndex += 1) {
              const variant = variants[variantIndex];
              const signature = `${variant.r},${variant.g},${variant.b}`;
              if (seen.has(signature)) {
                continue;
              }
              seen.add(signature);
              keyColors.push(variant);
            }
          }
        }
        if (!keyColors.length) {
          return;
        }
        try {
          const imageData = overlayCtx.getImageData(0, 0, width, height);
          const data = imageData.data;
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            let matched = false;
            for (let k = 0; k < keyColors.length; k += 1) {
              const key = keyColors[k];
              if (
                Math.abs(key.r - r) <= MIRROR_KEY_TOLERANCE &&
                Math.abs(key.g - g) <= MIRROR_KEY_TOLERANCE &&
                Math.abs(key.b - b) <= MIRROR_KEY_TOLERANCE
              ) {
                matched = true;
                break;
              }
            }
            if (!matched) {
              data[i + 3] = 0;
            }
          }
          overlayCtx.putImageData(imageData, 0, 0);
          if (state.mirrorKeyingBlocked) {
            state.mirrorKeyingBlocked = false;
            updateStatusText();
          }
        } catch (error) {
          console.log("[mirror-pick] applyMirrorColorKeys error", error);
          // Fail-safe: if keying cannot read pixels, don't leave the unkeyed image visible.
          overlayCtx.clearRect(0, 0, width, height);
          if (!state.mirrorKeyingBlocked) {
            state.mirrorKeyingBlocked = true;
            updateStatusText();
          }
        }
      }

      function drawMirrorOverlays() {
        const visible = mirrorsVisibleInCurrentMode();
        mirrorOverlayLayer.classList.toggle("hidden", !visible);
        if (!visible || !state.mirrors.length) {
          return;
        }

        const overlays = mirrorOverlayLayer.querySelectorAll(".mirror-overlay");
        for (let i = 0; i < overlays.length; i += 1) {
          const overlay = overlays[i];
          const mirror = state.mirrors.find((item) => item.id === overlay.dataset.mirrorId);
          if (!mirror) {
            continue;
          }
          const overlayCanvas = overlay.querySelector(".mirror-overlay-canvas");
          if (!overlayCanvas) {
            continue;
          }
          const overlayCtx = getMirrorOverlayContext(overlayCanvas);
          if (!overlayCtx) {
            continue;
          }
          const rect = normalizeMirrorRect(mirror);
          overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
          overlayCtx.drawImage(
            canvas,
            rect.x,
            rect.y,
            rect.w,
            rect.h,
            0,
            0,
            overlayCanvas.width,
            overlayCanvas.height
          );
          applyMirrorColorKeys(overlayCtx, overlayCanvas.width, overlayCanvas.height, mirror.keys);
        }
      }

      function addMirror(rect) {
        const normalized = normalizeMirror({
          ...rect,
          visibleIn: visibilityForNewMirror()
        }, state.mirrors.length);
        state.mirrors.push(normalized);
        setMirrorInputValues(normalized);
        saveMirrorsToStorage();
        renderMirrorPanels();
        updateStatusText();
      }

      function clearAllMirrors() {
        state.mirrors = [];
        saveMirrorsToStorage();
        renderMirrorPanels();
        updateStatusText();
      }

      function clampMirrorsAfterResolutionChange() {
        if (!state.mirrors.length) {
          return;
        }
        let changed = false;
        state.mirrors = state.mirrors.map((mirror, index) => {
          if (!mirrorVisibleInVariant(mirror)) {
            const normalizedVisibility = normalizeMirrorVisibility(mirror.visibleIn);
            const mirrorKeys = Array.isArray(mirror.keys) ? mirror.keys : [];
            const normalizedKeys = normalizeMirrorKeys(mirror.keys, MAX_MIRROR_COLOR_KEYS);
            const normalized = {
              ...mirror,
              id: mirror.id || makeMirrorId(),
              visibleIn: normalizedVisibility,
              keys: normalizedKeys
            };
            if (
              normalized.id !== mirror.id ||
              normalized.visibleIn !== mirror.visibleIn ||
              !mirrorKeysEqual(normalized.keys, mirrorKeys)
            ) {
              changed = true;
            }
            return normalized;
          }

          const normalized = normalizeMirror(mirror, index);
          const mirrorKeys = Array.isArray(mirror.keys) ? mirror.keys : [];
          if (
            normalized.x !== mirror.x ||
            normalized.y !== mirror.y ||
            normalized.w !== mirror.w ||
            normalized.h !== mirror.h ||
            normalized.screenX !== mirror.screenX ||
            normalized.screenY !== mirror.screenY ||
            normalized.screenW !== mirror.screenW ||
            normalized.screenH !== mirror.screenH ||
            normalized.visibleIn !== normalizeMirrorVisibility(mirror.visibleIn) ||
            !mirrorKeysEqual(normalized.keys, mirrorKeys)
          ) {
            changed = true;
          }
          return normalized;
        });
        if (changed) {
          saveMirrorsToStorage();
          renderMirrorPanels();
        }
      }

      function startScreenPanDrag(event) {
        const { maxPanX, maxPanY } = getScreenPanLimits();
        const canPan = maxPanX > 0.5 || maxPanY > 0.5;
        if (event.button !== 1 || !canPan) {
          return false;
        }
        if (
          state.mirrorSelectionMode ||
          state.mirrorSelectionDrag ||
          state.mirrorColorPick ||
          state.mirrorOverlayDrag ||
          state.mirrorOverlayResize
        ) {
          return false;
        }
        state.screenPanDrag = {
          startClientX: event.clientX,
          startClientY: event.clientY,
          startPanX: state.screenPanX,
          startPanY: state.screenPanY
        };
        viewportWrap.classList.add("panning");
        return true;
      }

      function updateScreenPanDrag(event) {
        if (!state.screenPanDrag) {
          return;
        }
        const drag = state.screenPanDrag;
        state.screenPanX = drag.startPanX + (event.clientX - drag.startClientX);
        state.screenPanY = drag.startPanY + (event.clientY - drag.startClientY);
        updateViewportLayout();
      }

      function endScreenPanDrag() {
        if (!state.screenPanDrag) {
          return;
        }
        state.screenPanDrag = null;
        viewportWrap.classList.remove("panning");
        updateStatusText();
      }

      function setMirrorColorPickMode(nextMode) {
        let normalized = null;
        if (nextMode && typeof nextMode === "object") {
          const mirror = getMirrorById(nextMode.mirrorId);
          if (mirror) {
            normalized = {
              mirrorId: mirror.id
            };
          }
        }

        state.mirrorColorPick = normalized;

        if (normalized) {
          state.mirrorSelectionMode = false;
          state.mirrorSelectionDrag = null;
          if (state.screenPanDrag) {
            endScreenPanDrag();
          }
          if (state.mirrorOverlayDrag) {
            endMirrorOverlayDrag();
          }
          if (state.mirrorOverlayResize) {
            endMirrorOverlayResize();
          }
        }

        updateMirrorSelectionStatus();
        updateMirrorSelectionBox();
        renderMirrorOverlays();
      }

      function updateMirrorSelectionStatus() {
        const selectionActive = state.mirrorSelectionMode;
        const colorPick = state.mirrorColorPick;
        const colorPickActive = Boolean(colorPick);

        if (selectionActive) {
          mirrorSelectionStatus.textContent = "Area pick: drag on canvas (Esc to cancel)";
        } else if (colorPickActive) {
          mirrorSelectionStatus.textContent = "Color pick: click anywhere on canvas (Esc to cancel)";
        } else {
          mirrorSelectionStatus.textContent = "Area pick: off";
        }

        mirrorSelectionStatus.classList.toggle("active", selectionActive || colorPickActive);
        selectMirrorButton.textContent = selectionActive ? "Cancel Area Pick" : "Pick Area";
        viewportWrap.classList.toggle("mirror-selecting", selectionActive);
        viewportWrap.classList.toggle("color-picking-screen", colorPickActive);
        mirrorOverlayLayer.style.pointerEvents = selectionActive ? "none" : "";
      }

      function getCanvasPointerPosition(event, clampToCanvas = true) {
        const bounds = canvas.getBoundingClientRect();
        const px = ((event.clientX - bounds.left) / Math.max(1, bounds.width)) * canvas.width;
        const py = ((event.clientY - bounds.top) / Math.max(1, bounds.height)) * canvas.height;
        if (!clampToCanvas) {
          return { x: px, y: py };
        }
        return {
          x: clamp(px, 0, canvas.width),
          y: clamp(py, 0, canvas.height)
        };
      }

      function updateMirrorSelectionBox() {
        if (!state.mirrorSelectionDrag) {
          mirrorSelectionBox.classList.remove("active");
          return;
        }
        const bounds = canvas.getBoundingClientRect();
        const viewportBounds = viewportWrap.getBoundingClientRect();
        const start = state.mirrorSelectionDrag.start;
        const current = state.mirrorSelectionDrag.current;
        const leftPx = (Math.min(start.x, current.x) * bounds.width / Math.max(1, canvas.width)) + (bounds.left - viewportBounds.left);
        const topPx = (Math.min(start.y, current.y) * bounds.height / Math.max(1, canvas.height)) + (bounds.top - viewportBounds.top);
        const rightPx = (Math.max(start.x, current.x) * bounds.width / Math.max(1, canvas.width)) + (bounds.left - viewportBounds.left);
        const bottomPx = (Math.max(start.y, current.y) * bounds.height / Math.max(1, canvas.height)) + (bounds.top - viewportBounds.top);

        mirrorSelectionBox.style.left = `${Math.round(leftPx)}px`;
        mirrorSelectionBox.style.top = `${Math.round(topPx)}px`;
        mirrorSelectionBox.style.width = `${Math.max(1, Math.round(rightPx - leftPx))}px`;
        mirrorSelectionBox.style.height = `${Math.max(1, Math.round(bottomPx - topPx))}px`;
        mirrorSelectionBox.classList.add("active");
      }

      function setMirrorSelectionMode(enabled) {
        if (enabled && state.mirrorColorPick) {
          state.mirrorColorPick = null;
        }
        state.mirrorSelectionMode = enabled;
        if (!enabled) {
          state.mirrorSelectionDrag = null;
          if (state.screenPanDrag) {
            endScreenPanDrag();
          }
        } else if (state.mirrorOverlayDrag) {
          endMirrorOverlayDrag();
        } else if (state.mirrorOverlayResize) {
          endMirrorOverlayResize();
        }
        updateMirrorSelectionStatus();
        updateMirrorSelectionBox();
        renderMirrorOverlays();
      }

      function finalizeMirrorSelection() {
        if (!state.mirrorSelectionDrag) {
          return;
        }
        const start = state.mirrorSelectionDrag.start;
        const current = state.mirrorSelectionDrag.current;
        const left = clamp(Math.floor(Math.min(start.x, current.x)), 0, Math.max(0, canvas.width - 1));
        const top = clamp(Math.floor(Math.min(start.y, current.y)), 0, Math.max(0, canvas.height - 1));
        const right = clamp(Math.ceil(Math.max(start.x, current.x)), left + 1, canvas.width);
        const bottom = clamp(Math.ceil(Math.max(start.y, current.y)), top + 1, canvas.height);
        const rect = normalizeMirrorRect({
          x: left,
          y: top,
          w: right - left,
          h: bottom - top
        });
        addMirror(rect);
      }

      function startMirrorOverlayDrag(event, overlay) {
        if (state.mirrorSelectionMode || state.mirrorColorPick || event.button !== 0) {
          return;
        }
        const mirrorId = overlay.dataset.mirrorId;
        const mirror = state.mirrors.find((item) => item.id === mirrorId);
        if (!mirror) {
          return;
        }
        state.mirrorOverlayDrag = {
          mirrorId,
          startClientX: event.clientX,
          startClientY: event.clientY,
          startX: mirror.screenX,
          startY: mirror.screenY
        };
        overlay.classList.add("dragging");
        event.preventDefault();
      }

      function startMirrorOverlayResize(event, overlay) {
        if (state.mirrorSelectionMode || state.mirrorColorPick || event.button !== 0) {
          return;
        }
        const mirrorId = overlay.dataset.mirrorId;
        const mirror = state.mirrors.find((item) => item.id === mirrorId);
        if (!mirror) {
          return;
        }
        const handle = event.target?.dataset?.handle || "se";
        state.mirrorOverlayResize = {
          mirrorId,
          handle,
          startClientX: event.clientX,
          startClientY: event.clientY,
          startX: mirror.screenX,
          startY: mirror.screenY,
          startW: mirror.screenW,
          startH: mirror.screenH,
          aspectRatio: mirror.screenW / Math.max(0.001, mirror.screenH),
          startSourceX: mirror.x,
          startSourceY: mirror.y,
          startSourceW: mirror.w,
          startSourceH: mirror.h,
          sourceAspectRatio: mirror.w / Math.max(0.001, mirror.h)
        };
        overlay.classList.add("resizing");
        event.preventDefault();
      }

      function updateMirrorOverlayDrag(event) {
        if (!state.mirrorOverlayDrag) {
          return;
        }
        const drag = state.mirrorOverlayDrag;
        const mirror = state.mirrors.find((item) => item.id === drag.mirrorId);
        if (!mirror) {
          return;
        }
        const canvasMetrics = getCanvasViewportMetrics();
        const dxPct = ((event.clientX - drag.startClientX) / canvasMetrics.width) * 100;
        const dyPct = ((event.clientY - drag.startClientY) / canvasMetrics.height) * 100;
        mirror.screenX = clamp(drag.startX + dxPct, -MIRROR_POSITION_LIMIT, MIRROR_POSITION_LIMIT);
        mirror.screenY = clamp(drag.startY + dyPct, -MIRROR_POSITION_LIMIT, MIRROR_POSITION_LIMIT);
        renderMirrorOverlays();
        event.preventDefault();
      }

      function endMirrorOverlayDrag() {
        if (!state.mirrorOverlayDrag) {
          return;
        }
        state.mirrorOverlayDrag = null;
        const dragging = mirrorOverlayLayer.querySelector(".mirror-overlay.dragging");
        if (dragging) {
          dragging.classList.remove("dragging");
        }
        saveMirrorsToStorage();
        renderMirrorPanels();
      }

      function updateMirrorOverlayResize(event) {
        if (!state.mirrorOverlayResize) {
          return;
        }
        const resize = state.mirrorOverlayResize;
        const mirror = state.mirrors.find((item) => item.id === resize.mirrorId);
        if (!mirror) {
          return;
        }
        const handle = resize.handle || "se";
        const moveLeft = handle.includes("w");
        const moveRight = handle.includes("e");
        const moveTop = handle.includes("n");
        const moveBottom = handle.includes("s");
        const isCorner = (moveLeft || moveRight) && (moveTop || moveBottom);
        const canvasMetrics = getCanvasViewportMetrics();
        const dxPct = ((event.clientX - resize.startClientX) / canvasMetrics.width) * 100;
        const dyPct = ((event.clientY - resize.startClientY) / canvasMetrics.height) * 100;
        if (event.altKey) {
          const startScreenWpx = Math.max(1, (resize.startW / 100) * canvasMetrics.width);
          const startScreenHpx = Math.max(1, (resize.startH / 100) * canvasMetrics.height);
          const dxPx = event.clientX - resize.startClientX;
          const dyPx = event.clientY - resize.startClientY;
          const dxSrc = dxPx * (resize.startSourceW / startScreenWpx);
          const dySrc = dyPx * (resize.startSourceH / startScreenHpx);
          let left = resize.startSourceX;
          let top = resize.startSourceY;
          let right = resize.startSourceX + resize.startSourceW;
          let bottom = resize.startSourceY + resize.startSourceH;

          if (moveLeft) {
            left += dxSrc;
          }
          if (moveRight) {
            right += dxSrc;
          }
          if (moveTop) {
            top += dySrc;
          }
          if (moveBottom) {
            bottom += dySrc;
          }

          if (!event.shiftKey && isCorner) {
            const ratio = Math.max(0.001, resize.sourceAspectRatio || (resize.startSourceW / Math.max(0.001, resize.startSourceH)));
            const widthDelta = moveLeft ? -dxSrc : dxSrc;
            const heightDelta = moveTop ? -dySrc : dySrc;
            const widthDeltaNorm = widthDelta / Math.max(1, resize.startSourceW);
            const heightDeltaNorm = heightDelta / Math.max(1, resize.startSourceH);
            const driveByWidth = Math.abs(widthDeltaNorm) >= Math.abs(heightDeltaNorm);

            if (driveByWidth) {
              const nextW = Math.max(1, Math.round(resize.startSourceW + widthDelta));
              const nextH = Math.max(1, Math.round(nextW / ratio));
              if (moveLeft) {
                left = right - nextW;
              } else {
                right = left + nextW;
              }
              if (moveTop) {
                top = bottom - nextH;
              } else {
                bottom = top + nextH;
              }
            } else {
              const nextH = Math.max(1, Math.round(resize.startSourceH + heightDelta));
              const nextW = Math.max(1, Math.round(nextH * ratio));
              if (moveLeft) {
                left = right - nextW;
              } else {
                right = left + nextW;
              }
              if (moveTop) {
                top = bottom - nextH;
              } else {
                bottom = top + nextH;
              }
            }
          }

          if (right - left < 1) {
            if (moveLeft && !moveRight) {
              left = right - 1;
            } else {
              right = left + 1;
            }
          }
          if (bottom - top < 1) {
            if (moveTop && !moveBottom) {
              top = bottom - 1;
            } else {
              bottom = top + 1;
            }
          }

          const normalized = normalizeMirrorRect({
            x: Math.round(left),
            y: Math.round(top),
            w: Math.round(right - left),
            h: Math.round(bottom - top)
          });
          const sourceScaleX = resize.startW / Math.max(1, resize.startSourceW);
          const sourceScaleY = resize.startH / Math.max(1, resize.startSourceH);
          const nextScreenW = clamp(normalized.w * sourceScaleX, MIRROR_MIN_SIZE, MIRROR_SIZE_LIMIT);
          const nextScreenH = clamp(normalized.h * sourceScaleY, MIRROR_MIN_SIZE, MIRROR_SIZE_LIMIT);
          const startScreenLeft = resize.startX;
          const startScreenTop = resize.startY;
          const startScreenRight = resize.startX + resize.startW;
          const startScreenBottom = resize.startY + resize.startH;

          let nextScreenLeft = startScreenLeft;
          let nextScreenTop = startScreenTop;

          if (moveLeft && !moveRight) {
            nextScreenLeft = startScreenRight - nextScreenW;
          }
          if (moveTop && !moveBottom) {
            nextScreenTop = startScreenBottom - nextScreenH;
          }

          mirror.screenX = clamp(nextScreenLeft, -MIRROR_POSITION_LIMIT, MIRROR_POSITION_LIMIT);
          mirror.screenY = clamp(nextScreenTop, -MIRROR_POSITION_LIMIT, MIRROR_POSITION_LIMIT);
          mirror.screenW = nextScreenW;
          mirror.screenH = nextScreenH;
          mirror.x = normalized.x;
          mirror.y = normalized.y;
          mirror.w = normalized.w;
          mirror.h = normalized.h;
        } else {
          let left = resize.startX;
          let top = resize.startY;
          let right = resize.startX + resize.startW;
          let bottom = resize.startY + resize.startH;

          if (moveLeft) {
            left += dxPct;
          }
          if (moveRight) {
            right += dxPct;
          }
          if (moveTop) {
            top += dyPct;
          }
          if (moveBottom) {
            bottom += dyPct;
          }

          if (!event.shiftKey && isCorner) {
            const ratio = Math.max(0.001, resize.aspectRatio || (resize.startW / Math.max(0.001, resize.startH)));
            const widthDelta = moveLeft ? -dxPct : dxPct;
            const heightDelta = moveTop ? -dyPct : dyPct;
            const widthDeltaNorm = widthDelta / Math.max(1, resize.startW);
            const heightDeltaNorm = heightDelta / Math.max(1, resize.startH);
            const driveByWidth = Math.abs(widthDeltaNorm) >= Math.abs(heightDeltaNorm);

            if (driveByWidth) {
              const nextW = clamp(resize.startW + widthDelta, MIRROR_MIN_SIZE, MIRROR_SIZE_LIMIT);
              const nextH = clamp(nextW / ratio, MIRROR_MIN_SIZE, MIRROR_SIZE_LIMIT);
              if (moveLeft) {
                left = right - nextW;
              } else {
                right = left + nextW;
              }
              if (moveTop) {
                top = bottom - nextH;
              } else {
                bottom = top + nextH;
              }
            } else {
              const nextH = clamp(resize.startH + heightDelta, MIRROR_MIN_SIZE, MIRROR_SIZE_LIMIT);
              const nextW = clamp(nextH * ratio, MIRROR_MIN_SIZE, MIRROR_SIZE_LIMIT);
              if (moveLeft) {
                left = right - nextW;
              } else {
                right = left + nextW;
              }
              if (moveTop) {
                top = bottom - nextH;
              } else {
                bottom = top + nextH;
              }
            }
          } else {
            if (right - left < MIRROR_MIN_SIZE) {
              if (moveLeft && !moveRight) {
                left = right - MIRROR_MIN_SIZE;
              } else {
                right = left + MIRROR_MIN_SIZE;
              }
            }
            if (bottom - top < MIRROR_MIN_SIZE) {
              if (moveTop && !moveBottom) {
                top = bottom - MIRROR_MIN_SIZE;
              } else {
                bottom = top + MIRROR_MIN_SIZE;
              }
            }
          }

          mirror.screenX = clamp(left, -MIRROR_POSITION_LIMIT, MIRROR_POSITION_LIMIT);
          mirror.screenY = clamp(top, -MIRROR_POSITION_LIMIT, MIRROR_POSITION_LIMIT);
          mirror.screenW = clamp(right - left, MIRROR_MIN_SIZE, MIRROR_SIZE_LIMIT);
          mirror.screenH = clamp(bottom - top, MIRROR_MIN_SIZE, MIRROR_SIZE_LIMIT);
        }
        renderMirrorOverlays();
        event.preventDefault();
      }

      function endMirrorOverlayResize() {
        if (!state.mirrorOverlayResize) {
          return;
        }
        state.mirrorOverlayResize = null;
        const resizing = mirrorOverlayLayer.querySelector(".mirror-overlay.resizing");
        if (resizing) {
          resizing.classList.remove("resizing");
        }
        saveMirrorsToStorage();
        renderMirrorPanels();
      }

      function pushGraphSamples(dtMs) {
        state.graphPushTimer += dtMs;
        const pushStep = 50;
        while (state.graphPushTimer >= pushStep) {
          state.graphPushTimer -= pushStep;

          const fpsTarget = state.fpsCap === 0 ? 230 : state.fpsCap;
          const baseFrameMs = 1000 / fpsTarget;
          const wobble = (Math.random() - 0.5) * 5.5;
          const occasionalSpike = Math.random() < 0.035 ? (7 + Math.random() * 20) : 0;
          const frameMs = clamp(baseFrameMs + wobble + occasionalSpike, 1, 90);
          state.frameMsSamples.push(frameMs);

          const tickBase = 50;
          const tickWobble = (Math.random() - 0.5) * 8.0;
          const tickSpike = Math.random() < 0.04 ? (8 + Math.random() * 20) : 0;
          const tickMs = clamp(tickBase + tickWobble + tickSpike, 20, 120);
          state.tickMsSamples.push(tickMs);

          const maxSamples = 420;
          if (state.frameMsSamples.length > maxSamples) {
            state.frameMsSamples.splice(0, state.frameMsSamples.length - maxSamples);
          }
          if (state.tickMsSamples.length > maxSamples) {
            state.tickMsSamples.splice(0, state.tickMsSamples.length - maxSamples);
          }
        }
      }

      function randomizeSamples() {
        state.frameMsSamples.length = 0;
        state.tickMsSamples.length = 0;
        for (let i = 0; i < 300; i += 1) {
          const fpsTarget = state.fpsCap === 0 ? 230 : state.fpsCap;
          const frameMs = clamp((1000 / fpsTarget) + (Math.random() - 0.5) * 6 + (Math.random() < 0.04 ? 20 : 0), 1, 95);
          const tickMs = clamp(50 + (Math.random() - 0.5) * 8 + (Math.random() < 0.05 ? 24 : 0), 20, 120);
          state.frameMsSamples.push(frameMs);
          state.tickMsSamples.push(tickMs);
        }
      }

      function drawShadowText(text, x, y, color, shadowColor = null) {
        if (shadowColor) {
          ctx.fillStyle = shadowColor;
          ctx.fillText(text, x, y + 1);
        }
        ctx.fillStyle = color;
        ctx.fillText(text, x, y);
      }

      function drawTextBoxLine(text, x, y, alignRight = false, color = "#DDDDDD") {
        if (!text) {
          return;
        }
        const measured = Math.ceil(ctx.measureText(text).width);
        const drawX = alignRight ? x - measured : x;
        ctx.fillStyle = "rgba(80, 80, 80, 0.56)";
        ctx.fillRect(drawX - 1, y - 1, measured + 2, 9);
        drawShadowText(text, drawX, y, color);
      }

      function avg(arr) {
        if (!arr.length) {
          return 0;
        }
        return arr.reduce((acc, value) => acc + value, 0) / arr.length;
      }

      function formatPercent(value) {
        return `${value.toFixed(2)}%`;
      }

      function getCurrentProfilerNode() {
        let node = profilerRoot;
        for (let i = 1; i < state.piePath.length; i += 1) {
          const next = node.children?.find((child) => child.name === state.piePath[i]);
          if (!next) {
            break;
          }
          node = next;
        }
        return node;
      }

      function getProfilerDisplayEntries() {
        const node = getCurrentProfilerNode();
        const children = Array.isArray(node.children)
          ? node.children.filter((child) => !child.hiddenOnPie)
          : [];
        children.sort((a, b) => {
          if (b.local !== a.local) {
            return b.local - a.local;
          }
          return a.name.localeCompare(b.name);
        });

        const consumed = children.reduce((sum, child) => sum + child.local, 0);
        if (consumed < 100) {
          children.push({
            name: "unspecified",
            local: 100 - consumed,
            global: node.global * ((100 - consumed) / 100),
            children: []
          });
        }

        return {
          rootEntry: {
            name: state.piePath.join("."),
            local: 100,
            global: node.global
          },
          children
        };
      }

      function drawCustomBackground() {
        const image = state.displayVariant === "tall"
          ? state.tallBgImage
          : state.customBgImage;
        if (!image) {
          return false;
        }

        const w = state.windowWidth;
        const h = state.windowHeight;
        const imageAspect = image.width / image.height;
        const screenAspect = w / h;
        let drawW;
        let drawH;
        let drawX;
        let drawY;

        if (imageAspect > screenAspect) {
          drawH = h;
          drawW = h * imageAspect;
          drawX = (w - drawW) / 2;
          drawY = 0;
        } else {
          drawW = w;
          drawH = w / imageAspect;
          drawX = 0;
          drawY = (h - drawH) / 2;
        }

        ctx.drawImage(image, drawX, drawY, drawW, drawH);

        // Slight darken to preserve debug-text readability.
        ctx.fillStyle = "rgba(0, 0, 0, 0.14)";
        ctx.fillRect(0, 0, w, h);
        return true;
      }

      function drawWorldBackdrop(nowMs) {
        if (drawCustomBackground()) {
          return;
        }

        const w = state.windowWidth;
        const h = state.windowHeight;
        const t = nowMs * 0.00012;

        const sky = ctx.createLinearGradient(0, 0, 0, h);
        sky.addColorStop(0, "#86b7ff");
        sky.addColorStop(0.58, "#b2d2ff");
        sky.addColorStop(1, "#9dd09d");
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, w, h);

        const sunX = w * 0.74 + Math.cos(t * 0.12) * 14;
        const sunY = h * 0.16;
        ctx.fillStyle = "rgba(255, 240, 174, 0.92)";
        ctx.fillRect(Math.round(sunX), Math.round(sunY), 34, 34);

        ctx.fillStyle = "rgba(90, 128, 92, 0.58)";
        for (let i = 0; i < 12; i += 1) {
          const px = Math.round(((i * 331) % (w + 180)) - 90);
          const pw = 130 + ((i * 17) % 110);
          const ph = 40 + ((i * 33) % 90);
          const py = h * 0.62 + (i % 4) * 16;
          ctx.fillRect(px, Math.round(py), pw, ph);
        }

        const groundY = Math.floor(h * 0.75);
        const dirt = ctx.createLinearGradient(0, groundY, 0, h);
        dirt.addColorStop(0, "#6a6c39");
        dirt.addColorStop(1, "#3d2d1f");
        ctx.fillStyle = dirt;
        ctx.fillRect(0, groundY, w, h - groundY);

        ctx.fillStyle = "rgba(20, 20, 20, 0.35)";
        for (let y = groundY; y < h; y += 8) {
          ctx.fillRect(0, y, w, 1);
        }

        const vignette = ctx.createRadialGradient(w * 0.5, h * 0.35, h * 0.2, w * 0.5, h * 0.5, h * 0.9);
        vignette.addColorStop(0, "rgba(0,0,0,0.00)");
        vignette.addColorStop(1, "rgba(0,0,0,0.35)");
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, w, h);
      }

      function lineForFacing() {
        return "Facing: north (Towards negative Z) (180.0 / 3.0)";
      }

      function getF3LeftLines() {
        const avgFrameMs = avg(state.frameMsSamples) || (1000 / 60);
        const fps = clamp(Math.round(1000 / avgFrameMs), 1, 999);
        const fpsTarget = state.fpsCap === 0 ? "inf" : String(state.fpsCap);
        const tx = 14 + Math.round(Math.sin(state.tickCount * 0.006) * 4);
        const rx = 12 + Math.round(Math.cos(state.tickCount * 0.005) * 3);
        const pieVisible = state.mode === "pie" || state.mode === "f3pie";

        state.cameraX += Math.sin(state.tickCount * 0.00035) * 0.0025;
        state.cameraZ += Math.cos(state.tickCount * 0.00031) * 0.0022;

        return [
          "Minecraft 1.16.5 (1.16.5/vanilla)",
          `${fps} fps T: ${fpsTarget}${state.fpsCap === 0 ? "" : ""} fancy-clouds B: 24`,
          `Integrated server @ 50 ms ticks, ${tx} tx, ${rx} rx`,
          "C: 676/1536 (s) D: 12, pC: 000, pU: 0, aB: 29",
          "E: 14/111, B: 0, I: 66",
          "P: 123. T: 101",
          "Client Chunk Cache: 1024, 289",
          "ServerChunkCache: 2025",
          "minecraft:overworld FC: 58",
          "",
          `XYZ: ${state.cameraX.toFixed(3)} / ${state.cameraY.toFixed(5)} / ${state.cameraZ.toFixed(3)}`,
          `Block: ${Math.floor(state.cameraX)} ${Math.floor(state.cameraY)} ${Math.floor(state.cameraZ)}`,
          `Chunk: ${Math.floor(state.cameraX) & 15} ${Math.floor(state.cameraY) & 15} ${Math.floor(state.cameraZ) & 15} in ${Math.floor(state.cameraX) >> 4} ${Math.floor(state.cameraY) >> 4} ${Math.floor(state.cameraZ) >> 4}`,
          lineForFacing(),
          "Client Light: 15 (15 sky, 0 block)",
          "Server Light: (15 sky, 0 block)",
          "CH SW: 0 S: 0 OW: 0 O: 0 M: 0 ML: 0",
          "SH SW: 0 S: 0 OW: 0 O: 0 M: 0 ML: 0",
          "Biome: minecraft:plains",
          "Local Difficulty: 1.50 // 0.00 (Day 12)",
          "SC: 289, M:0, C: 12, A: 0, W: 0, W: 0, M:0",
          "Sounds: 0/248 + 0/8 (Mood 0%)",
          "",
          `Debug: Pie [shift]: ${pieVisible ? "visible" : "hidden"} ${state.integratedServer ? "FPS + TPS" : "FPS"} [alt]: ${state.showAltGraphs ? "visible" : "hidden"}`,
          "For help: press F3 + Q"
        ];
      }

      function getF3RightLines() {
        const maxMem = 8192;
        state.memAllocatedMb += Math.sin(state.tickCount * 0.0021) * 0.7;
        state.memUsedMb += Math.sin(state.tickCount * 0.0034) * 0.9;
        state.memAllocatedMb = clamp(state.memAllocatedMb, 3200, 4900);
        state.memUsedMb = clamp(state.memUsedMb, 1800, state.memAllocatedMb - 120);

        const usedPercent = Math.floor((state.memUsedMb * 100) / maxMem);
        const allocPercent = Math.floor((state.memAllocatedMb * 100) / maxMem);

        return [
          "Java: 17.0.10 64bit",
          `Mem: ${String(usedPercent).padStart(2, " ")}% ${String(Math.floor(state.memUsedMb)).padStart(3, "0")}/${String(maxMem).padStart(3, "0")}MB`,
          `Allocated: ${String(allocPercent).padStart(2, " ")}% ${String(Math.floor(state.memAllocatedMb)).padStart(3, "0")}MB`,
          "",
          `CPU: ${navigator.hardwareConcurrency || 8}x AMD Ryzen (simulated)`,
          "",
          `Display: ${state.windowWidth}x${state.windowHeight} (NVIDIA Corporation)`,
          "NVIDIA GeForce RTX 3070/PCIe/SSE2",
          "4.6.0 NVIDIA 555.85",
          "",
          "Targeted Block: 125, 66, -303",
          "minecraft:stone",
          "axis: y",
          "#minecraft:mineable/pickaxe",
          "",
          "Targeted Fluid: 125, 66, -303",
          "minecraft:empty",
          "",
          "MCSR Sodium 2.4.1",
        ];
      }

      function lerp(a, b, t) {
        return a + (b - a) * t;
      }

      function colorRamp(value, middle, max) {
        const v = clamp(value, 0, max);
        if (v < middle) {
          const t = v / Math.max(1, middle);
          const r = Math.round(lerp(0, 255, t));
          const g = 255;
          return `rgb(${r},${g},0)`;
        }
        const t = (v - middle) / Math.max(1, max - middle);
        const r = 255;
        const g = Math.round(lerp(255, 0, t));
        return `rgb(${r},${g},0)`;
      }

      function drawVerticalLine(x, y1, y2, color) {
        ctx.fillStyle = color;
        const top = Math.min(y1, y2);
        const h = Math.abs(y2 - y1) + 1;
        ctx.fillRect(Math.round(x), Math.round(top), 1, Math.round(h));
      }

      function drawHorizontalLine(x1, x2, y, color) {
        ctx.fillStyle = color;
        const left = Math.min(x1, x2);
        const w = Math.abs(x2 - x1) + 1;
        ctx.fillRect(Math.round(left), Math.round(y), Math.round(w), 1);
      }

      function drawFrameGraph(samples, left, width, fpsMode) {
        const bottom = state.scaledHeight;
        const graphHeight = 60;
        const sampleCount = Math.min(samples.length, Math.max(1, width));
        const startIndex = Math.max(0, samples.length - sampleCount);
        const visible = samples.slice(startIndex);

        ctx.fillStyle = "rgba(80, 80, 80, 0.56)";
        ctx.fillRect(left, bottom - graphHeight, sampleCount, graphHeight);

        let min = Number.POSITIVE_INFINITY;
        let max = Number.NEGATIVE_INFINITY;
        let sum = 0;

        for (let i = 0; i < visible.length; i += 1) {
          const ms = visible[i];
          min = Math.min(min, ms);
          max = Math.max(max, ms);
          sum += ms;

          const frameHeight = clamp(Math.round(ms), 1, graphHeight);
          const color = fpsMode ? colorRamp(frameHeight, 50, 100) : colorRamp(frameHeight, 30, 60);
          drawVerticalLine(left + i, bottom, bottom - frameHeight, color);
        }

        if (fpsMode) {
          drawTextBoxLine("60 FPS", left + 2, bottom - 30 + 2, false);
          drawTextBoxLine("30 FPS", left + 2, bottom - 60 + 2, false);
          drawHorizontalLine(left, left + sampleCount - 1, bottom - 30, "#ffffff");
          drawHorizontalLine(left, left + sampleCount - 1, bottom - 60, "#ffffff");
        } else {
          drawTextBoxLine("20 TPS", left + 2, bottom - 60 + 2, false);
          drawHorizontalLine(left, left + sampleCount - 1, bottom - 60, "#ffffff");
        }

        drawHorizontalLine(left, left + sampleCount - 1, bottom - 1, "#ffffff");
        drawVerticalLine(left, bottom - 60, bottom, "#ffffff");
        drawVerticalLine(left + sampleCount - 1, bottom - 60, bottom, "#ffffff");

        const avgMs = sum / Math.max(1, visible.length);
        const minLabel = `${Math.round(min)} ms min`;
        const avgLabel = `${Math.round(avgMs)} ms avg`;
        const maxLabel = `${Math.round(max)} ms max`;

        drawShadowText(minLabel, left + 2, bottom - 69, "#e0e0e0");
        drawShadowText(avgLabel, left + Math.floor(sampleCount / 2 - ctx.measureText(avgLabel).width / 2), bottom - 69, "#e0e0e0");
        drawShadowText(maxLabel, left + sampleCount - ctx.measureText(maxLabel).width, bottom - 69, "#e0e0e0");
      }

      function drawF3Screen() {
        ctx.save();
        ctx.scale(state.effectiveGuiScale, state.effectiveGuiScale);
        ctx.font = "8px 'Minecraftia', 'Courier New', monospace";
        ctx.textBaseline = "top";

        const leftLines = getF3LeftLines();
        const rightLines = getF3RightLines();

        for (let i = 0; i < leftLines.length; i += 1) {
          const text = leftLines[i];
          if (!text) {
            continue;
          }
          const y = 2 + (9 * i);
          drawTextBoxLine(text, 2, y, false);
        }

        for (let i = 0; i < rightLines.length; i += 1) {
          const text = rightLines[i];
          if (!text) {
            continue;
          }
          const y = 2 + (9 * i);
          drawTextBoxLine(text, state.scaledWidth - 2, y, true);
        }

        if (state.showAltGraphs) {
          const leftWidth = Math.floor(state.scaledWidth / 2);
          drawFrameGraph(state.frameMsSamples, 0, leftWidth, true);
          if (state.integratedServer) {
            const rightLeft = state.scaledWidth - Math.min(leftWidth, 240);
            drawFrameGraph(state.tickMsSamples, rightLeft, leftWidth, false);
          }
        }

        ctx.restore();
      }

      function drawPieSectorTop(centerX, centerY, radiusX, radiusY, startPercent, segmentPercent, color) {
        const steps = Math.ceil(segmentPercent / 4.0) + 1;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        for (let i = steps; i >= 0; i -= 1) {
          const angle = (startPercent + (segmentPercent * i / steps)) * Math.PI * 2 / 100;
          const x = centerX + (Math.cos(angle) * radiusX);
          const y = centerY - (Math.sin(angle) * radiusY);
          ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
      }

      function drawPieSectorSide(centerX, centerY, radiusX, radiusY, startPercent, segmentPercent, color, depth) {
        const steps = Math.ceil(segmentPercent / 4.0) + 1;
        const points = [];
        for (let i = steps; i >= 0; i -= 1) {
          const angle = (startPercent + (segmentPercent * i / steps)) * Math.PI * 2 / 100;
          const x = centerX + (Math.cos(angle) * radiusX);
          const y = centerY - (Math.sin(angle) * radiusY);
          if (y >= centerY) {
            points.push({ x, y });
          }
        }
        if (points.length < 2) {
          return;
        }
        for (let i = 0; i < points.length - 1; i += 1) {
          const a = points[i];
          const b = points[i + 1];
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(a.x, a.y + depth);
          ctx.lineTo(b.x, b.y + depth);
          ctx.lineTo(b.x, b.y);
          ctx.closePath();
          ctx.fillStyle = color;
          ctx.fill();
        }
      }

      function drawPieScreen() {
        ctx.save();
        ctx.font = "8px 'Minecraftia', 'Courier New', monospace";
        ctx.textBaseline = "top";

        const display = getProfilerDisplayEntries();
        const rootEntry = display.rootEntry;
        const entries = display.children;

        // Match vanilla behavior: piechart is drawn in framebuffer coordinates
        // and does not scale with GUI scale.
        const radiusX = 160;
        const radiusY = 80;
        const depth = 10;
        const centerX = state.windowWidth - 160 - 10;
        const centerY = state.windowHeight - 320;
        const panelHalfWidth = 176;
        const panelTopOffset = 96 + 16;
        const panelHeight = 416;
        const textHalfWidth = 160;
        const headingY = centerY - 96;
        const legendStartY = centerY + 80 + 20;
        const localPercentInset = 50;

        let currentPercent = 0;
        for (const entry of entries) {
          const colorInt = colorFromProfilerName(entry.name);
          const sideColorInt = ((colorInt >> 1) & 0x7F7F7F);
          drawPieSectorTop(centerX, centerY, radiusX, radiusY, currentPercent, entry.local, rgbIntToCss(colorInt));
          drawPieSectorSide(centerX, centerY, radiusX, radiusY, currentPercent, entry.local, rgbIntToCss(sideColorInt), depth);
          currentPercent += entry.local;
        }

        const headingRaw = rootEntry.name;
        let heading = "";
        if (headingRaw !== "unspecified") {
          heading += "[0] ";
        }
        if (!headingRaw) {
          heading += "ROOT ";
        } else {
          heading += `${headingRaw} `;
        }

        drawShadowText(heading, centerX - textHalfWidth, headingY, "#ffffff", "#000000");
        const rootPercentText = formatPercent(rootEntry.global);
        drawShadowText(rootPercentText, centerX + textHalfWidth - ctx.measureText(rootPercentText).width, headingY, "#ffffff", "#000000");

        state.lastPieHitboxes = [];
        for (let i = 0; i < entries.length; i += 1) {
          const entry = entries[i];
          const lineY = legendStartY + (i * 8);
          const colorInt = colorFromProfilerName(entry.name);
          const color = rgbIntToCss(colorInt);
          const marker = entry.name === "unspecified" ? "[?]" : `[${i + 1}]`;
          const leftText = `${marker} ${entry.name}`;
          const localText = formatPercent(entry.local);
          const globalText = formatPercent(entry.global);

          drawShadowText(leftText, centerX - textHalfWidth, lineY, color, "#000000");
          drawShadowText(localText, centerX + textHalfWidth - localPercentInset - ctx.measureText(localText).width, lineY, color, "#000000");
          drawShadowText(globalText, centerX + textHalfWidth - ctx.measureText(globalText).width, lineY, color, "#000000");

          state.lastPieHitboxes.push({
            index: i,
            x: centerX - textHalfWidth,
            y: lineY,
            w: textHalfWidth * 2,
            h: 8,
            entry
          });
        }

        ctx.restore();
      }

      function navigatePie(index) {
        const display = getProfilerDisplayEntries();
        const entries = display.children;
        if (index === 0) {
          if (state.piePath.length > 1) {
            state.piePath.pop();
          }
          return;
        }

        const childIndex = index - 1;
        if (childIndex < 0 || childIndex >= entries.length) {
          return;
        }
        const child = entries[childIndex];
        if (!child || child.name === "unspecified") {
          return;
        }
        const current = getCurrentProfilerNode();
        const target = current.children?.find((item) => item.name === child.name);
        if (target) {
          state.piePath.push(target.name);
        }
      }

      function draw(nowMs) {
        drawWorldBackdrop(nowMs);

        if (state.mode === "pie") {
          drawPieScreen();
        } else if (state.mode === "f3pie") {
          drawF3Screen();
          drawPieScreen();
        } else {
          drawF3Screen();
        }
      }

      function updateStatusText() {
        const autoSuffix = state.guiScaleSetting === 0 ? " (Auto)" : "";
        const fpsTargetText = String(state.fpsCap);
        const backgroundText = state.displayVariant === "tall"
          ? (state.tallBgImage ? FORCED_TALL_BACKGROUND_URL : (state.tallBgLoadError ? `missing (${FORCED_TALL_BACKGROUND_URL})` : "loading"))
          : (state.customBgImage ? state.customBgName : (state.bgLoadError ? `missing (${FORCED_BACKGROUND_URL})` : "loading"));
        const keyingText = state.mirrorKeyingBlocked ? "blocked" : "active";
        const zoomText = `${Math.round(state.screenZoom * 100)}%`;
        const visibleMirrors = getMirrorsForCurrentVariant().length;
        statusText.textContent =
          `Window ${state.windowWidth}x${state.windowHeight} | GUI Scale ${state.effectiveGuiScale}${autoSuffix} | ` +
          `Scaled GUI ${state.scaledWidth}x${state.scaledHeight} | Screen: ${state.mode.toUpperCase()} | FPS Target: ${fpsTargetText} | BG: ${backgroundText} | Keying: ${keyingText} | Zoom: ${zoomText} | View: ${state.displayVariant} | Mirrors: ${visibleMirrors}/${state.mirrors.length}`;
      }

      function applyControlValuesToState() {
        state.mode = FORCED_MODE;
        state.guiScaleSetting = Number(guiScaleSelect.value);
        state.fpsCap = FORCED_FPS_CAP;
        updateScaledResolution();
        updateStatusText();
      }

      function onApplyResolutionClick() {
        setDisplayVariant("preset");
        setViewportCropMode("contain");
        applyResolution(Number(widthInput.value), Number(heightInput.value));
        setBaseResolution(state.windowWidth, state.windowHeight, true);
        syncPresetFromResolution();
        applyControlValuesToState();
        renderMirrorPanels();
      }

      function applyShortcutResolution(width, height) {
        applyResolution(width, height);
        syncPresetFromResolution();
        applyControlValuesToState();
        renderMirrorPanels();
      }

      function setCustomBackgroundFromUrl(url, displayName = url) {
        if (!url) {
          return;
        }

        if (state.customBgObjectUrl) {
          URL.revokeObjectURL(state.customBgObjectUrl);
          state.customBgObjectUrl = "";
        }

        const image = new Image();
        try {
          const parsed = new URL(url, window.location.href);
          if (parsed.protocol === "http:" || parsed.protocol === "https:") {
            image.crossOrigin = "anonymous";
          }
        } catch (error) {
          // Ignore URL parse failures and keep default loading behavior.
        }
        image.onload = () => {
          state.customBgImage = image;
          state.customBgName = displayName;
          state.bgLoadError = false;
          updateStatusText();
        };
        image.onerror = () => {
          state.customBgImage = null;
          state.customBgName = "";
          state.bgLoadError = true;
          updateStatusText();
        };
        image.src = url;
      }

      function setTallBackgroundFromUrl(url) {
        if (!url) {
          return;
        }
        const image = new Image();
        try {
          const parsed = new URL(url, window.location.href);
          if (parsed.protocol === "http:" || parsed.protocol === "https:") {
            image.crossOrigin = "anonymous";
          }
        } catch (error) {
          // Ignore URL parse failures and keep default loading behavior.
        }
        image.onload = () => {
          state.tallBgImage = image;
          state.tallBgLoadError = false;
          updateStatusText();
        };
        image.onerror = () => {
          state.tallBgImage = null;
          state.tallBgLoadError = true;
          updateStatusText();
        };
        image.src = url;
      }

      function bindEvents() {
        guiScaleSelect.addEventListener("change", () => {
          applyControlValuesToState();
        });

        window.addEventListener("resize", () => {
          refreshViewportLayoutAndMirrors();
        });

        if (window.visualViewport) {
          window.visualViewport.addEventListener("resize", () => {
            refreshViewportLayoutAndMirrors();
          });
        }

        zoomOutButton.addEventListener("click", () => {
          setScreenZoom(
            state.screenZoom - SCREEN_ZOOM_STEP,
            false,
            state.zoomAnchorClientX,
            state.zoomAnchorClientY
          );
        });

        zoomInButton.addEventListener("click", () => {
          setScreenZoom(
            state.screenZoom + SCREEN_ZOOM_STEP,
            false,
            state.zoomAnchorClientX,
            state.zoomAnchorClientY
          );
        });

        zoomResetButton.addEventListener("click", () => {
          setScreenZoom(1, true);
        });

        viewportWrap.addEventListener("wheel", (event) => {
          if (event.ctrlKey) {
            const delta = event.deltaY < 0 ? SCREEN_ZOOM_STEP : -SCREEN_ZOOM_STEP;
            setScreenZoom(state.screenZoom + delta, false, event.clientX, event.clientY);
            event.preventDefault();
            return;
          }
          if (state.displayVariant !== "tall") {
            return;
          }
          if (state.mirrorSelectionMode || state.mirrorSelectionDrag || state.mirrorColorPick) {
            return;
          }
          const { maxPanX, maxPanY } = getScreenPanLimits();
          if (maxPanX < 0.5 && maxPanY < 0.5) {
            return;
          }
          const modeScale = event.deltaMode === 1 ? 24 : (event.deltaMode === 2 ? 120 : 1);
          const deltaX = event.deltaX * modeScale;
          const deltaY = event.deltaY * modeScale;
          const targetPanY = state.screenPanY - deltaY;
          const targetPanX = state.screenPanX - (event.shiftKey ? deltaY : deltaX);
          state.screenPanY = clamp(targetPanY, -maxPanY, maxPanY);
          state.screenPanX = clamp(targetPanX, -maxPanX, maxPanX);
          updateViewportLayout();
          updateStatusText();
          event.preventDefault();
        }, { passive: false });

        viewportWrap.addEventListener("pointermove", (event) => {
          state.zoomAnchorClientX = event.clientX;
          state.zoomAnchorClientY = event.clientY;
        });

        viewportWrap.addEventListener("pointerleave", () => {
          state.zoomAnchorClientX = null;
          state.zoomAnchorClientY = null;
        });

        viewportWrap.addEventListener("pointerdown", (event) => {
          if (startScreenPanDrag(event)) {
            event.preventDefault();
          }
        });

        viewportWrap.addEventListener("auxclick", (event) => {
          if (event.button === 1) {
            event.preventDefault();
          }
        });

        applyResolutionButton.addEventListener("click", onApplyResolutionClick);

        presetSelect.addEventListener("change", () => {
          if (presetSelect.value === "custom") {
            return;
          }
          const [w, h] = presetSelect.value.split("x").map((value) => Number(value));
          setDisplayVariant("preset");
          setViewportCropMode("contain");
          applyResolution(w, h);
          setBaseResolution(state.windowWidth, state.windowHeight, true);
          applyControlValuesToState();
          renderMirrorPanels();
        });

        wideButton.addEventListener("click", () => {
          runAction(ACTION_KEYS.wide);
        });

        thinButton.addEventListener("click", () => {
          runAction(ACTION_KEYS.thin);
        });

        tallButton.addEventListener("click", () => {
          runAction(ACTION_KEYS.tall);
        });

        openNinjabrainKeybindSet.addEventListener("click", () => {
          setKeybindCaptureAction(ACTION_KEYS.openNinjabrain);
        });
        openNinjabrainKeybindClear.addEventListener("click", () => {
          clearActionKeybind(ACTION_KEYS.openNinjabrain);
        });
        thinKeybindSet.addEventListener("click", () => {
          setKeybindCaptureAction(ACTION_KEYS.thin);
        });
        thinKeybindClear.addEventListener("click", () => {
          clearActionKeybind(ACTION_KEYS.thin);
        });
        wideKeybindSet.addEventListener("click", () => {
          setKeybindCaptureAction(ACTION_KEYS.wide);
        });
        wideKeybindClear.addEventListener("click", () => {
          clearActionKeybind(ACTION_KEYS.wide);
        });
        tallKeybindSet.addEventListener("click", () => {
          setKeybindCaptureAction(ACTION_KEYS.tall);
        });
        tallKeybindClear.addEventListener("click", () => {
          clearActionKeybind(ACTION_KEYS.tall);
        });
        overlayColorAInput.addEventListener("input", () => {
          updateTallOverlayFromControls();
        });
        overlayColorBInput.addEventListener("input", () => {
          updateTallOverlayFromControls();
        });
        overlayTextColorInput.addEventListener("input", () => {
          updateTallOverlayFromControls();
        });
        overlayPixelCountInput.addEventListener("change", () => {
          updateTallOverlayFromControls();
        });
        overlayPixelHeightInput.addEventListener("change", () => {
          updateTallOverlayFromControls();
        });
        overlayOpacityPixelsInput.addEventListener("change", () => {
          updateTallOverlayFromControls();
        });
        overlayOpacityTextInput.addEventListener("change", () => {
          updateTallOverlayFromControls();
        });
        overlayTextSizeInput.addEventListener("change", () => {
          updateTallOverlayFromControls();
        });
        overlayFontStyleSelect.addEventListener("change", () => {
          updateTallOverlayFromControls();
        });
        if (themeBackgroundInput) {
          themeBackgroundTypeSelect.addEventListener("change", () => {
            updateThemeFromControls();
          });
          themeBackgroundInput.addEventListener("change", () => {
            updateThemeFromControls();
          });
          themeBackgroundAlphaInput.addEventListener("change", () => {
            updateThemeFromControls();
          });
          themeBackgroundPngInput.addEventListener("input", () => {
            updateThemeFromControls();
          });
          themeCursorThemeInput.addEventListener("input", () => {
            updateThemeFromControls();
          });
          themeNinbAnchorTypeSelect.addEventListener("change", () => {
            updateThemeFromControls();
          });
          themeNinbAnchorPositionSelect.addEventListener("change", () => {
            updateThemeFromControls();
          });
          themeNinbAnchorXInput.addEventListener("change", () => {
            updateThemeFromControls();
          });
          themeNinbAnchorYInput.addEventListener("change", () => {
            updateThemeFromControls();
          });
          themeNinbOpacityInput.addEventListener("change", () => {
            updateThemeFromControls();
          });
        }
        if (windowFullscreenWidthInput) {
          windowFullscreenWidthInput.addEventListener("change", () => {
            updateWindowSettingsFromControls();
          });
          windowFullscreenHeightInput.addEventListener("change", () => {
            updateWindowSettingsFromControls();
          });
        }
        exportTallOverlayButton.addEventListener("click", () => {
          exportTallOverlayImage();
        });
        if (exportWaywallJsonButton) {
          exportWaywallJsonButton.addEventListener("click", () => {
            exportWaywallConfigJson();
          });
        }

        bindCollapsibleToggle(actionsSettingsToggle, actionsSettingsBody);
        bindCollapsibleToggle(themeSettingsToggle, themeSettingsBody);
        bindCollapsibleToggle(windowSettingsToggle, windowSettingsBody);
        bindCollapsibleToggle(resolutionViewToggle, resolutionViewBody);
        bindCollapsibleToggle(mirrorsToggle, mirrorsBody);

        addMirrorButton.addEventListener("click", () => {
          addMirror({
            x: mirrorXInput.value,
            y: mirrorYInput.value,
            w: mirrorWInput.value,
            h: mirrorHInput.value
          });
        });

        clearMirrorsButton.addEventListener("click", () => {
          clearAllMirrors();
        });

        selectMirrorButton.addEventListener("click", () => {
          setMirrorSelectionMode(!state.mirrorSelectionMode);
        });

        mirrorOverlayLayer.addEventListener("pointerdown", (event) => {
          if (state.mirrorColorPick && event.button === 0) {
            console.log("[mirror-pick] overlay pointerdown while picking", {
              clientX: event.clientX,
              clientY: event.clientY,
              targetClass: event.target?.className || null,
              targetMirrorId: state.mirrorColorPick.mirrorId
            });
            const targetMirror = getMirrorById(state.mirrorColorPick.mirrorId);
            if (targetMirror) {
              let picked = null;
              const overlay = event.target.closest(".mirror-overlay");
              if (overlay) {
                picked = sampleMirrorOverlayColorFromEvent(overlay, event);
                if (!picked) {
                  const sourceMirror = getMirrorById(overlay.dataset.mirrorId);
                  if (sourceMirror) {
                    picked = sampleMirrorSourceColorFromEvent(sourceMirror, overlay, event);
                  }
                }
                if (!picked) {
                  const pointer = getCanvasPointerPosition(event, false);
                  picked = sampleCanvasColor(pointer.x, pointer.y);
                }
              }
              if (!picked) {
                const pointer = getCanvasPointerPosition(event, false);
                picked = sampleCanvasColor(pointer.x, pointer.y);
              }
              console.log("[mirror-pick] overlay picked color result", { picked, targetMirrorId: targetMirror.id });
              if (picked) {
                const added = addMirrorColorKey(targetMirror, picked);
                console.log("[mirror-pick] overlay add result", { added, picked });
                state.suppressNextCanvasClick = true;
                setMirrorColorPickMode(null);
                event.preventDefault();
                return;
              }
            }
            console.log("[mirror-pick] overlay pick failed: no color sampled");
            event.preventDefault();
            return;
          }

          const resizer = event.target.closest(".mirror-overlay-resizer");
          if (resizer) {
            const overlay = resizer.closest(".mirror-overlay");
            if (overlay) {
              startMirrorOverlayResize(event, overlay);
            }
            return;
          }
          const overlay = event.target.closest(".mirror-overlay");
          if (!overlay) {
            return;
          }
          startMirrorOverlayDrag(event, overlay);
        });

        canvas.addEventListener("pointerdown", (event) => {
          if (state.mirrorColorPick && event.button === 0) {
            console.log("[mirror-pick] canvas pointerdown while picking", {
              clientX: event.clientX,
              clientY: event.clientY,
              targetMirrorId: state.mirrorColorPick.mirrorId
            });
            const targetMirror = getMirrorById(state.mirrorColorPick.mirrorId);
            if (targetMirror) {
              const pointer = getCanvasPointerPosition(event, false);
              const picked = sampleCanvasColor(pointer.x, pointer.y);
              console.log("[mirror-pick] canvas picked color result", { picked, targetMirrorId: targetMirror.id });
              if (picked) {
                const added = addMirrorColorKey(targetMirror, picked);
                console.log("[mirror-pick] canvas add result", { added, picked });
                state.suppressNextCanvasClick = true;
                setMirrorColorPickMode(null);
                event.preventDefault();
                return;
              }
            }
            console.log("[mirror-pick] canvas pick failed: no color sampled");
            event.preventDefault();
            return;
          }

          if (!state.mirrorSelectionMode || event.button !== 0) {
            return;
          }
          const pointer = getCanvasPointerPosition(event);
          state.mirrorSelectionDrag = {
            start: pointer,
            current: pointer
          };
          updateMirrorSelectionBox();
          event.preventDefault();
        });

        window.addEventListener("pointermove", (event) => {
          if (state.screenPanDrag) {
            updateScreenPanDrag(event);
            event.preventDefault();
            return;
          }
          if (state.mirrorSelectionDrag) {
            state.mirrorSelectionDrag.current = getCanvasPointerPosition(event);
            updateMirrorSelectionBox();
            event.preventDefault();
            return;
          }
          if (state.mirrorOverlayResize) {
            updateMirrorOverlayResize(event);
            return;
          }
          if (state.mirrorOverlayDrag) {
            updateMirrorOverlayDrag(event);
          }
        });

        window.addEventListener("pointerup", (event) => {
          if (state.screenPanDrag && event.button === 1) {
            endScreenPanDrag();
            event.preventDefault();
            return;
          }
          if (state.mirrorSelectionDrag && event.button === 0) {
            state.mirrorSelectionDrag.current = getCanvasPointerPosition(event);
            finalizeMirrorSelection();
            state.suppressNextCanvasClick = true;
            setMirrorSelectionMode(false);
            event.preventDefault();
            return;
          }
          if (state.mirrorOverlayResize && event.button === 0) {
            endMirrorOverlayResize();
            event.preventDefault();
            return;
          }
          if (state.mirrorOverlayDrag && event.button === 0) {
            endMirrorOverlayDrag();
            event.preventDefault();
          }
        });

        window.addEventListener("keydown", (event) => {
          if (event.key === "Escape" && state.screenPanDrag) {
            endScreenPanDrag();
            event.preventDefault();
            return;
          }
          if (event.key === "Escape" && state.mirrorColorPick) {
            setMirrorColorPickMode(null);
            event.preventDefault();
            return;
          }
          if (event.key === "Escape" && state.mirrorSelectionMode) {
            setMirrorSelectionMode(false);
            event.preventDefault();
            return;
          }
          if (event.key === "Escape" && state.mirrorOverlayDrag) {
            endMirrorOverlayDrag();
            event.preventDefault();
            return;
          }
          if (event.key === "Escape" && state.mirrorOverlayResize) {
            endMirrorOverlayResize();
            event.preventDefault();
            return;
          }
          if (state.keybindCaptureAction) {
            if (event.key === "Escape") {
              state.keybindCaptureAction = "";
              updateActionKeybindUi();
              event.preventDefault();
              return;
            }
            if (["Shift", "Control", "Alt", "Meta"].includes(event.key)) {
              event.preventDefault();
              return;
            }
            setActionKeybind(state.keybindCaptureAction, event.code);
            state.keybindCaptureAction = "";
            updateActionKeybindUi();
            event.preventDefault();
            return;
          }
          if (
            (state.mode === "pie" || state.mode === "f3pie") &&
            !event.ctrlKey &&
            !event.altKey &&
            !event.metaKey &&
            !shouldIgnoreGlobalKeybind(event)
          ) {
            let pieIndex = -1;
            if (event.key >= "0" && event.key <= "9") {
              pieIndex = Number(event.key);
            } else if (/^Digit[0-9]$/.test(event.code) || /^Numpad[0-9]$/.test(event.code)) {
              pieIndex = Number(event.code.slice(-1));
            }
            if (pieIndex >= 0 && pieIndex <= 9) {
              navigatePie(pieIndex);
              event.preventDefault();
              return;
            }
          }
          if (!event.ctrlKey && !event.altKey && !event.metaKey && !shouldIgnoreGlobalKeybind(event)) {
            const actionKey = findActionForCode(event.code);
            if (actionKey) {
              runAction(actionKey);
              event.preventDefault();
              return;
            }
          }
          if (state.mode !== "pie" && state.mode !== "f3pie") {
            return;
          }
        });

        canvas.addEventListener("click", (event) => {
          if (state.suppressNextCanvasClick) {
            state.suppressNextCanvasClick = false;
            return;
          }
          if (state.mirrorSelectionMode || state.mirrorSelectionDrag) {
            return;
          }
          if (state.mode !== "pie" && state.mode !== "f3pie") {
            return;
          }

          const bounds = canvas.getBoundingClientRect();
          const x = (event.clientX - bounds.left) * canvas.width / bounds.width;
          const y = (event.clientY - bounds.top) * canvas.height / bounds.height;

          for (const box of state.lastPieHitboxes) {
            if (x >= box.x && x <= box.x + box.w && y >= box.y && y <= box.y + box.h) {
              navigatePie(box.index + 1);
              break;
            }
          }
        });
      }

      function bootstrapUI() {
        const storedBaseResolution = loadBaseResolutionFromStorage();
        const initialWidth = storedBaseResolution ? storedBaseResolution.width : DEFAULT_RESOLUTION[0];
        const initialHeight = storedBaseResolution ? storedBaseResolution.height : DEFAULT_RESOLUTION[1];

        fillResolutionPresetSelect();
        loadActionKeybindsFromStorage();
        loadThemeSettingsFromStorage();
        loadWindowSettingsFromStorage();
        loadTallOverlaySettingsFromStorage();
        widthInput.value = String(initialWidth);
        heightInput.value = String(initialHeight);
        guiScaleSelect.value = String(state.guiScaleSetting);
        mirrorXInput.value = "0";
        mirrorYInput.value = "0";
        mirrorWInput.value = "320";
        mirrorHInput.value = "180";

        applyResolution(initialWidth, initialHeight);
        setBaseResolution(initialWidth, initialHeight);
        setDisplayVariant("preset");
        setCollapsibleState(resolutionViewToggle, resolutionViewBody, false);
        setCollapsibleState(actionsSettingsToggle, actionsSettingsBody, false);
        setCollapsibleState(themeSettingsToggle, themeSettingsBody, false);
        setCollapsibleState(windowSettingsToggle, windowSettingsBody, false);
        setCollapsibleState(mirrorsToggle, mirrorsBody, false);
        updateActionKeybindUi();
        syncThemeControls();
        syncWindowControls();
        syncTallOverlayControls();
        drawTallEyeOverlay();
        syncPresetFromResolution();
        randomizeSamples();
        loadMirrorsFromStorage();
        renderMirrorPanels();
        setMirrorSelectionMode(false);
        setCustomBackgroundFromUrl(
          FORCED_BACKGROUND_DATA_URL || FORCED_BACKGROUND_URL,
          FORCED_BACKGROUND_URL
        );
        setTallBackgroundFromUrl(FORCED_TALL_BACKGROUND_DATA_URL || FORCED_TALL_BACKGROUND_URL);
        updateStatusText();
        bindEvents();
      }

      let lastFrameMs = performance.now();
      function frame(nowMs) {
        const dtMs = Math.max(0.001, nowMs - lastFrameMs);
        lastFrameMs = nowMs;

        const currentDevicePixelRatio = Math.max(1, window.devicePixelRatio || 1);
        if (Math.abs(currentDevicePixelRatio - state.lastDevicePixelRatio) > 0.001) {
          state.lastDevicePixelRatio = currentDevicePixelRatio;
          refreshViewportLayoutAndMirrors();
        }

        state.tickCount += dtMs;
        pushGraphSamples(dtMs);

        applyControlValuesToState();
        draw(nowMs);
        drawTallEyeOverlay();
        drawMirrorOverlays();
        requestAnimationFrame(frame);
      }

      bootstrapUI();
      window.addEventListener("beforeunload", () => {
        if (state.customBgObjectUrl) {
          URL.revokeObjectURL(state.customBgObjectUrl);
        }
      });
      requestAnimationFrame(frame);
}
