# Contract Manager - Structura Completă a Fișierelor

## 📁 Structura Proiectului

```
contract-manager/
├── 📁 client/                          # Frontend React
│   ├── 📄 index.html                   # Pagina principală HTML
│   └── 📁 src/
│       ├── 📁 components/              # Componente reutilizabile
│       │   ├── 📁 ui/                  # Componente UI (shadcn/ui)
│       │   │   ├── 📄 accordion.tsx
│       │   │   ├── 📄 alert-dialog.tsx
│       │   │   ├── 📄 alert.tsx
│       │   │   ├── 📄 aspect-ratio.tsx
│       │   │   ├── 📄 avatar.tsx
│       │   │   ├── 📄 badge.tsx
│       │   │   ├── 📄 breadcrumb.tsx
│       │   │   ├── 📄 button.tsx
│       │   │   ├── 📄 calendar.tsx
│       │   │   ├── 📄 card.tsx
│       │   │   ├── 📄 carousel.tsx
│       │   │   ├── 📄 chart.tsx
│       │   │   ├── 📄 checkbox.tsx
│       │   │   ├── 📄 collapsible.tsx
│       │   │   ├── 📄 command.tsx
│       │   │   ├── 📄 context-menu.tsx
│       │   │   ├── 📄 dialog.tsx
│       │   │   ├── 📄 drawer.tsx
│       │   │   ├── 📄 dropdown-menu.tsx
│       │   │   ├── 📄 form.tsx
│       │   │   ├── 📄 hover-card.tsx
│       │   │   ├── 📄 input.tsx
│       │   │   ├── 📄 input-otp.tsx
│       │   │   ├── 📄 label.tsx
│       │   │   ├── 📄 menubar.tsx
│       │   │   ├── 📄 navigation-menu.tsx
│       │   │   ├── 📄 pagination.tsx
│       │   │   ├── 📄 popover.tsx
│       │   │   ├── 📄 progress.tsx
│       │   │   ├── 📄 radio-group.tsx
│       │   │   ├── 📄 resizable.tsx
│       │   │   ├── 📄 scroll-area.tsx
│       │   │   ├── 📄 select.tsx
│       │   │   ├── 📄 separator.tsx
│       │   │   ├── 📄 sheet.tsx
│       │   │   ├── 📄 sidebar.tsx
│       │   │   ├── 📄 skeleton.tsx
│       │   │   ├── 📄 slider.tsx
│       │   │   ├── 📄 switch.tsx
│       │   │   ├── 📄 table.tsx
│       │   │   ├── 📄 tabs.tsx
│       │   │   ├── 📄 textarea.tsx
│       │   │   ├── 📄 toast.tsx
│       │   │   ├── 📄 toaster.tsx
│       │   │   ├── 📄 toggle.tsx
│       │   │   ├── 📄 toggle-group.tsx
│       │   │   └── 📄 tooltip.tsx
│       │   ├── 📄 sidebar.tsx           # Navigația laterală
│       │   ├── 📄 stats-cards.tsx      # Carduri cu statistici
│       │   ├── 📄 contract-table.tsx   # Tabelul cu contracte
│       │   ├── 📄 contract-modal.tsx   # Modal pentru vizualizare contract
│       │   └── 📄 email-modal.tsx      # Modal pentru trimitere email
│       ├── 📁 hooks/                   # Custom React hooks
│       │   ├── 📄 use-toast.ts         # Hook pentru notificări
│       │   └── 📄 use-mobile.tsx       # Hook pentru detectare mobil
│       ├── 📁 lib/                     # Utilitare și configurări
│       │   ├── 📄 utils.ts             # Funcții utilitare
│       │   └── 📄 queryClient.ts       # Configurare TanStack Query
│       ├── 📁 pages/                   # Paginile aplicației
│       │   ├── 📄 dashboard.tsx        # Pagina principală cu statistici
│       │   ├── 📄 contract-form.tsx    # Formular creare contracte
│       │   ├── 📄 templates.tsx        # Gestionare template-uri
│       │   ├── 📄 beneficiaries.tsx    # Gestionare beneficiari
│       │   ├── 📄 settings.tsx         # Setări aplicație și companie
│       │   └── 📄 not-found.tsx        # Pagină 404
│       ├── 📄 App.tsx                  # Componenta principală și routing
│       ├── 📄 main.tsx                 # Entry point React
│       └── 📄 index.css                # Stiluri globale și Tailwind
├── 📁 server/                          # Backend Node.js/Express
│   ├── 📄 index.ts                     # Server principal Express
│   ├── 📄 routes.ts                    # Toate rutele API REST
│   ├── 📄 storage.ts                   # Interface și implementare storage
│   ├── 📄 db.ts                        # Configurare conexiune PostgreSQL
│   └── 📄 vite.ts                      # Configurare Vite pentru development
├── 📁 shared/                          # Tipuri și scheme partajate
│   └── 📄 schema.ts                    # Schema Drizzle ORM și tipuri TypeScript
├── 📄 package.json                     # Dependențe și scripturi npm
├── 📄 tsconfig.json                    # Configurare TypeScript
├── 📄 vite.config.ts                   # Configurare Vite build tool
├── 📄 tailwind.config.ts               # Configurare Tailwind CSS
├── 📄 postcss.config.js                # Configurare PostCSS
├── 📄 drizzle.config.ts                # Configurare Drizzle ORM
├── 📄 components.json                  # Configurare shadcn/ui
└── 📄 replit.md                        # Documentație proiect
```

