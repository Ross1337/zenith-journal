#!/bin/bash
set -e

# Start virtual display
Xvfb :99 -screen 0 1024x768x16 &
export DISPLAY=:99

echo "[entrypoint] Virtual display started on :99"

# Start MT5 terminal in background (portable mode)
MT5_PATH="$HOME/.wine/drive_c/Program Files/MetaTrader 5/terminal64.exe"

if [ -f "$MT5_PATH" ]; then
    echo "[entrypoint] Starting MT5 terminal..."
    wine "$MT5_PATH" /portable &
    sleep 15  # wait for MT5 to initialize
    echo "[entrypoint] MT5 started"
else
    echo "[entrypoint] WARNING: MT5 terminal not found at $MT5_PATH"
    echo "[entrypoint] Falling back to mock bridge"
    export USE_MOCK=true
fi

# Run bridge (real or mock)
if [ "$USE_MOCK" = "true" ]; then
    echo "[entrypoint] Running mock bridge..."
    exec python3 /app/bridge_mock.py
else
    echo "[entrypoint] Running real MT5 bridge..."
    exec python3 /app/bridge.py
fi
