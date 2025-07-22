import * as rdd from 'react-device-detect';
import { useEffect } from 'react';
import FigureApi from '../../api/figureApi.mjs';
import Quill from 'quill'
import { isInputOrEditorFocused } from '../../utlis.mjs';

/** 
 * delete figure using keyboard
 * @param {*} reverseActionsRef 
 * @returns empty div
 */
function DeleteHotKey({reverseActionsRef, figuresRef}) {

  // only for desktop user
  if (rdd.isDesktop) {
    useEffect(() => {
      document.onkeydown = async (event) => await deleteFigure(event, reverseActionsRef, figuresRef);
    }, []);
  }

  return <></>
}


/** 
 * delete the selected figure with delete or backspace key
 * @param {*} event 
 * @param {*} reverseActionsRef 
 * @returns null
 */
async function deleteFigure(event, reverseActionsRef, figuresRef) {

  if (isInputOrEditorFocused() === true) {
    return;
  }

  if (!(event.key === 'Delete' || event.key === 'Backspace')) {
    return;
  }
  
  var selectedObjects = document.getElementsByClassName('selected-object');
  if (selectedObjects.length !== 1) {
    return;
  }

  const selectedFigure = figuresRef.current.find(f => f._id == selectedObjects[0].id);
  if (selectedFigure == undefined) {
    return;
  }

  if (selectedFigure.type === "editor") {
    const container = document.querySelector(`#${selectedFigure.id}-quill`);
    const quill = Quill.find(container);
    const delta = quill.getContents();

    // remove the tailing space in the text
    if (delta.ops.length) {
      const lastOp = delta.ops[delta.ops.length - 1];
      if (typeof lastOp.insert === 'string' && lastOp.insert.endsWith('\n')) {
        lastOp.insert = lastOp.insert.replace(/\n+$/, '');
      }
    }
    selectedFigure.quillDelta = JSON.stringify(delta.ops);
  }

  else if (selectedFigure.type === 'image') {
    var imageElement = document.getElementById(`${selectedObjects[0].id}-image`)
    selectedFigure.base64 = imageElement.src;
  }

  var response = await FigureApi.deleteFigure(selectedFigure.id);
  if (response.status === 200) {
    if (reverseActionsRef.current.length === 30) {
      reverseActionsRef.current.shift();
    }

    if (selectedFigure.type === "editor") {
      reverseActionsRef.current.push({action: "create", id: selectedFigure.id, boardId: selectedFigure.boardId, type: selectedFigure.type, x: selectedFigure.x, y: selectedFigure.y, backgroundColor: selectedFigure.backgroundColor, 
                                   width: selectedFigure.width, height: selectedFigure.height, url: selectedFigure.url, zIndex: selectedFigure.zIndex, isPinned: selectedFigure.isPinned, quillDelta: selectedFigure.quillDelta});
    }
    else if (selectedFigure.type === "image") {
      reverseActionsRef.current.push({action: "create", id: selectedFigure.id, boardId: selectedFigure.boardId, type: selectedFigure.type, x: selectedFigure.x, y: selectedFigure.y, backgroundColor: selectedFigure.backgroundColor, 
                                   width: selectedFigure.width, height: selectedFigure.height, url: selectedFigure.url, zIndex: selectedFigure.zIndex, isPinned: selectedFigure.isPinned, base64: selectedFigure.base64});
    }
    else if (selectedFigure.type === "preview") {
      reverseActionsRef.current.push({action: "create", id: selectedFigure.id, boardId: selectedFigure.boardId, type: selectedFigure.type, x: selectedFigure.x, y: selectedFigure.y, backgroundColor: selectedFigure.backgroundColor, 
                                   width: selectedFigure.width, height: selectedFigure.height, url: selectedFigure.url, zIndex: selectedFigure.zIndex, isPinned: selectedFigure.isPinned});
    }
  }
  else {
    toast(response.data);
  }
}


export default DeleteHotKey