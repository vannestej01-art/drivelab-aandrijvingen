(function(root){'use strict';
const preparations={
1:{
 title:'Gelijkrichters en meettoestellen',pages:'8–21; voorbereiding p. 8–11',
 goal:'Diodegelijkrichting begrijpen en gemiddelde, effectieve en AC-waarden met multimeter, wattmeter en oscilloscoop kunnen vergelijken.',
 theory:[
  {title:'Voeding en scheiding',text:'Een rheotor is een regelbare autotransformator: hij wijzigt de wisselspanning maar biedt op zichzelf geen galvanische scheiding. Een eenvoudige gestabiliseerde labovoeding heeft als functionele keten net → scheidingstransformator → gelijkrichter → afvlakking → spannings-/stroomregeling → uitgang. Niet iedere voeding heeft dezelfde interne uitvoering.'},
  {title:'Diode, spoel en condensator',text:'Een diode geleidt in de doorlaatrichting. Met R volgt de stroom de belastingsspanning. Een spoel houdt stroom langer in stand; bij enkelzijdige gelijkrichting zonder vrijloopdiode kan de belastingsspanning daardoor tijdelijk negatief worden. Een condensator voedt de last tussen laadpieken en maakt de netstroom pulsvormig.'}
 ],
 formulas:[
  {formula:'Ugem = (1/T)∫u(t)dt; Urms = √[(1/T)∫u²(t)dt]',meaning:'Gemiddelde en effectieve waarde over één periode.',conditions:'Integreer de volledige golf inclusief eventuele negatieve delen.'},
  {formula:'UAC,rms = √(Urms² − Ugem²)',meaning:'Effectieve waarde van alleen de wisselende component.',conditions:'Urms bevat AC+DC; de AC-stand van een meter kan een andere bandbreedte hebben.'},
  {formula:'Enkelzijdig R: Ugem = Û/π; Urms = Û/2. Brug R: Ugem = 2Û/π; Urms = Û/√2.',meaning:'Voorspelling bij ideale dioden; Ig = Ug/R en Irms = Urms/R.',conditions:'Sinusbron, vaste ohmse weerstand, geen afvlakcondensator of spoel.'},
  {formula:'PF = P/(Urms·Irms)',meaning:'Arbeidsfactor aan de netzijde.',conditions:'PF is alleen bij sinusvormige spanning én stroom gelijk aan cosφ.'}
 ],
 questions:[
  {question:'Wat doet een optocoupler?',answer:'Een LED draagt het stuursignaal met licht over aan een fotodetector. Er is geen geleidende signaalverbinding tussen beide zijden. De toegestane isolatiespanning en de volledige schakeling bepalen de geschiktheid.'},
  {question:'Hoe verhoog je de belasting bij vaste spanning?',answer:'Verlaag R: I = U/R en P = U²/R nemen toe. Regel de laboweerstand niet naar nul en respecteer stroom- en vermogensgrenzen.'},
  {question:'Wat betekenen PWM, fase-aansnijding en fase-afsnijding?',answer:'PWM wijzigt de verhouding aan-/periodetijd. Fase-aansnijding begint later in een netalternantie; fase-afsnijding beëindigt de geleiding eerder. De mogelijke schakelactie hangt van het component af.'},
  {question:'Wat moet je bij de RC-gelijkrichter tekenen?',answer:'Teken de bron, diode en parallelle R/C-last. Duid bronspanning, condensatorspanning, laststroom en laadstroom aan. De diode laadt alleen wanneer de bron voldoende hoger is dan de condensatorspanning; daartussen ontlaadt C via R.'},
  {question:'Waarom differentiaalprobes en stroomprobes?',answer:'Een geschikte differentiaalprobe meet tussen twee meetpunten zonder ze via een gewone scoopaardklem kort te sluiten en biedt een passend spanningsbereik. Gebruik voor stroom de juiste probe, nulstelling en schaalfactor. Zonder geschikte probe is een goedgekeurde geïsoleerde meetoplossing nodig; onderbreek nooit de beschermingsaarde van de scoop.'},
  {question:'Waarom kan een afgevlakte gelijkrichter een slechte PF hebben?',answer:'De spanning over de last wordt gladder, maar de netstroom bestaat uit korte laadpulsen met een hoge RMS-waarde. Stroomvervorming kan PF verlagen, ook als de fundamentele faseverschuiving klein is.'}
 ],
 steps:['Bereken voor R eerst Ug, Urms, Ig en Irms; onderscheid AC van AC+DC.','Vergelijk enkelzijdig R, RL en RC; herhaal daarna de diodebrug met R en RL.','De cursus gebruikt onder meer 200 Ω, 100 mH en een condensator van 25 µF; noteer steeds de werkelijk gebruikte waarden.'],
 checklist:['Kan ik alle meetkanalen en schaalfactoren aanwijzen?','Kan ik de golfvormen en geleidingsintervallen voorspellen?','Heb ik het nominale vermogen van weerstand en lamp gecontroleerd?'],
 limitations:['De simulator behandelt de lamp als vaste weerstand. Een echte gloeilamp verandert van weerstand met de temperatuur. Laadpieken hangen ook van bronimpedantie en componenten af; voorspellingen zijn geen metingen.']
},
2:{
 title:'Driefasige pulsgenerator',pages:'22–26; voorbereiding p. 24',
 goal:'De voeding, synchronisatie en zes gate-uitgangen begrijpen en de ontsteekhoek uit tijdmetingen bepalen.',
 theory:[
  {title:'Drie verschillende signalen',text:'De elektronica vraagt +15 V, −15 V en GND. De controlespanning van 0–10 V stelt de ontsteekhoek in. Drie galvanisch gescheiden synchronisatiespanningen geven de netfasen door; hun amplitude is niet de gatepulshoogte.'},
  {title:'Fase en gatepuls',text:'De drie fasen liggen 120° uit elkaar. Een driefasige volgestuurde brug krijgt iedere 60° een volgende hoofdpuls. Een gatepuls alleen garandeert geen geleiding: de thyristor moet voorwaarts gepolariseerd zijn en voldoende gatestroom krijgen.'}
 ],
 formulas:[
  {formula:'Δt = α/(360f); α = 360fΔt',meaning:'Verband tussen elektrische hoek en tijdvertraging.',conditions:'α in graden, f in Hz en Δt in seconden; leg de synchronisatiereferentie vast.'},
  {formula:'Bij 50 Hz: T = 20 ms; 60° = 3,33 ms; 180° = 10 ms.',meaning:'Berekende tijdreferenties voor de scoop.',conditions:'Dit zijn theoriegetallen, geen gemeten paneelwaarden.'}
 ],
 questions:[
  {question:'Welke aansluitingen heeft de pulsgenerator nodig?',answer:'Voedingsrails ±15 V met GND, de gescheiden synchronisatiefasen met hun juiste referentie, en de controlespanning. De cursus vermeldt ongeveer 12 V synchronisatie via kleine transformatoren; controleer de aanwezige paneeluitvoering.'},
  {question:'Waarom dubbelpulsen?',answer:'Voor een volgestuurde driefasenbrug moeten twee passende thyristoren een stroompad vormen. Een extra puls op een reeds aangestuurd kanaal helpt dat pad tot stand brengen, bijvoorbeeld bij starten of onderbroken stroom.'},
  {question:'Hoe bereid je de halfgestuurde en volgestuurde brug voor?',answer:'Teken eerst alle stroompaden en bepaal welke thyristoren gelijktijdig moeten geleiden. Een enkelfasige brug vraagt passende, tegengestelde synchronisatiereferenties; de driefasige standaardvolgorde mag je niet zonder meer overnemen. Laat de concrete synchronisatieaansluiting uit de cursus door de docent bevestigen.'},
  {question:'Wat doet inhibit?',answer:'Inhibit blokkeert nieuwe gatepulsen. Een reeds geleidende thyristor blijft geleiden totdat zijn stroom onder de houdstroom komt.'},
  {question:'Is α altijd lineair met de controlespanning?',answer:'Nee. De simulator gebruikt een expliciete voorbeeldkalibratie. De echte α(U)-karakteristiek wordt met de scoop opgenomen; noteer ook pulsbreedte en pulshoogte.'}
 ],
 steps:['Bereid een blokschema voor met voeding, controle, synchronisatie en gate-uitgangen.','Vergelijk elke puls met zijn fase en zet pulsbreedte om van ms naar graden.','Onderzoek enkelpuls, dubbelpuls en pulstrein; leg voor elke brug de stroompaden vast.'],
 checklist:['Zijn voeding, synchronisatie en gate-amplitude onderscheiden?','Kan ik de gekozen nul- of commutatiereferentie uitleggen?','Kan ik verklaren waarom een gatepuls geen uitschakelcommando is?'],
 limitations:['De voorbereiding geeft functionele verbanden, geen vervangend klemmenplan. Paneelkalibratie, transformatoraansluiting en concrete brugbedrading moeten bij de gebruikte apparatuur passen.']
},
3:{
 title:'Gelijkrichten met thyristoren',pages:'27–28; voorbereiding p. 27',
 goal:'De diodemetingen herhalen met regelbare ontsteekhoek en het verschil tussen R- en RL-geleiding verklaren.',
 theory:[
  {title:'Faseaansnijding',text:'Een voorwaarts gepolariseerde thyristor wordt met een gatepuls ontstoken. Later ontsteken verkort bij R de geleidende sinusdelen. Uitschakelen gebeurt bij het verdwijnen van de anode-/laststroom, niet door de gatepuls weg te nemen.'},
  {title:'Inductieve last',text:'Een spoel kan de stroom voorbij de spanningsnuldoorgang voortzetten. Een volgestuurde brug kan tijdelijk negatieve uitgangsspanning hebben; een halfgestuurde brug heeft een vrijlooppad. De stroomcontinuïteit bepaalt welke gemiddelde-spanningsformule geldig is.'}
 ],
 formulas:[
  {formula:'Enkelzijdig R: Ugem = Û(1 + cosα)/(2π)',meaning:'Gemiddelde uitgangsspanning bij ontsteekhoek α.',conditions:'Ideale thyristor, sinusbron en R; geleiding van α tot π.'},
  {formula:'Dubbelzijdig R: Ugem = Û(1 + cosα)/π',meaning:'Beide alternanties leveren gelijkgerichte R-stroom.',conditions:'Passende brugaansturing; geen continue-stroomaanname.'},
  {formula:'Volgestuurde brug: Ugem = (2Û/π)cosα',meaning:'Gemiddelde spanning bij continue DC-stroom.',conditions:'Continue stroom, ideale commutatie en geen overlap. Niet automatisch geldig voor een kleine spoel.'},
  {formula:'L·di/dt + R·i = u',meaning:'De spanning bepaalt hoe de spoelstroom verandert.',conditions:'Tijdens de passende geleidende of vrijlopende stroomweg.'}
 ],
 questions:[
  {question:'Wat moet uit labo 1 en 2 herhaald worden?',answer:'DC/AC/RMS, belastingsstroom en laadpieken, de dimmerwerking, paneelvoeding, synchronisatiereferenties en de juiste gatevolgorde.'},
  {question:'Wat verandert bij een grotere α?',answer:'Bij R dalen gemiddelde spanning en stroom. Bij RL veranderen ook geleidingsduur en stroomcontinuïteit; toets de gekozen formule aan de gemeten golfvorm.'},
  {question:'Waarom dooft RL-stroom later?',answer:'De spoel geeft opgeslagen energie af en houdt de stroom in dezelfde richting in stand. Een negatieve spanning kan de stroom laten afnemen zonder hem meteen negatief te maken.'},
  {question:'Betekent α boven 90° altijd netto teruglevering?',answer:'Nee. De continue-stroomformule wordt dan negatief, maar een passieve R/RL-last kan niet blijvend energie produceren. Duurzaam inverterbedrijf vraagt een actieve DC-energiebron en passende commutatie.'}
 ],
 steps:['Teken per schakeling vermogen-, gate- en meetcircuit afzonderlijk.','Onderzoek enkelzijdig R, daarna RL met de cursuswaarden 200 Ω en 100 mH.','Herhaal de dubbelzijdige metingen en vergelijk dezelfde α en meetdefinities.'],
 checklist:['Kan ik elk geleidings- en vrijloopinterval aanwijzen?','Is de continuïteitsvoorwaarde van mijn formule geldig?','Zijn alle scoopkanalen en probeverhoudingen vastgelegd?'],
 limitations:['Werkelijke thyristoren hebben spanningsval, houdstroom en commutatie-eisen. De simulator idealiseert deze en berekent geen echte piekbelasting van de apparatuur.']
},
6:{
 title:'IGBT-chopper en meerkwadrantenwerking',pages:'43–52; voorbereiding p. 43–44',
 goal:'De onderdelen van een frequentiesturing herkennen en PWM-spanning en R/RL-stroom bij klasse A, H-brug en inverter voorspellen.',
 theory:[
  {title:'Van net naar motor',text:'Functionele keten: net → gelijkrichter → DC-tussenkring → inverter → motor. De gelijkrichter maakt DC. De opstartweerstand begrenst het laden van de buffercondensator; het opstartrelais overbrugt haar na het laden. De afvlakspoel vermindert stroomrimpel; de buffercondensator slaat energie op en beperkt spanningsrimpel.'},
  {title:'Remmen en inverter',text:'De rem-IGBT schakelt een remweerstand op de DC-bus om teruggevoerde energie te dissiperen. De inverter maakt met IGBT’s een instelbare wisseluitgang. Klasse A levert één spannings-/stroomkwadrant; een geschikte H-brug kan beide polariteiten en beide stroomrichtingen ondersteunen.'}
 ],
 formulas:[
  {formula:'D = ton/T; klasse A: Ugem = D·Udc; Urms = Udc√D',meaning:'Gemiddelde en RMS van pulsen tussen 0 en Udc.',conditions:'Ideale unipolaire PWM. Bij R geldt Irms = Urms/R en P = Urms²/R.'},
  {formula:'Bipolaire H-brug: Ugem = (2D − 1)Udc; Urms = Udc',meaning:'Gemiddelde kan van teken wisselen terwijl totale spannings-RMS gelijk blijft.',conditions:'Alleen voor schakelen tussen +Udc en −Udc; andere modulatieschema’s geven andere RMS-verbanden.'},
  {formula:'τ = L/R; Udc ≈ √2·Ulijn,rms',meaning:'RL-tijdconstante en benaderde geladen DC-busspanning.',conditions:'De busformule geldt voor een ideale capacitief afgevlakte diodebrug nabij de spanningspiek; verliezen, belasting en rimpel veranderen de waarde.'}
 ],
 questions:[
  {question:'Welke drie spanningsvormen moet je voorbereiden?',answer:'Teken de sinusvormige netingang, de overwegend constante DC-bus met rimpel en de geschakelde motoruitgang met een 50 Hz-fundamentaal. Verwar de PWM-pulsen niet met een zuivere sinus.'},
  {question:'Wat verwacht je bij 25%, 50% en 75% klasse-A-uitsturing?',answer:'Ug/Udc is 0,25; 0,50; 0,75. Urms/Udc is respectievelijk 0,50; 0,707; 0,866. Dit zijn berekende verhoudingen; gebruik de echte gemeten busspanning voor absolute waarden.'},
  {question:'Waarom blijft RL-stroom lopen wanneer de IGBT uitschakelt?',answer:'De spoel verzet zich tegen een snelle stroomverandering. Diodes en/of aangestuurde schakelaars bieden een vrijloop- of terugvoerpad. Zonder dat pad zou een grote overspanning ontstaan.'},
  {question:'Wat gebeurt bij hogere schakelfrequentie?',answer:'Bij dezelfde gemiddelde referentie worden de stroomveranderingen per puls doorgaans kleiner. Echte schakelverliezen kunnen toenemen; die worden hier niet berekend.'},
  {question:'Waarom V/f gebruiken bij een asynchrone motor?',answer:'Onder de basisfrequentie helpt ongeveer constant U/f de flux op peil houden. Vaste hoge spanning bij lage frequentie kan overflux veroorzaken. Boven de spanningsgrens daalt de flux en het beschikbare koppel.'}
 ],
 steps:['Benoem de acht onderdelen uit de cursus en teken hun functionele keten.','Bereken PWM-RMS en belastingsvermogen vóór de R-metingen; onderzoek daarna de spoelinvloed.','Vergelijk klasse A, positieve/negatieve H-bruguitsturing, blok-/sinusreferentie en driefasig U/f.'],
 checklist:['Is DC-busspanning onderscheiden van motorlijnspanning en fundamentaal?','Kan ik de vrijlooppaden en energierichting verklaren?','Zijn voeding en componentgrenzen op de echte opstelling bevestigd?'],
 limitations:['De uitvoeringsopgave noemt 3 × 230 V ingang op p. 45; gebruik de werkelijk bevestigde voeding en gemeten busspanning. De R/RL-simulator identificeert geen echte motor. De H-brug-RMS-formule moet passen bij het daadwerkelijk gebruikte modulatieschema.']
}
};
if(typeof module!=='undefined'&&module.exports)module.exports=preparations;
if(root)root.DrivePreparationElectronics=preparations;
})(typeof window!=='undefined'?window:typeof globalThis!=='undefined'?globalThis:null);
