import MenuIcon from "./menu.png"
import { useState } from 'react'
import * as rdd from 'react-device-detect'
import CreatePreviewButton from "./createPreviewButton/CreatePreviewButton";
import UploadImageButton from "./uploadImageButton/UploadImageButton";
import ChangeGestureButton from "./changeGestureButton/ChangeGestureButton";
import CreateEditorButton from "./createEditorButton/CreateEditorButton";
import ReverseActionButton from "./reverseActionButton/ReverseActionButton";
import './Menu.css'


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
    <div id="control-menu" 
         style={{top: `${rdd.isMobile ? '10px' : '20px'}`, left: `${rdd.isMobile ? '10px' : '20px'}`}}>
      
      <img id="control-menu-icon" 
           style={{display: `${rdd.isMobile ? 'none' : 'auto'}`}} 
           src={MenuIcon} onClick={() => setVisible(!visible)}  ></img>
      
      <div id="control-menu-bar" 
           style={{ opacity: visible ? 1 : 0, visibility: visible ? 'visible' : 'hidden' }}>

        <CreatePreviewButton scale={scale} reverseActionsRef={reverseActionsRef} boardIdRef={boardIdRef} positionRef={positionRef} />
        <UploadImageButton scale={scale} reverseActionsRef={reverseActionsRef} boardIdRef={boardIdRef} positionRef={positionRef} />
        <ChangeGestureButton />
        <ReverseActionButton reverseActionsRef={reverseActionsRef} />
        <CreateEditorButton scale={scale} reverseActionsRef={reverseActionsRef} boardIdRef={boardIdRef} positionRef={positionRef} />
      </div>
    </div>   
  )
}


export default Menu
