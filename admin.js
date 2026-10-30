/* cd-version:13 */
var KEY="cd_draft",SESS="cd_ok",TRY="cd_try",TOK="cd_tok",OWN=Object.prototype.hasOwnProperty;
/* Business details (STORE.facts) and the owner's own wording (STORE.copy) are plain objects of trimmed strings
   (at most 4000 characters). Anything else in them is dropped, and a blank value is never stored. */
function isArr(a){return Object.prototype.toString.call(a)==="[object Array]"}
function okKey(k){return typeof k==="string"&&/^[A-Za-z][A-Za-z0-9_]{0,63}$/.test(k)}
function strMap(o){var r={},k,v;if(!o||typeof o!=="object"||isArr(o))return r;
  for(k in o)if(OWN.call(o,k)&&okKey(k)&&(typeof o[k]==="string"||(typeof o[k]==="number"&&isFinite(o[k])))){v=String(o[k]).trim().slice(0,4000);if(v)r[k]=v}
  return r}
function tidy(s){if(s&&typeof s==="object")["facts","copy"].forEach(function(n){if(OWN.call(s,n)){var m=strMap(s[n]);if(Object.keys(m).length)s[n]=m;else delete s[n]}});return s}
tidy(STORE);
var LIVE=JSON.stringify({STORE:STORE,PRODUCTS:PRODUCTS}),dirty=false,started=false,busy=false;
function $(s){return document.querySelector(s)}
function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function get(k){try{return localStorage.getItem(k)}catch(e){return null}}
function put(k,v){try{localStorage.setItem(k,v)}catch(e){}}
function rm(k){try{localStorage.removeItem(k)}catch(e){}}
function sget(k){try{return sessionStorage.getItem(k)}catch(e){return null}}
function sput(k,v){try{sessionStorage.setItem(k,v)}catch(e){}}
function srm(k){try{sessionStorage.removeItem(k)}catch(e){}}
function num(v){var t=String(v).trim().replace(/[^\d.,\-]/g,"");if(/^-?\d{1,3}(,\d{3})+(\.\d+)?$/.test(t))t=t.replace(/,/g,"");else t=t.replace(",",".");var n=parseFloat(t);if(!isFinite(n))return 0;n=Math.round(n*100)/100;return Math.max(-100000,Math.min(100000,n))}
function money(n){n=+n||0;return esc(STORE.currency||"$")+(n%1===0?n:n.toFixed(2))}
function warn(e){try{console.warn("Store Manager:",e)}catch(x){}}
/* ---------- GitHub ---------- */
var GH_DEFAULT={owner:"sankar122234",repo:"cultdrip",branch:"main",path:"data.js"};
function ghRepo(){var h=location.hostname,p=location.pathname.split("/")[1];
  if(/\.github\.io$/.test(h)&&p&&p.indexOf(".")<0)return {owner:h.split(".")[0],repo:p,branch:"main",path:"data.js"};
  return GH_DEFAULT}
function parseData(text){text=String(text);if(text.length>2000000)return null;var m=text.match(/^\s*(?:\/\*[\s\S]*?\*\/\s*)?var STORE\s*=/);var a=text.indexOf('var STORE'),b=text.indexOf(';\nvar PRODUCTS');if(b<0)b=text.search(/;\s*var PRODUCTS\s*=/);if(a<0||b<0)return null;var sTxt=text.slice(a).replace(/^var STORE\s*=\s*/,'').slice(0,b-a-(text.slice(a).match(/^var STORE\s*=\s*/)||[''])[0].length);var rest=text.slice(b).replace(/^;\s*var PRODUCTS\s*=\s*/,'').replace(/;\s*$/,'');try{return{STORE:JSON.parse(sTxt),PRODUCTS:JSON.parse(rest)}}catch(e){return null}}
function tok(){return get(TOK)||sget(TOK)}
function setTok(t){try{localStorage.setItem(TOK,t);srm(TOK)}catch(e){sput(TOK,t)}}
function clearTok(){rm(TOK);srm(TOK)}
function connected(){return !!tok()}
function gh(msg,bad){var e=$("#ghs");e.textContent=msg;e.className=bad?"bad":"good"}
function ghStatus(){var r=ghRepo();
  if(connected()){gh("✓ Token saved. Connected to "+r.owner+"/"+r.repo+".");$("#tok").placeholder="Token saved. Paste a new one here only to change it"}
  else{gh("No token yet. Add one so Save & publish can update your live shop.",true);$("#tok").placeholder="github_pat_..."}}
function api(path,o){o=o||{};var h={Accept:"application/vnd.github+json"};if(tok())h.Authorization="Bearer "+tok();if(o.body)h["Content-Type"]="application/json";
  var go=function(){return fetch("https://api.github.com"+path,{method:o.method||"GET",headers:h,body:o.body,cache:"no-store"})};
  /* a read that fails at network level is retried once; writes are never repeated blindly */
  return (o.method&&o.method!=="GET")?go():go().catch(function(){return new Promise(function(r){setTimeout(r,1200)}).then(go)})}
