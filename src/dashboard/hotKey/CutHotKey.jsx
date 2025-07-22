import * as rdd from 'react-device-detect';
import { useEffect } from 'react';
import Quill from 'quill'
import figureApi from '../../api/figureApi.mjs';
import { isInputOrEditorFocused } from '../../utlis.mjs';

/** 
 * cut figure using keyboard
 * @param {*} reverseActionsRef 
 * @returns empty div
 */
function CutHotKey({reverseActionsRef, figuresRef}) {

  // only for desktop user
  if (rdd.isDesktop) {
    useEffect(() => {
      document.oncut = async (event) => await cutFigure(event, reverseActionsRef, figuresRef);
    }, []);
  }

  return <></>
}


/** 
 * get the properties of selected figure from data attribute and pass to clipboard
 * @param {*} event use to prevent the default action
 * @returns null
 */
async function cutFigure(event, reverseActionsRef, figuresRef) {
  if (isInputOrEditorFocused() === true) {
    return;
  }

  // prevent browser cut other things rather than the figures
  event.preventDefault();

  var selectedObjects = document.getElementsByClassName('selected-object');
  if (selectedObjects.length !== 1) {
    return;
  }

  const selectedFigure = figuresRef.current.find(f => f._id == selectedObjects[0].id);
  if (selectedFigure == undefined) {
    return;
  }

  event.clipboardData.setData("clipclip/figure", JSON.stringify(selectedFigure));
  
  if (selectedFigure.type === "editor") {
    const container = document.querySelector(`#${selectedFigure._id}-quill`);
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
    selectedFigure.quillDelta = JSON.stringify(delta.ops); // for reverse
  }
  else if (selectedFigure.type === 'image') {
    var imageElement = document.getElementById(`${selectedObjects[0].id}-image`)
    event.clipboardData.setData("clipclip/image", imageElement.src); // for clipboard
    selectedFigure.base64 = imageElement.src; // for reverse
  }
  // no need for preview since url is already stored in figure properties

  var response = await figureApi.deleteFigure(selectedFigure._id);

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


export default CutHotKey