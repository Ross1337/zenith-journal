# ZENITH — Trading Journal — Brief Claude Fable 5

## Projet
Tu construis **ZENITH**, une application de journal de trading premium (Web + Mobile natif).

## Nom & identité
- **Nom du produit :** ZENITH
- **Tagline :** *See your edge clearly.*
- Repo GitHub : https://github.com/Ross1337/zenith-journal

## Design — RÈGLE ABSOLUE
Les fichiers dans  sont des captures d'écran de ProTradingLabs (concurrent).
Tu peux t'en inspirer **UNIQUEMENT pour les fonctionnalités et les flux UX**.
**Le design visuel doit être 100 % original, magnifique, distinctif.**
Ne jamais copier les layouts, palettes, ou composants des refs.
Niveau cible : Linear, Vercel, Raycast, Resend — pas ProTradingLabs.
ZENITH doit être immédiatement reconnaissable comme son propre produit.

## Spécification fonctionnelle complète
Voir  dans ce dossier — c'est la spec exhaustive Phase 1→4.
Tu suis la Phase 4 (Prompt de développement maître) pour construire le projet.

## Stack imposée
- Monorepo Turborepo + TypeScript
- Web : Next.js 14 App Router
- Mobile : Expo SDK 51+ / Expo Router v3
- Backend : NestJS + PostgreSQL + Redis + BullMQ
- Auth : Clerk
- Paiements : Stripe
- Charts : TradingView Lightweight Charts + Recharts
- State : TanStack Query + Zustand + React Hook Form/Zod

## Instructions
1. Commence par le MVP web (dashboard + trade log + ajout trade)
2. Procède de façon itérative — MVP → V1 → V2
3. Commit régulièrement sur la branche main (git push origin main)
4. Crée un design system original dans packages/ui-tokens AVANT les pages
5. Documente les décisions de design dans DESIGN.md

## Démarrage
```bash
cd ~/zenith
npx create-turbo@latest . --skip-install
```
