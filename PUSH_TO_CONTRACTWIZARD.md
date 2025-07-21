# Instrucțiuni Push către ContractWizard Repository

## Repository Destinație
https://github.com/st3phani/ContractWizard

## Metoda 1: Prin Replit Git Integration

### Pasul 1: Conectează Repository în Replit
1. În Replit, caută tab-ul **"Git"** sau **"Version Control"** în sidebar
2. Click pe **"Connect to Git Repository"** 
3. Introdu URL-ul: `https://github.com/st3phani/ContractWizard.git`
4. Autentifică-te cu GitHub credentials

### Pasul 2: Push din Replit
1. În tab-ul Git, vezi toate fișierele modificate
2. Adaugă commit message: "Initial commit: Contract Manager Application"
3. Click **"Commit & Push"**

## Metoda 2: Manual prin Terminal

### Dacă Replit permite Git commands:
```bash
# Inițializează Git (dacă nu e deja)
git init

# Adaugă remote repository
git remote add origin https://github.com/st3phani/ContractWizard.git

# Adaugă toate fișierele
git add .

# Commit cu mesaj descriptiv
git commit -m "Initial commit: Contract Manager Application

Features:
- Full-stack TypeScript application
- React frontend with shadcn/ui components
- Express.js backend with PostgreSQL
- Romanian language interface
- Contract templates management
- Beneficiaries management
- PDF generation and email functionality
- Company settings with auto-population
- Dashboard with real-time statistics"

# Push la GitHub
git push -u origin main
```

## Metoda 3: Download + Upload Manual

### Pasul 1: Download din Replit
1. În panoul de fișiere, selectează folderul root
2. Click dreapta → Download (dacă disponibil)
3. SAU download individual fiecărei componente importante

### Pasul 2: Clone repository local
```bash
git clone https://github.com/st3phani/ContractWizard.git
cd ContractWizard
```

### Pasul 3: Copiază fișierele
Copiază toate fișierele din Replit în folderul clonat:
```
ContractWizard/
├── client/
├── server/
├── shared/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── drizzle.config.ts
├── components.json
├── replit.md
├── STRUCTURA_FISIERE.md
├── GIT_SETUP_INSTRUCTIONS.md
└── README.md
```

### Pasul 4: Commit și Push
```bash
git add .
git commit -m "Initial commit: Contract Manager Application"
git push origin main
```

## Metoda 4: Prin GitHub Web Interface

### Pentru fișiere individuale:
1. Mergi pe https://github.com/st3phani/ContractWizard
2. Click **"Add file"** → **"Create new file"**
3. Creează structura de foldere: `client/src/App.tsx`
4. Copy-paste conținutul din Replit
5. Repeat pentru toate fișierele importante

## Fișiere Critice de Upload

### Prioritate 1 (Essential):
- [ ] `package.json`
- [ ] `shared/schema.ts`
- [ ] `server/index.ts`
- [ ] `server/routes.ts`
- [ ] `server/storage.ts`
- [ ] `server/db.ts`
- [ ] `client/src/App.tsx`
- [ ] `client/src/main.tsx`

### Prioritate 2 (Important):
- [ ] Toate fișierele din `client/src/pages/`
- [ ] Toate fișierele din `client/src/components/`
- [ ] `client/src/index.css`
- [ ] `client/index.html`

### Prioritate 3 (Configuration):
- [ ] `tsconfig.json`
- [ ] `vite.config.ts`
- [ ] `tailwind.config.ts`
- [ ] `drizzle.config.ts`
- [ ] `components.json`

## Verificare Success
După push, verifică pe GitHub că ai:
- ✅ Toate folderele: `client/`, `server/`, `shared/`
- ✅ Fișierul `package.json` cu dependențele complete
- ✅ Fișierele de configurare TypeScript și Vite
- ✅ README.md cu instrucțiuni de instalare

## README.md pentru Repository
```markdown
# ContractWizard

Aplicație avansată de management contracte dezvoltată în română.

## 🚀 Caracteristici

- ✅ **Interface română** - Complet tradusă
- ✅ **Template-uri flexibile** - Sistem de placeholder-uri
- ✅ **Auto-populare** - Date companie din setări
- ✅ **Export PDF** - Generare automată documente
- ✅ **Email integration** - Trimitere contracte
- ✅ **Dashboard** - Statistici în timp real
- ✅ **Căutare beneficiari** - Evitare duplicate

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL + Drizzle ORM
- **State**: TanStack Query
- **Build**: Vite
- **PDF**: jsPDF + html2canvas

## 📦 Instalare

\`\`\`bash
npm install
cp .env.example .env  # Configurează DATABASE_URL
npm run db:push
npm run dev
\`\`\`

## 🔧 Variabile de mediu

\`\`\`env
DATABASE_URL=postgresql://...
\`\`\`

## 📁 Structura

Voir [STRUCTURA_FISIERE.md](STRUCTURA_FISIERE.md) pentru detalii complete.
```

## Ajutor Suplimentar
Dacă întâmpini probleme:
1. Verifică că repository-ul ContractWizard există și ai permisiuni write
2. Asigură-te că ești autentificat cu GitHub în Replit
3. Încearcă prima dată cu câteva fișiere test pentru a verifica conexiunea
```