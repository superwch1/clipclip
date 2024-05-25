import * as rdd from 'react-device-detect';
import Quill from 'quill'
import { useRef, useEffect } from 'react';
import axios from 'axios'
import Config from '../../config/Config'
import FigureApi from '../../services/webServer/figureApi.mjs';

function CopyAndPaste({scale}) {

  const pastingFigure = useRef(false);

  // only for desktop user with cursor position
  if (rdd.isDesktop) {
    useEffect(() => {
      document.onpaste = async (event) => await pasteFigure(event, scale, pastingFigure); // can't use loudash since the event cannot be passed to the function in loudash
      document.oncopy = (event) => copyFigure(event); // can't use async here
    }, [scale]);
  }

  return (
      <div id="control-copy-and-paste" className='control'></div>
  )
}


function copyFigure(event) {

  if (isUrlEditedOrEditorFocused() === true) {
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
    type: figureElement.getAttribute("data-type"),
    width: parseInt(figureElement.getAttribute("data-width")),
    height: parseInt(figureElement.getAttribute("data-height")),
    x: parseInt(figureElement.getAttribute("data-x")),
    y: parseInt(figureElement.getAttribute("data-y")),
    zIndex: parseInt(figureElement.getAttribute("data-zindex")),
    url: figureElement.getAttribute("data-url"),
    backgroundColor: figureElement.getAttribute("data-backgroundcolor")
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
}


async function pasteFigure(event, scale, pastingFigure){
  // prevent user keep pasting new figure into the canvas
  if (pastingFigure.current === true) {
    return;
  }
  pastingFigure.current = true;
  setTimeout(() => pastingFigure.current = false, 500); // prevent spamming ctrl+v

  // todo - need to be url focused, not openeded
  if (isUrlEditedOrEditorFocused() === true) {
    return;
  }
  
  var position = JSON.parse(localStorage.getItem('position'));
  var cursor = JSON.parse(localStorage.getItem('curosr'));

  // 200 for taking the middle position since the default width and height is 400px
  // position = { x: -(position.x - cursor.x) / scale - 200, y: -(position.y - cursor.y) / scale - 200};
  position = { x: -(position.x - cursor.x) / scale, y: -(position.y - cursor.y) / scale};

  if (event.clipboardData.types.includes('clipclip/figure')) {
    pasteClipClipType(event, position);
  }
  else {
    pasteOrdinaryType(event, position);
  }
  
}

async function pasteClipClipType(event, position) {
  var figure = JSON.parse(event.clipboardData.getData('clipclip/figure'));
  figure.x = position.x;
  figure.y = position.y;

  if (event.clipboardData.types.includes('clipclip/editor')) {
    var quillDelta = JSON.parse(event.clipboardData.getData('clipclip/editor'));
    await FigureApi.createEditor(figure, null, quillDelta);
  }
  else if (event.clipboardData.types.includes('clipclip/preview')) {
    var url = event.clipboardData.getData('clipclip/preview');
    await FigureApi.createPreview(figure, url);
  }
  else if (event.clipboardData.types.includes('clipclip/image')) {
    var base64 = event.clipboardData.getData('clipclip/image');
    await FigureApi.createImage(figure, base64, false);
  }
}

async function pasteOrdinaryType(event, position) {

  var figure = { type: "", x: position.x, y: position.y, width: 400, height: 400, backgroundColor: "rgba(226,245,240,1)", url: "", zIndex: 5};

  if (event.clipboardData.types.includes('text/plain')) {
    // no idea yet for text/html for converting the style to quill
    const pastedText = event.clipboardData.getData('text/plain');

    var urlPattern = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/
    var isUrl = urlPattern.test(pastedText)

    if (isUrl) {
      figure.type = "preview";
      await FigureApi.createPreview(figure, pastedText);
    }
    else {
      figure.type = "editor";
      await FigureApi.createEditor(figure, pastedText, null);
    }
  }
  else if (event.clipboardData.types.includes('Files')) {
    const dataTransfer = event.clipboardData;
    const file = dataTransfer.files[0];

    if (file !== null) {
      var reader = new FileReader();
      reader.readAsDataURL(file); // turn the file into base64 string
      reader.onload = async function () {
        figure.type = "image";
        await FigureApi.createImage(figure, reader.result, true);
      };
    }
  } 
}

  
function isUrlEditedOrEditorFocused() {
  var controlUrl = document.getElementById('control-url');
  var selectedObjects = document.getElementsByClassName('selected-object');
  var isEditorFocused = false;

  for (let i = 0; i < selectedObjects.length; i++) {
    if (selectedObjects[i].classList.contains('editor')) {

      const container = document.querySelector(`#${selectedObjects[i].id}-quill`);
      const quill = Quill.find(container);
      isEditorFocused = quill.hasFocus();
    }
  }
  
  // only paste items when user is not pasting url and no editor is current selected
  if (controlUrl.style.display !== 'none' || isEditorFocused !== false) {
    return true;
  }
  return false;
}

export default CopyAndPaste

