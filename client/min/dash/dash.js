/*! jQuery v2.2.2 | (c) jQuery Foundation | jquery.org/license */
!function(a,b){"object"==typeof module&&"object"==typeof module.exports?module.exports=a.document?b(a,!0):function(a){if(!a.document)throw new Error("jQuery requires a window with a document");return b(a)}:b(a)}("undefined"!=typeof window?window:this,function(a,b){var c=[],d=a.document,e=c.slice,f=c.concat,g=c.push,h=c.indexOf,i={},j=i.toString,k=i.hasOwnProperty,l={},m="2.2.2",n=function(a,b){return new n.fn.init(a,b)},o=/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,p=/^-ms-/,q=/-([\da-z])/gi,r=function(a,b){return b.toUpperCase()};n.fn=n.prototype={jquery:m,constructor:n,selector:"",length:0,toArray:function(){return e.call(this)},get:function(a){return null!=a?0>a?this[a+this.length]:this[a]:e.call(this)},pushStack:function(a){var b=n.merge(this.constructor(),a);return b.prevObject=this,b.context=this.context,b},each:function(a){return n.each(this,a)},map:function(a){return this.pushStack(n.map(this,function(b,c){return a.call(b,c,b)}))},slice:function(){return this.pushStack(e.apply(this,arguments))},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},eq:function(a){var b=this.length,c=+a+(0>a?b:0);return this.pushStack(c>=0&&b>c?[this[c]]:[])},end:function(){return this.prevObject||this.constructor()},push:g,sort:c.sort,splice:c.splice},n.extend=n.fn.extend=function(){var a,b,c,d,e,f,g=arguments[0]||{},h=1,i=arguments.length,j=!1;for("boolean"==typeof g&&(j=g,g=arguments[h]||{},h++),"object"==typeof g||n.isFunction(g)||(g={}),h===i&&(g=this,h--);i>h;h++)if(null!=(a=arguments[h]))for(b in a)c=g[b],d=a[b],g!==d&&(j&&d&&(n.isPlainObject(d)||(e=n.isArray(d)))?(e?(e=!1,f=c&&n.isArray(c)?c:[]):f=c&&n.isPlainObject(c)?c:{},g[b]=n.extend(j,f,d)):void 0!==d&&(g[b]=d));return g},n.extend({expando:"jQuery"+(m+Math.random()).replace(/\D/g,""),isReady:!0,error:function(a){throw new Error(a)},noop:function(){},isFunction:function(a){return"function"===n.type(a)},isArray:Array.isArray,isWindow:function(a){return null!=a&&a===a.window},isNumeric:function(a){var b=a&&a.toString();return!n.isArray(a)&&b-parseFloat(b)+1>=0},isPlainObject:function(a){var b;if("object"!==n.type(a)||a.nodeType||n.isWindow(a))return!1;if(a.constructor&&!k.call(a,"constructor")&&!k.call(a.constructor.prototype||{},"isPrototypeOf"))return!1;for(b in a);return void 0===b||k.call(a,b)},isEmptyObject:function(a){var b;for(b in a)return!1;return!0},type:function(a){return null==a?a+"":"object"==typeof a||"function"==typeof a?i[j.call(a)]||"object":typeof a},globalEval:function(a){var b,c=eval;a=n.trim(a),a&&(1===a.indexOf("use strict")?(b=d.createElement("script"),b.text=a,d.head.appendChild(b).parentNode.removeChild(b)):c(a))},camelCase:function(a){return a.replace(p,"ms-").replace(q,r)},nodeName:function(a,b){return a.nodeName&&a.nodeName.toLowerCase()===b.toLowerCase()},each:function(a,b){var c,d=0;if(s(a)){for(c=a.length;c>d;d++)if(b.call(a[d],d,a[d])===!1)break}else for(d in a)if(b.call(a[d],d,a[d])===!1)break;return a},trim:function(a){return null==a?"":(a+"").replace(o,"")},makeArray:function(a,b){var c=b||[];return null!=a&&(s(Object(a))?n.merge(c,"string"==typeof a?[a]:a):g.call(c,a)),c},inArray:function(a,b,c){return null==b?-1:h.call(b,a,c)},merge:function(a,b){for(var c=+b.length,d=0,e=a.length;c>d;d++)a[e++]=b[d];return a.length=e,a},grep:function(a,b,c){for(var d,e=[],f=0,g=a.length,h=!c;g>f;f++)d=!b(a[f],f),d!==h&&e.push(a[f]);return e},map:function(a,b,c){var d,e,g=0,h=[];if(s(a))for(d=a.length;d>g;g++)e=b(a[g],g,c),null!=e&&h.push(e);else for(g in a)e=b(a[g],g,c),null!=e&&h.push(e);return f.apply([],h)},guid:1,proxy:function(a,b){var c,d,f;return"string"==typeof b&&(c=a[b],b=a,a=c),n.isFunction(a)?(d=e.call(arguments,2),f=function(){return a.apply(b||this,d.concat(e.call(arguments)))},f.guid=a.guid=a.guid||n.guid++,f):void 0},now:Date.now,support:l}),"function"==typeof Symbol&&(n.fn[Symbol.iterator]=c[Symbol.iterator]),n.each("Boolean Number String Function Array Date RegExp Object Error Symbol".split(" "),function(a,b){i["[object "+b+"]"]=b.toLowerCase()});function s(a){var b=!!a&&"length"in a&&a.length,c=n.type(a);return"function"===c||n.isWindow(a)?!1:"array"===c||0===b||"number"==typeof b&&b>0&&b-1 in a}var t=function(a){var b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u="sizzle"+1*new Date,v=a.document,w=0,x=0,y=ga(),z=ga(),A=ga(),B=function(a,b){return a===b&&(l=!0),0},C=1<<31,D={}.hasOwnProperty,E=[],F=E.pop,G=E.push,H=E.push,I=E.slice,J=function(a,b){for(var c=0,d=a.length;d>c;c++)if(a[c]===b)return c;return-1},K="checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",L="[\\x20\\t\\r\\n\\f]",M="(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",N="\\["+L+"*("+M+")(?:"+L+"*([*^$|!~]?=)"+L+"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|("+M+"))|)"+L+"*\\]",O=":("+M+")(?:\\((('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|((?:\\\\.|[^\\\\()[\\]]|"+N+")*)|.*)\\)|)",P=new RegExp(L+"+","g"),Q=new RegExp("^"+L+"+|((?:^|[^\\\\])(?:\\\\.)*)"+L+"+$","g"),R=new RegExp("^"+L+"*,"+L+"*"),S=new RegExp("^"+L+"*([>+~]|"+L+")"+L+"*"),T=new RegExp("="+L+"*([^\\]'\"]*?)"+L+"*\\]","g"),U=new RegExp(O),V=new RegExp("^"+M+"$"),W={ID:new RegExp("^#("+M+")"),CLASS:new RegExp("^\\.("+M+")"),TAG:new RegExp("^("+M+"|[*])"),ATTR:new RegExp("^"+N),PSEUDO:new RegExp("^"+O),CHILD:new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\("+L+"*(even|odd|(([+-]|)(\\d*)n|)"+L+"*(?:([+-]|)"+L+"*(\\d+)|))"+L+"*\\)|)","i"),bool:new RegExp("^(?:"+K+")$","i"),needsContext:new RegExp("^"+L+"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\("+L+"*((?:-\\d)?\\d*)"+L+"*\\)|)(?=[^-]|$)","i")},X=/^(?:input|select|textarea|button)$/i,Y=/^h\d$/i,Z=/^[^{]+\{\s*\[native \w/,$=/^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,_=/[+~]/,aa=/'|\\/g,ba=new RegExp("\\\\([\\da-f]{1,6}"+L+"?|("+L+")|.)","ig"),ca=function(a,b,c){var d="0x"+b-65536;return d!==d||c?b:0>d?String.fromCharCode(d+65536):String.fromCharCode(d>>10|55296,1023&d|56320)},da=function(){m()};try{H.apply(E=I.call(v.childNodes),v.childNodes),E[v.childNodes.length].nodeType}catch(ea){H={apply:E.length?function(a,b){G.apply(a,I.call(b))}:function(a,b){var c=a.length,d=0;while(a[c++]=b[d++]);a.length=c-1}}}function fa(a,b,d,e){var f,h,j,k,l,o,r,s,w=b&&b.ownerDocument,x=b?b.nodeType:9;if(d=d||[],"string"!=typeof a||!a||1!==x&&9!==x&&11!==x)return d;if(!e&&((b?b.ownerDocument||b:v)!==n&&m(b),b=b||n,p)){if(11!==x&&(o=$.exec(a)))if(f=o[1]){if(9===x){if(!(j=b.getElementById(f)))return d;if(j.id===f)return d.push(j),d}else if(w&&(j=w.getElementById(f))&&t(b,j)&&j.id===f)return d.push(j),d}else{if(o[2])return H.apply(d,b.getElementsByTagName(a)),d;if((f=o[3])&&c.getElementsByClassName&&b.getElementsByClassName)return H.apply(d,b.getElementsByClassName(f)),d}if(c.qsa&&!A[a+" "]&&(!q||!q.test(a))){if(1!==x)w=b,s=a;else if("object"!==b.nodeName.toLowerCase()){(k=b.getAttribute("id"))?k=k.replace(aa,"\\$&"):b.setAttribute("id",k=u),r=g(a),h=r.length,l=V.test(k)?"#"+k:"[id='"+k+"']";while(h--)r[h]=l+" "+qa(r[h]);s=r.join(","),w=_.test(a)&&oa(b.parentNode)||b}if(s)try{return H.apply(d,w.querySelectorAll(s)),d}catch(y){}finally{k===u&&b.removeAttribute("id")}}}return i(a.replace(Q,"$1"),b,d,e)}function ga(){var a=[];function b(c,e){return a.push(c+" ")>d.cacheLength&&delete b[a.shift()],b[c+" "]=e}return b}function ha(a){return a[u]=!0,a}function ia(a){var b=n.createElement("div");try{return!!a(b)}catch(c){return!1}finally{b.parentNode&&b.parentNode.removeChild(b),b=null}}function ja(a,b){var c=a.split("|"),e=c.length;while(e--)d.attrHandle[c[e]]=b}function ka(a,b){var c=b&&a,d=c&&1===a.nodeType&&1===b.nodeType&&(~b.sourceIndex||C)-(~a.sourceIndex||C);if(d)return d;if(c)while(c=c.nextSibling)if(c===b)return-1;return a?1:-1}function la(a){return function(b){var c=b.nodeName.toLowerCase();return"input"===c&&b.type===a}}function ma(a){return function(b){var c=b.nodeName.toLowerCase();return("input"===c||"button"===c)&&b.type===a}}function na(a){return ha(function(b){return b=+b,ha(function(c,d){var e,f=a([],c.length,b),g=f.length;while(g--)c[e=f[g]]&&(c[e]=!(d[e]=c[e]))})})}function oa(a){return a&&"undefined"!=typeof a.getElementsByTagName&&a}c=fa.support={},f=fa.isXML=function(a){var b=a&&(a.ownerDocument||a).documentElement;return b?"HTML"!==b.nodeName:!1},m=fa.setDocument=function(a){var b,e,g=a?a.ownerDocument||a:v;return g!==n&&9===g.nodeType&&g.documentElement?(n=g,o=n.documentElement,p=!f(n),(e=n.defaultView)&&e.top!==e&&(e.addEventListener?e.addEventListener("unload",da,!1):e.attachEvent&&e.attachEvent("onunload",da)),c.attributes=ia(function(a){return a.className="i",!a.getAttribute("className")}),c.getElementsByTagName=ia(function(a){return a.appendChild(n.createComment("")),!a.getElementsByTagName("*").length}),c.getElementsByClassName=Z.test(n.getElementsByClassName),c.getById=ia(function(a){return o.appendChild(a).id=u,!n.getElementsByName||!n.getElementsByName(u).length}),c.getById?(d.find.ID=function(a,b){if("undefined"!=typeof b.getElementById&&p){var c=b.getElementById(a);return c?[c]:[]}},d.filter.ID=function(a){var b=a.replace(ba,ca);return function(a){return a.getAttribute("id")===b}}):(delete d.find.ID,d.filter.ID=function(a){var b=a.replace(ba,ca);return function(a){var c="undefined"!=typeof a.getAttributeNode&&a.getAttributeNode("id");return c&&c.value===b}}),d.find.TAG=c.getElementsByTagName?function(a,b){return"undefined"!=typeof b.getElementsByTagName?b.getElementsByTagName(a):c.qsa?b.querySelectorAll(a):void 0}:function(a,b){var c,d=[],e=0,f=b.getElementsByTagName(a);if("*"===a){while(c=f[e++])1===c.nodeType&&d.push(c);return d}return f},d.find.CLASS=c.getElementsByClassName&&function(a,b){return"undefined"!=typeof b.getElementsByClassName&&p?b.getElementsByClassName(a):void 0},r=[],q=[],(c.qsa=Z.test(n.querySelectorAll))&&(ia(function(a){o.appendChild(a).innerHTML="<a id='"+u+"'></a><select id='"+u+"-\r\\' msallowcapture=''><option selected=''></option></select>",a.querySelectorAll("[msallowcapture^='']").length&&q.push("[*^$]="+L+"*(?:''|\"\")"),a.querySelectorAll("[selected]").length||q.push("\\["+L+"*(?:value|"+K+")"),a.querySelectorAll("[id~="+u+"-]").length||q.push("~="),a.querySelectorAll(":checked").length||q.push(":checked"),a.querySelectorAll("a#"+u+"+*").length||q.push(".#.+[+~]")}),ia(function(a){var b=n.createElement("input");b.setAttribute("type","hidden"),a.appendChild(b).setAttribute("name","D"),a.querySelectorAll("[name=d]").length&&q.push("name"+L+"*[*^$|!~]?="),a.querySelectorAll(":enabled").length||q.push(":enabled",":disabled"),a.querySelectorAll("*,:x"),q.push(",.*:")})),(c.matchesSelector=Z.test(s=o.matches||o.webkitMatchesSelector||o.mozMatchesSelector||o.oMatchesSelector||o.msMatchesSelector))&&ia(function(a){c.disconnectedMatch=s.call(a,"div"),s.call(a,"[s!='']:x"),r.push("!=",O)}),q=q.length&&new RegExp(q.join("|")),r=r.length&&new RegExp(r.join("|")),b=Z.test(o.compareDocumentPosition),t=b||Z.test(o.contains)?function(a,b){var c=9===a.nodeType?a.documentElement:a,d=b&&b.parentNode;return a===d||!(!d||1!==d.nodeType||!(c.contains?c.contains(d):a.compareDocumentPosition&&16&a.compareDocumentPosition(d)))}:function(a,b){if(b)while(b=b.parentNode)if(b===a)return!0;return!1},B=b?function(a,b){if(a===b)return l=!0,0;var d=!a.compareDocumentPosition-!b.compareDocumentPosition;return d?d:(d=(a.ownerDocument||a)===(b.ownerDocument||b)?a.compareDocumentPosition(b):1,1&d||!c.sortDetached&&b.compareDocumentPosition(a)===d?a===n||a.ownerDocument===v&&t(v,a)?-1:b===n||b.ownerDocument===v&&t(v,b)?1:k?J(k,a)-J(k,b):0:4&d?-1:1)}:function(a,b){if(a===b)return l=!0,0;var c,d=0,e=a.parentNode,f=b.parentNode,g=[a],h=[b];if(!e||!f)return a===n?-1:b===n?1:e?-1:f?1:k?J(k,a)-J(k,b):0;if(e===f)return ka(a,b);c=a;while(c=c.parentNode)g.unshift(c);c=b;while(c=c.parentNode)h.unshift(c);while(g[d]===h[d])d++;return d?ka(g[d],h[d]):g[d]===v?-1:h[d]===v?1:0},n):n},fa.matches=function(a,b){return fa(a,null,null,b)},fa.matchesSelector=function(a,b){if((a.ownerDocument||a)!==n&&m(a),b=b.replace(T,"='$1']"),c.matchesSelector&&p&&!A[b+" "]&&(!r||!r.test(b))&&(!q||!q.test(b)))try{var d=s.call(a,b);if(d||c.disconnectedMatch||a.document&&11!==a.document.nodeType)return d}catch(e){}return fa(b,n,null,[a]).length>0},fa.contains=function(a,b){return(a.ownerDocument||a)!==n&&m(a),t(a,b)},fa.attr=function(a,b){(a.ownerDocument||a)!==n&&m(a);var e=d.attrHandle[b.toLowerCase()],f=e&&D.call(d.attrHandle,b.toLowerCase())?e(a,b,!p):void 0;return void 0!==f?f:c.attributes||!p?a.getAttribute(b):(f=a.getAttributeNode(b))&&f.specified?f.value:null},fa.error=function(a){throw new Error("Syntax error, unrecognized expression: "+a)},fa.uniqueSort=function(a){var b,d=[],e=0,f=0;if(l=!c.detectDuplicates,k=!c.sortStable&&a.slice(0),a.sort(B),l){while(b=a[f++])b===a[f]&&(e=d.push(f));while(e--)a.splice(d[e],1)}return k=null,a},e=fa.getText=function(a){var b,c="",d=0,f=a.nodeType;if(f){if(1===f||9===f||11===f){if("string"==typeof a.textContent)return a.textContent;for(a=a.firstChild;a;a=a.nextSibling)c+=e(a)}else if(3===f||4===f)return a.nodeValue}else while(b=a[d++])c+=e(b);return c},d=fa.selectors={cacheLength:50,createPseudo:ha,match:W,attrHandle:{},find:{},relative:{">":{dir:"parentNode",first:!0}," ":{dir:"parentNode"},"+":{dir:"previousSibling",first:!0},"~":{dir:"previousSibling"}},preFilter:{ATTR:function(a){return a[1]=a[1].replace(ba,ca),a[3]=(a[3]||a[4]||a[5]||"").replace(ba,ca),"~="===a[2]&&(a[3]=" "+a[3]+" "),a.slice(0,4)},CHILD:function(a){return a[1]=a[1].toLowerCase(),"nth"===a[1].slice(0,3)?(a[3]||fa.error(a[0]),a[4]=+(a[4]?a[5]+(a[6]||1):2*("even"===a[3]||"odd"===a[3])),a[5]=+(a[7]+a[8]||"odd"===a[3])):a[3]&&fa.error(a[0]),a},PSEUDO:function(a){var b,c=!a[6]&&a[2];return W.CHILD.test(a[0])?null:(a[3]?a[2]=a[4]||a[5]||"":c&&U.test(c)&&(b=g(c,!0))&&(b=c.indexOf(")",c.length-b)-c.length)&&(a[0]=a[0].slice(0,b),a[2]=c.slice(0,b)),a.slice(0,3))}},filter:{TAG:function(a){var b=a.replace(ba,ca).toLowerCase();return"*"===a?function(){return!0}:function(a){return a.nodeName&&a.nodeName.toLowerCase()===b}},CLASS:function(a){var b=y[a+" "];return b||(b=new RegExp("(^|"+L+")"+a+"("+L+"|$)"))&&y(a,function(a){return b.test("string"==typeof a.className&&a.className||"undefined"!=typeof a.getAttribute&&a.getAttribute("class")||"")})},ATTR:function(a,b,c){return function(d){var e=fa.attr(d,a);return null==e?"!="===b:b?(e+="","="===b?e===c:"!="===b?e!==c:"^="===b?c&&0===e.indexOf(c):"*="===b?c&&e.indexOf(c)>-1:"$="===b?c&&e.slice(-c.length)===c:"~="===b?(" "+e.replace(P," ")+" ").indexOf(c)>-1:"|="===b?e===c||e.slice(0,c.length+1)===c+"-":!1):!0}},CHILD:function(a,b,c,d,e){var f="nth"!==a.slice(0,3),g="last"!==a.slice(-4),h="of-type"===b;return 1===d&&0===e?function(a){return!!a.parentNode}:function(b,c,i){var j,k,l,m,n,o,p=f!==g?"nextSibling":"previousSibling",q=b.parentNode,r=h&&b.nodeName.toLowerCase(),s=!i&&!h,t=!1;if(q){if(f){while(p){m=b;while(m=m[p])if(h?m.nodeName.toLowerCase()===r:1===m.nodeType)return!1;o=p="only"===a&&!o&&"nextSibling"}return!0}if(o=[g?q.firstChild:q.lastChild],g&&s){m=q,l=m[u]||(m[u]={}),k=l[m.uniqueID]||(l[m.uniqueID]={}),j=k[a]||[],n=j[0]===w&&j[1],t=n&&j[2],m=n&&q.childNodes[n];while(m=++n&&m&&m[p]||(t=n=0)||o.pop())if(1===m.nodeType&&++t&&m===b){k[a]=[w,n,t];break}}else if(s&&(m=b,l=m[u]||(m[u]={}),k=l[m.uniqueID]||(l[m.uniqueID]={}),j=k[a]||[],n=j[0]===w&&j[1],t=n),t===!1)while(m=++n&&m&&m[p]||(t=n=0)||o.pop())if((h?m.nodeName.toLowerCase()===r:1===m.nodeType)&&++t&&(s&&(l=m[u]||(m[u]={}),k=l[m.uniqueID]||(l[m.uniqueID]={}),k[a]=[w,t]),m===b))break;return t-=e,t===d||t%d===0&&t/d>=0}}},PSEUDO:function(a,b){var c,e=d.pseudos[a]||d.setFilters[a.toLowerCase()]||fa.error("unsupported pseudo: "+a);return e[u]?e(b):e.length>1?(c=[a,a,"",b],d.setFilters.hasOwnProperty(a.toLowerCase())?ha(function(a,c){var d,f=e(a,b),g=f.length;while(g--)d=J(a,f[g]),a[d]=!(c[d]=f[g])}):function(a){return e(a,0,c)}):e}},pseudos:{not:ha(function(a){var b=[],c=[],d=h(a.replace(Q,"$1"));return d[u]?ha(function(a,b,c,e){var f,g=d(a,null,e,[]),h=a.length;while(h--)(f=g[h])&&(a[h]=!(b[h]=f))}):function(a,e,f){return b[0]=a,d(b,null,f,c),b[0]=null,!c.pop()}}),has:ha(function(a){return function(b){return fa(a,b).length>0}}),contains:ha(function(a){return a=a.replace(ba,ca),function(b){return(b.textContent||b.innerText||e(b)).indexOf(a)>-1}}),lang:ha(function(a){return V.test(a||"")||fa.error("unsupported lang: "+a),a=a.replace(ba,ca).toLowerCase(),function(b){var c;do if(c=p?b.lang:b.getAttribute("xml:lang")||b.getAttribute("lang"))return c=c.toLowerCase(),c===a||0===c.indexOf(a+"-");while((b=b.parentNode)&&1===b.nodeType);return!1}}),target:function(b){var c=a.location&&a.location.hash;return c&&c.slice(1)===b.id},root:function(a){return a===o},focus:function(a){return a===n.activeElement&&(!n.hasFocus||n.hasFocus())&&!!(a.type||a.href||~a.tabIndex)},enabled:function(a){return a.disabled===!1},disabled:function(a){return a.disabled===!0},checked:function(a){var b=a.nodeName.toLowerCase();return"input"===b&&!!a.checked||"option"===b&&!!a.selected},selected:function(a){return a.parentNode&&a.parentNode.selectedIndex,a.selected===!0},empty:function(a){for(a=a.firstChild;a;a=a.nextSibling)if(a.nodeType<6)return!1;return!0},parent:function(a){return!d.pseudos.empty(a)},header:function(a){return Y.test(a.nodeName)},input:function(a){return X.test(a.nodeName)},button:function(a){var b=a.nodeName.toLowerCase();return"input"===b&&"button"===a.type||"button"===b},text:function(a){var b;return"input"===a.nodeName.toLowerCase()&&"text"===a.type&&(null==(b=a.getAttribute("type"))||"text"===b.toLowerCase())},first:na(function(){return[0]}),last:na(function(a,b){return[b-1]}),eq:na(function(a,b,c){return[0>c?c+b:c]}),even:na(function(a,b){for(var c=0;b>c;c+=2)a.push(c);return a}),odd:na(function(a,b){for(var c=1;b>c;c+=2)a.push(c);return a}),lt:na(function(a,b,c){for(var d=0>c?c+b:c;--d>=0;)a.push(d);return a}),gt:na(function(a,b,c){for(var d=0>c?c+b:c;++d<b;)a.push(d);return a})}},d.pseudos.nth=d.pseudos.eq;for(b in{radio:!0,checkbox:!0,file:!0,password:!0,image:!0})d.pseudos[b]=la(b);for(b in{submit:!0,reset:!0})d.pseudos[b]=ma(b);function pa(){}pa.prototype=d.filters=d.pseudos,d.setFilters=new pa,g=fa.tokenize=function(a,b){var c,e,f,g,h,i,j,k=z[a+" "];if(k)return b?0:k.slice(0);h=a,i=[],j=d.preFilter;while(h){c&&!(e=R.exec(h))||(e&&(h=h.slice(e[0].length)||h),i.push(f=[])),c=!1,(e=S.exec(h))&&(c=e.shift(),f.push({value:c,type:e[0].replace(Q," ")}),h=h.slice(c.length));for(g in d.filter)!(e=W[g].exec(h))||j[g]&&!(e=j[g](e))||(c=e.shift(),f.push({value:c,type:g,matches:e}),h=h.slice(c.length));if(!c)break}return b?h.length:h?fa.error(a):z(a,i).slice(0)};function qa(a){for(var b=0,c=a.length,d="";c>b;b++)d+=a[b].value;return d}function ra(a,b,c){var d=b.dir,e=c&&"parentNode"===d,f=x++;return b.first?function(b,c,f){while(b=b[d])if(1===b.nodeType||e)return a(b,c,f)}:function(b,c,g){var h,i,j,k=[w,f];if(g){while(b=b[d])if((1===b.nodeType||e)&&a(b,c,g))return!0}else while(b=b[d])if(1===b.nodeType||e){if(j=b[u]||(b[u]={}),i=j[b.uniqueID]||(j[b.uniqueID]={}),(h=i[d])&&h[0]===w&&h[1]===f)return k[2]=h[2];if(i[d]=k,k[2]=a(b,c,g))return!0}}}function sa(a){return a.length>1?function(b,c,d){var e=a.length;while(e--)if(!a[e](b,c,d))return!1;return!0}:a[0]}function ta(a,b,c){for(var d=0,e=b.length;e>d;d++)fa(a,b[d],c);return c}function ua(a,b,c,d,e){for(var f,g=[],h=0,i=a.length,j=null!=b;i>h;h++)(f=a[h])&&(c&&!c(f,d,e)||(g.push(f),j&&b.push(h)));return g}function va(a,b,c,d,e,f){return d&&!d[u]&&(d=va(d)),e&&!e[u]&&(e=va(e,f)),ha(function(f,g,h,i){var j,k,l,m=[],n=[],o=g.length,p=f||ta(b||"*",h.nodeType?[h]:h,[]),q=!a||!f&&b?p:ua(p,m,a,h,i),r=c?e||(f?a:o||d)?[]:g:q;if(c&&c(q,r,h,i),d){j=ua(r,n),d(j,[],h,i),k=j.length;while(k--)(l=j[k])&&(r[n[k]]=!(q[n[k]]=l))}if(f){if(e||a){if(e){j=[],k=r.length;while(k--)(l=r[k])&&j.push(q[k]=l);e(null,r=[],j,i)}k=r.length;while(k--)(l=r[k])&&(j=e?J(f,l):m[k])>-1&&(f[j]=!(g[j]=l))}}else r=ua(r===g?r.splice(o,r.length):r),e?e(null,g,r,i):H.apply(g,r)})}function wa(a){for(var b,c,e,f=a.length,g=d.relative[a[0].type],h=g||d.relative[" "],i=g?1:0,k=ra(function(a){return a===b},h,!0),l=ra(function(a){return J(b,a)>-1},h,!0),m=[function(a,c,d){var e=!g&&(d||c!==j)||((b=c).nodeType?k(a,c,d):l(a,c,d));return b=null,e}];f>i;i++)if(c=d.relative[a[i].type])m=[ra(sa(m),c)];else{if(c=d.filter[a[i].type].apply(null,a[i].matches),c[u]){for(e=++i;f>e;e++)if(d.relative[a[e].type])break;return va(i>1&&sa(m),i>1&&qa(a.slice(0,i-1).concat({value:" "===a[i-2].type?"*":""})).replace(Q,"$1"),c,e>i&&wa(a.slice(i,e)),f>e&&wa(a=a.slice(e)),f>e&&qa(a))}m.push(c)}return sa(m)}function xa(a,b){var c=b.length>0,e=a.length>0,f=function(f,g,h,i,k){var l,o,q,r=0,s="0",t=f&&[],u=[],v=j,x=f||e&&d.find.TAG("*",k),y=w+=null==v?1:Math.random()||.1,z=x.length;for(k&&(j=g===n||g||k);s!==z&&null!=(l=x[s]);s++){if(e&&l){o=0,g||l.ownerDocument===n||(m(l),h=!p);while(q=a[o++])if(q(l,g||n,h)){i.push(l);break}k&&(w=y)}c&&((l=!q&&l)&&r--,f&&t.push(l))}if(r+=s,c&&s!==r){o=0;while(q=b[o++])q(t,u,g,h);if(f){if(r>0)while(s--)t[s]||u[s]||(u[s]=F.call(i));u=ua(u)}H.apply(i,u),k&&!f&&u.length>0&&r+b.length>1&&fa.uniqueSort(i)}return k&&(w=y,j=v),t};return c?ha(f):f}return h=fa.compile=function(a,b){var c,d=[],e=[],f=A[a+" "];if(!f){b||(b=g(a)),c=b.length;while(c--)f=wa(b[c]),f[u]?d.push(f):e.push(f);f=A(a,xa(e,d)),f.selector=a}return f},i=fa.select=function(a,b,e,f){var i,j,k,l,m,n="function"==typeof a&&a,o=!f&&g(a=n.selector||a);if(e=e||[],1===o.length){if(j=o[0]=o[0].slice(0),j.length>2&&"ID"===(k=j[0]).type&&c.getById&&9===b.nodeType&&p&&d.relative[j[1].type]){if(b=(d.find.ID(k.matches[0].replace(ba,ca),b)||[])[0],!b)return e;n&&(b=b.parentNode),a=a.slice(j.shift().value.length)}i=W.needsContext.test(a)?0:j.length;while(i--){if(k=j[i],d.relative[l=k.type])break;if((m=d.find[l])&&(f=m(k.matches[0].replace(ba,ca),_.test(j[0].type)&&oa(b.parentNode)||b))){if(j.splice(i,1),a=f.length&&qa(j),!a)return H.apply(e,f),e;break}}}return(n||h(a,o))(f,b,!p,e,!b||_.test(a)&&oa(b.parentNode)||b),e},c.sortStable=u.split("").sort(B).join("")===u,c.detectDuplicates=!!l,m(),c.sortDetached=ia(function(a){return 1&a.compareDocumentPosition(n.createElement("div"))}),ia(function(a){return a.innerHTML="<a href='#'></a>","#"===a.firstChild.getAttribute("href")})||ja("type|href|height|width",function(a,b,c){return c?void 0:a.getAttribute(b,"type"===b.toLowerCase()?1:2)}),c.attributes&&ia(function(a){return a.innerHTML="<input/>",a.firstChild.setAttribute("value",""),""===a.firstChild.getAttribute("value")})||ja("value",function(a,b,c){return c||"input"!==a.nodeName.toLowerCase()?void 0:a.defaultValue}),ia(function(a){return null==a.getAttribute("disabled")})||ja(K,function(a,b,c){var d;return c?void 0:a[b]===!0?b.toLowerCase():(d=a.getAttributeNode(b))&&d.specified?d.value:null}),fa}(a);n.find=t,n.expr=t.selectors,n.expr[":"]=n.expr.pseudos,n.uniqueSort=n.unique=t.uniqueSort,n.text=t.getText,n.isXMLDoc=t.isXML,n.contains=t.contains;var u=function(a,b,c){var d=[],e=void 0!==c;while((a=a[b])&&9!==a.nodeType)if(1===a.nodeType){if(e&&n(a).is(c))break;d.push(a)}return d},v=function(a,b){for(var c=[];a;a=a.nextSibling)1===a.nodeType&&a!==b&&c.push(a);return c},w=n.expr.match.needsContext,x=/^<([\w-]+)\s*\/?>(?:<\/\1>|)$/,y=/^.[^:#\[\.,]*$/;function z(a,b,c){if(n.isFunction(b))return n.grep(a,function(a,d){return!!b.call(a,d,a)!==c});if(b.nodeType)return n.grep(a,function(a){return a===b!==c});if("string"==typeof b){if(y.test(b))return n.filter(b,a,c);b=n.filter(b,a)}return n.grep(a,function(a){return h.call(b,a)>-1!==c})}n.filter=function(a,b,c){var d=b[0];return c&&(a=":not("+a+")"),1===b.length&&1===d.nodeType?n.find.matchesSelector(d,a)?[d]:[]:n.find.matches(a,n.grep(b,function(a){return 1===a.nodeType}))},n.fn.extend({find:function(a){var b,c=this.length,d=[],e=this;if("string"!=typeof a)return this.pushStack(n(a).filter(function(){for(b=0;c>b;b++)if(n.contains(e[b],this))return!0}));for(b=0;c>b;b++)n.find(a,e[b],d);return d=this.pushStack(c>1?n.unique(d):d),d.selector=this.selector?this.selector+" "+a:a,d},filter:function(a){return this.pushStack(z(this,a||[],!1))},not:function(a){return this.pushStack(z(this,a||[],!0))},is:function(a){return!!z(this,"string"==typeof a&&w.test(a)?n(a):a||[],!1).length}});var A,B=/^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,C=n.fn.init=function(a,b,c){var e,f;if(!a)return this;if(c=c||A,"string"==typeof a){if(e="<"===a[0]&&">"===a[a.length-1]&&a.length>=3?[null,a,null]:B.exec(a),!e||!e[1]&&b)return!b||b.jquery?(b||c).find(a):this.constructor(b).find(a);if(e[1]){if(b=b instanceof n?b[0]:b,n.merge(this,n.parseHTML(e[1],b&&b.nodeType?b.ownerDocument||b:d,!0)),x.test(e[1])&&n.isPlainObject(b))for(e in b)n.isFunction(this[e])?this[e](b[e]):this.attr(e,b[e]);return this}return f=d.getElementById(e[2]),f&&f.parentNode&&(this.length=1,this[0]=f),this.context=d,this.selector=a,this}return a.nodeType?(this.context=this[0]=a,this.length=1,this):n.isFunction(a)?void 0!==c.ready?c.ready(a):a(n):(void 0!==a.selector&&(this.selector=a.selector,this.context=a.context),n.makeArray(a,this))};C.prototype=n.fn,A=n(d);var D=/^(?:parents|prev(?:Until|All))/,E={children:!0,contents:!0,next:!0,prev:!0};n.fn.extend({has:function(a){var b=n(a,this),c=b.length;return this.filter(function(){for(var a=0;c>a;a++)if(n.contains(this,b[a]))return!0})},closest:function(a,b){for(var c,d=0,e=this.length,f=[],g=w.test(a)||"string"!=typeof a?n(a,b||this.context):0;e>d;d++)for(c=this[d];c&&c!==b;c=c.parentNode)if(c.nodeType<11&&(g?g.index(c)>-1:1===c.nodeType&&n.find.matchesSelector(c,a))){f.push(c);break}return this.pushStack(f.length>1?n.uniqueSort(f):f)},index:function(a){return a?"string"==typeof a?h.call(n(a),this[0]):h.call(this,a.jquery?a[0]:a):this[0]&&this[0].parentNode?this.first().prevAll().length:-1},add:function(a,b){return this.pushStack(n.uniqueSort(n.merge(this.get(),n(a,b))))},addBack:function(a){return this.add(null==a?this.prevObject:this.prevObject.filter(a))}});function F(a,b){while((a=a[b])&&1!==a.nodeType);return a}n.each({parent:function(a){var b=a.parentNode;return b&&11!==b.nodeType?b:null},parents:function(a){return u(a,"parentNode")},parentsUntil:function(a,b,c){return u(a,"parentNode",c)},next:function(a){return F(a,"nextSibling")},prev:function(a){return F(a,"previousSibling")},nextAll:function(a){return u(a,"nextSibling")},prevAll:function(a){return u(a,"previousSibling")},nextUntil:function(a,b,c){return u(a,"nextSibling",c)},prevUntil:function(a,b,c){return u(a,"previousSibling",c)},siblings:function(a){return v((a.parentNode||{}).firstChild,a)},children:function(a){return v(a.firstChild)},contents:function(a){return a.contentDocument||n.merge([],a.childNodes)}},function(a,b){n.fn[a]=function(c,d){var e=n.map(this,b,c);return"Until"!==a.slice(-5)&&(d=c),d&&"string"==typeof d&&(e=n.filter(d,e)),this.length>1&&(E[a]||n.uniqueSort(e),D.test(a)&&e.reverse()),this.pushStack(e)}});var G=/\S+/g;function H(a){var b={};return n.each(a.match(G)||[],function(a,c){b[c]=!0}),b}n.Callbacks=function(a){a="string"==typeof a?H(a):n.extend({},a);var b,c,d,e,f=[],g=[],h=-1,i=function(){for(e=a.once,d=b=!0;g.length;h=-1){c=g.shift();while(++h<f.length)f[h].apply(c[0],c[1])===!1&&a.stopOnFalse&&(h=f.length,c=!1)}a.memory||(c=!1),b=!1,e&&(f=c?[]:"")},j={add:function(){return f&&(c&&!b&&(h=f.length-1,g.push(c)),function d(b){n.each(b,function(b,c){n.isFunction(c)?a.unique&&j.has(c)||f.push(c):c&&c.length&&"string"!==n.type(c)&&d(c)})}(arguments),c&&!b&&i()),this},remove:function(){return n.each(arguments,function(a,b){var c;while((c=n.inArray(b,f,c))>-1)f.splice(c,1),h>=c&&h--}),this},has:function(a){return a?n.inArray(a,f)>-1:f.length>0},empty:function(){return f&&(f=[]),this},disable:function(){return e=g=[],f=c="",this},disabled:function(){return!f},lock:function(){return e=g=[],c||(f=c=""),this},locked:function(){return!!e},fireWith:function(a,c){return e||(c=c||[],c=[a,c.slice?c.slice():c],g.push(c),b||i()),this},fire:function(){return j.fireWith(this,arguments),this},fired:function(){return!!d}};return j},n.extend({Deferred:function(a){var b=[["resolve","done",n.Callbacks("once memory"),"resolved"],["reject","fail",n.Callbacks("once memory"),"rejected"],["notify","progress",n.Callbacks("memory")]],c="pending",d={state:function(){return c},always:function(){return e.done(arguments).fail(arguments),this},then:function(){var a=arguments;return n.Deferred(function(c){n.each(b,function(b,f){var g=n.isFunction(a[b])&&a[b];e[f[1]](function(){var a=g&&g.apply(this,arguments);a&&n.isFunction(a.promise)?a.promise().progress(c.notify).done(c.resolve).fail(c.reject):c[f[0]+"With"](this===d?c.promise():this,g?[a]:arguments)})}),a=null}).promise()},promise:function(a){return null!=a?n.extend(a,d):d}},e={};return d.pipe=d.then,n.each(b,function(a,f){var g=f[2],h=f[3];d[f[1]]=g.add,h&&g.add(function(){c=h},b[1^a][2].disable,b[2][2].lock),e[f[0]]=function(){return e[f[0]+"With"](this===e?d:this,arguments),this},e[f[0]+"With"]=g.fireWith}),d.promise(e),a&&a.call(e,e),e},when:function(a){var b=0,c=e.call(arguments),d=c.length,f=1!==d||a&&n.isFunction(a.promise)?d:0,g=1===f?a:n.Deferred(),h=function(a,b,c){return function(d){b[a]=this,c[a]=arguments.length>1?e.call(arguments):d,c===i?g.notifyWith(b,c):--f||g.resolveWith(b,c)}},i,j,k;if(d>1)for(i=new Array(d),j=new Array(d),k=new Array(d);d>b;b++)c[b]&&n.isFunction(c[b].promise)?c[b].promise().progress(h(b,j,i)).done(h(b,k,c)).fail(g.reject):--f;return f||g.resolveWith(k,c),g.promise()}});var I;n.fn.ready=function(a){return n.ready.promise().done(a),this},n.extend({isReady:!1,readyWait:1,holdReady:function(a){a?n.readyWait++:n.ready(!0)},ready:function(a){(a===!0?--n.readyWait:n.isReady)||(n.isReady=!0,a!==!0&&--n.readyWait>0||(I.resolveWith(d,[n]),n.fn.triggerHandler&&(n(d).triggerHandler("ready"),n(d).off("ready"))))}});function J(){d.removeEventListener("DOMContentLoaded",J),a.removeEventListener("load",J),n.ready()}n.ready.promise=function(b){return I||(I=n.Deferred(),"complete"===d.readyState||"loading"!==d.readyState&&!d.documentElement.doScroll?a.setTimeout(n.ready):(d.addEventListener("DOMContentLoaded",J),a.addEventListener("load",J))),I.promise(b)},n.ready.promise();var K=function(a,b,c,d,e,f,g){var h=0,i=a.length,j=null==c;if("object"===n.type(c)){e=!0;for(h in c)K(a,b,h,c[h],!0,f,g)}else if(void 0!==d&&(e=!0,n.isFunction(d)||(g=!0),j&&(g?(b.call(a,d),b=null):(j=b,b=function(a,b,c){return j.call(n(a),c)})),b))for(;i>h;h++)b(a[h],c,g?d:d.call(a[h],h,b(a[h],c)));return e?a:j?b.call(a):i?b(a[0],c):f},L=function(a){return 1===a.nodeType||9===a.nodeType||!+a.nodeType};function M(){this.expando=n.expando+M.uid++}M.uid=1,M.prototype={register:function(a,b){var c=b||{};return a.nodeType?a[this.expando]=c:Object.defineProperty(a,this.expando,{value:c,writable:!0,configurable:!0}),a[this.expando]},cache:function(a){if(!L(a))return{};var b=a[this.expando];return b||(b={},L(a)&&(a.nodeType?a[this.expando]=b:Object.defineProperty(a,this.expando,{value:b,configurable:!0}))),b},set:function(a,b,c){var d,e=this.cache(a);if("string"==typeof b)e[b]=c;else for(d in b)e[d]=b[d];return e},get:function(a,b){return void 0===b?this.cache(a):a[this.expando]&&a[this.expando][b]},access:function(a,b,c){var d;return void 0===b||b&&"string"==typeof b&&void 0===c?(d=this.get(a,b),void 0!==d?d:this.get(a,n.camelCase(b))):(this.set(a,b,c),void 0!==c?c:b)},remove:function(a,b){var c,d,e,f=a[this.expando];if(void 0!==f){if(void 0===b)this.register(a);else{n.isArray(b)?d=b.concat(b.map(n.camelCase)):(e=n.camelCase(b),b in f?d=[b,e]:(d=e,d=d in f?[d]:d.match(G)||[])),c=d.length;while(c--)delete f[d[c]]}(void 0===b||n.isEmptyObject(f))&&(a.nodeType?a[this.expando]=void 0:delete a[this.expando])}},hasData:function(a){var b=a[this.expando];return void 0!==b&&!n.isEmptyObject(b)}};var N=new M,O=new M,P=/^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,Q=/[A-Z]/g;function R(a,b,c){var d;if(void 0===c&&1===a.nodeType)if(d="data-"+b.replace(Q,"-$&").toLowerCase(),c=a.getAttribute(d),"string"==typeof c){try{c="true"===c?!0:"false"===c?!1:"null"===c?null:+c+""===c?+c:P.test(c)?n.parseJSON(c):c;
}catch(e){}O.set(a,b,c)}else c=void 0;return c}n.extend({hasData:function(a){return O.hasData(a)||N.hasData(a)},data:function(a,b,c){return O.access(a,b,c)},removeData:function(a,b){O.remove(a,b)},_data:function(a,b,c){return N.access(a,b,c)},_removeData:function(a,b){N.remove(a,b)}}),n.fn.extend({data:function(a,b){var c,d,e,f=this[0],g=f&&f.attributes;if(void 0===a){if(this.length&&(e=O.get(f),1===f.nodeType&&!N.get(f,"hasDataAttrs"))){c=g.length;while(c--)g[c]&&(d=g[c].name,0===d.indexOf("data-")&&(d=n.camelCase(d.slice(5)),R(f,d,e[d])));N.set(f,"hasDataAttrs",!0)}return e}return"object"==typeof a?this.each(function(){O.set(this,a)}):K(this,function(b){var c,d;if(f&&void 0===b){if(c=O.get(f,a)||O.get(f,a.replace(Q,"-$&").toLowerCase()),void 0!==c)return c;if(d=n.camelCase(a),c=O.get(f,d),void 0!==c)return c;if(c=R(f,d,void 0),void 0!==c)return c}else d=n.camelCase(a),this.each(function(){var c=O.get(this,d);O.set(this,d,b),a.indexOf("-")>-1&&void 0!==c&&O.set(this,a,b)})},null,b,arguments.length>1,null,!0)},removeData:function(a){return this.each(function(){O.remove(this,a)})}}),n.extend({queue:function(a,b,c){var d;return a?(b=(b||"fx")+"queue",d=N.get(a,b),c&&(!d||n.isArray(c)?d=N.access(a,b,n.makeArray(c)):d.push(c)),d||[]):void 0},dequeue:function(a,b){b=b||"fx";var c=n.queue(a,b),d=c.length,e=c.shift(),f=n._queueHooks(a,b),g=function(){n.dequeue(a,b)};"inprogress"===e&&(e=c.shift(),d--),e&&("fx"===b&&c.unshift("inprogress"),delete f.stop,e.call(a,g,f)),!d&&f&&f.empty.fire()},_queueHooks:function(a,b){var c=b+"queueHooks";return N.get(a,c)||N.access(a,c,{empty:n.Callbacks("once memory").add(function(){N.remove(a,[b+"queue",c])})})}}),n.fn.extend({queue:function(a,b){var c=2;return"string"!=typeof a&&(b=a,a="fx",c--),arguments.length<c?n.queue(this[0],a):void 0===b?this:this.each(function(){var c=n.queue(this,a,b);n._queueHooks(this,a),"fx"===a&&"inprogress"!==c[0]&&n.dequeue(this,a)})},dequeue:function(a){return this.each(function(){n.dequeue(this,a)})},clearQueue:function(a){return this.queue(a||"fx",[])},promise:function(a,b){var c,d=1,e=n.Deferred(),f=this,g=this.length,h=function(){--d||e.resolveWith(f,[f])};"string"!=typeof a&&(b=a,a=void 0),a=a||"fx";while(g--)c=N.get(f[g],a+"queueHooks"),c&&c.empty&&(d++,c.empty.add(h));return h(),e.promise(b)}});var S=/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,T=new RegExp("^(?:([+-])=|)("+S+")([a-z%]*)$","i"),U=["Top","Right","Bottom","Left"],V=function(a,b){return a=b||a,"none"===n.css(a,"display")||!n.contains(a.ownerDocument,a)};function W(a,b,c,d){var e,f=1,g=20,h=d?function(){return d.cur()}:function(){return n.css(a,b,"")},i=h(),j=c&&c[3]||(n.cssNumber[b]?"":"px"),k=(n.cssNumber[b]||"px"!==j&&+i)&&T.exec(n.css(a,b));if(k&&k[3]!==j){j=j||k[3],c=c||[],k=+i||1;do f=f||".5",k/=f,n.style(a,b,k+j);while(f!==(f=h()/i)&&1!==f&&--g)}return c&&(k=+k||+i||0,e=c[1]?k+(c[1]+1)*c[2]:+c[2],d&&(d.unit=j,d.start=k,d.end=e)),e}var X=/^(?:checkbox|radio)$/i,Y=/<([\w:-]+)/,Z=/^$|\/(?:java|ecma)script/i,$={option:[1,"<select multiple='multiple'>","</select>"],thead:[1,"<table>","</table>"],col:[2,"<table><colgroup>","</colgroup></table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],_default:[0,"",""]};$.optgroup=$.option,$.tbody=$.tfoot=$.colgroup=$.caption=$.thead,$.th=$.td;function _(a,b){var c="undefined"!=typeof a.getElementsByTagName?a.getElementsByTagName(b||"*"):"undefined"!=typeof a.querySelectorAll?a.querySelectorAll(b||"*"):[];return void 0===b||b&&n.nodeName(a,b)?n.merge([a],c):c}function aa(a,b){for(var c=0,d=a.length;d>c;c++)N.set(a[c],"globalEval",!b||N.get(b[c],"globalEval"))}var ba=/<|&#?\w+;/;function ca(a,b,c,d,e){for(var f,g,h,i,j,k,l=b.createDocumentFragment(),m=[],o=0,p=a.length;p>o;o++)if(f=a[o],f||0===f)if("object"===n.type(f))n.merge(m,f.nodeType?[f]:f);else if(ba.test(f)){g=g||l.appendChild(b.createElement("div")),h=(Y.exec(f)||["",""])[1].toLowerCase(),i=$[h]||$._default,g.innerHTML=i[1]+n.htmlPrefilter(f)+i[2],k=i[0];while(k--)g=g.lastChild;n.merge(m,g.childNodes),g=l.firstChild,g.textContent=""}else m.push(b.createTextNode(f));l.textContent="",o=0;while(f=m[o++])if(d&&n.inArray(f,d)>-1)e&&e.push(f);else if(j=n.contains(f.ownerDocument,f),g=_(l.appendChild(f),"script"),j&&aa(g),c){k=0;while(f=g[k++])Z.test(f.type||"")&&c.push(f)}return l}!function(){var a=d.createDocumentFragment(),b=a.appendChild(d.createElement("div")),c=d.createElement("input");c.setAttribute("type","radio"),c.setAttribute("checked","checked"),c.setAttribute("name","t"),b.appendChild(c),l.checkClone=b.cloneNode(!0).cloneNode(!0).lastChild.checked,b.innerHTML="<textarea>x</textarea>",l.noCloneChecked=!!b.cloneNode(!0).lastChild.defaultValue}();var da=/^key/,ea=/^(?:mouse|pointer|contextmenu|drag|drop)|click/,fa=/^([^.]*)(?:\.(.+)|)/;function ga(){return!0}function ha(){return!1}function ia(){try{return d.activeElement}catch(a){}}function ja(a,b,c,d,e,f){var g,h;if("object"==typeof b){"string"!=typeof c&&(d=d||c,c=void 0);for(h in b)ja(a,h,c,d,b[h],f);return a}if(null==d&&null==e?(e=c,d=c=void 0):null==e&&("string"==typeof c?(e=d,d=void 0):(e=d,d=c,c=void 0)),e===!1)e=ha;else if(!e)return a;return 1===f&&(g=e,e=function(a){return n().off(a),g.apply(this,arguments)},e.guid=g.guid||(g.guid=n.guid++)),a.each(function(){n.event.add(this,b,e,d,c)})}n.event={global:{},add:function(a,b,c,d,e){var f,g,h,i,j,k,l,m,o,p,q,r=N.get(a);if(r){c.handler&&(f=c,c=f.handler,e=f.selector),c.guid||(c.guid=n.guid++),(i=r.events)||(i=r.events={}),(g=r.handle)||(g=r.handle=function(b){return"undefined"!=typeof n&&n.event.triggered!==b.type?n.event.dispatch.apply(a,arguments):void 0}),b=(b||"").match(G)||[""],j=b.length;while(j--)h=fa.exec(b[j])||[],o=q=h[1],p=(h[2]||"").split(".").sort(),o&&(l=n.event.special[o]||{},o=(e?l.delegateType:l.bindType)||o,l=n.event.special[o]||{},k=n.extend({type:o,origType:q,data:d,handler:c,guid:c.guid,selector:e,needsContext:e&&n.expr.match.needsContext.test(e),namespace:p.join(".")},f),(m=i[o])||(m=i[o]=[],m.delegateCount=0,l.setup&&l.setup.call(a,d,p,g)!==!1||a.addEventListener&&a.addEventListener(o,g)),l.add&&(l.add.call(a,k),k.handler.guid||(k.handler.guid=c.guid)),e?m.splice(m.delegateCount++,0,k):m.push(k),n.event.global[o]=!0)}},remove:function(a,b,c,d,e){var f,g,h,i,j,k,l,m,o,p,q,r=N.hasData(a)&&N.get(a);if(r&&(i=r.events)){b=(b||"").match(G)||[""],j=b.length;while(j--)if(h=fa.exec(b[j])||[],o=q=h[1],p=(h[2]||"").split(".").sort(),o){l=n.event.special[o]||{},o=(d?l.delegateType:l.bindType)||o,m=i[o]||[],h=h[2]&&new RegExp("(^|\\.)"+p.join("\\.(?:.*\\.|)")+"(\\.|$)"),g=f=m.length;while(f--)k=m[f],!e&&q!==k.origType||c&&c.guid!==k.guid||h&&!h.test(k.namespace)||d&&d!==k.selector&&("**"!==d||!k.selector)||(m.splice(f,1),k.selector&&m.delegateCount--,l.remove&&l.remove.call(a,k));g&&!m.length&&(l.teardown&&l.teardown.call(a,p,r.handle)!==!1||n.removeEvent(a,o,r.handle),delete i[o])}else for(o in i)n.event.remove(a,o+b[j],c,d,!0);n.isEmptyObject(i)&&N.remove(a,"handle events")}},dispatch:function(a){a=n.event.fix(a);var b,c,d,f,g,h=[],i=e.call(arguments),j=(N.get(this,"events")||{})[a.type]||[],k=n.event.special[a.type]||{};if(i[0]=a,a.delegateTarget=this,!k.preDispatch||k.preDispatch.call(this,a)!==!1){h=n.event.handlers.call(this,a,j),b=0;while((f=h[b++])&&!a.isPropagationStopped()){a.currentTarget=f.elem,c=0;while((g=f.handlers[c++])&&!a.isImmediatePropagationStopped())a.rnamespace&&!a.rnamespace.test(g.namespace)||(a.handleObj=g,a.data=g.data,d=((n.event.special[g.origType]||{}).handle||g.handler).apply(f.elem,i),void 0!==d&&(a.result=d)===!1&&(a.preventDefault(),a.stopPropagation()))}return k.postDispatch&&k.postDispatch.call(this,a),a.result}},handlers:function(a,b){var c,d,e,f,g=[],h=b.delegateCount,i=a.target;if(h&&i.nodeType&&("click"!==a.type||isNaN(a.button)||a.button<1))for(;i!==this;i=i.parentNode||this)if(1===i.nodeType&&(i.disabled!==!0||"click"!==a.type)){for(d=[],c=0;h>c;c++)f=b[c],e=f.selector+" ",void 0===d[e]&&(d[e]=f.needsContext?n(e,this).index(i)>-1:n.find(e,this,null,[i]).length),d[e]&&d.push(f);d.length&&g.push({elem:i,handlers:d})}return h<b.length&&g.push({elem:this,handlers:b.slice(h)}),g},props:"altKey bubbles cancelable ctrlKey currentTarget detail eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),fixHooks:{},keyHooks:{props:"char charCode key keyCode".split(" "),filter:function(a,b){return null==a.which&&(a.which=null!=b.charCode?b.charCode:b.keyCode),a}},mouseHooks:{props:"button buttons clientX clientY offsetX offsetY pageX pageY screenX screenY toElement".split(" "),filter:function(a,b){var c,e,f,g=b.button;return null==a.pageX&&null!=b.clientX&&(c=a.target.ownerDocument||d,e=c.documentElement,f=c.body,a.pageX=b.clientX+(e&&e.scrollLeft||f&&f.scrollLeft||0)-(e&&e.clientLeft||f&&f.clientLeft||0),a.pageY=b.clientY+(e&&e.scrollTop||f&&f.scrollTop||0)-(e&&e.clientTop||f&&f.clientTop||0)),a.which||void 0===g||(a.which=1&g?1:2&g?3:4&g?2:0),a}},fix:function(a){if(a[n.expando])return a;var b,c,e,f=a.type,g=a,h=this.fixHooks[f];h||(this.fixHooks[f]=h=ea.test(f)?this.mouseHooks:da.test(f)?this.keyHooks:{}),e=h.props?this.props.concat(h.props):this.props,a=new n.Event(g),b=e.length;while(b--)c=e[b],a[c]=g[c];return a.target||(a.target=d),3===a.target.nodeType&&(a.target=a.target.parentNode),h.filter?h.filter(a,g):a},special:{load:{noBubble:!0},focus:{trigger:function(){return this!==ia()&&this.focus?(this.focus(),!1):void 0},delegateType:"focusin"},blur:{trigger:function(){return this===ia()&&this.blur?(this.blur(),!1):void 0},delegateType:"focusout"},click:{trigger:function(){return"checkbox"===this.type&&this.click&&n.nodeName(this,"input")?(this.click(),!1):void 0},_default:function(a){return n.nodeName(a.target,"a")}},beforeunload:{postDispatch:function(a){void 0!==a.result&&a.originalEvent&&(a.originalEvent.returnValue=a.result)}}}},n.removeEvent=function(a,b,c){a.removeEventListener&&a.removeEventListener(b,c)},n.Event=function(a,b){return this instanceof n.Event?(a&&a.type?(this.originalEvent=a,this.type=a.type,this.isDefaultPrevented=a.defaultPrevented||void 0===a.defaultPrevented&&a.returnValue===!1?ga:ha):this.type=a,b&&n.extend(this,b),this.timeStamp=a&&a.timeStamp||n.now(),void(this[n.expando]=!0)):new n.Event(a,b)},n.Event.prototype={constructor:n.Event,isDefaultPrevented:ha,isPropagationStopped:ha,isImmediatePropagationStopped:ha,preventDefault:function(){var a=this.originalEvent;this.isDefaultPrevented=ga,a&&a.preventDefault()},stopPropagation:function(){var a=this.originalEvent;this.isPropagationStopped=ga,a&&a.stopPropagation()},stopImmediatePropagation:function(){var a=this.originalEvent;this.isImmediatePropagationStopped=ga,a&&a.stopImmediatePropagation(),this.stopPropagation()}},n.each({mouseenter:"mouseover",mouseleave:"mouseout",pointerenter:"pointerover",pointerleave:"pointerout"},function(a,b){n.event.special[a]={delegateType:b,bindType:b,handle:function(a){var c,d=this,e=a.relatedTarget,f=a.handleObj;return e&&(e===d||n.contains(d,e))||(a.type=f.origType,c=f.handler.apply(this,arguments),a.type=b),c}}}),n.fn.extend({on:function(a,b,c,d){return ja(this,a,b,c,d)},one:function(a,b,c,d){return ja(this,a,b,c,d,1)},off:function(a,b,c){var d,e;if(a&&a.preventDefault&&a.handleObj)return d=a.handleObj,n(a.delegateTarget).off(d.namespace?d.origType+"."+d.namespace:d.origType,d.selector,d.handler),this;if("object"==typeof a){for(e in a)this.off(e,b,a[e]);return this}return b!==!1&&"function"!=typeof b||(c=b,b=void 0),c===!1&&(c=ha),this.each(function(){n.event.remove(this,a,c,b)})}});var ka=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:-]+)[^>]*)\/>/gi,la=/<script|<style|<link/i,ma=/checked\s*(?:[^=]|=\s*.checked.)/i,na=/^true\/(.*)/,oa=/^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g;function pa(a,b){return n.nodeName(a,"table")&&n.nodeName(11!==b.nodeType?b:b.firstChild,"tr")?a.getElementsByTagName("tbody")[0]||a.appendChild(a.ownerDocument.createElement("tbody")):a}function qa(a){return a.type=(null!==a.getAttribute("type"))+"/"+a.type,a}function ra(a){var b=na.exec(a.type);return b?a.type=b[1]:a.removeAttribute("type"),a}function sa(a,b){var c,d,e,f,g,h,i,j;if(1===b.nodeType){if(N.hasData(a)&&(f=N.access(a),g=N.set(b,f),j=f.events)){delete g.handle,g.events={};for(e in j)for(c=0,d=j[e].length;d>c;c++)n.event.add(b,e,j[e][c])}O.hasData(a)&&(h=O.access(a),i=n.extend({},h),O.set(b,i))}}function ta(a,b){var c=b.nodeName.toLowerCase();"input"===c&&X.test(a.type)?b.checked=a.checked:"input"!==c&&"textarea"!==c||(b.defaultValue=a.defaultValue)}function ua(a,b,c,d){b=f.apply([],b);var e,g,h,i,j,k,m=0,o=a.length,p=o-1,q=b[0],r=n.isFunction(q);if(r||o>1&&"string"==typeof q&&!l.checkClone&&ma.test(q))return a.each(function(e){var f=a.eq(e);r&&(b[0]=q.call(this,e,f.html())),ua(f,b,c,d)});if(o&&(e=ca(b,a[0].ownerDocument,!1,a,d),g=e.firstChild,1===e.childNodes.length&&(e=g),g||d)){for(h=n.map(_(e,"script"),qa),i=h.length;o>m;m++)j=e,m!==p&&(j=n.clone(j,!0,!0),i&&n.merge(h,_(j,"script"))),c.call(a[m],j,m);if(i)for(k=h[h.length-1].ownerDocument,n.map(h,ra),m=0;i>m;m++)j=h[m],Z.test(j.type||"")&&!N.access(j,"globalEval")&&n.contains(k,j)&&(j.src?n._evalUrl&&n._evalUrl(j.src):n.globalEval(j.textContent.replace(oa,"")))}return a}function va(a,b,c){for(var d,e=b?n.filter(b,a):a,f=0;null!=(d=e[f]);f++)c||1!==d.nodeType||n.cleanData(_(d)),d.parentNode&&(c&&n.contains(d.ownerDocument,d)&&aa(_(d,"script")),d.parentNode.removeChild(d));return a}n.extend({htmlPrefilter:function(a){return a.replace(ka,"<$1></$2>")},clone:function(a,b,c){var d,e,f,g,h=a.cloneNode(!0),i=n.contains(a.ownerDocument,a);if(!(l.noCloneChecked||1!==a.nodeType&&11!==a.nodeType||n.isXMLDoc(a)))for(g=_(h),f=_(a),d=0,e=f.length;e>d;d++)ta(f[d],g[d]);if(b)if(c)for(f=f||_(a),g=g||_(h),d=0,e=f.length;e>d;d++)sa(f[d],g[d]);else sa(a,h);return g=_(h,"script"),g.length>0&&aa(g,!i&&_(a,"script")),h},cleanData:function(a){for(var b,c,d,e=n.event.special,f=0;void 0!==(c=a[f]);f++)if(L(c)){if(b=c[N.expando]){if(b.events)for(d in b.events)e[d]?n.event.remove(c,d):n.removeEvent(c,d,b.handle);c[N.expando]=void 0}c[O.expando]&&(c[O.expando]=void 0)}}}),n.fn.extend({domManip:ua,detach:function(a){return va(this,a,!0)},remove:function(a){return va(this,a)},text:function(a){return K(this,function(a){return void 0===a?n.text(this):this.empty().each(function(){1!==this.nodeType&&11!==this.nodeType&&9!==this.nodeType||(this.textContent=a)})},null,a,arguments.length)},append:function(){return ua(this,arguments,function(a){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var b=pa(this,a);b.appendChild(a)}})},prepend:function(){return ua(this,arguments,function(a){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var b=pa(this,a);b.insertBefore(a,b.firstChild)}})},before:function(){return ua(this,arguments,function(a){this.parentNode&&this.parentNode.insertBefore(a,this)})},after:function(){return ua(this,arguments,function(a){this.parentNode&&this.parentNode.insertBefore(a,this.nextSibling)})},empty:function(){for(var a,b=0;null!=(a=this[b]);b++)1===a.nodeType&&(n.cleanData(_(a,!1)),a.textContent="");return this},clone:function(a,b){return a=null==a?!1:a,b=null==b?a:b,this.map(function(){return n.clone(this,a,b)})},html:function(a){return K(this,function(a){var b=this[0]||{},c=0,d=this.length;if(void 0===a&&1===b.nodeType)return b.innerHTML;if("string"==typeof a&&!la.test(a)&&!$[(Y.exec(a)||["",""])[1].toLowerCase()]){a=n.htmlPrefilter(a);try{for(;d>c;c++)b=this[c]||{},1===b.nodeType&&(n.cleanData(_(b,!1)),b.innerHTML=a);b=0}catch(e){}}b&&this.empty().append(a)},null,a,arguments.length)},replaceWith:function(){var a=[];return ua(this,arguments,function(b){var c=this.parentNode;n.inArray(this,a)<0&&(n.cleanData(_(this)),c&&c.replaceChild(b,this))},a)}}),n.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(a,b){n.fn[a]=function(a){for(var c,d=[],e=n(a),f=e.length-1,h=0;f>=h;h++)c=h===f?this:this.clone(!0),n(e[h])[b](c),g.apply(d,c.get());return this.pushStack(d)}});var wa,xa={HTML:"block",BODY:"block"};function ya(a,b){var c=n(b.createElement(a)).appendTo(b.body),d=n.css(c[0],"display");return c.detach(),d}function za(a){var b=d,c=xa[a];return c||(c=ya(a,b),"none"!==c&&c||(wa=(wa||n("<iframe frameborder='0' width='0' height='0'/>")).appendTo(b.documentElement),b=wa[0].contentDocument,b.write(),b.close(),c=ya(a,b),wa.detach()),xa[a]=c),c}var Aa=/^margin/,Ba=new RegExp("^("+S+")(?!px)[a-z%]+$","i"),Ca=function(b){var c=b.ownerDocument.defaultView;return c&&c.opener||(c=a),c.getComputedStyle(b)},Da=function(a,b,c,d){var e,f,g={};for(f in b)g[f]=a.style[f],a.style[f]=b[f];e=c.apply(a,d||[]);for(f in b)a.style[f]=g[f];return e},Ea=d.documentElement;!function(){var b,c,e,f,g=d.createElement("div"),h=d.createElement("div");if(h.style){h.style.backgroundClip="content-box",h.cloneNode(!0).style.backgroundClip="",l.clearCloneStyle="content-box"===h.style.backgroundClip,g.style.cssText="border:0;width:8px;height:0;top:0;left:-9999px;padding:0;margin-top:1px;position:absolute",g.appendChild(h);function i(){h.style.cssText="-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;position:relative;display:block;margin:auto;border:1px;padding:1px;top:1%;width:50%",h.innerHTML="",Ea.appendChild(g);var d=a.getComputedStyle(h);b="1%"!==d.top,f="2px"===d.marginLeft,c="4px"===d.width,h.style.marginRight="50%",e="4px"===d.marginRight,Ea.removeChild(g)}n.extend(l,{pixelPosition:function(){return i(),b},boxSizingReliable:function(){return null==c&&i(),c},pixelMarginRight:function(){return null==c&&i(),e},reliableMarginLeft:function(){return null==c&&i(),f},reliableMarginRight:function(){var b,c=h.appendChild(d.createElement("div"));return c.style.cssText=h.style.cssText="-webkit-box-sizing:content-box;box-sizing:content-box;display:block;margin:0;border:0;padding:0",c.style.marginRight=c.style.width="0",h.style.width="1px",Ea.appendChild(g),b=!parseFloat(a.getComputedStyle(c).marginRight),Ea.removeChild(g),h.removeChild(c),b}})}}();function Fa(a,b,c){var d,e,f,g,h=a.style;return c=c||Ca(a),g=c?c.getPropertyValue(b)||c[b]:void 0,""!==g&&void 0!==g||n.contains(a.ownerDocument,a)||(g=n.style(a,b)),c&&!l.pixelMarginRight()&&Ba.test(g)&&Aa.test(b)&&(d=h.width,e=h.minWidth,f=h.maxWidth,h.minWidth=h.maxWidth=h.width=g,g=c.width,h.width=d,h.minWidth=e,h.maxWidth=f),void 0!==g?g+"":g}function Ga(a,b){return{get:function(){return a()?void delete this.get:(this.get=b).apply(this,arguments)}}}var Ha=/^(none|table(?!-c[ea]).+)/,Ia={position:"absolute",visibility:"hidden",display:"block"},Ja={letterSpacing:"0",fontWeight:"400"},Ka=["Webkit","O","Moz","ms"],La=d.createElement("div").style;function Ma(a){if(a in La)return a;var b=a[0].toUpperCase()+a.slice(1),c=Ka.length;while(c--)if(a=Ka[c]+b,a in La)return a}function Na(a,b,c){var d=T.exec(b);return d?Math.max(0,d[2]-(c||0))+(d[3]||"px"):b}function Oa(a,b,c,d,e){for(var f=c===(d?"border":"content")?4:"width"===b?1:0,g=0;4>f;f+=2)"margin"===c&&(g+=n.css(a,c+U[f],!0,e)),d?("content"===c&&(g-=n.css(a,"padding"+U[f],!0,e)),"margin"!==c&&(g-=n.css(a,"border"+U[f]+"Width",!0,e))):(g+=n.css(a,"padding"+U[f],!0,e),"padding"!==c&&(g+=n.css(a,"border"+U[f]+"Width",!0,e)));return g}function Pa(b,c,e){var f=!0,g="width"===c?b.offsetWidth:b.offsetHeight,h=Ca(b),i="border-box"===n.css(b,"boxSizing",!1,h);if(d.msFullscreenElement&&a.top!==a&&b.getClientRects().length&&(g=Math.round(100*b.getBoundingClientRect()[c])),0>=g||null==g){if(g=Fa(b,c,h),(0>g||null==g)&&(g=b.style[c]),Ba.test(g))return g;f=i&&(l.boxSizingReliable()||g===b.style[c]),g=parseFloat(g)||0}return g+Oa(b,c,e||(i?"border":"content"),f,h)+"px"}function Qa(a,b){for(var c,d,e,f=[],g=0,h=a.length;h>g;g++)d=a[g],d.style&&(f[g]=N.get(d,"olddisplay"),c=d.style.display,b?(f[g]||"none"!==c||(d.style.display=""),""===d.style.display&&V(d)&&(f[g]=N.access(d,"olddisplay",za(d.nodeName)))):(e=V(d),"none"===c&&e||N.set(d,"olddisplay",e?c:n.css(d,"display"))));for(g=0;h>g;g++)d=a[g],d.style&&(b&&"none"!==d.style.display&&""!==d.style.display||(d.style.display=b?f[g]||"":"none"));return a}n.extend({cssHooks:{opacity:{get:function(a,b){if(b){var c=Fa(a,"opacity");return""===c?"1":c}}}},cssNumber:{animationIterationCount:!0,columnCount:!0,fillOpacity:!0,flexGrow:!0,flexShrink:!0,fontWeight:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,widows:!0,zIndex:!0,zoom:!0},cssProps:{"float":"cssFloat"},style:function(a,b,c,d){if(a&&3!==a.nodeType&&8!==a.nodeType&&a.style){var e,f,g,h=n.camelCase(b),i=a.style;return b=n.cssProps[h]||(n.cssProps[h]=Ma(h)||h),g=n.cssHooks[b]||n.cssHooks[h],void 0===c?g&&"get"in g&&void 0!==(e=g.get(a,!1,d))?e:i[b]:(f=typeof c,"string"===f&&(e=T.exec(c))&&e[1]&&(c=W(a,b,e),f="number"),null!=c&&c===c&&("number"===f&&(c+=e&&e[3]||(n.cssNumber[h]?"":"px")),l.clearCloneStyle||""!==c||0!==b.indexOf("background")||(i[b]="inherit"),g&&"set"in g&&void 0===(c=g.set(a,c,d))||(i[b]=c)),void 0)}},css:function(a,b,c,d){var e,f,g,h=n.camelCase(b);return b=n.cssProps[h]||(n.cssProps[h]=Ma(h)||h),g=n.cssHooks[b]||n.cssHooks[h],g&&"get"in g&&(e=g.get(a,!0,c)),void 0===e&&(e=Fa(a,b,d)),"normal"===e&&b in Ja&&(e=Ja[b]),""===c||c?(f=parseFloat(e),c===!0||isFinite(f)?f||0:e):e}}),n.each(["height","width"],function(a,b){n.cssHooks[b]={get:function(a,c,d){return c?Ha.test(n.css(a,"display"))&&0===a.offsetWidth?Da(a,Ia,function(){return Pa(a,b,d)}):Pa(a,b,d):void 0},set:function(a,c,d){var e,f=d&&Ca(a),g=d&&Oa(a,b,d,"border-box"===n.css(a,"boxSizing",!1,f),f);return g&&(e=T.exec(c))&&"px"!==(e[3]||"px")&&(a.style[b]=c,c=n.css(a,b)),Na(a,c,g)}}}),n.cssHooks.marginLeft=Ga(l.reliableMarginLeft,function(a,b){return b?(parseFloat(Fa(a,"marginLeft"))||a.getBoundingClientRect().left-Da(a,{marginLeft:0},function(){return a.getBoundingClientRect().left}))+"px":void 0}),n.cssHooks.marginRight=Ga(l.reliableMarginRight,function(a,b){return b?Da(a,{display:"inline-block"},Fa,[a,"marginRight"]):void 0}),n.each({margin:"",padding:"",border:"Width"},function(a,b){n.cssHooks[a+b]={expand:function(c){for(var d=0,e={},f="string"==typeof c?c.split(" "):[c];4>d;d++)e[a+U[d]+b]=f[d]||f[d-2]||f[0];return e}},Aa.test(a)||(n.cssHooks[a+b].set=Na)}),n.fn.extend({css:function(a,b){return K(this,function(a,b,c){var d,e,f={},g=0;if(n.isArray(b)){for(d=Ca(a),e=b.length;e>g;g++)f[b[g]]=n.css(a,b[g],!1,d);return f}return void 0!==c?n.style(a,b,c):n.css(a,b)},a,b,arguments.length>1)},show:function(){return Qa(this,!0)},hide:function(){return Qa(this)},toggle:function(a){return"boolean"==typeof a?a?this.show():this.hide():this.each(function(){V(this)?n(this).show():n(this).hide()})}});function Ra(a,b,c,d,e){return new Ra.prototype.init(a,b,c,d,e)}n.Tween=Ra,Ra.prototype={constructor:Ra,init:function(a,b,c,d,e,f){this.elem=a,this.prop=c,this.easing=e||n.easing._default,this.options=b,this.start=this.now=this.cur(),this.end=d,this.unit=f||(n.cssNumber[c]?"":"px")},cur:function(){var a=Ra.propHooks[this.prop];return a&&a.get?a.get(this):Ra.propHooks._default.get(this)},run:function(a){var b,c=Ra.propHooks[this.prop];return this.options.duration?this.pos=b=n.easing[this.easing](a,this.options.duration*a,0,1,this.options.duration):this.pos=b=a,this.now=(this.end-this.start)*b+this.start,this.options.step&&this.options.step.call(this.elem,this.now,this),c&&c.set?c.set(this):Ra.propHooks._default.set(this),this}},Ra.prototype.init.prototype=Ra.prototype,Ra.propHooks={_default:{get:function(a){var b;return 1!==a.elem.nodeType||null!=a.elem[a.prop]&&null==a.elem.style[a.prop]?a.elem[a.prop]:(b=n.css(a.elem,a.prop,""),b&&"auto"!==b?b:0)},set:function(a){n.fx.step[a.prop]?n.fx.step[a.prop](a):1!==a.elem.nodeType||null==a.elem.style[n.cssProps[a.prop]]&&!n.cssHooks[a.prop]?a.elem[a.prop]=a.now:n.style(a.elem,a.prop,a.now+a.unit)}}},Ra.propHooks.scrollTop=Ra.propHooks.scrollLeft={set:function(a){a.elem.nodeType&&a.elem.parentNode&&(a.elem[a.prop]=a.now)}},n.easing={linear:function(a){return a},swing:function(a){return.5-Math.cos(a*Math.PI)/2},_default:"swing"},n.fx=Ra.prototype.init,n.fx.step={};var Sa,Ta,Ua=/^(?:toggle|show|hide)$/,Va=/queueHooks$/;function Wa(){return a.setTimeout(function(){Sa=void 0}),Sa=n.now()}function Xa(a,b){var c,d=0,e={height:a};for(b=b?1:0;4>d;d+=2-b)c=U[d],e["margin"+c]=e["padding"+c]=a;return b&&(e.opacity=e.width=a),e}function Ya(a,b,c){for(var d,e=(_a.tweeners[b]||[]).concat(_a.tweeners["*"]),f=0,g=e.length;g>f;f++)if(d=e[f].call(c,b,a))return d}function Za(a,b,c){var d,e,f,g,h,i,j,k,l=this,m={},o=a.style,p=a.nodeType&&V(a),q=N.get(a,"fxshow");c.queue||(h=n._queueHooks(a,"fx"),null==h.unqueued&&(h.unqueued=0,i=h.empty.fire,h.empty.fire=function(){h.unqueued||i()}),h.unqueued++,l.always(function(){l.always(function(){h.unqueued--,n.queue(a,"fx").length||h.empty.fire()})})),1===a.nodeType&&("height"in b||"width"in b)&&(c.overflow=[o.overflow,o.overflowX,o.overflowY],j=n.css(a,"display"),k="none"===j?N.get(a,"olddisplay")||za(a.nodeName):j,"inline"===k&&"none"===n.css(a,"float")&&(o.display="inline-block")),c.overflow&&(o.overflow="hidden",l.always(function(){o.overflow=c.overflow[0],o.overflowX=c.overflow[1],o.overflowY=c.overflow[2]}));for(d in b)if(e=b[d],Ua.exec(e)){if(delete b[d],f=f||"toggle"===e,e===(p?"hide":"show")){if("show"!==e||!q||void 0===q[d])continue;p=!0}m[d]=q&&q[d]||n.style(a,d)}else j=void 0;if(n.isEmptyObject(m))"inline"===("none"===j?za(a.nodeName):j)&&(o.display=j);else{q?"hidden"in q&&(p=q.hidden):q=N.access(a,"fxshow",{}),f&&(q.hidden=!p),p?n(a).show():l.done(function(){n(a).hide()}),l.done(function(){var b;N.remove(a,"fxshow");for(b in m)n.style(a,b,m[b])});for(d in m)g=Ya(p?q[d]:0,d,l),d in q||(q[d]=g.start,p&&(g.end=g.start,g.start="width"===d||"height"===d?1:0))}}function $a(a,b){var c,d,e,f,g;for(c in a)if(d=n.camelCase(c),e=b[d],f=a[c],n.isArray(f)&&(e=f[1],f=a[c]=f[0]),c!==d&&(a[d]=f,delete a[c]),g=n.cssHooks[d],g&&"expand"in g){f=g.expand(f),delete a[d];for(c in f)c in a||(a[c]=f[c],b[c]=e)}else b[d]=e}function _a(a,b,c){var d,e,f=0,g=_a.prefilters.length,h=n.Deferred().always(function(){delete i.elem}),i=function(){if(e)return!1;for(var b=Sa||Wa(),c=Math.max(0,j.startTime+j.duration-b),d=c/j.duration||0,f=1-d,g=0,i=j.tweens.length;i>g;g++)j.tweens[g].run(f);return h.notifyWith(a,[j,f,c]),1>f&&i?c:(h.resolveWith(a,[j]),!1)},j=h.promise({elem:a,props:n.extend({},b),opts:n.extend(!0,{specialEasing:{},easing:n.easing._default},c),originalProperties:b,originalOptions:c,startTime:Sa||Wa(),duration:c.duration,tweens:[],createTween:function(b,c){var d=n.Tween(a,j.opts,b,c,j.opts.specialEasing[b]||j.opts.easing);return j.tweens.push(d),d},stop:function(b){var c=0,d=b?j.tweens.length:0;if(e)return this;for(e=!0;d>c;c++)j.tweens[c].run(1);return b?(h.notifyWith(a,[j,1,0]),h.resolveWith(a,[j,b])):h.rejectWith(a,[j,b]),this}}),k=j.props;for($a(k,j.opts.specialEasing);g>f;f++)if(d=_a.prefilters[f].call(j,a,k,j.opts))return n.isFunction(d.stop)&&(n._queueHooks(j.elem,j.opts.queue).stop=n.proxy(d.stop,d)),d;return n.map(k,Ya,j),n.isFunction(j.opts.start)&&j.opts.start.call(a,j),n.fx.timer(n.extend(i,{elem:a,anim:j,queue:j.opts.queue})),j.progress(j.opts.progress).done(j.opts.done,j.opts.complete).fail(j.opts.fail).always(j.opts.always)}n.Animation=n.extend(_a,{tweeners:{"*":[function(a,b){var c=this.createTween(a,b);return W(c.elem,a,T.exec(b),c),c}]},tweener:function(a,b){n.isFunction(a)?(b=a,a=["*"]):a=a.match(G);for(var c,d=0,e=a.length;e>d;d++)c=a[d],_a.tweeners[c]=_a.tweeners[c]||[],_a.tweeners[c].unshift(b)},prefilters:[Za],prefilter:function(a,b){b?_a.prefilters.unshift(a):_a.prefilters.push(a)}}),n.speed=function(a,b,c){var d=a&&"object"==typeof a?n.extend({},a):{complete:c||!c&&b||n.isFunction(a)&&a,duration:a,easing:c&&b||b&&!n.isFunction(b)&&b};return d.duration=n.fx.off?0:"number"==typeof d.duration?d.duration:d.duration in n.fx.speeds?n.fx.speeds[d.duration]:n.fx.speeds._default,null!=d.queue&&d.queue!==!0||(d.queue="fx"),d.old=d.complete,d.complete=function(){n.isFunction(d.old)&&d.old.call(this),d.queue&&n.dequeue(this,d.queue)},d},n.fn.extend({fadeTo:function(a,b,c,d){return this.filter(V).css("opacity",0).show().end().animate({opacity:b},a,c,d)},animate:function(a,b,c,d){var e=n.isEmptyObject(a),f=n.speed(b,c,d),g=function(){var b=_a(this,n.extend({},a),f);(e||N.get(this,"finish"))&&b.stop(!0)};return g.finish=g,e||f.queue===!1?this.each(g):this.queue(f.queue,g)},stop:function(a,b,c){var d=function(a){var b=a.stop;delete a.stop,b(c)};return"string"!=typeof a&&(c=b,b=a,a=void 0),b&&a!==!1&&this.queue(a||"fx",[]),this.each(function(){var b=!0,e=null!=a&&a+"queueHooks",f=n.timers,g=N.get(this);if(e)g[e]&&g[e].stop&&d(g[e]);else for(e in g)g[e]&&g[e].stop&&Va.test(e)&&d(g[e]);for(e=f.length;e--;)f[e].elem!==this||null!=a&&f[e].queue!==a||(f[e].anim.stop(c),b=!1,f.splice(e,1));!b&&c||n.dequeue(this,a)})},finish:function(a){return a!==!1&&(a=a||"fx"),this.each(function(){var b,c=N.get(this),d=c[a+"queue"],e=c[a+"queueHooks"],f=n.timers,g=d?d.length:0;for(c.finish=!0,n.queue(this,a,[]),e&&e.stop&&e.stop.call(this,!0),b=f.length;b--;)f[b].elem===this&&f[b].queue===a&&(f[b].anim.stop(!0),f.splice(b,1));for(b=0;g>b;b++)d[b]&&d[b].finish&&d[b].finish.call(this);delete c.finish})}}),n.each(["toggle","show","hide"],function(a,b){var c=n.fn[b];n.fn[b]=function(a,d,e){return null==a||"boolean"==typeof a?c.apply(this,arguments):this.animate(Xa(b,!0),a,d,e)}}),n.each({slideDown:Xa("show"),slideUp:Xa("hide"),slideToggle:Xa("toggle"),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"},fadeToggle:{opacity:"toggle"}},function(a,b){n.fn[a]=function(a,c,d){return this.animate(b,a,c,d)}}),n.timers=[],n.fx.tick=function(){var a,b=0,c=n.timers;for(Sa=n.now();b<c.length;b++)a=c[b],a()||c[b]!==a||c.splice(b--,1);c.length||n.fx.stop(),Sa=void 0},n.fx.timer=function(a){n.timers.push(a),a()?n.fx.start():n.timers.pop()},n.fx.interval=13,n.fx.start=function(){Ta||(Ta=a.setInterval(n.fx.tick,n.fx.interval))},n.fx.stop=function(){a.clearInterval(Ta),Ta=null},n.fx.speeds={slow:600,fast:200,_default:400},n.fn.delay=function(b,c){return b=n.fx?n.fx.speeds[b]||b:b,c=c||"fx",this.queue(c,function(c,d){var e=a.setTimeout(c,b);d.stop=function(){a.clearTimeout(e)}})},function(){var a=d.createElement("input"),b=d.createElement("select"),c=b.appendChild(d.createElement("option"));a.type="checkbox",l.checkOn=""!==a.value,l.optSelected=c.selected,b.disabled=!0,l.optDisabled=!c.disabled,a=d.createElement("input"),a.value="t",a.type="radio",l.radioValue="t"===a.value}();var ab,bb=n.expr.attrHandle;n.fn.extend({attr:function(a,b){return K(this,n.attr,a,b,arguments.length>1)},removeAttr:function(a){return this.each(function(){n.removeAttr(this,a)})}}),n.extend({attr:function(a,b,c){var d,e,f=a.nodeType;if(3!==f&&8!==f&&2!==f)return"undefined"==typeof a.getAttribute?n.prop(a,b,c):(1===f&&n.isXMLDoc(a)||(b=b.toLowerCase(),e=n.attrHooks[b]||(n.expr.match.bool.test(b)?ab:void 0)),void 0!==c?null===c?void n.removeAttr(a,b):e&&"set"in e&&void 0!==(d=e.set(a,c,b))?d:(a.setAttribute(b,c+""),c):e&&"get"in e&&null!==(d=e.get(a,b))?d:(d=n.find.attr(a,b),null==d?void 0:d))},attrHooks:{type:{set:function(a,b){if(!l.radioValue&&"radio"===b&&n.nodeName(a,"input")){var c=a.value;return a.setAttribute("type",b),c&&(a.value=c),b}}}},removeAttr:function(a,b){var c,d,e=0,f=b&&b.match(G);if(f&&1===a.nodeType)while(c=f[e++])d=n.propFix[c]||c,n.expr.match.bool.test(c)&&(a[d]=!1),a.removeAttribute(c)}}),ab={set:function(a,b,c){return b===!1?n.removeAttr(a,c):a.setAttribute(c,c),c}},n.each(n.expr.match.bool.source.match(/\w+/g),function(a,b){var c=bb[b]||n.find.attr;bb[b]=function(a,b,d){var e,f;return d||(f=bb[b],bb[b]=e,e=null!=c(a,b,d)?b.toLowerCase():null,bb[b]=f),e}});var cb=/^(?:input|select|textarea|button)$/i,db=/^(?:a|area)$/i;n.fn.extend({prop:function(a,b){return K(this,n.prop,a,b,arguments.length>1)},removeProp:function(a){return this.each(function(){delete this[n.propFix[a]||a]})}}),n.extend({prop:function(a,b,c){var d,e,f=a.nodeType;if(3!==f&&8!==f&&2!==f)return 1===f&&n.isXMLDoc(a)||(b=n.propFix[b]||b,
e=n.propHooks[b]),void 0!==c?e&&"set"in e&&void 0!==(d=e.set(a,c,b))?d:a[b]=c:e&&"get"in e&&null!==(d=e.get(a,b))?d:a[b]},propHooks:{tabIndex:{get:function(a){var b=n.find.attr(a,"tabindex");return b?parseInt(b,10):cb.test(a.nodeName)||db.test(a.nodeName)&&a.href?0:-1}}},propFix:{"for":"htmlFor","class":"className"}}),l.optSelected||(n.propHooks.selected={get:function(a){var b=a.parentNode;return b&&b.parentNode&&b.parentNode.selectedIndex,null},set:function(a){var b=a.parentNode;b&&(b.selectedIndex,b.parentNode&&b.parentNode.selectedIndex)}}),n.each(["tabIndex","readOnly","maxLength","cellSpacing","cellPadding","rowSpan","colSpan","useMap","frameBorder","contentEditable"],function(){n.propFix[this.toLowerCase()]=this});var eb=/[\t\r\n\f]/g;function fb(a){return a.getAttribute&&a.getAttribute("class")||""}n.fn.extend({addClass:function(a){var b,c,d,e,f,g,h,i=0;if(n.isFunction(a))return this.each(function(b){n(this).addClass(a.call(this,b,fb(this)))});if("string"==typeof a&&a){b=a.match(G)||[];while(c=this[i++])if(e=fb(c),d=1===c.nodeType&&(" "+e+" ").replace(eb," ")){g=0;while(f=b[g++])d.indexOf(" "+f+" ")<0&&(d+=f+" ");h=n.trim(d),e!==h&&c.setAttribute("class",h)}}return this},removeClass:function(a){var b,c,d,e,f,g,h,i=0;if(n.isFunction(a))return this.each(function(b){n(this).removeClass(a.call(this,b,fb(this)))});if(!arguments.length)return this.attr("class","");if("string"==typeof a&&a){b=a.match(G)||[];while(c=this[i++])if(e=fb(c),d=1===c.nodeType&&(" "+e+" ").replace(eb," ")){g=0;while(f=b[g++])while(d.indexOf(" "+f+" ")>-1)d=d.replace(" "+f+" "," ");h=n.trim(d),e!==h&&c.setAttribute("class",h)}}return this},toggleClass:function(a,b){var c=typeof a;return"boolean"==typeof b&&"string"===c?b?this.addClass(a):this.removeClass(a):n.isFunction(a)?this.each(function(c){n(this).toggleClass(a.call(this,c,fb(this),b),b)}):this.each(function(){var b,d,e,f;if("string"===c){d=0,e=n(this),f=a.match(G)||[];while(b=f[d++])e.hasClass(b)?e.removeClass(b):e.addClass(b)}else void 0!==a&&"boolean"!==c||(b=fb(this),b&&N.set(this,"__className__",b),this.setAttribute&&this.setAttribute("class",b||a===!1?"":N.get(this,"__className__")||""))})},hasClass:function(a){var b,c,d=0;b=" "+a+" ";while(c=this[d++])if(1===c.nodeType&&(" "+fb(c)+" ").replace(eb," ").indexOf(b)>-1)return!0;return!1}});var gb=/\r/g,hb=/[\x20\t\r\n\f]+/g;n.fn.extend({val:function(a){var b,c,d,e=this[0];{if(arguments.length)return d=n.isFunction(a),this.each(function(c){var e;1===this.nodeType&&(e=d?a.call(this,c,n(this).val()):a,null==e?e="":"number"==typeof e?e+="":n.isArray(e)&&(e=n.map(e,function(a){return null==a?"":a+""})),b=n.valHooks[this.type]||n.valHooks[this.nodeName.toLowerCase()],b&&"set"in b&&void 0!==b.set(this,e,"value")||(this.value=e))});if(e)return b=n.valHooks[e.type]||n.valHooks[e.nodeName.toLowerCase()],b&&"get"in b&&void 0!==(c=b.get(e,"value"))?c:(c=e.value,"string"==typeof c?c.replace(gb,""):null==c?"":c)}}}),n.extend({valHooks:{option:{get:function(a){var b=n.find.attr(a,"value");return null!=b?b:n.trim(n.text(a)).replace(hb," ")}},select:{get:function(a){for(var b,c,d=a.options,e=a.selectedIndex,f="select-one"===a.type||0>e,g=f?null:[],h=f?e+1:d.length,i=0>e?h:f?e:0;h>i;i++)if(c=d[i],(c.selected||i===e)&&(l.optDisabled?!c.disabled:null===c.getAttribute("disabled"))&&(!c.parentNode.disabled||!n.nodeName(c.parentNode,"optgroup"))){if(b=n(c).val(),f)return b;g.push(b)}return g},set:function(a,b){var c,d,e=a.options,f=n.makeArray(b),g=e.length;while(g--)d=e[g],(d.selected=n.inArray(n.valHooks.option.get(d),f)>-1)&&(c=!0);return c||(a.selectedIndex=-1),f}}}}),n.each(["radio","checkbox"],function(){n.valHooks[this]={set:function(a,b){return n.isArray(b)?a.checked=n.inArray(n(a).val(),b)>-1:void 0}},l.checkOn||(n.valHooks[this].get=function(a){return null===a.getAttribute("value")?"on":a.value})});var ib=/^(?:focusinfocus|focusoutblur)$/;n.extend(n.event,{trigger:function(b,c,e,f){var g,h,i,j,l,m,o,p=[e||d],q=k.call(b,"type")?b.type:b,r=k.call(b,"namespace")?b.namespace.split("."):[];if(h=i=e=e||d,3!==e.nodeType&&8!==e.nodeType&&!ib.test(q+n.event.triggered)&&(q.indexOf(".")>-1&&(r=q.split("."),q=r.shift(),r.sort()),l=q.indexOf(":")<0&&"on"+q,b=b[n.expando]?b:new n.Event(q,"object"==typeof b&&b),b.isTrigger=f?2:3,b.namespace=r.join("."),b.rnamespace=b.namespace?new RegExp("(^|\\.)"+r.join("\\.(?:.*\\.|)")+"(\\.|$)"):null,b.result=void 0,b.target||(b.target=e),c=null==c?[b]:n.makeArray(c,[b]),o=n.event.special[q]||{},f||!o.trigger||o.trigger.apply(e,c)!==!1)){if(!f&&!o.noBubble&&!n.isWindow(e)){for(j=o.delegateType||q,ib.test(j+q)||(h=h.parentNode);h;h=h.parentNode)p.push(h),i=h;i===(e.ownerDocument||d)&&p.push(i.defaultView||i.parentWindow||a)}g=0;while((h=p[g++])&&!b.isPropagationStopped())b.type=g>1?j:o.bindType||q,m=(N.get(h,"events")||{})[b.type]&&N.get(h,"handle"),m&&m.apply(h,c),m=l&&h[l],m&&m.apply&&L(h)&&(b.result=m.apply(h,c),b.result===!1&&b.preventDefault());return b.type=q,f||b.isDefaultPrevented()||o._default&&o._default.apply(p.pop(),c)!==!1||!L(e)||l&&n.isFunction(e[q])&&!n.isWindow(e)&&(i=e[l],i&&(e[l]=null),n.event.triggered=q,e[q](),n.event.triggered=void 0,i&&(e[l]=i)),b.result}},simulate:function(a,b,c){var d=n.extend(new n.Event,c,{type:a,isSimulated:!0});n.event.trigger(d,null,b),d.isDefaultPrevented()&&c.preventDefault()}}),n.fn.extend({trigger:function(a,b){return this.each(function(){n.event.trigger(a,b,this)})},triggerHandler:function(a,b){var c=this[0];return c?n.event.trigger(a,b,c,!0):void 0}}),n.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "),function(a,b){n.fn[b]=function(a,c){return arguments.length>0?this.on(b,null,a,c):this.trigger(b)}}),n.fn.extend({hover:function(a,b){return this.mouseenter(a).mouseleave(b||a)}}),l.focusin="onfocusin"in a,l.focusin||n.each({focus:"focusin",blur:"focusout"},function(a,b){var c=function(a){n.event.simulate(b,a.target,n.event.fix(a))};n.event.special[b]={setup:function(){var d=this.ownerDocument||this,e=N.access(d,b);e||d.addEventListener(a,c,!0),N.access(d,b,(e||0)+1)},teardown:function(){var d=this.ownerDocument||this,e=N.access(d,b)-1;e?N.access(d,b,e):(d.removeEventListener(a,c,!0),N.remove(d,b))}}});var jb=a.location,kb=n.now(),lb=/\?/;n.parseJSON=function(a){return JSON.parse(a+"")},n.parseXML=function(b){var c;if(!b||"string"!=typeof b)return null;try{c=(new a.DOMParser).parseFromString(b,"text/xml")}catch(d){c=void 0}return c&&!c.getElementsByTagName("parsererror").length||n.error("Invalid XML: "+b),c};var mb=/#.*$/,nb=/([?&])_=[^&]*/,ob=/^(.*?):[ \t]*([^\r\n]*)$/gm,pb=/^(?:about|app|app-storage|.+-extension|file|res|widget):$/,qb=/^(?:GET|HEAD)$/,rb=/^\/\//,sb={},tb={},ub="*/".concat("*"),vb=d.createElement("a");vb.href=jb.href;function wb(a){return function(b,c){"string"!=typeof b&&(c=b,b="*");var d,e=0,f=b.toLowerCase().match(G)||[];if(n.isFunction(c))while(d=f[e++])"+"===d[0]?(d=d.slice(1)||"*",(a[d]=a[d]||[]).unshift(c)):(a[d]=a[d]||[]).push(c)}}function xb(a,b,c,d){var e={},f=a===tb;function g(h){var i;return e[h]=!0,n.each(a[h]||[],function(a,h){var j=h(b,c,d);return"string"!=typeof j||f||e[j]?f?!(i=j):void 0:(b.dataTypes.unshift(j),g(j),!1)}),i}return g(b.dataTypes[0])||!e["*"]&&g("*")}function yb(a,b){var c,d,e=n.ajaxSettings.flatOptions||{};for(c in b)void 0!==b[c]&&((e[c]?a:d||(d={}))[c]=b[c]);return d&&n.extend(!0,a,d),a}function zb(a,b,c){var d,e,f,g,h=a.contents,i=a.dataTypes;while("*"===i[0])i.shift(),void 0===d&&(d=a.mimeType||b.getResponseHeader("Content-Type"));if(d)for(e in h)if(h[e]&&h[e].test(d)){i.unshift(e);break}if(i[0]in c)f=i[0];else{for(e in c){if(!i[0]||a.converters[e+" "+i[0]]){f=e;break}g||(g=e)}f=f||g}return f?(f!==i[0]&&i.unshift(f),c[f]):void 0}function Ab(a,b,c,d){var e,f,g,h,i,j={},k=a.dataTypes.slice();if(k[1])for(g in a.converters)j[g.toLowerCase()]=a.converters[g];f=k.shift();while(f)if(a.responseFields[f]&&(c[a.responseFields[f]]=b),!i&&d&&a.dataFilter&&(b=a.dataFilter(b,a.dataType)),i=f,f=k.shift())if("*"===f)f=i;else if("*"!==i&&i!==f){if(g=j[i+" "+f]||j["* "+f],!g)for(e in j)if(h=e.split(" "),h[1]===f&&(g=j[i+" "+h[0]]||j["* "+h[0]])){g===!0?g=j[e]:j[e]!==!0&&(f=h[0],k.unshift(h[1]));break}if(g!==!0)if(g&&a["throws"])b=g(b);else try{b=g(b)}catch(l){return{state:"parsererror",error:g?l:"No conversion from "+i+" to "+f}}}return{state:"success",data:b}}n.extend({active:0,lastModified:{},etag:{},ajaxSettings:{url:jb.href,type:"GET",isLocal:pb.test(jb.protocol),global:!0,processData:!0,async:!0,contentType:"application/x-www-form-urlencoded; charset=UTF-8",accepts:{"*":ub,text:"text/plain",html:"text/html",xml:"application/xml, text/xml",json:"application/json, text/javascript"},contents:{xml:/\bxml\b/,html:/\bhtml/,json:/\bjson\b/},responseFields:{xml:"responseXML",text:"responseText",json:"responseJSON"},converters:{"* text":String,"text html":!0,"text json":n.parseJSON,"text xml":n.parseXML},flatOptions:{url:!0,context:!0}},ajaxSetup:function(a,b){return b?yb(yb(a,n.ajaxSettings),b):yb(n.ajaxSettings,a)},ajaxPrefilter:wb(sb),ajaxTransport:wb(tb),ajax:function(b,c){"object"==typeof b&&(c=b,b=void 0),c=c||{};var e,f,g,h,i,j,k,l,m=n.ajaxSetup({},c),o=m.context||m,p=m.context&&(o.nodeType||o.jquery)?n(o):n.event,q=n.Deferred(),r=n.Callbacks("once memory"),s=m.statusCode||{},t={},u={},v=0,w="canceled",x={readyState:0,getResponseHeader:function(a){var b;if(2===v){if(!h){h={};while(b=ob.exec(g))h[b[1].toLowerCase()]=b[2]}b=h[a.toLowerCase()]}return null==b?null:b},getAllResponseHeaders:function(){return 2===v?g:null},setRequestHeader:function(a,b){var c=a.toLowerCase();return v||(a=u[c]=u[c]||a,t[a]=b),this},overrideMimeType:function(a){return v||(m.mimeType=a),this},statusCode:function(a){var b;if(a)if(2>v)for(b in a)s[b]=[s[b],a[b]];else x.always(a[x.status]);return this},abort:function(a){var b=a||w;return e&&e.abort(b),z(0,b),this}};if(q.promise(x).complete=r.add,x.success=x.done,x.error=x.fail,m.url=((b||m.url||jb.href)+"").replace(mb,"").replace(rb,jb.protocol+"//"),m.type=c.method||c.type||m.method||m.type,m.dataTypes=n.trim(m.dataType||"*").toLowerCase().match(G)||[""],null==m.crossDomain){j=d.createElement("a");try{j.href=m.url,j.href=j.href,m.crossDomain=vb.protocol+"//"+vb.host!=j.protocol+"//"+j.host}catch(y){m.crossDomain=!0}}if(m.data&&m.processData&&"string"!=typeof m.data&&(m.data=n.param(m.data,m.traditional)),xb(sb,m,c,x),2===v)return x;k=n.event&&m.global,k&&0===n.active++&&n.event.trigger("ajaxStart"),m.type=m.type.toUpperCase(),m.hasContent=!qb.test(m.type),f=m.url,m.hasContent||(m.data&&(f=m.url+=(lb.test(f)?"&":"?")+m.data,delete m.data),m.cache===!1&&(m.url=nb.test(f)?f.replace(nb,"$1_="+kb++):f+(lb.test(f)?"&":"?")+"_="+kb++)),m.ifModified&&(n.lastModified[f]&&x.setRequestHeader("If-Modified-Since",n.lastModified[f]),n.etag[f]&&x.setRequestHeader("If-None-Match",n.etag[f])),(m.data&&m.hasContent&&m.contentType!==!1||c.contentType)&&x.setRequestHeader("Content-Type",m.contentType),x.setRequestHeader("Accept",m.dataTypes[0]&&m.accepts[m.dataTypes[0]]?m.accepts[m.dataTypes[0]]+("*"!==m.dataTypes[0]?", "+ub+"; q=0.01":""):m.accepts["*"]);for(l in m.headers)x.setRequestHeader(l,m.headers[l]);if(m.beforeSend&&(m.beforeSend.call(o,x,m)===!1||2===v))return x.abort();w="abort";for(l in{success:1,error:1,complete:1})x[l](m[l]);if(e=xb(tb,m,c,x)){if(x.readyState=1,k&&p.trigger("ajaxSend",[x,m]),2===v)return x;m.async&&m.timeout>0&&(i=a.setTimeout(function(){x.abort("timeout")},m.timeout));try{v=1,e.send(t,z)}catch(y){if(!(2>v))throw y;z(-1,y)}}else z(-1,"No Transport");function z(b,c,d,h){var j,l,t,u,w,y=c;2!==v&&(v=2,i&&a.clearTimeout(i),e=void 0,g=h||"",x.readyState=b>0?4:0,j=b>=200&&300>b||304===b,d&&(u=zb(m,x,d)),u=Ab(m,u,x,j),j?(m.ifModified&&(w=x.getResponseHeader("Last-Modified"),w&&(n.lastModified[f]=w),w=x.getResponseHeader("etag"),w&&(n.etag[f]=w)),204===b||"HEAD"===m.type?y="nocontent":304===b?y="notmodified":(y=u.state,l=u.data,t=u.error,j=!t)):(t=y,!b&&y||(y="error",0>b&&(b=0))),x.status=b,x.statusText=(c||y)+"",j?q.resolveWith(o,[l,y,x]):q.rejectWith(o,[x,y,t]),x.statusCode(s),s=void 0,k&&p.trigger(j?"ajaxSuccess":"ajaxError",[x,m,j?l:t]),r.fireWith(o,[x,y]),k&&(p.trigger("ajaxComplete",[x,m]),--n.active||n.event.trigger("ajaxStop")))}return x},getJSON:function(a,b,c){return n.get(a,b,c,"json")},getScript:function(a,b){return n.get(a,void 0,b,"script")}}),n.each(["get","post"],function(a,b){n[b]=function(a,c,d,e){return n.isFunction(c)&&(e=e||d,d=c,c=void 0),n.ajax(n.extend({url:a,type:b,dataType:e,data:c,success:d},n.isPlainObject(a)&&a))}}),n._evalUrl=function(a){return n.ajax({url:a,type:"GET",dataType:"script",async:!1,global:!1,"throws":!0})},n.fn.extend({wrapAll:function(a){var b;return n.isFunction(a)?this.each(function(b){n(this).wrapAll(a.call(this,b))}):(this[0]&&(b=n(a,this[0].ownerDocument).eq(0).clone(!0),this[0].parentNode&&b.insertBefore(this[0]),b.map(function(){var a=this;while(a.firstElementChild)a=a.firstElementChild;return a}).append(this)),this)},wrapInner:function(a){return n.isFunction(a)?this.each(function(b){n(this).wrapInner(a.call(this,b))}):this.each(function(){var b=n(this),c=b.contents();c.length?c.wrapAll(a):b.append(a)})},wrap:function(a){var b=n.isFunction(a);return this.each(function(c){n(this).wrapAll(b?a.call(this,c):a)})},unwrap:function(){return this.parent().each(function(){n.nodeName(this,"body")||n(this).replaceWith(this.childNodes)}).end()}}),n.expr.filters.hidden=function(a){return!n.expr.filters.visible(a)},n.expr.filters.visible=function(a){return a.offsetWidth>0||a.offsetHeight>0||a.getClientRects().length>0};var Bb=/%20/g,Cb=/\[\]$/,Db=/\r?\n/g,Eb=/^(?:submit|button|image|reset|file)$/i,Fb=/^(?:input|select|textarea|keygen)/i;function Gb(a,b,c,d){var e;if(n.isArray(b))n.each(b,function(b,e){c||Cb.test(a)?d(a,e):Gb(a+"["+("object"==typeof e&&null!=e?b:"")+"]",e,c,d)});else if(c||"object"!==n.type(b))d(a,b);else for(e in b)Gb(a+"["+e+"]",b[e],c,d)}n.param=function(a,b){var c,d=[],e=function(a,b){b=n.isFunction(b)?b():null==b?"":b,d[d.length]=encodeURIComponent(a)+"="+encodeURIComponent(b)};if(void 0===b&&(b=n.ajaxSettings&&n.ajaxSettings.traditional),n.isArray(a)||a.jquery&&!n.isPlainObject(a))n.each(a,function(){e(this.name,this.value)});else for(c in a)Gb(c,a[c],b,e);return d.join("&").replace(Bb,"+")},n.fn.extend({serialize:function(){return n.param(this.serializeArray())},serializeArray:function(){return this.map(function(){var a=n.prop(this,"elements");return a?n.makeArray(a):this}).filter(function(){var a=this.type;return this.name&&!n(this).is(":disabled")&&Fb.test(this.nodeName)&&!Eb.test(a)&&(this.checked||!X.test(a))}).map(function(a,b){var c=n(this).val();return null==c?null:n.isArray(c)?n.map(c,function(a){return{name:b.name,value:a.replace(Db,"\r\n")}}):{name:b.name,value:c.replace(Db,"\r\n")}}).get()}}),n.ajaxSettings.xhr=function(){try{return new a.XMLHttpRequest}catch(b){}};var Hb={0:200,1223:204},Ib=n.ajaxSettings.xhr();l.cors=!!Ib&&"withCredentials"in Ib,l.ajax=Ib=!!Ib,n.ajaxTransport(function(b){var c,d;return l.cors||Ib&&!b.crossDomain?{send:function(e,f){var g,h=b.xhr();if(h.open(b.type,b.url,b.async,b.username,b.password),b.xhrFields)for(g in b.xhrFields)h[g]=b.xhrFields[g];b.mimeType&&h.overrideMimeType&&h.overrideMimeType(b.mimeType),b.crossDomain||e["X-Requested-With"]||(e["X-Requested-With"]="XMLHttpRequest");for(g in e)h.setRequestHeader(g,e[g]);c=function(a){return function(){c&&(c=d=h.onload=h.onerror=h.onabort=h.onreadystatechange=null,"abort"===a?h.abort():"error"===a?"number"!=typeof h.status?f(0,"error"):f(h.status,h.statusText):f(Hb[h.status]||h.status,h.statusText,"text"!==(h.responseType||"text")||"string"!=typeof h.responseText?{binary:h.response}:{text:h.responseText},h.getAllResponseHeaders()))}},h.onload=c(),d=h.onerror=c("error"),void 0!==h.onabort?h.onabort=d:h.onreadystatechange=function(){4===h.readyState&&a.setTimeout(function(){c&&d()})},c=c("abort");try{h.send(b.hasContent&&b.data||null)}catch(i){if(c)throw i}},abort:function(){c&&c()}}:void 0}),n.ajaxSetup({accepts:{script:"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"},contents:{script:/\b(?:java|ecma)script\b/},converters:{"text script":function(a){return n.globalEval(a),a}}}),n.ajaxPrefilter("script",function(a){void 0===a.cache&&(a.cache=!1),a.crossDomain&&(a.type="GET")}),n.ajaxTransport("script",function(a){if(a.crossDomain){var b,c;return{send:function(e,f){b=n("<script>").prop({charset:a.scriptCharset,src:a.url}).on("load error",c=function(a){b.remove(),c=null,a&&f("error"===a.type?404:200,a.type)}),d.head.appendChild(b[0])},abort:function(){c&&c()}}}});var Jb=[],Kb=/(=)\?(?=&|$)|\?\?/;n.ajaxSetup({jsonp:"callback",jsonpCallback:function(){var a=Jb.pop()||n.expando+"_"+kb++;return this[a]=!0,a}}),n.ajaxPrefilter("json jsonp",function(b,c,d){var e,f,g,h=b.jsonp!==!1&&(Kb.test(b.url)?"url":"string"==typeof b.data&&0===(b.contentType||"").indexOf("application/x-www-form-urlencoded")&&Kb.test(b.data)&&"data");return h||"jsonp"===b.dataTypes[0]?(e=b.jsonpCallback=n.isFunction(b.jsonpCallback)?b.jsonpCallback():b.jsonpCallback,h?b[h]=b[h].replace(Kb,"$1"+e):b.jsonp!==!1&&(b.url+=(lb.test(b.url)?"&":"?")+b.jsonp+"="+e),b.converters["script json"]=function(){return g||n.error(e+" was not called"),g[0]},b.dataTypes[0]="json",f=a[e],a[e]=function(){g=arguments},d.always(function(){void 0===f?n(a).removeProp(e):a[e]=f,b[e]&&(b.jsonpCallback=c.jsonpCallback,Jb.push(e)),g&&n.isFunction(f)&&f(g[0]),g=f=void 0}),"script"):void 0}),n.parseHTML=function(a,b,c){if(!a||"string"!=typeof a)return null;"boolean"==typeof b&&(c=b,b=!1),b=b||d;var e=x.exec(a),f=!c&&[];return e?[b.createElement(e[1])]:(e=ca([a],b,f),f&&f.length&&n(f).remove(),n.merge([],e.childNodes))};var Lb=n.fn.load;n.fn.load=function(a,b,c){if("string"!=typeof a&&Lb)return Lb.apply(this,arguments);var d,e,f,g=this,h=a.indexOf(" ");return h>-1&&(d=n.trim(a.slice(h)),a=a.slice(0,h)),n.isFunction(b)?(c=b,b=void 0):b&&"object"==typeof b&&(e="POST"),g.length>0&&n.ajax({url:a,type:e||"GET",dataType:"html",data:b}).done(function(a){f=arguments,g.html(d?n("<div>").append(n.parseHTML(a)).find(d):a)}).always(c&&function(a,b){g.each(function(){c.apply(g,f||[a.responseText,b,a])})}),this},n.each(["ajaxStart","ajaxStop","ajaxComplete","ajaxError","ajaxSuccess","ajaxSend"],function(a,b){n.fn[b]=function(a){return this.on(b,a)}}),n.expr.filters.animated=function(a){return n.grep(n.timers,function(b){return a===b.elem}).length};function Mb(a){return n.isWindow(a)?a:9===a.nodeType&&a.defaultView}n.offset={setOffset:function(a,b,c){var d,e,f,g,h,i,j,k=n.css(a,"position"),l=n(a),m={};"static"===k&&(a.style.position="relative"),h=l.offset(),f=n.css(a,"top"),i=n.css(a,"left"),j=("absolute"===k||"fixed"===k)&&(f+i).indexOf("auto")>-1,j?(d=l.position(),g=d.top,e=d.left):(g=parseFloat(f)||0,e=parseFloat(i)||0),n.isFunction(b)&&(b=b.call(a,c,n.extend({},h))),null!=b.top&&(m.top=b.top-h.top+g),null!=b.left&&(m.left=b.left-h.left+e),"using"in b?b.using.call(a,m):l.css(m)}},n.fn.extend({offset:function(a){if(arguments.length)return void 0===a?this:this.each(function(b){n.offset.setOffset(this,a,b)});var b,c,d=this[0],e={top:0,left:0},f=d&&d.ownerDocument;if(f)return b=f.documentElement,n.contains(b,d)?(e=d.getBoundingClientRect(),c=Mb(f),{top:e.top+c.pageYOffset-b.clientTop,left:e.left+c.pageXOffset-b.clientLeft}):e},position:function(){if(this[0]){var a,b,c=this[0],d={top:0,left:0};return"fixed"===n.css(c,"position")?b=c.getBoundingClientRect():(a=this.offsetParent(),b=this.offset(),n.nodeName(a[0],"html")||(d=a.offset()),d.top+=n.css(a[0],"borderTopWidth",!0),d.left+=n.css(a[0],"borderLeftWidth",!0)),{top:b.top-d.top-n.css(c,"marginTop",!0),left:b.left-d.left-n.css(c,"marginLeft",!0)}}},offsetParent:function(){return this.map(function(){var a=this.offsetParent;while(a&&"static"===n.css(a,"position"))a=a.offsetParent;return a||Ea})}}),n.each({scrollLeft:"pageXOffset",scrollTop:"pageYOffset"},function(a,b){var c="pageYOffset"===b;n.fn[a]=function(d){return K(this,function(a,d,e){var f=Mb(a);return void 0===e?f?f[b]:a[d]:void(f?f.scrollTo(c?f.pageXOffset:e,c?e:f.pageYOffset):a[d]=e)},a,d,arguments.length)}}),n.each(["top","left"],function(a,b){n.cssHooks[b]=Ga(l.pixelPosition,function(a,c){return c?(c=Fa(a,b),Ba.test(c)?n(a).position()[b]+"px":c):void 0})}),n.each({Height:"height",Width:"width"},function(a,b){n.each({padding:"inner"+a,content:b,"":"outer"+a},function(c,d){n.fn[d]=function(d,e){var f=arguments.length&&(c||"boolean"!=typeof d),g=c||(d===!0||e===!0?"margin":"border");return K(this,function(b,c,d){var e;return n.isWindow(b)?b.document.documentElement["client"+a]:9===b.nodeType?(e=b.documentElement,Math.max(b.body["scroll"+a],e["scroll"+a],b.body["offset"+a],e["offset"+a],e["client"+a])):void 0===d?n.css(b,c,g):n.style(b,c,d,g)},b,f?d:void 0,f,null)}})}),n.fn.extend({bind:function(a,b,c){return this.on(a,null,b,c)},unbind:function(a,b){return this.off(a,null,b)},delegate:function(a,b,c,d){return this.on(b,a,c,d)},undelegate:function(a,b,c){return 1===arguments.length?this.off(a,"**"):this.off(b,a||"**",c)},size:function(){return this.length}}),n.fn.andSelf=n.fn.addBack,"function"==typeof define&&define.amd&&define("jquery",[],function(){return n});var Nb=a.jQuery,Ob=a.$;return n.noConflict=function(b){return a.$===n&&(a.$=Ob),b&&a.jQuery===n&&(a.jQuery=Nb),n},b||(a.jQuery=a.$=n),n});

