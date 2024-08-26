import { toast } from 'react-toastify';
import FigureApi from '../../../services/webServer/figureApi.mjs'
import EditorButton from './editorButton.png'
import '../Menu.css'

function Editor({scale, reverseActions}) {
  return (
    <div className='control-button' onClick={(event) => createEditor(event, scale, reverseActions)}
         style={{backgroundColor: "#78290F", width: "55px", height: "38px", borderRadius: "20px", display: "flex", justifyContent: "center", alignItems: "center"}} >
      <img style={{width: "18px", height: "18px"}} src={EditorButton} />
    </div>
  )
}

async function createEditor(event, scale, reverseActions) { 
  var position = JSON.parse(localStorage.getItem('position'));
  var figurePosition = { x: -(position.x / scale) + 100, y: -(position.y / scale) + 100};
  
  const figure = { type: "editor", x: figurePosition.x, y: figurePosition.y, width: 400, height: 400, backgroundColor: "rgba(226,245,240,1)", url: "", zIndex: 5, isPinned: false};
  var response = await FigureApi.createEditor(figure.x, figure.y, figure.width, figure.height, figure.type, figure.backgroundColor, figure.url, figure.zIndex, figure.isPinned, null, null);

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


export default Editor