(function(root){
'use strict';
const TAU=2*Math.PI, rpm=w=>w*60/TAU, rad=n=>n*TAU/60;
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
const defaults={target:1400,initial:0,J:.1,loadType:'constant',T0:2.5,b:.015,k:.00012,breakaway:6,breakSpeed:8,power:400,powerCap:12,loadScale:1,rampUp:4,rampDown:4,maxTorque:12,tau:.06,kp:.5,ki:1,feedforward:true,nominalSpeed:1400,baseFrequency:50,polePairs:2,nominalVoltage:400,ratedVoltage:400,nominalTorque:10,slipRpm:100,controlMode:'speed',frequencyTarget:50,maxFrequency:100,voltageMode:'vf',magCurrent:1.1,torqueConstant:3,copper:5,iron:35,regen:'resistor',stopMode:'ramp',duration:16};
const loadNames={constant:'Constant koppel',linear:'Lineair toenemend',quadratic:'Kwadratisch toenemend',breakaway:'Losbreekkoppel',power:'Constant vermogen'};
function validate(p){
 const q={...defaults,...p};
 const bounds={target:[-2500,2500],initial:[-2500,2500],J:[.005,2],T0:[0,40],b:[0,.5],k:[0,.01],breakaway:[0,60],breakSpeed:[.1,80],power:[0,5000],powerCap:[.1,60],loadScale:[0,5],rampUp:[.05,60],rampDown:[.05,60],maxTorque:[.1,40],tau:[.002,1],kp:[.01,5],ki:[0,10],nominalSpeed:[100,2400],baseFrequency:[10,100],polePairs:[1,6],nominalVoltage:[24,690],ratedVoltage:[24,690],nominalTorque:[.1,40],slipRpm:[1,400],frequencyTarget:[-200,200],maxFrequency:[1,200],magCurrent:[0,10],torqueConstant:[.1,20],copper:[0,100],iron:[0,300],duration:[1,120]};
 for(const [key,[lo,hi]] of Object.entries(bounds)){if(!Number.isFinite(Number(q[key])))throw Error('Geen geldige waarde voor '+key);q[key]=clamp(Number(q[key]),lo,hi);}
 if(!loadNames[q.loadType])throw Error('Onbekende belastingswet');
 if(!['speed','frequency'].includes(q.controlMode))throw Error('Onbekende regelwijze');
 if(!['vf','fixed'].includes(q.voltageMode))throw Error('Onbekende spanningsregeling');
 q.polePairs=Math.round(q.polePairs);q.feedforward=!!q.feedforward;
 return q;
}
function magnitude(w,p,type=p.loadType,scale=p.loadScale){
 const a=Math.abs(w);let m;
 switch(type){
 case 'constant':m=p.T0;break;
 case 'linear':m=p.T0+p.b*a;break;
 case 'quadratic':m=p.T0+p.k*a*a;break;
 case 'breakaway':m=p.T0+Math.max(0,p.breakaway-p.T0)*Math.exp(-((a/p.breakSpeed)**2))+p.b*a;break;
 case 'power':m=Math.min(p.powerCap,p.power/Math.max(a,.01));break;
 }
 return Math.max(0,m*scale);
}
function signedLoad(w,motor,p){
 if(Math.abs(w)<1e-7)return Math.sign(motor)*Math.min(Math.abs(motor),magnitude(0,p));
 return Math.sign(w)*magnitude(w,p);
}
function quadrant(n,m){
 if(Math.abs(n)<.5||Math.abs(m)<.005)return 'Grens';
 return n>0?(m>0?'I':'II'):(m<0?'III':'IV');
}
// Fundamental-wave flux approximation. ratedVoltage is the motor reference;
// nominalVoltage is the maximum available inverter line voltage, not the DC bus.
// Overflux does not create unlimited torque: magnetic saturation is capped here.
function fluxState(f,p){
 const a=Math.abs(f),ratio=p.nominalVoltage/p.ratedVoltage;
 const idealVoltage=p.voltageMode==='fixed'?(a>1e-8?p.nominalVoltage:0):p.nominalVoltage*Math.min(a/p.baseFrequency,1);
 const rawFlux=p.voltageMode==='fixed'?(a>1e-8?ratio*p.baseFrequency/a:ratio):ratio*Math.min(1,p.baseFrequency/Math.max(a,p.baseFrequency));
 return {idealVoltage,rawFlux,flux:clamp(rawFlux,.005,1),overflux:Math.max(0,rawFlux-1)};
}
function torqueAtFrequency(f,p){
 const phi=fluxState(f,p).flux;
 // Current-limited torque is proportional to flux. The second ceiling is an
 // educational pull-out approximation (twice the reference limit at full flux).
 return p.maxTorque*Math.min(1,phi,2*phi*phi);
}
function availableTorque(w,p,frequencyOverride){
 if(Number.isFinite(frequencyOverride))return torqueAtFrequency(clamp(frequencyOverride,-p.maxFrequency,p.maxFrequency),p);
 const direction=Math.sign(w)||Math.sign(p.controlMode==='frequency'?p.frequencyTarget:p.target)||1;
 if(p.maxTorque<=torqueAtFrequency(speedModeFrequency(w,direction*p.maxTorque,p),p))return p.maxTorque;
 // Static capability at this shaft speed. The highest feasible current-limited
 // torque must itself use a frequency/flux/slip combination inside the ceiling.
 let lo=0,hi=p.maxTorque;
 for(let i=0;i<28;i++){
  const mid=(lo+hi)/2,f=speedModeFrequency(w,direction*mid,p);
  if(mid<=torqueAtFrequency(f,p))lo=mid;else hi=mid;
 }
 return (lo+hi)/2;
}
function loadedSpeedAtFrequency(f,p){
 const ns=Math.abs(f)*60/p.polePairs;if(ns<1e-9)return 0;
 const phi=fluxState(f,p).flux;
 const slip=n=>magnitude(rad(n),p)/p.nominalTorque*p.slipRpm/Math.max(phi*phi,.000025);
 if(slip(0)>=ns)return 0;
 let lo=0,hi=ns;
 for(let i=0;i<48;i++){const mid=(lo+hi)/2;if(mid+slip(mid)>ns)hi=mid;else lo=mid;}
 return Math.sign(f)*(lo+hi)/2;
}
function effectiveTarget(p){
 const cappedFrequency=clamp(p.frequencyTarget,-p.maxFrequency,p.maxFrequency);
 if(p.controlMode==='frequency')return loadedSpeedAtFrequency(cappedFrequency,p);
 const target=p.target,phi=fluxState(p.maxFrequency,p).flux;
 const needed=Math.abs(target)+magnitude(rad(target),p)/p.nominalTorque*p.slipRpm/Math.max(phi*phi,.000025);
 if(needed*p.polePairs/60<=p.maxFrequency)return target;
 return loadedSpeedAtFrequency(Math.sign(target)*p.maxFrequency,p);
}
function speedModeFrequency(w,m,p,unbounded=false){
 const n=rpm(w),reference=m/p.nominalTorque*p.slipRpm;
 const ceiling=unbounded?1e6:p.maxFrequency;
 let f=clamp((n+reference)*p.polePairs/60,-ceiling,ceiling);
 // Linear small-slip torque scales with flux squared. Solve the implicit
 // frequency/flux relation, with the configured inverter frequency ceiling.
 for(let i=0;i<16;i++){
  const phi=fluxState(f,p).flux;
  const next=clamp((n+reference/Math.max(phi*phi,.000025))*p.polePairs/60,-ceiling,ceiling);
  if(Math.abs(next-f)<1e-9)return next;
  f=(f+next)/2;
 }
 return f;
}
function frequencyLimitedCommand(w,command,p,limit){
 const required=speedModeFrequency(w,command,p,true);
 if(Math.abs(required)<=p.maxFrequency+1e-8)return command;
 const f=Math.sign(required)*p.maxFrequency;
 const fieldSlip=f*60/p.polePairs-rpm(w);
 const attainable=clamp(fieldSlip/p.slipRpm*p.nominalTorque*fluxState(f,p).flux**2,-limit,limit);
 // A ceiling below an already rotating shaft can force generator braking even
 // while the old speed ramp still asks for positive torque. Magnetic torque
 // retains its existing finite decay lag; the mechanical state is never reset.
 return required>0?Math.min(command,attainable):Math.max(command,attainable);
}
// Quasistationary fundamental-wave approximation, separate from mechanical integration.
function electrical(w,m,p,enabled=true,frequencyOverride){
 if(!enabled&&Math.abs(m)<.001)return {f:0,ns:0,slip:0,U:0,I:0,PF:0,Pel:0,Pgrid:0,Pbrake:0,loss:0,flux:0,fluxRatio:0,torqueLimit:0};
 const f=clamp(Number.isFinite(frequencyOverride)?frequencyOverride:speedModeFrequency(w,m,p),-p.maxFrequency,p.maxFrequency);
 const ns=f*60/p.polePairs;
 const state=fluxState(f,p),flux=state.flux;
 const iq=m/(p.torqueConstant*Math.max(flux,.005));
 // Resistive voltage boost keeps nonzero torque/losses physically possible near zero frequency.
 const boost=p.copper*Math.abs(iq)/Math.sqrt(3)+.005*p.nominalVoltage*Math.abs(m)/(p.nominalTorque+Math.abs(m));
 const U=Math.min(p.nominalVoltage,state.idealVoltage+boost);
 // Saturation raises magnetising current in fixed-U/low-f examples. This bounded
 // trend is not a calibrated winding-temperature or saturation calculation.
 const saturation=Math.min(state.overflux,4);
 const imag=p.magCurrent*Math.min(Math.abs(f)/3,1)*Math.sqrt(1+16*saturation*saturation);
 const loss=p.copper*iq*iq+p.iron*Math.min(Math.abs(f)/p.baseFrequency,1)**1.5*Math.min(state.rawFlux*state.rawFlux,9);
 const Pm=m*w,Pel=Pm+loss;
 const ir=U>1e-12?Math.abs(Pel)/(Math.sqrt(3)*U):0;
 const I=Math.hypot(Math.max(Math.abs(iq),ir),imag);
 const apparent=Math.sqrt(3)*U*I;
 const PF=apparent>1e-8?clamp(Pel/apparent,-1,1):0;
 // Pel is always signed motor-terminal active power. A diode front end cannot return it to the grid.
 const Pgrid=Pel<0?(p.regen==='grid'?Pel:0):Pel;
 const Pbrake=Pel<0&&p.regen==='resistor'?-Pel:0;
 const slip=Math.abs(ns)>.1?(ns-rpm(w))/ns:0;
 return {f,ns,slip,U,I,PF,Pel,Pgrid,Pbrake,loss,flux,fluxRatio:state.rawFlux,torqueLimit:torqueAtFrequency(f,p)};
}
class Drive{
 constructor(params={}){this.p=validate(params);this.t=0;this.w=rad(this.p.initial);this.ref=this.w;this.motor=0;this.integral=0;this.mode='drive';this.impulse=0;this.sampleClock=0;this.data=[];this.events=[{t:0,action:'Initialisatie',parameters:{...this.p}}];this.angle=0;this.stopped=false;this.addSample(0,0);}
 update(params){const before=this.p;this.p=validate({...before,...params});
 if(this.p.controlMode!==before.controlMode){this.integral=0;if(this.p.controlMode==='frequency')this.ref=this.w+rad(this.motor/this.p.nominalTorque*this.p.slipRpm);else this.ref=this.w;}
 if(this.p.controlMode==='frequency')this.ref=clamp(this.ref,-TAU*this.p.maxFrequency/this.p.polePairs,TAU*this.p.maxFrequency/this.p.polePairs);
 this.events.push({t:this.t,action:'Parameters gewijzigd',parameters:{...this.p}});}
 command(action){
 if(action==='start'){this.mode='drive';this.stopped=false;this.integral=0;}
 if(action==='coast'){this.mode='coast';this.integral=0;}
 if(action==='brake'){this.mode='brake';this.integral=0;}
 this.events.push({t:this.t,action,parameters:{...this.p}});
 }
 step(dt=.002){
 const p=this.p,old=this.w;
 const target=this.mode==='brake'?0:(p.controlMode==='frequency'?TAU*clamp(p.frequencyTarget,-p.maxFrequency,p.maxFrequency)/p.polePairs:rad(effectiveTarget(p)));
 let command=0,limit=p.maxTorque;
 if(this.mode!=='coast'){
  const increasing=(Math.abs(this.ref)<1e-9||Math.sign(target)===Math.sign(this.ref))&&Math.abs(target)>Math.abs(this.ref);
  const rate=rad(p.nominalSpeed)/(increasing?p.rampUp:p.rampDown);
  const dref=clamp(target-this.ref,-rate*dt,rate*dt);
  this.ref+=dref;
  const desiredSign=Math.sign(this.ref)||Math.sign(target)||Math.sign(this.w);
  const compensation=magnitude(this.w,p)*desiredSign;
  const err=this.ref-this.w;
  const frequency=p.controlMode==='frequency'?this.ref*p.polePairs/TAU:speedModeFrequency(this.w,this.motor,p);
  limit=availableTorque(this.w,p,frequency);
  const ff=p.feedforward?(compensation+p.J*dref/dt):0;
  const raw=p.controlMode==='frequency'?(rpm(this.ref-this.w)/p.slipRpm*p.nominalTorque*fluxState(frequency,p).flux**2):(ff+p.kp*err+this.integral);
  command=clamp(raw,-limit,limit);
  if(p.controlMode==='speed')command=frequencyLimitedCommand(this.w,command,p,limit);
  // Conditional integration avoids windup while allowing recovery from saturation.
  if(p.controlMode==='speed'&&(Math.abs(raw-command)<1e-8||Math.sign(err)!==Math.sign(raw-command)))this.integral=clamp(this.integral+p.ki*err*dt,-p.maxTorque,p.maxTorque);
  if(Math.abs(target)<1e-9&&Math.abs(this.ref)<1e-8&&Math.abs(this.w)<.03){command=0;this.integral=0;}
 }else this.ref=this.w;
 const lag=this.mode==='coast'?Math.min(p.tau,.015):p.tau;
 this.motor+=(command-this.motor)*(1-Math.exp(-dt/lag));
 if(this.mode==='coast'&&Math.abs(this.motor)<1e-6)this.motor=0;
 let load=signedLoad(this.w,this.motor,p),net=this.motor-load;
 let next=old+net/p.J*dt;
 // Passive friction/load cannot launch a stopped shaft or reverse a coasting shaft.
 if(old*next<0&&Math.abs(this.motor)<=magnitude(0,p)){
  next=0;net=(next-old)*p.J/dt;load=this.motor-net;
 }
 this.w=next;
 this.alpha=(next-old)/dt;this.load=load;this.net=net;this.limit=limit;
 this.impulse+=net*dt;this.t+=dt;this.angle+=this.w*dt;this.sampleClock+=dt;
 if(this.sampleClock>=.02-1e-9){this.sampleClock-=.02;this.addSample(this.alpha,load);}
 return this;
 }
 addSample(alpha,load){
 const p=this.p,frequency=p.controlMode==='frequency'&&this.mode!=='coast'?this.ref*p.polePairs/TAU:undefined,el=electrical(this.w,this.motor,p,this.mode!=='coast',frequency);
 const s={t:this.t,n:rpm(this.w),ref:rpm(this.ref),target:this.mode==='brake'?0:effectiveTarget(p),M:this.motor,T:load,alpha,J:p.J,Pm:this.motor*this.w,impulse:this.impulse,q:quadrant(rpm(this.w),this.motor),mode:this.mode,...el};
 this.last=s;this.data.push(s);return s;
 }
 advance(seconds){const steps=Math.round(seconds/.002);for(let i=0;i<steps;i++)this.step(.002);return this;}
}
function simulate(params={},seconds=16,action='start'){
 const d=new Drive(params);d.command(action);d.advance(seconds);return d;
}
function estimate(data,t1,t2){
 if(!data.length||!Number.isFinite(t1)||!Number.isFinite(t2)||t2<=t1)throw Error('Kies een eindtijd na de begintijd.');
 const nearest=t=>data.reduce((a,b)=>Math.abs(b.t-t)<Math.abs(a.t-t)?b:a);
 if(t1<data[0].t-1e-6||t2>data.at(-1).t+1e-6)throw Error('Het interval ligt buiten de opname.');
 const a=nearest(t1),b=nearest(t2),dt=b.t-a.t,dn=b.n-a.n,dw=rad(dn);
 if(dt<=0||Math.abs(dw)<.1)throw Error('Kies een interval met voldoende snelheidsverandering (|Δω| ≥ 0,1 rad/s).');
 const window=data.filter(s=>s.t>=a.t&&s.t<=b.t);
 if(window.some(s=>Math.abs(s.J-a.J)>1e-9))throw Error('J veranderde tijdens dit interval. Kies een venster met constante J.');
 const impulse=b.impulse-a.impulse,alpha=dw/dt,meanNet=impulse/dt,J=impulse/dw;
 if(!Number.isFinite(J)||J<=0)throw Error('Dit interval levert geen positieve constante traagheid op.');
 return {t1:a.t,t2:b.t,dt,dn,dw,alpha,meanNet,impulse,J,actual:a.J,error:(J-a.J)/a.J};
}
function metrics(data,target){
 const maxM=Math.max(...data.map(s=>Math.abs(s.M))),maxA=Math.max(...data.map(s=>Math.abs(s.alpha)));
 const tol=Math.max(2,Math.abs(target)*.02);let settled=null;
 for(let i=0;i<data.length;i++)if(Math.abs(data[i].n-target)<=tol&&data.slice(i).every(s=>Math.abs(s.n-target)<=tol)){settled=data[i].t;break;}
 return {maxM,maxA,settled,final:data.at(-1).n};
}
const api={TAU,rpm,rad,clamp,defaults,validate,loadNames,magnitude,signedLoad,quadrant,fluxState,effectiveTarget,availableTorque,electrical,Drive,simulate,estimate,metrics};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
root.LabModel=api;
})(typeof globalThis!=='undefined'?globalThis:this);
