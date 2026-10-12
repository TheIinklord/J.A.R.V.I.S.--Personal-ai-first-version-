# J.A.R.V.I.S. Desktop Assistant (Windows)

This project provides a local desktop window for the J.A.R.V.I.S. assistant. The interface and local server run on your own PC. The AI engine is a separate optional component: local chat uses Ollama; online chat and screenshot analysis use an OpenAI API key and may incur API charges.

## Easiest setup

1. Extract the entire folder to a normal writable location, such as `C:\JARVIS` (do not run it from inside the ZIP).
2. Install Python 3.11 or 3.12 from https://www.python.org/downloads/ and enable **Add Python to PATH**.
3. Double-click `setup_jarvis.bat` and wait for it to finish. Internet is needed to install Python packages.
4. Double-click `JARVIS_START.bat`. It opens J.A.R.V.I.S. in its own desktop window. The first run may install the desktop-window dependency if it is missing.
5. To stop, close the app window. If a terminal remains open, close it after the app exits.

## Make a standalone Windows app folder

After setup, double-click `build_desktop.bat`. When the build completes, launch `dist\JarvisAssistant\JarvisAssistant.exe`. Copy the entire `dist\JarvisAssistant` folder if moving the app to another Windows PC. The build must be performed on Windows; a built `.exe` is not included in this source ZIP.

## AI setup

### Local AI (no API charges)

1. Install Ollama from https://ollama.com/download/windows.
2. Open Command Prompt and run `ollama run llama3.2` once to download the model.
3. Keep Ollama running when you use local mode.

The desktop interface can open without Ollama, but local AI chat will report a clear connection error until Ollama and a model are installed.

### Online AI (API usage is billed separately)

Create a file named `.env` beside `app.py` (for source mode) or beside `JarvisAssistant.exe` (for packaged mode) with:

```env
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-4.1-mini
OPENAI_VISION_MODEL=gpt-4.1-mini
```

Use a model available to your API account. Do not share your `.env` file or API key. A ChatGPT subscription does not include OpenAI API usage.

## Troubleshooting

- If setup fails, read the final error in the terminal. Check internet access and that Python 3.11/3.12 is installed.
- If the virtual environment was created with another Python version, close the app, rename `.venv` to `.venv-old`, then run setup again.
- If the desktop window fails to open, try `run_jarvis.bat` to use the browser interface and capture the terminal error.
- `jarvis_memory.db` stores saved memories in source mode. The packaged app stores its database in `%LOCALAPPDATA%\JarvisAssistant` so it survives app updates.
- The local server listens only on `127.0.0.1`; it is not exposed to your network.

## Features and safety limits

- Chat with local Ollama or optional online OpenAI API.
- Explicitly saved SQLite memories.
- Text search limited to a folder selected by the user.
- Launch allowlisted Windows apps (Notepad, Calculator, Paint).
- Screenshot analysis through the online vision API after user selection.
- Does not execute arbitrary shell commands.


### Dependency installation note

The core install intentionally uses plain `uvicorn` rather than `uvicorn[standard]`. This avoids an optional PyYAML dependency that can fail to build from source on some Windows/Python setups. The app does not require Uvicorn optional performance extras.
