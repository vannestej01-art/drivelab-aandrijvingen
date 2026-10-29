(function(root){'use strict';
const pi=Math.PI, sqrt3=Math.sqrt(3), rpm=w=>w*60/(2*pi), rad=n=>n*2*pi/60;
const metric=(label,value,unit='')=>({label,value,unit});
const ctrl=(key,label,value,min,max,step,unit='')=>({key,label,type:'number',value,min,max,step,unit});
const select=(key,label,value,options)=>({key,label,type:'select',value,options});
const series=(name,points)=>({name,points});
const graph=(title,xLabel,yLabel,curves)=>({title,xLabel,yLabel,series:curves});
const round=x=>Math.round(x*1000)/1000;
function defaults(lab,p){return Object.assign(Object.fromEntries(lab.controls.map(c=>[c.key,c.value])),p||{});}

function dcPoint(p,T,ua=p.ua,uf=p.uf){
 const If=uf/p.rf;
 const k=p.kNom*Math.tanh(If/p.knee)/Math.tanh(p.ifNom/p.knee);
 const omega=(ua-p.ra*T/k)/(k+p.ra*p.visc/k);
 const Ia=(T+p.visc*omega)/k;
 const valid=omega>=0&&Ia>=0&&Ia<=p.limit;
 return {T,If,k,omega,Ia,n:rpm(omega),valid,mechanical:T*omega,armature:ua*Ia,field:uf*If,loss:p.ra*Ia*Ia+p.visc*omega*omega};
}
const dc={
 id:5,title:'Onafhankelijk bekrachtigde DC-motor',subtitle:'Ankerspanning en veld beïnvloeden n(M) en Iₐ(M)',pages:'35–42',
 description:'Vergelijk de koppel-toerentalkarakteristieken bij drie ankerspanningen en bij drie veldspanningen. De belastingsmachine stelt het askoppel in.',
 controls:[ctrl('ua','Ankerspanning Uₐ',220,40,300,5,'V'),ctrl('uf','Veldspanning Uᶠ',200,20,250,5,'V'),ctrl('load','Lastkoppel',3,0,12,.1,'N·m'),ctrl('ra','Ankerweerstand Rₐ',3,.2,15,.1,'Ω'),ctrl('rf','Veldweerstand Rᶠ',400,100,1000,10,'Ω'),ctrl('kNom','Nominale kΦ',1.35,.3,3,.05,'V·s/rad'),ctrl('ifNom','Referentieveldstroom',.5,.1,2,.05,'A'),ctrl('knee','Schaal van verzadigingskromme',.4,.1,1.5,.05,'A'),ctrl('visc','Viskeus verliescoëfficiënt',.002,0,.02,.001,'N·m·s/rad'),ctrl('limit','Ankerstroomgrens',8,1,20,.5,'A')],
 presets:[{name:'Nominaal voorbeeld',values:{ua:220,uf:200,load:3}},{name:'Lagere ankerspanning',values:{ua:160,uf:200,load:3}},{name:'Veldverzwakking',values:{ua:220,uf:120,load:3}}],
 theory:['Uₐ = RₐIₐ + kΦω en M = kΦIₐ − bω bij stationair bedrijf. De effectieve kΦ is zowel de EMK- als koppelconstante in SI-eenheden.','Een kleinere ankerspanning verschuift n(M) bij gelijke flux ongeveer evenwijdig naar beneden.','Bij veldverzwakking stijgt het nullasttoerental, wordt de n(M)-helling steiler en is meer ankerstroom nodig voor hetzelfde koppel.','De veldstroom is Uᶠ/Rᶠ. Een tanh-verband modelleert verzadiging van de flux; het is een instelbaar voorbeeld en geen gemeten magnetisatiekromme.'],
 tasks:['Neem de karakteristieken op bij nominale ankerspanning en twee waarden lager dan nominaal maar hoger dan twee derde daarvan.','Herhaal bij een lagere veldstroom. Vergelijk alle n(M)- en Iₐ(M)-curves.','Verklaar waarom de gekoppelde asynchrone belastingsmachine voor rembedrijf dezelfde mechanische draairichting heeft.'],
 assumptions:['Stationaire gemiddelde DC-spanning; gelijkrichterrimpel en commutatie worden niet berekend.','Alle motorparameters zijn aanpasbare voorbeelden; vervang ze door kenplaat- en meetgegevens.','Alleen positieve, haalbare motorische punten onder de ankerstroomgrens worden getekend. Een lege curve betekent dat deze instelling het gebied niet kan leveren.','Alleen ankerkoper-, veldkoper- en viskeuze verliezen zijn meegenomen.'],
 compute(input){const p=defaults(dc,input),q=dcPoint(p,p.load),maxT=12;
  function curve(ua,uf,name,y){const pts=[];for(let i=0;i<=240;i++){const T=maxT*i/240,r=dcPoint(p,T,ua,uf);if(r.valid)pts.push({x:T,y:y(r)});}return series(name,pts);}
  const voltage=[1,.85,.7].map(a=>({ua:p.ua*a,uf:p.uf,name:`Uₐ ${round(p.ua*a)} V`}));
  const fields=[1,.8,.6].map(a=>({ua:p.ua,uf:p.uf*a,name:`Uᶠ ${round(p.uf*a)} V`}));
  const all=voltage.concat(fields.slice(1));
  const metrics=[metric('Veldstroom',q.If,'A'),metric('Effectieve kΦ',q.k,'V·s/rad')];
  if(q.valid)metrics.unshift(metric('Werkelijk toerental',q.n,'tpm'),metric('Ankerstroom',q.Ia,'A'),metric('Asvermogen',q.mechanical,'W'),metric('Elektrisch totaal',q.armature+q.field,'W'));
  return {metrics,charts:[graph('Ankerspanning als parameter','Askoppel M (N·m)','Toerental n (tpm)',voltage.map(a=>curve(a.ua,a.uf,a.name,r=>r.n))),graph('Veldspanning als parameter','Askoppel M (N·m)','Toerental n (tpm)',fields.map(a=>curve(a.ua,a.uf,a.name,r=>r.n))),graph('Ankerstroom en askoppel','Askoppel M (N·m)','Ankerstroom Iₐ (A)',all.map(a=>curve(a.ua,a.uf,a.name,r=>r.Ia)))],explanation:q.valid?`Bij ${round(p.load)} N·m levert het model ${round(q.n)} tpm. De ankerstroom is ${round(q.Ia)} A; het extra koppel voor viskeuze verliezen is inbegrepen. Ankervermogen plus veldvermogen is mechanisch asvermogen plus berekende verliezen. De veldspanning wijzigen verandert tegelijk de flux, snelheid en koppel per ampère.`:'Voor deze last is geen stationair positief motorisch werkingspunt binnen de ingestelde ankerstroomgrens gevonden. Verlaag de last of kies een passende spanning en veldsterkte.'};
 }
};

const add=(a,b)=>[a[0]+b[0],a[1]+b[1]],mul=(a,b)=>[a[0]*b[0]-a[1]*b[1],a[0]*b[1]+a[1]*b[0]],div=(a,b)=>{const z=b[0]*b[0]+b[1]*b[1];return [(a[0]*b[0]+a[1]*b[1])/z,(a[1]*b[0]-a[0]*b[1])/z];},mag2=a=>a[0]*a[0]+a[1]*a[1];
function inductionPoint(p,f,s){
 const line=p.line*(p.voltageMode==='vf'?Math.min(f/50,1):1),u=p.connection==='star'?line/sqrt3:line;
 const zs=[p.r1,p.x1*f/50],zm=[0,p.xm*f/50],ws=2*pi*f/p.poles;
 let i1,i2;
 if(Math.abs(s)<1e-10){i1=div([u,0],add(zs,zm));i2=[0,0];}
 else {const zr=[p.r2/s,p.x2*f/50],zp=div(mul(zm,zr),add(zm,zr));i1=div([u,0],add(zs,zp));i2=div(mul(i1,zp),zr);}
 const gap=Math.abs(s)<1e-10?0:3*mag2(i2)*p.r2/s,torque=gap/ws,n=60*f/p.poles*(1-s);
 const mechanical=torque*rad(n),pin=3*u*i1[0],cu1=3*mag2(i1)*p.r1,cu2=3*mag2(i2)*p.r2;
 return {f,s,n,line,u,torque,pin,gap,mechanical,cu1,cu2,current:Math.sqrt(mag2(i1))*(p.connection==='delta'?sqrt3:1),ns:60*f/p.poles};
}
const induction={
 id:7,title:'Koppel en toerental van de asynchrone motor',subtitle:'Vergelijk 30, 40, 50 en 60 Hz met het equivalent schema',pages:'53–55',
 description:'Onderzoek de volledige motorische en generatorische karakteristiek. Het cursusnet is 3 × 400 V / 50 Hz; daarna volgen metingen via de frequentieregelaar.',
 controls:[ctrl('frequency','Gekozen frequentie',50,10,80,1,'Hz'),ctrl('line','Beschikbare lijnspanning',400,100,500,10,'V'),select('voltageMode','Spanningsregeling','vf',[['vf','U/f tot 50 Hz, daarna spanningsgrens'],['fixed','Vaste klemspanning']]),select('connection','Wikkelingschakeling','star',[['star','Ster: Ufase = Ulijn/√3'],['delta','Driehoek: Ufase = Ulijn']]),ctrl('slip','Gekozen slip',4,-30,100,1,'%'),ctrl('poles','Poolparen',2,1,4,1,''),ctrl('r1','Statorweerstand per fase',2,.2,6,.1,'Ω'),ctrl('r2','Herleide rotorweerstand',1.6,.2,6,.1,'Ω'),ctrl('x1','Statorlekreactantie bij 50 Hz',2,.3,8,.1,'Ω'),ctrl('x2','Rotorlekreactantie bij 50 Hz',2,.3,8,.1,'Ω'),ctrl('xm','Magnetiseerreactantie bij 50 Hz',60,20,200,5,'Ω')],
 presets:[{name:'Rechtstreeks net 50 Hz',values:{frequency:50,line:400,voltageMode:'fixed',connection:'star',slip:4}},{name:'U/f bij 30 Hz',values:{frequency:30,line:400,voltageMode:'vf',slip:4}},{name:'Veldverzwakking 60 Hz',values:{frequency:60,line:400,voltageMode:'vf',slip:4}},{name:'Generatorisch remmen',values:{frequency:50,slip:-8,voltageMode:'vf'}}],
 theory:['Het synchrone toerental is nₛ = 60f/p. Slip s = (nₛ − n)/nₛ is positief in motorbedrijf en negatief bij generatorbedrijf boven synchroon toerental.','Het model lost per fase R₁ + jX₁ in serie met de parallelkring van jXₘ en R₂′/s + jX₂′ op. M = 3|I₂′|²R₂′/(sωₛ). Reactanties zijn evenredig met f.','Onder de basisfrequentie houdt U/f de flux ongeveer constant. Boven 50 Hz blijft de maximale spanning hier gelijk en daalt het beschikbare koppel.','Bij ster krijgt iedere wikkeling Ulijn/√3; bij driehoek Ulijn. Vergelijk de fasespanning met de kenplaat voordat je een echte schakeling kiest.'],
 tasks:['Vergelijk de 50 Hz-karakteristiek rechtstreeks op het net met die via de frequentieregelaar.','Registreer n(M), Ufase(M) en Ilijn(M) voor 30, 40 en 60 Hz en vergelijk met 50 Hz.','Onderzoek n boven nₛ, bepaal het teken van M en vermogen en verklaar generatorisch remmen.'],
 assumptions:['Dit is een stationair sinusvormig equivalent schema met vaste weerstanden; temperatuur, verzadiging, omvormerharmonischen en omvormerlimieten zijn niet gemodelleerd.','De voorbeeldparameters zijn geen geïdentificeerde parameters van de aanwezige Leroy-Somer-motor.','Het ideale model geeft bij dezelfde frequentie en klemspanning dezelfde curve voor net en omvormer; werkelijke verschillen moeten worden gemeten.','De plots tonen alle punten van de statische curve, inclusief gebieden die een gewone snelheidsregeling niet stabiel kan volgen.'],
 compute(input){const p=defaults(induction,input),q=inductionPoint(p,p.frequency,p.slip/100),freqs=[30,40,50,60];if(!freqs.includes(p.frequency))freqs.push(p.frequency);
  const data=freqs.map(f=>{const pts=[];for(let i=0;i<=400;i++)pts.push(inductionPoint(p,f,1-1.3*i/400));return {f,pts};});
  function curves(y){return data.map(a=>series(`${a.f} Hz`,a.pts.map(r=>({x:r.torque,y:y(r)}))));}
  return {metrics:[metric('Synchroon toerental',q.ns,'tpm'),metric('Werkelijk toerental',q.n,'tpm'),metric('Motorkoppel',q.torque,'N·m'),metric('Lijnstroom',q.current,'A'),metric('Motorfasespanning',q.u,'V'),metric('Elektrisch vermogen',q.pin,'W'),metric('Mechanisch vermogen',q.mechanical,'W'),metric('Slip',p.slip,'%')],charts:[graph('Toerental met frequentie als parameter','Motorkoppel M (N·m)','Toerental n (tpm)',curves(r=>r.n)),graph('Motorfasespanning','Motorkoppel M (N·m)','Motorfasespanning U (V)',curves(r=>r.u)),graph('Motorstroom','Motorkoppel M (N·m)','Lijnstroom I (A)',curves(r=>r.current))],explanation:`Bij ${p.frequency} Hz is nₛ ${round(q.ns)} tpm. Slip ${p.slip}% geeft ${round(q.n)} tpm en ${round(q.torque)} N·m. ${q.torque<0?'Het negatieve koppel remt de positief draaiende as: generatorbedrijf.':'Het positieve koppel drijft de as aan.'} De fasespanning is ${round(q.u)} V bij ${p.connection==='star'?'ster':'driehoek'}. De mechanische omzetting en beide koperverliezen vormen samen het elektrische statorvermogen; bij generatorbedrijf blijft die balans met dezelfde tekens gelden.`};
 }
};

function dfigPoint(p,n=p.speed,fr=p.rotorFrequency,ir=p.rotorCurrent){
 const mechHz=p.poles*n/60,fs=mechHz+fr,emf=sqrt3*2*pi*Math.abs(fs)*p.mutual*ir;
 const ns=60*p.gridFrequency/p.poles,s=1-n/ns,required=p.gridFrequency-mechHz;
 const e=2*pi*p.gridFrequency*p.mutual*ir,u=p.gridVoltage/sqrt3,delta=p.angle*pi/180,x=2*pi*p.gridFrequency*p.leakage;
 const ps=-3*u*e*Math.sin(delta)/x,qs=3*u*(u-e*Math.cos(delta))/x,pr=-s*ps,pg=ps+pr;
 return {n,fs,emf,ns,s,required,error:fr-required,ps,pr,pg,qs,mechanicalInput:-pg,statorCurrent:Math.hypot(ps,qs)/(sqrt3*p.gridVoltage),synchronised:Math.abs(fr-required)<.25};
}
const dfig={
 id:9,title:'Dubbelgevoede asynchrone generator',subtitle:'Mechanische snelheid, rotorfrequentie en rotorstroom',pages:'59',
 description:'Een sleepringrotor krijgt een driefasige stroom met instelbare frequentie. Onderzoek eerst de geïnduceerde statorspanning bij open stator en daarna het ideale vermogensverloop bij netkoppeling.',
 controls:[select('mode','Onderzoekswijze','open',[['open','Open stator: frequentie en spanning'],['grid','Netgekoppeld: ideale vermogensbalans']]),ctrl('speed','Mechanisch toerental',1200,0,2400,10,'tpm'),ctrl('rotorFrequency','Rotorfrequentie met fasevolgordeteken',10,-40,50,1,'Hz'),ctrl('rotorCurrent','Rotorfasestroom effectief',1.2,0,4,.1,'A'),ctrl('poles','Poolparen',2,1,4,1,''),ctrl('mutual','Wederzijdse inductantie',.4,.1,.8,.02,'H'),ctrl('gridFrequency','Netfrequentie',50,40,60,1,'Hz'),ctrl('gridVoltage','Netlijnspanning',400,100,500,10,'V'),ctrl('leakage','Equivalente serie-inductantie',.15,.05,.5,.01,'H'),ctrl('angle','Generatorische belastingshoek',15,0,60,1,'°')],
 presets:[{name:'Ondersynchroon op 50 Hz',values:{mode:'open',speed:1200,rotorFrequency:10,rotorCurrent:1.2}},{name:'Bovensynchroon op 50 Hz',values:{mode:'open',speed:1800,rotorFrequency:-10,rotorCurrent:1.2}},{name:'Rotorstroom verhogen',values:{mode:'open',speed:1200,rotorFrequency:10,rotorCurrent:2}},{name:'Ideaal netgekoppeld ondersynchroon',values:{mode:'grid',speed:1200,rotorFrequency:10,angle:15}},{name:'Ideaal netgekoppeld bovensynchroon',values:{mode:'grid',speed:1800,rotorFrequency:-10,angle:15}}],
 theory:['De rotor heeft een toegankelijke driefasige wikkeling via sleepringen. De kooiankermotor heeft die afzonderlijk gevoede rotorwikkeling niet.','Het draaiveld gezien vanuit de stator heeft getekende elektrische frequentie fₛ = p·n/60 + fᵣ. Een negatieve fᵣ betekent omgekeerde fasevolgorde, geen negatieve meetfrequentie. De gemeten frequentie is |fₛ|.','Bij netkoppeling moet fᵣ = fnet − p·n/60 = s·fnet gelden. De mechanische snelheid kan daardoor variëren terwijl de stator op netfrequentie blijft.','Bij open stator gebruikt dit model ULL = √3·2π·|fₛ|·Lₘ·Iᵣ. De rotorfasestroom is hier effectief en de flux wordt lineair benaderd.','Bij een stijve netspanning verandert de rotorstroom vooral het interne EMK, de stromen en het actief/reactief vermogen; de netspanning zelf stijgt niet vrij mee.'],
 tasks:['Verander het mechanische toerental bij vaste rotorfrequentie en rotorstroom en verklaar de statorfrequentie en open-klemspanning.','Verander de rotorfrequentie en daarna de rotorstroom afzonderlijk. Vergelijk richting, frequentie en amplitude van de berekende statorspanning.','Stel voor 1200 en 1800 tpm telkens 50 Hz statorfrequentie in. Verklaar de richting van het rotorvermogen onder en boven het synchrone toerental.'],
 assumptions:['De cursus verwijst voor het exacte Lucas-Nülle/L@Bsoft-proefverloop en de toestelgegevens naar een aparte Toledo-cursus; die is niet aangeleverd. Dit tabblad demonstreert de onderliggende principes.','Open stator en netgekoppeld bedrijf zijn verschillende proeven. Een lijnspanning uit de open-statorformule is geen voorspelling van de klemspanning aan een stijf net.','Het netmodel is een vereenvoudigd verliesloos stationair EMK-achter-reactantie-model. Rotor-/statorweerstand, kernverliezen, verzadiging en converterdynamica ontbreken.','Tekenafspraak: positief elektrisch vermogen is opname uit het net; negatief is teruglevering. Een negatieve rotorfrequentie geeft de fasevolgorde aan.','De netcurves passen de rotorfrequentie op ieder punt aan voor synchronisme. Een onjuiste handmatige rotorfrequentie heeft geen stationair netbedrijf in dit model.'],
 compute(input){const p=defaults(dfig,input),q=dfigPoint(p),metrics=[metric('Statorfrequentie |fₛ|',Math.abs(q.fs),'Hz'),metric('Open-statorlijnspanning',q.emf,'V'),metric('Synchroon toerental net',q.ns,'tpm'),metric('Vereiste rotorfrequentie',q.required,'Hz'),metric('Afwijking synchronisme',q.error,'Hz'),metric('Slip t.o.v. net',100*q.s,'%')];
  let charts;
  if(p.mode==='open'){
   const speedPts=[],freqPts=[],currentPts=[];
   for(let i=0;i<=240;i++){const n=2400*i/240,f=-50+100*i/240,I=4*i/240;speedPts.push({x:n,y:dfigPoint(p,n).emf});freqPts.push({x:f,y:dfigPoint(p,p.speed,f).emf});currentPts.push({x:I,y:dfigPoint(p,p.speed,p.rotorFrequency,I).emf});}
   charts=[graph('Mechanisch toerental en open statorspanning','Mechanisch toerental n (tpm)','Lijnspanning U (V)',[series(`fᵣ = ${p.rotorFrequency} Hz`,speedPts)]),graph('Rotorfrequentie en open statorspanning','Rotorfrequentie fᵣ (Hz)','Lijnspanning U (V)',[series(`n = ${p.speed} tpm`,freqPts)]),graph('Rotorstroom en open statorspanning','Rotorfasestroom Iᵣ (A)','Lijnspanning U (V)',[series('Lineaire wederzijdse flux',currentPts)])];
  }else{
   if(q.synchronised)metrics.push(metric('Statorvermogen net',q.ps,'W'),metric('Rotorvermogen net',q.pr,'W'),metric('Totaal netvermogen',q.pg,'W'),metric('Mechanisch toegevoerd',q.mechanicalInput,'W'),metric('Statorlijnstroom',q.statorCurrent,'A'));
   const stat=[],rotor=[],total=[],required=[];
   for(let i=0;i<=240;i++){const n=q.ns*(.6+.8*i/240),r=dfigPoint(p,n);stat.push({x:n,y:r.ps});rotor.push({x:n,y:r.pr});total.push({x:n,y:r.pg});required.push({x:n,y:r.required});}
   charts=[graph('Vermogensbalans bij gesynchroniseerde rotor','Mechanisch toerental n (tpm)','Vermogen naar machine (W)',[series('Stator Pₛ',stat),series('Rotor Pᵣ',rotor),series('Totaal net P',total)]),graph('Nodige rotorfrequentie','Mechanisch toerental n (tpm)','Rotorfrequentie fᵣ (Hz)',[series('Synchronismevoorwaarde',required)])];
  }
  const explanation=p.mode==='open'?`Het statordraaiveld heeft ${round(q.fs)} Hz met teken; de frequentiemeter toont ${round(Math.abs(q.fs))} Hz. Bij ${p.rotorCurrent} A rotorfasestroom is de berekende open-klemspanning ${round(q.emf)} V. Dit is een open-statorproef: er wordt hier geen vermogen aan het net geleverd.`:!q.synchronised?`Geen stationair netbedrijf voor deze handmatige instelling: fᵣ moet ${round(q.required)} Hz zijn en wijkt nu ${round(q.error)} Hz af. De curves tonen de ideale referentie met op ieder toerental correct aangepaste rotorfrequentie; er wordt geen onjuist actueel netvermogen getoond.`:`De statorspanning wordt door het ${p.gridVoltage} V-net opgelegd. ${q.s>0?'Ondersynchroon neemt de rotor elektrisch vermogen op terwijl de stator meer vermogen aan het net afgeeft.':q.s<0?'Bovensynchroon leveren zowel stator als rotor vermogen aan het net.':'Op synchroon toerental is het ideale rotorvermogen nul.'} Hier geldt Pᵣ = −s·Pₛ en Pnet = Pₛ + Pᵣ = −Pmechanisch,toegevoerd. Negatieve elektrische waarden betekenen teruglevering.`;
  return {metrics,charts,explanation};
 }
};
const labs=[dc,induction,dfig];
Object.defineProperty(labs,'_physics',{value:{dcPoint,inductionPoint,dfigPoint},enumerable:false});
if(typeof module==='object'&&module.exports)module.exports=labs;
if(root)root.DriveMachines=labs;
})(typeof window!=='undefined'?window:typeof globalThis!=='undefined'?globalThis:null);
