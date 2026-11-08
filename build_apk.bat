@echo off
set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
set "ANDROID_HOME=C:\Users\taner\AppData\Local\Android\Sdk"
set "PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%PATH%"

echo =======================================================
echo SIKKELOBEDI YEREL APK DERLEYICI (Expo Hesabi Gerekmez)
echo =======================================================
echo Java: %JAVA_HOME%
echo Android SDK: %ANDROID_HOME%
echo.

cd /d "%~dp0android"
call gradlew.bat assembleRelease --no-daemon
if %ERRORLEVEL% EQU 0 (
    echo.
    echo =======================================================
    echo BASARILI! APK DOSYANIZ HAZIR:
    echo %~dp0android\app\build\outputs\apk\release\app-release.apk
    echo =======================================================
) else (
    echo.
    echo Derleme sirasinda hata olustu.
)
