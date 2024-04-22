import './Zoom.css'

function Zoom({scale, setScale}) {
  return (
    <div id="control-zoom">
      <p className="control-text control-scale" onClick={(event) => zoomIn(event, scale, setScale)}>+</p>
      <p className="control-text">{Math.round(scale * 100)}%</p>
      <p className="control-text control-scale" onClick={(event) => zoomOut(event, scale, setScale)}>-</p>
    </div>
  )
}

function zoomIn(event, scale, setScale){
  var newScale = scale;
  if (scale + 0.1 <= 2) { // Zoom in
    newScale = scale + 0.1;
    setScale(newScale);
  } 
}

function zoomOut(event, scale, setScale){
  var newScale = scale;
  if (scale - 0.1 >= 0.3) { // Zoom in
    newScale = scale - 0.1;
    setScale(newScale);
  } 
}

export default Zoom