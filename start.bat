@echo off
echo Starting AI Document Analyst...
echo ==========================================

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python not found. Please install Python 3.8+ first.
    pause
    exit /b 1
)

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js not found. Please install Node.js 14+ first.
    pause
    exit /b 1
)

REM Install Python dependencies
if exist requirements.txt (
    echo Installing Python dependencies...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo Error installing Python dependencies
        pause
        exit /b 1
    )
)

REM Install Node dependencies
if exist frontend (
    echo Installing React dependencies...
    cd frontend
    npm install
    if errorlevel 1 (
        echo Error installing React dependencies
        cd ..
        pause
        exit /b 1
    )
    cd ..
)

echo Starting Flask backend on http://localhost:5000...
start "Flask Backend" cmd /k "python app.py"

timeout /t 2 /nobreak >nul

echo Starting React frontend on http://localhost:3000...
cd frontend
start "React Frontend" cmd /k "npm start"
cd ..

echo.
echo ==========================================
echo AI Document Analyst is starting up!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Close the command windows to stop the servers
pause