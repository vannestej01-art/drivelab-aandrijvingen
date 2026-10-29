# Validatie van DriveLab

Datum: 28 oktober 2026.

## Modelcontroles

De meegeleverde Node-tests zijn uitgevoerd: **21 controles geslaagd**.

- Omrekening tpm ↔ rad/s en alle vier kwadranten.
- Versnellen tot de consigne, positief en negatief.
- Controle van `J Δω / Δt = M − T` bij iedere integratiestap.
- Vijf eindige passieve belastingswetten, ook bij nul snelheid.
- Lineaire, kwadratische en constant-vermogensrelaties.
- Vrij uitlopen tot stilstand zonder spontaan omkeren.
- Generatorisch actief remmen en vertragen met positief motorkoppel.
- Omkeren via kwadrant II en IV.
- Grotere belasting en overbelasting.
- Stilstaan onder een niet overwonnen losbreekdrempel.
- Grotere J bij gecompenseerde rampen versus koppelbegrensde aanlopen.
- Terugberekening van J = 0,050, 0,100 en 0,200 kg·m² uit de gesimuleerde koppelimpuls en snelheidsverandering.
- Weigering van ongeschikte schattingsvensters of veranderde J.
- Onderscheid tussen negatief motorvermogen, remweerstand en netterugvoer.
- Eindige elektrische schattingen, actieve/schijnbare vermogensconsistentie en invloed van parameters, inclusief lage frequentie en nul ingesteld koperverlies.

## Bediening en uitvoer

In de lokale browserpreview zijn de volgende functies uitgevoerd:

- Starten en versnellen, keuze van 8× simulatiesnelheid en automatische pauze na de opnameduur.
- Bewaren van een afzonderlijke dynamische registratie.
- Berekenen en weergeven van de drie traagheidsreeksen en de tussenstappen van de J-schatting.
- Selecteren van een andere reeks en inschakelen van de blinde oefenmodus.
- Wisselen van belastingstype en verticale elektrische grootheid.
- Downloaden van berekende belastingsdata als CSV.
- Downloaden van grafieken als PNG; het bestand is als geldige PNG gecontroleerd.
- Openen van de oefenmodus, kiezen van een opdracht en weergeven van de modelverklaring.
- Visuele controle van het donkere dashboard en de smalle schermweergave.
- Geen browserfouten in de gecontroleerde sessie.

De browserpreview is via een lokale HTTP-server getest. De geautomatiseerde testbrowser staat geen file-URL's toe; dubbelklikken vanuit Verkenner is daarom niet met die browser getest. De software gebruikt uitsluitend klassieke lokale scripts en assets, zonder modules, fetch, CDN of serverfunctionaliteit, zodat een gewone browser de uitgepakte index.html rechtstreeks kan uitvoeren. Browseropslag is afgevangen als die in de bestandsmodus niet beschikbaar is.

## Grenzen van de validatie

Dit is een gecontroleerd onderwijsmodel. De elektrische getallen zijn niet vergeleken met echte meetgegevens van een specifieke motor of ApILE-versie. De koppel-/snelheidsregeling benadert een frequentiesturing en lost geen volledig elektromagnetisch of PWM-model op. Een negatieve PF is hier een tekenconventie voor de richting van motorvermogen; het is geen complete netanalyse.
