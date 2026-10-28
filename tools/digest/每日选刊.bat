@echo off
REM Daily digest generation.
REM Called by Windows Scheduled Task at 08:00.
REM Keep this file ASCII-only: cmd.exe reads .bat as the system ANSI codepage,
REM and UTF-8 Chinese comments here break line parsing (seen as exit code 255).

cd /d "%~dp0"

set LOG=%~dp0last-run.log

echo.>>"%LOG%"
echo ===== %date% %time% =====>>"%LOG%"

node run.mjs>>"%LOG%" 2>&1
set RC=%errorlevel%

REM The space before >> matters: "echo exit=0>>file" is parsed as
REM a redirect of file descriptor 0, so the line would never be written.
echo exit=%RC% >>"%LOG%"

REM Trim the log if it grows past 200 KB.
for %%A in ("%LOG%") do if %%~zA GTR 204800 del "%LOG%"

exit /b %RC%