function b64(s){var u=new TextEncoder().encode(s),bin="";for(var i=0;i<u.length;i+=8192)bin+=String.fromCharCode.apply(null,u.subarray(i,i+8192));return btoa(bin)}
function ghErr(e){
  if(e&&e.status===401)return "GitHub rejected the token. It may have expired, so save a new one.";
  if(e&&(e.status===403||e.status===404))return "The token can't write to this repository. Give it Contents: Read and write for "+ghRepo().repo+".";
  if(e&&e.status)return "GitHub returned error "+e.status+".";
  if(typeof navigator!=="undefined"&&navigator.onLine===false)return "This computer looks offline. Reconnect, then press Save & publish again. Your changes are kept.";
  var m=(e&&e.message)||String(e||"");
  if(e instanceof TypeError||/failed to fetch|networkerror|load failed/i.test(m))return "Could not reach GitHub ("+m+"). Your changes are safe on this computer. Turn off Brave Shields or any ad blocker for this page, then press Save & publish again. To find the cause, empty the token box and press Save token: it runs a connection test.";
  return "Something failed before sending ("+m+"). Your changes are safe on this computer. Please send this message to Claude."}
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
   .then(function(t){var d=parseData(t);if(d&&!dirty){STORE=tidy(d.STORE);PRODUCTS=d.PRODUCTS;LIVE=JSON.stringify({STORE:STORE,PRODUCTS:PRODUCTS})}})
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
  if(typeof ADMIN_LOCK!=="undefined"&&ADMIN_LOCK){if(sget(SESS)==="1")return openApp();$("#g-lock").hidden=false;$("#pw").focus()}
  else $("#g-setup").hidden=false;
}
function openApp(){$("#gate").hidden=true;$("#app").hidden=false;start()}
$("#unlock").onclick=function(){
  var m=$("#gmsg"),t={n:0,until:0};try{t=JSON.parse(get(TRY))||t}catch(e){}
  if(t.until>Date.now()){m.textContent="Too many tries. Wait "+Math.ceil((t.until-Date.now())/60000)+" minute(s).";return}
  if(!(window.crypto&&crypto.subtle)){m.textContent="This browser can't check passcodes here. Open the site over https.";return}
  derive($("#pw").value,ADMIN_LOCK.salt,ADMIN_LOCK.iter).then(function(h){
    if(h===ADMIN_LOCK.hash){put(TRY,"{}");sput(SESS,"1");openApp()}
    else{t.n=(t.n||0)+1;if(t.n>=5){t.until=Date.now()+300000;t.n=0;m.textContent="Too many tries. Locked for 5 minutes."}else m.textContent="Wrong passcode. "+(5-t.n)+((5-t.n)===1?" try left.":" tries left.");put(TRY,JSON.stringify(t));$("#pw").value=""}
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
    else{m.textContent="Downloaded lock.js. Upload it to GitHub to switch the lock on.";setTimeout(openApp,1200)}})};
$("#skip").onclick=function(){if(started){$("#gate").hidden=true;$("#app").hidden=false}else openApp()};
$("#chpw").onclick=function(){$("#app").hidden=true;$("#gate").hidden=false;$("#g-lock").hidden=true;$("#g-setup").hidden=false};
/* ---------- editor ---------- */
/* type: text = one line, line = a short text that may run to a few sentences, area = several lines, num = a number */
var LEGALBOX={returns:1,privacy:1,terms:1};
var SET=[["brand","Brand name","text"],["announce","Top banner message (shown when no drop is on)","text"],["heroTitle","Home headline","text"],["heroText","Home sub-text","line"],["shopTitle","Shop page title","text"],["currency","Currency symbol","text"],["freeShip","Free shipping on orders of this much or more (0 = no free shipping)","num"],["delivery","Delivery info, short version (cart and product pages)","line"],["returns","Returns info, short version (cart and product pages)","line"],["priceNote","Small note shown under prices","text"],["privacy","Privacy policy (shown on the Help page, one paragraph per line)","area"],["terms","Terms of sale (shown on the Help page, one paragraph per line)","area"],["perks","Info lines under the sizes on every product (one per line)","area"],["orderEmail","Order & contact email (orders and messages go here)","text"],["formUrl","Form address for sign-ups and messages (optional; a web address starting with https:// from a form service such as Formspree)","text"],["instagram","Instagram link or @handle","text"],["tiktok","TikTok link or @handle","text"]];
var TYPES=["hoodie","tee","pants","cap"],STAT=[["live","On sale now"],["soon","Coming soon"],["soldout","Sold out"],["hidden","Hidden"]],TAGS=[["","No badge"],["New","New"],["Limited","Limited (only when true)"],["Best seller","Best seller (only when true)"]];
function say(m,ms){var s=$("#status");s.textContent=m;clearTimeout(say.t);say.t=setTimeout(function(){s.textContent=""},ms||3500)}
function ui(){
  $("#state").textContent=dirty?"● Not published yet":(connected()?"✓ Everything is published":"✓ Saved in this browser");
  $("#state").className=dirty?"warn":"";$("#saveb").disabled=busy;$("#saveb").textContent=connected()?"Save & publish":"Save changes";
  $("#hint").textContent=""}
function mark(){dirty=true;ui()}
function writeDraft(){try{localStorage.setItem(KEY,JSON.stringify({STORE:STORE,PRODUCTS:PRODUCTS,base:LIVE}));return true}catch(e){return false}}
function commit(){
  if(!writeDraft()){say("Could not save in this browser",6000);return}
  var bad=PRODUCTS.filter(function(p){return p.status==="live"&&!(+p.price>0)}).map(function(p){return p.name||"New product"});
  if(bad.length){say("NOT published: give these a price above 0, or set Status to Hidden: "+bad.slice(0,3).join(", ")+(bad.length>3?"...":""),15000);return}
  var fresh=PRODUCTS.filter(function(p){return p.status==="live"&&/^new product( copy)?$/i.test(String(p.name||"").trim())}).length;
  if(fresh&&!confirm("You still have "+fresh+" product(s) named \"New product\". Publish anyway?"))return;
  var odd=$$("input[data-fnum]").filter(function(x){var s=x.value.trim();return s&&!/^\d+(?:\.\d+)?$/.test(s)}).map(function(x){var l=x.closest("label");return (l?l.textContent:x.dataset.f).replace(/\s+/g," ").trim().slice(0,48)});
  if(odd.length&&!confirm("These boxes need a plain number, so the site ignores what is typed in them:\n\n"+odd.slice(0,6).join("\n")+"\n\nOK = publish anyway\nCancel = go back and fix them"))return;
  if(!connected()){say("Saved in this browser only. Add your GitHub token above to publish to the live shop.",9000);return}
  /* an old script.js on the live site treats "Coming soon" as on sale */
  var soon=PRODUCTS.filter(function(p){return p.status==="soon"}).length,sv=FILEV["script.js"];
  if(soon&&sv!=null&&sv<13&&!confirm("Your live site still has an old script.js, so pieces set to \"Coming soon\" would show there as on sale.\n\nUpload the new site files first (see Site files check).\n\nOK = publish anyway\nCancel = don't publish yet"))return;
  busy=true;ui();say("Publishing to your live shop…",30000);
  var sent=code();publish().then(function(){if(code()===sent){dirty=false;LIVE=JSON.stringify({STORE:STORE,PRODUCTS:PRODUCTS});writeDraft();say("Published at "+new Date().toLocaleTimeString()+". Your live shop is updating now.",9000)}else say("Published, but you changed something while it was saving. Press Save & publish again to send the newest changes.",12000)})
   .catch(function(e){try{console.error("publish failed",e)}catch(x){}say("NOT published: "+ghErr(e),12000)})
   .then(function(){busy=false;ui()})}
