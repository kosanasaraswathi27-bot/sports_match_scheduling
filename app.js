const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const S={d:{},page:'',q:'',f:{},dt:'',pg:1,view:'table',rep:{n:'fixtures'}},PS=8,today=()=>new Date().toISOString().slice(0,10);
const FK={tournament_id:'tournaments',team_id:'teams',home_id:'teams',away_id:'teams',venue_id:'venues'};
const nm=(l,id)=>(S.d[l].find(x=>x.id==id)||{}).name||'—';
const demoNote=()=>CONFIG.MODE=='demo'?' (demo only – not saved to a database)':'';
const toast=(m,t='ok')=>{const e=document.createElement('div');e.className='toast '+t;e.textContent=m;$('#toasts').append(e);setTimeout(()=>e.remove(),3800)};
const dlg=h=>{$('#dlg').innerHTML=h;$('#dlg').showModal()};
$('#dlg').onclick=e=>{if(e.target.closest('[data-x]')||e.target.id=='dlg')$('#dlg').close()};
const opts=f=>FK[f.k]?S.d[FK[f.k]].map(x=>({v:x.id,t:x.name})):f.o.map(x=>({v:x,t:x}));
const POS=['Goalkeeper','Defender','Midfielder','Forward','Batsman','Bowler','All-rounder','Guard'];
const tbl=(h,r)=>r.length?`<table><thead><tr>${h.map(x=>`<th>${x}</th>`).join('')}</tr></thead><tbody>${r.map(x=>`<tr>${x.map(y=>`<td>${y}</td>`).join('')}</tr>`).join('')}</tbody></table>`:'<div class="empty">No data yet.</div>';
const badge=v=>`<span class="badge ${esc(v)}">${esc(v)}</span>`;

const ENT={
tournaments:{t:'Tournament',cols:['name','sport','start_date','end_date','status'],flt:['status'],
 f:[{k:'name',l:'Tournament name',r:1},{k:'sport',l:'Sport',r:1},{k:'start_date',l:'Start date',t:'date',r:1},{k:'end_date',l:'End date',t:'date',r:1},{k:'status',l:'Status',t:'select',o:['Upcoming','Ongoing','Completed'],r:1,d:'Upcoming'}],
 chk:d=>d.end_date<d.start_date?'End date cannot be before the start date.':'',
 x:r=>'<h3>Registered teams</h3>'+tbl(['Team','Registered on'],S.d.registrations.filter(x=>x.tournament_id==r.id).map(x=>[esc(nm('teams',x.team_id)),x.reg_date]))},
teams:{t:'Team',cols:['name','coach','city'],f:[{k:'name',l:'Team name',r:1},{k:'coach',l:'Coach name',r:1},{k:'city',l:'City',r:1}],
 x:r=>'<h3>Players</h3>'+tbl(['#','Player','Position'],S.d.players.filter(p=>p.team_id==r.id).map(p=>[p.jersey,esc(p.name),esc(p.position)]))},
players:{t:'Player',cols:['name','team_id','jersey','position'],flt:['team_id','position'],
 f:[{k:'name',l:'Player name',r:1},{k:'team_id',l:'Team',t:'select',r:1},{k:'jersey',l:'Jersey number',t:'number',min:1,r:1},{k:'position',l:'Position',t:'select',o:POS,r:1}],
 chk:(d,id)=>S.d.players.some(p=>p.id!=id&&p.team_id==d.team_id&&p.jersey==d.jersey)?`Jersey #${d.jersey} is already taken in this team.`:''},
registrations:{t:'Registration',cols:['tournament_id','team_id','reg_date'],flt:['tournament_id'],
 f:[{k:'tournament_id',l:'Tournament',t:'select',r:1},{k:'team_id',l:'Team',t:'select',r:1},{k:'reg_date',l:'Registration date',t:'date',r:1,d:today}],
 chk:(d,id)=>S.d.registrations.some(x=>x.id!=id&&x.tournament_id==d.tournament_id&&x.team_id==d.team_id)?'This team is already registered for the selected tournament.':''},
venues:{t:'Venue',cols:['name','city','capacity'],f:[{k:'name',l:'Venue name',r:1},{k:'city',l:'City',r:1},{k:'capacity',l:'Seating capacity',t:'number',min:1,r:1}]},
matches:{t:'Match',date:1,cal:1,cols:['tournament_id','home_id','away_id','venue_id','datetime','status','score'],flt:['tournament_id','venue_id','status'],
 f:[{k:'tournament_id',l:'Tournament',t:'select',r:1},{k:'home_id',l:'Home team',t:'select',r:1},{k:'away_id',l:'Away team',t:'select',r:1},{k:'venue_id',l:'Venue',t:'select',r:1},
  {k:'datetime',l:'Date & time',t:'datetime-local',r:1},{k:'status',l:'Status',t:'select',o:['Scheduled','Completed','Cancelled'],r:1,d:'Scheduled'},
  {k:'home_score',l:'Home score',t:'number',min:0},{k:'away_score',l:'Away score',t:'number',min:0}],
 chk:d=>{if(d.home_id==d.away_id)return'Home and away teams must be different.';
  const rg=t=>S.d.registrations.some(x=>x.tournament_id==d.tournament_id&&x.team_id==t);
  if(!rg(d.home_id)||!rg(d.away_id))return'Both teams must be registered in the selected tournament.';
  if(d.status=='Completed'&&(d.home_score==null||d.away_score==null||d.home_score===''||d.away_score===''))return'Completed matches need both scores.';return''}}
};
const lbl=(e,k)=>(e.f.find(f=>f.k==k)||{l:'Score'}).l;
function cell(r,k){
 if(k=='score')return r.status=='Completed'?`${r.home_score} – ${r.away_score}`:'—';
 let v=FK[k]?nm(FK[k],r[k]):r[k];
 if(k=='status')return badge(v);if(k=='datetime')v=String(v).replace('T',' ');if(k=='capacity')v=(+v).toLocaleString();
 return esc(v)}
