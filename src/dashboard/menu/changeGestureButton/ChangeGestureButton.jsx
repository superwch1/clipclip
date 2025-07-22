import DragButton from './dragButton.png'
import PointButton from './pointButton.png'
import { useRef, useState } from 'react'
import './ChangeGestureButton.css'

/** 
 * click button to switch the mode of gesture
 * @returns gesture button
 */
function ChangeGestureButton() {

  const [buttonImage, setButtonImage] = useState(PointButton);
  const isPointRef = useRef(true);

  return (
    <div id='control-menu-bar-gesture' onClick={(event) => switchMode(event, isPointRef, setButtonImage)}>
      <img id='control-menu-bar-gesture-image' src={buttonImage} />
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

export default ChangeGestureButton
