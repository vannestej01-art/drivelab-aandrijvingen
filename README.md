# DriveLab aandrijvingen

Interactieve Nederlandstalige voorbereiding van de labocursus aandrijvingen en energieomvormers. Acht rekenmodellen voor labo 1, 2, 3, 5, 6, 7, 8 en 9, aangevuld met zelftests voor sessies 10–12. Labo 4 is weggelaten.

## Gebruiken

Open `index.html` in een recente browser. Alle bestanden moeten samen blijven staan. Er zijn geen installatie, betaalde API's, externe AI of simulatiediensten nodig. Instellingen, voortgang en opnamen blijven in de lokale browseropslag. Bewaar resultaten met CSV, JSON of PNG.

De modellen zijn onderwijsvoorbeelden met expliciete aannames. Gebruik de echte meetwaarden voor je laboverslag. Voor het volledige Lucas-Nülle-proefverloop van labo 9 is de afzonderlijke Toledo/L@Bsoft-bundel nodig. De vragen in 10–12 zijn zelftests, geen echte examenvragen.

## Publiceren

Deze map is voorbereid voor GitHub Pages zonder bouwstap. Publiceer de hoofdmap van de branch `main`. Het bestand `.nojekyll` zorgt ervoor dat de bestanden rechtstreeks als statische website worden aangeboden. De relatieve paden ondersteunen ook een projectadres onder `github.io`.

## Bestanden

- `assets/portal.js`: navigatie, bediening en opslag
- `assets/electronics.js`: labo 1, 2, 3 en 6
- `assets/machines.js`: labo 5, 7 en 9
- `assets/exercises.js`: zelftests 10–12
- `labo8/`: volledige simulator voor frequentiegestuurde aandrijvingen

Geen persoonlijke documenten of de oorspronkelijke cursus-PDF opgenomen. Zie de theorie en bronverwijzingen in de website en de handleiding.


## Interactieve verklaringen

Bij een parameterwijziging verschijnt **Wat gebeurt er als ik dit verander?** met oude en nieuwe instellingen, werkelijk berekende modeluitkomsten, een fysische verklaring en een voorspelling voor het echte labo. Kies Eenvoudige uitleg of Technische uitleg en open Waarom gebeurt dit. De kopieerknop geeft een tekst die expliciet over gesimuleerde resultaten gaat.

Bij de nieuwe stationaire labo's worden de vorige curves automatisch gestreept naast de nieuwe curves getoond, voor zover de assen overeenkomen. Het gekozen motor-/generatorpunt krijgt een marker. Identieke referentiecurves blijven herkenbaar. Hover toont meetpunten en uitleg over hun betekenis.

Labo 8 heeft een venster op elk van zijn vier tabbladen. De voor/na-proeven lopen vanaf hun eigen ingestelde beginconditie; de live simulatie behoudt haar eigen doorlopende mechanische toestand. De elektrische waarden zijn vereenvoudigde schattingen. Een frequentieconsigne regelt het statordraaiveld en laat de rotorsnelheid afhangen van slip en last; de bestaande toerentalregeling blijft beschikbaar. Maximale frequentie, V/f versus vaste spanning en motorreferenties werken door in de numerieke berekening. De mechanische koppeling blijft star; er wordt geen elastische koppeling of temperatuurmodel verzonnen.

De uitleg werkt lokaal met geprogrammeerde regels en modelgegevens. Er worden geen AI-diensten aangeroepen. `assets/teacher.js` bevat de regels; `assets/teacher-ui.js` en `assets/teacher.css` verzorgen het venster. Testen: `node --test tests/*.test.cjs labo8/tests/model.test.cjs`.
