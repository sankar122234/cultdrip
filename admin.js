/* cd-version:4 */
var KEY="cd_draft",SESS="cd_ok",TRY="cd_try",TOK="cd_tok";
var LIVE=JSON.stringify({STORE:STORE,PRODUCTS:PRODUCTS}),dirty=false,started=false,busy=false;
function $(s){return document.querySelector(s)}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function get(k){try{return localStorage.getItem(k)}catch(e){return null}}
function put(k,v){try{localStorage.setItem(k,v)}catch(e){}}
function rm(k){try{localStorage.removeItem(k)}catch(e){}}
function sget(k){try{return sessionStorage.getItem(k)}catch(e){return null}}
function sput(k,v){try{sessionStorage.setItem(k,v)}catch(e){}}
function srm(k){try{sessionStorage.removeItem(k)}catch(e){}}
function num(v){var n=parseFloat(String(v).replace(",","."));return isNaN(n)?0:n}
function money(n){n=+n||0;return (STORE.currency||"$")+(n%1===0?n:n.toFixed(2))}
/* ---------- GitHub ---------- */
var GH_DEFAULT={owner:"sankar122234",repo:"cultdrip",branch:"main",path:"data.js"};
function ghRepo(){var h=location.hostname,p=location.pathname.split("/")[1];
  if(/\.github\.io$/.test(h)&&p&&p.indexOf(".")<0)return {owner:h.split(".")[0],repo:p,branch:"main",path:"data.js"};
  return GH_DEFAULT}
function parseData(text){var m=String(text).match(/var STORE\s*=\s*([\s\S]*?);\s*var PRODUCTS\s*=\s*([\s\S]*?);\s*$/);if(!m)return null;try{return{STORE:JSON.parse(m[1]),PRODUCTS:JSON.parse(m[2])}}catch(e){return null}}
function tok(){return get(TOK)||sget(TOK)}
function setTok(t){try{localStorage.setItem(TOK,t);srm(TOK)}catch(e){sput(TOK,t)}}
function clearTok(){rm(TOK);srm(TOK)}
function connected(){return !!tok()}
function gh(msg,bad){var e=$("#ghs");e.textContent=msg;e.className=bad?"bad":"good"}
function ghStatus(){var r=ghRepo();
  if(connected()){gh("✓ Token saved. Connected to "+r.owner+"/"+r.repo+".");$("#tok").placeholder="Token saved. Paste a new one here only to change it"}
  else{gh("No token yet. Add one so Save & publish can update your live shop.",true);$("#tok").placeholder="github_pat_..."}}
function api(path,o){o=o||{};var h={Accept:"application/vnd.github+json"};if(tok())h.Authorization="Bearer "+tok();if(o.body)h["Content-Type"]="application/json";
  return fetch("https://api.github.com"+path,{method:o.method||"GET",headers:h,body:o.body,cache:"no-store"})}
function b64(s){return btoa(unescape(encodeURIComponent(s)))}
function ghErr(e){
  if(e&&e.status===401)return "GitHub rejected the token. It may have expired, so save a new one.";
  if(e&&(e.status===403||e.status===404))return "The token can't write to this repository. Give it Contents: Read and write for "+ghRepo().repo+".";
  if(e&&e.status)return "GitHub returned error "+e.status+".";
  return "Could not reach GitHub. Check your internet connection."}
function publish(){
  var r=ghRepo(),p="/repos/"+r.owner+"/"+r.repo+"/contents/"+r.path;
  function sha(){return api(p+"?ref="+r.branch).then(function(res){if(res.status===404)return undefined;if(!res.ok)throw res;return res.json().then(function(j){return j.sha})})}
  function send(s,retry){return api(p,{method:"PUT",body:JSON.stringify({message:"Update store from Store Manager",content:b64(code()),sha:s,branch:r.branch})}).then(function(res){
    if((res.status===409||res.status===422)&&!retry)return sha().then(function(n){return send(n,true)});
    if(!res.ok)throw res;return res})}
  return sha().then(function(s){return send(s,false)})}
