import './Create.css'
import crossWhite from './crossWhite.png'
import crossBrown from './crossBrown.png'
import axios from 'axios'
import { useRef, useEffect } from 'react';
import Config from '../../config/Config'

function Create({scale}) {

  const hiddenFileInput = useRef(null);
  const urlRef = useRef(null);
  const previewButtonRef = useRef(null);

  const controlUrlId = 'control-url';
  onClickOutsideColorPicker(urlRef, previewButtonRef, controlUrlId);

  // trigger the hidden file input click
  function createImage() {
    hiddenFileInput.current.click();
  };

  useEffect(() => {
    document.getElementById(controlUrlId).style.display = 'none';
  }, []);
  
  useEffect(() => {
    // need to use debounce to prevent multiple pasting
    document.onpaste = async (event) => {
      console.log(event.clipboardData.types);
      console.log(event.clipboardData.getData('text/html'))

      if (event.clipboardData.types.includes('text/plain')) {
        const pastedText = event.clipboardData.getData('text/plain');
        await createEditor(null, scale, pastedText);
      }
      else if (event.clipboardData.types.includes('Files')) {
        const dataTransfer = event.clipboardData || window.clipboardData;
        const file = dataTransfer.files[0];
        if (file !== null) {
          await uploadImage(null, scale, file);
        }
      } 
    };
  }, [scale]);

  return (
    <>
      <div id="control-create">
        <div className="option-text" ref={previewButtonRef} onClick={(event) => showInput(controlUrlId)}>連結</div>
        <div className="option-text" onClick={createImage}>相片
          <input type="file" ref={hiddenFileInput} onChange={(event) => uploadImage(event, scale, event.target.files[0])} style={{display: 'none'}} accept=".jpg, .jpeg, .gif, .png, .webp" />
        </div>
        <div className="option-symbol" onClick={(event) => createEditor(event, scale, "")}
            onMouseOver={(event) => document.getElementById('option-cross').setAttribute('src', crossBrown)} 
            onMouseOut={(event) => document.getElementById('option-cross').setAttribute('src', crossWhite)}>
          <img src={crossWhite} id='option-cross'/>
        </div>
      </div>
      <div id={`${controlUrlId}`} ref={urlRef}>
        <input id='option-url' type='text' placeholder="按「回車鍵」傳送連結" onKeyDown={(event) => createPreview(event, controlUrlId, scale)}/>
        </div>  
    </>
  )
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

async function createEditor(event, scale, pastedText) { 
  // it should be using the value from translate since if the user move out of the bound
  // the value of coordinate may not be saved into the local storage
  var element = document.getElementsByClassName('react-transform-component');
  var style = window.getComputedStyle(element[0]);
  var matrix = new WebKitCSSMatrix(style.transform);  
  const figure = { type: "editor", pastedText: pastedText, x: -(matrix.m41 / scale) + 100, y: -(matrix.m42 / scale) + 100, width: 400, height: 400, backgroundColor: "rgba(226,245,240,1)", url: "", zIndex: 5}
  await axios.post(`${Config.url}/editor`, figure);
}

async function showInput(controlUrlId) {
  document.getElementById(controlUrlId).style.display = 'initial';
}

async function createPreview(event, controlUrlId, scale) {
  if (event.key === 'Enter' || event.keyCode === 13) {

    var element = document.getElementsByClassName('react-transform-component');
    var style = window.getComputedStyle(element[0]);
    var matrix = new WebKitCSSMatrix(style.transform);  
    const figure = { type: "preview", x: -(matrix.m41 / scale) + 100, y: -(matrix.m42 / scale) + 100, width: 400, height: 400, backgroundColor: "rgba(226,245,240,1)", 
                     url: document.getElementById('option-url').value, zIndex: 5}
    await axios.post(`${Config.url}/preview`, figure);

    document.getElementById('option-url').value = '';
    document.getElementById(controlUrlId).style.display = 'none';
  }
}

async function uploadImage(event, scale, file) {
  const formData = new FormData();
  formData.append("image", file);

  var element = document.getElementsByClassName('react-transform-component');
  var style = window.getComputedStyle(element[0]);
  var matrix = new WebKitCSSMatrix(style.transform);  
  const figure = { type: "image", x: -(matrix.m41 / scale) + 100, y: -(matrix.m42 / scale) + 100, width: 400, height: 400, backgroundColor: "rgba(226,245,240,1)", url: "", zIndex: 5}
  formData.append('figure', JSON.stringify(figure));

  await axios.post(`${Config.url}/image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  if (event !== null) {
    // only for upload using the button, not for control C + V
    // clear the file input's value to allow uploading same file twice for onChange
    event.target.value = null;
  }
};



export default Create