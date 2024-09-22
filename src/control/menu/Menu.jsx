import Image from "./image/Image"
import Editor from "./editor/Editor"
import Gesture from "./gesture/Gesture"
import Reverse from "./reverse/Reverse"
import Preview from "./preview/Preview"
import MenuIcon from "./menu.png"
import { useState, useRef } from 'react'
import * as rdd from 'react-device-detect'


/** 
 * menu with button to create preview / editor / image or switch gesture mode
 * @param {*} scale
 * @param {*} reverseActionsRef 
 * @param {*} boardIdRef
 * @param {*} positionRef
 * @returns div with buttons
 */
function Menu({scale, reverseActionsRef, boardIdRef, positionRef}) {

  // const isTakingScreenshotRef = useRef(false);
  const [visible, setVisible] = useState(true);

  return (
    <div style={{position: 'fixed', top: `${rdd.isMobile ? '10px' : '20px'}`, left: `${rdd.isMobile ? '10px' : '20px'}`, width: "70px", height: "70px", display: 'flex', flexDirection: 'row', gap: "20px"}}>
      <img src={MenuIcon} onClick={() => setVisible(!visible)} style={{display: `${rdd.isMobile ? 'none' : 'auto'}`, width: '70px', height: '70px'}} 
           /* onDoubleClick={async (event) => await takeScreenshot(isTakingScreenshotRef)} */></img>
      <div id="control-menu" 
           style={{flexDirection: "row", gap: '10px', display: 'flex', opacity: visible ? 1 : 0, height: 'fit-content',
                   visibility: visible ? 'visible' : 'hidden', transition: `opacity 0.5s ease-in-out, visibility 0.5s ease-in-out`,
                   backgroundColor: "#FFEED6", alignItems: "center", padding: "9px 16px 9px 16px", borderRadius: "30px", boxShadow: "0px 4px 4px 0px #00000040" }}>
        <Preview scale={scale} reverseActionsRef={reverseActionsRef} boardIdRef={boardIdRef} positionRef={positionRef} />
        <Image scale={scale} reverseActionsRef={reverseActionsRef} boardIdRef={boardIdRef} positionRef={positionRef} />
        <Gesture />
        <Reverse reverseActionsRef={reverseActionsRef} />
        <Editor scale={scale} reverseActionsRef={reverseActionsRef} boardIdRef={boardIdRef} positionRef={positionRef} />
      </div>
    </div>
    
  )
}


export default Menu


/*
async function takeScreenshot(isTakingScreenshotRef) {

  if (isTakingScreenshotRef.current === true) {
    return;
  }
  isTakingScreenshotRef.current = true;

  await toast.promise(
    processScreenshot,
    {
      pending: 'processing screenshot...',
      success: 'screenshot saved',
      error: 'Failed to save screenshot.',
    }
  );

  isTakingScreenshotRef.current = false;
}


async function processScreenshot() {

  const filter = (node) => {
    const exclusionClasses = ['control', 'cursor'];
    return !exclusionClasses.some((classname) => node.classList?.contains(classname));
  }

  try {
    // wait the toast to appear or else htmlToImage take many processing power and toast unable to come out
    await new Promise(r => setTimeout(r, 500)); 
    const dataUrl = await htmlToImage.toJpeg(document.getElementById('interface'), { quality: 1, filter: filter, width: 5000, height: 5000 });

    const img = new window.Image();
    img.src = dataUrl;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      const storedScale = JSON.parse(localStorage.getItem('scale'));
      const storedPosition = JSON.parse(localStorage.getItem('position'));

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

      canvas.toBlob((blob) => {
        saveAs(blob, 'screenshot.jpeg');
      }, 'image/jpeg');
    };

  } 
  catch (error) {
    console.error('Error capturing screenshot:', error);
  }
}
*/