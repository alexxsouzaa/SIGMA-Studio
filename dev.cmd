@echo off
setlocal
title SIGMA Studio - Dev Launcher
set "ROOT=%~dp0"

echo ==============================================
echo   SIGMA Studio - Dev Launcher
echo   Backend : uvicorn app.main:app  :8000
echo   Web     : Vite (npm run dev)    :5173
echo ==============================================
echo.

rem --- backend venv -------------------------------------------------
if not exist "%ROOT%apps\backend\.venv\Scripts\python.exe" (
    echo [ERRO] venv do backend nao encontrado.
    echo        Execute:
    echo          cd apps\backend
    echo          python -m venv .venv
    echo          .venv\Scripts\python.exe -m pip install -e ".[dev]"
    echo.
    pause
    exit /b 1
)

if not exist "%ROOT%apps\backend\.env" (
    echo [AVISO] apps\backend\.env nao encontrado.
    echo          Copie de .env.example e defina SIGMA_JWT_SECRET e SIGMA_ADMIN_PASSWORD.
    echo.
)

rem --- node_modules --------------------------------------------------
if not exist "%ROOT%node_modules" (
    echo [ERRO] node_modules nao encontrado.
    echo        Execute: npm install
    echo.
    pause
    exit /b 1
)

echo [1/2] Subindo backend : http://localhost:8000/docs
start "SIGMA Studio - Backend (8000)" /D "%ROOT%apps\backend" cmd /k ""%ROOT%apps\backend\.venv\Scripts\python.exe" -m uvicorn app.main:app --reload --port 8000"

echo [2/2] Subindo web     : http://localhost:5173
start "SIGMA Studio - Web (5173)" /D "%ROOT%" cmd /k "npm run dev"

echo.
echo Aguardando inicializacao... abrindo o navegador.
timeout /t 4 /nobreak >nul
start "" "http://localhost:5173"
echo.
echo Feche as janelas do Backend e da Web para encerrar os servidores.
echo.
pause
endlocal
