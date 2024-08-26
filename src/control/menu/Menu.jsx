import Image from "./image/Image"
import Editor from "./editor/Editor"
import Gesture from "./gesture/Gesture"
import Reverse from "./reverse/Reverse"
import Preview from "./preview/Preview"
import MenuIcon from "./menu.png"
import * as htmlToImage from 'html-to-image';

function Menu({scale, reverseActions, boardId}) {

  return (
    <>
      <img id="control-menu-button" src={MenuIcon} onDoubleClick={async (event) => await takeScreenshot()}
           style={{position: 'fixed', top: '20px', left: '20px', width: "60px", height: "60px"}}></img>
      <div id="control-menu" 
           style={{position: 'fixed', top: '20px', left: '95px', flexDirection: "row", gap: '10px', display: 'flex', backgroundColor: "#FFEED6", alignItems: "center", padding: "9px 16px 9px 16px", borderRadius: "30px", boxShadow: "0px 4px 4px 0px #00000040"
          }}>
        <Preview scale={scale} reverseActions={reverseActions} boardId={boardId} />
        <Image scale={scale} reverseActions={reverseActions} boardId={boardId} />
        <Gesture />
        <Reverse reverseActions={reverseActions} />
        <Editor scale={scale} reverseActions={reverseActions} boardId={boardId} />
      </div>
    </>
    
  )
}

async function takeScreenshot() {

  const filter = (node) => {
    const exclusionClasses = ['control', 'cursor'];
    return !exclusionClasses.some((classname) => node.classList?.contains(classname));
  }

  var storedScale = JSON.parse(localStorage.getItem('scale'));
  var storedPosition = JSON.parse(localStorage.getItem('position'));

  htmlToImage.toJpeg(document.getElementById('interface'), { quality: 1, filter: filter })
  .then(function (dataUrl) {


    const img = new window.Image();
    img.src = dataUrl;

    img.onload = () => {

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
  
      const cropX = storedPosition.x * -1 / storedScale; 
      const cropY = storedPosition.y * -1 / storedScale;
      const cropWidth = window.innerWidth / storedScale; 
      const cropHeight = window.innerHeight / storedScale; 
  
      canvas.width = cropWidth;
      canvas.height = cropHeight;
  
      ctx.drawImage(
        img, cropX, cropY, cropWidth, cropHeight, // Source dimensions
        0, 0, cropWidth, cropHeight // Destination dimensions
      );
  
      const croppedDataUrl = canvas.toDataURL('image/jpeg');
  
      const link = document.createElement('a');
      link.download = 'cropped-image.jpeg';
      link.href = croppedDataUrl;
      link.click();
    };
  });
}




export default Menu