@echo off
chcp 65001 >nul
title Beit HaMikdash HaShlishi - Betriebswirtschaftsprogramm
setlocal

rem ================================================================
rem  בית המקדש השלישי – Starter
rem  Öffnet das Programm als eigenes Fenster (Edge/Chrome App-Modus).
rem  Keine Installation, kein Internet nötig. Daten bleiben lokal.
rem ================================================================

set "APPDIR=%~dp0app"
set "INDEX=%APPDIR%\index.html"

if not exist "%INDEX%" (
  echo [FEHLER] Datei nicht gefunden: "%INDEX%"
  echo Bitte den Ordner "app" neben dieser .bat-Datei belassen.
  pause
  exit /b 1
)

rem Pfad in file:///-URL umwandeln
set "URL=%INDEX:\=/%"
set "URL=file:///%URL%"

set "BROWSER="
for %%P in (
  "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
  "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
  "%LocalAppData%\Microsoft\Edge\Application\msedge.exe"
  "%ProgramFiles%\Google\Chrome\Application\chrome.exe"
  "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
  "%LocalAppData%\Google\Chrome\Application\chrome.exe"
) do (
  if not defined BROWSER if exist %%P set "BROWSER=%%~P"
)

echo.
echo   בית המקדש השלישי  -  Betriebswirtschaftsprogramm
echo   ------------------------------------------------
if defined BROWSER (
  echo   Starte im App-Fenster: "%BROWSER%"
  start "" "%BROWSER%" --app="%URL%" --window-size=1500,950
) else (
  echo   Kein Edge/Chrome gefunden - oeffne im Standardbrowser.
  start "" "%INDEX%"
)
echo.
echo   Hinweis: Daten werden im Browser gespeichert.
echo   Regelmaessig unter "Einstellungen" eine Sicherung exportieren!
timeout /t 4 >nul
endlocal
exit /b 0
