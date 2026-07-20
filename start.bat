@echo off
setlocal EnableExtensions
cd /d "%~dp0"

echo.
echo === Minerals store (frontend + backend) ===
echo.

REM --- Postgres ---
where docker >nul 2>&1
if errorlevel 1 (
  echo [WARN] Docker not found. Start Postgres yourself if the API needs it.
) else (
  echo [1/4] Starting Postgres...
  docker compose up -d
  if errorlevel 1 (
    echo [WARN] docker compose failed. Is Docker Desktop running?
  ) else (
    echo       Waiting for Postgres...
    timeout /t 3 >nul
  )
)

REM --- Build frontend for live API (same-origin via Caddy; NOT build:mock) ---
if /I "%~1"=="--no-build" (
  echo [2/4] Skipping build ^(--no-build^)
  if not exist "dist\index.html" (
    echo [ERROR] dist\ missing. Run without --no-build, or: npm run build
    pause
    exit /b 1
  )
) else (
  echo [2/4] Building frontend ^(npm run build — live API^)...
  call npm run build
  if errorlevel 1 (
    echo [ERROR] Frontend build failed.
    pause
    exit /b 1
  )
)

REM --- Node API ---
echo [3/4] Starting API on http://localhost:3001 ...
set "CLIENT_URL=http://localhost:3000,http://localhost:5174"
set "API_URL=http://localhost:3000"
start "minerals-api" /D "%~dp0server" cmd /k "npm run dev"

timeout /t 3 >nul

REM --- Caddy (static + reverse proxy) ---
echo [4/4] Starting Caddy on http://localhost:3000 ...
start "minerals-caddy" "%~dp0server.exe" run --config "%~dp0Caddyfile" --adapter caddyfile

timeout /t 2 >nul
start "" http://localhost:3000

echo.
echo Ready:
echo   Site  http://localhost:3000
echo   API   http://localhost:3001  ^(also via http://localhost:3000/api^)
echo.
echo Tips:
echo   start.bat --no-build   reuse existing dist\
echo   Close "minerals-api" / "minerals-caddy" windows to stop.
echo.
endlocal
