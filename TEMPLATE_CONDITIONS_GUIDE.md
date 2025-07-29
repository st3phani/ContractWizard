# Ghid pentru Condiții în Template-uri

## Sintaxa Condițiilor

Sistemul de template-uri suportă condiții pentru a afișa conținut diferit în funcție de tipul beneficiarului (Persoană Fizică vs Persoană Juridică).

### Tipuri de Condiții Disponibile

#### 1. `{{#if isCompany}}...{{/if}}`
Afișează conținutul DOAR pentru Persoane Juridice (companii)

**Exemplu:**
```html
{{#if isCompany}}
<p>BENEFICIAR: <strong>{{beneficiary.companyName}}</strong>, cu sediul în {{beneficiary.companyAddress}}, CIF {{beneficiary.companyCui}}</p>
{{/if}}
```

#### 2. `{{#if isIndividual}}...{{/if}}`
Afișează conținutul DOAR pentru Persoane Fizice

**Exemplu:**
```html
{{#if isIndividual}}
<p>BENEFICIAR: <strong>{{beneficiary.name}}</strong>, domiciliat în {{beneficiary.address}}, CNP {{beneficiary.cnp}}</p>
{{/if}}
```

#### 3. `{{#unless isCompany}}...{{/unless}}`
Afișează conținutul pentru toate EXCEPTÂND companiile (echivalent cu `{{#if isIndividual}}`)

#### 4. `{{#unless isIndividual}}...{{/unless}}`
Afișează conținutul pentru toate EXCEPTÂND persoanele fizice (echivalent cu `{{#if isCompany}}`)

## Exemplu Complet de Template cu Condiții

```html
<p style="text-align: center;"><strong>CONTRACT Nr. {{orderNumber}} din {{currentDate}}</strong></p>

<p>Între:</p>
<p><strong>PRESTATOR</strong>: {{provider.name}}</p>

<p>și</p>

{{#if isCompany}}
<p><strong>BENEFICIAR</strong>: <strong>{{beneficiary.companyName}}</strong></p>
<p>Sediul: {{beneficiary.companyAddress}}</p>
<p>CIF: {{beneficiary.companyCui}}</p>
<p>Reprezentant legal: {{beneficiary.companyLegalRepresentative}}</p>
{{/if}}

{{#if isIndividual}}
<p><strong>BENEFICIAR</strong>: <strong>{{beneficiary.name}}</strong></p>
<p>Domiciliul: {{beneficiary.address}}</p>
<p>CNP: {{beneficiary.cnp}}</p>
{{/if}}

<h3>Obiectul contractului</h3>
{{#if isCompany}}
<p>Prestarea serviciilor de consultanță pentru compania beneficiară.</p>
{{/if}}

{{#if isIndividual}}
<p>Prestarea serviciilor pentru persoana fizică beneficiară.</p>
{{/if}}

<h3>Facturare</h3>
{{#if isCompany}}
<p>Facturarea se efectuează lunar, cu termen de plată 30 zile.</p>
{{/if}}

{{#if isIndividual}}
<p>Plata se efectuează la finalizare, în termen de 15 zile.</p>
{{/if}}
```

## Variabile Disponibile în Condiții

### Pentru Persoane Fizice (`isIndividual = true`)
- `{{beneficiary.name}}` - Numele complet
- `{{beneficiary.address}}` - Adresa de domiciliu
- `{{beneficiary.cnp}}` - CNP
- `{{beneficiary.email}}` - Email
- `{{beneficiary.phone}}` - Telefon

### Pentru Persoane Juridice (`isCompany = true`)
- `{{beneficiary.companyName}}` - Numele companiei
- `{{beneficiary.companyAddress}}` - Adresa companiei
- `{{beneficiary.companyCui}}` - CUI companie
- `{{beneficiary.companyRegistrationNumber}}` - Nr. înregistrare
- `{{beneficiary.companyLegalRepresentative}}` - Reprezentant legal
- `{{beneficiary.email}}` - Email companie
- `{{beneficiary.phone}}` - Telefon companie

## Sfaturi de Utilizare

1. **Structură clară**: Folosește condițiile pentru a crea secțiuni clare ale contractului
2. **Variabile specifice**: Folosește variabilele potrivite pentru fiecare tip de beneficiar
3. **Testare**: Testează template-ul cu ambele tipuri de beneficiari
4. **Formatare**: Păstrează formatarea HTML pentru aspect profesional

## Funcționalitate Automată

Sistemul detectează automat tipul beneficiarului pe baza câmpului `isCompany` din baza de date și procesează condițiile corespunzător la generarea contractului.