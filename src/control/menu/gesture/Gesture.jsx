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
  const isPoint = useRef(true);

  return (
    <div id="control-gesture" className='control-button' style={{border: "1px solid #78290F", width: "55px", height: "38px", borderRadius: "20px", display: "flex", justifyContent: "center", alignItems: "center"}} 
         onClick={(event) => switchMode(event, isPoint, setButtonImage)}>
      <img style={{width: "22px", height: "22px"}} src={buttonImage} />
    </div>
  )
}


/** 
 * switch to either select or drag mode then set the button image
 * @param {*} event
 * @param {*} isPoint 
 * @param {*} setButtonImage
 * @returns null
 */
function switchMode(event, isPoint, setButtonImage) {

  isPoint.current = !isPoint.current;

  if (isPoint.current === true) {
    document.getElementById("interface").style.pointerEvents = 'auto';
    setButtonImage(PointButton);
  } 
  else {
    document.getElementById("interface").style.pointerEvents = 'none';
    setButtonImage(DragButton);
  }
}

export default Gesture
