import './Zoom.css'
import { useControls } from "react-zoom-pan-pinch";
import { useEffect, } from 'react'
import Config from '../../config/Config'
import * as rdd from 'react-device-detect';

/** 
 * zoom in (+) and zoom out (-) buttons to modify zooming level
 * @param {*} scale
 * @param {*} setScale 
 * @param {*} checkInsideBoundAndStorePosition
 * @returns div with buttons
 */
function Zoom({scale, setScale, checkInsideBoundAndStorePosition, cursor, position, boardId}) {
  
  const { setTransform } = useControls();


  useEffect(() => {
    // event run only on scrolling wheel and zooming on mousepad
    // ctrl + wheel will not trigger wheel event
    function handleWheel(event) { 

      // panning gives out integer value on mousepad, zoom gives out float value
      if (Number.isInteger(event.deltaY)) {
        return;
      }

      var newScale = scale;
      if (event.deltaY < 0) {
        if (scale - event.deltaY / 100 <= Config.interfaceMaxZoomScale) { // Zoom in
          newScale = scale - event.deltaY / 100;
        } 
        else {
          newScale = Config.interfaceMaxZoomScale;
        }
      }
      else {
        var minScale = rdd.isMobile === true ? Config.interfaceMinZoomScaleForMobile : Config.interfaceMinZoomScaleForDesktop;
  
        if (scale - event.deltaY / 100 >= minScale) { // Zoom out
          newScale = scale - event.deltaY / 100;
        } 
        else {
          newScale = minScale;
        }
      }

      var element = document.getElementsByClassName('react-transform-component');
      var style = window.getComputedStyle(element[0]);
      var matrix = new WebKitCSSMatrix(style.transform);    

      var ratio = (newScale - scale) / scale + 1;

      // var x = (matrix.m41) * ratio to set origin on top left
      var x = (matrix.m41 - cursor.current.x * (1 - scale / newScale)) * ratio;
      var y = (matrix.m42 - cursor.current.y * (1 - scale / newScale)) * ratio

      setTransform(x, y, newScale, 0);
      checkInsideBoundAndStorePosition({x: x, y: y, scale: newScale, setScale: setScale, setTransform: setTransform, cursor: cursor, position: position, boardId: boardId});
    }
    window.addEventListener("wheel", handleWheel);

    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, [scale]);

  return (
    <div id="control-zoom" className='control'>
      <p className="control-text control-scale" onClick={(event) => zoomIn(scale, setScale, setTransform, checkInsideBoundAndStorePosition, cursor, position, boardId)}>+</p>
      <p className="control-text">{Math.round(scale * 100)}%</p>
      <p className="control-text control-scale" onClick={(event) => zoomOut(scale, setScale, setTransform, checkInsideBoundAndStorePosition, cursor, position, boardId)}>-</p>
    </div>
  )
}


/** 
 * zoom in to the cursor position
 * @param {*} scale
 * @param {*} setScale 
 * @param {*} setTransform
 * @param {*} checkInsideBoundAndStorePosition
 * @returns null
 */
function zoomIn(scale, setScale, setTransform, checkInsideBoundAndStorePosition, cursor, position, boardId){
  var newScale = scale;
  if (scale + 0.1 <= Config.interfaceMaxZoomScale) { // Zoom in
    newScale = scale + 0.1;
  } 
  else {
    newScale = Config.interfaceMaxZoomScale;
  }

  var element = document.getElementsByClassName('react-transform-component');
  var style = window.getComputedStyle(element[0]);
  var matrix = new WebKitCSSMatrix(style.transform);    

  var ratio = (newScale - scale) / scale + 1;

  // var x = (matrix.m41) * ratio to set origin on top left
  var x = (matrix.m41 - window.innerWidth / 2 * (1 - scale / newScale)) * ratio;
  var y = (matrix.m42 - window.innerHeight / 2 * (1 - scale / newScale)) * ratio

  setTransform(x, y, newScale, 0);
  checkInsideBoundAndStorePosition({x: x, y: y, scale: newScale, setScale: setScale, setTransform: setTransform, position: position, cursor: cursor, boardId: boardId});
}


/** 
 * zoom out from the cursor position
 * @param {*} scale
 * @param {*} setScale 
 * @param {*} setTransform
 * @param {*} checkInsideBoundAndStorePosition
 * @returns null
 */
function zoomOut(scale, setScale, setTransform, checkInsideBoundAndStorePosition, cursor, position, boardId){
  var newScale = scale;
  var minScale = rdd.isMobile === true ? Config.interfaceMinZoomScaleForMobile : Config.interfaceMinZoomScaleForDesktop;
  
  if (scale - 0.1 >= minScale) { // Zoom out
    newScale = scale - 0.1;
  } 
  else {
    newScale = minScale;
  }

  var element = document.getElementsByClassName('react-transform-component');
  var style = window.getComputedStyle(element[0]);
  var matrix = new WebKitCSSMatrix(style.transform);    

  var ratio = (newScale - scale) / scale + 1;

  // var x = (matrix.m41) * ratio to set origin on top left
  var x = (matrix.m41 - window.innerWidth / 2 * (1 - scale / newScale)) * ratio;
  var y = (matrix.m42 - window.innerHeight / 2 * (1 - scale / newScale)) * ratio

  setTransform(x, y, newScale, 0);
  checkInsideBoundAndStorePosition({x: x, y: y, scale: newScale, setScale: setScale, setTransform: setTransform, position: position, cursor: cursor, boardId: boardId});
}

export default Zoom