!function(s,n){"object"==typeof exports&&"undefined"!=typeof module?n(exports):"function"==typeof define&&define.amd?define(["exports"],n):n((s=s||self).timeago={})}(this,function(s){"use strict";var a=["second","minute","hour","day","week","month","year"];function n(s,n){if(0===n)return["just now","right now"];var e=a[Math.floor(n/2)];return 1<s&&(e+="s"),[s+" "+e+" ago","in "+s+" "+e]}var t=["秒","分钟","小时","天","周","个月","年"];function e(s,n){if(0===n)return["刚刚","片刻后"];var e=t[~~(n/2)];return[s+" "+e+"前",s+" "+e+"后"]}function u(s,n){i[s]=n}function r(s){return i[s]||i.en_US}var i={},m=[60,60,24,7,365/7/12,12];function o(s){return s instanceof Date?s:!isNaN(s)||/^\d+$/.test(s)?new Date(parseInt(s)):(s=(s||"").trim().replace(/\.\d+/,"").replace(/-/,"/").replace(/-/,"/").replace(/(\d)T(\d)/,"$1 $2").replace(/Z/," UTC").replace(/([+-]\d\d):?(\d\d)/," $1$2"),new Date(s))}function d(s,n){for(var e=s<0?1:0,a=s=Math.abs(s),t=0;s>=m[t]&&t<m.length;t++)s/=m[t];return(0===(t*=2)?9:1)<(s=Math.floor(s))&&(t+=1),n(s,t,a)[e].replace("%s",s.toString())}function c(s,n){return((n?o(n):new Date)-o(s))/1e3}var l="timeago-id";function h(s){return parseInt(s.getAttribute(l))}var g={},f=function(s){clearTimeout(s),delete g[s]};function p(s,n,e,a){f(h(s));var t=a.relativeDate,u=a.minInterval,r=c(n,t);s.innerText=d(r,e);var i,o=setTimeout(function(){p(s,n,e,a)},Math.min(1e3*Math.max(function(s){for(var n=1,e=0,a=Math.abs(s);s>=m[e]&&e<m.length;e++)s/=m[e],n*=m[e];return a=(a%=n)?n-a:n,Math.ceil(a)}(r),u||1),2147483647));g[o]=0,i=o,s.setAttribute(l,i)}u("en_US",n),u("zh_CN",e);var b=[["ثانية","ثانيتين","%s ثوان","%s ثانية"],["دقيقة","دقيقتين","%s دقائق","%s دقيقة"],["ساعة","ساعتين","%s ساعات","%s ساعة"],["يوم","يومين","%s أيام","%s يوماً"],["أسبوع","أسبوعين","%s أسابيع","%s أسبوعاً"],["شهر","شهرين","%s أشهر","%s شهراً"],["عام","عامين","%s أعوام","%s عاماً"]];function v(s,n,e,a,t){var u=t%10,r=a;return 1===t?r=s:1==u&&20<t?r=n:1<u&&u<5&&(20<t||t<10)&&(r=e),r}var y=v.bind(null,"секунду","%s секунду","%s секунды","%s секунд"),k=v.bind(null,"хвіліну","%s хвіліну","%s хвіліны","%s хвілін"),j=v.bind(null,"гадзіну","%s гадзіну","%s гадзіны","%s гадзін"),z=v.bind(null,"дзень","%s дзень","%s дні","%s дзён"),w=v.bind(null,"тыдзень","%s тыдзень","%s тыдні","%s тыдняў"),_=v.bind(null,"месяц","%s месяц","%s месяцы","%s месяцаў"),M=v.bind(null,"год","%s год","%s гады","%s гадоў");function q(s){var n=["۰","۱","۲","۳","۴","۵","۶","۷","۸","۹"];return s.toString().replace(/\d/g,function(s){return n[s]})}var S=[["w tej chwili","za chwilę"],["%s sekund temu","za %s sekund"],["1 minutę temu","za 1 minutę"],["%s minut temu","za %s minut"],["1 godzinę temu","za 1 godzinę"],["%s godzin temu","za %s godzin"],["1 dzień temu","za 1 dzień"],["%s dni temu","za %s dni"],["1 tydzień temu","za 1 tydzień"],["%s tygodni temu","za %s tygodni"],["1 miesiąc temu","za 1 miesiąc"],["%s miesięcy temu","za %s miesięcy"],["1 rok temu","za 1 rok"],["%s lat temu","za %s lat"],["%s sekundy temu","za %s sekundy"],["%s minuty temu","za %s minuty"],["%s godziny temu","za %s godziny"],["%s dni temu","za %s dni"],["%s tygodnie temu","za %s tygodnie"],["%s miesiące temu","za %s miesiące"],["%s lata temu","za %s lata"]];function T(s,n,e,a,t){var u=t%10,r=a;return 1===t?r=s:1==u&&20<t?r=n:1<u&&u<5&&(20<t||t<10)&&(r=e),r}var N=T.bind(null,"секунду","%s секунду","%s секунды","%s секунд"),x=T.bind(null,"минуту","%s минуту","%s минуты","%s минут"),D=T.bind(null,"час","%s час","%s часа","%s часов"),I=T.bind(null,"день","%s день","%s дня","%s дней"),O=T.bind(null,"неделю","%s неделю","%s недели","%s недель"),W=T.bind(null,"месяц","%s месяц","%s месяца","%s месяцев"),$=T.bind(null,"год","%s год","%s года","%s лет");function J(s,n,e,a,t){var u=t%10,r=t%100;return 1==t?s:1==u&&11!=r?n:2<=u&&u<=4&&!(12<=r&&r<=14)?e:a}var U=J.bind(null,"1 секунд","%s секунд","%s секунде","%s секунди"),A=J.bind(null,"1 минут","%s минут","%s минуте","%s минута"),C=J.bind(null,"сат времена","%s сат","%s сата","%s сати"),E=J.bind(null,"1 дан","%s дан","%s дана","%s дана"),B=J.bind(null,"недељу дана","%s недељу","%s недеље","%s недеља"),P=J.bind(null,"месец дана","%s месец","%s месеца","%s месеци"),R=J.bind(null,"годину дана","%s годину","%s године","%s година");function Z(s,n,e,a,t){var u=t%10,r=a;return 1===t?r=s:1==u&&20<t?r=n:1<u&&u<5&&(20<t||t<10)&&(r=e),r}var F=Z.bind(null,"секунду","%s секунду","%s секунди","%s секунд"),G=Z.bind(null,"хвилину","%s хвилину","%s хвилини","%s хвилин"),H=Z.bind(null,"годину","%s годину","%s години","%s годин"),K=Z.bind(null,"день","%s день","%s дні","%s днів"),L=Z.bind(null,"тиждень","%s тиждень","%s тиждні","%s тижднів"),Q=Z.bind(null,"місяць","%s місяць","%s місяці","%s місяців"),V=Z.bind(null,"рік","%s рік","%s роки","%s років");var X=Object.freeze({__proto__:null,ar:function(s,n){if(0===n)return["منذ لحظات","بعد لحظات"];var e,a,t=(e=Math.floor(n/2),(a=s)<3?b[e][a-1]:3<=a&&a<=10?b[e][2]:b[e][3]);return["منذ "+t,"بعد "+t]},be:function(s,n){switch(n){case 0:return["толькі што","праз некалькі секунд"];case 1:return[y(s)+" таму","праз "+y(s)];case 2:case 3:return[k(s)+" таму","праз "+k(s)];case 4:case 5:return[j(s)+" таму","праз "+j(s)];case 6:case 7:return[z(s)+" таму","праз "+z(s)];case 8:case 9:return[w(s)+" таму","праз "+w(s)];case 10:case 11:return[_(s)+" таму","праз "+_(s)];case 12:case 13:return[M(s)+" таму","праз "+M(s)];default:return["",""]}},bg:function(s,n){return[["току що","съвсем скоро"],["преди %s секунди","след %s секунди"],["преди 1 минута","след 1 минута"],["преди %s минути","след %s минути"],["преди 1 час","след 1 час"],["преди %s часа","след %s часа"],["преди 1 ден","след 1 ден"],["преди %s дни","след %s дни"],["преди 1 седмица","след 1 седмица"],["преди %s седмици","след %s седмици"],["преди 1 месец","след 1 месец"],["преди %s месеца","след %s месеца"],["преди 1 година","след 1 година"],["преди %s години","след %s години"]][n]},bn_IN:function(s,n){return[["এইমাত্র","একটা সময়"],["%s সেকেন্ড আগে","%s এর সেকেন্ডের মধ্যে"],["1 মিনিট আগে","1 মিনিটে"],["%s এর মিনিট আগে","%s এর মিনিটের মধ্যে"],["1 ঘন্টা আগে","1 ঘন্টা"],["%s ঘণ্টা আগে","%s এর ঘন্টার মধ্যে"],["1 দিন আগে","1 দিনের মধ্যে"],["%s এর দিন আগে","%s এর দিন"],["1 সপ্তাহ আগে","1 সপ্তাহের মধ্যে"],["%s এর সপ্তাহ আগে","%s সপ্তাহের মধ্যে"],["1 মাস আগে","1 মাসে"],["%s মাস আগে","%s মাসে"],["1 বছর আগে","1 বছরের মধ্যে"],["%s বছর আগে","%s বছরে"]][n]},ca:function(s,n){return[["fa un moment","d'aquí un moment"],["fa %s segons","d'aquí %s segons"],["fa 1 minut","d'aquí 1 minut"],["fa %s minuts","d'aquí %s minuts"],["fa 1 hora","d'aquí 1 hora"],["fa %s hores","d'aquí %s hores"],["fa 1 dia","d'aquí 1 dia"],["fa %s dies","d'aquí %s dies"],["fa 1 setmana","d'aquí 1 setmana"],["fa %s setmanes","d'aquí %s setmanes"],["fa 1 mes","d'aquí 1 mes"],["fa %s mesos","d'aquí %s mesos"],["fa 1 any","d'aquí 1 any"],["fa %s anys","d'aquí %s anys"]][n]},de:function(s,n){return[["gerade eben","vor einer Weile"],["vor %s Sekunden","in %s Sekunden"],["vor 1 Minute","in 1 Minute"],["vor %s Minuten","in %s Minuten"],["vor 1 Stunde","in 1 Stunde"],["vor %s Stunden","in %s Stunden"],["vor 1 Tag","in 1 Tag"],["vor %s Tagen","in %s Tagen"],["vor 1 Woche","in 1 Woche"],["vor %s Wochen","in %s Wochen"],["vor 1 Monat","in 1 Monat"],["vor %s Monaten","in %s Monaten"],["vor 1 Jahr","in 1 Jahr"],["vor %s Jahren","in %s Jahren"]][n]},el:function(s,n){return[["μόλις τώρα","σε λίγο"],["%s δευτερόλεπτα πριν","σε %s δευτερόλεπτα"],["1 λεπτό πριν","σε 1 λεπτό"],["%s λεπτά πριν","σε %s λεπτά"],["1 ώρα πριν","σε 1 ώρα"],["%s ώρες πριν","σε %s ώρες"],["1 μέρα πριν","σε 1 μέρα"],["%s μέρες πριν","σε %s μέρες"],["1 εβδομάδα πριν","σε 1 εβδομάδα"],["%s εβδομάδες πριν","σε %s εβδομάδες"],["1 μήνα πριν","σε 1 μήνα"],["%s μήνες πριν","σε %s μήνες"],["1 χρόνο πριν","σε 1 χρόνο"],["%s χρόνια πριν","σε %s χρόνια"]][n]},en_short:function(s,n){return[["just now","right now"],["%ss ago","in %ss"],["1m ago","in 1m"],["%sm ago","in %sm"],["1h ago","in 1h"],["%sh ago","in %sh"],["1d ago","in 1d"],["%sd ago","in %sd"],["1w ago","in 1w"],["%sw ago","in %sw"],["1mo ago","in 1mo"],["%smo ago","in %smo"],["1yr ago","in 1yr"],["%syr ago","in %syr"]][n]},en_US:n,es:function(s,n){return[["justo ahora","en un rato"],["hace %s segundos","en %s segundos"],["hace 1 minuto","en 1 minuto"],["hace %s minutos","en %s minutos"],["hace 1 hora","en 1 hora"],["hace %s horas","en %s horas"],["hace 1 día","en 1 día"],["hace %s días","en %s días"],["hace 1 semana","en 1 semana"],["hace %s semanas","en %s semanas"],["hace 1 mes","en 1 mes"],["hace %s meses","en %s meses"],["hace 1 año","en 1 año"],["hace %s años","en %s años"]][n]},eu:function(s,n){return[["orain","denbora bat barru"],["duela %s segundu","%s segundu barru"],["duela minutu 1","minutu 1 barru"],["duela %s minutu","%s minutu barru"],["duela ordu 1","ordu 1 barru"],["duela %s ordu","%s ordu barru"],["duela egun 1","egun 1 barru"],["duela %s egun","%s egun barru"],["duela aste 1","aste 1 barru"],["duela %s aste","%s aste barru"],["duela hillabete 1","hillabete 1 barru"],["duela %s hillabete","%s hillabete barru"],["duela urte 1","urte 1 barru"],["duela %s urte","%s urte barru"]][n]},fa:function(s,n){var e=[["لحظاتی پیش","همین حالا"],["%s ثانیه پیش","%s ثانیه دیگر"],["۱ دقیقه پیش","۱ دقیقه دیگر"],["%s دقیقه پیش","%s دقیقه دیگر"],["۱ ساعت پیش","۱ ساعت دیگر"],["%s ساعت پیش","%s ساعت دیگر"],["۱ روز پیش","۱ روز دیگر"],["%s روز پیش","%s روز دیگر"],["۱ هفته پیش","۱ هفته دیگر"],["%s هفته پیش","%s هفته دیگر"],["۱ ماه پیش","۱ ماه دیگر"],["%s ماه پیش","%s ماه دیگر"],["۱ سال پیش","۱ سال دیگر"],["%s سال پیش","%s سال دیگر"]][n];return[e[0].replace("%s",q(s)),e[1].replace("%s",q(s))]},fi:function(s,n){return[["juuri äsken","juuri nyt"],["%s sekuntia sitten","%s sekunnin päästä"],["minuutti sitten","minuutin päästä"],["%s minuuttia sitten","%s minuutin päästä"],["tunti sitten","tunnin päästä"],["%s tuntia sitten","%s tunnin päästä"],["päivä sitten","päivän päästä"],["%s päivää sitten","%s päivän päästä"],["viikko sitten","viikon päästä"],["%s viikkoa sitten","%s viikon päästä"],["kuukausi sitten","kuukauden päästä"],["%s kuukautta sitten","%s kuukauden päästä"],["vuosi sitten","vuoden päästä"],["%s vuotta sitten","%s vuoden päästä"]][n]},fr:function(s,n){return[["à l'instant","dans un instant"],["il y a %s secondes","dans %s secondes"],["il y a 1 minute","dans 1 minute"],["il y a %s minutes","dans %s minutes"],["il y a 1 heure","dans 1 heure"],["il y a %s heures","dans %s heures"],["il y a 1 jour","dans 1 jour"],["il y a %s jours","dans %s jours"],["il y a 1 semaine","dans 1 semaine"],["il y a %s semaines","dans %s semaines"],["il y a 1 mois","dans 1 mois"],["il y a %s mois","dans %s mois"],["il y a 1 an","dans 1 an"],["il y a %s ans","dans %s ans"]][n]},gl:function(s,n){return[["xusto agora","daquí a un pouco"],["hai %s segundos","en %s segundos"],["hai 1 minuto","nun minuto"],["hai %s minutos","en %s minutos"],["hai 1 hora","nunha hora"],["hai %s horas","en %s horas"],["hai 1 día","nun día"],["hai %s días","en %s días"],["hai 1 semana","nunha semana"],["hai %s semanas","en %s semanas"],["hai 1 mes","nun mes"],["hai %s meses","en %s meses"],["hai 1 ano","nun ano"],["hai %s anos","en %s anos"]][n]},he:function(s,n){return[["זה עתה","עכשיו"],["לפני %s שניות","בעוד %s שניות"],["לפני דקה","בעוד דקה"],["לפני %s דקות","בעוד %s דקות"],["לפני שעה","בעוד שעה"],2===s?["לפני שעתיים","בעוד שעתיים"]:["לפני %s שעות","בעוד %s שעות"],["אתמול","מחר"],2===s?["לפני יומיים","בעוד יומיים"]:["לפני %s ימים","בעוד %s ימים"],["לפני שבוע","בעוד שבוע"],2===s?["לפני שבועיים","בעוד שבועיים"]:["לפני %s שבועות","בעוד %s שבועות"],["לפני חודש","בעוד חודש"],2===s?["לפני חודשיים","בעוד חודשיים"]:["לפני %s חודשים","בעוד %s חודשים"],["לפני שנה","בעוד שנה"],2===s?["לפני שנתיים","בעוד שנתיים"]:["לפני %s שנים","בעוד %s שנים"]][n]},hi_IN:function(s,n){return[["अभी","कुछ समय"],["%s सेकंड पहले","%s सेकंड में"],["1 मिनट पहले","1 मिनट में"],["%s मिनट पहले","%s मिनट में"],["1 घंटे पहले","1 घंटे में"],["%s घंटे पहले","%s घंटे में"],["1 दिन पहले","1 दिन में"],["%s दिन पहले","%s दिनों में"],["1 सप्ताह पहले","1 सप्ताह में"],["%s हफ्ते पहले","%s हफ्तों में"],["1 महीने पहले","1 महीने में"],["%s महीने पहले","%s महीनों में"],["1 साल पहले","1 साल में"],["%s साल पहले","%s साल में"]][n]},hu:function(s,n){return[["éppen most","éppen most"],["%s másodperce","%s másodpercen belül"],["1 perce","1 percen belül"],["%s perce","%s percen belül"],["1 órája","1 órán belül"],["%s órája","%s órán belül"],["1 napja","1 napon belül"],["%s napja","%s napon belül"],["1 hete","1 héten belül"],["%s hete","%s héten belül"],["1 hónapja","1 hónapon belül"],["%s hónapja","%s hónapon belül"],["1 éve","1 éven belül"],["%s éve","%s éven belül"]][n]},id_ID:function(s,n){return[["baru saja","sebentar"],["%s detik yang lalu","dalam %s detik"],["1 menit yang lalu","dalam 1 menit"],["%s menit yang lalu","dalam %s menit"],["1 jam yang lalu","dalam 1 jam"],["%s jam yang lalu","dalam %s jam"],["1 hari yang lalu","dalam 1 hari"],["%s hari yang lalu","dalam %s hari"],["1 minggu yang lalu","dalam 1 minggu"],["%s minggu yang lalu","dalam %s minggu"],["1 bulan yang lalu","dalam 1 bulan"],["%s bulan yang lalu","dalam %s bulan"],["1 tahun yang lalu","dalam 1 tahun"],["%s tahun yang lalu","dalam %s tahun"]][n]},it:function(s,n){return[["poco fa","fra poco"],["%s secondi fa","fra %s secondi"],["un minuto fa","fra un minuto"],["%s minuti fa","fra %s minuti"],["un'ora fa","fra un'ora"],["%s ore fa","fra %s ore"],["un giorno fa","fra un giorno"],["%s giorni fa","fra %s giorni"],["una settimana fa","fra una settimana"],["%s settimane fa","fra %s settimane"],["un mese fa","fra un mese"],["%s mesi fa","fra %s mesi"],["un anno fa","fra un anno"],["%s anni fa","fra %s anni"]][n]},ja:function(s,n){return[["すこし前","すぐに"],["%s秒前","%s秒以内"],["1分前","1分以内"],["%s分前","%s分以内"],["1時間前","1時間以内"],["%s時間前","%s時間以内"],["1日前","1日以内"],["%s日前","%s日以内"],["1週間前","1週間以内"],["%s週間前","%s週間以内"],["1ヶ月前","1ヶ月以内"],["%sヶ月前","%sヶ月以内"],["1年前","1年以内"],["%s年前","%s年以内"]][n]},ko:function(s,n){return[["방금","곧"],["%s초 전","%s초 후"],["1분 전","1분 후"],["%s분 전","%s분 후"],["1시간 전","1시간 후"],["%s시간 전","%s시간 후"],["1일 전","1일 후"],["%s일 전","%s일 후"],["1주일 전","1주일 후"],["%s주일 전","%s주일 후"],["1개월 전","1개월 후"],["%s개월 전","%s개월 후"],["1년 전","1년 후"],["%s년 전","%s년 후"]][n]},ml:function(s,n){return[["ഇപ്പോള്‍","കുറച്ചു മുന്‍പ്"],["%s സെക്കന്റ്‌കള്‍ക്ക് മുന്‍പ്","%s സെക്കന്റില്‍"],["1 മിനിറ്റിനു മുന്‍പ്","1 മിനിറ്റില്‍"],["%s മിനിറ്റുകള്‍ക്ക് മുന്‍പ","%s മിനിറ്റില്‍"],["1 മണിക്കൂറിനു മുന്‍പ്","1 മണിക്കൂറില്‍"],["%s മണിക്കൂറുകള്‍ക്കു മുന്‍പ്","%s മണിക്കൂറില്‍"],["1 ഒരു ദിവസം മുന്‍പ്","1 ദിവസത്തില്‍"],["%s ദിവസങ്ങള്‍ക് മുന്‍പ്","%s ദിവസങ്ങള്‍ക്കുള്ളില്‍"],["1 ആഴ്ച മുന്‍പ്","1 ആഴ്ചയില്‍"],["%s ആഴ്ചകള്‍ക്ക് മുന്‍പ്","%s ആഴ്ചകള്‍ക്കുള്ളില്‍"],["1 മാസത്തിനു മുന്‍പ്","1 മാസത്തിനുള്ളില്‍"],["%s മാസങ്ങള്‍ക്ക് മുന്‍പ്","%s മാസങ്ങള്‍ക്കുള്ളില്‍"],["1 വര്‍ഷത്തിനു  മുന്‍പ്","1 വര്‍ഷത്തിനുള്ളില്‍"],["%s വര്‍ഷങ്ങള്‍ക്കു മുന്‍പ്","%s വര്‍ഷങ്ങള്‍ക്കുല്ല്ളില്‍"]][n]},my:function(s,n){return[["ယခုအတွင်း","ယခု"],["%s စက္ကန့် အကြာက","%s စက္ကန့်အတွင်း"],["1 မိနစ် အကြာက","1 မိနစ်အတွင်း"],["%s မိနစ် အကြာက","%s မိနစ်အတွင်း"],["1 နာရီ အကြာက","1 နာရီအတွင်း"],["%s နာရီ အကြာက","%s နာရီအတွင်း"],["1 ရက် အကြာက","1 ရက်အတွင်း"],["%s ရက် အကြာက","%s ရက်အတွင်း"],["1 ပတ် အကြာက","1 ပတ်အတွင်း"],["%s ပတ် အကြာက","%s ပတ်အတွင်း"],["1 လ အကြာက","1 လအတွင်း"],["%s လ အကြာက","%s လအတွင်း"],["1 နှစ် အကြာက","1 နှစ်အတွင်း"],["%s နှစ် အကြာက","%s နှစ်အတွင်း"]][n]},nb_NO:function(s,n){return[["akkurat nå","om litt"],["%s sekunder siden","om %s sekunder"],["1 minutt siden","om 1 minutt"],["%s minutter siden","om %s minutter"],["1 time siden","om 1 time"],["%s timer siden","om %s timer"],["1 dag siden","om 1 dag"],["%s dager siden","om %s dager"],["1 uke siden","om 1 uke"],["%s uker siden","om %s uker"],["1 måned siden","om 1 måned"],["%s måneder siden","om %s måneder"],["1 år siden","om 1 år"],["%s år siden","om %s år"]][n]},nl:function(s,n){return[["recent","binnenkort"],["%s seconden geleden","binnen %s seconden"],["1 minuut geleden","binnen 1 minuut"],["%s minuten geleden","binnen %s minuten"],["1 uur geleden","binnen 1 uur"],["%s uur geleden","binnen %s uur"],["1 dag geleden","binnen 1 dag"],["%s dagen geleden","binnen %s dagen"],["1 week geleden","binnen 1 week"],["%s weken geleden","binnen %s weken"],["1 maand geleden","binnen 1 maand"],["%s maanden geleden","binnen %s maanden"],["1 jaar geleden","binnen 1 jaar"],["%s jaar geleden","binnen %s jaar"]][n]},nn_NO:function(s,n){return[["nett no","om litt"],["%s sekund sidan","om %s sekund"],["1 minutt sidan","om 1 minutt"],["%s minutt sidan","om %s minutt"],["1 time sidan","om 1 time"],["%s timar sidan","om %s timar"],["1 dag sidan","om 1 dag"],["%s dagar sidan","om %s dagar"],["1 veke sidan","om 1 veke"],["%s veker sidan","om %s veker"],["1 månad sidan","om 1 månad"],["%s månadar sidan","om %s månadar"],["1 år sidan","om 1 år"],["%s år sidan","om %s år"]][n]},pl:function(s,n){return S[1&n?4<s%10||s%10<2||1==~~(s/10)%10?n:++n/2+13:n]},pt_BR:function(s,n){return[["agora mesmo","agora"],["há %s segundos","em %s segundos"],["há um minuto","em um minuto"],["há %s minutos","em %s minutos"],["há uma hora","em uma hora"],["há %s horas","em %s horas"],["há um dia","em um dia"],["há %s dias","em %s dias"],["há uma semana","em uma semana"],["há %s semanas","em %s semanas"],["há um mês","em um mês"],["há %s meses","em %s meses"],["há um ano","em um ano"],["há %s anos","em %s anos"]][n]},ro:function(s,n){var e=[["chiar acum","chiar acum"],["acum %s secunde","peste %s secunde"],["acum un minut","peste un minut"],["acum %s minute","peste %s minute"],["acum o oră","peste o oră"],["acum %s ore","peste %s ore"],["acum o zi","peste o zi"],["acum %s zile","peste %s zile"],["acum o săptămână","peste o săptămână"],["acum %s săptămâni","peste %s săptămâni"],["acum o lună","peste o lună"],["acum %s luni","peste %s luni"],["acum un an","peste un an"],["acum %s ani","peste %s ani"]];return s<20?e[n]:[e[n][0].replace("%s","%s de"),e[n][1].replace("%s","%s de")]},ru:function(s,n){switch(n){case 0:return["только что","через несколько секунд"];case 1:return[N(s)+" назад","через "+N(s)];case 2:case 3:return[x(s)+" назад","через "+x(s)];case 4:case 5:return[D(s)+" назад","через "+D(s)];case 6:return["вчера","завтра"];case 7:return[I(s)+" назад","через "+I(s)];case 8:case 9:return[O(s)+" назад","через "+O(s)];case 10:case 11:return[W(s)+" назад","через "+W(s)];case 12:case 13:return[$(s)+" назад","через "+$(s)];default:return["",""]}},sq:function(s,n){return[["pak më parë","pas pak"],["para %s sekondash","pas %s sekondash"],["para një minute","pas një minute"],["para %s minutash","pas %s minutash"],["para një ore","pas një ore"],["para %s orësh","pas %s orësh"],["dje","nesër"],["para %s ditësh","pas %s ditësh"],["para një jave","pas një jave"],["para %s javësh","pas %s javësh"],["para një muaji","pas një muaji"],["para %s muajsh","pas %s muajsh"],["para një viti","pas një viti"],["para %s vjetësh","pas %s vjetësh"]][n]},sr:function(s,n){switch(n){case 0:return["малопре","управо сад"];case 1:return["пре "+U(s),"за "+U(s)];case 2:case 3:return["пре "+A(s),"за "+A(s)];case 4:case 5:return["пре "+C(s),"за "+C(s)];case 6:case 7:return["пре "+E(s),"за "+E(s)];case 8:case 9:return["пре "+B(s),"за "+B(s)];case 10:case 11:return["пре "+P(s),"за "+P(s)];case 12:case 13:return["пре "+R(s),"за "+R(s)];default:return["",""]}},sv:function(s,n){return[["just nu","om en stund"],["%s sekunder sedan","om %s sekunder"],["1 minut sedan","om 1 minut"],["%s minuter sedan","om %s minuter"],["1 timme sedan","om 1 timme"],["%s timmar sedan","om %s timmar"],["1 dag sedan","om 1 dag"],["%s dagar sedan","om %s dagar"],["1 vecka sedan","om 1 vecka"],["%s veckor sedan","om %s veckor"],["1 månad sedan","om 1 månad"],["%s månader sedan","om %s månader"],["1 år sedan","om 1 år"],["%s år sedan","om %s år"]][n]},ta:function(s,n){return[["இப்போது","சற்று நேரம் முன்பு"],["%s நொடிக்கு முன்","%s நொடிகளில்"],["1 நிமிடத்திற்க்கு முன்","1 நிமிடத்தில்"],["%s நிமிடத்திற்க்கு முன்","%s நிமிடங்களில்"],["1 மணி நேரத்திற்கு முன்","1 மணி நேரத்திற்குள்"],["%s மணி நேரத்திற்கு முன்","%s மணி நேரத்திற்குள்"],["1 நாளுக்கு முன்","1 நாளில்"],["%s நாட்களுக்கு முன்","%s நாட்களில்"],["1 வாரத்திற்கு முன்","1 வாரத்தில்"],["%s வாரங்களுக்கு முன்","%s வாரங்களில்"],["1 மாதத்திற்கு முன்","1 மாதத்தில்"],["%s மாதங்களுக்கு முன்","%s மாதங்களில்"],["1 வருடத்திற்கு முன்","1 வருடத்தில்"],["%s வருடங்களுக்கு முன்","%s வருடங்களில்"]][n]},th:function(s,n){return[["เมื่อสักครู่นี้","อีกสักครู่"],["%s วินาทีที่แล้ว","ใน %s วินาที"],["1 นาทีที่แล้ว","ใน 1 นาที"],["%s นาทีที่แล้ว","ใน %s นาที"],["1 ชั่วโมงที่แล้ว","ใน 1 ชั่วโมง"],["%s ชั่วโมงที่แล้ว","ใน %s ชั่วโมง"],["1 วันที่แล้ว","ใน 1 วัน"],["%s วันที่แล้ว","ใน %s วัน"],["1 อาทิตย์ที่แล้ว","ใน 1 อาทิตย์"],["%s อาทิตย์ที่แล้ว","ใน %s อาทิตย์"],["1 เดือนที่แล้ว","ใน 1 เดือน"],["%s เดือนที่แล้ว","ใน %s เดือน"],["1 ปีที่แล้ว","ใน 1 ปี"],["%s ปีที่แล้ว","ใน %s ปี"]][n]},tr:function(s,n){return[["az önce","şimdi"],["%s saniye önce","%s saniye içinde"],["1 dakika önce","1 dakika içinde"],["%s dakika önce","%s dakika içinde"],["1 saat önce","1 saat içinde"],["%s saat önce","%s saat içinde"],["1 gün önce","1 gün içinde"],["%s gün önce","%s gün içinde"],["1 hafta önce","1 hafta içinde"],["%s hafta önce","%s hafta içinde"],["1 ay önce","1 ay içinde"],["%s ay önce","%s ay içinde"],["1 yıl önce","1 yıl içinde"],["%s yıl önce","%s yıl içinde"]][n]},uk:function(s,n){switch(n){case 0:return["щойно","через декілька секунд"];case 1:return[F(s)+" тому","через "+F(s)];case 2:case 3:return[G(s)+" тому","через "+G(s)];case 4:case 5:return[H(s)+" тому","через "+H(s)];case 6:case 7:return[K(s)+" тому","через "+K(s)];case 8:case 9:return[L(s)+" тому","через "+L(s)];case 10:case 11:return[Q(s)+" тому","через "+Q(s)];case 12:case 13:return[V(s)+" тому","через "+V(s)];default:return["",""]}},vi:function(s,n){return[["vừa xong","một lúc"],["%s giây trước","trong %s giây"],["1 phút trước","trong 1 phút"],["%s phút trước","trong %s phút"],["1 giờ trước","trong 1 giờ"],["%s giờ trước","trong %s giờ"],["1 ngày trước","trong 1 ngày"],["%s ngày trước","trong %s ngày"],["1 tuần trước","trong 1 tuần"],["%s tuần trước","trong %s tuần"],["1 tháng trước","trong 1 tháng"],["%s tháng trước","trong %s tháng"],["1 năm trước","trong 1 năm"],["%s năm trước","trong %s năm"]][n]},zh_CN:e,zh_TW:function(s,n){return[["剛剛","片刻後"],["%s 秒前","%s 秒後"],["1 分鐘前","1 分鐘後"],["%s 分鐘前","%s 分鐘後"],["1 小時前","1 小時後"],["%s 小時前","%s 小時後"],["1 天前","1 天後"],["%s 天前","%s 天後"],["1 週前","1 週後"],["%s 週前","%s 週後"],["1 個月前","1 個月後"],["%s 個月前","%s 個月後"],["1 年前","1 年後"],["%s 年前","%s 年後"]][n]}});Object.keys(X).forEach(function(s){u(s,X[s])}),s.cancel=function(s){s?f(h(s)):Object.keys(g).forEach(f)},s.format=function(s,n,e){return d(c(s,e&&e.relativeDate),r(n))},s.register=u,s.render=function(s,n,e){var a=s.length?s:[s];return a.forEach(function(s){p(s,s.getAttribute("datetime"),r(n),e||{})}),a},Object.defineProperty(s,"__esModule",{value:!0})});


