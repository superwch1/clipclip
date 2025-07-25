import * as rdd from 'react-device-detect';
import { useRef, useEffect } from 'react';
import FigureApi from '../../api/figureApi.mjs';
import { isInputOrEditorFocused } from '../../utlis.mjs';
import { toast } from 'react-toastify';

/** 
 * copy and paste figure using keyboard
 * @param {*} scale
 * @param {*} reverseActionsRef 
 * @param {*} boardId 
 * @param {*} cursorRef
 * @param {*} positionRef
 * @returns empty div
 */
function PasteHotKey({scale, reverseActionsRef, boardIdRef, cursorRef, positionRef}) {

  const pastingFigureRef = useRef(false);

  // only for desktop user with cursor position
  if (rdd.isDesktop) {
    useEffect(() => {
      // can't use loudash since the event cannot be passed to the function in loudash
      document.onpaste = async (event) => await pasteFigure(event, scale, pastingFigureRef, reverseActionsRef, boardIdRef, cursorRef, positionRef); 
    }, [scale]);
  }

  return <></>
}


/** 
 * copy the figure properties from data attribute and pass to clipboard
 * @param {*} event 
 * @param {*} scale
 * @param {*} pastingFigureRef
 * @param {*} reverseActionsRef
 * @param {*} boardId
 * @returns null
 */
async function pasteFigure(event, scale, pastingFigureRef, reverseActionsRef, boardIdRef, cursorRef, positionRef){
  
  // prevent user keep pasting new figure into the canvas by sapmming ctrl+v
  if (pastingFigureRef.current === true) {
    return;
  }
  pastingFigureRef.current = true;

  // todo - need to be url focused, not openeded
  if (isInputOrEditorFocused() === true) {
    return;
  }
  
  var figurePosition = { x: -(positionRef.current.x - cursorRef.current.x) / scale, y: -(positionRef.current.y - cursorRef.current.y) / scale};

  if (event.clipboardData.types.includes('clipclip/figure')) {
    pasteClipClipType(event, figurePosition, reverseActionsRef, boardIdRef);
  }
  else {
    pasteOrdinaryType(event, figurePosition, reverseActionsRef, boardIdRef);
  }
  
  setTimeout(() => pastingFigureRef.current = false, 500);
}


/** 
 * get the figure properties from clipboard (clipclip type) and create new figure 
 * @param {*} event 
 * @param {*} position
 * @param {*} reverseActionsRef
 * @param {*} boardId
 * @returns null
 */
async function pasteClipClipType(event, position, reverseActionsRef, boardIdRef) {
  var figure = JSON.parse(event.clipboardData.getData('clipclip/figure'));

  if (event.clipboardData.types.includes('clipclip/editor')) {
    var quillDelta = JSON.parse(event.clipboardData.getData('clipclip/editor'));
    var response = await FigureApi.createEditor(boardIdRef.current, position.x, position.y, figure.width, figure.height, figure.type, figure.backgroundColor, figure.url, figure.zIndex, figure.isPinned, null, quillDelta);
    addreverseActions(response, reverseActionsRef);
  }

  else if (event.clipboardData.types.includes('clipclip/preview')) {
    var response = await FigureApi.createPreview(boardIdRef.current, position.x, position.y, figure.width, figure.height, figure.type, figure.backgroundColor, figure.url, figure.zIndex, figure.isPinned);
    addreverseActions(response, reverseActionsRef);
  }

  else if (event.clipboardData.types.includes('clipclip/image')) {
    var base64 = event.clipboardData.getData('clipclip/image');
    var response = await FigureApi.createImage(boardIdRef.current, position.x, position.y, figure.width, figure.height, figure.type, figure.backgroundColor, figure.url, figure.zIndex, figure.isPinned, base64, false);
    addreverseActions(response, reverseActionsRef);
  }
}


/** 
 * get the text / image from clipboard (ordinary type) and create new figure 
 * @param {*} event 
 * @param {*} position
 * @param {*} reverseActionsRef
 * @param {*} boardIdRef
 * @returns null
 */
async function pasteOrdinaryType(event, position, reverseActionsRef, boardIdRef) {

  var figure = { boardId: boardIdRef.current, type: "", width: 400, height: 400, backgroundColor: "rgba(226,245,240,1)", url: "", zIndex: 5, isPinned: false};

  if (event.clipboardData.types.includes('text/plain')) {
    // no idea yet for text/html for converting the style to quill
    const pastedText = event.clipboardData.getData('text/plain');

    var urlPattern = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/
    var isUrl = urlPattern.test(pastedText)

    if (isUrl) {
      var response = await FigureApi.createPreview(boardIdRef.current, position.x, position.y, figure.width, figure.height, "preview", figure.backgroundColor, pastedText, figure.zIndex, figure.isPinned);
      addreverseActions(response, reverseActionsRef);
    }
    else {
      var response = await FigureApi.createEditor(boardIdRef.current, position.x, position.y, figure.width, figure.height, "editor", figure.backgroundColor, figure.url, figure.zIndex, figure.isPinned, pastedText, null);
      addreverseActions(response, reverseActionsRef);
    }
  }
  else if (event.clipboardData.types.includes('Files')) {
    const dataTransfer = event.clipboardData;
    const file = dataTransfer.files[0];

    if (file !== null) {
      var reader = new FileReader();
      reader.readAsDataURL(file); // turn the file into base64 string
      reader.onload = async function () {
        var response = await FigureApi.createImage(boardIdRef.current, position.x, position.y, figure.width, figure.height, "image", figure.backgroundColor, figure.url, figure.zIndex, figure.isPinned, reader.result, true);
        addreverseActions(response, reverseActionsRef);
      };
    }
  } 
}


/** 
 * add the reverse action to array
 * @param {*} response
 * @param {*} reverseActionsRef
 * @returns null
 */
function addreverseActions(response, reverseActionsRef) {

  if (response.status === 200) {
    if (reverseActionsRef.current.length === 30) {
      reverseActionsRef.current.shift();
    }
    reverseActionsRef.current.push({ action: "delete", id: response.data._id });
  }
  else {
    toast(response.data);
  }
}


export default PasteHotKey