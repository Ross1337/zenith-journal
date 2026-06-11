# Zenith MT5 Bridge

Automated MT5 trade ingestion via Wine + Docker. Each client runs in its own container — read-only investor password connection.

## Architecture

```
[MT5 Terminal (Wine)] → [bridge.py (Python)] → [Zenith API /trades/ingest/mt]
         ↕
    [Docker Container]
    1 container = 1 MT5 account
    ~150-200 MB RAM per client
    40-50 clients on a 8GB VPS
```

### Scaling estimate

| VPS RAM | Max containers | Notes |
|---------|---------------|-------|
| 4 GB    | ~15-20        | Leave 1GB for OS |
| 8 GB    | ~40-50        | Recommended |
| 16 GB   | ~80-100       | Production |

For isolation totale (Proxmox), deploy 1 LXC per client group — each LXC runs 5-10 Docker containers.

## Prerequisites

- Docker >= 20.10 + docker-compose v2
- Network `zenith_default` must exist:  
  `docker network create zenith_default`
- Zenith API accessible on the same Docker network

## Quick Start

### 1. Build the image

```bash
cd ~/zenith/mt5-bridge
docker-compose build
# or: docker build -t zenith-mt5-bridge .
```

> First build takes ~10-15 minutes (Wine install + MT5 download).

### 2. Test pipeline with mock (no real broker needed)

```bash
docker-compose up mt5-mock
```

This generates fake trades every 30s and POSTs to the Zenith API. Use this to validate the ingestion endpoint before connecting real accounts.

### 3. Launch a real client

```bash
docker-compose up -d mt5-client-1
docker-compose logs -f mt5-client-1
```

### 4. Add a new client

Copy a service block in `docker-compose.yml`, change the credentials:

```yaml
  mt5-client-N:
    build: .
    environment:
      - MT5_LOGIN=<real_login>
      - MT5_PASSWORD=<investor_password>  # read-only!
      - MT5_SERVER=<broker_server>
      - ZENITH_API_URL=http://zenith-api-1:4000
      - ZENITH_API_KEY=<client_api_key>
    networks:
      - zenith_default
    restart: unless-stopped
    mem_limit: 512m
```

Then: `docker-compose up -d mt5-client-N`

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MT5_LOGIN` | yes | MT5 account number |
| `MT5_PASSWORD` | yes | Investor (read-only) password |
| `MT5_SERVER` | yes | Broker server name (e.g. `ICMarkets-Demo01`) |
| `ZENITH_API_URL` | yes | Base URL of Zenith API |
| `ZENITH_API_KEY` | yes | Per-client API key |
| `POLL_INTERVAL` | no | Poll interval in seconds (default: 60) |
| `USE_MOCK` | no | Set to `true` to run mock bridge instead of real MT5 |

## Files

| File | Description |
|------|-------------|
| `Dockerfile` | Ubuntu 22.04 + Wine + Python 3.11 + MT5 |
| `entrypoint.sh` | Starts Xvfb, MT5 terminal, then bridge |
| `bridge.py` | Real MT5 bridge — connects via MetaTrader5 Python package |
| `bridge_mock.py` | Mock bridge — generates fake trades for pipeline testing |
| `docker-compose.yml` | Example multi-client setup |
| `accounts.json` | Example account config (not used by containers directly) |

## MT5 Python Package Note

The `MetaTrader5` Python package on Linux works by communicating with a running MT5 terminal via named pipes — it requires Wine + the MT5 terminal to be running. If the Wine/MT5 install fails in Docker:

### Alternative: MQL5 EA approach

Deploy an Expert Advisor (EA) in the MT5 terminal that:
1. Runs on a timer (every 60s)
2. Reads `OrdersHistoryTotal()` / `HistoryDealsTotal()`
3. POSTs to Zenith API via `WebRequest()` (must whitelist URL in MT5 settings)

The EA approach runs entirely inside the Wine MT5 terminal — no Python needed. Better compatibility, less Docker overhead (~100MB/client).

## Monitoring

```bash
# All containers status
docker-compose ps

# Live logs for one client
docker-compose logs -f mt5-client-1

# Resource usage
docker stats --no-stream

# Restart a client
docker-compose restart mt5-client-1
```

## Troubleshooting

**MT5 won't start in Wine:**
```bash
docker exec -it zenith-mt5-1 bash
export DISPLAY=:99
wine "~/.wine/drive_c/Program Files/MetaTrader 5/terminal64.exe" /portable
```

**MetaTrader5 Python import fails:**  
Fallback is automatic — `USE_MOCK=true` in env or entrypoint detects missing terminal.

**API POST fails:**  
Check `ZENITH_API_URL` is reachable from within the container network:
```bash
docker exec zenith-mt5-1 curl -s $ZENITH_API_URL/health
```
