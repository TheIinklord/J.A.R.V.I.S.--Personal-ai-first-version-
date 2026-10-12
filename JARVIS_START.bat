@echo off
setlocal
cd /d "%~dp0"
title J.A.R.V.I.S. Personal Assistant
if not exist ".venv\Scripts\python.exe" (
  echo First-time setup is required. Starting setup...
  call setup_jarvis.bat
  if errorlevel 1 exit /b 1
)
call run_desktop.bat