function freshLive(){
  if(!window.fetch)return Promise.resolve();
  var r=ghRepo(),h={Accept:"application/vnd.github.raw+json"};if(tok())h.Authorization="Bearer "+tok();
  return fetch("https://api.github.com/repos/"+r.owner+"/"+r.repo+"/contents/"+r.path+"?ref="+r.branch,{headers:h,cache:"no-store"})
   .then(function(res){if(!res.ok)throw 0;return res.text()})
   .then(function(t){var d=parseData(t);if(d&&!dirty){STORE=d.STORE;PRODUCTS=d.PRODUCTS;LIVE=JSON.stringify({STORE:STORE,PRODUCTS:PRODUCTS})}})
   .catch(function(){})}
/* ---------- passcode ---------- */
function hex(b){return Array.prototype.map.call(new Uint8Array(b),function(x){return("0"+x.toString(16)).slice(-2)}).join("")}
function unhex(h){return new Uint8Array(h.match(/../g).map(function(x){return parseInt(x,16)}))}
function derive(pass,salt,iter){
  return crypto.subtle.importKey("raw",new TextEncoder().encode(pass),"PBKDF2",false,["deriveBits"]).then(function(k){
    return crypto.subtle.deriveBits({name:"PBKDF2",hash:"SHA-256",salt:unhex(salt),iterations:iter},k,256)}).then(hex)}
function download(name,text){var a=document.createElement("a");a.href=URL.createObjectURL(new Blob([text],{type:"text/javascript"}));a.download=name;a.click()}
function gate(){
  $("#gate").hidden=false;
  if(typeof ADMIN_LOCK!=="undefined"&&ADMIN_LOCK){if(sget(SESS)==="1")return open();$("#g-lock").hidden=false;$("#pw").focus()}
  else $("#g-setup").hidden=false;
}
function open(){$("#gate").hidden=true;$("#app").hidden=false;start()}
$("#unlock").onclick=function(){
  var m=$("#gmsg"),t={n:0,until:0};try{t=JSON.parse(get(TRY))||t}catch(e){}
  if(t.until>Date.now()){m.textContent="Too many tries. Wait "+Math.ceil((t.until-Date.now())/60000)+" minute(s).";return}
  if(!(window.crypto&&crypto.subtle)){m.textContent="This browser can't check passcodes here. Open the site over https.";return}
  derive($("#pw").value,ADMIN_LOCK.salt,ADMIN_LOCK.iter).then(function(h){
    if(h===ADMIN_LOCK.hash){put(TRY,"{}");sput(SESS,"1");open()}
    else{t.n=(t.n||0)+1;if(t.n>=5){t.until=Date.now()+300000;t.n=0;m.textContent="Too many tries. Locked for 5 minutes."}else m.textContent="Wrong passcode. "+(5-t.n)+" tries left.";put(TRY,JSON.stringify(t));$("#pw").value=""}
  })};
$("#pw").onkeydown=function(e){if(e.key==="Enter")$("#unlock").click()};
$("#mk").onclick=function(){
  var a=$("#np").value,b=$("#np2").value,m=$("#gmsg2");
  if(a.length<8){m.textContent="Use at least 8 characters.";return}
  if(a!==b){m.textContent="The two passcodes don't match.";return}
  if(!(window.crypto&&crypto.subtle)){m.textContent="This browser can't create passcodes here. Open the site over https.";return}
  var salt=hex(crypto.getRandomValues(new Uint8Array(16))),iter=200000;
  derive(a,salt,iter).then(function(h){
    download("lock.js","/* Admin passcode lock. Upload to GitHub to switch it on. */\nvar ADMIN_LOCK = "+JSON.stringify({salt:salt,iter:iter,hash:h})+";\n");
    sput(SESS,"1");
    if(started){$("#gate").hidden=true;$("#app").hidden=false;say("lock.js downloaded. Upload it to GitHub to switch the new passcode on.",10000)}
    else{m.textContent="Downloaded lock.js. Upload it to GitHub to switch the lock on.";setTimeout(open,1200)}})};
