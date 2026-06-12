#!/bin/bash
# NO set -e — handle errors manually

echo '[entrypoint] Zenith MT5 Bridge starting...'

# ── Virtual display ────────────────────────────────────────────────────────
pkill -9 Xvfb 2>/dev/null || true
rm -f /tmp/.X99-lock /tmp/.X11-unix/X99 2>/dev/null || true
sleep 1

Xvfb :99 -screen 0 1024x768x16 &
sleep 3

if ! pgrep -x Xvfb > /dev/null 2>&1; then
    echo '[entrypoint] ERROR: Xvfb failed to start — falling back to mock'
    exec python3 /app/bridge_mock.py
fi
echo '[entrypoint] Xvfb running'
export DISPLAY=:99

# ── Wine config ─────────────────────────────────────────────────────────────
export WINEARCH=win64
export WINEPREFIX=/root/.wine
MT5_TERMINAL="$WINEPREFIX/drive_c/Program Files/MetaTrader 5/terminal64.exe"

# ── Init Wine prefix if needed ─────────────────────────────────────────────
if [ ! -f "$WINEPREFIX/.update-timestamp" ]; then
    echo '[entrypoint] Initializing Wine prefix (first run ~3-5 min)...'
    DISPLAY=:99 WINEARCH=win64 WINEPREFIX="$WINEPREFIX" wineboot --init 2>&1 | grep -vE '^[0-9a-f]+:(fixme|trace)' || true

    echo '[entrypoint] Waiting for Wine init to complete...'
    for i in $(seq 1 120); do
        procs=$(ps aux 2>/dev/null | grep -cE '(rundll32.*wine.inf|install_mono)' || echo 0)
        if [ "$procs" -le 1 ]; then
            echo "[entrypoint] Wine init done after ~${i}x5s"
            break
        fi
        sleep 5
    done
    sleep 5

    echo '[entrypoint] Installing vcruntime140...'
    DISPLAY=:99 WINEARCH=win64 WINEPREFIX="$WINEPREFIX" winetricks -q vcruntime140 2>&1 | tail -3 || true
    echo '[entrypoint] Wine prefix ready'
else
    echo '[entrypoint] Wine prefix exists — skipping init'
fi

# ── Verify Wine works ─────────────────────────────────────────────────────
echo '[entrypoint] Testing Wine...'
WINE_TEST=$(DISPLAY=:99 WINEARCH=win64 WINEPREFIX="$WINEPREFIX" timeout 20 wine cmd /c echo WINE_OK 2>&1 | grep -c 'WINE_OK' || echo 0)
if [ "$WINE_TEST" -ge 1 ]; then
    echo '[entrypoint] Wine operational'
else
    echo '[entrypoint] WARNING: Wine test failed — using mock'
    exec python3 /app/bridge_mock.py
fi

# ── Install MT5 if not present ─────────────────────────────────────────────
if [ ! -f "$MT5_TERMINAL" ]; then
    echo '[entrypoint] Installing MetaTrader 5 silently...'
    DISPLAY=:99 WINEARCH=win64 WINEPREFIX="$WINEPREFIX" wineserver -k 2>/dev/null; sleep 2

    DISPLAY=:99 WINEARCH=win64 WINEPREFIX="$WINEPREFIX" wine /tmp/mt5setup.exe /S 2>&1 | grep -vE '^[0-9a-f]+:(fixme|trace)' &

    echo '[entrypoint] Waiting for MT5 install (up to 3 min)...'
    for i in $(seq 1 60); do
        if [ -f "$MT5_TERMINAL" ]; then
            echo "[entrypoint] MT5 installed! (${i}x3s)"
            break
        fi
        sleep 3
    done

    if [ ! -f "$MT5_TERMINAL" ]; then
        echo '[entrypoint] ERROR: MT5 install timeout — using mock'
        exec python3 /app/bridge_mock.py
    fi
else
    echo '[entrypoint] MT5 already installed'
fi

# ── Configure MT5 credentials ──────────────────────────────────────────────
echo '[entrypoint] Writing MT5 config...'
MT5_DATA="$WINEPREFIX/drive_c/Program Files/MetaTrader 5"
mkdir -p "$MT5_DATA/config"
printf '[Common]\nLogin=%s\nPassword=%s\nServer=%s\n' "$MT5_LOGIN" "$MT5_PASSWORD" "$MT5_SERVER" > "$MT5_DATA/config/common.ini"

# ── Launch MT5 terminal ────────────────────────────────────────────────────
echo '[entrypoint] Starting MT5 terminal...'
DISPLAY=:99 WINEARCH=win64 WINEPREFIX="$WINEPREFIX" wine "$MT5_TERMINAL" /portable 2>&1 | grep -vE '^[0-9a-f]+:(fixme|trace)' &
echo '[entrypoint] Waiting 30s for MT5 to connect...'
sleep 30

echo '[entrypoint] Launching real MT5 bridge...'
exec python3 /app/bridge.py
