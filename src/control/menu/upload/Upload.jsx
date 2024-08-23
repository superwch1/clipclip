import './Upload.css'
import { useRef, useEffect } from 'react';
import FigureApi from '../../../services/webServer/figureApi.mjs'
import UploadButton from './uploadButton.png'



function Upload({scale, reverseActions}) {

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
        
      <input type="file" ref={hiddenFileInput} onChange={(event) => uploadImage(event, scale, event.target.files[0], reverseActions)} 
              style={{display: 'none'}} accept=".jpg, .jpeg, .heif, .png, .webp, .heic, .gif" />   

      <div id={controlChoiceId} ref={choiceRef}>
        <div onClick={(event) => createImage(controlChoiceId)} id={controlChoiceImageId}>Select a image</div>
        <div onClick={(event) => showInput(controlUrlId, controlChoiceId)} id={controlChoiceLinkId}>Paste a link</div>
      </div>  

      <div id={controlUrlId} ref={urlRef}>
        <input id={`${controlUrlId}-input`} type='text' placeholder="按「回車鍵」傳送完整連結" 
          onKeyDown={(event) => createPreview(event, controlUrlId, scale, document.getElementById(`${controlUrlId}-input`).value, reverseActions)}/>
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


async function createPreview(event, controlUrlId, scale, url, reverseActions) {
  if (event.key === 'Enter' || event.keyCode === 13) {

    var position = JSON.parse(localStorage.getItem('position'));
    var figurePosition = { x: -(position.x / scale) + 100, y: -(position.y / scale) + 100};

    const figure = { type: "preview", x: figurePosition.x, y: figurePosition.y, width: 400, height: 400, backgroundColor: "rgba(226,245,240,1)", url: url, zIndex: 5, isPinned: false}
    var response = await FigureApi.createPreview(figure.x, figure.y, figure.width, figure.height, figure.type, figure.backgroundColor, figure.url, figure.zIndex, figure.isPinned);

    console.log(controlUrlId);

    document.getElementById(controlUrlId).value = '';
    document.getElementById(controlUrlId).style.display = 'none';


    if (response.status === 200) {
      if (reverseActions.current.length === 20) {
        reverseActions.current.shift();
      }
  
      reverseActions.current.push({ action: "delete", id: response.data._id });
    }
    else {
      toast(response.data);
    }
  }
}


async function uploadImage(event, scale, file, reverseActions) {
  var reader = new FileReader();
  reader.readAsDataURL(file); // turn the file into base64 string
  reader.onload = async function () {
    var position = JSON.parse(localStorage.getItem('position'));
    var figurePosition = { x: -(position.x / scale) + 100, y: -(position.y / scale) + 100};

    const figure = { type: "image", x: figurePosition.x, y: figurePosition.y, width: 400, height: 400, backgroundColor: "rgba(226,245,240,1)", url: "", zIndex: 5, isPinned: false}
    var response = await FigureApi.createImage(figure.x, figure.y, figure.width, figure.height, figure.type, figure.backgroundColor, figure.url, figure.zIndex, figure.isPinned, reader.result, true);

    if (response.status === 200) {
      if (reverseActions.current.length === 20) {
        reverseActions.current.shift();
      }
  
      reverseActions.current.push({ action: "delete", id: response.data._id });
    }
    else {
      toast(response.data);
    }
  };

  // clear the file input's value to allow uploading same file twice for onChange
  event.target.value = null;
};



export default Upload