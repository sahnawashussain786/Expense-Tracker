@echo off
echo ============================================
echo College Expense Tracker - Run Project
echo ============================================
echo.

echo [1/4] Installing server dependencies...
cd server
call npm install
if errorlevel 1 (
    echo ❌ Server install failed
    cd ..
    pause
    exit /b 1
)
echo ✅ Server install complete
echo.

echo [2/4] Installing client dependencies...
cd ..\client
call npm install --legacy-peer-deps
if errorlevel 1 (
    echo ❌ Client install failed
    cd ..
    pause
    exit /b 1
)
echo ✅ Client install complete
echo.

echo [3/4] Ensuring concurrently is installed...
cd ..
npm install concurrently --save-dev >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Warning: Could not install concurrently, but continuing...
)
echo.

echo [4/4] Starting backend (port 5000) and frontend (Vite dev server)...
echo.

echo 🚀 Backend: http://localhost:5000
echo 🚀 Frontend: http://localhost:5173 (or next available port)
echo.

call npm run dev
echo.
echo.
echo ✅ Project stopped
pause