function Dash(){
    this.html = $("<div></div>");
    this.IsMobile = false;
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        this.IsMobile = true;
    };
    this.Context = DASH_CONTEXT;
    this.Local = new DashLocal();
    this.Color = new DashColor();
    this.Size = new DashSize();
    this.User = new DashUser();
    this.Gui = new DashGui();
    this.View = new DashView();
    this.Requests = new DashRequest();
    this.Request = this.Requests.Request.bind(this.Requests);
    // window.RowHeight = 32;
    // window.ColumnWidth = window.RowHeight*5;
    // window.Padding = 10;
    // window.BarWidth = 6;
    // window.ButtonColor = "#4d505f";
    // window.ButtonBarBackingColor = "#3b3c42";
    // window.ButtonHoverColor = "#565e83";
    // window.DarkPanelColor = "#202229";
    // window.DarkPanelColorAlt = "#25282f";
    // window.LightestBackgroundColor = "rgb(240, 240, 240)";
    // window.LightBackgroundColor = "rgb(230, 230, 230)";
    // window.GrayBackgroundColor = "rgb(200, 200, 200)";
    // window.GoodColor = "#95ae6c";
    // window.GoodColorBlue = "#a8b6bd";
    // window.GoodColorYellow = "rgb(255, 230, 141)";
    // window.GoodColorPurple = "#8f79b1";
    // window.BadColor = "#dabd62";
    // window.ErrorColor = "#c56645";
    // window.TextColor = "rgba(0, 0, 0, 0.9)";
    // window.ContainerColor = "#ebebeb";
    // window.ThinFontSize = "90%";
    // window.MindtwinStripHeight = window.RowHeight;
    // window.MindtwinStripWidth = window.ColumnWidth*1.25;
    this.width = 0;
    this.height = 0;
    window.FormatTime = function(server_iso_string){
        var server_offset_hours = 5; // The server's time is 3 hours different
        var date = new Date(Date.parse(server_iso_string));
        date = date.setHours(date.getHours()-server_offset_hours);
        var time_ago = timeago.format(date);
        return time_ago;
    };
    this.ValidateResponse = function(response){
        // TODO: doc
        if (!response) {
            console.log("Dash.ValidateResponse(1)");
            console.log(response);
            alert("There was a server problem with this request");
            return null;
        };
        if (response["error"]) {
            console.log("Dash.ValidateResponse(2)");
            console.log(response);
            alert(response["error"]);
            return null;
        };
        return response;
    };
    this.GetFormContainer = function(){
        var container = $("<div></div>");
        container.css({
            "background": ContainerColor,
            "margin": Padding,
            "padding": Padding,
            "box-shadow": "0px 0px 15px 1px rgba(0, 0, 0, 0.2)",
            "color": "rgba(0, 0, 0, 0.8)",
            "border-radius": 6,
        });
        return container;
    };
    this.setup_styles = function(){
        $("body").css({
            "overflow": "hidden",
        });
        this.html.css({
            "position": "absolute",
            "left": 0,
            "top": 0,
            "background": Dash.Color.GetVerticalGradient("#444", "#111", "#111"),
        });
        (function(self){
            requestAnimationFrame(function(){
                self.draw();
            });
            $(window).resize(function(){
                self.draw();
            });
        })(this);
    };
    this.draw = function(){
        this.width = $(window).width();
        this.height = $(window).height();
        this.html.css({
            "width": this.width,
            "height": this.height,
        });
    };
    this.Initialize = function(){
        // Called once when document ready
        this.setup_styles();
    };
};
$(document).ready(function() {
    $.fn.extend({
        animateStep: function(options) {
            return this.each(function() {
                var elementOptions = $.extend({}, options, {step: options.step.bind($(this))});
                $({x: options.from}).animate({x: options.to}, elementOptions);
            });
        },
        rotate: function(value) {
            return this.css("transform", "rotate(" + value + "deg)");
        }
    });
    if (window.location.href.includes("https://www.") && !window.location.href.includes("file://")) {
        console.log("Warning: URL Loaded with www -> Redirecting");
        window.location.href = window.location.href.replace("https://www.", "https://");
    };
    window.InverseLerp = function(min, max, val){
        var t = (val - min) / (max - min)
        return t;
    };
    window.Lerp = function(valA, valB, t){
        if (t > 1) {t = 1;}
        if (t < 0) {t = 0;}
        var x = valA + t * (valB - valA);
        return x;
    };
    window.Dash = new Dash();
    window.d = window.Dash;
    window.Dash.Initialize();
    $("body").empty().append(window.Dash.html);
    if (!window.RunDash) {
        console.log("Dash is initialized, but there is no window.RunDash() function. Create one and reload.");
    }
    else {
        var html = window.RunDash();
        if (!html) {
            console.log("Dash Warning: The window.RunDash() must return an html element to anchor this app.");
        }
        else {
            window.Dash.html.append(html);
        };
    };
});


