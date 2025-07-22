import * as rdd from 'react-device-detect';
import Quill from 'quill'
import { useEffect } from 'react';
import { isInputOrEditorFocused } from '../../utlis.mjs';

/** 
 * copy figure using keyboard
 * @param {*} scale
 * @param {*} reverseActionsRef 
 * @param {*} boardId 
 * @param {*} cursorRef
 * @param {*} positionRef
 * @returns empty div
 */
function CopyHotKey({figuresRef}) {

  // only for desktop user with cursor position
  if (rdd.isDesktop) {
    useEffect(() => {
      document.oncopy = (event) => copyFigure(event, figuresRef); // can't use async here
    }, []);
  }

  return <></>
}


/** 
 * copy the properties of selected figure from data attribute and pass to clipboard
 * @param {*} event use to prevent the default action
 * @returns null
 */
function copyFigure(event, figuresRef) {
  
  if (isInputOrEditorFocused() === true) {
    return;
  }

  // prevent browser copy other things rather than the figures
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
    event.clipboardData.setData("clipclip/editor", JSON.stringify(delta.ops));
  }

  else if (selectedFigure.type === 'image') {
    var imageElement = document.getElementById(`${selectedObjects[0].id}-image`)
    event.clipboardData.setData("clipclip/image", imageElement.src);
  }

  // no need for preview since url is already stored in figure properties
}

export default CopyHotKey