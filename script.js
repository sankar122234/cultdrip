/* cd-version:13 */
var STORE=window.STORE||{},PRODUCTS=window.PRODUCTS||[],PV="",HAS_DRAFT=false,X={};
if(/[?&]preview=1/.test(location.search)){PV="?preview=1";try{var dr=JSON.parse(localStorage.getItem("cd_draft")||"null");if(dr&&dr.STORE&&Array.isArray(dr.PRODUCTS)){STORE=dr.STORE;PRODUCTS=dr.PRODUCTS;HAS_DRAFT=true}}catch(e){}}
var SHAPES={
 hoodie:'<path d="M70 30 Q100 55 130 30 L165 48 L190 120 L160 128 L152 100 L152 200 L48 200 L48 100 L40 128 L10 120 L35 48Z"/>',
 tee:'<path d="M65 28 Q100 48 135 28 L180 50 L165 88 L148 80 L148 190 L52 190 L52 80 L35 88 L20 50Z"/>',
 pants:'<path d="M60 25 H140 L150 205 H108 L100 90 L92 205 H50Z"/>',
 cap:'<path d="M45 130 Q45 60 100 60 Q155 60 155 130Z"/><path d="M40 130 H175 Q170 148 120 146 H40Z"/>'};
var cart=[];
function readCart(raw){var c=[];try{c=JSON.parse(raw||"[]")}catch(e){}
if(!Array.isArray(c))c=[];
return c.map(function(x){return typeof x==="number"?{id:x,size:"",qty:1}:{id:+(x&&x.id),size:(x&&x.size)||"",qty:Math.min(9,Math.max(1,Math.round(+(x&&x.qty))||1))}}).filter(function(x){return x.id})}
try{cart=readCart(localStorage.getItem("cart"))}catch(e){}
window.addEventListener("storage",function(e){if(e.key==="cart"){cart=readCart(e.newValue);if(typeof drawCart==="function"&&document.getElementById("rows"))drawCart()}});
function save(){try{localStorage.setItem("cart",JSON.stringify(cart))}catch(e){}}
function $(s){return document.querySelector(s)}
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function moneyT(n){n=+n||0;return String(STORE.currency)+(n%1===0?n:n.toFixed(2))}
function money(n){return esc(moneyT(n))}
function live(){return PRODUCTS.filter(function(p){return p.status!=="hidden"})}
function buyable(p){return !!p&&p.status==="live"}
function onSale(p){return buyable(p)&&isSale(p)}
function byId(id){return PRODUCTS.filter(function(p){return p.id===id})[0]}
function param(k){try{return new URLSearchParams(location.search).get(k)}catch(e){return null}}
function url(file,o){var s=[];for(var k in (o||{}))s.push(k+"="+encodeURIComponent(o[k]));if(PV)s.push("preview=1");return file+(s.length?"?"+s.join("&"):"")}
function sizeList(p){return (p.sizes===undefined?(p.type==="cap"?"":"S,M,L,XL"):p.sizes).split(",").map(function(x){return x.trim()}).filter(Boolean)}
function isSale(p){return +p.was>+p.price}
/* live first, then coming soon, then sold out; stable inside each group (sort = "", "low" or "high") */
function rank(p){return p.status==="live"?0:p.status==="soon"?1:2}
function ordered(list,sort){return list.map(function(p,i){return {p:p,i:i}}).sort(function(a,b){return rank(a.p)-rank(b.p)||(sort==="low"?a.p.price-b.p.price:sort==="high"?b.p.price-a.p.price:0)||a.i-b.i}).map(function(x){return x.p})}
function openMail(h){location.href=h}
function rows(t){return String(t||"").split(/\r?\n/).map(function(x){return x.trim()}).filter(Boolean)}
/* ---- wording. copy.js + engine.js give the words; if either file is missing (or does not know a key),
   the old built-in wording below is used instead, so the shop keeps working. ---- */
/* the one place that checks whether the copy engine loaded. Returns CDE when it can give wording for key (any key when key is omitted). */
function eng(key){
  try{if(typeof CDE==="undefined"||!CDE||typeof CDE.html!=="function"||typeof CDE.text!=="function")return null;
    if(key==null)return CDE;
    return (typeof CDE.has==="function"?CDE.has(key):!!(CDE.def&&CDE.def(key)))?CDE:null}catch(e){return null}}
/* plain text of a key ("" when it resolves to nothing); fb when the engine cannot give it */
function ct(key,fb,ex){var C=eng(key);fb=fb==null?"":String(fb);if(!C)return fb;try{var t=C.text(key,STORE,ex||X);return C.plain?C.plain(t,STORE):t}catch(e){return fb}}
/* escaped markup of a key ("" when it resolves to nothing); fb (already markup) when the engine cannot give it */
function ch(key,fb,ex){var C=eng(key);fb=fb==null?"":String(fb);if(!C)return fb;try{return pvLinks(C.html(key,STORE,ex||X))}catch(e){return fb}}
/* lines of a key; fb (array) when the engine cannot give them */
function cl(key,fb,ex){var C=eng(key);if(!C)return fb||[];try{return C.resolved(key,STORE,ex||X)}catch(e){return fb||[]}}
/* one line of text as safe markup: **bold**, on-site links and the shop email when the engine is there, escaped text when not */
function cinl(s){var C=eng();if(!C||!C.inlineHtml)return esc(s);try{return pvLinks(C.inlineHtml(s,STORE))}catch(e){return esc(s)}}
function cplain(s){var C=eng();try{return C&&C.plain?C.plain(s,STORE):String(s)}catch(e){return String(s)}}
/* a product field ({src, text}): the product's own text, else the suggested wording for its type */
function pfield(field,p){var own=String(p[field]==null?"":p[field]).trim(),C=eng();if(!C||!C.productField)return {src:own?"yours":"none",text:own};
  try{return C.productField(field,p,STORE,X)}catch(e){return {src:own?"yours":"none",text:own}}}
/* the product tokens, plus {oneSize} ("yes" when the piece has no size list: caps, beanies), so size-swap lines can skip those pieces */
function ptok(p){var C=eng(),e={},k;for(k in X)if(Object.prototype.hasOwnProperty.call(X,k))e[k]=X[k];e.oneSize=sizeList(p).length?"":"yes";
  try{return C&&C.productTokens?C.productTokens(p,STORE,e):e}catch(x){return e}}