function DashUser(){
    this.__auth_authenticated_cb = null;
    this.__auth_not_authenticated_cb = null;
    this.Data = null;
    this.Authenticate = function(bind, on_user_authenticated, on_user_not_authenticated){
        this.__auth_authenticated_cb = on_user_authenticated.bind(bind);
        this.__auth_not_authenticated_cb = on_user_not_authenticated.bind(bind);
        var token = d.Local.Get("token");
        var email = d.Local.Get("email");
        var user_json = d.Local.Get("user_json");
        if (token && email && user_json) {
            var params = {};
            params["f"] = "validate";
            params["token"] = token;
            d.Request(this, this.on_auth_response, "Users", params);
        }
        else {
            this.__auth_not_authenticated_cb();
        };
    };
    this.SetUserAuthentication = function(email, server_response){
        if (email && server_response["token"]) {
            this.Data = server_response["user"];
            d.Local.Set("email", email);
            d.Local.Set("token", server_response["token"]);
            d.Local.Set("user_json", JSON.stringify(server_response["user"]));
        }
        else {
            this.Data = null;
            d.Local.Set("email", "");
            d.Local.Set("token", "");
            d.Local.Set("user_json", "");
        };
    };
    this.on_auth_response = function(response){
        response["token"] = response["token"] || d.Local.Get("token");
        if (response["valid_login"] && response["user"]["email"]) {
            this.SetUserAuthentication(response["user"]["email"], response);
            this.__auth_authenticated_cb();
        }
        else {
            console.log("** The user is no longer authenticated **");
            console.log(response);
            this.SetUserAuthentication();
            this.__auth_not_authenticated_cb();
        };
    };
};