const txt=(r,k)=>cell(r,k).replace(/<[^>]+>/g,'');

// ---------- list pages ----------
function page(key){
 const e=ENT[key];S.q='';S.f={};S.dt='';S.pg=1;S.view='table';
 $('#view').innerHTML=`<div class="bar"><input id="q" placeholder="Search ${e.t.toLowerCase()}s…">${(e.flt||[]).map(k=>{const f=e.f.find(x=>x.k==k);
  return`<select data-f="${k}"><option value="">All ${esc(f.l.toLowerCase())}s</option>${opts(f).map(o=>`<option value="${esc(o.v)}">${esc(o.t)}</option>`).join('')}</select>`}).join('')}
  ${e.date?'<input type="date" id="dt" title="Filter by date">':''}${e.cal?'<button class="btn ghost" id="vw">📅 Calendar view</button>':''}<button class="btn" id="add">＋ Add ${e.t.toLowerCase()}</button></div><div class="card" id="tbl"></div>`;
 $('#q').oninput=x=>{S.q=x.target.value.toLowerCase();S.pg=1;draw(key)};
 document.querySelectorAll('[data-f]').forEach(s=>s.onchange=()=>{S.f[s.dataset.f]=s.value;S.pg=1;draw(key)});
 if(e.date)$('#dt').oninput=x=>{S.dt=x.target.value;S.pg=1;draw(key)};
 if(e.cal)$('#vw').onclick=()=>{S.view=S.view=='cal'?'table':'cal';$('#vw').textContent=S.view=='cal'?'📋 Table view':'📅 Calendar view';draw(key)};
 $('#add').onclick=()=>form(key);
 draw(key)}
