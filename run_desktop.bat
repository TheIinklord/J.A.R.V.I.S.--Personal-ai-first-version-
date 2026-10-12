@echo off
setlocal
cd /d "%~dp0"
title J.A.R.V.I.S. Desktop
if not exist ".venv\Scripts\python.exe" (
  echo J.A.R.V.I.S. is not set up yet.
  echo Run setup_jarvis.bat first.
  pause
  exit /b 1
)
".venv\Scripts\python.exe" -c "import webview, uvicorn, fastapi" >nul 2>nul
if errorlevel 1 (
  echo Desktop components are missing. Installing them now...
  ".venv\Scripts\python.exe" -m pip install -r requirements-desktop.txt
  if errorlevel 1 (
    echo ERROR: Could not install desktop components. Check your internet connection.
    pause
    exit /b 1
  )
)
".venv\Scripts\python.exe" desktop_app.py
