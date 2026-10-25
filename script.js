var PV="";
if(/[?&]preview=1/.test(location.search)){PV="?preview=1";try{var dr=JSON.parse(localStorage.getItem("cd_draft")||"null");if(dr){STORE=dr.STORE;PRODUCTS=dr.PRODUCTS}}catch(e){}}
var SHAPES={
 hoodie:'<path d="M70 30 Q100 55 130 30 L165 48 L190 120 L160 128 L152 100 L152 200 L48 200 L48 100 L40 128 L10 120 L35 48Z"/>',
 tee:'<path d="M65 28 Q100 48 135 28 L180 50 L165 88 L148 80 L148 190 L52 190 L52 80 L35 88 L20 50Z"/>',
 pants:'<path d="M60 25 H140 L150 205 H108 L100 90 L92 205 H50Z"/>',
 cap:'<path d="M45 130 Q45 60 100 60 Q155 60 155 130Z"/><path d="M40 130 H175 Q170 148 120 146 H40Z"/>'};
var cart=[];try{cart=JSON.parse(localStorage.getItem("cart")||"[]")}catch(e){}
function save(){try{localStorage.setItem("cart",JSON.stringify(cart))}catch(e){}}
function $(s){return document.querySelector(s)}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function money(n){n=+n||0;return STORE.currency+(n%1===0?n:n.toFixed(2))}
function live(){return PRODUCTS.filter(function(p){return p.status!=="hidden"})}
function byId(id){return PRODUCTS.filter(function(p){return p.id===id})[0]}
function layout(){
  var page=document.body.dataset.page;
  document.title=(document.body.dataset.title?document.body.dataset.title+" | ":"")+STORE.brand;
  var L=[["index.html","Home","home"],["shop.html","Shop","shop"],["about.html","About","about"],["contact.html","Contact","contact"]];
  $("#site-header").innerHTML='<div class="promo">'+esc(STORE.announce)+'</div><header class="top"><div class="wrap"><a class="logo" href="index.html'+PV+'">'+esc(STORE.brand)+'</a><nav class="links" aria-label="Main">'+
   L.map(function(l){return '<a href="'+l[0]+PV+'"'+(page===l[2]?' class="on"':'')+'>'+l[1]+'</a>'}).join("")+
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
  cart.forEach(function(id,i){var p=byId(id);if(!p)return;total+=+p.price;n++;
    html+='<div class="row"><span>'+esc(p.name)+'<br><small>'+money(p.price)+'</small></span><button data-i="'+i+'">Remove</button></div>'});
  $("#rows").innerHTML=html||'<p>Your cart is empty.</p>';
  $("#count").textContent=n;$("#total").textContent=money(total);
  var left=STORE.freeShip-total;$("#ship").textContent=left>0?"Add "+money(left)+" more for free shipping":"You have free shipping";
  $("#bar").style.width=Math.min(100,total/STORE.freeShip*100)+"%";
  document.querySelectorAll("#rows button").forEach(function(b){b.onclick=function(){cart.splice(+b.dataset.i,1);save();drawCart()}});
}
function card(p){
  var sale=+p.was>+p.price,off=sale?Math.round((1-p.price/p.was)*100):0,out=p.status==="soldout";
  var art=p.image?'<img src="'+esc(p.image)+'" alt="'+esc(p.name)+'" loading="lazy">':'<svg viewBox="0 0 200 220" role="img" aria-label="'+esc(p.name)+'" fill="'+esc(p.color)+'">'+(SHAPES[p.type]||SHAPES.tee)+'</svg>';
  var badge=out?'<span class="badge out">Sold out</span>':sale?'<span class="badge">-'+off+'%</span>':p.tag?'<span class="badge new">'+esc(p.tag)+'</span>':'';
  return '<article class="card">'+badge+'<div class="pic">'+art+'</div><h3>'+esc(p.name)+'</h3><div class="price"><b>'+money(p.price)+'</b>'+(sale?'<s>'+money(p.was)+'</s>':'')+'</div>'+
   (out?'<button class="add" disabled>Sold out</button>':'<button class="add" data-id="'+p.id+'">Add to cart</button>')+'</article>';
}
function grid(){
  var g=$("#grid");if(!g)return;
  var limit=+g.dataset.limit||999,cat="All",sort="",q="";
  function show(){
    var list=live().filter(function(p){return(cat==="All"||p.cat===cat)&&p.name.toLowerCase().indexOf(q)>-1});
    if(sort==="low")list.sort(function(a,b){return a.price-b.price});
    if(sort==="high")list.sort(function(a,b){return b.price-a.price});
    g.innerHTML=list.slice(0,limit).map(card).join("")||'<p class="empty">Nothing here yet.</p>';
    g.querySelectorAll(".add[data-id]").forEach(function(b){b.onclick=function(){cart.push(+b.dataset.id);save();drawCart();document.body.classList.add("cart-open")}});
  }
  var chips=$("#chips");
  if(chips){var cats=["All"];live().forEach(function(p){if(cats.indexOf(p.cat)<0)cats.push(p.cat)});
    cats.forEach(function(c){var b=document.createElement("button");b.textContent=c;if(c==="All")b.className="on";
      b.onclick=function(){cat=c;chips.querySelectorAll("button").forEach(function(x){x.className=""});b.className="on";show()};chips.appendChild(b)})}
  var s=$("#sort");if(s)s.onchange=function(){sort=s.value;show()};
  var se=$("#q");if(se)se.oninput=function(){q=se.value.toLowerCase();show()};
  show();
}
layout();grid();
var f=$("#f");if(f)f.onsubmit=function(e){e.preventDefault();$("#ok").textContent="Welcome in. You will be on the member list once a signup service is connected.";f.reset()};
var c=$("#contact");if(c)c.onsubmit=function(e){e.preventDefault();$("#ok").textContent="Thanks. Your message will send once a form service is connected.";c.reset()};