function DashColor(){
    // this.DarkBackground = "#e6e6e6";
    // this.LightBackground = "#e6e6e6";
    this.Background = "#e6e6e6";
    this.Text = "#333";
    // this.DarkText = "#333";
    // this.LightText = "#e3d5ca";
    this.Primary = "#95ae6c";
    this.Dark = "#202229";
    this.Light = "rgb(230, 230, 230)";
    this.SaveHighlight = "rgb(255, 255, 255, 0.5)";
    this.Warning = "#fab964";
    this.Button = new DashColorSet(
        "#4d505f",   // Background color
        "#565e83", // Background color on hover
        "#95ae6c", // Background color while selected
        "#a5c582", // Background color while selected and hovering
        "rgba(255, 255, 255, 0.9)"   // Text color
    );
    // NEW
    this.Dark = new DashColorSet(
        "#4d505f", // Background color
        "#565e83", // Background color on hover
        "#95ae6c", // Background color while selected
        "#a5c582", // Background color while selected and hovering
        "rgba(255, 255, 255, 0.9)"   // Text color
    );
    this.Light = new DashColorSet(
        "#4d505f",   // Background color
        "#565e83", // Background color on hover
        "#95ae6c", // Background color while selected
        "#a5c582", // Background color while selected and hovering
        "rgba(255, 255, 255, 0.9)"   // Text color
    );
    this.GetHorizontalGradient = function(color_1, color_2, color_3, color_4){
        return this.GetGradient(90, color_1, color_2, color_3, color_4);
    };
    this.GetVerticalGradient = function(color_1, color_2, color_3, color_4){
        return this.GetGradient(0, color_1, color_2, color_3, color_4);
    };
    this.GetGradient = function(degrees, color_1, color_2, color_3, color_4){
        var colors = "";
        if (color_1 && color_2 && color_3 && color_4) {
            colors = this.ParseToRGB(color_4) + " 0%, " + this.ParseToRGB(color_3) + " 25%, ";
            colors += this.ParseToRGB(color_2) + " 75%, " + this.ParseToRGB(color_1) + " 100%";
        }
        else if (color_1 && color_2 && color_3) {
            colors = this.ParseToRGB(color_3) + " 0%, " + this.ParseToRGB(color_2) + " 50%, ";
            colors += this.ParseToRGB(color_1) + " 100%"
        }
        else if (color_1 && color_2) {
            colors = this.ParseToRGB(color_2) + " 0%, " + this.ParseToRGB(color_1) + " 100%";
        }
        else {
            console.log("Error: At least 2 colors are required for a gradient");
            return "red";
        };
        return "linear-gradient(" + degrees + "deg, " + colors + ")";
    };
    this.Names = {
        "aliceblue": [240, 248, 255],
        "antiquewhite": [250, 235, 215],
        "aqua": [0, 255, 255],
        "aquamarine": [127, 255, 212],
        "azure": [240, 255, 255],
        "beige": [245, 245, 220],
        "bisque": [255, 228, 196],
        "black": [0, 0, 0],
        "blanchedalmond": [255, 235, 205],
        "blue": [0, 0, 255],
        "blueviolet": [138, 43, 226],
        "brown": [165, 42, 42],
        "burlywood": [222, 184, 135],
        "cadetblue": [95, 158, 160],
        "chartreuse": [127, 255, 0],
        "chocolate": [210, 105, 30],
        "coral": [255, 127, 80],
        "cornflowerblue": [100, 149, 237],
        "cornsilk": [255, 248, 220],
        "crimson": [220, 20, 60],
        "cyan": [0, 255, 255],
        "darkblue": [0, 0, 139],
        "darkcyan": [0, 139, 139],
        "darkgoldenrod": [184, 134, 11],
        "darkgray": [169, 169, 169],
        "darkgreen": [0, 100, 0],
        "darkgrey": [169, 169, 169],
        "darkkhaki": [189, 183, 107],
        "darkmagenta": [139, 0, 139],
        "darkolivegreen": [85, 107, 47],
        "darkorange": [255, 140, 0],
        "darkorchid": [153, 50, 204],
        "darkred": [139, 0, 0],
        "darksalmon": [233, 150, 122],
        "darkseagreen": [143, 188, 143],
        "darkslateblue": [72, 61, 139],
        "darkslategray": [47, 79, 79],
        "darkslategrey": [47, 79, 79],
        "darkturquoise": [0, 206, 209],
        "darkviolet": [148, 0, 211],
        "deeppink": [255, 20, 147],
        "deepskyblue": [0, 191, 255],
        "dimgray": [105, 105, 105],
        "dimgrey": [105, 105, 105],
        "dodgerblue": [30, 144, 255],
        "firebrick": [178, 34, 34],
        "floralwhite": [255, 250, 240],
        "forestgreen": [34, 139, 34],
        "fuchsia": [255, 0, 255],
        "gainsboro": [220, 220, 220],
        "ghostwhite": [248, 248, 255],
        "gold": [255, 215, 0],
        "goldenrod": [218, 165, 32],
        "gray": [128, 128, 128],
        "green": [0, 128, 0],
        "greenyellow": [173, 255, 47],
        "grey": [128, 128, 128],
        "honeydew": [240, 255, 240],
        "hotpink": [255, 105, 180],
        "indianred": [205, 92, 92],
        "indigo": [75, 0, 130],
        "ivory": [255, 255, 240],
        "khaki": [240, 230, 140],
        "lavender": [230, 230, 250],
        "lavenderblush": [255, 240, 245],
        "lawngreen": [124, 252, 0],
        "lemonchiffon": [255, 250, 205],
        "lightblue": [173, 216, 230],
        "lightcoral": [240, 128, 128],
        "lightcyan": [224, 255, 255],
        "lightgoldenrodyellow": [250, 250, 210],
        "lightgray": [211, 211, 211],
        "lightgreen": [144, 238, 144],
        "lightgrey": [211, 211, 211],
        "lightpink": [255, 182, 193],
        "lightsalmon": [255, 160, 122],
        "lightseagreen": [32, 178, 170],
        "lightskyblue": [135, 206, 250],
        "lightslategray": [119, 136, 153],
        "lightslategrey": [119, 136, 153],
        "lightsteelblue": [176, 196, 222],
        "lightyellow": [255, 255, 224],
        "lime": [0, 255, 0],
        "limegreen": [50, 205, 50],
        "linen": [250, 240, 230],
        "magenta": [255, 0, 255],
        "maroon": [128, 0, 0],
        "mediumaquamarine": [102, 205, 170],
        "mediumblue": [0, 0, 205],
        "mediumorchid": [186, 85, 211],
        "mediumpurple": [147, 112, 219],
        "mediumseagreen": [60, 179, 113],
        "mediumslateblue": [123, 104, 238],
        "mediumspringgreen": [0, 250, 154],
        "mediumturquoise": [72, 209, 204],
        "mediumvioletred": [199, 21, 133],
        "midnightblue": [25, 25, 112],
        "mintcream": [245, 255, 250],
        "mistyrose": [255, 228, 225],
        "moccasin": [255, 228, 181],
        "navajowhite": [255, 222, 173],
        "navy": [0, 0, 128],
        "oldlace": [253, 245, 230],
        "olive": [128, 128, 0],
        "olivedrab": [107, 142, 35],
        "orange": [255, 165, 0],
        "orangered": [255, 69, 0],
        "orchid": [218, 112, 214],
        "palegoldenrod": [238, 232, 170],
        "palegreen": [152, 251, 152],
        "paleturquoise": [175, 238, 238],
        "palevioletred": [219, 112, 147],
        "papayawhip": [255, 239, 213],
        "peachpuff": [255, 218, 185],
        "peru": [205, 133, 63],
        "pink": [255, 192, 203],
        "plum": [221, 160, 221],
        "powderblue": [176, 224, 230],
        "purple": [128, 0, 128],
        "rebeccapurple": [102, 51, 153],
        "red": [255, 0, 0],
        "rosybrown": [188, 143, 143],
        "royalblue": [65, 105, 225],
        "saddlebrown": [139, 69, 19],
        "salmon": [250, 128, 114],
        "sandybrown": [244, 164, 96],
        "seagreen": [46, 139, 87],
        "seashell": [255, 245, 238],
        "sienna": [160, 82, 45],
        "silver": [192, 192, 192],
        "skyblue": [135, 206, 235],
        "slateblue": [106, 90, 205],
        "slategray": [112, 128, 144],
        "slategrey": [112, 128, 144],
        "snow": [255, 250, 250],
        "springgreen": [0, 255, 127],
        "steelblue": [70, 130, 180],
        "tan": [210, 180, 140],
        "teal": [0, 128, 128],
        "thistle": [216, 191, 216],
        "tomato": [255, 99, 71],
        "turquoise": [64, 224, 208],
        "violet": [238, 130, 238],
        "wheat": [245, 222, 179],
        "white": [255, 255, 255],
        "whitesmoke": [245, 245, 245],
        "yellow": [255, 255, 0],
        "yellowgreen": [154, 205, 50]
    };
    this.to_rgba = function(color_data){
        return "rgba(" + color_data[0] + ", " + color_data[1] + ", " + color_data[2] + ", " + color_data[3] + ")";
    };
    this.to_rgb = function(color_data){
        return "rgb(" + color_data[0] + ", " + color_data[1] + ", " + color_data[2] + ")";
    };
    this.ParseToRGB = function(cstr){
        return this.to_rgb(this.Parse(cstr));
    };
    this.ParseToRGBA = function(cstr){
        return this.to_rgba(this.Parse(cstr));
    };
    this.Parse = function(cstr) {
        var m = null;
        var parts = [];
        var alpha = 1
        var space = null;
        if (typeof cstr === 'string') {
            //keyword
            if (this.Names[cstr]) {
                parts = this.Names[cstr].slice()
                space = 'rgb'
            }
            //reserved words
            else if (cstr === 'transparent') {
                alpha = 0
                space = 'rgb'
                parts = [0,0,0]
            }
            //hex
            else if (/^#[A-Fa-f0-9]+$/.test(cstr)) {
                var base = cstr.slice(1)
                var size = base.length
                var isShort = size <= 4
                alpha = 1
                if (isShort) {
                    parts = [
                        parseInt(base[0] + base[0], 16),
                        parseInt(base[1] + base[1], 16),
                        parseInt(base[2] + base[2], 16)
                    ]
                    if (size === 4) {
                        alpha = parseInt(base[3] + base[3], 16) / 255
                    }
                }
                else {
                    parts = [
                        parseInt(base[0] + base[1], 16),
                        parseInt(base[2] + base[3], 16),
                        parseInt(base[4] + base[5], 16)
                    ]
                    if (size === 8) {
                        alpha = parseInt(base[6] + base[7], 16) / 255
                    }
                }
                if (!parts[0]) parts[0] = 0
                if (!parts[1]) parts[1] = 0
                if (!parts[2]) parts[2] = 0
                space = 'rgb'
            }
            //color space
            else if (m = /^((?:rgb|hs[lvb]|hwb|cmyk?|xy[zy]|gray|lab|lchu?v?|[ly]uv|lms)a?)\s*\(([^\)]*)\)/.exec(cstr)) {
                var name = m[1]
                var isRGB = name === 'rgb'
                var base = name.replace(/a$/, '')
                space = base
                var size = base === 'cmyk' ? 4 : base === 'gray' ? 1 : 3
                parts = m[2].trim()
                    .split(/\s*[,\/]\s*|\s+/)
                    .map(function (x, i) {
                        //<percentage>
                        if (/%$/.test(x)) {
                            //alpha
                            if (i === size) return parseFloat(x) / 100
                            //rgb
                            if (base === 'rgb') return parseFloat(x) * 255 / 100
                            return parseFloat(x)
                        }
                        //hue
                        else if (base[i] === 'h') {
                            //<deg>
                            if (/deg$/.test(x)) {
                                return parseFloat(x)
                            }
                            //<base-hue>
                            else if (baseHues[x] !== undefined) {
                                return baseHues[x]
                            }
                        }
                        return parseFloat(x)
                    })
                if (name === base) parts.push(1)
                alpha = (isRGB) ? 1 : (parts[size] === undefined) ? 1 : parts[size]
                parts = parts.slice(0, size)
            }
            //named channels case
            else if (cstr.length > 10 && /[0-9](?:\s|\/)/.test(cstr)) {
                parts = cstr.match(/([0-9]+)/g).map(function (value) {
                    return parseFloat(value)
                })
                space = cstr.match(/([a-z])/ig).join('').toLowerCase()
            }
        }
        //numeric case
        else if (!isNaN(cstr)) {
            space = 'rgb'
            parts = [cstr >>> 16, (cstr & 0x00ff00) >>> 8, cstr & 0x0000ff]
        }
        //array-like
        else if (Array.isArray(cstr) || cstr.length) {
            parts = [cstr[0], cstr[1], cstr[2]]
            space = 'rgb'
            alpha = cstr.length === 4 ? cstr[3] : 1
        }
        //object case - detects css cases of rgb and hsl
        else if (cstr instanceof Object) {
            if (cstr.r != null || cstr.red != null || cstr.R != null) {
                space = 'rgb'
                parts = [
                    cstr.r || cstr.red || cstr.R || 0,
                    cstr.g || cstr.green || cstr.G || 0,
                    cstr.b || cstr.blue || cstr.B || 0
                ]
            }
            else {
                space = 'hsl'
                parts = [
                    cstr.h || cstr.hue || cstr.H || 0,
                    cstr.s || cstr.saturation || cstr.S || 0,
                    cstr.l || cstr.lightness || cstr.L || cstr.b || cstr.brightness
                ]
            }
            alpha = cstr.a || cstr.alpha || cstr.opacity || 1
            if (cstr.opacity != null) alpha /= 100
        };
        return [parts[0], parts[1], parts[2], alpha, space]
    };
};


