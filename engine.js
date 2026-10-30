/* cd-version:13 */
/* Copy engine. Turns the suggested wording in copy.js, plus the owner's business details
   (STORE.facts) and the owner's own wording (STORE.copy), into final text for the site and
   the Store Manager. Pure functions: no DOM, no network. ES5 on purpose, like the rest of the site.
   Rules the whole site relies on:
   - A line that needs a business detail the owner has not filled in is dropped, never shown with a gap.
   - A broken template line (unclosed brace, stray brace, @if with nothing after it) is dropped too.
   - Owner-written wording is plain text: it is never run through the template language.
   - Stored values are strings (numbers allowed), trimmed, at most 4000 characters; anything else counts as blank.
   - Everything that reaches the page goes through esc() or inlineHtml(). */
var CDE=(function(){
  var hasOwn=Object.prototype.hasOwnProperty,MAX=4000,NAME=/^[A-Za-z][A-Za-z0-9_]*$/;
  function S(v){return v==null?"":String(v)}
  function trim(s){return S(s).replace(/^\s+|\s+$/g,"")}
  function esc(s){return S(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
  function isArr(a){return Object.prototype.toString.call(a)==="[object Array]"}
  function isObj(o){return o!=null&&typeof o==="object"&&!isArr(o)}
  function own(o,k){return o!=null&&(typeof o==="object"||typeof o==="function")&&hasOwn.call(o,k)}
  /* a stored value as text: strings and finite numbers only, trimmed, at most 4000 characters, anything else is "" */
  function val(v){if(typeof v==="number")return isFinite(v)?String(v):"";if(typeof v!=="string")return "";return trim(trim(v).substring(0,MAX))}
  function G(name){try{return (typeof window!=="undefined"&&window[name])||(typeof globalThis!=="undefined"&&globalThis[name])||undefined}catch(e){return undefined}}
  /* copy.js defines these as top-level vars; read them lazily so load order never matters */
  function defs(){var c;try{c=COPY}catch(e){c=G("COPY")}return isObj(c)?c:{}}
  function legacyMap(){var c;try{c=COPY_LEGACY}catch(e){c=G("COPY_LEGACY")}return isObj(c)?c:{}}
  function prodDefs(){var c;try{c=COPY_PRODUCT}catch(e){c=G("COPY_PRODUCT")}return isObj(c)?c:{}}
  function meta(){var c;try{c=COPY_META}catch(e){c=G("COPY_META")}return isObj(c)?c:{}}
  function tmplText(t){return isArr(t)?t.join("\n"):S(t)}

  /* ---------- the values a template can use ---------- */
  var EMAIL_RE=/^[^\s@?&,%=;<>"']+@[^\s@?&,%=;<>"']+\.[^\s@?&,%=;<>"']+$/;
  function emailOf(store){if(!isObj(store))return "";var e=(val(store.orderEmail)||val(store.email)).toLowerCase();return EMAIL_RE.test(e)?e:""}
  function handleOf(store){var v=isObj(store)?val(store.instagram):"";if(!v)return "";var m=v.match(/instagram\.com\/([A-Za-z0-9._]+)/i);if(m)return "@"+m[1];v=v.replace(/^@/,"");return /^[A-Za-z0-9._]+$/.test(v)?"@"+v:""}
  function money(store,n){n=+n||0;return ((isObj(store)&&val(store.currency))||"$")+(n%1===0?n:n.toFixed(2))}
  /* c = facts + built-ins (+ extra). Built-ins win over facts of the same name. Every value is a trimmed string. */
  /* number boxes (the details whose type is "num" in copy.js): anything that is not a plain number counts as empty, so "free" can never print as "costs $free" */
  var NUMK=null;
  function numKeys(){if(NUMK)return NUMK;NUMK={};var G=typeof FACTS!=="undefined"&&FACTS&&FACTS.length?FACTS:[],i,j,it;for(i=0;i<G.length;i++){it=G[i]&&G[i].items;if(!it)continue;for(j=0;j<it.length;j++)if(it[j]&&it[j].t==="num")NUMK[it[j].k]=1}return NUMK}
  function okNum(k,v){return !hasOwn.call(numKeys(),k)||/^\d+(?:\.\d+)?$/.test(String(v))}
  function ctx(store,extra){
    store=isObj(store)?store:{};var f=isObj(store.facts)?store.facts:{},c={},k,v;
    for(k in f)if(hasOwn.call(f,k)&&NAME.test(k)){v=val(f[k]);c[k]=okNum(k,v)?v:""}
    var fs=+store.freeShip||0;
    c.brand=val(store.brand)||"Our store";
    c.email=emailOf(store);
    c.currency=val(store.currency)||"$";
    c.freeShip=fs>0&&isFinite(fs)?money(store,fs):"";
    c.igHandle=handleOf(store);
    c.formService=/^https:\/\//.test(val(store.formUrl))?"yes":"";
    c.year=String(new Date().getFullYear());
    c.copyDate=val(meta().date);
    if(isObj(extra))for(k in extra)if(hasOwn.call(extra,k)&&NAME.test(k))c[k]=val(extra[k]);
    return c}
  /* things worked out from the product list, passed as `extra`. "live" here means shown on the site (not hidden). */
  function productsCtx(products){
    var any=false,live=0,i;products=isArr(products)?products:[];
    for(i=0;i<products.length;i++){var p=products[i];if(!isObj(p)||p.status==="hidden")continue;live++;if(val(p.sizeGuide))any=true}
    return {sizeGuides:any?"yes":"",liveCount:String(live)}}

  /* ---------- conditions: a,b = either; a&b = both; !a = blank; a=x equals; a!=x differs ---------- */
  function test(expr,c){
    expr=trim(expr);if(!expr)return true;c=c||{};
    var ors=expr.split(","),i,j;
    for(i=0;i<ors.length;i++){
      var ands=ors[i].split("&"),ok=true;
      for(j=0;j<ands.length;j++){
        var m=/^(!?)([A-Za-z][A-Za-z0-9_]*)(?:(!?=)(.*))?$/.exec(trim(ands[j]));
        if(!m){ok=false;break}
        var v=hasOwn.call(c,m[2])?S(c[m[2]]):"",r;
        if(m[3]==="=")r=(v===m[4]);else if(m[3]==="!=")r=(v!==m[4]);else r=v!=="";
        if(m[1]==="!")r=!r;
        if(!r){ok=false;break}
      }
      if(ok)return true;
    }
    return false}

  /* ---------- {token} and {?condition|optional text} ----------
     Returns the text, or null when a plain {token} has no value or the template itself is broken
     (an unclosed or stray brace). The caller then drops the line. Values are inserted as they are: never re-scanned. */
  function expand(s,c){
    s=S(s);c=c||{};
    var out="",i=0,n=s.length;
    while(i<n){
      var ch=s.charAt(i);
      if(ch==="}")return null;
      if(ch!=="{"){out+=ch;i++;continue}
      var depth=1,j=i+1;
      while(j<n&&depth>0){var d=s.charAt(j);if(d==="{")depth++;else if(d==="}")depth--;j++}
      if(depth!==0)return null;
      var inner=s.substring(i+1,j-1);
      if(inner.charAt(0)==="?"){
        var bar=inner.indexOf("|");
        if(bar>0){var expr=inner.substring(1,bar),txt=inner.substring(bar+1);
          if(test(expr,c)){var r=expand(txt,c);if(r!==null)out+=r}}
      }else{
        var name=trim(inner),v=hasOwn.call(c,name)?c[name]:null;
        if(v==null||v==="")return null;
        out+=v}
      i=j}
    return out}
  function clean(s){
    s=S(s).replace(/\s+/g," ");
    s=s.replace(/ ([.,;:!?])/g,"$1");
    s=s.replace(/([^.])\.\.(?!\.)/g,"$1.");
    s=s.replace(/\(\s+/g,"(").replace(/\s+\)/g,")").replace(/\s*\(\s*\)/g,"");
    /* a dropped optional piece can leave a separator dangling: "A ·  · B", "A ·" */
    s=s.replace(/(?:\s*·\s*){2,}/g," · ").replace(/^\s*·\s*/,"").replace(/\s*·\s*$/,"");
    return trim(s)}
  /* template text -> array of finished lines */
  function lines(tmpl,c){
    var out=[],arr=tmplText(tmpl).split(/\r?\n/),i;c=c||{};
    for(i=0;i<arr.length;i++){
      var t=trim(arr[i]);
      if(!t||t.substring(0,2)==="//")continue;
      var body=t;
      if(t.substring(0,3)==="@if"){var m=/^@if\s+(\S+)\s+(\S[\s\S]*)$/.exec(t);if(!m||!test(m[1],c))continue;body=m[2]}
      var e=expand(body,c);if(e===null)continue;
      e=clean(e);if(e)out.push(e)}
    return out}
  /* the owner's own wording: plain lines, no template language */
  function rawLines(text){
    var out=[],arr=S(text).split(/\r?\n/),i;
    for(i=0;i<arr.length;i++){var t=trim(arr[i]);if(t)out.push(t)}
    return out}

  /* ---------- which wording applies ---------- */
  function d(key){var C=defs();return own(C,key)&&isObj(C[key])?C[key]:null}
  function has(key){return !!d(key)}
  function kind(key){var def=d(key);return def?S(def.k):""}
  function isLegacy(key,v){var a=legacyMap()[key],i;if(!own(legacyMap(),key)||!isArr(a))return false;for(i=0;i<a.length;i++)if(trim(a[i])===trim(v))return true;return false}
  /* the owner's text for this key, or "" (blank, not text, or an old placeholder we replaced on purpose) */
  function custom(key,store){
    var def=d(key);if(!def||!isObj(store))return "";
    var v=def.flat?(own(store,def.flat)?store[def.flat]:""):(isObj(store.copy)&&own(store.copy,key)?store.copy[key]:"");
    v=val(v);return v&&!isLegacy(key,v)?v:""}
  function isCustom(key,store){return !!custom(key,store)}
  function raw(key,store){var def=d(key);if(!def)return {src:"none",text:""};var cu=custom(key,store);return cu?{src:"yours",text:cu}:{src:"suggested",text:tmplText(def.t)}}
  function resolved(key,store,extra){
    var r=raw(key,store);if(r.src==="none")return [];
    if(r.src==="yours")return rawLines(r.text);
    return lines(r.text,ctx(store,extra))}
  /* the final text. line = first surviving line, inline = lines joined by a space, others = lines joined by a newline */
  function text(key,store,extra){
    var def=d(key);if(!def)return "";var ls=resolved(key,store,extra);
    if(def.k==="line")return ls[0]||"";
    if(def.k==="inline")return ls.join(" ");
    if(def.k==="items")return ls.join(" • ");
    return ls.join("\n")}
  /* what to show in an editing box: the suggested lines, one per line */
  function suggestedText(key,store,extra){
    var def=d(key);if(!def)return "";var ls=lines(tmplText(def.t),ctx(store,extra));
    return def.k==="line"?(ls[0]||""):ls.join("\n")}

  /* ---------- safe inline formatting: **bold**, [[page.html#anchor|label]], the shop email as a link ---------- */
  var HREF_OK=/^(?:(?:index|shop|about|contact|help|product)\.html)?(?:\?[A-Za-z0-9=_.\-]+)?(?:#[A-Za-z0-9_\-]+)?$/;
  var LINK_RE=/\[\[([^\]|]*)\|([^\]]*)\]\]/g;
  /* the shop email inside text, not part of a longer address; shown in lowercase */
  function emailRe(e){return new RegExp("(^|[^A-Za-z0-9._%+\\-])("+e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+")(?![A-Za-z0-9_%+\\-]|\\.[A-Za-z0-9])","gi")}
  function fmt(t,e){
    var h=esc(t).replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>");
    if(e)h=h.replace(emailRe(e),function(m,pre){return pre+'<a href="mailto:'+esc(e)+'">'+esc(e)+"</a>"});
    return h}
  function inlineHtml(s,store){
    s=S(s);var e=emailOf(store),out="",last=0,m,re=new RegExp(LINK_RE.source,"g");
    while((m=re.exec(s))){
      out+=fmt(s.substring(last,m.index),e);
      var href=trim(m[1]),label=fmt(m[2],"");
      out+=href&&HREF_OK.test(href)?'<a href="'+esc(href)+'">'+label+"</a>":label;
      last=re.lastIndex}
    return out+fmt(s.substring(last),e)}
  /* the same text with the markup taken out, for places that only show plain text (titles, banners, buttons) */
  function plain(s,store){
    var h=S(s).replace(new RegExp(LINK_RE.source,"g"),"$2").replace(/\*\*([^*]+)\*\*/g,"$1"),e=emailOf(store);
    if(e)h=h.replace(emailRe(e),function(m,pre){return pre+e});
    return h}
  function splitBar(l){var i=l.indexOf(" | ");return i<0?[l,""]:[trim(l.substring(0,i)),trim(l.substring(i+3))]}
  function pad2(n){return (n<10?"0":"")+n}
  /* the finished markup for a key, by kind. Empty string when there is nothing to show. */
  function html(key,store,extra){
    var def=d(key);if(!def)return "";var ls=resolved(key,store,extra),k=def.k,i,h="";
    if(!ls.length)return "";
    function I(x){return inlineHtml(x,store)}
    if(k==="line")return I(ls[0]);
    if(k==="inline")return I(ls.join(" "));
    if(k==="list"){h="<ul>";for(i=0;i<ls.length;i++)h+="<li>"+I(ls[i])+"</li>";return h+"</ul>"}
    if(k==="steps"){h='<ol class="howlist">';for(i=0;i<ls.length;i++)h+="<li>"+I(ls[i])+"</li>";return h+"</ol>"}
    if(k==="items"){for(i=0;i<ls.length;i++)h+="<li>"+I(ls[i])+"</li>";return h}
    if(k==="creed"){for(i=0;i<ls.length;i++){var b=splitBar(ls[i]);h+='<div class="step"><span>'+pad2(i+1)+"</span><h3>"+I(b[0])+"</h3>"+(b[1]?"<p>"+I(b[1])+"</p>":"")+"</div>"}return h}
    if(k==="faq"){
      var groups=[],cur=null;
      for(i=0;i<ls.length;i++){
        if(ls[i].charAt(0)==="#"){cur={g:trim(ls[i].replace(/^#+\s*/,"")),items:[]};groups.push(cur);continue}
        var qa=splitBar(ls[i]);if(!qa[1])continue;
        if(!cur){cur={g:"",items:[]};groups.push(cur)}
        cur.items.push(qa)}
      for(i=0;i<groups.length;i++){
        if(!groups[i].items.length)continue;
        if(groups[i].g)h+='<h3 class="faqg">'+I(groups[i].g)+"</h3>";
        for(var j=0;j<groups[i].items.length;j++)h+="<details><summary>"+I(groups[i].items[j][0])+"</summary><div><p>"+I(groups[i].items[j][1])+"</p></div></details>"}
      return h?'<div class="faq">'+h+"</div>":""}
    if(k==="btn"||k==="map")return "";
    /* "p", and any kind this engine does not know: one paragraph per line */
    for(i=0;i<ls.length;i++)h+="<p>"+I(ls[i])+"</p>";return h}
  /* "Label | page.html#anchor" -> {label, href}. href is "" unless it is an on-site link. */
  function btn(key,store,extra){
    var ls=resolved(key,store,extra);if(!ls.length)return null;
    var b=splitBar(ls[0]),href=trim(b[1]);
    return {label:b[0],href:href&&HREF_OK.test(href)?href:""}}
  /* "Name | text" lines -> {lowercase name: text}. Used for the one-line note under each shop category. */
  function map(key,store,extra){
    var ls=resolved(key,store,extra),o={},i;
    for(i=0;i<ls.length;i++){var b=splitBar(ls[i]);if(b[0]&&b[1])o[b[0].toLowerCase()]=b[1]}
    return o}

  /* ---------- product pages ---------- */
  function factOf(store,k){var v=isObj(store)&&isObj(store.facts)&&own(store.facts,k)?val(store.facts[k]):"";return okNum(k,v)?v:""}
  /* the product's own tokens ({name} {type} {cat} {colour} {price} {gsm} {garment}) plus extra; pass the result as `extra` */
  function productTokens(p,store,extra){
    p=isObj(p)?p:{};var x={},t=S(p.type),k;
    x.name=val(p.name);x.type=t;x.cat=val(p.cat);x.colour=val(p.colorName);
    x.price=money(store,p.price);
    x.gsm=t==="tee"?factOf(store,"teeGsm"):t==="hoodie"?factOf(store,"hoodieGsm"):"";
    x.garment=t==="hoodie"?"hoodie":t==="tee"?"tee":t==="cap"?"cap":t==="pants"?"pants":"piece";
    if(isObj(extra))for(k in extra)if(hasOwn.call(extra,k))x[k]=extra[k];
    return x}
  function productCtx(p,store,extra){return ctx(store,productTokens(p,store,extra))}
  /* A product field (desc, specs, materials, features, modelNote, sizeGuide, tagline). The product's own text wins;
     otherwise the suggested wording for its type. Returns {src, text} with "\n" between lines. */
  function productField(field,p,store,extra){
    p=isObj(p)?p:{};field=S(field);var mine=own(p,field)?val(p[field]):"";if(mine)return {src:"yours",text:mine};
    var PD=prodDefs(),ty=S(p.type),set=own(PD,ty)&&isObj(PD[ty])&&PD[ty][field]!=null?PD[ty]:(own(PD,"_")&&isObj(PD._)?PD._:{});
    var t=own(set,field)?set[field]:null;
    if(t==null)return {src:"none",text:""};
    return {src:"suggested",text:lines(tmplText(t),productCtx(p,store,extra)).join("\n")}}

  /* ---------- helpers for the Store Manager and the tests ---------- */
  /* every {token} a template mentions (not the {?...} wrappers) */
  function tokensIn(tmpl){
    var s=tmplText(tmpl),out=[],re=/\{(?!\?)\s*([A-Za-z][A-Za-z0-9_]*)\s*\}/g,m;
    while((m=re.exec(s))){if(out.indexOf(m[1])<0)out.push(m[1])}
    var re2=/(?:@if\s+|\{\?)([^\s|}]+)/g;
    while((m=re2.exec(s))){var parts=m[1].split(/[,&]/);for(var i=0;i<parts.length;i++){var k=/^!?([A-Za-z][A-Za-z0-9_]*)/.exec(parts[i]);if(k&&out.indexOf(k[1])<0)out.push(k[1])}}
    return out}
  /* which pieces of wording use a given business detail: [{key, label, group}] */
  function usedOn(factKey){
    var C=defs(),out=[],k,PD=prodDefs(),t,f,hit=false;
    for(k in C)if(hasOwn.call(C,k)&&isObj(C[k])&&tokensIn(C[k].t).indexOf(factKey)>=0)out.push({key:k,label:C[k].l||k,group:C[k].g||""});
    for(t in PD){if(!hasOwn.call(PD,t)||!isObj(PD[t]))continue;for(f in PD[t])if(hasOwn.call(PD[t],f)&&tokensIn(PD[t][f]).indexOf(factKey)>=0)hit=true}
    if(hit)out.push({key:"product",label:"Product pages",group:"Products"});
    return out}

  return {version:13,S:S,trim:trim,esc:esc,val:val,ctx:ctx,productsCtx:productsCtx,test:test,expand:expand,clean:clean,lines:lines,rawLines:rawLines,
    def:d,has:has,kind:kind,custom:custom,isCustom:isCustom,raw:raw,resolved:resolved,text:text,suggestedText:suggestedText,html:html,inlineHtml:inlineHtml,plain:plain,
    btn:btn,map:map,productTokens:productTokens,productCtx:productCtx,productField:productField,emailOf:emailOf,handleOf:handleOf,money:money,tokensIn:tokensIn,usedOn:usedOn}
})();
if(typeof module!=="undefined"&&module.exports)module.exports=CDE;
