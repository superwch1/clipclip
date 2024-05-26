import * as rdd from 'react-device-detect';
import { useRef, useEffect } from 'react';
import FigureApi from '../../services/webServer/figureApi.mjs';
import { isUrlFocusedOrEditorFocused } from '../utlis.mjs';
import Quill from 'quill'


function CutAndDelete() {

  // only for desktop user
  if (rdd.isDesktop) {
    useEffect(() => {
      document.onkeydown = async (event) => await deleteFigure(event);
      document.oncut = async (event) => await cutFigure(event);
    }, []);
  }

  return (
    <div id="control-cut-and-delete" className='control'></div>
  )
}

async function deleteFigure(event) {

  if (isUrlFocusedOrEditorFocused() === true || event.key !== 'Delete') {
    return;
  }
  
  var selectedObjects = document.getElementsByClassName('selected-object');
  if (selectedObjects.length !== 1) {
    return;
  }

  var figureElement = document.getElementById(selectedObjects[0].id);
  await FigureApi.deleteFigure(figureElement.id);
}


async function cutFigure(event) {
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

    event.clipboardData.setData("clipclip/editor", JSON.stringify(delta.ops));
  }
  else if (figure.type === 'image') {
    var imageElement = document.getElementById(`${selectedObjects[0].id}-image`)
    event.clipboardData.setData("clipclip/image", imageElement.src);
  }
  else if (figure.type === 'preview') {
    event.clipboardData.setData("clipclip/preview", figure.url);
  }

  await FigureApi.deleteFigure(figureElement.id);
}


export default CutAndDelete

