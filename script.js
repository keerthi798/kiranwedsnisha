'use strict';

/* ================================================================
   KIRANKUMAR & NISHA MOHAN — EDIT YOUR WEDDING DETAILS HERE
   IMPORTANT: Please replace venue placeholders when confirmed.
   For the exact ceremony countdown, replace 00:00 with its time.
================================================================ */
const WEDDING_CONFIG = {
  couple: 'Kirankumar & Nisha Mohan',
  weddingISO: '2027-02-11T00:00:00+05:30', // IST: start of wedding date, until time confirmed
  temple: {name: 'Temple venue', address: 'Exact temple name and location coming soon', mapQuery: '', time: ''},
  reception: {name: 'Reception venue', address: 'Venue details coming soon', mapQuery: '', date: '', time: ''},
  home: {address: 'Kiran Bhavanam, Kannampally Bhagam, Kayamkulam, Kerala, India', mapQuery: 'Kiran Bhavanam Kannampally Bhagam Kayamkulam Kerala India'},
  whatsappPhone: '' // Optional: digits with country code, e.g. 9198XXXXXXXX; empty = WhatsApp share chooser.
};

const $ = (selector) => document.querySelector(selector);
const overlay = $('#invitationOverlay');
const envelope = $('#envelopeWrap');
const website = $('#website');
let isOpening = false;

function openInvitation() {
  if (isOpening) return;
  isOpening = true;
  overlay.classList.add('opening');
  setTimeout(() => {
    document.body.classList.remove('invitation-closed');
    website.classList.add('is-visible');
    website.setAttribute('aria-hidden', 'false');
    overlay.classList.add('overlay-hidden');
    overlay.setAttribute('aria-hidden', 'true');
    overlay.removeAttribute('aria-modal');
    window.scrollTo({top: 0, behavior: 'instant'});
    $('.brand')?.focus?.({preventScroll: true});
  }, 1450);
}
function replayInvitation() {
  window.scrollTo({top: 0, behavior: 'instant'});
  document.body.classList.add('invitation-closed');
  website.classList.remove('is-visible');
  website.setAttribute('aria-hidden', 'true');
  overlay.setAttribute('aria-hidden', 'false');
  overlay.setAttribute('aria-modal', 'true');
  overlay.classList.remove('overlay-hidden', 'opening');
  isOpening = false;
  setTimeout(() => $('#openInvitation')?.focus({preventScroll:true}), 60);
}
$('#openInvitation').addEventListener('click', openInvitation);
$('#openInvitationText').addEventListener('click', openInvitation);
$('#replayInvitation').addEventListener('click', replayInvitation);

