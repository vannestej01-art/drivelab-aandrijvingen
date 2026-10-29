# Controle interactieve uitleg

De uitbreiding gebruikt uitsluitend lokale JavaScript-regels en werkelijk berekende modelgegevens. De bestaande labofuncties blijven aanwezig.

Op 29 oktober 2026 zijn 89 inhoudelijke controles geslaagd: 21 bestaande dynamische controles, 16 frequentie-/spannings- en begrenzingscontroles, 18 elektronica-, 13 machine- en 21 verklaringscontroles. Dit omvat afzonderlijke en voorwaardelijke effecten van frequentie, spanning, belasting, inertie, rampen, motorparameters, belastingstype en stilstand/remmen. Alle bestaande tests zijn behouden.

Browsercontrole omvat frequentie 30 → 50 Hz met werkelijke tabelwaarden, oude en nieuwe curves, parameterdetectie, eenvoudige/technische uitleg, kopiëren van de verklaring, drie traagheden en verborgen instelwaarden. De verborgen J-waarden verschijnen ook niet in de uitleg of rapporttekst. De invoervelden rekenen bij invoer opnieuw; herhaalde verandering op verlies van focus reset de vergelijking niet.

De elektrische modellen van labo 8 blijven schattingen. De voor/na-tabel is een vergelijking van twee afzonderlijke proeven vanaf de ingestelde beginconditie; de live as houdt haar toestand en verandert niet sprongsgewijs. Bij wijziging van beginwaarde of opnameduur worden die verschillen vermeld. De nieuwe frequentiemodus gebruikt een scalaire slipwet; de bestaande tpm-modus gebruikt de PI-snelheidsregeling. De koppeling is star. Verzadiging is vereenvoudigd en er is geen thermisch schade- of beveiligingsmodel.

Een fout bij het live verlagen van de maximale frequentie is hersteld: de gevraagde motorstroom/koppelconditie wordt nu aan het haalbare frequentie-/slipgebied begrensd. De as blijft continu; de bestaande koppelvertraging blijft aanwezig. Deze grenssituatie wordt in beide draairichtingen getest.

Testopdracht voor ontwikkelaars: `node --test tests/*.test.cjs labo8/tests/model.test.cjs`.
