# J.A.R.V.I.S. Desktop Installation

## Use as a desktop app

1. Extract this folder from the ZIP.
2. Install Python 3.11 or 3.12, with **Add Python to PATH** enabled.
3. Run `setup_jarvis.bat` once and wait for completion.
4. Run `JARVIS_START.bat` to open the native desktop window.
5. If the native window cannot start, run `run_jarvis.bat` for the browser-based interface.

## Build a distributable Windows app

Run `build_desktop.bat`. The build output is `dist\JarvisAssistant\JarvisAssistant.exe`. Keep the entire output folder together. The `.exe` is built on the Windows computer and is not prebuilt in this ZIP.

## AI features

The app interface does not require an AI key to open. Local chat requires Ollama and a downloaded model. Online chat and screenshot analysis require an OpenAI API key in `.env`; API usage may cost money. Never share the key.

## Mobile

The included responsive web interface can be viewed in a mobile browser if a separately secured remote backend is configured. This package does not publish a mobile APK or expose the local server to Wi-Fi.