function draw(key){
 const e=ENT[key],box=$('#tbl');
 let rows=S.d[key].filter(r=>(!S.q||e.cols.map(k=>txt(r,k)).join(' ').toLowerCase().includes(S.q))&&Object.entries(S.f).every(([k,v])=>!v||r[k]==v)&&(!S.dt||String(r.datetime).startsWith(S.dt)));
 if(key=='matches')rows.sort((a,b)=>a.datetime<b.datetime?-1:1);
 const empty=`<div class="empty">📭 No ${e.t.toLowerCase()} records found.<br>Add one or adjust your filters.</div>`;
 if(S.view=='cal'){const g={};rows.forEach(r=>(g[r.datetime.slice(0,10)]??=[]).push(r));
  box.innerHTML=Object.keys(g).sort().map(d=>`<h3>${new Date(d).toDateString()}</h3>`+g[d].map(r=>`<div class="ag"><b>${r.datetime.slice(11)}</b> &nbsp;${esc(nm('teams',r.home_id))} vs ${esc(nm('teams',r.away_id))} @ ${esc(nm('venues',r.venue_id))} ${cell(r,'status')} ${cell(r,'score')}</div>`).join('')).join('')||empty;return}
 const pages=Math.max(1,Math.ceil(rows.length/PS));S.pg=Math.min(S.pg,pages);
 box.innerHTML=rows.length?`<table><thead><tr>${e.cols.map(k=>`<th>${esc(lbl(e,k))}</th>`).join('')}<th></th></tr></thead><tbody>${rows.slice((S.pg-1)*PS,S.pg*PS).map(r=>
  `<tr>${e.cols.map(k=>`<td>${cell(r,k)}</td>`).join('')}<td class="act" data-id="${r.id}"><button data-a="v" title="View">👁</button><button data-a="e" title="Edit">✏️</button><button data-a="d" title="Delete">🗑</button></td></tr>`).join('')}</tbody></table>
  <div class="pager"><span>${rows.length} record(s)</span><span><button class="btn ghost" data-p="-1" ${S.pg<2?'disabled':''}>‹</button> Page ${S.pg} of ${pages} <button class="btn ghost" data-p="1" ${S.pg>=pages?'disabled':''}>›</button></span></div>`:empty;
 box.onclick=ev=>{const b=ev.target.closest('button');if(!b)return;
  if(b.dataset.p){S.pg+=+b.dataset.p;return draw(key)}
  const id=+b.closest('td').dataset.id;({v:view,e:id=>form(key,id),d:del})[b.dataset.a](key,id)}}
function view(key,id){const e=ENT[key],r=S.d[key].find(x=>x.id==id);
 dlg(`<h2>${e.t} details</h2><dl>${e.f.filter(f=>r[f.k]!=null).map(f=>`<dt>${esc(f.l)}</dt><dd>${cell(r,f.k)}</dd>`).join('')}</dl>${e.x?e.x(r):''}<div class="acts"><button class="btn" data-x>Close</button></div>`)}

// ---------- add / edit form ----------
function form(key,id){
 const e=ENT[key],r=id?S.d[key].find(x=>x.id==id):{};
 const fld=f=>{const v=id?r[f.k]:(typeof f.d=='function'?f.d():f.d);
  return`<label>${esc(f.l)}${f.r?' *':''}${f.t=='select'?`<select name="${f.k}"><option value="">Select…</option>${opts(f).map(o=>`<option value="${esc(o.v)}"${o.v==v?' selected':''}>${esc(o.t)}</option>`).join('')}</select>`
  :`<input name="${f.k}" type="${f.t||'text'}"${f.min!=null?` min="${f.min}" step="1"`:''} value="${esc(v)}">`}</label>`};
 dlg(`<form id="fm" novalidate><h2>${id?'Edit':'Add'} ${e.t.toLowerCase()}</h2><div class="err" id="err" hidden></div>${e.f.map(fld).join('')}
  <div class="acts"><button type="button" class="btn ghost" data-x>Cancel</button><button type="reset" class="btn ghost">Reset</button><button class="btn">Save ${e.t.toLowerCase()}</button></div></form>`);
 const fm=$('#fm'),el=k=>fm.elements[k];
 const sync=()=>{if(key!='matches')return;
  const t=el('tournament_id').value,reg=S.d.registrations.filter(x=>x.tournament_id==t).map(x=>x.team_id);
  ['home_id','away_id'].forEach(k=>{const s=el(k),cur=s.value;
   s.innerHTML=`<option value="">${!t?'Select a tournament first':reg.length?'Select team…':'No registered teams'}</option>`+S.d.teams.filter(x=>reg.includes(x.id)).map(x=>`<option value="${x.id}">${esc(x.name)}</option>`).join('');s.value=cur});
  ['home_score','away_score'].forEach(k=>el(k).closest('label').hidden=el('status').value!='Completed')};
 sync();fm.onchange=sync;fm.onreset=()=>setTimeout(sync);
 fm.onsubmit=async ev=>{ev.preventDefault();
  const d={},errs=[];
  e.f.forEach(f=>{let v=el(f.k).value.trim();if(f.t=='number'||FK[f.k])v=v===''?'':+v;d[f.k]=v});
  if(key=='matches'&&d.status!='Completed'){d.home_score=null;d.away_score=null}
  e.f.forEach(f=>{const v=d[f.k];if(f.r&&v==='')errs.push(f.l+' is required.');else if(f.min!=null&&v!==''&&v!=null&&v<f.min)errs.push(`${f.l} must be at least ${f.min}.`)});
  if(!errs.length){const c=e.chk&&e.chk(d,id);if(c)errs.push(c)}
  const eb=$('#err');if(errs.length){eb.innerHTML=errs.map(esc).join('<br>');eb.hidden=false;return}
  try{id?await API.update(key,id,d):await API.create(key,d);$('#dlg').close();toast(`${e.t} ${id?'updated':'added'}${demoNote()}`);await refresh()}
  catch(x){eb.textContent=x.message;eb.hidden=false;toast(x.message,'bad')}}}
