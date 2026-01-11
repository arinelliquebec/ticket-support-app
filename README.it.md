# 🎫 Sistema di Ticket di Supporto Fradema

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.0.10-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?style=for-the-badge&logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748?style=for-the-badge&logo=prisma)

**Una piattaforma moderna ed efficiente per la gestione dei ticket di supporto**

[Funzionalità](#-funzionalità) • [Stack Tecnologico](#-stack-tecnologico) • [Installazione](#-installazione) • [Architettura](#-architettura)

</div>

---

## 🎯 Problemi Risolti

### Per le Organizzazioni
- **Gestione Centralizzata del Supporto**: Consolida tutte le richieste di supporto in un unico posto, eliminando email e messaggi sparsi
- **Monitoraggio in Tempo Reale**: Monitora lo stato dei ticket e le prestazioni del team con dashboard e KPI in tempo reale
- **Responsabilità**: Tracciabilità completa con assegnazioni utenti, timestamp e cronologia dei commenti
- **Supporto Multi-filiale**: Gestisci i ticket di supporto attraverso diverse filiali/sedi aziendali
- **Decisioni Basate sui Dati**: Esporta report e analizza le metriche per migliorare la qualità del servizio

### Per i Team di Supporto
- **Gestione delle Priorità**: Categorizza e prioritizza i ticket (Bassa, Media, Alta, Urgente) per una gestione efficiente del carico di lavoro
- **Aggiornamenti Rapidi dello Stato**: Flusso di lavoro semplificato con transizioni di stato (Aperto → In Corso → Completato)
- **Allegati**: Ricevi documenti e immagini di supporto per un contesto migliore
- **Notifiche Admin**: Notifiche in tempo reale per nuovi ticket e ticket non visualizzati

### Per gli Utenti Finali
- **Creazione Facile di Ticket**: Interfaccia intuitiva per inviare richieste di supporto con categorie e allegati
- **Trasparenza**: Monitora l'avanzamento dei ticket e ricevi aggiornamenti tramite i commenti
- **Portale Self-Service**: Visualizza la cronologia e lo stato dei ticket senza contattare il supporto

---

## ✨ Funzionalità

### 🎫 Gestione dei Ticket
- Creare, modificare ed eliminare ticket di supporto
- Descrizioni in testo ricco fino a 1024 caratteri
- Organizzazione per categorie con colori personalizzati
- Livelli di priorità: Bassa, Media, Alta, Urgente
- Flusso di stato: Aperto → In Corso → Completato
- Assegnazione filiale/sede
- Monitoraggio delle scadenze

### 📎 Allegati
- Caricamento drag-and-drop
- Supporto per molteplici tipi di file
- Limite di 10 MB per allegato
- Integrazione storage cloud AWS S3
- Accesso sicuro ai file con URL pre-firmati

### 💬 Sistema di Commenti
- Discussioni in thread sui ticket
- Aggiornamenti dei commenti in tempo reale
- Assegnazione utente per tutti i commenti
- Funzionalità di modifica ed eliminazione

### 📊 Dashboard & Analytics
- Dashboard KPI in tempo reale
- Distribuzione dei ticket per stato
- Visualizzazione della ripartizione per priorità
- Monitoraggio del tasso di risoluzione
- Monitoraggio della conformità SLA
- Analisi della distribuzione per filiale
- Esportazione PDF/Excel

### 👥 Gestione degli Utenti
- Autenticazione sicura con Lucia Auth
- Controllo degli accessi basato sui ruoli (Utente/Admin)
- Caricamento di avatar personalizzati
- Gestione del profilo
- Gestione delle sessioni

### 🔔 Notifiche
- Notifiche admin per nuovi ticket
- Badge per ticket non visualizzati
- Aggiornamenti in tempo reale tramite websockets
- Supporto notifiche push (PWA)

### 🎨 UI/UX Moderna
- Design responsive per tutti i dispositivi
- Supporto tema Scuro/Chiaro
- Animazioni fluide con Framer Motion
- Effetti di card in glass-morphism
- Navigazione intuitiva con breadcrumb
- Pronto per Progressive Web App (PWA)

---

## 🛠 Stack Tecnologico

### Frontend
| Tecnologia | Utilizzo |
|------------|----------|
| **Next.js 16** | Framework React con App Router |
| **React 19** | Libreria di componenti UI |
| **TypeScript** | Sviluppo tipizzato |
| **Tailwind CSS 4** | Stili utility |
| **Radix UI** | Primitive di componenti accessibili |
| **Framer Motion** | Libreria di animazioni |
| **Lucide React** | Sistema di icone |
| **React Hook Form** | Gestione dei form |
| **TanStack Query** | Gestione dello stato server |
| **Zod** | Validazione di schema |

### Backend
| Tecnologia | Utilizzo |
|------------|----------|
| **Next.js API Routes** | Endpoint API backend |
| **Prisma** | ORM database |
| **PostgreSQL** | Database principale (Supabase) |
| **Lucia Auth** | Autenticazione |
| **Argon2** | Hashing delle password |
| **Redis (Upstash)** | Cache & rate limiting |

### Infrastruttura
| Tecnologia | Utilizzo |
|------------|----------|
| **AWS S3** | Storage dei file |
| **Supabase** | Hosting database |
| **Vercel** | Piattaforma di deployment |
| **Resend** | Notifiche email |

---

## 🚀 Installazione

### Prerequisiti
- Node.js >= 24.0.0
- pnpm >= 10.12.1
- Database PostgreSQL (Supabase consigliato)
- Bucket AWS S3 (per il caricamento dei file)

### Guida all'Installazione

1. **Clonare il repository**
```bash
git clone https://github.com/your-org/ticket-support-app.git
cd ticket-support-app
```

2. **Installare le dipendenze**
```bash
pnpm install
```

3. **Configurare le variabili d'ambiente**
```bash
cp .env.example .env
```

Variabili d'ambiente richieste:
```env
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Autenticazione
LUCIA_SECRET="la-tua-chiave-segreta"

# AWS S3
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_REGION="us-east-1"
AWS_S3_BUCKET="nome-del-tuo-bucket"

# Redis (opzionale)
UPSTASH_REDIS_REST_URL="..."
UPSTASH_REDIS_REST_TOKEN="..."

# Email (opzionale)
RESEND_API_KEY="..."
```

4. **Configurare il database**
```bash
pnpm prisma generate
pnpm prisma db push
```

5. **Inizializzare i dati (opzionale)**
```bash
pnpm prisma-seed
pnpm add-all-categories
```

6. **Avviare il server di sviluppo**
```bash
pnpm dev
```

Apri [http://localhost:3000](http://localhost:3000) per vedere l'applicazione.

---

## 📁 Architettura

```
src/
├── app/                    # Pagine Next.js App Router
│   ├── api/               # Route API
│   ├── admin/             # Dashboard admin
│   ├── tickets/           # Gestione ticket
│   └── profile/           # Profilo utente
├── components/            # Componenti UI riutilizzabili
│   ├── ui/               # Componenti UI di base
│   └── theme/            # Gestione dei temi
├── features/              # Moduli funzionali
│   ├── auth/             # Autenticazione
│   ├── ticket/           # Logica dei ticket
│   ├── comment/          # Commenti
│   └── category/         # Categorie
├── hooks/                 # Hook React personalizzati
├── lib/                   # Utility e configurazioni
│   ├── prisma/           # Client database
│   └── redis/            # Client cache
├── services/              # Integrazioni servizi esterni
└── validations/           # Schema Zod
```

---

## 📜 Script Disponibili

| Comando | Descrizione |
|---------|-------------|
| `pnpm dev` | Avviare il server di sviluppo |
| `pnpm build` | Build per la produzione |
| `pnpm start` | Avviare il server di produzione |
| `pnpm lint` | Eseguire ESLint |
| `pnpm prisma-seed` | Inizializzare il database |
| `pnpm add-all-categories` | Aggiungere le categorie predefinite |

---

## 🤝 Contributi

I contributi sono benvenuti! Si prega di leggere le nostre linee guida per i contributi prima di inviare una pull request.

---

## 📄 Licenza

Questo progetto è un software proprietario sviluppato da Arinelli Quebec © 2025.

---

