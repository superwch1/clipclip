import { toast } from 'react-toastify';
import FigureApi from '../../../server/figureApi.mjs'
import EditorButton from './editorButton.png'
import '../Menu.css'
import * as rdd from 'react-device-detect'

/** 
 * click button to create a editor
 * @param {*} scale
 * @param {*} reverseActionsRef 
 * @param {*} boardId
 * @returns editor button
 */
function Editor({scale, reverseActionsRef, boardIdRef, positionRef}) {
  return (
    <div className='control-button' onClick={(event) => createEditor(event, scale, reverseActionsRef, boardIdRef, positionRef)}
         style={{backgroundColor: "#78290F", width: "50px", height: "38px", borderRadius: "20px", display: "flex", justifyContent: "center", alignItems: "center"}} >
      <img style={{width: "18px", height: "18px"}} src={EditorButton} />
    </div>
  )
}


/** 
 * create a empty editor on the top left corner
 * @param {*} scale
 * @param {*} reverseActionsRef 
 * @param {*} boardId
 * @returns null
 */
async function createEditor(event, scale, reverseActionsRef, boardIdRef, positionRef) { 
  var figurePosition;
  if (rdd.isMobile) {
    figurePosition = { x: -((positionRef.current.x - 50) / scale) , y: -((positionRef.current.y - 120) / scale)};
  }
  else {
    figurePosition = { x: -((positionRef.current.x - 100) / scale) , y: -((positionRef.current.y - 170) / scale)};
  }

  const figure = { boardId: boardIdRef.current, type: "editor", x: figurePosition.x, y: figurePosition.y, width: 400, height: 400, backgroundColor: "rgba(226,245,240,1)", url: "", zIndex: 5, isPinned: false};
  var response = await FigureApi.createEditor(figure.boardId, figure.x, figure.y, figure.width, figure.height, figure.type, figure.backgroundColor, figure.url, figure.zIndex, figure.isPinned, null, null);

  if (response.status === 200) {
    if (reverseActionsRef.current.length === 30) {
      reverseActionsRef.current.shift();
    }

    reverseActionsRef.current.push({ action: "delete", id: response.data._id });
  }
  else {
    toast(response.data);
  }
}


export default Editor