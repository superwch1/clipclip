import Canvas from '../Canvas'
import { useState, useEffect, useRef } from 'react'
import React, {  } from "react";
import Create from '../control/create/Create'
import Zoom from '../control/zoom/Zoom'
import Cursors from '../cursors/Cursors'
import './Interface.css'
import Config from '../config/Config'
import { TransformWrapper, TransformComponent} from "react-zoom-pan-pinch";
import * as rdd from 'react-device-detect';


function Interface() {

  var storedScale = JSON.parse(localStorage.getItem('scale'));
  if (storedScale === null) {
    localStorage.setItem('scale', 1);
    storedScale = 1;
  }

  var storedPosition = JSON.parse(localStorage.getItem('position'));
  if (storedPosition === null) {
    localStorage.setItem('position',  JSON.stringify({x: -Config.interfaceWidth / 2, y: -Config.interfaceWidth / 2}));
    storedPosition = {x: -Config.interfaceWidth / 2, y: -Config.interfaceWidth / 2};
  }
  // ensure the stored position is inside the bound
  storedPosition = checkInsideBound({x: storedPosition.x, y: storedPosition.y, scale: storedScale});


  const [scale, setScale] = useState(storedScale);
  const canvasRef = useRef(null);
  var minScale = rdd.isMobile === true ? Config.interfaceMinZoomScaleForMobile : Config.interfaceMinZoomScaleForDesktop;
  

  useEffect(() => {
    // recalculate the position after adjusting the screen size (incl. open and close F12 developer console)
    window.onresize = (event) => {
      var state = canvasRef.current.instance.transformState;
      checkInsideBoundAndStorePosition({x: state.positionX, y: state.positionY, scale: state.scale, setScale: null, setTransform: canvasRef.current.setTransform});
    }

    function handleWheel(event) {
      if(event.ctrlKey === false) {
        var state = canvasRef.current.instance.transformState;
        var position = checkInsideBound({x: state.positionX - event.deltaX, y: state.positionY - event.deltaY, scale: state.scale})
        canvasRef.current.setTransform(position.x, position.y, state.scale, 0);

        // it needs to call seave position to storage since it does not use checkInsideBoundAndStorePosition function
        localStorage.setItem('position',  JSON.stringify({x: position.x, y: position.y}));
      }
    }
    window.addEventListener("wheel", handleWheel);

    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, [canvasRef]);


  // prevent user use ctrl + wheel to scale up and down from the control section
  useEffect(() => {
    const handleWheel = (event) => {
      if (event.ctrlKey === true) {
        event.preventDefault();
      }
    };
    document.getElementById('control').addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      document.getElementById('control').removeEventListener('wheel', handleWheel, { passive: false });
    };
  }, []);


  return (
    <div>
      { /* even the picture is larger than vw and vh, it still constrain everything in the view part of web browser  
           solution for that is to set limitToBounds to false */}
      <TransformWrapper limitToBounds={false} initialPositionX={storedPosition.x} initialPositionY={storedPosition.y}

        // keys for activiation - https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values
        ref={canvasRef} initialScale={scale} minScale={minScale} maxScale={Config.interfaceMaxZoomScale} wheel={{activationKeys: ["Control"]}}
        onZoomStop={(transformState) => onZoomStop(transformState, setScale)} onZoom={(transformState) => onZooming(transformState, setScale)}
        zoomAnimation={{ disabled: true, size: 0.1 }} // prevent scale smaller than minScale while zooming out with ctrl and wheel
        doubleClick={{disabled: true}} pinch={{excluded: ['figure']}} 
        onPanning={(transformState) => onPanning(transformState)} panning={{allowRightClickPan: true, excluded: ['figure'] }} >

      {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
        <>
          <TransformComponent>
            <div id="interface" style={{ width: `${Config.interfaceWidth}px`, height: `${Config.interfaceHeight}px`}}>
              <Canvas scale={scale} />  
              <Cursors scale={scale}/> {/* cursor needs to stay inside div otherwise the position will be incorrect */}
            </div>
          </TransformComponent>
          { /* these component are placed on top of the Canvas */ }
          <div id='control'>
            <Create scale={scale} />
            <Zoom scale={scale} setScale={setScale} checkInsideBoundAndStorePosition={checkInsideBoundAndStorePosition}/>
          </div>
        </>
      )}

      </TransformWrapper>
    </div>
  )
}

function onPanning (transformState) {
  checkInsideBoundAndStorePosition({ x: transformState.state.positionX, y: transformState.state.positionY, scale: transformState.state.scale, 
    setScale: null, setTransform: transformState.setTransform});
}

function onZooming(transformState, setScale) {
  // the scale has effects on position so it needs to be saved together
  checkInsideBoundAndStorePosition({ x: transformState.state.positionX, y: transformState.state.positionY, scale: transformState.state.scale, 
    setScale: setScale, setTransform: transformState.setTransform});
}


// check whether the positionX and positionY is inside or outside the canvas
// if it is outside the canvas, call the setTranform function
// save the x, y and scale value to the local storage
function checkInsideBoundAndStorePosition({x: x, y: y, scale: scale, setScale: setScale, setTransform: setTransform}) {
  var x = x;
  var y = y;
  var scale = scale;

  var position = checkInsideBound({x: x, y: y, scale: scale});
 
  // it is true when the value is not inside bound
  if (x !== position.x || y !== position.y) {
    // return the new value of position when it moves outside the canvas
    setTransform(position.x, position.y, scale, 0);
  }

  // save the suitable value within the canvas into the local storage
  localStorage.setItem('position',  JSON.stringify({x: position.x, y: position.y}));
    
  // no need to update the scale if it is not zooming
  if (setScale !== null) {
    localStorage.setItem('scale', scale);
    setScale(scale);
  }
}

// return the original value if it is inside bound
// otherwise, return the suitable value that should be inside bound
function checkInsideBound({x: x, y: y, scale: scale}) {
  x = (x / scale >= 0) ? 0 : x;
  x = ((x - window.innerWidth) / scale <= -Config.interfaceWidth) ? -Config.interfaceWidth * scale + window.innerWidth : x;

  y = (y / scale >= 0) ? 0 : y;
  y = ((y - window.innerHeight) / scale <= -Config.interfaceHeight) ? -Config.interfaceHeight * scale + window.innerHeight : y;

  return {x: x, y: y};
}


export default Interface