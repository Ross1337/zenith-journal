#!/usr/bin/env bash
# provision.sh — Spin up a dedicated MT5 bridge container for one Zenith client.
#
# Usage:
#   ./provision.sh <userId> <apiKey> [mt5Login] [mt5Password] [mt5Server]
#
# Examples:
#   # Mock mode (no MT5 credentials):
#   ./provision.sh user_abc123 ze_abc123xxxxx
#
#   # Real MT5 mode (full Wine container):
#   ./provision.sh user_abc123 ze_abc123xxxxx 25566816 MyPass VantageMarkets-Demo

set -euo pipefail

if [ $# -lt 2 ]; then
  echo "Usage: $0 <userId> <apiKey> [mt5Login] [mt5Password] [mt5Server]"
  exit 1
fi

USER_ID="$1"
API_KEY="$2"
MT5_LOGIN="${3:-}"
MT5_PASSWORD="${4:-}"
MT5_SERVER="${5:-}"

CONTAINER_NAME="zenith-mt5-${USER_ID}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Detect mode: real MT5 if all three credentials supplied, otherwise mock
if [ -n "$MT5_LOGIN" ] && [ -n "$MT5_PASSWORD" ] && [ -n "$MT5_SERVER" ]; then
  MODE="real"
  IMAGE="zenith-mt5-bridge:latest"
else
  MODE="mock"
  IMAGE="zenith-mt5-mock:latest"
fi

echo "[provision] userId=${USER_ID}  mode=${MODE}  container=${CONTAINER_NAME}"

# Remove any existing container with the same name
if docker ps -a --format '{{.Names}}' | grep -qx "${CONTAINER_NAME}"; then
  echo "[provision] Removing existing container ${CONTAINER_NAME}..."
  docker rm -f "${CONTAINER_NAME}"
fi

# Build image if not already present
if ! docker image inspect "${IMAGE}" > /dev/null 2>&1; then
  echo "[provision] Building image ${IMAGE}..."
  if [ "$MODE" = "mock" ]; then
    docker build -f "${SCRIPT_DIR}/Dockerfile.mock" -t "${IMAGE}" "${SCRIPT_DIR}"
  else
    docker build -f "${SCRIPT_DIR}/Dockerfile" -t "${IMAGE}" "${SCRIPT_DIR}"
  fi
  echo "[provision] Image ${IMAGE} built successfully."
else
  echo "[provision] Image ${IMAGE} already present — skipping build."
fi

# Common run arguments
RUN_ARGS=(
  --detach
  --name "${CONTAINER_NAME}"
  --restart unless-stopped
  --add-host host.docker.internal:host-gateway
  --env "ZENITH_API_KEY=${API_KEY}"
  --env "ZENITH_API_URL=http://host.docker.internal:4000"
  --env "POLL_INTERVAL=30"
  --log-driver json-file
  --log-opt max-size=10m
  --log-opt max-file=3
)

if [ "$MODE" = "real" ]; then
  RUN_ARGS+=(
    --privileged
    --security-opt seccomp:unconfined
    --env "MT5_LOGIN=${MT5_LOGIN}"
    --env "MT5_PASSWORD=${MT5_PASSWORD}"
    --env "MT5_SERVER=${MT5_SERVER}"
    --memory 1g
    --shm-size 512m
    --volume "zenith_mt5_wine_${USER_ID}:/root/.wine"
    --volume "${SCRIPT_DIR}/entrypoint.sh:/app/entrypoint.sh:ro"
    --volume "${SCRIPT_DIR}/bridge.py:/app/bridge.py:ro"
    --volume "${SCRIPT_DIR}/bridge_mock.py:/app/bridge_mock.py:ro"
  )
else
  # Mock mode: lightweight container, just needs bridge_mock.py
  RUN_ARGS+=(
    --env "MT5_LOGIN=${MT5_LOGIN:-999999}"
    --env "MT5_SERVER=${MT5_SERVER:-Mock-Demo}"
    --volume "${SCRIPT_DIR}/bridge_mock.py:/app/bridge_mock.py:ro"
  )
fi

echo "[provision] Starting container ${CONTAINER_NAME}..."
docker run "${RUN_ARGS[@]}" "${IMAGE}"

echo ""
echo "[provision] ✓ Container ${CONTAINER_NAME} is running."
echo ""
echo "Useful commands:"
echo "  docker logs -f ${CONTAINER_NAME}"
echo "  docker stop ${CONTAINER_NAME}"
echo "  docker rm -f ${CONTAINER_NAME}"
