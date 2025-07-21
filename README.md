# ContractWizard

Aplicație avansată de management contracte dezvoltată în limba română.

## 🚀 Caracteristici

- **Interface completă în română** - Toate textele și mesajele în română
- **Template-uri de contracte personalizabile** - Sistem flexibil de placeholder-uri
- **Gestionare beneficiari cu căutare** - Evitare duplicate și căutare rapidă
- **Auto-populare date companie** - Date prestator din setări
- **Export contracte ca PDF** - Generare automată documente
- **Trimitere contracte prin email** - Integrare nodemailer
- **Dashboard cu statistici** - Monitorizare în timp real
- **Sistem numere ordine automate** - Format CNT-YYYY-XXXXXX

## 🛠️ Stack Tehnologic

### Frontend
- **React 18** cu TypeScript
- **Tailwind CSS** pentru styling
- **shadcn/ui** pentru componente
- **TanStack Query** pentru state management
- **React Hook Form** cu validare Zod
- **Wouter** pentru routing

### Backend  
- **Node.js** cu Express.js
- **TypeScript** pentru type safety
- **PostgreSQL** cu Drizzle ORM
- **Neon Database** pentru hosting
- **jsPDF** pentru generare PDF
- **Nodemailer** pentru email

## 📦 Instalare și Configurare

### Cerințe
- Node.js 18+
- PostgreSQL database
- Cont email pentru SMTP (opțional)

### Pași de instalare
```bash
# Clonează repository
git clone https://github.com/st3phani/ContractWizard.git
cd ContractWizard

# Instalează dependențele
npm install

# Configurează variabilele de mediu
cp .env.example .env
# Editează .env cu DATABASE_URL

# Rulează migrările bazei de date
npm run db:push

# Pornește aplicația în modul development
npm run dev
```

Aplicația va fi disponibilă la http://localhost:5000

## 🌐 Variabile de Mediu

Creează fișier `.env` cu următoarele variabile:

```env
# Bază de date PostgreSQL (obligatoriu)
DATABASE_URL="postgresql://username:password@host:port/database"

# Email SMTP (opțional - pentru funcționalitatea email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 📁 Structura Proiectului

```
ContractWizard/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componente UI
│   │   ├── pages/          # Pagini aplicație
│   │   ├── hooks/          # Custom hooks
│   │   └── lib/            # Utilitare
├── server/                 # Backend Express
│   ├── index.ts           # Server principal
│   ├── routes.ts          # API endpoints
│   ├── storage.ts         # Logica bazei de date
│   └── db.ts              # Conexiune PostgreSQL
├── shared/                 # Tipuri comune
│   └── schema.ts          # Schema Drizzle ORM
└── [configurare files]
```

## 🎯 Funcționalități Implementate

### ✅ Management Contracte
- Creare contracte cu template-uri personalizabile
- Auto-generare numere de ordine unice
- Completare automată date prestator din setări
- Export PDF cu formatare profesională
- Trimitere contracte prin email către beneficiari

### ✅ Management Beneficiari
- CRUD complet pentru beneficiari
- Căutare și filtrare rapidă
- Prevențiire duplicate prin verificare email
- Auto-completare în formulare

### ✅ Template-uri Contracte
- Editor template-uri cu placeholder-uri
- Preview în timp real
- Sistem de câmpuri dinamice
- Template-uri predefinite

### ✅ Dashboard și Statistici
- Statistici contracte în timp real
- Filtrare pe status (draft, trimis, completat)
- Tabel interactiv cu acțiuni rapide
- Cards cu metrici importante

### ✅ Setări Aplicație
- Configurare date companie
- Persistență în baza de date
- Auto-populare în contracte noi

## 🚀 Comenzi Disponibile

```bash
# Development
npm run dev              # Pornește serverul de development

# Build pentru producție
npm run build           # Build client și server
npm run build:client    # Build doar frontend
npm run build:server    # Build doar backend

# Producție
npm start               # Pornește serverul de producție

# Baza de date
npm run db:push         # Sincronizează schema cu baza de date
npm run db:generate     # Generează migrări
npm run db:studio       # Deschide Drizzle Studio
```

## 📋 Utilizare

### 1. Configurare Inițială
- Accesează pagina **Setări**
- Completează informațiile companiei (nume, adresă, CUI, etc.)
- Salvează setările

### 2. Creare Template-uri
- Mergi la pagina **Template-uri**
- Creează template-uri cu placeholder-uri: `{{beneficiary.name}}`, `{{provider.name}}`
- Salvează template-urile

### 3. Gestionare Beneficiari
- Adaugă beneficiari în pagina **Beneficiari**
- Completează informații complete pentru auto-populare

### 4. Creare Contracte
- Folosește formularul **Contract Nou**
- Selectează template și beneficiar
- Completează detaliile contractului
- Salvează - datele companiei se populează automat

### 5. Gestionare Contracte
- Vizualizează toate contractele în **Dashboard**
- Exportă ca PDF sau trimite prin email
- Actualizează statusul contractelor

## 🔧 Dezvoltare

### Adăugare Funcționalități Noi
1. **Frontend**: Adaugă componente în `client/src/components/`
2. **Backend**: Extinde API-ul în `server/routes.ts`
3. **Bază de date**: Modifică schema în `shared/schema.ts`
4. **Tipuri**: Actualizează tipurile TypeScript în `shared/`

### Debugging
- Verifică consolele browser și server pentru erori
- Folosește Drizzle Studio pentru debugging baza de date
- Logs automate pentru toate requesturile API

## 📄 Licență

Acest proiect este dezvoltat pentru uz personal/comercial.

## 🤝 Contribuții

Pentru întrebări sau îmbunătățiri, contactează dezvoltatorul.

---

**Dezvoltat cu ❤️ pentru management eficient de contracte în România**