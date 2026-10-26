var PV="";
if(/[?&]preview=1/.test(location.search)){PV="?preview=1";try{var dr=JSON.parse(localStorage.getItem("cd_draft")||"null");if(dr){STORE=dr.STORE;PRODUCTS=dr.PRODUCTS}}catch(e){}}
var SHAPES={
 hoodie:'<path d="M70 30 Q100 55 130 30 L165 48 L190 120 L160 128 L152 100 L152 200 L48 200 L48 100 L40 128 L10 120 L35 48Z"/>',
 tee:'<path d="M65 28 Q100 48 135 28 L180 50 L165 88 L148 80 L148 190 L52 190 L52 80 L35 88 L20 50Z"/>',
 pants:'<path d="M60 25 H140 L150 205 H108 L100 90 L92 205 H50Z"/>',
 cap:'<path d="M45 130 Q45 60 100 60 Q155 60 155 130Z"/><path d="M40 130 H175 Q170 148 120 146 H40Z"/>'};
var cart=[];try{cart=JSON.parse(localStorage.getItem("cart")||"[]")}catch(e){}
cart=cart.map(function(x){return typeof x==="number"?{id:x,size:""}:x});
function save(){try{localStorage.setItem("cart",JSON.stringify(cart))}catch(e){}}
function $(s){return document.querySelector(s)}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function money(n){n=+n||0;return STORE.currency+(n%1===0?n:n.toFixed(2))}
function live(){return PRODUCTS.filter(function(p){return p.status!=="hidden"})}
function byId(id){return PRODUCTS.filter(function(p){return p.id===id})[0]}
function param(k){try{return new URLSearchParams(location.search).get(k)}catch(e){return null}}
function url(file,o){var s=[];for(var k in (o||{}))s.push(k+"="+encodeURIComponent(o[k]));if(PV)s.push("preview=1");return file+(s.length?"?"+s.join("&"):"")}
function sizeList(p){return (p.sizes===undefined?"S,M,L,XL":p.sizes).split(",").map(function(x){return x.trim()}).filter(Boolean)}
function isSale(p){return +p.was>+p.price}
function art(p){return p.image?'<img src="'+esc(p.image)+'" alt="'+esc(p.name)+'" loading="lazy">':'<svg viewBox="0 0 200 220" role="img" aria-label="'+esc(p.name)+'" fill="'+esc(p.color)+'">'+(SHAPES[p.type]||SHAPES.tee)+'</svg>'}
var GH_DEFAULT={owner:"sankar122234",repo:"cultdrip",branch:"main",path:"data.js"};
function ghRepo(){var h=location.hostname,p=location.pathname.split("/")[1];
  if(/\.github\.io$/.test(h)&&p&&p.indexOf(".")<0)return {owner:h.split(".")[0],repo:p,branch:"main",path:"data.js"};
  return GH_DEFAULT}