$("#skip").onclick=function(){if(started){$("#gate").hidden=true;$("#app").hidden=false}else open()};
$("#chpw").onclick=function(){$("#app").hidden=true;$("#gate").hidden=false;$("#g-lock").hidden=true;$("#g-setup").hidden=false};
/* ---------- editor ---------- */
var SET=[["brand","Brand name","text"],["announce","Top banner message","text"],["heroTitle","Home headline","text"],["heroText","Home sub-text","text"],["shopTitle","Shop page title","text"],["currency","Currency symbol","text"],["freeShip","Free shipping over","num"],["delivery","Delivery info (product page)","text"],["returns","Returns info (product page)","text"],["orderEmail","Order & contact email (orders and messages go here)","text"],["formUrl","Form address for sign-ups and messages (optional, a https link from a service like Formspree)","text"],["instagram","Instagram link or @handle","text"],["tiktok","TikTok link or @handle","text"]];
var TYPES=["hoodie","tee","pants","cap"],STAT=[["live","On sale now"],["soldout","Sold out"],["hidden","Hidden"]],TAGS=[["","No badge"],["New","New"],["Limited","Limited"],["Best seller","Best seller"]];
function say(m,ms){var s=$("#status");s.textContent=m;clearTimeout(say.t);say.t=setTimeout(function(){s.textContent=""},ms||3500)}
function ui(){
  $("#state").textContent=dirty?"● Not published yet":(connected()?"✓ Everything is published":"✓ Saved in this browser");
  $("#state").className=dirty?"warn":"";$("#saveb").disabled=busy;$("#saveb").textContent=connected()?"Save & publish":"Save changes";
  $("#hint").textContent=""}
function mark(){dirty=true;ui()}
function writeDraft(){try{localStorage.setItem(KEY,JSON.stringify({STORE:STORE,PRODUCTS:PRODUCTS,base:LIVE}));return true}catch(e){return false}}
function commit(){
  if(!writeDraft()){say("Could not save in this browser",6000);return}
  if(!connected()){say("Saved in this browser only. Add your GitHub token above to publish to the live shop.",9000);return}
  busy=true;ui();say("Publishing to your live shop…",30000);
  publish().then(function(){dirty=false;LIVE=JSON.stringify({STORE:STORE,PRODUCTS:PRODUCTS});writeDraft();say("Published at "+new Date().toLocaleTimeString()+". Your live shop is updating now.",9000)})
   .catch(function(e){say("NOT published: "+ghErr(e),12000)})
   .then(function(){busy=false;ui()})}
function opts(list,cur){return list.map(function(o){var v=o instanceof Array?o[0]:o,l=o instanceof Array?o[1]:o;return '<option value="'+esc(v)+'"'+(v===cur?' selected':'')+'>'+esc(l)+'</option>'}).join("")}
function nfld(attr,label,v){return '<label>'+label+'<input '+attr+' data-num="1" type="text" inputmode="decimal" value="'+esc(v)+'"></label>'}
function drawSet(){$("#set").innerHTML=SET.map(function(s){var v=STORE[s[0]]==null?"":STORE[s[0]];
  return s[2]==="num"?nfld('data-s="'+s[0]+'"',s[1],v):'<label>'+s[1]+'<input data-s="'+s[0]+'" type="text" value="'+esc(v)+'"></label>'}).join("")}
function fld(i,k,label,type,v){return '<label>'+label+'<input data-i="'+i+'" data-k="'+k+'" type="'+type+'" value="'+esc(v)+'"></label>'}
function sel(i,k,label,list,cur){return '<label>'+label+'<select data-i="'+i+'" data-k="'+k+'">'+opts(list,cur)+'</select></label>'}
function title(p,i){
  var sale=+p.was>+p.price;
  return (i+1)+'. '+esc(p.name||"New product")+' <span class="chip">'+money(p.price)+(sale?' · was '+money(p.was)+' · -'+Math.round((1-p.price/p.was)*100)+'%':'')+'</span>'}
