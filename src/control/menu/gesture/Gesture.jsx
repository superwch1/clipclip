import DragButton from './dragButton.png'
import PointButton from './pointButton.png'
import { useRef, useState } from 'react'
import "../Menu.css"

/** 
 * click button to switch the mode of gesture
 * @returns gesture button
 */
function Gesture() {

  const [buttonImage, setButtonImage] = useState(PointButton);
  const isPointRef = useRef(true);

  return (
    <div id="control-gesture" className='control-button' 
    style={{border: "1px solid #78290F", width: "50px", height: "38px", borderRadius: "20px", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#78290F"}} 
         onClick={(event) => switchMode(event, isPointRef, setButtonImage)}>
      <img style={{width: "22px", height: "22px"}} src={buttonImage} />
    </div>
  )
}


/** 
 * switch to either select or drag mode then set the button image
 * @param {*} event
 * @param {*} isPointRef 
 * @param {*} setButtonImage
 * @returns null
 */
function switchMode(event, isPointRef, setButtonImage) {

  isPointRef.current = !isPointRef.current;

  if (isPointRef.current === true) {
    document.getElementById("interface").style.pointerEvents = 'auto';
    setButtonImage(PointButton);
  } 
  else {
    document.getElementById("interface").style.pointerEvents = 'none';
    setButtonImage(DragButton);
  }
}

export default Gesture
