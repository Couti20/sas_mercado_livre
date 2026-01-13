@echo off
setlocal enabledelayedexpansion

echo.
echo ===================================================
echo  COMPILAR E EXECUTAR - BACKEND JAVA
echo ===================================================
echo.

cd /d "c:\Users\Michael\Desktop\sas_mercado_livre\backend"

echo [1/3] Limpando arquivos antigos...
if exist target rmdir /s /q target

echo [2/3] Compilando com Maven...
call mvn clean package -DskipTests
if errorlevel 1 (
    echo.
    echo ❌ ERRO na compilacao!
    echo.
    pause
    exit /b 1
)

echo.
echo [3/3] Executando JAR...
echo.
echo ===================================================
echo  Backend rodando em http://localhost:8080
echo ===================================================
echo.

java -jar target/price-monitor-1.0.0.jar

pause
