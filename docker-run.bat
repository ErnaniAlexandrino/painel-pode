@echo off
REM Script para executar o PWA Eleições 2026 com Docker no Windows

echo 🚀 Iniciando PWA Eleições 2026 com Docker...

REM Verificar se Docker está instalado
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker não está instalado. Por favor, instale o Docker primeiro.
    pause
    exit /b 1
)

REM Verificar se Docker Compose está disponível
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose não está instalado. Por favor, instale o Docker Compose primeiro.
    pause
    exit /b 1
)

echo 📦 Construindo a imagem Docker...
docker-compose build

echo 🏃 Executando o container...
docker-compose up

echo ✅ PWA Eleições 2026 está rodando em http://localhost:3000
pause


