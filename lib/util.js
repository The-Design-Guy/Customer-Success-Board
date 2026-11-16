export const json=(d,s=200)=>new Response(JSON.stringify(d),{status:s,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});
export const env=k=>(process.env[k]||'').trim();
export const domainOf=u=>{if(!u)return'';try{return new URL(/^https?:/i.test(u)?u:'https://'+u).hostname.replace(/^www\./,'').toLowerCase()}catch{return''}};
export const sameSite=(a,b)=>{const x=domainOf(a),y=domainOf(b);return!!x&&!!y&&(x===y||x.endsWith('.'+y)||y.endsWith('.'+x));};
export const norm=s=>String(s||'').toLowerCase().replace(/["'״׳`\s\-–.,()|]/g,'').replace(/(בעמ|ltd|inc)$/,'');
export const nameSim=(a,b)=>{const x=norm(a),y=norm(b);return!!x&&!!y&&(x.includes(y)||y.includes(x));};
export const iso=v=>{if(v==null||v==='')return'';const d=typeof v==='number'?new Date(v<1e12?v*1000:v):new Date(v);return isNaN(d)?'':d.toISOString().slice(0,10);};
export async function withTimeout(p,ms,label){let t;const to=new Promise((_,rej)=>t=setTimeout(()=>rej(new Error(label+': timeout')),ms));try{return await Promise.race([p,to])}finally{clearTimeout(t)}}