function head(i){var el=$("#h"+i);if(el)el.innerHTML=title(PRODUCTS[i],i)}
var PREV={};
function area(i,k,label,v,hint,rows){return '<label class="wide">'+label+'<textarea data-i="'+i+'" data-k="'+k+'" rows="'+(rows||3)+'" placeholder="'+esc(hint||"")+'">'+esc(v||"")+'</textarea></label>'}
function imgs(p){if(!Array.isArray(p.images))p.images=p.image?[p.image]:[];return p.images}
function photoBlock(p,i){
  var im=imgs(p),h='<div class="photos"><b>Photos (up to 5)</b><p class="hint">The first photo is the main one. Use Upload to add a picture from your computer, or type a path such as images/hoodie-1.jpg.</p><div class="pslots">';
  for(var n=0;n<5;n++){var src=im[n]||"",pv=PREV[src]||src;
    h+='<div class="pslot"><div class="pthumb">'+(src?'<img src="'+esc(pv)+'" alt="Photo '+(n+1)+'">':'<span>'+(n+1)+'</span>')+'</div>'+
      '<input type="text" data-photo="1" data-i="'+i+'" data-n="'+n+'" value="'+esc(src)+'" placeholder="images/..." aria-label="Photo '+(n+1)+' path">'+
      '<div class="pbtn"><button type="button" data-a="up_img" data-i="'+i+'" data-n="'+n+'">Upload</button>'+(src?'<button type="button" data-a="rm_img" data-i="'+i+'" data-n="'+n+'">Remove</button>':'')+'</div></div>'}
  return h+'</div><input type="file" id="pf" accept="image/*" hidden></div>'}
function drawProd(){
  $("#list").innerHTML=PRODUCTS.map(function(p,i){
    return '<div class="prow"><div class="ptop"><b id="h'+i+'">'+title(p,i)+'</b><span><button data-a="up" data-i="'+i+'">Up</button><button data-a="down" data-i="'+i+'">Down</button><button data-a="dup" data-i="'+i+'">Copy</button><button class="del" data-a="del" data-i="'+i+'">Delete</button></span></div>'+
    '<h4>Basics</h4><div class="fields">'+
    fld(i,"name","Name","text",p.name)+fld(i,"cat","Category","text",p.cat)+sel(i,"type","Drawing shape (shown if no photo)",TYPES,p.type)+
    nfld('data-i="'+i+'" data-k="price"',"Price",p.price)+nfld('data-i="'+i+'" data-k="was"',"Original price (0 = no sale)",p.was)+
    fld(i,"color","Colour","color",p.color)+sel(i,"status","Status",STAT,p.status)+sel(i,"tag","Badge",TAGS,p.tag)+'</div>'+
    '<h4>Photos</h4>'+photoBlock(p,i)+
    '<h4>Product page</h4><div class="fields">'+
    fld(i,"tagline","Short tagline under the name","text",p.tagline||"")+fld(i,"modelNote","Model note (e.g. Model is 183cm, wearing M)","text",p.modelNote||"")+
    fld(i,"sizes","Sizes, comma separated (blank = none)","text",p.sizes===undefined?"S,M,L,XL":p.sizes)+fld(i,"soldSizes","Sizes out of stock, comma separated","text",p.soldSizes||"")+
    fld(i,"colorName","Colour name (e.g. Ash Grey)","text",p.colorName||"")+fld(i,"group","Colour group (same word on each colour of one item)","text",p.group||"")+'</div>'+
    '<div class="fields">'+area(i,"desc","Description",p.desc,"A few sentences about the piece",4)+area(i,"materials","Materials (one per line)",p.materials,"80% cotton\n20% polyester")+
    area(i,"specs","Specifications (one per line)",p.specs,"Oversized fit\nBrushed fleece inside")+area(i,"features","Feature tiles, up to 3 (one per line: Title | detail)",p.features,"4-way stretch | Moves with you")+
    area(i,"sizeGuide","Size guide table (one row per line, columns split by |)",p.sizeGuide,"Size | Chest | Length\nS | 52cm | 68cm\nM | 55cm | 70cm",5)+'</div></div>'}).join("")}
