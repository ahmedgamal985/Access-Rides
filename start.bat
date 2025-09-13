@echo off
REM Access Rides - Startup Script for Windows
echo 🚗♿ Starting Access Rides Application...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
call npm install

REM Install backend dependencies
echo 📦 Installing backend dependencies...
cd backend
call npm install
cd ..

REM Create uploads directory for backend
echo 📁 Creating uploads directory...
if not exist backend\uploads mkdir backend\uploads

REM Copy environment file if it doesn't exist
if not exist backend\.env (
    echo 📋 Creating environment file...
    copy backend\env.example backend\.env
    echo ⚠️  Please edit backend\.env with your API keys before running the app.
)

REM Check if Expo CLI is installed
expo --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 📱 Installing Expo CLI...
    call npm install -g @expo/cli
)

echo ✅ Setup complete!
echo.
echo 🚀 To start the application:
echo 1. Start the backend server:
echo    cd backend ^&^& npm start
echo.
echo 2. In a new terminal, start the frontend:
echo    npm start
echo.
echo 3. Press 'i' for iOS simulator or 'a' for Android emulator
echo    Or scan the QR code with Expo Go app on your device
echo.
echo 📚 For more information, see README.md
pause

