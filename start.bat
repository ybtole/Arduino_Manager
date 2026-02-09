@echo off
echo ========================================
echo    ARDUINO KIT MANAGER - INICIALIZACAO
echo ========================================
echo.

REM Verifica se Python está instalado
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Python nao encontrado!
    echo Por favor, instale o Python 3.8 ou superior
    pause
    exit /b 1
)

echo [OK] Python encontrado!
echo.

REM Verifica se as dependências estão instaladas
echo Verificando dependencias...
pip show Flask >nul 2>&1
if errorlevel 1 (
    echo.
    echo [AVISO] Dependencias nao instaladas!
    echo Instalando dependencias do requirements.txt...
    echo.
    pip install -r requirements.txt
    if errorlevel 1 (
        echo [ERRO] Falha ao instalar dependencias
        pause
        exit /b 1
    )
)

echo [OK] Dependencias verificadas!
echo.
echo ========================================
echo    INICIANDO SERVIDOR...
echo ========================================
echo.
echo Acesse o sistema em: http://localhost:5000
echo.
echo Para usar com ngrok: ngrok http 5000
echo.
echo Pressione Ctrl+C para encerrar o servidor
echo ========================================
echo.

python app.py

pause
