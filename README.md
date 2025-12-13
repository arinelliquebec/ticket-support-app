# 🎫 Système de Tickets de Support Fradema

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.0.10-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?style=for-the-badge&logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748?style=for-the-badge&logo=prisma)

**Une plateforme moderne et efficace de gestion des tickets de support**

[Fonctionnalités](#-fonctionnalités) • [Stack Technique](#-stack-technique) • [Installation](#-installation) • [Architecture](#-architecture)

</div>

---

## 🎯 Problèmes Résolus

### Pour les Organisations
- **Gestion Centralisée du Support** : Consolidez toutes les demandes de support en un seul endroit, éliminant les emails et messages dispersés
- **Suivi en Temps Réel** : Surveillez l'état des tickets et les performances de l'équipe avec des tableaux de bord et KPIs en direct
- **Responsabilité** : Traçabilité complète avec attributions d'utilisateurs, horodatages et historique des commentaires
- **Support Multi-filiales** : Gérez les tickets de support à travers différentes filiales/sites de l'entreprise
- **Décisions Basées sur les Données** : Exportez des rapports et analysez les métriques pour améliorer la qualité du service

### Pour les Équipes de Support
- **Gestion des Priorités** : Catégorisez et priorisez les tickets (Basse, Moyenne, Haute, Urgente) pour une gestion efficace de la charge de travail
- **Mises à Jour Rapides du Statut** : Flux de travail simplifié avec transitions de statut (Ouvert → En Cours → Terminé)
- **Pièces Jointes** : Recevez des documents et images de support pour un meilleur contexte
- **Notifications Admin** : Notifications en temps réel pour les nouveaux tickets et tickets non consultés

### Pour les Utilisateurs Finaux
- **Création Facile de Tickets** : Interface intuitive pour soumettre des demandes de support avec catégories et pièces jointes
- **Transparence** : Suivez la progression des tickets et recevez des mises à jour via les commentaires
- **Portail Libre-Service** : Consultez l'historique et le statut des tickets sans contacter le support

---

## ✨ Fonctionnalités

### 🎫 Gestion des Tickets
- Créer, modifier et supprimer des tickets de support
- Descriptions en texte riche jusqu'à 1024 caractères
- Organisation par catégories avec couleurs personnalisées
- Niveaux de priorité : Basse, Moyenne, Haute, Urgente
- Flux de statut : Ouvert → En Cours → Terminé
- Attribution de filiale/site
- Suivi des échéances

### 📎 Pièces Jointes
- Téléversement par glisser-déposer
- Support de multiples types de fichiers
- Limite de 10 Mo par pièce jointe
- Intégration stockage cloud AWS S3
- Accès sécurisé aux fichiers avec URLs pré-signées

### 💬 Système de Commentaires
- Discussions en fil sur les tickets
- Mises à jour des commentaires en temps réel
- Attribution d'utilisateur pour tous les commentaires
- Capacités d'édition et suppression

### 📊 Tableau de Bord & Analytiques
- Tableau de bord KPI en temps réel
- Distribution des tickets par statut
- Visualisation de la répartition par priorité
- Suivi du taux de résolution
- Surveillance de la conformité SLA
- Analyse de distribution par filiale
- Export PDF/Excel

### 👥 Gestion des Utilisateurs
- Authentification sécurisée avec Lucia Auth
- Contrôle d'accès basé sur les rôles (Utilisateur/Admin)
- Téléversement d'avatars personnalisés
- Gestion de profil
- Gestion des sessions

### 🔔 Notifications
- Notifications admin pour nouveaux tickets
- Badges de tickets non consultés
- Mises à jour en temps réel via websockets
- Support des notifications push (PWA)

### 🎨 UI/UX Moderne
- Design responsive pour tous les appareils
- Support thème Sombre/Clair
- Animations fluides avec Framer Motion
- Effets de cartes en glass-morphism
- Navigation intuitive avec fil d'Ariane
- Prêt pour Progressive Web App (PWA)

---

## 🛠 Stack Technique

### Frontend
| Technologie | Utilisation |
|-------------|-------------|
| **Next.js 16** | Framework React avec App Router |
| **React 19** | Bibliothèque de composants UI |
| **TypeScript** | Développement typé |
| **Tailwind CSS 4** | Styles utilitaires |
| **Radix UI** | Primitives de composants accessibles |
| **Framer Motion** | Bibliothèque d'animations |
| **Lucide React** | Système d'icônes |
| **React Hook Form** | Gestion des formulaires |
| **TanStack Query** | Gestion de l'état serveur |
| **Zod** | Validation de schémas |

### Backend
| Technologie | Utilisation |
|-------------|-------------|
| **Next.js API Routes** | Points d'API backend |
| **Prisma** | ORM base de données |
| **PostgreSQL** | Base de données principale (Supabase) |
| **Lucia Auth** | Authentification |
| **Argon2** | Hachage de mots de passe |
| **Redis (Upstash)** | Cache & limitation de débit |

### Infrastructure
| Technologie | Utilisation |
|-------------|-------------|
| **AWS S3** | Stockage de fichiers |
| **Supabase** | Hébergement base de données |
| **Vercel** | Plateforme de déploiement |
| **Resend** | Notifications par email |

---

## 🚀 Installation

### Prérequis
- Node.js >= 24.0.0
- pnpm >= 10.12.1
- Base de données PostgreSQL (Supabase recommandé)
- Bucket AWS S3 (pour les téléversements de fichiers)

### Guide d'Installation

1. **Cloner le dépôt**
```bash
git clone https://github.com/your-org/ticket-support-app.git
cd ticket-support-app
```

2. **Installer les dépendances**
```bash
pnpm install
```

3. **Configurer les variables d'environnement**
```bash
cp .env.example .env
```

Variables d'environnement requises :
```env
# Base de données
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Authentification
LUCIA_SECRET="votre-cle-secrete"

# AWS S3
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_REGION="us-east-1"
AWS_S3_BUCKET="nom-de-votre-bucket"

# Redis (optionnel)
UPSTASH_REDIS_REST_URL="..."
UPSTASH_REDIS_REST_TOKEN="..."

# Email (optionnel)
RESEND_API_KEY="..."
```

4. **Configurer la base de données**
```bash
pnpm prisma generate
pnpm prisma db push
```

5. **Initialiser les données (optionnel)**
```bash
pnpm prisma-seed
pnpm add-all-categories
```

6. **Démarrer le serveur de développement**
```bash
pnpm dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) pour voir l'application.

---

## 📁 Architecture

```
src/
├── app/                    # Pages Next.js App Router
│   ├── api/               # Routes API
│   ├── admin/             # Tableau de bord admin
│   ├── tickets/           # Gestion des tickets
│   └── profile/           # Profil utilisateur
├── components/            # Composants UI réutilisables
│   ├── ui/               # Composants UI de base
│   └── theme/            # Gestion des thèmes
├── features/              # Modules fonctionnels
│   ├── auth/             # Authentification
│   ├── ticket/           # Logique des tickets
│   ├── comment/          # Commentaires
│   └── category/         # Catégories
├── hooks/                 # Hooks React personnalisés
├── lib/                   # Utilitaires et configurations
│   ├── prisma/           # Client base de données
│   └── redis/            # Client cache
├── services/              # Intégrations services externes
└── validations/           # Schémas Zod
```

---

## 📜 Scripts Disponibles

| Commande | Description |
|----------|-------------|
| `pnpm dev` | Démarrer le serveur de développement |
| `pnpm build` | Construire pour la production |
| `pnpm start` | Démarrer le serveur de production |
| `pnpm lint` | Exécuter ESLint |
| `pnpm prisma-seed` | Initialiser la base de données |
| `pnpm add-all-categories` | Ajouter les catégories par défaut |

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Veuillez lire nos directives de contribution avant de soumettre une pull request.

---

## 📄 Licence

Ce projet est un logiciel propriétaire développé par Arinelli Quebec © 2025.

---
