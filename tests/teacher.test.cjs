'use strict';
const assert=require('node:assert/strict');
const T=require('../assets/teacher.js'),machines=require('../assets/machines.js'),electronics=require('../assets/electronics.js'),M=require('../labo8/assets/model.js');
let count=0;
function test(name,fn){fn();console.log('PASS '+name);count++;}
const lab=id=>[...machines,...electronics].find(x=>x.id===id),defaults=m=>Object.fromEntries(m.controls.map(c=>[c.key,c.value]));
function context(id,changes,extra={}){const m=lab(id),a={...defaults(m),...(extra.params||{})},b={...a,...changes};return T.explain({labId:id,oldParams:a,newParams:b,oldResult:m.compute(a),newResult:m.compute(b),controls:m.controls,meta:{kind:'stationary'}});}
function dynamicResult(p,action='start'){
 const d=M.simulate(p,p.duration,action),s=d.last,q=M.metrics(d.data,M.effectiveTarget(p)),mt=(label,value,unit)=>({label,value,unit});
 return {metrics:[mt('Frequentie',s.f,'Hz'),mt('Synchroon toerental',s.ns,'tpm'),mt('Werkelijk toerental',s.n,'tpm'),mt('Motorkoppel',s.M,'N·m'),mt('Belastingskoppel',s.T,'N·m'),mt('J',s.J,'kg·m²'),mt('Hoekversnelling',s.alpha,'rad/s²'),mt('Motorstroom',s.I,'A'),mt('Motorspanning',s.U,'V'),mt('Elektrisch vermogen',s.Pel,'W'),mt('Mechanisch vermogen',s.Pm,'W'),mt('Piek motorkoppel',q.maxM,'N·m'),mt('Piek versnelling',q.maxA,'rad/s²'),mt('Aanlooptijd',q.settled??'Niet bereikt','s')],charts:[{title:'Toerental in de tijd',xLabel:'Tijd (s)',yLabel:'Toerental (tpm)',series:[{name:'n',points:d.data.map(s=>({x:s.t,y:s.n}))}]}]};
}
function dynamic(changes,extra={}){const a=M.validate({...M.defaults,...extra.params}),b=M.validate({...a,...changes});return {a,b,ex:T.explain({labId:8,oldParams:a,newParams:b,oldResult:dynamicResult(a,extra.action),newResult:dynamicResult(b,extra.action),meta:{kind:'dynamic-forecast',action:extra.action||'Aanloop'}})};}
const row=(e,label)=>e.rows.find(r=>r.label===label);
test('ASM frequency explanation contains actual before/after synchronous and rotor speeds',()=>{
 const e=context(7,{frequency:50},{params:{frequency:30}});assert.equal(row(e,'Synchroon toerental').before,900);assert.equal(row(e,'Synchroon toerental').after,1500);assert.equal(row(e,'Werkelijk toerental').before,864);assert.equal(row(e,'Werkelijk toerental').after,1440);assert.match(e.technical.join(' '),/nₛ = 60f\/p/);assert.match(e.graphNotes.join(' '),/referentiecurves blijven gelijk/);assert.doesNotMatch(e.report,/getoonde echte motorsnelheid/);
});
test('ASM voltage explanation quotes recomputed torque rather than universal current trend',()=>{
 const e=context(7,{line:300},{params:{voltageMode:'fixed'}});const r=row(e,'Motorkoppel');assert(r.after<r.before);assert(Math.abs(r.after/r.before-.5625)<1e-10);assert.match(e.technical.join(' '),/geen algemene stroomregel/);
});
test('DC load changes computed armature current and explains back-EMF relation',()=>{
 const e=context(5,{load:5});assert(row(e,'Ankerstroom').after>row(e,'Ankerstroom').before);assert.match(e.technical.join(' '),/kΦIₐ/);assert.match(e.technical.join(' '),/geen aanlooptijd/);
});
test('Electrical source voltage is not described as motor voltage',()=>{
 const e=context(1,{voltage:115});assert.equal(row(e,'U true RMS (AC+DC)').after,row(e,'U true RMS (AC+DC)').before/2);assert.match(e.simple.join(' '),/netspanning vóór de gelijkrichter/);
});
test('An inactive capacitor parameter is explicitly inactive under R load',()=>{
 const e=context(1,{capacitance:100});assert.match(e.simple.join(' '),/alleen bij RC/);assert.equal(row(e,'U gemiddeld (DC)').before,row(e,'U gemiddeld (DC)').after);assert.match(e.graphNotes.join(' '),/blijven gelijk/);
});
test('DC bus change is distinguished from output RMS and motor line voltage',()=>{
 const e=context(6,{dcVoltage:400});assert.match(e.simple.join(' '),/DC-tussenkringspanning/);assert.match(e.warnings.join(' '),/geen.*|niet.*berekend/);assert.match(e.technical.join(' '),/DC-bus is niet gelijk/);
});
test('Pulse calibration shows numeric angle without pretending it is manufacturer calibration',()=>{
 const e=context(2,{control:9});assert(Math.abs(row(e,'Ontsteekhoek α').after-18)<1e-10);assert.match(e.technical.join(' '),/geen universele paneelkalibratie/);
});
test('J comparison uses actual model runs and does not claim always longer startup',()=>{
 const {ex:e}=dynamic({J:.2},{params:{maxTorque:40}});assert.equal(row(e,'J').before,.1);assert.equal(row(e,'J').after,.2);assert(row(e,'Piek motorkoppel').after>row(e,'Piek motorkoppel').before);assert.match(e.simple.join(' '),/alleen langer/);assert.match(e.technical.join(' '),/stationair n is α = 0/);assert.match(e.warnings.join(' '),/twee afzonderlijk berekende proeven/);
});
test('Frequency-mode explanation matches scalar slip physics',()=>{
 const {ex:e}=dynamic({frequencyTarget:50},{params:{controlMode:'frequency',frequencyTarget:30}});assert(Math.abs(row(e,'Synchroon toerental').before-900)<1e-6);assert(Math.abs(row(e,'Synchroon toerental').after-1500)<1e-6);assert(Math.abs(row(e,'Werkelijk toerental').before-875)<.01);assert(Math.abs(row(e,'Werkelijk toerental').after-1475)<.01);assert.match(e.technical.join(' '),/geen PI-snelheidsregeling/);
});
test('Frequency maximum explains actual clamping',()=>{
 const {ex:e}=dynamic({maxFrequency:40},{params:{controlMode:'frequency',frequencyTarget:50}});assert(Math.abs(row(e,'Frequentie').after-40)<1e-8);assert.match(e.warnings.join(' '),/overschrijdt de grens/);
});
test('Accelerating and braking ramps state correct signs and limitations',()=>{
 const e=dynamic({rampUp:1.5}).ex;assert.match(e.technical.join(' '),/αop ≈/);assert.match(e.report,/werkelijke as|echte helling/);const d=dynamic({rampDown:.5},{params:{initial:1400,target:0},action:'brake'}).ex;assert.match(d.technical.join(' '),/positief blijven/);assert.match(d.warnings.join(' '),/korte deceleratietijd/);
});
test('Undervoltage includes rated reference and computed current data',()=>{
 const e=dynamic({nominalVoltage:300}).ex;assert.equal(row(e,'Maximale omvormerlijnspanning').after,300);assert.match(e.technical.join(' '),/ratedVoltage is de nominale motorreferentie/);assert.notEqual(row(e,'Motorstroom').before,row(e,'Motorstroom').after);
});
test('Motor current constant changes real estimated current and model caveats remain',()=>{
 const e=dynamic({torqueConstant:1.5}).ex;assert(row(e,'Motorstroom').after>row(e,'Motorstroom').before);assert.match(e.technical.join(' '),/quasistationaire schattingen/);
});
test('Fixed-voltage overflux warning uses actual frequency after a speed-only change',()=>{
 const {ex:e}=dynamic({target:200},{params:{controlMode:'speed',voltageMode:'fixed',frequencyTarget:50}});const f=row(e,'Frequentie').after;assert(f>0&&f<10);assert.match(e.warnings.join(' '),/werkelijk berekende frequentie/);assert.match(e.warnings.join(' '),/overmagnetisering/);assert.equal(e.changes.length,1);assert.equal(e.changes[0].key,'target');
 const off=T.explain({labId:8,oldParams:{...M.defaults,voltageMode:'fixed'},newParams:{...M.defaults,voltageMode:'fixed',target:0},newResult:{metrics:[{label:'Frequentie',value:0,unit:'Hz'}]},meta:{kind:'dynamic-forecast'}});assert.doesNotMatch(off.warnings.join(' '),/werkelijk berekende frequentie/);
});
test('Quadratic load explanation uses cubic power condition and actual load change',()=>{
 const e=dynamic({loadType:'quadratic'}).ex;assert(row(e,'Belastingskoppel').after>row(e,'Belastingskoppel').before);assert.match(e.technical.join(' '),/ongeveer als ω³/);assert.match(e.technical.join(' '),/zonder dominant constant deel/);
});
test('Inertia triplet and load variants have dedicated conditional explanations',()=>{
 const a={J1:.05,J2:.1,J3:.2,rampUp:4,nominalSpeed:1400},b={...a,J3:.3};let e=T.explain({labId:8,oldParams:a,newParams:b,meta:{kind:'inertia'}});assert.match(e.technical.join(' '),/J3: 0,2 → 0,3 kg/);assert.match(e.simple.join(' '),/koppelreserve/);e=T.explain({labId:8,oldParams:{variantA:.6},newParams:{variantA:.8},meta:{kind:'load'}});assert.match(e.technical.join(' '),/factorNieuw\/factorOud/);
});
test('Missing values are labelled instead of fabricated',()=>{
 const m=lab(5),a=defaults(m),b={...a,load:12,limit:1};const e=T.explain({labId:5,oldParams:a,newParams:b,controls:m.controls,oldResult:m.compute(a),newResult:m.compute(b)});assert.equal(row(e,'Werkelijk toerental').after,'Niet berekend');assert.match(e.warnings.join(' '),/geen meetwaarde/);
});
test('Unsynchronised DFIG explanation warns and does not invent net power',()=>{
 const e=context(9,{rotorFrequency:20},{params:{mode:'grid'}});assert.equal(row(e,'Totaal netvermogen').after,'Niet berekend');assert.match(e.warnings.join(' '),/geen actueel stationair netvermogen/);
});
test('Quiz changes never claim a newly recomputed physical result',()=>{
 const e=T.explain({labId:10,oldParams:{answer:0},newParams:{answer:1},newResult:{metrics:[{label:'Aantal beantwoord',value:1,unit:''}]},meta:{kind:'exercise',summary:'Je koos 20 rad/s².'}});assert.match(e.simple[0],/20 rad/);assert.match(e.report,/geen nieuwe fysische simulatie/);assert.doesNotMatch(e.report,/model is opnieuw doorgerekend/);
});
test('Hover explanation uses actual sample for acceleration and generator signs',()=>{
 const h=T.pointExplanation({labId:8,point:{sample:{n:700,M:4.5,T:2.5,J:.1,alpha:20}}});assert.match(h,/α=20 rad/);assert.match(h,/neemt toe/);const g=T.pointExplanation({labId:8,point:{sample:{n:700,M:-2,T:2.5,J:.1,alpha:-45}}});assert.match(g,/generatorisch remmen/);
});
test('All ordinary controls produce distinct complete reports without undefined values',()=>{
 for(const m of [...machines,...electronics]){const p=defaults(m),base=m.compute(p);for(const c of m.controls){const val=c.type==='select'?c.options.find(o=>String(o[0])!==String(p[c.key]))?.[0]:p[c.key]===c.min?c.max:c.min;if(val===undefined)continue;const q={...p,[c.key]:val},e=T.explain({labId:m.id,controls:m.controls,oldParams:p,newParams:q,oldResult:base,newResult:m.compute(q)});assert.equal(e.changes.length,1,m.id+':'+c.key);assert(e.technical.length&&e.observation.length&&e.report.startsWith('Gesimuleerde resultaten'),c.key);assert(!e.report.includes('undefined'),m.id+':'+c.key);}}
});
console.log(count+' teacher controls passed.');
