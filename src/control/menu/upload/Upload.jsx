import './Upload.css'
import { useRef, useEffect } from 'react';
import FigureApi from '../../../services/webServer/figureApi.mjs'
import UploadButton from './uploadButton.png'



function Upload({scale}) {

  const hiddenFileInput = useRef(null);
  const previewButtonRef = useRef(null);

  const urlRef = useRef(null);
  const choiceRef = useRef(null);

  const controlUrlId = 'control-url';
  const controlChoiceId = 'control-choice';
  const controlChoiceImageId = 'control-choice-image';
  const controlChoiceLinkId = 'control-choice-link';

  onClickOutside(urlRef);
  onClickOutside(choiceRef);

  // trigger the hidden file input click
  function createImage() {
    document.getElementById(controlChoiceId).style.display = 'none';
    hiddenFileInput.current.click();
  };

  
  return (
    <>
      <div ref={previewButtonRef} onClick={(event) => showChoice(controlChoiceId)}>
        <img style={{width: "60px", height: "60px"}} src={UploadButton} />
      </div>
        
      <input type="file" ref={hiddenFileInput} onChange={(event) => uploadImage({event: event, scale: scale, file: event.target.files[0]})} 
              style={{display: 'none'}} accept=".jpg, .jpeg, .heif, .png, .webp, .heic, .gif" />   

      <div id={controlChoiceId} ref={choiceRef}>
        <div onClick={(event) => createImage(controlChoiceId)} id={controlChoiceImageId}>Select a image</div>
        <div onClick={(event) => showInput(controlUrlId, controlChoiceId)} id={controlChoiceLinkId}>Paste a link</div>
      </div>  

      <div id={controlUrlId} ref={urlRef}>
        <input id={`${controlUrlId}-input`} type='text' placeholder="按「回車鍵」傳送完整連結" 
          onKeyDown={(event) => createPreview({event: event, scale: scale, controlUrlId: controlUrlId, url: document.getElementById(`${controlUrlId}-input`).value})}/>
      </div>  
    </>
  )
}


function onClickOutside(ref) {
  useEffect( () => {
    function handleClickOutside (event) {
      if (!(ref.current && !ref.current.contains(event.target))) {
        return;
      }
      document.getElementById(`${ref.current.id}`).style.display = 'none';
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);
}

function showChoice(controlChoiceId) {
  document.getElementById(controlChoiceId).style.display = 'flex';
}


function showInput(controlUrlId, controlChoiceId) {
  document.getElementById(controlChoiceId).style.display = 'none';
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



export default Upload