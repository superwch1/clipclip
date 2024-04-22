import './Create.css'
import crossWhite from './crossWhite.png'
import crossBrown from './crossBrown.png'
import axios from 'axios'
import { useRef } from 'react';
import Config from '../../config/Config'

function Create({scale}) {

  const hiddenFileInput = useRef(null);

  // trigger the hidden file input click
  function createImage() {
    hiddenFileInput.current.click();
  };

  // y position stil not correct

  return (
    <div id="control-create">
      <div className="option-text" onClick={(event) => createPreview(event, scale)}>連結</div>
      <div className="option-text" onClick={createImage}>相片
        <input type="file" ref={hiddenFileInput} onChange={(event) => uploadImage(event, scale)} style={{display: 'none'}} accept="image/*" />
      </div>
      <div className="option-symbol" onClick={(event) => createEditor(event, scale)}
           onMouseOver={(event) => document.getElementById('option-cross').setAttribute('src', crossBrown)} 
           onMouseOut={(event) => document.getElementById('option-cross').setAttribute('src', crossWhite)}>
        <img src={crossWhite} id='option-cross'/>
      </div>
    </div>
  )
}


async function createEditor(event, scale) { 
  console.log(`${window.scrollX } ${window.scrollY }`)
  const figure = { type: "editor", x: window.scrollX + 100, y: window.scrollY + 100, width: 400, height: 400, backgroundColor: "rgba(226,245,240,1)", url: "", zIndex: 5}
  const response = await axios.post(`${Config.url}/editor`, figure);
}

async function createPreview(event, scale) {
  const figure = { type: "preview", x: window.scrollX + 100, y: window.scrollY + 100, width: 400, height: 400, backgroundColor: "rgba(226,245,240,1)", url: "https://www.youtube.com", zIndex: 5}
  const response = await axios.post(`${Config.url}/editor`, figure);
}


async function uploadImage(event, scale) {
  const file = event.target.files[0];
  const formData = new FormData();
  formData.append("image", file);

  const figure = { type: "image", x: window.scrollX + 100, y: window.scrollY + 100, width: 400, height: 400, backgroundColor: "rgba(226,245,240,1)", url: "", zIndex: 5}
  formData.append('figure', JSON.stringify(figure));

  var response = await axios.post(`${Config.url}/image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  // clear the file input's value to allow uploading same file twice for onChange
  event.target.value = null;
};



export default Create