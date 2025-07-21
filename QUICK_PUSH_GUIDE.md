# GHID RAPID: Push la GitHub ContractWizard

## ⚡ PAȘI RAPIZI PENTRU PUSH

### 1. Prin Replit Interface
**În Replit:**
- Caută iconița 🔧 **"Tools"** sau ⚙️ **"Settings"** în sidebar stâng
- Sau caută **"Git"** în panoul lateral
- Click pe **"Connect to GitHub"**
- Autorizează Replit să acceseze GitHub-ul tău
- Selectează repository: **st3phani/ContractWizard**
- Click **"Push changes"**

### 2. Prin Replit Shell (dacă Git e disponibil)
```bash
git init
git remote add origin https://github.com/st3phani/ContractWizard.git
git add .
git commit -m "Contract Manager Application - Complete Implementation"
git push -u origin main
```

### 3. Download + Upload Manual
**Dacă Git nu funcționează în Replit:**

1. **Download din Replit:**
   - Click pe folder-ul root în panoul de fișiere
   - Click dreapta → "Download" (dacă disponibil)
   - SAU download individual foldere importante

2. **Pe computer local:**
   ```bash
   git clone https://github.com/st3phani/ContractWizard.git
   cd ContractWizard
   # Copiază toate fișierele descarcate aici
   git add .
   git commit -m "Initial commit: Contract Manager Application"
   git push origin main
   ```

## 📋 LISTĂ DE VERIFICARE - Fișiere Critice

### ✅ Esențiale (obligatorii):
- [ ] `package.json`
- [ ] `shared/schema.ts`
- [ ] `server/index.ts`
- [ ] `server/routes.ts`
- [ ] `server/storage.ts`
- [ ] `server/db.ts`
- [ ] `client/src/App.tsx`
- [ ] `client/src/main.tsx`
- [ ] `client/index.html`

### ✅ Pagini (importante):
- [ ] `client/src/pages/dashboard.tsx`
- [ ] `client/src/pages/contract-form.tsx`
- [ ] `client/src/pages/templates.tsx`
- [ ] `client/src/pages/beneficiaries.tsx`
- [ ] `client/src/pages/settings.tsx`
- [ ] `client/src/pages/not-found.tsx`

### ✅ Componente (importante):
- [ ] `client/src/components/sidebar.tsx`
- [ ] `client/src/components/stats-cards.tsx`
- [ ] `client/src/components/contract-table.tsx`
- [ ] `client/src/components/contract-modal.tsx`
- [ ] `client/src/components/email-modal.tsx`
- [ ] Toate fișierele din `client/src/components/ui/`

### ✅ Configurare (necesare):
- [ ] `tsconfig.json`
- [ ] `vite.config.ts`
- [ ] `tailwind.config.ts`
- [ ] `drizzle.config.ts`
- [ ] `components.json`
- [ ] `postcss.config.js`

### ✅ CSS și Assets:
- [ ] `client/src/index.css`
- [ ] `client/src/lib/utils.ts`
- [ ] `client/src/lib/queryClient.ts`

## 🚀 VERIFICARE DUPĂ PUSH

Verifică pe GitHub că repository-ul **st3phani/ContractWizard** conține:
- ✅ Structura de foldere corectă
- ✅ Fișierul `package.json` cu toate dependențele
- ✅ Codul complet al aplicației
- ✅ README.md cu instrucțiuni de instalare

## 📝 README.md pentru Repository
```markdown
# ContractWizard

Aplicație avansată de management contracte în limba română.

## 🚀 Caracteristici

- Interface completă în română
- Template-uri de contracte personalizabile  
- Gestionare beneficiari cu căutare
- Auto-populare date companie din setări
- Export contracte ca PDF
- Trimitere contracte prin email
- Dashboard cu statistici în timp real
- Sistem de numere de ordine automate

## 🛠️ Tehnologii

- React 18 + TypeScript
- Express.js + Node.js
- PostgreSQL + Drizzle ORM
- Tailwind CSS + shadcn/ui
- TanStack Query

## 📦 Instalare

\`\`\`bash
npm install
# Configurează DATABASE_URL în .env
npm run db:push
npm run dev
\`\`\`

Aplicația va rula pe http://localhost:5000
```

## ⚠️ TROUBLESHOOTING

**Dacă Git nu funcționează în Replit:**
1. Încearcă să reîncarci pagina Replit
2. Caută "Version Control" sau "Source Control" în meniuri
3. Folosește metoda download manual + upload local

**Dacă nu găsești Git în Replit:**
1. Caută în partea de jos a sidebar-ului
2. Sau în meniul "Tools" / "More tools"
3. Unele versiuni Replit au Git integrat diferit