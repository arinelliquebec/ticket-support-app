# 🎫 Fradema Support Ticket System

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.0.10-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?style=for-the-badge&logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748?style=for-the-badge&logo=prisma)

**A modern and efficient support ticket management platform**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Architecture](#-architecture)

</div>

---

## 🎯 Problems Solved

### For Organizations
- **Centralized Support Management**: Consolidate all support requests in one place, eliminating scattered emails and messages
- **Real-time Tracking**: Monitor ticket status and team performance with live dashboards and KPIs
- **Accountability**: Full audit trail with user assignments, timestamps, and comment history
- **Multi-branch Support**: Manage support tickets across different company branches/locations
- **Data-driven Decisions**: Export reports and analyze metrics to improve service quality

### For Support Teams
- **Priority Management**: Categorize and prioritize tickets (Low, Medium, High, Urgent) for efficient workload management
- **Quick Status Updates**: Streamlined workflow with status transitions (Open → In Progress → Completed)
- **File Attachments**: Receive supporting documents and images for better context
- **Admin Notifications**: Real-time notifications for new and unviewed tickets

### For End Users
- **Easy Ticket Creation**: Intuitive interface to submit support requests with categories and attachments
- **Transparency**: Track ticket progress and receive updates through comments
- **Self-service Portal**: View ticket history and status without contacting support

---

## ✨ Features

### 🎫 Ticket Management
- Create, edit, and delete support tickets
- Rich text descriptions up to 1024 characters
- Category-based organization with custom colors
- Priority levels: Low, Medium, High, Urgent
- Status workflow: Open → In Progress → Completed
- Branch/location assignment
- Deadline tracking

### 📎 File Attachments
- Drag-and-drop file upload
- Support for multiple file types
- 10MB file size limit per attachment
- AWS S3 cloud storage integration
- Secure file access with presigned URLs

### 💬 Comments System
- Thread-based discussions on tickets
- Real-time comment updates
- User attribution for all comments
- Edit and delete capabilities

### 📊 Dashboard & Analytics
- Real-time KPI dashboard
- Ticket distribution by status
- Priority breakdown visualization
- Resolution rate tracking
- SLA compliance monitoring
- Branch distribution analysis
- Export to PDF/Excel

### 👥 User Management
- Secure authentication with Lucia Auth
- Role-based access control (User/Admin)
- Custom avatar uploads
- Profile management
- Session management

### 🔔 Notifications
- Admin notifications for new tickets
- Unviewed ticket badges
- Real-time updates via websockets
- Push notification support (PWA)

### 🎨 Modern UI/UX
- Responsive design for all devices
- Dark/Light theme support
- Smooth animations with Framer Motion
- Glass-morphism card effects
- Intuitive navigation with breadcrumbs
- Progressive Web App (PWA) ready

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework with App Router |
| **React 19** | UI component library |
| **TypeScript** | Type-safe development |
| **Tailwind CSS 4** | Utility-first styling |
| **Radix UI** | Accessible component primitives |
| **Framer Motion** | Animation library |
| **Lucide React** | Icon system |
| **React Hook Form** | Form management |
| **TanStack Query** | Server state management |
| **Zod** | Schema validation |

### Backend
| Technology | Purpose |
|------------|---------|
| **Next.js API Routes** | Backend API endpoints |
| **Prisma** | Database ORM |
| **PostgreSQL** | Primary database (Supabase) |
| **Lucia Auth** | Authentication |
| **Argon2** | Password hashing |
| **Redis (Upstash)** | Caching & rate limiting |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| **AWS S3** | File storage |
| **Supabase** | Database hosting |
| **Vercel** | Deployment platform |
| **Resend** | Email notifications |

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 24.0.0
- pnpm >= 10.12.1
- PostgreSQL database (Supabase recommended)
- AWS S3 bucket (for file uploads)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-org/ticket-support-app.git
cd ticket-support-app
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

Required environment variables:
```env
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Authentication
LUCIA_SECRET="your-secret-key"

# AWS S3
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_REGION="us-east-1"
AWS_S3_BUCKET="your-bucket-name"

# Redis (optional)
UPSTASH_REDIS_REST_URL="..."
UPSTASH_REDIS_REST_TOKEN="..."

# Email (optional)
RESEND_API_KEY="..."
```

4. **Set up the database**
```bash
pnpm prisma generate
pnpm prisma db push
```

5. **Seed initial data (optional)**
```bash
pnpm prisma-seed
pnpm add-all-categories
```

6. **Start the development server**
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📁 Architecture

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── admin/             # Admin dashboard
│   ├── tickets/           # Ticket management
│   └── profile/           # User profile
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   └── theme/            # Theme management
├── features/              # Feature modules
│   ├── auth/             # Authentication
│   ├── ticket/           # Ticket logic
│   ├── comment/          # Comments
│   └── category/         # Categories
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and configurations
│   ├── prisma/           # Database client
│   └── redis/            # Cache client
├── services/              # External service integrations
└── validations/           # Zod schemas
```

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm prisma-seed` | Seed the database |
| `pnpm add-all-categories` | Add default categories |

---

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting a pull request.

---

## 📄 License

This project is proprietary software developed by Fradema Tax Consulting © 2025.

---

<div align="center">

**Developed with ❤️ by the Fradema Development Team**

</div>

