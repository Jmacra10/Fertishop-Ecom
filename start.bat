@echo off
echo Starting FertiShop Application...
echo.

echo Starting Python backend...
start cmd /k "cd backend && python run.py"

echo Starting Next.js frontend...
start cmd /k "npm run dev"

echo.
echo FertiShop is running!
echo - Backend: http://localhost:5000
echo - Frontend: http://localhost:3000
echo. 