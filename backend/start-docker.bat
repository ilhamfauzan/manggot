@echo off
echo 🚀 Starting Maggot Full Stack with Docker...
echo.

REM Check if .env exists
if not exist .env (
    echo ⚠️  .env file not found. Creating from .env.example...
    copy .env.example .env
    echo ✅ .env created. Please edit it with your credentials!
    echo.
)

REM Stop existing containers
echo 🛑 Stopping existing containers...
docker-compose down

REM Build and start services
echo 🔨 Building and starting services...
docker-compose up --build -d

REM Wait for services
echo.
echo ⏳ Waiting for services to be ready...
timeout /t 15 /nobreak >nul

echo.
echo 🔍 Checking service health...
echo.

REM Check services
curl -s http://localhost:5001 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend is ready ^(Port 5001^)
) else (
    echo ❌ Backend is not ready
)

curl -s http://localhost:5000/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Flask ML API is ready ^(Port 5000^)
) else (
    echo ⏳ Flask ML API is starting... ^(may take 30s^)
)

echo.
echo 📊 Running database migrations...
docker-compose exec -T backend npx prisma migrate dev --name init

echo.
echo ✨ Setup complete!
echo.
echo 📍 Services running at:
echo    - Backend:       http://localhost:5001
echo    - Flask ML:      http://localhost:5000
echo    - Swagger Docs:  http://localhost:5001/api-docs
echo    - Prisma Studio: http://localhost:5555
echo.
echo 📝 View logs with: docker-compose logs -f
echo 🛑 Stop with: docker-compose down
echo.
pause
