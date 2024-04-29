import './Zoom.css'
import { useControls } from "react-zoom-pan-pinch";
import Config from '../../config/Config'

function Zoom({scale, setScale}) {

  
  const { setTransform } = useControls();

  return (
    <div id="control-zoom">
      <p className="control-text control-scale" onClick={(transformState) => zoomIn(transformState, scale, setScale, setTransform)}>+</p>
      <p className="control-text">{Math.round(scale * 100)}%</p>
      <p className="control-text control-scale" onClick={(transformState) => zoomOut(transformState, scale, setScale, setTransform)}>-</p>
    </div>
  )
}

function zoomIn(transformState, scale, setScale, setTransform){
  var newScale = scale;
  if (scale + 0.1 <= Config.interfaceMaxZoomScale) { // Zoom in
    newScale = scale + 0.1;

    var element = document.getElementsByClassName('react-transform-component');
    var style = window.getComputedStyle(element[0]);
    var matrix = new WebKitCSSMatrix(style.transform);    

    var ratio = (newScale - scale) / scale + 1;

    // var x = (matrix.m41) * ratio to set origin on top left
    var x = (matrix.m41 - window.innerWidth / 2 * (1 - scale / newScale)) * ratio;
    var y = (matrix.m42 - window.innerHeight / 2 * (1 - scale / newScale)) * ratio

    setTransform(x, y, newScale, 0);
    localStorage.setItem('coordinate',  JSON.stringify({x: x, y: y}));

    localStorage.setItem('scale', newScale);
    setScale(newScale);
  } 
}

function zoomOut(transformState, scale, setScale, setTransform){
  var newScale = scale;
  if (scale - 0.1 >= Config.interfaceMinZoomScale) { // Zoom out
    newScale = scale - 0.1;

    var element = document.getElementsByClassName('react-transform-component');
    var style = window.getComputedStyle(element[0]);
    var matrix = new WebKitCSSMatrix(style.transform);    

    var ratio = (newScale - scale) / scale + 1;

    // var x = (matrix.m41) * ratio to set origin on top left
    var x = (matrix.m41 - window.innerWidth / 2 * (1 - scale / newScale)) * ratio;
    var y = (matrix.m42 - window.innerHeight / 2 * (1 - scale / newScale)) * ratio

    setTransform(x, y, newScale, 0);
    localStorage.setItem('coordinate',  JSON.stringify({x: x, y: y}));

    localStorage.setItem('scale', newScale);
    setScale(newScale);
  } 
}

export default Zoom