(function(){'use strict';
const palette=['#60d6ff','#ffbc69','#b69bff','#68e2ac','#ff849e'];
class LabChart{
 constructor(host,{title='',xLabel='Tijd (s)',yLabel='',quadrants=false,onSelect=null}={}){
  this.host=host;this.title=title;this.xLabel=xLabel;this.yLabel=yLabel;this.quadrants=quadrants;this.onSelect=onSelect;this.series=[];this.view=null;this.selection=[];
  host.classList.add('chart');host.innerHTML=`<div class="chart-head"><h3></h3><div><button data-chart="reset" title="Zoom herstellen">↺</button><button data-chart="png" title="Grafiek downloaden als PNG">PNG ↓</button></div></div><div class="chart-legend"></div><div class="canvas-wrap"><canvas tabindex="0" aria-label="Interactieve grafiek"></canvas><div class="chart-tooltip" hidden></div></div><small class="chart-help">Scroll: zoom · slepen: verschuiven · dubbelklik: herstellen${onSelect?' · klik: interval kiezen':''}</small>`;
  host.querySelector('h3').textContent=title;this.canvas=host.querySelector('canvas');this.ctx=this.canvas.getContext('2d');this.tip=host.querySelector('.chart-tooltip');
  host.querySelector('[data-chart=reset]').onclick=()=>{this.view=null;this.draw();};host.querySelector('[data-chart=png]').onclick=()=>this.export();
  this.canvas.addEventListener('wheel',e=>{e.preventDefault();const p=this.position(e),b=this.bounds(),k=e.deltaY>0?1.18:.84;const x=this.invX(p.x,b),y=this.invY(p.y,b);this.view={xmin:x+(b.xmin-x)*k,xmax:x+(b.xmax-x)*k,ymin:y+(b.ymin-y)*k,ymax:y+(b.ymax-y)*k};this.draw();},{passive:false});
  this.canvas.addEventListener('pointerdown',e=>{this.drag={...this.position(e),bounds:{...this.bounds()},moved:false};this.canvas.setPointerCapture(e.pointerId);});
  this.canvas.addEventListener('pointermove',e=>{
   const p=this.position(e);
   if(this.drag&&(e.buttons&1)){const d=this.drag,b=d.bounds,dx=(p.x-d.x)/(this.width-80)*(b.xmax-b.xmin),dy=(p.y-d.y)/(this.height-75)*(b.ymax-b.ymin);if(Math.hypot(p.x-d.x,p.y-d.y)>4)d.moved=true;if(d.moved){this.view={xmin:b.xmin-dx,xmax:b.xmax-dx,ymin:b.ymin+dy,ymax:b.ymax+dy};this.draw();}return;}
   this.hover(p);
  });
  this.canvas.addEventListener('pointerup',e=>{if(this.drag&&!this.drag.moved&&this.onSelect){const t=this.invX(this.position(e).x,this.bounds());this.selection.push(t);if(this.selection.length>2)this.selection=[t];this.onSelect([...this.selection]);this.draw();}this.drag=null;});
  this.canvas.addEventListener('pointerleave',()=>{this.tip.hidden=true;});this.canvas.ondblclick=()=>{this.view=null;this.draw();};
  this.observer=new ResizeObserver(()=>this.draw());this.observer.observe(host);
 }
 setData(series,{reset=false}={}){const hidden=new Map(this.series.map(s=>[s.name,!!s.hidden]));for(const s of series)if(s.hidden===undefined&&hidden.has(s.name))s.hidden=hidden.get(s.name);this.series=series;if(reset)this.view=null;this.legend();this.draw();}
 legend(){const h=this.host.querySelector('.chart-legend');h.replaceChildren();this.series.forEach((s,i)=>{const b=document.createElement('button');b.className='legend-item'+(s.hidden?' muted':'');b.innerHTML=`<i style="background:${s.color||palette[i%5]}"></i>`;b.append(document.createTextNode(s.name||`Reeks ${i+1}`));b.onclick=()=>{s.hidden=!s.hidden;this.legend();this.draw();};h.append(b);});}
 position(e){const r=this.canvas.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top};}
 bounds(){
  if(this.view)return this.view;let xmin=Infinity,xmax=-Infinity,ymin=Infinity,ymax=-Infinity;
  for(const s of this.series)if(!s.hidden)for(const p of s.points){if(!Number.isFinite(p.x)||!Number.isFinite(p.y))continue;xmin=Math.min(xmin,p.x);xmax=Math.max(xmax,p.x);ymin=Math.min(ymin,p.y);ymax=Math.max(ymax,p.y);}
  if(!Number.isFinite(xmin))return {xmin:this.quadrants?-15:0,xmax:this.quadrants?15:10,ymin:this.quadrants?-1600:0,ymax:this.quadrants?1600:10};
  if(this.quadrants){const x=Math.max(5,Math.abs(xmin),Math.abs(xmax))*1.15,y=Math.max(1000,Math.abs(ymin),Math.abs(ymax))*1.12;return {xmin:-x,xmax:x,ymin:-y,ymax:y};}
  const dx=Math.max(xmax-xmin,.5),dy=Math.max(ymax-ymin,Math.abs(ymax)*.1,.2);
  return {xmin:Math.min(0,xmin),xmax:xmax+dx*.04,ymin:Math.min(0,ymin)-dy*.08,ymax:ymax+dy*.12};
 }
 px(x,b){return 62+(x-b.xmin)/(b.xmax-b.xmin)*(this.width-83);}
 py(y,b){return this.height-48-(y-b.ymin)/(b.ymax-b.ymin)*(this.height-75);}
 invX(x,b){return b.xmin+(x-62)/(this.width-83)*(b.xmax-b.xmin);}
 invY(y,b){return b.ymin+(this.height-48-y)/(this.height-75)*(b.ymax-b.ymin);}
 num(n){return new Intl.NumberFormat('nl-BE',{maximumFractionDigits:Math.abs(n)<10?2:0}).format(n);}
 draw(){
  const rect=this.canvas.parentElement.getBoundingClientRect();if(rect.width<10)return;
  this.width=rect.width;this.height=rect.height||270;const dpr=window.devicePixelRatio||1;
  this.canvas.width=Math.round(this.width*dpr);this.canvas.height=Math.round(this.height*dpr);const c=this.ctx;c.setTransform(dpr,0,0,dpr,0,0);
  const b=this.bounds();c.fillStyle='#101d2e';c.fillRect(0,0,this.width,this.height);c.font='11px Segoe UI, Arial';c.lineWidth=1;
  for(let i=0;i<=5;i++){const x=b.xmin+(b.xmax-b.xmin)*i/5,y=b.ymin+(b.ymax-b.ymin)*i/5,xx=this.px(x,b),yy=this.py(y,b);c.strokeStyle='#243247';c.beginPath();c.moveTo(xx,27);c.lineTo(xx,this.height-48);c.moveTo(62,yy);c.lineTo(this.width-21,yy);c.stroke();c.fillStyle='#a5b6cc';c.textAlign='center';c.fillText(this.num(x),xx,this.height-29);c.textAlign='right';c.fillText(this.num(y),54,yy+4);}
  c.fillStyle='#b8c9de';c.textAlign='center';c.fillText(this.xLabel,this.width/2,this.height-8);c.save();c.translate(13,this.height/2);c.rotate(-Math.PI/2);c.fillText(this.yLabel,0,0);c.restore();
  c.save();c.beginPath();c.rect(62,27,this.width-83,this.height-75);c.clip();
  if(this.quadrants){c.strokeStyle='#7d91ab';c.beginPath();c.moveTo(this.px(0,b),27);c.lineTo(this.px(0,b),this.height-48);c.moveTo(62,this.py(0,b));c.lineTo(this.width-21,this.py(0,b));c.stroke();c.font='bold 20px Segoe UI';c.fillStyle='#6c829a66';for(const [txt,x,y] of [['II',.27,.25],['I',.77,.25],['III',.27,.78],['IV',.77,.78]])c.fillText(txt,this.width*x,this.height*y);}
  if(this.selection.length){const x1=this.px(this.selection[0],b),x2=this.px(this.selection[1]??this.selection[0],b);c.fillStyle='#60d6ff20';c.fillRect(Math.min(x1,x2),27,Math.max(2,Math.abs(x2-x1)),this.height-75);c.strokeStyle='#60d6ff';for(const x of [x1,x2]){c.beginPath();c.moveTo(x,27);c.lineTo(x,this.height-48);c.stroke();}}
  this.series.forEach((s,i)=>{if(s.hidden||!s.points.length)return;c.strokeStyle=s.color||palette[i%5];c.fillStyle=c.strokeStyle;c.lineWidth=2;c.setLineDash(s.dashed?[6,5]:[]);c.beginPath();const stride=Math.max(1,Math.floor(s.points.length/2000));for(let j=0;j<s.points.length;j+=stride){const p=s.points[j],x=this.px(p.x,b),y=this.py(p.y,b);if(j===0)c.moveTo(x,y);else c.lineTo(x,y);}const last=s.points.at(-1);c.lineTo(this.px(last.x,b),this.py(last.y,b));c.stroke();c.setLineDash([]);c.beginPath();c.arc(this.px(last.x,b),this.py(last.y,b),s.markerSize||(this.quadrants?5:3),0,Math.PI*2);c.fill();});
  c.restore();
  if(!this.series.some(s=>s.points.length)){c.fillStyle='#8aa0bb';c.textAlign='center';c.fillText('Start een experiment om meetgegevens te berekenen',this.width/2,this.height/2);}
 }
 hover(pos){const b=this.bounds();let best=null,dist=Infinity;this.series.forEach((s,i)=>{if(s.hidden)return;for(const p of s.points){const d=Math.hypot(this.px(p.x,b)-pos.x,this.py(p.y,b)-pos.y);if(d<dist){dist=d;best={p,s,i};}}});if(!best||dist>45){this.tip.hidden=true;return;}this.tip.textContent=`${best.s.name}: ${this.num(best.p.x)} ${this.xLabel.match(/\((.*?)\)/)?.[1]||''} · ${this.num(best.p.y)} ${this.yLabel.match(/\((.*?)\)/)?.[1]||''}${best.p.t!=null?' · t = '+this.num(best.p.t)+' s':''}`;const note=best.p.note||(typeof best.s.hoverNote==='function'?best.s.hoverNote(best.p):best.s.note);if(note)this.tip.textContent+=' — '+note;this.tip.style.left=Math.max(5,Math.min(pos.x+10,this.width-250))+'px';this.tip.style.top=Math.max(0,pos.y-35)+'px';this.tip.hidden=false;}
 export(){
  const out=document.createElement('canvas'),d=window.devicePixelRatio||1,labels=[];let x=20,y=49;
  const probe=out.getContext('2d');probe.font='12px Segoe UI';
  this.series.forEach((s,i)=>{const width=Math.min(this.width-35,probe.measureText(s.name).width+35);if(x+width>this.width-10&&x>20){x=20;y+=20;}labels.push({x,y,s,i});x+=width;});
  const header=y+18;out.width=this.canvas.width;out.height=this.canvas.height+header*d;const c=out.getContext('2d');c.fillStyle='#101d2e';c.fillRect(0,0,out.width,out.height);c.scale(d,d);c.fillStyle='#e8f2ff';c.font='bold 15px Segoe UI';c.fillText(this.title,20,25,this.width-35);c.font='12px Segoe UI';
  for(const {x,y,s,i} of labels){c.fillStyle=s.color||palette[i%5];c.fillRect(x,y-5,14,3);c.fillText(s.name,x+20,y,this.width-x-25);}
  c.setTransform(1,0,0,1,0,0);c.drawImage(this.canvas,0,header*d);out.toBlob(blob=>{if(blob)window.LabDownload(blob,this.title.replace(/[^a-z0-9]/gi,'_')+'.png');},'image/png');
 }
 destroy(){this.observer.disconnect();this.host.replaceChildren();}
}
window.LabChart=LabChart;window.LabPalette=palette;
window.LabDownload=(blob,name)=>{const a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);};
})();
