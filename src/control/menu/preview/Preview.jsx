import { useRef, useEffect } from 'react';
import FigureApi from '../../../services/webServer/figureApi.mjs'
import '../Menu.css'
import { toast } from 'react-toastify';


function Preview({scale, reverseActions, boardId}) {

  const previewButtonRef = useRef(null);

  const urlRef = useRef(null);
  const controlUrlId = 'control-url';

  onClickOutside(urlRef);
  
  return (
    <>
      <div className='control-button' ref={previewButtonRef} onClick={(event) => showInput(controlUrlId)}  
           style={{width: "64px", height: "38px", borderRadius: "20px", border: "1px solid #78290F", display: "flex", justifyContent: "center", alignItems: "center", color: "#78290F", fontWeight: "bold"}} >Link</div>

      <div id={controlUrlId} ref={urlRef}>
        <input id={`${controlUrlId}-input`} type='text' placeholder="press Enter to submit" 
          onKeyDown={(event) => createPreview(event, controlUrlId, scale, document.getElementById(`${controlUrlId}-input`).value, reverseActions, boardId)}/>
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



function showInput(controlUrlId) {
  document.getElementById(controlUrlId).style.display = 'initial';
}


async function createPreview(event, controlUrlId, scale, url, reverseActions, boardId) {
  if (event.key === 'Enter' || event.keyCode === 13) {

    var position = JSON.parse(localStorage.getItem('position'));
    var figurePosition = { x: -(position.x / scale) + 100, y: -(position.y / scale) + 100};

    const figure = { boardId: boardId, type: "preview", x: figurePosition.x, y: figurePosition.y, width: 400, height: 400, backgroundColor: "rgba(226,245,240,1)", url: url, zIndex: 5, isPinned: false}
    var response = await FigureApi.createPreview(figure.boardId, figure.x, figure.y, figure.width, figure.height, figure.type, figure.backgroundColor, figure.url, figure.zIndex, figure.isPinned);

    
    if (response.status === 200) {
      console.log(reverseActions);
      if (reverseActions.current.length === 20) {
        reverseActions.current.shift();
      }
  
      document.getElementById(`${controlUrlId}-input`).value = '';
      document.getElementById(controlUrlId).style.display = 'none';
      reverseActions.current.push({ action: "delete", id: response.data._id });
    }
    else {
      toast(response.data);
    }
  }
}



export default Preview