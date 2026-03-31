@echo off
echo Starting EventPro...
echo.

start cmd /k "cd backend && .venv\Scripts\daphne.exe -b 0.0.0.0 -p 8000 backend.asgi:application"
timeout /t 3 /nobreak >nul
start cmd /k "cd frontend && npm start"

echo.
echo Both servers started!
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
echo.
pause
