/**
 * @name Rose-SettingsPanel
 * @author Krealos
 * @description Settings panel for Kaleido
 * @link https://github.com/FlorentTariolle/ROSE-SettingsPanel
 */
(function initSettingsPanel() {
  const LOG_PREFIX = "[Rose-SettingsPanel]";

  // ---------------------------------------------------------------------
  // Kaleido i18n: UI strings are written in English in the code and looked
  // up in KALEIDO_I18N. Unknown strings fall back to English.
  // ---------------------------------------------------------------------
  const LANG_STORAGE_KEY = "kaleido-lang";
  const KALEIDO_I18N = {
    es: {
      "Settings": "Ajustes",
      "Language": "Idioma",
      "Injection Threshold (seconds):": "Umbral de inyección (segundos):",
      "Injection threshold info": "Información del umbral de inyección",
      "Injection threshold is the time window during which the app considers your last hovered skin as the one to inject.\n\nFor example, if your injection threshold is set to 1 second, whichever skin you were hovering 1 second before champ select ends will be the one injected.\n\nIf your PC or connection is on the slower side, you may need to fine-tune this value.":
        "El umbral de inyección es la ventana de tiempo en la que la app toma la última skin sobre la que pasaste el cursor como la que va a inyectar.\n\nPor ejemplo, con un umbral de 1 segundo, se inyectará la skin que estuvieras mirando 1 segundo antes de que termine la selección de campeón.\n\nSi tu PC o tu conexión son lentos, quizá tengas que ajustar este valor.",
      "Monitor Auto-Resume Timeout (seconds):": "Tiempo máximo de reanudación automática (segundos):",
      "Auto-resume info": "Información de la reanudación automática",
      "Auto-resume is a safety feature.\n\nIf the injection process takes longer than the value you set, the app will automatically cancel the injection and let the game start normally.\n\nThis prevents the injection from looping and blocking the game from launching.\n\nIf you use a lot of custom mods, you may need to adjust this value.":
        "La reanudación automática es una medida de seguridad.\n\nSi la inyección tarda más que el valor que fijes, la app la cancela sola y deja que el juego arranque con normalidad.\n\nAsí se evita que la inyección se quede en bucle y bloquee el inicio de la partida.\n\nSi usas muchos mods personalizados, quizá tengas que subir este valor.",
      "Start automatically with Windows:": "Iniciar automáticamente con Windows:",
      "Enable auto-start": "Activar inicio automático",
      "Privacy and updates:": "Privacidad y actualizaciones:",
      "Send anonymous usage statistics": "Enviar estadísticas de uso anónimas",
      "Telemetry info": "Información de telemetría",
      "Only a random installation ID, the app version and start/heartbeat/close events are sent. Nothing about your account or your games. Off by default.":
        "Solo se envía un ID de instalación aleatorio, la versión de la app y eventos de inicio, presencia y cierre. Nada sobre tu cuenta ni tus partidas. Desactivado por defecto.",
      "Check for updates on startup": "Buscar actualizaciones al iniciar",
      "League of Legends Game Path:": "Ruta del juego League of Legends:",
      "Add custom mods": "Añadir mods personalizados",
      "Add Custom Mods": "Añadir mods personalizados",
      "Skins": "Skins",
      "Maps": "Mapas",
      "Fonts": "Fuentes",
      "Announcers": "Locutores",
      "UI": "Interfaz",
      "Voiceover": "Voces",
      "Loading Screen": "Pantalla de carga",
      "VFX": "Efectos visuales",
      "SFX": "Efectos de sonido",
      "Others": "Otros",
      "Open Logs Folder": "Abrir carpeta de registros",
      "Troubleshooting": "Solución de problemas",
      "Open Pengu Loader UI": "Abrir interfaz de Pengu Loader",
      "Save": "Guardar",
      "Saved!": "¡Guardado!",
      "Error saving settings": "Error al guardar los ajustes",
      "Go back": "Volver",
      "Select Champion": "Elegir campeón",
      "Search champions...": "Buscar campeones...",
      "Loading champions...": "Cargando campeones...",
      "No champions found matching your search.": "No hay campeones que coincidan con tu búsqueda.",
      "No champions found. Please ensure League of Legends client is running.": "No se encontraron campeones. Asegúrate de que el cliente de League of Legends esté abierto.",
      "Select Skins & Chromas": "Elegir skins y chromas",
      "Loading skins...": "Cargando skins...",
      "No skins found for this champion.": "No se encontraron skins para este campeón.",
      "Confirm & Select Mod": "Confirmar y elegir mod",
      "Base skin": "Skin base",
      "Back to skin": "Volver a la skin",
      "{count} target selected": "{count} objetivo seleccionado",
      "{count} targets selected": "{count} objetivos seleccionados",
      "Chromas {n}": "Chromas {n}",
      "Show {n} chromas": "Mostrar {n} chromas",
      "Close": "Cerrar",
      "Loading…": "Cargando…",
      "No recent errors.": "No hay errores recientes.",
      "If something feels off, open the logs folder and share the latest log in a discord ticket.": "Si algo no va bien, abre la carpeta de registros y comparte el último registro en un ticket de Discord.",
      "Errors (most recent first)": "Errores (el más reciente primero)",
      "Tip: after changing a setting, click": "Consejo: después de cambiar un ajuste, pulsa",
      "then retry.": "y vuelve a intentarlo.",
      "No additional details.": "Sin más detalles.",
      "(unknown error)": "(error desconocido)",
      "Base skin verification failed (selected skin may not apply)": "Falló la verificación de la skin base (puede que la skin elegida no se aplique)",
      "Base skin forcing took too long (skin may not appear)": "Forzar la skin base tardó demasiado (puede que la skin no aparezca)",
      "What it means: the client didn't confirm the base skin change in time.": "Qué significa: el cliente no confirmó a tiempo el cambio a la skin base.",
      "What it means: forcing the base skin took too long, so the selected skin may not show.": "Qué significa: forzar la skin base tardó demasiado, así que la skin elegida puede no verse.",
      "Fix: you're already at the maximum Injection Threshold. This usually means the injection is extremely slow. Try lighter mods, close heavy apps, move League/mods to an SSD, and consider adding antivirus exclusions for the League and Kaleido folders. Then retry.":
        "Solución: ya estás en el umbral de inyección máximo. Suele significar que la inyección es extremadamente lenta. Prueba mods más ligeros, cierra apps pesadas, mueve League y los mods a un SSD y añade exclusiones del antivirus para las carpetas de League y Kaleido. Luego vuelve a intentarlo.",
      "Fix: based on {games} game(s), base skin confirmation takes up to {p90}ms (p90). Recommended threshold: {rec}s. Use the \"Apply recommended\" button below, or increase \"Injection Threshold\" manually.":
        "Solución: según {games} partida(s), confirmar la skin base tarda hasta {p90} ms (p90). Umbral recomendado: {rec} s. Usa el botón \"Aplicar\" de abajo o sube el umbral de inyección a mano.",
      "Fix: increase \"Injection Threshold (seconds)\" and click Save. If the warning is still there, increase it again and Save again. Once the warning is gone, retry your skin selection.":
        "Solución: sube el umbral de inyección y pulsa Guardar. Si el aviso sigue, súbelo otra vez y guarda de nuevo. Cuando desaparezca, vuelve a elegir tu skin.",
      "Injection exceeded the timeout (process was stopped)": "La inyección superó el tiempo máximo (se detuvo el proceso)",
      "What it means: injection took longer than the allowed time, so ROSE stopped the process.": "Qué significa: la inyección tardó más de lo permitido, así que Kaleido detuvo el proceso.",
      "Fix: you're already at the maximum Monitor Auto-Resume Timeout. This usually means the injection is extremely slow. Try lighter mods, close heavy apps, move League/mods to an SSD, and consider adding antivirus exclusions for the League and Kaleido folders. Then retry.":
        "Solución: ya estás en el tiempo máximo de reanudación automática. Suele significar que la inyección es extremadamente lenta. Prueba mods más ligeros, cierra apps pesadas, mueve League y los mods a un SSD y añade exclusiones del antivirus para las carpetas de League y Kaleido. Luego vuelve a intentarlo.",
      "Fix: increase \"Monitor Auto-Resume Timeout (seconds)\" and click Save. If the warning is still there, increase it again and Save again. Once the warning is gone, try again.":
        "Solución: sube el tiempo máximo de reanudación automática y pulsa Guardar. Si el aviso sigue, súbelo otra vez y guarda de nuevo. Cuando desaparezca, vuelve a intentarlo.",
      "Not enough disk space for injection": "No hay espacio en disco suficiente para la inyección",
      "What it means: Kaleido could not create the overlay for the selected skin.": "Qué significa: Kaleido no pudo crear el overlay de la skin elegida.",
      "Fix: free up space on the drive containing Kaleido injection files, then retry. Map mods can require several GB.": "Solución: libera espacio en la unidad donde están los archivos de inyección de Kaleido y vuelve a intentarlo. Los mods de mapa pueden ocupar varios GB.",
      "Based on {label}, we recommend": "Según {label}, recomendamos",
      "Your threshold looks good (based on {label})": "Tu umbral va bien (según {label})",
      "{n} game": "{n} partida",
      "{n} games": "{n} partidas",
      "Apply": "Aplicar",
      "Applied!": "¡Aplicado!",
      // Profiles
      "Skin profiles:": "Perfiles de skins:",
      "Profiles info": "Información de perfiles",
      "Every skin you play with is saved into the active profile (that is what Historic Mode uses to bring it back). Create several profiles, for example Ranked, ARAM or Tryhard, and switch between them to keep different skin combos per champion. Changing profiles applies from the next champion select.":
        "Cada skin con la que juegas se guarda en el perfil activo (es lo que usa el modo histórico para volver a ponértela). Crea varios perfiles, por ejemplo Ranked, ARAM o Tryhard, y cambia entre ellos para tener combos de skins distintos por campeón. El cambio se aplica a partir de la siguiente selección de campeón.",
      "Active profile": "Perfil activo",
      "New": "Nuevo",
      "Rename": "Renombrar",
      "Delete": "Eliminar",
      "Confirm delete?": "¿Confirmar borrado?",
      "Create": "Crear",
      "Cancel": "Cancelar",
      "Profile name": "Nombre del perfil",
      "Copy current skins into the new profile": "Copiar las skins actuales al perfil nuevo",
      "This profile has no saved skins yet. Play a game with a skin and it will appear here.": "Este perfil aún no tiene skins guardadas. Juega una partida con una skin y aparecerá aquí.",
      "{n} champion": "{n} campeón",
      "{n} champions": "{n} campeones",
      "Remove from profile": "Quitar del perfil",
      "Custom mod": "Mod personalizado",
      "Champion {id}": "Campeón {id}",
      "Skin {id}": "Skin {id}",
      "Chroma {id}": "Chroma {id}",
      "Profile not found": "Perfil no encontrado",
      "Invalid profile name": "Nombre de perfil no válido",
      "A profile with that name already exists": "Ya existe un perfil con ese nombre",
      "Cannot delete the last profile": "No se puede eliminar el último perfil",
      "Could not write historic files": "No se pudieron escribir los archivos del historial",
      "Could not save profiles file": "No se pudo guardar el archivo de perfiles",
      "Profiles are not available (backend too old).": "Los perfiles no están disponibles (backend antiguo).",
      "Random skin:": "Skin aleatoria:",
      "Random skin info": "Información de la skin aleatoria",
      "Controls which skins the dice button can pick: all of them, only your favorites of that champion, or only the skins saved for that champion in any profile. Falls back to all skins when the pool is empty.":
        "Controla entre qué skins elige el botón del dado: todas, solo tus favoritas de ese campeón, o solo las skins guardadas para ese campeón en cualquier perfil. Si no hay ninguna, usa todas.",
      "All skins": "Todas las skins",
      "Only favorites": "Solo favoritas",
      "Only profile skins": "Solo skins de perfiles",
      "Automatic rules": "Reglas automáticas",
      "Automatic rules info": "Información de las reglas automáticas",
      "Pick a profile per game mode or per assigned role. When a champion select starts, Kaleido switches to the matching profile by itself. Role rules win over mode rules.":
        "Elige un perfil por modo de juego o por rol asignado. Al empezar una selección de campeón, Kaleido cambia solo al perfil que corresponda. Las reglas por rol tienen prioridad sobre las de modo.",
      "By game mode": "Por modo de juego",
      "By role": "Por rol",
      "Summoner's Rift": "Grieta del Invocador",
      "ARAM": "ARAM",
      "URF": "URF",
      "Arena": "Arena",
      "Swiftplay": "Swiftplay",
      "Other modes": "Otros modos",
      "Top": "Superior",
      "Jungle": "Jungla",
      "Mid": "Central",
      "Bot": "Inferior",
      "Support": "Soporte",
      "No rule": "Sin regla",
      "Export": "Exportar",
      "Import": "Importar",
      "Profile code copied to clipboard": "Código del perfil copiado al portapapeles",
      "Copy this code and share it": "Copia este código y compártelo",
      "Paste a profile code (KPROF1:...)": "Pega un código de perfil (KPROF1:...)",
      "Activate after importing": "Activar al importar",
      "Invalid profile code": "Código de perfil no válido",
      "Favorites:": "Favoritas:",
      "Favorites info": "Información de favoritas",
      "Press Ctrl+F while hovering a skin in champion select to mark it as a favorite. Favorites can be applied with one click during champion select and used by the dice.":
        "Pulsa Ctrl+F mientras pasas el cursor por una skin en la selección de campeón para marcarla como favorita. Las favoritas se aplican con un clic durante la selección y las puede usar el dado.",
      "No favorites yet. Hover a skin in champion select and press Ctrl+F.": "Aún no hay favoritas. Pasa el cursor por una skin en la selección de campeón y pulsa Ctrl+F.",
      "Apply": "Aplicar",
      "Remove from favorites": "Quitar de favoritas",
      "Match history:": "Historial de partidas:",
      "History info": "Información del historial",
      "Every injected skin is recorded here with the game mode and, when the client reports it, the result.":
        "Cada skin inyectada se registra aquí con el modo de juego y, cuando el cliente lo informa, el resultado.",
      "No games recorded yet.": "Todavía no hay partidas registradas.",
      "Clear history": "Limpiar historial",
      "Win": "Victoria",
      "Loss": "Derrota",
      "Remake": "Remake",
      "Pending": "Pendiente",
      "Shortcuts in champion select: Ctrl+← / Ctrl+→ cycle recent skins · Ctrl+F favorite the hovered skin · Ctrl+T match a party friend's theme":
        "Atajos en la selección de campeón: Ctrl+← / Ctrl+→ recorre skins recientes · Ctrl+F marca la skin como favorita · Ctrl+T iguala la temática de un amigo de la party",
      "Loaded": "Cargado",
      "Party relay server:": "Servidor del modo Party (relay):",
      "Party relay info": "Información del servidor Party",
      "Party mode needs a small relay server on Cloudflare (the relay-worker folder of the repo). Paste its URL here (wss://... or https://...). Everyone in the party must use the same server. Leave empty to use the one built into this version, if any.":
        "El modo Party necesita un pequeño servidor relay en Cloudflare (la carpeta relay-worker del repo). Pega aquí su URL (wss://... o https://...). Todos los de la party deben usar el mismo servidor. Déjalo vacío para usar el que trae esta versión, si lo hay.",
      "No relay server configured. Party mode will not connect.": "No hay servidor relay configurado. El modo Party no podrá conectarse.",
      "Relay server ready": "Servidor relay listo",
      "Check for updates": "Buscar actualizaciones",
      "Checking…": "Buscando…",
      "You are up to date ({version})": "Estás al día ({version})",
      "Version {version} available": "Versión {version} disponible",
      "Update now": "Actualizar ahora",
      "Could not reach GitHub": "No se pudo conectar con GitHub",
      "Kaleido will restart and install the update.": "Kaleido se reiniciará e instalará la actualización.",
      "Kaleido {version} available": "Kaleido {version} disponible",
      "Restarting Kaleido to install the update…": "Reiniciando Kaleido para instalar la actualización…",
    },
  };
  let currentLang = "es";
  try {
    const stored = localStorage.getItem(LANG_STORAGE_KEY);
    if (stored === "en" || stored === "es") currentLang = stored;
  } catch (e) {}
  function t(text, vars) {
    const dict = KALEIDO_I18N[currentLang];
    let out = (dict && Object.prototype.hasOwnProperty.call(dict, text)) ? dict[text] : text;
    if (vars) {
      Object.keys(vars).forEach((k) => {
        out = out.split(`{${k}}`).join(String(vars[k]));
      });
    }
    return out;
  }
  function setLanguage(lang) {
    currentLang = lang === "en" ? "en" : "es";
    try { localStorage.setItem(LANG_STORAGE_KEY, currentLang); } catch (e) {}
  }
  let _lastNavItem = null;
  let profilesState = { active: "", profiles: [], entries: [], error: null, available: true };
  let _championNames = null;
  let _championNamesPromise = null;
  function loadChampionNames() {
    if (_championNames) return Promise.resolve(_championNames);
    if (_championNamesPromise) return _championNamesPromise;
    _championNamesPromise = fetch("/lol-game-data/assets/v1/champion-summary.json")
      .then((r) => (r.ok ? r.json() : []))
      .then((list) => {
        const map = {};
        (Array.isArray(list) ? list : []).forEach((c) => {
          if (c && typeof c.id === "number" && c.id > 0) map[c.id] = c.name;
        });
        _championNames = map;
        return map;
      })
      .catch(() => {
        _championNamesPromise = null;
        return {};
      });
    return _championNamesPromise;
  }
  const DISCORD_INVITE_URL = "https://discord.gg/bsb8yEAMpE";
  const GITHUB_URL = "https://github.com/Niyr-coder/Kaleido";

  const PANEL_ID = "rose-settings-panel";
  const FLYOUT_ID = "rose-settings-flyout";

  /**
   * Escape HTML special characters to prevent XSS (CWE-79)
   * @param {string} str - String to escape
   * @returns {string} Escaped string safe for innerHTML
   */
  function escapeHtml(str) {
    if (typeof str !== 'string') return str;
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  let bridge = null;

  function waitForBridge() {
    return new Promise((resolve, reject) => {
      const timeout = 10000;
      const interval = 50;
      let elapsed = 0;
      const check = () => {
        if (window.__roseBridge) return resolve(window.__roseBridge);
        elapsed += interval;
        if (elapsed >= timeout) return reject(new Error("Bridge not available"));
        setTimeout(check, interval);
      };
      check();
    });
  }

  let settingsPanel = null;
  let currentSettings = {
    threshold: 0.5,
    monitorAutoResumeTimeout: 60,
    autostart: false,
    gamePath: "",
    gamePathValid: false,
    version: "",
  };
  let pathValidationTimeout = null;

  function getKaleidoCSS() {
    return `
      .kaleido-lang-row { display:flex; align-items:center; justify-content:center; gap:6px; margin-bottom:10px; font-family:'Beaufort for LOL', serif; }
      .kaleido-lang-label { font-size:11px; color:#a09b8c; letter-spacing:0.06em; text-transform:uppercase; margin-right:4px; }
      .kaleido-lang-btn { background:transparent; border:1px solid #463714; color:#a09b8c; font-family:'Beaufort for LOL', serif; font-size:11px; padding:2px 8px; cursor:pointer; letter-spacing:0.04em; }
      .kaleido-lang-btn:hover { color:#f0e6d2; border-color:#c89b3c; }
      .kaleido-lang-btn.active { color:#f0e6d2; border-color:#c89b3c; background:rgba(200,155,60,0.12); cursor:default; }
      .kaleido-profiles-row { display:flex; align-items:center; gap:6px; margin-top:8px; width:100%; }
      .kaleido-select { flex:1 1 auto; min-width:0; background:#1e2328; color:#cdbe91; border:1px solid #463714; font-family:'Beaufort for LOL', serif; font-size:12px; padding:4px 6px; height:28px; }
      .kaleido-select:focus { outline:none; border-color:#c89b3c; }
      .kaleido-select option { background:#1e2328; color:#cdbe91; }
      .kaleido-btn { background:#1e2328; border:1px solid #463714; color:#cdbe91; font-family:'Beaufort for LOL', serif; font-size:11px; padding:0 10px; height:28px; cursor:pointer; white-space:nowrap; letter-spacing:0.03em; }
      .kaleido-btn:hover { border-color:#c89b3c; color:#f0e6d2; }
      .kaleido-btn.primary { border-color:#c89b3c; color:#f0e6d2; }
      .kaleido-btn.danger { border-color:#c0392b; color:#ff8a80; }
      .kaleido-btn.disabled { opacity:0.4; cursor:default; }
      .kaleido-profiles-editor { display:flex; flex-direction:column; gap:6px; margin-top:8px; padding:8px; border:1px solid rgba(70,55,20,0.6); background:rgba(1,10,19,0.35); width:100%; box-sizing:border-box; }
      .kaleido-profile-input { width:100%; box-sizing:border-box; }
      .kaleido-copy-wrap { font-size:11px; }
      .kaleido-profiles-error { margin-top:6px; color:#ff8a80; font-family:'Beaufort for LOL', serif; font-size:11px; }
      .kaleido-profiles-list { margin-top:8px; max-height:150px; overflow-y:auto; width:100%; border:1px solid rgba(70,55,20,0.5); background:rgba(1,10,19,0.3); box-sizing:border-box; }
      .kaleido-profiles-empty { padding:10px; color:#a09b8c; font-family:'Beaufort for LOL', serif; font-size:11px; text-align:center; }
      .kaleido-profile-entry { display:flex; align-items:center; gap:8px; padding:4px 8px; border-bottom:1px solid rgba(70,55,20,0.35); }
      .kaleido-profile-entry:last-child { border-bottom:none; }
      .kaleido-profile-icon { width:26px; height:26px; border-radius:50%; border:1px solid #463714; flex:0 0 auto; }
      .kaleido-profile-text { flex:1 1 auto; min-width:0; font-family:'Beaufort for LOL', serif; }
      .kaleido-profile-champ { font-size:12px; color:#f0e6d2; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
      .kaleido-profile-skin { font-size:11px; color:#a09b8c; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
      .kaleido-entry-remove { flex:0 0 auto; background:transparent; border:1px solid transparent; color:#a09b8c; font-size:16px; line-height:1; width:22px; height:22px; cursor:pointer; }
      .kaleido-entry-remove:hover { color:#ff8a80; border-color:#c0392b; }
      .kaleido-btn.small { height:22px; padding:0 8px; font-size:10px; }
      .kaleido-select.small { height:22px; font-size:11px; padding:0 4px; }
      .kaleido-subtitle { display:flex; align-items:center; gap:4px; margin-top:10px; font-family:'Beaufort for LOL', serif; font-size:11px; color:#c8aa6e; letter-spacing:0.06em; text-transform:uppercase; }
      .kaleido-rules-grid { display:grid; grid-template-columns:1fr 1fr; gap:6px 12px; width:100%; margin-top:6px; }
      .kaleido-rule-head { font-family:'Beaufort for LOL', serif; font-size:10px; color:#a09b8c; letter-spacing:0.06em; text-transform:uppercase; margin-bottom:4px; }
      .kaleido-rule-row { display:flex; align-items:center; gap:6px; margin-bottom:4px; }
      .kaleido-rule-label { flex:0 0 78px; font-family:'Beaufort for LOL', serif; font-size:11px; color:#cdbe91; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
      .kaleido-rule-row .kaleido-select { flex:1 1 auto; min-width:0; }
      .kaleido-hint { margin-top:6px; font-family:'Beaufort for LOL', serif; font-size:10px; color:#7e6f4e; text-align:center; line-height:1.4; }
      .kaleido-result { flex:0 0 auto; font-family:'Beaufort for LOL', serif; font-size:10px; letter-spacing:0.05em; padding:2px 6px; border:1px solid #463714; color:#a09b8c; text-transform:uppercase; }
      .kaleido-result.win { color:#5b9a32; border-color:#5b9a32; }
      .kaleido-result.loss { color:#ff8a80; border-color:#c0392b; }
      .kaleido-result.remake { color:#c8aa6e; border-color:#c8aa6e; }
      .kaleido-history-list { max-height:180px; }
      .kaleido-update-badge { position:absolute; top:-8px; left:-8px; min-width:16px; height:16px; padding:0 4px; box-sizing:border-box; border-radius:8px; background:#8b5cf6; color:#fff; font:700 10px/16px 'Beaufort for LOL', serif; text-align:center; box-shadow:0 0 0 2px #010a13, 0 0 8px rgba(139,92,246,0.8); pointer-events:none; }
      .kaleido-update-dot { display:inline-block; margin-left:6px; min-width:14px; height:14px; padding:0 3px; box-sizing:border-box; border-radius:7px; background:#8b5cf6; color:#fff; font:700 9px/14px 'Beaufort for LOL', serif; text-align:center; vertical-align:middle; }
    `;
  }

  function getCSSRules() {
    return getKaleidoCSS() + `
    @keyframes roseWarningPulse {
      0%   { filter: drop-shadow(0 0 0 rgba(255, 70, 70, 0.00)) drop-shadow(0 0 0 rgba(255, 70, 70, 0.00)); opacity: 0.95; }
      50%  { filter: drop-shadow(0 0 6px rgba(255, 70, 70, 0.90)) drop-shadow(0 0 12px rgba(255, 70, 70, 0.45)); opacity: 1.00; }
      100% { filter: drop-shadow(0 0 0 rgba(255, 70, 70, 0.00)) drop-shadow(0 0 0 rgba(255, 70, 70, 0.00)); opacity: 0.95; }
    }

    .rose-warning-glow {
      animation: roseWarningPulse 1.35s ease-in-out infinite;
      will-change: filter, opacity;
    }

    @font-face {
      font-family: "Beaufort for LOL";
      src: url("http://127.0.0.1:${window.__roseBridge ? window.__roseBridge.port : 50000}/asset/BeaufortforLOL-Regular.ttf") format("truetype");
      font-weight: normal;
      font-style: normal;
      font-display: swap;
    }
    
    @font-face {
      font-family: "Beaufort for LOL";
      src: url("http://127.0.0.1:${window.__roseBridge ? window.__roseBridge.port : 50000}/asset/BeaufortforLOL-Bold.ttf") format("truetype");
      font-weight: bold;
      font-style: normal;
      font-display: swap;
    }

    /* Diagnostics / Troubleshooting dialog scrollbar (avoid native Windows scrollbar look) */
    #rose-diagnostics-body {
      scrollbar-width: thin;
      scrollbar-color: #463714 rgba(0, 0, 0, 0.25);
    }

    #rose-diagnostics-body::-webkit-scrollbar {
      width: 10px;
    }

    #rose-diagnostics-body::-webkit-scrollbar:horizontal {
      display: none !important;
      height: 0 !important;
    }

    #rose-diagnostics-body::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.25);
      border-left: 1px solid rgba(70, 55, 20, 0.55);
    }

    #rose-diagnostics-body::-webkit-scrollbar-thumb {
      background: linear-gradient(to bottom, rgba(200, 155, 60, 0.22), rgba(70, 55, 20, 0.85));
      border: 1px solid rgba(70, 55, 20, 0.95);
      border-radius: 10px;
      min-height: 28px;
    }

    #rose-diagnostics-body::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(to bottom, rgba(200, 155, 60, 0.32), rgba(70, 55, 20, 0.95));
    }

    #rose-diagnostics-body::-webkit-scrollbar-corner {
      background: transparent;
    }
    
    #${PANEL_ID} {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 10000;
      pointer-events: none;
    }
    
    #${PANEL_ID} .flyout-container {
      pointer-events: all;
    }
    
    lol-uikit-flyout-frame#${FLYOUT_ID},
    #${FLYOUT_ID} {
      min-width: 360px !important;
      max-width: 400px !important;
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
      border-radius: 0 !important;
      padding: 0 !important;
      color: #cdbe91;
      font-family: "Beaufort for LOL", serif;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      box-shadow: none !important;
      border: none !important;
      margin: 0 !important;
      overflow: visible !important;
      transform-origin: top center !important;
    }
    
    lol-uikit-flyout-frame#${FLYOUT_ID}::before,
    lol-uikit-flyout-frame#${FLYOUT_ID}::after,
    #${FLYOUT_ID}::before,
    #${FLYOUT_ID}::after {
      display: none !important;
      background: none !important;
      background-color: transparent !important;
      background-image: none !important;
      content: none !important;
    }
    
    lol-uikit-flyout-frame#${FLYOUT_ID} lc-flyout-content,
    lol-uikit-flyout-frame#${FLYOUT_ID} .lc-flyout-content,
    #${FLYOUT_ID} lc-flyout-content,
    #${FLYOUT_ID} .lc-flyout-content {
      background: #010a13 !important;
      background-color: #010a13 !important;
      background-image: none !important;
      border-radius: 0 !important;
      padding: 20px !important;
      width: 100% !important;
      box-sizing: border-box !important;
      border: none !important;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5) !important;
      margin: 0 !important;
      /* Kaleido: the panel grew (profiles, favorites, history); scroll inside instead of overflowing the client */
      max-height: calc(100vh - 140px) !important;
      overflow-y: auto !important;
      overflow-x: hidden !important;
      scrollbar-width: thin;
      scrollbar-color: #463714 transparent;
    }
    #${FLYOUT_ID} lc-flyout-content::-webkit-scrollbar,
    #${FLYOUT_ID} .lc-flyout-content::-webkit-scrollbar { width: 6px; }
    #${FLYOUT_ID} lc-flyout-content::-webkit-scrollbar-thumb,
    #${FLYOUT_ID} .lc-flyout-content::-webkit-scrollbar-thumb { background: #463714; border-radius: 3px; }
    #${FLYOUT_ID} lc-flyout-content::-webkit-scrollbar-thumb:hover,
    #${FLYOUT_ID} .lc-flyout-content::-webkit-scrollbar-thumb:hover { background: #c89b3c; }
    #${FLYOUT_ID} lc-flyout-content::-webkit-scrollbar-track,
    #${FLYOUT_ID} .lc-flyout-content::-webkit-scrollbar-track { background: transparent; }
    
    #${FLYOUT_ID} .settings-title {
      font-size: 18px;
      font-weight: bold !important;
      margin-bottom: 12px;
      color: #c8aa6e;
      text-align: center;
      width: 100%;
    }
    
    #${FLYOUT_ID} .settings-section {
      margin-bottom: 12px;
      width: 100%;
    }
    
    #${FLYOUT_ID} .settings-label {
      display: block;
      margin-bottom: 8px;
      font-size: 14px;
      color: #cdbe91;
    }
    
    #${FLYOUT_ID} .settings-value {
      display: inline-block;
      margin-left: 10px;
      font-size: 14px;
      color: #c8aa6e;
      min-width: 50px;
    }

    #${FLYOUT_ID} .rose-tooltip-wrapper {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      position: relative;
      margin-right: 8px;
      top: 3px;
    }

    #${FLYOUT_ID} .rose-tooltip-icon {
      width: 14px;
      height: 14px;
      background-image: url("http://127.0.0.1:${window.__roseBridge ? window.__roseBridge.port : 50000}/asset/tooltip.png");
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
      opacity: 0.85;
      cursor: help;
      border: none;
      padding: 0;
      margin: 0;
      outline: none;
      background-color: transparent;
    }

    #${FLYOUT_ID} .rose-tooltip-icon:hover {
      opacity: 1;
    }

    #${FLYOUT_ID} .rose-tooltip-icon:focus-visible {
      outline: 1px solid #c8aa6e;
      outline-offset: 2px;
      border-radius: 3px;
    }

    /* Tooltip bubble is rendered globally (outside flyout) */
    #rose-global-tooltip {
      position: fixed;
      left: 0;
      top: 0;
      width: 340px;
      max-width: 340px;
      box-sizing: border-box;
      padding: 10px 12px;
      background: #0b1a2a;
      border: 1px solid #5c5b56;
      color: #cdbe91;
      font-size: 12px;
      line-height: 1.35;
      white-space: pre-line;
      text-align: justify;
      text-justify: inter-word;
      box-shadow: 0 10px 28px rgba(0, 0, 0, 0.65);
      opacity: 0;
      visibility: hidden;
      transform: translateY(2px);
      transition: opacity 0.12s ease, transform 0.12s ease;
      z-index: 100050;
      pointer-events: none;
      font-family: "Beaufort for LOL", serif;
    }

    #rose-global-tooltip[data-show="true"] {
      opacity: 1;
      visibility: visible;
      transform: translateY(0px);
    }

    #rose-global-tooltip::after {
      content: "";
      position: absolute;
      left: var(--rose-tooltip-arrow-x, 50%);
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-left: 7px solid transparent;
      border-right: 7px solid transparent;
    }

    #rose-global-tooltip::before {
      content: "";
      position: absolute;
      left: var(--rose-tooltip-arrow-x, 50%);
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-left: 8px solid transparent;
      border-right: 8px solid transparent;
      z-index: -1;
    }

    /* Tooltip ABOVE the icon (arrow on bottom) */
    #rose-global-tooltip[data-placement="top"]::after {
      top: 100%;
      border-top: 7px solid #0b1a2a;
    }

    #rose-global-tooltip[data-placement="top"]::before {
      top: 100%;
      border-top: 8px solid #5c5b56;
      margin-top: 1px;
    }

    /* Tooltip BELOW the icon (arrow on top) */
    #rose-global-tooltip[data-placement="bottom"]::after {
      top: -7px;
      border-bottom: 7px solid #0b1a2a;
    }

    #rose-global-tooltip[data-placement="bottom"]::before {
      top: -8px;
      border-bottom: 8px solid #5c5b56;
      margin-top: -1px;
    }
    
    #${FLYOUT_ID} .settings-slider {
      width: 100%;
      height: 6px;
      background: #3c3c41;
      border-radius: 3px;
      outline: none;
      -webkit-appearance: none;
      margin: 6px 0;
    }
    
    #${FLYOUT_ID} .settings-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 16px;
      height: 16px;
      background: #c8aa6e;
      border-radius: 50%;
      cursor: pointer;
    }
    
    #${FLYOUT_ID} .settings-slider::-moz-range-thumb {
      width: 16px;
      height: 16px;
      background: #c8aa6e;
      border-radius: 50%;
      cursor: pointer;
      border: none;
    }
    
    #${FLYOUT_ID} .settings-checkbox {
      width: 18px;
      height: 18px;
      margin-right: 8px;
      cursor: pointer;
    }
    
    #${FLYOUT_ID} .settings-input {
      width: 100%;
      padding: 8px;
      background: #3c3c41;
      border: 1px solid #5c5b56;
      border-radius: 4px;
      color: #cdbe91;
      font-size: 14px;
      font-family: "Beaufort for LOL", serif;
      box-sizing: border-box;
    }
    
    #${FLYOUT_ID} .settings-input::placeholder {
      font-family: "Beaufort for LOL", serif;
      color: #7d7d7d;
      opacity: 1;
    }
    
    #${FLYOUT_ID} .settings-input::-webkit-input-placeholder {
      font-family: "Beaufort for LOL", serif;
      color: #7d7d7d;
    }
    
    #${FLYOUT_ID} .settings-input::-moz-placeholder {
      font-family: "Beaufort for LOL", serif;
      color: #7d7d7d;
      opacity: 1;
    }
    
    #${FLYOUT_ID} .settings-input:-ms-input-placeholder {
      font-family: "Beaufort for LOL", serif;
      color: #7d7d7d;
    }
    
    #${FLYOUT_ID} .settings-input:focus {
      outline: none;
      border-color: #c8aa6e;
    }
    
    #${FLYOUT_ID} .settings-status {
      display: inline-block;
      margin-left: 8px;
      font-size: 16px;
    }
    
    #${FLYOUT_ID} .settings-button {
      width: 100%;
      padding: 10px;
      background: #0a1428;
      border: 1px solid #c8aa6e;
      border-radius: 4px;
      color: #c8aa6e;
      font-size: 14px;
      font-weight: bold;
      cursor: pointer;
      margin-top: 8px;
      transition: background 0.2s;
    }
    
    #${FLYOUT_ID} .settings-button:hover {
      background: #1a2332;
    }
    
    #${FLYOUT_ID} .settings-links {
      display: flex;
      justify-content: space-between;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #3c3c41;
      width: 100%;
    }
    
    #${FLYOUT_ID} form {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    #${FLYOUT_ID} .settings-link {
      color: #c8aa6e;
      text-decoration: none;
      font-size: 14px;
      transition: color 0.2s;
    }
    
    #${FLYOUT_ID} .settings-link:hover {
      color: #f0e6d2;
    }
    
    #${FLYOUT_ID} .settings-checkbox-wrapper {
      display: flex;
      align-items: center;
      margin-top: 8px;
    }
    
    /* Style for the "Add custom mods" dropdown button - match League UI button styling */
    #add-custom-mods-dropdown {
      background: #1E2328 !important;
      background-color: #1E2328 !important;
      color: #c8aa6e !important;
      font-family: "Beaufort for LOL", serif !important;
      pointer-events: all !important;
      position: relative !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      box-sizing: border-box !important;
      min-width: 90px !important;
      height: 100% !important;
      min-height: 32px !important;
      cursor: pointer !important;
      -webkit-user-select: none !important;
      text-align: center !important;
      margin-top: 8px !important;
      transition: background 0.2s !important;
      z-index: 10003 !important;
    }
    
    /* Ensure dropdown menu appears above other elements */
    #add-custom-mods-dropdown[class*="active"],
    #add-custom-mods-dropdown.active {
      z-index: 10003 !important;
    }
    
    /* Dropdown menu options container */
    #add-custom-mods-dropdown ~ *,
    #add-custom-mods-dropdown .lol-uikit-dropdown-menu,
    #add-custom-mods-dropdown [role="listbox"] {
      z-index: 10003 !important;
    }
    
    /* Remove any blue colors or unwanted backgrounds from child elements, but keep dropdown background */
    #add-custom-mods-dropdown > * {
      background: transparent !important;
      background-color: transparent !important;
    }
    
    /* Ensure dropdown itself and pseudo-elements maintain background */
    #add-custom-mods-dropdown,
    #add-custom-mods-dropdown::before,
    #add-custom-mods-dropdown::after {
      background: #1E2328 !important;
      background-color: #1E2328 !important;
      background-image: none !important;
      opacity: 1 !important;
    }
    
    /* Hover effect - no transparency */
    #add-custom-mods-dropdown:hover,
    #add-custom-mods-dropdown:hover::before,
    #add-custom-mods-dropdown:hover::after {
      background: #1E2328 !important;
      background-color: #1E2328 !important;
      opacity: 1 !important;
    }
    
    /* Remove focus/active blue colors and shining effects */
    #add-custom-mods-dropdown:focus,
    #add-custom-mods-dropdown:active,
    #add-custom-mods-dropdown:focus-visible,
    #add-custom-mods-dropdown:focus-within {
      background: #1E2328 !important;
      background-color: #1E2328 !important;
      outline: none !important;
      box-shadow: none !important;
      border: none !important;
    }
    
    /* Remove any glow or shine effects */
    #add-custom-mods-dropdown:focus::before,
    #add-custom-mods-dropdown:focus::after,
    #add-custom-mods-dropdown:active::before,
    #add-custom-mods-dropdown:active::after {
      display: none !important;
      box-shadow: none !important;
    }
    
    /* Remove all glow effects including filters, transforms, and shadows */
    #add-custom-mods-dropdown:focus,
    #add-custom-mods-dropdown:active,
    #add-custom-mods-dropdown:focus-visible,
    #add-custom-mods-dropdown:focus-within,
    #add-custom-mods-dropdown:focus *,
    #add-custom-mods-dropdown:active * {
      filter: none !important;
      -webkit-filter: none !important;
      transform: none !important;
      -webkit-transform: none !important;
      box-shadow: none !important;
      text-shadow: none !important;
      outline: none !important;
      border-color: transparent !important;
    }
    
    /* Blur focus after click */
    #add-custom-mods-dropdown {
      outline: none !important;
    }
    
    /* Don't center dropdown menu options */
    #add-custom-mods-dropdown .framed-dropdown-type {
      text-align: left !important;
    }
    
    /* Hide placeholder option from dropdown menu (but keep it for header display) */
    #add-custom-mods-dropdown[class*="active"] .placeholder-option,
    #add-custom-mods-dropdown.active .placeholder-option {
      display: none !important;
    }
    
    /* Force placeholder to always be selected for display */
    #add-custom-mods-dropdown .placeholder-option {
      display: block !important;
    }
    
    /* Ensure placeholder text is always shown in header */
    #add-custom-mods-dropdown:not([class*="active"]) .placeholder-option {
      display: block !important;
    }
    
    /* Hide checkmark icons in dropdown */
    #add-custom-mods-dropdown lol-uikit-dropdown-option::after,
    #add-custom-mods-dropdown lol-uikit-dropdown-option::before,
    #add-custom-mods-dropdown .framed-dropdown-type::after,
    #add-custom-mods-dropdown .framed-dropdown-type::before,
    #add-custom-mods-dropdown lol-uikit-dropdown-option [class*="check"],
    #add-custom-mods-dropdown lol-uikit-dropdown-option [class*="icon"],
    #add-custom-mods-dropdown lol-uikit-dropdown-option [class*="selected"] {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
    }
    
    /* Override :host .ui-dropdown color to match button contrast */
    #add-custom-mods-dropdown .ui-dropdown {
      color: #CDBE91 !important;
      font-size: 12px !important;
      font-weight: normal !important;
      line-height: 16px !important;
      letter-spacing: 0.025em !important;
      -webkit-font-smoothing: subpixel-antialiased !important;
    }
    
    /* Target shadow DOM content via part or direct selector */
    #add-custom-mods-dropdown::part(content),
    #add-custom-mods-dropdown .ui-dropdown-current-content,
    #add-custom-mods-dropdown .ui-dropdown-current-content.shadow {
      color: #CDBE91 !important;
    }
    
    
    /* Add Custom Mods Dialog Styles */
    #add-custom-mods-dialog,
    #champion-selection-dialog,
    #skin-selection-dialog {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 10001;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    #add-custom-mods-dialog .backdrop,
    #champion-selection-dialog .backdrop,
    #skin-selection-dialog .backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 10001;
      background: rgba(0, 0, 0, 0.5);
      pointer-events: all;
    }

    
    #add-custom-mods-flyout,
    #champion-selection-flyout,
    #skin-selection-flyout {
      min-width: 600px !important;
      max-width: 800px !important;
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
      border-radius: 0 !important;
      padding: 0 !important;
      color: #cdbe91;
      font-family: "Beaufort for LOL", serif;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      box-shadow: none !important;
      border: none !important;
      margin: 0 !important;
      overflow: visible !important;
      overflow-x: hidden !important;
      overflow-y: hidden !important;
    }

    #skin-selection-flyout {
      min-width: 700px !important;
    }

    #champion-selection-flyout::-webkit-scrollbar,
    #skin-selection-flyout::-webkit-scrollbar,
    #champion-selection-dialog::-webkit-scrollbar,
    #skin-selection-dialog::-webkit-scrollbar {
      display: none !important;
      width: 0 !important;
      height: 0 !important;
    }
    
    #champion-selection-flyout *::-webkit-scrollbar,
    #skin-selection-flyout *::-webkit-scrollbar {
      display: none !important;
      width: 0 !important;
      height: 0 !important;
    }
    
    #add-custom-mods-flyout lc-flyout-content,
    #add-custom-mods-flyout .lc-flyout-content,
    #champion-selection-flyout lc-flyout-content,
    #champion-selection-flyout .lc-flyout-content,
    #skin-selection-flyout lc-flyout-content,
    #skin-selection-flyout .lc-flyout-content {
      overflow-x: hidden !important;
    }
    
    #add-custom-mods-flyout lc-flyout-content,
    #add-custom-mods-flyout .lc-flyout-content,
    #champion-selection-flyout lc-flyout-content,
    #champion-selection-flyout .lc-flyout-content,
    #skin-selection-flyout lc-flyout-content,
    #skin-selection-flyout .lc-flyout-content {
      background: #010a13 !important;
      background-color: #010a13 !important;
      background-image: none !important;
      border-radius: 0 !important;
      padding: 20px !important;
      width: 100% !important;
      box-sizing: border-box !important;
      border: 1px solid #c8aa6e !important;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5) !important;
      margin: 0 !important;
      overflow-x: hidden !important;
    }
    
    #champion-selection-dialog,
    #skin-selection-dialog {
      overflow-x: hidden !important;
      overflow-y: hidden !important;
    }
    
    #champion-selection-flyout::-webkit-scrollbar,
    #skin-selection-flyout::-webkit-scrollbar,
    #champion-selection-flyout::-webkit-scrollbar:horizontal,
    #skin-selection-flyout::-webkit-scrollbar:horizontal,
    #champion-selection-dialog::-webkit-scrollbar,
    #skin-selection-dialog::-webkit-scrollbar {
      display: none !important;
      width: 0 !important;
      height: 0 !important;
    }
    
    #add-custom-mods-flyout::before,
    #add-custom-mods-flyout::after {
      display: none !important;
      content: none !important;
    }

    #add-custom-mods-flyout *::before,
    #add-custom-mods-flyout *::after {
      display: none !important;
      content: none !important;
      background: none !important;
      background-image: none !important;
    }
    
    #add-custom-mods-flyout .settings-title,
    #champion-selection-flyout .settings-title,
    #skin-selection-flyout .settings-title {
      font-size: 18px;
      font-weight: bold !important;
      margin-bottom: 12px;
      color: #c8aa6e;
      text-align: center;
      width: 100%;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .dialog-header {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      margin-bottom: 16px;
      position: relative;
    }

    .back-button {
      position: absolute;
      left: 0;
      background: transparent;
      border: none;
      color: #a09b8c;
      width: 32px;
      height: 32px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      transition: color 0.2s ease;
      flex-shrink: 0;
    }
    .back-button svg {
      width: 20px;
      height: 20px;
      fill: none;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .back-button:hover {
      color: #c8aa6e;
    }
    .back-button:active {
      color: #f0e6d2;
    }
    
    .dialog-title-wrapper {
      flex: 1;
      text-align: center;
      font-size: 18px;
      font-weight: bold;
      color: #c8aa6e;
      font-family: "Beaufort for LOL", serif;
    }
    
    #champion-selection-flyout .champion-search-input,
    #champion-selection-flyout lol-uikit-flat-input.champion-search-input {
      width: 100%;
      margin-bottom: 12px;
    }
    
    #champion-selection-flyout .champion-search-input input,
    #champion-selection-flyout lol-uikit-flat-input.champion-search-input input {
      width: 100%;
      box-sizing: border-box;
    }
    
    #champions-grid-wrapper,
    #skins-list {
      scrollbar-width: none;
    }
    #champions-grid-wrapper::-webkit-scrollbar,
    #skins-list::-webkit-scrollbar {
      display: none;
      width: 0;
      height: 0;
    }

    #champions-grid-wrapper {
      max-height: 45vh;
      margin-top: 12px;
    }
    
    #champions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
      gap: 8px;
      padding-right: 8px;
    }

    .champion-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      padding: 6px;
      border: 1px solid transparent;
      border-radius: 4px;
      transition: border-color 0.2s, background 0.2s;
      background: transparent;
    }
    .champion-card:hover {
      border-color: #c8aa6e;
      background: rgba(200, 170, 110, 0.08);
    }
    .champion-card img {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      border: 2px solid #5b5a56;
      object-fit: cover;
      transition: border-color 0.2s;
    }
    .champion-card:hover img {
      border-color: #c8aa6e;
    }
    .champion-card .champion-name {
      margin-top: 6px;
      font-size: 11px;
      color: #a09b8c;
      text-align: center;
      font-family: "Beaufort for LOL", serif;
      line-height: 1.2;
      max-width: 80px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .champion-card:hover .champion-name {
      color: #cdbe91;
    }

    #skins-list {
      flex: 1 1 auto;
      min-height: 0;
      max-height: none;
    }

    #skins-list .skins-list-container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 10px;
      padding-right: 8px;
    }

    .skin-card {
      position: relative;
      height: 280px;
      cursor: pointer;
      border-radius: 4px;
      perspective: 1000px;
      background: transparent;
    }
    .skin-card-inner {
      position: relative;
      width: 100%;
      height: 100%;
      transition: transform 0.45s cubic-bezier(0.2, 0.75, 0.25, 1);
      transform-style: preserve-3d;
    }
    .skin-card.is-flipped .skin-card-inner {
      transform: rotateY(180deg);
    }
    .skin-card-face {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      border: 1px solid #5b5a56;
      border-radius: 4px;
      background: #1e2328;
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .skin-card-front {
      z-index: 2;
    }
    .skin-card-back {
      z-index: 1;
      pointer-events: none;
    }
    .skin-card.is-flipped .skin-card-front {
      z-index: 1;
      pointer-events: none;
    }
    .skin-card.is-flipped .skin-card-back {
      z-index: 2;
      pointer-events: auto;
    }
    .skin-card-front:hover,
    .skin-card-back:hover {
      border-color: #c8aa6e;
      box-shadow: 0 0 8px rgba(200, 170, 110, 0.3);
    }
    .skin-card.selected .skin-card-front,
    .skin-card.selected .skin-card-back {
      border-color: #c8aa6e;
      box-shadow: 0 0 10px rgba(200, 170, 110, 0.55);
      background: #2b2a20;
    }
    .skin-card-back {
      transform: rotateY(180deg);
      padding: 8px;
      box-sizing: border-box;
    }
    .skin-card-front img {
      width: 100%;
      flex: 1 1 auto;
      min-height: 0;
      object-fit: cover;
      display: block;
      background: #0a0a0d;
    }
    .skin-card .skin-name {
      padding: 8px;
      font-size: 12px;
      color: #a09b8c;
      text-align: center;
      font-family: "Beaufort for LOL", serif;
      line-height: 1.3;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .skin-card-front:hover .skin-name {
      color: #cdbe91;
    }
    .skin-chroma-button {
      position: absolute;
      top: 7px;
      right: 7px;
      z-index: 2;
      padding: 4px 7px;
      border: 1px solid rgba(200, 170, 110, 0.8);
      border-radius: 3px;
      background: rgba(10, 10, 13, 0.86);
      color: #c8aa6e;
      cursor: pointer;
      font-family: "Beaufort for LOL", serif;
      font-size: 10px;
      font-weight: bold;
      transition: background 0.2s, color 0.2s, transform 0.2s;
    }
    .skin-chroma-button:hover {
      background: #463714;
      color: #f0e6d2;
      transform: translateY(-1px);
    }
    .skin-card-back-header {
      display: flex;
      align-items: center;
      gap: 5px;
      flex: 0 0 auto;
      min-height: 26px;
      color: #cdbe91;
      font-family: "Beaufort for LOL", serif;
      font-size: 11px;
      font-weight: bold;
    }
    .skin-card-back-close {
      position: relative;
      z-index: 1;
      flex: 0 0 auto;
      min-width: 34px;
      padding: 3px 7px;
      border: 1px solid #5b5a56;
      border-radius: 2px;
      background: #121820;
      color: #a09b8c;
      cursor: pointer;
      font-size: 12px;
      line-height: 16px;
    }
    .skin-card-back-close:hover {
      border-color: #c8aa6e;
      color: #f0e6d2;
    }
    .skin-card-back-options {
      display: flex;
      flex: 1 1 auto;
      flex-direction: column;
      gap: 6px;
      min-height: 0;
      margin-top: 6px;
      overflow-y: auto;
      padding-right: 2px;
    }
    .skin-option {
      display: flex;
      align-items: center;
      gap: 7px;
      flex: 0 0 auto;
      min-height: 55px;
      padding: 4px;
      border: 1px solid #4a4a48;
      border-radius: 3px;
      background: #151b21;
      color: #a09b8c;
      cursor: pointer;
      text-align: left;
      transition: border-color 0.2s, background 0.2s;
    }
    .skin-option:hover {
      border-color: #c8aa6e;
      background: #252b2d;
    }
    .skin-option.selected {
      border-color: #c8aa6e;
      background: #463714;
      color: #f0e6d2;
    }
    .skin-option img {
      width: 38px;
      height: 52px;
      flex: 0 0 38px;
      object-fit: cover;
      background: #0a0a0d;
    }
    .skin-option-name {
      overflow: hidden;
      font-family: "Beaufort for LOL", serif;
      font-size: 10px;
      line-height: 1.2;
      text-overflow: ellipsis;
    }
    #skin-selection-actions {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #463714;
      flex: 0 0 auto;
    }
    #skin-selection-count {
      flex: 1;
      color: #a09b8c;
      font-family: "Beaufort for LOL", serif;
      font-size: 13px;
    }
    #skin-selection-confirm {
      padding: 9px 18px;
      border: 1px solid #c8aa6e;
      border-radius: 3px;
      background: #1e2328;
      color: #c8aa6e;
      cursor: pointer;
      font-family: "Beaufort for LOL", serif;
      font-weight: bold;
    }
    #skin-selection-confirm:hover:not(:disabled) {
      background: #463714;
      color: #f0e6d2;
    }
    #skin-selection-confirm:disabled {
      opacity: 0.45;
      cursor: default;
    }
  `;
  }

  function log(level, message, data = null) {
    const consoleMethod =
      level === "error"
        ? console.error
        : level === "warn"
          ? console.warn
          : console.log;
    consoleMethod(`${LOG_PREFIX} ${message}`, data || "");
  }

  function handleSettingsData(payload) {
    currentSettings = {
      threshold: payload.threshold || 0.5,
      monitorAutoResumeTimeout: payload.monitorAutoResumeTimeout || 60,
      autostart: payload.autostart || false,
      gamePath: payload.gamePath || "",
      gamePathValid: payload.gamePathValid || false,
      version: payload.version || "",
      analyticsEnabled: !!payload.analyticsEnabled,
      autoUpdate: payload.autoUpdate === undefined ? true : !!payload.autoUpdate,
      randomMode: payload.randomMode || "all",
      relayUrl: payload.relayUrl || "",
      relayConfigured: !!payload.relayConfigured,
    };
    if (payload.updateAvailable !== undefined) {
      handleUpdateStatus({ available: !!payload.updateAvailable, remoteVersion: payload.updateVersion || null });
    }
    // Update version badge if the panel is already open
    const badge = document.getElementById("rose-version-badge");
    if (badge && payload.version) {
      badge.textContent = `v${payload.version}`;
    }
    updateSettingsForm();
    // Badge count should reflect what's actually in diagnostics (and not change while dragging sliders).
    const localCount = Array.isArray(diagnosticsState.errors) ? diagnosticsState.errors.length : 0;
    if (localCount > 0) {
      updateErrorBadges(true, localCount);
    } else {
      updateErrorBadges(!!payload.hasErrors, payload.errorsCount || 0);
    }
    // If backend reports errors but we don't have the list yet, fetch it once so we can
    // show per-category guidance and clear it after Save (not while dragging).
    if (payload.hasErrors && (!Array.isArray(diagnosticsState.errors) || diagnosticsState.errors.length === 0)) {
      requestDiagnostics();
    }
    log("info", "Settings data received", currentSettings);
  }

  let diagnosticsDialog = null;
  let diagnosticsState = { errors: [], path: "", settingsSnapshot: null, baseSkinStats: null };
  let errorBadgeState = { hasErrors: false, count: 0 };
  let updateBadgeState = { available: false, version: null };
  let _badgeObserverStarted = false;
  let _pendingSave = null;
  let _diagnosticsPollId = null;
  let _flyoutRepositionTimer = null;

  function _clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function _diagnosticsCategory(e) {
    if (e?.code === 'LOW_DISK_SPACE') return 'disk_space';
    const raw = String(e?.text || e?.msg || "").trim();
    const code = String(e?.code || "").trim();

    if (code === "BASE_SKIN_FORCE_SLOW" || code === "BASE_SKIN_VERIFY_FAILED") return "injection_threshold";
    if (code === "AUTO_RESUME_TRIGGERED" || code === "MONITOR_AUTO_RESUME_TIMEOUT") return "monitor_timeout";

    if (/Injection\s*Threshold/i.test(raw)) return "injection_threshold";
    if (/Auto-Resume Timeout/i.test(raw) || /Monitor Auto-Resume Timeout/i.test(raw)) return "monitor_timeout";

    return "other";
  }

  function _getRecommendedForCategory(category, errors) {
    const snap = diagnosticsState?.settingsSnapshot || null;
    const snapThreshold =
      typeof snap?.threshold === "number" && Number.isFinite(snap.threshold) ? snap.threshold : null;
    const snapTimeout =
      typeof snap?.monitorAutoResumeTimeout === "number" && Number.isFinite(snap.monitorAutoResumeTimeout)
        ? snap.monitorAutoResumeTimeout
        : null;

    if (category === "injection_threshold") {
      // Prefer explicit recommendation if present.
      const recs = (errors || [])
        .map((e) => e?.recommendedThresholdS)
        .filter((v) => typeof v === "number" && Number.isFinite(v));
      if (recs.length) return _clamp(Math.max(...recs), 0.3, 2.0);
      // Otherwise: stable heuristic based on the settings at the time diagnostics were fetched.
      if (typeof snapThreshold === "number") return _clamp(snapThreshold + 0.25, 0.3, 2.0);
      return null;
    }

    if (category === "monitor_timeout") {
      // Prefer explicit recommendation if present (support multiple field names defensively).
      const recs = (errors || [])
        .map((e) => e?.recommendedMonitorTimeoutS ?? e?.recommendedTimeoutS ?? e?.recommendedAutoResumeTimeoutS)
        .filter((v) => typeof v === "number" && Number.isFinite(v));
      if (recs.length) return _clamp(Math.max(...recs), 20, 180);
      if (typeof snapTimeout === "number") return _clamp(Math.max(snapTimeout + 30, 90), 20, 180);
      return null;
    }

    return null;
  }

  function getEffectiveDiagnosticsErrors() {
    const errors = Array.isArray(diagnosticsState.errors) ? diagnosticsState.errors : [];
    if (errors.length === 0) return [];

    // Group by category so we can drop the whole category once resolved.
    const byCat = new Map();
    for (const e of errors) {
      const cat = _diagnosticsCategory(e);
      if (!byCat.has(cat)) byCat.set(cat, []);
      byCat.get(cat).push(e);
    }

    const curThreshold = typeof currentSettings?.threshold === "number" ? currentSettings.threshold : null;
    const curTimeout =
      typeof currentSettings?.monitorAutoResumeTimeout === "number" ? currentSettings.monitorAutoResumeTimeout : null;

    const resolved = new Set();
    for (const [cat, list] of byCat.entries()) {
      const rec = _getRecommendedForCategory(cat, list);
      if (rec == null) continue;

      if (cat === "injection_threshold" && typeof curThreshold === "number" && curThreshold >= (rec - 1e-6)) {
        resolved.add(cat);
      } else if (cat === "monitor_timeout" && typeof curTimeout === "number" && curTimeout >= (rec - 1e-6)) {
        resolved.add(cat);
      }
    }

    if (resolved.size === 0) return errors;
    return errors.filter((e) => !resolved.has(_diagnosticsCategory(e)));
  }

  function getResolvedDiagnosticsCategories() {
    const all = Array.isArray(diagnosticsState?.errors) ? diagnosticsState.errors : [];
    if (all.length === 0) return [];
    const allCats = new Set(all.map(_diagnosticsCategory));
    const remainingCats = new Set(getEffectiveDiagnosticsErrors().map(_diagnosticsCategory));

    const resolved = [];
    for (const cat of allCats) {
      if (cat === "other") continue;
      if (!remainingCats.has(cat)) resolved.push(cat);
    }
    return resolved;
  }

  function handleDiagnosticsData(payload) {
    // Snapshot the settings at the time we fetched diagnostics so "recommended" targets stay stable
    // while the user is dragging sliders.
    const snapshot =
      currentSettings && typeof currentSettings === "object"
        ? {
            threshold: currentSettings.threshold,
            monitorAutoResumeTimeout: currentSettings.monitorAutoResumeTimeout,
          }
        : null;
    diagnosticsState = {
      errors: Array.isArray(payload.errors) ? payload.errors : [],
      path: payload.path || "",
      settingsSnapshot: snapshot,
      baseSkinStats: payload.baseSkinStats || null,
    };
    updateErrorBadges(diagnosticsState.errors.length > 0, diagnosticsState.errors.length);
    renderDiagnosticsDialog();
    renderThresholdBenchmark();
  }

  function getResolvedCategoriesForSavedValues(values) {
    // Only consider a category "fixed" if:
    // - the saved value meets/exceeds the recommended target, AND
    // - the user actually increased it compared to the snapshot from when diagnostics were fetched.
    const eps = 1e-6;
    const all = Array.isArray(diagnosticsState?.errors) ? diagnosticsState.errors : [];
    if (!all.length || !values) return [];

    const snap = diagnosticsState?.settingsSnapshot || null;
    const snapThreshold = typeof snap?.threshold === "number" ? snap.threshold : null;
    const snapTimeout = typeof snap?.monitorAutoResumeTimeout === "number" ? snap.monitorAutoResumeTimeout : null;

    const byCat = new Map();
    for (const e of all) {
      const cat = _diagnosticsCategory(e);
      if (!byCat.has(cat)) byCat.set(cat, []);
      byCat.get(cat).push(e);
    }

    const resolved = [];
    for (const [cat, list] of byCat.entries()) {
      if (cat === "other") continue;
      const rec = _getRecommendedForCategory(cat, list);
      if (rec == null) continue;

      if (cat === "injection_threshold") {
        const saved = typeof values.threshold === "number" ? values.threshold : null;
        const increased = typeof snapThreshold === "number" ? saved != null && saved > (snapThreshold + eps) : true;
        if (saved != null && saved >= (rec - eps) && increased) resolved.push(cat);
      } else if (cat === "monitor_timeout") {
        const saved = typeof values.monitorAutoResumeTimeout === "number" ? values.monitorAutoResumeTimeout : null;
        const increased = typeof snapTimeout === "number" ? saved != null && saved > (snapTimeout + eps) : true;
        if (saved != null && saved >= (rec - eps) && increased) resolved.push(cat);
      }
    }

    return resolved;
  }

  function updateErrorBadges(hasErrors, count) {
    errorBadgeState = { hasErrors: !!hasErrors, count: Number(count) || 0 };
    applyErrorBadges();
  }

  function startBadgeObserver() {
    if (_badgeObserverStarted) return;
    _badgeObserverStarted = true;

    // Re-apply badges when the Golden Rose nav item is injected by ROSE-UI (or recreated by Ember).
    const tryApply = () => {
      try {
        applyErrorBadges();
      } catch (e) {}
    };

    try {
      const obs = new MutationObserver(() => {
        // Only bother if we actually have errors to show (keeps it cheap)
        if (!errorBadgeState.hasErrors) return;
        tryApply();
      });
      obs.observe(document.body, { childList: true, subtree: true });

      // Also retry a few times after startup (covers cases where body observer misses early churn)
      let attempts = 0;
      const id = setInterval(() => {
        attempts += 1;
        tryApply();
        if (attempts >= 20) clearInterval(id); // ~10s max
      }, 500);
    } catch (e) {
      // Fallback: periodic best-effort if MutationObserver fails
      let attempts = 0;
      const id = setInterval(() => {
        attempts += 1;
        tryApply();
        if (attempts >= 20) clearInterval(id);
      }, 500);
    }
  }

  function applyUpdateBadge() {
    // Kaleido: "1" badge on the sidebar icon and on the "Check for updates" button when a release is available
    const navItem = document.querySelector("lol-uikit-navigation-item.menu_item_Golden.Rose");
    if (navItem) {
      const host = navItem.querySelector(".menu-item-icon-wrapper") || navItem.querySelector(".menu-item-icon") || navItem;
      host.style.position = host.style.position || "relative";
      let badge = host.querySelector("#kaleido-update-badge");
      if (updateBadgeState.available) {
        if (!badge) {
          badge = document.createElement("div");
          badge.id = "kaleido-update-badge";
          badge.className = "kaleido-update-badge";
          badge.textContent = "1";
          host.appendChild(badge);
        }
        badge.title = t("Kaleido {version} available", { version: updateBadgeState.version || "" });
      } else if (badge) {
        badge.remove();
      }
    }
    const btn = document.getElementById("kaleido-update-check");
    if (btn) {
      let dot = btn.querySelector(".kaleido-update-dot");
      if (updateBadgeState.available) {
        if (!dot) {
          dot = document.createElement("span");
          dot.className = "kaleido-update-dot";
          dot.textContent = "1";
          btn.appendChild(dot);
        }
      } else if (dot) {
        dot.remove();
      }
    }
  }

  function handleUpdateStatus(payload) {
    updateBadgeState = { available: !!payload.available, version: payload.remoteVersion || null };
    applyUpdateBadge();
    if (updateBadgeState.available) {
      // Reflect it in the panel if it is open
      const status = document.getElementById("kaleido-update-status");
      const installBtn = document.getElementById("kaleido-update-install");
      if (status) {
        status.style.color = "";
        status.textContent = t("Version {version} available", { version: updateBadgeState.version || "?" });
      }
      if (installBtn) installBtn.hidden = false;
    }
  }

  function applyErrorBadges() {
    try { applyUpdateBadge(); } catch (e) {}
    // Sidebar "Golden Rose" nav icon badge
    const navItem = document.querySelector(
      "lol-uikit-navigation-item.menu_item_Golden.Rose"
    );
    if (navItem) {
      const host =
        navItem.querySelector(".menu-item-icon-wrapper") ||
        navItem.querySelector(".menu-item-icon") ||
        navItem;

      host.style.position = host.style.position || "relative";
      // Use warning image overlay (assets/red-warning.png) on the top-right of the Rose icon.
      let badge = host.querySelector("#rose-errors-badge");
      if (errorBadgeState.hasErrors) {
        if (!badge) {
          badge = document.createElement("div");
          badge.id = "rose-errors-badge";
          badge.classList.add("rose-warning-glow");
          // Position + size for the warning overlay
          badge.style.position = "absolute";
          badge.style.top = "-10px";
          badge.style.right = "-10px";
          badge.style.width = "14px";
          badge.style.height = "14px";
          badge.style.backgroundImage = `url(http://127.0.0.1:${window.__roseBridge ? window.__roseBridge.port : 50000}/asset/red-warning.png)`;
          badge.style.backgroundSize = "contain";
          badge.style.backgroundRepeat = "no-repeat";
          badge.style.backgroundPosition = "center";
          badge.style.pointerEvents = "none";
          host.appendChild(badge);
        }
        // Keep text empty; this overlay is purely visual.
      } else if (badge) {
        badge.remove();
      }
    }

    // Troubleshooting button warning overlay (only when settings flyout is open)
    const tb = document.getElementById("troubleshoot-button");
    if (tb) {
      tb.style.position = tb.style.position || "relative";
      let warn = tb.querySelector("#rose-troubleshoot-warning");
      if (errorBadgeState.hasErrors) {
        if (!warn) {
          warn = document.createElement("div");
          warn.id = "rose-troubleshoot-warning";
          warn.classList.add("rose-warning-glow");

          warn.style.position = "absolute";
          warn.style.top = "-15px";
          warn.style.right = "-9px";
          warn.style.width = "14px";
          warn.style.height = "14px";
          warn.style.backgroundImage = `url(http://127.0.0.1:${window.__roseBridge ? window.__roseBridge.port : 50000}/asset/red-warning.png)`;
          warn.style.backgroundSize = "contain";
          warn.style.backgroundRepeat = "no-repeat";
          warn.style.backgroundPosition = "center";
          warn.style.pointerEvents = "none";

          tb.appendChild(warn);
        }
      } else if (warn) {
        warn.remove();
      }
    }
  }

  function handlePathValidationResult(payload) {
    const pathInput = document.getElementById("game-path-input");
    const pathStatus = document.getElementById("path-status");

    if (!pathInput || !pathStatus) {
      return;
    }

    // Only update if this validation is for the current path value
    const currentPath = pathInput.value.trim();
    if (payload.gamePath === currentPath) {
      const isValid = payload.valid === true;
      pathStatus.textContent = isValid ? "✅" : "❌";

      // Update current settings if this is the saved path
      if (currentPath === currentSettings.gamePath) {
        currentSettings.gamePathValid = isValid;
      }
    }
  }

  function handleSettingsSaved(payload) {
    if (payload.success) {
      log("info", "Settings saved successfully", payload);
      // Show success message to user
      const saveButton = document.getElementById("save-button");
      if (saveButton) {
        const originalText = saveButton.textContent;
        saveButton.textContent = t("Saved!");
        setTimeout(() => {
          saveButton.textContent = originalText;
        }, 2000);
      }

      // After a successful save: if the user actually increased a value enough to satisfy the
      // recommendation, clear all diagnostics entries from that category so they stay gone.
      try {
        if (_pendingSave) {
          const cats = getResolvedCategoriesForSavedValues(_pendingSave);
          if (cats.length > 0) {
            if (bridge) bridge.send({ type: "diagnostics-clear-category", categories: cats });
          }
        }
      } catch (e) {}
      _pendingSave = null;

      // Refresh settings + diagnostics + badges after save
      requestSettings();
      requestDiagnostics();
    } else {
      log("error", "Settings save failed", payload);
      // Show error message to user
      const saveButton = document.getElementById("save-button");
      if (saveButton) {
        const originalText = saveButton.textContent;
        saveButton.textContent = payload.error || t("Error saving settings");
        saveButton.style.background = "#8b0000";
        setTimeout(() => {
          saveButton.textContent = originalText;
          saveButton.style.background = "";
        }, 3000);
      }
    }
  }

  function validateGamePath(path) {
    if (!path || !path.trim()) {
      return false;
    }
    // Basic validation - check if path contains "League of Legends"
    // Full validation is done on Python side
    return path.trim().length > 0;
  }

  function createSettingsFlyout(navItem) {
    _lastNavItem = navItem;
    // Remove existing panel if any
    const existingPanel = document.getElementById(PANEL_ID);
    if (existingPanel) {
      existingPanel.remove();
    }

    // Create panel container (fixed positioning for viewport-relative coordinates)
    const panel = document.createElement("div");
    panel.id = PANEL_ID;
    panel.style.position = "fixed";
    panel.style.top = "0";
    panel.style.left = "0";
    panel.style.width = "100%";
    panel.style.height = "100%";
    panel.style.zIndex = "10000";
    panel.style.pointerEvents = "none";
    document.body.appendChild(panel);

    // Create backdrop for click-outside-to-close
    const backdrop = document.createElement("div");
    backdrop.style.position = "fixed";
    backdrop.style.top = "0";
    backdrop.style.left = "0";
    backdrop.style.width = "100%";
    backdrop.style.height = "100%";
    backdrop.style.zIndex = "9999";
    backdrop.style.background = "transparent";
    backdrop.style.pointerEvents = "all";
    backdrop.addEventListener("click", (e) => {
      // Only close if clicking directly on backdrop, not on flyout
      if (e.target === backdrop) {
        closeSettingsPanel();
      }
    });
    panel.appendChild(backdrop);

    // Get the actual icon element position (not the parent container)
    const iconElement =
      navItem.querySelector(".menu-item-icon") ||
      navItem.querySelector(".menu-item-icon-wrapper") ||
      navItem;
    const iconRect = iconElement.getBoundingClientRect();

    // Create flyout frame
    let flyoutFrame;
    try {
      flyoutFrame = document.createElement("lol-uikit-flyout-frame");
      flyoutFrame.id = FLYOUT_ID;
      flyoutFrame.className = "flyout";
      flyoutFrame.setAttribute("orientation", "bottom");
      flyoutFrame.setAttribute("animated", "true");
      flyoutFrame.setAttribute("show", "true");
    } catch (e) {
      log("debug", "Could not create custom element, using div", e);
      flyoutFrame = document.createElement("div");
      flyoutFrame.id = FLYOUT_ID;
      flyoutFrame.className = "flyout";
    }

    // Use absolute positioning within the fixed panel container
    flyoutFrame.style.position = "absolute";
    flyoutFrame.style.overflow = "visible";
    // Position below the icon, centered horizontally on the icon
    flyoutFrame.style.top = `${iconRect.bottom + 45}px`;
    flyoutFrame.style.left = `${iconRect.left + iconRect.width / 2}px`;
    flyoutFrame.style.transform = "translateX(-50%)"; // Center the panel on the icon
    flyoutFrame.style.zIndex = "10001";
    flyoutFrame.style.pointerEvents = "all";
    flyoutFrame.style.setProperty("background", "transparent", "important");
    flyoutFrame.style.setProperty(
      "background-color",
      "transparent",
      "important"
    );
    flyoutFrame.style.setProperty("background-image", "none", "important");
    flyoutFrame.style.setProperty("border", "none", "important");
    flyoutFrame.style.setProperty("box-shadow", "none", "important");
    flyoutFrame.style.setProperty("margin", "0", "important");
    flyoutFrame.style.setProperty("padding", "0", "important");
    flyoutFrame.style.setProperty("overflow", "visible", "important");

    // Force remove any default classes that might add background
    if (flyoutFrame.classList) {
      flyoutFrame.classList.forEach((cls) => {
        if (cls.includes("background") || cls.includes("bg-")) {
          flyoutFrame.classList.remove(cls);
        }
      });
    }

    // Prevent click from closing
    flyoutFrame.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    // Create flyout content
    let flyoutContent;
    try {
      flyoutContent = document.createElement("lc-flyout-content");
    } catch (e) {
      log("debug", "Could not create lc-flyout-content, using div", e);
      flyoutContent = document.createElement("div");
      flyoutContent.className = "lc-flyout-content";
    }

    // Create settings form
    const form = document.createElement("div");
    form.style.width = "100%";
    form.style.display = "flex";
    form.style.flexDirection = "column";
    form.style.alignItems = "center";

    function getOrCreateGlobalTooltip() {
      let el = document.getElementById("rose-global-tooltip");
      if (el) return el;

      el = document.createElement("div");
      el.id = "rose-global-tooltip";
      el.setAttribute("role", "tooltip");
      el.setAttribute("data-show", "false");
      document.body.appendChild(el);
      return el;
    }

    function hideGlobalTooltip() {
      const el = document.getElementById("rose-global-tooltip");
      if (!el) return;
      el.setAttribute("data-show", "false");
    }

    function showGlobalTooltipFor(anchorEl, text) {
      const tooltip = getOrCreateGlobalTooltip();
      tooltip.textContent = text;
      tooltip.setAttribute("data-show", "true");

      // Measure after setting text
      const margin = 10;
      const rect = anchorEl.getBoundingClientRect();
      const tRect = tooltip.getBoundingClientRect();

      // Prefer above, fallback below if not enough room
      const preferredTop = rect.top - tRect.height - margin;
      const belowTop = rect.bottom + margin;
      const useTop = preferredTop >= 8;
      const top = useTop ? preferredTop : belowTop;
      tooltip.setAttribute("data-placement", useTop ? "top" : "bottom");

      // Center horizontally on icon, clamp to viewport
      let left = rect.left + rect.width / 2 - tRect.width / 2;
      const maxLeft = window.innerWidth - tRect.width - 8;
      left = Math.max(8, Math.min(maxLeft, left));

      tooltip.style.left = `${Math.round(left)}px`;
      tooltip.style.top = `${Math.round(top)}px`;

      // Nudge the arrow towards the anchor if clamped
      const anchorCenterX = rect.left + rect.width / 2;
      const arrowX = Math.max(12, Math.min(tRect.width - 12, anchorCenterX - left));
      tooltip.style.setProperty("--rose-tooltip-arrow-x", `${Math.round(arrowX)}px`);
    }

    function createTooltipButton(tooltipText, ariaLabel) {
      const wrapper = document.createElement("span");
      wrapper.className = "rose-tooltip-wrapper";

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "rose-tooltip-icon";
      btn.setAttribute("aria-label", ariaLabel || "Info");

      // prevent accidental focus/drag interactions with nearby controls
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
      });

      const show = () => showGlobalTooltipFor(btn, tooltipText);
      const hide = () => hideGlobalTooltip();

      btn.addEventListener("mouseenter", show);
      btn.addEventListener("mouseleave", hide);
      btn.addEventListener("focus", show);
      btn.addEventListener("blur", hide);

      // Keep tooltip in correct position while resizing/scrolling
      const reposition = () => {
        const tt = document.getElementById("rose-global-tooltip");
        if (!tt || tt.getAttribute("data-show") !== "true") return;
        showGlobalTooltipFor(btn, tooltipText);
      };
      window.addEventListener("resize", reposition);
      window.addEventListener("scroll", reposition, true);

      wrapper.appendChild(btn);
      return wrapper;
    }

    // Title + version badge inline
    const titleRow = document.createElement("div");
    titleRow.style.cssText = "display:flex;align-items:baseline;justify-content:center;gap:8px;margin-bottom:4px";

    const title = document.createElement("div");
    title.className = "settings-title";
    title.textContent = t("Settings");
    title.style.marginBottom = "0";
    titleRow.appendChild(title);

    const versionBadge = document.createElement("span");
    versionBadge.id = "rose-version-badge";
    versionBadge.style.cssText = [
      "font-size: 11px",
      "color: #a09b8c",
      "font-family: Beaufort for LOL, serif",
      "letter-spacing: 0.06em",
    ].join(";");
    versionBadge.textContent = currentSettings.version ? `v${currentSettings.version}` : "";
    titleRow.appendChild(versionBadge);

    form.appendChild(titleRow);

    // Language selector (Kaleido)
    const langRow = document.createElement("div");
    langRow.className = "kaleido-lang-row";
    const langLabel = document.createElement("span");
    langLabel.className = "kaleido-lang-label";
    langLabel.textContent = t("Language");
    langRow.appendChild(langLabel);
    [["es", "Español"], ["en", "English"]].forEach(([code, label]) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "kaleido-lang-btn" + (currentLang === code ? " active" : "");
      btn.textContent = label;
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (currentLang === code) return;
        setLanguage(code);
        const nav = _lastNavItem;
        // Re-create the panel in place. closeSettingsPanel() removes `settingsPanel`
        // after a 220ms fade, which would delete the freshly created panel.
        settingsPanel = null;
        if (nav) createSettingsFlyout(nav);
      });
      langRow.appendChild(btn);
    });
    form.appendChild(langRow);

    // Injection threshold section
    const thresholdSection = document.createElement("div");
    thresholdSection.className = "settings-section";

    const thresholdLabel = document.createElement("label");
    thresholdLabel.className = "settings-label";
    const thresholdLabelText = document.createElement("span");
    thresholdLabelText.textContent = t("Injection Threshold (seconds):");
    thresholdLabel.appendChild(
      createTooltipButton(
        t("Injection threshold is the time window during which the app considers your last hovered skin as the one to inject.\n\nFor example, if your injection threshold is set to 1 second, whichever skin you were hovering 1 second before champ select ends will be the one injected.\n\nIf your PC or connection is on the slower side, you may need to fine-tune this value."),
        t("Injection threshold info")
      )
    );
    thresholdLabel.appendChild(thresholdLabelText);
    thresholdSection.appendChild(thresholdLabel);

    const thresholdValue = document.createElement("span");
    thresholdValue.className = "settings-value";
    thresholdValue.id = "threshold-value";
    thresholdValue.textContent = "0.50 s";
    thresholdLabel.appendChild(thresholdValue);

    // Create slider container with League of Legends style
    const thresholdSliderContainer = document.createElement("div");
    thresholdSliderContainer.className = "lol-settings-slider-component";
    thresholdSliderContainer.style.display = "flex";
    thresholdSliderContainer.style.alignItems = "center";
    thresholdSliderContainer.style.width = "100%";
    thresholdSliderContainer.style.marginTop = "10px";

    const thresholdSliderWrapper = document.createElement("div");
    thresholdSliderWrapper.className = "lol-settings-slider";
    thresholdSliderWrapper.style.width = "400px";
    thresholdSliderWrapper.style.height = "30px";
    thresholdSliderWrapper.style.position = "relative";

    const thresholdSlider = document.createElement("input");
    thresholdSlider.type = "range";
    thresholdSlider.id = "threshold-slider";
    // Minimum Injection Threshold: 300ms (0.30s)
    thresholdSlider.min = "30";
    thresholdSlider.max = "200";
    thresholdSlider.value = "50";
    thresholdSlider.style.width = "100%";
    thresholdSlider.style.height = "100%";
    thresholdSlider.style.opacity = "0";
    thresholdSlider.style.cursor = "pointer";
    thresholdSlider.style.position = "absolute";
    thresholdSlider.style.zIndex = "2";

    const thresholdSliderUI = document.createElement("div");
    thresholdSliderUI.className = "lol-uikit-slider-wrapper horizontal";
    thresholdSliderUI.style.position = "relative";
    thresholdSliderUI.style.height = "30px";
    thresholdSliderUI.style.width = "100%";

    const thresholdSliderBase = document.createElement("div");
    thresholdSliderBase.className = "lol-uikit-slider-base";
    thresholdSliderBase.style.height = "30px";
    thresholdSliderBase.style.width = "100%";
    thresholdSliderBase.style.position = "absolute";

    const thresholdTrack = document.createElement("div");
    thresholdTrack.className = "lol-uikit-slider-base-track";
    thresholdTrack.style.position = "absolute";
    thresholdTrack.style.top = "14px";
    thresholdTrack.style.left = "0";
    thresholdTrack.style.width = "calc(100% - 2.5px)";
    thresholdTrack.style.height = "2px";
    thresholdTrack.style.background = "#1e2328";

    // Calculate initial position for threshold slider (value 50, min 30, max 200)
    const thresholdInitialValue = 50;
    const thresholdMin = 30;
    const thresholdMax = 200;
    const thresholdPercentage = ((thresholdInitialValue - thresholdMin) / (thresholdMax - thresholdMin)) * 100;
    const thresholdSliderWidth = 400;
    const thresholdButtonWidth = 30;
    const thresholdMaxPosition = thresholdSliderWidth - thresholdButtonWidth; // 370px max
    const thresholdInitialPosition = (thresholdPercentage / 100) * thresholdMaxPosition;

    const thresholdFill = document.createElement("div");
    thresholdFill.className = "lol-uikit-slider-fill";
    thresholdFill.style.width = `${thresholdInitialPosition}px`;
    thresholdFill.style.height = "2px";
    thresholdFill.style.background = "linear-gradient(to left, #695625, #463714)";
    thresholdFill.style.position = "absolute";
    thresholdFill.style.top = "13px";
    thresholdFill.style.border = "thin solid #010a13";
    thresholdFill.style.transition = "width 0.1s ease-out, background 0.2s ease";

    const thresholdButton = document.createElement("div");
    thresholdButton.className = "lol-uikit-slider-button";
    thresholdButton.style.left = `${thresholdInitialPosition}px`;
    thresholdButton.style.width = "30px";
    thresholdButton.style.height = "30px";
    thresholdButton.style.background = "url('/fe/lol-uikit/images/slider-btn.png') no-repeat top left";
    thresholdButton.style.backgroundSize = "100%";
    thresholdButton.style.position = "absolute";
    thresholdButton.style.top = "0px";
    thresholdButton.style.cursor = "pointer";
    thresholdButton.style.transition = "left 0.1s ease-out, background-position 0.2s ease";

    thresholdSliderBase.appendChild(thresholdTrack);
    thresholdSliderBase.appendChild(thresholdFill);
    thresholdSliderBase.appendChild(thresholdButton);
    thresholdSliderUI.appendChild(thresholdSliderBase);
    thresholdSliderWrapper.appendChild(thresholdSlider);
    thresholdSliderWrapper.appendChild(thresholdSliderUI);
    thresholdSliderContainer.appendChild(thresholdSliderWrapper);
    thresholdSection.appendChild(thresholdSliderContainer);

    // Benchmark info placeholder (populated when diagnostics data arrives)
    const benchmarkInfo = document.createElement("div");
    benchmarkInfo.id = "rose-threshold-benchmark";
    benchmarkInfo.style.marginTop = "6px";
    benchmarkInfo.style.fontSize = "11px";
    benchmarkInfo.style.fontFamily = "'Beaufort for LOL', serif";
    benchmarkInfo.style.color = "#7e6f4e";
    thresholdSection.appendChild(benchmarkInfo);

    form.appendChild(thresholdSection);

    // Monitor auto-resume timeout section
    const timeoutSection = document.createElement("div");
    timeoutSection.className = "settings-section";

    const timeoutLabel = document.createElement("label");
    timeoutLabel.className = "settings-label";
    const timeoutLabelText = document.createElement("span");
    timeoutLabelText.textContent = t("Monitor Auto-Resume Timeout (seconds):");
    timeoutLabel.appendChild(
      createTooltipButton(
        t("Auto-resume is a safety feature.\n\nIf the injection process takes longer than the value you set, the app will automatically cancel the injection and let the game start normally.\n\nThis prevents the injection from looping and blocking the game from launching.\n\nIf you use a lot of custom mods, you may need to adjust this value."),
        t("Auto-resume info")
      )
    );
    timeoutLabel.appendChild(timeoutLabelText);
    timeoutSection.appendChild(timeoutLabel);

    const timeoutValue = document.createElement("span");
    timeoutValue.className = "settings-value";
    timeoutValue.id = "timeout-value";
    timeoutValue.textContent = "60 s";
    timeoutLabel.appendChild(timeoutValue);

    // Create slider container with League of Legends style
    const timeoutSliderContainer = document.createElement("div");
    timeoutSliderContainer.className = "lol-settings-slider-component";
    timeoutSliderContainer.style.display = "flex";
    timeoutSliderContainer.style.alignItems = "center";
    timeoutSliderContainer.style.width = "100%";
    timeoutSliderContainer.style.marginTop = "10px";

    const timeoutSliderWrapper = document.createElement("div");
    timeoutSliderWrapper.className = "lol-settings-slider";
    timeoutSliderWrapper.style.width = "400px";
    timeoutSliderWrapper.style.height = "30px";
    timeoutSliderWrapper.style.position = "relative";

    const timeoutSlider = document.createElement("input");
    timeoutSlider.type = "range";
    timeoutSlider.id = "timeout-slider";
    // Minimum Auto-Resume Timeout: 20s
    timeoutSlider.min = "20";
    timeoutSlider.max = "180";
    timeoutSlider.value = "60";
    timeoutSlider.style.width = "100%";
    timeoutSlider.style.height = "100%";
    timeoutSlider.style.opacity = "0";
    timeoutSlider.style.cursor = "pointer";
    timeoutSlider.style.position = "absolute";
    timeoutSlider.style.zIndex = "2";

    const timeoutSliderUI = document.createElement("div");
    timeoutSliderUI.className = "lol-uikit-slider-wrapper horizontal";
    timeoutSliderUI.style.position = "relative";
    timeoutSliderUI.style.height = "30px";
    timeoutSliderUI.style.width = "100%";

    const timeoutSliderBase = document.createElement("div");
    timeoutSliderBase.className = "lol-uikit-slider-base";
    timeoutSliderBase.style.height = "30px";
    timeoutSliderBase.style.width = "100%";
    timeoutSliderBase.style.position = "absolute";

    const timeoutTrack = document.createElement("div");
    timeoutTrack.className = "lol-uikit-slider-base-track";
    timeoutTrack.style.position = "absolute";
    timeoutTrack.style.top = "14px";
    timeoutTrack.style.left = "0";
    timeoutTrack.style.width = "calc(100% - 2.5px)";
    timeoutTrack.style.height = "2px";
    timeoutTrack.style.background = "#1e2328";

    const timeoutFill = document.createElement("div");
    timeoutFill.className = "lol-uikit-slider-fill";
    timeoutFill.style.width = "0px"; // Initial position for min value
    timeoutFill.style.height = "2px";
    timeoutFill.style.background = "linear-gradient(to left, #695625, #463714)";
    timeoutFill.style.position = "absolute";
    timeoutFill.style.top = "13px";
    timeoutFill.style.border = "thin solid #010a13";
    timeoutFill.style.transition = "width 0.1s ease-out, background 0.2s ease";

    const timeoutButton = document.createElement("div");
    timeoutButton.className = "lol-uikit-slider-button";
    timeoutButton.style.left = "0px"; // Initial position
    timeoutButton.style.width = "30px";
    timeoutButton.style.height = "30px";
    timeoutButton.style.background = "url('/fe/lol-uikit/images/slider-btn.png') no-repeat top left";
    timeoutButton.style.backgroundSize = "100%";
    timeoutButton.style.position = "absolute";
    timeoutButton.style.top = "0px";
    timeoutButton.style.cursor = "pointer";
    timeoutButton.style.transition = "left 0.1s ease-out, background-position 0.2s ease";

    timeoutSliderBase.appendChild(timeoutTrack);
    timeoutSliderBase.appendChild(timeoutFill);
    timeoutSliderBase.appendChild(timeoutButton);
    timeoutSliderUI.appendChild(timeoutSliderBase);
    timeoutSliderWrapper.appendChild(timeoutSlider);
    timeoutSliderWrapper.appendChild(timeoutSliderUI);
    timeoutSliderContainer.appendChild(timeoutSliderWrapper);
    timeoutSection.appendChild(timeoutSliderContainer);
    form.appendChild(timeoutSection);

    // Autostart section
    const autostartSection = document.createElement("div");
    autostartSection.className = "settings-section";

    const autostartLabel = document.createElement("label");
    autostartLabel.className = "settings-label";
    autostartLabel.textContent = t("Start automatically with Windows:");
    autostartSection.appendChild(autostartLabel);

    const autostartWrapper = document.createElement("div");
    autostartWrapper.className = "settings-checkbox-wrapper";

    const autostartCheckbox = document.createElement("input");
    autostartCheckbox.type = "checkbox";
    autostartCheckbox.className = "settings-checkbox";
    autostartCheckbox.id = "autostart-checkbox";
    autostartWrapper.appendChild(autostartCheckbox);

    const autostartText = document.createElement("span");
    autostartText.textContent = t("Enable auto-start");
    autostartWrapper.appendChild(autostartText);
    autostartSection.appendChild(autostartWrapper);
    form.appendChild(autostartSection);

    // Privacy & updates section (Kaleido)
    const privacySection = document.createElement("div");
    privacySection.className = "settings-section";

    const privacyLabel = document.createElement("label");
    privacyLabel.className = "settings-label";
    const privacyLabelText = document.createElement("span");
    privacyLabelText.textContent = t("Privacy and updates:");
    privacyLabel.appendChild(
      createTooltipButton(
        t("Only a random installation ID, the app version and start/heartbeat/close events are sent. Nothing about your account or your games. Off by default."),
        t("Telemetry info")
      )
    );
    privacyLabel.appendChild(privacyLabelText);
    privacySection.appendChild(privacyLabel);

    const analyticsWrapper = document.createElement("div");
    analyticsWrapper.className = "settings-checkbox-wrapper";
    const analyticsCheckbox = document.createElement("input");
    analyticsCheckbox.type = "checkbox";
    analyticsCheckbox.className = "settings-checkbox";
    analyticsCheckbox.id = "analytics-checkbox";
    analyticsWrapper.appendChild(analyticsCheckbox);
    const analyticsText = document.createElement("span");
    analyticsText.textContent = t("Send anonymous usage statistics");
    analyticsWrapper.appendChild(analyticsText);
    privacySection.appendChild(analyticsWrapper);

    const autoUpdateWrapper = document.createElement("div");
    autoUpdateWrapper.className = "settings-checkbox-wrapper";
    autoUpdateWrapper.style.marginTop = "6px";
    const autoUpdateCheckbox = document.createElement("input");
    autoUpdateCheckbox.type = "checkbox";
    autoUpdateCheckbox.className = "settings-checkbox";
    autoUpdateCheckbox.id = "autoupdate-checkbox";
    autoUpdateCheckbox.checked = true;
    autoUpdateWrapper.appendChild(autoUpdateCheckbox);
    const autoUpdateText = document.createElement("span");
    autoUpdateText.textContent = t("Check for updates on startup");
    autoUpdateWrapper.appendChild(autoUpdateText);
    privacySection.appendChild(autoUpdateWrapper);

    // Manual update check (Kaleido)
    const updateRow = document.createElement("div");
    updateRow.className = "kaleido-profiles-row";
    const checkBtn = document.createElement("button");
    checkBtn.type = "button";
    checkBtn.className = "kaleido-btn";
    checkBtn.id = "kaleido-update-check";
    checkBtn.textContent = t("Check for updates");
    checkBtn.addEventListener("click", (e) => {
      e.preventDefault(); e.stopPropagation();
      checkBtn.textContent = t("Checking…");
      checkBtn.classList.add("disabled");
      const status = document.getElementById("kaleido-update-status");
      if (status) status.textContent = "";
      const installBtn = document.getElementById("kaleido-update-install");
      if (installBtn) installBtn.hidden = true;
      if (bridge) bridge.send({ type: "update-check" });
      setTimeout(() => {
        if (checkBtn.textContent === t("Checking…")) {
          checkBtn.textContent = t("Check for updates");
          checkBtn.classList.remove("disabled");
        }
      }, 15000);
    });
    updateRow.appendChild(checkBtn);
    const installBtn = document.createElement("button");
    installBtn.type = "button";
    installBtn.className = "kaleido-btn primary";
    installBtn.id = "kaleido-update-install";
    installBtn.hidden = true;
    installBtn.textContent = t("Update now");
    installBtn.addEventListener("click", (e) => {
      e.preventDefault(); e.stopPropagation();
      installBtn.classList.add("disabled");
      const status = document.getElementById("kaleido-update-status");
      if (status) status.textContent = t("Kaleido will restart and install the update.");
      if (bridge) bridge.send({ type: "update-install" });
    });
    updateRow.appendChild(installBtn);
    privacySection.appendChild(updateRow);
    const updateStatus = document.createElement("div");
    updateStatus.id = "kaleido-update-status";
    updateStatus.className = "kaleido-hint";
    updateStatus.style.textAlign = "left";
    privacySection.appendChild(updateStatus);
    if (updateBadgeState.available) {
      updateStatus.textContent = t("Version {version} available", { version: updateBadgeState.version || "?" });
      installBtn.hidden = false;
    }
    setTimeout(applyUpdateBadge, 0);

    form.appendChild(privacySection);

    // Random skin mode (Kaleido)
    const randomSection = document.createElement("div");
    randomSection.className = "settings-section";
    const randomLabel = document.createElement("label");
    randomLabel.className = "settings-label";
    const randomLabelText = document.createElement("span");
    randomLabelText.textContent = t("Random skin:");
    randomLabel.appendChild(createTooltipButton(
      t("Controls which skins the dice button can pick: all of them, only your favorites of that champion, or only the skins saved for that champion in any profile. Falls back to all skins when the pool is empty."),
      t("Random skin info")
    ));
    randomLabel.appendChild(randomLabelText);
    randomSection.appendChild(randomLabel);
    const randomSelect = document.createElement("select");
    randomSelect.className = "kaleido-select";
    randomSelect.id = "random-mode-select";
    [["all", t("All skins")], ["favorites", t("Only favorites")], ["profiles", t("Only profile skins")]].forEach(([v, label]) => {
      const o = document.createElement("option");
      o.value = v; o.textContent = label;
      randomSelect.appendChild(o);
    });
    randomSelect.style.marginTop = "8px";
    randomSelect.style.width = "100%";
    randomSection.appendChild(randomSelect);
    form.appendChild(randomSection);

    // Skin profiles section (Kaleido)
    form.appendChild(createProfilesSection());

    // Favorites + history (Kaleido)
    form.appendChild(createFavoritesSection());
    form.appendChild(createHistorySection());

    const hotkeysHint = document.createElement("div");
    hotkeysHint.className = "kaleido-hint";
    hotkeysHint.textContent = t("Shortcuts in champion select: Ctrl+← / Ctrl+→ cycle recent skins · Ctrl+F favorite the hovered skin · Ctrl+T match a party friend's theme");
    form.appendChild(hotkeysHint);

    // Game path section
    const pathSection = document.createElement("div");
    pathSection.className = "settings-section";

    const pathLabel = document.createElement("label");
    pathLabel.className = "settings-label";
    pathLabel.textContent = t("League of Legends Game Path:");
    pathSection.appendChild(pathLabel);

    const pathInputWrapper = document.createElement("div");
    pathInputWrapper.style.display = "flex";
    pathInputWrapper.style.alignItems = "center";

    const pathInput = document.createElement("input");
    pathInput.type = "text";
    pathInput.className = "settings-input";
    pathInput.id = "game-path-input";
    pathInput.placeholder = "C:\\Riot Games\\League of Legends\\Game";
    pathInput.addEventListener("input", () => {
      updatePathStatus();
    });
    pathInputWrapper.appendChild(pathInput);

    const pathStatus = document.createElement("span");
    pathStatus.className = "settings-status";
    pathStatus.id = "path-status";
    pathStatus.textContent = "";
    pathInputWrapper.appendChild(pathStatus);
    pathSection.appendChild(pathInputWrapper);
    form.appendChild(pathSection);

    // Party relay server (Kaleido)
    const relaySection = document.createElement("div");
    relaySection.className = "settings-section";
    const relayLabel = document.createElement("label");
    relayLabel.className = "settings-label";
    const relayLabelText = document.createElement("span");
    relayLabelText.textContent = t("Party relay server:");
    relayLabel.appendChild(createTooltipButton(
      t("Party mode needs a small relay server on Cloudflare (the relay-worker folder of the repo). Paste its URL here (wss://... or https://...). Everyone in the party must use the same server. Leave empty to use the one built into this version, if any."),
      t("Party relay info")
    ));
    relayLabel.appendChild(relayLabelText);
    relaySection.appendChild(relayLabel);
    const relayInput = document.createElement("input");
    relayInput.type = "text";
    relayInput.className = "settings-input";
    relayInput.id = "relay-url-input";
    relayInput.placeholder = "wss://kaleido-relay.<cuenta>.workers.dev";
    relayInput.style.width = "100%";
    relayInput.style.boxSizing = "border-box";
    relaySection.appendChild(relayInput);
    const relayStatus = document.createElement("div");
    relayStatus.id = "relay-url-status";
    relayStatus.className = "kaleido-hint";
    relayStatus.style.textAlign = "left";
    relaySection.appendChild(relayStatus);
    form.appendChild(relaySection);

    // Add custom mods dropdown
    const modsDropdownContainer = document.createElement("div");
    modsDropdownContainer.style.marginTop = "8px";
    modsDropdownContainer.style.width = "100%";

    const modsDropdown = document.createElement("lol-uikit-framed-dropdown");
    modsDropdown.id = "add-custom-mods-dropdown";
    modsDropdown.className = "lol-publishing-locale-preference-dropdown";
    modsDropdown.setAttribute("tabindex", "0");
    modsDropdown.style.width = "100%";

    // Add placeholder option for header display (hidden in dropdown menu)
    const placeholderOption = document.createElement("lol-uikit-dropdown-option");
    placeholderOption.setAttribute("slot", "lol-uikit-dropdown-option");
    placeholderOption.setAttribute("value", "");
    placeholderOption.className = "framed-dropdown-type placeholder-option";
    placeholderOption.textContent = t("Add custom mods");
    placeholderOption.style.color = "#7d7d7d";
    placeholderOption.style.opacity = "0.7";
    placeholderOption.style.pointerEvents = "none";
    placeholderOption.style.cursor = "default";
    placeholderOption.setAttribute("selected", ""); // Show in header
    // Prevent any click events on the placeholder
    placeholderOption.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    }, true); // Use capture phase to catch early
    modsDropdown.appendChild(placeholderOption);

    const categories = [
      { id: "skins", name: "Skins" },
      { id: "maps", name: "Maps" },
      { id: "fonts", name: "Fonts" },
      { id: "announcers", name: "Announcers" },
      { id: "ui", name: "UI" },
      { id: "voiceover", name: "Voiceover" },
      { id: "loading_screen", name: "Loading Screen" },
      { id: "vfx", name: "VFX" },
      { id: "sfx", name: "SFX" },
      { id: "others", name: "Others" },
    ];

    categories.forEach((category) => {
      const option = document.createElement("lol-uikit-dropdown-option");
      option.setAttribute("slot", "lol-uikit-dropdown-option");
      option.setAttribute("value", category.id);
      option.className = "framed-dropdown-type";
      option.textContent = t(category.name);
      modsDropdown.appendChild(option);
    });

    // Function to aggressively remove focus and glow effects
    const removeFocusAndGlow = () => {
      // Blur the dropdown element
      if (document.activeElement === modsDropdown || modsDropdown.contains(document.activeElement)) {
        modsDropdown.blur();
      }

      // Blur any focused elements within the dropdown
      const focusedElement = modsDropdown.querySelector(':focus');
      if (focusedElement) {
        focusedElement.blur();
      }

      // Remove focus-related attributes and classes
      modsDropdown.removeAttribute('tabindex');
      modsDropdown.setAttribute('tabindex', '0');

      // Blur elements in shadow DOM if accessible
      const shadowRoot = modsDropdown.shadowRoot;
      if (shadowRoot) {
        const shadowFocused = shadowRoot.activeElement;
        if (shadowFocused) {
          shadowFocused.blur();
        }
        // Remove focus from all focusable elements in shadow DOM
        shadowRoot.querySelectorAll('*').forEach(el => {
          if (el === shadowRoot.activeElement || el.matches(':focus')) {
            el.blur();
          }
        });
      }

      // Do not blur document.activeElement globally here. The delayed cleanup
      // runs after opening dialogs too, so the active element may already be
      // the champion search input. Blurring it makes the first click appear
      // to be ignored and removes the caret from the input.
    };

    // Function to reset dropdown to placeholder and close it
    const resetDropdown = () => {
      // Remove active class to close dropdown
      modsDropdown.classList.remove("active");
      // Remove selected from all category options
      modsDropdown.querySelectorAll('lol-uikit-dropdown-option[value!=""]').forEach(opt => {
        opt.removeAttribute("selected");
      });
      // Reset to placeholder option for header display
      const placeholder = modsDropdown.querySelector('.placeholder-option');
      if (placeholder) {
        placeholder.setAttribute("selected", "");
        // Force the dropdown to use placeholder value
        if (modsDropdown.setAttribute) {
          modsDropdown.setAttribute("value", "");
        }
      }

      // Aggressively remove focus and glow effects
      removeFocusAndGlow();

      // Force reset again after a short delay to catch any framework updates
      setTimeout(() => {
        const placeholder = modsDropdown.querySelector('.placeholder-option');
        if (placeholder && !placeholder.hasAttribute('selected')) {
          placeholder.setAttribute("selected", "");
        }
        modsDropdown.querySelectorAll('lol-uikit-dropdown-option[value!=""]').forEach(opt => {
          opt.removeAttribute("selected");
        });
        // Remove focus again after framework updates
        removeFocusAndGlow();
      }, 10);
    };

    // Handle dropdown selection change - prevent showing selected value
    modsDropdown.addEventListener("change", (e) => {
      const selectedValue = e.target.value || e.detail?.value;
      if (selectedValue) {
        handleCategorySelection(selectedValue);
        // Immediately reset to placeholder before UI updates
        resetDropdown();
      }
    });

    // Handle click on options - prevent showing selected value
    modsDropdown.querySelectorAll('lol-uikit-dropdown-option').forEach((option) => {
      option.addEventListener("click", (e) => {
        e.stopPropagation();
        const categoryId = option.getAttribute("value");
        // Ignore placeholder option (empty value)
        if (categoryId) {
          // Prevent the option from being selected
          option.removeAttribute("selected");
          handleCategorySelection(categoryId);
          // Immediately reset to placeholder
          resetDropdown();
          // Remove focus immediately and after delays
          setTimeout(() => removeFocusAndGlow(), 0);
          setTimeout(() => removeFocusAndGlow(), 50);
          setTimeout(() => removeFocusAndGlow(), 100);
          setTimeout(() => removeFocusAndGlow(), 200);
        }
      }, true); // Use capture phase to intercept early
    });

    // Watch for any selected attribute changes and reset to placeholder
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'selected') {
          const target = mutation.target;
          // If a category option (not placeholder) gets selected, reset it
          if (target.getAttribute('value') && target.getAttribute('value') !== '') {
            const placeholder = modsDropdown.querySelector('.placeholder-option');
            if (placeholder && !placeholder.hasAttribute('selected')) {
              // Remove selected from category option
              target.removeAttribute('selected');
              // Set placeholder as selected
              placeholder.setAttribute('selected', '');
            }
          }
        }
      });
    });

    // Observe all dropdown options for selected attribute changes
    modsDropdown.querySelectorAll('lol-uikit-dropdown-option').forEach((option) => {
      observer.observe(option, { attributes: true, attributeFilter: ['selected'] });
    });

    modsDropdownContainer.appendChild(modsDropdown);
    form.appendChild(modsDropdownContainer);

    // Inject shadow DOM styles to override :host .ui-dropdown color
    let retryCount = 0;
    const MAX_RETRIES = 20;
    const injectShadowStyles = () => {
      const root = modsDropdown.shadowRoot;
      if (!root) {
        // Shadow root might not be ready yet, try again (up to MAX_RETRIES times)
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          setTimeout(injectShadowStyles, 50);
        }
        return;
      }

      // Check if style already injected
      if (root.querySelector('style[data-rose-dropdown-color]')) {
        return;
      }

      const rootStyle = document.createElement("style");
      rootStyle.setAttribute("data-rose-dropdown-color", "true");
      rootStyle.textContent = `
        :host .ui-dropdown {
          color: #CDBE91 !important;
          font-size: 12px !important;
          font-weight: normal !important;
          line-height: 16px !important;
          letter-spacing: 0.025em !important;
          -webkit-font-smoothing: subpixel-antialiased !important;
        }
        
        /* Remove all glow effects when not focused */
        :host:not(:focus):not(:focus-within) .ui-dropdown,
        :host:not(:focus):not(:focus-within) * {
          filter: none !important;
          -webkit-filter: none !important;
          box-shadow: none !important;
          text-shadow: none !important;
          outline: none !important;
        }
      `;
      root.appendChild(rootStyle);
    };

    // Try to inject styles immediately and retry if shadow root isn't ready
    injectShadowStyles();

    // Remove focus/shine effect after clicking - use the comprehensive function
    modsDropdown.addEventListener("click", (e) => {
      // Only remove focus if clicking outside of options (on the button itself)
      if (!e.target.closest('lol-uikit-dropdown-option')) {
        setTimeout(() => removeFocusAndGlow(), 100);
      }
    });

    // Remove focus when mouse leaves the dropdown area
    modsDropdown.addEventListener("mouseleave", () => {
      // Only remove focus if dropdown is not active/open
      if (!modsDropdown.classList.contains('active')) {
        removeFocusAndGlow();
      }
    });

    // Also blur when dropdown closes
    modsDropdown.addEventListener("change", () => {
      setTimeout(() => removeFocusAndGlow(), 50);
      setTimeout(() => removeFocusAndGlow(), 150);
    });

    // Watch for when dropdown closes (active class removed) and remove focus
    const activeObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          // If active class was removed, ensure focus is removed
          if (!modsDropdown.classList.contains('active')) {
            removeFocusAndGlow();
            // Also remove focus after a delay to catch any late updates
            setTimeout(() => removeFocusAndGlow(), 50);
            setTimeout(() => removeFocusAndGlow(), 150);
          }
        }
      });
    });
    activeObserver.observe(modsDropdown, { attributes: true, attributeFilter: ['class'] });

    // Open logs folder button
    const logsButton = document.createElement("lol-uikit-flat-button-secondary");
    logsButton.id = "logs-folder-button";
    logsButton.textContent = t("Open Logs Folder");
    logsButton.style.marginTop = "8px";
    logsButton.style.width = "100%";
    logsButton.addEventListener("click", () => {
      openLogsFolder();
    });
    form.appendChild(logsButton);

    // Troubleshooting button (opens a small dialog with compact errors)
    const troubleshootButton = document.createElement("lol-uikit-flat-button-secondary");
    troubleshootButton.id = "troubleshoot-button";
    troubleshootButton.textContent = t("Troubleshooting");
    troubleshootButton.style.marginTop = "8px";
    troubleshootButton.style.width = "100%";
    troubleshootButton.addEventListener("click", () => {
      openDiagnosticsDialog();
    });
    form.appendChild(troubleshootButton);


    // Open Pengu Loader UI button
    const penguUIButton = document.createElement("lol-uikit-flat-button-secondary");
    penguUIButton.id = "pengu-ui-button";
    penguUIButton.textContent = t("Open Pengu Loader UI");
    penguUIButton.style.marginTop = "8px";
    penguUIButton.style.width = "100%";
    penguUIButton.addEventListener("click", () => {
      openPenguLoaderUI();
    });
    form.appendChild(penguUIButton);

    // Save button (moved to last position)
    const saveButton = document.createElement("lol-uikit-flat-button-secondary");
    saveButton.id = "save-button";
    saveButton.textContent = t("Save");
    saveButton.style.marginTop = "8px";
    saveButton.style.width = "21%";
    saveButton.addEventListener("click", () => {
      saveSettings();
    });
    form.appendChild(saveButton);

    // Links section
    const linksSection = document.createElement("div");
    linksSection.className = "settings-links";

    const discordLink = document.createElement("a");
    discordLink.className = "settings-link";
    discordLink.href = DISCORD_INVITE_URL;
    discordLink.target = "_blank";
    discordLink.textContent = "Discord";
    linksSection.appendChild(discordLink);

    const githubLink = document.createElement("a");
    githubLink.className = "settings-link";
    githubLink.href = GITHUB_URL;
    githubLink.target = "_blank";
    githubLink.textContent = "GitHub";
    linksSection.appendChild(githubLink);

    form.appendChild(linksSection);

    flyoutContent.appendChild(form);
    flyoutFrame.appendChild(flyoutContent);
    panel.appendChild(flyoutFrame);

    // Kaleido: fit the panel to the viewport below the icon
    const applyPanelMaxHeight = (rect) => {
      const available = Math.max(240, Math.floor(window.innerHeight - (rect.bottom + 45) - 16));
      flyoutContent.style.setProperty("max-height", `${available}px`, "important");
      flyoutContent.style.setProperty("overflow-y", "auto", "important");
    };
    applyPanelMaxHeight(iconRect);
    window.addEventListener("resize", () => {
      if (!document.getElementById(PANEL_ID)) return;
      try { applyPanelMaxHeight((navItem.querySelector(".menu-item-icon") || navItem).getBoundingClientRect()); } catch (e) {}
    });

    // Setup slider interactions after form is added to DOM
    setTimeout(() => {
      setupSliderInteractions("threshold", thresholdSlider, thresholdButton, thresholdFill, thresholdValue, thresholdMin, thresholdMax, (value) => {
        return parseFloat(value) / 100;
      }, (value) => {
        return `${value.toFixed(2)} s`;
      });

      // Use the slider element's min/max so UI stays correct when limits change
      setupSliderInteractions(
        "timeout",
        timeoutSlider,
        timeoutButton,
        timeoutFill,
        timeoutValue,
        parseInt(timeoutSlider.min || "20", 10),
        parseInt(timeoutSlider.max || "180", 10),
        (value) => {
          return parseInt(value);
      }, (value) => {
        return `${value} s`;
      });
    }, 100);

    settingsPanel = panel;

    // Recalculate position after adding to DOM to ensure accurate positioning
    _flyoutRepositionTimer = setTimeout(() => {
      // If panel was closed before this runs, do nothing.
      if (!settingsPanel || !document.getElementById(PANEL_ID)) return;
      const liveFlyout = document.getElementById(FLYOUT_ID);
      if (!liveFlyout) return;
      const updatedIconElement =
        navItem.querySelector(".menu-item-icon") ||
        navItem.querySelector(".menu-item-icon-wrapper") ||
        navItem;
      const updatedIconRect = updatedIconElement.getBoundingClientRect();
      liveFlyout.style.top = `${updatedIconRect.bottom + 45}px`;
      liveFlyout.style.left = `${updatedIconRect.left + updatedIconRect.width / 2
        }px`;
      liveFlyout.style.transform = "translateX(-50%)"; // Center the panel on the icon
      try { applyPanelMaxHeight(updatedIconRect); } catch (e) {}
    }, 0);

    // Request current settings and benchmark data
    requestSettings();
    requestDiagnostics();
    requestProfiles();
    requestFavorites();
    requestHistory();
  }

  // ---------------------------------------------------------------------
  // Favorites (Kaleido)
  // ---------------------------------------------------------------------
  let favoritesState = { entries: [] };
  let historyState = { entries: [] };

  function requestFavorites() { if (bridge) bridge.send({ type: "favorites-request" }); }
  function requestHistory() { if (bridge) bridge.send({ type: "history-request", limit: 15 }); }

  function handleFavoritesData(payload) {
    favoritesState = { entries: Array.isArray(payload.entries) ? payload.entries : [] };
    loadChampionNames().then(() => renderFavoritesSection());
    renderFavoritesSection();
  }

  function handleHistoryData(payload) {
    historyState = { entries: Array.isArray(payload.entries) ? payload.entries : [] };
    loadChampionNames().then(() => renderHistorySection());
    renderHistorySection();
  }

  function handleUpdateCheckResult(payload) {
    const checkBtn = document.getElementById("kaleido-update-check");
    const installBtn = document.getElementById("kaleido-update-install");
    const status = document.getElementById("kaleido-update-status");
    if (checkBtn) {
      checkBtn.textContent = t("Check for updates");
      checkBtn.classList.remove("disabled");
    }
    if (!status) return;
    if (payload.error) {
      status.textContent = t(payload.error);
      status.style.color = "#ff8a80";
      return;
    }
    status.style.color = "";
    if (payload.available) {
      status.textContent = t("Version {version} available", { version: payload.remoteVersion || "?" });
      if (installBtn) installBtn.hidden = false;
    } else {
      status.textContent = t("You are up to date ({version})", { version: payload.localVersion || "" });
      if (installBtn) installBtn.hidden = true;
    }
  }

  function handleProfileExportResult(payload) {
    const out = document.getElementById("kaleido-export-output");
    if (!out) return;
    if (!payload.success) {
      out.value = payload.error ? t(payload.error) : t("Invalid profile code");
      return;
    }
    out.value = payload.code || "";
    out.hidden = false;
    let copied = false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(payload.code || "").then(() => {
          const note = document.getElementById("kaleido-export-note");
          if (note) note.textContent = t("Profile code copied to clipboard");
        }).catch(() => {});
        copied = true;
      }
    } catch (e) {}
    const note = document.getElementById("kaleido-export-note");
    if (note) note.textContent = copied ? t("Profile code copied to clipboard") : t("Copy this code and share it");
    out.focus();
    out.select();
  }

  function createFavoritesSection() {
    const section = document.createElement("div");
    section.className = "settings-section";
    const label = document.createElement("label");
    label.className = "settings-label";
    const text = document.createElement("span");
    text.textContent = t("Favorites:");
    label.appendChild(createTooltipButtonGlobal(
      t("Press Ctrl+F while hovering a skin in champion select to mark it as a favorite. Favorites can be applied with one click during champion select and used by the dice."),
      t("Favorites info")
    ));
    label.appendChild(text);
    section.appendChild(label);
    const body = document.createElement("div");
    body.id = "kaleido-favorites-body";
    section.appendChild(body);
    renderFavoritesSection();
    return section;
  }

  function renderFavoritesSection() {
    const body = document.getElementById("kaleido-favorites-body");
    if (!body) return;
    body.innerHTML = "";
    const names = _championNames || {};
    const list = document.createElement("div");
    list.className = "kaleido-profiles-list";
    if (favoritesState.entries.length === 0) {
      const empty = document.createElement("div");
      empty.className = "kaleido-profiles-empty";
      empty.textContent = t("No favorites yet. Hover a skin in champion select and press Ctrl+F.");
      list.appendChild(empty);
    } else {
      favoritesState.entries.slice().sort((a, b) => {
        const an = names[a.championId] || "", bn = names[b.championId] || "";
        return an.localeCompare(bn) || a.championId - b.championId || a.skinId - b.skinId;
      }).forEach((entry) => {
        const item = document.createElement("div");
        item.className = "kaleido-profile-entry";
        const icon = document.createElement("img");
        icon.className = "kaleido-profile-icon";
        icon.src = `/lol-game-data/assets/v1/champion-icons/${entry.championId}.png`;
        icon.alt = "";
        icon.onerror = function () { this.style.visibility = "hidden"; };
        item.appendChild(icon);
        const txt = document.createElement("div");
        txt.className = "kaleido-profile-text";
        const champ = document.createElement("div");
        champ.className = "kaleido-profile-champ";
        champ.textContent = names[entry.championId] || t("Champion {id}", { id: entry.championId });
        const skin = document.createElement("div");
        skin.className = "kaleido-profile-skin";
        skin.textContent = entry.skinName || t("Skin {id}", { id: entry.skinId });
        txt.appendChild(champ); txt.appendChild(skin);
        item.appendChild(txt);
        const apply = document.createElement("button");
        apply.type = "button";
        apply.className = "kaleido-btn small";
        apply.textContent = t("Apply");
        apply.addEventListener("click", (e) => {
          e.preventDefault(); e.stopPropagation();
          if (bridge) bridge.send({ type: "apply-skin", skinId: entry.skinId });
        });
        item.appendChild(apply);
        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "kaleido-entry-remove";
        remove.title = t("Remove from favorites");
        remove.setAttribute("aria-label", t("Remove from favorites"));
        remove.textContent = "×";
        remove.addEventListener("click", (e) => {
          e.preventDefault(); e.stopPropagation();
          if (bridge) bridge.send({ type: "favorite-remove", championId: entry.championId, skinId: entry.skinId });
        });
        item.appendChild(remove);
        list.appendChild(item);
      });
    }
    body.appendChild(list);
  }

  // ---------------------------------------------------------------------
  // Match history (Kaleido)
  // ---------------------------------------------------------------------
  function createHistorySection() {
    const section = document.createElement("div");
    section.className = "settings-section";
    const label = document.createElement("label");
    label.className = "settings-label";
    const text = document.createElement("span");
    text.textContent = t("Match history:");
    label.appendChild(createTooltipButtonGlobal(
      t("Every injected skin is recorded here with the game mode and, when the client reports it, the result."),
      t("History info")
    ));
    label.appendChild(text);
    section.appendChild(label);
    const body = document.createElement("div");
    body.id = "kaleido-history-body";
    section.appendChild(body);
    renderHistorySection();
    return section;
  }

  function formatHistoryDate(ts) {
    try {
      const d = new Date((ts || 0) * 1000);
      const pad = (n) => String(n).padStart(2, "0");
      return `${pad(d.getDate())}/${pad(d.getMonth() + 1)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch (e) { return ""; }
  }

  function renderHistorySection() {
    const body = document.getElementById("kaleido-history-body");
    if (!body) return;
    body.innerHTML = "";
    const names = _championNames || {};
    const list = document.createElement("div");
    list.className = "kaleido-profiles-list kaleido-history-list";
    if (historyState.entries.length === 0) {
      const empty = document.createElement("div");
      empty.className = "kaleido-profiles-empty";
      empty.textContent = t("No games recorded yet.");
      list.appendChild(empty);
    } else {
      historyState.entries.forEach((entry) => {
        const item = document.createElement("div");
        item.className = "kaleido-profile-entry";
        const icon = document.createElement("img");
        icon.className = "kaleido-profile-icon";
        icon.src = `/lol-game-data/assets/v1/champion-icons/${entry.championId}.png`;
        icon.alt = "";
        icon.onerror = function () { this.style.visibility = "hidden"; };
        item.appendChild(icon);
        const txt = document.createElement("div");
        txt.className = "kaleido-profile-text";
        const champ = document.createElement("div");
        champ.className = "kaleido-profile-champ";
        const mode = entry.gameMode ? ` · ${entry.gameMode}` : "";
        champ.textContent = `${names[entry.championId] || t("Champion {id}", { id: entry.championId })}${mode}`;
        const skin = document.createElement("div");
        skin.className = "kaleido-profile-skin";
        const what = entry.custom ? `${t("Custom mod")}: ${entry.custom}` : (entry.skinName || t("Skin {id}", { id: entry.skinId }));
        skin.textContent = `${formatHistoryDate(entry.ts)} · ${what}${entry.profile ? ` · ${entry.profile}` : ""}`;
        txt.appendChild(champ); txt.appendChild(skin);
        item.appendChild(txt);
        const badge = document.createElement("span");
        const r = entry.result;
        badge.className = "kaleido-result " + (r === "win" ? "win" : r === "loss" ? "loss" : r === "remake" ? "remake" : "pending");
        badge.textContent = r === "win" ? t("Win") : r === "loss" ? t("Loss") : r === "remake" ? t("Remake") : t("Pending");
        item.appendChild(badge);
        list.appendChild(item);
      });
    }
    body.appendChild(list);
    if (historyState.entries.length > 0) {
      const row = document.createElement("div");
      row.className = "kaleido-profiles-row";
      const clear = document.createElement("button");
      clear.type = "button";
      clear.className = "kaleido-btn";
      clear.textContent = t("Clear history");
      clear.addEventListener("click", (e) => {
        e.preventDefault(); e.stopPropagation();
        if (bridge) bridge.send({ type: "history-clear" });
      });
      row.appendChild(clear);
      body.appendChild(row);
    }
  }

  // ---------------------------------------------------------------------
  // Skin profiles (Kaleido)
  // ---------------------------------------------------------------------
  function requestProfiles() {
    if (bridge) bridge.send({ type: "profiles-request" });
  }

  function handleProfilesData(payload) {
    profilesState = {
      active: payload.active || "",
      profiles: Array.isArray(payload.profiles) ? payload.profiles : [],
      entries: Array.isArray(payload.entries) ? payload.entries : [],
      autoRules: payload.autoRules && typeof payload.autoRules === "object" ? payload.autoRules : { byMode: {}, byRole: {} },
      error: payload.error || null,
      available: true,
    };
    loadChampionNames().then(() => renderProfilesSection());
    renderProfilesSection();
  }

  function sendProfileAction(type, extra) {
    if (!bridge) return;
    bridge.send(Object.assign({ type: type }, extra || {}));
  }

  function createProfilesSection() {
    const section = document.createElement("div");
    section.className = "settings-section";
    section.id = "kaleido-profiles-section";

    const label = document.createElement("label");
    label.className = "settings-label";
    const labelText = document.createElement("span");
    labelText.textContent = t("Skin profiles:");
    label.appendChild(
      createTooltipButtonGlobal(
        t("Every skin you play with is saved into the active profile (that is what Historic Mode uses to bring it back). Create several profiles, for example Ranked, ARAM or Tryhard, and switch between them to keep different skin combos per champion. Changing profiles applies from the next champion select."),
        t("Profiles info")
      )
    );
    label.appendChild(labelText);
    section.appendChild(label);

    const body = document.createElement("div");
    body.id = "kaleido-profiles-body";
    section.appendChild(body);
    renderProfilesSection();
    return section;
  }

  // Tooltip helper usable outside createSettingsFlyout (same look as the inline one)
  function createTooltipButtonGlobal(tooltipText, ariaLabel) {
    const wrapper = document.createElement("span");
    wrapper.className = "rose-tooltip-wrapper";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "rose-tooltip-icon";
    btn.setAttribute("aria-label", ariaLabel || "Info");
    btn.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); });
    const tooltipEl = () => {
      let el = document.getElementById("rose-global-tooltip");
      if (!el) {
        el = document.createElement("div");
        el.id = "rose-global-tooltip";
        el.setAttribute("role", "tooltip");
        el.setAttribute("data-show", "false");
        document.body.appendChild(el);
      }
      return el;
    };
    const show = () => {
      const tooltip = tooltipEl();
      tooltip.textContent = tooltipText;
      tooltip.setAttribute("data-show", "true");
      const rect = btn.getBoundingClientRect();
      const tRect = tooltip.getBoundingClientRect();
      const preferredTop = rect.top - tRect.height - 10;
      const useTop = preferredTop >= 8;
      tooltip.setAttribute("data-placement", useTop ? "top" : "bottom");
      let left = rect.left + rect.width / 2 - tRect.width / 2;
      left = Math.max(8, Math.min(window.innerWidth - tRect.width - 8, left));
      tooltip.style.left = `${Math.round(left)}px`;
      tooltip.style.top = `${Math.round(useTop ? preferredTop : rect.bottom + 10)}px`;
      const arrowX = Math.max(12, Math.min(tRect.width - 12, rect.left + rect.width / 2 - left));
      tooltip.style.setProperty("--rose-tooltip-arrow-x", `${Math.round(arrowX)}px`);
    };
    const hide = () => {
      const el = document.getElementById("rose-global-tooltip");
      if (el) el.setAttribute("data-show", "false");
    };
    btn.addEventListener("mouseenter", show);
    btn.addEventListener("mouseleave", hide);
    btn.addEventListener("focus", show);
    btn.addEventListener("blur", hide);
    wrapper.appendChild(btn);
    return wrapper;
  }

  let _profilesUiMode = { mode: "idle", target: null, deleteArmedAt: 0 };

  function renderProfilesSection() {
    const body = document.getElementById("kaleido-profiles-body");
    if (!body) return;
    body.innerHTML = "";

    const names = _championNames || {};
    const st = profilesState;

    if (!st.available) {
      const warn = document.createElement("div");
      warn.className = "kaleido-profiles-empty";
      warn.textContent = t("Profiles are not available (backend too old).");
      body.appendChild(warn);
      return;
    }

    // Row: select + buttons
    const row = document.createElement("div");
    row.className = "kaleido-profiles-row";

    const select = document.createElement("select");
    select.className = "kaleido-select";
    select.id = "kaleido-profile-select";
    select.setAttribute("aria-label", t("Active profile"));
    st.profiles.forEach((p) => {
      const opt = document.createElement("option");
      opt.value = p.name;
      const count = typeof p.count === "number" ? p.count : 0;
      opt.textContent = `${p.name} (${t(count === 1 ? "{n} champion" : "{n} champions", { n: count })})`;
      if (p.name === st.active) opt.selected = true;
      select.appendChild(opt);
    });
    select.addEventListener("change", () => {
      const name = select.value;
      if (name && name !== st.active) {
        sendProfileAction("profile-switch", { name });
      }
    });
    row.appendChild(select);

    const mkBtn = (text, onClick, extraClass) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "kaleido-btn" + (extraClass ? " " + extraClass : "");
      b.textContent = text;
      b.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); onClick(b); });
      return b;
    };

    row.appendChild(mkBtn(t("New"), () => {
      _profilesUiMode = { mode: "create", target: null, deleteArmedAt: 0 };
      renderProfilesSection();
    }));
    row.appendChild(mkBtn(t("Rename"), () => {
      _profilesUiMode = { mode: "rename", target: st.active, deleteArmedAt: 0 };
      renderProfilesSection();
    }));
    const deleteArmed = _profilesUiMode.mode === "delete" && Date.now() - _profilesUiMode.deleteArmedAt < 4000;
    row.appendChild(mkBtn(deleteArmed ? t("Confirm delete?") : t("Delete"), () => {
      if (st.profiles.length <= 1) return;
      if (deleteArmed) {
        _profilesUiMode = { mode: "idle", target: null, deleteArmedAt: 0 };
        sendProfileAction("profile-delete", { name: st.active });
      } else {
        _profilesUiMode = { mode: "delete", target: st.active, deleteArmedAt: Date.now() };
        renderProfilesSection();
        setTimeout(() => {
          if (_profilesUiMode.mode === "delete") {
            _profilesUiMode = { mode: "idle", target: null, deleteArmedAt: 0 };
            renderProfilesSection();
          }
        }, 4000);
      }
    }, deleteArmed ? "danger" : (st.profiles.length <= 1 ? "disabled" : "")));
    body.appendChild(row);

    // Inline editor for create / rename
    if (_profilesUiMode.mode === "create" || _profilesUiMode.mode === "rename") {
      const isCreate = _profilesUiMode.mode === "create";
      const editor = document.createElement("div");
      editor.className = "kaleido-profiles-editor";

      const input = document.createElement("input");
      input.type = "text";
      input.className = "settings-input kaleido-profile-input";
      input.maxLength = 32;
      input.placeholder = t("Profile name");
      input.value = isCreate ? "" : (_profilesUiMode.target || "");
      editor.appendChild(input);

      let copyCheckbox = null;
      if (isCreate) {
        const copyWrap = document.createElement("label");
        copyWrap.className = "settings-checkbox-wrapper kaleido-copy-wrap";
        copyCheckbox = document.createElement("input");
        copyCheckbox.type = "checkbox";
        copyCheckbox.className = "settings-checkbox";
        copyWrap.appendChild(copyCheckbox);
        const copyText = document.createElement("span");
        copyText.textContent = t("Copy current skins into the new profile");
        copyWrap.appendChild(copyText);
        editor.appendChild(copyWrap);
      }

      const actions = document.createElement("div");
      actions.className = "kaleido-profiles-row";
      const submit = () => {
        const value = (input.value || "").trim();
        if (!value) { input.focus(); return; }
        if (isCreate) {
          sendProfileAction("profile-create", { name: value, copyCurrent: !!(copyCheckbox && copyCheckbox.checked) });
        } else {
          sendProfileAction("profile-rename", { name: _profilesUiMode.target, newName: value });
        }
        _profilesUiMode = { mode: "idle", target: null, deleteArmedAt: 0 };
      };
      actions.appendChild(mkBtn(isCreate ? t("Create") : t("Rename"), submit, "primary"));
      actions.appendChild(mkBtn(t("Cancel"), () => {
        _profilesUiMode = { mode: "idle", target: null, deleteArmedAt: 0 };
        renderProfilesSection();
      }));
      editor.appendChild(actions);
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") { e.preventDefault(); submit(); }
        if (e.key === "Escape") {
          _profilesUiMode = { mode: "idle", target: null, deleteArmedAt: 0 };
          renderProfilesSection();
        }
      });
      body.appendChild(editor);
      setTimeout(() => input.focus(), 0);
    }

    if (st.error) {
      const err = document.createElement("div");
      err.className = "kaleido-profiles-error";
      err.textContent = t(st.error);
      body.appendChild(err);
    }

    // Entries list
    const list = document.createElement("div");
    list.className = "kaleido-profiles-list";
    if (st.entries.length === 0) {
      const empty = document.createElement("div");
      empty.className = "kaleido-profiles-empty";
      empty.textContent = t("This profile has no saved skins yet. Play a game with a skin and it will appear here.");
      list.appendChild(empty);
    } else {
      const sorted = st.entries.slice().sort((a, b) => {
        const an = names[a.championId] || "";
        const bn = names[b.championId] || "";
        return an.localeCompare(bn) || a.championId - b.championId;
      });
      sorted.forEach((entry) => {
        const item = document.createElement("div");
        item.className = "kaleido-profile-entry";

        const icon = document.createElement("img");
        icon.className = "kaleido-profile-icon";
        icon.src = `/lol-game-data/assets/v1/champion-icons/${entry.championId}.png`;
        icon.alt = "";
        icon.onerror = function () { this.style.visibility = "hidden"; };
        item.appendChild(icon);

        const text = document.createElement("div");
        text.className = "kaleido-profile-text";
        const champ = document.createElement("div");
        champ.className = "kaleido-profile-champ";
        champ.textContent = names[entry.championId] || t("Champion {id}", { id: entry.championId });
        const skin = document.createElement("div");
        skin.className = "kaleido-profile-skin";
        if (entry.isCustom) {
          skin.textContent = `${t("Custom mod")}: ${entry.skinName || ""}`;
        } else if (entry.skinName) {
          skin.textContent = entry.skinName;
        } else if (typeof entry.skinId === "number") {
          skin.textContent = t("Skin {id}", { id: entry.skinId });
        } else {
          skin.textContent = "";
        }
        text.appendChild(champ);
        text.appendChild(skin);
        item.appendChild(text);

        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "kaleido-entry-remove";
        remove.title = t("Remove from profile");
        remove.setAttribute("aria-label", t("Remove from profile"));
        remove.textContent = "×";
        remove.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          sendProfileAction("profile-remove-entry", { championId: entry.championId });
        });
        item.appendChild(remove);
        list.appendChild(item);
      });
    }
    body.appendChild(list);

    // ---- automatic rules (by mode / by role)
    const rulesTitle = document.createElement("div");
    rulesTitle.className = "kaleido-subtitle";
    const rulesText = document.createElement("span");
    rulesText.textContent = t("Automatic rules");
    rulesTitle.appendChild(createTooltipButtonGlobal(
      t("Pick a profile per game mode or per assigned role. When a champion select starts, Kaleido switches to the matching profile by itself. Role rules win over mode rules."),
      t("Automatic rules info")
    ));
    rulesTitle.appendChild(rulesText);
    body.appendChild(rulesTitle);

    const rules = st.autoRules || { byMode: {}, byRole: {} };
    const buildRuleRow = (kind, key, labelText) => {
      const row = document.createElement("div");
      row.className = "kaleido-rule-row";
      const lbl = document.createElement("span");
      lbl.className = "kaleido-rule-label";
      lbl.textContent = labelText;
      row.appendChild(lbl);
      const sel = document.createElement("select");
      sel.className = "kaleido-select small";
      const none = document.createElement("option");
      none.value = ""; none.textContent = t("No rule");
      sel.appendChild(none);
      st.profiles.forEach((p) => {
        const o = document.createElement("option");
        o.value = p.name; o.textContent = p.name;
        sel.appendChild(o);
      });
      const current = (kind === "mode" ? rules.byMode : rules.byRole) || {};
      sel.value = current[key] || "";
      sel.addEventListener("change", () => {
        sendProfileAction("profile-auto-rule", { kind, key, profile: sel.value || null });
      });
      row.appendChild(sel);
      return row;
    };
    const rulesGrid = document.createElement("div");
    rulesGrid.className = "kaleido-rules-grid";
    const modeCol = document.createElement("div");
    const modeHead = document.createElement("div");
    modeHead.className = "kaleido-rule-head";
    modeHead.textContent = t("By game mode");
    modeCol.appendChild(modeHead);
    [["CLASSIC", t("Summoner's Rift")], ["ARAM", t("ARAM")], ["URF", t("URF")], ["ARENA", t("Arena")], ["SWIFTPLAY", t("Swiftplay")], ["OTHER", t("Other modes")]]
      .forEach(([k, l]) => modeCol.appendChild(buildRuleRow("mode", k, l)));
    const roleCol = document.createElement("div");
    const roleHead = document.createElement("div");
    roleHead.className = "kaleido-rule-head";
    roleHead.textContent = t("By role");
    roleCol.appendChild(roleHead);
    [["TOP", t("Top")], ["JUNGLE", t("Jungle")], ["MIDDLE", t("Mid")], ["BOTTOM", t("Bot")], ["UTILITY", t("Support")]]
      .forEach(([k, l]) => roleCol.appendChild(buildRuleRow("role", k, l)));
    rulesGrid.appendChild(modeCol);
    rulesGrid.appendChild(roleCol);
    body.appendChild(rulesGrid);

    // ---- export / import
    const ioRow = document.createElement("div");
    ioRow.className = "kaleido-profiles-row";
    ioRow.appendChild(mkBtn(t("Export"), () => {
      sendProfileAction("profile-export", { name: st.active });
    }));
    ioRow.appendChild(mkBtn(t("Import"), () => {
      _profilesUiMode = { mode: "import", target: null, deleteArmedAt: 0 };
      renderProfilesSection();
    }));
    body.appendChild(ioRow);
    const exportOut = document.createElement("input");
    exportOut.type = "text";
    exportOut.readOnly = true;
    exportOut.id = "kaleido-export-output";
    exportOut.className = "settings-input kaleido-profile-input";
    exportOut.hidden = true;
    body.appendChild(exportOut);
    const exportNote = document.createElement("div");
    exportNote.id = "kaleido-export-note";
    exportNote.className = "kaleido-hint";
    body.appendChild(exportNote);

    if (_profilesUiMode.mode === "import") {
      const editor = document.createElement("div");
      editor.className = "kaleido-profiles-editor";
      const input = document.createElement("input");
      input.type = "text";
      input.className = "settings-input kaleido-profile-input";
      input.placeholder = t("Paste a profile code (KPROF1:...)");
      editor.appendChild(input);
      const actWrap = document.createElement("label");
      actWrap.className = "settings-checkbox-wrapper kaleido-copy-wrap";
      const actCheckbox = document.createElement("input");
      actCheckbox.type = "checkbox";
      actCheckbox.className = "settings-checkbox";
      actWrap.appendChild(actCheckbox);
      const actText = document.createElement("span");
      actText.textContent = t("Activate after importing");
      actWrap.appendChild(actText);
      editor.appendChild(actWrap);
      const actions = document.createElement("div");
      actions.className = "kaleido-profiles-row";
      const submit = () => {
        const code = (input.value || "").trim();
        if (!code) { input.focus(); return; }
        sendProfileAction("profile-import", { code, activate: actCheckbox.checked });
        _profilesUiMode = { mode: "idle", target: null, deleteArmedAt: 0 };
      };
      actions.appendChild(mkBtn(t("Import"), submit, "primary"));
      actions.appendChild(mkBtn(t("Cancel"), () => {
        _profilesUiMode = { mode: "idle", target: null, deleteArmedAt: 0 };
        renderProfilesSection();
      }));
      editor.appendChild(actions);
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") { e.preventDefault(); submit(); }
        if (e.key === "Escape") { _profilesUiMode = { mode: "idle", target: null, deleteArmedAt: 0 }; renderProfilesSection(); }
      });
      body.appendChild(editor);
      setTimeout(() => input.focus(), 0);
    }
  }

  function setupSliderInteractions(sliderId, slider, button, fill, valueDisplay, min, max, valueConverter, displayFormatter) {
    if (!slider || !button || !fill || !valueDisplay) return;

    let isHovered = false;
    let isDragging = false;

    const updateSlider = (rawValue) => {
      const value = Math.max(min, Math.min(max, rawValue));
      const percentage = ((value - min) / (max - min)) * 100;
      const sliderWidth = 400;
      const buttonWidth = 30;
      const maxPosition = sliderWidth - buttonWidth; // 370px max to keep button within bounds
      const buttonPosition = (percentage / 100) * maxPosition;

      if (isDragging) {
        button.style.transition = 'none';
        fill.style.transition = 'none';
      } else {
        button.style.transition = 'left 0.1s ease-out';
        fill.style.transition = 'width 0.1s ease-out, background 0.2s ease';
      }

      button.style.left = `${buttonPosition}px`;
      fill.style.width = `${buttonPosition}px`;

      const convertedValue = valueConverter(value);
      valueDisplay.textContent = displayFormatter(convertedValue);
      slider.value = value;

      // Maintain hover effects after slider update
      if (!isDragging) {
        updateHoverEffects();
      }
    };

    const updateHoverEffects = () => {
      if (isHovered || isDragging) {
        fill.style.background = isDragging
          ? 'linear-gradient(to right, #695625, #463714)'
          : 'linear-gradient(to right, #785a28 0%, #c89b3c 56%, #c8aa6e 100%)';
        button.style.backgroundPosition = isDragging ? '0 -60px' : '0 -30px';
      } else {
        fill.style.background = 'linear-gradient(to left, #695625, #463714)';
        button.style.backgroundPosition = '0 0';
      }
    };

    slider.addEventListener('input', (e) => {
      updateSlider(parseInt(e.target.value));
    });

    // Use the slider container for hover detection to be more precise
    const sliderContainer = slider.closest('.lol-settings-slider');
    if (sliderContainer) {
      sliderContainer.addEventListener('mouseenter', () => {
        isHovered = true;
        updateHoverEffects();
      });

      sliderContainer.addEventListener('mouseleave', () => {
        isHovered = false;
        updateHoverEffects();
      });

      // Also handle mouseover on child elements to ensure hover state is maintained
      const handleMouseOver = () => {
        if (!isHovered) {
          isHovered = true;
          updateHoverEffects();
        }
      };

      const handleMouseOut = (e) => {
        // Check if we're actually leaving the container
        const relatedTarget = e.relatedTarget;
        if (!relatedTarget || !sliderContainer.contains(relatedTarget)) {
          isHovered = false;
          updateHoverEffects();
        }
      };

      // Add listeners to all interactive child elements
      const buttonElement = sliderContainer.querySelector('.lol-uikit-slider-button');
      const trackElement = sliderContainer.querySelector('.lol-uikit-slider-base-track');

      if (buttonElement) {
        buttonElement.addEventListener('mouseover', handleMouseOver);
        buttonElement.addEventListener('mouseout', handleMouseOut);
      }

      if (trackElement) {
        trackElement.addEventListener('mouseover', handleMouseOver);
        trackElement.addEventListener('mouseout', handleMouseOut);
      }
    }

    const handleMouseMove = (e) => {
      if (!isDragging) return;

      const sliderRect = slider.getBoundingClientRect();
      const x = Math.max(0, Math.min(sliderRect.width, e.clientX - sliderRect.left));
      const percentage = x / sliderRect.width;
      const value = Math.round(percentage * (max - min) + min);

      updateSlider(value);
    };

    const cleanupDragging = () => {
      if (!isDragging) return;

      isDragging = false;
      updateHoverEffects();

      button.style.transition = 'left 0.1s ease-out';
      fill.style.transition = 'width 0.1s ease-out, background 0.2s ease';

      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', cleanupDragging);
      document.removeEventListener('mouseleave', cleanupDragging);
    };

    button.addEventListener('mousedown', (e) => {
      isDragging = true;
      updateHoverEffects();
      e.preventDefault();

      button.style.transition = 'none';
      fill.style.transition = 'none';

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', cleanupDragging);
      document.addEventListener('mouseleave', cleanupDragging);
    });

    const track = slider.closest('.lol-settings-slider')?.querySelector('.lol-uikit-slider-base-track');
    if (track) {
      track.addEventListener('click', (e) => {
        const sliderRect = slider.getBoundingClientRect();
        const x = Math.max(0, Math.min(sliderRect.width, e.clientX - sliderRect.left));
        const percentage = x / sliderRect.width;
        const value = Math.round(percentage * (max - min) + min);

        updateSlider(value);
      });
    }

    // Initialize position
    updateSlider(parseInt(slider.value));
  }

  function updateSettingsForm() {
    const thresholdSlider = document.getElementById("threshold-slider");
    const thresholdValue = document.getElementById("threshold-value");
    const thresholdButton = thresholdSlider?.closest('.lol-settings-slider')?.querySelector('.lol-uikit-slider-button');
    const thresholdFill = thresholdSlider?.closest('.lol-settings-slider')?.querySelector('.lol-uikit-slider-fill');
    const timeoutSlider = document.getElementById("timeout-slider");
    const timeoutValue = document.getElementById("timeout-value");
    const timeoutButton = timeoutSlider?.closest('.lol-settings-slider')?.querySelector('.lol-uikit-slider-button');
    const timeoutFill = timeoutSlider?.closest('.lol-settings-slider')?.querySelector('.lol-uikit-slider-fill');
    const autostartCheckbox = document.getElementById("autostart-checkbox");
    const pathInput = document.getElementById("game-path-input");

    if (thresholdSlider && thresholdValue && thresholdButton && thresholdFill) {
      const sliderValue = Math.round(currentSettings.threshold * 100);
      thresholdSlider.value = sliderValue;
      thresholdValue.textContent = `${currentSettings.threshold.toFixed(2)} s`;
      const min = parseInt(thresholdSlider.min || "30", 10);
      const max = parseInt(thresholdSlider.max || "200", 10);
      const percentage = ((sliderValue - min) / (max - min)) * 100;
      const maxPosition = 400 - 30; // 370px max
      const buttonPosition = (percentage / 100) * maxPosition;
      thresholdButton.style.left = `${buttonPosition}px`;
      thresholdFill.style.width = `${buttonPosition}px`;
    }

    if (timeoutSlider && timeoutValue && timeoutButton && timeoutFill) {
      timeoutSlider.value = currentSettings.monitorAutoResumeTimeout;
      timeoutValue.textContent = `${currentSettings.monitorAutoResumeTimeout} s`;
      const min = parseInt(timeoutSlider.min || "20", 10);
      const max = parseInt(timeoutSlider.max || "180", 10);
      const percentage = ((currentSettings.monitorAutoResumeTimeout - min) / (max - min)) * 100;
      const maxPosition = 400 - 30; // 370px max
      const buttonPosition = (percentage / 100) * maxPosition;
      timeoutButton.style.left = `${buttonPosition}px`;
      timeoutFill.style.width = `${buttonPosition}px`;
    }

    if (autostartCheckbox) {
      autostartCheckbox.checked = currentSettings.autostart;
    }

    const analyticsCheckbox = document.getElementById("analytics-checkbox");
    if (analyticsCheckbox) {
      analyticsCheckbox.checked = !!currentSettings.analyticsEnabled;
    }
    const autoUpdateCheckbox = document.getElementById("autoupdate-checkbox");
    if (autoUpdateCheckbox) {
      autoUpdateCheckbox.checked = currentSettings.autoUpdate !== false;
    }
    const randomModeSelect = document.getElementById("random-mode-select");
    if (randomModeSelect) {
      randomModeSelect.value = currentSettings.randomMode || "all";
    }
    const relayInput = document.getElementById("relay-url-input");
    if (relayInput) {
      relayInput.value = currentSettings.relayUrl || "";
      const relayStatus = document.getElementById("relay-url-status");
      if (relayStatus) {
        relayStatus.textContent = currentSettings.relayConfigured ? t("Relay server ready") : t("No relay server configured. Party mode will not connect.");
        relayStatus.style.color = currentSettings.relayConfigured ? "#5b9a32" : "#ff8a80";
      }
    }

    if (pathInput) {
      pathInput.value = currentSettings.gamePath || "";
      // Update status based on validation result from settings data
      const pathStatus = document.getElementById("path-status");
      if (pathStatus) {
        const path = pathInput.value.trim();
        if (path.length === 0) {
          pathStatus.textContent = "";
        } else if (currentSettings.gamePathValid) {
          pathStatus.textContent = "✅";
        } else {
          // Request validation for the loaded path
          requestPathValidation(path);
        }
      }
    }

    // Update version badge
    const versionBadge = document.getElementById("rose-version-badge");
    if (versionBadge && currentSettings.version) {
      versionBadge.textContent = `v${currentSettings.version}`;
    }
  }

  function updatePathStatus() {
    const pathInput = document.getElementById("game-path-input");
    const pathStatus = document.getElementById("path-status");

    if (!pathInput || !pathStatus) {
      return;
    }

    const path = pathInput.value.trim();
    if (path.length === 0) {
      pathStatus.textContent = "";
      return;
    }

    // Show loading indicator while validating
    pathStatus.textContent = "⏳";

    // Clear any existing timeout
    if (pathValidationTimeout) {
      clearTimeout(pathValidationTimeout);
    }

    // Debounce validation request (wait 500ms after user stops typing)
    pathValidationTimeout = setTimeout(() => {
      requestPathValidation(path);
    }, 500);
  }

  function requestPathValidation(path) {
    if (!path || !path.trim()) {
      return;
    }

    if (bridge) bridge.send({
      type: "path-validate",
      gamePath: path.trim(),
    });
  }

  function requestSettings() {
    if (bridge) bridge.send({
      type: "settings-request",
    });
  }

  function saveSettings() {
    const thresholdSlider = document.getElementById("threshold-slider");
    const timeoutSlider = document.getElementById("timeout-slider");
    const autostartCheckbox = document.getElementById("autostart-checkbox");
    const pathInput = document.getElementById("game-path-input");

    const threshold = thresholdSlider
      ? parseFloat(thresholdSlider.value) / 100
      : 0.5;
    const monitorAutoResumeTimeout = timeoutSlider
      ? parseInt(timeoutSlider.value)
      : 60;
    const autostart = autostartCheckbox ? autostartCheckbox.checked : false;
    const gamePath = pathInput ? pathInput.value.trim() : "";
    const analyticsCheckbox = document.getElementById("analytics-checkbox");
    const autoUpdateCheckbox = document.getElementById("autoupdate-checkbox");
    const analyticsEnabled = analyticsCheckbox ? analyticsCheckbox.checked : false;
    const autoUpdate = autoUpdateCheckbox ? autoUpdateCheckbox.checked : true;
    const randomModeSelect = document.getElementById("random-mode-select");
    const randomMode = randomModeSelect ? randomModeSelect.value : "all";
    const relayInput = document.getElementById("relay-url-input");
    const relayUrl = relayInput ? relayInput.value.trim() : "";

    // Clamp threshold between 0.30 and 2.0
    const clampedThreshold = Math.max(0.3, Math.min(2.0, threshold));
    // Clamp timeout between 20 and 180
    const clampedTimeout = Math.max(20, Math.min(180, monitorAutoResumeTimeout));

    // Track what we're trying to save; we only clear warnings after the save succeeds.
    _pendingSave = { threshold: clampedThreshold, monitorAutoResumeTimeout: clampedTimeout };

    if (bridge) bridge.send({
      type: "settings-save",
      threshold: clampedThreshold,
      monitorAutoResumeTimeout: clampedTimeout,
      autostart: autostart,
      gamePath: gamePath,
      analyticsEnabled: analyticsEnabled,
      autoUpdate: autoUpdate,
      randomMode: randomMode,
      relayUrl: relayUrl,
    });

    log("info", "Settings save requested", {
      threshold: clampedThreshold,
      monitorAutoResumeTimeout: clampedTimeout,
      autostart,
      gamePath,
    });
  }

  function openAddCustomModsDialog() {
    createCategorySelectionDialog();
    log("info", "Add custom mods dialog opened");
  }

  function createCategorySelectionDialog() {
    // Remove existing dialog if any
    const existingDialog = document.getElementById("add-custom-mods-dialog");
    if (existingDialog) {
      existingDialog.remove();
    }

    // Create dialog container
    const dialog = document.createElement("div");
    dialog.id = "add-custom-mods-dialog";
    dialog.style.position = "fixed";
    dialog.style.top = "0";
    dialog.style.left = "0";
    dialog.style.width = "100%";
    dialog.style.height = "100%";
    dialog.style.zIndex = "10001";
    dialog.style.pointerEvents = "none";
    document.body.appendChild(dialog);

    // Create backdrop
    const backdrop = document.createElement("div");
    backdrop.className = "backdrop";
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) {
        closeCategoryDialog();
      }
    });
    dialog.appendChild(backdrop);

    // Create flyout frame
    let flyoutFrame;
    try {
      flyoutFrame = document.createElement("lol-uikit-flyout-frame");
      flyoutFrame.id = "add-custom-mods-flyout";
      flyoutFrame.className = "flyout";
      flyoutFrame.setAttribute("orientation", "center");
      flyoutFrame.setAttribute("animated", "true");
      flyoutFrame.setAttribute("show", "true");
    } catch (e) {
      log("debug", "Could not create custom element, using div", e);
      flyoutFrame = document.createElement("div");
      flyoutFrame.id = "add-custom-mods-flyout";
      flyoutFrame.className = "flyout";
    }

    flyoutFrame.style.position = "absolute";
    flyoutFrame.style.top = "50%";
    flyoutFrame.style.left = "50%";
    flyoutFrame.style.transform = "translate(-50%, -50%)";
    flyoutFrame.style.zIndex = "10002";
    flyoutFrame.style.pointerEvents = "all";

    // Create flyout content
    let flyoutContent;
    try {
      flyoutContent = document.createElement("lc-flyout-content");
    } catch (e) {
      log("debug", "Could not create lc-flyout-content, using div", e);
      flyoutContent = document.createElement("div");
      flyoutContent.className = "lc-flyout-content";
    }

    // Title
    const title = document.createElement("div");
    title.className = "settings-title";
    title.textContent = t("Add Custom Mods");
    flyoutContent.appendChild(title);

    // Category buttons container
    const categoriesContainer = document.createElement("div");
    categoriesContainer.style.display = "flex";
    categoriesContainer.style.flexDirection = "column";
    categoriesContainer.style.gap = "10px";

    const categories = [
      { id: "skins", name: "Skins" },
      { id: "maps", name: "Maps" },
      { id: "fonts", name: "Fonts" },
      { id: "announcers", name: "Announcers" },
      { id: "ui", name: "UI" },
      { id: "voiceover", name: "Voiceover" },
      { id: "loading_screen", name: "Loading Screen" },
      { id: "vfx", name: "VFX" },
      { id: "sfx", name: "SFX" },
      { id: "others", name: "Others" },
    ];

    categories.forEach((category) => {
      const categoryButton = document.createElement("lol-uikit-flat-button-secondary");
      categoryButton.textContent = t(category.name);
      categoryButton.style.width = "100%";
      categoryButton.style.padding = "12px";
      categoryButton.addEventListener("click", () => {
        handleCategorySelection(category.id);
      });
      categoriesContainer.appendChild(categoryButton);
    });

    flyoutContent.appendChild(categoriesContainer);
    flyoutFrame.appendChild(flyoutContent);
    dialog.appendChild(flyoutFrame);

    // Prevent click from closing
    flyoutFrame.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  }

  function closeCategoryDialog() {
    const dialog = document.getElementById("add-custom-mods-dialog");
    if (dialog) {
      dialog.remove();
    }
  }

  function handleCategorySelection(category) {
    closeCategoryDialog();

    if (category === "skins") {
      // Open champion selection for skins
      openChampionSelection();
    } else {
      // Let the backend open the native mod-file picker for other categories.
      if (bridge) bridge.send({
        type: "add-custom-mods-category-selected",
        category: category,
      });
      log("info", `Category selected: ${category}`);
    }
  }

  function openChampionSelection() {
    // Remove existing dialog if any
    const existingDialog = document.getElementById("champion-selection-dialog");
    if (existingDialog) {
      existingDialog.remove();
    }

    // Dialog is the backdrop itself — no extra wrapper
    const dialog = document.createElement("div");
    dialog.id = "champion-selection-dialog";
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) {
        closeChampionSelection();
      }
    });
    document.body.appendChild(dialog);

    // Create flyout frame
    const flyoutFrame = document.createElement("div");
    flyoutFrame.id = "champion-selection-flyout";
    flyoutFrame.className = "flyout";
    flyoutFrame.style.maxHeight = "75vh";
    flyoutFrame.style.width = "700px";
    flyoutFrame.style.overflowY = "hidden";
    flyoutFrame.style.overflowX = "hidden";
    flyoutFrame.addEventListener("click", (e) => e.stopPropagation());

    // Create flyout content
    const flyoutContent = document.createElement("div");
    flyoutContent.className = "lc-flyout-content";

    // Header with back button and title
    const header = document.createElement("div");
    header.className = "dialog-header";

    // Back button
    const backButton = document.createElement("button");
    backButton.className = "back-button";
    backButton.innerHTML = '<svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"></polyline></svg>';
    backButton.setAttribute("aria-label", t("Go back"));
    backButton.addEventListener("click", () => {
      closeChampionSelection();
    });
    header.appendChild(backButton);

    // Title text
    const titleWrapper = document.createElement("div");
    titleWrapper.className = "dialog-title-wrapper";
    titleWrapper.textContent = t("Select Champion");
    header.appendChild(titleWrapper);

    flyoutContent.appendChild(header);

    // Search input using League UI component
    const searchContainer = document.createElement("div");
    searchContainer.className = "settings-section";

    let flatInput;
    try {
      flatInput = document.createElement("lol-uikit-flat-input");
    } catch (e) {
      flatInput = document.createElement("div");
      flatInput.className = "lol-uikit-flat-input";
    }
    flatInput.className = "champion-search-input";
    flyoutContent.style.width = "700px";

    const searchInput = document.createElement("input");
    searchInput.type = "search";
    searchInput.name = "champion_search";
    searchInput.id = "champion-search-input";
    searchInput.placeholder = t("Search champions...");
    searchInput.autocomplete = "off";
    searchInput.autocorrect = "off";
    searchInput.autocapitalize = "off";
    searchInput.spellcheck = "false";

    flatInput.appendChild(searchInput);
    searchContainer.appendChild(flatInput);
    flyoutContent.appendChild(searchContainer);

    // Loading indicator
    const loadingIndicator = document.createElement("div");
    loadingIndicator.id = "champion-loading";
    loadingIndicator.textContent = t("Loading champions...");
    loadingIndicator.style.color = "#cdbe91";
    loadingIndicator.style.textAlign = "center";
    loadingIndicator.style.padding = "20px";
    loadingIndicator.style.fontFamily = '"Beaufort for LOL", serif';
    flyoutContent.appendChild(loadingIndicator);

    // Champions grid wrapper
    const championsGridWrapper = document.createElement("div");
    championsGridWrapper.id = "champions-grid-wrapper";
    championsGridWrapper.style.overflowY = "auto";
    championsGridWrapper.style.overflowX = "hidden";
    championsGridWrapper.style.maxHeight = "45vh";
    championsGridWrapper.style.marginTop = "12px";

    // Champions grid container
    const championsGrid = document.createElement("div");
    championsGrid.id = "champions-grid";
    championsGridWrapper.appendChild(championsGrid);
    flyoutContent.appendChild(championsGridWrapper);

    flyoutFrame.appendChild(flyoutContent);
    dialog.appendChild(flyoutFrame);

    // Request champions list
    if (bridge) bridge.send({
      type: "add-custom-mods-champion-selected",
      action: "list",
    });

    // Search functionality
    searchInput.addEventListener("input", (e) => {
      const searchTerm = e.target.value.toLowerCase().trim();
      const allChampions = window.__roseAllChampions || [];
      const filtered = allChampions.filter((champ) =>
        champ.name.toLowerCase().includes(searchTerm)
      );
      renderChampionsGrid(filtered);
    });

    // Store render function for bridge response
    window.__roseChampionRenderer = renderChampionsGrid;
  }

  function closeChampionSelection() {
    const dialog = document.getElementById("champion-selection-dialog");
    if (dialog) {
      dialog.remove();
    }
    delete window.__roseChampionRenderer;
    delete window.__roseAllChampions;
  }

  function renderChampionsGrid(champions) {
    const championsGrid = document.getElementById("champions-grid");
    if (!championsGrid) return;

    championsGrid.innerHTML = "";

    if (champions.length === 0) {
      championsGrid.innerHTML = `<div style="grid-column: 1 / -1; color: #cdbe91; text-align: center; padding: 20px; font-family: 'Beaufort for LOL', serif;">${escapeHtml(t("No champions found matching your search."))}</div>`;
      return;
    }

    champions.forEach((champion) => {
      const card = document.createElement("div");
      card.className = "champion-card";

      const img = document.createElement("img");
      img.src = `/lol-game-data/assets/v1/champion-icons/${champion.id}.png`;
      img.alt = champion.name;
      img.loading = "lazy";
      img.onerror = function () { this.style.display = "none"; };
      card.appendChild(img);

      const name = document.createElement("div");
      name.className = "champion-name";
      name.textContent = champion.name;
      card.appendChild(name);

      card.addEventListener("click", () => handleChampionSelection(champion.id));
      championsGrid.appendChild(card);
    });
  }

  function handleChampionSelection(championId) {
    closeChampionSelection();
    openSkinSelection(championId);
    log("info", "Champion selected for custom mods: champion=" + championId);
  }

  function openSkinSelection(championId) {
    // Remove existing dialog if any
    const existingDialog = document.getElementById("skin-selection-dialog");
    if (existingDialog) {
      existingDialog.remove();
    }

    // Dialog is the backdrop itself
    const dialog = document.createElement("div");
    dialog.id = "skin-selection-dialog";
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) {
        closeSkinSelection();
      }
    });
    document.body.appendChild(dialog);

    // Create flyout frame
    const flyoutFrame = document.createElement("div");
    flyoutFrame.id = "skin-selection-flyout";
    flyoutFrame.className = "flyout";
    flyoutFrame.style.maxHeight = "75vh";
    flyoutFrame.style.height = "75vh";
    flyoutFrame.style.width = "700px";
    flyoutFrame.style.boxSizing = "border-box";
    flyoutFrame.style.overflowY = "hidden";
    flyoutFrame.style.overflowX = "hidden";
    flyoutFrame.addEventListener("click", (e) => e.stopPropagation());

    // Create flyout content
    const flyoutContent = document.createElement("div");
    flyoutContent.className = "lc-flyout-content";
    flyoutContent.style.display = "flex";
    flyoutContent.style.flexDirection = "column";
    flyoutContent.style.height = "100%";
    flyoutContent.style.boxSizing = "border-box";

    // Header with back button and title
    const header = document.createElement("div");
    header.className = "dialog-header";
    header.id = "skin-selection-header";

    // Back button
    const backButton = document.createElement("button");
    backButton.className = "back-button";
    backButton.innerHTML = '<svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"></polyline></svg>';
    backButton.setAttribute("aria-label", t("Go back"));
    backButton.addEventListener("click", (e) => {
      e.stopPropagation();
      closeSkinSelection();
      openChampionSelection();
    });
    header.appendChild(backButton);

    // Title text
    const titleWrapper = document.createElement("div");
    titleWrapper.className = "dialog-title-wrapper";
    titleWrapper.textContent = t("Select Skins & Chromas");
    header.appendChild(titleWrapper);

    flyoutContent.appendChild(header);

    // Loading indicator
    const loadingIndicator = document.createElement("div");
    loadingIndicator.id = "skin-loading";
    loadingIndicator.textContent = t("Loading skins...");
    loadingIndicator.style.color = "#cdbe91";
    loadingIndicator.style.textAlign = "center";
    loadingIndicator.style.padding = "20px";
    loadingIndicator.style.fontFamily = '"Beaufort for LOL", serif';
    flyoutContent.appendChild(loadingIndicator);

    // Skins list container
    const skinsList = document.createElement("div");
    skinsList.style.overflowY = "auto";
    skinsList.style.overflowX = "hidden";
    skinsList.id = "skins-list";
    skinsList.style.flex = "1 1 auto";
    skinsList.style.minHeight = "0";
    skinsList.style.maxHeight = "none";

    // Create inner container for flex layout
    const skinsListContainer = document.createElement("div");
    skinsListContainer.className = "skins-list-container";
    skinsList.appendChild(skinsListContainer);

    flyoutContent.appendChild(skinsList);

    const selectionActions = document.createElement("div");
    selectionActions.id = "skin-selection-actions";
    selectionActions.style.flex = "0 0 auto";

    const selectionCount = document.createElement("span");
    selectionCount.id = "skin-selection-count";
    selectionCount.textContent = t("{count} targets selected", { count: 0 });
    selectionActions.appendChild(selectionCount);

    const confirmButton = document.createElement("button");
    confirmButton.id = "skin-selection-confirm";
    confirmButton.type = "button";
    confirmButton.textContent = t("Confirm & Select Mod");
    confirmButton.disabled = true;
    confirmButton.addEventListener("click", (e) => {
      e.stopPropagation();
      confirmSkinSelection(championId);
    });
    selectionActions.appendChild(confirmButton);
    flyoutContent.appendChild(selectionActions);

    flyoutFrame.appendChild(flyoutContent);
    dialog.appendChild(flyoutFrame);

    window.__roseSelectedSkinIds = new Set();

    // Request skins for champion
    if (bridge) bridge.send({
      type: "add-custom-mods-skin-selected",
      action: "list",
      championId: championId,
    });

    // Store champion ID for later use
    window.__roseSelectedChampionId = championId;
  }

  function closeSkinSelection() {
    const dialog = document.getElementById("skin-selection-dialog");
    if (dialog) {
      dialog.remove();
    }
    delete window.__roseSelectedChampionId;
  }

  function updateSkinSelectionUI() {
    const selectedSkinIds = window.__roseSelectedSkinIds || new Set();
    document.querySelectorAll("#skins-list [data-target-skin-id]").forEach((option) => {
      const skinId = Number(option.dataset.targetSkinId);
      const selected = selectedSkinIds.has(skinId);
      if (option.classList.contains("skin-option")) {
        option.classList.toggle("selected", selected);
      } else {
        option.classList.toggle("target-selected", selected);
      }
      option.setAttribute("aria-pressed", selected ? "true" : "false");
    });

    document.querySelectorAll("#skins-list .skin-card").forEach((card) => {
      const selected = Array.from(card.querySelectorAll("[data-target-skin-id]")).some(
        (option) => selectedSkinIds.has(Number(option.dataset.targetSkinId))
      );
      card.classList.toggle("selected", selected);
    });

    const selectionCount = document.getElementById("skin-selection-count");
    if (selectionCount) {
      const count = selectedSkinIds.size;
      selectionCount.textContent = t(count === 1 ? "{count} target selected" : "{count} targets selected", { count });
    }

    const confirmButton = document.getElementById("skin-selection-confirm");
    if (confirmButton) {
      confirmButton.disabled = selectedSkinIds.size === 0;
    }
  }

  function handleSkinSelection(championId, skinId) {
    const selectedSkinIds = window.__roseSelectedSkinIds || new Set();
    const numericSkinId = Number(skinId);
    if (!Number.isFinite(numericSkinId) || numericSkinId <= 0) return;

    if (selectedSkinIds.has(numericSkinId)) {
      selectedSkinIds.delete(numericSkinId);
    } else {
      selectedSkinIds.add(numericSkinId);
    }
    window.__roseSelectedSkinIds = selectedSkinIds;
    updateSkinSelectionUI();
    log("info", `Skin selection toggled: champion=${championId}, skin=${numericSkinId}`);
  }

  function confirmSkinSelection(championId) {
    const selectedSkinIds = Array.from(window.__roseSelectedSkinIds || []);
    if (selectedSkinIds.length === 0) return;

    closeSkinSelection();
    if (bridge) bridge.send({
      type: "add-custom-mods-skin-selected",
      action: "create",
      championId: championId,
      skinIds: selectedSkinIds,
    });
    log("info", `Skin selection confirmed: champion=${championId}, skins=${selectedSkinIds.join(",")}`);
  }

  function handleChampionsListResponse(payload) {
    const loadingIndicator = document.getElementById("champion-loading");
    if (loadingIndicator) {
      loadingIndicator.style.display = "none";
    }

    const championsGrid = document.getElementById("champions-grid");
    if (!championsGrid) return;

    if (payload.error) {
      championsGrid.innerHTML = `<div style="color: #ff6b6b; text-align: center; padding: 20px; font-family: 'Beaufort for LOL', serif;">${escapeHtml(payload.error)}</div>`;
      return;
    }

    const champions = payload.champions || [];
    if (champions.length === 0) {
      championsGrid.innerHTML = `<div style="color: #cdbe91; text-align: center; padding: 20px; font-family: 'Beaufort for LOL', serif;">${escapeHtml(t("No champions found. Please ensure League of Legends client is running."))}</div>`;
      return;
    }

    // Store champions for search functionality
    window.__roseAllChampions = champions;

    // Render champions
    if (window.__roseChampionRenderer) {
      window.__roseChampionRenderer(champions);
    } else {
      // Fallback: render directly
      renderChampionsGrid(champions);
    }
  }

  function handleChampionSkinsResponse(payload) {
    const loadingIndicator = document.getElementById("skin-loading");
    if (loadingIndicator) {
      loadingIndicator.style.display = "none";
    }

    const skinsList = document.getElementById("skins-list");
    if (!skinsList) return;

    if (payload.error) {
      let skinsListContainer = skinsList.querySelector(".skins-list-container");
      if (!skinsListContainer) {
        skinsListContainer = document.createElement("div");
        skinsListContainer.className = "skins-list-container";
        skinsList.innerHTML = "";
        skinsList.appendChild(skinsListContainer);
      } else {
        skinsListContainer.innerHTML = "";
      }
      skinsListContainer.innerHTML = `<div style="color: #ff6b6b; text-align: center; padding: 20px; font-family: 'Beaufort for LOL', serif;">${escapeHtml(payload.error)}</div>`;
      return;
    }

    const skins = payload.skins || [];
    const championId = payload.championId;

    // Update title with champion name if available
    const header = document.getElementById("skin-selection-header");
    if (header && payload.championName) {
      const titleWrapper = header.querySelector(".dialog-title-wrapper");
      if (titleWrapper) {
        titleWrapper.textContent = `${t("Select Skins & Chromas")} - ${payload.championName}`;
      }
    }

    // Get or create the container inside the scrollable
    let skinsListContainer = skinsList.querySelector(".skins-list-container");
    if (!skinsListContainer) {
      skinsListContainer = document.createElement("div");
      skinsListContainer.className = "skins-list-container";
      skinsList.innerHTML = "";
      skinsList.appendChild(skinsListContainer);
    } else {
      skinsListContainer.innerHTML = "";
    }

    if (skins.length === 0) {
      skinsListContainer.innerHTML = `<div style="color: #cdbe91; text-align: center; padding: 20px; font-family: 'Beaufort for LOL', serif;">${escapeHtml(t("No skins found for this champion."))}</div>`;
      return;
    }

    const baseSkins = skins.filter((skin) => !skin.isChroma);
    const chromasByBaseSkin = new Map();
    skins.filter((skin) => skin.isChroma).forEach((chroma) => {
      const baseSkinId = Number(chroma.baseSkinId);
      if (!Number.isFinite(baseSkinId)) return;
      if (!chromasByBaseSkin.has(baseSkinId)) {
        chromasByBaseSkin.set(baseSkinId, []);
      }
      chromasByBaseSkin.get(baseSkinId).push(chroma);
    });

    const getSkinId = (skin) => Number(skin.skinId || skin.id);
    const getTilePath = (skin) => {
      const skinId = getSkinId(skin);
      return skin.tilePath || `/lol-game-data/assets/v1/champion-tiles/${skinId}.jpg`;
    };

    baseSkins.forEach((skin) => {
      const baseSkinId = getSkinId(skin);
      const chromas = chromasByBaseSkin.get(baseSkinId) || [];
      const card = document.createElement("div");
      card.className = "skin-card";
      card.dataset.baseSkinId = String(baseSkinId);

      const inner = document.createElement("div");
      inner.className = "skin-card-inner";

      const front = document.createElement("div");
      front.className = "skin-card-face skin-card-front";
      front.dataset.targetSkinId = String(baseSkinId);
      front.setAttribute("role", "button");
      front.setAttribute("aria-pressed", "false");

      const img = document.createElement("img");
      img.src = getTilePath(skin);
      img.alt = skin.name || `Skin ${baseSkinId}`;
      img.loading = "lazy";
      img.onerror = function () { this.style.display = "none"; };
      front.appendChild(img);

      const nameEl = document.createElement("div");
      nameEl.className = "skin-name";
      nameEl.textContent = skin.name || t("Skin {id}", { id: baseSkinId });
      front.appendChild(nameEl);

      front.addEventListener("click", () => handleSkinSelection(championId, baseSkinId));

      if (chromas.length > 0) {
        const chromaButton = document.createElement("button");
        chromaButton.type = "button";
        chromaButton.className = "skin-chroma-button";
        chromaButton.textContent = t("Chromas {n}", { n: chromas.length });
        chromaButton.setAttribute("aria-label", t("Show {n} chromas", { n: chromas.length }));
        chromaButton.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          card.classList.add("is-flipped");
        });
        front.appendChild(chromaButton);
      }
      inner.appendChild(front);

      if (chromas.length > 0) {
        const back = document.createElement("div");
        back.className = "skin-card-face skin-card-back";

        const backHeader = document.createElement("div");
        backHeader.className = "skin-card-back-header";

        const backButton = document.createElement("button");
        backButton.type = "button";
        backButton.className = "skin-card-back-close";
        backButton.textContent = "\u2039";
        backButton.setAttribute("aria-label", t("Back to skin"));
        backButton.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          card.classList.remove("is-flipped");
        });
        backHeader.appendChild(backButton);

        const backTitle = document.createElement("span");
        backTitle.textContent = `${skin.name || "Skin"} - Chromas`;
        backHeader.appendChild(backTitle);
        back.appendChild(backHeader);

        const options = document.createElement("div");
        options.className = "skin-card-back-options";
        [skin, ...chromas].forEach((optionSkin, optionIndex) => {
          const optionId = getSkinId(optionSkin);
          const option = document.createElement("button");
          option.type = "button";
          option.className = "skin-option";
          option.dataset.targetSkinId = String(optionId);
          option.setAttribute("aria-pressed", "false");

          const optionImg = document.createElement("img");
          optionImg.src = getTilePath(optionSkin);
          optionImg.alt = optionSkin.name || `Skin ${optionId}`;
          optionImg.loading = "lazy";
          optionImg.onerror = function () { this.style.display = "none"; };
          option.appendChild(optionImg);

          const optionName = document.createElement("span");
          optionName.className = "skin-option-name";
          optionName.textContent = optionIndex === 0
            ? t("Base skin")
            : (optionSkin.name || t("Chroma {id}", { id: optionId }));
          option.appendChild(optionName);

          option.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            handleSkinSelection(championId, optionId);
          });
          options.appendChild(option);
        });
        back.appendChild(options);
        inner.appendChild(back);
      }

      card.appendChild(inner);
      skinsListContainer.appendChild(card);
    });
    updateSkinSelectionUI();
  }

  function handleFolderOpenedResponse(payload) {
    if (payload.cancelled) {
      log("info", "Mod import cancelled");
    } else if (payload.error) {
      log("error", `Failed to import mod: ${escapeHtml(payload.error)}`);
      // Could show an error message to user here
    } else {
      log("info", `Imported mod: ${payload.modName || payload.path || "success"}`);
    }
  }

  function openLogsFolder() {
    if (bridge) bridge.send({
      type: "open-logs-folder",
    });
    log("info", "Open logs folder requested");
  }

  function requestDiagnostics() {
    if (bridge) bridge.send({ type: "diagnostics-request" });
  }

  function openDiagnosticsDialog() {
    // If already open, close it
    const existing = document.getElementById("rose-diagnostics-dialog");
    if (existing) {
      existing.remove();
      diagnosticsDialog = null;
      return;
    }

    const dialog = document.createElement("div");
    dialog.id = "rose-diagnostics-dialog";
    dialog.style.position = "fixed";
    dialog.style.top = "0";
    dialog.style.left = "0";
    dialog.style.width = "100%";
    dialog.style.height = "100%";
    dialog.style.zIndex = "10002";
    dialog.style.pointerEvents = "none";
    document.body.appendChild(dialog);

    const backdrop = document.createElement("div");
    backdrop.style.position = "absolute";
    backdrop.style.top = "0";
    backdrop.style.left = "0";
    backdrop.style.width = "100%";
    backdrop.style.height = "100%";
    backdrop.style.background = "rgba(0, 0, 0, 0.6)";
    backdrop.style.pointerEvents = "auto";
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) {
        dialog.remove();
        diagnosticsDialog = null;
      }
    });
    dialog.appendChild(backdrop);

    const panel = document.createElement("div");
    panel.style.position = "absolute";
    // Center relative to the Settings flyout (not the whole client window)
    // Fallback to viewport center if the flyout can't be found.
    let centerX = window.innerWidth / 2;
    let centerY = window.innerHeight / 2;
    try {
      const settingsFlyout = document.getElementById(FLYOUT_ID);
      if (settingsFlyout) {
        const r = settingsFlyout.getBoundingClientRect();
        centerX = r.left + r.width / 2;
        centerY = r.top + r.height / 2;
      }
    } catch (e) {}

    panel.style.left = `${centerX}px`;
    panel.style.top = `${centerY}px`;
    panel.style.transform = "translate(-50%, -50%)";
    panel.style.width = "520px";
    panel.style.maxWidth = "92vw";
    panel.style.background = "#0b0f14";
    panel.style.border = "1px solid #463714";
    panel.style.boxShadow = "0 10px 30px rgba(0,0,0,0.6)";
    panel.style.padding = "14px";
    panel.style.pointerEvents = "auto";
    panel.style.position = "absolute";

    const title = document.createElement("div");
    title.textContent = t("Troubleshooting");
    title.style.color = "#cdbe91";
    title.style.fontFamily = "'Beaufort for LOL', serif";
    title.style.fontSize = "16px";
    title.style.marginBottom = "10px";
    panel.appendChild(title);

    // Top-right close button
    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.setAttribute("aria-label", t("Close"));
    closeBtn.textContent = "×";
    closeBtn.style.position = "absolute";
    closeBtn.style.top = "6px";
    closeBtn.style.right = "8px";
    closeBtn.style.width = "26px";
    closeBtn.style.height = "26px";
    closeBtn.style.lineHeight = "24px";
    closeBtn.style.padding = "0";
    closeBtn.style.border = "none";
    closeBtn.style.background = "#0b0f14";
    closeBtn.style.color = "#cdbe91";
    closeBtn.style.cursor = "pointer";
    closeBtn.style.borderRadius = "4px";
    closeBtn.style.fontFamily = "'Beaufort for LOL', serif";
    closeBtn.style.fontSize = "18px";
    closeBtn.addEventListener("click", () => {
      dialog.remove();
      diagnosticsDialog = null;
    });
    panel.appendChild(closeBtn);

    const body = document.createElement("div");
    body.id = "rose-diagnostics-body";
    body.style.color = "#cdbe91";
    body.style.fontFamily = "'Beaufort for LOL', serif";
    body.style.fontSize = "12px";
    body.style.whiteSpace = "normal";
    body.style.border = "1px solid #010a13";
    body.style.background = "#070a0e";
    body.style.padding = "10px";
    body.style.maxHeight = "220px";
    body.style.overflow = "auto";
    body.style.lineHeight = "1.35";
    body.textContent = t("Loading…");
    panel.appendChild(body);

    const foot = document.createElement("div");
    foot.id = "rose-diagnostics-foot";
    foot.style.marginTop = "8px";
    foot.style.color = "#7e6f4e";
    foot.style.fontFamily = "'Beaufort for LOL', serif";
    foot.style.fontSize = "11px";
    panel.appendChild(foot);

    backdrop.appendChild(panel);
    diagnosticsDialog = dialog;

    // After layout, clamp the panel inside the viewport (avoids off-screen when flyout is near an edge).
    try {
      requestAnimationFrame(() => {
        try {
          const pr = panel.getBoundingClientRect();
          const margin = 12;
          let dx = 0;
          let dy = 0;
          if (pr.left < margin) dx = margin - pr.left;
          if (pr.right > window.innerWidth - margin) dx = (window.innerWidth - margin) - pr.right;
          if (pr.top < margin) dy = margin - pr.top;
          if (pr.bottom > window.innerHeight - margin) dy = (window.innerHeight - margin) - pr.bottom;
          if (dx || dy) {
            const curLeft = parseFloat(panel.style.left) || centerX;
            const curTop = parseFloat(panel.style.top) || centerY;
            panel.style.left = `${curLeft + dx}px`;
            panel.style.top = `${curTop + dy}px`;
          }
        } catch (e) {}
      });
    } catch (e) {}

    requestDiagnostics();
    renderDiagnosticsDialog();
  }

  function renderDiagnosticsDialog() {
    if (!diagnosticsDialog) return;
    const body = document.getElementById("rose-diagnostics-body");
    const foot = document.getElementById("rose-diagnostics-foot");
    if (!body || !foot) return;

    const errors = Array.isArray(diagnosticsState.errors) ? diagnosticsState.errors : [];
    if (errors.length === 0) {
      body.innerHTML = `
        <div style="opacity:0.85; margin-bottom:8px;">${t("No recent errors.")}</div>
        <div style="opacity:0.75;">${t("If something feels off, open the logs folder and share the latest log in a discord ticket.")}</div>
      `.trim();
    } else {
      const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
      const fmtS = (n, digits = 2) => (typeof n === "number" && Number.isFinite(n) ? `${n.toFixed(digits)} s` : "");
      const curThreshold = typeof currentSettings?.threshold === "number" ? currentSettings.threshold : null;
      const curMonitorTimeout =
        typeof currentSettings?.monitorAutoResumeTimeout === "number"
          ? currentSettings.monitorAutoResumeTimeout
          : null;

      const escapeHtml = (value) =>
        String(value ?? "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#39;");

      const describe = (e) => {
        const raw = String(e?.text || "").trim();
        const code = String(e?.code || "").trim();

        const isInjectionThreshold =
          code === "BASE_SKIN_FORCE_SLOW" ||
          code === "BASE_SKIN_VERIFY_FAILED" ||
          /Injection\s*Threshold/i.test(raw);
        const isMonitorTimeout =
          code === "AUTO_RESUME_TRIGGERED" ||
          code === "MONITOR_AUTO_RESUME_TIMEOUT" ||
          /Auto-Resume Timeout/i.test(raw) ||
          /Monitor Auto-Resume Timeout/i.test(raw);

        if (isInjectionThreshold) {
          const thresholdAtMax =
            typeof curThreshold === "number" && Number.isFinite(curThreshold) && curThreshold >= (2.0 - 1e-6);
          const stats = diagnosticsState.baseSkinStats;
          const hasTrackerData = stats && typeof stats.p90_ms === "number" && stats.confirmed_count > 0;
          const recMs = hasTrackerData ? stats.recommended_threshold_ms : (e.recommendedThresholdMs || null);
          const recS = typeof recMs === "number" ? (recMs / 1000).toFixed(2) : null;

          let fixText;
          if (thresholdAtMax) {
            fixText = t("Fix: you're already at the maximum Injection Threshold. This usually means the injection is extremely slow. Try lighter mods, close heavy apps, move League/mods to an SSD, and consider adding antivirus exclusions for the League and Kaleido folders. Then retry.");
          } else if (hasTrackerData) {
            fixText = t("Fix: based on {games} game(s), base skin confirmation takes up to {p90}ms (p90). Recommended threshold: {rec}s. Use the \"Apply recommended\" button below, or increase \"Injection Threshold\" manually.", { games: stats.confirmed_count, p90: stats.p90_ms, rec: recS });
          } else {
            fixText = t("Fix: increase \"Injection Threshold (seconds)\" and click Save. If the warning is still there, increase it again and Save again. Once the warning is gone, retry your skin selection.");
          }

          return {
            title:
              code === "BASE_SKIN_VERIFY_FAILED"
                ? t("Base skin verification failed (selected skin may not apply)")
                : t("Base skin forcing took too long (skin may not appear)"),
            details: [
              code === "BASE_SKIN_VERIFY_FAILED"
                ? t("What it means: the client didn't confirm the base skin change in time.")
                : t("What it means: forcing the base skin took too long, so the selected skin may not show."),
              fixText,
            ],
          };
        }

        if (isMonitorTimeout) {
          const timeoutAtMax =
            typeof curMonitorTimeout === "number" &&
            Number.isFinite(curMonitorTimeout) &&
            curMonitorTimeout >= (180 - 1e-6);
          return {
            title: t("Injection exceeded the timeout (process was stopped)"),
            details: [
              t("What it means: injection took longer than the allowed time, so ROSE stopped the process."),
              timeoutAtMax
                ? t("Fix: you're already at the maximum Monitor Auto-Resume Timeout. This usually means the injection is extremely slow. Try lighter mods, close heavy apps, move League/mods to an SSD, and consider adding antivirus exclusions for the League and Kaleido folders. Then retry.")
                : t("Fix: increase \"Monitor Auto-Resume Timeout (seconds)\" and click Save. If the warning is still there, increase it again and Save again. Once the warning is gone, try again."),
            ],
          };
        }

        const isLowDiskSpace =
          code === 'LOW_DISK_SPACE' || /Low Disk Space/i.test(raw) || /not enough disk space/i.test(raw);
        if (isLowDiskSpace) {
          return {
            title: t("Not enough disk space for injection"),
            details: [
              t("What it means: Kaleido could not create the overlay for the selected skin."),
              t("Fix: free up space on the drive containing Kaleido injection files, then retry. Map mods can require several GB."),
            ],
          };
        }

        // Fallback: show raw error text as-is.
        return {
          title: raw || t("(unknown error)"),
          details: [],
        };
      };

      const headerHtml = `
        <div style="display:flex; flex-direction:column; gap:4px; margin-bottom:10px;">
          <div style="font-weight:700;">${t("Errors (most recent first)")}</div>
          <div style="opacity:0.75;">${t("Tip: after changing a setting, click")} <span style="font-weight:700;">${t("Save")}</span> ${t("then retry.")}</div>
        </div>
      `.trim();

      const itemsHtml = errors
        .map((e, idx) => {
          const ts = String(e?.ts || "").trim();
          const desc = describe(e);
          const title = escapeHtml(desc.title);
          const tsHtml = ts ? `<span style="opacity:0.75;">${escapeHtml(ts)}</span>` : "";

          const detailsHtml = (desc.details || [])
            .map((d) => `<li style="margin:2px 0;">${escapeHtml(d)}</li>`)
            .join("");

          return `
            <div style="border:1px solid rgba(70,55,20,0.55); background: rgba(1,10,19,0.35); padding:8px; margin-bottom:8px;">
              <div style="display:flex; gap:8px; align-items:baseline; margin-bottom:6px;">
                <span style="font-weight:800; color:#c89b3c;">${idx + 1}.</span>
                ${tsHtml}
                <span style="font-weight:700;">${title}</span>
              </div>
              ${
                detailsHtml
                  ? `<ul style="margin:0; padding-left:18px;">${detailsHtml}</ul>`
                  : `<div style="opacity:0.8;">${escapeHtml(String(e?.text || "").trim() || t("No additional details."))}</div>`
              }
            </div>
          `.trim();
        })
        .join("");

      body.innerHTML = `${headerHtml}${itemsHtml}`;
    }

    foot.innerHTML = "";
  }

  function renderThresholdBenchmark() {
    const el = document.getElementById("rose-threshold-benchmark");
    if (!el) return;

    const stats = diagnosticsState.baseSkinStats;
    const hasStats = stats && typeof stats.confirmed_count === "number" && stats.confirmed_count > 0;

    if (!hasStats) {
      el.innerHTML = "";
      return;
    }

    const recMs = stats.recommended_threshold_ms;
    const recS = typeof recMs === "number" ? (recMs / 1000).toFixed(2) : null;
    const curThresholdVal = typeof currentSettings?.threshold === "number" ? currentSettings.threshold : null;
    const needsIncrease = recS !== null && curThresholdVal !== null && curThresholdVal < parseFloat(recS) - 0.001;
    const games = stats.confirmed_count;
    const label = t(games > 1 ? "{n} games" : "{n} game", { n: games });

    let html;
    if (needsIncrease) {
      html = `<span style="color:#c8aa6e;">${t("Based on {label}, we recommend", { label })} <span style="color:#c89b3c; font-weight:700;">${recS}s</span></span>`;
      html += ` <button id="rose-apply-recommended-btn" style="
        margin-left:4px; padding:1px 8px; border:1px solid #463714; background:#1e2328;
        color:#cdbe91; cursor:pointer; font-family:'Beaufort for LOL',serif; font-size:11px;
        vertical-align:middle;
      ">${t("Apply")}</button>`;
    } else {
      html = `<span style="color:#5b9a32;">${t("Your threshold looks good (based on {label})", { label })}</span>`;
    }

    el.innerHTML = html;

    const applyBtn = document.getElementById("rose-apply-recommended-btn");
    if (applyBtn) {
      applyBtn.addEventListener("click", () => {
        if (bridge) {
          bridge.send({ type: "diagnostics-apply-recommended" });
          applyBtn.textContent = t("Applied!");
          applyBtn.disabled = true;
          applyBtn.style.opacity = "0.6";
          setTimeout(() => {
            if (bridge) bridge.send({ type: "settings-request" });
            requestDiagnostics();
          }, 500);
        }
      });
    }
  }

  function openPenguLoaderUI() {
    if (bridge) bridge.send({
      type: "open-pengu-loader-ui",
    });
    log("info", "Open Pengu Loader UI requested");
  }

  function closeSettingsPanel() {
    if (!settingsPanel) return;

    // Disable selected nav item
    const navItem = document.querySelector(".menu_item_Golden");
    if (navItem) {
      navItem.removeAttribute("active")
    }

    // Restore last active item
    const lastActiveNavItem = document.querySelector(".main-nav-bar > * > lol-uikit-navigation-item[roseLastActive]");
    if (lastActiveNavItem) {
      lastActiveNavItem.removeAttribute("roseLastActive")
      lastActiveNavItem.setAttribute("active", true);
    }

    // Cancel any pending reposition timer to avoid a "one-frame" flicker after closing.
    try {
      if (_flyoutRepositionTimer) {
        clearTimeout(_flyoutRepositionTimer);
        _flyoutRepositionTimer = null;
      }
    } catch (e) {}

    // If troubleshooting dialog is open, close it too (it is a separate fixed overlay).
    try {
      const diag = document.getElementById("rose-diagnostics-dialog");
      if (diag) diag.remove();
      diagnosticsDialog = null;
    } catch (e) {}

    const cleanup = () => {
      try {
        if (settingsPanel) settingsPanel.remove();
      } catch (e) {}
      settingsPanel = null;
    };

    // Prefer the built-in flyout animation when available.
    let flyout = null;
    try {
      flyout = document.getElementById(FLYOUT_ID);
    } catch (e) {
      flyout = null;
    }

    if (flyout) {
      // Disable interactions immediately while closing.
      try {
        flyout.style.pointerEvents = "none";
      } catch (e) {}

      // Smooth close (avoid scale/pop + avoid one-frame re-appearance).
      try {
        const baseTransform = flyout.style.transform || "translateX(-50%)";
        flyout.style.willChange = "opacity, transform";
        flyout.style.transition =
          "opacity 180ms cubic-bezier(0.22, 1, 0.36, 1), transform 180ms cubic-bezier(0.22, 1, 0.36, 1)";

        // Apply end-state on next frame so the transition reliably runs.
        requestAnimationFrame(() => {
          try {
            flyout.style.opacity = "0";
            flyout.style.transform = `${baseTransform} translateY(-6px)`;
          } catch (e) {}
        });

        // Cleanup after the transition.
        setTimeout(cleanup, 220);
        return;
      } catch (e) {
        // If something goes wrong, fall back to immediate cleanup.
        cleanup();
        return;
      }
    }

    cleanup();
  }

  // Listen for open settings event from ROSE-UI
  window.addEventListener("rose-open-settings", (e) => {
    const navItem =
      e.detail?.navItem ||
      document.querySelector(
        "lol-uikit-navigation-item.menu_item_Golden.Rose"
      );
    if (navItem) {
      // Toggle: if panel is already open, close it
      if (settingsPanel && document.getElementById(PANEL_ID)) {
        closeSettingsPanel();
      } else {
        createSettingsFlyout(navItem);
      }
    } else {
      log(
        "warn",
        "Could not find Golden Rose nav item to position settings panel"
      );
    }
  });

  // Inject CSS
  function injectCSS() {
    // Remove existing CSS if it exists (to update with correct port)
    const existingStyle = document.getElementById("rose-settings-panel-css");
    if (existingStyle) {
      existingStyle.remove();
    }

    const style = document.createElement("style");
    style.id = "rose-settings-panel-css";
    style.textContent = getCSSRules();
    document.head.appendChild(style);
  }

  let _initializing = false;
  let _initialized = false;
  let _retryCount = 0;
  const MAX_RETRIES = 100; // Maximum number of retry attempts

  async function init() {
    // Prevent multiple concurrent initializations (but allow recursive retry)
    if (_initialized) {
      return;
    }
    // If already initializing, only proceed if this is a recursive retry call
    // (indicated by document being ready now when it wasn't before)
    if (_initializing) {
      // Allow recursive call to proceed only if document is now ready
      if (!document || !document.head) {
        // Check retry limit to prevent unbounded retries
        if (_retryCount >= MAX_RETRIES) {
          log("error", `Init failed: Maximum retry count (${MAX_RETRIES}) reached. Document still not ready.`);
          _initializing = false;
          _retryCount = 0; // Reset for next attempt
          return;
        }
        _retryCount++;
        // Still not ready, schedule another retry
        requestAnimationFrame(() => {
          init().catch(err => {
            log("error", "Init failed:", err);
            _initializing = false;
          });
        });
        return;
      }
      // Document is now ready, proceed with initialization
    } else {
      // First call - set flag BEFORE document check to prevent race condition
      _initializing = true;
      // Don't reset retry counter here - it should persist across retries
      // Only reset on successful initialization

      if (!document || !document.head) {
        // Check retry limit BEFORE incrementing to prevent unbounded retries
        if (_retryCount >= MAX_RETRIES) {
          log("error", `Init failed: Maximum retry count (${MAX_RETRIES}) reached. Document still not ready.`);
          _initializing = false;
          _retryCount = 0; // Reset for next attempt
          return;
        }
        _retryCount++;
        // Use synchronous wrapper to prevent multiple concurrent schedules
        requestAnimationFrame(() => {
          init().catch(err => {
            log("error", "Init failed:", err);
            _initializing = false;
          });
        });
        return;
      }
    }
    try {
      // Wait for the shared bridge to become available
      bridge = await waitForBridge();

      // Inject CSS after bridge is loaded (so it has the correct port number)
      injectCSS();

      // Subscribe to all message types
      bridge.subscribe("settings-data", handleSettingsData);
      bridge.subscribe("settings-saved", handleSettingsSaved);
      bridge.subscribe("diagnostics-data", handleDiagnosticsData);
      bridge.subscribe("diagnostics-cleared-category", () => requestDiagnostics());
      bridge.subscribe("diagnostics-tracker-cleared", () => requestDiagnostics());
      bridge.subscribe("diagnostics-applied-recommended", () => requestDiagnostics());
      bridge.subscribe("path-validation-result", handlePathValidationResult);
      bridge.subscribe("champions-list-response", handleChampionsListResponse);
      bridge.subscribe("champion-skins-response", handleChampionSkinsResponse);
      bridge.subscribe("folder-opened-response", handleFolderOpenedResponse);
      bridge.subscribe("profiles-data", handleProfilesData);
      bridge.subscribe("favorites-data", handleFavoritesData);
      bridge.subscribe("history-data", handleHistoryData);
      bridge.subscribe("profile-export-result", handleProfileExportResult);
      bridge.subscribe("update-check-result", handleUpdateCheckResult);
      bridge.subscribe("update-status", handleUpdateStatus);

      // On every (re)connect, sync state
      bridge.onReady(() => {
        requestSettings();
        requestDiagnostics();
        startBadgeObserver();

        // Poll diagnostics so warnings appear without opening the panel.
        if (!_diagnosticsPollId) {
          _diagnosticsPollId = setInterval(() => {
            try {
              if (!bridge || !bridge.ready) return;
              if (typeof document !== "undefined" && document.hidden) return;
              requestDiagnostics();
            } catch (e) {}
          }, 15000);
        }
      });

      log("info", "Settings panel plugin initialized");
      _initialized = true;
      _retryCount = 0; // Reset retry counter on success
    } catch (err) {
      log("error", "Init failed:", err);
      throw err; // Re-throw to propagate error to .catch() handlers
    } finally {
      _initializing = false;
    }
  }

  if (typeof document === "undefined") {
    log("warn", "document unavailable; aborting");
    return;
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      () => {
        init().catch((err) => {
          log("error", "Init failed:", err);
        });
      },
      { once: true }
    );
  } else {
    init().catch((err) => {
      log("error", "Init failed:", err);
    });
  }
})();
