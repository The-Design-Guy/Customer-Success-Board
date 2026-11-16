// הגנת סיסמה על כל האתר (APP_PASSWORD). שם משתמש: כל ערך.
export const config={matcher:'/((?!_vercel).*)'};
export default function middleware(req){
  const pw=process.env.APP_PASSWORD;if(!pw)return;
  const h=req.headers.get('authorization')||'';
  if(h.startsWith('Basic ')){try{const raw=new TextDecoder().decode(Uint8Array.from(atob(h.slice(6)),c=>c.charCodeAt(0)));if(raw.slice(raw.indexOf(':')+1)===pw)return;}catch(e){}}
  return new Response('Password required',{status:401,headers:{'WWW-Authenticate':'Basic realm="Customer Success Board", charset="UTF-8"'}});
}
