import './OptionBar.css'
import copyButton from './copy.png'
import deleteButton from './delete.png'
import layerupButton from './layerup.png'
import layerdownButton from './layerdown.png'
import pinnedButton from './pinned.png'
import notpinnedButton from './notpinned.png'
import { debounce } from 'lodash';
import { RgbaColorPicker } from "react-colorful";
import { useEffect, useRef } from 'react'
import FigureApi from '../../../api/figureApi.mjs'
import { toast } from 'react-toastify';
import Quill from 'quill'


/** 
 * show the option bar (background color, pin, copy, delete, layer)
 * @returns div with option bar
 */
function OptionBar({id, backgroundColor, isPinned, reverseActionsRef}) {

  // execute the function after it has not been called for 200 milliseconds. 
  const changeColor = debounce(async (newColor) => {
    await updateBackgroundColor(id, newColor, reverseActionsRef);
  }, 200);

  const wrapperRef = useRef(null);
  onClickOutsideColorPicker(wrapperRef, id);
  const rgba = backgroundColor.replace(/rgba|\(|\)/g, '').split(',');

  return (
    <div id={`${id}-optionbar`} className={`optionbar`}>
      <img src={isPinned === true ? pinnedButton : notpinnedButton} className='option' style={{height: "32px", width: "26px"}} alt="pin" 
           onClick={async (event) => await updatePinStatus(id, isPinned, reverseActionsRef)} />
      <div className='option-backgroundColor' style={{background: `${backgroundColor}`}} 
           onClick={(event) => document.getElementById(`${id}-colorpicker`).classList.remove('colorpicker-hide')}></div>
      <img src={copyButton} className='option' alt="copy" onClick={async (event) => await copyFigure(id, reverseActionsRef)} />
      <img src={deleteButton} className='option' alt="delete" onClick={async (event) => await deleteFigure(id, reverseActionsRef) } />
      <img src={layerupButton} className='option' alt="layerup" onClick={async (event) => await updateLayer(id, "up", reverseActionsRef)} />
      <img src={layerdownButton} className='option' alt="layerdown" onClick={async (event) => await updateLayer(id, "down", reverseActionsRef)} />
      
      <div ref={wrapperRef} id={`${id}-colorpicker`} className={'colorpicker-hide'} style={{position: "absolute", left: "7px", top: "60px", width: "200px", height: "200px"}}>
        <RgbaColorPicker color={{r: parseInt(rgba[0]), g: parseInt(rgba[1]), b: parseInt(rgba[2]), a: parseFloat(rgba[3])}}
          // reason for not using useState in figure is because once it rerender after setState, the changeColor function will be keep invoking
          onChange={(event) => {
            changeColor(`rgba(${event.r},${event.g},${event.b},${event.a})`)
            document.getElementById(id).style.backgroundColor = `rgba(${event.r},${event.g},${event.b},${event.a})`;
          }} />
      </div>
    </div>
  )
}


/** 
 * update the pin status of figure
 * @param {*} id
 * @param {*} isPinned
 * @param {*} reverseActionsRef   
 * @returns null
 */
async function updatePinStatus(id, isPinned, reverseActionsRef) {
  var originalStatus = isPinned;
  var newStatus = !isPinned;

  var response = await FigureApi.updatePinStatus(id, newStatus);
  if (response.status !== 200){
    toast(response.data);
  }
  else {
    if (reverseActionsRef.current.length === 30) {
      reverseActionsRef.current.shift();
    }
    reverseActionsRef.current.push({ action: "update-pinStatus", id: id, isPinned: originalStatus });
  }
}


/** 
 * update the background color of figure
 * @param {*} id
 * @param {*} newColor
 * @param {*} reverseActionsRef   
 * @returns null
 */
async function updateBackgroundColor(id, newColor, reverseActionsRef) {

  var figureElement = document.getElementById(id);
  var originalColor = figureElement.getAttribute("data-backgroundcolor")

  var response = await FigureApi.updateBackgroundColor(id, newColor);
  if (response.status !== 200){
    toast(response.data);
  }
  else {
    if (reverseActionsRef.current.length === 30) {
      reverseActionsRef.current.shift();
    }
    reverseActionsRef.current.push({ action: "update-backgroundColor", id: id, backgroundColor: originalColor });
  }
}


/** 
 * update the layer of figure
 * @param {*} id
 * @param {*} action
 * @param {*} reverseActionsRef   
 * @returns null
 */
async function updateLayer(id, action, reverseActionsRef) {
  var response = await FigureApi.updateLayer(id, action);
  if (response.status !== 200){
    toast(response.data);
  }
  else {
    if (reverseActionsRef.current.length === 30) {
      reverseActionsRef.current.shift();
    }

    var layerAction = action === "up" ? "down" : "up";
    reverseActionsRef.current.push({ action: "update-layer", id: id, layerAction: layerAction });
  }
}


/** 
 * delete the figure
 * @param {*} id
 * @param {*} reverseActionsRef   
 * @returns null
 */
