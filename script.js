/* ===== EDIT THESE ===== */
var BRAND = "Cult Drip";            // change your brand name here once
var FREE_SHIP = 95;                 // free shipping threshold in $
var PRODUCTS = [
  {id:1,name:"Robe Hoodie",type:"hoodie",cat:"Hoodies",price:140,was:190,color:"#2433ff"},
  {id:2,name:"Sigil Tee",type:"tee",cat:"Tees",price:45,was:75,color:"#111111"},
  {id:3,name:"Pilgrim Cargo",type:"pants",cat:"Pants",price:99,was:165,color:"#8a8f7a"},
  {id:4,name:"Dripcap",type:"cap",cat:"Caps",price:35,was:55,color:"#c9b8ff"},
  {id:5,name:"Ritual Crew",type:"hoodie",cat:"Hoodies",price:85,was:120,color:"#d9d2c0"},
  {id:6,name:"Chant Tee",type:"tee",cat:"Tees",price:39,was:60,color:"#2433ff"},
  {id:7,name:"Order Shorts",type:"pants",cat:"Pants",price:59,was:80,color:"#111111"},
  {id:8,name:"Zealot Beanie",type:"cap",cat:"Caps",price:29,was:40,color:"#d6001c"}
];
/* ====================== */
var SHAPES={
 hoodie:'<path d="M70 30 Q100 55 130 30 L165 48 L190 120 L160 128 L152 100 L152 200 L48 200 L48 100 L40 128 L10 120 L35 48Z"/>',
 tee:'<path d="M65 28 Q100 48 135 28 L180 50 L165 88 L148 80 L148 190 L52 190 L52 80 L35 88 L20 50Z"/>',
 pants:'<path d="M60 25 H140 L150 205 H108 L100 90 L92 205 H50Z"/>',
 cap:'<path d="M45 130 Q45 60 100 60 Q155 60 155 130Z"/><path d="M40 130 H175 Q170 148 120 146 H40Z"/>'};
var cart=[];try{cart=JSON.parse(localStorage.getItem("cart")||"[]")}catch(e){}
function save(){try{localStorage.setItem("cart",JSON.stringify(cart))}catch(e){}}
function $(s){return document.querySelector(s)}
function money(n){return "$"+n.toFixed(2)}
function layout(){
  var page=document.body.dataset.page;
  document.title=(document.body.dataset.title?document.body.dataset.title+" | ":"")+BRAND;
  var links=[["index.html","Home","home"],["shop.html","Sale","shop"],["about.html","About","about"],["contact.html","Contact","contact"]];
  $("#site-header").innerHTML='<div class="promo">Free shipping on orders over $'+FREE_SHIP+'</div><header class="top"><div class="wrap"><a class="logo" href="index.html">'+BRAND+'</a><nav class="main" aria-label="Main">'+
   links.map(function(l){return '<a href="'+l[0]+'"'+(page===l[2]?' class="on"':'')+'>'+l[1]+'</a>'}).join("")+
   '</nav><div class="tools"><button id="open" aria-label="Open cart">Cart<span class="count" id="count">0</span></button></div></div></header>';
  $("#site-footer").innerHTML='<footer class="foot"><div class="wrap"><div><b>'+BRAND+'</b><br>&copy; 2026 '+BRAND+'. All rights reserved.</div><div><a href="#">Instagram</a><a href="#">TikTok</a><a href="#">Facebook</a></div></div></footer>'+
   '<div class="shade" id="shade"></div><aside class="drawer" aria-label="Cart"><h2>Your cart</h2><div class="rows" id="rows"></div><div class="ship" id="ship"></div><div class="meter"><i id="bar"></i></div><p><b>Total: <span id="total">$0.00</span></b></p><button class="btn dark" id="checkout">Checkout</button><button class="row" id="close" style="color:inherit;border:0;margin-top:8px">Keep shopping</button></aside>';
  $("#open").onclick=function(){document.body.classList.add("cart-open");drawCart()};
  $("#close").onclick=$("#shade").onclick=function(){document.body.classList.remove("cart-open")};
  $("#checkout").onclick=function(){alert("Checkout is not connected yet. Add Shopify or Stripe Payment Links to take real orders.")};
  drawCart();
}
function drawCart(){
  var total=0,n=0;
  $("#rows").innerHTML=cart.length?cart.map(function(id,i){var p=PRODUCTS.filter(function(x){return x.id===id})[0];total+=p.price;n++;
    return '<div class="row"><span>'+p.name+'<br><small>'+money(p.price)+'</small></span><button data-i="'+i+'">Remove</button></div>'}).join(""):'<p>Your cart is empty. Add something from the sale.</p>';
  $("#count").textContent=n;$("#total").textContent=money(total);
  var left=FREE_SHIP-total;$("#ship").textContent=left>0?"Add "+money(left)+" more for free shipping":"You have free shipping";
  $("#bar").style.width=Math.min(100,total/FREE_SHIP*100)+"%";
  document.querySelectorAll("#rows button").forEach(function(b){b.onclick=function(){cart.splice(+b.dataset.i,1);save();drawCart()}});
}
function card(p){
  var off=Math.round((1-p.price/p.was)*100);
  return '<article class="card"><span class="badge">-'+off+'%</span><div class="pic"><svg viewBox="0 0 200 220" role="img" aria-label="'+p.name+'" fill="'+p.color+'">'+SHAPES[p.type]+'</svg></div><h3>'+p.name+'</h3><div class="price"><b>'+money(p.price)+'</b><s>'+money(p.was)+'</s></div><button class="add" data-id="'+p.id+'">Add to cart</button></article>';
}
function grid(){
  var g=$("#grid");if(!g)return;
  var limit=+g.dataset.limit||99,cat="All",sort="";
  function show(){
    var list=PRODUCTS.filter(function(p){return cat==="All"||p.cat===cat});
    if(sort==="low")list.sort(function(a,b){return a.price-b.price});
    if(sort==="high")list.sort(function(a,b){return b.price-a.price});
    g.innerHTML=list.slice(0,limit).map(card).join("");
    g.querySelectorAll(".add").forEach(function(b){b.onclick=function(){cart.push(+b.dataset.id);save();drawCart();document.body.classList.add("cart-open")}});
  }
  var chips=$("#chips");
  if(chips){["All","Hoodies","Tees","Pants","Caps"].forEach(function(c){var b=document.createElement("button");b.textContent=c;if(c==="All")b.className="on";
    b.onclick=function(){cat=c;chips.querySelectorAll("button").forEach(function(x){x.className=""});b.className="on";show()};chips.appendChild(b)})}
  var s=$("#sort");if(s)s.onchange=function(){sort=s.value;show()};
  show();
}
layout();grid();
var f=$("#contact");if(f)f.onsubmit=function(e){e.preventDefault();$("#ok").textContent="Thanks. Your message is ready to send once a form service is connected.";f.reset()};
