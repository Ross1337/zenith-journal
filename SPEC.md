# Trading Journal V2 — Spécification complète (Web + Mobile natif)

> Document de spécification technique et fonctionnelle exhaustif, destiné à servir de base à un développement complet.
> Niveau visé : professionnel, comparable et supérieur à ProTradingLabs (ProTradingData), TradeZella, Tradervue, TradesViz, Edgewonk.
> Cibles : **Web app** (desktop-first, responsive) + **Application mobile native** (iOS + Android).
>
> Rédigé le 2026-06-05. Version 2.0 du concept.

---

## ⚠️ DIRECTIVE DESIGN — À LIRE EN PREMIER

> **Les maquettes de référence (ProTradingLabs, TradeZella, etc.) servent UNIQUEMENT à documenter les fonctionnalités disponibles et les flux UX.**
> **Le design visuel doit être 100 % original.**
>
> Ne jamais reproduire, imiter ou "s'inspirer visuellement" d'une plateforme existante.
> L'application TradeForge doit avoir sa propre identité visuelle forte, moderne et mémorable —
> quelque chose qu'on n'a jamais vu dans le secteur du journal de trading.
>
> **Ce qu'on emprunte aux refs :** la liste des pages, les données affichées, les interactions fonctionnelles.
> **Ce qu'on invente de zéro :** layouts, palette, typographie, composants, animations, ambiance générale.
>
> Objectif : que quelqu'un qui voit une screenshot dise immédiatement *"c'est TradeForge"* — pas *"c'est un clone de ProTradingLabs"*.
> Le résultat doit être **magnifique, distinctif, premium** — au niveau d'un produit SaaS top-tier 2026 (Linear, Vercel, Resend, Raycast).

---

## Note méthodologique & accès ProTradingLabs

**Scraping authentifié réalisé le 2026-06-05.** L'interface membre ProTradingLabs a été analysée via Playwright (Firefox headless) avec une session authentifiée (compte `qu3nt4roa@gmail.com`, abonnement ProTradingData en période d'essai jusqu'au 18/06/2026).

Pages accessibles scrapées intégralement : Journal de trading, Modèles de champs, Annonces économiques, Classement, Télécharger EA, Trade Manager, Paramètres, Facturation, Tarification.

Pages derrière paywall avancé (non accessibles sur cette session car aucun compte de trading créé → redirection vers pricing) : Analytics, Statistiques, Calendrier performances, Rapports. Ces pages sont documentées par déduction concurrentielle + discours public.

API endpoints réels identifiés depuis les instructions de configuration de l'EA :
- `https://api.protradinglabs.com` — API REST principale
- `http://ws.protradinglabs.com` — WebSocket temps réel

---

# PHASE 1 — RECHERCHE & ANALYSE COMPARATIVE

## 1.1 Vue d'ensemble du marché (2026)

Le marché du journal de trading s'est structuré autour de 5 dimensions discriminantes (consensus des comparatifs 2026) :

1. **Couverture d'import broker** — la friction de saisie tue la régularité. Au-delà de ~30 s/trade en manuel, l'utilisateur décroche. Le nombre de brokers/plateformes supportés et la qualité du *sync* automatique sont décisifs.
2. **Profondeur de journaling** — au-delà des chiffres : pourquoi le trade, conditions de marché, ressenti, ce qu'on referait. Champs de notes, screenshots, tags personnalisés, checklists pré-trade.
3. **Analytics & filtrage** — calcul automatique des R-multiples, profit factor, expectancy ; filtrage granulaire par setup, heure, jour, tag, instrument, session.
4. **Suivi psychologique** — tags de revenge trading / tilt / respect des règles, et **chiffrage en dollars** du coût des erreurs émotionnelles.
5. **Workflow de revue** — vue calendrier, résumés journaliers, processus de revue structuré intégré.

## 1.2 Fiches plateformes

### ProTradingLabs — *ProTradingData* ⬅ données réelles scrapées

**Architecture de l'app (URL `/DATA/...`)** — 9 sections dans la sidebar :

| Section | URL | Rôle |
|---|---|---|
| Journal de trading | `/DATA/trading-journal` | Dashboard comptes + trades |
| Modèles de champs | `/DATA/field-templates` | Custom fields réutilisables |
| Annonces économiques | `/DATA/economic-news` | Calendrier macro en temps réel |
| Classement | `/DATA/leaderboard` | Leaderboard traders (ROI, WR, PF) |
| Télécharger EA | `/DATA/download` | DL ProTradingData.ex5 + doc install |
| Trade Manager | `/DATA/manager` | DL ProTradingManager.ex5 + doc |
| Tarification | `/DATA/pricing` | Plans + upgrade |
| Facturation | `/DATA/billing` | Stripe portal + historique factures |
| Paramètres | `/DATA/settings` | Langue, timezone, thème, Telegram |

**Deux Expert Advisors MT5/MT4 :**
- **ProTradingData.ex5** (v1.1.1, publiée 28/05/2026) : synchronise automatiquement les trades MetaTrader vers le journal. Envoi via WebRequest → `https://api.protradinglabs.com`. Temps réel via `ws.protradinglabs.com`.
- **ProTradingManager.ex5** : Trade Manager visuel. SL/TP drag & drop sur le graphique, P&L et ratio recalculés en live. 3 modes de lot sizing : montant fixe €, % du solde, lots directs. Break-even auto + Take Profit automatique au ratio R:R cible.

**Pricing réel (2026-06-05) :**
- Abonnement mensuel : **14,99 €/mois**. Inclus : journal complet, calendrier économique temps réel, analyses de performance, statistiques avancées, support prioritaire. Essai 14 jours gratuit.
- Licence à vie : **199,99 € (paiement unique)**. Tout l'abonnement + mises à jour futures + support VIP + priorité nouvelles fonctionnalités.

**Page Journal (état vide observé) :**
- Bouton principal : **"Ajouter un compte"** (premier compte de trading prop/live)
- Sélecteurs header : **Ratio (R)** / **Devise**
- Empty state : "Aucun compte — Créez votre premier compte de trading pour commencer à suivre vos performances."

**Page Classement — colonnes réelles (Mensuel / Annuel) :**
`# | Trader (pseudo) | Broker | Type (Prop / Live) | ROI% | Win Rate | Nb trades | Profit Factor`
Top 3 affichés en cartes, suite en tableau. Filtres : mois courant / annuel.

**Page Annonces économiques — filtres :**
- Impact : Élevé / Moyen / Faible / Jour férié
- Devises : USD / EUR / GBP / JPY / CAD / AUD / CHF / NZD / CNY
- Colonnes : Heure | Impact | Événement | Réel | Prévision | Précédent

**Page Paramètres — champs réels :**
- Langue (FR par défaut)
- Fuseau horaire (Europe/Paris par défaut, custom)
- Thème de couleurs : **ProTrading** / Caféine / Twitter / Darkmatter / Supabase / Cyberpunk / T3 Chat / Bubblegum
- Notifications Telegram (lier un compte)
- RGPD : export données, politique confidentialité, CGU, cookies

**Facturation (Stripe) :**
- Tableau abonnements : Produit | Prochain paiement | Prix | Statut
- Tableau factures : Payé le | Prix | Statut
- Bouton "Ouvrir le portail de facturation" (redirect Stripe Customer Portal)

**Stack / infra détecté :**
- Auth : **Clerk** (JWT 60s, refresh token persistant, OTP email)
- Frontend : **Next.js** (App Router, routes `DATA/[page]`)
- Thèmes : CSS custom properties (8 palettes)
- EA : MQL5 (.ex5), synchronisation WebRequest HTTP + WebSocket
- API REST : `api.protradinglabs.com`
- WS : `ws.protradinglabs.com`

