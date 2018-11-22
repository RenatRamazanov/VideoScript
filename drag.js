//var objDragDropPosition = null;

function preventDefault(e){
	e = e || window.event;
	if (e.preventDefault) e.preventDefault();
	e.returnValue = false;  
	}
// MOBILE
function disable_scroll_mobile(){
	document.addEventListener('touchmove', preventDefault, false);
	}
function enable_scroll_mobile(){
	document.removeEventListener('touchmove',preventDefault, false);
	}	

function fixEvent(e) {
	e = e || window.event;
	if (!e.target) e.target = e.srcElement;
	if (e.pageX == null && e.clientX != null ) { // если нет pageX..
		var html = document.documentElement;
		var body = document.body;
		e.pageX = e.clientX + (html.scrollLeft || body && body.scrollLeft || 0);
		e.pageX -= html.clientLeft || 0;
		e.pageY = e.clientY + (html.scrollTop || body && body.scrollTop || 0);
		e.pageY -= html.clientTop || 0;
		}
	if (!e.which && e.button) {
		e.which = e.button & 1 ? 1 : ( e.button & 2 ? 3 : ( e.button & 4 ? 2 : 0 ) )
		}
	return e;
	}

function getCoords(elem) {
    var box = elem.getBoundingClientRect();
    var body = document.body;
    var docElem = document.documentElement;
    var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
    var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;
    var clientTop = docElem.clientTop || body.clientTop || 0;
    var clientLeft = docElem.clientLeft || body.clientLeft || 0;
    var top  = box.top +  scrollTop - clientTop;
    var left = box.left + scrollLeft - clientLeft;
    return { top: Math.round(top), left: Math.round(left) };
	}

function getElementUnderClientXY(elem, clientX, clientY){
	var display = elem.style.display || '';
	elem.style.display = 'none';
	var target = document.elementFromPoint(clientX, clientY);	
	elem.style.display = display;
	return target;
	}
	

