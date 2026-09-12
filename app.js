
const KEY='ash_cairn_pwa_edits_v1';
let soaps=JSON.parse(localStorage.getItem(KEY)||'null')||window.ORIGINAL_SOAPS;
let current=null, active='mp_eo', deferredPrompt=null;
const labels={mp_eo:'Melt & Pour — Essential Oils',mp_fo:'Melt & Pour — Fragrance Oils',cp_eo:'Cold Process — Essential Oils',cp_fo:'Cold Process — Fragrance Oils'};
const $=id=>document.getElementById(id);
const grid=$('grid'),search=$('search'),collection=$('collection'),detail=$('detail'),editor=$('editor');
[...new Set(soaps.map(s=>s.collection))].forEach(c=>{let o=document.createElement('option');o.value=o.textContent=c;collection.appendChild(o)});
function esc(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function render(){
 let q=search.value.toLowerCase().trim(),c=collection.value;
 let rows=soaps.filter(s=>(!c||s.collection===c)&&(!q||[s.name,s.collection,s.scent,...(s.notes||[])].join(' ').toLowerCase().includes(q)));
 $('count').textContent=`${rows.length} soaps`;
 grid.innerHTML=rows.map(s=>`<article class="card" data-id="${s.id}"><img src="${s.image}" alt="${esc(s.name)}"><div class="cardBody"><div class="num">SOAP ${String(s.id).padStart(3,'0')}</div><div class="coll">${esc(s.collection)}</div><h3>${esc(s.name)}</h3><div class="scent">${esc(s.scent)}</div></div></article>`).join('');
 document.querySelectorAll('.card').forEach(x=>x.onclick=()=>openSoap(+x.dataset.id));
}
function openSoap(id){
 current=soaps.find(s=>s.id===id);active='mp_eo';
 $('detailImg').src=current.image;$('detailCollection').textContent=current.collection;$('detailName').textContent=`${current.id}. ${current.name}`;$('detailScent').textContent=current.scent;
 $('notes').innerHTML=(current.notes||[]).map(n=>`<span>${esc(n)}</span>`).join('');
 $('tabs').innerHTML=Object.entries(labels).map(([k,v])=>`<button data-k="${k}" class="${k===active?'active':''}">${v}</button>`).join('');
 document.querySelectorAll('#tabs button').forEach(b=>b.onclick=()=>{active=b.dataset.k;showRecipe();document.querySelectorAll('#tabs button').forEach(x=>x.classList.toggle('active',x===b))});
 showRecipe();detail.classList.remove('hidden');
}
function showRecipe(){ $('recipe').innerHTML=`<h3>${labels[active]}</h3>${(current.recipes[active]||[]).map(x=>`<div class="line">${esc(x)}</div>`).join('')}` }
$('closeBtn').onclick=()=>detail.classList.add('hidden');
$('editorClose').onclick=()=>editor.classList.add('hidden');
$('editBtn').onclick=()=>{$('eName').value=current.name;$('eCollection').value=current.collection;$('eScent').value=current.scent;$('eMpEo').value=current.recipes.mp_eo.join('\n');$('eMpFo').value=current.recipes.mp_fo.join('\n');$('eCpEo').value=current.recipes.cp_eo.join('\n');$('eCpFo').value=current.recipes.cp_fo.join('\n');editor.classList.remove('hidden')};
$('saveBtn').onclick=()=>{
 current.name=$('eName').value.trim();current.collection=$('eCollection').value.trim();current.scent=$('eScent').value.trim();current.notes=current.scent.split(' - ').map(x=>x.trim()).filter(Boolean);
 current.recipes={mp_eo:$('eMpEo').value.split('\n'),mp_fo:$('eMpFo').value.split('\n'),cp_eo:$('eCpEo').value.split('\n'),cp_fo:$('eCpFo').value.split('\n')};
 localStorage.setItem(KEY,JSON.stringify(soaps));editor.classList.add('hidden');openSoap(current.id);render();alert('Saved on this device.');
};
$('resetBtn').onclick=()=>{if(confirm('Reset all edits and restore the original 125 soaps?')){soaps=JSON.parse(JSON.stringify(window.ORIGINAL_SOAPS));localStorage.removeItem(KEY);render()}};
$('exportBtn').onclick=()=>{let blob=new Blob([JSON.stringify(soaps,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='ash-cairn-edits.json';a.click();URL.revokeObjectURL(a.href)};
$('importFile').onchange=e=>{let f=e.target.files[0];if(!f)return;let r=new FileReader();r.onload=()=>{try{soaps=JSON.parse(r.result);localStorage.setItem(KEY,JSON.stringify(soaps));render();alert('Edits imported.')}catch{alert('That file could not be imported.')}};r.readAsText(f)};
search.oninput=render;collection.onchange=render;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;$('installBtn').hidden=false});
$('installBtn').onclick=async()=>{if(deferredPrompt){deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;$('installBtn').hidden=true}else{alert('On iPhone: open this site in Safari, tap Share, then Add to Home Screen.')}};
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js'));
render();
