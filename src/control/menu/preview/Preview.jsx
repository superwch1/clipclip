import { useRef, useEffect } from 'react';
import FigureApi from '../../../server/figureApi.mjs'
import '../Menu.css'
import { toast } from 'react-toastify';
import * as rdd from 'react-device-detect'


/** 
 * click button to create a preview for link
 * @param {*} scale
 * @param {*} reverseActionsRef 
 * @param {*} boardId
 * @returns image button
 */
function Preview({scale, reverseActionsRef, boardIdRef, positionRef}) {

  const previewButtonRef = useRef(null);

  const urlRef = useRef(null);
  const controlUrlId = 'control-url';

  onClickOutside(urlRef);
  
  return (
    <>
      <div className='control-button' ref={previewButtonRef} onClick={(event) => showInput(controlUrlId)}  
           style={{width: "64px", height: "38px", borderRadius: "20px", border: "1px solid #78290F", display: "flex", justifyContent: "center", alignItems: "center", color: "#78290F", fontWeight: "bold"}} >Link</div>

      <div id={controlUrlId} ref={urlRef} style={{left: rdd.isMobile ? "10px" : "110px", top: rdd.isMobile ? "80px" : "100px"}}>
        <input id={`${controlUrlId}-input`} type='text' placeholder="press Return to submit" 
          onKeyDown={(event) => createPreview(event, controlUrlId, scale, document.getElementById(`${controlUrlId}-input`).value, reverseActionsRef, boardIdRef, positionRef)}/>
      </div>  
    </>
  )
}


/** 
 * show the input for user to enter link
 * @param {*} controlUrlId
 * @returns input for link
 */
function showInput(controlUrlId) {
  document.getElementById(controlUrlId).style.display = 'initial';
}


/** 
 * create a preview for the link
 * @param {*} event
 * @param {*} controlUrlId
 * @param {*} scale
 * @param {*} url
 * @param {*} reverseActionsRef 
 * @param {*} boardId
 * @returns image button
 */
async function createPreview(event, controlUrlId, scale, url, reverseActionsRef, boardIdRef, positionRef) {
  if (event.key === 'Enter' || event.keyCode === 13) {

    var figurePosition;
    if (rdd.isMobile) {
      figurePosition = { x: -((positionRef.current.x - 50) / scale) , y: -((positionRef.current.y - 120) / scale)};
    }
    else {
      figurePosition = { x: -((positionRef.current.x - 100) / scale) , y: -((positionRef.current.y - 170) / scale)};
    }

    const figure = { boardId: boardIdRef.current, type: "preview", x: figurePosition.x, y: figurePosition.y, width: 400, height: 400, backgroundColor: "rgba(226,245,240,1)", url: url, zIndex: 5, isPinned: false}
    var response = await FigureApi.createPreview(figure.boardId, figure.x, figure.y, figure.width, figure.height, figure.type, figure.backgroundColor, figure.url, figure.zIndex, figure.isPinned);

    
    if (response.status === 200) {
      if (reverseActionsRef.current.length === 30) {
        reverseActionsRef.current.shift();
      }
  
      document.getElementById(`${controlUrlId}-input`).value = '';
      document.getElementById(controlUrlId).style.display = 'none';
      reverseActionsRef.current.push({ action: "delete", id: response.data._id });
    }
    else {
      toast(response.data);
    }
  }
}


/** 
 * hide the input when user click outside
 * @param {*} ref
 * @returns null
 */
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

export default Preview