var disableDragDrop = true;
var DragManager = new function(){
	var dragObject = {};
	var self = this;
	var container = $qs(".captures");
	var disableDragDropSetTime;	
	disableDragDrop = true; 	
		
	function onMouseDown(e){
		disableDragDrop = true;
		if (typeof e.targetTouches !== 'undefined') e = e.targetTouches[0];
		e = fixEvent(e);
		disableDragDropSetTime = setTimeout(function(){
			var elem = findDraggable(e);
			if (elem){
				var elemDraggable = elem.getAttribute("draggable");
				if (elemDraggable=='function' && !Allow.useMovingScriptLine) return;
				dragObject.elem = elem;
				dragObject.elem.style.opacity = 0.5;
				dragObject.elem.style.borderColor = "#5c78ff";
				dragObject.downX = e.pageX;
				dragObject.downY = e.pageY;	
				}
			disableDragDrop = false;
			disable_scroll_mobile();
			},1000);
		return false;
		}
	
	
	function onMouseMove(e){
		if (disableDragDrop) return;
		var moveX = parseInt(e.pageX) - parseInt(dragObject.downX);
		var moveY = parseInt(e.pageY) - parseInt(dragObject.downY);
		if (Math.abs(moveX) < 3 && Math.abs(moveY) < 3){return}		
		if (!dragObject.elem){clearTimeout(disableDragDropSetTime);	return;}			
		var Left, Top, coords;		
		if (typeof e.targetTouches !== 'undefined') 
			e = e.targetTouches[0];
			e = fixEvent(e);			
		if (!dragObject.avatar){
			dragObject.avatar = createAvatar(e);
			if (!dragObject.avatar){dragObject = {}; return;}
			coords = getCoords(dragObject.avatar);
			dragObject.shiftX = dragObject.downX - coords.left;
			dragObject.shiftY = dragObject.downY - coords.top;
			startDrag(e);
			}
		Left = e.pageX - dragObject.shiftX;
		Top = e.pageY - dragObject.shiftY;
		dragObject.avatar.style.left = Left + 'px';
		dragObject.avatar.style.top = Top + 'px';		
		
		/*
		var dropElem = findDroppable(e);
		if (dropElem){
			coords = getCoords(dropElem);	
			Left = (dragObject.elem.offsetLeft - coords.left);
			Top = (dragObject.elem.offsetTop - coords.top);
			}
		objDragDropPosition = {X:Left, Y:Top, E:dragObject.elem.getAttribute('data-point'), P:dropElem};
		*/
		return false;
		}

	function onMouseUp(e){		
		if (typeof e.changedTouches !== 'undefined') e = e.changedTouches[0];
		if (dragObject.elem){
			dragObject.elem.style.removeProperty('opacity');
			dragObject.elem.style.removeProperty('border-color');
			}
		if (dragObject.avatar){			
			e = fixEvent(e);
			finishDrag(e);
			}
		dragObject = {};
		//objDragDropPosition = null;
		disableDragDrop = true;
		clearTimeout(disableDragDropSetTime);			
		enable_scroll_mobile();
		}

	function finishDrag(e){
		var dropObject = findDroppable(e);		
		if (!dropObject) self.onDragCancel(dragObject); else self.onDragEnd(dragObject, dropObject);		
		}

	function createAvatar(e){
		var avatar = dragObject.elem;
		var old = {
			parent: avatar.parentNode,
			nextSibling: avatar.nextSibling,
			position: avatar.position || '',
			left: avatar.left || '',
			top: avatar.top || '',
			zIndex: avatar.zIndex || ''
			};
		avatar.rollback = function(){
			old.parent.insertBefore(avatar, old.nextSibling);
			avatar.style.position = old.position;
			avatar.style.left = old.left;
			avatar.style.top = old.top;
			avatar.style.zIndex = old.zIndex
			};
		return avatar;
		}

	function startDrag(e){
		var avatar = dragObject.avatar;
		document.body.appendChild(avatar);
		avatar.style.zIndex = 9999;
		avatar.style.position = 'absolute';
		}

	function findDraggable(e){
		var elem = e.target;
		while(elem != document && !elem.hasAttribute('draggable')){elem = elem.parentNode;}
		return elem == document ? null : elem;
		}	
		
	function findDroppable(e){
		var elem = getElementUnderClientXY(dragObject.avatar, e.clientX, e.clientY);
		var dropType = (elem.hasAttribute('draggable')) ? elem.getAttribute('draggable') : null;
		var dragType = dragObject.elem.getAttribute('draggable');
		if (dragType == dropType){
			var parent = elem.parentNode;
			var index = parseInt(Array.prototype.indexOf.call(parent.children, elem));
			var coords = getCoords(parent.childNodes[index]);
				coords.W = elem.offsetWidth;
				coords.H = elem.offsetHeight;
				coords.X = e.clientX;
				coords.Y = e.clientY;
			
			var dropIndexX = (parseFloat(coords.X) - parseFloat(coords.left) <= parseFloat(coords.W)*0.5) ? index : index+1;
			var dropIndexY = (parseFloat(coords.Y) - parseFloat(coords.top) <= parseFloat(coords.H)*0.5) ? index : index+1;
			var dropIndex = (dropIndexX > dropIndexY) ? dropIndexX : dropIndexY;
			return {elem:parent, index:dropIndex};
			}else{
				while(elem != document && !elem.hasAttribute('droppable')){elem = elem.parentNode;}
				return elem == document ? null : {elem:elem};				
				}	
		return;
		}
		
		
	container = document;	
	container.addEventListener("mousedown", onMouseDown, false);
	container.addEventListener("mousemove", onMouseMove, false);
	container.addEventListener("mouseup", onMouseUp, false);	
	container.addEventListener("touchstart", onMouseDown, false);	
	container.addEventListener("touchmove", onMouseMove, false);
	container.addEventListener("touchend", onMouseUp, false);
	

	this.onDragCancel = function(dragObject){console.log('cancel');};
	
	this.onDragEnd = function(dragObject, dropObject){
		var dragElem = dragObject.elem;
		var dropElem = dropObject.elem;
		//console.log(dropElem, dragElem);
		var dropIndex = (dropObject.index !== undefined) ? dropObject.index : null;
		if (dropElem.getAttribute("droppable") == 'capture'){	
			dropElem.innerHTML = '';
			dragElem.style.removeProperty('z-index');
			dragElem.style.removeProperty('position');
			dragElem.style.removeProperty('top');
			dragElem.style.removeProperty('left');
			}
		if (dropElem.getAttribute("droppable") == 'function'){
			dragElem.style.removeProperty('position');
			dragElem.style.removeProperty('left');
			dragElem.style.removeProperty('top');
			dragElem.style.removeProperty('z-index');
			}	
		else{
			var coords = getCoords(dropElem);	
			dragElem.style.left = (dragElem.offsetLeft - coords.left)+'px';
			dragElem.style.top = (dragElem.offsetTop - coords.top)+'px';
			}		
		
		if (dropIndex!==null)
			dropElem.insertBefore(dragElem, dropElem.children[dropIndex]);
			else dropElem.appendChild(dragElem);
		};
	};