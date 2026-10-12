@echo off
setlocal
cd /d "%~dp0"
title Build J.A.R.V.I.S. Desktop App
if not exist ".venv\Scripts\python.exe" (
  echo Run setup_jarvis.bat first.
  pause
  exit /b 1
)
echo Installing desktop app builder dependencies...
".venv\Scripts\python.exe" -m pip install -r requirements-desktop.txt
if errorlevel 1 (echo Install failed. Check the internet connection and Python version.& pause & exit /b 1)
echo Checking source files...
".venv\Scripts\python.exe" -m py_compile app.py desktop_app.py
if errorlevel 1 (echo Python source check failed.& pause & exit /b 1)
echo Building J.A.R.V.I.S. Windows desktop app. This may take several minutes...
".venv\Scripts\python.exe" -m PyInstaller --noconfirm --clean --windowed --name JarvisAssistant --add-data "static;static" --collect-all webview --collect-all uvicorn --collect-all fastapi --collect-all starlette --collect-all pydantic --hidden-import uvicorn.logging --hidden-import uvicorn.loops.auto --hidden-import uvicorn.protocols.http.auto --hidden-import uvicorn.lifespan.on desktop_app.py
if errorlevel 1 (echo Build failed. Read the error above.& pause & exit /b 1)
echo.
echo BUILD COMPLETE: dist\JarvisAssistant\JarvisAssistant.exe
echo Copy the entire dist\JarvisAssistant folder when moving the app to another PC.
echo Optional .env file goes beside JarvisAssistant.exe.
pause
