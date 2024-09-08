import * as rdd from 'react-device-detect';
import Quill from 'quill'
import { useRef, useEffect } from 'react';
import FigureApi from '../../server/figureApi.mjs';
import { isInputOrEditorFocused } from '../utlis.mjs';
import { toast } from 'react-toastify';

/** 
 * copy and paste figure using keyboard
 * @param {*} scale
 * @param {*} reverseActions 
 * @param {*} boardId 
 * @returns empty div
 */
function CopyAndPaste({scale, reverseActions, boardId}) {

  const pastingFigure = useRef(false);

  // only for desktop user with cursor position
  if (rdd.isDesktop) {
    useEffect(() => {
      document.onpaste = async (event) => await pasteFigure(event, scale, pastingFigure, reverseActions, boardId); // can't use loudash since the event cannot be passed to the function in loudash
      document.oncopy = (event) => copyFigure(event); // can't use async here
    }, [scale]);
  }

  return (
    <div id="control-copy-and-paste" className='control'></div>
  )
}


/** 
 * copy the properties of selected figure from data attribute and pass to clipboard
 * @param {*} event use to prevent the default action
 * @returns null
 */
function copyFigure(event) {
  
  if (isInputOrEditorFocused() === true) {
    return;
  }

  // prevent browser copy other things rather than the figures
  event.preventDefault();

  var selectedObjects = document.getElementsByClassName('selected-object');
  if (selectedObjects.length !== 1) {
    return;
  }

  var figureElement = document.getElementById(selectedObjects[0].id);
  var figure = {
    id: figureElement.getAttribute("data-id"),
    boardId: figureElement.getAttribute("data-boardId"),
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
    event.clipboardData.setData("clipclip/editor", JSON.stringify(delta.ops));
  }

  else if (figure.type === 'image') {
    var imageElement = document.getElementById(`${selectedObjects[0].id}-image`)
    event.clipboardData.setData("clipclip/image", imageElement.src);
  }

  else if (figure.type === 'preview') {
    event.clipboardData.setData("clipclip/preview", figure.url);
  }
}


/** 
 * copy the figure properties from data attribute and pass to clipboard
 * @param {*} event 
 * @param {*} scale
 * @param {*} pastingFigure
 * @param {*} reverseActions
 * @param {*} boardId
 * @returns null
 */
async function pasteFigure(event, scale, pastingFigure, reverseActions, boardId){
  // prevent user keep pasting new figure into the canvas by sapmming ctrl+v
  if (pastingFigure.current === true) {
    return;
  }
  pastingFigure.current = true;

  // todo - need to be url focused, not openeded
  if (isInputOrEditorFocused() === true) {
    return;
  }
  
  var position = JSON.parse(localStorage.getItem('position'));
  var cursor = JSON.parse(localStorage.getItem('curosr'));
  position = { x: -(position.x - cursor.x) / scale, y: -(position.y - cursor.y) / scale};

  if (event.clipboardData.types.includes('clipclip/figure')) {
    pasteClipClipType(event, position, reverseActions, boardId);
  }
  else {
    pasteOrdinaryType(event, position, reverseActions, boardId);
  }
  
  setTimeout(() => pastingFigure.current = false, 500);
}


/** 
 * get the figure properties from clipboard (clipclip type) and create new figure 
 * @param {*} event 
 * @param {*} position
 * @param {*} reverseActions
 * @param {*} boardId
 * @returns null
 */
async function pasteClipClipType(event, position, reverseActions, boardId) {
  var figure = JSON.parse(event.clipboardData.getData('clipclip/figure'));

  if (event.clipboardData.types.includes('clipclip/editor')) {
    var quillDelta = JSON.parse(event.clipboardData.getData('clipclip/editor'));
    var response = await FigureApi.createEditor(boardId, position.x, position.y, figure.width, figure.height, figure.type, figure.backgroundColor, figure.url, figure.zIndex, figure.isPinned, null, quillDelta);
    addReverseActions(response, reverseActions);
  }

  else if (event.clipboardData.types.includes('clipclip/preview')) {
    var url = event.clipboardData.getData('clipclip/preview');
    var response = await FigureApi.createPreview(boardId, position.x, position.y, figure.width, figure.height, figure.type, figure.backgroundColor, figure.url, figure.zIndex, figure.isPinned);
    addReverseActions(response, reverseActions);
  }

  else if (event.clipboardData.types.includes('clipclip/image')) {
    var base64 = event.clipboardData.getData('clipclip/image');
    var response = await FigureApi.createImage(boardId, position.x, position.y, figure.width, figure.height, figure.type, figure.backgroundColor, figure.url, figure.zIndex, figure.isPinned, base64, false);
    addReverseActions(response, reverseActions);
  }
}


/** 
 * get the text / image from clipboard (ordinary type) and create new figure 
 * @param {*} event 
 * @param {*} position
 * @param {*} reverseActions
 * @param {*} boardId
 * @returns null
 */
async function pasteOrdinaryType(event, position, reverseActions, boardId) {

  var figure = { boardId: boardId, type: "", width: 400, height: 400, backgroundColor: "rgba(226,245,240,1)", url: "", zIndex: 5, isPinned: false};

  if (event.clipboardData.types.includes('text/plain')) {
    // no idea yet for text/html for converting the style to quill
    const pastedText = event.clipboardData.getData('text/plain');

    var urlPattern = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/
    var isUrl = urlPattern.test(pastedText)

    if (isUrl) {
      var response = await FigureApi.createPreview(boardId, position.x, position.y, figure.width, figure.height, "preview", figure.backgroundColor, pastedText, figure.zIndex, figure.isPinned);
      addReverseActions(response, reverseActions);
    }
    else {
      var response = await FigureApi.createEditor(boardId, position.x, position.y, figure.width, figure.height, "editor", figure.backgroundColor, figure.url, figure.zIndex, figure.isPinned, pastedText, null);
      addReverseActions(response, reverseActions);
    }
  }
  else if (event.clipboardData.types.includes('Files')) {
    const dataTransfer = event.clipboardData;
    const file = dataTransfer.files[0];

    if (file !== null) {
      var reader = new FileReader();
      reader.readAsDataURL(file); // turn the file into base64 string
      reader.onload = async function () {
        var response = await FigureApi.createImage(boardId, position.x, position.y, figure.width, figure.height, "image", figure.backgroundColor, figure.url, figure.zIndex, figure.isPinned, reader.result, true);
        addReverseActions(response, reverseActions);
      };
    }
  } 
}


/** 
 * add the reverse action to array
 * @param {*} response
 * @param {*} reverseActions
 * @returns null
 */
function addReverseActions(response, reverseActions) {

  if (response.status === 200) {
    if (reverseActions.current.length === 30) {
      reverseActions.current.shift();
    }
    reverseActions.current.push({ action: "delete", id: response.data._id });
  }
  else {
    toast(response.data);
  }
}


export default CopyAndPaste