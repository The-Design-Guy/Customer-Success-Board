import {env,sameSite} from './util.js';
export async function serp(params){
  const k=env('SERPAPI_KEY');if(!k)throw new Error('חסר SERPAPI_KEY ב-Vercel');
  const u=new URL('https://serpapi.com/search.json');
  Object.entries({...params,api_key:k}).forEach(([a,b])=>{if(b!=null&&b!=='')u.searchParams.set(a,String(b))});
  const r=await fetch(u);const d=await r.json().catch(()=>({error:'SerpApi '+r.status}));
  if(d.error&&!/hasn.t returned any results|no results/i.test(d.error))throw new Error('SerpApi: '+d.error);
  return d;
}
const G={engine:'google',google_domain:'google.co.il',gl:'il',hl:'iw',location:'Israel'};
export async function googlePage(q,page){return serp({...G,q,start:page*10});}
// מחזיר עמוד ומיקום כולל של האתר, עד maxPages עמודים
export async function rankFor(q,site,maxPages=5){
  let checked=0;
  for(let p=0;p<maxPages;p++){
    const d=await googlePage(q,p);const org=d.organic_results||[];checked=p+1;
    const i=org.findIndex(o=>sameSite(o.link,site));
    if(i>=0)return{found:true,page:p+1,position:p*10+i+1,url:org[i].link,pagesChecked:checked};
    if(!org.length)break;
  }
  return{found:false,pagesChecked:checked};
}
