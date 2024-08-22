import FigureApi from '../../../services/webServer/figureApi.mjs'
import EditorButton from './editorButton.png'

function Editor({scale}) {
  return (
    <div onClick={(event) => createEditor({event: event, scale: scale})}>
      <img style={{width: "60px", height: "60px"}} src={EditorButton} />
    </div>
  )
}

async function createEditor({event, scale}) { 
  var position = JSON.parse(localStorage.getItem('position'));
  var figurePosition = { x: -(position.x / scale) + 100, y: -(position.y / scale) + 100};
  
  const figure = { type: "editor", x: figurePosition.x, y: figurePosition.y, width: 400, height: 400, backgroundColor: "rgba(226,245,240,1)", url: "", zIndex: 5, isPinned: false};
  await FigureApi.createEditor(figure, null, null);
}


export default Editor