function del(key,id){const e=ENT[key];
 dlg(`<h2>Delete this ${e.t.toLowerCase()}?</h2><p>This cannot be undone.${['tournaments','teams','venues'].includes(key)?' Related players, registrations and matches will be removed too.':''}</p><div class="acts"><button class="btn ghost" data-x>Cancel</button><button class="btn red" id="ok">Delete</button></div>`);
 $('#ok').onclick=async()=>{try{await API.remove(key,id);$('#dlg').close();toast(`${e.t} deleted${demoNote()}`);await refresh()}catch(x){toast(x.message,'bad')}}}

// ---------- dashboard ----------
function dash(){
 const D=S.d,c=s=>D.matches.filter(m=>m.status==s).length,sc=['Scheduled','Completed','Cancelled'],mx=Math.max(1,...sc.map(c));
 const st=[['Tournaments',D.tournaments.length,'🏆'],['Teams',D.teams.length,'🛡️'],['Players',D.players.length,'🏃'],['Matches scheduled',D.matches.length,'📅'],['Completed',c('Completed'),'✅'],['Upcoming',c('Scheduled'),'⏳']];
 const mt=m=>`${esc(nm('teams',m.home_id))} vs ${esc(nm('teams',m.away_id))}`;
 const up=D.matches.filter(m=>m.status=='Scheduled').sort((a,b)=>a.datetime<b.datetime?-1:1).slice(0,5);
 const rs=D.matches.filter(m=>m.status=='Completed').sort((a,b)=>a.datetime<b.datetime?1:-1).slice(0,5);
 $('#view').innerHTML=`<div class="grid">${st.map(([l,v,i])=>`<div class="card stat"><span>${i}</span><div><b>${v}</b><small>${l}</small></div></div>`).join('')}</div>
 <div class="two"><div class="card"><h2>Upcoming matches</h2>${tbl(['Match','Date','Venue'],up.map(m=>[mt(m),m.datetime.replace('T',' '),esc(nm('venues',m.venue_id))]))}</div>
 <div class="card"><h2>Matches by status</h2>${sc.map(s=>`<div class="bar-row"><span>${s}</span><div class="trk"><i class="${s}" style="width:${c(s)/mx*100}%"></i></div><b>${c(s)}</b></div>`).join('')}</div></div>
 <div class="two"><div class="card"><h2>Recent results</h2>${tbl(['Match','Score','Tournament'],rs.map(m=>[mt(m),`<b>${m.home_score} – ${m.away_score}</b>`,esc(nm('tournaments',m.tournament_id))]))}</div>
 <div class="card"><h2>Tournament overview</h2>${tbl(['Tournament','Sport','Status','Teams','Matches'],D.tournaments.map(t=>[esc(t.name),esc(t.sport),badge(t.status),D.registrations.filter(r=>r.tournament_id==t.id).length,D.matches.filter(m=>m.tournament_id==t.id).length]))}</div></div>`}

