'use strict';
const {randomUUID}=require('node:crypto');
const {getClient,send,cleanText,checkRateLimit,checkRequestOrigin}=require('../lib/supabase');
const MIME_EXT={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'};
module.exports=async function handler(req,res){
  if(!['GET','POST'].includes(req.method))return send(res,405,{error:'Method not allowed'});
  try{
    const sb=getClient();
    if(req.method==='GET'){
      const {data,error}=await sb.from('wedding_photos').select('path,name,caption,created_at').eq('approved',true).order('created_at',{ascending:false}).limit(30);
      if(error)throw error;
      const photos=(data||[]).map(photo=>({name:photo.name,caption:photo.caption,created_at:photo.created_at,url:sb.storage.from('wedding-memories').getPublicUrl(photo.path).data.publicUrl}));
      return send(res,200,{photos});
    }
    checkRequestOrigin(req);
    const body=typeof req.body==='string'?JSON.parse(req.body):req.body||{};
    const name=cleanText(body.name,48),caption=cleanText(body.caption,120),size=Number(body.size),type=body.type;
    if(name.length<2)return send(res,400,{error:'Please include your name with the photo.'});
    if(!Object.hasOwn(MIME_EXT,type)||!Number.isFinite(size)||size<100||size>5*1024*1024)return send(res,400,{error:'Only JPG, PNG or WebP photos up to 5 MB are supported.'});
    if(/https?:\/\/|www\.|<\/?[a-z]/i.test(name+' '+caption))return send(res,400,{error:'Please leave out links or HTML.'});
    await checkRateLimit(sb,req,'photo',90000);
    const path=`guest-uploads/${randomUUID()}.${MIME_EXT[type]}`;
    const {error:dbError}=await sb.from('wedding_photos').insert({name,caption,path,approved:false});
    if(dbError)throw dbError;
    const {data,error}=await sb.storage.from('wedding-memories').createSignedUploadUrl(path,{upsert:false});
    if(error){await sb.from('wedding_photos').delete().eq('path',path);throw error;}
    return send(res,201,{signedUrl:data.signedUrl});
  }catch(e){console.error('photos:',e.message);return send(res,e.status||500,{error:e.status?e.message:'Could not prepare the upload right now. Please try again later.'});}
};
