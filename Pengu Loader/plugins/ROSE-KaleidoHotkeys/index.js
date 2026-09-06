/**
 * @name Kaleido-Hotkeys
 * @author Krealos
 * @description Champ select hotkeys (recent skins, favorites) and Kaleido toasts
 */
(() => {
  const LOG_PREFIX = "[Kaleido-Hotkeys]";
  const TOAST_ID = "kaleido-toast-layer";

  // ---- Kaleido i18n (shared key with ROSE-SettingsPanel) ----
  const KALEIDO_I18N_ES = {
    "Hover a skin first": "Pasa el cursor por una skin primero",
    "Lock a champion first": "Bloquea un campeón primero",
    "No recent skins for this champion": "No hay skins recientes para este campeón",
    "Skin not available for this champion": "Esa skin no está disponible para este campeón",
    "Selection already in progress": "Ya hay una selección en curso",
    "Could not apply the skin": "No se pudo aplicar la skin",
    "Your friend has not picked a skin yet": "Tu amigo aún no ha elegido skin",
    "Your friend plays another champion": "Tu amigo juega otro campeón",
    "Invalid friend": "Amigo no válido",
    "Invalid skin id": "Id de skin no válido",
    "Restarting Kaleido to install the update…": "Reiniciando Kaleido para instalar la actualización…",
    "Could not prepare the update: {0}": "No se pudo preparar la actualización: {0}",
    "Party mode not enabled": "El modo Party no está activado",
    "No matching theme for your champion": "Tu campeón no tiene skin de esa temática",
    "No party color set": "No hay color de party",
    "The base skin has no chromas": "La skin base no tiene chromas",
    "This skin has no chromas": "Esta skin no tiene chromas",
    "Unknown color": "Color desconocido",
    "Friend not connected": "Ese amigo no está conectado",
    "No pending challenge": "No hay ningún reto pendiente",
    "Challenge ignored": "Reto ignorado",
    "Your friend picked a skin of another champion": "Tu amigo eligió una skin de otro campeón",
    "Your champion has no themed skins": "Tu campeón no tiene skins temáticas",
    "Party color cleared": "Color de party quitado",
    "color": "color", "red": "rojo", "blue": "azul", "green": "verde", "yellow": "amarillo", "purple": "morado",
    "pink": "rosa", "orange": "naranja", "white": "blanco", "black": "negro",
  };
  function kt(text) {
    let lang = "es";
    try { const v = localStorage.getItem("kaleido-lang"); if (v === "en" || v === "es") lang = v; } catch (e) {}
    return (lang === "es" && Object.prototype.hasOwnProperty.call(KALEIDO_I18N_ES, text)) ? KALEIDO_I18N_ES[text] : text;
  }

  let bridge = null;
  let currentPhase = null;

  function log(level, message, data) {
    try {
      const fn = console[level] || console.log;
      if (data !== undefined) fn(`${LOG_PREFIX} ${message}`, data); else fn(`${LOG_PREFIX} ${message}`);
    } catch (e) {}
  }

  function waitForBridge(timeout = 30000) {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      const tick = () => {
        if (window.__roseBridge) return resolve(window.__roseBridge);
        if (Date.now() - start >= timeout) return reject(new Error("Bridge not available"));
        setTimeout(tick, 200);
      };
      tick();
    });
  }

  // ------------------------------------------------------------------ toasts
  function ensureToastLayer() {
    let layer = document.getElementById(TOAST_ID);
    if (layer) return layer;
    layer = document.createElement("div");
    layer.id = TOAST_ID;
    layer.style.cssText = [
      "position:fixed", "left:50%", "bottom:120px", "transform:translateX(-50%)",
      "z-index:100000", "display:flex", "flex-direction:column", "gap:6px",
      "pointer-events:none", "align-items:center",
    ].join(";");
    document.body.appendChild(layer);
    return layer;
  }

  function showToast(text, kind) {
    try {
      const layer = ensureToastLayer();
      const el = document.createElement("div");
      const color = kind === "error" ? "#ff8a80" : kind === "success" ? "#f0e6d2" : "#cdbe91";
      const border = kind === "error" ? "#c0392b" : kind === "success" ? "#8b5cf6" : "#463714";
      el.textContent = text;
      el.style.cssText = [
        "background:rgba(1,10,19,0.94)", `border:1px solid ${border}`, `color:${color}`,
        "font-family:'Beaufort for LOL', serif", "font-size:13px", "letter-spacing:0.03em",
        "padding:8px 14px", "box-shadow:0 4px 18px rgba(0,0,0,0.6)", "opacity:0",
        "transition:opacity 160ms ease, transform 160ms ease", "transform:translateY(6px)",
        "max-width:420px", "text-align:center",
      ].join(";");
      layer.appendChild(el);
      requestAnimationFrame(() => { el.style.opacity = "1"; el.style.transform = "translateY(0)"; });
      setTimeout(() => {
        el.style.opacity = "0"; el.style.transform = "translateY(6px)";
        setTimeout(() => el.remove(), 200);
      }, 2600);
    } catch (e) {
      log("warn", "toast failed", e);
    }
  }

  // ------------------------------------------------------------------ hotkeys
  function isTypingTarget(target) {
    if (!target) return false;
    const tag = (target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select") return true;
    return !!target.isContentEditable;
  }

  function onKeyDown(e) {
    if (!bridge || !e.ctrlKey || e.altKey || e.metaKey) return;
    if (isTypingTarget(e.target)) return;
    if (currentPhase && currentPhase !== "ChampSelect" && currentPhase !== "FINALIZATION") return;

    let handled = false;
    if (e.key === "ArrowRight") {
      bridge.send({ type: "cycle-recent-skin", direction: "next" });
      handled = true;
    } else if (e.key === "ArrowLeft") {
      bridge.send({ type: "cycle-recent-skin", direction: "prev" });
      handled = true;
    } else if ((e.key === "f" || e.key === "F") && !e.shiftKey) {
      bridge.send({ type: "favorite-toggle" });
      handled = true;
    } else if ((e.key === "t" || e.key === "T") && !e.shiftKey) {
      bridge.send({ type: "party-match-theme" });
      handled = true;
    }
    if (handled) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  async function init() {
    try {
      bridge = await waitForBridge();
    } catch (err) {
      log("warn", "bridge unavailable, hotkeys disabled");
      return;
    }
    bridge.subscribe("phase-change", (payload) => {
      currentPhase = payload && payload.phase ? String(payload.phase) : currentPhase;
    });
    bridge.subscribe("kaleido-toast", (payload) => {
      if (!payload || !payload.text) return;
      let text = String(payload.text);
      const colorMatch = text.match(/^(.*): color ([a-z]+)$/);
      if (colorMatch) text = `${colorMatch[1]}: ${kt("color")} ${kt(colorMatch[2])}`;
      showToast(kt(text), payload.kind || "info");
    });
    document.addEventListener("keydown", onKeyDown, true);
    log("info", "hotkeys ready (Ctrl+Left/Right recent skins, Ctrl+F favorite, Ctrl+T match party theme)");
  }

  if (typeof document === "undefined") return;
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => { init().catch((e) => log("error", "init failed", e)); }, { once: true });
  } else {
    init().catch((e) => log("error", "init failed", e));
  }
})();
