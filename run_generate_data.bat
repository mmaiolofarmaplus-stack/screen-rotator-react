@echo off
cd /d "%~dp0"
py generate_data.py >> logs\generate_data.log 2>&1
