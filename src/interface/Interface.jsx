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
import { debounce } from 'lodash';


function Interface() {

  var storedCoordinate = JSON.parse(localStorage.getItem('coordinate'));
  if (storedCoordinate === null) {
    localStorage.setItem('coordinate',  JSON.stringify({x: -Config.interfaceWidth / 2, y: -Config.interfaceWidth / 2}));
    storedCoordinate = {x: -Config.interfaceWidth / 2, y: -Config.interfaceWidth / 2};
  }

  var storedScale = JSON.parse(localStorage.getItem('scale'));
  if (storedScale === null) {
    localStorage.setItem('scale', 1);
    storedScale = 1;
  }

  const [scale, setScale] = useState(storedScale);
  const canvasRef = useRef(null);
  var minScale = rdd.isMobile === true ? Config.interfaceMinZoomScaleForMobile : Config.interfaceMinZoomScaleForDesktop;
  
  useEffect(() => {
    // recalculate the position after adjusting the screen size (incl. open and close F12 developer console)
    const checkPosition = debounce((canvasRef) => {
      var state = canvasRef.current.instance.transformState;
      checkInsideBoundAndStoreValue({x: state.positionX, y: state.positionY, scale: state.scale, setScale: null, setTransform: canvasRef.current.setTransform});
    }, 200);
    window.onresize = (event) => checkPosition(canvasRef);



    // use scroll up, down, left and right to move to new position
    // the time for running check is shorter because it usually have residual scroll after wheeling
    let wheelTimeout;

    function handleWheelStop() {
      var state = canvasRef.current.instance.transformState;
      checkInsideBoundAndStoreValue({x: state.positionX, y: state.positionY, scale: state.scale, setScale: null, setTransform: canvasRef.current.setTransform});
    }

    function handleWheel(event) {
      if(event.ctrlKey === false) {
        var state = canvasRef.current.instance.transformState;
        canvasRef.current.setTransform(state.positionX - event.deltaX, state.positionY - event.deltaY, state.scale, 0);
        
        clearTimeout(wheelTimeout);
        wheelTimeout = setTimeout(handleWheelStop, 100);
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
      { /* even the picture is larger than vw and vh, it still constrain everything in the view part of web browser */ }
      <TransformWrapper limitToBounds={false} initialPositionX={storedCoordinate.x} initialPositionY={storedCoordinate.y}

        // keys for activiation - https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values
        ref={canvasRef} initialScale={scale} minScale={minScale} maxScale={Config.interfaceMaxZoomScale} wheel={{activationKeys: ["Control"]}}
        onZoomStop={(transformState) => onZoomStop(transformState, setScale)} 
        zoomAnimation={{ disabled: true, size: 0.1 }} // prevent scale smaller than minScale while zooming out with ctrl and wheel
        doubleClick={{disabled: true}} pinch={{excluded: ['figure']}} 
        panning={{allowRightClickPan: true, excluded: ['figure'] }} onPanningStop={(transformState) => onPanningStop(transformState)}>

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
            <Zoom scale={scale} setScale={setScale} checkInsideBoundAndStoreValue={checkInsideBoundAndStoreValue}/>
          </div>
        </>
      )}

      </TransformWrapper>
    </div>
  )
}

function onZoomStop (transformState, setScale) {
  // the scale has effects on coordinate so it needs to be saved together
  checkInsideBoundAndStoreValue({x: transformState.state.positionX, y: transformState.state.positionY, scale: transformState.state.scale,
    setScale: setScale, setTransform: transformState.setTransform});
}


function onPanningStop (transformState) {
  checkInsideBoundAndStoreValue({x: transformState.state.positionX, y: transformState.state.positionY, scale: transformState.state.scale,
    setScale: null, setTransform: transformState.setTransform});
}


// check whether the positionX and positionY is inside or outside the canvas
// if it is outside the canvas, adjust it back to inside canvas
// save the x, y and scale value to the local storage
function checkInsideBoundAndStoreValue({x: x, y: y, scale: scale, setScale: setScale, setTransform: setTransform}) {
  var x = x;
  var y = y;
  var scale = scale;

  var originalX = x;
  var originalY = y;

  x = (x / scale >= 0) ? 0 : x;
  x = ((x - window.innerWidth) / scale <= -Config.interfaceWidth) ? -Config.interfaceWidth * scale + window.innerWidth : x;

  y = (y / scale >= 0) ? 0 : y;
  y = ((y - window.innerHeight) / scale <= -Config.interfaceHeight) ? -Config.interfaceHeight * scale + window.innerHeight : y;
 
  if (x !== originalX || y !== originalY) {
    // return the new value of position when it moves outside the canvas
    setTransform(x, y, scale, 100);
  }

  // save the suitable value within the canvas into the local storage
  localStorage.setItem('coordinate',  JSON.stringify({x: x, y: y}));
    
  // no need to update the scale if it is not zooming
  if (setScale !== null) {
    localStorage.setItem('scale', scale);
    setScale(scale);
  }
}



export default Interface