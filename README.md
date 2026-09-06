# Kaleido by Krealos

[![Repo](https://img.shields.io/badge/GitHub-Niyr--coder%2FKaleido-6D28D9)](https://github.com/Niyr-coder/Kaleido) [![Discord](https://img.shields.io/badge/Discord-Krealos-5865F2?logo=discord&logoColor=white)](https://discord.gg/bsb8yEAMpE)

<div align="center">
  <img src="./assets/icon.png" alt="Kaleido Icon" width="128" height="128">
</div>

Kaleido es la edición Krealos de [Rose](https://github.com/Alban1911/Rose), un cambiador de skins
de código abierto para League of Legends (licencia MIT, © Alban and Florent). Solo se cambió la marca visible:
nombre, icono, textos de diálogos e instalador. La lógica interna es la de Rose y toda la documentación
original sigue aplicando.

## Novedades de Kaleido

- **Panel de ajustes en español.** El panel dentro del cliente de LoL está traducido (selector Español / English arriba del panel; la elección se guarda en el propio cliente).
- **Perfiles de skins.** Cada skin con la que juegas se guarda en el perfil activo (es lo que usa el modo histórico). Crea perfiles como `Ranked`, `ARAM` o `Tryhard` desde el panel, cámbialos con un clic y verás la lista de campeones y skins guardadas de cada uno. Los perfiles viven en `%LOCALAPPDATA%\Rose\profiles.json`; el cambio aplica a partir de la siguiente selección de campeón.
- **Perfil automático por rol y por modo de juego.** En "Reglas automáticas" eliges un perfil para Grieta, ARAM, URF, Arena, Swiftplay u otros, y otro por rol asignado (superior, jungla, central, inferior, soporte). Al empezar la selección de campeón Kaleido cambia solo al perfil que toca. Las reglas por rol tienen prioridad.
- **Favoritas.** Ctrl+F sobre una skin en la selección de campeón la marca como favorita. Desde el panel se aplican con un clic y se quitan con la ×.
- **Skin aleatoria configurable.** El dado puede elegir entre todas las skins, solo las favoritas del campeón o solo las guardadas en cualquier perfil.
- **Skins recientes con atajos.** Ctrl+← y Ctrl+→ en la selección de campeón recorren las últimas skins usadas con ese campeón.
- **Historial de partidas.** Cada skin inyectada queda registrada con modo de juego, perfil y resultado (victoria, derrota o remake) cuando el cliente lo informa. Se ve en el panel y se puede limpiar.
- **Exportar e importar perfiles.** Un código `KPROF1:...` que se copia al portapapeles y que un amigo pega en su panel.
- **Grupo de amigos permanente.** Crea un grupo en el panel Party, comparte su código una vez y Kaleido se une solo al abrirse. Ves quién está en línea, con un botón para invitarle al lobby. Ya no hacen falta tokens por sesión.
- **Temática compartida.** Botón "Igualar tema" junto a cada amigo (o Ctrl+T en la selección): si él juega Guardiana Estelar y tu campeón tiene una, se te aplica. Cuando un amigo elige una skin temática que tu campeón también tiene, aparece un aviso.
- **Color de party.** Un color para todos: cada uno pulsa "Aplicar color" y Kaleido elige el chroma de su skin más parecido a ese color.
- **Retos de skin.** "Retar" abre las skins del campeón de tu amigo; él recibe un aviso y la acepta con un clic.
- **Ruleta de grupo.** Todos giran una skin aleatoria a la vez, o todos intentan la misma línea de skins con la ruleta temática.
- **Ver la skin de cada amigo en el modo Party.** Cada amigo conectado muestra su campeón, la miniatura de la skin, el nombre y el chroma (o el mod personalizado). Además, en partida el modo Party inyecta las skins de tus amigos para que las veas en el juego.
- **Copiar la skin de un amigo en el modo Party.** Si un amigo de la party ya eligió skin para el mismo campeón, un botón la aplica en tu selección.
- **Estado en la bandeja.** El menú del icono muestra el perfil activo, la última skin inyectada con su resultado y cuántas skins hay descargadas.
- **Aviso de skins nuevas.** Si la sincronización al iniciar descargó skins nuevas, la bandeja lo notifica.
- **Buscar actualizaciones desde el panel.** Un botón consulta GitHub al momento; si hay versión nueva aparece "Actualizar ahora", que reinicia Kaleido y la instala sin volver a preguntar.
- **Telemetría y actualizaciones desde el panel.** Dos casillas en "Privacidad y actualizaciones": enviar estadísticas anónimas (apagado por defecto) y buscar actualizaciones al iniciar (encendido por defecto). Se guardan en `config.ini` como `analytics_enabled` y `auto_update`.

> El servidor de telemetría sigue siendo el de Rose (`ANALYTICS_SERVER_URL` en `config.py`) y el updater apunta a las releases de `Niyr-coder/Kaleido`. Cambia el primero cuando Krealos tenga su propio servidor.

## Servidor del modo Party (relay)

El modo Party intercambia las skins entre amigos a través de un Worker de Cloudflare (carpeta `relay-worker/`).
El Worker reenvía la lista de miembros, eventos sociales (retos, ruleta) y el estado compartido de la sala (color). Kaleido trae de serie `wss://kaleido-party-relay.krealos.workers.dev`, desplegado en la cuenta de Krealos, y todos
los miembros de la party deben usar el mismo servidor. Se puede cambiar desde el panel de ajustes ("Servidor del
modo Party") o en `config.ini` con `relay_url`. Para desplegar uno propio: `cd relay-worker && npx wrangler login &&
npx wrangler deploy`, y opcionalmente guardar la URL como secreto `KALEIDO_RELAY_URL` del repo para que el build la
incluya.

## Compilar e instalar

El repositorio incluye un workflow de GitHub Actions ([build.yml](.github/workflows/build.yml)) que compila Pengu Loader,
empaqueta Kaleido con PyInstaller y genera el instalador con Inno Setup en cada push. Al crear un tag `vX.Y.Z` publica una
release con `Kaleido_Setup.exe` y un ZIP portable, que es lo que usa el auto-actualizador.

## Aviso legal

Kaleido no está afiliado a Riot Games ni respaldado por Riot Games. League of Legends y todas las propiedades
relacionadas son marcas registradas de Riot Games, Inc.

Kaleido solo modifica archivos de renderizado locales para mostrar modelos y texturas distintos en tu propia
pantalla. No altera datos de red, memoria del juego ni mecánicas, y **no ofrece ninguna ventaja competitiva**.
Aun así, el uso de herramientas de terceros con el cliente de League puede infringir los términos de servicio de
Riot y conllevar sanciones en la cuenta. **Cada usuario lo utiliza bajo su propia responsabilidad.** Krealos no se
hace responsable de suspensiones, pérdidas de cuenta ni de ningún otro daño derivado de su uso.

Kaleido no distribuye la DLL de inyección ni ningún archivo protegido por derechos de autor de terceros. No la
solicites ni la compartas en el Discord de Krealos.

Kaleido es un fork de [Rose](https://github.com/Alban1911/Rose) (© Alban and Florent, licencia MIT) y utiliza
[Pengu Loader](https://github.com/PenguLoader/PenguLoader) (licencia MIT). Los avisos de copyright originales se
conservan en [LICENSE](LICENSE).

---

## Documentación original de Rose

## Overview

Rose is an open-source automatic skin changer for League of Legends that enables seamless access to all skins in the game. The application runs silently in the system tray and automatically detects skin selections during champion select, injecting the chosen skin when the game loads.

Built on the [Pengu Loader](https://github.com/PenguLoader/PenguLoader) framework, Rose integrates JavaScript extensions into the League Client to enable modular UI interactions. It strictly modifies local rendering variables to display custom models and textures. It is designed purely as an exploration of client-side asset management, providing no manipulation of network data, memory states, or gameplay mechanics, thereby **offering zero competitive advantage**.

## Architecture

Rose consists of three main components:

### Python Backend

- **LCU API Integration**: Communicates with the League Client via the League Client Update (LCU) API
- **Skin Injection**: Handles skin injection compatible with Riot Vanguard
- **WebSocket Bridge**: Operates a WebSocket server for real-time communication with frontend plugins
- **Skin Management**: Downloads and manages skin files from the [LeagueSkins repository](https://github.com/Alban1911/LeagueSkins)
- **Party Mode**: Enables skin sharing between friends in the same lobby via a Cloudflare WebSocket relay
- **Game Monitoring**: Tracks game state, champion select phases, and loadout countdowns
- **Auto-Updater**: Checks GitHub for new releases and prompts users to install updates
- **Analytics**: Sends a startup ping, a 15-minute presence heartbeat, and a best-effort close ping (configurable, runs in a background thread)

### Analytics and privacy

Rose sends a pseudonymous, randomly generated installation ID and the app version
to `https://analytics.rosekeys.site/` when analytics are enabled. The ID is not derived
from the Windows Machine GUID. Analytics can be disabled with
`ANALYTICS_ENABLED = False` in `config.py`.

The analytics API and dashboard are maintained separately from this public
client repository. Only aggregate usage metrics are exposed through the
dashboard; raw activity and server credentials remain private.

### Cloudflare Workers

- **rose-party-relay**: Durable Object-backed WebSocket relay that manages party rooms (max 10 members per room) for real-time skin selection broadcasting between friends
### Pengu Loader Plugins

Rose includes a suite of JavaScript plugins that extend the League Client UI:

- **ROSE-UI**: Unlocks locked skin previews in champion select, enabling hover interactions on all skins
- **ROSE-SkinMonitor**: Monitors currently selected skin's name and sends it to the Python backend via WebSocket
- **ROSE-CustomWheel**: Displays custom mod metadata for hovered skins and exposes quick access to the mods folder
- **ROSE-ChromaWheel**: Enhanced chroma selection interface for choosing any chroma variant
- **ROSE-FormsWheel**: Custom form selection interface for skins with multiple forms (Elementalist Lux, Sahn Uzal Mordekaiser, Spirit Blossom Morgana, Radiant Sett)
- **ROSE-SettingsPanel**: Settings panel accessible from the League of Legends Client
- **ROSE-RandomSkin**: Random skin selection feature
- **ROSE-HistoricMode**: Access to the last used skin for every champion
- **ROSE-PartyMode**: Party mode UI — displays a panel in lobby and champion select to enable skin sharing, view connected peers, and see friends' skin selections in real time
- **ROSE-Jade**: Client customization — regalia borders, backgrounds, banners, icons, titles, and win/loss stats

## How It Works

1. **League Client Integration**: Rose activates **[Pengu Loader](https://github.com/PenguLoader/PenguLoader)** on startup, which injects the JavaScript plugins into the League Client
2. **Skin Detection**: When you hover over a skin in champion select, `ROSE-SkinMonitor` detects the selection and sends it to the Python backend
3. **Game Opening Delay**: To make sure the injection has time to occur we suspend League of Legend's game process as long as the overlay is not ran
4. **Game Injection**: Rose injects the selected skin when the game starts
5. **Seamless Experience**: The skin loads as if you owned it, with full chroma support and no gameplay impact (Rose will **never** provide any competitive advantage to its users)

## Features

- **Smart Injection**: Never injects skins you already own
- **Multi-Language Support**: Works with any client language
- **Open Source**: Fully open source and extensible
- **Free**: If you bought this software, you got scammed 💀

## Requirements

- **Windows 10/11**
- **League of Legends** installed
- **Injection DLL** - You must provide your own signed DLL (see below)

### DLL Requirement

Due to DMCA restrictions, Rose cannot distribute the injection DLL file. You must obtain this file yourself from an authorized source and sign it with your own code signing certificate.

On first launch, Rose will prompt you to provide this file and open the folder where it should be placed.

## Installation

1. Download the latest installer from [Releases](https://github.com/Alban1911/Rose/releases/latest)
2. Run the installer as Administrator
3. Launch Rose from the Start Menu or desktop shortcut

## Building from source

Rose builds the Pengu Loader executable from the vendored source in
`vendor/PenguLoader-1.1.6/` as part of the normal Rose build. You do not need
to download or commit a prebuilt `Pengu Loader.exe`.

### Prerequisites

- Windows 10/11
- Python 3.11 or newer
- Visual Studio Build Tools with the .NET desktop build tools, WPF support,
  and the .NET Framework 4.7.2 targeting pack
- Inno Setup 6 if you also want to create the installer

Clone the repository and enter its directory:

```powershell
git clone https://github.com/Alban1911/Rose.git
cd Rose
```

Install the Python dependencies first:

```powershell
python -m pip install -r requirements.txt
```

Build the loader by itself, if needed:

```powershell
python scripts/build_pengu_loader.py
```

Build Rose and automatically rebuild the loader:

```powershell
python scripts/build_pyinstaller.py
```

The packaged application is written to `dist/Rose/`. To build both Rose and
the Windows installer in one step:

```powershell
python scripts/build_all.py
```

The installer is written to `installer/Rose_Setup.exe`. Use
`scripts/build_pyinstaller.py` or `scripts/build_all.py` instead of invoking
`pyinstaller Rose.spec` directly, because the Rose build scripts compile
Pengu Loader first.

## Credits

Rose uses the [official Pengu Loader](https://github.com/PenguLoader/PenguLoader)
project. Its source is vendored and built as part of Rose, with Rose-specific
lifecycle integration added around the loader. Please see the
[official Pengu Loader license](https://github.com/PenguLoader/PenguLoader/blob/main/LICENSE)
and credit the Pengu Loader contributors.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and project structure.

## Legal Disclaimer

This project is not endorsed by or affiliated with Riot Games. Riot Games and all related properties are trademarks or registered trademarks of Riot Games, Inc.

Custom skins are allowed under Riot's terms of service and are not detected. Do not discuss or advertise skin tools in game. Users proceed at their own risk.

---

**Rose** - _League, unlocked._
