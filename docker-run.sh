#!/bin/bash

# Script para executar o PWA Eleições 2026 com Docker

echo "🚀 Iniciando PWA Eleições 2026 com Docker..."

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não está instalado. Por favor, instale o Docker primeiro."
    exit 1
fi

# Verificar se Docker Compose está disponível
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose não está instalado. Por favor, instale o Docker Compose primeiro."
    exit 1
fi

echo "📦 Construindo a imagem Docker..."
docker-compose build

echo "🏃 Executando o container..."
docker-compose up

echo "✅ PWA Eleições 2026 está rodando em http://localhost:3000"