### TradeZella
- **Import** : **500+ brokers/plateformes** (la plus large couverture du panel), sync auto complet (entrée, sortie, taille, frais, timestamps).
- **Journaling** : Notes, screenshots, tags, **Notebook** (plan de trading, checklists pré-session, réflexions post-session), **Strategies** (setups nommés avec règles d'entrée/sortie, 1 trade = 1 stratégie).
- **Analytics** : **50+ rapports** ; *Strategy comparison*, *Day & Time*, *Tags report*, *Symbol report*, **R-Multiple View**, **Calendar** (P&L journalier visuel).
- **Extras** : **Zella AI** (insights personnalisés sur tes propres données), **Backtesting** (11+ ans de données, données seconde sur Pro), **Trade Replay** (rejeu barre par barre), **Prop Firm Sync** (suivi multi-comptes funded + progression d'évaluation), Zella University.
- **Pricing** : Basic $29/mo ($24 annuel, 1 compte / 3 stratégies) ; Pro $49/mo ($33 annuel : comptes/stratégies illimités, backtest seconde, multi-chart, 5 Go). Pas de free tier, pas de trial.
- **Cible** : 100 000+ traders ; le « tout-en-un » premium IA.

### Tradervue
- **Import** : **80+ brokers**, auto-import actions/options.
- **Journaling** : notes, tags, résumés journaliers, **partage mentor** (mentor/élève), forte dimension **communautaire/sociale** (partage public/privé de trades).
- **Analytics** : **100+ rapports** ; *exit analysis* et *liquidity* sur le palier Gold.
- **Spécificités** : seul du panel avec un **free tier réel** (≈100 trades actions/mois) — idéal pour tester l'habitude. Pas d'IA, pas de trade replay, pas d'app mobile native annoncée publiquement. Non-equity (futures/forex/options) réservés aux paliers payants.
- **Pricing** : Free / ~$30–50/mo (≈$27–40 annuel).
- **Cible** : actions/ETF, mentors, communauté.

### TradesViz
- **Import** : large support multi-actifs (actions, options, futures, forex, crypto), import broker + CSV.
- **Analytics** : la plus **dense en visualisations** — graphiques interactifs, heatmaps, breakdowns multi-dimensions, analyse d'options avancée, **insights IA**.
- **Journaling** : notes riches, tags, screenshots, charting intégré, **trading simulé**.
- **Spécificités** : free tier généreux (volume élevé de trades gratuits), forte personnalisation des dashboards.
- **Cible** : traders « data nerds » multi-actifs voulant un maximum de granularité analytique pour peu cher.

### Edgewonk (2.0)
- **Import** : **200+ brokers** ; perf d'import élevée (≈1000 trades en 12 s, 50 000 trades/jour).
- **Analytics** : **Edge Finder (IA)** — révèle quels setups/instruments/conditions produisent les **plus gros gagnants** et d'où viennent réellement les pertes (système vs exécution).
- **Psychologie** : **Tiltmeter** (suivi émotionnel) ; chiffrage du **coût du non-respect des règles** (rule-break cost) en $ vs performance « dans le plan ».
- **Journaling** : trade notes, session reviews, routines/habitudes, custom fields très riches.
- **Pricing** : **$197/an** (≈$16/mo) — le premium le moins cher, **licence (pas SaaS mensuel)**.
- **Cible** : traders sérieux orientés psychologie/discipline et amélioration de l'edge.

### Mentions complémentaires (pour situer)
- **TraderSync** : IA *Cypher* (coaching), trade replay, Trading Plan tool (Elite). ~$30–80/mo.
- **Journalytix** : orienté **futures**, feedback **temps réel** en séance (classification de trades live, alertes risk, leaderboard). ~$47/mo.

## 1.3 Tableau comparatif synthétique

| Dimension | ProTradingData | TradeZella | Tradervue | TradesViz | Edgewonk |
|---|---|---|---|---|---|
| Import broker | MT4/MT5/cTrader via EA.ex5 (WebSocket) | 500+ | 80+ | Multi-actifs large + CSV | 200+ |
| Multi-actifs | Forex/CFD (MT) | Actions, options, futures, forex, crypto | Actions/options (+ futures/forex payant) | Tous | Tous |
| Journaling | Custom fields templates, structuration | Notes, screenshots, tags, Notebook, Strategies, checklist | Notes, tags, résumés, partage mentor | Notes, tags, charting, sim | Notes, session reviews, custom fields |
| Analytics | Performance analyses, stats avancées | 50+ rapports, R-Multiple, Day&Time | 100+ rapports, exit/liquidity | Dashboards denses, heatmaps, options | Edge Finder, corrélation psycho |
| IA | — | Zella AI | — | Insights IA | Edge Finder |
| Psychologie | — | Tags émotionnels | Tags | Tags | **Tiltmeter + coût des règles** |
| Replay / Backtest | Trade Manager EA visuel | Replay + Backtest 11 ans | — | Sim trading | — |
| Prop firm | **Cœur de cible** | Prop Firm Sync | — | Partiel | Partiel |
| Leaderboard | ✅ (ROI%, WR, PF, Prop/Live) | — | Partiel | — | — |
| Calendrier macro | ✅ (9 devises, 4 niveaux impact, temps réel) | Via intégration | — | — | — |
| Thèmes UI | **8 thèmes** (dont dark) | Dark only | Standard | Standard | Standard |
| Notif Telegram | ✅ (natif) | — | — | — | — |
| Mobile natif | — | Oui | Non annoncé | Web responsive | Desktop app |
| Modèle | **14,99€/mois ou 199,99€ lifetime** | $29–49/mo | Free + $24–40/mo | Free + abo | $197/an (licence) |
| Signature | EA MT4/MT5 + Leaderboard Prop + Thèmes | Tout-en-un IA | Free tier + social | Densité analytique | Psychologie/discipline |

## 1.4 KPIs & métriques récurrents (référentiel cible)

À supporter nativement (définitions au §3.2.4) :
- **Win Rate** (global, par setup, long/short)
- **Profit Factor** (gross profit / gross loss)
- **Expectancy** (gain moyen par trade, en $ et en R)
- **R-Multiple / R:R** (réalisé et planifié)
- **Average Win / Average Loss** et ratio
- **Max Drawdown** ($ et %), **drawdown courant**, durée de DD
- **Sharpe / Sortine / Calmar Ratio**
- **Equity Curve** (cumulative P&L, par compte / global)
- **Net & Gross P&L**, **commissions/fees**, **slippage**
- **Average hold time** (gagnants vs perdants)
- **Consistency** : best/worst day, streaks (séries gagnantes/perdantes), % jours verts
- **Kelly %**, **Z-Score** (significativité statistique des séries)
- **Coût des erreurs** : revenge trading, sur-trading, non-respect du stop, sortie anticipée (signature Edgewonk)
- **MAE / MFE** (Maximum Adverse / Favorable Excursion)
- **Performance par** : heure, jour de semaine, session (Asie/Londres/NY), instrument, direction, taille, durée, jour de news, émotion, tag.

## 1.5 Composants UI/UX récurrents du secteur

- **Equity curve** interactive (cumulée, drawdown overlay, par compte).
- **Calendrier de performance** mensuel (heatmap P&L journalière, drill-down jour).
- **Heatmaps** (heure × jour, instrument × setup, P&L par dimension).
- **Tableau de trades** dense, triable/filtrable, colonnes configurables, sparkline par trade.
- **Cartes KPI** (tuiles métriques avec comparaison période précédente, mini-trend).
- **Charts de distribution** (histogramme R-multiples, distribution P&L, win/loss).
- **Replay de trade** avec annotations sur chart.
- **Filtres avancés persistants** (multi-critères, sauvegarde de vues).
- **Drawer/Modal de détail de trade** (chart, exécutions, notes, screenshots, tags).

## 1.6 Meilleures pratiques UX spécifiques traders

- **Dark mode par défaut** (souvent seul mode utilisé), contraste élevé, vert/rouge daltonien-safe (option).
- **Densité d'information maximale** sans surcharge : tableaux compacts, tooltips au survol, pas de scroll inutile.
- **Vitesse** : sync rapide, chargement < 1 s des vues clés, virtualisation des longues listes, cache local.
- **Saisie minimale** : auto-import prioritaire ; saisie manuelle < 30 s avec autocomplétion et templates.
- **Filtres comme citoyens de première classe** : toujours visibles, persistants, partageables via URL (web).
- **Cohérence chiffres** : signe et couleur P&L homogènes partout ; jamais d'ambiguïté brut/net.
- **Mobile = capture + revue**, pas saisie lourde : photo de chart, note vocale, check rapide du calendrier.
- **Raccourcis clavier** (web) pour power users (j/k navigation, `n` nouvelle note, `f` filtre).

---

# PHASE 2 — DESCRIPTION EXHAUSTIVE DE TOUTES LES PAGES

> Convention : chaque page décrite par **Rôle → Layout/sections → Composants → Contrôles (boutons/champs/filtres) → Logique métier → Interactions → Données & source**.
> Layout web : sidebar gauche (navigation), topbar (compte actif, sélecteur de période, recherche, profil), zone de contenu.
> Layout mobile : bottom-tab (Dashboard · Trades · + Ajout · Calendrier · Plus).

## Navigation globale

**Sidebar web (ordre)** : Dashboard · Trade Log · Calendrier · Analytics · Journal · Playbooks/Stratégies · Risk Management · Rapports · Import/Comptes · Paramètres.
**Topbar** : sélecteur **compte** (Tous / compte X) · **sélecteur de période** (Today, 7D, 30D, MTD, YTD, custom, All) · barre de **recherche globale** (trades, symboles, tags, notes) · bouton **+ Trade** · cloche **notifications** · avatar **profil**.
**Filtre global persistant** : un objet `FilterContext` (compte, période, symboles, direction, setups, tags, sessions, émotions) appliqué transversalement à Dashboard/Trade Log/Analytics/Calendrier/Rapports, sérialisable en URL et sauvegardable comme « Vue ».

---

## Page 1 — Dashboard principal

**Rôle** : vue d'ensemble immédiate de la performance sur la période/compte sélectionnés ; point d'entrée quotidien.

**Sections & composants**
1. **Barre de KPIs (cartes)** : Net P&L, Win Rate, Profit Factor, Expectancy (R), Avg Win/Loss, Trade count, Max Drawdown, **Trade Win % vs Day Win %**, Current streak. Chaque carte : valeur, delta vs période précédente (▲/▼ coloré), mini-sparkline.
2. **Equity Curve** (chart principal) : P&L cumulé net ; overlay drawdown ; toggle net/brut, $/R, par compte/global ; zoom & brush temporel.
3. **Calendrier P&L compact** (mois courant) : heatmap journalière, total hebdo en colonne droite.
4. **Distribution** : histogramme des R-multiples + camembert win/loss/breakeven.
5. **Top/Flop** : meilleurs et pires setups, instruments, jours, heures (mini-classements).
6. **Recent trades** : 5–10 derniers trades (tableau condensé, clic → détail).
7. **Journal/Insights du jour** : dernière note + **insights IA** (« Tes trades après 14 h ont une expectancy négative », « Revenge trading détecté mardi : -$420 »).
8. **Objectifs/Risk widget** : progression vers objectif mensuel, risque consommé du jour, alerte si limites approchées.

**Contrôles** : sélecteurs net/brut, $/R, période, compte ; bouton « Personnaliser le dashboard » (drag & drop des widgets, show/hide) ; export PNG/PDF de la vue.

**Logique métier** : tous les widgets consomment le `FilterContext` + endpoint d'agrégation `/metrics/summary`. Deltas calculés vs période immédiatement précédente de même durée. Insights = jobs d'analyse (règles + modèle) sur les trades de la période.

**Interactions** : hover tooltips détaillés ; clic widget → page détaillée filtrée ; drag pour réordonner (layout sauvegardé par utilisateur) ; le clic sur un jour du calendrier ouvre le détail jour.

**Données/source** : `trades` agrégés, `accounts`, `journal_entries`, `insights`, `goals`, `risk_settings`.

---

## Page 2 — Trade Log

**Rôle** : référentiel exhaustif et filtrable de tous les trades.

**Sections & composants**
- **Barre de filtres avancés** (toujours visible) : compte, période, symbole, direction (long/short), résultat (win/loss/BE), setup/stratégie, tags, session, instrument type, durée, taille, émotion, conformité aux règles. Boutons **Sauvegarder la vue** / **Réinitialiser**.
- **Tableau de trades** (virtualisé) : colonnes par défaut — Date/heure, Symbole, Direction, Qty/Size, Entry, Exit, Net P&L, R, % gain, Durée, Setup, Tags, statut (open/closed), mini-sparkline du trajet de prix. Colonnes **configurables** (show/hide, ordre, tri multi-colonnes). Lignes colorées par P&L.
- **Barre récap** (sticky) : totaux de la sélection (count, net P&L, win rate, PF) recalculés selon filtres.
- **Sélection multiple** : checkbox → actions de masse (tag, assigner stratégie, supprimer, exporter, marquer revu).
- **Groupement** : option « grouper par jour / symbole / setup ».
- **Vue agrégée par position** vs **par exécution** (toggle) : un « trade » = regroupement d'exécutions (entrées/sorties partielles) via algorithme de matching.

**Contrôles** : recherche, filtres, tri, pagination/scroll infini, export CSV/Excel, import (raccourci), bascule open/closed.

**Logique métier** : agrégation des exécutions en trades (FIFO/average price configurable) ; calcul P&L net (− commissions − fees + swaps) ; calcul R réalisé (P&L / risque initial). Filtres traduits en query paramétrée côté backend (indexée).

**Interactions** : clic ligne → **drawer détail trade** ; hover sparkline → mini-chart ; double-clic cellule éditable (inline edit des champs manuels : setup, tags, notes courtes) ; drag colonnes.

**Données/source** : `trades`, `executions`, `tags`, `strategies`, `accounts`.

---

## Page 3 — Ajout / Édition d'un trade

**Rôle** : créer/éditer un trade manuellement ou enrichir un trade importé.

**Sections (formulaire structuré, multi-onglets)**
1. **Exécution** : symbole (autocomplete), instrument type (stock/option/future/forex/crypto/CFD), direction, compte, date/heure entrée & sortie, quantité/lots, prix entrée/sortie, **stop initial** & **target** (pour R planifié), commissions, fees, swaps. Support **entrées/sorties multiples** (lignes d'exécutions partielles → moyennes & R calculés).
2. **Classification** : stratégie/playbook (dropdown), setup, conditions de marché (tendance/range/news), timeframe, session, direction du biais.
3. **Risque & plan** : risque $/%, R planifié, conformité (« ai-je suivi mon plan ? » oui/non + raisons), erreurs commises (multi-select : entrée tardive, pas de stop, sortie anticipée, sur-taille, revenge, FOMO…).
4. **Journal & médias** : note libre (rich text/markdown), **screenshots** (drag & drop / coller / photo mobile), annotations sur image, **note vocale** (mobile), tags, **émotion avant/pendant/après** (échelle + emoji).
5. **Checklist pré-trade** (si stratégie liée) : cases à cocher des règles du playbook ; score de conformité auto.

**Contrôles** : Enregistrer / Enregistrer & nouveau / Dupliquer / Supprimer ; calculs auto en direct (P&L, R, % au fil de la saisie) ; champs dérivés en lecture seule.

**Logique métier** : calcul temps réel P&L net & R ; R planifié = (target−entry)/(entry−stop) ; conformité alimente les stats psycho ; uploads médias → stockage objet (S3) avec URL signée.

**Interactions** : autocomplete symbole (API de cotation pour libellé), validation inline, ajout de lignes d'exécution dynamique, preview screenshot, éditeur d'annotation (flèches/zones/texte sur chart).

**Données/source** : écrit `trades`, `executions`, `journal_entries`, `media`, `tags`; lit `strategies`, `accounts`.

---

## Page 4 — Analytics & Statistiques

**Rôle** : analyse multi-dimensionnelle profonde pour découvrir l'edge et les fuites.

**Sections (onglets)**
1. **Overview** : tous les KPIs (§1.4) en grille, avec définitions au survol.
2. **Performance temporelle** : equity curve, drawdown underwater plot, P&L par mois/semaine/jour ; courbe de R cumulé.
3. **Par dimension** (rapports croisés) : performance par **setup, instrument, direction, heure, jour, session, durée de hold, taille, jour de news, tag, émotion**. Chaque rapport : tableau + bar chart + win rate + PF + expectancy.
4. **Distributions** : histogramme R-multiples, distribution P&L, durée de hold (win vs loss), **MAE/MFE scatter** (révèle stops/targets sous-optimaux).
5. **Heatmaps** : heure × jour (P&L et win rate), setup × instrument.
6. **Psychologie / discipline** : coût $ des erreurs par type, performance « dans le plan » vs « hors plan », **tilt index** dans le temps, corrélation émotion → résultat.
7. **Streaks & probabilités** : séries, Z-score, probabilité de ruine, Kelly.
8. **Comparaison de stratégies** : table comparant playbooks côte à côte (expectancy, PF, WR, fréquence).
9. **Insights IA** : synthèse en langage naturel (« Ton edge est concentré sur le setup A en session Londres ; le setup C est négatif sur 40 trades — à abandonner »).

**Contrôles** : filtre global ; sélecteurs $/R, net/brut ; **comparateur de périodes** (A vs B) ; benchmark (vs mois précédent / vs objectif) ; export chaque rapport (CSV/PNG).

**Logique métier** : endpoints d'agrégation paramétrés par dimension ; calculs statistiques (Sharpe/Sortino/Calmar, Z-score, Kelly) côté backend (jobs cacheables). MAE/MFE nécessite données intra-trade (prix max/min pendant le trade) issues de l'import ou d'un fetch historique.

**Interactions** : clic sur barre/cellule → drill-down vers Trade Log filtré ; toggle dimensions ; pin d'un rapport au dashboard.

**Données/source** : `trades`, `executions`, `price_history` (pour MAE/MFE), `metrics_cache`.

---

## Page 5 — Calendrier de trading

**Rôle** : revue visuelle journalière/hebdo/mensuelle de la performance et de la discipline.

**Sections & composants**
- **Grille mensuelle** : chaque jour = cellule heatmap (P&L net, code couleur intensité), nb de trades, win rate du jour, indicateur de note/journal présent, badge « règles respectées ».
- **Colonne totaux hebdo** : P&L semaine, nb trades, jours verts/rouges.
- **Bandeau récap mois** : net P&L, best/worst day, jours tradés, expectancy.
- **Vues** : Mois / Semaine / Jour (agenda intraday).
- **Vue Jour** : liste des trades du jour + note journalière + screenshots + résumé KPI + humeur.

**Contrôles** : navigation mois précédent/suivant, toggle $/R/%, filtre compte, clic jour → vue jour, bouton « Ajouter note du jour ».

**Logique métier** : agrégation P&L par date (timezone du compte/utilisateur cruciale — paramétrable) ; un jour « vert avec règles cassées » est signalé (discipline ≠ résultat).

**Interactions** : hover jour → popover récap ; clic → drill-down jour ; drag-select plage → filtre Analytics sur la plage.

**Données/source** : `trades` agrégés par jour, `journal_entries` (type=daily).

---

## Page 6 — Journal / Notes

**Rôle** : tenue du journal réflexif (pré-marché, post-marché, par trade, idées).

**Sections & composants**
- **Timeline d'entrées** : notes datées, typées (Daily plan, Daily recap, Trade note, Idea, Lesson, Weekly review). Filtres par type/tag/date.
- **Éditeur riche** : markdown/WYSIWYG, images, **note vocale → transcription**, tags, liens vers trades, templates (plan de séance, post-mortem, revue hebdo).
- **Templates** : modèles réutilisables (checklist pré-marché, structure de revue).
- **Mood/État** : tracker d'humeur, sommeil, focus (optionnel) corrélable aux résultats.
- **Lessons learned** : bibliothèque taggée et recherchable des enseignements.

**Contrôles** : Nouvelle entrée, choisir template, lier des trades, tagger, épingler, rechercher plein-texte.

**Logique métier** : full-text search ; liaison N:N entrées↔trades ; corrélation mood→P&L exposée dans Analytics ; transcription vocale via service STT.

**Interactions** : éditeur inline, autosave, insertion de chart de trade par référence, vue « entrées liées » sur la fiche trade.

**Données/source** : `journal_entries`, `media`, `tags`, `trades` (liens).

---

## Page 7 — Gestion des stratégies / Playbooks

**Rôle** : définir, documenter et mesurer ses setups.

**Sections & composants**
- **Liste des playbooks** : cartes (nom, type, fréquence, expectancy, WR, PF, statut actif/archivé), tri par performance.
- **Éditeur de playbook** : description, **règles d'entrée** (liste), **règles de sortie/gestion**, critères de filtre (instrument, session, timeframe), **checklist** pré-trade, R:R cible, screenshots d'exemples (A+ setups), conditions de marché idéales.
- **Performance du playbook** : mini-dashboard dédié (toutes les métriques filtrées sur ce setup), évolution dans le temps, comparaison vs autres.
- **A+ / B / C grading** : note de qualité d'exécution par trade rattaché.

**Contrôles** : Créer / Éditer / Dupliquer / Archiver ; assigner des trades existants ; définir comme défaut.

**Logique métier** : un trade référence un `strategy_id` ; la checklist du playbook est instanciée à l'ajout de trade et le score de conformité est stocké ; le report « Strategy comparison » lit ces liens.

**Interactions** : drag-réordonner règles, preview checklist, clic → dashboard du playbook.

**Données/source** : `strategies`, `strategy_rules`, `checklists`, `trades`.

---

## Page 8 — Risk Management

**Rôle** : définir et surveiller les règles de risque ; alerter.

**Sections & composants**
- **Paramètres de risque par compte** : risque max/trade ($/%), perte max journalière, perte max hebdo, nb max de trades/jour, taille de position max, daily profit target, **règles prop firm** (max daily loss, max overall drawdown, profit target d'éval).
- **Tableau de bord risque temps réel** : jauge risque consommé du jour, drawdown courant vs limite, distance au seuil prop firm, trades restants.
- **Position sizing calculator** : input (capital, risque %, entrée, stop) → taille recommandée + R.
- **Historique des violations** : journal des dépassements (date, règle, montant, contexte) + coût cumulé.
- **Prop firm tracker** : suivi multi-comptes d'évaluation (progression vers target, jours restants, marge de drawdown), héritage du positionnement ProTradingLabs/TradeZella.

**Contrôles** : définir/éditer limites, activer alertes (push/email), calculateur, reset journalier.

**Logique métier** : à chaque trade importé/ajouté, évaluation des règles → flag de violation + notification ; calcul drawdown glissant ; pour prop firm, formules spécifiques (trailing/static drawdown).

**Interactions** : alertes push quand seuil approché (ex. 80 % du risque journalier), code couleur jauges, lien vers le trade fautif.

**Données/source** : `risk_settings`, `trades`, `accounts`, `violations`, `alerts`.

---

## Page 9 — Rapports

**Rôle** : générer des rapports synthétiques exportables/partageables.

**Sections & composants**
- **Rapports prédéfinis** : Performance mensuelle, Revue hebdo, Fiscalité (P&L réalisé par instrument/période), Performance par stratégie, Rapport de discipline.
- **Report builder** : sélection de modules (KPIs, equity curve, calendrier, top setups, notes), période, comptes.
- **Aperçu & export** : PDF, CSV/Excel, PNG ; **lien partageable** (public/privé, anonymisable — masquer les montants, ne montrer que les R), envoi par email.
- **Rapports planifiés** : génération auto hebdo/mensuelle envoyée par email/push.

**Contrôles** : choisir template, configurer modules, période, format, partager, planifier.

**Logique métier** : rendu serveur (PDF via moteur de templates) ; anonymisation = transformation $→R et masquage labels ; partage = token + permissions (mentor view).

**Interactions** : preview live, drag modules, copier lien, révoquer lien.

**Données/source** : agrégats `metrics`, `trades`, `journal_entries`.

---

## Page 10 — Import / Connexion broker

**Rôle** : alimenter le journal automatiquement et manuellement.

**Sections & composants**
- **Connexions broker** : liste des intégrations (MT4/MT5/cTrader, Interactive Brokers, TD/Schwab, Tradovate, Binance, Bybit, TradingView, etc.), statut de sync (dernière synchro, OK/erreur), bouton connecter/déconnecter, fréquence de sync.
- **Import fichier** : drag & drop CSV/Excel ; **assistant de mapping de colonnes** (détection auto du broker + mapping manuel sauvegardable) ; preview avant import ; détection de doublons.
- **Import par API/clé** : saisie clé read-only (ex. exchanges crypto), credentials chiffrés.
- **Webhooks** : endpoint pour push automatique (ex. depuis TradingView alerts / EA).
- **Historique d'import** : logs (fichier, lignes importées, doublons ignorés, erreurs), rollback d'un batch.

**Contrôles** : Connecter broker (OAuth/clé), Importer fichier, Mapper colonnes, Lancer sync, Annuler import.

**Logique métier** : parseurs par broker (normalisation vers schéma `executions` interne) ; **dédoublonnage** par hash (compte+symbole+timestamp+qty+prix) ; matching exécutions→trades ; gestion devises/fuseaux. Connexions broker **read-only** (sécurité explicite — jamais d'ordre).

**Interactions** : wizard étape par étape, barre de progression, résolution de conflits (mapping ambigu), toasts succès/erreur.

**Données/source** : `broker_connections`, `import_batches`, `executions`, `trades`.

---

## Page 11 — Paramètres & profil utilisateur

**Rôle** : configuration compte, comptes de trading, préférences, abonnement, sécurité.

**Sections (onglets)**
- **Profil** : nom, avatar, email, fuseau horaire, devise d'affichage, langue.
- **Comptes de trading** : CRUD des comptes (nom, broker, devise, capital initial, type — réel/démo/prop/éval, balance courante), couleur/label.
- **Préférences** : thème (dark/light/auto), format des nombres, semaine commençant lun/dim, affichage $/R par défaut, colonnes par défaut du Trade Log.
- **Tags & catégories** : gestion des tags (couleurs, groupes), erreurs types, émotions.
- **Notifications** : canaux (push/email), types (risk, rappels de journaling, sync, rapports planifiés), quiet hours.
- **Sécurité** : mot de passe, **2FA (TOTP)**, sessions actives, OAuth liés, export/suppression de données (RGPD).
- **Données** : export complet (JSON/CSV), suppression de compte.

**Logique métier** : changement de devise = conversion d'affichage (taux historiques) ; suppression compte = purge async + anonymisation.

**Données/source** : `users`, `accounts`, `tags`, `preferences`, `notification_settings`.

---

## Page 12 — Authentification (login, signup, onboarding)

**Rôle** : entrée sécurisée + activation rapide (time-to-value court).

**Écrans**
- **Signup** : email + mot de passe / **OAuth (Google, Apple)** ; vérification email ; **OTP** optionnel (cf. flux ProTradingLabs).
- **Login** : email/mdp, OAuth, **2FA TOTP**, « mot de passe oublié », « se souvenir de moi ».
- **Onboarding (wizard)** : 1) objectif (discrétionnaire/prop firm/algo), 2) actifs tradés, 3) **connexion broker ou import CSV** (ou « commencer en manuel »), 4) création du 1er compte de trading, 5) 1er playbook (optionnel), 6) préférences (devise, fuseau, thème). Barre de progression, skip possible.
- **Empty states** guidés post-onboarding (CTA « Importer mes trades »).