function opts(list,cur){return list.map(function(o){var v=o instanceof Array?o[0]:o,l=o instanceof Array?o[1]:o;return '<option value="'+esc(v)+'"'+(v===cur?' selected':'')+'>'+esc(l)+'</option>'}).join("")}
function nfld(attr,label,v){return '<label>'+label+'<input '+attr+' data-num="1" type="text" inputmode="decimal" value="'+esc(v)+'"></label>'}
function drawSet(){var ok=cdeOk();$("#set").innerHTML=SET.map(function(s){var k=s[0],v=STORE[k]==null?"":STORE[k],id="set-"+k,ck="",ph="",st="",sg="",big=s[2]==="area"||s[2]==="line";
  /* a wording field: the suggested wording shows in grey while the box is empty. An old placeholder the owner never chose shows as empty, because the site no longer uses it. */
  if(ok&&s[2]!=="num")try{ck=flatKey(k);if(ck){sg=suggest(ck,!big);ph=' placeholder="'+esc(sg||EMPTY_PH)+'" data-sug="'+(sg?"1":"")+'"';st=stateRow(id);if(String(v).trim()&&!CDE.isCustom(ck,STORE))v=""}}catch(e){ck="";ph="";st="";warn(e)}
  if(big)return '<div class="wide sbox"><label>'+s[1]+'<textarea id="'+id+'" data-s="'+k+'" rows="'+(ck?Math.max(s[2]==="area"?3:2,rowsFor(v,sg)):(s[2]==="area"?3:2))+'"'+ph+'>'+esc(v)+'</textarea></label>'+st+(LEGALBOX[k]?'<p class="phint">If you write your own, keep the rights for faulty goods (repair, replace or refund) and keep it true to how your shop works. The suggested wording is not legal advice; have it checked.</p>':'')+'</div>';
  if(s[2]==="num")return nfld('id="'+id+'" data-s="'+k+'"',s[1],v);
  var inp='<label>'+s[1]+'<input id="'+id+'" data-s="'+k+'" type="text" value="'+esc(v)+'"'+ph+'></label>';
  return st?'<div class="sbox">'+inp+st+'</div>':inp}).join("")}
function fld(i,k,label,type,v,ph){return '<label>'+label+'<input data-i="'+i+'" data-k="'+k+'" type="'+type+'" value="'+esc(v)+'"'+(ph?' placeholder="'+esc(ph)+'"':'')+'></label>'}
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
  var hint=cdeOk()?'<p class="phint">Boxes left empty use suggested wording shown in grey.</p>':'';
  $("#list").innerHTML=PRODUCTS.map(function(p,i){
    return '<div class="prow"><div class="ptop"><b id="h'+i+'">'+title(p,i)+'</b><span><button data-a="up" data-i="'+i+'">Up</button><button data-a="down" data-i="'+i+'">Down</button><button data-a="dup" data-i="'+i+'">Copy</button><button class="del" data-a="del" data-i="'+i+'">Delete</button></span></div>'+
    '<h4>Basics</h4><div class="fields">'+
    fld(i,"name","Name","text",p.name)+fld(i,"cat","Category","text",p.cat)+sel(i,"type","Drawing shape (shown if no photo)",TYPES,p.type)+
    nfld('data-i="'+i+'" data-k="price"',"Price",p.price)+nfld('data-i="'+i+'" data-k="was"',"Original price (0 = no sale; only a real earlier price)",p.was)+
    sel(i,"status","Status",STAT,p.status)+sel(i,"tag","Badge",TAGS,p.tag)+'</div>'+
    '<h4>Photos</h4>'+photoBlock(p,i)+
    '<h4>Product page</h4>'+hint+'<div class="fields">'+
    fld(i,"tagline","Short tagline under the name","text",p.tagline||"")+fld(i,"modelNote","Model note (e.g. Model is 183cm, wearing M)","text",p.modelNote||"",prodPh(p,"modelNote",true,""))+
    fld(i,"sizes","Sizes, comma separated (blank = none)","text",p.sizes===undefined?(p.type==="cap"?"":"S,M,L,XL"):p.sizes)+fld(i,"soldSizes","Sizes out of stock, comma separated","text",p.soldSizes||"")+
    fld(i,"colorName","Colour name (e.g. Ash Grey)","text",p.colorName||"")+fld(i,"group","Colour group (same word on each colour of one item)","text",p.group||"")+'</div>'+
    '<div class="fields">'+area(i,"desc","Description",p.desc,prodPh(p,"desc",false,"A few sentences about the piece"),4)+area(i,"materials","Materials (one per line)",p.materials,prodPh(p,"materials",false,"80% cotton\n20% polyester"))+
    area(i,"specs","Specifications (one per line)",p.specs,prodPh(p,"specs",false,"Oversized fit\nBrushed fleece inside"))+area(i,"features","Feature tiles, up to 3 (one per line: Title | detail | photo path, photo optional)",p.features,"4-way stretch | Moves with you | images/stretch.jpg")+area(i,"performance","Performance scores out of 5, up to 3 (one per line: Name | score | note)",p.performance,"Stretch | 4 | Cotton elastane\nInsulation | 3.5 | Cotton rich blend")+
    area(i,"sizeGuide","Size guide table (one row per line, columns split by |)",p.sizeGuide,"Size | Chest | Length\nS | 52cm | 68cm\nM | 55cm | 70cm",5)+'</div></div>'}).join("");
  refreshSoon()}
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
  if(t.dataset&&t.dataset.photo){var p=PRODUCTS[+t.dataset.i],im=imgs(p).slice();while(im.length<5)im.push("");im[+t.dataset.n]=t.value.trim();while(im.length&&!im[im.length-1])im.pop();p.images=im.slice(0,5);p.image=p.images.filter(Boolean)[0]||"";mark();return}
  if(t.dataset&&t.dataset.f){mapSet("facts",t.dataset.f,t.value);mark();refreshSoon();return}
  if(t.dataset&&t.dataset.c){mapSet("copy",t.dataset.c,t.value);mark();refreshSoon();return}
  if(!t.dataset||!(t.dataset.s||t.dataset.k))return;
  var v=t.dataset.num?num(t.value):t.value;
  if(t.dataset.s){STORE[t.dataset.s]=v;mark()}
  else{var i=+t.dataset.i;PRODUCTS[i][t.dataset.k]=v;mark();head(i)}
  refreshSoon();
});
document.addEventListener("change",function(e){var t=e.target;if(!t.dataset)return;
  if(t.dataset.num&&(t.dataset.s||t.dataset.k))t.value=num(t.value);
  if(t.dataset.f){
    /* a number box: "240gsm" or "$9.95" becomes the plain number; anything else stays as typed, with a note */
    if(t.dataset.fnum){var m=/^\s*\$?\s*(\d+(?:[.,]\d+)?)\s*(?:g|gsm|grams?|cm|kg|days?)?\s*$/i.exec(t.value);if(m&&m[1].replace(",",".")!==t.value)t.value=m[1].replace(",",".");
      var w=document.getElementById(t.id+"-w");if(w)w.hidden=!t.value.trim()||/^\d+(\.\d+)?$/.test(t.value.trim())}
    if(mapGet("facts",t.dataset.f)!==t.value.trim()){mapSet("facts",t.dataset.f,t.value);mark()}
    refreshSoon()}});
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
$("#sale").onclick=function(){PRODUCTS.forEach(function(p){if(p.status==="soon")return;var base=+p.was>+p.price?+p.was:+p.price;p.was=base;p.price=r2(base*(1-pct()/100))});mark();drawProd();say("Sale applied: press Save & publish")};
$("#unsale").onclick=function(){PRODUCTS.forEach(function(p){if(+p.was>+p.price)p.price=+p.was;p.was=0});mark();drawProd();say("Sales ended: press Save & publish")};
$("#up").onclick=function(){PRODUCTS.forEach(function(p){p.price=r2(p.price*(1+pct()/100));if(p.was)p.was=r2(p.was*(1+pct()/100))});mark();drawProd()};
$("#down").onclick=function(){PRODUCTS.forEach(function(p){p.price=r2(p.price*(1-pct()/100));if(p.was)p.was=r2(p.was*(1-pct()/100))});mark();drawProd()};
/* What gets published: STORE then PRODUCTS, 2-space JSON. STORE keeps its own key order; facts and copy are cleaned and left out when empty. */
function storeOut(){var o={},k;for(k in STORE)if(OWN.call(STORE,k)){if(k==="facts"||k==="copy"){var m=strMap(STORE[k]);if(Object.keys(m).length)o[k]=m}else o[k]=STORE[k]}return o}
function code(){var P=PRODUCTS.map(function(p){var q=Object.assign({},p);if(Array.isArray(q.images))q.images=q.images.filter(Boolean);return q});return "/* Made by the Store Manager. */\nvar STORE = "+JSON.stringify(storeOut(),null,2)+";\nvar PRODUCTS = "+JSON.stringify(P,null,2)+";\n"}
$("#saveb").onclick=commit;
$("#prev").onclick=function(){
  if(!writeDraft()){say("Could not prepare the preview",6000);return}
  var w=window.open("index.html?preview=1","_blank");
  if(!w)say("Your browser blocked the preview tab. Allow pop-ups for this site and try again.",9000)};
