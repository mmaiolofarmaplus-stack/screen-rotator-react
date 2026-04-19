@echo off
cd /d "C:\Users\MMaiolo\screen-rotator-react"

echo [%date% %time%] Iniciando actualizacion de datos... >> logs\update.log

REM 1. Generar CSVs desde Google Drive
"C:\Users\MMaiolo\AppData\Local\Programs\Python\Python314\python.exe" generate_data.py >> logs\update.log 2>&1

if errorlevel 1 (
    echo [%date% %time%] ERROR: generate_data.py fallo >> logs\update.log
    exit /b 1
)

REM 2. Commitear y pushear los CSVs
"C:\Program Files\Git\cmd\git.exe" add public/data/base_conocimiento.csv public/data/horas_hoy.csv public/data/horas_semana_anterior.csv public/data/beneficios.csv >> logs\update.log 2>&1

"C:\Program Files\Git\cmd\git.exe" diff --cached --quiet
if errorlevel 1 (
    for /f "tokens=1-2 delims=: " %%a in ("%time%") do set HORA=%%a:%%b
    "C:\Program Files\Git\cmd\git.exe" commit -m "auto: datos actualizados %date% %HORA%" >> logs\update.log 2>&1
    "C:\Program Files\Git\cmd\git.exe" push >> logs\update.log 2>&1
    echo [%date% %time%] OK: push completado >> logs\update.log
) else (
    echo [%date% %time%] Sin cambios en los datos >> logs\update.log
)
