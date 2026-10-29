'use strict';
const assert=require('node:assert/strict');
const M=require('../labo8/assets/model.js');
let passed=0;
function test(name,fn){fn();passed++;console.log('PASS '+name);}
const close=(a,b,t=1e-6)=>assert.ok(Math.abs(a-b)<t,`${a} differs from ${b}`);
function finite(d){for(const s of d.data)for(const [k,x] of Object.entries(s))if(typeof x==='number')assert.ok(Number.isFinite(x),k);}

test('New settings validate while legacy defaults remain the speed controller',()=>{
 const p=M.validate({frequencyTarget:250,maxFrequency:-5});assert.equal(p.frequencyTarget,200);assert.equal(p.maxFrequency,1);
 assert.equal(M.defaults.controlMode,'speed');assert.equal(M.defaults.voltageMode,'vf');
 assert.throws(()=>M.validate({controlMode:'unknown'}));assert.throws(()=>M.validate({voltageMode:'unknown'}));
});
test('Frequency mode reaches synchronous frequency with load-dependent rotor slip',()=>{
 const a=M.simulate({controlMode:'frequency',frequencyTarget:30},16),b=M.simulate({controlMode:'frequency',frequencyTarget:50},16);
 close(a.last.f,30);close(b.last.f,50);close(a.last.ns,900);close(b.last.ns,1500);
 close(a.last.n,875,.02);close(b.last.n,1475,.02);close(a.last.slip,(900-875)/900,.0001);
 close(M.effectiveTarget(a.p),a.last.n,.02);assert.ok(b.last.Pm>a.last.Pm);finite(a);finite(b);
});
test('Heavier load gives larger scalar-control slip without inventing a speed jump',()=>{
 const a=M.simulate({controlMode:'frequency',frequencyTarget:50,T0:2.5},16),b=M.simulate({controlMode:'frequency',frequencyTarget:50,T0:5},16);
 close(a.last.f,b.last.f);assert.ok(b.last.n<a.last.n);assert.ok(b.last.I>a.last.I);close(b.last.M,5,.01);
});
test('Frequency update keeps shaft speed continuous and the mechanical impulse exact',()=>{
 const d=M.simulate({controlMode:'frequency',frequencyTarget:30},10),oldW=d.w,oldN=d.last.n;
 d.update({frequencyTarget:50});close(d.w,oldW);d.step();
 close(d.p.J*(d.w-oldW)/.002,d.net,1e-9);assert.ok(Math.abs(M.rpm(d.w)-oldN)<5);
 d.advance(10);close(d.last.f,50);assert.ok(d.last.n>1400);
});
test('Maximum frequency constrains both frequency and speed-mode examples',()=>{
 for(const p of [{controlMode:'frequency',frequencyTarget:80,maxFrequency:30},{controlMode:'speed',target:2000,maxFrequency:30}]){
  const d=M.simulate(p,18);assert.ok(d.data.every(s=>Math.abs(s.f)<=30+1e-9));
  close(d.last.n,875,.1);assert.ok(Math.abs(d.last.target)<=900);
 }
});
test('Lowering frequency ceiling live forces physically attainable torque without a shaft jump',()=>{
 for(const direction of [1,-1]){
  const d=M.simulate({target:direction*1400,rampDown:30},16),before=d.w,start=d.t;
  d.update({maxFrequency:20});close(d.w,before);assert.ok(Math.abs(d.last.n)>1300);
  let regenerative=false;
  for(let i=0;i<18000;i++){
   const previous=d.w;d.step();close(d.p.J*(d.w-previous)/.002,d.net,1e-9);
   if(d.t>start+.5&&Math.abs(M.rpm(d.w))>605){
    assert.ok(d.motor*direction<1e-5,'Overspeed cannot sustain motoric torque above the frequency ceiling');
    regenerative=true;
   }
  }
  assert.ok(regenerative);assert.ok(d.data.filter(s=>s.t>start+.5).every(s=>Math.abs(s.f)<=20+1e-8));
  close(d.last.n,direction*575,.1);finite(d);
 }
});
test('Undervoltage reduces current-limited and pull-out torque capacity',()=>{
 const rated=M.validate({nominalVoltage:400}),half=M.validate({nominalVoltage:200}),low=M.validate({nominalVoltage:100});
 const w=M.rad(1000),a=M.availableTorque(w,rated),b=M.availableTorque(w,half),c=M.availableTorque(w,low);
 assert.ok(a>b&&b>c);close(a,12);close(b,6);close(c,1.5);
 const dr=M.simulate({nominalVoltage:400,T0:4,rampUp:1},16),dh=M.simulate({nominalVoltage:200,T0:4,rampUp:1},16);
 assert.ok(M.metrics(dh.data,1400).settled>M.metrics(dr.data,1400).settled);
 assert.ok(dh.last.I>dr.last.I);assert.ok(dh.last.U<dr.last.U);
});
test('Torque ceiling can stall an undervoltage drive under excessive load',()=>{
 const d=M.simulate({nominalVoltage:100,T0:4},10);assert.ok(Math.abs(d.last.n)<.1);
 assert.ok(d.data.every(s=>Math.abs(s.M)<=1.500001));
});
test('V/f preserves normalized flux below base while fixed voltage creates overflux',()=>{
 const p=M.validate({controlMode:'frequency'}),vf=M.fluxState(30,p),fixed=M.fluxState(30,{...p,voltageMode:'fixed'});
 close(vf.rawFlux,1);assert.ok(fixed.rawFlux>1.6);close(vf.idealVoltage,240);close(fixed.idealVoltage,400);
 const a=M.electrical(M.rad(875),2.5,p,true,30),b=M.electrical(M.rad(875),2.5,{...p,voltageMode:'fixed'},true,30);
 assert.ok(b.U>a.U);assert.ok(b.I>a.I);assert.ok(b.fluxRatio>1);assert.ok(b.flux<=1);
});
test('Overvoltage does not manufacture an unlimited torque gain',()=>{
 const a=M.validate({nominalVoltage:400}),b=M.validate({nominalVoltage:690});
 close(M.availableTorque(M.rad(500),a),M.availableTorque(M.rad(500),b));
 assert.ok(M.fluxState(20,b).overflux>0);
});
test('Above base frequency voltage is bounded and torque weakens',()=>{
 const p=M.validate({controlMode:'frequency',frequencyTarget:80}),a=M.fluxState(50,p),b=M.fluxState(80,p);
 close(a.idealVoltage,400);close(b.idealVoltage,400);assert.ok(b.flux<a.flux);
 const d=M.simulate(p,20);assert.ok(d.data.every(s=>s.U<=400+1e-8));close(d.last.f,80);
 assert.ok(M.availableTorque(M.rad(2200),p)<p.maxTorque);finite(d);
});
test('The rated voltage reference independently changes flux and torque capability',()=>{
 const a=M.validate({ratedVoltage:400,nominalVoltage:230}),b=M.validate({ratedVoltage:230,nominalVoltage:230});
 assert.ok(M.availableTorque(M.rad(900),b)>M.availableTorque(M.rad(900),a));
 close(M.fluxState(30,b).rawFlux,1);
});
test('Scalar reverse and controlled braking enter the expected quadrants',()=>{
 const reverse=M.simulate({controlMode:'frequency',frequencyTarget:-50},18);assert.ok(reverse.last.n< -1400);assert.equal(reverse.last.q,'III');
 const brake=M.simulate({controlMode:'frequency',frequencyTarget:0,initial:1400,rampDown:1},10,'brake');
 assert.ok(brake.data.some(s=>s.q==='II'));assert.ok(Math.abs(brake.last.n)<1);finite(brake);
});
test('Faster ramps and larger inertia conditionally change peak torque and start duration',()=>{
 const slow=M.simulate({rampUp:8,maxTorque:20},18),fast=M.simulate({rampUp:1,maxTorque:20},18);
 assert.ok(M.metrics(fast.data,1400).maxM>M.metrics(slow.data,1400).maxM);
 const larger=M.simulate({J:.2,rampUp:4,maxTorque:20},18),smaller=M.simulate({J:.05,rampUp:4,maxTorque:20},18);
 assert.ok(M.metrics(larger.data,1400).maxM>M.metrics(smaller.data,1400).maxM);
 assert.ok(Math.abs(M.metrics(larger.data,1400).settled-M.metrics(smaller.data,1400).settled)<1.2);
});
test('Fast deceleration can regenerate while slow deceleration may remain motoric',()=>{
 const fast=M.simulate({initial:1400,target:700,rampDown:1},8),slow=M.simulate({initial:1400,target:700,rampDown:20},16);
 assert.ok(fast.data.some(s=>s.q==='II'));assert.ok(slow.data.some(s=>s.alpha<-.2&&s.M>0));
});
test('Voltage and frequency extreme examples remain finite and energy consistent',()=>{
 for(const p of [{controlMode:'frequency',frequencyTarget:5,voltageMode:'fixed',nominalVoltage:690},
 {controlMode:'frequency',frequencyTarget:100,nominalVoltage:24,ratedVoltage:690},
 {controlMode:'frequency',frequencyTarget:-80,maxFrequency:40,initial:2000}]){
  const d=M.simulate(p,6);finite(d);
  for(const s of d.data){assert.ok(Math.abs(s.PF)<=1+1e-9);assert.ok(Math.abs(s.Pel)<=Math.sqrt(3)*s.U*s.I+1e-7);assert.ok(Math.abs(s.f)<=d.p.maxFrequency+1e-9);}
 }
});
console.log(`${passed} frequency/voltage/drive-setting checks passed.`);
