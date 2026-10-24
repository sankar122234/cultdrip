var KEY="cd_draft";
try{var d=JSON.parse(localStorage.getItem(KEY)||"null");if(d){STORE=d.STORE;PRODUCTS=d.PRODUCTS}}catch(e){}
function $(s){return document.querySelector(s)}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
var SET=[["brand","Brand name","text"],["announce","Top banner message","text"],["heroTitle","Home headline","text"],["heroText","Home sub-text","text"],["shopTitle","Shop page title","text"],["currency","Currency symbol","text"],["freeShip","Free shipping over","number"]];
var TYPES=["hoodie","tee","pants","cap"],STAT=[["live","On sale now"],["soldout","Sold out"],["hidden","Hidden"]],TAGS=[["","No badge"],["New","New"],["Limited","Limited"],["Best seller","Best seller"]];
function say(m){var s=$("#status");s.textContent=m;clearTimeout(say.t);say.t=setTimeout(function(){s.textContent=""},2500)}
function save(){try{localStorage.setItem(KEY,JSON.stringify({STORE:STORE,PRODUCTS:PRODUCTS}));say("Saved")}catch(e){say("Could not save")}}
function opts(list,cur){return list.map(function(o){var v=o instanceof Array?o[0]:o,l=o instanceof Array?o[1]:o;return '<option value="'+esc(v)+'"'+(v===cur?' selected':'')+'>'+esc(l)+'</option>'}).join("")}
function drawSet(){$("#set").innerHTML=SET.map(function(s){return '<label>'+s[1]+'<input data-s="'+s[0]+'" type="'+s[2]+'" value="'+esc(STORE[s[0]])+'"></label>'}).join("")}
function fld(i,k,label,type,v,extra){return '<label>'+label+'<input data-i="'+i+'" data-k="'+k+'" type="'+type+'" value="'+esc(v)+'" '+(extra||'')+'></label>'}
function sel(i,k,label,list,cur){return '<label>'+label+'<select data-i="'+i+'" data-k="'+k+'">'+opts(list,cur)+'</select></label>'}
function drawProd(){
  $("#list").innerHTML=PRODUCTS.map(function(p,i){
    return '<div class="prow"><div class="ptop"><b>'+(i+1)+'. '+esc(p.name||"New product")+'</b><span><button data-a="up" data-i="'+i+'">Up</button><button data-a="down" data-i="'+i+'">Down</button><button data-a="dup" data-i="'+i+'">Copy</button><button class="del" data-a="del" data-i="'+i+'">Delete</button></span></div><div class="fields">'+
    fld(i,"name","Name","text",p.name)+fld(i,"cat","Category","text",p.cat)+sel(i,"type","Drawing shape",TYPES,p.type)+
    fld(i,"price","Price","number",p.price,'step="0.01" min="0"')+fld(i,"was","Original price (0 = no sale)","number",p.was,'step="0.01" min="0"')+
    fld(i,"color","Color","color",p.color)+sel(i,"status","Status",STAT,p.status)+sel(i,"tag","Badge",TAGS,p.tag)+fld(i,"image","Photo path (optional)","text",p.image)+'</div></div>'}).join("")}
document.addEventListener("input",function(e){
  var t=e.target;
  if(t.dataset.s){STORE[t.dataset.s]=t.type==="number"?(parseFloat(t.value)||0):t.value;save()}
  else if(t.dataset.k){PRODUCTS[+t.dataset.i][t.dataset.k]=t.type==="number"?(parseFloat(t.value)||0):t.value;save()}
});
$("#list").addEventListener("click",function(e){
  var b=e.target.closest("button");if(!b)return;var i=+b.dataset.i,a=b.dataset.a;
  if(a==="del"){if(!confirm("Delete this product?"))return;PRODUCTS.splice(i,1)}
  if(a==="dup"){var c=JSON.parse(JSON.stringify(PRODUCTS[i]));c.id=nextId();c.name+=" copy";PRODUCTS.splice(i+1,0,c)}
  if(a==="up"&&i>0){PRODUCTS.splice(i-1,0,PRODUCTS.splice(i,1)[0])}
  if(a==="down"&&i<PRODUCTS.length-1){PRODUCTS.splice(i+1,0,PRODUCTS.splice(i,1)[0])}
  save();drawProd();
});
function nextId(){return PRODUCTS.reduce(function(m,p){return Math.max(m,p.id)},0)+1}
function pct(){return Math.min(90,Math.max(1,parseFloat($("#pct").value)||0))}
function r2(n){return Math.round(n*100)/100}
$("#add").onclick=function(){PRODUCTS.unshift({id:nextId(),name:"New product",type:"tee",cat:"Tees",price:50,was:0,color:"#227d47",image:"",status:"live",tag:"New"});save();drawProd();window.scrollTo(0,$("#list").offsetTop-80)};
$("#sale").onclick=function(){PRODUCTS.forEach(function(p){var base=+p.was>+p.price?+p.was:+p.price;p.was=base;p.price=r2(base*(1-pct()/100))});save();drawProd();say("Sale applied")};
$("#unsale").onclick=function(){PRODUCTS.forEach(function(p){if(+p.was>+p.price)p.price=+p.was;p.was=0});save();drawProd();say("Sales ended")};
$("#up").onclick=function(){PRODUCTS.forEach(function(p){p.price=r2(p.price*(1+pct()/100));if(p.was)p.was=r2(p.was*(1+pct()/100))});save();drawProd()};
$("#down").onclick=function(){PRODUCTS.forEach(function(p){p.price=r2(p.price*(1-pct()/100));if(p.was)p.was=r2(p.was*(1-pct()/100))});save();drawProd()};
function code(){return "/* Made by the Store Manager. Upload this file to GitHub to publish. */\nvar STORE = "+JSON.stringify(STORE,null,2)+";\nvar PRODUCTS = "+JSON.stringify(PRODUCTS,null,2)+";\n"}
$("#prev").onclick=function(){save();window.open("shop.html?preview=1","_blank")};
$("#dl").onclick=function(){var a=document.createElement("a");a.href=URL.createObjectURL(new Blob([code()],{type:"text/javascript"}));a.download="data.js";a.click();say("Downloaded: now upload it to GitHub")};
$("#copy").onclick=function(){try{navigator.clipboard.writeText(code()).then(function(){say("Code copied")})}catch(e){say("Copy not available")}};
$("#reset").onclick=function(){if(confirm("Throw away your unpublished changes?")){try{localStorage.removeItem(KEY)}catch(e){}location.reload()}};
drawSet();drawProd();
