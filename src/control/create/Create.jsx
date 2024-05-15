import './Create.css'
import crossWhite from './crossWhite.png'
import crossBrown from './crossBrown.png'
import axios from 'axios'
import { useRef, useEffect } from 'react';
import Config from '../../config/Config'
import * as rdd from 'react-device-detect';
import Quill from 'quill'
import { Buffer } from "buffer";


function Create({scale}) {

  const hiddenFileInput = useRef(null);
  const urlRef = useRef(null);
  const previewButtonRef = useRef(null);

  const pastingFigure = useRef(false);

  const controlUrlId = 'control-url';
  onClickOutsideColorPicker(urlRef, previewButtonRef, controlUrlId);

  // trigger the hidden file input click
  function createImage() {
    hiddenFileInput.current.click();
  };

  useEffect(() => {
    document.getElementById(controlUrlId).style.display = 'none';
  }, []);
  

  // only for desktop user with cursor position
  if (rdd.isDesktop) {
    useEffect(() => {

      // it cannot use loudash since the event cannot be passed to the function
      document.onpaste = async (event) => await pasteFigure(event, scale, pastingFigure, controlUrlId);

      // can't use async here
      document.oncopy = (event) => {
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
    }, [scale]);
  }

  return (
    <>
      <div id="control-create">
        <div className="option-text" ref={previewButtonRef} onClick={(event) => showInput(controlUrlId)}>連結</div>
        <div className="option-text" onClick={createImage}>相片
          <input type="file" ref={hiddenFileInput} onChange={(event) => uploadImage({event: event, position: null, scale: scale, file: event.target.files[0]})} 
                 style={{display: 'none'}} accept=".jpg, .jpeg, .gif, .png, .webp" />
        </div>
        <div className="option-symbol" onClick={(event) => createEditor({event: event, position: null, scale: scale, pastedText: ""})}
            onMouseOver={(event) => document.getElementById('option-cross').setAttribute('src', crossBrown)} 
            onMouseOut={(event) => document.getElementById('option-cross').setAttribute('src', crossWhite)}>
          <img src={crossWhite} id='option-cross'/>
        </div>
      </div>
      <div id={`${controlUrlId}`} ref={urlRef}>
        <input id='option-url' type='text' placeholder="按「回車鍵」傳送完整連結" 
          onKeyDown={(event) => createPreview({event: event, position: null, scale: scale, controlUrlId: controlUrlId, url: document.getElementById('option-url').value})}/>
        </div>  
    </>
  )
}

async function pasteFigure(event, scale, pastingFigure, controlUrlId){
  // prevent user keep pasting new figure into the canvas
  if (pastingFigure.current === true) {
    return;
  }
  pastingFigure.current = true;
  setTimeout(() => pastingFigure.current = false, 1000); // prevent spamming ctrl+v

  if (isUrlEditedOrEditorSelected() === true) {
    return;
  }
  
  var position = JSON.parse(localStorage.getItem('position'));
  var cursor = JSON.parse(localStorage.getItem('curosr'));

  // 200 for taking the middle position since the default width and height is 400px
  // position = { x: -(position.x - cursor.x) / scale - 200, y: -(position.y - cursor.y) / scale - 200};
  position = { x: -(position.x - cursor.x) / scale, y: -(position.y - cursor.y) / scale};

  if (event.clipboardData.types.includes('clipclip/figure')) {
    
    var figure = JSON.parse(event.clipboardData.getData('clipclip/figure'));
    figure.x = position.x;
    figure.y = position.y;

    if (event.clipboardData.types.includes('clipclip/editor')) {
      var pastedText = JSON.parse(event.clipboardData.getData('clipclip/editor'));
      await axios.post(`${Config.url}/pasteEditor`, {figure: figure, pastedText: pastedText});
    }
    else if (event.clipboardData.types.includes('clipclip/preview')) {
      var url = event.clipboardData.getData('clipclip/preview');
      await axios.post(`${Config.url}/pastePreview`, {figure: figure, url: url});
    }
    else if (event.clipboardData.types.includes('clipclip/image')) {
      var base64 = event.clipboardData.getData('clipclip/image');
      await axios.post(`${Config.url}/pasteImage`, {figure: figure, base64: base64});
    }
  }
  else if (event.clipboardData.types.includes('text/plain')) {

    // no idea yet for text/html for converting the style to quill
    const pastedText = event.clipboardData.getData('text/plain');

    var urlPattern = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/
    var isUrl = urlPattern.test(pastedText)

    if (isUrl) {
      await createPreview({event: null, position: position, controlUrlId: controlUrlId, scale: scale, url: pastedText})
    }
    else {
      await createEditor({event: null, position: position, scale: scale, pastedText: pastedText});
    }
  }
  else if (event.clipboardData.types.includes('Files')) {
    const dataTransfer = event.clipboardData;
    const file = dataTransfer.files[0];
    if (file !== null) {
      await uploadImage({event: null, position: position, scale: scale, file: file});
    }
  } 
}

function isUrlEditedOrEditorSelected() {
  var controlUrl = document.getElementById('control-url');
  var selectedObjects = document.getElementsByClassName('selected-object');
  var isEditorSelected = false;

  for (let i = 0; i < selectedObjects.length; i++) {
    if (selectedObjects[i].classList.contains('editor')) {
      isEditorSelected = true;
    }
  }
  
  // only paste items when user is not pasting url and no editor is current selected
  if (controlUrl.style.display !== 'none' || isEditorSelected !== false) {
    return true;
  }
  return false;
}

function onClickOutsideColorPicker(urlRef, previewButtonRef, controlUrlId) {
  useEffect( () => {
    function handleClickOutside (event) {
      if (!(urlRef.current && !urlRef.current.contains(event.target)) || !(previewButtonRef.current && !previewButtonRef.current.contains(event.target))) {
        return;
      }
      document.getElementById(`${controlUrlId}`).style.display = 'none';
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [urlRef, previewButtonRef]);
}

async function createEditor({event, position, scale, pastedText}) { 
  if (position === null) {
    position = JSON.parse(localStorage.getItem('position'));
    position = { x: -(position.x / scale) + 100, y: -(position.y / scale) + 100};
  }
  const figure = { type: "editor", pastedText: pastedText, x: position.x, y: position.y, width: 400, height: 400, backgroundColor: "rgba(226,245,240,1)", url: "", zIndex: 5}
  await axios.post(`${Config.url}/editor`, figure);
}

async function showInput(controlUrlId) {
  document.getElementById(controlUrlId).style.display = 'initial';
}

async function createPreview({event, controlUrlId, position, scale, url}) {
  // event is null while using paste, otherwise, user press enter in the url input box
  if (event === null || event.key === 'Enter' || event.keyCode === 13) {

    if (position === null) {
      position = JSON.parse(localStorage.getItem('position'));
      position = { x: -(position.x / scale) + 100, y: -(position.y / scale) + 100};
    }
    const figure = { type: "preview", x: position.x, y: position.y, width: 400, height: 400, backgroundColor: "rgba(226,245,240,1)", url: url, zIndex: 5}
    await axios.post(`${Config.url}/preview`, figure);

    document.getElementById(controlUrlId).value = '';
    document.getElementById(controlUrlId).style.display = 'none';
  }
}

async function uploadImage({event, position, scale, file}) {
  const formData = new FormData();
  formData.append("image", file);

  if (position === null) {
    position = JSON.parse(localStorage.getItem('position'));
    position = { x: -(position.x / scale) + 100, y: -(position.y / scale) + 100};
  }
  const figure = { type: "image", x: position.x, y: position.y, width: 400, height: 400, backgroundColor: "rgba(226,245,240,1)", url: "", zIndex: 5}
  formData.append('figure', JSON.stringify(figure));

  await axios.post(`${Config.url}/image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  if (event !== null) {
    // only for upload using the button, not for pasting
    // clear the file input's value to allow uploading same file twice for onChange
    event.target.value = null;
  }
};



export default Create