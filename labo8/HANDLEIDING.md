# DriveLab voor labo 8

## Openen op Windows

1. Klik met de rechtermuisknop op `Labo8_Aandrijvingen_Simulator.zip` en kies **Alles uitpakken**.
2. Open de uitgepakte projectmap.
3. Dubbelklik op **index.html**. Gebruik een actuele Edge, Chrome of Firefox.
4. Kies een experiment en klik op **Instellingen laden**, daarna op **Start**.

Open de website vanuit de uitgepakte map, niet vanuit het ZIP-venster. De map `assets` moet naast `index.html` blijven staan. Er zijn geen installatie, server, account, internetverbinding of API-sleutel nodig. Als HTML met een teksteditor opent, kies **Openen met → Microsoft Edge**.

De leesbare versie van deze handleiding staat in **HANDLEIDING.html**.

## De vier onderdelen

### 1 Dynamiek en kwadranten

De motor wordt met stappen van 2 ms berekend; iedere 20 ms wordt een meetpunt geregistreerd. Een PI-regelaar met optionele last- en inertiecompensatie, een referentieramp, koppelbegrenzing en regelvertraging bepaalt het motorkoppel. Het toerental volgt uit `J dω/dt = M − T`.

- **Start** schakelt de aandrijving in en laat de simulatie lopen.
- **Stop** voert de geselecteerde stopmethode uit. Kies vrij uitlopen of gecontroleerd remmen.
- **Pauze / Verder** bevriest of vervolgt de tijd. Dit is geen fysieke motorstop.
- **Stap +0,02 s** rekent één meetinterval vooruit.
- **Reset** maakt de huidige opname leeg en zet de as op het ingestelde starttoerental.
- **Herstart** begint dezelfde actie opnieuw en laat ze meteen lopen.
- Een gewijzigd starttoerental geldt na Reset of Herstart. Andere parameters werken tijdens de simulatie.
- Bij de ingestelde opnameduur pauzeert de simulatie. Verhoog de duur of herstart voor een nieuwe opname. Maximum 120 s.

De bovenste bedieningsbalk bestuurt de dynamische motor. De traagheidsvergelijking heeft haar eigen knop voor drie berekende aanlopen.

Gebruik D1 tot D7 voor de oorspronkelijke dynamische acties. Kies vóór het laden van D2 of D4 de stopmethode die je wilt onderzoeken. Voor kwadrant II of IV is een voldoende snelle remramp nodig; langzaam vertragen hoeft geen generatorbedrijf te veroorzaken.

De M,n-grafiek heeft **M horizontaal en n verticaal**. De kwadranten zijn I (+,+), II (−,+), III (−,−), IV (+,−), in de volgorde (M,n). Bij nul koppel of stilstand staat er Grens.

### 2 Belastingskarakteristieken

De vijf onderwijsmodellen zijn constant, lineair, kwadratisch, losbreekkoppel en constant vermogen. Selecteer een type om de procesparameters te wijzigen. Iedere figuur toont de drie factoren A, B en C; de factoren vermenigvuldigen de volledige belasting. Een factor van nul betekent geen passieve last.

Kies op de verticale as koppel, mechanisch vermogen, elektrisch vermogen, stroom, spanning of arbeidsfactor. De curves zijn stationaire berekeningen. Punten die het beschikbare motorkoppel overschrijden worden niet als haalbare elektrische werkingspunten getekend. In de CSV staan ook die punten met `haalbaar=nee`.

**Gebruik variant B in de dynamiek** maakt de gekozen belastingswet actief op de motoras. Een ventilator of centrifugaalpomp wordt onder vergelijkbare stromingscondities door de kwadratische wet benaderd. De lineaire wet hoort bij een overwegend viskeuze belasting. Constant vermogen past bij een wikkelproces met constante trekkracht en constante bandsnelheid binnen het bedrijfsgebied; nabij nul wordt het koppel begrensd.

### 3 Invloed van traagheid

Kies J1, J2, J3, T en de doelsnelheid. De overige motorparameters, opnameduur en rampduur komen uit de dynamische instellingen.

- **Snelheidsramp met compensatie:** een grotere J vraagt meer koppel; bij voldoende koppelmarge kunnen aanlooptijden vrijwel gelijk blijven.
- **Aanloop met koppelbegrenzing:** een snelle referentie en een PI-regelaar zonder vooruitkoppeling laten de invloed van begrensd versnellingskoppel zien.

De knop **Vergelijk drie aanlopen** berekent drie afzonderlijke numerieke simulaties. M(t) staat links, n(t) rechts, met gelijke kleuren per reeks.

Klik tweemaal in n(t) of vul een begin- en eindtijd in. Selecteer reeks A, B of C en klik op **Bereken traagheid**. De functie toont Δt, Δn, Δω, gemiddelde α, gemiddeld netto koppel en J. Ze gebruikt de geïntegreerde netto koppelbijdragen uit de simulatie:

`J = ∫(M − T)dt / Δω`

Kies voldoende snelheidsverandering. Het venster wordt naar de dichtstbijzijnde geregistreerde meetpunten afgerond. J moet binnen het venster constant blijven. De uitkomst is de **totale** naar de motoras herleide traagheid. Trek een bekende bank- en motortraagheid af om alleen de belasting te bepalen.

Met de blinde oefenmodus verdwijnen de ingestelde J-waarden uit de invoer en grafieklegenda. Je kunt ze na de berekening onthullen. Een CSV-export bevat de oorspronkelijke modelwaarden wel.

### 4 Theorie en labo-oefeningen

