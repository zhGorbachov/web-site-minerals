@echo off

cd /d "%~dp0"

start "" server.exe run

timeout /t 2 > nul

start "" http://localhost:3000