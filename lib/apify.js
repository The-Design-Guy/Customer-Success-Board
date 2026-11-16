import {env} from './util.js';
export async function apify(actor,input,timeout=240){
  const t=env('APIFY_TOKEN');if(!t)throw new Error('חסר APIFY_TOKEN ב-Vercel');
  const r=await fetch(`https://api.apify.com/v2/acts/${actor}/run-sync-get-dataset-items?token=${t}&timeout=${timeout}&clean=true`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(input)});
  if(!r.ok)throw new Error('Apify '+r.status+': '+(await r.text()).slice(0,180));
  const items=await r.json();return Array.isArray(items)?items:[];
}