// Animate a mixture of roses, sunflowers and jasmine blossoms.
const flowerSVG = [
  `<svg viewBox="0 0 64 64" aria-hidden="true"><g fill="#ac1d34" stroke="#6f0d21" stroke-width="1.1"><ellipse cx="32" cy="19" rx="11" ry="16"/><ellipse cx="46" cy="28" rx="11" ry="16" transform="rotate(67 46 28)"/><ellipse cx="39" cy="45" rx="11" ry="16" transform="rotate(143 39 45)"/><ellipse cx="23" cy="44" rx="11" ry="16" transform="rotate(217 23 44)"/><ellipse cx="17" cy="27" rx="11" ry="16" transform="rotate(284 17 27)"/></g><path d="M24 26c7-9 21 0 14 10-6 8-19 2-11-6 5-6 12-1 7 4" fill="none" stroke="#e7696d" stroke-width="3" stroke-linecap="round"/><path d="M29 49l5 11M24 56l9-2 8 3" stroke="#477039" stroke-width="2" fill="none"/></svg>`,
  `<svg viewBox="0 0 64 64" aria-hidden="true"><g fill="#f5b932" stroke="#b8791a" stroke-width=".9">${Array.from({length:12},(_,i)=>`<ellipse cx="32" cy="13" rx="6" ry="13" transform="rotate(${i*30} 32 32)"/>`).join('')}</g><circle cx="32" cy="32" r="14" fill="#7b3f1d" stroke="#c3852c" stroke-width="2"/><circle cx="32" cy="32" r="9" fill="#51321d"/><g fill="#d39d4f"><circle cx="28" cy="27" r="1.4"/><circle cx="36" cy="30" r="1.4"/><circle cx="31" cy="36" r="1.4"/><circle cx="37" cy="37" r="1.2"/><circle cx="26" cy="34" r="1.3"/></g></svg>`,
  `<svg viewBox="0 0 64 64" aria-hidden="true"><g fill="#fff9e7" stroke="#dbcfad" stroke-width="1.1">${Array.from({length:6},(_,i)=>`<ellipse cx="32" cy="18" rx="7.5" ry="15" transform="rotate(${i*60} 32 32)"/>`).join('')}</g><circle cx="32" cy="32" r="7.5" fill="#e9bc4e"/><circle cx="32" cy="32" r="3" fill="#b67b34"/></svg>`
];
let livingFlowers = 0;
function showerFlower() {
  if (document.hidden || window.matchMedia('(prefers-reduced-motion: reduce)').matches || livingFlowers > 25) return;
  const el = document.createElement('span');
  el.className = 'falling-flower';
  el.innerHTML = flowerSVG[Math.floor(Math.random()*flowerSVG.length)];
  el.style.setProperty('--x', `${Math.round(Math.random()*97)}vw`);
  el.style.setProperty('--size', `${Math.round(17+Math.random()*23)}px`);
  el.style.setProperty('--drift', `${Math.round((Math.random()-.5)*190)}px`);
  el.style.setProperty('--duration', `${(7+Math.random()*6).toFixed(1)}s`);
  el.style.setProperty('--delay', '0s');
  $('#flowerRain').append(el); livingFlowers++;
  el.addEventListener('animationend', () => {el.remove(); livingFlowers--;}, {once:true});
}
for(let i=0;i<12;i++) setTimeout(showerFlower, i*180);
setInterval(showerFlower, 560);

// Countdown — local user time-independent timestamp in India Standard Time.
function updateCountdown() {
  const left = new Date(WEDDING_CONFIG.weddingISO).getTime() - Date.now();
  const seconds = Math.max(0, Math.floor(left / 1000));
  const vals = [Math.floor(seconds/86400), Math.floor(seconds%86400/3600), Math.floor(seconds%3600/60), seconds%60];
  ['days','hours','minutes','seconds'].forEach((name,i) => {$("#"+name).textContent = String(vals[i]).padStart(i?2:1,'0');});
  if (left <= 0) $('#countdownIntro').textContent = 'Our celebration day has arrived! ♥';
}
updateCountdown(); setInterval(updateCountdown, 1000);

function makeMaps() {
  const mapUrl = (q) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
  function fillVenue(which, prefix) {
    const data = WEDDING_CONFIG[which];
    $('#'+prefix+'Name').textContent=data.name;
    $('#'+prefix+'Address').textContent=data.address;
    const mapEl = $('#'+prefix+'Map');
    if (data.mapQuery) {mapEl.href=mapUrl(data.mapQuery); mapEl.textContent='Open location in Maps ↗'; mapEl.classList.remove('is-disabled');mapEl.removeAttribute('aria-disabled');mapEl.removeAttribute('tabindex');}
  }
  fillVenue('temple','temple');fillVenue('reception','reception');
  if(WEDDING_CONFIG.temple.time) $('#ceremonyTimeLabel').textContent=WEDDING_CONFIG.temple.time;
  if(WEDDING_CONFIG.reception.date) $('#receptionDateLabel').textContent=WEDDING_CONFIG.reception.date;
  if(WEDDING_CONFIG.reception.time) $('#receptionTimeLabel').textContent=WEDDING_CONFIG.reception.time;
  const query=WEDDING_CONFIG.home.mapQuery;
  $('#homeMap').href=mapUrl(query); $('#directionsLink').href=mapUrl(query);
  $('#homeEmbed').src=`https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
  const message=`Dear Kirankumar & Nisha Mohan, wishing you a lifetime of love, laughter, and beautiful memories! 🌹♥🌻`;
  $('#whatsappWish').href=WEDDING_CONFIG.whatsappPhone
    ? `https://wa.me/${WEDDING_CONFIG.whatsappPhone.replace(/\D/g,'')}?text=${encodeURIComponent(message)}`
    : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
}
makeMaps();

