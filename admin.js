var KEY="cd_draft",SESS="cd_ok",TRY="cd_try",TOK="cd_tok",AUTO="cd_auto";
var LIVE=JSON.stringify({STORE:STORE,PRODUCTS:PRODUCTS}),dirty=false,started=false,busy=false;
function $(s){return document.querySelector(s)}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function get(k){try{return localStorage.getItem(k)}catch(e){return null}}
function put(k,v){try{localStorage.setItem(k,v)}catch(e){}}
function rm(k){try{localStorage.removeItem(k)}catch(e){}}
function sget(k){try{return sessionStorage.getItem(k)}catch(e){return null}}
function sput(k,v){try{sessionStorage.setItem(k,v)}catch(e){}}
function srm(k){try{sessionStorage.removeItem(k)}catch(e){}}
/* ---------- GitHub ---------- */
var GH_DEFAULT={owner:"sankar122234",repo:"cultdrip",branch:"main",path:"data.js"};
function ghRepo(){var h=location.hostname,p=location.pathname.split("/")[1];
  if(/\.github\.io$/.test(h)&&p&&p.indexOf(".")<0)return {owner:h.split(".")[0],repo:p,branch:"main",path:"data.js"};
  return GH_DEFAULT}
function parseData(text){var m=String(text).match(/var STORE\s*=\s*([\s\S]*?);\s*var PRODUCTS\s*=\s*([\s\S]*?);\s*$/);if(!m)return null;try{return{STORE:JSON.parse(m[1]),PRODUCTS:JSON.parse(m[2])}}catch(e){return null}}
function tok(){return sget(TOK)||get(TOK)}
function connected(){return !!tok()}
function autoOn(){var c=$("#auto");return !!(c&&c.checked)}
function gh(msg,bad){var e=$("#ghs");e.textContent=msg;e.className=bad?"bad":""}
function api(path,o){o=o||{};var h={Accept:"application/vnd.github+json"};if(tok())h.Authorization="Bearer "+tok();if(o.body)h["Content-Type"]="application/json";
  return fetch("https://api.github.com"+path,{method:o.method||"GET",headers:h,body:o.body,cache:"no-store"})}
function b64(s){return btoa(unescape(encodeURIComponent(s)))}
function ghErr(e){
  if(e&&e.status===401)return "GitHub rejected the token. It may have expired, so reconnect with a new one.";
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
    sput(SESS,"1");m.textContent="Downloaded lock.js. Upload it to GitHub to switch the lock on.";
    if(started){say("lock.js downloaded: upload it to GitHub")}else setTimeout(open,1200)})};
$("#skip").onclick=open;
$("#chpw").onclick=function(){$("#app").hidden=true;$("#gate").hidden=false;$("#g-lock").hidden=true;$("#g-setup").hidden=false};
/* ---------- editor ---------- */
var SET=[["brand","Brand name","text"],["announce","Top banner message","text"],["heroTitle","Home headline","text"],["heroText","Home sub-text","text"],["shopTitle","Shop page title","text"],["currency","Currency symbol","text"],["freeShip","Free shipping over","number"],["delivery","Delivery info (product page)","text"],["returns","Returns info (product page)","text"]];
var TYPES=["hoodie","tee","pants","cap"],STAT=[["live","On sale now"],["soldout","Sold out"],["hidden","Hidden"]],TAGS=[["","No badge"],["New","New"],["Limited","Limited"],["Best seller","Best seller"]];
function say(m,ms){var s=$("#status");s.textContent=m;clearTimeout(say.t);say.t=setTimeout(function(){s.textContent=""},ms||3500)}
function ui(){
  $("#state").textContent=dirty?"● Unsaved changes":"✓ All changes saved";$("#state").className=dirty?"warn":"";
  $("#saveb").disabled=!dirty||busy;$("#saveb").textContent=(connected()&&autoOn())?"Save & publish":"Save changes";
  $("#hint").textContent=dirty?"Press Save to unlock Preview and Download":"";
  ["prevh","prev","dl","copy"].forEach(function(i){$("#"+i).disabled=dirty})}
function mark(){dirty=true;ui()}
function persist(){try{localStorage.setItem(KEY,JSON.stringify({STORE:STORE,PRODUCTS:PRODUCTS,base:LIVE}));dirty=false;ui();return true}catch(e){say("Could not save in this browser");return false}}
function commit(){
  if(!persist())return;
  if(!(connected()&&autoOn())){say("Saved in this browser. "+(connected()?"":"Connect GitHub to publish automatically, or download data.js."),6000);return}
  busy=true;ui();say("Saved. Publishing to your live shop…",20000);
  publish().then(function(){LIVE=JSON.stringify({STORE:STORE,PRODUCTS:PRODUCTS});persist();say("Published at "+new Date().toLocaleTimeString()+". Your live shop is updating now.",9000)})
   .catch(function(e){say("Saved here, but NOT published: "+ghErr(e),12000)})
   .then(function(){busy=false;ui()})}