function resizeImage(file,cb){
  var r=new FileReader();r.onerror=function(){cb(null)};
  r.onload=function(){var im=new Image();im.onerror=function(){cb(null)};im.onload=function(){
    var m=1600,sc=Math.min(1,m/Math.max(im.width,im.height)),c=document.createElement("canvas");c.width=Math.round(im.width*sc);c.height=Math.round(im.height*sc);
    var x=c.getContext("2d");x.fillStyle="#fff";x.fillRect(0,0,c.width,c.height);x.drawImage(im,0,0,c.width,c.height);cb(c.toDataURL("image/jpeg",.85))};im.src=r.result};
  r.readAsDataURL(file)}
function uploadPhoto(i,n){
  if(!connected()){say("Add your GitHub token first (GitHub connection box) so photos can be uploaded, or type a path instead.",9000);return}
  var inp=$("#pf");inp.value="";inp.onchange=function(){var f=inp.files[0];if(!f)return;
    if(!/^image\//.test(f.type)){say("That isn't a picture file.",6000);return}
    say("Preparing photo…",20000);
    resizeImage(f,function(url){
      if(!url){say("Couldn't read that picture. Try a JPG or PNG.",7000);return}
      var p=PRODUCTS[i],name="images/"+p.id+"-"+(n+1)+"-"+Date.now().toString(36)+".jpg",r=ghRepo();
      say("Uploading photo…",30000);
      api("/repos/"+r.owner+"/"+r.repo+"/contents/"+name,{method:"PUT",body:JSON.stringify({message:"Add product photo",content:url.split(",")[1],branch:r.branch})})
       .then(function(res){if(!res.ok)throw res;PREV[name]=url;var im=imgs(p).slice();while(im.length<n)im.push("");im[n]=name;p.images=im.filter(Boolean).slice(0,5);p.image=p.images[0]||"";mark();drawProd();say("Photo uploaded. It can take a minute or two to appear on the live shop. Press Save & publish to use it.",12000)})
       .catch(function(e){say("Photo NOT uploaded: "+ghErr(e),12000)})})};
  inp.click()}
document.addEventListener("input",function(e){
  var t=e.target;
  if(t.dataset&&t.dataset.photo){var p=PRODUCTS[+t.dataset.i],im=imgs(p).slice();while(im.length<5)im.push("");im[+t.dataset.n]=t.value.trim();p.images=im.filter(Boolean).slice(0,5);p.image=p.images[0]||"";mark();return}
  if(!t.dataset||!(t.dataset.s||t.dataset.k))return;
  var v=t.dataset.num?num(t.value):t.value;
  if(t.dataset.s){STORE[t.dataset.s]=v;mark()}
  else{var i=+t.dataset.i;PRODUCTS[i][t.dataset.k]=v;mark();head(i)}
});
document.addEventListener("change",function(e){var t=e.target;if(t.dataset&&t.dataset.num&&(t.dataset.s||t.dataset.k))t.value=num(t.value)});
document.addEventListener("focusin",function(e){var t=e.target;if(t.dataset&&t.dataset.num)t.select()});
$("#list").addEventListener("click",function(e){
  var b=e.target.closest("button");if(!b)return;var i=+b.dataset.i,a=b.dataset.a;
  if(a==="up_img"){uploadPhoto(i,+b.dataset.n);return}
  if(a==="rm_img"){var im=imgs(PRODUCTS[i]).slice();im.splice(+b.dataset.n,1);PRODUCTS[i].images=im;PRODUCTS[i].image=im[0]||"";mark();drawProd();return}
  if(a==="del"){if(!confirm("Delete this product?"))return;PRODUCTS.splice(i,1)}
  if(a==="dup"){var c=JSON.parse(JSON.stringify(PRODUCTS[i]));c.id=nextId();c.name+=" copy";PRODUCTS.splice(i+1,0,c)}
  if(a==="up"&&i>0){PRODUCTS.splice(i-1,0,PRODUCTS.splice(i,1)[0])}
  if(a==="down"&&i<PRODUCTS.length-1){PRODUCTS.splice(i+1,0,PRODUCTS.splice(i,1)[0])}
  mark();drawProd();
});
function nextId(){return PRODUCTS.reduce(function(m,p){return Math.max(m,p.id)},0)+1}
function pct(){return Math.min(90,Math.max(1,num($("#pct").value)))}
function r2(n){return Math.round(n*100)/100}
$("#add").onclick=function(){PRODUCTS.unshift({id:nextId(),name:"New product",type:"tee",cat:"Tees",price:50,was:0,color:"#227d47",image:"",images:[],status:"live",tag:"New",sizes:"S,M,L,XL",desc:""});mark();drawProd();window.scrollTo(0,$("#list").offsetTop-80)};
$("#sale").onclick=function(){PRODUCTS.forEach(function(p){var base=+p.was>+p.price?+p.was:+p.price;p.was=base;p.price=r2(base*(1-pct()/100))});mark();drawProd();say("Sale applied: press Save & publish")};
$("#unsale").onclick=function(){PRODUCTS.forEach(function(p){if(+p.was>+p.price)p.price=+p.was;p.was=0});mark();drawProd();say("Sales ended: press Save & publish")};
$("#up").onclick=function(){PRODUCTS.forEach(function(p){p.price=r2(p.price*(1+pct()/100));if(p.was)p.was=r2(p.was*(1+pct()/100))});mark();drawProd()};
$("#down").onclick=function(){PRODUCTS.forEach(function(p){p.price=r2(p.price*(1-pct()/100));if(p.was)p.was=r2(p.was*(1-pct()/100))});mark();drawProd()};
function code(){return "/* Made by the Store Manager. */\nvar STORE = "+JSON.stringify(STORE,null,2)+";\nvar PRODUCTS = "+JSON.stringify(PRODUCTS,null,2)+";\n"}
$("#saveb").onclick=commit;
$("#prev").onclick=function(){
  if(!writeDraft()){say("Could not prepare the preview",6000);return}
  var w=window.open("index.html?preview=1","_blank");
  if(!w)say("Your browser blocked the preview tab. Allow pop-ups for this site and try again.",9000)};
$("#dl").onclick=function(){download("data.js",code());say("Backup downloaded.")};
$("#reset").onclick=function(){if(confirm("Throw away unpublished changes and go back to what is live?")){rm(KEY);dirty=false;location.reload()}};
window.addEventListener("beforeunload",function(e){if(dirty){e.preventDefault();e.returnValue=""}});
/* ---------- token ---------- */
$("#ghc").onclick=function(){
  var t=$("#tok").value.trim(),r=ghRepo();
  if(!t){gh(connected()?"Your token is already saved. Paste a new one only if you want to change it.":"Paste your token first.",!connected());return}
  if(!window.fetch){gh("This browser can't connect to GitHub.",true);return}
  gh("Checking…");
  fetch("https://api.github.com/repos/"+r.owner+"/"+r.repo,{headers:{Accept:"application/vnd.github+json",Authorization:"Bearer "+t},cache:"no-store"}).then(function(res){
    if(res.status===401)throw "That token isn't valid or has expired.";
    if(res.status===403||res.status===404)throw "That token can't see "+r.owner+"/"+r.repo+". Choose this repository under Repository access when you create it.";
    if(!res.ok)throw "GitHub returned error "+res.status+".";
    setTok(t);$("#tok").value="";ghStatus();ui()
  }).catch(function(e){gh(typeof e==="string"?e:"Could not reach GitHub. Check your internet connection.",true)})};
$("#ghd").onclick=function(){if(!connected())return;if(confirm("Remove the saved token from this browser?")){clearTok();ghStatus();ui()}};
/* ---------- site files check ---------- */
var BUILD=4,BUILD_DATE="27 Oct 2026",WHATS_NEW="A friendlier shop: mobile menu, cart quantities, working forms, safer data handling, a 404 page and accessibility fixes.";
var EXPECT={"index.html":3,"shop.html":3,"product.html":4,"about.html":3,"contact.html":3,"404.html":3,"admin.html":4,"style.css":4,"script.js":4,"admin.js":4};
function checkFiles(){
  var out=$("#chkout");out.innerHTML="<li>Checking…</li>";
  if(!window.fetch){out.innerHTML="<li>This browser can't run the check.</li>";return Promise.resolve()}
  function one(f){return fetch(f+"?t="+Date.now(),{cache:"no-store"}).then(function(r){
    if(!r.ok)return{f:f,s:"missing"};
    return r.text().then(function(t){var m=t.match(/cd-version:(\d+)/),v=m?+m[1]:0,need=EXPECT[f]||0;return{f:f,s:v>=need?"ok":"old",v:v,need:need,t:t}})}).catch(function(){return{f:f,s:"error"}})}
  return Promise.all(Object.keys(EXPECT).map(one).concat([one("data.js"),one("paper.jpg")])).then(function(rs){
    var bad=[],html="";
    rs.forEach(function(r){
      if(r.f==="data.js"){var d=r.t&&parseData(r.t);r.s=r.s==="missing"?"missing":r.s==="error"?"error":d?"fine":"broken"}
      else if(r.f==="paper.jpg"){r.s=r.s==="missing"?"missing":r.s==="error"?"error":"fine"}
      if(r.s==="ok"||r.s==="fine")html+='<li class="okk">✓ '+r.f+(r.s==="ok"?" is up to date":" is in place")+'</li>';
      else if(r.s==="old"){bad.push(r.f);html+='<li class="old">⚠ '+r.f+' is out of date'+(r.v?' (version '+r.v+', newest is '+r.need+')':' (no version stamp)')+'. Upload the newest copy.</li>'}
      else if(r.s==="missing"){bad.push(r.f);html+='<li class="old">⚠ '+r.f+' is missing from your site. Upload it.</li>'}
      else if(r.s==="broken"){bad.push(r.f);html+='<li class="old">⚠ '+r.f+' is damaged. Save and publish again, or re-upload it.</li>'}
      else html+='<li>? '+r.f+": couldn't be checked right now</li>"});
    out.innerHTML=html;
    var u=$("#upd");
    if(bad.length){u.hidden=false;u.textContent="Reminder: "+bad.length+" site file"+(bad.length>1?"s need":" needs")+" uploading to GitHub: "+bad.join(", ")+". Scroll to Site files check for details."}
    else u.hidden=true})}
$("#chk").onclick=checkFiles;
function start(){
  if(started)return;started=true;
  $("#ver").textContent="Site version "+BUILD+" ("+BUILD_DATE+"). What's new: "+WHATS_NEW;
  ghStatus();drawSet();drawProd();ui();
  if(window.fetch)checkFiles();
  freshLive().then(function(){
    if(dirty)return;
    var dd=null;try{dd=JSON.parse(get(KEY)||"null")}catch(e){}
    if(dd&&dd.STORE&&dd.PRODUCTS){
      var cur=JSON.stringify({STORE:dd.STORE,PRODUCTS:dd.PRODUCTS});
      if(cur!==LIVE){
        if(dd.base&&dd.base!==LIVE&&confirm("Your live shop has changed since you last worked here.\n\nOK = start from the live version (recommended)\nCancel = keep your older unpublished changes")){rm(KEY)}
        else{STORE=dd.STORE;PRODUCTS=dd.PRODUCTS;dirty=true}
      }
    }
    drawSet();drawProd();ui()})
}
var ls=document.createElement("script");ls.src="lock.js?t="+Date.now();ls.onload=ls.onerror=gate;document.head.appendChild(ls);
