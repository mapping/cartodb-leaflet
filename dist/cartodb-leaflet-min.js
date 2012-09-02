/*v0.54*/if(typeof(L.CartoDBLayer)==="undefined"){L.CartoDBLayer=L.Class.extend({version:"0.54",includes:L.Mixin.Events,options:{query:"SELECT * FROM {{table_name}}",opacity:0.99,auto_bound:false,attribution:"CartoDB",debug:false,visible:true,tiler_domain:"cartodb.com",tiler_port:"80",tiler_protocol:"http",sql_domain:"cartodb.com",sql_port:"80",sql_protocol:"http",extra_params:{},cdn_url:null},initialize:function(a){L.Util.setOptions(this,a);if(!a.table_name||!a.map){if(a.debug){throw ("cartodb-leaflet needs at least a CartoDB table name and the Leaflet map object :(")}else{return}}if(a.auto_bound){this.setBounds()}this._addWadus()},onAdd:function(a){this._addLayer();this.fire("added")},onRemove:function(a){this._remove()},setOpacity:function(a){if(isNaN(a)||a>1||a<0){if(this.options.debug){throw (a+" is not a valid value")}else{return}}this.options.opacity=a;if(this.options.visible){this.layer.setOpacity(a==1?0.99:a)}this.fire("updated")},setQuery:function(a){if(!isNaN(a)){if(this.options.debug){throw (a+" is not a valid query")}else{return}}this.options.query=a;this._update()},setStyle:function(a){if(!isNaN(a)){if(this.options.debug){throw (a+" is not a valid style")}else{return}}this.options.tile_style=a;this._update()},setInteractivity:function(a){if(!isNaN(a)){if(this.options.debug){throw (a+" is not a valid setInteractivity value")}else{return}}this.options.interactivity=a;this._update()},setLayerOrder:function(a){},setInteraction:function(b){if(b!==false&&b!==true){if(this.options.debug){throw (b+" is not a valid setInteraction value")}else{return}}if(this.interaction){if(b){var a=this;this.interaction.on("on",function(c){a._bindWaxOnEvents(a.options.map,c)});this.interaction.on("off",function(c){a._bindWaxOffEvents()})}else{this.interaction.off("on");this.interaction.off("off")}}},setAttribution:function(a){if(!isNaN(a)){if(this.options.debug){throw (a+" is not a valid attribution")}else{return}}this.options.map.attributionControl.removeAttribution(this.options.attribution);this.options.attribution=a;this.options.map.attributionControl.addAttribution(this.options.attribution);if(!this.options.interactivity){this.layer.options.attribution=this.options.attribution}else{this.layer.options.attribution=this.options.attribution;this.tilejson.attribution=this.options.attribution}},setOptions:function(a){if(typeof a!="object"||a.length){if(this.options.debug){throw (a+" options has to be an object")}else{return}}L.Util.setOptions(this,a);this._update()},isVisible:function(){return this.options.visible},hide:function(){this.setOpacity(0);this.setInteraction(false);this.options.visible=false;this.fire("hidden")},show:function(){this.setOpacity(this.options.opacity);this.setInteraction(true);this.options.visible=true;this.fire("showed")},_remove:function(){this.setInteraction(false);this.layer.off("loading").off("load");if(this.interaction){this.interaction.remove()}this.options.map.removeLayer(this.layer);this.fire("removed")},_update:function(){this._remove();this._addLayer();this.fire("updated")},setBounds:function(c){var a=this,b="";if(c){b=c}else{b=this.options.query}reqwest({url:this.generateUrl("sql")+"/api/v2/sql/?q="+escape("SELECT ST_XMin(ST_Extent(the_geom)) as minx,ST_YMin(ST_Extent(the_geom)) as miny,ST_XMax(ST_Extent(the_geom)) as maxx,ST_YMax(ST_Extent(the_geom)) as maxy from ("+b.replace(/\{\{table_name\}\}/g,this.options.table_name)+") as subq"),type:"jsonp",jsonpCallback:"callback",success:function(q){if(q.rows[0].maxx!=null){var p=q.rows[0];var l=p.maxx;var j=p.maxy;var k=p.minx;var i=p.miny;var e=-85.0511;var g=85.0511;var m=-179;var n=179;var h=function(s,t,r){return s<t?t:s>r?r:s};l=h(l,m,n);k=h(k,m,n);j=h(j,e,g);i=h(i,e,g);var o=new L.LatLng(j,l);var f=new L.LatLng(i,k);var d=new L.LatLngBounds(o,f);a.options.map.fitBounds(d)}},error:function(d,f){if(this.options.debug){throw ("Error getting table bounds: "+f)}}})},_addWadus:function(){if(!document.getElementById("cartodb_logo")){var a=document.createElement("a");a.setAttribute("id","cartodb_logo");a.setAttribute("style","position:absolute; bottom:8px; left:8px; display:block; z-index:10000;");a.setAttribute("href","http://www.cartodb.com");a.setAttribute("target","_blank");a.innerHTML="<img src='http://cartodb.s3.amazonaws.com/static/new_logo.png' style='border:none; outline:none' alt='CartoDB' title='CartoDB' />";this.options.map._container.appendChild(a)}},_addLayer:function(){var a=this;this.tilejson=this._generateTileJson();this.layer=new wax.leaf.connector(this.tilejson).on("loading",function(){a.fire("loading",this)}).on("load",function(){a.fire("load",this)});this.options.map.addLayer(this.layer,false);if(this.options.interactivity){this.interaction=wax.leaf.interaction().map(this.options.map).tilejson(this.tilejson).on("on",function(b){a._bindWaxOnEvents(a.options.map,b)}).on("off",function(b){a._bindWaxOffEvents()})}},_bindWaxOnEvents:function(b,c){var a=this._findPos(b,c),d=b.layerPointToLatLng(a);switch(c.e.type){case"mousemove":if(this.options.featureOver){return this.options.featureOver(c.e,d,{x:c.e.clientX,y:c.e.clientY},c.data)}else{if(this.options.debug){throw ("featureOver function not defined")}}break;case"click":if(this.options.featureClick){this.options.featureClick(c.e,d,{x:c.e.clientX,y:c.e.clientY},c.data)}else{if(this.options.debug){throw ("featureClick function not defined")}}break;case"touchend":if(this.options.featureClick){this.options.featureClick(c.e,d,{x:c.e.clientX,y:c.e.clientY},c.data)}else{if(this.options.debug){throw ("featureClick function not defined")}}break;default:break}},_bindWaxOffEvents:function(){if(this.options.featureOut){return this.options.featureOut&&this.options.featureOut()}else{if(this.options.debug){throw ("featureOut function not defined")}}},_generateTileJson:function(){var b=this.generateUrl("tiler");var f=b+"/tiles/"+this.options.table_name+"/{z}/{x}/{y}";var g=f+".png";var a=f+".grid.json";if(this.options.query){var e="sql="+encodeURIComponent(this.options.query.replace(/\{\{table_name\}\}/g,this.options.table_name));g=this._addUrlData(g,e);a=this._addUrlData(a,e)}for(_param in this.options.extra_params){g=this._addUrlData(g,_param+"="+this.options.extra_params[_param]);a=this._addUrlData(a,_param+"="+this.options.extra_params[_param])}if(this.options.tile_style){var c="style="+encodeURIComponent(this.options.tile_style.replace(/\{\{table_name\}\}/g,this.options.table_name));g=this._addUrlData(g,c);a=this._addUrlData(a,c)}if(this.options.interactivity){var d="interactivity="+encodeURIComponent(this.options.interactivity.replace(/ /g,""));g=this._addUrlData(g,d);a=this._addUrlData(a,d)}return{blankImage:"../img/blank_tile.png",tilejson:"1.0.0",scheme:"xyz",attribution:this.options.attribution,tiles:[g],grids:[a],tiles_base:g,grids_base:a,opacity:this.options.opacity,formatter:function(h,i){return i}}},_parseUri:function(e){var d={strictMode:false,key:["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],q:{name:"queryKey",parser:/(?:^|&)([^&=]*)=?([^&]*)/g},parser:{strict:/^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,loose:/^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/}},a=d.parser[d.strictMode?"strict":"loose"].exec(e),c={},b=14;while(b--){c[d.key[b]]=a[b]||""}c[d.q.name]={};c[d.key[12]].replace(d.q.parser,function(g,f,h){if(f){c[d.q.name][f]=h}});return c},_addUrlData:function(a,b){a+=(this._parseUri(a).query)?"&":"?";return a+=b},generateUrl:function(a){if(this.options.cdn_url){return this.options.cdn_url}if(a=="sql"){return this.options.sql_protocol+"://"+((this.options.user_name)?this.options.user_name+".":"")+this.options.sql_domain+((this.options.sql_port!="")?(":"+this.options.sql_port):"")}else{return this.options.tiler_protocol+"://"+((this.options.user_name)?this.options.user_name+".":"")+this.options.tiler_domain+((this.options.tiler_port!="")?(":"+this.options.tiler_port):"")}},_findPos:function(b,c){var d=curtop=0;var a=b._container;if(a.offsetParent){do{d+=a.offsetLeft;curtop+=a.offsetTop}while(a=a.offsetParent);return b.containerPointToLayerPoint(new L.Point((c.e.clientX||c.e.changedTouches[0].clientX)-d,(c.e.clientY||c.e.changedTouches[0].clientY)-curtop))}else{return b.mouseEventToLayerPoint(c.e)}}});
}!function(d,c){typeof module!="undefined"?module.exports=c():typeof define=="function"&&define.amd?define(d,c):this[d]=c()}("reqwest",function(){function handleReadyState(a,b,c){return function(){a&&a[readyState]==4&&(twoHundo.test(a.status)?b(a):c(a))}}function setHeaders(a,b){var c=b.headers||{},d;c.Accept=c.Accept||defaultHeaders.accept[b.type]||defaultHeaders.accept["*"],!b.crossOrigin&&!c[requestedWith]&&(c[requestedWith]=defaultHeaders.requestedWith),c[contentType]||(c[contentType]=b.contentType||defaultHeaders.contentType);for(d in c){c.hasOwnProperty(d)&&a.setRequestHeader(d,c[d])}}function generalCallback(a){lastValue=a}function urlappend(a,b){return a+(/\?/.test(a)?"&":"?")+b}function handleJsonp(a,b,c,d){var e=uniqid++,f=a.jsonpCallback||"callback",g=a.jsonpCallbackName||"reqwest_"+e,h=new RegExp("((^|\\?|&)"+f+")=([^&]+)"),i=d.match(h),j=doc.createElement("script"),k=0;i?i[3]==="?"?d=d.replace(h,"$1="+g):g=i[3]:d=urlappend(d,f+"="+g),win[g]=generalCallback,j.type="text/javascript",j.src=d,j.async=!0,typeof j.onreadystatechange!="undefined"&&(j.event="onclick",j.htmlFor=j.id="_reqwest_"+e),j.onload=j.onreadystatechange=function(){if(j[readyState]&&j[readyState]!=="complete"&&j[readyState]!=="loaded"||k){return !1}j.onload=j.onreadystatechange=null,j.onclick&&j.onclick(),a.success&&a.success(lastValue),lastValue=undefined,head.removeChild(j),k=1},head.appendChild(j)}function getRequest(a,b,c){var d=(a.method||"GET").toUpperCase(),e=typeof a=="string"?a:a.url,f=a.processData!==!1&&a.data&&typeof a.data!="string"?reqwest.toQueryString(a.data):a.data||null,g;return(a.type=="jsonp"||d=="GET")&&f&&(e=urlappend(e,f),f=null),a.type=="jsonp"?handleJsonp(a,b,c,e):(g=xhr(),g.open(d,e,!0),setHeaders(g,a),g.onreadystatechange=handleReadyState(g,b,c),a.before&&a.before(g),g.send(f),g)}function Reqwest(a,b){this.o=a,this.fn=b,init.apply(this,arguments)}function setType(a){var b=a.match(/\.(json|jsonp|html|xml)(\?|$)/);return b?b[1]:"js"}function init(o,fn){function complete(a){o.timeout&&clearTimeout(self.timeout),self.timeout=null,o.complete&&o.complete(a)}function success(resp){var r=resp.responseText;if(r){switch(type){case"json":try{resp=win.JSON?win.JSON.parse(r):eval("("+r+")")}catch(err){return error(resp,"Could not parse JSON in response",err)}break;case"js":resp=eval(r);break;case"html":resp=r}}fn(resp),o.success&&o.success(resp),complete(resp)}function error(a,b,c){o.error&&o.error(a,b,c),complete(a)}this.url=typeof o=="string"?o:o.url,this.timeout=null;var type=o.type||setType(this.url),self=this;fn=fn||function(){},o.timeout&&(this.timeout=setTimeout(function(){self.abort()},o.timeout)),this.request=getRequest(o,success,error)}function reqwest(a,b){return new Reqwest(a,b)}function normalize(a){return a?a.replace(/\r?\n/g,"\r\n"):""}function serial(a,b){var c=a.name,d=a.tagName.toLowerCase(),e=function(a){a&&!a.disabled&&b(c,normalize(a.attributes.value&&a.attributes.value.specified?a.value:a.text))};if(a.disabled||!c){return}switch(d){case"input":if(!/reset|button|image|file/i.test(a.type)){var f=/checkbox/i.test(a.type),g=/radio/i.test(a.type),h=a.value;(!f&&!g||a.checked)&&b(c,normalize(f&&h===""?"on":h))}break;case"textarea":b(c,normalize(a.value));break;case"select":if(a.type.toLowerCase()==="select-one"){e(a.selectedIndex>=0?a.options[a.selectedIndex]:null)}else{for(var i=0;a.length&&i<a.length;i++){a.options[i].selected&&e(a.options[i])}}}}function eachFormElement(){var a=this,b,c,d,e=function(b,c){for(var e=0;e<c.length;e++){var f=b[byTag](c[e]);for(d=0;d<f.length;d++){serial(f[d],a)}}};for(c=0;c<arguments.length;c++){b=arguments[c],/input|select|textarea/i.test(b.tagName)&&serial(b,a),e(b,["input","select","textarea"])}}function serializeQueryString(){return reqwest.toQueryString(reqwest.serializeArray.apply(null,arguments))}function serializeHash(){var a={};return eachFormElement.apply(function(b,c){b in a?(a[b]&&!isArray(a[b])&&(a[b]=[a[b]]),a[b].push(c)):a[b]=c},arguments),a}var context=this,win=window,doc=document,old=context.reqwest,twoHundo=/^20\d$/,byTag="getElementsByTagName",readyState="readyState",contentType="Content-Type",requestedWith="X-Requested-With",head=doc[byTag]("head")[0],uniqid=0,lastValue,xmlHttpRequest="XMLHttpRequest",isArray=typeof Array.isArray=="function"?Array.isArray:function(a){return a instanceof Array},defaultHeaders={contentType:"application/x-www-form-urlencoded",accept:{"*":"text/javascript, text/html, application/xml, text/xml, */*",xml:"application/xml, text/xml",html:"text/html",text:"text/plain",json:"application/json, text/javascript",js:"application/javascript, text/javascript"},requestedWith:xmlHttpRequest},xhr=win[xmlHttpRequest]?function(){return new XMLHttpRequest}:function(){return new ActiveXObject("Microsoft.XMLHTTP")};return Reqwest.prototype={abort:function(){this.request.abort()},retry:function(){init.call(this,this.o,this.fn)}},reqwest.serializeArray=function(){var a=[];return eachFormElement.apply(function(b,c){a.push({name:b,value:c})},arguments),a},reqwest.serialize=function(){if(arguments.length===0){return""}var a,b,c=Array.prototype.slice.call(arguments,0);return a=c.pop(),a&&a.nodeType&&c.push(a)&&(a=null),a&&(a=a.type),a=="map"?b=serializeHash:a=="array"?b=reqwest.serializeArray:b=serializeQueryString,b.apply(null,c)},reqwest.toQueryString=function(a){var b="",c,d=encodeURIComponent,e=function(a,c){b+=d(a)+"="+d(c)+"&"};if(isArray(a)){for(c=0;a&&c<a.length;c++){e(a[c].name,a[c].value)}}else{for(var f in a){if(!Object.hasOwnProperty.call(a,f)){continue}var g=a[f];if(isArray(g)){for(c=0;c<g.length;c++){e(f,g[c])}}else{e(f,a[f])}}}return b.replace(/&$/,"").replace(/%20/g,"+")},reqwest.compat=function(a,b){return a&&(a.type&&(a.method=a.type)&&delete a.type,a.dataType&&(a.type=a.dataType),a.jsonpCallback&&(a.jsonpCallbackName=a.jsonpCallback)&&delete a.jsonpCallback,a.jsonp&&(a.jsonpCallback=a.jsonp)),new Reqwest(a,b)},reqwest});