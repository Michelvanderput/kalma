# Kalma

Een persoonlijke app voor rust en vertrouwen: het moment tussen impuls en actie winnen, en bewijs verzamelen dat je iemand bent op wie je kunt bouwen.

## Versie 1

- **Drangknop**: een protocol van tien minuten. Eerst je eigen bericht, dan drangniveau en wat eronder zit, dan ademen met een timer en één tik naar je buddy. Elk doorstaan moment komt in het Bewijsarchief.
- **Check-in**: 's ochtends slaap, energie, drang en één intentie. 's Avonds waar je trots op bent, wat moeilijk was en je toch deed, je sterkste drang en hoeveel je gescrold hebt.
- **Bewijsarchief**: alles wat je wint, plus zelf toegevoegde complimenten, nagekomen beloftes en lastige gesprekken.
- **Ik**: instellingen, terugval zonder je geschiedenis te wissen, hulplinks en een back-up.

Alle data staat lokaal op het toestel (IndexedDB). Er gaat niets naar een server.

## Dashy

Dashy komt uit Dashy Studio (`src/dashy/dashy.js` en `dashy.json`, export van het pakket). De runtime animeert zelf, volgt de aanwijzer, reageert op tikken en respecteert `prefers-reduced-motion`. In Kalma reageert Dashy op het moment: zwaaien bij openen, blij of trots na een check-in, slaperig 's nachts, meeademen tijdens de drangknop en juichen bij een gewonnen moment. Een nieuwe export uit de studio vervangt simpelweg die twee bestanden.

## Stack

Vite + React, Vite PWA, Tailwind CSS, shadcn/ui (Radix), Lucide, Motion, Sonner en Figtree via Fontsource. Nieuwe shadcn-componenten voeg je toe met `npx shadcn@latest add <naam>`. Let op: controleer daarna het importpad van `cn` (`@/lib/utils`).

## Draaien

```bash
npm install
npm run dev
```

Op je telefoon: zet het op een host met https (bijvoorbeeld Vercel of Netlify) en kies in je browser "Toevoegen aan beginscherm".

## Volgende stappen (pas na twee weken echt gebruik)

1. Weerbericht: terugvalsignalen herkennen uit slaap, drang, scrollen en overgeslagen check-ins.
2. Weekbrief van Claude op basis van het Bewijsarchief.
3. Gesprekstrainer en dagelijkse micro-uitdagingen.
4. Dopaminemenu tegen doomscrollen.