function opts(list,cur){return list.map(function(o){var v=o instanceof Array?o[0]:o,l=o instanceof Array?o[1]:o;return '<option value="'+esc(v)+'"'+(v===cur?' selected':'')+'>'+esc(l)+'</option>'}).join("")}
function drawSet(){$("#set").innerHTML=SET.map(function(s){return '<label>'+s[1]+'<input data-s="'+s[0]+'" type="'+s[2]+'" value="'+esc(STORE[s[0]]==null?"":STORE[s[0]])+'"></label>'}).join("")}
function fld(i,k,label,type,v,extra){return '<label>'+label+'<input data-i="'+i+'" data-k="'+k+'" type="'+type+'" value="'+esc(v)+'" '+(extra||'')+'></label>'}
function sel(i,k,label,list,cur){return '<label>'+label+'<select data-i="'+i+'" data-k="'+k+'">'+opts(list,cur)+'</select></label>'}
function drawProd(){
  $("#list").innerHTML=PRODUCTS.map(function(p,i){
    return '<div class="prow"><div class="ptop"><b>'+(i+1)+'. '+esc(p.name||"New product")+'</b><span><button data-a="up" data-i="'+i+'">Up</button><button data-a="down" data-i="'+i+'">Down</button><button data-a="dup" data-i="'+i+'">Copy</button><button class="del" data-a="del" data-i="'+i+'">Delete</button></span></div><div class="fields">'+
    fld(i,"name","Name","text",p.name)+fld(i,"cat","Category","text",p.cat)+sel(i,"type","Drawing shape",TYPES,p.type)+
    fld(i,"price","Price","number",p.price,'step="0.01" min="0"')+fld(i,"was","Original price (0 = no sale)","number",p.was,'step="0.01" min="0"')+
    fld(i,"color","Color","color",p.color)+sel(i,"status","Status",STAT,p.status)+sel(i,"tag","Badge",TAGS,p.tag)+fld(i,"image","Photo path (optional)","text",p.image)+fld(i,"sizes","Sizes, comma separated (blank = none)","text",p.sizes===undefined?"S,M,L,XL":p.sizes)+fld(i,"desc","Description","text",p.desc||"")+'</div></div>'}).join("")}
document.addEventListener("input",function(e){
  var t=e.target;
  if(t.dataset.s){STORE[t.dataset.s]=t.type==="number"?(parseFloat(t.value)||0):t.value;mark()}
  else if(t.dataset.k){PRODUCTS[+t.dataset.i][t.dataset.k]=t.type==="number"?(parseFloat(t.value)||0):t.value;mark()}
});
$("#list").addEventListener("click",function(e){
  var b=e.target.closest("button");if(!b)return;var i=+b.dataset.i,a=b.dataset.a;
  if(a==="del"){if(!confirm("Delete this product?"))return;PRODUCTS.splice(i,1)}
  if(a==="dup"){var c=JSON.parse(JSON.stringify(PRODUCTS[i]));c.id=nextId();c.name+=" copy";PRODUCTS.splice(i+1,0,c)}
  if(a==="up"&&i>0){PRODUCTS.splice(i-1,0,PRODUCTS.splice(i,1)[0])}
  if(a==="down"&&i<PRODUCTS.length-1){PRODUCTS.splice(i+1,0,PRODUCTS.splice(i,1)[0])}
  mark();drawProd();
});
function nextId(){return PRODUCTS.reduce(function(m,p){return Math.max(m,p.id)},0)+1}
function pct(){return Math.min(90,Math.max(1,parseFloat($("#pct").value)||0))}
function r2(n){return Math.round(n*100)/100}
$("#add").onclick=function(){PRODUCTS.unshift({id:nextId(),name:"New product",type:"tee",cat:"Tees",price:50,was:0,color:"#227d47",image:"",status:"live",tag:"New",sizes:"S,M,L,XL",desc:""});mark();drawProd();window.scrollTo(0,$("#list").offsetTop-80)};
$("#sale").onclick=function(){PRODUCTS.forEach(function(p){var base=+p.was>+p.price?+p.was:+p.price;p.was=base;p.price=r2(base*(1-pct()/100))});mark();drawProd();say("Sale applied: press Save")};
$("#unsale").onclick=function(){PRODUCTS.forEach(function(p){if(+p.was>+p.price)p.price=+p.was;p.was=0});mark();drawProd();say("Sales ended: press Save")};
$("#up").onclick=function(){PRODUCTS.forEach(function(p){p.price=r2(p.price*(1+pct()/100));if(p.was)p.was=r2(p.was*(1+pct()/100))});mark();drawProd()};
$("#down").onclick=function(){PRODUCTS.forEach(function(p){p.price=r2(p.price*(1-pct()/100));if(p.was)p.was=r2(p.was*(1-pct()/100))});mark();drawProd()};
function code(){return "/* Made by the Store Manager. */\nvar STORE = "+JSON.stringify(STORE,null,2)+";\nvar PRODUCTS = "+JSON.stringify(PRODUCTS,null,2)+";\n"}
$("#saveb").onclick=commit;
$("#prev").onclick=function(){if(!dirty)window.open("shop.html?preview=1","_blank")};
$("#prevh").onclick=function(){if(!dirty)window.open("index.html?preview=1","_blank")};
$("#dl").onclick=function(){if(dirty)return;download("data.js",code());say("Downloaded. Upload data.js to GitHub to publish by hand.")};
$("#copy").onclick=function(){if(dirty)return;try{navigator.clipboard.writeText(code()).then(function(){say("Code copied")})}catch(e){say("Copy not available")}};
$("#imp").onclick=function(){$("#file").click()};
$("#file").onchange=function(){
  var f=this.files[0];if(!f)return;var r=new FileReader();
  r.onload=function(){try{
    var d=parseData(r.result);if(!d)throw 0;
    if(!confirm("Replace what you see with this file's data?"))return;
    STORE=d.STORE;PRODUCTS=d.PRODUCTS;drawSet();drawProd();mark();say("Loaded. Press Save to keep it.")
  }catch(e){say("That file isn't a data.js made by the Store Manager")}};
  r.readAsText(f);this.value=""};
