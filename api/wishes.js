'use strict';
const {getClient,send,cleanText,checkRateLimit,checkRequestOrigin}=require('../lib/supabase');
module.exports=async function handler(req,res){
  if(!['GET','POST'].includes(req.method))return send(res,405,{error:'Method not allowed'});
  try{
    const sb=getClient();
    if(req.method==='GET'){
      const {data,error}=await sb.from('wedding_wishes').select('id,name,message,created_at').eq('approved',true).order('created_at',{ascending:false}).limit(36);
      if(error)throw error;
      return send(res,200,{wishes:data||[]});
    }
    checkRequestOrigin(req);
    const body=typeof req.body==='string'?JSON.parse(req.body):req.body||{};
    if(body.website)return send(res,200,{message:'Thank you for your message!'}); // honeypot
    const name=cleanText(body.name,48), message=cleanText(body.message,420);
    if(name.length<2||message.length<8)return send(res,400,{error:'Please enter your name and a wish of at least 8 characters.'});
    if(/https?:\/\/|www\.|<\/?[a-z]/i.test(name+' '+message))return send(res,400,{error:'Please send a wish without links or HTML.'});
    await checkRateLimit(sb,req,'wish',45000);
    const approved=process.env.AUTO_APPROVE_WISHES==='true';
    const {error}=await sb.from('wedding_wishes').insert({name,message,approved});
    if(error)throw error;
    return send(res,201,{message:approved?'Your blessing is now part of our live wall. ♥':'Thank you! Your blessing will appear after a quick review. ♥'});
  }catch(e){console.error('wishes:',e.message);return send(res,e.status||500,{error:e.status?e.message:'Could not save your wish right now. Please try again later.'});}
};
