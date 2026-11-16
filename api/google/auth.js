import {env} from '../../lib/util.js';
export function GET(req){
  const u=new URL(req.url);const redirect=u.origin+'/api/google/callback';
  if(!env('GOOGLE_CLIENT_ID'))return new Response('חסר GOOGLE_CLIENT_ID ב-Vercel',{status:400});
  const g=new URL('https://accounts.google.com/o/oauth2/v2/auth');
  Object.entries({client_id:env('GOOGLE_CLIENT_ID'),redirect_uri:redirect,response_type:'code',access_type:'offline',prompt:'consent',scope:env('DRIVE_FOLDER_ID')?'https://www.googleapis.com/auth/drive':'https://www.googleapis.com/auth/drive.file'}).forEach(([a,b])=>g.searchParams.set(a,b));
  return Response.redirect(g.toString(),302);
}
