import {env} from './util.js';
const FOLDER_MIME='application/vnd.google-apps.folder';
let cache={tok:null,exp:0,folder:null};
export const driveReady=()=>!!(env('GOOGLE_CLIENT_ID')&&env('GOOGLE_CLIENT_SECRET')&&env('GOOGLE_REFRESH_TOKEN'));
async function token(){
  if(cache.tok&&Date.now()<cache.exp)return cache.tok;
  const r=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:env('GOOGLE_CLIENT_ID'),client_secret:env('GOOGLE_CLIENT_SECRET'),refresh_token:env('GOOGLE_REFRESH_TOKEN'),grant_type:'refresh_token'})});
  const d=await r.json();if(!d.access_token)throw new Error('Google Drive: '+(d.error_description||d.error||'אין הרשאה'));
  cache.tok=d.access_token;cache.exp=Date.now()+(d.expires_in-120)*1000;return cache.tok;
}
async function api(path,opt={}){
  const t=await token();const r=await fetch('https://www.googleapis.com'+path,{...opt,headers:{authorization:'Bearer '+t,...(opt.headers||{})}});
  if(!r.ok)throw new Error('Drive '+r.status+': '+(await r.text()).slice(0,180));
  const ct=r.headers.get('content-type')||'';return ct.includes('json')?r.json():r.text();
}
const q=s=>encodeURIComponent(s);
export async function folderId(){
  if(cache.folder)return cache.folder;
  if(env('DRIVE_FOLDER_ID'))return cache.folder=env('DRIVE_FOLDER_ID');
  const name=env('DRIVE_FOLDER_NAME')||'Customer Success Board';
  const f=await api(`/drive/v3/files?q=${q(`name='${name.replace(/'/g,"\\'")}' and mimeType='${FOLDER_MIME}' and trashed=false`)}&fields=files(id)`);
  if(f.files&&f.files[0])return cache.folder=f.files[0].id;
  const c=await api('/drive/v3/files',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name,mimeType:FOLDER_MIME})});
  return cache.folder=c.id;
}
export async function listAll(){
  const fid=await folderId();let out=[],page='';
  do{const d=await api(`/drive/v3/files?q=${q(`'${fid}' in parents and trashed=false`)}&fields=nextPageToken,files(id,name,appProperties,modifiedTime)&pageSize=1000${page?'&pageToken='+page:''}`);out=out.concat(d.files||[]);page=d.nextPageToken||'';}while(page);
  return out;
}
export const readJSON=async id=>{const t=await api(`/drive/v3/files/${id}?alt=media`);return typeof t==='string'?JSON.parse(t):t;};
export async function upsert(cid,name,obj){
  const fid=await folderId();
  const ex=await api(`/drive/v3/files?q=${q(`'${fid}' in parents and trashed=false and appProperties has { key='cid' and value='${cid}' }`)}&fields=files(id)`);
  const id=ex.files&&ex.files[0]&&ex.files[0].id;
  const b='csb'+Math.random().toString(36).slice(2);
  const meta=id?{name}:{name,parents:[fid],mimeType:'application/json',appProperties:{cid}};
  const body=`--${b}\r\ncontent-type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(meta)}\r\n--${b}\r\ncontent-type: application/json\r\n\r\n${JSON.stringify(obj,null,1)}\r\n--${b}--`;
  return api(`/upload/drive/v3/files${id?'/'+id:''}?uploadType=multipart&fields=id`,{method:id?'PATCH':'POST',headers:{'content-type':'multipart/related; boundary='+b},body});
}
