@echo off
REM Daily backup script for Employee-Boss Reporting System
REM This script runs daily via Windows Task Scheduler

cd /d "C:\Users\moham\OneDrive\Desktop\New\server"

echo [%date% %time%] Starting daily backup...

REM Run backup
call npm run backup:create

if %ERRORLEVEL% EQU 0 (
    echo [%date% %time%] Backup successful
) else (
    echo [%date% %time%] Backup failed with error code %ERRORLEVEL%
)

REM Keep log of backups
echo [%date% %time%] Backup completed >> backup-log.txt
