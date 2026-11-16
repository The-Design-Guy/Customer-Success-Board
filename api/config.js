import {json,env} from '../lib/util.js';
import {driveReady} from '../lib/drive.js';
export function GET(){return json({cloud:true,drive:driveReady(),keys:{serp:!!env('SERPAPI_KEY'),apify:!!env('APIFY_TOKEN'),anthropic:!!env('ANTHROPIC_API_KEY'),dataforseo:!!(env('DATAFORSEO_LOGIN')&&env('DATAFORSEO_PASSWORD')),pagespeed:!!env('PAGESPEED_API_KEY')}});}