$("#dl").onclick=function(){download("data.js",code());say("Backup downloaded.")};
$("#reset").onclick=function(){if(confirm("Throw away unpublished changes and go back to what is live?")){rm(KEY);dirty=false;location.reload()}};
window.addEventListener("beforeunload",function(e){if(dirty){e.preventDefault();e.returnValue=""}});
/* ---------- wording (copy.js + engine.js). Every panel below is built from FACTS and COPY, so new boxes appear by themselves.
   Without those two files the rest of the Store Manager works exactly as before. ---------- */
function cdeOk(){return typeof CDE==="object"&&!!CDE&&typeof CDE.text==="function"&&typeof CDE.suggestedText==="function"&&typeof COPY==="object"&&!!COPY&&typeof FACTS==="object"&&isArr(FACTS)}
var NOCDE='<p class="note nocde">Upload copy.js and engine.js to use this. The Site files check at the bottom shows what is missing.</p>';
var EMPTY_PH="Empty: nothing shows here until you write something";
/* what still matters before launch (spec list). "email" is the order email in Store settings; keys missing from FACTS are skipped. */
var LAUNCH=["legalName","abn","email","postAddress","printPartner","deliveryDays","changeOfMind"];
var KIND_HINT={p:"One paragraph per line.",list:"One item per line.",items:"One item per line.",steps:"One step per line.",creed:"One per line: Title | text",faq:"A line starting with # is a group heading. Then one question per line: Question | Answer",map:"One per line: Category | text",btn:"Label | page, for example: Shop now | shop.html"};
var PF={desc:1,specs:1,materials:1,modelNote:1};
function mapGet(n,k){var m=STORE[n];return m&&typeof m==="object"&&OWN.call(m,k)&&m[k]!=null?String(m[k]):""}
function mapSet(n,k,v){if(!okKey(k))return;v=String(v==null?"":v).trim().slice(0,4000);var m=STORE[n];if(!m||typeof m!=="object"||isArr(m))m=null;
  if(v){if(!m)m=STORE[n]={};m[k]=v}else if(m){delete m[k];if(!Object.keys(m).length)delete STORE[n]}}