Doorloop D1–D7, de vijf belastingsmodellen en de traagheidsopdracht. Noteer een voorspelling, laad de instellingen, simuleer en bekijk de resultaten in het bijbehorende onderdeel. Keer terug naar Theorie en oefeningen voor je eigen verklaring en de modelverklaring. Antwoorden worden lokaal in de browser bewaard als browseropslag beschikbaar is.

## Grafieken en bestanden

- Scroll boven een grafiek om rond de aanwijzer te zoomen.
- Sleep in de grafiek om het beeld te verschuiven.
- Dubbelklik of gebruik ↺ om de automatische assen te herstellen.
- Beweeg over een curve om een meetpunt uit te lezen.
- Klik op een legenda om een curve te verbergen of terug te tonen.
- Klik op **PNG ↓** om de grafiek inclusief titel en legenda te downloaden.
- Klik op **Registreer actie** om de huidige dynamische actie apart te bewaren; geef haar een herkenbare naam.
- Iedere bewaarde actie heeft een eigen M,n-grafiek via **Bekijk**. Selecteer maximaal vier opnamen om ze samen te vergelijken.
- Download **CSV** voor meetwaarden en **Parameters + data JSON** voor de volledige opname inclusief instellingen en parameterwijzigingen met tijdstempel.

De dynamische CSV gebruikt puntkomma's, UTF-8 en Nederlandse decimale komma's. De eerste regels beginnen met `#` en bevatten parameters; bij import in Excel kun je deze beschrijvingsregels overslaan. De belastings-CSV gebruikt puntkomma's en decimale punten; kies bij import die decimale instelling. De formaten zijn ook als gewone tekst leesbaar.

Opnamen blijven in het browserprofiel zolang dat profiel opslag toestaat. Er is een maximum van acht opnamen. Bij volle of uitgeschakelde opslag blijft een opname in de huidige sessie beschikbaar; exporteer dan JSON of CSV. Een nieuw browserprofiel of een andere bestandslocatie kan een andere lokale opslag krijgen. De ZIP bevat geen persoonlijke antwoorden of opgeslagen proefmetingen.

## Aannames en reikwijdte

Het mechanische model gebruikt een starre as en passieve lasten. Het simuleert geen zwaartekrachtlast die de as actief aandrijft, elastische koppeling, thermische bescherming of volledig elektromagnetisch model. Bij stilstand is het tegenwerkende koppel een statische reactie: het is maximaal de losbreekdrempel en hoeft niet meteen gelijk aan de ingestelde lopende last te zijn.

Een wijziging van J tijdens draaien stelt een ander effectief model voor; het is geen koppeling van een extra vliegwiel met behoud van impulsmoment. Verander J bij voorkeur vóór een opname.

Elektrische waarden zijn **schattingen**. De fundamentele lijnspanning volgt een begrensde U/f-benadering met een resistieve spanningsboost bij lage frequentie. Een koppelafhankelijke slipfrequentie, positieve verliesbenadering en magnetiseringsstroom leveren plausibele trends; PWM-harmonischen en de echte netarbeidsfactor worden niet opgelost.

`Pel` is het getekende actieve vermogen aan de motorklemmen. Bij `Pel < 0` absorbeert de motor mechanische energie. Met een remweerstand wordt dit als warmte afgevoerd (`Pbrake > 0`, `Pgrid = 0`). Alleen in de optie regeneratieve netomvormer kan `Pgrid` negatief zijn. De getekende arbeidsfactor geeft de energierichting aan. Generatorbedrijf wordt uit `Mω` bepaald, niet uit de helling van n(t).

Alle motorparameters zijn aanpasbare voorbeeldwaarden. Deze software is geschikt voor theoretische voorbereiding en niet voor exacte dimensionering of aansturing van een echte installatie. Het is een onafhankelijke simulator en geen officiële Leroy-Somer-software.

## Bronnen

- De aangeleverde cursus `cursusaandrijvingen2025 (3).pdf`, hoofdstuk 8, p. 56–58, voor de opdrachten, volgorde en basisinstellingen; hoofdstuk 7 voor de context van de testbank.
- Officiële Leroy-Somer instructie 4467 fr, 2010.01/a, p. 19–20, voor de ApILE-werkwijzen: https://www.leroy-somer.com/documentation_pdf/notices_pdf/4467a_fr.pdf

De vijf geïmplementeerde wetten volgen de expliciete opdracht. De documentatie wordt niet gebruikt als bewijs dat iedere variant exact overeenkomt met een specifieke ApILE-versie.

## Controle en onderhoud

De code heeft geen externe bibliotheken. De bestanden `assets/model.js`, `assets/charts.js` en `assets/app.js` bevatten respectievelijk het model, de canvasgrafieken en de bediening. Je kunt ze in een teksteditor aanpassen.

Optioneel, als Node.js al geïnstalleerd is, kun je de modeltests uitvoeren vanuit deze map:

```text
node tests/model.test.cjs
```

De simulator zelf vereist geen Node.js. De tests controleren onder meer het impulsmoment, alle kwadranten, vrij uitlopen, actief remmen, omkeren, overbelasting, losbreekkoppel, J-schatting, regeling en elektrische vermogensconsistentie.

## Kosten en privacy

De opgeleverde software doet geen externe API-aanroepen en heeft geen externe pakketten, trackers, licentiecontrole of betaalde functies. Alleen bronlinks openen op jouw verzoek een externe website. Het gebruik van ChatGPT zelf staat hier los van; deze software kan platformgebruik of abonnementslimieten niet veranderen.