function parseData(text){var m=String(text).match(/var STORE\s*=\s*([\s\S]*?);\s*var PRODUCTS\s*=\s*([\s\S]*?);\s*$/);if(!m)return null;try{return{STORE:JSON.parse(m[1]),PRODUCTS:JSON.parse(m[2])}}catch(e){return null}}
function layout(){
  var page=document.body.dataset.page;
  document.title=(document.body.dataset.title?document.body.dataset.title+" | ":"")+STORE.brand;
  var L=[["index.html","Home","home"],["shop.html","Shop","shop"],["about.html","About","about"],["contact.html","Contact","contact"]];
  $("#site-header").innerHTML=(PV?'<div class="pvbar">Preview mode: you are seeing your saved changes, not the live site yet.</div>':'')+'<div class="promo">'+esc(STORE.announce)+'</div><header class="top"><div class="wrap"><a class="logo" href="'+url("index.html")+'">'+esc(STORE.brand)+'</a><nav class="links" aria-label="Main">'+
   L.map(function(l){return '<a href="'+url(l[0])+'"'+(page===l[2]?' class="on"':'')+'>'+l[1]+'</a>'}).join("")+
   '<button class="btn" id="open" aria-label="Open cart">Cart<span class="count" id="count">0</span></button></nav></div></header>';
  $("#site-footer").innerHTML='<footer class="foot"><div class="wrap"><span>&copy; 2026 '+esc(STORE.brand)+'</span><span><a href="#">Instagram</a><a href="#">TikTok</a></span></div></footer>'+
   '<div class="shade" id="shade"></div><aside class="drawer" aria-label="Cart"><h2>Your cart</h2><div class="rows" id="rows"></div><div class="ship" id="ship"></div><div class="meter"><i id="bar"></i></div><p><b>Total: <span id="total"></span></b></p><button class="btn" id="checkout">Checkout</button><button class="row" id="close" style="color:inherit;border:0;margin-top:8px">Keep shopping</button></aside>';
  $("#open").onclick=function(){document.body.classList.add("cart-open");drawCart()};
  $("#close").onclick=$("#shade").onclick=function(){document.body.classList.remove("cart-open")};
  $("#checkout").onclick=function(){alert("Checkout is not connected yet. Add Shopify or Stripe Payment Links to take real orders.")};
  document.querySelectorAll("[data-s]").forEach(function(el){el.textContent=STORE[el.dataset.s]});
  drawCart();
}
function drawCart(){
  var total=0,n=0,html="";
  cart.forEach(function(it,i){var p=byId(it.id);if(!p)return;total+=+p.price;n++;
    html+='<div class="row"><span>'+esc(p.name)+(it.size?' ('+esc(it.size)+')':'')+'<br><small>'+money(p.price)+'</small></span><button data-i="'+i+'">Remove</button></div>'});
  $("#rows").innerHTML=html||'<p>Your cart is empty.</p>';
  $("#count").textContent=n;$("#total").textContent=money(total);
  var left=STORE.freeShip-total;$("#ship").textContent=left>0?"Add "+money(left)+" more for free shipping":"You have free shipping";
  $("#bar").style.width=Math.min(100,total/STORE.freeShip*100)+"%";
  document.querySelectorAll("#rows button").forEach(function(b){b.onclick=function(){cart.splice(+b.dataset.i,1);save();drawCart()}});
}
function card(p){
  var sale=isSale(p),off=sale?Math.round((1-p.price/p.was)*100):0,out=p.status==="soldout",href=url("product.html",{id:p.id});
  var badge=out?'<span class="badge out">Sold out</span>':sale?'<span class="badge">-'+off+'%</span>':p.tag?'<span class="badge new">'+esc(p.tag)+'</span>':'';
  var btn=out?'<button class="add" disabled>Sold out</button>':sizeList(p).length?'<a class="add" href="'+href+'">Choose size</a>':'<button class="add" data-id="'+p.id+'">Add to cart</button>';
  return '<article class="card">'+badge+'<a class="pic" href="'+href+'" aria-label="'+esc(p.name)+'">'+art(p)+'</a><h3><a href="'+href+'">'+esc(p.name)+'</a></h3><div class="price"><b>'+money(p.price)+'</b>'+(sale?'<s>'+money(p.was)+'</s>':'')+'</div>'+btn+'</article>';
}
function wire(g){g.querySelectorAll(".add[data-id]").forEach(function(b){b.onclick=function(){cart.push({id:+b.dataset.id,size:""});save();drawCart();document.body.classList.add("cart-open")}})}
function grid(){
  var g=$("#grid");if(!g)return;
  var limit=+g.dataset.limit||999,cat=param("sale")?"Sale":(param("cat")||"All"),sort="",q="";
  var _s=$("#sort"),_q=$("#q");sort=_s?_s.value:"";q=_q?_q.value.toLowerCase():"";
  function show(){
    var list=live().filter(function(p){return(cat==="All"||(cat==="Sale"?isSale(p):p.cat===cat))&&p.name.toLowerCase().indexOf(q)>-1});
    if(sort==="low")list.sort(function(a,b){return a.price-b.price});
    if(sort==="high")list.sort(function(a,b){return b.price-a.price});
    g.innerHTML=list.slice(0,limit).map(card).join("")||'<p class="empty">Nothing here yet.</p>';wire(g);
  }
  var chips=$("#chips");
  if(chips){chips.innerHTML="";var cats=["All"];if(live().some(isSale))cats.push("Sale");live().forEach(function(p){if(cats.indexOf(p.cat)<0)cats.push(p.cat)});
    cats.forEach(function(c){var b=document.createElement("button");b.textContent=c;if(c===cat)b.className="on";
      b.onclick=function(){cat=c;chips.querySelectorAll("button").forEach(function(x){x.className=""});b.className="on";show()};chips.appendChild(b)})}
  var s=$("#sort");if(s)s.onchange=function(){sort=s.value;show()};
  var se=$("#q");if(se)se.oninput=function(){q=se.value.toLowerCase();show()};
  show();
}
function tiles(){
  var t=$("#tiles");if(t){var firsts=[];live().forEach(function(p){if(!firsts.some(function(f){return f.cat===p.cat}))firsts.push(p)});
    t.innerHTML=firsts.map(function(p){return '<a class="tile" href="'+url("shop.html",{cat:p.cat})+'">'+(p.image?'<img class="timg" src="'+esc(p.image)+'" alt="">':'<svg viewBox="0 0 200 220" aria-hidden="true" fill="'+esc(p.color)+'">'+(SHAPES[p.type]||SHAPES.tee)+'</svg>')+'<span>Shop '+esc(p.cat)+'</span></a>'}).join("")}
  var b=$("#saleBanner");if(b){var best=0;live().forEach(function(p){if(isSale(p))best=Math.max(best,Math.round((1-p.price/p.was)*100))});
    if(!best)b.hidden=true;else{b.href=url("shop.html",{sale:1});$("#saleOff").textContent="Up to "+best+"% off"}}
}
function productPage(){
  var box=$("#product");if(!box)return;
  var p=byId(+param("id"));
  if(!p||p.status==="hidden"){box.innerHTML='<p class="empty">We could not find that product. <a href="'+url("shop.html")+'">Back to the shop</a></p>';return}
  document.title=p.name+" | "+STORE.brand;
  var sale=isSale(p),out=p.status==="soldout",sizes=sizeList(p),chosen="";
  $("#pcrumbs").innerHTML='<a href="'+url("index.html")+'">Home</a> / <a href="'+url("shop.html")+'">Shop</a> / <a href="'+url("shop.html",{cat:p.cat})+'">'+esc(p.cat)+'</a> / '+esc(p.name);
  box.innerHTML='<div class="gal"><div class="big">'+art(p)+'</div></div><div class="info"><h1>'+esc(p.name)+'</h1>'+
   '<div class="price big"><b>'+money(p.price)+'</b>'+(sale?'<s>'+money(p.was)+'</s> <span class="off">-'+Math.round((1-p.price/p.was)*100)+'%</span>':'')+'</div>'+
   (p.tag?'<p class="ptag">'+esc(p.tag)+'</p>':'')+'<div class="sw"><i style="background:'+esc(p.color)+'"></i><span>Colour</span></div>'+
   (sizes.length?'<b>Select size</b><div class="sizes" id="sizes">'+sizes.map(function(s){return '<button type="button">'+esc(s)+'</button>'}).join("")+'</div><small id="szmsg"></small>':'')+
   '<button class="btn" id="bag"'+(out?' disabled':'')+'>'+(out?'Sold out':'Add to bag')+'</button>'+
   '<p class="shipnote">Free shipping on orders over '+money(STORE.freeShip)+'.</p>'+
   '<details open><summary>Product details</summary><p>'+esc(p.desc||"Limited-run piece in heavyweight fabric. Small drops, no restocks.")+'</p></details>'+
   '<details><summary>Delivery &amp; returns</summary><p>'+esc(STORE.delivery||"Free standard delivery on orders over "+money(STORE.freeShip)+".")+'</p><p>'+esc(STORE.returns||"Ask us about returns before you buy.")+'</p></details></div>';
  document.querySelectorAll("#sizes button").forEach(function(b){b.onclick=function(){chosen=b.textContent;document.querySelectorAll("#sizes button").forEach(function(x){x.className=""});b.className="on";$("#szmsg").textContent=""}});
  $("#bag").onclick=function(){if(sizes.length&&!chosen){$("#szmsg").textContent="Please choose a size.";return}cart.push({id:p.id,size:chosen});save();drawCart();document.body.classList.add("cart-open")};
  var more=$("#more");if(more){var rest=live().filter(function(x){return x.id!==p.id}).sort(function(a,b){return (b.cat===p.cat)-(a.cat===p.cat)}).slice(0,4);
    more.innerHTML=rest.map(card).join("");wire(more)}
}
function boot(){layout();grid();tiles();productPage()}
function liveRefresh(){
  if(PV||!window.fetch)return;
  var key="cd_live",now=Date.now(),c=null;try{c=JSON.parse(sessionStorage.getItem(key)||"null")}catch(e){}
  function apply(d){if(!d)return;if(JSON.stringify({s:d.STORE,p:d.PRODUCTS})!==JSON.stringify({s:STORE,p:PRODUCTS})){STORE=d.STORE;PRODUCTS=d.PRODUCTS;boot()}}
  if(c&&now-c.t<20000){apply(parseData(c.text));return}
  var r=ghRepo();
  fetch("https://api.github.com/repos/"+r.owner+"/"+r.repo+"/contents/"+r.path+"?ref="+r.branch,{headers:{Accept:"application/vnd.github.raw+json"},cache:"no-store"})
   .then(function(res){if(!res.ok)throw 0;return res.text()})
   .then(function(t){try{sessionStorage.setItem(key,JSON.stringify({t:now,text:t}))}catch(e){}apply(parseData(t))})
   .catch(function(){});
}
boot();liveRefresh();
var f=$("#f");if(f)f.onsubmit=function(e){e.preventDefault();$("#ok").textContent="Welcome in. You will be on the member list once a signup service is connected.";f.reset()};
var c=$("#contact");if(c)c.onsubmit=function(e){e.preventDefault();$("#ok").textContent="Thanks. Your message will send once a form service is connected.";c.reset()};
