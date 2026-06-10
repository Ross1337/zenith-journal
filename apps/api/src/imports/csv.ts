import { createHash } from 'node:crypto';

/**
 * Generic broker-CSV → normalized fills.
 * RFC-4180-ish parser (quotes, escaped quotes, CRLF) + heuristic header
 * mapping so exports from IBKR, NinjaTrader, Tradovate, MT4/5, TradingView
 * and most "Time,Symbol,Side,Qty,Price" files land without configuration.
 */

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!;
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cell += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',' || ch === ';' || ch === '\t') {
      // ; and \t tolerated as separators (EU Excel exports)
      row.push(cell);
      cell = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cell);
      cell = '';
      if (row.some((c) => c.trim() !== '')) rows.push(row);
      row = [];
    } else {
      cell += ch;
    }
  }
  row.push(cell);
  if (row.some((c) => c.trim() !== '')) rows.push(row);
  return rows;
}

const HEADER_SYNONYMS: Record<string, string[]> = {
  symbol: ['symbol', 'ticker', 'instrument', 'contract', 'product', 'market'],
  side: ['side', 'action', 'buysell', 'buy/sell', 'b/s', 'direction', 'type', 'operation'],
  quantity: ['qty', 'quantity', 'size', 'filledqty', 'filled', 'volume', 'lots', 'amount', 'shares', 'contracts'],
  price: ['price', 'fillprice', 'avgprice', 'execprice', 'executionprice', 'tradeprice', 'fill'],
  executedAt: ['time', 'datetime', 'date/time', 'filltime', 'timestamp', 'executed', 'executedat', 'date', 'tradetime', 'opentime'],
  commission: ['commission', 'comm', 'commissions'],
  fees: ['fees', 'fee', 'regfees', 'exchangefees'],
  externalId: ['id', 'execid', 'executionid', 'orderid', 'tradeid', 'fillid', 'ticket'],
};

function normalizeHeader(h: string): string {
  return h.toLowerCase().replace(/[^a-z/]/g, '');
}

export interface ColumnMap {
  symbol: number;
  side: number;
  quantity: number;
  price: number;
  executedAt: number;
  commission: number | null;
  fees: number | null;
  externalId: number | null;
}

export function mapColumns(header: string[]): { map: ColumnMap | null; missing: string[] } {
  const normalized = header.map(normalizeHeader);
  const find = (field: keyof typeof HEADER_SYNONYMS): number | null => {
    for (const syn of HEADER_SYNONYMS[field]!) {
      const idx = normalized.indexOf(syn);
      if (idx !== -1) return idx;
    }
    return null;
  };

  const required = ['symbol', 'side', 'quantity', 'price', 'executedAt'] as const;
  const found = {
    symbol: find('symbol'),
    side: find('side'),
    quantity: find('quantity'),
    price: find('price'),
    executedAt: find('executedAt'),
    commission: find('commission'),
    fees: find('fees'),
    externalId: find('externalId'),
  };

  const missing = required.filter((f) => found[f] === null);
  if (missing.length > 0) return { map: null, missing: [...missing] };
  return { map: found as ColumnMap, missing: [] };
}

export interface NormalizedFill {
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  price: number;
  commission: number;
  fees: number;
  /** ISO string. */
  executedAt: string;
  /** Broker id or content hash — dedup anchor. */
  externalId: string;
}

const BUY_WORDS = new Set(['buy', 'b', 'bot', 'bought', 'long', 'buytoopen', 'buytoclose', 'bto', 'btc']);
const SELL_WORDS = new Set(['sell', 's', 'sld', 'sold', 'short', 'selltoopen', 'selltoclose', 'sto', 'stc']);

function parseSide(raw: string): 'buy' | 'sell' | null {
  const v = raw.toLowerCase().replace(/[^a-z]/g, '');
  if (BUY_WORDS.has(v)) return 'buy';
  if (SELL_WORDS.has(v)) return 'sell';
  return null;
}

function parseNumber(raw: string): number | null {
  // Tolerate "1 234,56", "$1,234.56", "(12.5)" negatives.
  let v = raw.trim().replace(/[$€£\s]/g, '');
  const negative = /^\(.*\)$/.test(v);
  if (negative) v = v.slice(1, -1);
  if (/,\d{1,2}$/.test(v) && !v.includes('.')) v = v.replace(/\./g, '').replace(',', '.');
  else v = v.replace(/,/g, '');
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return negative ? -n : n;
}

function parseDate(raw: string): Date | null {
  const v = raw.trim();
  // DD/MM/YYYY vs MM/DD/YYYY ambiguity: trust Date.parse (US) unless day > 12.
  const eu = /^(\d{1,2})\/(\d{1,2})\/(\d{4})(.*)$/.exec(v);
  if (eu && Number(eu[1]) > 12) {
    const parsed = new Date(`${eu[3]}-${eu[2]!.padStart(2, '0')}-${eu[1]!.padStart(2, '0')}${eu[4] || ''}`);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  const t = Date.parse(v);
  if (!Number.isNaN(t)) return new Date(t);
  return null;
}

export interface NormalizeResult {
  fills: NormalizedFill[];
  errors: string[];
}

export function normalizeCsv(text: string): NormalizeResult {
  const rows = parseCsv(text);
  if (rows.length < 2) {
    return { fills: [], errors: ['File has no data rows'] };
  }

  const { map, missing } = mapColumns(rows[0]!);
  if (!map) {
    return {
      fills: [],
      errors: [
        `Could not find required column(s): ${missing.join(', ')}. ` +
          'Expected headers like Symbol, Side, Qty, Price, Time.',
      ],
    };
  }

  const fills: NormalizedFill[] = [];
  const errors: string[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]!;
    const line = i + 1;
    const symbol = (row[map.symbol] ?? '').trim().toUpperCase();
    const side = parseSide(row[map.side] ?? '');
    const quantityRaw = parseNumber(row[map.quantity] ?? '');
    const price = parseNumber(row[map.price] ?? '');
    const executedAt = parseDate(row[map.executedAt] ?? '');

    if (!symbol) { errors.push(`Line ${line}: missing symbol`); continue; }
    if (!side) { errors.push(`Line ${line}: unrecognized side "${row[map.side]}"`); continue; }
    if (quantityRaw === null || quantityRaw === 0) { errors.push(`Line ${line}: bad quantity`); continue; }
    if (price === null || price <= 0) { errors.push(`Line ${line}: bad price`); continue; }
    if (!executedAt) { errors.push(`Line ${line}: unparseable time "${row[map.executedAt]}"`); continue; }

    // Some exports encode side via signed quantity.
    const quantity = Math.abs(quantityRaw);
    const resolvedSide = quantityRaw < 0 ? 'sell' : side;

    const commission = map.commission !== null ? Math.abs(parseNumber(row[map.commission] ?? '') ?? 0) : 0;
    const fees = map.fees !== null ? Math.abs(parseNumber(row[map.fees] ?? '') ?? 0) : 0;
    const brokerId = map.externalId !== null ? (row[map.externalId] ?? '').trim() : '';

    const externalId =
      brokerId ||
      createHash('sha1')
        .update(`${symbol}|${resolvedSide}|${quantity}|${price}|${executedAt.toISOString()}`)
        .digest('hex');

    fills.push({
      symbol,
      side: resolvedSide,
      quantity,
      price,
      commission,
      fees,
      executedAt: executedAt.toISOString(),
      externalId,
    });
  }

  return { fills, errors };
}
