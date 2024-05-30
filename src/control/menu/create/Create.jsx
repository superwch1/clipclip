import './Create.css'
import { useRef, useEffect } from 'react';
import FigureApi from '../../../services/webServer/figureApi.mjs'
import EditorButton from './editorButton.png'



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
        <div onClick={(event) => createEditor({event: event, scale: scale})}>
          <img className="option-button" src={EditorButton} />
        </div>
        <div onClick={createImage}>
          <img className="option-button" src={EditorButton} />
          <input type="file" ref={hiddenFileInput} onChange={(event) => uploadImage({event: event, scale: scale, file: event.target.files[0]})} 
                 style={{display: 'none'}} accept=".jpg, .jpeg, .heif, .png, .webp, .heic, .gif" />
        </div>
        <div ref={previewButtonRef} onClick={(event) => showInput(controlUrlId)}>
          <img className="option-button" src={EditorButton} />
        </div>
      </div>
      <div id={`${controlUrlId}`} ref={urlRef}>
        <input id={`${controlUrlId}-input`} type='text' placeholder="按「回車鍵」傳送完整連結" 
          onKeyDown={(event) => createPreview({event: event, scale: scale, controlUrlId: controlUrlId, url: document.getElementById(`${controlUrlId}-input`).value})}/>
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


async function createEditor({event, scale}) { 
  var position = JSON.parse(localStorage.getItem('position'));
  var figurePosition = { x: -(position.x / scale) + 100, y: -(position.y / scale) + 100};
  
  const figure = { type: "editor", x: figurePosition.x, y: figurePosition.y, width: 400, height: 400, backgroundColor: "rgba(226,245,240,1)", url: "", zIndex: 5, isPinned: false};
  await FigureApi.createEditor(figure, null, null);
}


async function showInput(controlUrlId) {
  document.getElementById(controlUrlId).style.display = 'initial';
}


async function createPreview({event, controlUrlId, position, scale, url}) {
  if (event.key === 'Enter' || event.keyCode === 13) {

    var position = JSON.parse(localStorage.getItem('position'));
    var figurePosition = { x: -(position.x / scale) + 100, y: -(position.y / scale) + 100};

    const figure = { type: "preview", x: figurePosition.x, y: figurePosition.y, width: 400, height: 400, backgroundColor: "rgba(226,245,240,1)", zIndex: 5, isPinned: false}
    await FigureApi.createPreview(figure, url);

    document.getElementById(controlUrlId).value = '';
    document.getElementById(controlUrlId).style.display = 'none';
  }
}


async function uploadImage({event, scale, file}) {
  var reader = new FileReader();
  reader.readAsDataURL(file); // turn the file into base64 string
  reader.onload = async function () {
    var position = JSON.parse(localStorage.getItem('position'));
    var figurePosition = { x: -(position.x / scale) + 100, y: -(position.y / scale) + 100};

    const figure = { type: "image", x: figurePosition.x, y: figurePosition.y, width: 400, height: 400, backgroundColor: "rgba(226,245,240,1)", url: "", zIndex: 5, isPinned: false}
    await FigureApi.createImage(figure, reader.result, true);
  };

  // clear the file input's value to allow uploading same file twice for onChange
  event.target.value = null;
};



export default Create