import Create from "./create/Create"
import Gesture from "./gesture/Gesture"
import Reverse from "./reverse/Reverse"
import MenuIcon from "./menu.png"
import { useState } from 'react'

function Menu({scale}) {

  const [visibility, setVisibility] = useState("visible");

  return (
    <>
      <img id="control-menu-button" src={MenuIcon} onClick={(event) => toggleMenu(event, visibility, setVisibility)} 
           style={{position: 'fixed', top: '20px', left: '20px', width: "60px", height: "60px"}}></img>
      <div id="control-menu" 
      style={{position: 'fixed', top: '20px', left: '100px', flexDirection: "column", display: 'flex', alignItems: "flex-start", visibility: `${visibility}`}}>
        <Create scale={scale} />
        <Gesture />
        <Reverse />
      </div>
    </>
  )
}

function toggleMenu(event, visibility, setVisibility) {
  if (visibility === "visible") {
    setVisibility("hidden");
  }
  else {
    setVisibility("visible");
  }
}


export default Menu