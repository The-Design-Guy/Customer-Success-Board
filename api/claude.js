import {json} from '../lib/util.js';
import {claudeRaw} from '../lib/claude.js';
export async function POST(req){try{const b=await req.json();const text=await claudeRaw({system:b.system,max_tokens:Math.min(+b.max_tokens||1500,4000),messages:b.messages});return json({text});}catch(e){return json({error:e.message},500);}}