// ---------- reports ----------
const RN={fixtures:'Match fixtures',results:'Match results',upcoming:'Upcoming matches',participation:'Tournament-wise team participation',teamplayers:'Team-wise players',summary:'Tournament summary'};
function reports(){
 const R=S.rep;R.q='';R.s=null;R.dir=1;let rows=[];
 $('#view').innerHTML=`<div class="bar noprint"><select id="rn">${Object.entries(RN).map(([k,v])=>`<option value="${k}"${k==R.n?' selected':''}>${v}</option>`).join('')}</select><input id="rq" placeholder="Search this report…"><button class="btn ghost" id="csv">⬇ Export CSV</button><button class="btn ghost" id="prt">🖨 Print</button></div><div class="card"><h2 id="rt"></h2><div id="rb"></div></div>`;
 const show=()=>{let r=rows.filter(x=>!R.q||Object.values(x).join(' ').toLowerCase().includes(R.q));
  if(R.s)r=[...r].sort((a,b)=>String(a[R.s]).localeCompare(String(b[R.s]),undefined,{numeric:true})*R.dir);
  R.vis=r;const h=rows[0]?Object.keys(rows[0]):[];
  $('#rb').innerHTML=r.length?`<table><thead><tr>${h.map(k=>`<th class="srt" data-k="${esc(k)}">${esc(k)}${R.s==k?(R.dir>0?' ▲':' ▼'):''}</th>`).join('')}</tr></thead><tbody>${r.map(x=>`<tr>${h.map(k=>`<td>${esc(x[k])}</td>`).join('')}</tr>`).join('')}</tbody></table><div class="pager"><span>${r.length} row(s)</span></div>`:'<div class="empty">📭 No rows for this report.</div>'};
 const run=async()=>{$('#rt').textContent=RN[R.n];$('#rb').innerHTML='<div class="empty">Loading…</div>';
  try{rows=['fixtures','results','participation'].includes(R.n)?await API.report(R.n):buildReport(R.n,S.d);show()}catch(x){$('#rb').innerHTML=`<div class="empty">⚠️ ${esc(x.message)}</div>`}};
 $('#rn').onchange=x=>{R.n=x.target.value;R.s=null;run()};
 $('#rq').oninput=x=>{R.q=x.target.value.toLowerCase();show()};
 $('#rb').onclick=x=>{const k=x.target.dataset.k;if(!k)return;R.dir=R.s==k?-R.dir:1;R.s=k;show()};
 $('#prt').onclick=()=>print();
 $('#csv').onclick=()=>{if(!R.vis?.length)return toast('Nothing to export.','bad');
  const h=Object.keys(R.vis[0]),q=v=>'"'+String(v).replace(/"/g,'""')+'"';
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([[h,...R.vis.map(x=>h.map(k=>x[k]))].map(r=>r.map(q).join(',')).join('\n')],{type:'text/csv'}));a.download=R.n+'.csv';a.click()};
 run()}

// ---------- shell ----------
const NAV=[['dashboard','Dashboard','📊'],['tournaments','Tournaments','🏆'],['teams','Teams','🛡️'],['players','Players','🏃'],['registrations','Registrations','📝'],['venues','Venues','🏟️'],['matches','Matches','📅'],['reports','Reports','📑']];
$('#nav').innerHTML=NAV.map(([k,l,i])=>`<a href="#${k}" data-k="${k}"><span>${i}</span>${l}</a>`).join('');
$('#mode').innerHTML=CONFIG.MODE=='demo'?'🧪 Demo mode<br>In-memory data':'🔌 API mode<br>'+esc(CONFIG.BASE_URL);
$('#banner').textContent=CONFIG.MODE=='demo'?'Demo mode: sample data only. Changes live in browser memory and reset on refresh – nothing is saved to a database.':'';
$('#burger').onclick=()=>document.body.classList.toggle('open');
const KEYS=['tournaments','teams','players','venues','registrations','matches'];
async function load(){const r=await Promise.all(KEYS.map(k=>API.list(k)));KEYS.forEach((k,i)=>S.d[k]=r[i])}
async function refresh(){await load();S.page in ENT?draw(S.page):dash()}
async function go(p){
 if(!NAV.some(n=>n[0]==p))p='dashboard';S.page=p;document.body.classList.remove('open');
 document.querySelectorAll('nav a').forEach(a=>a.classList.toggle('on',a.dataset.k==p));
 $('#title').textContent=NAV.find(n=>n[0]==p)[1];$('#view').innerHTML='<div class="empty">Loading…</div>';
 try{await load()}catch(x){$('#view').innerHTML=`<div class="card empty">⚠️ ${esc(x.message)}<br><br><button class="btn" onclick="go(S.page)">Retry</button></div>`;return}
 p=='dashboard'?dash():p=='reports'?reports():page(p)}
onhashchange=()=>go(location.hash.slice(1));go(location.hash.slice(1));
