(function(root){'use strict';
const TAU=2*Math.PI, clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const num=(p,k,d,a=-Infinity,b=Infinity)=>clamp(Number.isFinite(+p[k])?+p[k]:d,a,b);
const N=(key,label,value,min,max,step,unit='')=>({key,label,value,min,max,step,unit,type:'number'});
const S=(key,label,value,options)=>({key,label,value,type:'select',options});
const series=(name,xy)=>({name,points:xy});
const metric=(label,value,unit)=>({label,value,unit});
function summaries(data){
 const avg=k=>data.reduce((a,r)=>a+r[k],0)/data.length;
 const rms=k=>Math.sqrt(data.reduce((a,r)=>a+r[k]*r[k],0)/data.length);
 const u=avg('u'),ur=rms('u'),i=avg('i'),ir=rms('i'),sr=rms('is');
 const power=data.reduce((a,r)=>a+r.vs*r.is,0)/data.length,vr=rms('vs');
 return {u,ur,uac:Math.sqrt(Math.max(0,ur*ur-u*u)),i,ir,sr,power,pf:sr>1e-9?clamp(power/(vr*sr),-1,1):0,
  ripple:Math.max(...data.map(r=>r.u))-Math.min(...data.map(r=>r.u)),peak:Math.max(...data.map(r=>Math.abs(r.is)))};
}
function electricalCharts(data,extra=[]){
 const points=k=>data.map(r=>({x:r.t*1000,y:r[k]}));
 return [{title:'Spanningen in de tijd',xLabel:'Tijd (ms)',yLabel:'Spanning (V)',series:[series('Netspanning',points('vs')),series('Belastingsspanning',points('u'))]},
 {title:'Stromen in de tijd',xLabel:'Tijd (ms)',yLabel:'Stroom (A)',series:[series('Belastingsstroom',points('i')),series('Netstroom',points('is'))]},...extra];
}
function rectifier(p,controlled=false){
 const V=num(p,'voltage',230,1,500),f=num(p,'frequency',50,5,100),R=num(p,'resistance',200,10,2000);
 const L=num(p,'inductance',100,0,2000)/1000,C=num(p,'capacitance',25,1,1000)*1e-6,Rs=num(p,'sourceR',2,.2,50);
 const load=p.load||'R',mode=p.topology||'half',half=mode==='half',semi=mode==='semi',a=num(p,'alpha',60,0,175)*Math.PI/180;
 const cap=!controlled&&load==='RC',ind=load==='RL'&&L>0;
 const steps=cap?2400:1000,dt=1/(f*steps),vp=Math.SQRT2*V;
 const tau=cap?R*C:(ind?L/R:0),warm=Math.min(150,Math.max(8,Math.ceil(6*tau*f)));
 const records=[];let i=0,vc=cap?vp:0,on=false,pair=1,lastGate=-Infinity;
 for(let j=0;j<(warm+2)*steps;j++){
  const t=j*dt,theta=TAU*f*(t+dt/2),phase=((theta%TAU)+TAU)%TAU,vs=vp*Math.sin(theta);
  let u=0,is=0,g=0;
  if(cap){
   const supply=half?Math.max(0,vs):Math.abs(vs),vold=vc;
   if(supply>vc){const conductance=1/Rs+1/R,eq=(supply/Rs)/conductance;vc=eq+(vc-eq)*Math.exp(-conductance*dt/C);}
   else vc*=Math.exp(-dt/(R*C));
   vc=Math.max(0,vc);u=(vold+vc)/2;i=u/R;
   const diode=Math.max(0,C*(vc-vold)/dt+i);is=diode*(half?1:Math.sign(vs));
  }else if(controlled){
   const period=half?TAU:Math.PI,gateIndex=Math.floor((theta-a)/period);
   if(gateIndex>lastGate){
    if(j>0||theta>=a){on=true;pair=half?1:(gateIndex%2===0?1:-1);g=1;}
    lastGate=gateIndex;
   }
   const candidate=half?vs:pair*vs;
   if(on){u=semi?Math.max(0,candidate):candidate;
    if(ind){const next=u/R+(i-u/R)*Math.exp(-R*dt/L);if(next<=0){i=0;on=false;u=0;}else i=next;}
    else {i=Math.max(0,u/R);if(u<=0){on=false;u=0;}}
   }else i=0;
   is=(semi&&candidate<0)?0:(half?i:pair*i);
  }else if(ind){
   const candidate=half?vs:Math.abs(vs);
   if(candidate>0||i>0){u=candidate;const next=u/R+(i-u/R)*Math.exp(-R*dt/L);if(next<=0){i=0;u=0;}else i=next;}
   is=half?i:Math.sign(vs)*i;
  }else{u=half?Math.max(0,vs):Math.abs(vs);i=u/R;is=half?i:Math.sign(vs)*i;}
  if(j>=warm*steps&&((j-warm*steps)%2===0))records.push({t:t-warm/f,vs,u,i,is,g});
 }
 const v=summaries(records),kind=half?'Enkelzijdige':semi?'Halfgestuurde brug':'Volgestuurde brug';
 return {metrics:[metric('U gemiddeld (DC)',v.u,'V'),metric('U true RMS (AC+DC)',v.ur,'V'),metric('U AC-component RMS',v.uac,'V'),metric('I belasting gemiddeld',v.i,'A'),metric('I belasting true RMS',v.ir,'A'),metric('I net true RMS',v.sr,'A'),metric('Netvermogen actief',v.power,'W'),metric('Power factor net',v.pf,'1'),metric('Rimpel top-top',v.ripple,'V'),metric('Piek netstroom',v.peak,'A')],
  charts:electricalCharts(records),explanation:controlled?
  `${kind}: een grotere ontsteekhoek stelt het inschakelen uit. Met R dooft de stroom bij de spanningsnuldoorgang. Met L blijft stroom mogelijk lopen als de bronspanning al van teken wisselt; de opgeslagen magnetische energie wordt dan teruggeleverd. In de halfgestuurde brug loopt die stroom intern vrij. Een passieve RL-belasting kan zonder tegen-EMK geen blijvend netto inverterbedrijf opnemen.`:
  cap?'De condensator levert stroom aan de weerstand tussen de toppen. Daardoor stijgt de gemiddelde uitgangsspanning en daalt de rimpel, maar de netstroom concentreert zich in laadpulsen. Een eindige bronweerstand begrenst deze pulsen. De grafiek toont de periodieke toestand na het inslingeren; de inschakelpiek is niet opgenomen.':
  ind?'De spoel verzet zich tegen snelle stroomveranderingen. Bij enkelzijdige gelijkrichting kan ze de stroom tot voorbij de spanningsnuldoorgang voortzetten, waardoor de belastingsspanning tijdelijk negatief is. Er is hier geen extra vrijloopdiode. Bij een diodebrug blijft de spanning gelijkgericht en is de stroom gladder.':
  'De belastingsstroom volgt de gelijkgerichte spanning: i = u/R. Enkelzijdig geleidt slechts één halve periode; dubbelzijdig worden beide helften benut. DC is het gemiddelde, true RMS beschrijft de volledige golf en AC RMS alleen het wisselende deel.'};
}
const labs=[];
labs.push({id:1,title:'Gelijkrichters en meettoestellen',subtitle:'Diodegelijkrichting met R, RL en condensator',pages:'8–21',
 description:'Vergelijk gemiddelde waarde, true RMS en de AC-component. Onderzoek belastingsstroom, netstroom en afvlakking.',
 controls:[S('topology','Gelijkrichter','half',[['half','Enkelzijdig · één diode'],['full','Dubbelzijdig · diodebrug']]),S('load','Belasting','R',[['R','Weerstand R'],['RL','Weerstand + spoel'],['RC','Weerstand + afvlakcondensator']]),N('voltage','Netspanning RMS',230,12,400,1,'V'),N('frequency','Netfrequentie',50,5,100,1,'Hz'),N('resistance','Belastingsweerstand',200,10,2000,10,'Ω'),N('inductance','Spoel bij RL',100,0,2000,10,'mH'),N('capacitance','Condensator bij RC',25,1,1000,1,'µF'),N('sourceR','Bronweerstand bij RC',2,.2,50,.2,'Ω')],
 presets:[{name:'Enkelzijdig R · 200 Ω',values:{topology:'half',load:'R',resistance:200}},{name:'Enkelzijdig RL · 100 mH',values:{topology:'half',load:'RL',resistance:200,inductance:100}},{name:'Afvlakking · 25 µF',values:{topology:'half',load:'RC',resistance:200,capacitance:25}},{name:'Diodebrug RL',values:{topology:'full',load:'RL',resistance:200,inductance:100}}],compute:p=>rectifier(p),
 theory:['u(t) = √2·U_rms·sin(2πft). U_DC = gemiddelde(u); U_RMS = √gemiddelde(u²); U_AC = √(U_RMS² − U_DC²).','Enkelzijdig R: U_DC = Û/π en U_RMS = Û/2. Dubbelzijdig R: U_DC = 2Û/π en U_RMS = Û/√2.','Bij RL geldt L·di/dt + R·i = u. Bij afvlakking geldt i_diode = C·du/dt + u/R.','PF = P/(U_RMS·I_RMS) aan de netzijde. Door stroomvervorming kan PF afwijken van cosφ.'],
 tasks:['Voorspel en controleer U_DC, U_RMS, I_DC en I_RMS bij enkelzijdige R-belasting.','Vergelijk de volledige true RMS met de RMS van de AC-component, zoals bij de meettoestellen.','Voeg 100 mH toe en verlaag de weerstand. Verklaar de langere geleidingsduur.','Voeg 25 µF toe. Vergelijk de rimpel en de piek van de netstroom.','Herhaal R en RL met dubbelzijdige gelijkrichting.'],
 assumptions:['Ideale dioden zonder spanningsval; sinusbron; gloeilamp als vaste weerstand, zonder temperatuurafhankelijkheid.','De instelbare bronweerstand wordt alleen in het RC-model gebruikt om fysisch eindige laadpulsen te krijgen.','Het RL-model bevat geen aparte vrijloopdiode. De grafieken tonen de periodieke toestand, geen echte metingen.']});

labs.push({id:2,title:'Driefasige pulsgenerator',subtitle:'Synchronisatie, ontsteekhoek, dubbelpulsen en pulstreinen',pages:'22–26',description:'Bekijk de zes gatekanalen ten opzichte van de drie synchronisatiespanningen en neem α(U) op.',
 controls:[N('control','Controlespanning',6,0,10,.1,'V'),N('frequency','Synchronisatiefrequentie',50,5,100,1,'Hz'),N('syncRms','Synchronisatiespanning RMS',12,1,30,1,'V'),N('width','Pulsbreedte',5,1,15,1,'°'),N('height','Gatepulshoogte',10,1,15,1,'V'),S('pulse','Pulsvorm','single',[['single','Enkelpuls'],['double','Dubbelpuls · 60° extra'],['train','Pulstrein · 60° venster']]),S('enabled','Pulsuitgang','on',[['on','Vrijgegeven'],['off','Inhibit actief · geen pulsen']])],
 presets:[{name:'Vroege ontsteking',values:{control:9,pulse:'single'}},{name:'Dubbelpulsen',values:{control:6,pulse:'double'}},{name:'Pulstrein',values:{control:4,pulse:'train'}},{name:'Inhibit',values:{enabled:'off'}}],
 compute(p){const f=num(p,'frequency',50,5,100),rms=num(p,'syncRms',12,1,30),alpha=180*(1-num(p,'control',6,0,10)/10),width=num(p,'width',5,1,15),height=num(p,'height',10,1,15),names=['P1P','P3N','P2P','P1N','P3P','P2N'],phases=[[],[],[]],gates=names.map(()=>[]),enabled=p.enabled!=='off';
  for(let j=0;j<=2160;j++){const angle=j/3,t=angle/(360*f)*1000;for(let k=0;k<3;k++)phases[k].push({x:t,y:Math.SQRT2*rms*Math.sin((angle-120*k)*Math.PI/180)});
   for(let k=0;k<6;k++){const rel=((angle-(30+alpha+60*k))%360+360)%360;let active=rel<width;if(p.pulse==='double')active=active||(rel>=60&&rel<60+width);if(p.pulse==='train')active=rel<60&&rel%12<Math.min(width,6);gates[k].push({x:t,y:enabled&&active?height:0});}}
  const delay=alpha/(360*f)*1000,widthMs=width/(360*f)*1000;
  return {metrics:[metric('Ontsteekhoek α',alpha,'°'),metric('Vertraging na referentie',delay,'ms'),metric('Pulsbreedte',widthMs,'ms'),metric('Afstand opeenvolgende kanalen',1000/(6*f),'ms'),metric('Periodetijd',1000/f,'ms')],
   charts:[{title:'Drie synchronisatiespanningen',xLabel:'Tijd (ms)',yLabel:'Spanning (V)',series:phases.map((a,k)=>series('L'+(k+1),a))},...gates.map((a,k)=>({title:names[k]+' gatepuls',xLabel:'Tijd (ms)',yLabel:'Gate (V)',series:[series(names[k],a)]})),{title:'Onderwijsmodel α(U)',xLabel:'Controlespanning (V)',yLabel:'Ontsteekhoek (°)',series:[series('Lineaire voorbeeldkalibratie',Array.from({length:101},(_,j)=>({x:j/10,y:180*(1-j/100)})))]}],
   explanation:`Bij ${num(p,'control',6,0,10).toFixed(1)} V geeft de gekozen voorbeeldkalibratie α = ${alpha.toFixed(1)}°. De zes hoofdpulsen liggen 60° uit elkaar; ieder individueel kanaal herhaalt elke 360°. Dubbelpulsen geven hetzelfde kanaal 60° later een tweede ontstekingskans. Bij inhibit blijven alle gate-uitgangen laag. De referentie ligt 30° na de positieve L1-nuldoorgang, zoals bij de natuurlijke commutatie van een driefasige brug.`};},
 theory:['Een driefasig direct systeem bevat drie sinusspanningen met 120° faseverschuiving. Een zes-pulsbrug heeft iedere 60° een volgend ontstekingsmoment.','Tijd en hoek: Δt = α/(360f). Een elektrische periode komt overeen met 360°.','Dubbelpulsen helpen bij het tot stand brengen van een geleidende stroomweg door twee thyristoren van een volgestuurde brug.','Het paneel uit de cursus gebruikt ±15 V voeding, synchronisatiespanningen en een controlespanning van 0–10 V. De synchronisatiespanning is niet de gatepulshoogte.'],
 tasks:['Vergelijk de zes uitgangen met L1, L2 en L3 en bepaal de onderlinge fasevolgorde.','Verander de controlespanning van 10 naar 0 V en bepaal α(U).','Zet pulsbreedte in graden om naar milliseconden.','Vergelijk enkelpuls, dubbelpuls en pulstrein en verklaar waarvoor dubbelpulsen nodig zijn.','Activeer inhibit en controleer wat er met de uitgangen gebeurt.'],
 assumptions:['α = 180°·(1 − Ucontrol/10 V) is een expliciete voorbeeldkalibratie; de werkelijke paneelkarakteristiek moet in het labo worden gemeten.','Pulsbreedte, hoogte en pulstreinfrequentie zijn onderwijsparameters; geen fabrikantkalibratie of aansluitschema.','Getoond wordt de conventionele referentie van een zes-pulsbrug. De synchronisatie voor andere brugschakelingen moet apart worden bepaald.']});

labs.push({id:3,title:'Gelijkrichten met thyristoren',subtitle:'Faseaansnijding met R en RL',pages:'27–28',description:'Onderzoek ontsteekhoek, gemiddelde uitgangsspanning en de vertraagde uitdoving van de stroom.',
 controls:[S('topology','Schakeling','half',[['half','Enkelzijdig · één thyristor'],['semi','Halfgestuurde brug · vrijloop'],['full','Volgestuurde brug']]),S('load','Belasting','R',[['R','Weerstand'],['RL','Weerstand + spoel']]),N('voltage','Netspanning RMS',230,12,400,1,'V'),N('frequency','Netfrequentie',50,5,100,1,'Hz'),N('alpha','Ontsteekhoek',60,0,175,1,'°'),N('resistance','Belastingsweerstand',200,10,2000,10,'Ω'),N('inductance','Spoel bij RL',100,0,2000,10,'mH')],
 presets:[{name:'Enkelzijdig R · 30°',values:{topology:'half',load:'R',alpha:30}},{name:'Enkelzijdig RL · 90°',values:{topology:'half',load:'RL',alpha:90,inductance:500,resistance:50}},{name:'Volgestuurde brug RL',values:{topology:'full',load:'RL',alpha:45,inductance:1000,resistance:50}},{name:'Halfgestuurde brug RL',values:{topology:'semi',load:'RL',alpha:90,inductance:1000,resistance:50}}],compute:p=>rectifier(p,true),
 theory:['Een gatepuls ontsteekt een voorwaarts gepolariseerde thyristor. De component blijft geleiden tot de stroom onder de houdstroom valt; de gate zet hem niet actief uit.','Bij enkelzijdige R-belasting geldt U_DC = Û·(1 + cosα)/(2π). Bij dubbelzijdige R-belasting is deze waarde tweemaal zo groot.','Bij voldoende continue stroom in een volgestuurde brug geldt U_DC = 2Û·cosα/π. Deze formule geldt niet zomaar bij discontinue stroom.','Een spoel houdt stroom in stand na de spanningsnuldoorgang. In een halfgestuurde brug kan vrijloop optreden; in een volgestuurde brug kan de bron tijdelijk energie terugontvangen.'],
 tasks:['Voer de enkelzijdige metingen eerst met R uit en vergelijk U_DC met de formule.','Herhaal met 200 Ω en 100 mH en bepaal wanneer de stroom dooft.','Herhaal met een dubbelzijdige schakeling en vergelijk de spannings- en stroomgolf.','Verhoog α en onderzoek waarom de continue-stroomformule bij een kleine L niet meer toepasbaar is.','Vergelijk halfgestuurde en volgestuurde brug en verklaar vrijloop en negatieve spanningsstukken.'],
 assumptions:['Ideale thyristoren: geen spanningsval, geen houdstroomdrempel en onmiddellijke commutatie. De stroom wordt bij nul afgekapt.','Geen tegen-EMK; alleen passieve R of RL. Netto inverterbedrijf vraagt een actieve energiebron aan de DC-zijde.','De cursus noemt dubbelzijdige gelijkrichting; half- en volgestuurde brug worden als expliciete onderwijsvarianten apart aangeboden.']});

function chopper(p){
 const topology=p.topology||'A',R=num(p,'resistance',200,10,1000),L=num(p,'inductance',120,0,1400)/1000,V=num(p,'dcVoltage',325,12,700),fc=num(p,'switchHz',1000,100,8000),f=num(p,'frequency',50,5,100),d=num(p,'duty',50,0,100)/100,m0=num(p,'amplitude',.8,0,1),dir=+p.direction===-1?-1:1;
 const ac=topology==='AC'||topology==='3P',three=topology==='3P',useVf=p.vf==='yes',m=m0*(three&&useVf?Math.min(f/50,1):1),bipolar=topology==='E';
 const dt=1/Math.max(fc*100,ac?f*1800:0),duration=ac?2/f:10/fc,warm=ac?Math.max(5/f,6*L/R):Math.max(20/fc,6*L/R);
 const total=Math.ceil((warm+duration)/dt),sampleStart=total-Math.round(duration/dt),stride=Math.max(1,Math.ceil((total-sampleStart)/2200));
 let currents=[0,0,0],sumU=0,sumU2=0,sumI=0,sumI2=0,sumP=0,sumLine2=0,count=0,peak=0;const rec=[],zoom=[];
 for(let j=0;j<total;j++){
  const t=(j+.5)*dt,theta=TAU*f*t,phase=(t*fc)%1,carrier=4*Math.abs(phase-.5)-1;
  let us=[0,0,0],legs=[0,0,0];
  if(three){for(let k=0;k<3;k++){const sin=Math.sin(theta-k*TAU/3),reference=m*(p.wave==='block'?Math.sign(sin):sin);legs[k]=reference>=carrier?V:0;}const neutral=(legs[0]+legs[1]+legs[2])/3;us=legs.map(x=>x-neutral);}
  else if(topology==='AC'){
   if(p.wave==='block'){const local=((theta%TAU)+TAU)%TAU,halfLocal=local%Math.PI,active=Math.abs(halfLocal-Math.PI/2)<m*Math.PI/2;us[0]=active?dir*Math.sign(Math.sin(theta))*V:0;}
   else us[0]=dir*(m*Math.sin(theta)>=carrier?V:-V);
  }else if(bipolar){const direction=(p.reversal==='yes'&&j>=sampleStart+(total-sampleStart)/2)?-dir:dir,ref=direction*(2*d-1);us[0]=phase<(1+ref)/2?V:-V;}
  else us[0]=phase<d?V:0;
  for(let k=0;k<(three?3:1);k++)currents[k]=L>0?us[k]/R+(currents[k]-us[k]/R)*Math.exp(-R*dt/L):us[k]/R;
  if(j>=sampleStart){const u=us[0],i=currents[0],line=three?legs[0]-legs[1]:u,power=us.reduce((s,v,k)=>s+v*currents[k],0),out={x:(j-sampleStart)*dt*1000,u,i,line,uB:us[1],uC:us[2]};sumU+=u;sumU2+=u*u;sumI+=i;sumI2+=i*i;sumP+=power;sumLine2+=line*line;count++;peak=Math.max(peak,Math.abs(i));if((j-sampleStart)%stride===0)rec.push(out);if(j-sampleStart<Math.round(8/fc/dt)&&(j-sampleStart)%Math.max(1,Math.floor(8/fc/dt/2000))===0)zoom.push(out);}
 }
 const points=(data,k)=>data.map(r=>({x:r.x,y:r[k]}));
 const charts=[{title:three?'Driefasige uitgangsspanningen':'Uitgangsspanning',xLabel:'Tijd (ms)',yLabel:'Spanning (V)',series:three?[series('UAN',points(rec,'u')),series('UBN',points(rec,'uB')),series('UCN',points(rec,'uC')),series('UAB lijn',points(rec,'line'))]:[series('U belasting',points(rec,'u'))]},
 {title:'Belastingsstroom',xLabel:'Tijd (ms)',yLabel:'Stroom (A)',series:[series(three?'IA':'I belasting',points(rec,'i'))]},
 {title:'Detail van acht schakelperioden',xLabel:'Tijd (ms)',yLabel:'Spanning (V)',series:[series('PWM uitgang',points(zoom,'u'))]}];
 const metrics=[metric('U gemiddeld',sumU/count,'V'),metric(three?'Fasespanning true RMS':'U true RMS',Math.sqrt(sumU2/count),'V'),metric('I gemiddeld',sumI/count,'A'),metric('I true RMS',Math.sqrt(sumI2/count),'A'),metric('P actief naar belasting',sumP/count,'W'),metric('Piek stroom',peak,'A'),metric('Tijdconstante L/R',1000*L/R,'ms')];
 if(three){metrics.push(metric('Lijnspanning true RMS',Math.sqrt(sumLine2/count),'V'),metric('Effectieve modulatie-index',m,'1'));}
 return {metrics,charts,explanation:three?'Drie brugtakken maken spanningen met 120° verschoven referenties. De belasting is een symmetrische ster-RL zonder nulleider. De fasespanning volgt uit de takspanning minus het sterpuntpotentiaal. Met U/f actief neemt de modulatie-index onder 50 Hz evenredig met de frequentie af. De stroom komt uit het RL-model; dit is nog geen asynchroon motormodel.':
 topology==='AC'?'De H-brug maakt afwisselend positieve en negatieve spanning. Bij sinusmodus ontstaat bipolaire PWM met een sinusreferentie. Bij blokmodus is de uitgang ±Udc of nul; de amplitude-instelling bepaalt de pulsbreedte per halve periode. De spoel onderdrukt snelle stroomveranderingen.':
 bipolar?'De klasse E-H-brug schakelt hier met bipolaire PWM tussen +Udc en −Udc: Ugem = richting·(2D − 1)·Udc. De spanning kan onmiddellijk omkeren, maar een inductieve stroom niet. Daardoor zijn tijdelijk tegengestelde tekens van spanning en stroom mogelijk en gaat opgeslagen spoelenergie terug naar de ideale DC-bron.':
 'De klasse A-chopper schakelt tussen Udc en nul. Gemiddeld is U = D·Udc; de true RMS is Udc·√D. Een spoel houdt de stroom tijdens de uit-tijd via de vrijloopdiode in stand. Hogere schakelfrequentie of een grotere L verkleint de stroomrimpel.'};
}
labs.push({id:6,title:'IGBT-chopper en invertor',subtitle:'Klasse A, klasse E, AC-invertor en driefasige U/f',pages:'43–52',description:'Verander duty cycle, schakelfrequentie en inductie en bekijk de berekende PWM-spanning en stroom.',
 controls:[S('topology','Omvormer','A',[['A','Klasse A · één kwadrant'],['E','Klasse E · H-brug'],['AC','Enkelfasige AC-invertor'],['3P','Driefasige invertor · ster-RL']]),N('dcVoltage','DC-busspanning',325,12,700,1,'V'),N('duty','Duty cycle bij A/E',50,0,100,1,'%'),S('direction','Richting bij E/AC','1',[['1','Vooruit'],['-1','Omgekeerd']]),S('reversal','Omkering halverwege bij E','no',[['no','Constante richting'],['yes','Richting omkeren']]),N('switchHz','Schakelfrequentie',1000,100,8000,100,'Hz'),N('resistance','Weerstand',200,10,1000,10,'Ω'),N('inductance','Spoel · 0 voor zuiver R',120,0,1400,10,'mH'),N('frequency','Uitgangsfrequentie bij AC/3P',50,5,100,1,'Hz'),N('amplitude','Amplitude-index bij AC/3P',.8,0,1,.05,'1'),S('wave','Golfvorm bij AC/3P','sine',[['sine','Sinusreferentie'],['block','Blokreferentie']]),S('vf','U/f bij driefasig','yes',[['yes','Actief · basissnelheid 50 Hz'],['no','Uitgeschakeld']])],
 presets:[{name:'A · R · 25%',values:{topology:'A',inductance:0,duty:25}},{name:'A · RL · 75%',values:{topology:'A',inductance:120,duty:75}},{name:'E · richting omkeren',values:{topology:'E',duty:75,inductance:500,reversal:'yes'}},{name:'AC · blok 50 Hz',values:{topology:'AC',wave:'block',frequency:50,amplitude:.5,inductance:120}},{name:'AC · sinus 50 Hz',values:{topology:'AC',wave:'sine',frequency:50,amplitude:.5,inductance:120}},{name:'Driefasig U/f · 25 Hz',values:{topology:'3P',wave:'sine',frequency:25,amplitude:.9,vf:'yes'}}],compute:chopper,
 theory:['Klasse A: Ugem = D·Udc en U_RMS = Udc·√D. Bij R geldt I_RMS = U_RMS/R.','Klasse E met bipolaire PWM: Ugem = (2D − 1)·Udc; de richtingkeuze keert de referentie om. U_RMS blijft Udc. Andere PWM-strategieën kunnen andere RMS-waarden geven.','RL: L·di/dt + R·i = u. De tijdconstante is τ = L/R; stroom kan niet onmiddellijk van teken veranderen.','Een frequentiesturing bevat gelijkrichter, laadweerstand en overbruggingsrelais, DC-buffer/spoel, remchopper/weerstand en inverter. De laadweerstand beperkt de inschakelstroom; de remtak neemt teruggeleverde energie op als er geen netterugvoeding is.','Bij driefasige sinus-PWM onder de basisfrequentie verlaagt U/f de spanningsreferentie evenredig met f. Dat helpt de motorflux te behouden.'],
 tasks:['Controleer klasse A met R bij 25%, 50% en 75% en vergelijk met de RMS-formule.','Voeg 120 mH toe en herhaal de drie duty cycles; varieer daarna L en de schakelfrequentie.','Onderzoek klasse E met beide richtingen. Gebruik een omkering en let op de tekens van u en i.','Vergelijk bij 50 Hz een blokgolf en sinus-PWM met een RL-belasting.','Kies driefasig en varieer 5–50 Hz met en zonder U/f. Vergelijk fase-, lijnspanning en stroom.'],
 assumptions:['Ideale schakelaars, ideale vrijloop- en antiparalleldioden, geen dode tijd, verliezen, verzadiging of schakeloverspanning.','De belasting is R of RL; dit onderdeel schat geen motortoerental. Voor de asynchrone motor gebruik je labo 7 of 8.','De DC-bus is een constante ideale bron die ook teruggeleverde energie kan opnemen. De meetbare echte DC-bus hangt af van de voeding en gelijkrichter.','Blokmodus bij de enkelfasige invertor gebruikt een instelbare pulsbreedte per halve periode. Bij driefasig wordt een blok- of sinusreferentie met een driehoekcarrier vergeleken.','De volledige curve wordt voor de grafiek uitgedund; het aparte PWM-detail toont de schakelpulsen. RMS en vermogen worden vóór het uitdunnen uit alle integratiestappen berekend.']});
if(typeof module!=='undefined'&&module.exports)module.exports=labs;
if(root)root.DriveElectronics=labs;
})(typeof window!=='undefined'?window:null);
