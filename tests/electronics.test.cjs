'use strict';
const assert=require('node:assert/strict');
const labs=require('../assets/electronics.js');
const defaults=id=>Object.fromEntries(labs.find(x=>x.id===id).controls.map(x=>[x.key,x.value]));
const run=(id,p={})=>labs.find(x=>x.id===id).compute({...defaults(id),...p});
const get=(r,label)=>{const m=r.metrics.find(m=>m.label===label);assert.ok(m,label);return m.value;};
const close=(x,y,tol=.015)=>assert.ok(Math.abs(x-y)<=Math.max(.005,Math.abs(y)*tol),`${x} ≠ ${y}`);
const extrema=(r,title,index=0)=>{const ys=r.charts.find(c=>c.title===title).series[index].points.map(p=>p.y);return Math.max(...ys)-Math.min(...ys);};
let checks=0;
function test(name,f){f();checks++;process.stdout.write('✓ '+name+'\n');}
test('All descriptors and default calculations are finite and self-contained',()=>{
 assert.deepEqual(labs.map(x=>x.id),[1,2,3,6]);
 for(const lab of labs){const r=run(lab.id);for(const m of r.metrics)assert.ok(Number.isFinite(m.value),`${lab.id} ${m.label}`);for(const c of r.charts)for(const s of c.series){assert.ok(s.points.length<=2500);assert.ok(s.points.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)));}}
});
test('Half-wave diode R agrees with the analytical DC and RMS integrals',()=>{
 const r=run(1,{topology:'half',load:'R'}),vp=Math.SQRT2*230;
 close(get(r,'U gemiddeld (DC)'),vp/Math.PI,.001);close(get(r,'U true RMS (AC+DC)'),vp/2,.001);
 close(get(r,'I belasting true RMS'),vp/(2*200),.001);close(get(r,'Netvermogen actief'),230**2/(2*200),.001);
 close(get(r,'Power factor net'),Math.SQRT1_2,.001);
});
test('Full-wave diode R doubles the DC value and retains the source RMS',()=>{
 const r=run(1,{topology:'full',load:'R'});close(get(r,'U gemiddeld (DC)'),2*Math.SQRT2*230/Math.PI,.001);close(get(r,'U true RMS (AC+DC)'),230,.001);close(get(r,'Power factor net'),1,.001);
 close(get(r,'U AC-component RMS')**2,get(r,'U true RMS (AC+DC)')**2-get(r,'U gemiddeld (DC)')**2,.00001);
});
test('RL half-wave current persists into negative supply voltage',()=>{
 const r=run(1,{load:'RL',inductance:1000,resistance:50});assert.ok(r.charts[0].series[1].points.some(p=>p.y< -10));
});
test('Capacitance reduces voltage ripple and creates charging-current peaks',()=>{
 const small=run(1,{load:'RC',capacitance:25}),large=run(1,{load:'RC',capacitance:200});
 assert.ok(get(large,'Rimpel top-top')<get(small,'Rimpel top-top'));assert.ok(get(large,'Piek netstroom')>get(large,'I belasting gemiddeld')*2);
 assert.ok(get(large,'U gemiddeld (DC)')>get(run(1),'U gemiddeld (DC)'));
});
test('Thyristor R average follows phase-control integral at 60 degrees',()=>{
 const r=run(3,{topology:'half',load:'R',alpha:60}),expected=Math.SQRT2*230*(1+Math.cos(Math.PI/3))/(2*Math.PI);
 close(get(r,'U gemiddeld (DC)'),expected,.005);
 close(get(run(3,{topology:'full',load:'R',alpha:60}),'U gemiddeld (DC)'),2*expected,.005);
});
test('A greater firing angle reduces average output',()=>{
 assert.ok(get(run(3,{alpha:120}),'U gemiddeld (DC)')<get(run(3,{alpha:30}),'U gemiddeld (DC)'));
});
test('Full-controlled RL approaches continuous-current cosine law',()=>{
 const r=run(3,{topology:'full',load:'RL',alpha:30,resistance:10,inductance:2000});
 close(get(r,'U gemiddeld (DC)'),2*Math.SQRT2*230/Math.PI*Math.cos(Math.PI/6),.008);
});
test('Passive RL full bridge does not manufacture net inverter power at alpha 130',()=>{
 const r=run(3,{topology:'full',load:'RL',alpha:130,resistance:50,inductance:1000});assert.ok(get(r,'Netvermogen actief')>=-.1);
});
test('Half-controlled bridge freewheels without negative output voltage',()=>{
 const r=run(3,{topology:'semi',load:'RL',alpha:90,resistance:50,inductance:1000});assert.ok(r.charts[0].series[1].points.every(p=>p.y>=0));assert.ok(r.charts[1].series[0].points.some(p=>p.y>.01));
});
test('Pulse generator timing and control calibration',()=>{
 const r=run(2,{control:5,width:9,frequency:50});close(get(r,'Ontsteekhoek α'),90,.00001);close(get(r,'Vertraging na referentie'),5,.00001);close(get(r,'Pulsbreedte'),.5,.00001);close(get(r,'Afstand opeenvolgende kanalen'),1000/300,.00001);
 const first=r.charts[1].series[0].points.find(p=>p.y>0),next=r.charts[2].series[0].points.find(p=>p.y>0);close(next.x-first.x,1000/300,.01);
});
test('Inhibit clears all six gate outputs and double pulses add activity',()=>{
 const off=run(2,{enabled:'off'});for(const c of off.charts.slice(1,7))assert.ok(c.series[0].points.every(p=>p.y===0));
 const count=r=>r.charts[1].series[0].points.filter(p=>p.y>0).length;assert.ok(count(run(2,{pulse:'double'}))>count(run(2,{pulse:'single'}))*1.8);
});
test('Class A resistor follows duty-average and RMS-square-root laws',()=>{
 for(const duty of [25,50,75]){const r=run(6,{topology:'A',inductance:0,duty});close(get(r,'U gemiddeld'),325*duty/100,.015);close(get(r,'U true RMS'),325*Math.sqrt(duty/100),.015);close(get(r,'I true RMS'),get(r,'U true RMS')/200,.00001);}
});
test('Class E bipolar RMS is independent of duty and sign reverses mean',()=>{
 const a=run(6,{topology:'E',inductance:0,duty:75,direction:'1'}),b=run(6,{topology:'E',inductance:0,duty:75,direction:'-1'});
 close(get(a,'U true RMS'),325,.001);close(get(a,'U gemiddeld'),162.5,.025);close(get(b,'U gemiddeld'),-162.5,.025);
});
test('A larger inductor reduces PWM current ripple',()=>{
 const a=run(6,{inductance:100,duty:50}),b=run(6,{inductance:1000,duty:50});assert.ok(extrema(b,'Belastingsstroom')<extrema(a,'Belastingsstroom'));
});
test('AC block pulse-width amplitude has the correct full-wave RMS',()=>{
 const r=run(6,{topology:'AC',wave:'block',amplitude:.5,inductance:0});close(get(r,'U true RMS'),325*Math.sqrt(.5),.01);close(get(r,'U gemiddeld'),0,.01);
});
test('Three-phase outputs have a floating-star zero sum and U/f scales reference',()=>{
 const r=run(6,{topology:'3P',frequency:25,vf:'yes'});close(get(r,'Effectieve modulatie-index'),.4,.00001);const [a,b,c]=r.charts[0].series;for(let j=0;j<a.points.length;j++)close(a.points[j].y+b.points[j].y+c.points[j].y,0,.00001);
});
test('Stiff RC and high-inductance / high-frequency extreme settings remain finite',()=>{
 const cases=[run(1,{load:'RC',capacitance:1,sourceR:.2,resistance:2000}),run(1,{load:'RC',capacitance:1000,sourceR:50,resistance:10}),
  run(3,{topology:'full',load:'RL',alpha:175,resistance:10,inductance:2000}),
  run(6,{topology:'3P',frequency:5,switchHz:8000,resistance:10,inductance:1400})];
 for(const r of cases){for(const m of r.metrics)assert.ok(Number.isFinite(m.value));for(const c of r.charts)for(const s of c.series)assert.ok(s.points.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)));}
});
process.stdout.write(`${checks} model checks passed.\n`);