// Graceful reveals without requiring any animation library.
if('IntersectionObserver' in window){
  const observer = new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}}),{threshold:.08});
  document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
}else{document.querySelectorAll('.reveal').forEach(el=>el.classList.add('visible'));}

async function apiRequest(url,options={}) {
  let r;
  try {r=await fetch(url, {headers:{'Accept':'application/json',...options.body?{'Content-Type':'application/json'}:{}},...options});}
  catch {throw new Error('Live wishes and photo uploads require Vercel + Supabase setup. See README.');}
  const data=await r.json().catch(()=>({}));
  if(!r.ok) throw new Error(data.error || (r.status===503?'Live guestbook needs Vercel + Supabase setup. See README.':`Request failed (${r.status})`));
  return data;
}
function feedback(selector,msg,ok=false){let el=$(selector);el.textContent=msg;el.style.color=ok?'#347044':'#9c2639';}
const fmtDate=date=>{const d=new Date(date);return isNaN(d)?'Recently':d.toLocaleDateString('en-IN',{day:'numeric',month:'short',timeZone:'Asia/Kolkata'});};
function drawWishes(wishes){
  const wall=$('#wishList');wall.replaceChildren();
  if(!wishes.length){const empty=document.createElement('div');empty.className='wishes-empty';empty.innerHTML='<span>♥</span><h4>Be the first to send a blessing</h4><p>Your kind words will make our day brighter.</p>';wall.append(empty);return;}
  wishes.forEach(w=>{const item=document.createElement('article');item.className='wish-item';const top=document.createElement('div');top.className='wish-top';const name=document.createElement('span');name.className='wish-name';name.textContent=w.name||'A loved one';const time=document.createElement('time');time.textContent=fmtDate(w.created_at);const p=document.createElement('p');p.textContent=w.message;top.append(name,time);item.append(top,p);wall.append(item);});
}
function drawPhotos(photos){
  const target=$('#photoGallery');target.replaceChildren();
  if(!photos.length){const div=document.createElement('div');div.className='memory-empty';div.innerHTML='<span>✿</span><strong>A garden waiting to bloom</strong><p>Guest photos will appear here after approval.</p>';target.append(div);return;}
  photos.forEach(photo=>{const card=document.createElement('div');card.className='gallery-item';const img=document.createElement('img');img.src=photo.url;img.loading='lazy';img.alt='Wedding photo shared by '+(photo.name||'a guest');img.decoding='async';const caption=document.createElement('div');caption.className='gallery-caption';const n=document.createElement('strong');n.textContent=photo.name||'Wedding guest';caption.append(n);if(photo.caption){const c=document.createElement('span');c.textContent=photo.caption;caption.append(c);}card.append(img,caption);target.append(card);});
}
async function loadGuestbook(){try{const data=await apiRequest('/api/wishes');drawWishes(data.wishes||[])}catch(e){const target=$('#wishList');target.replaceChildren();const p=document.createElement('p');p.className='wishes-empty';p.textContent='The live blessings wall will appear after you connect Supabase and deploy on Vercel.';target.append(p);}}
async function loadPhotos(){try{const data=await apiRequest('/api/photos');drawPhotos(data.photos||[])}catch(e){/* Keep the attractive empty-gallery placeholder offline. */}}
loadGuestbook();loadPhotos();setInterval(()=>{if(!document.hidden){loadGuestbook();loadPhotos();}},30000);

