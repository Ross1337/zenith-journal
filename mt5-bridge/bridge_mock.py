#!/usr/bin/env python3
"""
Zenith MT5 Bridge - MOCK MODE
Simulates MT5 trade data to validate the Zenith API pipeline without a real broker.
Generates realistic fake trades and POSTs them to the Zenith API.
"""

import os
import sys
import time
import random
import logging
import requests
from datetime import datetime, timedelta, timezone

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [MOCK] %(message)s",
    stream=sys.stdout,
)
log = logging.getLogger(__name__)

MT5_LOGIN = os.getenv("MT5_LOGIN", "999999")
MT5_SERVER = os.getenv("MT5_SERVER", "Mock-Demo")
ZENITH_API_URL = os.environ.get("ZENITH_API_URL", "http://localhost:4000").rstrip("/")
ZENITH_API_KEY = os.environ.get("ZENITH_API_KEY", "mock_key")
POLL_INTERVAL = int(os.getenv("POLL_INTERVAL", "60"))

SYMBOLS = ["EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCAD", "XAUUSD", "BTCUSD", "SP500"]
SERVERS = ["ICMarkets-Demo01", "Pepperstone-Demo", "FTMO-Demo"]

ticket_counter = 1_000_000


def generate_fake_trade() -> dict:
    global ticket_counter
    ticket_counter += 1

    symbol = random.choice(SYMBOLS)
    trade_type = random.choice(["BUY", "SELL"])
    volume = round(random.choice([0.01, 0.05, 0.1, 0.25, 0.5, 1.0]), 2)

    if "USD" in symbol and symbol != "XAUUSD" and symbol != "BTCUSD":
        price = round(random.uniform(0.9, 1.5), 5)
        profit = round(random.uniform(-200, 300), 2)
    elif symbol == "XAUUSD":
        price = round(random.uniform(1800, 2100), 2)
        profit = round(random.uniform(-500, 800), 2)
    elif symbol == "BTCUSD":
        price = round(random.uniform(25000, 50000), 2)
        profit = round(random.uniform(-1000, 2000), 2)
    else:
        price = round(random.uniform(4000, 5000), 2)
        profit = round(random.uniform(-300, 500), 2)

    opened_at = datetime.now(tz=timezone.utc) - timedelta(hours=random.randint(1, 23))

    return {
        "external_id": str(ticket_counter),
        "source": "mt5_mock",
        "symbol": symbol,
        "type": trade_type,
        "entry": "OUT",
        "volume": volume,
        "price": price,
        "profit": profit,
        "commission": round(-volume * 3.5, 2),
        "swap": round(random.uniform(-5, 0), 2),
        "opened_at": opened_at.isoformat(),
        "order_id": str(ticket_counter - 100),
        "magic": random.choice([0, 12345, 99999]),
        "comment": random.choice(["", "EA_Scalper", "manual", "TP hit", "SL hit"]),
    }


def post_trades(trades: list) -> bool:
    if not trades:
        return True
    url = f"{ZENITH_API_URL}/trades/ingest/mt"
    headers = {
        "X-Zenith-Key": ZENITH_API_KEY,
        "Content-Type": "application/json",
    }
    try:
        resp = requests.post(url, json={"trades": trades}, headers=headers, timeout=15)
        if resp.status_code in (200, 201, 204):
            log.info(f"✓ Posted {len(trades)} mock trade(s) → HTTP {resp.status_code}")
        else:
            log.warning(f"API responded {resp.status_code}: {resp.text[:200]}")
        return True
    except requests.ConnectionError:
        log.warning(f"Cannot reach Zenith API at {url} — API may not be running yet")
        return False
    except requests.RequestException as e:
        log.error(f"POST failed: {e}")
        return False


def main():
    log.info(f"Mock bridge starting — simulating account={MT5_LOGIN} on {MT5_SERVER}")
    log.info(f"Zenith API target: {ZENITH_API_URL}")
    log.info("Generating fake trades every poll cycle to validate pipeline...")

    cycle = 0
    while True:
        cycle += 1
        count = random.randint(1, 5)
        trades = [generate_fake_trade() for _ in range(count)]

        log.info(f"[cycle {cycle}] Generated {count} fake trade(s):")
        for t in trades:
            log.info(f"  {t['type']} {t['volume']} {t['symbol']} @ {t['price']} → P&L {t['profit']}")

        post_trades(trades)
        log.info(f"Next poll in {POLL_INTERVAL}s...")
        time.sleep(POLL_INTERVAL)


if __name__ == "__main__":
    main()