async function deleteFigure(id, reverseActionsRef) {

  var figureElement = document.getElementById(id);

  var figure = {
    id: figureElement.getAttribute("data-id"),
    boardId: figureElement.getAttribute("data-boardid"),
    type: figureElement.getAttribute("data-type"),
    width: parseInt(figureElement.getAttribute("data-width")),
    height: parseInt(figureElement.getAttribute("data-height")),
    x: parseInt(figureElement.getAttribute("data-x")),
    y: parseInt(figureElement.getAttribute("data-y")),
    zIndex: parseInt(figureElement.getAttribute("data-zindex")),
    url: figureElement.getAttribute("data-url"),
    backgroundColor: figureElement.getAttribute("data-backgroundcolor"),
    isPinned: figureElement.getAttribute("data-ispinned")
  }

  if (figure.type === "editor") {
    const container = document.querySelector(`#${id}-quill`);
    const quill = Quill.find(container)
    const delta = quill.getContents();

    // remove the tailing space in the text
    if (delta.ops.length) {
      const lastOp = delta.ops[delta.ops.length - 1];
      if (typeof lastOp.insert === 'string' && lastOp.insert.endsWith('\n')) {
        lastOp.insert = lastOp.insert.replace(/\n+$/, '');
      }
    }
    figure.quillDelta = JSON.stringify(delta.ops);
  }

  else if (figure.type === 'image') {
    var imageElement = document.getElementById(`${id}-image`)
    figure.base64 = imageElement.src;
  }

  var response = await FigureApi.deleteFigure(id);
  if (response.status !== 200){
    toast(response.data);
  }
  else {
    
    if (reverseActionsRef.current.length === 30) {
      reverseActionsRef.current.shift();
    }

    if (figure.type === "editor") {
      reverseActionsRef.current.push({action: "create", id: figure.id, boardId: figure.boardId, type: figure.type, x: figure.x, y: figure.y, backgroundColor: figure.backgroundColor, 
                                   width: figure.width, height: figure.height, url: figure.url, zIndex: figure.zIndex, isPinned: figure.isPinned, quillDelta: figure.quillDelta});
    }
    else if (figure.type === "image") {
      reverseActionsRef.current.push({action: "create", id: figure.id, boardId: figure.boardId, type: figure.type, x: figure.x, y: figure.y, backgroundColor: figure.backgroundColor, 
                                   width: figure.width, height: figure.height, url: figure.url, zIndex: figure.zIndex, isPinned: figure.isPinned, base64: figure.base64});
    }
    else if (figure.type === "preview") {
      reverseActionsRef.current.push({action: "create", id: figure.id, boardId: figure.boardId, type: figure.type, x: figure.x, y: figure.y, backgroundColor: figure.backgroundColor, 
                                   width: figure.width, height: figure.height, url: figure.url, zIndex: figure.zIndex, isPinned: figure.isPinned});
    }
  }
}


/** 
 * copy the figure and create copied version next to it
 * @param {*} id
 * @param {*} reverseActionsRef   
 * @returns null
 */
async function copyFigure(id, reverseActionsRef) {

  var figureElement = document.getElementById(id);
  var figure = {
    id: figureElement.getAttribute("data-id"),
    boardId: figureElement.getAttribute("data-boardid"),
    type: figureElement.getAttribute("data-type"),
    width: parseInt(figureElement.getAttribute("data-width")),
    height: parseInt(figureElement.getAttribute("data-height")),
    x: parseInt(figureElement.getAttribute("data-x")),
    y: parseInt(figureElement.getAttribute("data-y")),
    zIndex: parseInt(figureElement.getAttribute("data-zindex")),
    url: figureElement.getAttribute("data-url"),
    backgroundColor: figureElement.getAttribute("data-backgroundcolor"),
    isPinned: figureElement.getAttribute("data-ispinned")
  }

  figure.x = figure.x + figure.width + 100;

  var response;
  if (figure.type === "editor") {
    const container = document.querySelector(`#${id}-quill`);
    const quill = Quill.find(container)
    const delta = quill.getContents();

    // remove the tailing space in the text
    if (delta.ops.length) {
      const lastOp = delta.ops[delta.ops.length - 1];
      if (typeof lastOp.insert === 'string' && lastOp.insert.endsWith('\n')) {
        lastOp.insert = lastOp.insert.replace(/\n+$/, '');
      }
    }
    figure.quillDelta = JSON.stringify(delta.ops);
    response = await FigureApi.createEditor(figure.boardId, figure.x, figure.y, figure.width, figure.height, figure.type, figure.backgroundColor, figure.url, figure.zIndex, figure.isPinned,
      null, JSON.parse(figure.quillDelta));
  }

  else if (figure.type === 'image') {
    var imageElement = document.getElementById(`${id}-image`)
    figure.base64 = imageElement.src;
    response = await FigureApi.createImage(figure.boardId, figure.x, figure.y, figure.width, figure.height, figure.type, figure.backgroundColor, figure.url, figure.zIndex, figure.isPinned, 
      figure.base64, false);
  }

  else if (figure.type === 'preview') {
    response = await FigureApi.createPreview(figure.boardId, figure.x, figure.y, figure.width, figure.height, figure.type, figure.backgroundColor, figure.url, figure.zIndex, figure.isPinned);
  }

  if (response.status !== 200){
    toast(response.data);
  }
  else {
    if (reverseActionsRef.current.length === 30) {
      reverseActionsRef.current.shift();
    }
    reverseActionsRef.current.push({ action: "delete", id: response.data._id });
  }
}


function onClickOutsideColorPicker(ref, id) {
  useEffect( () => {
    function handleClickOutside (event) {
      if (ref.current && !ref.current.contains(event.target)) {
        document.getElementById(`${id}-colorpicker`).classList.add('colorpicker-hide');
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);
}

export default OptionBar;