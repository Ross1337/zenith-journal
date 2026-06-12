# Zenith MT5 Bridge

Python bridge that polls MetaTrader 5 and pushes trades to the Zenith API.

## Architecture

Each client gets their own dedicated Docker container (`zenith-mt5-{userId}`), fully isolated.

```
Client A  →  zenith-mt5-user_abc  →  POST http://host:4000/v1/trades/ingest/mt
Client B  →  zenith-mt5-user_def  →  POST http://host:4000/v1/trades/ingest/mt
```

Two operating modes:

| Mode | Image | When to use |
|------|-------|-------------|
| **Mock** | `zenith-mt5-mock:latest` | Testing, demo, no MT5 credentials |
| **Real** | `zenith-mt5-bridge:latest` | Production with Wine + MT5 terminal |

## Provisioning a new client

### Mock mode (simulation)

```bash
cd ~/zenith/mt5-bridge
./provision.sh <userId> <apiKey>
```

Example:
```bash
./provision.sh user_abc123 ze_api_key_here
```

### Real MT5 mode

```bash
./provision.sh <userId> <apiKey> <mt5Login> <mt5Password> <mt5Server>
```

Example:
```bash
./provision.sh user_abc123 ze_api_key_here 25566816 MyPassword VantageMarkets-Demo
```

The script will:
1. Remove any existing container with the same `userId`
2. Build the Docker image if not already present
3. Start the container with `--restart unless-stopped`

## Container naming

Containers are named `zenith-mt5-{userId}` — e.g. `zenith-mt5-user_abc123`.

## Environment variables

| Variable | Description | Required |
|----------|-------------|----------|
| `ZENITH_API_KEY` | User's Zenith API key | Yes |
| `ZENITH_API_URL` | Zenith API base URL | Auto-set by provision.sh |
| `MT5_LOGIN` | MT5 account login number | Real mode only |
| `MT5_PASSWORD` | MT5 account password | Real mode only |
| `MT5_SERVER` | MT5 broker server name | Real mode only |
| `POLL_INTERVAL` | Seconds between polling cycles (default: 30) | No |

## Useful commands

```bash
# View logs for a client
docker logs -f zenith-mt5-user_abc123

# List all running bridges
docker ps --filter "name=zenith-mt5-"

# Stop a client's bridge
docker stop zenith-mt5-user_abc123

# Remove a client's bridge
docker rm -f zenith-mt5-user_abc123

# Rebuild mock image after code changes
docker build -f Dockerfile.mock -t zenith-mt5-mock:latest .
```

## Files

| File | Description |
|------|-------------|
| `provision.sh` | Provisions a container per client |
| `Dockerfile.mock` | Lightweight image for mock/simulation mode |
| `Dockerfile` | Full Wine + MT5 image for real mode |
| `bridge_mock.py` | Mock bridge — generates fake trades |
| `bridge.py` | Real bridge — connects to MT5 via Wine |
| `entrypoint.sh` | Entrypoint for real mode (Wine init + MT5 launch) |
| `docker-compose.yml` | Legacy single-container compose (kept for reference) |

## API payload format

Each trade is sent as a `POST /v1/trades/ingest/mt` with:

```json
{
  "apiKey": "ze_...",
  "accountId": "25566816",
  "source": "mt5",
  "ticket": 2000001,
  "symbol": "EURUSD",
  "type": "buy",
  "openTime": "2025-01-01T10:00:00Z",
  "closeTime": "2025-01-01T12:00:00Z",
  "openPrice": 1.08500,
  "closePrice": 1.08650,
  "lots": 0.1,
  "profit": 15.00,
  "commission": -3.50,
  "swap": -0.50
}
```
