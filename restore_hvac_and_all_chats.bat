@echo off
chcp 65001 >nul 2>&1
echo ========================================================
echo   RESTORING HVAC CONVERSATION & ALL CHAT HISTORY
echo ========================================================
echo.
echo Make sure Antigravity IDE is completely CLOSED.
echo If it is still open, click File -> Exit now.
echo.
pause
echo.
echo Restoring...
python "C:\Users\BAPS\.gemini\antigravity-ide\brain\f5d003e9-2e50-4a6d-bb08-a17c4445613c\scratch\auto_restore.py"
echo.
pause
