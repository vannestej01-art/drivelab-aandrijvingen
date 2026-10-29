(function (root) {
  'use strict';
  const source = 'Cursus aandrijvingen 2025, planning p. 3. De concrete opdrachten voor sessies 10–12 staan niet in deze bundel. Deze zelftest is samengesteld uit de onderwerpen van labo 1, 2, 3, 5, 6, 7, 8 en 9 en bevat geen echte examenvragen.';
  const data = {
    10: {
      title: 'Oefenlabo',
      description: 'Gemengde zelftest ter voorbereiding op de individuele sessie. Voorspel het antwoord, controleer je redenering en herhaal de bijbehorende simulator.',
      source,
      questions: [
        {
          prompt: 'Labo 1 — Een spanning heeft een gemiddelde waarde van 3 V en een AC-component met effectieve waarde 4 V. Wat meet een ideale true-RMS-meter in AC+DC-stand?',
          options: ['5 V', '7 V', '4 V'], answer: 0,
          explanation: 'De AC-component heeft gemiddelde nul. Daarom geldt U_RMS² = U_DC² + U_AC,RMS² = 3² + 4²; de totale effectieve waarde is 5 V.'
        },
        {
          prompt: 'Labo 2 — Bij een netfrequentie van 50 Hz wordt een ontsteekhoek van 90° ingesteld, gemeten vanaf de gekozen synchronisatiereferentie. Welke tijdvertraging hoort daarbij?',
          options: ['10 ms', '5 ms', '2,5 ms'], answer: 1,
          explanation: 'Eén periode is 1/50 = 20 ms. Een hoek van 90° is een kwart periode, dus de vertraging is 5 ms.'
        },
        {
          prompt: 'Labo 3 — Een ideale volledig gestuurde enkelfasige brug voedt een belasting met continue stroom. Verliezen en commutatieoverlap worden verwaarloosd. Hoe verandert de gemiddelde uitgangsspanning bij verhoging van α van 0° naar 60°?',
          options: ['Ze verdubbelt.', 'Ze wordt nul.', 'Ze halveert.'], answer: 2,
          explanation: 'Bij continue stroom geldt U_DC = (2Û/π) cos α. Omdat cos 60° = 0,5, halveert de gemiddelde uitgangsspanning. Deze formule geldt niet zonder meer bij onderbroken stroom.'
        },
        {
          prompt: 'Labo 5 — Voor een onafhankelijk bekrachtigde gelijkstroommotor is Kφ = 1,2 N·m/A. Hoeveel elektromagnetisch koppel ontstaat bij een ankerstroom van 5 A?',
          options: ['6 N·m', '4,17 N·m', '0,24 N·m'], answer: 0,
          explanation: 'Het elektromagnetische koppel is M = Kφ Iₐ = 1,2 × 5 = 6 N·m. Het beschikbare askoppel kan door mechanische verliezen kleiner zijn.'
        },
        {
          prompt: 'Labo 6 — Een ideale klasse A-chopper schakelt tussen 0 en 100 V. De dutycycle is 40%. Wat is de gemiddelde uitgangsspanning?',
          options: ['60 V', '40 V', '100 V'], answer: 1,
          explanation: 'Bij deze unipolaire chopper geldt U_gem = D U_DC = 0,40 × 100 = 40 V.'
        },
        {
          prompt: 'Labo 7 — Een asynchrone motor met twee poolparen wordt gevoed op 50 Hz. Hij draait op 1440 tpm. Hoe groot is de slip?',
          options: ['0%', '6%', '4%'], answer: 2,
          explanation: 'nₛ = 60f/p = 1500 tpm. De slip is s = (1500 − 1440)/1500 = 0,04 = 4%.'
        },
        {
          prompt: 'Labo 8 — De motor levert 4,5 N·m en het totale tegenwerkende koppel is 2,5 N·m. J = 0,100 kg·m². Wat is de hoekversnelling?',
          options: ['20 rad/s²', '70 rad/s²', '0,2 rad/s²'], answer: 0,
          explanation: 'Jα = M_motor − M_belasting. Het netto koppel is 2 N·m, dus α = 2/0,100 = 20 rad/s².'
        },
        {
          prompt: 'Labo 9 — Gebruik de tekenafspraak f_stator = p·n/60 + f_rotor. De statorfrequentie is 50 Hz, p = 2 en n = 1800 tpm. Welke getekende rotorfrequentie is nodig?',
          options: ['+10 Hz', '−10 Hz', '+50 Hz'], answer: 1,
          explanation: 'De mechanische bijdrage is 2 × 1800/60 = 60 Hz. Daarom is f_rotor = 50 − 60 = −10 Hz. Het minteken duidt in deze afspraak op omgekeerde fasevolgorde ten opzichte van de positieve rotorfrequentie.'
        }
      ]
    },
    11: {
      title: 'Individuele sessie 1 — zelftest',
      description: 'Zelfgekozen oefenreeks over gelijkrichters, thyristorsturing en choppers. Deze indeling is een hulpmiddel; de cursus legt de onderwerpen van de echte individuele sessie niet vast.',
      source,
      questions: [
        {
          prompt: 'Labo 1 — Een ideale enkelzijdige diodegelijkrichter voedt een weerstand. De sinusvormige bron heeft piekspanning 100 V. Wat is de effectieve uitgangsspanning?',
          options: ['50 V', '70,7 V', '31,8 V'], answer: 0,
          explanation: 'Voor een enkelzijdig gelijkgerichte sinus geldt U_RMS = Û/2 = 50 V. De gemiddelde waarde is Û/π ≈ 31,8 V en de RMS-waarde van de oorspronkelijke sinus is Û/√2 ≈ 70,7 V.'
        },
        {
          prompt: 'Labo 1 — Een ideale diodebrug voedt een weerstand vanuit 230 V RMS. Er is geen afvlakcondensator. Wat is de gemiddelde gelijkgerichte spanning?',
          options: ['230 V', 'Ongeveer 207 V', 'Ongeveer 325 V'], answer: 1,
          explanation: 'De piek is √2 × 230 V. Bij dubbelzijdige gelijkrichting is U_gem = 2Û/π = 2√2 × 230/π ≈ 207,1 V. De effectieve spanning blijft idealiter 230 V.'
        },
        {
          prompt: 'Labo 1 — Een afvlakcondensator bij een dubbelzijdige gelijkrichter wordt gevoed op 50 Hz. Neem I_last = 0,10 A en C = 1000 µF. Welke benadering voor de piek-tot-piekrimpel past bij kleine rimpel en korte laadpulsen?',
          options: ['10 V', '0,1 V', '1 V'], answer: 2,
          explanation: 'De laadfrequentie is 2 × 50 = 100 Hz. Met ΔU ≈ I/(f_rimpel C) volgt 0,10/(100 × 0,001) = 1 V. Dit is een benadering, geen exacte laadstroomoplossing.'
        },
        {
          prompt: 'Labo 2 — Zes opeenvolgende ontsteekmomenten zijn gelijkmatig verdeeld over één elektrische periode. Hoe groot is de hoek tussen twee opeenvolgende momenten?',
          options: ['60°', '120°', '180°'], answer: 0,
          explanation: 'Een periode is 360°. Zes gelijkmatig verdeelde ontsteekmomenten liggen 360°/6 = 60° uit elkaar. Bij 50 Hz is dat ongeveer 3,33 ms.'
        },
        {
          prompt: 'Labo 3 — Een gewone thyristor geleidt al. De gatepuls wordt weggenomen, terwijl de anodestroom boven de houdstroom blijft en de thyristor voorwaarts gepolariseerd blijft. Wat gebeurt er?',
          options: ['Hij blokkeert onmiddellijk.', 'Hij blijft geleiden.', 'De stroom wordt automatisch nul.'], answer: 1,
          explanation: 'De gate ontsteekt een gewone thyristor maar schakelt hem niet actief uit. De anodestroom moet onder de houdstroom komen en de schakeling moet voldoende hersteltijd bieden.'
        },
        {
          prompt: 'Labo 3 — Een ideale volledig gestuurde enkelfasige brug heeft continue stroom en α = 90°. Wat volgt uit U_DC = (2Û/π) cos α?',
          options: ['De uitgang is voortdurend spanningsloos.', 'De gemiddelde spanning is maximaal.', 'De gemiddelde uitgangsspanning is nul.'], answer: 2,
          explanation: 'Cos 90° = 0, dus de gemiddelde uitgangsspanning is nul. De momentane uitgangsspanning heeft nog positieve en negatieve stukken; nul gemiddelde betekent geen vlakke nulspanning.'
        },
        {
          prompt: 'Labo 6 — In een ideale bipolair geschakelde H-brug is de uitgang +100 V gedurende 25% van de periode en −100 V gedurende 75%. Wat is de gemiddelde uitgangsspanning?',
          options: ['−50 V', '+25 V', '+50 V'], answer: 0,
          explanation: 'U_gem = D·U_DC + (1−D)(−U_DC) = (2D−1)U_DC = (2 × 0,25−1) × 100 = −50 V. Dit is de bipolaire modulatieafspraak.'
        },
        {
          prompt: 'Labo 6 — Een spoelstroom is positief. Een H-brug legt een negatieve uitgangsspanning aan terwijl die stroom nog positief blijft. Welk teken heeft het momentane uitgangsvermogen p = u·i?',
          options: ['Positief.', 'Negatief.', 'Altijd nul.'], answer: 1,
          explanation: 'Een negatieve spanning maal een positieve stroom geeft negatief vermogen. Energie stroomt op dat moment vanuit de belasting terug naar de DC-zijde, mits de voeding of tussenkring die energie kan opnemen.'
        },
        {
          prompt: 'Labo 1 — Een zuiver ohmse belasting wordt zwaarder gemaakt bij dezelfde effectieve voedingsspanning. Wat verandert er in het ideale model?',
          options: ['De weerstand stijgt en het vermogen stijgt.', 'De weerstand daalt en het vermogen daalt.', 'De weerstand daalt en het vermogen stijgt.'], answer: 2,
          explanation: 'Bij een vaste spanning geldt P = U_RMS²/R. Meer belastingvermogen betekent dus een kleinere weerstand en een grotere stroom.'
        }
      ]
    },
    12: {
      title: 'Individuele sessie 2 — zelftest',
      description: 'Zelfgekozen oefenreeks over gelijkstroommotoren, asynchrone aandrijvingen en DFIG. Dit is voorbereiding en geen weergave van de concrete beoordeling of examenvragen.',
      source,
      questions: [
        {
          prompt: 'Labo 5 — Een gelijkstroommotor draait praktisch onbelast. Verliezen en ankerspanningsval worden verwaarloosd. De flux blijft constant en de ankerspanning halveert. Wat gebeurt er met het toerental?',
          options: ['Het halveert.', 'Het verdubbelt.', 'Het blijft gelijk.'], answer: 0,
          explanation: 'Uit Uₐ ≈ E = Kφω volgt ω ≈ Uₐ/(Kφ). Bij constante flux is het onbelaste toerental dus evenredig met de ankerspanning.'
        },
        {
          prompt: 'Labo 5 — De magnetische flux halveert terwijl hetzelfde elektromagnetische koppel wordt gevraagd. Verzadiging en stroombegrenzing worden buiten beschouwing gelaten. Hoe moet de ankerstroom veranderen?',
          options: ['Ze halveert.', 'Ze verdubbelt.', 'Ze blijft gelijk.'], answer: 1,
          explanation: 'M = KφIₐ. Bij dezelfde M en een gehalveerde φ moet Iₐ verdubbelen. In een echte motor begrenzen de maximaal toegestane stroom en commutatie de veldverzwakking.'
        },
        {
          prompt: 'Labo 7 — Een asynchrone motor heeft twee poolparen. Welk synchroon toerental hoort bij 25 Hz?',
          options: ['1500 tpm', '3000 tpm', '750 tpm'], answer: 2,
          explanation: 'nₛ = 60f/p = 60 × 25/2 = 750 tpm. Het werkelijke motortoerental ligt in motorbedrijf bij belasting doorgaans lager door slip.'
        },
        {
          prompt: 'Labo 7 — Welk doel heeft ongeveer constante U/f onder de basisfrequentie in een vereenvoudigde frequentieregeling?',
          options: ['De magnetische flux ongeveer behouden.', 'De slip altijd exact nul maken.', 'Het mechanische vermogen bij iedere snelheid constant houden.'], answer: 0,
          explanation: 'Omdat de geïnduceerde spanning ongeveer evenredig is met frequentie maal flux, houdt een constante verhouding U/f de flux grofweg constant. Statorweerstand en lage frequenties vragen aanvullende compensatie.'
        },
        {
          prompt: 'Labo 8 — Een motor draait met positief toerental en negatief motorkoppel. Welke bedrijfstoestand hoort bij de gebruikte vierkwadrantenafspraak?',
          options: ['Kwadrant I, motorisch vooruit.', 'Kwadrant II, generatorisch remmen vooruit.', 'Kwadrant III, motorisch achteruit.'], answer: 1,
          explanation: 'n > 0 en M < 0 geven Mω < 0. De machine zet mechanische energie om in elektrische energie en werkt generatorisch in kwadrant II.'
        },
        {
          prompt: 'Labo 8 — In 2 s stijgt het toerental van 0 naar 600 tpm. Het gemiddelde netto versnellingskoppel is 3,1416 N·m. Wat is J?',
          options: ['1,00 kg·m²', '0,01 kg·m²', 'Ongeveer 0,100 kg·m²'], answer: 2,
          explanation: 'Δω = 2π × 600/60 = 20π rad/s. De gemiddelde α is 10π ≈ 31,416 rad/s². Daarom is J = M_net/α ≈ 3,1416/31,416 = 0,100 kg·m².'
        },
        {
          prompt: 'Labo 8 — J wordt verdubbeld. De snelheidsregeling kan voldoende extra koppel leveren en volgt in beide gevallen exact dezelfde snelheidsramp. Wat geldt dan voor het netto versnellingskoppel?',
          options: ['Het verdubbelt; de rampduur kan gelijk blijven.', 'Het blijft gelijk; de rampduur moet gelijk blijven.', 'Het halveert; de rampduur verdubbelt.'], answer: 0,
          explanation: 'Voor dezelfde ramp is α gelijk. Uit M_net = Jα volgt dat het netto versnellingskoppel verdubbelt. Een grotere J veroorzaakt dus alleen verplicht een langere aanloop wanneer het beschikbare netto koppel gelijk blijft of wordt begrensd.'
        },
        {
          prompt: 'Labo 9 — Een DFIG is gekoppeld aan 50 Hz en heeft twee poolparen. De rotor draait op 1200 tpm. Wat is de slip volgens s = (nₛ−n)/nₛ?',
          options: ['−20%', '+20%', '+80%'], answer: 1,
          explanation: 'nₛ = 1500 tpm. Daarom s = (1500−1200)/1500 = 0,20 = +20%. Het positieve teken betekent ondersynchroon toerental; het bepaalt op zichzelf niet het teken van het elektromagnetische koppel.'
        },
        {
          prompt: 'Labo 9 — Waarom is een DFIG bruikbaar voor een windturbine met een beperkt variabel toerentalbereik?',
          options: ['De stator kan bij elk toerental zonder regeling dezelfde spanning en frequentie leveren.', 'De rotor heeft geen elektrische aansluiting nodig.', 'De rotoromvormer kan de slipfrequentie sturen terwijl de stator met het net verbonden blijft.'], answer: 2,
          explanation: 'Een dubbelgevoede inductiemachine heeft elektrische aansluitingen op stator én gewikkelde rotor. Door de rotorfrequentie en rotorstroom te regelen kan de stator op netfrequentie werken bij variabel mechanisch toerental. De rotoromvormer verwerkt in het ideale model het slipvermogen.'
        }
      ]
    }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = data;
  if (root) root.DriveExercises = data;
})(typeof window !== 'undefined' ? window : globalThis);
