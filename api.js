// API service layer. The UI only calls API.*; switching CONFIG.MODE swaps demo data for fetch() calls.
function buildReport(n,D){
 const nm=(l,id)=>(D[l].find(x=>x.id==id)||{}).name||'—';
 const row=m=>({Tournament:nm('tournaments',m.tournament_id),Home:nm('teams',m.home_id),Away:nm('teams',m.away_id),Venue:nm('venues',m.venue_id),'Date & Time':m.datetime.replace('T',' '),Status:m.status});
 const by=s=>D.matches.filter(m=>m.status==s);
 const R={
  fixtures:()=>[...D.matches].sort((a,b)=>a.datetime<b.datetime?-1:1).map(row),
  results:()=>by('Completed').map(m=>({...row(m),Score:m.home_score+' - '+m.away_score,Winner:m.home_score>m.away_score?nm('teams',m.home_id):m.home_score<m.away_score?nm('teams',m.away_id):'Draw'})),
  upcoming:()=>by('Scheduled').sort((a,b)=>a.datetime<b.datetime?-1:1).map(row),
  participation:()=>D.registrations.map(r=>({Tournament:nm('tournaments',r.tournament_id),Team:nm('teams',r.team_id),City:(D.teams.find(t=>t.id==r.team_id)||{}).city||'—','Registered on':r.reg_date})),
  teamplayers:()=>D.players.map(p=>({Team:nm('teams',p.team_id),Player:p.name,Jersey:p.jersey,Position:p.position})),
  summary:()=>D.tournaments.map(t=>{const ms=D.matches.filter(m=>m.tournament_id==t.id),c=s=>ms.filter(m=>m.status==s).length;
   return{Tournament:t.name,Sport:t.sport,Status:t.status,Teams:D.registrations.filter(r=>r.tournament_id==t.id).length,Matches:ms.length,Completed:c('Completed'),Scheduled:c('Scheduled'),Cancelled:c('Cancelled')}})};
 return R[n]();
}
// In-memory stand-in for the database. Changes are lost on refresh – nothing is stored permanently.
const Demo={db:JSON.parse(JSON.stringify(MOCK)),
 cascade:{tournaments:[['registrations','tournament_id'],['matches','tournament_id']],
  teams:[['players','team_id'],['registrations','team_id'],['matches','home_id'],['matches','away_id']],venues:[['matches','venue_id']]},
 async handle(path,o){
  await new Promise(r=>setTimeout(r,200));
  const p=path.split('/').filter(Boolean),m=o.method||'GET';
  if(p[0]==='reports')return buildReport(p[1],this.db);
  const t=this.db[p[0]];if(!t)throw new Error('Unknown endpoint '+path);
  if(m==='GET')return JSON.parse(JSON.stringify(t));
  if(m==='POST'){const r={...o.body,id:Math.max(0,...t.map(x=>x.id))+1};t.push(r);return r}
  const i=t.findIndex(x=>x.id==p[1]);if(i<0)throw new Error('Record not found');
  if(m==='PUT'){t[i]={...o.body,id:t[i].id};return t[i]}
  const id=t[i].id;t.splice(i,1);
  (this.cascade[p[0]]||[]).forEach(([tb,col])=>this.db[tb]=this.db[tb].filter(x=>x[col]!=id)); // mimics ON DELETE CASCADE
  return{deleted:id};
 }};
const API={
 async req(path,o={}){
  if(CONFIG.MODE==='demo')return Demo.handle(path,o);
  let r;
  try{r=await fetch(CONFIG.BASE_URL+path,{method:o.method||'GET',headers:{'Content-Type':'application/json'},body:o.body?JSON.stringify(o.body):undefined})}
  catch{throw new Error('Cannot reach the server at '+CONFIG.BASE_URL)}
  const d=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(d.error||d.message||'Server error ('+r.status+')'); // Flask should return {"error":"..."} with 400/409/500
  return d;
 },
 list:e=>API.req('/'+e),
 create:(e,b)=>API.req('/'+e,{method:'POST',body:b}),
 update:(e,id,b)=>API.req('/'+e+'/'+id,{method:'PUT',body:b}),
 remove:(e,id)=>API.req('/'+e+'/'+id,{method:'DELETE'}),
 report:n=>API.req('/reports/'+n)
};
