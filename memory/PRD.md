# Liser - PRD (Product Requirements Document)

## Problem Statement
Liser es una plataforma web que permite a creadores de contenido, influencers y usuarios organizar y compartir listas de productos llamadas BagLists de forma visual, estructurada y optimizada para descubrimiento.

## Architecture
- **Frontend**: React 19 + Tailwind CSS + shadcn/ui components
- **Backend**: FastAPI (Python) with JWT auth
- **Database**: MongoDB (Motor async driver)
- **Theme**: Dark Midnight Cyber (Outfit + Inter fonts)

## User Personas
1. **Content Creators/Influencers**: Create and share product recommendation lists
2. **Shoppers/Followers**: Discover, save, and favorite curated product lists

## Core Requirements
- JWT email/password authentication
- BagList CRUD with products (manual entry: name, image URL, price, link, description)
- Explore/Discover with smart filters (category, search, sort, pagination)
- Social interaction (favorites, saves/bookmarks)
- User profiles with public BagLists

## What's Been Implemented (Feb 2026)
- Full JWT auth (register, login, me, profile update)
- BagList CRUD (create, read, update, delete)
- Product management (add, edit, delete within BagLists)
- Favorites & Saves toggle system
- Explore page with category, search, sort filters + pagination
- Dashboard with stats (lists, products, favorites, public count)
- User profile pages
- Saved/Favorites tabs page
- Landing page with hero, features, CTA
- Responsive dark theme UI with glassmorphic cards
- All API routes with /api prefix, MongoDB indexes

## Prioritized Backlog
- **P0**: Core functionality complete
- **P1**: Image upload support, SEO meta tags, share previews
- **P2**: Affiliate link tracking, analytics dashboard, product drag-and-drop reorder
- **P3**: Comments system, follow users, notifications, collaborative lists

## Next Tasks
1. Add OG meta tags for BagList sharing on social media
2. Implement product reorder via drag-and-drop
3. Add affiliate link tracking and click analytics
4. Add user following system
5. Add comments on BagLists
