'use strict';
const {createClient} = require('@supabase/supabase-js');
const {createHash} = require('node:crypto');
let client;
function getClient(){
  if(!process.env.SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY){
    const error=new Error('Live features need SUPABASE_URL and SUPABASE_SECRET_KEY in Vercel project settings.');error.status=503;throw error;
  }
  if(!client){client=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SECRET_KEY,{auth:{persistSession:false,autoRefreshToken:false}});}
  return client;
}
function send(res,status,data){res.setHeader('Cache-Control','no-store');return res.status(status).json(data);}
function cleanText(input,max){return typeof input==='string' ? input.trim().replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').slice(0,max):'';}
function requestKey(req,kind){
  // A one-way hash: no guest IP addresses are stored in the database.
  const ip=(req.headers['x-forwarded-for']||req.socket?.remoteAddress||'unknown').toString().split(',')[0].trim();
  const salt=process.env.RATE_LIMIT_SALT||process.env.SUPABASE_SECRET_KEY||'wedding';
  return {identity:createHash('sha256').update(`${kind}:${ip}:${salt}`).digest('hex'),kind};
}
async function checkRateLimit(sb,req,kind,intervalMs){
  const key=requestKey(req,kind);
  const {data,error}=await sb.from('wedding_rate_limits').select('last_at').eq('identity',key.identity).eq('kind',kind).maybeSingle();
  if(error) throw error;
  if(data && Date.now()-new Date(data.last_at).getTime()<intervalMs){let err=new Error('Please wait a moment before sending another message or photo.');err.status=429;throw err;}
  const {error:upsertErr}=await sb.from('wedding_rate_limits').upsert({...key,last_at:new Date().toISOString()},{onConflict:'identity,kind'});
  if(upsertErr) throw upsertErr;
}
function checkRequestOrigin(req){
  const origin=req.headers.origin;
  if(!origin)return;
  try{const host=(req.headers['x-forwarded-host']||req.headers.host||'').split(',')[0];if(new URL(origin).host!==host){const error=new Error('This form must be submitted from the wedding website.');error.status=403;throw error;}}
  catch(e){if(e.status)throw e;const error=new Error('Invalid request origin.');error.status=403;throw error;}
}
module.exports={getClient,send,cleanText,checkRateLimit,checkRequestOrigin};
