#!/bin/bash

echo "========================================"
echo "   ARDUINO KIT MANAGER - INICIALIZACAO"
echo "========================================"
echo ""

# Verifica se Python está instalado
if ! command -v python3 &> /dev/null
then
    echo "[ERRO] Python3 não encontrado!"
    echo "Por favor, instale o Python 3.8 ou superior"
    exit 1
fi

echo "[OK] Python encontrado!"
echo ""

# Verifica se as dependências estão instaladas
echo "Verificando dependências..."
if ! python3 -c "import flask" &> /dev/null
then
    echo ""
    echo "[AVISO] Dependências não instaladas!"
    echo "Instalando dependências do requirements.txt..."
    echo ""
    pip3 install -r requirements.txt
    if [ $? -ne 0 ]; then
        echo "[ERRO] Falha ao instalar dependências"
        exit 1
    fi
fi

echo "[OK] Dependências verificadas!"
echo ""
echo "========================================"
echo "   INICIANDO SERVIDOR..."
echo "========================================"
echo ""
echo "Acesse o sistema em: http://localhost:5000"
echo ""
echo "Para usar com ngrok: ngrok http 5000"
echo ""
echo "Pressione Ctrl+C para encerrar o servidor"
echo "========================================"
echo ""

python3 app.py
