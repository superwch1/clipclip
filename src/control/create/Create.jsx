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
  

  return (
    <>
      <div id="control-create" className='control'>
        <div className="option-text" ref={previewButtonRef} onClick={(event) => showInput(controlUrlId)}>連結</div>
        <div className="option-text" onClick={createImage}>相片
          <input type="file" ref={hiddenFileInput} onChange={(event) => uploadImage({event: event, position: null, scale: scale, file: event.target.files[0]})} 
                 style={{display: 'none'}} accept=".jpg, .jpeg, .heif, .png, .webp, .heic, .gif" />
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
  if (event.key === 'Enter' || event.keyCode === 13) {

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

  // clear the file input's value to allow uploading same file twice for onChange
  event.target.value = null;
};



export default Create