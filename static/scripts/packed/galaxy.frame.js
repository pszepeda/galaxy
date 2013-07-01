define(["utils/galaxy.css","libs/backbone/backbone-relational"],function(b){var a=Backbone.View.extend({el:"#everything",el_header:"#masthead",options:{frame:{cols:6,rows:3},rows:1000,cell:130,margin:5,scroll:5,top_min:40,frame_max:10},cols:0,top:0,top_max:0,frame_counter:0,frame_counter_id:0,frame_list:[],galaxy_frame_shadow:null,visible:false,active:false,initialize:function(d){b.load_file(d.url.styles+"/galaxy.frame.css");if(d){this.options=_.defaults(d,this.options)}this.top=this.top_max=this.options.top_min;$(this.el).append(this.frame_template_background());$(this.el).append(this.frame_template_menu());$(this.el_header).append(this.frame_template_header());var e="#galaxy-frame-shadow";$(this.el).append(this.frame_template_shadow(e.substring(1)));this.galaxy_frame_shadow={id:e,screen_location:{},grid_location:{},grid_rank:null,grid_lock:false};this.frame_resize(this.galaxy_frame_shadow,{width:0,height:0});this.frame_list[e]=this.galaxy_frame_shadow;this.panel_refresh();this.event_initialize();var c=this;$(window).resize(function(){c.panel_refresh()});window.onbeforeunload=function(){if(c.frame_counter>0){return"You opened "+c.frame_counter+" frame(s) which will be lost."}}},is_mobile:function(){return navigator.userAgent.match(/mobile|(iPad)|(iPhone)|(iPod)|(android)|(webOS)/i)},event:{type:null,target:null,xy:null},event_initialize:function(){this.events={mousemove:"event_frame_mouse_move",mouseup:"event_frame_mouse_up",mouseleave:"event_frame_mouse_up",mousewheel:"event_panel_scroll",DOMMouseScroll:"event_panel_scroll","mousedown .galaxy-frame":"event_frame_mouse_down","mousedown .galaxy-frame-active":"event_panel_active","mousedown .galaxy-frame-load":"event_panel_load","mousedown .galaxy-frame-background":"event_panel_load","mousedown .galaxy-frame-scroll-up":"event_panel_scroll_up","mousedown .galaxy-frame-scroll-down":"event_panel_scroll_down","mousedown .f-close":"event_frame_close","mousedown .f-pin":"event_frame_lock"};this.delegateEvents(this.events)},event_frame_mouse_down:function(c){if(this.event.type!==null){return}if($(c.target).hasClass("f-header")||$(c.target).hasClass("f-title")){this.event.type="drag"}if($(c.target).hasClass("f-resize")){this.event.type="resize"}if(this.event.type===null){return}c.preventDefault();this.event.target=this.event_get_frame(c.target);if(this.event.target.grid_lock){this.event.type=null;return}this.event.xy={x:c.originalEvent.pageX,y:c.originalEvent.pageY};this.frame_drag_start(this.event.target)},event_frame_mouse_move:function(i){if(this.event.type!="drag"&&this.event.type!="resize"){return}var g={x:i.originalEvent.pageX,y:i.originalEvent.pageY};var d={x:g.x-this.event.xy.x,y:g.y-this.event.xy.y};this.event.xy=g;var h=this.frame_screen(this.event.target);if(this.event.type=="resize"){h.width+=d.x;h.height+=d.y;var f=this.options.cell-this.options.margin-1;h.width=Math.max(h.width,f);h.height=Math.max(h.height,f);this.frame_resize(this.event.target,h);h.width=this.to_grid_coord("width",h.width)+1;h.height=this.to_grid_coord("height",h.height)+1;h.width=this.to_pixel_coord("width",h.width);h.height=this.to_pixel_coord("height",h.height);this.frame_resize(this.galaxy_frame_shadow,h);this.frame_insert(this.galaxy_frame_shadow,{top:this.to_grid_coord("top",h.top),left:this.to_grid_coord("left",h.left)})}if(this.event.type=="drag"){h.left+=d.x;h.top+=d.y;this.frame_offset(this.event.target,h);var c={top:this.to_grid_coord("top",h.top),left:this.to_grid_coord("left",h.left)};if(c.left!==0){c.left++}this.frame_insert(this.galaxy_frame_shadow,c)}},event_frame_mouse_up:function(c){if(this.event.type!="drag"&&this.event.type!="resize"){return}this.frame_drag_stop(this.event.target);this.event.type=null},event_frame_close:function(d){if(this.event.type!==null){return}d.preventDefault();var f=this.event_get_frame(d.target);var c=this;$(f.id).fadeOut("fast",function(){$(f.id).remove();delete c.frame_list[f.id];c.frame_counter--;c.panel_refresh(true);c.panel_animation_complete();if(c.visible&&c.frame_counter==0){c.panel_show_hide()}})},event_frame_lock:function(c){if(this.event.type!==null){return}c.preventDefault();var d=this.event_get_frame(c.target);if(d.grid_lock){d.grid_lock=false;$(d.id).find(".f-pin").removeClass("f-toggle");$(d.id).find(".f-header").removeClass("f-not-allowed");$(d.id).find(".f-title").removeClass("f-not-allowed");$(d.id).find(".f-resize").show();$(d.id).find(".f-close").show()}else{d.grid_lock=true;$(d.id).find(".f-pin").addClass("f-toggle");$(d.id).find(".f-header").addClass("f-not-allowed");$(d.id).find(".f-title").addClass("f-not-allowed");$(d.id).find(".f-resize").hide();$(d.id).find(".f-close").hide()}},event_panel_load:function(c){if(this.event.type!==null){return}c.preventDefault();this.panel_show_hide()},event_panel_active:function(c){if(this.event.type!==null){return}c.preventDefault();this.panel_active_disable()},event_panel_scroll:function(c){if(this.event.type!==null||!this.visible){return}c.preventDefault();var d=c.originalEvent.detail?c.originalEvent.detail:c.originalEvent.wheelDelta/-3;this.panel_scroll(d)},event_panel_scroll_up:function(c){if(this.event.type!==null){return}c.preventDefault();this.panel_scroll(-this.options.scroll)},event_panel_scroll_down:function(c){if(this.event.type!==null){return}c.preventDefault();this.panel_scroll(this.options.scroll)},event_get_frame:function(c){return this.frame_list["#"+$(c).closest(".galaxy-frame").attr("id")]},frame_drag_start:function(d){this.frame_focus(d,true);var c=this.frame_screen(d);this.frame_resize(this.galaxy_frame_shadow,c);this.frame_grid(this.galaxy_frame_shadow,d.grid_location);d.grid_location=null;$(this.galaxy_frame_shadow.id).show();$(".f-cover").show()},frame_drag_stop:function(d){this.frame_focus(d,false);var c=this.frame_screen(this.galaxy_frame_shadow);this.frame_resize(d,c);this.frame_grid(d,this.galaxy_frame_shadow.grid_location,true);this.galaxy_frame_shadow.grid_location=null;$(this.galaxy_frame_shadow.id).hide();$(".f-cover").hide();this.panel_animation_complete()},to_grid_coord:function(e,d){var c=(e=="width"||e=="height")?1:-1;if(e=="top"){d-=this.top}return parseInt((d+c*this.options.margin)/this.options.cell,10)},to_pixel_coord:function(e,f){var c=(e=="width"||e=="height")?1:-1;var d=(f*this.options.cell)-c*this.options.margin;if(e=="top"){d+=this.top}return d},to_grid:function(c){return{top:this.to_grid_coord("top",c.top),left:this.to_grid_coord("left",c.left),width:this.to_grid_coord("width",c.width),height:this.to_grid_coord("height",c.height)}},to_pixel:function(c){return{top:this.to_pixel_coord("top",c.top),left:this.to_pixel_coord("left",c.left),width:this.to_pixel_coord("width",c.width),height:this.to_pixel_coord("height",c.height)}},is_collision:function(e){function c(h,g){return !(h.left>g.left+g.width-1||h.left+h.width-1<g.left||h.top>g.top+g.height-1||h.top+h.height-1<g.top)}for(var d in this.frame_list){var f=this.frame_list[d];if(f.grid_location===null){continue}if(c(e,f.grid_location)){return true}}return false},location_rank:function(c){return(c.top*this.cols)+c.left},menu_refresh:function(){$(".galaxy-frame-load .number").text(this.frame_counter);if(this.frame_counter==0){$(".galaxy-frame-load").hide()}else{$(".galaxy-frame-load").show()}if(this.top==this.options.top_min){$(".galaxy-frame-scroll-up").hide()}else{$(".galaxy-frame-scroll-up").show()}if(this.top==this.top_max){$(".galaxy-frame-scroll-down").hide()}else{$(".galaxy-frame-scroll-down").show()}},panel_animation_complete:function(){var c=this;$(".galaxy-frame").promise().done(function(){c.panel_scroll(0,true)})},panel_refresh:function(c){this.cols=parseInt($(window).width()/this.options.cell,10)+1;this.frame_insert(null,null,c)},panel_scroll:function(h,c){var e=this.top-this.options.scroll*h;e=Math.max(e,this.top_max);e=Math.min(e,this.options.top_min);if(this.top!=e){for(var d in this.frame_list){var g=this.frame_list[d];if(g.grid_location!==null){var f={top:g.screen_location.top-(this.top-e),left:g.screen_location.left};this.frame_offset(g,f,c)}}this.top=e}this.menu_refresh()},panel_show_hide:function(){if(this.visible){this.visible=false;for(var c in this.frame_list){$(this.frame_list[c].id).fadeOut("fast")}$(".galaxy-frame-load .icon").addClass("fa-icon-eye-close");$(".galaxy-frame-load .icon").removeClass("fa-icon-eye-open");$(".galaxy-frame-background").hide();$(".galaxy-frame-menu").hide()}else{this.visible=true;for(var c in this.frame_list){$(this.frame_list[c].id).fadeIn("fast")}$(".galaxy-frame-load .icon").addClass("fa-icon-eye-open");$(".galaxy-frame-load .icon").removeClass("fa-icon-eye-close");$(this.galaxy_frame_shadow.id).hide();$(".galaxy-frame-background").show();this.menu_refresh()}},panel_active_disable:function(){if(this.active){this.active=false;$(".galaxy-frame-active .icon").removeClass("f-toggle");if(this.visible){this.panel_show_hide()}}else{this.active=true;$(".galaxy-frame-active .icon").addClass("f-toggle")}},frame_new:function(d){if(!this.active){if(d.center){var c=$(window.parent.document).find("iframe#galaxy_main");c.attr("src",d.content)}else{window.location=d.content}return}var e="#galaxy-frame-"+(this.frame_counter_id++);if($(e).length===0&&this.options.frame_max>this.frame_counter){this.top=this.options.top_min;d.width=this.to_pixel_coord("width",this.options.frame.cols);d.height=this.to_pixel_coord("height",this.options.frame.rows);$(this.el).append(this.frame_template(e.substring(1),d.title,d.type,d.content));var f={id:e,screen_location:{},grid_location:{},grid_rank:null,grid_lock:false};this.frame_counter++;this.frame_list[e]=f;this.frame_resize(f,{width:d.width,height:d.height});this.frame_insert(f,{top:0,left:0},true);if(!this.visible){this.panel_show_hide()}}else{alert("You have reached the maximum number of allowed frames ("+this.options.frame_max+").")}},frame_insert:function(j,c,e){var d=[];if(j){j.grid_location=null;d.push([j,this.location_rank(c)])}var g=null;for(g in this.frame_list){var h=this.frame_list[g];if(h.grid_location!==null&&!h.grid_lock){h.grid_location=null;d.push([h,h.grid_rank])}}d.sort(function(k,f){var m=k[1];var l=f[1];return m<l?-1:(m>l?1:0)});for(g=0;g<d.length;g++){this.frame_place(d[g][0],e)}this.top_max=0;for(var g in this.frame_list){var j=this.frame_list[g];if(j.grid_location!==null){this.top_max=Math.max(this.top_max,j.grid_location.top+j.grid_location.height)}}this.top_max=$(window).height()-this.top_max*this.options.cell-2*this.options.margin;this.top_max=Math.min(this.top_max,this.options.top_min);this.menu_refresh()},frame_place:function(k,d){k.grid_location=null;var h=this.to_grid(this.frame_screen(k));var c=false;for(var f=0;f<this.options.rows;f++){for(var e=0;e<Math.max(1,this.cols-h.width);e++){h.top=f;h.left=e;if(!this.is_collision(h)){c=true;break}}if(c){break}}if(c){this.frame_grid(k,h,d)}else{console.log("Grid dimensions exceeded.")}},frame_focus:function(e,c){var d=parseInt(b.get_attribute("galaxy-frame","z-index"))+(c?1:0);$(e.id).css("z-index",d)},frame_offset:function(f,e,d){f.screen_location.left=e.left;f.screen_location.top=e.top;if(d){this.frame_focus(f,true);var c=this;$(f.id).animate({top:e.top,left:e.left},"fast",function(){c.frame_focus(f,false)})}else{$(f.id).css({top:e.top,left:e.left})}},frame_resize:function(d,c){$(d.id).css({width:c.width,height:c.height});d.screen_location.width=c.width;d.screen_location.height=c.height},frame_grid:function(e,c,d){e.grid_location=c;this.frame_offset(e,this.to_pixel(c),d);e.grid_rank=this.location_rank(c)},frame_screen:function(d){var c=d.screen_location;return{top:c.top,left:c.left,width:c.width,height:c.height}},frame_template:function(f,e,c,d){if(!e){e=""}if(c=="url"){d='<iframe scrolling="auto" class="f-iframe"  src="'+d+'"></iframe>'}return'<div id="'+f+'" class="galaxy-frame f-corner"><div class="f-header f-corner"><span class="f-title">'+e+'</span><span class="f-icon f-pin fa-icon-pushpin"></span><span class="f-icon f-close fa-icon-trash"></span></div><div class="f-content f-corner">'+d+'<div class="f-cover"></div></div><span class="f-resize f-icon f-corner fa-icon-resize-full"></span></div>'},frame_template_shadow:function(c){return'<div id="'+c+'" class="galaxy-frame-shadow f-corner"></div>'},frame_template_background:function(){return'<div class="galaxy-frame-background"></div>'},frame_template_header:function(){return'<div class="galaxy-frame-load f-corner"><div class="number f-corner">0</div><div class="icon fa-icon-2x"></div></div><div class="galaxy-frame-active f-corner" style="position: absolute; top: 8px;"><div class="icon fa-icon-2x fa-icon-th"></div></div>'},frame_template_menu:function(){return'<div class="galaxy-frame-scroll-up galaxy-frame-menu fa-icon-chevron-up fa-icon-2x"></div><div class="galaxy-frame-scroll-down galaxy-frame-menu fa-icon-chevron-down fa-icon-2x"></div>'}});return{GalaxyFrameManager:a}});