function pctx(){try{return CDE.productsCtx(PRODUCTS)||{}}catch(e){return {}}}
function oneLine(t){return String(t||"").replace(/\s*\n+\s*/g," ").trim()}
function plain(t){return String(t||"").replace(/\*\*([^*]+)\*\*/g,"$1").replace(/\[\[[^\]|]*\|([^\]]*)\]\]/g,"$1")}
function suggest(k,one){try{var t=String(CDE.suggestedText(k,STORE,pctx())||"");return one?oneLine(t):t}catch(e){warn(e);return ""}}
function rowsFor(a,b){var t=String(a||"").length>String(b||"").length?String(a||""):String(b||""),n=0;t.split("\n").forEach(function(l){n+=1+Math.floor(l.length/70)});return Math.max(2,Math.min(14,n))}
function andList(a){return a.length<2?a.join(""):a.slice(0,-1).join(", ")+" and "+a[a.length-1]}
function groupsOf(){return FACTS.filter(function(g){return g&&typeof g==="object"&&isArr(g.items)})}
function itemsOf(g){return g.items.filter(function(f){return f&&typeof f==="object"&&okKey(f.k)})}
function factDef(k){var r=null;groupsOf().forEach(function(g){itemsOf(g).forEach(function(f){if(!r&&f.k===k)r=f})});return r}
function setLabel(k){var r="";SET.forEach(function(s){if(s[0]===k)r=s[1]});return r}
function labelOf(k){var f=factDef(k);if(f)return "“"+(f.l||k)+"”";var s=setLabel(k);return s?"“"+s+"” in Store settings":k}
function flatKey(s){var r="";if(cdeOk())Object.keys(COPY).forEach(function(k){var d=COPY[k];if(!r&&okKey(k)&&d&&typeof d==="object"&&d.flat===s)r=k});return r}
function wordKey(el){if(!cdeOk()||!el.dataset)return "";if(el.dataset.c)return OWN.call(COPY,el.dataset.c)?el.dataset.c:"";if(el.dataset.s)return flatKey(el.dataset.s);return ""}
function openSet(el){var o={};$$("details[open]",el).forEach(function(d){o[d.getAttribute("data-gid")]=1});return o}
/* "Used on: Home (Top banner, ...); Help page (FAQ)" */
function usedText(k){var u=[],gs=[],by={};try{if(typeof CDE.usedOn==="function")u=CDE.usedOn(k)||[]}catch(e){warn(e)}
  u.forEach(function(x){if(!x)return;var g=String(x.group||"Other"),l=String(x.label||x.key||"");if(!OWN.call(by,"g:"+g)){by["g:"+g]=[];gs.push(g)}if(l&&by["g:"+g].indexOf(l)<0)by["g:"+g].push(l)});
  if(!gs.length)return "Not shown on the site yet.";
  return "Used on: "+gs.map(function(g){var l=by["g:"+g];return g+(l.length?" ("+l.join(", ")+")":"")}).join("; ")}
/* one business-detail box, built from its FACTS entry */
function factBox(f,inDrop){
  var k=f.k,id="f-"+k,v=mapGet("facts",k),by=[],x="",ctl,a;
  if(f.h){x+='<span class="fh" id="'+id+'-h">'+esc(f.h)+'</span>';by.push(id+"-h")}
  if(f.ph){x+='<span class="ex" id="'+id+'-x">Example: '+esc(f.ph)+'</span>';by.push(id+"-x")}
  if(f.t==="num"){x+='<span class="fwarn" id="'+id+'-w"'+(!v||/^\d+(\.\d+)?$/.test(v)?' hidden':'')+'>Use a number only'+(f.ph?', for example '+esc(f.ph):'')+'.</span>';by.push(id+"-w")}
  if(!inDrop){x+='<span class="used" id="'+id+'-u">'+esc(usedText(k))+'</span>';by.push(id+"-u")}
  a=' id="'+id+'" data-f="'+k+'"'+(by.length?' aria-describedby="'+by.join(" ")+'"':'');
  if(f.t==="select"){
    var o=(isArr(f.o)?f.o:[]).map(function(y){return isArr(y)?[String(y[0]==null?"":y[0]),String(y[1]==null?y[0]:y[1])]:[String(y),String(y)]}),has=false,blank=false;
    o.forEach(function(y){if(y[0]===v)has=true;if(y[0]==="")blank=true});
    if(!blank)o=[["","Not set"]].concat(o);if(v&&!has)o=o.concat([[v,v+" (saved earlier)"]]);
    ctl='<select'+a+'>'+opts(o,v)+'</select>'}
  else if(f.t==="area")ctl='<textarea'+a+' rows="3" maxlength="4000">'+esc(v)+'</textarea>';
  else ctl='<input'+a+' type="text" maxlength="4000"'+(f.t==="num"?' inputmode="decimal" data-fnum="1"':'')+' value="'+esc(v)+'">';
  return '<div class="fbox'+(v?' filled':'')+'" data-fk="'+k+'"><label for="'+id+'">'+esc(f.l||k)+(inDrop?' <span class="needtag" hidden>Needed now</span>':'')+'</label>'+ctl+x+'</div>'}
/* ----- Current drop ----- */
function drawDrop(){var el=$("#drop");if(!el)return;if(!cdeOk()){el.innerHTML=NOCDE;return}
  var g=groupsOf().filter(function(x){return x.id==="drop"})[0];
  if(!g){el.innerHTML='<p class="note">This copy.js has no drop details yet.</p>';return}
  el.innerHTML=(g.h?'<p class="fh">'+esc(g.h)+'</p>':'')+'<div class="fields ffields">'+itemsOf(g).map(function(f){return factBox(f,true)}).join("")+'</div><p class="dwarn" id="dwarn" role="status"></p><div class="dropnow" id="dropnow"></div>';
  dropNow()}
function where(h){h=String(h||"");var m=/^([a-z]+)\.html/i.exec(h),i=h.indexOf("#"),hash=i>=0?h.slice(i+1):"",P={index:"the home page",shop:"the shop page",about:"the About page",contact:"the Contact page",help:"the Help page",product:"a product page"},pg=m?(OWN.call(P,m[1].toLowerCase())?P[m[1].toLowerCase()]:m[1]+".html"):"";
  if(hash==="join")return "the Join the Cult form"+(pg&&m[1].toLowerCase()!=="index"?" on "+pg:"");
  if(hash)return "the “"+hash+"” part of "+(pg||"the home page");
  return pg||h}
/* what the home page shows with the details as they are in this window: banner, small line above the headline, button */
function dropNow(){var box=$("#dropnow");if(!box||!cdeOk())return;var X=pctx(),rows=[],has=function(k){return OWN.call(COPY,k)},ban="",isDrop=false;
  try{ban=has("bannerDrop")?CDE.text("bannerDrop",STORE,X):"";isDrop=!!ban;if(!ban&&has("announce"))ban=CDE.text("announce",STORE,X)}catch(e){warn(e)}
  rows.push(["Top banner",ban?plain(ban)+(isDrop?" (drop banner)":""):"No banner"]);
  if(has("eyebrow"))try{rows.push(["Small line above the headline",plain(CDE.text("eyebrow",STORE,X))||"Nothing"])}catch(e){warn(e)}
  if(has("heroButton")&&typeof CDE.btn==="function")try{var b=CDE.btn("heroButton",STORE,X);rows.push(["Button",b&&b.label?"“"+plain(b.label)+"”"+(b.href?", goes to "+where(b.href):""):"No button"])}catch(e){warn(e)}
  box.innerHTML='<b>What your home page will show</b><dl>'+rows.map(function(r){return '<dt>'+esc(r[0])+'</dt><dd>'+esc(r[1])+'</dd>'}).join("")+'</dl><span class="fh">This updates as you type. Press Save &amp; publish to put it live.</span>';
  dropWarn()}