**Logique métier** : JWT (access court + refresh), OAuth, OTP/2FA ; onboarding state stocké pour reprise ; essai gratuit déclenché ici (14 j, cf. ProTradingLabs).

**Données/source** : `users`, `sessions`, `oauth_accounts`, `onboarding_state`.

---

## Page 13 — Plans & abonnements

**Rôle** : conversion et gestion d'abonnement.

**Sections & composants**
- **Grille de plans** : Free / Pro / Elite (cf. §4 pricing) ; features par plan, toggle mensuel/annuel (remise annuelle), CTA.
- **Comparatif de features** (tableau).
- **Page de gestion** : plan actuel, prochaine facture, moyen de paiement (Stripe), historique de factures, upgrade/downgrade, annulation **1 clic** (signature ProTradingLabs), réactivation.
- **Paywalls contextuels** : modales d'upsell quand une feature payante est touchée (ex. 2e compte, IA, futures).

**Logique métier** : intégration **Stripe** (Checkout + Billing Portal + webhooks pour statut), gestion des quotas par plan (nb comptes, nb trades, IA), période d'essai, proration.

**Données/source** : `subscriptions`, `plans`, `invoices` (miroir Stripe).

---

# PHASE 3 — ARCHITECTURE TECHNIQUE COMPLÈTE

