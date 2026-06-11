#!/usr/bin/env python3
"""
Zenith MT5 Bridge - Real MT5 connection via Wine
Polls trade history and POSTs to Zenith API.
"""

import os
import sys
import time
import logging
import requests
from datetime import datetime, timedelta, timezone

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    stream=sys.stdout,
)
log = logging.getLogger(__name__)

# Config from environment
MT5_LOGIN = int(os.environ["MT5_LOGIN"])
MT5_PASSWORD = os.environ["MT5_PASSWORD"]
MT5_SERVER = os.environ["MT5_SERVER"]
ZENITH_API_URL = os.environ["ZENITH_API_URL"].rstrip("/")
ZENITH_API_KEY = os.environ["ZENITH_API_KEY"]
POLL_INTERVAL = int(os.getenv("POLL_INTERVAL", "60"))


def connect_mt5():
    """Initialize and login to MT5 with exponential backoff."""
    try:
        import MetaTrader5 as mt5
    except ImportError:
        log.error("MetaTrader5 package not available — run bridge_mock.py instead")
        sys.exit(1)

    delay = 5
    for attempt in range(1, 11):
        log.info(f"MT5 connect attempt {attempt}/10...")
        if not mt5.initialize():
            log.warning(f"mt5.initialize() failed: {mt5.last_error()}")
            time.sleep(delay)
            delay = min(delay * 2, 300)
            continue

        if not mt5.login(MT5_LOGIN, MT5_PASSWORD, MT5_SERVER):
            log.warning(f"mt5.login() failed: {mt5.last_error()}")
            mt5.shutdown()
            time.sleep(delay)
            delay = min(delay * 2, 300)
            continue

        info = mt5.account_info()
        log.info(f"Connected to MT5: account={info.login} server={info.server} balance={info.balance}")
        return mt5

    log.error("Could not connect to MT5 after 10 attempts")
    sys.exit(1)


def format_deal(deal) -> dict:
    """Convert MT5 deal to Zenith trade format."""
    # deal.entry: 0=IN, 1=OUT, 2=INOUT, 3=STATE
    entry_map = {0: "IN", 1: "OUT", 2: "INOUT", 3: "STATE"}
    type_map = {0: "BUY", 1: "SELL"}

    return {
        "external_id": str(deal.ticket),
        "source": "mt5",
        "symbol": deal.symbol,
        "type": type_map.get(deal.type, "UNKNOWN"),
        "entry": entry_map.get(deal.entry, "UNKNOWN"),
        "volume": deal.volume,
        "price": deal.price,
        "profit": deal.profit,
        "commission": deal.commission,
        "swap": deal.swap,
        "opened_at": datetime.fromtimestamp(deal.time, tz=timezone.utc).isoformat(),
        "order_id": str(deal.order),
        "magic": deal.magic,
        "comment": deal.comment,
    }


def post_trades(trades: list) -> bool:
    """POST trade batch to Zenith API."""
    if not trades:
        return True
    url = f"{ZENITH_API_URL}/trades/ingest/mt"
    headers = {
        "X-Zenith-Key": ZENITH_API_KEY,
        "Content-Type": "application/json",
    }
    try:
        resp = requests.post(url, json={"trades": trades}, headers=headers, timeout=15)
        resp.raise_for_status()
        log.info(f"Posted {len(trades)} trade(s) → {resp.status_code}")
        return True
    except requests.RequestException as e:
        log.error(f"Failed to POST trades: {e}")
        return False


def main():
    log.info(f"Zenith MT5 Bridge starting — account={MT5_LOGIN} server={MT5_SERVER}")
    mt5 = connect_mt5()

    seen_tickets = set()

    while True:
        try:
            now = datetime.now(tz=timezone.utc)
            since = now - timedelta(hours=24)

            deals = mt5.history_deals_get(since, now)
            if deals is None:
                log.warning(f"history_deals_get returned None: {mt5.last_error()}")
                # Try reconnect
                mt5.shutdown()
                mt5 = connect_mt5()
                time.sleep(POLL_INTERVAL)
                continue

            new_deals = [d for d in deals if d.ticket not in seen_tickets]

            # Only closed positions (entry=OUT or INOUT) and real trades (BUY/SELL)
            closed = [d for d in new_deals if d.entry in (1, 2) and d.type in (0, 1)]

            if closed:
                trades = [format_deal(d) for d in closed]
                if post_trades(trades):
                    for d in closed:
                        seen_tickets.add(d.ticket)
            else:
                log.info(f"No new closed deals (scanned {len(deals)} deals in last 24h)")

        except Exception as e:
            log.error(f"Poll error: {e}", exc_info=True)

        time.sleep(POLL_INTERVAL)


if __name__ == "__main__":
    main()
