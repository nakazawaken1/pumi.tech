(window.webpackJsonp=window.webpackJsonp||[]).push([[5],{233:function(e,t){e.exports="\t\n\v\f\r                　\u2028\u2029\ufeff"},234:function(e,t,n){var content=n(240);content.__esModule&&(content=content.default),"string"==typeof content&&(content=[[e.i,content,""]]),content.locals&&(e.exports=content.locals);(0,n(64).default)("bab67a32",content,!0,{sourceMap:!1})},236:function(e,t,n){"use strict";var r=n(2),d=n(237).trim;r({target:"String",proto:!0,forced:n(238)("trim")},{trim:function(){return d(this)}})},237:function(e,t,n){var r=n(19),d="["+n(233)+"]",o=RegExp("^"+d+d+"*"),l=RegExp(d+d+"*$"),c=function(e){return function(t){var n=String(r(t));return 1&e&&(n=n.replace(o,"")),2&e&&(n=n.replace(l,"")),n}};e.exports={start:c(1),end:c(2),trim:c(3)}},238:function(e,t,n){var r=n(6),d=n(233);e.exports=function(e){return r((function(){return!!d[e]()||"​᠎"!="​᠎"[e]()||d[e].name!==e}))}},239:function(e,t,n){"use strict";n(234)},240:function(e,t,n){var r=n(63)(!1);r.push([e.i,"main[data-v-79f28ea9]{margin:1em auto;display:table}main .display[data-v-79f28ea9]{font-size:5rem;padding:2em 0}main .display .typed[data-v-79f28ea9]{color:#aaa}main .keyboard[data-v-79f28ea9]>:nth-child(2){margin-left:2em}main .keyboard[data-v-79f28ea9]>:nth-child(3){margin-left:3em}main .keyboard[data-v-79f28ea9]>:nth-child(4){margin-left:5em}main .keyboard ul[data-v-79f28ea9]{display:flex;padding:0;list-style-type:none}main .keyboard ul li[data-v-79f28ea9]{border:1px solid #ddd;width:4em;line-height:4em;text-align:center;margin:.1rem}main .keyboard ul li.pressed[data-v-79f28ea9]{background-color:#faa;transform:translateY(.1rem)}",""]),e.exports=r},244:function(e,t,n){"use strict";n.r(t);var r=n(5),d=(n(37),n(38),n(50),n(169),n(236),n(65),n(8),n(22),n(170),n(43),n(36),n(20),n(1).a.extend({data:function(){return{typed:"",text:"abcdefghijklmnopqrstuvwxyz",keys1:["1","2","3","4","5","6","7","8","9","0","-","^","\\"],keys2:["Q","W","E","R","T","Y","U","I","O","P","@","["],keys3:["A","S","D","F","G","H","J","K","L",";",":","]"],keys4:["Z","X","C","V","B","N","M",",",".","/","_"],pressed:[],words:[],indexes:[]}},fetch:function(){var e=this;return Object(r.a)(regeneratorRuntime.mark((function t(){return regeneratorRuntime.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,e.$axios.$get("/api/words",{headers:{"Content-Length":0,"Content-Type":"text/plain"},responseType:"text"});case 2:e.words=t.sent.split(/\r?\n/).filter((function(i){return i.trim().length>0}));case 3:case"end":return t.stop()}}),t)})))()},mounted:function(){this.$nuxt.$emit("sidebar_disabled",!0),document.addEventListener("keydown",this.keydown),document.addEventListener("keyup",this.keyup)},beforeDestroy:function(){document.removeEventListener("keydown",this.keydown),document.removeEventListener("keyup",this.keyup)},computed:{keys:function(){return this.keys1.concat(this.keys2,this.keys3,this.keys4)},will_typing:function(){return this.text.substr(this.typed.length)}},methods:{keydown:function(e){var t=this;this.if_exists(this.keys,e.key.toUpperCase(),(function(n,r){t.pressed.push(r),t.will_typing.charAt(0)==e.key&&(t.typed=t.typed+e.key),t.typed==t.text&&t.next()}))},keyup:function(e){var t=this;this.if_exists(this.pressed,e.key.toUpperCase(),(function(e,n){return t.pressed.splice(e,1)}))},if_exists:function(e,t,n){var r=e.indexOf(t);r>=0&&n(r,t)},next:function(){if(this.typed="",this.indexes.length<=0){this.indexes=Array.from(Array(this.words.length)).map((function(e,i){return i}));for(var i=0;i<this.words.length;i++){var e=Math.floor(Math.random()*this.words.length),t=this.indexes[e];this.indexes[e]=this.indexes[i],this.indexes[i]=t}}this.text=this.words[this.indexes.shift()]}}})),o=(n(239),n(44)),component=Object(o.a)(d,(function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("main",[n("div",{staticClass:"display"},[n("span",{staticClass:"typed"},[e._v(e._s(e.typed))]),n("span",{staticClass:"text"},[e._v(e._s(e.will_typing))])]),e._v(" "),n("div",{staticClass:"keyboard"},[n("ul",e._l(e.keys1,(function(t,i){return n("li",{key:i,class:{pressed:e.pressed.includes(t)}},[e._v("\n        "+e._s(t)+"\n      ")])})),0),e._v(" "),n("ul",e._l(e.keys2,(function(t,i){return n("li",{key:i,class:{pressed:e.pressed.includes(t)}},[e._v("\n        "+e._s(t)+"\n      ")])})),0),e._v(" "),n("ul",e._l(e.keys3,(function(t,i){return n("li",{key:i,class:{pressed:e.pressed.includes(t)}},[e._v("\n        "+e._s(t)+"\n      ")])})),0),e._v(" "),n("ul",e._l(e.keys4,(function(t,i){return n("li",{key:i,class:{pressed:e.pressed.includes(t)}},[e._v("\n        "+e._s(t)+"\n      ")])})),0)])])}),[],!1,null,"79f28ea9",null);t.default=component.exports}}]);