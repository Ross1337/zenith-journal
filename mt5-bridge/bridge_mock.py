#!/usr/bin/env python3
"""
Zenith MT5 Bridge - MOCK MODE (corrigé pour l'API Zenith v1)
Génère de faux trades et les envoie un par un vers POST /v1/trades/ingest/mt
Format du payload conforme au DTO MtIngestInput.
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
ZENITH_API_KEY = os.environ.get("ZENITH_API_KEY", "")
POLL_INTERVAL = int(os.getenv("POLL_INTERVAL", "10"))

SYMBOLS = ["EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCAD", "XAUUSD"]

ticket_counter = 2_000_000


def generate_fake_trade() -> dict:
    global ticket_counter
    ticket_counter += 1

    symbol = random.choice(SYMBOLS)
    trade_type = random.choice(["buy", "sell"])
    lots = round(random.choice([0.01, 0.05, 0.1, 0.25, 0.5]), 2)

    if symbol == "XAUUSD":
        open_price = round(random.uniform(1800, 2100), 2)
        close_price = round(open_price * random.uniform(0.995, 1.005), 2)
        sl = round(open_price - 15 if trade_type == "buy" else open_price + 15, 2)
        tp = round(open_price + 30 if trade_type == "buy" else open_price - 30, 2)
        profit = round((close_price - open_price) * lots * 100 * (1 if trade_type == "buy" else -1), 2)
    elif "JPY" in symbol:
        open_price = round(random.uniform(130, 155), 3)
        close_price = round(open_price * random.uniform(0.998, 1.002), 3)
        sl = round(open_price - 0.5 if trade_type == "buy" else open_price + 0.5, 3)
        tp = round(open_price + 1.0 if trade_type == "buy" else open_price - 1.0, 3)
        profit = round((close_price - open_price) * lots * 100 * (1 if trade_type == "buy" else -1), 2)
    else:
        open_price = round(random.uniform(0.9, 1.5), 5)
        close_price = round(open_price * random.uniform(0.9985, 1.0015), 5)
        sl = round(open_price - 0.003 if trade_type == "buy" else open_price + 0.003, 5)
        tp = round(open_price + 0.005 if trade_type == "buy" else open_price - 0.005, 5)
        profit = round((close_price - open_price) * lots * 100000 * (1 if trade_type == "buy" else -1), 2)

    open_time = datetime.now(tz=timezone.utc) - timedelta(hours=random.randint(2, 48))
    close_time = open_time + timedelta(hours=random.randint(1, 12), minutes=random.randint(0, 59))
    commission = round(-lots * 3.5, 2)
    swap = round(random.uniform(-2.0, 0.0), 2)

    return {
        "apiKey": ZENITH_API_KEY,
        "accountId": MT5_LOGIN,
        "source": "mt5",
        "ticket": ticket_counter,
        "symbol": symbol,
        "type": trade_type,
        "openTime": open_time.isoformat(),
        "closeTime": close_time.isoformat(),
        "openPrice": open_price,
        "closePrice": close_price,
        "lots": lots,
        "sl": sl,
        "tp": tp,
        "commission": commission,
        "swap": swap,
        "profit": profit,
    }


def post_trade(trade: dict) -> bool:
    url = f"{ZENITH_API_URL}/v1/trades/ingest/mt"
    headers = {"Content-Type": "application/json"}
    try:
        resp = requests.post(url, json=trade, headers=headers, timeout=15)
        body = resp.json() if resp.headers.get("content-type", "").startswith("application/json") else resp.text
        if resp.status_code in (200, 201):
            status = body.get("status", "?") if isinstance(body, dict) else "?"
            log.info(f"  ticket={trade['ticket']} {trade['type'].upper()} {trade['lots']} {trade['symbol']} "
                     f"@ {trade['openPrice']} -> {trade['closePrice']} | P&L {trade['profit']} | status={status}")
        else:
            log.warning(f"  ticket={trade['ticket']} HTTP {resp.status_code}: {str(body)[:200]}")
        return True
    except requests.ConnectionError:
        log.warning(f"Impossible de joindre l'API Zenith sur {url}")
        return False
    except requests.RequestException as e:
        log.error(f"Erreur POST: {e}")
        return False


def main():
    if not ZENITH_API_KEY:
        log.error("ZENITH_API_KEY non définie — arrêt.")
        sys.exit(1)

    log.info(f"=== Zenith MT5 Bridge MOCK ===")
    log.info(f"Compte simulé : {MT5_LOGIN} sur {MT5_SERVER}")
    log.info(f"API cible      : {ZENITH_API_URL}/v1/trades/ingest/mt")
    log.info(f"Intervalle     : {POLL_INTERVAL}s")
    log.info("")

    cycle = 0
    while True:
        cycle += 1
        count = random.randint(1, 3)
        log.info(f"[cycle {cycle}] Génération de {count} trade(s) fictif(s)...")
        for _ in range(count):
            trade = generate_fake_trade()
            post_trade(trade)
        log.info(f"Prochain cycle dans {POLL_INTERVAL}s...")
        time.sleep(POLL_INTERVAL)


if __name__ == "__main__":
    main()
