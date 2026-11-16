import {json,domainOf,sameSite,nameSim,iso,env,withTimeout} from '../lib/util.js';
import {serp,googlePage,rankFor} from '../lib/serp.js';
import {apify} from '../lib/apify.js';
import {claudeJSON} from '../lib/claude.js';

const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36';
async function fetchSite(site){
  for(const pre of ['https://','http://']){
    try{const u=/^https?:/i.test(site)?site:pre+site.replace(/^\/+/,'');const r=await withTimeout(fetch(u,{headers:{'user-agent':UA,'accept-language':'he,en'},redirect:'follow'}),15000,'site');if(r.ok)return{html:await r.text(),url:r.url};}catch(e){}
    if(/^https?:/i.test(site))break;
  }
  return{html:'',url:''};
}
const tag=(h,re)=>{const m=h.match(re);return m?m[1].replace(/\s+/g,' ').trim():'';};
function socialsFrom(html){
  const S={};const links=[...html.matchAll(/href=["']([^"']+)["']/gi)].map(m=>m[1].replace(/&amp;/g,'&'));
  const pick=(k,re,bad)=>{const l=links.find(x=>re.test(x)&&!(bad&&bad.test(x)));if(l&&!S[k])S[k]=l.split('?')[0].replace(/\/$/,'');};
  pick('fb',/facebook\.com\/(?!sharer|share|dialog|plugins|tr\b)[^\/]+/i);
  pick('ig',/instagram\.com\/(?!p\/|reel\/|explore)[^\/]+/i);
  pick('tt',/tiktok\.com\/@[^\/]+/i);
  pick('yt',/youtube\.com\/(channel|c|user|@)[^"']*/i);
  pick('li',/linkedin\.com\/(company|in)\/[^\/]+/i,/shareArticle/i);
  return S;
}
const handleOf=u=>{try{return new URL(/^https?:/.test(u)?u:'https://'+u).pathname.split('/').filter(Boolean)[0].replace(/^@/,'')}catch{return''}};
const postsOut=(items,map)=>{const ok=items.filter(x=>!x.error&&!x.errorDescription);const P=ok.map(map).filter(p=>p.date).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5);return{posts:P,last:P[0]?P[0].date:'',note:ok.length?'':(items[0]&&(items[0].error||items[0].errorDescription))||'לא נמצאו פוסטים'};};

const checks={
  async discover(c){
    const {html,url}=c.site?await fetchSite(c.site):{html:'',url:''};
    const title=tag(html,/<title[^>]*>([^<]*)<\/title>/i),og=tag(html,/property=["']og:site_name["'][^>]*content=["']([^"']+)/i),desc=tag(html,/name=["']description["'][^>]*content=["']([^"']+)/i);
    const text=html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#\d+;/g,' ').replace(/\s+/g,' ').slice(0,5000);
    const socials=socialsFrom(html);
    const ai=await claudeJSON(`You analyze an Israeli business for local-SEO research. Return ONLY JSON: {"brand":"the business name exactly as it appears on its own website (keep Hebrew/English as on the site)","industry":"short Hebrew industry label","city":"main city in Hebrew or null","terms":["15 Hebrew Google queries that potential Israeli customers most commonly type to find this TYPE of business or service — generic, WITHOUT the brand name, ordered from most to least searched"]}`,
      `CRM name: ${c.name}\nCRM industry: ${c.industry||'-'}\nSite: ${url||c.site||'-'}\nTitle: ${title}\nog:site_name: ${og}\nDescription: ${desc}\nPage text: ${text||'(site not reachable)'}`);
    let terms=(ai.terms||[]).filter(Boolean).map(kw=>({kw,volume:null}));let volumeSource='הערכת AI';
    if(env('DATAFORSEO_LOGIN')&&terms.length){try{
      const r=await fetch('https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live',{method:'POST',headers:{'content-type':'application/json',authorization:'Basic '+Buffer.from(env('DATAFORSEO_LOGIN')+':'+env('DATAFORSEO_PASSWORD')).toString('base64')},body:JSON.stringify([{keywords:terms.map(t=>t.kw),location_code:2376,language_code:'he'}])});
      const d=await r.json();const res=(d.tasks&&d.tasks[0]&&d.tasks[0].result)||[];const V=Object.fromEntries(res.map(x=>[x.keyword,x.search_volume]));
      terms=terms.map(t=>({...t,volume:V[t.kw]??null}));if(res.length){terms.sort((a,b)=>(b.volume||0)-(a.volume||0));volumeSource='Google Ads (DataForSEO)';}
    }catch(e){}}
    return{brand:ai.brand||c.name,industry:ai.industry||'',city:ai.city||'',siteUrl:url,reachable:!!html,socials,terms:terms.slice(0,5),volumeSource};
  },
  async fb(c){const u=c.socials&&c.socials.fb;if(!u)return{posts:[],note:'לא נמצא עמוד פייסבוק'};
    const items=await apify('apify~facebook-posts-scraper',{startUrls:[{url:u}],resultsLimit:5});
    return{profile:u,...postsOut(items,x=>({date:iso(x.time||x.timestamp||x.date),text:(x.text||x.message||'').slice(0,160),url:x.url||x.postUrl||x.topLevelUrl||'',likes:x.likes??x.reactionsCount??null}))};},
  async ig(c){const u=c.socials&&c.socials.ig;if(!u)return{posts:[],note:'לא נמצא פרופיל אינסטגרם'};
    const items=await apify('apify~instagram-scraper',{directUrls:[u],resultsType:'posts',resultsLimit:6,addParentData:false});
    return{profile:u,...postsOut(items,x=>({date:iso(x.timestamp),text:(x.caption||'').slice(0,160),url:x.url||'',likes:x.likesCount??null}))};},
  async tt(c){const u=c.socials&&c.socials.tt;if(!u)return{posts:[],note:'לא נמצא פרופיל טיקטוק'};
    const items=await apify('clockworks~tiktok-scraper',{profiles:[handleOf(u)],resultsPerPage:5,shouldDownloadVideos:false,shouldDownloadCovers:false,shouldDownloadSubtitles:false});
    return{profile:u,...postsOut(items,x=>({date:iso(x.createTimeISO||x.createTime),text:(x.text||'').slice(0,160),url:x.webVideoUrl||'',likes:x.diggCount??null}))};},
  async gbp(c){
    const q=[c.brand,c.city].filter(Boolean).join(' ');
    const d=await serp({engine:'google_maps',type:'search',q,hl:'iw',gl:'il',ll:'@31.8,34.9,8z'});
    const cand=[d.place_results,...(d.local_results||[])].filter(Boolean);
    const m=cand.find(x=>sameSite(x.website,c.site))||cand.find(x=>nameSim(x.title,c.brand));
    if(!m)return cand.length?{status:'other',query:q,shown:cand.slice(0,3).map(x=>({title:x.title,rating:x.rating??null,reviews:x.reviews??null}))}:{status:'notfound',query:q};
    let latest=[];if(m.data_id){try{const r=await serp({engine:'google_maps_reviews',data_id:m.data_id,sort_by:'newestFirst',hl:'iw'});latest=(r.reviews||[]).slice(0,5).map(x=>({date:iso(x.iso_date||x.iso_date_of_last_edit),rating:x.rating,text:(x.snippet||'').slice(0,140)}));}catch(e){}}
    return{status:'found',query:q,title:m.title,rating:m.rating??null,reviews:m.reviews??0,address:m.address||'',website:m.website||'',latest,link:m.place_id?'https://www.google.com/maps/place/?q=place_id:'+m.place_id:''};
  },
  async gads(c){
    const dom=domainOf(c.site);const d=await serp({engine:'google_ads_transparency_center',text:dom||c.brand,region:'2376'});
    let cr=d.ad_creatives||[];if(dom)cr=cr.filter(x=>!x.target_domain||sameSite(x.target_domain,dom));
    const now=Date.now()/1000;const act=cr.filter(x=>x.last_shown&&now-x.last_shown<3*86400);
    const last=cr.reduce((a,x)=>Math.max(a,x.last_shown||0),0);
    return{active:act.length,total:cr.length,lastShown:last?iso(last):'',advertisers:[...new Set(cr.map(x=>x.advertiser).filter(Boolean))].slice(0,3),link:`https://adstransparency.google.com/?region=IL${dom?'&domain='+dom:''}`};
  },
  async mads(c){
    const fb=c.socials&&c.socials.fb;const lib=`https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=IL&q=${encodeURIComponent(c.brand)}&search_type=keyword_unordered`;
    if(!fb)return{active:null,note:'אין עמוד פייסבוק לבדיקה, בדקו בחיפוש לפי שם',link:lib};
    const items=await apify('apify~facebook-ads-scraper',{startUrls:[{url:fb}],resultsLimit:20,activeStatus:'active',isDetailsPerAd:false});
    const ads=items.filter(x=>!x.error&&(x.adArchiveID||x.adArchiveId));const act=ads.filter(x=>x.isActive!==false);
    const starts=act.map(x=>iso(x.startDateFormatted||x.startDate)).filter(Boolean).sort();
    return{active:act.length,newest:starts[starts.length-1]||'',link:lib};
  },
  async brand(c){
    const d=await googlePage(c.brand,0);const org=d.organic_results||[];const i=org.findIndex(o=>sameSite(o.link,c.site));
    const kg=d.knowledge_graph||null;
    return{query:c.brand,found:i>=0,position:i>=0?i+1:null,top:org.slice(0,5).map((o,j)=>({position:j+1,title:o.title,link:o.link,own:sameSite(o.link,c.site)})),
      kg:kg?{title:kg.title||'',website:kg.website||'',match:sameSite(kg.website,c.site)||nameSim(kg.title,c.brand)}:null};
  },
  async terms(c){
    const T=(c.terms||[]).slice(0,20);if(!T.length)return{results:[],note:'אין מונחים לבדיקה'};
    const results=await Promise.all(T.map(async t=>{const kw=t.kw||t;try{return{kw,mine:!!t.mine,volume:t.volume??null,...await rankFor(kw,c.site,5)}}catch(e){return{kw,mine:!!t.mine,error:e.message}}}));
    return{results};
  }
};
export async function POST(req){
  try{const b=await req.json();const fn=checks[b.check];if(!fn)return json({error:'בדיקה לא מוכרת'},400);
    const data=await fn(b.client||{});return json(data);
  }catch(e){return json({error:e.message||String(e)},500);}
}