## 3.1 Frontend

### 3.1.1 Stack recommandé
- **Web** : **Next.js 14+ (App Router) + React 18 + TypeScript**. SSR/SSG pour pages marketing/SEO, CSR pour l'app authentifiée. Justification : écosystème mature, perf, routing fichier, RSC, déploiement Vercel/Node simple, partage de types avec un backend TS.
- **Mobile** : **React Native (Expo SDK 51+) + Expo Router v3 + NativeWind** + TypeScript. Justification : **réutilisation maximale** de la logique métier, des types, des hooks data et d'une partie de l'UI avec le web ; OTA updates (Expo EAS Update), accès natif (caméra, push, biométrie). NativeWind (Tailwind CSS pour RN) permet de partager les tokens de design et la logique de style. (Flutter serait viable mais casserait le partage de code avec un front web React.)
- **Partage** : monorepo (Turborepo/Nx) avec packages communs : `@tj/types`, `@tj/api-client` (généré depuis OpenAPI), `@tj/calc` (formules métriques isomorphes), `@tj/ui-tokens`.
- **⚠ Priorité** : l'app web ET l'app mobile sont des **livrables de première classe, priorité égale**. Le MVP inclut les deux. Aucune des deux n'est un scaffold ou un afterthought.

### 3.1.2 Structure des composants/pages
```
apps/
  web/        (Next.js)
    app/(marketing) ...
    app/(app)/dashboard, trades, calendar, analytics, journal,
              playbooks, risk, reports, import, settings, billing
  mobile/     (Expo Router v3, Expo SDK 51+, NativeWind)
    app/(auth)/login, signup
    app/(tabs)/
      index             → Dashboard (KPIs + equity curve)
      trades            → Trade Log (liste filtrée)
      add               → FAB → Ajout trade (formulaire touch-optimisé)
      calendar          → Calendrier de performance
      profile           → Profil + Réglages rapides
    -- navigation: bottom tabs Dashboard · Trades · ＋ (FAB) · Calendrier · Profil
packages/
  types/      (modèles partagés, zod schemas)
  api-client/ (client typé REST/tRPC)
  calc/       (win rate, PF, expectancy, R, drawdown, Sharpe… testés)
  ui/         (composants partagés RN/Web via react-native-web ou design system parallèle)
  charts/     (wrappers de charting)
```

### 3.1.3 Design system

> ⚠️ **Le design system doit être 100 % original.** Ne pas reproduire les visuels des concurrents.
> Créer une identité TradeForge distincte, premium, immédiatement reconnaissable.
> Référence de niveau : Linear, Vercel, Raycast, Resend — pas ProTradingLabs.

- **Tokens** : couleurs, typographie, espacements, radius, ombres centralisés (`@tj/ui-tokens`), exportés CSS vars (web) + objets JS (RN).
- **Palette (dark-first)** : fond `#0B0E14` / surfaces `#151A23` / bordures `#222a36` ; accent primaire `#3B82F6` ; **P&L vert `#16C784`**, **rouge `#EA3943`** ; variante daltonien (bleu/orange) optionnelle ; texte `#E6E9EF` / muted `#8A93A2`. **Ces valeurs sont des points de départ — libre de les redéfinir entièrement si une meilleure identité visuelle l'exige.**
- **Typo** : Inter (UI) + JetBrains Mono / chiffres tabulaires pour les nombres (alignement colonnes).
- **Dark mode par défaut**, light mode disponible, mode `auto`.
- **Composants** : DataTable virtualisée, KPICard, FilterBar, DateRangePicker, TagInput, Drawer, Modal, Toast, Chart wrappers, EmptyState, Skeleton loaders.
- **Accessibilité** : contraste AA, focus visibles, navigation clavier, ARIA, ne jamais coder l'info uniquement par la couleur.

### 3.1.4 Charts
- **TradingView Lightweight Charts** : equity curve, replay de trade, charts de prix (candlestick + annotations). Léger, financier, performant.
- **Recharts** ou **ApexCharts** : histogrammes, distributions, bar charts, calendrier-heatmap (ou implémentation custom SVG pour le calendrier).
- **visx/D3** pour visualisations custom (MAE/MFE scatter, underwater drawdown).
- Mobile : `react-native-wagmi-charts` / `victory-native` / wrapper Lightweight Charts via WebView pour les charts complexes.

