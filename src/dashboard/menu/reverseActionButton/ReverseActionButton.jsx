import { toast } from 'react-toastify';
import figureApi from '../../../api/figureApi.mjs';
import ReverseButton from './reverseButton.png'
import { useEffect, useRef } from 'react'
import { isInputOrEditorFocused } from '../../../utlis.mjs';
import './ReverseActionButton.css'


/** 
 * reverse button or use keyboard to reverse an action
 * @param {*} reverseActionsRef 
 * @returns image button
 */
function ReverseActionButton({reverseActionsRef}) {

  const waitingResponseRef = useRef(false);

  useEffect(() => {
    document.addEventListener('keydown', (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'z' && isInputOrEditorFocused() === false) {
        sendreverseActionsRef(reverseActionsRef, waitingResponseRef);
      }
    });
  }, []);

  return (
    <div id="control-menu-bar-reverse" onClick={(event) => sendreverseActionsRef(reverseActionsRef, waitingResponseRef)}>
      <img style={{width: "18px", height: "18px"}} src={ReverseButton} />
    </div>
  )
}


/** 
 * reverse an action by creating / updating / deleteing a figure
 * @param {*} reverseActionsRef 
 * @param {*} waitingResponseRef
 * @returns null
 */
async function sendreverseActionsRef(reverseActionsRef, waitingResponseRef) {

  if (waitingResponseRef.current === true) {
    return;
  }
  waitingResponseRef.current = true;

  if (reverseActionsRef.current.length > 0) {
    var figure = reverseActionsRef.current[reverseActionsRef.current.length - 1];
    var response;

    if (figure.action === "create") {
  
      if (figure.type === "editor") {
        response = await figureApi.createEditorWithId(figure.id, figure.boardId, figure.x, figure.y, figure.width, figure.height, figure.type, figure.backgroundColor, figure.url, figure.zIndex, figure.isPinned, null, JSON.parse(figure.quillDelta));
      }

      else if (figure.type === "image") {
        response = await figureApi.createImageWithId(figure.id, figure.boardId, figure.x, figure.y, figure.width, figure.height, figure.type, figure.backgroundColor, figure.url, figure.zIndex, figure.isPinned, figure.base64, false);
      }

      else if (figure.type === "preview") {
        response = await figureApi.createPreviewWithId(figure.id, figure.boardId, figure.x, figure.y, figure.width, figure.height, figure.type, figure.backgroundColor, figure.url, figure.zIndex, figure.isPinned);
      }
    }

    else if (figure.action === "delete") {
      response = await figureApi.deleteFigure(figure.id);
    }

    else if (figure.action.includes("update")) {
      if (figure.action.includes("backgroundColor")) {
        response = await figureApi.updateBackgroundColor(figure.id, figure.backgroundColor);
      }

      else if (figure.action.includes("pinStatus")) {
        response = await figureApi.updatePinStatus(figure.id, figure.isPinned);
      }

      else if (figure.action.includes("layer")) {
        response = await figureApi.updateLayer(figure.id, figure.layerAction);
      }
      
      else if (figure.action.includes("positionAndSize")) {
        response = await figureApi.updatePositionAndSize(figure.id, figure.x, figure.y, figure.width, figure.height);
      }
    }


    // scenario not solved
    // 1. user B move the figure
    // 2. user A delete the figure
    // 3. user B reverse but cannot find the figure
    // 4. user B trapped in reverse action
    
    if (response.status === 200) {
      reverseActionsRef.current.pop();
    }
    else {
      toast(response.data);
    }
  }

  waitingResponseRef.current = false;
}

export default ReverseActionButton