## 🔧 Fișiere de Configurare

| Fișier | Scop |
|--------|------|
| `package.json` | Dependențe npm și scripturi |
| `tsconfig.json` | Configurare compilator TypeScript |
| `vite.config.ts` | Configurare build tool și aliases |
| `tailwind.config.ts` | Configurare framework CSS |
| `postcss.config.js` | Procesare CSS |
| `drizzle.config.ts` | Configurare ORM pentru baza de date |
| `components.json` | Configurare componente shadcn/ui |

## 🗂️ Structura pe Funcționalități

### 📊 Dashboard & Statistici
- `client/src/pages/dashboard.tsx` - Pagina principală
- `client/src/components/stats-cards.tsx` - Carduri cu statistici
- `client/src/components/contract-table.tsx` - Tabel contracte

### 📝 Gestionare Contracte
- `client/src/pages/contract-form.tsx` - Formular creare
- `client/src/components/contract-modal.tsx` - Vizualizare contract
- `client/src/components/email-modal.tsx` - Trimitere email

### 👥 Gestionare Beneficiari
- `client/src/pages/beneficiaries.tsx` - CRUD beneficiari

### 📄 Template-uri Contracte
- `client/src/pages/templates.tsx` - CRUD template-uri

### ⚙️ Setări Aplicație
- `client/src/pages/settings.tsx` - Setări companie și aplicație

### 🔌 API Backend
- `server/routes.ts` - Toate endpoint-urile REST API
- `server/storage.ts` - Logica CRUD pentru baza de date
- `server/db.ts` - Conexiune PostgreSQL

### 🎨 Interfață Utilizator
- `client/src/components/ui/` - Componente UI reutilizabile
- `client/src/components/sidebar.tsx` - Navigația laterală
- `client/src/index.css` - Stiluri globale

## 📋 Funcționalități Implementate

### ✅ Funcționalități Complete
- 🏠 Dashboard cu statistici contracte
- 📝 Creare contracte cu auto-populare date companie
- 👥 Gestionare beneficiari (CRUD complet)
- 📄 Gestionare template-uri contracte
- 📨 Trimitere contracte prin email
- 📥 Export contracte ca PDF
- ⚙️ Setări companie cu salvare în baza de date
- 🔍 Căutare beneficiari în formular
- 📊 Statistici în timp real
- 🗂️ Interface în limba română

### 🔧 Tehnologii Utilizate
- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express.js, TypeScript
- **Baza de date**: PostgreSQL cu Drizzle ORM
- **State Management**: TanStack Query
- **Build Tool**: Vite
- **Styling**: Tailwind CSS cu theme customizat
- **Forms**: React Hook Form cu validare Zod

### 📦 Dependențe Principale
- **UI Components**: @radix-ui (shadcn/ui base)
- **Database**: @neondatabase/serverless, drizzle-orm
- **Forms**: react-hook-form, @hookform/resolvers
- **HTTP Client**: TanStack Query
- **PDF Generation**: jspdf, html2canvas
- **Email**: nodemailer
- **Icons**: lucide-react
- **Routing**: wouter (lightweight)

## 🚀 Comenzi de Rulare

```bash
# Development
npm run dev

# Build pentru producție
npm run build

# Pornire server producție
npm run start

# Migrări baza de date
npm run db:push
npm run db:generate
npm run db:studio
```

## 🌐 Structura URL-urilor

| Rută | Pagină | Descriere |
|------|--------|-----------|
| `/` | Dashboard | Pagina principală cu statistici |
| `/contract-form` | Formular | Creare contracte noi |
| `/templates` | Template-uri | Gestionare template-uri |
| `/beneficiaries` | Beneficiari | Gestionare beneficiari |
| `/settings` | Setări | Configurare companie |

## 🔗 API Endpoints

| Method | Endpoint | Descriere |
|--------|----------|-----------|
| GET | `/api/contracts` | Lista contracte |
| POST | `/api/contracts` | Creare contract nou |
| GET | `/api/contracts/:id` | Detalii contract |
| PUT | `/api/contracts/:id` | Actualizare contract |
| DELETE | `/api/contracts/:id` | Ștergere contract |
| GET | `/api/contracts/stats` | Statistici contracte |
| GET | `/api/contracts/:id/preview` | Preview contract |
| GET | `/api/contracts/:id/pdf` | Download PDF |
| POST | `/api/contracts/:id/email` | Trimitere email |
| GET/POST/PUT/DELETE | `/api/beneficiaries` | CRUD beneficiari |
| GET/POST/PUT/DELETE | `/api/contract-templates` | CRUD template-uri |
| GET/PUT | `/api/company-settings` | Setări companie |