/* every {token} outside the optional {?...|...} parts of a line */
function topTokens(s){var out=[],i=0,n=s.length;while(i<n){if(s.charAt(i)!=="{"){i++;continue}var d=1,j=i+1;while(j<n&&d>0){var ch=s.charAt(j);if(ch==="{")d++;else if(ch==="}")d--;j++}if(d!==0)break;var t=s.substring(i+1,j-1);if(t.charAt(0)!=="?"){t=t.trim();if(okKey(t)&&out.indexOf(t)<0)out.push(t)}i=j}return out}
/* Read the drop banner's own conditions in copy.js: for the mode that is chosen, which details are still blank. */
function dropNeeds(){var d=COPY.bannerDrop;if(!d||typeof CDE.test!=="function")return null;var c=CDE.ctx(STORE,pctx()),best=null,chosen=false;
  (isArr(d.t)?d.t.join("\n"):String(d.t||"")).split(/\r?\n/).forEach(function(raw){var m=/^@if\s+(\S+)\s+([\s\S]*)$/.exec(raw.trim());if(!m)return;
    m[1].split(",").forEach(function(alt){var eq=0,ok=true,miss=[];
      alt.split("&").forEach(function(term){var x=/^(!?)([A-Za-z][A-Za-z0-9_]*)(?:(!?=)(.*))?$/.exec(term);if(!x){ok=false;return}
        if(x[3]==="="&&!x[1]){eq++;if(!CDE.test(term,c))ok=false}
        else if(x[1]||x[3]){if(!CDE.test(term,c))ok=false}
        else if(!c[x[2]])miss.push(x[2])});
      if(!eq||!ok)return;chosen=true;
      topTokens(m[2]).forEach(function(k){if(!c[k]&&miss.indexOf(k)<0)miss.push(k)});
      if(!best||miss.length<best.length)best=miss})});
  return {chosen:chosen,missing:best||[]}}
function dropWarn(){var w=$("#dwarn");if(!w)return;var r=null,ban="x",msg="";
  try{r=dropNeeds();if(OWN.call(COPY,"bannerDrop"))ban=CDE.text("bannerDrop",STORE,pctx())}catch(e){warn(e);r=null}
  var on=!!(r&&r.chosen&&!ban),need=on?r.missing:[];
  $$("#drop .fbox").forEach(function(b){var t=b.querySelector(".needtag"),n=need.indexOf(b.getAttribute("data-fk"))>=0;b.classList.toggle("need",n);if(t)t.hidden=!n});
  if(on)msg=need.length?"Add "+andList(need.map(labelOf))+", or the top banner stays as normal.":"Fill in the drop details, or the top banner stays as normal.";
  if(w.textContent!==msg)w.textContent=msg}
/* ----- Business details ----- */
function drawFacts(){var el=$("#facts");if(!el)return;if(!cdeOk()){el.innerHTML=NOCDE;return}
  var gs=groupsOf().filter(function(g){return g.id!=="drop"}),open=openSet(el),only=!!($("#fonly")&&$("#fonly").checked);
  el.innerHTML='<div class="ftop"><div class="prog"><b id="fcount"></b><span class="pbar" aria-hidden="true"><i id="fbar"></i></span></div><label class="chk"><input type="checkbox" id="fonly"> Show only empty ones</label></div>'+
   '<p class="fmiss" id="fmiss"></p><p class="note" id="fall" hidden>Everything here is filled in.</p>'+
   gs.map(function(g,i){return '<details class="fgroup" data-gid="g'+i+'"'+(open["g"+i]?' open':'')+'><summary><span>'+esc(g.g||g.id||"More details")+'</span><span class="chip" data-gc="'+i+'"></span></summary><div>'+(g.h?'<p class="fh">'+esc(g.h)+'</p>':'')+'<div class="fields ffields">'+itemsOf(g).map(function(f){return factBox(f,false)}).join("")+'</div></div></details>'}).join("");
  $("#fonly").checked=only;$("#fonly").onchange=function(){onlyEmpty(true)};onlyEmpty(false);factsProgress()}
function launchMissing(){var out=[];LAUNCH.forEach(function(k){
  if(k==="email"){var e="";try{e=CDE.emailOf(STORE)}catch(x){}if(!e)out.push({id:"set-orderEmail",l:"Order & contact email (in Store settings)"});return}
  var f=factDef(k);if(f&&!mapGet("facts",k))out.push({id:"f-"+k,l:String(f.l||k)})});return out}
function factsProgress(){var c=$("#fcount");if(!c||!cdeOk())return;var gs=groupsOf().filter(function(g){return g.id!=="drop"}),n=0,m=0;
  gs.forEach(function(g,i){var a=0,b=0;itemsOf(g).forEach(function(f){b++;if(mapGet("facts",f.k))a++});n+=a;m+=b;var s=document.querySelector('#facts [data-gc="'+i+'"]');if(s)s.textContent=a+" of "+b});
  c.textContent=n+" of "+m+" filled in";var bar=$("#fbar");if(bar)bar.style.width=(m?Math.round(n/m*100):0)+"%";
  var miss=launchMissing(),fm=$("#fmiss"),sig=JSON.stringify(miss);
  if(fm&&fm.getAttribute("data-sig")!==sig){fm.setAttribute("data-sig",sig);fm.innerHTML=miss.length?'<b>Still missing before launch:</b> '+miss.map(function(x){return '<button type="button" class="lnk" data-jump="'+esc(x.id)+'">'+esc(x.l)+'</button>'}).join(", "):'<b>Everything needed for launch is filled in.</b>'}}