$("#reset").onclick=function(){if(confirm("Throw away your saved and unsaved changes and go back to what is live?")){rm(KEY);dirty=false;location.reload()}};
window.addEventListener("beforeunload",function(e){if(dirty){e.preventDefault();e.returnValue=""}});
/* ---------- GitHub panel ---------- */
$("#ghc").onclick=function(){
  var t=$("#tok").value.trim(),r=ghRepo();
  if(!t){gh("Paste your token first.",true);return}
  if(!window.fetch){gh("This browser can't connect to GitHub.",true);return}
  gh("Checking…");
  fetch("https://api.github.com/repos/"+r.owner+"/"+r.repo,{headers:{Accept:"application/vnd.github+json",Authorization:"Bearer "+t},cache:"no-store"}).then(function(res){
    if(res.status===401)throw "That token isn't valid or has expired.";
    if(res.status===403||res.status===404)throw "That token can't see "+r.owner+"/"+r.repo+". Choose this repository under Repository access when you create it.";
    if(!res.ok)throw "GitHub returned error "+res.status+".";
    sput(TOK,t);if($("#rem").checked)put(TOK,t);else rm(TOK);$("#tok").value="";
    gh("Connected to "+r.owner+"/"+r.repo+". Pressing Save now publishes to your live shop.");ui()
  }).catch(function(e){gh(typeof e==="string"?e:"Could not reach GitHub. Check your internet connection.",true)})};
$("#ghd").onclick=function(){srm(TOK);rm(TOK);gh("Disconnected. Changes stay in this browser until you connect again or upload data.js.",true);ui()};
$("#auto").checked=get(AUTO)!=="0";
$("#auto").onchange=function(){put(AUTO,this.checked?"1":"0");ui()};
function start(){
  if(started)return;started=true;
  var r=ghRepo();
  if(connected())gh("Connected to "+r.owner+"/"+r.repo+". Pressing Save publishes to your live shop.");else gh("Not connected: changes stay in this browser until you connect or upload data.js.",true);
  drawSet();drawProd();ui();
  freshLive().then(function(){
    if(dirty)return;
    var dd=null;try{dd=JSON.parse(get(KEY)||"null")}catch(e){}
    if(dd){
      var cur=JSON.stringify({STORE:dd.STORE,PRODUCTS:dd.PRODUCTS});
      if(cur===LIVE){rm(KEY)}
      else if(dd.base&&dd.base!==LIVE&&confirm("Your live shop has changed since you last saved here.\n\nOK = start from the live version (recommended)\nCancel = keep the older draft saved in this browser")){rm(KEY)}
      else{STORE=dd.STORE;PRODUCTS=dd.PRODUCTS}
    }
    drawSet();drawProd();ui()})
}
var ls=document.createElement("script");ls.src="lock.js?t="+Date.now();ls.onload=ls.onerror=gate;document.head.appendChild(ls);