function DashColorSet(background, background_hover, background_selected, background_selected_hover, text){
    this.background = background;
    this.background_hover = background_hover;
    this.background_selected = background_selected;
    this.background_selected_hover = background_selected_hover;
    this.text = text;
    this.Background = this.background;
    this.BackgroundHover = this.background_hover;
    this.BackgroundSelected = this.background_selected;
    this.BackgroundSelectedHover = this.background_selected_hover;
    this.Text = this.text;
    // this.ButtonBackground = "red";
    // this.ButtonText = "white";
    // COLOR INTERFACE - PAGE / ELEMENT
    //
    // d.Color.Light
    // d.Color.Dark
    // d.Color.WarningLight
    // d.Color.WarningDark
    // d.Color.ErrorLight
    // d.Color.ErrorDark
    // d.Color.AccentLight
    // d.Color.AccentDark
    //
    //           ▽ - Color of the page/element background
    //           |
    // d.Color.Light.Background.Main
    // d.Color.Light.Background.Hover
    // d.Color.Light.Background.Selected
    // d.Color.Light.Background.SelectedHover
    //
    // COLOR INTERFACE - BUTTON
    //
    //           ▽ - Color of the page/element background
    //           |
    // d.Color.Dark.Button.Background.Main
    // d.Color.Dark.Button.Background.Hover
    // d.Color.Dark.Button.Background.Selected
    // d.Color.Dark.Button.Background.SelectedHover
    //
};