/* "Show only empty ones" hides filled boxes when it is switched on, never while someone is typing */
function onlyEmpty(openThem){var box=$("#facts"),cb=$("#fonly");if(!box||!cb)return;var on=cb.checked,any=false;
  $$(".fbox",box).forEach(function(b){var f=!!mapGet("facts",b.getAttribute("data-fk"));b.classList.toggle("filled",f);if(!f)any=true});
  $$(".fgroup",box).forEach(function(g){var e=!!g.querySelector(".fbox:not(.filled)");g.classList.toggle("full",!e);if(on&&openThem&&e)g.open=true});
  box.classList.toggle("onlyempty",on);var fa=$("#fall");if(fa)fa.hidden=!(on&&!any)}
/* ----- Page words ----- */
function stateRow(id){return '<div class="wstate"><span class="tag" id="'+id+'-tag"></span><button type="button" class="wbtn" data-w="start" data-for="'+id+'" hidden>Start from the suggested wording</button><button type="button" class="wbtn" data-w="clear" data-for="'+id+'" hidden>Go back to suggested wording</button><span class="wnote"></span></div>'}
function wordBox(k){var d=COPY[k],id="c-"+k,v=mapGet("copy",k),sg=suggest(k,false),hint=[d.h,OWN.call(KIND_HINT,d.k)?KIND_HINT[d.k]:""].filter(function(x){return x}).map(String).join(" ");
  return '<div class="wbox" data-ck="'+k+'"><label for="'+id+'">'+esc(d.l||k)+'</label>'+(hint?'<span class="fh" id="'+id+'-h">'+esc(hint)+'</span>':'')+
   '<textarea id="'+id+'" data-c="'+k+'" rows="'+rowsFor(v,sg)+'" maxlength="4000" aria-describedby="'+(hint?id+'-h ':'')+id+'-tag" placeholder="'+esc(sg||EMPTY_PH)+'" data-sug="'+(sg?"1":"")+'">'+esc(v)+'</textarea>'+stateRow(id)+'</div>'}
function drawWords(){var el=$("#words");if(!el)return;if(!cdeOk()){el.innerHTML=NOCDE;return}
  var groups=[],by={},open=openSet(el);
  Object.keys(COPY).forEach(function(k){var d=COPY[k];if(!okKey(k)||!d||typeof d!=="object"||!d.edit||d.flat)return;var g=String(d.g||"More");if(!OWN.call(by,"g:"+g)){by["g:"+g]=[];groups.push(g)}by["g:"+g].push(k)});
  if(!groups.length){el.innerHTML='<p class="note">There are no page words to change in this version of copy.js.</p>';return}
  el.innerHTML=groups.map(function(g,i){return '<details class="fgroup" data-gid="w'+i+'"'+(open["w"+i]?' open':'')+'><summary><span>'+esc(g)+'</span><span class="chip" data-wc="'+i+'"></span></summary><div>'+by["g:"+g].map(wordBox).join("")+'</div></details>'}).join("")}
/* the tag and buttons under a wording box (Page words and the wording fields in Store settings) */
function boxState(el){var key=wordKey(el),tag=document.getElementById(el.id+"-tag");if(!key||!tag)return;
  var st=tag.parentNode,bs=st.querySelector('[data-w="start"]'),bc=st.querySelector('[data-w="clear"]'),nt=st.querySelector(".wnote"),val=String(el.value||"").trim(),cu=false,has=el.getAttribute("data-sug")==="1",n="",t,cls;
  try{cu=CDE.isCustom(key,STORE)}catch(e){}
  if(val&&cu){t="Using your wording";cls="tag yours"}
  else if(val){t="Using suggested wording";cls="tag";n="This is the old wording, so the site ignores it and uses the suggested wording. Change it to use your own words."}
  else if(has){t="Using suggested wording";cls="tag";if(el.dataset.s&&String(STORE[el.dataset.s]==null?"":STORE[el.dataset.s]).trim()&&!cu)n="The old wording that was here is replaced by the suggested wording shown in grey."}
  else{t="Nothing shows here until you write something";cls="tag none"}
  if(tag.textContent!==t)tag.textContent=t;if(tag.className!==cls)tag.className=cls;
  if(bs)bs.hidden=!!val||!has;if(bc)bc.hidden=!val;if(nt&&nt.textContent!==n)nt.textContent=n}
function prodPh(p,f,one,fb){if(!cdeOk()||typeof CDE.productField!=="function")return fb||"";
  try{var q={},k;for(k in p)if(OWN.call(p,k))q[k]=p[k];q[f]="";var r=CDE.productField(f,q,STORE,pctx()),t=r&&r.src==="suggested"?String(r.text||"").trim():"";
    if(f==="modelNote"&&t&&!imgs(p).length)return "Empty: not shown until the product has a photo";
    return t?(one?oneLine(t):t):"Empty: not shown on the product page"}catch(e){warn(e);return fb||""}}
/* After any change: the drop preview, the counts, and every grey suggested wording, worked out again from the current details. */
function refreshHints(){if(!cdeOk())return;
  try{dropNow()}catch(e){warn(e)}
  try{factsProgress()}catch(e){warn(e)}
  $$("[data-c],#set [data-s]").forEach(function(el){try{var k=wordKey(el);if(!k)return;var sg=suggest(k,el.tagName==="INPUT"),ph=sg||EMPTY_PH;el.setAttribute("data-sug",sg?"1":"");if(el.placeholder!==ph)el.placeholder=ph;boxState(el)}catch(e){warn(e)}});
  $$("#words details.fgroup").forEach(function(d){var n=0,t=0;$$("[data-c]",d).forEach(function(el){t++;try{if(CDE.isCustom(el.dataset.c,STORE))n++}catch(e){}});var c=d.querySelector("[data-wc]");if(c)c.textContent=n?n+" of "+t+" in your words":t+(t>1?" boxes":" box")});
  $$("#list [data-k]").forEach(function(el){var f=el.dataset.k,p=PRODUCTS[+el.dataset.i];if(!OWN.call(PF,f)||!p)return;var ph=prodPh(p,f,el.tagName==="INPUT",el.placeholder);if(el.placeholder!==ph)el.placeholder=ph})}
