import DragButton from './dragButton.png'
import PointButton from './pointButton.png'
import { useRef, useState } from 'react'

function Gesture() {

  const [buttonImage, setButtonImage] = useState(PointButton);
  const isPoint = useRef(true);

  return (
    <div id="control-gesture" style={{display: "flex", flexDirection: "row", gap: "10px"}} onClick={(event) => switchMode(event, isPoint, setButtonImage)}>
      <img style={{width: "60px", height: "60px"}} src={buttonImage} />
    </div>
  )
}

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