function DashSize(){
    this.Padding = 10;
    this.Stroke = 3;
    this.RowHeight = 20;
    this.ButtonHeight = this.RowHeight + (this.Padding);
    this.ColumnWidth = 150;
    this.BorderRadius = 3;
};


function DashView(){
    this.User = DashUserView;
    this.Style = DashStyleView;
    this.SiteSettings = DashSiteSettingsView;
};


function DashLocal(){
    this.Set = function(key, value){
        if (key.indexOf(d.Context["asset_path"] + "_") != 0) {
            key = d.Context["asset_path"] + "_" + key;
        };
        //console.log("Setting " + key + " to '" + value + "'");
        return localStorage.setItem(key, value);
    };
    this.Get = function(key){
        if (key.indexOf(d.Context["asset_path"] + "_") != 0) {
            key = d.Context["asset_path"] + "_" + key;
        };
        //console.log("Getting " + key + " <<- " + localStorage.getItem(key));
        return localStorage.getItem(key);
    };
};


function DashRequest(){
    this.requests = [];
    this.Request = function(binder, callback, endpoint, params){
        var url = "https://" + d.Context["domain"] + "/" + endpoint;
        this.requests.push(new DashRequestThread(this, url, params, binder, callback));
    };
    function DashRequestThread(dash_requests, url, params, binder, callback){
        this.dash_requests = dash_requests;
        this.url = url;
        this.params = params || {};
        this.params["token"] = d.Local.Get("token");
        this.id = parseInt(Math.random() * (999999 - 100000) + 100000);
        this.callback = callback;
        this.binder = binder;
        this.post = function(){
            (function(self){
                $.post(self.url, self.params, function(response_str) {
                    self.dash_requests.on_response(self, $.parseJSON(response_str));
                });
            })(this);
        };
        this.post();
    };
    this.on_no_further_requests_pending = function(){
        // Called when a request finishes, and there are no more requests queued
        //console.log(">> on_no_further_requests_pending <<");
    };
    this.on_response = function(request, response){
        callback = request.callback.bind(request.binder);
        var requests = [];
        for (var i in this.requests) {
            if (this.requests[i] == request) {continue};
            requests.push(this.requests[i]);
        };
        this.requests = requests;
        if (this.requests.length == 0) {
            this.on_no_further_requests_pending();
        };
        callback(response);
    };
};


function DashAdminView(){
    this.layout = new Dash.Gui.Layout.SideTabs(this);
    this.html = this.layout.html;
    this.tmp_style = $("<div>Styles</div>");
    this.tmp_size = $("<div>Sizes</div>");
    this.setup_styles = function(){
        // this.html.css({
        //     "position": "absolute",
        //     "left": 0,
        //     "top": 0,
        //     "right": 0,
        //     "bottom": 0,
        //     "background": d.Color.Background,
        // });
        this.layout.Append("Style", this.tmp_style);
        this.layout.Append("Size", this.tmp_size);
    };
    this.setup_styles();
};

// Profile page layout for the currently logged in user
function DashUserView(){
    this.html = Dash.Gui.GetHTMLContext("", {"margin": d.Size.Padding});
    this.html.append(new Dash.Gui.Layout.UserProfile().html);
};
// Profile page layout for the currently logged in user
function DashStyleView(){
    this.html = Dash.Gui.GetHTMLContext("", {"margin": d.Size.Padding});
    this.html.append(new Dash.Gui.Layout.UserProfile().html);
    console.log("in");
};

function DashSiteSettingsView(){
    this.html = Dash.Gui.GetHTMLContext("", {"margin": d.Size.Padding});
    this.property_box = null;
    this.setup_styles = function(){
        this.add_site_settings_box();
        this.add_user_groups_box();
    };
    this.add_site_settings_box = function(){
        this.property_box = new Dash.Gui.PropertyBox(
            this,           // For binding
            null,  // Function to return live data
            null,  // Function to set saved data locally
            "Properties",   // Endpoint
            "site_settings" // Dash object ID
        );
        this.html.append(this.property_box.html);
        this.property_box.AddHeader("Site Settings");
        this.property_box.AddInput("created_by", "Created By", "", null, false);
        this.property_box.AddInput("open_account_creation_bool", "Open Account Creation", "", null, true);
        this.property_box.Load();
    };
    this.add_user_groups_box = function(){
        this.user_groups_box = new Dash.Gui.PropertyBox(
            this,           // For binding
            null,           // Function to return live data
            null,           // Function to set saved data locally
            "Properties",   // Endpoint
            "user_groups"    // Dash object ID
        );
        this.html.append(this.user_groups_box.html);
        this.user_groups_box.AddHeader("User Groups");
        this.user_groups_box.AddInput("admin", "Admin", "", null, false);
        this.user_groups_box.AddButton("Create Group", this.create_group);
        this.user_groups_box.Load();
    };
    this.create_group = function(){
        console.log("Create Group");
    };
    this.setup_styles();
};


function DashGui(){
    this.Layout = new DashGuiLayout();
    this.Login = DashGuiLogin;
    this.Button = DashGuiButton;
    this.Input = DashGuiInput;
    this.PropertyBox = DashGuiPropertyBox;
    this.LoadDots = DashGuiLoadDots;
    this.InputRow = DashGuiInputRow;
    this.Header = DashGuiHeader;
    this.GetHTMLContext = function(optional_label_text, optional_style_css){
        optional_label_text = optional_label_text || "";
        optional_style_css = optional_style_css || {};
        var html = $("<div>" + optional_label_text + "</div>");
        var css = {
            "color": Dash.Color.Text,
            "font-family": "sans_serif_normal",
        };
        for (var key in optional_style_css) {
            css[key] = optional_style_css[key];
        };
        html.css(css);
        return html;
    };
    this.GetHTMLAbsContext = function(optional_label_text){
        optional_label_text = optional_label_text || "";
        var html = $("<div>" + optional_label_text + "</div>");
        html.css({
            "position": "absolute",
            "left": 0,
            "top": 0,
            "right": 0,
            "bottom": 0,
            "overflow-y": "auto",
            "color": "black",
        });
        return html;
    };
    this.GetHTMLBoxContext = function(optional_style_css){
        // optional_label_text = optional_label_text || "";
        optional_style_css = optional_style_css || {};
        var html = $("<div></div>");
        var css = {
            "padding": Dash.Size.Padding,
            "margin-bottom": Dash.Size.Padding,
            "background": "rgba(255, 255, 255, 0.3)",
            "color": "black",
            "border-radius": Dash.Size.Padding*0.5,
            "box-shadow": "0px 0px 10px 1px rgba(0, 0, 0, 0.2)"
        };
        for (var key in optional_style_css) {
            css[key] = optional_style_css[key];
        };
        html.css(css);
        return html;
    };
    this.GetTipBox = function(code, msg, optional_style_css){
        // A full width box that is meant to display information
        var tip = Dash.Gui.GetHTMLBoxContext(optional_style_css);
        var code_html = Dash.Gui.GetHTMLContext(code);
        var msg_html = Dash.Gui.GetHTMLContext(msg);
        code_html.css({
            "font-family": "sans_serif_bold",
        });
        tip.append(code_html);
        tip.append(msg_html);
        return tip;
    };
    this.GetErrorBox = function(code, msg){
        // A full width box that is meant to display an error
        var css = {};
        css["background"] = "orange";
        var tip = Dash.Gui.GetHTMLBoxContext(css);
        var code_html = Dash.Gui.GetHTMLContext(code);
        var msg_html = Dash.Gui.GetHTMLContext(msg);
        code_html.css({
            "font-family": "sans_serif_bold",
        });
        tip.append(code_html);
        tip.append(msg_html);
        return tip;
    };
};


function DashGuiLogin(on_login_binder, on_login_callback){
    this.html = $("<div></div>");
    this.login_box = $("<div></div>");
    this.header_label = $("<div>" + d.Context["display_name"] + "</div>");
    this.email_row = $("<div></div>");
    this.password_row = $("<div></div>");
    this.button_bar = $("<div></div>");
    this.on_login_callback = null;
    if (on_login_binder && on_login_callback){
        this.on_login_callback = on_login_callback.bind(on_login_binder);
    };
    this.setup_styles = function(){
        this.login_button   = new d.Gui.Button("Login", this.Login, this);
        this.reset_button   = new d.Gui.Button("Create / Reset Login", this.ResetLogin, this);
        this.email_input    = new d.Gui.Input("email@" + d.Context["domain"]);
        this.password_input = new d.Gui.Input("Password");
        this.email_input.html.css({
            "padding": Dash.Size.Padding*0.5,
        });
        this.password_input.html.css({
            "padding": Dash.Size.Padding*0.5,
        });
        this.email_input.OnSubmit(this.Submit, this);
        this.password_input.OnSubmit(this.Submit, this);
        this.email_input.OnChange(this.store_input, this);
        this.password_input.OnChange(this.store_input, this);
        this.email_row.append(this.email_input.html);
        this.password_row.append(this.password_input.html);
        this.html.append(this.login_box);
        this.login_box.append(this.header_label);
        this.login_box.append(this.email_row);
        this.login_box.append(this.password_row);
        this.login_box.append(this.button_bar);
        this.button_bar.append(this.reset_button.html);
        this.button_bar.append(this.login_button.html);
        var login_box_width = window.outerWidth*0.5;
        if (!d.IsMobile && login_box_width > 350) {
            login_box_width = 350;
        };
        var login_box_height = (d.Size.RowHeight*4)+(d.Size.Padding*3);
        this.html.css({
            // "position": "fixed",
            "left": 0,
            "top": 0,
            "right": 0,
            "bottom": 0,
            // "background": d.Color.Background,
            "text-align": "center",
        });
        this.login_box.css({
            "width": login_box_width,
            // "height": login_box_height*2,
            "height": "auto",
            "margin-left": "auto",
            "margin-right": "auto",
            "margin-top": d.Size.Padding*2,
            "padding-bottom": d.Size.Padding*2,
            "background": d.Color.Dark,
            // "background": "rgba(0, 0, 0, 0.1)",
            "border-radius": 4,
            "box-shadow": "0px 0px 20px 1px rgba(0, 0, 0, 0.2)",
            "opacity": 0,
        });
        this.header_label.css({
            "text-align": "center",
            "font-family": "sans_serif_bold",
            "height": d.Size.RowHeight,
            "line-height": d.Size.RowHeight + "px",
            "padding": d.Size.Padding,
        });
        this.button_bar.css({
            "display": "flex",
            "height": d.Size.RowHeight,
        });
        this.email_row.css({
            "margin": d.Size.Padding,
            "margin-top": 0,
        });
        this.password_row.css({
            "margin": d.Size.Padding,
            "margin-top": 0,
        });
        this.login_button.html.css({
            "margin-left": d.Size.Padding,
            // "margin-top": 0,
            // "padding": d.Size.Padding*0.5,
            "width": (login_box_width*0.5)-Dash.Size.Padding*1.5,
            // "background": d.Color.Primary,
        });
        this.reset_button.html.css({
            // "margin": d.Size.Padding,
            "margin-left": d.Size.Padding,
            // "margin-right": 0,
            // "padding": d.Size.Padding*0.5,
            "width": (login_box_width*0.5)-Dash.Size.Padding*1.5,
        });
        this.email_input.SetText(d.Local.Get("email") || "");
        this.show_login_box();
    };
    this.show_login_box = function(){
        this.login_box.css({"opacity": 1});
    };
    this.store_input = function(){
        d.Local.Set("email", this.email_input.Text());
    };
    this.Submit = function(){
        var email = this.email_input.Text();
        var pass = this.password_input.Text();
        if (email && pass) {
            this.Login();
        }
        else {
            this.ResetLogin();
        };
    };
    this.Login = function(){
        var email = this.email_input.Text();
        var pass = this.password_input.Text();
        if (!pass) {
            alert("Please enter a valid password");
            return;
        };
        var api = "https://" + d.Context["domain"] + "/Users";
        var server_data = {};
        server_data["f"] = "login";
        server_data["email"] = email;
        server_data["pass"] = pass;
        this.login_button.Request(api, server_data, this.on_login_response, this);
    };
    this.ResetLogin = function(){
        var email = this.email_input.Text();
        var api = "https://" + d.Context["domain"] + "/Users";
        var server_data = {};
        server_data["f"] = "reset";
        server_data["email"] = email;
        this.reset_button.Request(api, server_data, this.on_reset_response, this);
    };
    this.on_reset_response = function(response){
        if (response["error"]) {
            alert(response["error"]);
            return;
        };
        if (response["success"]) {
            alert("Your password link has been sent to " + response["email"] + ". Click that link to receive a new temporary password and log in");
        };
    };
    this.on_login_response = function(response){
        if (response["error"]) {
            alert(response["error"]);
            return;
        };
        console.log("******* LOG IN *******");
        console.log(response);
        d.User.SetUserAuthentication(this.email_input.Text(), response);
        (function(self){
            self.html.animate({"opacity": 0}, 150, function(){
                self.html.remove();
                self.on_login_callback();
            });
        })(this);
    };
    this.setup_styles();
};


function DashGuiButton(Label, Callback, Bind){
    this.label = Label;
    this.callback = Callback;
    this.bind = Bind;
    this.html = $("<div></div>");
    this.highlight = $("<div></div>");
    this.click_highlight = $("<div></div>");
    this.load_bar = $("<div></div>");
    this.label = $("<div>" + this.label + "</div>");
    this.load_dots = null;
    this.right_label = null;
    this.label_shown = null;
    this.last_right_label_text = null;
    this.is_selected = false;
    this.setup_styles = function(){
        this.html.append(this.highlight);
        this.html.append(this.load_bar);
        this.html.append(this.click_highlight);
        this.html.append(this.label);
        this.html.css({
            "background": d.Color.Button.Background,
            "cursor": "pointer",
            "height": d.Size.ButtonHeight,
            "border-radius": d.Size.BorderRadius,
            "padding-left": d.Size.Padding,
            "padding-right": d.Size.Padding,
            "padding": 0,
            "margin": 0,
        });
        this.highlight.css({
            "position": "absolute",
            "left": 0,
            "top": 0,
            "right": 0,
            "bottom": 0,
            "background": d.Color.Button.BackgroundHover,
            "opacity": 0,
            "border-radius": d.Size.BorderRadius,
        });
        this.load_bar.css({
            "position": "absolute",
            "left": 0,
            "top": 0,
            "bottom": 0,
            "width": 0,
            "background": d.Color.Primary,
            "border-radius": d.Size.BorderRadius,
        });
        this.click_highlight.css({
            "position": "absolute",
            "left": 0,
            "top": 0,
            "right": 0,
            "bottom": 0,
            "background": "rgba(255, 255, 255, 0.5)",
            "opacity": 0,
            "border-radius": d.Size.BorderRadius,
        });
        this.label.css({
            "position": "absolute",
            "left": d.Size.Padding,
            "top": 0,
            "right": d.Size.Padding,
            "bottom": 0,
            "line-height": (d.Size.ButtonHeight) + "px",
            "white-space": "nowrap",
            "overflow": "hidden",
            "text-overflow": "ellipsis",
            "text-align": "center",
            "color": d.Color.Button.Text,
        });
    };
    // this.SetTextAlign = function(text_alignment){
    //     this.label.css({
    //         "text-align": text_alignment,
    //     });
    // };
    this.SetBorderRadius = function(border_radius){
        this.html.css({
            "border-radius": border_radius,
        });
        this.highlight.css({
            "border-radius": border_radius,
        });
        this.load_bar.css({
            "border-radius": border_radius,
        });
        this.click_highlight.css({
            "border-radius": border_radius,
        });
    };
    this.SetTextAlign = function(text_alignment){
        this.label.css({
            "text-align": text_alignment,
        });
    };
    this.SetFontSize = function(font_size){
        this.label.css({
            "font-size": font_size,
        });
    };
    this.SetSelected = function(is_selected){
        if (is_selected == this.is_selected) {
            return;
        };
        this.is_selected = is_selected;
        if (this.is_selected) {
            this.html.css({"background": d.Color.Button.BackgroundSelected});
            this.highlight.css({"background": d.Color.Button.BackgroundSelectedHover});
        }
        else {
            this.html.css({"background": d.Color.Button.Background});
            this.highlight.css({"background": d.Color.Button.BackgroundHover});
        };
    };
    this.SetButtonVisibility = function(button_visible){
        if (button_visible) {
            this.html.css({"opacity": 1, "pointer-events": "auto"});
        }
        else {
            this.html.css({"opacity": 0, "pointer-events": "none"});
        };
    };
    this.SetLoadBar = function(t){
        this.load_bar.css({"width": this.html.width()*t});
    };
    this.IsLoading = function(){
        if (this.load_dots) {
            return true;
        }
        else {
            return false;
        };
    };
    this.SetLoading = function(is_loading){
        if (is_loading && this.load_dots) {
            return;
        };
        if (!is_loading && !this.load_dots) {
            return;
        };
        if (!is_loading && this.load_dots) {
            this.load_dots.Stop();
            this.load_dots = null;
            return;
        };
        this.load_dots = new d.Gui.LoadDots(this.html.outerHeight()-d.Size.Padding);
        this.load_dots.SetOrientation("vertical");
        this.html.append(this.load_dots.html);
        var height = this.html.css("height");
        var padding = this.html.css("padding");
        this.load_dots.html.css({
            "position": "absolute",
            "top": d.Size.Padding*0.5,
            "bottom": 0,
            "right": 0,
        });
        this.load_dots.Start();
    };
    this.SetFileUploader = function(api, params, optional_on_start_callback){
        this.file_upload_type = "file";
        this.file_upload_api = api;
        this.file_upload_params = params;
        if (this.file_uploader) {
            this.file_uploader.html.remove();
        };
        if (optional_on_start_callback) {
            this.on_file_upload_start_callback = optional_on_start_callback.bind(this.bind);
        }
        else {
            this.on_file_upload_start_callback = null;
        };
        this.file_uploader = null;
        (function(self){
            self.file_uploader = new GuiButtonFileUploader(self, api, params, function(response){
                self.on_file_upload_response(response);
            }, function(){
                if (self.on_file_upload_start_callback) {
                    self.on_file_upload_start_callback();
                };
            });
        })(this);
        this.html.append(this.file_uploader.html);
    };
    this.on_file_upload_response = function(response){
        if (this.file_uploader.html) {
            this.file_uploader.html.remove();
        };
        if (this.file_upload_api) {
            this.SetFileUploader(this.file_upload_api, this.file_upload_params);
        };
        if (this.callback && this.bind) {
            this.callback.bind(this.bind)(response);
        };
    };
    this.Request = function(api, server_data, on_complete_callback, bind_to){
        if (this.load_dots) {
            return;
        };
        this.on_request_response_callback = null;
        var binder = bind_to || this.bind;
        if (binder && on_complete_callback) {
            this.on_request_response_callback = on_complete_callback.bind(binder)
        };
        this.SetLoading(true);
        server_data = server_data || {};
        server_data["token"] = d.Local.Get("token");
        (function(self){
            $.post(api, server_data, function(response) {
                self.SetLoading(false);
                var response_json = $.parseJSON(response);
                if (self.on_request_response_callback) {
                    self.on_request_response_callback(response_json);
                };
            });
        })(this);
    };
    this.on_click = function(event){
        if (this.callback && this.bind) {
            this.callback.bind(this.bind)(event, this);
        };
    };
    this.setup_connections = function(){
        (function(self){
            self.html.mouseenter(function(){
                self.highlight.stop().animate({"opacity": 1}, 50);
            });
            self.html.mouseleave(function(){
                self.highlight.stop().animate({"opacity": 0}, 100);
            });
            self.html.click(function(event){
                self.highlight.stop().animate({"opacity": 0}, 50);
                self.click_highlight.stop().css({"opacity": 1});
                self.click_highlight.stop().animate({"opacity": 0}, 150);
                self.on_click(event);
            });
        })(this);
    };
    this.SetRightLabelText = function(label_text){
        if (!this.right_label) {
            this.setup_right_label();
        };
        if (label_text == this.last_right_label_text && this.label_shown) {
            return;
        };
        if (this.label_shown) {
            // Was visible
            (function(self){
                self.right_label.animate({"opacity": 0}, 200, function(){
                    self.set_right_label_text(label_text);
                    self.right_label.animate({"opacity": 1}, 600);
                });
            })(this);
        }
        else {
            // Was never visible
            this.set_right_label_text(label_text);
            this.right_label.animate({"opacity": 1}, 200, function(){
            });
        }
        this.label_shown = true;
    };
    this.set_right_label_text = function(label_text) {
        // Called when the icon is not visible
        if (!label_text && label_text != 0 || label_text == this.last_right_label_text) {
            return;
        };
        this.right_label.text(label_text);
        this.last_right_label_text = label_text;
    };
    this.setup_right_label = function(){
        this.right_label = $("<div>--</div>");
        this.html.append(this.right_label);
        var size = Math.round(d.Size.RowHeight-d.Size.Padding);
        this.right_label.css({
            "position": "absolute",
            "right": d.Size.Padding*0.5,
            "top": d.Size.Padding*0.5,
            "width": size,
            "height": size,
            "line-height": size + "px",
            "background": d.Color.Dark,
            "border-radius": 4,
            "font-size": (size*0.5) + "px",
            "text-align": "center",
            "opacity": 0,
        });
    };
    this.setup_styles();
    this.setup_connections();
};


function DashGuiInput(placeholder_text){
    this.placeholder = placeholder_text;
    this.column_width = window.ColumnWidth || (d.Size.RowHeight*5);
    this.html = $("<div></div>");
    if (this.placeholder.toLowerCase().includes("password")) {
        this.input = $("<input type=password placeholder='" + this.placeholder + "'>");
    }
    else {
        this.input = $("<input placeholder='" + this.placeholder + "'>");
    };
    this.setup_styles = function(){
        this.html.append(this.input);
        this.html.css({
            "height": d.Size.RowHeight,
            "background": "rgba(255, 255, 255, 0.7)",
            "border-radius": 2,
            "padding-right": d.Size.Padding,
            "box-shadow": "0px 0px 20px 1px rgba(0, 0, 0, 0.2)",
            "padding": 0,
            "margin": 0,
        });
        this.input.css({
            "background": "rgba(0, 0, 0, 0)",
            "line-height": d.Size.RowHeight + "px",
            "width": "100%",
            "height": "100%",
            "padding-left": d.Size.Padding,
            "color": "rgba(0, 0, 0, 0.9)",
        });
    };
    // this.SetHeight = function(height, optional_font_size){
    //     this.row_height = height;
    //     var font_size = optional_font_size || "100%";
    //     this.html.css({
    //         "height": this.row_height,
    //         "font-size": font_size,
    //     });
    //     this.input.css({
    //         "line-height": this.row_height + "px",
    //         "font-size": font_size,
    //     });
    // };
    this.SetLocked = function(is_locked){
        if (is_locked) {
            this.input.css({"pointer-events": "none"});
            this.html.css({"background": "rgba(255, 255, 255, 0.1)"});
        }
        else {
            this.input.css({"pointer-events": "auto"});
            this.html.css({"background": "rgba(255, 255, 255, 0.7)"});
        };
    };
    this.SetDarkMode = function(dark_mode_on){
        if (dark_mode_on) {
            this.html.css({
                "box-shadow": "none",
                "background": "rgba(0, 0, 0, 0)",
            });
            this.input.css({
                "color": "rgba(255, 255, 255, 0.9)",
            });
        };
    };
    this.SetTransparent = function(is_transparent){
        if (is_transparent) {
            this.html.css({
                "box-shadow": "none",
                "background": "rgba(0, 0, 0, 0)",
            });
        };
        return this;
    };
    this.Text = function(){
        return this.input.val();
    };
    this.SetText = function(text){
        this.last_val = text;
        return this.input.val(text);
    };
    this.OnChange = function(callback, bind_to){
        this.on_change_callback = callback.bind(bind_to);
    };
    this.OnSubmit = function(callback, bind_to){
        this.on_submit_callback = callback.bind(bind_to);
    };
    this.on_change = function(){
        // Fired if the box is clicked on or the user is typing
        var changed = this.input.val() != this.last_val;
        this.last_val = this.input.val();
        if (changed && this.on_change_callback) {
            this.on_change_callback();
        };
    };
    this.on_submit = function(){
        // Fired on 'enter' or 'paste'
        if (this.on_submit_callback) {
            this.on_submit_callback();
        };
    };
    this.setup_connections = function(){
        (function(self){
            self.input.on('keypress',function(e) {
                if (e.which == 13) {
                    self.on_submit();
                };
            });
            self.input.change(function(){
                self.on_change();
            });
            self.input.on("paste", function(){
                self.on_change();
            });
            self.input.on("keyup click", function(){
                self.on_change();
            });
        })(this);
    };
    this.setup_styles();
    this.setup_connections();
};