/* in preview mode, links to our own pages keep ?preview=1 */
function pvHref(h){h=String(h==null?"":h);if(!PV||!/^(?:index|shop|about|contact|help|product)\.html(?:[?#]|$)/.test(h)||/[?&]preview=1(?:&|#|$)/.test(h))return h;
  var i=h.indexOf("#"),base=i<0?h:h.slice(0,i),hash=i<0?"":h.slice(i);return base+(base.indexOf("?")<0?"?":"&")+"preview=1"+hash}
function pvLinks(html){html=String(html==null?"":html);if(!PV)return html;return html.replace(/href="([^"]*)"/g,function(m,h){var d=h.replace(/&amp;/g,"&"),n=pvHref(d);return n===d?m:'href="'+esc(n)+'"'})}
/* ---- make the shop safe against bad or missing data ---- */
function social(v,base){v=String(v||"").trim();if(!v)return "";if(/^https?:\/\//i.test(v))return v.replace(/[?#].*$/,"");v=v.replace(/^@/,"");return /^[A-Za-z0-9._]+$/.test(v)?base+v:""}
/* business details and the owner's own wording: plain objects of trimmed strings, at most 4000 characters each */
function strMap(o){var r={},k,v;if(!o||typeof o!=="object"||Array.isArray(o))return r;
  for(k in o){if(!Object.prototype.hasOwnProperty.call(o,k)||k in Object.prototype)continue;v=o[k];if(typeof v==="number"&&isFinite(v))v=String(v);if(typeof v!=="string")continue;v=v.trim().slice(0,4000).trim();if(v)r[k]=v}return r}
function normalize(){
  if(!STORE||typeof STORE!=="object"||Array.isArray(STORE))STORE={};
  var d={brand:"",announce:"",heroTitle:"",heroText:"",shopTitle:"",currency:"",delivery:"",returns:"",privacy:"",terms:"",priceNote:"",perks:""};
  for(var k in d){var v=STORE[k];STORE[k]=typeof v==="string"?v:(typeof v==="number"&&isFinite(v)?String(v):"")}
  STORE.brand=STORE.brand.trim()||"Our Store";STORE.currency=STORE.currency.trim()||"$";
  STORE.freeShip=Math.max(0,+STORE.freeShip||0);
  STORE.facts=strMap(STORE.facts);STORE.copy=strMap(STORE.copy);
  STORE.email=String(STORE.orderEmail||STORE.email||"").trim().toLowerCase();if(!/^[^\s@?&,%=;<>"']+@[^\s@?&,%=;<>"']+\.[^\s@?&,%=;<>"']+$/.test(STORE.email))STORE.email="";
  STORE.formUrl=/^https:\/\//.test(String(STORE.formUrl||"").trim())?String(STORE.formUrl).trim():"";
  STORE.instagram=social(STORE.instagram,"https://instagram.com/");STORE.tiktok=social(STORE.tiktok,"https://www.tiktok.com/@");
  if(!Array.isArray(PRODUCTS))PRODUCTS=[];
  var used={},maxId=0;
  PRODUCTS.forEach(function(p){if(p&&+p.id>maxId)maxId=+p.id});
  PRODUCTS=PRODUCTS.filter(function(p){return p&&typeof p==="object"}).map(function(p){
    var id=+p.id;if(!id||used[id])id=++maxId;used[id]=1;
    var imgs=(Array.isArray(p.images)?p.images:(p.image?[p.image]:[])).map(function(x){return String(x==null?"":x).trim()}).filter(Boolean).slice(0,5);
    function T(v){return String(v==null?"":v)}
    return {id:id,images:imgs,tagline:T(p.tagline).trim(),modelNote:T(p.modelNote).trim(),materials:T(p.materials),specs:T(p.specs),features:T(p.features),performance:T(p.performance),sizeGuide:T(p.sizeGuide),soldSizes:T(p.soldSizes),group:T(p.group).trim(),colorName:T(p.colorName).trim(),name:String(p.name||"").trim()||"Untitled",cat:String(p.cat||"").trim()||"Other",type:SHAPES[p.type]?p.type:"tee",
      price:Math.max(0,+p.price||0),was:Math.max(0,+p.was||0),color:/^#[0-9a-f]{6}$/i.test(p.color||"")?p.color:"#227d47",image:imgs[0]||"",
      status:(p.status==="soldout"||p.status==="hidden"||p.status==="soon")?p.status:"live",tag:String(p.tag||""),sizes:p.sizes==null?undefined:String(p.sizes),desc:String(p.desc||"")}})
}
document.addEventListener("error",function(e){
  var t=e.target;if(t&&t.tagName==="IMG"&&t.dataset&&t.dataset.type){
    var s=document.createElement("span");s.innerHTML='<svg viewBox="0 0 200 220" '+(t.alt?'role="img" aria-label="'+esc(t.alt)+'"':'aria-hidden="true"')+' fill="'+esc(t.dataset.color||"#227d47")+'">'+(SHAPES[t.dataset.type]||SHAPES.tee)+'</svg>';t.replaceWith(s.firstChild)}
},true);
/* what a photo shows: "Robe Hoodie in Yellow" */
function altOf(p){return p.name+(p.colorName?" in "+p.colorName:"")}
function svgArt(p){return '<svg viewBox="0 0 200 220" role="img" aria-label="'+esc(altOf(p))+'" fill="'+esc(p.color)+'">'+(SHAPES[p.type]||SHAPES.tee)+'</svg>'}
function imgTag(src,p,extra){extra=extra||"";return '<img src="'+esc(src)+'"'+(/\balt=/.test(extra)?'':' alt="'+esc(altOf(p))+'"')+' loading="lazy" data-type="'+esc(p.type)+'" data-color="'+esc(p.color)+'"'+extra+'>'}
function art(p){return p.image?imgTag(p.image,p)+(p.images[1]?imgTag(p.images[1],p,' class="alt" aria-hidden="true" alt=""'):''):svgArt(p)}
/* ---- page frame ---- */
var TITLE0=document.title,META0={};
["description","og:title","og:description"].forEach(function(n){var m=metaEl(n);META0[n]=m?m.getAttribute("content"):null});
function metaEl(n){return document.querySelector(n.indexOf("og:")===0?'meta[property="'+n+'"]':'meta[name="'+n+'"]')}
function setMeta(n,v){var m=metaEl(n);if(m&&v!=null)m.setAttribute("content",v)}
function setInert(on){document.querySelectorAll("header.top,main,footer.foot,.promo,.pvbar,.stickybar").forEach(function(e){if(on)e.setAttribute("inert","");else e.removeAttribute("inert")})}
function openCart(){document.body.classList.add("cart-open");drawCart();setInert(true);var c=$("#close");if(c)c.focus()}
function closeCart(){if(!document.body.classList.contains("cart-open"))return;document.body.classList.remove("cart-open");setInert(false);var o=$("#open");if(o)o.focus()}
function closeMenu(){var n=$("#nav"),m=$("#menu");if(n)n.classList.remove("open");if(m)m.setAttribute("aria-expanded","false")}
function foot(){
  var y=new Date().getFullYear(),h=function(f,t){return '<a href="'+pvHref(f)+'">'+t+'</a>'},hl=function(t,id){return '<a href="'+url("help.html")+'#'+id+'">'+t+'</a>'};
  var fol=[STORE.instagram?'<a href="'+esc(STORE.instagram)+'" target="_blank" rel="noopener">Instagram</a>':'',STORE.tiktok?'<a href="'+esc(STORE.tiktok)+'" target="_blank" rel="noopener">TikTok</a>':'',STORE.email?'<a href="mailto:'+esc(STORE.email)+'">Email us</a>':''].filter(Boolean).join("");
  var tag=ch("footerTagline",""),legal=ch("footerLegal","")||"&copy; "+y+" "+esc(STORE.brand);
  return '<footer class="foot"><div class="wrap fgrid"><div><b>'+esc(STORE.brand)+'</b>'+(tag?'<p class="ftag">'+tag+'</p>':'')+'<p class="fine legal">'+legal+'</p></div>'+
   '<nav aria-label="Shop"><b>Shop</b>'+h("shop.html","All products")+(live().some(onSale)?h("shop.html?sale=1","Sale"):"")+h("about.html","About")+'</nav>'+
   '<nav aria-label="Help"><b>Help</b>'+hl("Shipping","shipping")+hl("Returns","returns")+hl("FAQ","faq")+hl("Size guide","sizing")+hl("Privacy","privacy")+hl("Terms","terms")+h("contact.html","Contact")+'</nav>'+
   (fol?'<nav aria-label="Follow"><b>Follow</b>'+fol+'</nav>':'')+'</div></footer>'}
function layout(){
  var page=document.body.dataset.page;
  /* the static pages' own <title> is kept; product pages set theirs in productPage() */
  var ban=ct("bannerDrop","")||ct("announce",STORE.announce);
  var L=[["index.html","Home","home"],["shop.html","Shop","shop"],["about.html","About","about"],["contact.html","Contact","contact"]];
  $("#site-header").innerHTML='<a class="skip" href="#main">Skip to content</a>'+(PV?'<div class="pvbar" role="region" aria-label="Preview">Preview mode: you are seeing your saved changes, not the live site yet.</div>':'')+(ban?'<div class="promo" role="region" aria-label="Announcement">'+esc(ban)+'</div>':'')+'<header class="top"><div class="wrap"><a class="logo" href="'+url("index.html")+'">'+esc(STORE.brand)+'</a><nav class="links" id="nav" aria-label="Main">'+
   L.map(function(l){return '<a href="'+url(l[0])+'"'+(page===l[2]?' class="on" aria-current="page"':'')+'>'+l[1]+'</a>'}).join("")+
   '</nav><div class="acts"><button class="btn ghost menu" id="menu" aria-expanded="false" aria-controls="nav">Menu</button><button class="btn" id="open" aria-label="Open cart" aria-haspopup="dialog">Cart <span class="count" id="count">0</span></button></div></div></header>';
  var mn=document.querySelector("main");if(mn){mn.id="main";mn.setAttribute("tabindex","-1")}
  $("#site-footer").innerHTML=foot()+
   '<div class="shade" id="shade"></div><aside class="drawer" id="drawer" role="dialog" aria-modal="true" aria-labelledby="dtitle"><div class="dhead"><h2 id="dtitle">Your cart <small id="dcount"></small></h2><button class="dx" id="close" aria-label="Close cart"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg></button></div><div class="meter dmeter" id="meterwrap"><i id="bar"></i></div><div class="dsub"><div class="srow"><span>Subtotal:</span><b id="subtotal"></b></div><div class="srow" id="postrow" hidden><span>Postage:</span><b id="postage"></b></div><div class="ship" id="ship"></div><div class="pnote" id="pnote"></div></div><details class="dship" id="dship"><summary>Shipping &amp; returns</summary><div id="shipinfo"></div></details><div class="rows" id="rows"></div><div class="also" id="alsowrap" hidden><h3>You may also like</h3><div class="alsol" id="also"></div></div><div class="dfoot"><div class="srow"><b>TOTAL:</b><b id="total"></b></div><div id="chkmsg" role="status"></div><button class="btn" id="checkout">CHECKOUT</button><p class="pnote cartnote" id="cnote" hidden></p><button class="keep" id="close2">Keep shopping</button></div></aside>';$("#open").onclick=openCart;
  $("#close").onclick=$("#close2").onclick=$("#shade").onclick=closeCart;
  $("#checkout").onclick=checkout;
  $("#menu").onclick=function(){var n=$("#nav"),o=n.classList.toggle("open");this.setAttribute("aria-expanded",o?"true":"false");if(o){var f=n.querySelector("a");if(f)f.focus()}};
  $("#nav").onclick=function(e){if(e.target.tagName==="A")closeMenu()};
  $("#also").onclick=function(e){var b=e.target.closest("button[data-add]");if(b){addToCart(+b.dataset.add,"")}};
  $("#rows").onclick=function(e){
    var b=e.target.closest("button");if(!b)return;var i=+b.dataset.i,c=cart[i];if(!c)return;
    if(b.dataset.a==="inc")c.qty=Math.min(9,c.qty+1);
    if(b.dataset.a==="dec")c.qty=Math.max(1,c.qty-1);
    if(b.dataset.a==="rm")cart.splice(i,1);
    save();drawCart();
    var again=$('#rows [data-a="'+b.dataset.a+'"][data-i="'+i+'"]')||$('#rows [data-a="inc"]')||$("#close");if(again&&again.focus)again.focus();
    var lv=$("#chkmsg");if(lv&&b.dataset.a!=="rm"&&cart[i])lv.textContent="Quantity "+cart[i].qty+". Subtotal "+$("#subtotal").textContent+".";else if(lv)lv.textContent="Item removed. Subtotal "+$("#subtotal").textContent+"."};
  /* [data-s]: wording from copy.js when it has the key, else the store field as before */
  var OLD_S={heroTitle:"Welcome",shopTitle:"Shop"};
  document.querySelectorAll("[data-s]").forEach(function(el){var k=el.dataset.s,v=ct(k,STORE[k]==null||STORE[k]===""?(OLD_S[k]||""):STORE[k]);el.textContent=v;el.hidden=!/\S/.test(v)});
  drawCart();
}
/* ---- page wording hooks: [data-t], [data-t-btn], [data-marquee], [data-sec]. Safe to run again (liveRefresh re-runs boot). ---- */
var SEP=" &nbsp;•&nbsp; ";
function copyFor(C,k,el){
  var kind=C.kind?C.kind(k):((C.def&&C.def(k))||{}).k,tag=el.tagName,h;
  if(kind==="items"&&tag!=="UL"&&tag!=="OL")h=C.resolved(k,STORE,X).map(function(l){return C.inlineHtml(l,STORE)}).join(" • ");
  else{h=C.html(k,STORE,X);if(tag==="P"&&/^<p>/.test(h))h=h.replace(/^<p>/,"").replace(/<\/p>$/,"").split("</p><p>").join("<br>")}
  return pvLinks(h)}
function bindCopy(){
  [].forEach.call(document.querySelectorAll("[data-t]"),function(el){
    var k=el.getAttribute("data-t"),C=eng(k),h=null;
    if(el._t0==null)el._t0=el.innerHTML;
    if(C){try{h=copyFor(C,k,el)}catch(e){h=null}}
    el.innerHTML=h==null?el._t0:h;
    el.hidden=!/\S/.test(el.textContent||"")});
  [].forEach.call(document.querySelectorAll("[data-sec]"),function(s){var ts=s.querySelectorAll("[data-t]");if(ts.length)s.hidden=![].some.call(ts,function(x){return !x.hidden})});
  [].forEach.call(document.querySelectorAll("[data-t-btn]"),function(a){
    var k=a.getAttribute("data-t-btn"),C=eng(k),b=null;
    if(a._l0==null){a._l0=a.textContent;a._h0=a.getAttribute("href")||""}
    if(C){try{b=C.btn(k,STORE,X)}catch(e){b=null}}
    var label=b&&b.label?cplain(b.label):a._l0,href=b&&b.label&&b.href?b.href:a._h0;
    a.textContent=label;if(href)a.setAttribute("href",pvHref(href));a.hidden=!/\S/.test(label)});
  [].forEach.call(document.querySelectorAll("[data-marquee]"),function(el){
    var k=el.getAttribute("data-marquee"),C=eng(k),items=null,i,
      tgt=el.classList.contains("strip")?(el.firstElementChild||el):(el.querySelector(".strip>div")||el),wrap=el.closest(".stripw")||el;
    if(tgt._t0==null)tgt._t0=tgt.innerHTML;
    if(C){try{items=C.resolved(k,STORE,X).map(cplain).filter(function(x){return /\S/.test(x)})}catch(e){items=null}}
    if(items==null)tgt.innerHTML=tgt._t0;
    else if(items.length){
      /* the strip slides by half its width, so it holds the same run twice; long enough to fill a wide screen */
      var unit=items.map(esc).join(SEP)+SEP,n=Math.max(1,Math.ceil(70/(items.join(" • ").length+3))),half="";
      for(i=0;i<n;i++)half+=unit;tgt.innerHTML=half+half}
    else tgt.innerHTML="";
    wrap.hidden=!/\S/.test(tgt.textContent||"")});
}
if(!window.__keys){window.__keys=1;document.addEventListener("keydown",function(e){if(e.key==="Escape"){closeCart();var mo=$("#nav")&&$("#nav").classList.contains("open");closeMenu();if(mo&&$("#menu"))$("#menu").focus()}
  if(e.key==="Tab"&&document.body.classList.contains("cart-open")){var d=$("#drawer");if(!d)return;var f=[].filter.call(d.querySelectorAll("a[href],button:not(:disabled),summary,input,select"),function(x){return x.offsetParent!==null});if(!f.length)return;var a=document.activeElement,first=f[0],last=f[f.length-1];if(!d.contains(a)){e.preventDefault();first.focus()}else if(e.shiftKey&&a===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&a===last){e.preventDefault();first.focus()}}})}
/* the short delivery and returns text (cart drawer and product pages) */
function shortShip(){var fs=STORE.freeShip;return ch("delivery",esc(STORE.delivery||(fs?"Free standard delivery on orders of "+moneyT(fs)+" or more.":"Ask us about delivery before you buy.")))}
function shortReturns(px){return ch("returns",esc(STORE.returns||"Ask us about returns before you buy."),px)}
/* postage fee (a business detail): added under the free-shipping amount, or always when there is no free-shipping amount */
function postageFor(total,n){var raw=String((STORE.facts||{}).shipFee||"").replace(/^\s+|\s+$/g,""),f=/^\d+(?:\.\d+)?$/.test(raw)?parseFloat(raw):0,fs=STORE.freeShip;if(!(n>0)||!(f>0)||!isFinite(f))return 0;return(!fs||total<fs)?Math.round(f*100)/100:0}
function drawCart(){
  var total=0,n=0,html="",changed=false;
  cart=cart.filter(function(c){var p=byId(c.id),ok=!!p&&p.status!=="hidden";if(!ok)changed=true;return ok});
  cart.forEach(function(c,i){var p=byId(c.id),out=!buyable(p),meta=[c.size,p.colorName].filter(Boolean).map(esc).join(" &nbsp; ");
    if(!out){total=Math.round((total+p.price*c.qty)*100)/100;n+=c.qty}
    html+='<div class="row crow'+(out?' gone':'')+'"><a class="cth" href="'+url("product.html",{id:p.id})+'" aria-hidden="true" tabindex="-1">'+(p.image?imgTag(p.image,p,' alt=""'):svgArt(p))+'</a><div class="cinfo"><div class="ctop"><a href="'+url("product.html",{id:p.id})+'">'+esc(p.name)+'</a><b>'+(out?'':money(p.price*c.qty))+'</b></div>'+
     '<div class="cmeta">'+(out?(p.status==="soon"?'Coming soon. Remove it to check out.':'Sold out. Remove it to check out.'):meta)+'</div><div class="cbot"><div class="qty2">'+
     (out?'':'<button data-a="dec" data-i="'+i+'" aria-label="One less of '+esc(p.name)+'">&minus;</button><span>'+c.qty+'</span><button data-a="inc" data-i="'+i+'" aria-label="One more of '+esc(p.name)+'">+</button>')+
     '</div><button class="rmx" data-a="rm" data-i="'+i+'" aria-label="Remove '+esc(p.name)+' from cart" title="Remove"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg></button></div></div></div>'});
  if(changed)save();
  $("#rows").innerHTML=html||'<p class="cempty">Your cart’s empty. <a href="'+url("shop.html")+'">Browse the shop.</a></p>';
  $("#count").textContent=n;$("#dcount").textContent=n?"("+n+")":"";var post=postageFor(total,n);$("#total").textContent=moneyT(Math.round((total+post)*100)/100);$("#subtotal").textContent=moneyT(total);var pr=$("#postrow");if(pr){pr.hidden=!post;$("#postage").textContent=post?moneyT(post):""}
  var fs=STORE.freeShip;$("#meterwrap").hidden=!fs;
  $("#ship").textContent=!fs?"":n===0?"Free shipping on orders of "+moneyT(fs)+" or more":total>=fs?"Free shipping unlocked":"You’re "+moneyT(Math.round((fs-total)*100)/100)+" from free shipping";
  var sd=shortShip(),sr=shortReturns();
  $("#shipinfo").innerHTML=(sd?"<p>"+sd+"</p>":"")+(sr?"<p>"+sr+"</p>":"");$("#dship").hidden=!sd&&!sr;
  $("#pnote").innerHTML=ch("priceNote",esc(STORE.priceNote));
  var cn=$("#cnote");if(cn){var t=ch("cartNote","");cn.innerHTML=t;cn.hidden=!t}
  $("#bar").style.width=fs?Math.min(100,total/fs*100)+"%":"0";
  $("#checkout").disabled=n===0;if(n===0)$("#chkmsg").textContent="";
  var inCart={};cart.forEach(function(c){inCart[c.id]=1});
  var rec=live().filter(function(p){return buyable(p)&&!inCart[p.id]}).slice(0,6);
  $("#alsowrap").hidden=!rec.length;
  $("#also").innerHTML=rec.map(function(p){var link=sizeList(p).length;
    return '<div class="amini"><a class="ath" href="'+url("product.html",{id:p.id})+'" aria-label="'+esc(p.name)+'">'+(p.image?imgTag(p.image,p,' alt=""'):svgArt(p))+'</a><div class="abot"><span>'+money(p.price)+'</span>'+(link?'<a class="aplus" href="'+url("product.html",{id:p.id})+'" aria-label="Choose size for '+esc(p.name)+'">+</a>':'<button class="aplus" data-add="'+p.id+'" aria-label="Add '+esc(p.name)+' to cart">+</button>')+'</div></div>'}).join("");
}
function checkout(){
  var m=$("#chkmsg"),lines=[],total=0;
  cart.forEach(function(c){var p=byId(c.id);if(buyable(p)){lines.push(c.qty+" x "+p.name+(c.size?" ("+c.size+")":"")+" - "+moneyT(p.price*c.qty));total=Math.round((total+p.price*c.qty)*100)/100}});
  if(!lines.length){m.textContent="Your cart is empty.";return}
  if(STORE.email){
    var post=postageFor(total,lines.length);
    if(post)lines.push("","Subtotal: "+moneyT(total),"Postage: "+moneyT(post),"Total: "+moneyT(Math.round((total+post)*100)/100));else lines.push("","Total: "+moneyT(total));
    lines.push("","Name:","Delivery address:","Phone (optional):","Anything we should know?");
    var old='Your email app should open with your order ready to send. Nothing is charged online: we reply to confirm your order and how to pay. No email app? Write to <b>'+esc(STORE.email)+'</b> and paste your order in.';
    m.innerHTML=(ch("checkoutMsg",old)||old)+'<details class="ordertext"><summary>Show my order text</summary><textarea readonly rows="9" aria-label="Your order, ready to copy">'+esc(lines.join("\n"))+'</textarea></details>';
    openMail("mailto:"+STORE.email+"?subject="+encodeURIComponent(STORE.brand+" order request")+"&body="+encodeURIComponent(lines.join("\n")));
  }else m.innerHTML='Online checkout isn’t switched on yet. Please <a href="'+url("contact.html")+'">contact us</a> to place your order.';
}
/* ---- product cards and lists ---- */
function card(p){
  var sale=isSale(p),off=sale?Math.round((1-p.price/p.was)*100):0,soon=p.status==="soon",out=p.status==="soldout",href=url("product.html",{id:p.id});
  var badge=soon?'<span class="badge soon">Coming soon</span>':out?'<span class="badge out">Sold out</span>':sale?'<span class="badge">-'+off+'%</span>':p.tag?'<span class="badge new">'+esc(p.tag)+'</span>':'';
  var btn=soon?'<button class="add" disabled>Coming soon</button>':out?'<button class="add" disabled>Sold out</button>':sizeList(p).length?'<a class="add" href="'+href+'">Choose size</a>':'<button class="add" data-id="'+p.id+'">Add to cart</button>';
  return '<article class="card">'+badge+'<a class="pic" href="'+href+'" tabindex="-1" aria-hidden="true">'+art(p)+'</a><h3><a href="'+href+'">'+esc(p.name)+'</a></h3><div class="price"><b>'+money(p.price)+'</b>'+(sale?'<s><span class="sr">Was </span>'+money(p.was)+'</s>':'')+'</div>'+btn+'</article>';
}
function wire(g){g.querySelectorAll(".add[data-id]").forEach(function(b){b.onclick=function(){addToCart(+b.dataset.id,"")}})}
function addToCart(id,size){if(!buyable(byId(id)))return;var f=cart.filter(function(c){return c.id===id&&c.size===size})[0];if(f)f.qty=Math.min(9,f.qty+1);else cart.push({id:id,size:size,qty:1});save();openCart()}
function grid(){
  var g=$("#grid");if(!g)return;
  var limit=+g.dataset.limit||999,cat=param("sale")?"Sale":(param("cat")||"All"),sort="",q="",qRaw="";
  var _s=$("#sort"),_q=$("#q");
  if(_q&&param("q"))_q.value=param("q");if(_s&&/^(low|high)$/.test(param("sort")||""))_s.value=param("sort");
  sort=_s?_s.value:"";qRaw=_q?_q.value.trim():"";q=qRaw.toLowerCase();
  function sync(){if(!_q||!history.replaceState)return;try{var u=new URLSearchParams(location.search);["sale","cat","q","sort"].forEach(function(k){u.delete(k)});if(cat==="Sale")u.set("sale","1");else if(cat!=="All")u.set("cat",cat);if(_q.value.trim())u.set("q",_q.value.trim());if(sort)u.set("sort",sort);var s=u.toString();history.replaceState(null,"",location.pathname+(s?"?"+s:""))}catch(e){}}
  var all=live(),cats=["All"];if(all.some(onSale))cats.push("Sale");all.forEach(function(p){if(cats.indexOf(p.cat)<0)cats.push(p.cat)});
  if(cats.indexOf(cat)<0){var al={pants:"Bottoms",caps:"Headwear",bottoms:"Pants",headwear:"Caps"}[String(cat).toLowerCase()];cat=al&&cats.indexOf(al)>=0?al:"All"}
  var chips=$("#chips"),catline=$("#catline"),notes=null;
  function mark(){if(chips)chips.querySelectorAll("button").forEach(function(b){b.className=b.textContent===cat?"on":"";b.setAttribute("aria-pressed",b.textContent===cat?"true":"false")})}
  /* the one-line note under the chips for the chosen category (catLines in copy.js) */
  function note(){if(!catline)return;
    if(notes==null){notes={};var C=eng("catLines");if(C&&C.map){try{notes=C.map("catLines",STORE,X)||{}}catch(e){notes={}}}}
    var key=String(cat).toLowerCase(),t=cat!=="All"&&cat!=="Sale"&&Object.prototype.hasOwnProperty.call(notes,key)?String(notes[key]):"";
    catline.innerHTML=t?cinl(t):"";catline.hidden=!t}
  function show(){
    var list=ordered(all.filter(function(p){return(cat==="All"||(cat==="Sale"?onSale(p):p.cat===cat))&&p.name.toLowerCase().indexOf(q)>-1}),sort);
    if(!list.length){
      var old=esc("New pieces are coming soon."),why=!all.length?(ch("emptyShop",old)||old):q?'Nothing matches “'+esc(qRaw)+'”. Try another word, or browse everything.':'Nothing in '+esc(cat)+' right now. See what else is live.';
      g.innerHTML='<div class="empty"><p>'+why+'</p>'+(all.length&&(q||cat!=="All")?'<button class="btn ghost" id="clr">Show everything</button>':'')+'</div>';
      var c=$("#clr");if(c)c.onclick=function(){cat="All";q="";qRaw="";if(_q)_q.value="";mark();show()};
    }else{g.innerHTML=list.slice(0,limit).map(card).join("");wire(g)}
    sync();note();var cnt=$("#count-line");if(cnt)cnt.textContent=list.length===1?"1 piece":list.length+" pieces";
  }
  if(chips){chips.innerHTML="";cats.forEach(function(c){var b=document.createElement("button");b.type="button";b.textContent=c;
    b.onclick=function(){cat=c;mark();show()};chips.appendChild(b)});mark()}
  if(_s)_s.onchange=function(){sort=_s.value;show()};
  if(_q)_q.oninput=function(){qRaw=_q.value.trim();q=qRaw.toLowerCase();show()};
  show();
}
function tiles(){
  var t=$("#tiles");if(t){var all=live(),ord=ordered(all,""),cs=[];all.forEach(function(p){if(cs.indexOf(p.cat)<0)cs.push(p.cat)});
    /* one tile per category, in the shop's order; the picture comes from the first piece in it that has a photo */
    var firsts=cs.map(function(c){var inC=ord.filter(function(p){return p.cat===c});return inC.filter(function(p){return p.image})[0]||inC[0]});
    t.innerHTML=firsts.map(function(p){return '<a class="tile" href="'+url("shop.html",{cat:p.cat})+'">'+(p.image?'<img class="timg" src="'+esc(p.image)+'" alt="" data-type="'+esc(p.type)+'" data-color="'+esc(p.color)+'">':'<svg viewBox="0 0 200 220" aria-hidden="true" fill="'+esc(p.color)+'">'+(SHAPES[p.type]||SHAPES.tee)+'</svg>')+'<span>Shop '+esc(p.cat)+'</span></a>'}).join("");
    var tsec=t.closest("section")||(t.parentNode&&t.parentNode.parentNode);if(tsec)tsec.hidden=!firsts.length}
  /* the sale banner shows only while a piece on sale can be bought; its own section goes with it */
  var b=$("#saleBanner");if(b){var best=0;live().forEach(function(p){if(onSale(p))best=Math.max(best,Math.round((1-p.price/p.was)*100))});
    var so=$("#saleOff");if(so)so.textContent=best?"Up to "+best+"% off":"";
    b.hidden=!best;b.style.display=best?"":"none";if(best)b.href=url("shop.html",{sale:1});
    var sec=b.closest("[data-sec]")||b.closest("section");
    if(sec&&(sec.hasAttribute("data-sec")||sec.textContent.trim()===b.textContent.trim()))sec.hidden=!best}
}
function seo(p,px){
  var t=TITLE0,d=META0.description,ot=META0["og:title"],od=META0["og:description"];
  if(p){t=ct("seoProductTitle","",px)||(p.name+" | "+STORE.brand);ot=t;var dd=ct("seoProductDesc","",px);if(dd){d=dd;od=dd}}
  document.title=t;setMeta("description",d);setMeta("og:title",ot);setMeta("og:description",od)}
function productPage(){
  var box=$("#product"),below=$("#below");if(!box)return;
  var oldBar=document.querySelector(".stickybar");if(oldBar)oldBar.remove();
  var p=byId(+param("id"));
  if(!p||p.status==="hidden"){seo(null);$("#pcrumbs").innerHTML='<a href="'+url("index.html")+'">Home</a> / <a href="'+url("shop.html")+'">Shop</a>';
    box.innerHTML='<div class="empty"><h1 class="nfh">We can’t find that piece</h1><p>It may have sold out or been removed.</p><a class="btn" href="'+url("shop.html")+'">Back to the shop</a></div>';if(below)below.innerHTML="";["more","style"].forEach(function(id){var e=$("#"+id);if(e&&e.parentNode)e.parentNode.hidden=true});return}
  var px=ptok(p);seo(p,px);
  var sale=isSale(p),soon=p.status==="soon",out=!buyable(p),sizes=sizeList(p),sold=sizeList({sizes:p.soldSizes}),chosen="";
  $("#pcrumbs").innerHTML='<a href="'+url("index.html")+'">Home</a> / <a href="'+url("shop.html")+'">Shop</a> / <a href="'+url("shop.html",{cat:p.cat})+'">'+esc(p.cat)+'</a> / '+esc(p.name);
  var imgs=p.images.slice(),n=imgs.length||1;
  /* left: vertical thumbnails + large image */
  var gal='<div class="gal'+(n>1?'':' one')+'">'+(n>1?'<div class="thumbs" id="thumbs">'+imgs.map(function(s,k){return '<button type="button" aria-label="Show photo '+(k+1)+' of '+n+'">'+imgTag(s,p,' alt=""')+'</button>'}).join("")+'</div>':'')+
    '<div class="stage" id="stage" tabindex="0" role="group" aria-roledescription="carousel" aria-label="Product photos (press Enter to enlarge)"><div class="big" id="bigimg"></div>'+
    (n>1?'<button class="gnav prev" id="gprev" aria-label="Previous photo">&#8249;</button><button class="gnav next" id="gnext" aria-label="Next photo">&#8250;</button><div class="dots" id="dots" aria-hidden="true">'+imgs.map(function(){return '<i></i>'}).join("")+'</div>':'')+
    '<span class="gcount" id="gcount" aria-live="polite"></span></div></div>';
  /* right: stacked panels */
  var sibs=p.group?live().filter(function(x){return x.group&&x.group.toLowerCase()===p.group.toLowerCase()}):[];
  /* sold out / coming soon: a note from copy.js, and a way to hear about the next drop */
  var note="";
  if(out){note=soon?(ch("soonNote","",px)||'Coming soon.'):(ch("soldNote","",px)||'Sold out.');
    if(!/href="[^"]*#join"/.test(note))note+=' <a href="'+url("index.html")+'#join">Tell me about the next drop</a>'}
  var pn=ch("priceNote",esc(STORE.priceNote)),dl=out?"":ch("productDropLine","",px);
  var head='<section class="pnl"><h1>'+esc(p.name)+'</h1><div class="price pbig"><b>'+money(p.price)+'</b>'+(sale?'<s><span class="sr">Was </span>'+money(p.was)+'</s> <span class="off">-'+Math.round((1-p.price/p.was)*100)+'%</span>':'')+'</div>'+(pn?'<p class="pnote">'+pn+'</p>':'')+(dl?'<p class="dropline">'+dl+'</p>':'')+
    (p.tagline?'<p class="tagline">'+esc(p.tagline)+'</p>':'')+(out?'<p class="soldnote'+(soon?' soonnote':'')+'">'+note+'</p>':(p.tag?'<p class="ptag">'+esc(p.tag)+'</p>':''))+'</section>';
  var col=sibs.length>1?'<section class="pnl colours"><b>Colour <small>'+sibs.length+'</small> <span>'+esc(p.colorName||"")+'</span></b><div class="swl">'+sibs.map(function(x){return '<a href="'+url("product.html",{id:x.id})+'" class="'+(x.id===p.id?'cur':'')+'" title="'+esc(x.colorName||x.name)+'" aria-label="'+esc(x.colorName||x.name)+(x.id===p.id?' (selected)':'')+'"'+(x.id===p.id?' aria-current="true"':'')+'>'+(x.image?'<img src="'+esc(x.image)+'" alt="">':'<i style="background:'+esc(x.color)+'"></i>')+'</a>'}).join("")+'</div></section>':'';
  var sg=rows(p.sizeGuide),mf=pfield("modelNote",p),mn=(mf.src==="suggested"&&!p.images.length)?"":rows(mf.text).map(cinl).join("<br>");
  var notify=sold.length&&!out?(STORE.email?'<a href="mailto:'+esc(STORE.email)+'?subject='+encodeURIComponent("Notify me: "+p.name)+'">Size not in stock?</a>':'<a href="'+url("contact.html")+'">Size not in stock?</a>'):'';
  var sz=sizes.length?'<section class="pnl"><div class="szhead"><b id="szlab">Size</b>'+notify+'</div><div class="sizes" id="sizes" role="group" aria-labelledby="szlab">'+sizes.map(function(s){var no=out||sold.indexOf(s)>-1;return '<button type="button" aria-pressed="false"'+(no?' disabled class="na" title="Out of stock"':'')+'>'+esc(s)+'</button>'}).join("")+'</div><small id="szmsg" role="alert"></small>'+
    (sg.length?'<button type="button" class="findsize" id="findsize">Find your perfect size</button>':'')+
    (mn||sg.length?'<p class="modelnote">'+mn+(sg.length?(mn?'<br>':'')+'<a href="#sizeguide" id="sgl">Size chart</a>':'')+'</p>':'')+'</section>':(p.type==="cap"&&p.sizes===undefined?'<section class="pnl onesize"><b>Size</b> <span>One size</span></section>':'');
  var oldPerks=rows(STORE.perks);if(!oldPerks.length&&STORE.freeShip)oldPerks=["Free shipping on orders of "+moneyT(STORE.freeShip)+" or more"];
  var perks=cl("perks",oldPerks,px);
  var info=perks.length?'<section class="pnl perks">'+perks.map(function(r){return '<p>'+cinl(r)+'</p>'}).join("")+'</section>':'';
  var buy='<button class="btn buy" id="bag"'+(out?' disabled':'')+'>'+(soon?'Coming soon':out?'Sold out':'Add to cart')+'</button>';
  box.innerHTML=gal+'<div class="info">'+head+col+sz+info+buy+'</div>';
  /* below: feature tiles, performance, intro, accordions */
  var feats=rows(p.features).slice(0,3).map(function(r){var a=r.split("|").map(function(x){return x.trim()});return {t:a[0],d:a[1]||"",i:a[2]||""}});
  var perf=rows(p.performance).slice(0,3).map(function(r){var a=r.split("|").map(function(x){return x.trim()}),v=Math.min(5,Math.max(0,parseFloat(a[1])||0));return {t:a[0],v:v,d:a[2]||""}});
  var h="";
  if(feats.length)h+='<div class="ftiles">'+feats.map(function(f){return '<div class="ft">'+(f.i?'<img src="'+esc(f.i)+'" alt="" loading="lazy">':'')+'<div class="cap"><b>'+esc(f.t)+'</b>'+(f.d?'<span>'+esc(f.d)+'</span>':'')+'</div></div>'}).join("")+'</div>';
  if(perf.length)h+='<h2 class="sh">Performance</h2><div class="perf">'+perf.map(function(f){var segs="";for(var k=0;k<5;k++)segs+='<i><u style="width:'+Math.round(Math.min(1,Math.max(0,f.v-k))*100)+'%"></u></i>';
    return '<div class="pf"><div class="pt"><b>'+esc(f.t)+'</b><span>'+f.v+'/5</span></div><div class="bars" role="img" aria-label="'+esc(f.t)+' '+f.v+' out of 5">'+segs+'</div>'+(f.d?'<small>'+esc(f.d)+'</small>':'')+'</div>'}).join("")+'</div>';
  /* the description: the piece's own words (one paragraph per line), or the suggested wording as one paragraph */
  var D=pfield("desc",p),dls=rows(D.text);
  if(dls.length)h+=D.src==="yours"?dls.map(function(l){return '<p class="intro">'+cinl(l)+'</p>'}).join(""):'<p class="intro">'+cinl(dls.join(" "))+'</p>';
  var acc=[],spec=rows(pfield("specs",p).text),mat=rows(pfield("materials",p).text);
  if(spec.length)acc.push(["Specifications",'<ul>'+spec.map(function(r){return '<li>'+cinl(r)+'</li>'}).join("")+'</ul>',""]);
  if(mat.length)acc.push(["Materials",mat.map(function(r){return '<p>'+cinl(r)+'</p>'}).join(""),""]);
  if(sg.length)acc.push(["Size guide",'<div class="tw"><table>'+sg.map(function(r,k){var c=r.split("|").map(function(x){return esc(x.trim())});return '<tr>'+c.map(function(x){return k===0?'<th scope="col">'+x+'</th>':'<td>'+x+'</td>'}).join("")+'</tr>'}).join("")+'</table></div>',"sizeguide"]);
  var sd=shortShip(),sr=shortReturns(px);
  if(sd||sr)acc.push(["Shipping & Returns",(sd?'<p>'+sd+'</p>':'')+(sr?'<p>'+sr+'</p>':''),""]);
  h+='<div class="accs">'+acc.map(function(a){return '<details'+(a[2]?' id="'+a[2]+'"':'')+'><summary>'+esc(a[0])+'</summary><div>'+a[1]+'</div></details>'}).join("")+'</div>';
  if(below)below.innerHTML=h;
  /* gallery behaviour */
  var cur=0,big=$("#bigimg");
  function show(k){cur=(k+n)%n;big.innerHTML=imgs.length?imgTag(imgs[cur],p,' draggable="false"'):svgArt(p);$("#gcount").textContent=n>1?(cur+1)+" / "+n:"";
    document.querySelectorAll("#thumbs button").forEach(function(b,x){b.className=x===cur?"on":"";b.setAttribute("aria-current",x===cur?"true":"false")});
    document.querySelectorAll("#dots i").forEach(function(d,x){d.className=x===cur?"on":""})}
  show(0);
  document.querySelectorAll("#thumbs button").forEach(function(b,x){b.onclick=function(){show(x)}});
  if(n>1){$("#gprev").onclick=function(){show(cur-1)};$("#gnext").onclick=function(){show(cur+1)};
    $("#stage").onkeydown=function(e){if(e.key==="ArrowLeft")show(cur-1);if(e.key==="ArrowRight")show(cur+1);if(e.key==="Enter"&&e.target===this&&big.onclick){e.preventDefault();big.onclick()}};
    var sx=null;$("#stage").addEventListener("touchstart",function(e){sx=e.touches[0].clientX},{passive:true});
    $("#stage").addEventListener("touchend",function(e){if(sx===null)return;var dx=e.changedTouches[0].clientX-sx;sx=null;if(Math.abs(dx)>40)show(cur+(dx<0?1:-1))},{passive:true})}
  big.onclick=function(){if(!imgs.length)return;var lb=document.createElement("div");lb.className="lightbox";lb.setAttribute("role","dialog");lb.setAttribute("aria-modal","true");lb.setAttribute("aria-label","Enlarged photo");var opener=document.activeElement;lb.innerHTML='<button aria-label="Close">&times;</button>'+imgTag(imgs[cur],p);
    function close(){lb.remove();document.removeEventListener("keydown",k);if(opener&&opener.focus)opener.focus()}function k(e){if(e.key==="Escape")close();if(e.key==="Tab"){e.preventDefault();lb.querySelector("button").focus()}}document.addEventListener("keydown",k);lb.onclick=close;document.body.appendChild(lb);lb.querySelector("button").focus()};
  /* sizes + cart (main panel and sticky bar share one choice) */
  function setSize(s){chosen=s;document.querySelectorAll("#sizes button").forEach(function(x){var on=x.textContent===s;x.classList.toggle("on",on);x.setAttribute("aria-pressed",on?"true":"false")});var ss=$("#ssize");if(ss)ss.value=s;var m=$("#szmsg");if(m)m.textContent=""}
  document.querySelectorAll("#sizes button:not(:disabled)").forEach(function(b){b.onclick=function(){setSize(b.textContent)}});
  function buy2(){if(sizes.length&&!chosen){var m=$("#szmsg");if(m)m.textContent="Pick a size first.";var f=$("#sizes button:not(:disabled)");if(f){f.scrollIntoView({block:"center"});f.focus()}return}addToCart(p.id,chosen)}
  $("#bag").onclick=buy2;
  function openGuide(e){e.preventDefault();var g=$("#sizeguide");if(g){g.open=true;g.scrollIntoView({behavior:"smooth",block:"center"})}}
  var fs=$("#findsize");if(fs)fs.onclick=openGuide;var sgl=$("#sgl");if(sgl)sgl.onclick=openGuide;
  /* sticky buy bar */
  if(!out){var bar=document.createElement("div");bar.className="stickybar";bar.hidden=true;
    bar.innerHTML=(sibs.length>1?'<label>Colour<select id="scol">'+sibs.map(function(x){return '<option value="'+x.id+'"'+(x.id===p.id?' selected':'')+'>'+esc(x.colorName||x.name)+'</option>'}).join("")+'</select></label>':'<span class="sc">'+esc(p.name)+'</span>')+
      (sizes.length?'<label>Size<select id="ssize"><option value="">Pick a size</option>'+sizes.map(function(s){return '<option'+(sold.indexOf(s)>-1?' disabled':'')+'>'+esc(s)+'</option>'}).join("")+'</select></label>':'')+
      '<button class="btn" id="sbuy">Add to cart <b>'+money(p.price)+'</b></button>';
    document.body.appendChild(bar);
    var sc=$("#scol");if(sc)sc.onchange=function(){location.href=url("product.html",{id:sc.value})};
    var ss=$("#ssize");if(ss)ss.onchange=function(){if(ss.value)setSize(ss.value);else{chosen="";setSize("")}};
    $("#sbuy").onclick=buy2;
    if(window.__sbh)window.removeEventListener("scroll",window.__sbh);
    window.__sbh=function(){var b=$("#bag");if(!b||!bar.isConnected)return;var r=b.getBoundingClientRect();bar.hidden=!(r.bottom<0)||document.body.classList.contains("cart-open")};
    window.addEventListener("scroll",window.__sbh,{passive:true})}
  /* style with + more like this */
  var st=$("#style");if(st){var seen={},pick2=[];live().filter(function(x){return x.id!==p.id&&buyable(x)}).forEach(function(x){if(x.cat!==p.cat&&!seen[x.cat]){seen[x.cat]=1;pick2.push(x)}});pick2=pick2.slice(0,4);
    st.innerHTML=pick2.map(card).join("");wire(st);if(st.parentNode)st.parentNode.hidden=!pick2.length}
  var more=$("#more");if(more){var rest=ordered(live().filter(function(x){return x.id!==p.id&&x.cat===p.cat}),"").slice(0,4);
    more.innerHTML=rest.map(card).join("");wire(more);if(more.parentNode)more.parentNode.hidden=rest.length<2}
}
function helpPage(){
  var h=$("#help");if(!h)return;
  var contact=STORE.email?'Email us at <a href="mailto:'+esc(STORE.email)+'">'+esc(STORE.email)+'</a>.':'Use the <a href="'+url("contact.html")+'">contact page</a>.';
  function old(t){t=String(t||"").trim();return t?t.split(/\n+/).map(function(l){return '<p>'+esc(l)+'</p>'}).join(""):""}
  /* [anchor, heading, copy key, old wording, what is still being written] */
  var S=[["shipping","Shipping","shippingFull",old(STORE.delivery),"shipping information"],["returns","Returns","returnsFull",old(STORE.returns),"returns policy"],["faq","FAQ","faq","","FAQ"],
    ["sizing","Size guide","sizeGuideText","","size guide"],["privacy","Privacy","privacy",old(STORE.privacy),"privacy policy"],["terms","Terms","terms",old(STORE.terms),"terms of sale"]];
  h.innerHTML=S.map(function(x){var b=ch(x[2],x[3]);return '<details id="'+x[0]+'"><summary>'+x[1]+'</summary><div>'+(b||'<p>We are still writing our '+x[4]+'. '+contact+'</p>')+'</div></details>'}).join("")+'<p class="hnote">Questions? '+contact+'</p>';
  openHash();
}
/* open the Help section a link points at (on load and when a link on this page changes the #) */
function openHash(){var id=(location.hash||"").replace("#",""),d=id&&document.getElementById(id);if(d&&d.tagName==="DETAILS"){d.open=true}}
if(!window.__hash){window.__hash=1;window.addEventListener("hashchange",function(){if($("#help"))openHash()})}
function handles(){var e=$("#handles");if(!e)return;var a=[STORE.instagram?'<a href="'+esc(STORE.instagram)+'" target="_blank" rel="noopener">Instagram</a>':'',STORE.tiktok?'<a href="'+esc(STORE.tiktok)+'" target="_blank" rel="noopener">TikTok</a>':''].filter(Boolean);e.innerHTML=a.join(" &nbsp;|&nbsp; ");e.hidden=!a.length}
function boot(){
  try{normalize();var C=eng();X={};if(C&&C.productsCtx){try{X=C.productsCtx(PRODUCTS)||{}}catch(e){X={}}}
    layout();bindCopy();grid();tiles();productPage();helpPage();handles();
    if(PV)[].forEach.call(document.querySelectorAll("a[href]"),function(a){var h=a.getAttribute("href"),n=pvHref(h);if(n!==h)a.setAttribute("href",n)})}
  catch(err){var m=document.querySelector("main");if(m)m.innerHTML='<div class="wrap"><p class="empty" style="padding:60px 0">Something went wrong loading this page. Please refresh. If it keeps happening, try again in a few minutes.</p></div>'}
}
/* ---- live data from GitHub ---- */
var GH_DEFAULT={owner:"sankar122234",repo:"cultdrip",branch:"main",path:"data.js"},RAW="";
function ghRepo(){var h=location.hostname,p=location.pathname.split("/")[1];
  if(/\.github\.io$/.test(h)&&p&&p.indexOf(".")<0)return {owner:h.split(".")[0],repo:p,branch:"main",path:"data.js"};
  return GH_DEFAULT}
function parseData(text){text=String(text);if(text.length>2000000)return null;var m=text.match(/^\s*(?:\/\*[\s\S]*?\*\/\s*)?var STORE\s*=/);var a=text.indexOf('var STORE'),b=text.indexOf(';\nvar PRODUCTS');if(b<0)b=text.search(/;\s*var PRODUCTS\s*=/);if(a<0||b<0)return null;var sTxt=text.slice(a).replace(/^var STORE\s*=\s*/,'').slice(0,b-a-(text.slice(a).match(/^var STORE\s*=\s*/)||[''])[0].length);var rest=text.slice(b).replace(/^;\s*var PRODUCTS\s*=\s*/,'').replace(/;\s*$/,'');try{return{STORE:JSON.parse(sTxt),PRODUCTS:JSON.parse(rest)}}catch(e){return null}}
function liveRefresh(){
  if((PV&&HAS_DRAFT)||!window.fetch)return;
  var key="cd_live",now=Date.now(),c=null;try{c=JSON.parse(sessionStorage.getItem(key)||"null")}catch(e){}
  function apply(d){
    if(!d||!d.STORE||typeof d.STORE!=="object"||!Array.isArray(d.PRODUCTS)||!d.PRODUCTS.length)return; /* ignore empty or damaged data */
    var nk;try{nk=JSON.stringify({s:d.STORE,p:d.PRODUCTS})}catch(e){return}
    if(nk!==RAW){RAW=nk;STORE=d.STORE;PRODUCTS=d.PRODUCTS;boot()}}
  if(c&&now-c.t<20000){apply(parseData(c.text));return}
  var r=ghRepo();
  fetch("https://api.github.com/repos/"+r.owner+"/"+r.repo+"/contents/"+r.path+"?ref="+r.branch,{headers:{Accept:"application/vnd.github.raw+json"},cache:"no-store"})
   .then(function(res){if(!res.ok)throw 0;return res.text()})
   .then(function(t){try{sessionStorage.setItem(key,JSON.stringify({t:now,text:t}))}catch(e){}apply(parseData(t))})
   .catch(function(){});
}
try{RAW=JSON.stringify({s:STORE,p:PRODUCTS})}catch(e){RAW=""}
boot();liveRefresh();(function(){var b=$("#spause");if(b)b.onclick=function(){var on=document.body.classList.toggle("nomotion");this.setAttribute("aria-pressed",on?"true":"false");this.textContent=on?"Play motion":"Pause motion"}})();
/* ---- forms ---- */
var EMAIL_IN=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
var sending=false;
function sendForm(data,okMsg,mailSubject,mailBody,reset){
  var ok=$("#ok")||document.createElement("div");
  if(sending)return;
  if(window.MutationObserver&&!ok._w){ok._w=1;new MutationObserver(function(){try{ok.scrollIntoView({block:"nearest",behavior:"smooth"})}catch(e){}}).observe(ok,{childList:true,characterData:true,subtree:true})}
  if(STORE.formUrl&&window.fetch){sending=true;ok.textContent="Sending…";
    fetch(STORE.formUrl,{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(data)})
     .then(function(r){sending=false;if(!r.ok)throw 0;ok.textContent=okMsg;reset()})
     .catch(function(){sending=false;ok.textContent="That didn’t send. Check your connection and try again"+(STORE.email?", or email "+STORE.email+".":".")});return}
  if(STORE.email){ok.textContent="Your email app should open with everything ready to send. Nothing is sent until you press send there.";openMail("mailto:"+STORE.email+"?subject="+encodeURIComponent(mailSubject)+"&body="+encodeURIComponent(mailBody));return}
  ok.textContent="This form isn’t switched on yet, so nothing was sent. Please check back soon."}
/* a field problem: say what to do in the status line, mark the field and put the cursor in it */
function fieldErr(el,msg){var ok=$("#ok");if(ok)ok.textContent=msg;if(el){el.setAttribute("aria-invalid","true");try{el.focus()}catch(e){}}}
function fieldsOk(form){[].forEach.call(form.querySelectorAll("[aria-invalid]"),function(x){x.removeAttribute("aria-invalid")})}
function fld(form,name,i){var e=form.elements.namedItem?form.elements.namedItem(name):null;return e&&e.tagName?e:form.elements[i]}
var f=$("#f");if(f){f.noValidate=true;f.onsubmit=function(e){e.preventDefault();var inp=f.querySelector('input[type="email"],input[name="email"]')||f.elements[0],em=inp.value.trim();fieldsOk(f);
  if(!em)return fieldErr(inp,"Add your email so we can reach you.");
  if(!EMAIL_IN.test(em))return fieldErr(inp,"That email doesn’t look right. Check it and try again.");
  sendForm({email:em,type:"member signup"},"Welcome to the Cult. You’re on the list. Watch your inbox before the next drop.","Add me to the member list","Please add this email to the member list: "+em,function(){f.reset()})}}
var c=$("#contact");if(c){c.noValidate=true;c.onsubmit=function(e){e.preventDefault();var N=fld(c,"name",0),M=fld(c,"email",1),G=fld(c,"message",2),n=N.value.trim(),em=M.value.trim(),m=G.value.trim();fieldsOk(c);
  if(!n)return fieldErr(N,"Add your name so we know who to reply to.");
  if(!em)return fieldErr(M,"Add your email so we can reach you.");
  if(!EMAIL_IN.test(em))return fieldErr(M,"That email doesn’t look right. Check it and try again.");
  if(!m)return fieldErr(G,"Write a few words so we know how to help.");
  sendForm({name:n,email:em,message:m},ct("contactSent","")||"Thanks, your message was sent. We’ll reply by email.","Message from "+n,m+"\n\nFrom: "+n+" ("+em+")",function(){c.reset()})}}