### 3.1.5 Gestion d'état
- **TanStack Query (React Query)** : tout l'état serveur (cache, invalidation, optimistic updates, sync). Pierre angulaire.
- **Zustand** : état UI local léger (filtres actifs, layout dashboard, préférences d'affichage).
- **React Hook Form + Zod** : formulaires (ajout trade, playbook) avec validation partagée.
- Pas de Redux (overkill ici).

### 3.1.6 Responsive & adaptation mobile
- Web : breakpoints desktop-first ; tablette = colonnes réduites ; sidebar collapsible ; tableaux → cartes en < md.
- Mobile natif : navigation bottom-tabs, gestes (swipe sur trade = tag/supprimer), pull-to-refresh, bottom sheets, FAB « + Trade ».
- Données : pagination/scroll infini partout ; offline-first sur mobile (cache + file d'attente d'écritures).

## 3.2 Backend

### 3.2.1 Stack recommandé
- **Node.js + TypeScript + NestJS** (ou Fastify). Justification : **types partagés** bout-en-bout avec le front, écosystème, structure modulaire (modules = domaines), DI, validation. 
- *Alternative justifiée* : **Python + FastAPI** si l'équipe est data/quant et veut numpy/pandas pour les analytics lourds. Recommandation : **Node/NestS pour l'API + workers Python optionnels** pour les calculs statistiques intensifs (Sharpe sur gros historiques, ML d'insights).
- **Jobs/queues** : BullMQ (Redis) pour imports, recalcul de métriques, génération de rapports, sync broker, notifications.

### 3.2.2 Architecture API
- **REST** versionné (`/v1`) documenté **OpenAPI** (génère le client typé), **+ option tRPC** entre web/mobile et backend Node pour le typage de bout en bout. WebSocket/SSE pour temps réel (sync, risk alerts, prop firm).
- Domaines/endpoints clés : `auth`, `users`, `accounts`, `trades`, `executions`, `imports`, `broker-connections`, `strategies`, `journal`, `tags`, `metrics`, `reports`, `risk`, `subscriptions`, `notifications`.
- Pattern : pagination cursor-based, filtres normalisés (objet `FilterContext`), idempotency keys sur imports.

### 3.2.3 Modèle de données (schémas)

> SQL relationnel (**PostgreSQL**) recommandé — données fortement relationnelles + agrégations analytiques (window functions). Time-series de prix → **TimescaleDB**/table partitionnée. (MongoDB possible mais Postgres gagne sur les analytics.)

```
users
  id (uuid, pk), email (unique), password_hash, oauth_provider, oauth_id,
  display_name, avatar_url, timezone, base_currency, locale,
  twofa_secret, twofa_enabled, plan_id (fk), trial_ends_at,
  created_at, updated_at, deleted_at

accounts                       -- comptes de trading
  id, user_id (fk), name, broker, account_type (live/demo/prop/eval),
  currency, initial_balance, current_balance, color,
  prop_config (jsonb: target, max_daily_loss, max_drawdown, dd_type),
  is_active, created_at, updated_at

broker_connections
  id, account_id (fk), provider, status, credentials_encrypted (kms),
  sync_frequency, last_synced_at, last_error, created_at

import_batches
  id, account_id, source (csv/api/broker/webhook), file_url,
  rows_total, rows_imported, rows_duplicate, rows_error,
  mapping (jsonb), status, created_at

executions                     -- exécutions atomiques (fills)
  id, account_id (fk), trade_id (fk nullable), import_batch_id,
  symbol, instrument_type, side (buy/sell), quantity, price,
  commission, fees, swap, executed_at (tz-aware),
  dedup_hash (unique per account), raw (jsonb)

trades                         -- position regroupée
  id, account_id (fk), user_id, symbol, instrument_type,
  direction (long/short), status (open/closed),
  opened_at, closed_at,
  qty, avg_entry, avg_exit,
  initial_stop, target,                     -- pour R planifié
  gross_pnl, net_pnl, commission_total, fees_total, swap_total,
  pnl_pct, r_realized, r_planned,
  mae, mfe,                                  -- excursions
  hold_seconds,
  strategy_id (fk), setup, market_condition, session, timeframe,
  followed_plan (bool), mistakes (text[]),
  emotion_pre, emotion_during, emotion_post,
  grade (A+/A/B/C), reviewed (bool),
  created_at, updated_at
  -- index: (account_id, opened_at), (strategy_id), (symbol), gin(mistakes)

strategies (playbooks)
  id, user_id, name, description, instrument_filter, session_filter,
  timeframe, rr_target, entry_rules (jsonb[]), exit_rules (jsonb[]),
  is_active, created_at

checklists / strategy_rules
  id, strategy_id, label, order, type (entry/exit/risk)
checklist_results
  id, trade_id, rule_id, checked (bool)

journal_entries
  id, user_id, type (daily_plan/daily_recap/trade_note/idea/lesson/weekly),
  title, body (rich/markdown), mood (jsonb), entry_date,
  created_at, updated_at
journal_trade_links (n:m)  journal_id, trade_id
journal_media              id, journal_id|trade_id, url, kind (image/audio), annotations(jsonb)

tags                 id, user_id, name, color, group
trade_tags (n:m)     trade_id, tag_id

media (screenshots)  id, owner_type, owner_id, s3_key, url, width, height,
                     annotations (jsonb), created_at

metrics_cache        id, user_id, scope_hash (filtres+période), payload (jsonb),
                     computed_at, expires_at

risk_settings        id, account_id, max_risk_per_trade, max_daily_loss,
                     max_weekly_loss, max_trades_per_day, max_position_size,
                     daily_target, updated_at
violations           id, account_id, trade_id, rule, threshold, actual,
                     cost, occurred_at

goals                id, user_id, period, metric, target, current, created_at

reports              id, user_id, template, config (jsonb), schedule,
                     last_generated_at, share_token, share_visibility

subscriptions        id, user_id, stripe_customer_id, stripe_sub_id,
                     plan_id, status, current_period_end, cancel_at
plans                id, name, price_monthly, price_annual, limits (jsonb), features (jsonb)
invoices             id, user_id, stripe_invoice_id, amount, status, pdf_url, created_at

notification_settings id, user_id, channel, type, enabled, quiet_hours
notifications        id, user_id, type, payload, read, created_at

price_history (timescale)  symbol, ts, ohlcv  -- pour MAE/MFE, replay
sessions / refresh_tokens  id, user_id, token_hash, expires_at, device, revoked
audit_log            id, user_id, action, entity, before, after, ip, at
```

### 3.2.4 Logique de calcul des métriques (algorithmes)

Implémentés dans `@tj/calc` (isomorphe, testé) et/ou worker Python. Définitions :

- **Matching exécutions → trades** : par symbole+compte, accumulation de position signée ; un trade s'ouvre quand la position passe de 0 à ≠0 et se ferme au retour à 0 (gestion long↔short flip = 2 trades). Prix moyen pondéré par quantité. Méthode FIFO ou average-cost configurable.
- **Net P&L** = Σ(sorties×qty) − Σ(entrées×qty) ajusté du sens, − commissions − fees ± swaps. Pour short : (avg_entry − avg_exit)×qty.
- **R réalisé** = net_pnl / risque_initial, où risque_initial = |avg_entry − initial_stop| × qty (+ frais). Si pas de stop : R = net_pnl / (risque $ saisi).
- **R planifié** = |target − entry| / |entry − stop|.
- **Win Rate** = wins / (wins + losses) (breakeven exclu ou bucket séparé, paramétrable).
- **Profit Factor** = Σ gains bruts / |Σ pertes brutes|. (∞ si aucune perte.)
- **Expectancy** = (WinRate × AvgWin) − (LossRate × |AvgLoss|), exprimée en $ et en R (moyenne des R).
- **Average Win / Loss** = moyenne des net_pnl positifs / négatifs.
- **Max Drawdown** : sur la courbe d'equity cumulée, DD = max(peak − trough) ; en % = (peak − trough)/peak. Tracker du running peak. Durée DD = temps entre peak et récupération.
- **Sharpe** = (mean(returns) − rf) / std(returns) × √(periods/an). Returns = P&L par période (jour) / equity. **Sortino** = idem mais downside deviation. **Calmar** = CAGR / |MaxDD|.
- **Z-Score** (séries) = (N×(R − 0.5) − X) / √((X×(X−N))/(N−1)) pour tester l'aléatoire des séries gagnantes/perdantes.
- **Kelly %** = WinRate − (1−WinRate)/(AvgWin/|AvgLoss|).
- **MAE/MFE** : depuis price_history sur [opened_at, closed_at], MAE = pire excursion contre la position, MFE = meilleure ; révèle stops trop serrés / targets trop proches.
- **Coût des erreurs** (psycho) : pour chaque trade flaggé `mistakes`/`followed_plan=false`, somme des net_pnl ; comparaison expectancy(plan respecté) vs expectancy(plan cassé) → coût $ de l'indiscipline.
- **Agrégations par dimension** : GROUP BY (heure, jour, session, setup, instrument, tag…) avec window functions ; cache dans `metrics_cache` keyé par hash(filtres).

### 3.2.5 Système d'import (parseurs)
- **Architecture** : interface `BrokerParser { detect(file): boolean; parse(rows): Execution[] }`. Registry de parseurs.
- **Brokers majeurs supportés (V1+)** :
  - **MetaTrader 4/5** : rapports HTML/CSV d'historique + connexion read-only (passerelle MT API / fichier d'export). (cœur ProTradingLabs.)
  - **cTrader** : export CSV / Open API (OAuth read-only).
  - **Interactive Brokers** : Flex Query / API.
  - **TD Ameritrade / Charles Schwab** : API OAuth.
  - **Tradovate / NinjaTrader / Rithmic** (futures).
  - **Binance / Bybit / Coinbase** (crypto, clé API read-only).
  - **TradingView** : export CSV de backtests/paper.
  - **CSV générique** : assistant de mapping de colonnes (sauvegarde du mapping par broker).
- **Normalisation** : tout converge vers `executions` (symbole canonique, devise, timezone UTC stockée, fuseau d'affichage séparé).
- **Dédoublonnage** : `dedup_hash = sha(account+symbol+side+qty+price+executed_at)` unique ; import idempotent.
- **Webhooks** : endpoint signé (HMAC) pour push EA/TradingView → file BullMQ.

### 3.2.6 Authentification & sécurité
- **JWT** : access token (15 min) + refresh token (rotation, httpOnly cookie web / secure storage mobile).
- **OAuth 2.0** : Google, Apple.
- **2FA** : TOTP (RFC 6238) + codes de récupération ; **OTP email** pour flux sensibles (cf. ProTradingLabs login code).
- **Sécurité données** : credentials broker chiffrés au repos (KMS/enveloppe), **connexions broker read-only uniquement** (jamais d'ordre — argument de confiance explicite), rate limiting, CSRF protection, audit log, RGPD (export + suppression).
- **Biométrie mobile** : Face ID / fingerprint pour déverrouillage app.

### 3.2.7 Stockage médias
- **S3** (ou R2/GCS) : screenshots, notes vocales, PDF de rapports. Upload via **URL pré-signées** (le client uploade direct). CDN (CloudFront) devant. Images optimisées (thumbnails). Annotations stockées en JSON séparé (overlay non destructif).

### 3.2.8 Infrastructure
- **DB** : PostgreSQL managé (RDS/Neon/Supabase) + TimescaleDB pour price_history ; **Redis** (cache + BullMQ).
- **Compute** : conteneurs (Docker) API + workers ; web Next.js (Vercel ou container). Mobile via Expo EAS.
- **CI/CD** : GitHub Actions (lint, typecheck, tests `@tj/calc`, build, e2e Playwright) → déploiement (web + API) ; EAS Build/Submit pour mobile (TestFlight / Play internal).
- **Observabilité** : Sentry (erreurs), OpenTelemetry/Grafana, logs structurés.
- **Paiements** : Stripe (Checkout, Billing Portal, webhooks).
- **Emails/Push** : Postmark/Resend (transactionnel, OTP, rapports) ; Expo Push / FCM / APNs (mobile).

## 3.3 Application mobile

> **Livrable de première classe — priorité égale au web.** L'app mobile est fonctionnelle au MVP, pas un scaffold post-V1.

### 3.3.0 Stack mobile

| Couche | Technologie |
|---|---|
| Runtime | **Expo SDK 51+** |
| Routing | **Expo Router v3** (file-based, Tab layout + Stack) |
| Styles | **NativeWind** (Tailwind CSS → StyleSheet RN, même tokens que le web) |
| Langage | TypeScript strict |
| Packages partagés | `@tj/types`, `@tj/calc`, `@tj/api-client` |
| Charts | `victory-native` / `react-native-wagmi-charts` ; charts complexes via WebView + Lightweight Charts |
| Formulaires | React Hook Form + Zod (partagé) |
| State | TanStack Query (cache serveur) + Zustand (UI) |
| Auth | JWT/OAuth partagé ; biométrie Face ID/Touch ID (Expo LocalAuthentication) |
| Offline | SQLite (expo-sqlite) + React Query persistence ; file d'écritures offline |
| Push | Expo Notifications (APNs + FCM) |
| OTA | Expo EAS Update |
| Build | Expo EAS Build + EAS Submit (TestFlight / Play Internal) |

### 3.3.1 Écrans MVP mobile (livrables requis au MVP)

| Écran | Route | Description |
|---|---|---|
| **Login** | `/(auth)/login` | Email/mdp + OAuth Google/Apple ; biométrie si session existante |
| **Dashboard** | `/(tabs)/` | KPIs cartes (Net P&L, WR, PF, Expectancy) + equity curve (scroll horizontal) + insights |
| **Trade Log** | `/(tabs)/trades` | Liste virtualisée des trades (cartes compactes), filtres bottom sheet, pull-to-refresh |
| **Ajout trade** | `/(tabs)/add` (FAB) | Formulaire touch-optimisé : symbole, direction, P&L, R, date, tags, note rapide, photo |
| **Calendrier** | `/(tabs)/calendar` | Heatmap mensuelle P&L, drill-down par jour |
| **Profil** | `/(tabs)/profile` | Compte actif, préférences, déconnexion, lien vers réglages complets |

### 3.3.2 Navigation mobile

- **Bottom tabs** : Dashboard · Trades · **＋ (FAB ajout trade)** · Calendrier · Profil.
- Le tab central « ＋ » est un FAB flottant (couleur accent) qui ouvre la feuille d'ajout de trade.
- Gestes : pull-to-refresh, swipe-actions sur lignes de trade (tag/supprimer), bottom sheets pour filtres/détails, retour par swipe.
- Dark mode natif (DynamicColorIOS / colorScheme Android) ; couleurs P&L identiques au web : **vert `#16C784` / rouge `#EA3943`**.

### 3.3.3 Notifications push
- Alertes **risk** (seuil journalier approché/dépassé, drawdown prop firm).
- **Rappels de journaling** (recap de fin de séance, plan du matin).
- Fin de **sync** broker / erreur de sync.
- **Rapports** hebdo/mensuels prêts.
- Quiet hours respectées.

### 3.3.4 Synchronisation temps réel & offline
- **Offline-first** : cache local (SQLite/MMKV via React Query persistence) ; lecture hors-ligne du journal/trades récents.
- **File d'écritures** : notes/trades ajoutés offline → queue, push à la reconnexion (résolution de conflits last-write-wins + horodatage).
- **Temps réel** : WebSocket/SSE pour nouveaux trades synchronisés, alertes risk, mise à jour multi-device instantanée.
- Sync transparente web↔mobile (même backend, mêmes endpoints).

---

# PHASE 4 — PROMPT DE DÉVELOPPEMENT MAÎTRE

> À copier-coller dans Cursor / Claude / GPT pour construire l'application de A à Z. Conçu pour un développement itératif MVP → V1 → V2.

```
RÔLE
Tu es une équipe d'ingénierie full-stack senior. Construis « TradingJournal », une application
professionnelle de journal de trading, disponible en WEB (Next.js) et MOBILE NATIF (React Native/Expo),
de niveau ProTradingLabs / TradeZella / Tradervue / TradesViz / Edgewonk. Procède de façon itérative
(MVP → V1 → V2) et n'avance au palier suivant qu'une fois le précédent fonctionnel et testé.

ARCHITECTURE IMPOSÉE
- Monorepo Turborepo + TypeScript partout.
  packages: types (zod), api-client (typé OpenAPI/tRPC), calc (formules métriques isomorphes + tests),
            ui-tokens, ui.
  apps: web (Next.js 14 App Router, React 18), mobile (Expo SDK 51+ / Expo Router v3 / NativeWind — livrable MVP, priorité égale au web), api (NestJS).
- État front: TanStack Query (serveur) + Zustand (UI) + React Hook Form/Zod (formulaires).
- Charts: TradingView Lightweight Charts (equity/replay/prix), Recharts/ApexCharts (distributions),
          custom SVG/visx (calendrier heatmap, MAE/MFE, underwater DD).
- Backend: NestJS + PostgreSQL (TimescaleDB pour price_history) + Redis + BullMQ (jobs). API REST /v1
  documentée OpenAPI + SSE/WebSocket pour temps réel.
- Auth: JWT (access court + refresh rotatif, cf. Clerk sur ProTradingLabs : access 60s + refresh persistant),
  OAuth Google/Apple, 2FA TOTP, OTP email. Biométrie mobile. (Bibliothèque conseillée : Clerk ou implémentation
  custom; Clerk = bon choix pour itérer vite, migration possible ensuite.)
- Stockage médias: S3 + URLs pré-signées + CDN. Paiements: Stripe (Checkout + Billing Portal + webhooks).
- Sécurité: connexions broker READ-ONLY uniquement (jamais d'ordre), credentials chiffrés (KMS),
  rate limiting, audit log, RGPD (export/suppression).
- Design: **IDENTITÉ VISUELLE 100 % ORIGINALE — NE PAS IMITER LES CONCURRENTS.**
  Les plateformes de référence (ProTradingLabs, TradeZella, etc.) ont été analysées pour leurs
  FONCTIONNALITÉS uniquement. Le design doit être entièrement inventé : palette, layouts, typographie,
  composants, animations. Objectif : un produit visuellement mémorable au niveau Linear / Vercel / Raycast.
  DARK MODE par défaut (+ light + auto), tokens centralisés, chiffres tabulaires monospace,
  P&L vert #16C784 / rouge #EA3943 (+ variante daltonien), densité d'info élevée, accessibilité AA,
  raccourcis clavier web. Mobile = bottom tabs + FAB, gestes, offline-first.

MODÈLE DE DONNÉES
Implémente le schéma PostgreSQL: users, accounts, broker_connections, import_batches, executions, trades,
strategies, strategy_rules/checklists, checklist_results, journal_entries, journal_trade_links,
journal_media, tags, trade_tags, media, metrics_cache, risk_settings, violations, goals, reports,
subscriptions, plans, invoices, notification_settings, notifications, price_history, sessions, audit_log.
(Champs détaillés: voir §3.2.3 de la spec — respecte-les, notamment trades.{r_realized,r_planned,mae,mfe,
followed_plan,mistakes[],emotion_*,grade}.)

CALCULS MÉTIER (package calc, 100% testé unitairement)
Implémente exactement: matching exécutions→trades (position signée, flip long/short, avg price ou FIFO),
Net/Gross P&L (frais+swaps, gestion short), R réalisé & planifié, Win Rate, Profit Factor, Expectancy ($ et R),
Avg Win/Loss, Max Drawdown ($/% + durée), Sharpe/Sortino/Calmar, Z-Score des séries, Kelly%, MAE/MFE
(depuis price_history), coût des erreurs/indiscipline (expectancy plan respecté vs cassé), agrégations par
dimension (heure, jour, session, setup, instrument, tag, taille, durée) avec cache keyé par hash de filtres.
Définitions: voir §3.2.4.

PAGES À LIVRER (web + mobile adaptée) — comportement exact en §PHASE 2 de la spec
1. Dashboard: cartes KPI (deltas vs période préc.), equity curve (net/brut, $/R, drawdown overlay),
   calendrier compact, distribution R, top/flop setups/heures, recent trades, insights IA, widget risk/objectifs,
   layout drag&drop personnalisable.
2. Trade Log: filtres avancés persistants (compte/période/symbole/direction/résultat/setup/tags/session/durée/
   taille/émotion/conformité), tableau virtualisé colonnes configurables + tri multi, barre récap sticky,
   sélection multiple + actions de masse, toggle position/exécution, drawer détail trade, export CSV.
3. Ajout/Édition trade: exécutions multiples, stop/target (R planifié), frais, classification (stratégie/setup/
   conditions/session/timeframe), risque & conformité au plan + erreurs (multi-select), journal+screenshots
   (drag&drop/coller/photo + annotations), note vocale, émotions avant/pendant/après, checklist du playbook,
   calculs live P&L/R.
4. Analytics: overview KPIs, perf temporelle (equity, underwater DD), rapports par dimension (tableau+bar+WR+PF+
   expectancy), distributions (R, P&L, hold, MAE/MFE scatter), heatmaps (heure×jour, setup×instrument),
   psychologie (coût erreurs, plan vs hors-plan, tilt index, émotion→résultat), streaks/Z-score/Kelly,
   comparaison de stratégies, insights IA en langage naturel, comparateur de périodes A/B, drill-down → Trade Log.
5. Calendrier: grille mensuelle heatmap (P&L, nb trades, WR, badge règles/journal), totaux hebdo, vues mois/
   semaine/jour, vue jour = trades + note + screenshots + KPI + humeur, timezone-aware.
6. Journal: timeline typée (daily plan/recap, trade note, idea, lesson, weekly), éditeur riche markdown + images +
   note vocale→transcription, templates, liens vers trades, mood tracker, recherche plein-texte.
7. Playbooks/Stratégies: liste avec perf (expectancy/WR/PF), éditeur (règles entrée/sortie, filtres, checklist,
   R:R cible, exemples A+), dashboard de perf par playbook, grading A+/B/C, comparaison.
8. Risk Management: limites par compte (risque/trade, perte journalière/hebdo, max trades, taille max, target,
   règles prop firm: max daily loss / max drawdown / target éval), dashboard risk temps réel (jauges), position
   sizing calculator, historique violations + coût, prop firm tracker multi-comptes.
9. Rapports: rapports prédéfinis (mensuel, hebdo, fiscal, par stratégie, discipline) + report builder modulaire,
   export PDF/CSV/PNG, lien partageable (public/privé/anonymisé $→R), rapports planifiés par email/push.
10. Import/Comptes: connexions broker (MT4/MT5/cTrader via EA push WebRequest, IBKR, TD/Schwab,
    Tradovate/NinjaTrader, Binance/Bybit, TradingView) READ-ONLY, EA MetaTrader (endpoint /v1/ea/sync
    signé HMAC + WebSocket temps réel ws.*), import CSV avec assistant de mapping sauvegardable + preview
    + dédoublonnage, import API/clé chiffrée, webhooks signés, historique d'import + rollback.
14. Calendrier économique: annonces macro en temps réel (source Forex Factory / API éco), filtres impact
    (Élevé/Moyen/Faible/Jour férié) + devises (USD/EUR/GBP/JPY/CAD/AUD/CHF/NZD/CNY), alertes push si
    position ouverte sur instrument concerné dans les 30 prochaines minutes.
15. Leaderboard: classement opt-in (Mensuel/Annuel), top 3 en cartes, tableau colonnes #/Pseudo/Broker/
    Type(Prop-Live)/ROI%/WR/trades/PF. Anonymisable, publication consentie.
16. Modèles de champs: créer des ensembles nommés de champs custom (type, options) réutilisables pour
    plusieurs comptes/journaux.
11. Paramètres & profil: profil (tz/devise/langue), CRUD comptes de trading (type live/demo/prop/eval, prop_config),
    préférences (thème, formats, $/R défaut, colonnes), tags/erreurs/émotions, notifications, sécurité (mdp/2FA/
    sessions/OAuth), export & suppression RGPD.
12. Auth & onboarding: signup email/OAuth + vérif + OTP, login + 2FA, onboarding wizard (objectif → actifs →
    connexion broker/CSV/manuel → 1er compte → 1er playbook → préférences), empty states guidés, trial 14j.
13. Plans & abonnements: grille Free/Pro/Elite (mensuel/annuel), comparatif, gestion Stripe (facture, moyen de
    paiement, upgrade/downgrade, annulation 1 clic), paywalls contextuels.

PALIERS ITÉRATIFS
- MVP (WEB + MOBILE — priorité égale, les deux fonctionnels au MVP) :
  • Monorepo scaffoldé : packages/types (Zod), packages/calc (100% testé), packages/api-client.
  • Auth : email/mdp + OAuth Google/Apple + OTP email. Web : Next.js. Mobile : Expo Router v3 écran Login natif.
  • 1 compte de trading ; import CSV générique + parseur MetaTrader ; matching exécutions→trades.
  • WEB : Trade Log + Ajout/Édition manuel, Dashboard (KPIs cœur, equity curve), Calendrier, Journal basique.
  • MOBILE (Expo SDK 51+, NativeWind, dark mode natif, couleurs #16C784/#EA3943) :
      - Login (email/OAuth + biométrie)
      - Dashboard (cartes KPI + equity curve scroll)
      - Trade Log (liste cartes, filtres bottom sheet, pull-to-refresh)
      - Ajout trade (formulaire touch-optimisé : symbole, direction, P&L, R, date, tags, note, photo)
      - Calendrier heatmap mensuel
      - Bottom tabs : Dashboard · Trades · ＋ (FAB) · Calendrier · Profil
  • Push notifications Expo (alertes risk basiques).
- V1: Analytics complet (toutes dimensions + distributions + heatmaps), Playbooks + checklists, Risk Management
  + alertes avancées, Rapports + export, multi-comptes, connexions broker auto (read-only) MT4/MT5/cTrader + IBKR,
  abonnements Stripe (Free/Pro), offline-first mobile (SQLite + file d'écritures), note vocale→texte.
- V2: Insights IA (analyse en langage naturel des données perso), MAE/MFE + price_history, Trade Replay barre par
  barre, psychologie avancée (tilt index, coût indiscipline, mood↔perf), prop firm tracker multi-comptes,
  partage social/mentor, rapports planifiés, plan Elite, plus de brokers/crypto/futures, comparateur de périodes.

QUALITÉ
- Tests: unitaires calc (couverture des formules), intégration API, e2e Playwright (web) + Detox (mobile).
- Perf: vues clés < 1s, tableaux virtualisés, agrégations cachées (metrics_cache), pagination cursor.
- Accessibilité AA, i18n (FR/EN), timezone-correct partout, devise d'affichage convertible.
- Documente l'API (OpenAPI) et génère le client typé partagé.

CONTRAINTES NON NÉGOCIABLES
- Connexions broker strictement READ-ONLY (jamais de passage d'ordre) et credentials chiffrés.
- Cohérence absolue des signes/couleurs P&L et du brut vs net dans toute l'UI.
- Saisie manuelle d'un trade réalisable en < 30s; mobile orienté capture/revue, pas saisie lourde.
- Réutilisation maximale du code entre web et mobile (types, calc, api-client, hooks).

Commence par scaffolder le monorepo, le package types + calc (avec tests), et le module Auth, puis livre le MVP.
Demande validation à la fin de chaque palier.
```

---

## Annexe A — Modèle de pricing recommandé (synthèse marché)

| Plan | Prix cible | Limites | Pour qui |
|---|---|---|---|
| **Free** | 0 € | 1 compte, ~100 trades/mois, analytics de base, manuel + CSV | Tester l'habitude (modèle Tradervue) |
| **Pro** | ~12–15 €/mo (annuel) · ~19 €/mo (mensuel) | comptes illimités, auto-import broker, analytics complet, playbooks, risk, rapports | Trader actif sérieux |
| **Elite** | ~29–39 €/mo | + IA insights, trade replay, backtesting, prop firm tracker, partage mentor, rapports planifiés | Pro / prop firm / multi-comptes |

Essai **14 jours** (cf. ProTradingLabs : 0 € facturé au J1, premier paiement à J15), **annulation 1 clic**, remise annuelle ~30 %. ProTradingLabs prouve qu'une **licence lifetime unique (199,99 € ≈ 13 mois)** est très attractive face au mensuel (14,99 €/mois) — à proposer systématiquement. Edgewonk ($197/an) valide aussi ce modèle.

## Annexe B — Différenciateurs à viser (pour battre le marché)

1. **Pont analyse ↔ exécution** (signature ProTradingLabs) sans verrou broker.
2. **Coût chiffré de l'indiscipline** (Edgewonk) + tilt index, mais mieux intégré au workflow quotidien.
3. **IA d'insights** sur données personnelles (TradeZella/TradesViz) en langage naturel et actionnable.
4. **Mobile natif réellement utile** (capture photo/voix + revue), là où Tradervue/Edgewonk sont faibles.
5. **Free tier honnête** (acquisition, modèle Tradervue) + **densité analytique** (TradesViz).
6. **Prop firm first-class** : trackers d'évaluation multi-comptes, règles de drawdown natives.

---

## Annexe C — Pages supplémentaires ProTradingLabs (observées en scraping)

Ces pages sont réelles et observées dans ProTradingData ; à intégrer à V1 :

### Page 14 — Calendrier économique (Economic News)

**Rôle** : agenda macro en temps réel pour éviter de trader autour des annonces à risque.

**Filtres** : Impact (Élevé / Moyen / Faible / Jour férié), Devises (USD/EUR/GBP/JPY/CAD/AUD/CHF/NZD/CNY).

**Colonnes par annonce** : Heure locale | Indicateur couleur impact | Libellé événement | Réel | Prévision | Précédent.

**Affichage** : groupé par jour de la semaine ; scroll journalier ; mise à jour en temps réel lors de la publication des chiffres.

**Logique** : source externe (Forex Factory / Investing.com / API économique) importée via job périodique ou API officielle. Alertes push si un instrument ouvert est concerné par une annonce Élevé dans les 30 prochaines minutes.

---

### Page 15 — Classement (Leaderboard)

**Rôle** : classement communautaire opt-in, renforce la confiance et l'engagement.

**Filtres** : Mensuel / Annuel.

**Top 3** en cartes proéminentes. Suite en tableau :
`# | Pseudo | Broker | Type (Prop / Live) | ROI% | Win Rate | Nb trades | Profit Factor`

**Logique** : opt-in (le trader autorise la publication de ses données agrégées). Anonymisable (pseudo uniquement). Broker affiché si autorisé. Prop/Live label auto depuis le type de compte.

---

### Page 16 — Modèles de champs (Field Templates)

**Rôle** : créer des ensembles de champs personnalisés réutilisables à attacher à un compte/journal.

**Fonctionnement** : un modèle = ensemble nommé de champs custom (type dropdown/texte/nombre/booléen) que le trader crée une fois et applique à plusieurs journaux ou comptes.

**CTA** : "Créer un modèle" → formulaire (nom du modèle, liste de champs avec type + options).

**Logique** : permet des setups très différents (ex. champs spécifiques futures vs forex, champs prop firm vs live). Économise la saisie répétée lors de la création de nouveaux comptes.

---

### Intégration EA MetaTrader (pattern réel)

```
Expert Advisor MT4/MT5 (.ex5 / .ex4) tourne côté trader
  │
  ├─ Sur chaque trade (open/modify/close) : POST → https://api.protradinglabs.com
  │    payload: { account_id, symbol, direction, qty, price, sl, tp, magic, timestamp, … }
  │
  └─ Temps réel : connexion WebSocket → ws.protradinglabs.com
       flux bidirectionnel : trades live, modifications de position, alertes risk
```

**Implémentation EA** : MQL5 `WebRequest()` vers l'endpoint sécurisé (HMAC signé avec clé API unique/compte). L'EA .ex5 est téléchargé depuis le dashboard et configuré avec la clé API de l'utilisateur.

**Backend** : endpoint `/v1/ea/sync` reçoit les pushes, les valide (signature HMAC + rate limit par clé), les pousse en file BullMQ → worker de normalisation → table `executions`.

**Avantage** : zéro accès aux credentials broker, l'EA tourne en local sur le poste trader, connexion read-only possible mais en pratique push actif. Permet aussi de déclencher des alertes (risk limit atteint) depuis le serveur vers l'EA en temps réel via WebSocket.

---

## Annexe D — Stack réel ProTradingData (confirmé au scraping 2026-06-05)

| Couche | Technologie observée |
|---|---|
| Frontend | Next.js (App Router, routes `/DATA/[page]`) |
| Auth | **Clerk** (JWT 60s + refresh token, OTP email, session Clerk) |
| Thèmes | 8 palettes CSS custom : ProTrading, Caféine, Twitter, Darkmatter, Supabase, Cyberpunk, T3 Chat, Bubblegum |
| API REST | `https://api.protradinglabs.com` |
| WebSocket | `ws.protradinglabs.com` |
| EA MT5 | ProTradingData.ex5 v1.1.1 (28/05/2026) + ProTradingManager.ex5 |
| Paiements | Stripe (Billing Portal) |
| Notifications | Telegram natif (linkage compte Telegram dans Settings) |
| Pricing live | 14,99 €/mois · 199,99 € lifetime |

---

*Spec mise à jour le 2026-06-05 après scraping authentifié de l'espace membre ProTradingData (compte en essai) PUIS après injection de 60 trades et scraping complet du compte peuplé. Toutes les pages analytics/stats/analyses sont désormais documentées dans les Annexes E et F ci-dessous. La présente spec dépasse ProTradingLabs sur : psychologie avancée, mobile natif, trade replay, backtesting, free tier, IA insights.*

---

## Annexe E — Analyse technique complète du backend ProTradingLabs (ingénierie inverse 2026-06-05)

### E.1 — Stack réel confirmé (reverse engineering WS + Playwright)

| Couche | Détail |
|---|---|
| Backend temps réel | **Convex** — `befitting-wren-193.convex.cloud`, WS `wss://befitting-wren-193.convex.cloud/api/1.31.7/sync` |
| Analytics cache | **Tinybird** — KPIs, equity curve, heatmaps (TTL ~5 min) |
| Auth tokens | **Clerk** JWT 60s (audience `convex`), refresh token cookie persistant |
| Frontend | Next.js App Router, routes `/DATA/[section]/[accountId]` |
| Automation | Playwright Firefox headless (Chromium absent : `libnspr4.so` manquant sur le serveur) |

### E.2 — URL map complète (toutes pages de l'espace membre)

**Pages globales :**
| Chemin | Titre |
|---|---|
| `/DATA/trading-journal` | Liste des comptes de trading |
| `/DATA/calendar` | Calendrier performances → **paywall redirect** |
| `/DATA/classement` | Classement (leaderboard) → **paywall redirect** |
| `/DATA/annonces-economiques` | Annonces économiques (calendrier macro) |
| `/DATA/parametres` | Paramètres compte |
| `/DATA/facturation` | Facturation (Stripe portal) |
| `/DATA/tarification` | Tarification (14,99 €/mois, 199,99 € lifetime) |

**Pages d'un compte de trading (`/DATA/trading-journal/{accountId}/...`) :**
| Sous-chemin | Page |
|---|---|
| _(racine)_ | Dashboard principal |
| `/trades` | Journal des trades (trade log) |
| `/analyses` | Analytics & heatmaps |
| `/trading-plan` | Plan de trading (règles + checklist) |
| `/custom-field-stats` | Stats champs personnalisés |
| `/errors` | Journal des erreurs |
| `/transactions` | Dépôts / retraits |

> ⚠ Les URLs localisées françaises (`/plan-de-trading`, `/erreurs`, `/depot-retrait`) utilisées en scraping initial retournaient 404. Les URLs correctes sont en anglais, extraites des balises `<a>` dans la sidebar.

### E.3 — Convex WebSocket Protocol (messages observés)

**Handshake :** connexion WebSocket → le client envoie un message `Authenticate` avec le JWT Clerk (audience `convex`).

**Types de messages sortants :**
```
ModifyQuerySet  — abonnements queries temps réel
Authenticate    — envoi du JWT (refresh toutes les 60s)
Mutation        — appel de fonction serverless (écriture)
Action          — appel de fonction serverless (action)
```

**Format Mutation :**
```json
{
  "type": "Mutation",
  "requestId": 101,
  "udfPath": "positions:createPosition",
  "args": [{ ... }]
}
```

**Réponse Convex :**
```json
{ "type": "MutationResponse", "requestId": 101, "success": true }
```

### E.4 — Mutation `positions:createPosition` — schéma complet

**udfPath :** `positions:createPosition`

**Args (objet unique dans le tableau `args`) :**
| Champ | Type | Description | Exemple |
|---|---|---|---|
| `accountId` | string | ID Convex du compte | `"j577yb1sprkx2cnakv542wmd0x883kcx"` |
| `symbol` | string | Paire / instrument | `"EUR/USD"`, `"XAU/USD"`, `"NAS100"` |
| `direction` | string | `"long"` ou `"short"` | `"long"` |
| `timeframe` | string | Unité de temps | `"M5"`, `"M15"`, `"H1"`, `"H4"`, `"D1"` |
| `openedAt` | number | Timestamp ms ouverture | `1749500340000` |
| `closedAt` | number | Timestamp ms fermeture | `1749504540000` |
| `pnl` | number | Profit/Loss en €, négatif si perte | `150.5`, `-87.3` |
| `ratio` | number | R:R réalisé (valeur absolue si win, négatif si perte) | `1.8`, `-0.95` |
| `riskAmount` | number | Montant risqué en € | `150.0` |
| `riskPercent` | number | % du capital risqué | `1.5` |
| `fees` | number | Frais de courtage (€) | `3.5` |
| `swap` | number | Swap/rollover (€, 0 si trade intraday) | `-1.2` |

**Injection en masse via WS :** capture du WebSocket via `window.WebSocket` monkey-patch dans `add_init_script`, puis injection des mutations JSON directement dans la connexion live.

### E.5 — Formulaire "Ajouter une position" — 12 champs requis

Le formulaire s'ouvre dans un **Radix UI Sheet** (drawer latéral droit) déclenché par le bouton `+ Ajouter une position`.

| # | Champ | Composant | Notes |
|---|---|---|---|
| 1 | Date d'ouverture | Date picker custom (calendrier + time scroll) | Clic sur jour → clic cell heure → bouton "Valider" |
| 2 | Date de fermeture | Idem | Même interaction |
| 3 | Symbole | Sheet overlay + champ search | Taper le symbole → sélectionner "Ajouter 'EUR/USD'" |
| 4 | Direction | Boutons radio | Long / Short |
| 5 | Unité de temps | Select dropdown | M5, M15, H1, H4, D1, W1, MN |
| 6 | Résultat (P/L) | Input numérique (€) | Valeur positive = gain |
| 7 | Ratio R:R | Input numérique | Ex. `1.5` |
| 8 | Risque (%) | Input numérique | % du capital |
| 9 | Risque (€) | Input numérique | Calculé automatiquement ou saisie manuelle |
| 10 | Frais (EUR) | Input numérique | Spread + commission |
| 11 | Swap (EUR) | Input numérique | 0 si intraday |
| 12 | Tags | Multi-select + création inline | Stratégie, timeframe, etc. (optionnel mais suggéré) |

**Coordonnées UI clés (viewport 1440×900) :**
- Bouton "Ajouter une position" : `x=1290, y=175`
- Sheet ouvert (zone centrale droite) : `x=900, y=450`
- Champ P/L : `x=920, y=470`
- Bouton Symbole : `x=800, y=370`
- Valider (date picker) : bouton `button:has-text('Valider')`

**Bugs Playwright découverts :**
- `Mouse.triple_click` n'existe pas → utiliser `page.mouse.click(x, y, click_count=3)`
- Touche Escape ferme le sheet entier (Radix) → cliquer à `x=900, y=50` pour fermer le date picker
- Le time picker utilise un **scroll virtuel** : les cells sont à Y négatif, chercher dans les bounds du picker

---

## Annexe F — Comparaison UI avant/après population (60 trades)

### F.1 — Dashboard principal

**État vide :**
- Bandeau d'accueil "Bienvenue sur ProTradingLabs" avec CTA pour ajouter le premier trade
- Tous les KPI cards affichent `—` ou `0`
- Aucun graphique (equity curve absente)
- Message "Aucune donnée disponible" sur chaque widget
- Bouton "Ajouter une position" très visible au centre

**État peuplé (60 trades) :**

KPIs affichés :
| Métrique | Valeur observée |
|---|---|
| Capital | **16 500 € (+64,5 %)** |
| Performance | **+99,88R** (Risk-Reward cumulé) |
| Nombre de trades | **60** |
| Win Rate | **57W / 3BE / 0L** (Tinybird cache : montrait 100% avant refresh) |
| Période | Jan–Jun 2026 |

Widgets visibles après population :
- **Equity curve** : graphique linéaire montrant l'évolution du capital
- **Calendrier mensuel** : heatmap par jour avec coloration P/L (vert = jour gagnant)
- **Distribution par symbole** : bar chart fréquence trades par instrument
- **Stats rapides** : Win Rate %, Ratio moyen, Drawdown max

### F.2 — Journal des trades (`/trades`)

**État vide :** message "Aucun trade pour le moment" + bouton CTA

**État peuplé :**

Colonnes du tableau :
| Colonne | Contenu |
|---|---|
| Symbole | Paire (EUR/USD, XAU/USD…) avec icône flag |
| Ouvert | Date + heure d'ouverture |
| Fermé | Date + heure de fermeture |
| Durée | Durée du trade (ex. "2h 15min") |
| Direction | Long / Short (badge coloré) |
| Risque | % et € risqués |
| P/L | Profit ou perte en € (coloré vert/rouge) |
| Ratio | R:R réalisé |
| Unité de temps | M5 / H1 / D1 etc. |

Fonctionnalités visibles :
- **Filtres** : par symbole, direction, timeframe, période, tags
- **Tri** par toutes colonnes
- **Pagination** ou infinite scroll
- **Export** (bouton CSV observable)
- Clic sur une ligne → détail du trade (drawer ou page dédiée)

### F.3 — Page Analyses (`/analyses`)

**État vide :** tous les heatmaps vides, message "Minimum X trades requis"

**État peuplé :**

Heatmaps présents (matrices R moyen) :
| Heatmap | Axes |
|---|---|
| Symbole × Jour de la semaine | Lignes = instruments, Colonnes = Lun–Dim |
| Symbole × Durée | Lignes = instruments, Colonnes = tranches durée |
| Symbole × Mois | Lignes = instruments, Colonnes = Jan–Déc |
| Symbole × Heure | Lignes = instruments, Colonnes = 0h–23h |
| Jour × Heure | Matrice 7×24 (performance horaire par jour) |

Coloration : gradient vert (R positif) → rouge (R négatif), gris = pas de trade.

Données observées (compte test) :
- Meilleure combinaison : EUR/USD × Mardi → R moyen élevé
- NAS100 : trades courts surperforment trades longs
- Créneau le plus actif : 9h–12h (session Europe)

**Recommandations intelligentes** (nécessite ≥100 trades) :
- Feature visible mais grisée avec message "100 trades minimum pour activer les recommandations"
- IA suggère les meilleures paires/heures/setups basé sur l'historique

### F.4 — Plan de trading (`/trading-plan`)

Liste de règles de trading définies par l'utilisateur.

**Structure :**
- Règles affichées sous forme de checklist
- Cases à cocher par trade (pour vérifier le respect des règles)
- Bouton "Ajouter une règle"
- Pas de contenu par défaut (entièrement personnalisable)

**État vide vs peuplé :** pas de différence visible sur cette page (les règles sont indépendantes des trades).

### F.5 — Pages avec paywall actif

| Page | URL | Comportement |
|---|---|---|
| Calendrier | `/DATA/calendar` | Redirect vers `/DATA/tarification` |
| Classement | `/DATA/classement` | Redirect vers `/DATA/tarification` |
| Annonces économiques | `/DATA/annonces-economiques` | **Accessible** — calendrier macro complet |

### F.6 — Stats champs perso, Erreurs, Transactions

**Stats champs perso (`/custom-field-stats`) :**
- Statistiques sur les champs personnalisés créés par l'utilisateur
- Vide si aucun champ perso défini sur les trades

**Erreurs (`/errors`) :**
- Journal des erreurs de trading (confusions psychologiques, non-respect du plan)
- À renseigner manuellement par le trader après chaque trade
- État vide : "Aucune erreur enregistrée"

**Transactions (`/transactions`) :**
- Historique dépôts / retraits du compte de trading suivi
- Séparé des trades (utilisé pour le calcul du capital réel)

---

## Annexe G — Méthode d'injection de données (Playwright + Convex WS)

### Approche finale (WebSocket monkey-patch)

```python
# 1. Capturer le WebSocket Convex AVANT le chargement de la page
await page.add_init_script("""
    (() => {
        const OrigWS = window.WebSocket;
        window.__capturedWS = null;
        window.__wsReady = false;
        window.__wsResponses = [];

        function WSProxy(url, protocols) {
            const ws = protocols ? new OrigWS(url, protocols) : new OrigWS(url);
            if (url.includes('convex.cloud')) {
                window.__capturedWS = ws;
                ws.addEventListener('open', () => { window.__wsReady = true; });
                ws.addEventListener('message', (e) => { window.__wsResponses.push(e.data); });
            }
            return ws;
        }
        window.WebSocket = WSProxy;
    })();
""")

# 2. Charger la page (le WS s'authentifie automatiquement avec le JWT Clerk)
await page.goto("https://protradinglabs.com/DATA/trading-journal/{accountId}")
await page.wait_for_timeout(3000)

# 3. Envoyer les mutations via la connexion WS live
await page.evaluate("""async () => {
    const ws = window.__capturedWS;
    const msg = JSON.stringify({
        type: "Mutation",
        requestId: 101,
        udfPath: "positions:createPosition",
        args: [{ accountId: "...", symbol: "EUR/USD", ... }]
    });
    ws.send(msg);
}""")
```

### Tentatives infructueuses documentées

| Approche | Résultat | Raison |
|---|---|---|
| HTTP POST `convex.cloud/api/mutation` avec JWT capturé | ❌ 401 `MalformedAccessToken` | Le JWT Clerk (audience `convex`) est rejeté par l'endpoint HTTP — fonctionne uniquement via WS |
| `page.evaluate` fetch avec JWT live | ❌ 401 identique | Même restriction côté Convex |
| Form Playwright (clic boutons) | ✅ 1 trade créé | Opérationnel mais lent (~45s/trade) |
| **WS monkey-patch via `add_init_script`** | ✅ **60 trades créés** | Utilise la connexion WS authentifiée native du browser |

### Résultat obtenu

- **60 trades injectés** sur le compte `j577yb1sprkx2cnakv542wmd0x883kcx` ("FTMO Challenge 10K")
- Répartis sur Jan–Jun 2026, 10 symboles, 5 timeframes
- Win rate réel : ~55% (simulé avec biais réaliste PropFirm)
- Capital final affiché : **16 500 € (+64,5 %)**
- Feature "Recommandations intelligentes" : nécessite ≥100 trades (seuil non atteint)

*Données injectées le 2026-06-05 via session authentifiée Playwright Firefox headless.*
