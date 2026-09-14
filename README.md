# MOGE Document Management & Enterprise Intelligence System — Frontend Client

[![React](https://img.shields.io/badge/React-19.0-61DAFB.svg?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6.svg?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646CFF.svg?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC.svg?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![React Router](https://img.shields.io/badge/React_Router-7.1-CA4245.svg?style=flat&logo=react-router&logoColor=white)](https://reactrouter.com/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED.svg?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-Proprietary%20%2F%20Enterprise-blue.svg?style=flat)](#)

> **Modern Single Page Application (SPA) web client for the Myanmar Oil and Gas Enterprise (MOGE) Document Management and AI Document Intelligence Platform.**

---

## 📌 Overview

The **MOGE DMS Frontend** is an enterprise-grade administrative dashboard and document intelligence interface built with **React 19**, **TypeScript**, **Vite 6**, and **Tailwind CSS v4**. It interfaces directly with the Django REST Framework backend to provide secure document lifecycle management, AI-driven conversational querying (Google Gemini RAG), line-by-line Unicode deep search, human resource tracking, facility administration, and dynamic role-based access control.

---

## ✨ Key Features & Modules

### 1. 📄 Document Management System (DMS)
- **Lifecycle Management**: Multi-tier tracking from **Active** ➔ **Archive** (`is_archived`) ➔ **Recycle Bin** (`is_recycled`) ➔ **Permanent Purge / Restore**.
- **In-Browser Document Preview**: Instant viewing of PDFs, Word documents (`.docx`), and Excel spreadsheets (`.xlsx`) via `@cyntler/react-doc-viewer`.
- **Export Capabilities**: Client-side document export to PDF (with `jspdf` & `jspdf-autotable`), Word (`docx`), and Excel (`xlsx`).
- **Classification & Categorization**: Recursive folder/category hierarchy and administrative document format types (`dtype`).
- **Auditing & Expiration Alerts**: Automatic tracking of document expiration dates with visual urgency indicators.

### 2. 🤖 AI Assistant & Deep Search Intelligence
- **RAG Chatbot Assistant**: Interactive conversational assistant powered by Google Gemini (2.5 Flash / Pro) and ChromaDB vector embeddings. Generates contextual answers with inline document source citations, page numbers, and direct source preview links.
- **Deep Search Engine**: Precise, line-by-line Unicode-normalized search inside document contents, pinpointing exact line numbers, page numbers, and preview snippets.

### 3. 👥 Human Resources (HR) & Personnel Management
- **Staff Directory**: Detailed employee profiles, ranks, roles, and departmental associations.
- **Career & Personnel Milestones**:
  - Promotions & rank advancement tracking
  - Departmental and regional transfer records
  - Staff training programs and scheduling
  - Overseas official duties and foreign missions
  - Honors, medals, and award registry
  - Disciplinary actions and punishment records
  - Comprehensive HR analytical summary reports

### 4. 🏢 Facilities & Geospatial Activity Tracking
- **Facilities Registry**: Structured directory of organizational departments, campus buildings, and office rooms.
- **Activity Records / GIS Mapping**: Geographic photo activity logging with GPS coordinates, field site metadata, and photographic evidence.

### 5. 📊 Executive Analytics & Dashboards
- **Overview Dashboard**: Real-time KPI summary cards, document upload activity trends, category distribution, and recent updates.
- **Document Analytics**: Visual breakdown of documents by category, department, format type, and status using interactive **ApexCharts**.
- **Interactive Calendar**: Event and operational schedule management using **FullCalendar**.

### 6. 🔐 Security, Permissions & Dynamic Control
- **JWT Authentication & Silent Refresh**: Secure token management with Axios interceptors automatically handling silent refresh (`/api/auth/token/refresh/`) and session protection.
- **Role-Based Access Control (RBAC)**: Route-level protection via `ProtectedRoute` supporting Super Admin, Admin, and User access levels.
- **Dynamic Module Control**: Admin toggle interface (`/modules`) to enable or disable system features on demand across the entire UI.
- **Granular Permissions Matrix**: Configurable View, Add, Edit, and Delete permissions per module and user role (`/settings/user-roles`).
- **Audit Logs**: Transparent audit trail tracking all user operations, logins, document modifications, and deletion actions.

### 7. 🌐 Localization & Modern UI/UX
- **Bilingual Support (i18n)**: Instant one-click toggle between **English** and **Myanmar Unicode** (Burmese) across all views and tables.
- **Theme Modes**: Full **Dark Mode** and **Light Mode** styling tailored for high-contrast enterprise usability.
- **Responsive Layout**: Optimized for desktop workstations, tablets, and mobile devices with collapsible navigation and quick-access widgets.

---

## 🛠️ Technology Stack

| Domain | Technology / Library | Version | Description |
| :--- | :--- | :--- | :--- |
| **Core Framework** | [React](https://react.dev/) | `^19.0.0` | Declarative UI framework |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | `~5.7.2` | Static typing & interface definitions |
| **Build Tool** | [Vite](https://vitejs.dev/) | `^6.1.0` | Next-generation frontend tooling |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | `^4.0.8` | Utility-first CSS engine (v4) |
| **Routing** | [React Router](https://reactrouter.com/) | `^7.1.5` | Client-side declarative routing |
| **Data Fetching** | [Axios](https://axios-http.com/) & [SWR](https://swr.vercel.app/) | `^1.13.2` / `^2.3.8` | HTTP client with retry interceptors & reactive data caching |
| **Charts** | [ApexCharts](https://apexcharts.com/) | `^4.1.0` | Interactive charts & data visualizers |
| **Calendar** | [FullCalendar](https://fullcalendar.io/) | `^6.1.15` | Month, week, day, and list calendar views |
| **Tables** | [TanStack Table](https://tanstack.com/table) | `^8.21.3` | Headless sortable & filterable tables |
| **Doc Viewer** | [@cyntler/react-doc-viewer](https://github.com/cyntler/react-doc-viewer) | `^1.17.1` | Document renderer (PDF, DOCX, XLSX) |
| **Document Export**| `jspdf`, `jspdf-autotable`, `docx`, `xlsx` | Latest | PDF, DOCX, and spreadsheet generation |
| **Localization** | [i18next](https://www.i18next.com/) & `react-i18next` | `^26.0.8` / `^17.0.4` | Bilingual English & Myanmar translation |
| **Icons** | [Lucide React](https://lucide.dev/) & SVGR | `^0.562.0` | Clean vector iconography |
| **Local SSL** | [vite-plugin-mkcert](https://github.com/liuweiGL/vite-plugin-mkcert) | `^2.1.0` | Automatic trusted HTTPS for local development |

---

## 📁 Project Architecture

```
project/frontend/
├── certs/                     # SSL certificates for local HTTPS server & Nginx
├── public/                    # Static assets (favicons, logos, brand images)
├── src/
│   ├── api/                   # Typed API service modules (Axios)
│   │   ├── auth/              # Sign-in, sign-up, user session APIs
│   │   ├── chatApi.ts         # Gemini AI RAG Chatbot & document upload API
│   │   ├── documentApi.ts     # Document CRUD, search, deep search, archive, recycle
│   │   ├── dashboardApi.ts    # KPI metrics, analytics, and chart summaries
│   │   ├── staffApi.ts        # HR staff records & profile APIs
│   │   ├── locationApi.ts     # Geospatial activity & photo records
│   │   └── ...                # Departments, Buildings, Rooms, Roles, Ranks, Logs
│   ├── components/            # Reusable UI component library
│   │   ├── common/            # Buttons, modals, dropdowns, inputs, loaders
│   │   ├── ecommerce/         # Analytics charts, KPI metric cards, tabs
│   │   ├── form/              # Specialized forms, datepickers, ChatCard
│   │   └── tables/            # Reusable data table layouts
│   ├── context/               # Global state contexts (AuthContext, SidebarContext, ThemeContext)
│   ├── helpers/               # HTTP client interceptors (`api.ts`), formatters, utilities
│   ├── hooks/                 # Custom SWR and React data hooks
│   ├── icons/                 # SVG icon assets and Lucide wrappers
│   ├── interfaces/            # TypeScript schemas (Documents, Users, HR, Locations, Auth)
│   ├── layout/                # AppLayout, AppHeader, AppSidebar, Backdrop
│   ├── pages/                 # Route page components
│   │   ├── Archives/          # Archived documents management
│   │   ├── AuthPages/         # SignIn & SignUp authentication views
│   │   ├── Buildings/         # Facility buildings administration
│   │   ├── Categories/        # Document classification categories
│   │   ├── Dashboard/         # Overview, Document Analytics, Location Dashboards
│   │   ├── Departments/       # Department structures
│   │   ├── Documents/         # Document repository, upload, and Deep Search
│   │   ├── Dtypes/            # Document format types
│   │   ├── Locations/         # GIS photo activity records
│   │   ├── Logs/              # System audit and activity logs
│   │   ├── Modules/           # System-wide module enablement control
│   │   ├── Ranks/             # Staff rank classifications
│   │   ├── Recycles/          # Document recycle bin & recovery
│   │   ├── Roles/             # Staff & system roles
│   │   ├── Rooms/             # Office rooms management
│   │   ├── Settings/          # User roles & permission matrix settings
│   │   ├── Staffs/            # HR employee registration & records
│   │   ├── Stypes/            # Staff employment types
│   │   └── Users/             # User accounts & AI Chatbot assistant
│   ├── security/              # Route guards (`ProtectedRoute.tsx`)
│   ├── translate/             # i18n localization dictionary (English & Burmese)
│   ├── utils/                 # ModuleManager & UserRoleManager persistence
│   ├── App.tsx                # Application router configuration & routes
│   ├── main.tsx               # Application root entrypoint & provider mounting
│   └── index.css              # Global styling & Tailwind CSS v4 directives
├── Dockerfile                 # Multi-stage production container build (Node 22 + Nginx)
├── nginx.conf                 # Production Nginx reverse proxy & SSL config
├── package.json               # Dependencies and build scripts
├── tsconfig.json              # TypeScript compilation configuration
└── vite.config.ts             # Vite server, SVGR, and mkcert SSL configuration
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: `v18.x` or later (Recommended: `Node.js 20.x` or `Node.js 22.x`)
- **npm**: `v9.x` or later (or `yarn` / `pnpm`)
- **Backend API**: Running instance of the [MOGE Backend API](https://github.com/Jayyy-mark/dms-backend) (Django 5.2)

### 1. Clone the Repository
```bash
git clone https://github.com/Jayyy-mark/dms-frontend.git
cd dms-frontend
```

### 2. Configure Environment Variables
Copy the sample environment file or create a `.env` in the root of `project/frontend`:

```bash
cp .env.example .env
```

Define the backend API server endpoint:
```env
# URL pointing to your Django backend service
VITE_API_SERVER=https://127.0.0.1:8000
```

> **Note:** If deploying across a local area network (LAN), update `VITE_API_SERVER` with the server's network IP (e.g. `https://192.168.20.219:8000`).

### 3. Install Dependencies
```bash
npm install
```

> If you encounter peer dependency conflicts on older environments, run:
> ```bash
> npm install --legacy-peer-deps
> ```

### 4. Run Development Server
```bash
npm run dev
```

The application will start with local HTTPS support enabled. Access the web interface in your browser:
```
https://localhost:5173
```

---

## 🔒 Local SSL Development (`mkcert`)

The frontend uses `vite-plugin-mkcert` to provide seamless, trusted local HTTPS certificates, preventing browser mixed-content and cookie security blocks:

1. **Install mkcert** (one-time setup on your machine):
   ```powershell
   # Windows (PowerShell with Admin):
   Invoke-WebRequest -Uri "https://dl.filippo.io/mkcert/latest?for=windows/amd64" -OutFile "$env:windir\System32\mkcert.exe"
   mkcert -install
   ```
2. Certificates will automatically generate or can be placed in `certs/` for Nginx and Vite.

---

## 🐳 Docker Deployment

The frontend includes a multi-stage Docker build that compiles static production assets with **Node 22** and serves them using **Nginx Alpine** with HTTP/2 and SSL termination:

### Build and Run with Docker
```bash
# Build the Docker image
docker build -t mogs-dms-frontend .

# Run the container
docker run -d -p 443:443 -p 80:80 --name dms-frontend mogs-dms-frontend
```

### Docker Compose (Full Stack)
To run the entire system (MySQL + Django Backend + React Frontend):
```bash
# From the project root
docker-compose up --build -d
```
The frontend dashboard will be available at `http://localhost:3000` (or `https://localhost:5050` depending on your reverse proxy configuration).

---

## 📜 Available Scripts

In the project directory, you can run:

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts the Vite development server with hot module replacement (HMR) and HTTPS |
| `npm run build` | Compiles TypeScript (`tsc -b`) and bundles production assets via Vite |
| `npm run preview` | Locally serves the production build from `dist/` |
| `npm run lint` | Runs ESLint to check for code quality and syntax issues |
| `npm run start` | Previews the build on a dynamic host/port specified by `$PORT` |

---

## 🔐 Default Access & User Roles

The system is equipped with role-based routing guards:

| Role | Access Scope |
| :--- | :--- |
| **Super Admin** | Full access to all modules, system configuration, deep search, audit logs, and permission editors |
| **Admin** | Access to document management, HR employee registers, facility directories, reports, and AI assistant |
| **User** | Access to permitted document views, uploads, and assigned operational modules |

---

## 🤝 Related Repositories

- **Backend Repository**: [Jayyy-mark/dms-backend](https://github.com/Jayyy-mark) — Django 5.2 REST Framework & Google Gemini / ChromaDB RAG Engine.
- **Documentation**: See `DOCUMENTATION.md` in the root workspace for comprehensive architectural specifications, database schemas, and AI pipeline documentation.

---

## 📄 License

This software is developed for the Myanmar Oil and Gas Enterprise (MOGE). All rights reserved.
