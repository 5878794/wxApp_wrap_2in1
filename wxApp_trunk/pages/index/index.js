!function(t){function r(n){if(e[n])return e[n].exports;var o=e[n]={i:n,l:!1,exports:{}};return t[n].call(o.exports,o,o.exports,r),o.l=!0,o.exports}var e={};r.m=t,r.c=e,r.i=function(t){return t},r.d=function(t,e,n){r.o(t,e)||Object.defineProperty(t,e,{configurable:!1,enumerable:!0,get:n})},r.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return r.d(e,"a",e),e},r.o=function(t,r){return Object.prototype.hasOwnProperty.call(t,r)},r.p="",r(r.s=2)}([function(t,r,e){"use strict";var n=(e(3),{});n=e(1),t.exports=n},function(t,r,e){"use strict";t.exports={run:function(t){t.onLoad=t.init,Page(t)}}},function(t,r,e){"use strict";var n=e(0),o={data:{aaa:123,a:[],c:[4,5,6],dd:[1,2]},init:function(){for(var t=[],r=0;r<3;r++)t.push(r);this.setData({a:t})},testFn:function(t){console.log(t),console.log("touch ok"),console.log(t.currentTarget)},testTouch:function(t){console.log(t),console.log("touch start"),console.log(t.target),console.log(t.currentTarget)},moveFn:function(t){console.log("touch move"),console.log(t)},testEnd:function(t){console.log("touch end"),console.log(t)},testLong:function(t){console.log("touch long"),console.log(t)}};n.run(o)},function(t,r,e){var n=function(){return this}()||Function("return this")(),o=n.regeneratorRuntime&&Object.getOwnPropertyNames(n).indexOf("regeneratorRuntime")>=0,i=o&&n.regeneratorRuntime;if(n.regeneratorRuntime=void 0,t.exports=e(4),o)n.regeneratorRuntime=i;else try{delete n.regeneratorRuntime}catch(t){n.regeneratorRuntime=void 0}},function(t,r){!function(r){"use strict";function e(t,r,e,n){var i=r&&r.prototype instanceof o?r:o,a=Object.create(i.prototype),c=new p(n||[]);return a._invoke=s(t,e,c),a}function n(t,r,e){try{return{type:"normal",arg:t.call(r,e)}}catch(t){return{type:"throw",arg:t}}}function o(){}function i(){}function a(){}function c(t){["next","throw","return"].forEach(function(r){t[r]=function(t){return this._invoke(r,t)}})}function u(t){function r(e,o,i,a){var c=n(t[e],t,o);if("throw"!==c.type){var u=c.arg,s=u.value;return s&&"object"==typeof s&&m.call(s,"__await")?Promise.resolve(s.__await).then(function(t){r("next",t,i,a)},function(t){r("throw",t,i,a)}):Promise.resolve(s).then(function(t){u.value=t,i(u)},a)}a(c.arg)}function e(t,e){function n(){return new Promise(function(n,o){r(t,e,n,o)})}return o=o?o.then(n,n):n()}var o;this._invoke=e}function s(t,r,e){var o=_;return function(i,a){if(o===P)throw new Error("Generator is already running");if(o===k){if("throw"===i)throw a;return y()}for(e.method=i,e.arg=a;;){var c=e.delegate;if(c){var u=l(c,e);if(u){if(u===F)continue;return u}}if("next"===e.method)e.sent=e._sent=e.arg;else if("throw"===e.method){if(o===_)throw o=k,e.arg;e.dispatchException(e.arg)}else"return"===e.method&&e.abrupt("return",e.arg);o=P;var s=n(t,r,e);if("normal"===s.type){if(o=e.done?k:j,s.arg===F)continue;return{value:s.arg,done:e.done}}"throw"===s.type&&(o=k,e.method="throw",e.arg=s.arg)}}}function l(t,r){var e=t.iterator[r.method];if(e===v){if(r.delegate=null,"throw"===r.method){if(t.iterator.return&&(r.method="return",r.arg=v,l(t,r),"throw"===r.method))return F;r.method="throw",r.arg=new TypeError("The iterator does not provide a 'throw' method")}return F}var o=n(e,t.iterator,r.arg);if("throw"===o.type)return r.method="throw",r.arg=o.arg,r.delegate=null,F;var i=o.arg;return i?i.done?(r[t.resultName]=i.value,r.next=t.nextLoc,"return"!==r.method&&(r.method="next",r.arg=v),r.delegate=null,F):i:(r.method="throw",r.arg=new TypeError("iterator result is not an object"),r.delegate=null,F)}function f(t){var r={tryLoc:t[0]};1 in t&&(r.catchLoc=t[1]),2 in t&&(r.finallyLoc=t[2],r.afterLoc=t[3]),this.tryEntries.push(r)}function h(t){var r=t.completion||{};r.type="normal",delete r.arg,t.completion=r}function p(t){this.tryEntries=[{tryLoc:"root"}],t.forEach(f,this),this.reset(!0)}function g(t){if(t){var r=t[x];if(r)return r.call(t);if("function"==typeof t.next)return t;if(!isNaN(t.length)){var e=-1,n=function r(){for(;++e<t.length;)if(m.call(t,e))return r.value=t[e],r.done=!1,r;return r.value=v,r.done=!0,r};return n.next=n}}return{next:y}}function y(){return{value:v,done:!0}}var v,d=Object.prototype,m=d.hasOwnProperty,w="function"==typeof Symbol?Symbol:{},x=w.iterator||"@@iterator",L=w.asyncIterator||"@@asyncIterator",b=w.toStringTag||"@@toStringTag",E="object"==typeof t,O=r.regeneratorRuntime;if(O)return void(E&&(t.exports=O));O=r.regeneratorRuntime=E?t.exports:{},O.wrap=e;var _="suspendedStart",j="suspendedYield",P="executing",k="completed",F={},N={};N[x]=function(){return this};var R=Object.getPrototypeOf,G=R&&R(R(g([])));G&&G!==d&&m.call(G,x)&&(N=G);var T=a.prototype=o.prototype=Object.create(N);i.prototype=T.constructor=a,a.constructor=i,a[b]=i.displayName="GeneratorFunction",O.isGeneratorFunction=function(t){var r="function"==typeof t&&t.constructor;return!!r&&(r===i||"GeneratorFunction"===(r.displayName||r.name))},O.mark=function(t){return Object.setPrototypeOf?Object.setPrototypeOf(t,a):(t.__proto__=a,b in t||(t[b]="GeneratorFunction")),t.prototype=Object.create(T),t},O.awrap=function(t){return{__await:t}},c(u.prototype),u.prototype[L]=function(){return this},O.AsyncIterator=u,O.async=function(t,r,n,o){var i=new u(e(t,r,n,o));return O.isGeneratorFunction(r)?i:i.next().then(function(t){return t.done?t.value:i.next()})},c(T),T[b]="Generator",T[x]=function(){return this},T.toString=function(){return"[object Generator]"},O.keys=function(t){var r=[];for(var e in t)r.push(e);return r.reverse(),function e(){for(;r.length;){var n=r.pop();if(n in t)return e.value=n,e.done=!1,e}return e.done=!0,e}},O.values=g,p.prototype={constructor:p,reset:function(t){if(this.prev=0,this.next=0,this.sent=this._sent=v,this.done=!1,this.delegate=null,this.method="next",this.arg=v,this.tryEntries.forEach(h),!t)for(var r in this)"t"===r.charAt(0)&&m.call(this,r)&&!isNaN(+r.slice(1))&&(this[r]=v)},stop:function(){this.done=!0;var t=this.tryEntries[0],r=t.completion;if("throw"===r.type)throw r.arg;return this.rval},dispatchException:function(t){function r(r,n){return i.type="throw",i.arg=t,e.next=r,n&&(e.method="next",e.arg=v),!!n}if(this.done)throw t;for(var e=this,n=this.tryEntries.length-1;n>=0;--n){var o=this.tryEntries[n],i=o.completion;if("root"===o.tryLoc)return r("end");if(o.tryLoc<=this.prev){var a=m.call(o,"catchLoc"),c=m.call(o,"finallyLoc");if(a&&c){if(this.prev<o.catchLoc)return r(o.catchLoc,!0);if(this.prev<o.finallyLoc)return r(o.finallyLoc)}else if(a){if(this.prev<o.catchLoc)return r(o.catchLoc,!0)}else{if(!c)throw new Error("try statement without catch or finally");if(this.prev<o.finallyLoc)return r(o.finallyLoc)}}}},abrupt:function(t,r){for(var e=this.tryEntries.length-1;e>=0;--e){var n=this.tryEntries[e];if(n.tryLoc<=this.prev&&m.call(n,"finallyLoc")&&this.prev<n.finallyLoc){var o=n;break}}o&&("break"===t||"continue"===t)&&o.tryLoc<=r&&r<=o.finallyLoc&&(o=null);var i=o?o.completion:{};return i.type=t,i.arg=r,o?(this.method="next",this.next=o.finallyLoc,F):this.complete(i)},complete:function(t,r){if("throw"===t.type)throw t.arg;return"break"===t.type||"continue"===t.type?this.next=t.arg:"return"===t.type?(this.rval=this.arg=t.arg,this.method="return",this.next="end"):"normal"===t.type&&r&&(this.next=r),F},finish:function(t){for(var r=this.tryEntries.length-1;r>=0;--r){var e=this.tryEntries[r];if(e.finallyLoc===t)return this.complete(e.completion,e.afterLoc),h(e),F}},catch:function(t){for(var r=this.tryEntries.length-1;r>=0;--r){var e=this.tryEntries[r];if(e.tryLoc===t){var n=e.completion;if("throw"===n.type){var o=n.arg;h(e)}return o}}throw new Error("illegal catch attempt")},delegateYield:function(t,r,e){return this.delegate={iterator:g(t),resultName:r,nextLoc:e},"next"===this.method&&(this.arg=v),F}}}(function(){return this}()||Function("return this")())}]);