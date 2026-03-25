@echo off
echo Starting GDM Prediction System...

:: Check if Python is available
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Python is not installed or not in PATH.
    pause
    exit /b
)

:: Start Backend
echo Starting Backend Server...
start "GDM Backend" cmd /k "cd server && pip install -r requirements.txt && python app.py"

:: Wait a bit for backend to initialize
timeout /t 5 /nobreak >nul

:: Start Frontend
echo Starting Frontend Client...
start "GDM Client" cmd /k "cd client && npm install && npm run dev"

echo System started. Please check the opened windows.
