@echo off
chcp 65001 >nul
echo ============================================
echo   Generando APK de Mi Horario
echo ============================================
echo.

echo [1/4] Compilando frontend con Vite...
call npm run build
if errorlevel 1 goto error

echo.
echo [2/4] Sincronizando con Android...
call npx cap sync
if errorlevel 1 goto error

echo.
echo [3/4] Generando APK con Gradle...
cd android
call gradlew assembleDebug
if errorlevel 1 goto error
cd ..

echo.
echo [4/4] Copiando APK a la raiz...
copy /Y android\app\build\outputs\apk\debug\app-debug.apk mi-horario-app.apk

echo.
echo ============================================
echo   APK generado exitosamente!
echo   Ubicacion: D:\mi-horario-app\mi-horario-app.apk
echo ============================================
goto end

:error
echo.
echo ============================================
echo   ERROR: Fallo la compilacion
echo ============================================
exit /b 1

:end
pause