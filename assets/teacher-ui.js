(function(root){'use strict';
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const number=v=>typeof v==='number'&&Number.isFinite(v)?new Intl.NumberFormat('nl-BE',{maximumFractionDigits:Math.abs(v)<1?4:2}).format(v):String(v??'Niet berekend');
let sequence=0;
function mount(host){
 if(!host)throw Error('Geen verklaringsvenster beschikbaar.');
 let context=null,result=null,summary='',technical=false,why=false;
 const id='teacher-'+(++sequence);host.classList.add('drive-teacher');
 function paragraphs(values){return (Array.isArray(values)?values:[values]).filter(Boolean).map(s=>'<p>'+escape(s)+'</p>').join('');}
 function render(){
  const data=result||{changes:[],rows:[],simple:['Verander een instelling om de berekende gevolgen en de verklaring te vergelijken.'],technical:[],observation:[],warnings:[],graphNotes:[],report:''};
  const rows=data.rows||[];
  host.innerHTML=`<div class="teacher-head"><div><span class="teacher-eyebrow">INTERACTIEVE LABOBEGELEIDER</span><h2>Wat gebeurt er als ik dit verander?</h2></div><div class="teacher-level" role="group" aria-label="Niveau van uitleg"><button type="button" data-teach="simple" aria-pressed="${!technical}">Eenvoudige uitleg</button><button type="button" data-teach="technical" aria-pressed="${technical}">Technische uitleg</button></div></div><div class="teacher-changes">${(data.changes||[]).length?data.changes.map(c=>`<span><b>${escape(c.label)}</b>: ${escape(number(c.before))} → ${escape(number(c.after))}${c.unit?' '+escape(c.unit):''}</span>`).join(''):'<span>Huidige berekende toestand</span>'}</div><div class="teacher-simple">${paragraphs(data.simple)}${context?.meta?.kind==='dynamic-forecast'?paragraphs(context.meta.summary):''}</div>${rows.length?`<div class="teacher-table-wrap"><table class="teacher-table"><caption>Vergelijking uit het rekenmodel${context?.meta?.kind==='dynamic-forecast'?' · twee berekende vergelijkingsproeven':''}</caption><thead><tr><th>Grootheid</th><th>Voor wijziging</th><th>Na wijziging</th></tr></thead><tbody>${rows.map(r=>`<tr><th>${escape(r.label)}${r.unit?' ('+escape(r.unit)+')':''}</th><td>${escape(number(r.before))}</td><td>${escape(number(r.after))}</td></tr>`).join('')}</tbody></table></div>`:''}<details class="teacher-technical" ${technical||why?'open':''}><summary>Waarom gebeurt dit?</summary><div>${paragraphs(data.technical)}</div></details>${data.graphNotes?.length?`<div class="teacher-graph-notes"><h3>Wat verandert in de grafieken?</h3>${paragraphs(data.graphNotes)}</div>`:''}${data.observation?.length?`<div class="teacher-observation"><h3>Wat verwacht je in het echte labo?</h3>${paragraphs(data.observation)}</div>`:''}${data.warnings?.length?`<div class="teacher-warnings"><h3>Grenzen van deze situatie</h3>${paragraphs(data.warnings)}</div>`:''}<div class="teacher-summary"${summary?'':' hidden'}><h3>Bespreking van de uitgevoerde simulatie</h3>${paragraphs(summary)}</div><div class="teacher-copy"><button type="button" data-teach="copy">Kopieer verklaring voor mijn laboverslag</button><span class="teacher-copy-status" role="status"></span></div><details class="teacher-report"><summary>Tekst voor mijn verslag bekijken</summary><textarea id="${id}-report" readonly aria-label="Verklaring op basis van gesimuleerde resultaten">${escape(reportText())}</textarea></details>`;
  host.querySelector('[data-teach=simple]').onclick=()=>{technical=false;why=false;render();};
  host.querySelector('[data-teach=technical]').onclick=()=>{technical=true;render();};
  host.querySelector('.teacher-technical').ontoggle=e=>{why=e.target.open;};
  host.querySelector('[data-teach=copy]').onclick=async()=>{
   const text=reportText(),status=host.querySelector('.teacher-copy-status');
   try{if(!navigator.clipboard?.writeText)throw Error('Geen klembord');await navigator.clipboard.writeText(text);status.textContent='Verklaring gekopieerd.';}
   catch{const box=host.querySelector('textarea');box.closest('details').open=true;box.focus();box.select();let copied=false;try{copied=document.execCommand('copy');}catch{}status.textContent=copied?'Verklaring gekopieerd.':'De tekst is geselecteerd. Gebruik Ctrl+C.';}
  };
 }
 function reportText(){let text=result?.report||'Deze verklaring betreft gesimuleerde resultaten; er zijn geen echte meetwaarden gebruikt.';if(!/gesimuleerd/i.test(text))text='Gesimuleerde resultaten, geen echte metingen.\n\n'+text;return text+(summary?'\n\nBespreking van de uitgevoerde simulatie:\n'+summary:'');}
 render();
 return {update(ctx){context=ctx;summary='';result=root.DriveTeacher.explain(ctx);render();return result;},report(text){summary=String(text||'');render();},getReport:reportText};
}
root.DriveTeacherUI={mount};
})(window);