function DashGuiLoadDots(size){
    this.size = size;
    this.html = $("<div></div>");
    this.layout = "horizontal";
    this.num_dots = 3;
    this.dots = [];
    this.iteration = 0;
    this.t = 0;
    this.cycle_duration = 1000;
    this.is_active = false;
    this.show_t = 0;
    this.IsActive = function(){
        return this.is_active;
    };
    this.Start = function(){
        if (this.is_active) {return;}
        this.is_active = true;
        this.activation_t = this.t;
        this.show_t = 0;
        for (var x in this.dots) {
            this.dots[x].Start();
        };
    };
    this.Stop = function(){
        if (!this.is_active) {return;}
        this.is_active = false;
        for (var x in this.dots) {
            this.dots[x].Stop();
        };
    };
    this.SetOrientation = function(horizontal_or_vertical){
        this.layout = horizontal_or_vertical;
        for (var x in this.dots) {
            this.dots[x].SetOrientation();
        };
    };
    this.SetColor = function(color){
        for (var x in this.dots) {
            this.dots[x].SetColor(color);
        };
    };
    this.setup_styles = function(){
        var i = 0;
        for (i = 0; i < this.num_dots; i++) {
            this.dots.push(new LoadDot(this));
        };
        this.html.css({
            "width": this.size,
            "height": this.size,
        });
    };
    this.update = function(t){
        (function(self){requestAnimationFrame(function(t){self.update(t);});})(this);
        if (this.t >= 1) {
            this.iteration += 1;
        };
        this.t = this.inverse_lerp(0, this.cycle_duration, t-(this.iteration*this.cycle_duration));
        if (this.t > 1) {this.t = 1};
        if (!this.is_active) {
            return;
        };
        this.show_t += 0.05;
        if (this.show_t > 1) {
            this.show_t = 1;
        };
        for (var x in this.dots) {
            this.dots[x].Update(this.t);
        };
    };
    this.inverse_lerp = function(min, max, val){
        return (val - min) / (max - min);
    };
    this.lerp = function(a, b, t){
        return a + Math.min(Math.max(t, 0), 1) * (b - a);
    };
    this.setup_styles();
    this.update(0);
};
function LoadDot(dots){
    this.dots = dots;
    this.html = $("<div></div>");
    this.index = this.dots.dots.length;
    this.hold_t = 0.25;
    this.Update = function(cycle_t){
        var t = 0;
        var cycle_offset = this.dots.lerp(0, 0.5, 1-this.dots.inverse_lerp(0, this.dots.dots.length, this.index));
        cycle_t += cycle_offset;
        if (cycle_t > 1) {cycle_t = cycle_t-1;};
        if (cycle_t < this.hold_t) {
            t = this.dots.inverse_lerp(0, this.hold_t, cycle_t);
        }
        else if (cycle_t > 1-this.hold_t) {
            t = 1-this.dots.inverse_lerp(1-this.hold_t, 1, cycle_t);
        }
        else {
            t = 1;
        }
        t = t*this.dots.show_t;
        this.html.css({
            "opacity": t
        });
    };
    this.Start = function(cycle_t){
        this.html.stop().css({
            "left": (this.dots.size*0.5)-(this.size*0.5),
            "top": (this.dots.size*0.5)-(this.size*0.5),
        });
        this.html.animate({
            "left": this.left,
            "top": this.top,
        }, 300);
    };
    this.Stop = function(cycle_t){
        this.html.stop().animate({
            "left": (this.dots.size*0.5)-(this.size*0.5),
            "top": (this.dots.size*0.5)-(this.size*0.5),
            "opacity": 0,
        }, 300);
    };
    this.SetOrientation = function(){
        this.size = this.dots.size/(this.dots.num_dots+1.5);
        this.padding = (this.dots.size-((this.size*this.dots.num_dots)))/((this.dots.num_dots-1)+1);
        this.left = (this.padding*0.5) + (this.index*this.size) + (this.index*this.padding);
        this.top = (this.dots.size*0.5)-(this.size*0.5);
        if (this.dots.layout != "horizontal") {
            this.left = (this.dots.size*0.5)-(this.size*0.5);
            this.top = (this.padding*0.5) + (this.index*this.size) + (this.index*this.padding);
        };
    };
    this.SetColor = function(color){
        this.html.css({
            "background": color,
        });
    };
    this.setup_styles = function(){
        this.SetOrientation();
        this.html.css({
            "position": "absolute",
            "left": this.left,
            "top": this.top,
            "background": "rgba(255, 255, 255, 0.9)",
            "width": this.size,
            "height": this.size,
            "border-radius": this.size*0.5,
            "opacity": 0,
        });
        this.dots.html.append(this.html);
    };
    this.setup_styles();
};


function DashGuiInputRow(label_text, initial_value, placeholder_text, button_text, on_click, on_click_bind){

    this.label_text = label_text;
    this.initial_value = initial_value;
    this.placeholder_text = placeholder_text;
    this.button_text = button_text;
    this.on_click = on_click;
    this.on_click_bind = on_click_bind;
    // this.height = d.Size.RowHeight-d.Size.Padding;
    this.html = $("<div></div>");
    this.flash_save = $("<div></div>");
    this.highlight = $("<div></div>");
    this.save_button_visible = false;
    this.autosave_timeout = null;
    this.setup_styles = function(){
        this.html.append(this.highlight);
        this.html.append(this.flash_save);
        this.label = $("<div>" + this.label_text + ": </div>");
        this.input = new d.Gui.Input(this.placeholder_text);
        this.input.SetTransparent(true);
        this.input.SetText(this.initial_value);
        this.input.input.css({"padding-left": d.Size.Padding*0.5});
        this.input.OnChange(this.input_changed, this);
        this.html.append(this.label);
        this.html.append(this.input.html);
        var highlight_color = d.Color.Primary;
        if (this.on_click) {
            this.input.OnSubmit(this.on_submit, this);
            this.create_save_button();
        }
        else {
            this.input.SetLocked(true);
            highlight_color = "orange";
        };
        this.html.css({
            "cursor": "pointer",
            "height": Dash.Size.RowHeight,
            "display": "flex",
            "border-bottom": "1px dotted rgba(0, 0, 0, 0.2)",
        });
        this.highlight.css({
            "position": "absolute",
            "left": -d.Size.Padding,
            "right": 0,
            "top": 0,
            "bottom": 0,
            "background": highlight_color,
            "opacity": 0,
        });
        this.flash_save.css({
            "position": "absolute",
            "left": -d.Size.Padding,
            "right": 0,
            "top": 0,
            "bottom": 0,
            "background": d.Color.SaveHighlight,
            "opacity": 0,
        });
        this.input.html.css({
            "flex-grow": 2,
        });
        this.label.css({
            "height": Dash.Size.RowHeight,
            "line-height": (Dash.Size.RowHeight) + "px",
            "text-align": "left",
            "color": "rgba(0, 0, 0, 0.8)",
            "font-family": "sans_serif_bold",
            "font-size": "80%",
        });
        // if (this.button) {
        //     this.button.html.css({
        //         "position": "absolute",
        //         "right": 0,
        //         "top": 0,
        //         "margin": 0,
        //         "width": d.Size.ColumnWidth*0.33,
        //         "opacity": 0,
        //     });
        // };
        if (Array.isArray(this.button_text)) {
            this.SetupCombo(this.button_text);
        };
        this.setup_connections();
    };
    this.create_save_button = function(){
        this.button = new d.Gui.Button(this.button_text, this.on_submit, this);
        this.html.append(this.button.html);
        this.button.html.css({
            "position": "absolute",
            "right": 0,
            "top": 0,
            "margin": 0,
            "height": Dash.Size.RowHeight,
            "width": d.Size.ColumnWidth,
            "background": "none",
            "opacity": 0,
        });
        // console.log(Dash.Color.Text);
        this.button.highlight.css({
            "background": "none",
        });

        this.button.label.css({
            "text-align": "right",
            "line-height": Dash.Size.RowHeight + "px",
            // "color": Dash.Color.Dark.Text,
            "color": "rgba(0, 0, 0, 0.9)",
            // "position": "absolute",
            // "right": 0,
            // "top": 0,
            // "margin": 0,
            // "width": 200,
            // "width": d.Size.ColumnWidth,
            // "opacity": 0,
        });
    };
    this.FlashSave = function(){
        (function(self){
            self.flash_save.stop().animate({"opacity": 1}, 100, function(){
                self.flash_save.stop().animate({"opacity": 0}, 1000);
            });
        })(this);
    };
    this.SetupCombo = function(combo_options){
        this.initial_value = this.initial_value || combo_options[0]["id"];
        this.input.html.css({
            "opacity": 0,
            "user-select": "none",
            "pointer-events": "none",
            "position": "absolute",
            "left": 0,
            "top": 0,
        });
        var options = {};
        options["list"] = combo_options;
        options["selected"] = ComboUtils.GetDataFromID(combo_options, this.initial_value);
        options["thin_style"] = true;
        options["text_alignment"] = "left";
        options["label_style"] = "light";
        options["label_transparent"] = true;
        this.combo = new Combo(this, "", options, this.on_combo_changed, this);
        this.html.append(this.combo.html);
    };
    this.on_combo_changed = function(option){
        if (!this.combo) {return};
        this.input.SetText(option["id"]);
        if (this.on_click) {
            this.on_submit();
        };
    };
    this.setup_connections = function(){
        (function(self){
            self.html.mouseenter(function(){
                self.highlight.stop().animate({"opacity": 0.3}, 50);
            });
            self.html.mouseleave(function(){
                self.highlight.stop().animate({"opacity": 0}, 250);
            });
        })(this);
    };
    this.SetAutosave = function(use_autosave){
        this.autosave = use_autosave;
        return this;
    };
    this.input_changed = function(ignore_save_button_show){
        if (!this.button) {return;}
        if (ignore_save_button_show) {return;}
        if (this.autosave) {
            if (this.autosave_timeout) {
                clearTimeout(this.autosave_timeout);
                this.autosave_timeout = null;
            };
            (function(self){
                self.autosave_timeout = setTimeout(function(){self.trigger_autosave()}, 500);
            })(this);
        }
        else {
            this.show_save_button();
        };
    };
    this.trigger_autosave = function(){
        if (!this.load_dots) {
            this.setup_load_dots();
        };
        if (this.load_dots.IsActive()) {
            this.input_changed();
            return;
        };
        this.on_submit();
    };
    this.setup_load_dots = function(){
        if (this.load_dots) {return;}
        this.load_dots = new LoadDots(this.height-d.Size.Padding);
        this.load_dots.SetOrientation("vertical");
        this.load_dots.SetColor("rgba(0, 0, 0, 0.8)");
        this.html.append(this.load_dots.html);
        this.load_dots.html.css({
            "position": "absolute",
            "left": -d.Size.Padding,
            "top": d.Size.Padding*0.5,
        });
    };
    this.show_save_button = function(){
        if (this.save_button_visible || !this.button) {return;}
        this.button.html.stop().animate({"opacity": 1});
        this.save_button_visible = true;
    };
    this.hide_save_button = function(){
        if (!this.save_button_visible || !this.button) {return;}
        this.button.html.stop().animate({"opacity": 0});
        this.save_button_visible = false;
    };
    this.SetText = function(text){
        this.input.SetText(text);
        this.input_changed(true);
        if (this.autosave_timeout) {
            clearTimeout(this.autosave_timeout);
            this.autosave_timeout = null;
        };
        if (this.load_dots) {
            this.load_dots.Stop();
        };
        this.hide_save_button();
    };
    this.Text = function(){
        return this.input.Text();
    };
    this.Request = function(api, server_data, callback, callback_binder){
        var request = null;
        this.request_callback = callback;
        this.request_callback_binder = callback_binder;
        if (!server_data["token"]) {
            server_data["token"] = d.Local.Get("token");
        };
        (function(self){
            request = self.button.Request(api, server_data, function(response_json){
                self.on_request_response(response_json);
            }, self);
        })(this);
        return request;
    };
    this.on_request_response = function(response_json){
        this.hide_save_button();
        if (this.load_dots) {
            this.load_dots.Stop();
        };
        this.request_callback.bind(this.request_callback_binder)(response_json);
    };
    this.SetLocked = function(is_locked){
        if (is_locked) {
            this.DisableSaveButton();
        }
        else {
            this.EnableSaveButton();
        };
    };
    this.EnableSaveButton = function(){
        if (!this.button) {return;}
        // this.button.SetButtonVisibility(true);
        this.input.SetLocked(false);
        this.input.SetTransparent(true);
    };
    this.DisableSaveButton = function(){
        if (!this.button) {return;}
        // this.button.SetButtonVisibility(false);
        this.input.SetLocked(true);
    };
    this.IsLoading = function(){
        if (this.button) {
            return this.button.IsLoading();
        }
        else {
            return false;
        };
    };
    this.SetAlignRight = function(){
        var spacer = $("<div></div>");
        this.html.prepend(spacer);
        spacer.css({
            "flex-grow": 1,
        });
        this.html.css({
            "padding-right": d.Size.Padding,
        });
        this.label.css({
            "width": "auto",
        });
    };
    this.on_submit = function(){
        this.highlight.stop().animate({"opacity": 0}, 100);
        var response_callback = this.on_click.bind(this.on_click_bind);
        response_callback(this);
    };
    this.setup_styles();
};


function DashGuiPropertyBox(binder, get_data_cb, set_data_cb, endpoint, dash_obj_id){
    this.binder = binder;
    this.get_data_cb = null;
    this.set_data_cb = null;
    if (get_data_cb && set_data_cb) {
        this.get_data_cb = get_data_cb.bind(binder);
        this.set_data_cb = set_data_cb.bind(binder);
    };
    this.endpoint = endpoint;
    this.dash_obj_id = dash_obj_id;
    this.html = Dash.Gui.GetHTMLBoxContext({});
    this.data = {};
    this.property_set_data = null; // Managed Dash data
    this.num_headers = 0;
    this.update_inputs = {};
    this.setup_styles = function(){
    };
    this.Load = function(){
        var url = "https://" + Dash.Context.domain + "/" + this.endpoint;
        var params = {};
        params["f"] = "get_property_set";
        params["obj_id"] = this.dash_obj_id;
        // binder, callback, endpoint, params
        Dash.Request(this, this.on_server_property_set, this.endpoint, params);
    };
    this.Update = function(){
        // Do we have new data?
        for (var data_key in this.update_inputs) {
            var row_input = this.update_inputs[data_key];
            row_input.SetText(this.property_set_data[data_key]);
        };
    };
    this.on_server_property_set = function(property_set_data){
        if (property_set_data["error"]) {
            alert("There was a problem accessing data");
            return;
        };
        this.property_set_data = property_set_data;
        this.Update();
    };
    this.AddHeader = function(label_text){
        var header = new d.Gui.Header(label_text).html;
        if (this.num_headers > 0) {
            header.css("margin-top", Dash.Size.Padding*0.5);
        };
        this.html.append(header);
        this.num_headers += 1;
    };
    this.AddButton = function(label_text, callback){
        callback = callback.bind(this.binder);
        (function(self, callback){
            var button = new d.Gui.Button(label_text, function(){
                callback(button);
            }, self);
            button.html.css("margin-top", Dash.Size.Padding);
            self.html.append(button.html);
        })(this, callback);
    };
    this.AddInput = function(data_key, label_text, default_value, combo_options, can_edit){
        if (this.get_data_cb) {
            this.data = this.get_data_cb();
        }
        else {
            this.data = {};
        };
        var row_details = {};
        row_details["key"] = data_key;
        row_details["label_text"] = label_text;
        row_details["default_value"] = default_value || null;
        row_details["combo_options"] = combo_options || null;
        row_details["value"] = this.data[data_key] || default_value;
        row_details["can_edit"] = can_edit;
        (function(self, row_details){
            var row = new d.Gui.InputRow(
                row_details["label_text"],
                row_details["value"],
                row_details["label_text"],
                combo_options || "Save",
                function(row_input){self.on_row_updated(row_input, row_details)},
                self
            );
            self.update_inputs[data_key] = row;
            var indent_px = 0;
            var indent_row = false;
            if (self.num_headers > 0) {
                indent_row = true;
            };
            if (indent_row) {
                row.html.css("margin-left", Dash.Size.Padding*2);
            };
            if (!row_details["can_edit"]) {
                row.SetLocked(true);
            };
            self.html.append(row.html);
        })(this, row_details);
    };
    this.on_row_updated = function(row_input, row_details){
        var new_value = row_input.Text();
        if (new_value == row_details["value"]) {
            console.log("The data didn't change");
            return;
        };
        var url = "https://" + Dash.Context.domain + "/" + this.endpoint;
        var params = {};
        params["f"] = "set_property";
        params["key"] = row_details["key"];
        params["value"] = new_value;
        params["obj_id"] = this.dash_obj_id;
        (function(self, row_input, row_details){
            row_input.Request(url, params, function(response){
                self.on_server_response(response, row_details);
            }, self);
        })(this, row_input, row_details);
    };
    this.on_server_response = function(response, row_details){
        console.log("SERVER RESPONSE");
        console.log(response);
    };
    this.setup_styles();
};


function DashGuiHeader(label_text){
    this.label_text = label_text;
    this.html = $("<div></div>");
    this.label = $("<div>" + this.label_text + "</div>");
    this.border = $("<div></div>");
    this.setup_styles = function(){
        this.html.append(this.label);
        this.html.append(this.border);
        this.html.css({
            // "background": "rgba(0, 0, 0, 0.5)",
            "height": Dash.Size.RowHeight,
            "margin-bottom": Dash.Size.Padding,
        });
        this.label.css({
            "text-align": "left",
            "color": Dash.Color.Primary,
            "padding-left": Dash.Size.Padding,
            "line-height": Dash.Size.RowHeight + "px",
            "font-family": "sans_serif_bold",
        });
        this.border.css({
            "position": "absolute",
            "left": -Dash.Size.Padding*0.25,
            "top": 0,
            "bottom": 0,
            "width": Dash.Size.Padding*0.5,
            "background": Dash.Color.Primary,
        });
    };
    this.setup_styles();
};

function DashGuiLayout(){
    this.SideTabs = DashGuiLayoutTabs;
    this.UserProfile = DashGuiLayoutUserProfile;
};


function DashGuiLayoutTabs(Binder){
    this.html = $("<div></div>");
    this.binder = Binder;
    this.recall_id = (this.binder.constructor + "").replace(/[^A-Za-z]/g, "").slice(0, 100).trim().toLowerCase();
    this.list_backing = $("<div></div>");
    this.list_top = $("<div></div>");
    this.list_bottom = $("<div></div>");
    this.content = $("<div></div>");
    this.all_content = [];
    this.selected_index = -1;
    this.width = Dash.Size.ColumnWidth;
    this.background_color = Dash.Color.Dark;
    this.is_sub = false;
    this.color_selected = Dash.Color.Primary;
    this.color_default = Dash.Color.ButtonColor;
    this.setup_styles = function(){
        this.html.append(this.list_backing);
        this.html.append(this.list_top);
        this.html.append(this.list_bottom);
        this.html.append(this.content);
        this.html.css({
            "position": "absolute",
            "display": "flex",
            "left": 0,
            "top": 0,
            "right": 0,
            "bottom": 0,
        });
        this.list_backing.css({
            "position": "absolute",
            "left": 0,
            "top": 0,
            "bottom": 0,
            // "background": "orange",
        });
        this.list_top.css({
            "position": "absolute",
            "left": 0,
            "top": 0,
            // "bottom": 0,
        });
        this.list_bottom.css({
            "position": "absolute",
            "left": 0,
            "bottom": 0,
            // "bottom": 0,
        });
        // The right side / non-tab area / content
        this.content.css({
            "position": "absolute",
            "left": this.width,
            "right": 0,
            "top": 0,
            "bottom": 0,
            "background": Dash.Color.Light,
            "overflow-y": "auto",
        });
        this.update_styles();
        (function(self){
            requestAnimationFrame(function(){
                self.load_last_selection();
            });
        })(this);
    };
    this.update_styles = function(){
        // Called to style anything that might change between the default behavior and the sub style
        var sub_border = "none";
        var box_shadow = "none";
        box_shadow = "0px 0px 20px 10px rgba(0, 0, 0, 0.2)";
        this.color_selected = Dash.Color.Primary;
        this.color_default = Dash.Color.ButtonColor;
        this.width = Dash.Size.ColumnWidth;
        this.background_color = Dash.Color.Dark;
        if (this.is_sub) {
            this.width = Dash.Size.ColumnWidth*0.5;
            // this.background_color = "rgba(0, 0, 0, 0)";
            // this.color_selected = LightBackgroundColor;
            // this.color_default = DarkPanelColor;
            sub_border =  "1px solid " + "rgba(255, 255, 255, 0.1)";
            box_shadow = "inset -20px -10px 20px 0px rgba(0, 0, 0, 0.11)";
        };

        this.list_backing.css({
            "width": this.width,
            "background": this.background_color,
            // "border-left": sub_border,
            // "box-shadow": box_shadow,
        });
        this.list_top.css({
            "width": this.width,
        });
        this.list_bottom.css({
            "width": this.width,
        });
        this.content.css({
            "left": this.width,
            "box-shadow": box_shadow,
        });
        for (var i in this.all_content) {
            this.style_button_content(this.all_content[i]);
        };
    };
    this.SetSubMenu = function(is_sub){
        this.is_sub = is_sub;
        this.update_styles();
    };
    this.load_last_selection = function(){
        if (this.selected_index != -1) {
            // A selection was already made externally
            return;
        };
        if (this.all_content.length == 0) {
            return;
        };
        var last_index = parseInt(d.Local.Get("sidebar_index_" + this.recall_id)) || 0;
        if (last_index > this.all_content.length-1) {
            last_index = 0;
        };
        this.LoadIndex(last_index);
    };
    this.LoadIndex = function(index){
        if (index > this.all_content.length-1) {
            return;
        };
        d.Local.Set("sidebar_index_" + this.recall_id, index);
        var button = null;
        for (var i in this.all_content) {
            var content_data = this.all_content[i];
            if (i == index) {
                content_data["button"].SetSelected(true);
                // content_data["button"].SetColor(this.color_selected);
                button = content_data["button"];
            }
            else {
                content_data["button"].SetSelected(false);
                // content_data["button"].SetColor(this.color_default);
            };
        };
        this.content.empty();
        var content_html = null;
        if (("" + typeof(this.all_content[index]["content_div_html_class"])) == "object") {
            content_html = this.all_content[index]["content_div_html_class"];
        }
        else if (("" + typeof(this.all_content[index]["content_div_html_class"])) == "function") {
            content_html = new this.all_content[index]["content_div_html_class"]().html;
        }
        else {
            content_html = this.all_content[index]["content_div_html_class"].bind(this.binder)(button);
        };
        if (!content_html) {
            console.log("ERROR: Unknown content!");
            content_html = $("<div>Error Loading Content</div>");
        };
        this.content.append(content_html);
    };
    this.style_button_content = function(content_data){
        var optional_params = content_data["optional_params"] || {};
        var indent = 0;
        if (optional_params["indent"]) {
            indent = Dash.Size.Padding;
        };
        content_data["button"].SetTextAlign("left");
        content_data["button"].html.css({
            // "margin": 0,
            // "padding-left": d.Size.Padding,
            // "padding-right": d.Size.Padding,
            // "padding-top": d.Size.Padding*0.5,
            // "padding-bottom": d.Size.Padding*0.5,
            "margin-bottom": 1,
            "flex-grow": 1,
        });
        content_data["button"].SetBorderRadius(0);
        content_data["button"].label.css({
            "font-size": "85%",
            "padding-left": indent,
            // "font-family": "sans_serif_bold",
        });
        if (this.is_sub) {
            // content_data["button"].html.css({
            //     "background": "black",
            // });
            // content_data["button"].highlight.css({
            //     "background": "orange",
            // });
        };
    };
    this.AppendImage = function(img_url){
        // TODO: Move the concept of an 'Image' into dash as a light
        // abstraction for managing aspect ratios
        // TODO: This AppendImage is a hack. We need to revise the
        // stack of objects in this container so they derive from
        // some abstraction to simplify append/prepend
        var image = $("<div></div>");
        image.css({
            "height": Dash.Size.RowHeight*2,
            "background-image": "url(" + img_url + ")",
            "background-repeat": "no-repeat",
            "background-size": "contain",
            "background-position": "center",
        });
        this.list_top.append(image);
    };
    this.Append = function(label_text, content_div_html_class, optional_params){
        return this._add(label_text, content_div_html_class, this.list_top, optional_params);
    };
    this.Prepend = function(label_text, content_div_html_class, optional_params){
        return this._add(label_text, content_div_html_class, this.list_bottom, optional_params);
    };
    this._add = function(label_text, content_div_html_class, anchor_div, optional_params){
        optional_params = optional_params || {};
        var content_data = {};
        content_data["label_text"] = label_text;
        content_data["content_div_html_class"] = content_div_html_class;
        content_data["button"] = null;
        content_data["optional_params"] = optional_params;
        (function(self, index){
            content_data["button"] = new d.Gui.Button(label_text, function(){
                self.LoadIndex(index);
            }, self);
        })(this, this.all_content.length);
        anchor_div = anchor_div || this.list_top;
        // console.log("--");
        // console.log(this.list_top);
        // console.log(this.list_bottom);
        // console.log(anchor_div);
        // console.log(typeof(anchor_div));
        anchor_div.append(content_data["button"].html);
        this.style_button_content(content_data);
        this.all_content.push(content_data);
        return content_data["button"];
    };
    this.setup_styles();
};


// Profile page layout for the currently logged in user
function DashGuiLayoutUserProfile(user_data){
    this.user_data = user_data || Dash.User.Data;
    this.as_overview = false;
    this.property_box = null;
    this.html = null;
    this.setup_styles = function(){
        this.property_box = new Dash.Gui.PropertyBox(
            this,           // For binding
            this.get_data,  // Function to return live data
            this.set_data,  // Function to set saved data locally
            "Users",        // Endpoint
            this.user_data["email"] // Dash obj_id (unique for users)
        );
        this.html = this.property_box.html;
        var header_title = "User Settings";
        if (this.user_data["first_name"]) {
            header_title = this.user_data["first_name"] + "'s User Settings";
        };
        this.property_box.AddHeader(header_title);
        this.property_box.AddInput("email",       "E-mail Address", "", null, false);
        this.property_box.AddInput("first_name",  "First Name",     "", null, true);
        this.property_box.AddInput("last_name",   "Last Name",      "", null, true);
        this.property_box.AddInput("job_prefix",   "Job Prefix",      "", null, true);
        this.new_password_row = new d.Gui.InputRow("Update Password", "", "New Password", "Update", this.update_password, this);
        // if (this.user_data["admin"]) {
        //     this.is_admin = new d.Gui.InputRow("Admin", "Yes", "Admin", "Revoke", function(b){this.set_group(b, "admin", false)}, this);
        // }
        // else {
        //     this.is_admin = new d.Gui.InputRow("Admin", "No", "Admin", "Promote", function(b){this.set_group(b, "admin", true)}, this);
        // };
        this.new_password_row.html.css("margin-left", Dash.Size.Padding*2);
        this.property_box.html.append(this.new_password_row.html);
        this.property_box.AddButton("Log Out", this.log_out);
    };
    this.get_data = function(){
        return this.user_data;
    };
    this.set_data = function(){
        console.log("set data");
        // return {};
    };
    this.log_out = function(button){
        d.Local.Set("email", "");
        d.Local.Set("token", "");
        d.Local.Set("user_json", "");
        location.reload();
    };
    this.set_group = function(button, group_name, group_option){
        console.log("this.set_group");
        // var api = "https://altona.io/Users";
        // var server_data = {};
        // server_data["f"] = "update_group_information";
        // server_data["token"] = localStorage.getItem("login_token");
        // server_data["as_user"] = this.user_data["email"];
        // server_data["group_name"] = group_name;
        // server_data["group_option"] = group_option;
        // button.Request(api, server_data, this.on_info_saved, this);
    };
    this.update_password = function(){
        if (!this.new_password_row.Text()) {
            return;
        };
        var params = {};
        params["f"] = "update_password";
        params["p"] = this.new_password_row.Text();
        (function(self, params){
            d.Request(self, function(response){
                self.on_info_saved(response, self.new_password_row);
            }, "Users", params);
        })(this, params);
    };
    this.update_first_name = function(){
        this.update_personal_information(this.first_name);
    };
    this.update_last_name = function(){
        this.update_personal_information(this.last_name);
    };
    this.update_hidden_mindtwins = function(){
        this.update_personal_information(this.hidden_mindtwins_csv);
    };
    this.update_personal_information = function(button){
        console.log("this.update_personal_information");
        console.log(response);

        // var api = "https://altona.io/Users";
        // var server_data = {};
        // server_data["f"] = "update_personal_information";
        // server_data["token"] = localStorage.getItem("login_token");
        // server_data["first_name"] = this.first_name.Text();
        // server_data["last_name"] = this.last_name.Text();
        // server_data["as_user"] = this.user_data["email"];
        // if (this.hidden_mindtwins_csv) {
        //     server_data["hidden_mindtwins_csv"] = this.hidden_mindtwins_csv.Text();
        // };
        // button.Request(api, server_data, this.on_info_saved, this);
    };
    this.on_info_saved = function(response, input_row){
        if (response.error) {
            console.log(response);
            alert(response.error);
            return;
        };
        console.log("** Info saved successfully **");
        input_row.FlashSave();
    };
    this.setup_styles();
};
