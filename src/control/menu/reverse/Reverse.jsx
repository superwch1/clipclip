import { toast } from 'react-toastify';
import figureApi from '../../../services/webServer/figureApi.mjs';
import ReverseButton from './reverseButton.png'

function Reverse({reverseActions}) {
  return (
    <div id="control-reverse" style={{display: "flex", flexDirection: "row", gap: "10px"}} onClick={(event) => sendReverseActions(reverseActions)}>
      <img style={{width: "60px", height: "60px"}} src={ReverseButton} />
    </div>
  )
}


async function sendReverseActions(reverseActions) {

  if (reverseActions.current.length > 0) {
    var figure = reverseActions.current[reverseActions.current.length - 1];
    var response;

    if (figure.action === "create") {
  
      if (figure.type === "editor") {
        response = await figureApi.createEditor(figure.x, figure.y, figure.width, figure.height, figure.type, figure.backgroundColor, figure.url, figure.zIndex, figure.isPinned, null, JSON.parse(figure.quillDelta));
      }

      else if (figure.type === "image") {
        response = await figureApi.createImage(figure.x, figure.y, figure.width, figure.height, figure.type, figure.backgroundColor, figure.url, figure.zIndex, figure.isPinned, figure.base64, false);
      }

      else if (figure.type === "preview") {
        response = await figureApi.createPreview(figure.x, figure.y, figure.width, figure.height, figure.type, figure.backgroundColor, figure.url, figure.zIndex, figure.isPinned);
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

      }

      else if (figure.action.includes("layer")) {
        response = await figureApi.updateLayer(figure.id, figure.layerAction);
      }
      
      else if (figure.action.includes("positionAndSize")) {
        response = await figureApi.updatePositionAndSize(figure.id, figure.x, figure.y, figure.width, figure.height);
      }
    }


    if (response.status === 200) {
      reverseActions.current.pop();
    }
    else {
      toast(response.data);
    }
  }

  
  console.log(reverseActions);
}

export default Reverse