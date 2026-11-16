import {env} from '../lib/util.js';
export async function GET(req){
  const url=new URL(req.url).searchParams.get('url')||'';const k=env('PAGESPEED_API_KEY');
  const api=`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile&category=performance&category=seo&category=best-practices&locale=he${k?'&key='+k:''}`;
  const r=await fetch(api);return new Response(await r.text(),{status:r.status,headers:{'content-type':'application/json'}});
}