$('#wishForm').addEventListener('submit',async(e)=>{
  e.preventDefault();const form=e.currentTarget;const button=form.querySelector('button[type=submit]');
  const name=form.elements.name.value.trim(), message=form.elements.message.value.trim();
  if(name.length<2||message.length<8){feedback('#wishFeedback','Please add your name and a heartfelt message (at least 8 characters).');return;}
  button.disabled=true;button.textContent='Sending your love…';
  try{
    const result=await apiRequest('/api/wishes',{method:'POST',body:JSON.stringify({name,message,website:form.elements.website.value})});
    feedback('#wishFeedback',result.message||'Your blessing was received and is awaiting review. ♥',true);
    form.reset(); await loadGuestbook();
  }catch(error){feedback('#wishFeedback',error.message);}
  finally{button.disabled=false;button.innerHTML='Send our hearts a blessing <span>♡</span>';}
});

// Re-encoding guest images removes EXIF (including possible GPS metadata) and reduces size.
async function preparePhoto(file) {
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)) throw new Error('Please choose a JPG, PNG or WebP photo.');
  if(file.size>16*1024*1024) throw new Error('This photo is too large. Please choose a photo smaller than 16 MB.');
  if(!('createImageBitmap' in window)) {if(file.size>5*1024*1024) throw new Error('Please choose a file under 5 MB.');return file;}
  const bitmap=await createImageBitmap(file);const scale=Math.min(1,1700/Math.max(bitmap.width,bitmap.height));
  const c=document.createElement('canvas');c.width=Math.max(1,Math.round(bitmap.width*scale));c.height=Math.max(1,Math.round(bitmap.height*scale));
  c.getContext('2d').drawImage(bitmap,0,0,c.width,c.height);bitmap.close?.();
  const blob=await new Promise(resolve=>c.toBlob(resolve,'image/webp',.82));
  if(!blob) throw new Error('Could not prepare this image. Try a different photo.');
  if(blob.size>5*1024*1024) throw new Error('This photo is still too large. Please choose a smaller photo.');
  return blob;
}
$('#photoFile').addEventListener('change',e=>{
  const file=e.target.files?.[0];$('#fileLabel').textContent=file?file.name:'Choose a photo from your gallery';
});
$('#photoForm').addEventListener('submit',async(e)=>{
  e.preventDefault();const form=e.currentTarget;const file=form.elements.photo.files?.[0];const button=form.querySelector('button[type=submit]');
  if(!file){feedback('#photoFeedback','Please choose a photo.');return;}
  button.disabled=true;button.textContent='Preparing your memory…';
  try{
    const image=await preparePhoto(file);
    const data=await apiRequest('/api/photos',{method:'POST',body:JSON.stringify({name:form.elements.name.value.trim(),caption:form.elements.caption.value.trim(),type:image.type,size:image.size})});
    feedback('#photoFeedback','Uploading your photograph…',true);
    // The signed upload URL is issued by the Vercel function; the secret key is never exposed.
    // Use a FormData body, matching Supabase Storage's signed-upload endpoint.
    const uploadBody=new FormData();uploadBody.append('cacheControl','3600');uploadBody.append('',image,'wedding-memory.webp');
    const response=await fetch(data.signedUrl,{method:'PUT',headers:{'x-upsert':'false'},body:uploadBody});
    if(!response.ok) throw new Error('The image upload did not finish. Please try again.');
    feedback('#photoFeedback','Your beautiful memory was uploaded! It will appear once approved. 🌸',true);
    form.reset();$('#fileLabel').textContent='Choose a photo from your gallery';
  }catch(error){feedback('#photoFeedback',error.message);}
  finally{button.disabled=false;button.innerHTML='Plant this memory <span>✿</span>';}
});
