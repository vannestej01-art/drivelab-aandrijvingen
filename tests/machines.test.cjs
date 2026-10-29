'use strict';
const assert=require('node:assert/strict');
const labs=require('../assets/machines.js');
const {dcPoint,inductionPoint,dfigPoint}=labs._physics;
const params=lab=>Object.fromEntries(lab.controls.map(c=>[c.key,c.value]));
const close=(a,b,tol=1e-8)=>assert.ok(Math.abs(a-b)<tol*Math.max(1,Math.abs(a),Math.abs(b)),`${a} != ${b}`);
let tests=0;
function test(name,fn){fn();tests++;console.log('PASS',name);}
test('All labs produce finite calculated values, curves and independent controls',()=>{
 for(const lab of labs){const p=params(lab),r=lab.compute(p);assert.ok(r.metrics.length);assert.ok(r.charts.length);
  for(const m of r.metrics)assert.ok(Number.isFinite(m.value),m.label);
  for(const c of r.charts){assert.ok(c.xLabel&&c.yLabel);for(const s of c.series){assert.ok(s.points.length<=1000);for(const q of s.points)assert.ok(Number.isFinite(q.x)&&Number.isFinite(q.y));}}
  for(const c of lab.controls){const changed={...p,[c.key]:c.type==='select'?c.options.find(o=>o[0]!==p[c.key])[0]:Math.min(c.max,p[c.key]+(c.step||1)*3)};let active=JSON.stringify(lab.compute(changed))!==JSON.stringify(r);if(lab.id===9)active=active||JSON.stringify(lab.compute({...changed,mode:'grid'}))!==JSON.stringify(lab.compute({...p,mode:'grid'}));assert.ok(active,`Ignored control ${lab.id}:${c.key}`);}
 }
});
test('DC power balance includes armature, field and viscous losses',()=>{const p=params(labs[0]),r=dcPoint(p,3);close(r.armature+r.field,r.mechanical+r.loss+r.field);});
test('DC lower armature voltage lowers speed at same torque and field',()=>{const p=params(labs[0]);assert.ok(dcPoint(p,3,160).n<dcPoint(p,3,220).n);});
test('DC field weakening raises no-load speed and requires more torque current',()=>{const p=params(labs[0]);assert.ok(dcPoint(p,0,220,120).n>dcPoint(p,0).n);assert.ok(dcPoint(p,3,220,120).Ia>dcPoint(p,3).Ia);});
test('DC overcurrent is excluded from the feasible steady curve',()=>{const p={...params(labs[0]),limit:1};assert.equal(dcPoint(p,8).valid,false);});
test('Induction zero slip gives zero electromagnetic torque',()=>{const r=inductionPoint(params(labs[1]),50,0);close(r.torque,0);assert.ok(r.current>0);close(r.n,1500);});
test('Induction motor and generator signs and both copper losses balance',()=>{const p=params(labs[1]);for(const s of [.04,-.08,1]){const r=inductionPoint(p,50,s);close(r.pin,r.mechanical+r.cu1+r.cu2);assert.ok(r.cu1>=0&&r.cu2>=0);assert.equal(Math.sign(r.torque),Math.sign(s));}});
test('Induction torque scales with voltage squared without saturation',()=>{const p=params(labs[1]),a=inductionPoint(p,50,.04),b=inductionPoint({...p,line:200},50,.04);close(a.torque,4*b.torque);});
test('Induction ster/driehoek changes phase voltage and line current correctly',()=>{const p=params(labs[1]),a=inductionPoint(p,50,.04),b=inductionPoint({...p,connection:'delta'},50,.04);close(b.u,Math.sqrt(3)*a.u);close(b.torque,3*a.torque);close(b.current,3*a.current);});
test('DFIG sub/supersynchronous rotor frequency maintains 50 Hz',()=>{const p=params(labs[2]);close(dfigPoint(p,1200,10).fs,50);close(dfigPoint(p,1800,-10).fs,50);});
test('DFIG voltage open stator scales linearly with current and absolute frequency',()=>{const p=params(labs[2]),a=dfigPoint(p),b=dfigPoint(p,p.speed,p.rotorFrequency,2*p.rotorCurrent);close(b.emf,2*a.emf);close(dfigPoint(p,0,0).emf,0);});
test('DFIG ideal rotor powers and mechanical balance in both speed regimes',()=>{const p=params(labs[2]);for(const n of [1200,1500,1800]){const r=dfigPoint(p,n);close(r.pr,-r.s*r.ps);close(r.pg+r.mechanicalInput,0);assert.ok(r.ps<0);if(n<1500)assert.ok(r.pr>0);if(n>1500)assert.ok(r.pr<0);}});
test('DFIG mismatched rotor command does not report a fictitious grid operating power',()=>{const lab=labs[2],r=lab.compute({...params(lab),mode:'grid',rotorFrequency:0});assert.ok(!r.metrics.some(m=>m.label==='Totaal netvermogen'));});
console.log(`${tests} machine model checks passed`);
