# Elkjøp · Old Stock Cockpit

Internt verktøy for å jobbe daglig med old stock på Telecom (mobil, nettbrett,
klokker, tilbehør). Last opp den daglige obsolescence-eksporten, så viser appen
hva som **er** old stock, hva som **blir** old stock, daglig bevegelse i
avskrevet verdi, og hvor mye reduksjon teamet oppnår over tid.

> **Personvern:** filen leses og analyseres **kun i nettleseren**. Ingen backend,
> ingenting lastes opp. Hver opplasting lagres lokalt (IndexedDB) som et datert
> daglig øyeblikksbilde, slik at daglig/ukentlig bevegelse kan spores.

---

## Hva sier de daglige eksportene

Eksporten er på artikkelnivå for én butikk, filtrert til Telecom:

| Kolonne | Betydning |
| --- | --- |
| `Qty on Stock Yesterday` | Antall på lager |
| `Value Obsolete Yesterday` | Avskrevet verdi NÅ — **er** old stock |
| `Obsolete Forecast +1/+2/+3 Months` | Prognose for avskrevet verdi fremover |
| `Total Change` | Endring i går → +3 mnd — **blir** old stock |

Endringskolonnene utledes robust fra prognosene. Butikk, kjede, valuta og
artikkelkategori leses fra «Brukte filtre»-bunnteksten. `Total`-raden hoppes over.

### Daglig sporing

Hver fil = ett datert øyeblikksbilde (én per dag; ny opplasting samme dag
overskriver dagens). Med to eller flere dager beregner appen:

- **bevegelse** dag-for-dag i avskrevet verdi (går det riktig vei?),
- **reduksjon** uke/periode (verdi jobbet ned vs. ny avskrivning som aldret inn),
- **forhindrbar avskrivning** — `Total Change` på fokusvarene, som unngås hvis de selges nå.

## Analyse & fokusscore

For hver vare:

- **Status** — *Er old stock* (`obsoleteNow > 0`), *Blir old stock* (`Total Change > 0`), eller begge.
- **Fokusscore (0–100)** — tidsvektet eksponering: allerede avskrevet + det som
  haster mest (`+1 mnd` vektes høyest), log-skalert mot dagens største post.
- **Risikonivå** (Kritisk / Høy / Følg med / OK) og et konkret **anbefalt tiltak**
  med estimert effekt (forhindret avskrivning og/eller frigjort kapital).

## Seksjoner

- **Oversikt** — KPI-er (old stock nå, blir old stock, haster, antall, forhindrbar),
  avskrivningsbane (3 mnd), daglig bevegelse, er-vs-blir-fordeling, kategori, fokuskø.
- **Fokus** — den daglige arbeidslista, filtrer på er/blir old stock og arbeidsflyt.
- **Bevegelse** — daglig kurve for avskrevet verdi, ukentlig reduksjon, hva som drev
  bevegelsen (jobbet ned vs. ny avskrivning), og opplastingshistorikk.
- **Produkter** — full tabell med antall, avskrevet verdi nå, blir old stock, prognose.

---

## Teknisk

- **Next.js 15** (App Router) · **React 19** · **TypeScript** · **Tailwind CSS** · **SheetJS**
- Lyst tema i Elkjøps designspråk; norsk grensesnitt.
- Krever **Node.js 18.18+**.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # produksjonsbygg
npm run typecheck  # tsc --noEmit
```

## Prosjektstruktur

```
app/         ruter (upload · dashboard · focus · movement · products) + layout
components/  ui/ · charts/ · layout/ · product/ · focus/ · movement/ · dashboard/
lib/         parse/ (xlsx)  analytics/ (classify · score · recommend · analyze · movement)
             db/ (IndexedDB)  format · ui-tokens · export
providers/   WorkspaceProvider (snapshot-historikk + tilstand)
types/       domenemodell
```
