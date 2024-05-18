import './Zoom.css'
import { useControls } from "react-zoom-pan-pinch";
import Config from '../../config/Config'
import * as rdd from 'react-device-detect';

function Zoom({scale, setScale, checkInsideBoundAndStorePosition}) {
  
  const { setTransform } = useControls();

  return (
    <div id="control-zoom" className='control'>
      <p className="control-text control-scale" onClick={(event) => zoomIn(scale, setScale, setTransform, checkInsideBoundAndStorePosition)}>+</p>
      <p className="control-text">{Math.round(scale * 100)}%</p>
      <p className="control-text control-scale" onClick={(event) => zoomOut(scale, setScale, setTransform, checkInsideBoundAndStorePosition)}>-</p>
    </div>
  )
}

function zoomIn(scale, setScale, setTransform, checkInsideBoundAndStorePosition){
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
    checkInsideBoundAndStorePosition({x: x, y: y, scale: newScale, setScale: setScale, setTransform: setTransform});
  } 
}

function zoomOut(scale, setScale, setTransform, checkInsideBoundAndStorePosition){
  var newScale = scale;
  var minScale = rdd.isMobile === true ? Config.interfaceMinZoomScaleForMobile : Config.interfaceMinZoomScaleForDesktop;
  
  if (scale - 0.1 >= minScale) { // Zoom out
    newScale = scale - 0.1;

    var element = document.getElementsByClassName('react-transform-component');
    var style = window.getComputedStyle(element[0]);
    var matrix = new WebKitCSSMatrix(style.transform);    

    var ratio = (newScale - scale) / scale + 1;

    // var x = (matrix.m41) * ratio to set origin on top left
    var x = (matrix.m41 - window.innerWidth / 2 * (1 - scale / newScale)) * ratio;
    var y = (matrix.m42 - window.innerHeight / 2 * (1 - scale / newScale)) * ratio

    setTransform(x, y, newScale, 0);
    checkInsideBoundAndStorePosition({x: x, y: y, scale: newScale, setScale: setScale, setTransform: setTransform});
  } 
}

export default Zoom