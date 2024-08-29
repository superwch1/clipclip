import * as rdd from 'react-device-detect';
import { useRef, useEffect } from 'react';
import FigureApi from '../../server/figureApi.mjs';
import { isUrlFocusedOrEditorFocused } from '../utlis.mjs';
import Quill from 'quill'

/** 
 * cut and delete figure using keyboard
 * @param {*} reverseActions 
 * @returns empty div
 */
function CutAndDelete({reverseActions}) {

  // only for desktop user
  if (rdd.isDesktop) {
    useEffect(() => {
      document.onkeydown = async (event) => await deleteFigure(event, reverseActions);
      document.oncut = async (event) => await cutFigure(event, reverseActions);
    }, []);
  }

  return (
    <div id="control-cut-and-delete" className='control'></div>
  )
}


/** 
 * delete the selected figure
 * @param {*} event 
 * @param {*} reverseActions 
 * @returns null
 */
async function deleteFigure(event, reverseActions) {

  if (isUrlFocusedOrEditorFocused() === true || event.key !== 'Delete') {
    return;
  }
  
  var selectedObjects = document.getElementsByClassName('selected-object');
  if (selectedObjects.length !== 1) {
    return;
  }

  var figureElement = document.getElementById(selectedObjects[0].id);
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
    const container = document.querySelector(`#${figureElement.id}-quill`);
    const quill = Quill.find(container);
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
    var imageElement = document.getElementById(`${selectedObjects[0].id}-image`)
    figure.base64 = imageElement.src;
  }

  var response = await FigureApi.deleteFigure(figureElement.id);
  if (response.status === 200) {
    if (reverseActions.current.length === 30) {
      reverseActions.current.shift();
    }

    if (figure.type === "editor") {
      reverseActions.current.push({action: "create", id: figure.id, boardId: figure.boardId, type: figure.type, x: figure.x, y: figure.y, backgroundColor: figure.backgroundColor, 
                                   width: figure.width, height: figure.height, url: figure.url, zIndex: figure.zIndex, isPinned: figure.isPinned, quillDelta: figure.quillDelta});
    }
    else if (figure.type === "image") {
      reverseActions.current.push({action: "create", id: figure.id, boardId: figure.boardId, type: figure.type, x: figure.x, y: figure.y, backgroundColor: figure.backgroundColor, 
                                   width: figure.width, height: figure.height, url: figure.url, zIndex: figure.zIndex, isPinned: figure.isPinned, base64: figure.base64});
    }
    else if (figure.type === "preview") {
      reverseActions.current.push({action: "create", id: figure.id, boardId: figure.boardId, type: figure.type, x: figure.x, y: figure.y, backgroundColor: figure.backgroundColor, 
                                   width: figure.width, height: figure.height, url: figure.url, zIndex: figure.zIndex, isPinned: figure.isPinned});
    }
  }
  else {
    toast(response.data);
  }
}


/** 
 * get the properties of selected figure from data attribute and pass to clipboard
 * @param {*} event use to prevent the default action
 * @returns null
 */
async function cutFigure(event, reverseActions) {
  if (isUrlFocusedOrEditorFocused() === true) {
    return;
  }

  // prevent browser cut other things rather than the figures
  event.preventDefault();

  var selectedObjects = document.getElementsByClassName('selected-object');
  if (selectedObjects.length !== 1) {
    return;
  }

  var figureElement = document.getElementById(selectedObjects[0].id);
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

  event.clipboardData.setData("clipclip/figure", JSON.stringify(figure));
  
  if (figure.type === "editor") {
    const container = document.querySelector(`#${figureElement.id}-quill`);
    const quill = Quill.find(container)
    const delta = quill.getContents();

    // remove the tailing space in the text
    if (delta.ops.length) {
      const lastOp = delta.ops[delta.ops.length - 1];
      if (typeof lastOp.insert === 'string' && lastOp.insert.endsWith('\n')) {
        lastOp.insert = lastOp.insert.replace(/\n+$/, '');
      }
    }
    event.clipboardData.setData("clipclip/editor", JSON.stringify(delta.ops)); // for clipboard
    figure.quillDelta = JSON.stringify(delta.ops); // for reverse
  }
  else if (figure.type === 'image') {
    var imageElement = document.getElementById(`${selectedObjects[0].id}-image`)
    event.clipboardData.setData("clipclip/image", imageElement.src); // for clipboard
    figure.base64 = imageElement.src; // for reverse
  }
  else if (figure.type === 'preview') {
    event.clipboardData.setData("clipclip/preview", figure.url);
  }

  var response = await FigureApi.deleteFigure(figureElement.id);

  if (response.status === 200) {
    if (reverseActions.current.length === 30) {
      reverseActions.current.shift();
    }

    if (figure.type === "editor") {
      reverseActions.current.push({action: "create", id: figure.id, boardId: figure.boardId, type: figure.type, x: figure.x, y: figure.y, backgroundColor: figure.backgroundColor, 
                                   width: figure.width, height: figure.height, url: figure.url, zIndex: figure.zIndex, isPinned: figure.isPinned, quillDelta: figure.quillDelta});
    }
    else if (figure.type === "image") {
      reverseActions.current.push({action: "create", id: figure.id, boardId: figure.boardId, type: figure.type, x: figure.x, y: figure.y, backgroundColor: figure.backgroundColor, 
                                   width: figure.width, height: figure.height, url: figure.url, zIndex: figure.zIndex, isPinned: figure.isPinned, base64: figure.base64});
    }
    else if (figure.type === "preview") {
      reverseActions.current.push({action: "create", id: figure.id, boardId: figure.boardId, type: figure.type, x: figure.x, y: figure.y, backgroundColor: figure.backgroundColor, 
                                   width: figure.width, height: figure.height, url: figure.url, zIndex: figure.zIndex, isPinned: figure.isPinned});
    }
  }
  else {
    toast(response.data);
  }
}


export default CutAndDelete