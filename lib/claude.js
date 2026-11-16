import {env} from './util.js';
export async function claudeRaw(body){
  const k=env('ANTHROPIC_API_KEY');if(!k)throw new Error('חסר ANTHROPIC_API_KEY ב-Vercel');
  const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'content-type':'application/json','x-api-key':k,'anthropic-version':'2023-06-01'},body:JSON.stringify({model:env('CLAUDE_MODEL')||'claude-sonnet-4-5',max_tokens:1500,...body})});
  const d=await r.json();if(d.error)throw new Error('Claude: '+d.error.message);
  return (d.content||[]).map(c=>c.text||'').join('');
}
export async function claudeJSON(system,user,max=1500){
  const out=await claudeRaw({system,max_tokens:max,messages:[{role:'user',content:user}]});
  return JSON.parse(out.slice(out.indexOf('{'),out.lastIndexOf('}')+1));
}
