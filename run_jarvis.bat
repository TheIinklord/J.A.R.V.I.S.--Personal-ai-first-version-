@echo off
setlocal
cd /d "%~dp0"
title J.A.R.V.I.S. Personal Assistant

if not exist ".venv\Scripts\python.exe" (
  echo ERROR: Python environment not found.
  echo Double-click setup_jarvis.bat first.
  pause
  exit /b 1
)

".venv\Scripts\python.exe" -c "import fastapi, uvicorn, requests, dotenv, openai" >nul 2>nul
if errorlevel 1 (
  echo ERROR: Dependencies are missing or broken.
  echo Run setup_jarvis.bat again.
  pause
  exit /b 1
)

echo Starting J.A.R.V.I.S. at http://127.0.0.1:8765
echo Keep this window open while using J.A.R.V.I.S.
echo Press Ctrl+C to stop the server.
echo.
start "" "http://127.0.0.1:8765"
".venv\Scripts\python.exe" -m uvicorn app:app --app-dir "%~dp0" --host 127.0.0.1 --port 8765
if errorlevel 1 (
  echo.
  echo J.A.R.V.I.S. stopped with an error. Read the message above.
  pause
)
