import {env} from '../../lib/util.js';
const page=(t,b)=>new Response(`<!doctype html><meta charset="utf-8"><body dir="rtl" style="font-family:system-ui;max-width:640px;margin:48px auto;padding:0 20px;line-height:1.6"><h2>${t}</h2>${b}</body>`,{headers:{'content-type':'text/html; charset=utf-8'}});
export async function GET(req){
  const u=new URL(req.url);const code=u.searchParams.get('code');
  if(!code)return page('ההתחברות בוטלה','<p>'+(u.searchParams.get('error')||'')+'</p>');
  const r=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({code,client_id:env('GOOGLE_CLIENT_ID'),client_secret:env('GOOGLE_CLIENT_SECRET'),redirect_uri:u.origin+'/api/google/callback',grant_type:'authorization_code'})});
  const d=await r.json();
  if(!d.refresh_token)return page('לא התקבל refresh token',`<pre dir="ltr">${JSON.stringify(d,null,2)}</pre><p>נסו שוב דרך <a href="/api/google/auth">/api/google/auth</a>.</p>`);
  return page('Google Drive חובר ✓',`<p>העתיקו את הערך הבא ל-Vercel → Settings → Environment Variables בשם <b>GOOGLE_REFRESH_TOKEN</b>, ואז Redeploy:</p><textarea dir="ltr" rows="4" style="width:100%;font-family:monospace" onclick="this.select()">${d.refresh_token}</textarea><p>אל תשתפו את הערך הזה.</p>`);
}
