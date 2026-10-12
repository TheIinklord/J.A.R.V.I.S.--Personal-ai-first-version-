@echo off
setlocal
cd /d "%~dp0"
title JARVIS - Ollama Setup

echo ==============================================
echo       J.A.R.V.I.S. - AUTOMATIC AI SETUP
echo ==============================================
echo.

where ollama >nul 2>nul
if errorlevel 1 (
  echo ERROR: Ollama was not found in PATH.
  echo Please install Ollama from https://ollama.com/download/windows
  echo Then close and reopen this window and try again.
  echo.
  pause
  exit /b 1
)

echo [1/4] Checking Ollama service...
curl -fsS http://localhost:11434/api/tags >nul 2>nul
if errorlevel 1 (
  echo Ollama is not responding yet. Trying to start the Ollama app...
  start "" "%LOCALAPPDATA%\Programs\Ollama\ollama app.exe" >nul 2>nul
  timeout /t 5 /nobreak >nul
  curl -fsS http://localhost:11434/api/tags >nul 2>nul
  if errorlevel 1 (
    echo Ollama did not respond. Open the Ollama app from the Start menu, then run this file again.
    pause
    exit /b 1
  )
)

echo [2/4] Downloading/checking llama3.2 model. This may take a while...
ollama pull llama3.2
if errorlevel 1 (
  echo Model download failed. Check your internet connection and try again.
  pause
  exit /b 1
)

echo.
echo [3/4] Testing the model...
ollama run llama3.2 "Reply with: JARVIS AI is ready."
if errorlevel 1 (
  echo The model test failed. Review the error above.
  pause
  exit /b 1
)

echo.
echo [4/4] Starting J.A.R.V.I.S....
if not exist ".venv\Scripts\python.exe" (
  echo No Python virtual environment found. Running setup first...
  call setup_jarvis.bat
  if errorlevel 1 (
    echo Setup did not complete. Review the error above.
    pause
    exit /b 1
  )
)
call run_desktop.bat
if errorlevel 1 (
  echo J.A.R.V.I.S. could not start. Review the error above.
  pause
  exit /b 1
)
endlocal
