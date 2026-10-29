(function(root){'use strict';
const content={
5:{
 title:'Anker- en veldregeling van de DC-motor',pages:'35–42',
 goal:'Voorspellen hoe ankerspanning, veldstroom en belasting de n(M)- en Iₐ(M)-karakteristieken van een onafhankelijk bekrachtigde DC-motor veranderen.',
 theory:[
  {title:'Twee afzonderlijke elektrische kringen',text:'De statorveldwikkeling maakt de flux; de ankerstroom levert het elektromagnetische koppel. In deze proef voeden een rheotor en diodebrug het anker en een afzonderlijke bewaakte veldvoeding het veld. De gekoppelde asynchrone machine stelt het remkoppel in.'},
  {title:'Ankerregeling en veldverzwakking',text:'Bij constante flux geeft een lagere ankerspanning een ongeveer evenwijdig lagere toerentalkarakteristiek. Minder veldstroom kan de snelheid verhogen, maar vermindert het koppel per ampère en maakt de daling van n met belasting steiler. Dit geldt binnen stroom-, snelheids- en magnetisatiegrenzen.'}
 ],
 formulas:[
  {formula:'Uₐ = RₐIₐ + Lₐ·dIₐ/dt + E; E = kΦω',meaning:'De aangelegde ankerspanning voedt weerstand, inductantie en tegen-EMK.',conditions:'Stationair is dIₐ/dt = 0. kΦ wordt in SI gebruikt.'},
  {formula:'Mₑ = kΦIₐ; ω = Uₐ/(kΦ) − RₐMₑ/(kΦ)²',meaning:'De n(M)-lijn daalt door de ankerweerstandsval.',conditions:'Constante flux; Mₑ is elektromagnetisch koppel. Askoppel is kleiner door mechanische verliezen.'},
  {formula:'Iᶠ = Uᶠ/Rᶠ; Pₐ = UₐIₐ; Pmech = M_as·2πn/60',meaning:'Veldstroom, elektrisch ankervermogen en mechanisch asvermogen.',conditions:'Stationair. Ankervermogen en asvermogen zijn door verliezen niet gelijk.'}
 ],
 questions:[
  {question:'Hoe herken je veld- en ankerwikkeling?',answer:'Gebruik de klembenaming en kenplaat en controleer spanningsloos de weerstanden. Bij de gebruikte onafhankelijk bekrachtigde machine is de veldweerstand veel groter dan de ankerweerstand; noteer de werkelijk gemeten waarden.'},
  {question:'Waarom vraagt veldverzwakking meer ankerstroom bij dezelfde last?',answer:'Uit Mₑ = kΦIₐ volgt Iₐ = Mₑ/(kΦ). Een kleinere flux vraagt dus meer stroom voor hetzelfde koppel. De hogere mogelijke nullastsnelheid maakt veldbewaking en de snelheidsgrens belangrijk.'},
  {question:'Waarom heeft de asynchrone remmachine dezelfde draairichting?',answer:'Beide machines delen de as. Voor generatorisch remmen draait de rotor in dezelfde richting, maar sneller dan zijn statordraaiveld. De slip en het motorkoppel van de ASM zijn dan negatief bij positief toerental.'},
  {question:'Hoe bepaal je het askoppel uit het generatorvermogen?',answer:'Gebruik M = P_as/ω. Is het gemeten generatoruitgangsvermogen positief als geleverd vermogen, dan is P_as,in ≈ P_el,uit/η_generator. Deel niet zonder verliescorrectie het elektrische uitgangsvermogen door ω. Nabij stilstand is deze methode ongeschikt.'}
 ],
 steps:['Werk het functionele schema en de meetinstrumentkeuze vooraf uit en neem de kenplaatgegevens over.','Bereid n(M) en Iₐ(M) voor bij nominale ankerspanning en twee lagere waarden, volgens de cursus groter dan twee derde van nominaal.','Herhaal met lagere veldstroom en houd per reeks de bedoelde spanning en veldinstelling constant.'],
 checklist:['Anker-, veld-, stroom- en snelheidsgrenzen bekend.','Veldbewaking en gecontroleerde opstart met de docent voorzien.','Rendement en tekenafspraak voor de remmachine vastgelegd.'],
 limitations:['De simulator toont stationaire voorbeeldkarakteristieken; rimpel, commutatie en de werkelijke magnetisatiekromme zijn vereenvoudigd. Er zijn geen meetwaarden vooraf ingevuld.']
},
7:{
 title:'Koppel en toerental van de asynchrone motor',pages:'53–55',
 goal:'De volledige koppel-toerentalkarakteristiek en stroom verklaren, een meetmethode kiezen en het effect van frequentie en voeding vergelijken.',
 theory:[
  {title:'Slip veroorzaakt inductie en koppel',text:'De stator maakt een draaiveld. Bij motorbedrijf draait de rotor er iets achter; bij synchroon toerental is het ideale rotorkoppel nul. Boven synchroon toerental werkt dezelfde draaiende machine generatorisch en remt het elektromagnetische koppel.'},
  {title:'Vorm van de karakteristiek',text:'Van stilstand naar synchroon toerental doorloopt het koppel een maximum. De normale stabiele motorzone ligt dicht onder het synchrone toerental. Bij zwaardere last nemen slip en doorgaans stroom toe, totdat een grens wordt bereikt. Nullaststroom blijft bestaan door magnetisering.'},
  {title:'Meten en vergelijken',text:'De cursus gebruikt een asynchrone motor en een gekoppelde synchrone servo met encoder. ApILE laat de last en snelheid gecontroleerd variëren. Een remproef met afzonderlijke stationaire punten is een andere meetwijze; de servo kan ook andere delen van de volledige karakteristiek doorlopen.'}
 ],
 formulas:[
  {formula:'nₛ = 60f/p; s = (nₛ − n)/nₛ',meaning:'nₛ en n in tpm, f in Hz en p het aantal poolparen.',conditions:'Voor nₛ ≠ 0. Negatieve slip hoort bij generatorbedrijf boven synchroon toerental.'},
  {formula:'M_N = P_as,N/(2πn_N/60)',meaning:'Het nominale askoppel uit nominaal asvermogen en toerental.',conditions:'Gebruik het mechanische kenplaatvermogen, niet zomaar het opgenomen elektrische vermogen.'},
  {formula:'Φ ≈ constante·Ufase/f; Ufase = Ulijn/√3 in ster',meaning:'Spanning en frequentie bepalen samen de flux; in driehoek is Ufase = Ulijn.',conditions:'Sinusbenadering, buiten zeer lage frequenties en zonder sterke verzadiging. Controleer de kenplaat.'}
 ],
 questions:[
  {question:'Welke stroom verwacht je bij starten en bij nullast?',answer:'Bij starten is de slip groot en kan de stroom hoog zijn; de precieze waarde hangt van motor en sturing af. Bij nullast blijft magnetiseerstroom nodig, ook wanneer het asvermogen klein is.'},
  {question:'Wat verandert bij 30, 40, 50 en 60 Hz?',answer:'Voor twee poolparen zijn de synchrone snelheden respectievelijk 900, 1200, 1500 en 1800 tpm. Het werkelijke motorische toerental ligt door slip lager. Dit rekenvoorbeeld veronderstelt twee poolparen; neem voor je motor de juiste waarde.'},
  {question:'Waarom vergelijk je 50 Hz met en zonder omvormer?',answer:'De frequentie is gelijk, maar de omvormer kan spanning, golfvorm, stroom en begrenzing beïnvloeden. Een ideaal sinusmodel geeft bij dezelfde klemspanning dezelfde karakteristiek; echte verschillen moeten worden gemeten.'},
  {question:'Waarom kan het koppel boven de basisfrequentie dalen?',answer:'Als de spanning haar maximum bereikt, kan U/f niet constant blijven. De flux verzwakt en de beschikbare koppelreserve neemt af. Hogere frequentie betekent niet automatisch hogere stroom.'}
 ],
 steps:['Bereken vooraf M_N en bepaal meetkanalen en hun eenheden.','Vergelijk rechtstreeks 3 × 400 V/50 Hz met 50 Hz via de omvormer, zoals in de cursus.','Neem daarna 30, 40 en 60 Hz op en vergelijk n(M), motorfasespanning U(M) en stroom I(M).','Bereid generatorisch rembedrijf als afzonderlijke uitbreiding voor.'],
 checklist:['Lijn- versus fasespanning en ster/driehoek gecontroleerd.','Koppel- en stroomteken en referentieas vastgelegd.','Automatische karakteristiekopname eerst door de docent laten demonstreren.'],
 limitations:['Het stationaire equivalent schema berekent geen volledige omvormerharmonischen, temperatuur of dynamische beveiliging. Niet elk punt van een volledige curve is met een gewone snelheidsregeling stabiel bereikbaar.']
},
8:{
 title:'Frequentiegestuurde aandrijvingen via ApILE',pages:'56–58',
 goal:'Dynamische kwadrantenovergangen, vijf belastingswetten en de invloed van drie traagheidsmomenten verklaren en voorbereiden.',
 theory:[
  {title:'Netto koppel bepaalt de versnelling',text:'De hoekversnelling is α = (M_motor − M_belasting)/J. De grootte van de snelheid neemt toe wanneer ω·α > 0; bij een negatieve draairichting vraagt dat dus een negatieve hoekversnelling. Een snelheidsregelaar kan extra koppel leveren om een ramp te volgen. Een grotere J hoeft daarom geen langere aanlooptijd te geven, zolang voldoende koppel beschikbaar is.'},
  {title:'Motorisch, generatorisch en uitlopen',text:'Bij gelijk teken van M en n levert de machine mechanisch vermogen; bij tegengestelde tekens remt ze generatorisch. Een dalend toerental bewijst geen generatorbedrijf: de last kan afremmen terwijl M nog positief is. Vrij uitlopen verschilt van gecontroleerd remmen.'},
  {title:'Vijf werktuigmodellen',text:'Bereid constant koppel, lineair toenemend koppel, kwadratisch toenemend koppel, losbreekkoppel en constant vermogen voor. Een transportband benadert constant koppel; viskeuze wrijving is lineair; ventilatoren en centrifugaalpompen vaak kwadratisch; een wikkelproces kan constant vermogen vragen.'}
 ],
 formulas:[
  {formula:'ω = 2πn/60; Jα = M_motor − M_belasting; Pmech = M_motor·ω',meaning:'Omrekening, bewegingsvergelijking en getekend mechanisch vermogen.',conditions:'J in kg·m², α in rad/s², M in N·m en P in W; alle koppels naar dezelfde as herleiden.'},
  {formula:'T = T₀; T = T₀ + b|ω|; T = T₀ + kω²; T = P₀/|ω|',meaning:'Constante, lineaire, kwadratische en constant-vermogensbelasting.',conditions:'De laatste wet vraagt een koppelgrens nabij nul. Losbreekkoppel vraagt een apart laagtoerentalmodel. Bij T ∝ ω² geldt P ∝ |ω|³.'},
  {formula:'J = ∫(M_motor − M_belasting)dt / Δω',meaning:'Traagheid uit hetzelfde tijdvenster in M(t) en n(t). Bij ongeveer constante α: J = gemiddeld(M − T)/α.',conditions:'Voldoende snelheidsverandering, dezelfde tijdas en constante J. Neem alle relevante verlieskoppels mee; onderscheid totale en toegevoegde traagheid.'}
 ],
 questions:[
  {question:'Welke basisinstellingen schrijft de cursus voor?',answer:'Constant lastkoppel T = 2,5 N·m, J = 0,100 kg·m² en ongeveer 1400 tpm. Herhaal aanloop én afloop bij 5 N·m. Dit zijn instellingen, geen vooraf gemeten resultaten.'},
  {question:'Welke zeven dynamische acties registreer je afzonderlijk?',answer:'Aanloop en afloop bij 2,5 N·m; aanloop en afloop bij 5 N·m; lineair 0 → 1400, 1400 → 700 en 700 → 0 tpm. Maak voor iedere actie een eigen M,n-grafiek.'},
  {question:'Waarom kan het motorkoppel bij vertragen positief blijven?',answer:'Als de last sterker remt dan de motor aandrijft, is M − T negatief terwijl M zelf positief blijft. Generatorbedrijf vraagt daarnaast M·ω < 0.'},
  {question:'Wat verwacht je bij grotere J en dezelfde snelheidsramp?',answer:'Het extra vereiste koppel Jα neemt toe. De n(t)-curves kunnen vrijwel samenvallen zolang de regelaar dit koppel kan leveren. Bij koppelbegrenzing wordt de helling kleiner en duurt de overgang langer.'},
  {question:'Hoe maak je de belastings- en traagheidsvergelijking compleet?',answer:'Vijf belastingsgrafieken met ieder drie parameterinstellingen, plus per type minstens één elektrische grootheid tegen n. Voor drie J-waarden komen drie M(t)-curves in één grafiek en drie n(t)-curves ernaast; bereken alle drie J-waarden.'}
 ],
 steps:['Kies voor dynamiek Visualisation temporelle sur application industrielle en start de registratie vóór de actie.','Gebruik voor de werktuigstudie Comportement sur application industrielle en noteer drie instellingen per belastingstype.','Houd bij de traagheidsstudie T = 2,5 N·m en de overige regelinstellingen gelijk.'],
 checklist:['Zeven losse dynamische registraties voorbereid.','Vijf belastingswetten en hun procesparameters gekend.','Stopwijze en bestemming van remenergie gecontroleerd.','Een geschikt niet-stationair meetvenster voor J gekozen.'],
 limitations:['De elektrische grootheden in de simulator zijn schattingen. De aparte voor/na-proeven zijn voorspellingen; ze laten de echte live as niet onmiddellijk naar een nieuw eindpunt springen.']
},
9:{
 title:'DFIG en dubbelgevoede windgenerator',pages:'59',
 goal:'De bouw van een dubbelgevoede asynchrone generator en het effect van mechanisch toerental, rotorfrequentie en rotorstroom begrijpen.',
 theory:[
  {title:'Toegankelijke rotorwikkeling',text:'De DFIG heeft een driefasige rotorwikkeling die via sleepringen met een omvormer is verbonden. Bij een kooiankermachine zijn de rotorstromen intern kortgesloten en niet afzonderlijk toegankelijk. De stator kan op het net blijven terwijl de rotoromvormer frequentie en stroom regelt.'},
  {title:'Voordeel voor windenergie',text:'De rotorsnelheid kan rond het synchrone toerental variëren en toch kan de stator op netfrequentie werken. De rotoromvormer verwerkt dan in hoofdzaak het slipvermogen in plaats van het volledige machinevermogen; het vereiste aandeel hangt van het snelheidsbereik af.'},
  {title:'Twee verschillende proeven',text:'Bij open stator kan de geïnduceerde spanning veranderen met frequentie en rotorflux. Bij netkoppeling legt een stijf net de klemspanning op; rotorstroom beïnvloedt vooral stromen en vermogens. Vergelijk deze proeven niet alsof dezelfde spanningsvrijheid geldt.'}
 ],
 formulas:[
  {formula:'f_stator = p·n/60 + f_rotor',meaning:'Getekende elektrische veldfrequentie in het statorstelsel.',conditions:'f_rotor heeft een teken voor de fasevolgorde. Een frequentiemeter toont de grootte |f_stator|.'},
  {formula:'nₛ = 60f_net/p; s = (nₛ − n)/nₛ; f_rotor = s·f_net',meaning:'De synchronismevoorwaarde bij netkoppeling.',conditions:'Vaste netfrequentie en de gekozen tekenafspraak.'},
  {formula:'P_rotor ≈ −s·P_stator',meaning:'Richting en grootte van het ideale slipvermogen.',conditions:'Verliesloos stationair model, positief elektrisch vermogen is opname door de machine. P_stator is negatief bij teruglevering.'}
 ],
 questions:[
  {question:'Welke rotorfrequentie hoort bij 1200 en 1800 tpm?',answer:'Rekenvoorbeeld met p = 2 en f_net = 50 Hz: bij 1200 tpm is p·n/60 = 40 Hz en f_rotor = +10 Hz; bij 1800 tpm is dit 60 Hz en f_rotor = −10 Hz. Het negatieve teken betekent omgekeerde fasevolgorde.'},
  {question:'Wat doet meer rotorstroom bij open stator?',answer:'In een lineair magnetisch model geeft meer effectieve rotorstroom meer flux en dus meer geïnduceerde spanning bij dezelfde statorfrequentie. Werkelijke verzadiging beperkt deze evenredigheid.'},
  {question:'Waarheen stroomt het rotorvermogen bij generatorbedrijf?',answer:'Ondersynchroon neemt de rotor in het ideale model elektrisch vermogen op, terwijl de stator meer vermogen teruglevert. Bovensynchroon leveren stator en rotor beide terug. Op synchronisme is het ideale actieve rotorvermogen nul.'},
  {question:'Wat moet je voor de oorspronkelijke proef nog bekijken?',answer:'De cursus verwijst naar de afzonderlijke Lucas-Nülle-cursus op Toledo. Bestudeer daar de bouw, apparatuur en exacte L@Bsoft-proeven voor invloed van mechanische snelheid, rotorfrequentie en rotorstroom.'}
 ],
 steps:['Teken vooraf de energiestroom tussen net, stator, rotoromvormer en mechanische as.','Bereken het synchrone toerental en de vereiste rotorfrequentie voor enkele snelheden.','Onderzoek de drie invloeden afzonderlijk en formuleer per proef een besluit.'],
 checklist:['Poolparen, fasevolgorde en vermogensrichting duidelijk.','Open stator onderscheiden van netgekoppeld bedrijf.','Afzonderlijke Toledo/L@Bsoft-bundel geraadpleegd.'],
 limitations:['De afzonderlijke Toledo-bundel is niet aangeleverd. Deze voorbereiding en simulator behandelen de principes en vervangen niet het volledige oorspronkelijke L@Bsoft-proefverloop.']
}
};
if(typeof module==='object'&&module.exports)module.exports=content;
if(root)root.DrivePreparationMachines=content;
})(typeof window!=='undefined'?window:typeof globalThis!=='undefined'?globalThis:null);
