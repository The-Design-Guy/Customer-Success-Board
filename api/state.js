import {json} from '../lib/util.js';
import {driveReady,listAll,readJSON,upsert} from '../lib/drive.js';
export async function GET(){
  if(!driveReady())return json({error:'Google Drive לא מחובר'},400);
  try{const files=await listAll();const R={};let board=null;let i=0;
    const work=async()=>{while(i<files.length){const f=files[i++];const cid=f.appProperties&&f.appProperties.cid;if(!cid)continue;try{const d=await readJSON(f.id);if(cid==='_board')board=d.board||null;else if(d&&d.record)R[cid]=d.record;}catch(e){}}};
    await Promise.all(Array.from({length:8},work));
    return json({R,board,count:Object.keys(R).length});
  }catch(e){return json({error:e.message},500);}
}
export async function PUT(req){
  if(!driveReady())return json({error:'Google Drive לא מחובר'},400);
  try{const b=await req.json();const now=new Date().toISOString();
    if(b.board){await upsert('_board','_לוח - רשימות והגדרות.json',{updatedAt:now,board:b.board});return json({ok:true});}
    if(!b.id||!b.record)return json({error:'חסר id/record'},400);
    const safe=String(b.name||b.id).replace(/[\\/:*?"<>|]/g,' ').trim();
    await upsert(b.id,`${safe} (${b.id}).json`,{clientId:b.id,name:b.name||'',updatedAt:now,record:b.record});
    return json({ok:true});
  }catch(e){return json({error:e.message},500);}
}
