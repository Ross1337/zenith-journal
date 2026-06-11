//+------------------------------------------------------------------+
//|  ZenithEA.mq5 — ZENITH Trading Journal connector                 |
//|  Automatically sends closed trades to your Zenith journal.       |
//|  https://zenith.app/settings/integrations                        |
//+------------------------------------------------------------------+
#property copyright "ZENITH Trading Journal"
#property version   "1.00"
#property strict

//--- Input parameters
input string ApiEndpoint = "http://YOUR_SERVER:4000/v1/trades/ingest/mt";
input string ApiKey      = "YOUR_API_KEY";
input string AccountId   = "YOUR_ACCOUNT_UUID";

//+------------------------------------------------------------------+
//| Expert initialization                                            |
//+------------------------------------------------------------------+
int OnInit() {
   Print("ZenithEA initialised. Endpoint: ", ApiEndpoint);
   return INIT_SUCCEEDED;
}

//+------------------------------------------------------------------+
//| Trade transaction event — fires on every deal event              |
//+------------------------------------------------------------------+
void OnTradeTransaction(
   const MqlTradeTransaction& trans,
   const MqlTradeRequest&     request,
   const MqlTradeResult&      result
) {
   // Only care about deal additions (filled orders create deals).
   if (trans.type != TRADE_TRANSACTION_DEAL_ADD) return;

   ulong deal = trans.deal;
   if (!HistoryDealSelect(deal)) {
      Print("ZenithEA: HistoryDealSelect failed for deal ", deal);
      return;
   }

   // We only transmit fully closed positions.
   // Entry deals open a position; exit deals close it.
   long entryType = HistoryDealGetInteger(deal, DEAL_ENTRY);
   if (entryType != DEAL_ENTRY_OUT && entryType != DEAL_ENTRY_INOUT) return;

   ulong   position  = HistoryDealGetInteger(deal, DEAL_POSITION_ID);
   double  closePrice = HistoryDealGetDouble(deal, DEAL_PRICE);
   double  lots       = HistoryDealGetDouble(deal, DEAL_VOLUME);
   double  profit     = HistoryDealGetDouble(deal, DEAL_PROFIT);
   double  commission = HistoryDealGetDouble(deal, DEAL_COMMISSION);
   double  swap_val   = HistoryDealGetDouble(deal, DEAL_SWAP);
   string  symbol     = HistoryDealGetString(deal, DEAL_SYMBOL);
   datetime closeTime = (datetime)HistoryDealGetInteger(deal, DEAL_TIME);
   long    dealType   = HistoryDealGetInteger(deal, DEAL_TYPE);

   // Determine original direction from position history.
   HistorySelectByPosition(position);
   double  openPrice  = 0;
   datetime openTime  = 0;
   string  tradeType  = "buy";
   double  sl = 0, tp = 0;

   for (int i = 0; i < HistoryDealsTotal(); i++) {
      ulong d = HistoryDealGetTicket(i);
      if (HistoryDealGetInteger(d, DEAL_POSITION_ID) != (long)position) continue;
      if (HistoryDealGetInteger(d, DEAL_ENTRY) == DEAL_ENTRY_IN) {
         openPrice = HistoryDealGetDouble(d, DEAL_PRICE);
         openTime  = (datetime)HistoryDealGetInteger(d, DEAL_TIME);
         long dt   = HistoryDealGetInteger(d, DEAL_TYPE);
         tradeType = (dt == DEAL_TYPE_BUY) ? "buy" : "sell";
         break;
      }
   }

   if (openPrice == 0) {
      Print("ZenithEA: could not find open leg for position ", position);
      return;
   }

   // Build ISO timestamps.
   string openISO  = TimeToString(openTime,  TIME_DATE|TIME_SECONDS) + "Z";
   string closeISO = TimeToString(closeTime, TIME_DATE|TIME_SECONDS) + "Z";
   // Replace space with T for ISO 8601.
   StringReplace(openISO,  " ", "T");
   StringReplace(closeISO, " ", "T");

   // Build JSON payload.
   string json = StringFormat(
      "{\"source\":\"mt5\","
      "\"apiKey\":\"%s\","
      "\"accountId\":\"%s\","
      "\"ticket\":%I64d,"
      "\"symbol\":\"%s\","
      "\"type\":\"%s\","
      "\"openTime\":\"%s\","
      "\"closeTime\":\"%s\","
      "\"openPrice\":%.6f,"
      "\"closePrice\":%.6f,"
      "\"lots\":%.2f,"
      "\"sl\":%.6f,"
      "\"tp\":%.6f,"
      "\"commission\":%.2f,"
      "\"swap\":%.2f,"
      "\"profit\":%.2f}",
      ApiKey, AccountId, position,
      symbol, tradeType,
      openISO, closeISO,
      openPrice, closePrice, lots,
      sl, tp,
      commission, swap_val, profit
   );

   // Send HTTP POST.
   char   body[];
   char   response[];
   string responseHeaders;
   StringToCharArray(json, body, 0, StringLen(json));

   string headers = "Content-Type: application/json\r\n";
   int res = WebRequest("POST", ApiEndpoint, headers, 5000, body, response, responseHeaders);

   if (res == -1) {
      Print("ZenithEA: WebRequest error ", GetLastError(), " — check Tools > Options > Expert Advisors > Allow WebRequests");
   } else {
      string resp = CharArrayToString(response);
      Print("ZenithEA: ticket ", position, " sent. HTTP ", res, " — ", resp);
   }
}
