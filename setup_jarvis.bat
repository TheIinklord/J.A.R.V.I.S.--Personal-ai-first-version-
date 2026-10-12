@echo off
setlocal
cd /d "%~dp0"
title J.A.R.V.I.S. Setup

echo ============================================
echo   J.A.R.V.I.S. - Windows Setup
echo ============================================
echo.

echo Checking installed Python...
set "PYTHON_CMD="
where py >nul 2>nul
if not errorlevel 1 (
  for %%V in (3.13 3.12 3.11) do (
    if not defined PYTHON_CMD (
      py -%%V --version >nul 2>nul
      if not errorlevel 1 set "PYTHON_CMD=py -%%V"
    )
  )
)
if not defined PYTHON_CMD (
  where python >nul 2>nul
  if not errorlevel 1 (
    for /f "tokens=2" %%V in ('python --version 2^>^&1') do set "PYVER=%%V"
    if defined PYVER set "PYTHON_CMD=python"
  )
)
if not defined PYTHON_CMD (
  echo ERROR: Python was not found in PATH.
  echo Since you said Python is already installed, reopen Command Prompt and check: python --version
  echo If that works, rerun this setup file.
  pause
  exit /b 1
)
%PYTHON_CMD% --version
echo.

if not exist ".venv\Scripts\python.exe" (
  echo Creating virtual environment...
  %PYTHON_CMD% -m venv .venv
  if errorlevel 1 (
    echo ERROR: Could not create .venv with the installed Python version.
    echo Try Python 3.12 if your installed version is newer than supported packages.
    pause
    exit /b 1
  )
) else (
  echo Existing .venv found; keeping it and updating dependencies.
)

echo.
echo Upgrading pip...
".venv\Scripts\python.exe" -m pip install --upgrade pip
if errorlevel 1 (
  echo ERROR: Could not upgrade pip. Check your internet connection.
  pause
  exit /b 1
)

echo.
echo Installing application dependencies...
".venv\Scripts\python.exe" -m pip install --only-binary=:all: -r requirements.txt
if errorlevel 1 (
  echo Binary-wheel installation failed. Retrying normal pip installation...
  ".venv\Scripts\python.exe" -m pip install -r requirements.txt
  if errorlevel 1 (
    echo ERROR: Dependency installation failed.
    echo Send a screenshot of the complete error to get a targeted fix.
    pause
    exit /b 1
  )
)

echo.
echo Installing desktop window support...
".venv\Scripts\python.exe" -m pip install --only-binary=:all: "pywebview>=5.0,<7.0"
if errorlevel 1 (
  echo WARNING: Desktop window support failed to install.
  echo The browser version may still work with run_jarvis.bat.
)

echo.
echo Checking required imports...
".venv\Scripts\python.exe" -c "import fastapi, uvicorn, requests, dotenv, openai; print('Required imports are available.')"
if errorlevel 1 (
  echo ERROR: Import check failed. Please send a screenshot of this window.
  pause
  exit /b 1
)
echo.
echo Setup complete. Double-click START_JARVIS_WITH_OLLAMA.bat.
pause
endlocal
