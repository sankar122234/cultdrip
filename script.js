/* cd-version:3 */
var STORE=window.STORE||{},PRODUCTS=window.PRODUCTS||[],PV="",HAS_DRAFT=false;
if(/[?&]preview=1/.test(location.search)){PV="?preview=1";try{var dr=JSON.parse(localStorage.getItem("cd_draft")||"null");if(dr&&dr.STORE&&Array.isArray(dr.PRODUCTS)){STORE=dr.STORE;PRODUCTS=dr.PRODUCTS;HAS_DRAFT=true}}catch(e){}}
var SHAPES={
 hoodie:'<path d="M70 30 Q100 55 130 30 L165 48 L190 120 L160 128 L152 100 L152 200 L48 200 L48 100 L40 128 L10 120 L35 48Z"/>',
 tee:'<path d="M65 28 Q100 48 135 28 L180 50 L165 88 L148 80 L148 190 L52 190 L52 80 L35 88 L20 50Z"/>',
 pants:'<path d="M60 25 H140 L150 205 H108 L100 90 L92 205 H50Z"/>',
 cap:'<path d="M45 130 Q45 60 100 60 Q155 60 155 130Z"/><path d="M40 130 H175 Q170 148 120 146 H40Z"/>'};
var cart=[];try{cart=JSON.parse(localStorage.getItem("cart")||"[]")}catch(e){}
if(!Array.isArray(cart))cart=[];
cart=cart.map(function(x){return typeof x==="number"?{id:x,size:"",qty:1}:{id:+(x&&x.id),size:(x&&x.size)||"",qty:Math.min(9,Math.max(1,+(x&&x.qty)||1))}}).filter(function(x){return x.id});
function save(){try{localStorage.setItem("cart",JSON.stringify(cart))}catch(e){}}
function $(s){return document.querySelector(s)}
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function money(n){n=+n||0;return STORE.currency+(n%1===0?n:n.toFixed(2))}
function live(){return PRODUCTS.filter(function(p){return p.status!=="hidden"})}
function byId(id){return PRODUCTS.filter(function(p){return p.id===id})[0]}
function param(k){try{return new URLSearchParams(location.search).get(k)}catch(e){return null}}
function url(file,o){var s=[];for(var k in (o||{}))s.push(k+"="+encodeURIComponent(o[k]));if(PV)s.push("preview=1");return file+(s.length?"?"+s.join("&"):"")}
function sizeList(p){return (p.sizes===undefined?"S,M,L,XL":p.sizes).split(",").map(function(x){return x.trim()}).filter(Boolean)}
function isSale(p){return +p.was>+p.price}
function openMail(h){location.href=h}
/* ---- make the shop safe against bad or missing data ---- */
function social(v,base){v=String(v||"").trim();if(!v)return "";if(/^https?:\/\//.test(v))return v;v=v.replace(/^@/,"");return /^[A-Za-z0-9._]+$/.test(v)?base+v:""}
function normalize(){
  if(!STORE||typeof STORE!=="object")STORE={};
  var d={brand:"Our Store",announce:"",heroTitle:"Welcome",heroText:"",shopTitle:"Shop",currency:"$",freeShip:0,email:"",delivery:"",returns:"",instagram:"",tiktok:""};
  for(var k in d)if(STORE[k]==null)STORE[k]=d[k];
  STORE.freeShip=+STORE.freeShip||0;
  STORE.email=String(STORE.orderEmail||STORE.email||"").trim();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(STORE.email))STORE.email="";
  STORE.formUrl=/^https:\/\//.test(String(STORE.formUrl||"").trim())?String(STORE.formUrl).trim():"";
  STORE.instagram=social(STORE.instagram,"https://instagram.com/");STORE.tiktok=social(STORE.tiktok,"https://www.tiktok.com/@");
  if(!Array.isArray(PRODUCTS))PRODUCTS=[];
  var used={},maxId=0;
  PRODUCTS.forEach(function(p){if(p&&+p.id>maxId)maxId=+p.id});
  PRODUCTS=PRODUCTS.filter(function(p){return p&&typeof p==="object"}).map(function(p){
    var id=+p.id;if(!id||used[id])id=++maxId;used[id]=1;
    return {id:id,name:String(p.name||"").trim()||"Untitled",cat:String(p.cat||"").trim()||"Other",type:SHAPES[p.type]?p.type:"tee",
      price:Math.max(0,+p.price||0),was:Math.max(0,+p.was||0),color:/^#[0-9a-f]{6}$/i.test(p.color||"")?p.color:"#227d47",image:String(p.image||"").trim(),
      status:(p.status==="soldout"||p.status==="hidden")?p.status:"live",tag:String(p.tag||""),sizes:p.sizes==null?undefined:String(p.sizes),desc:String(p.desc||"")}})
}
document.addEventListener("error",function(e){
  var t=e.target;if(t&&t.tagName==="IMG"&&t.dataset&&t.dataset.type){
    var s=document.createElement("span");s.innerHTML='<svg viewBox="0 0 200 220" role="img" aria-label="'+esc(t.alt)+'" fill="'+esc(t.dataset.color||"#227d47")+'">'+(SHAPES[t.dataset.type]||SHAPES.tee)+'</svg>';t.replaceWith(s.firstChild)}
},true);
function art(p){return p.image?'<img src="'+esc(p.image)+'" alt="'+esc(p.name)+'" loading="lazy" data-type="'+esc(p.type)+'" data-color="'+esc(p.color)+'">':'<svg viewBox="0 0 200 220" role="img" aria-label="'+esc(p.name)+'" fill="'+esc(p.color)+'">'+(SHAPES[p.type]||SHAPES.tee)+'</svg>'}
/* ---- page frame ---- */
function openCart(){document.body.classList.add("cart-open");drawCart();var c=$("#close");if(c)c.focus()}
function closeCart(){if(!document.body.classList.contains("cart-open"))return;document.body.classList.remove("cart-open");var o=$("#open");if(o)o.focus()}
function closeMenu(){var n=$("#nav"),m=$("#menu");if(n)n.classList.remove("open");if(m)m.setAttribute("aria-expanded","false")}
function layout(){
  var page=document.body.dataset.page;
  document.title=(document.body.dataset.title?document.body.dataset.title+" | ":"")+STORE.brand;
  var L=[["index.html","Home","home"],["shop.html","Shop","shop"],["about.html","About","about"],["contact.html","Contact","contact"]];
  $("#site-header").innerHTML=(PV?'<div class="pvbar">Preview mode: you are seeing your saved changes, not the live site yet.</div>':'')+(STORE.announce?'<div class="promo">'+esc(STORE.announce)+'</div>':'')+'<header class="top"><div class="wrap"><a class="logo" href="'+url("index.html")+'">'+esc(STORE.brand)+'</a><nav class="links" id="nav" aria-label="Main">'+
   L.map(function(l){return '<a href="'+url(l[0])+'"'+(page===l[2]?' class="on" aria-current="page"':'')+'>'+l[1]+'</a>'}).join("")+
   '</nav><div class="acts"><button class="btn ghost menu" id="menu" aria-expanded="false" aria-controls="nav">Menu</button><button class="btn" id="open" aria-label="Open cart">Cart <span class="count" id="count">0</span></button></div></div></header>';
  var soc=[["Instagram",STORE.instagram],["TikTok",STORE.tiktok]].filter(function(x){return /^https?:\/\//.test(x[1]||"")}).map(function(x){return '<a href="'+esc(x[1])+'" target="_blank" rel="noopener">'+x[0]+'</a>'}).join("")+(STORE.email?'<a href="mailto:'+esc(STORE.email)+'">Email us</a>':"");
  $("#site-footer").innerHTML='<footer class="foot"><div class="wrap"><span>&copy; 2026 '+esc(STORE.brand)+'</span><span>'+soc+'</span></div></footer>'+
   '<div class="shade" id="shade"></div><aside class="drawer" id="drawer" aria-label="Shopping cart"><h2>Your cart</h2><div class="rows" id="rows"></div><div class="ship" id="ship"></div><div class="meter" id="meterwrap"><i id="bar"></i></div><p><b>Total: <span id="total"></span></b></p><div id="chkmsg" role="status"></div><button class="btn" id="checkout">Checkout</button><button class="row" id="close" style="color:inherit;border:0;margin-top:8px">Keep shopping</button></aside>';
  $("#open").onclick=openCart;
  $("#close").onclick=$("#shade").onclick=closeCart;
  $("#checkout").onclick=checkout;
  $("#menu").onclick=function(){var n=$("#nav"),o=n.classList.toggle("open");this.setAttribute("aria-expanded",o?"true":"false")};
  $("#nav").onclick=function(e){if(e.target.tagName==="A")closeMenu()};
  $("#rows").onclick=function(e){
    var b=e.target.closest("button");if(!b)return;var i=+b.dataset.i,c=cart[i];if(!c)return;
    if(b.dataset.a==="inc")c.qty=Math.min(9,c.qty+1);
    if(b.dataset.a==="dec")c.qty=Math.max(1,c.qty-1);
    if(b.dataset.a==="rm")cart.splice(i,1);
    save();drawCart()};
  document.querySelectorAll("[data-s]").forEach(function(el){el.textContent=STORE[el.dataset.s]});
  drawCart();
}
if(!window.__keys){window.__keys=1;document.addEventListener("keydown",function(e){if(e.key==="Escape"){closeCart();closeMenu()}})}
function drawCart(){
  var total=0,n=0,html="",changed=false;
  cart=cart.filter(function(c){var p=byId(c.id),ok=!!p&&p.status!=="hidden";if(!ok)changed=true;return ok});
  cart.forEach(function(c,i){var p=byId(c.id),out=p.status==="soldout";
    if(!out){total+=p.price*c.qty;n+=c.qty}
    html+='<div class="row'+(out?' gone':'')+'"><div><a href="'+url("product.html",{id:p.id})+'">'+esc(p.name)+'</a>'+(c.size?' <small>('+esc(c.size)+')</small>':'')+'<br><small>'+(out?'Sold out, please remove':money(p.price)+(c.qty>1?' each':''))+'</small></div><div class="qty">'+
     (out?'':'<button data-a="dec" data-i="'+i+'" aria-label="One less of '+esc(p.name)+'">&minus;</button><span>'+c.qty+'</span><button data-a="inc" data-i="'+i+'" aria-label="One more of '+esc(p.name)+'">+</button>')+'<button class="rm" data-a="rm" data-i="'+i+'">Remove</button></div></div>'});
  if(changed)save();
  $("#rows").innerHTML=html||'<p>Your cart is empty. Add something you like.</p>';
  $("#count").textContent=n;$("#total").textContent=money(total);
  var fs=STORE.freeShip;$("#meterwrap").hidden=!fs;
  $("#ship").textContent=!fs?"":n===0?"Free shipping on orders over "+money(fs):total>=fs?"You have free shipping":"Add "+money(fs-total)+" more for free shipping";
  $("#bar").style.width=fs?Math.min(100,total/fs*100)+"%":"0";
  $("#checkout").disabled=n===0;if(n===0)$("#chkmsg").textContent="";
}
function checkout(){
  var m=$("#chkmsg"),lines=[],total=0;
  cart.forEach(function(c){var p=byId(c.id);if(p&&p.status!=="soldout"){lines.push(c.qty+" x "+p.name+(c.size?" ("+c.size+")":"")+" - "+money(p.price*c.qty));total+=p.price*c.qty}});
  if(!lines.length){m.textContent="Your cart is empty.";return}
  if(STORE.email){
    lines.push("","Total: "+money(total),"","My name and delivery address:","");
    m.innerHTML='Your email app should open with your order ready to send. If it doesn\'t, email <b>'+esc(STORE.email)+'</b> and paste your order in.';
    openMail("mailto:"+STORE.email+"?subject="+encodeURIComponent("New order from "+STORE.brand)+"&body="+encodeURIComponent(lines.join("\n")));
  }else m.innerHTML='Online checkout isn\'t switched on yet. Please <a href="'+url("contact.html")+'">contact us</a> to place your order.';
}
/* ---- product cards and lists ---- */
function card(p){
  var sale=isSale(p),off=sale?Math.round((1-p.price/p.was)*100):0,out=p.status==="soldout",href=url("product.html",{id:p.id});
  var badge=out?'<span class="badge out">Sold out</span>':sale?'<span class="badge">-'+off+'%</span>':p.tag?'<span class="badge new">'+esc(p.tag)+'</span>':'';
  var btn=out?'<button class="add" disabled>Sold out</button>':sizeList(p).length?'<a class="add" href="'+href+'">Choose size</a>':'<button class="add" data-id="'+p.id+'">Add to cart</button>';
  return '<article class="card">'+badge+'<a class="pic" href="'+href+'" aria-label="'+esc(p.name)+'">'+art(p)+'</a><h3><a href="'+href+'">'+esc(p.name)+'</a></h3><div class="price"><b>'+money(p.price)+'</b>'+(sale?'<s><span class="sr">Was </span>'+money(p.was)+'</s>':'')+'</div>'+btn+'</article>';
}
function wire(g){g.querySelectorAll(".add[data-id]").forEach(function(b){b.onclick=function(){addToCart(+b.dataset.id,"")}})}
function addToCart(id,size){var f=cart.filter(function(c){return c.id===id&&c.size===size})[0];if(f)f.qty=Math.min(9,f.qty+1);else cart.push({id:id,size:size,qty:1});save();openCart()}
function grid(){
  var g=$("#grid");if(!g)return;
  var limit=+g.dataset.limit||999,cat=param("sale")?"Sale":(param("cat")||"All"),sort="",q="";
  var _s=$("#sort"),_q=$("#q");sort=_s?_s.value:"";q=_q?_q.value.toLowerCase():"";
  var cats=["All"];if(live().some(isSale))cats.push("Sale");live().forEach(function(p){if(cats.indexOf(p.cat)<0)cats.push(p.cat)});
  if(cats.indexOf(cat)<0)cat="All";
  var chips=$("#chips");
  function mark(){if(chips)chips.querySelectorAll("button").forEach(function(b){b.className=b.textContent===cat?"on":"";b.setAttribute("aria-pressed",b.textContent===cat?"true":"false")})}
  function show(){
    var list=live().filter(function(p){return(cat==="All"||(cat==="Sale"?isSale(p):p.cat===cat))&&p.name.toLowerCase().indexOf(q)>-1});
    if(sort==="low")list.sort(function(a,b){return a.price-b.price});
    if(sort==="high")list.sort(function(a,b){return b.price-a.price});
    if(!list.length){
      var why=!live().length?"New pieces are coming soon.":q?'Nothing matches "'+esc(q)+'".':'Nothing in '+esc(cat)+' right now.';
      g.innerHTML='<div class="empty"><p>'+why+'</p>'+(live().length&&(q||cat!=="All")?'<button class="btn ghost" id="clr">Show everything</button>':'')+'</div>';
      var c=$("#clr");if(c)c.onclick=function(){cat="All";q="";if(_q)_q.value="";mark();show()};
    }else{g.innerHTML=list.slice(0,limit).map(card).join("");wire(g)}
    var cnt=$("#count-line");if(cnt)cnt.textContent=list.length+(list.length===1?" item":" items");
  }
  if(chips){chips.innerHTML="";cats.forEach(function(c){var b=document.createElement("button");b.type="button";b.textContent=c;
    b.onclick=function(){cat=c;mark();show()};chips.appendChild(b)});mark()}
  if(_s)_s.onchange=function(){sort=_s.value;show()};
  if(_q)_q.oninput=function(){q=_q.value.toLowerCase();show()};
  show();
}
function tiles(){
  var t=$("#tiles");if(t){var firsts=[];live().forEach(function(p){if(!firsts.some(function(f){return f.cat===p.cat}))firsts.push(p)});
    t.innerHTML=firsts.map(function(p){return '<a class="tile" href="'+url("shop.html",{cat:p.cat})+'">'+(p.image?'<img class="timg" src="'+esc(p.image)+'" alt="" data-type="'+esc(p.type)+'" data-color="'+esc(p.color)+'">':'<svg viewBox="0 0 200 220" aria-hidden="true" fill="'+esc(p.color)+'">'+(SHAPES[p.type]||SHAPES.tee)+'</svg>')+'<span>Shop '+esc(p.cat)+'</span></a>'}).join("");
    if(!firsts.length)t.parentNode.parentNode.hidden=true}
  var b=$("#saleBanner");if(b){var best=0;live().forEach(function(p){if(isSale(p))best=Math.max(best,Math.round((1-p.price/p.was)*100))});
    if(!best)b.hidden=true;else{b.hidden=false;b.href=url("shop.html",{sale:1});$("#saleOff").textContent="Up to "+best+"% off"}}
}
function productPage(){
  var box=$("#product");if(!box)return;
  var p=byId(+param("id"));
  if(!p||p.status==="hidden"){$("#pcrumbs").innerHTML='<a href="'+url("index.html")+'">Home</a> / <a href="'+url("shop.html")+'">Shop</a>';
    box.innerHTML='<div class="empty"><p>We could not find that product. It may have sold out or been removed.</p><a class="btn" href="'+url("shop.html")+'">Back to the shop</a></div>';var mo=$("#more");if(mo&&mo.parentNode)mo.parentNode.hidden=true;return}
  document.title=p.name+" | "+STORE.brand;
  var sale=isSale(p),out=p.status==="soldout",sizes=sizeList(p),chosen="";
  $("#pcrumbs").innerHTML='<a href="'+url("index.html")+'">Home</a> / <a href="'+url("shop.html")+'">Shop</a> / <a href="'+url("shop.html",{cat:p.cat})+'">'+esc(p.cat)+'</a> / '+esc(p.name);
  box.innerHTML='<div class="gal"><div class="big">'+art(p)+'</div></div><div class="info"><h1>'+esc(p.name)+'</h1>'+
   '<div class="price big"><b>'+money(p.price)+'</b>'+(sale?'<s><span class="sr">Was </span>'+money(p.was)+'</s> <span class="off">-'+Math.round((1-p.price/p.was)*100)+'%</span>':'')+'</div>'+
   (out?'<p class="soldnote">This piece has sold out.</p>':(p.tag?'<p class="ptag">'+esc(p.tag)+'</p>':''))+'<div class="sw"><i style="background:'+esc(p.color)+'"></i><span>Colour</span></div>'+
   (sizes.length?'<b id="szlab">Select size</b><div class="sizes" id="sizes" role="group" aria-labelledby="szlab">'+sizes.map(function(s){return '<button type="button" aria-pressed="false"'+(out?' disabled':'')+'>'+esc(s)+'</button>'}).join("")+'</div><small id="szmsg" role="alert"></small>':'')+
   '<button class="btn" id="bag"'+(out?' disabled':'')+'>'+(out?'Sold out':'Add to cart')+'</button>'+
   (STORE.freeShip?'<p class="shipnote">Free shipping on orders over '+money(STORE.freeShip)+'.</p>':'')+
   '<details open><summary>Product details</summary><p>'+esc(p.desc||"Limited-run piece in heavyweight fabric. Small drops, no restocks.")+'</p></details>'+
   '<details><summary>Delivery &amp; returns</summary><p>'+esc(STORE.delivery||(STORE.freeShip?"Free standard delivery on orders over "+money(STORE.freeShip)+".":"Ask us about delivery before you buy."))+'</p><p>'+esc(STORE.returns||"Ask us about returns before you buy.")+'</p></details></div>';
  document.querySelectorAll("#sizes button").forEach(function(b){b.onclick=function(){chosen=b.textContent;document.querySelectorAll("#sizes button").forEach(function(x){x.className="";x.setAttribute("aria-pressed","false")});b.className="on";b.setAttribute("aria-pressed","true");$("#szmsg").textContent=""}});
  $("#bag").onclick=function(){if(sizes.length&&!chosen){$("#szmsg").textContent="Please choose a size first.";var f=$("#sizes button");if(f)f.focus();return}addToCart(p.id,chosen)};
  var more=$("#more");if(more){var rest=live().filter(function(x){return x.id!==p.id}).sort(function(a,b){return (b.cat===p.cat)-(a.cat===p.cat)}).slice(0,4);
    more.innerHTML=rest.map(card).join("");wire(more);if(more.parentNode)more.parentNode.hidden=!rest.length}
}
function boot(){
  try{normalize();layout();grid();tiles();productPage()}
  catch(err){var m=document.querySelector("main");if(m)m.innerHTML='<div class="wrap"><p class="empty" style="padding:60px 0">Something went wrong loading this page. Please refresh. If it keeps happening, try again in a few minutes.</p></div>'}
}
/* ---- live data from GitHub ---- */
var GH_DEFAULT={owner:"sankar122234",repo:"cultdrip",branch:"main",path:"data.js"};
function ghRepo(){var h=location.hostname,p=location.pathname.split("/")[1];
  if(/\.github\.io$/.test(h)&&p&&p.indexOf(".")<0)return {owner:h.split(".")[0],repo:p,branch:"main",path:"data.js"};
  return GH_DEFAULT}
function parseData(text){var m=String(text).match(/var STORE\s*=\s*([\s\S]*?);\s*var PRODUCTS\s*=\s*([\s\S]*?);\s*$/);if(!m)return null;try{return{STORE:JSON.parse(m[1]),PRODUCTS:JSON.parse(m[2])}}catch(e){return null}}
function liveRefresh(){
  if((PV&&HAS_DRAFT)||!window.fetch)return;
  var key="cd_live",now=Date.now(),c=null;try{c=JSON.parse(sessionStorage.getItem(key)||"null")}catch(e){}
  function apply(d){
    if(!d||!d.STORE||typeof d.STORE!=="object"||!Array.isArray(d.PRODUCTS)||!d.PRODUCTS.length)return; /* ignore empty or damaged data */
    if(JSON.stringify({s:d.STORE,p:d.PRODUCTS})!==JSON.stringify({s:STORE,p:PRODUCTS})){STORE=d.STORE;PRODUCTS=d.PRODUCTS;boot()}}
  if(c&&now-c.t<20000){apply(parseData(c.text));return}
  var r=ghRepo();
  fetch("https://api.github.com/repos/"+r.owner+"/"+r.repo+"/contents/"+r.path+"?ref="+r.branch,{headers:{Accept:"application/vnd.github.raw+json"},cache:"no-store"})
   .then(function(res){if(!res.ok)throw 0;return res.text()})
   .then(function(t){try{sessionStorage.setItem(key,JSON.stringify({t:now,text:t}))}catch(e){}apply(parseData(t))})
   .catch(function(){});
}
boot();liveRefresh();
/* ---- forms ---- */
function sendForm(data,okMsg,mailSubject,mailBody,reset){
  var ok=$("#ok");
  if(STORE.formUrl&&window.fetch){ok.textContent="Sending…";
    fetch(STORE.formUrl,{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(data)})
     .then(function(r){if(!r.ok)throw 0;ok.textContent=okMsg;reset()})
     .catch(function(){ok.textContent="That didn't send. Please check your connection and try again."+(STORE.email?" Or email us at "+STORE.email+".":"")});return}
  if(STORE.email){ok.textContent="Your email app should open with everything ready to send. Nothing is sent until you press send there.";openMail("mailto:"+STORE.email+"?subject="+encodeURIComponent(mailSubject)+"&body="+encodeURIComponent(mailBody));return}
  ok.textContent="This form isn't switched on yet, so nothing was sent. Please check back soon."}
var f=$("#f");if(f)f.onsubmit=function(e){e.preventDefault();var em=f.elements[0].value.trim();
  sendForm({email:em,type:"member signup"},"Welcome in. You're on the member list.","Add me to the member list","Please add this email to the member list: "+em,function(){f.reset()})};
var c=$("#contact");if(c)c.onsubmit=function(e){e.preventDefault();var v=c.elements,n=v[0].value.trim(),em=v[1].value.trim(),m=v[2].value.trim();
  sendForm({name:n,email:em,message:m},"Thanks, your message was sent. We'll reply by email.","Message from "+n,m+"\n\nFrom: "+n+" ("+em+")",function(){c.reset()})};
