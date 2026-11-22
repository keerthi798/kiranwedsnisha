'use strict';
module.exports=function handler(req,res){res.setHeader('Cache-Control','no-store');res.status(200).json({status:'ok',backendConfigured:Boolean(process.env.SUPABASE_URL&&process.env.SUPABASE_SECRET_KEY),date:'2027-02-11'});};