function refreshSoon(){if(!cdeOk())return;clearTimeout(refreshSoon.t);refreshSoon.t=setTimeout(function(){try{refreshHints()}catch(e){warn(e)}},250)}
function setBox(el,t){el.value=t;if(el.dataset.c)mapSet("copy",el.dataset.c,t);else if(el.dataset.s)STORE[el.dataset.s]=t;mark();boxState(el);refreshSoon()}
function jump(id){var t=document.getElementById(id);if(!t)return;var d=t.parentNode;while(d&&d!==document){if(d.tagName==="DETAILS")d.open=true;d=d.parentNode}
  try{t.scrollIntoView({block:"center"})}catch(x){t.scrollIntoView()}try{t.focus({preventScroll:true})}catch(x){t.focus()}}
document.addEventListener("click",function(e){var b=e.target&&e.target.closest?e.target.closest("[data-w],[data-jump]"):null;if(!b)return;
  if(b.hasAttribute("data-jump")){jump(b.getAttribute("data-jump"));return}
  var el=document.getElementById(b.getAttribute("data-for")),key=el?wordKey(el):"";if(!key)return;
  if(b.getAttribute("data-w")==="start"){var t=suggest(key,el.tagName==="INPUT");if(!t){say("There is no suggested wording for this box yet.",5000);return}
    setBox(el,t);if(el.tagName==="TEXTAREA")el.rows=Math.max(el.rows,rowsFor(t,""));try{el.focus();el.setSelectionRange(0,0);el.scrollTop=0}catch(x){}say("Suggested wording copied into the box. Change it as you like.",6000)}
  else{if(String(el.value).trim()&&!confirm("Remove your wording from this box and use the suggested wording instead?"))return;setBox(el,"");try{el.focus()}catch(x){}}});
function drawNew(){[["#drop",drawDrop],["#facts",drawFacts],["#words",drawWords]].forEach(function(x){try{x[1]()}catch(e){warn(e);var el=$(x[0]);if(el)el.innerHTML='<p class="note">This part could not load ('+esc((e&&e.message)||e)+'). Everything else still works. Please send this message to Claude.</p>'}})}
function drawAll(){drawSet();drawProd();drawNew();try{refreshHints()}catch(e){warn(e)}}
/* ---------- token ---------- */
function diagnose(){
  var r=ghRepo(),out=[],bad=false;gh("Testing the connection…");
  function step(n,ok,m){if(!ok)bad=true;out.push((ok?"✓ ":"✗ ")+n+(m?" ("+m+")":""))}
  function stop(){throw "stop"}
  fetch("https://api.github.com/zen",{cache:"no-store"}).then(function(x){step("Reach GitHub",true)},function(e){step("Reach GitHub",false,(e&&e.message)||"blocked by the browser, network or an ad blocker");stop()})
  .then(function(){return api("/repos/"+r.owner+"/"+r.repo)})
  .then(function(res){if(res.status===401){step("Token",false,"rejected or expired, save a new one");stop()}
    if(!res.ok){step("Repository "+r.owner+"/"+r.repo,false,"error "+res.status+", is the token allowed to use this repository?");stop()}
    step("Token and repository",true);return res.json()})
  .then(function(j){var can=j&&j.permissions?j.permissions.push:undefined;step("Permission to write",can!==false,can===false?"token is read-only, give it Contents: Read and write":"");
    return api("/repos/"+r.owner+"/"+r.repo+"/contents/"+r.path+"?ref="+r.branch)})
  .then(function(res){step("Find "+r.path+" on branch "+r.branch,res.ok,res.ok?"":"error "+res.status)})
  .catch(function(e){if(e!=="stop")step("Unexpected problem",false,(e&&e.message)||String(e))})
  .then(function(){gh(out.join("  "),bad)})}

$("#ghc").onclick=function(){
  var t=$("#tok").value.trim(),r=ghRepo();
  if(!t&&connected()){diagnose();return}
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
var BUILD=13,BUILD_DATE="30 Oct 2026",WHATS_NEW="New wording across the site, worked out from your business details. New in the Store Manager: Current drop, Business details and Page words, plus a Coming soon status for products. Two new files, copy.js and engine.js, must be uploaded with the others.";
var EXPECT={"index.html":13,"shop.html":13,"product.html":13,"about.html":13,"contact.html":13,"404.html":13,"help.html":13,"admin.html":13,"style.css":13,"script.js":13,"admin.js":13,"copy.js":13,"engine.js":13};
var FILEV={};
function checkFiles(){
  var out=$("#chkout");out.innerHTML="<li>Checking…</li>";
  if(!window.fetch){out.innerHTML="<li>This browser can't run the check.</li>";return Promise.resolve()}
  function one(f){return fetch(f+"?t="+Date.now(),{cache:"no-store"}).then(function(r){
    if(!r.ok)return{f:f,s:"missing"};
    return r.text().then(function(t){var m=t.match(/cd-version:(\d+)/),v=m?+m[1]:0,need=EXPECT[f]||0;return{f:f,s:v>=need?"ok":"old",v:v,need:need,t:t}})}).catch(function(){return{f:f,s:"error"}})}
  return Promise.all(Object.keys(EXPECT).map(one).concat([one("data.js"),one("paper.jpg")])).then(function(rs){
    var bad=[],html="";
    rs.forEach(function(r){
      if(OWN.call(EXPECT,r.f))FILEV[r.f]=r.s==="missing"?0:(r.s==="ok"||r.s==="old")?(r.v||0):null;
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
  ghStatus();drawAll();ui();
  if(window.fetch)checkFiles();
  freshLive().then(function(){
    if(dirty)return;
    var dd=null;try{dd=JSON.parse(get(KEY)||"null")}catch(e){}
    if(dd&&dd.STORE&&dd.PRODUCTS){
      tidy(dd.STORE);var cur=JSON.stringify({STORE:dd.STORE,PRODUCTS:dd.PRODUCTS});
      if(cur!==LIVE){
        if(dd.base&&dd.base!==LIVE&&confirm("Your live shop has changed since you last worked here.\n\nOK = start from the live version (recommended)\nCancel = keep your older unpublished changes")){rm(KEY)}
        else{STORE=dd.STORE;PRODUCTS=dd.PRODUCTS;dirty=true}
      }
    }
    drawAll();ui()})
}
var ls=document.createElement("script");ls.src="lock.js?t="+Date.now();ls.onload=ls.onerror=gate;document.head.appendChild(ls);
