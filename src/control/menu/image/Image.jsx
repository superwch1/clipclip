import { useRef, useEffect } from 'react';
import FigureApi from '../../../server/figureApi.mjs'
import '../Menu.css'
import * as rdd from 'react-device-detect'

/** 
 * click button to upload an image from device
 * @param {*} scale
 * @param {*} reverseActions 
 * @param {*} boardId
 * @returns image button
 */
function Image({scale, reverseActions, boardId, position}) {

  const hiddenFileInput = useRef(null);
  
  return (
    <>
      <div className='control-button' onClick={(event) => createImage(hiddenFileInput)} 
           style={{width: "80px", height: "38px", borderRadius: "20px", border: "1px solid #78290F", display: "flex", justifyContent: "center", alignItems: "center", color: "#78290F", fontWeight: "bold"}} >Upload</div>
        
      <input type="file" ref={hiddenFileInput} onChange={(event) => uploadImage(event, scale, event.target.files[0], reverseActions, boardId, position)} 
             style={{display: 'none'}} accept=".jpg, .jpeg, .heif, .png, .webp, .heic, .gif" />   
    </>
  )
}


/** 
 * click button to invoke a click on hidden input html
 * @param {*} hiddenFileInput 
 * @returns null
 */
function createImage(hiddenFileInput) {
  hiddenFileInput.current.click();
};


/** 
 * open the gallery or dialog box to upload an image
 * @param {*} event
 * @param {*} scale
 * @param {*} file
 * @param {*} reverseActions
 * @param {*} baordId
 * @returns null
 */
async function uploadImage(event, scale, file, reverseActions, boardId, position) {
  var reader = new FileReader();
  reader.readAsDataURL(file); // turn the file into base64 string
  reader.onload = async function () {
    var figurePosition;
    if (rdd.isMobile) {
      figurePosition = { x: -((position.current.x - 50) / scale) , y: -((position.current.y - 120) / scale)};
    }
    else {
      figurePosition = { x: -((position.current.x - 100) / scale) , y: -((position.current.y - 170) / scale)};
    }

    const figure = { boardId: boardId, type: "image", x: figurePosition.x, y: figurePosition.y, width: 400, height: 400, backgroundColor: "rgba(226,245,240,1)", url: "", zIndex: 5, isPinned: false}
    var response = await FigureApi.createImage(figure.boardId, figure.x, figure.y, figure.width, figure.height, figure.type, figure.backgroundColor, figure.url, figure.zIndex, figure.isPinned, reader.result, true);

    if (response.status === 200) {
      if (reverseActions.current.length === 30) {
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


export default Image