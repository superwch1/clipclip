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
  
  useEffect(() => {
    // recalculate the position after adjusting the screen size
    const checkPosition = debounce((transformRef) => {
      var state = transformRef.current.instance.transformState;
      var result = isLimitToBound({x: state.positionX, y: state.positionY, scale: state.scale, setTransform: transformRef.current.setTransform});

      localStorage.setItem('coordinate',  JSON.stringify({x: result.x, y: result.y}));
      localStorage.setItem('scale', result.scale);
      setScale(result.scale);
    }, 200);

    window.onresize = (event) => checkPosition(transformRef);
  }, []);

  const [scale, setScale] = useState(storedScale);
  const transformRef = useRef(null);
  var minScale = rdd.isMobile === true ? Config.interfaceMinZoomScaleForMobile : Config.interfaceMinZoomScaleForDesktop;

  return (
    <div>
      { /* even the picture is larger than vw and vh, it still constrain everything in the view part of web browser */ }
      <TransformWrapper limitToBounds={false} initialPositionX={storedCoordinate.x} initialPositionY={storedCoordinate.y}
        ref={transformRef} initialScale={scale} minScale={minScale} maxScale={Config.interfaceMaxZoomScale} 
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
          <Create scale={scale} />
          <Zoom scale={scale} setScale={setScale}/>
        </>
      )}

      </TransformWrapper>
    </div>
  )
}

function onZoomStop (transformState, setScale) {
  var result = isLimitToBound({x: transformState.state.positionX, y: transformState.state.positionY, scale: transformState.state.scale,
    setTransform: transformState.setTransform});

  // the scale has effects on coordinate so it needs to be saved together
  localStorage.setItem('coordinate',  JSON.stringify({x: result.x, y: result.y}));
  localStorage.setItem('scale', result.scale);
  setScale(result.scale);
}


function onPanningStop (transformState) {
  var result = isLimitToBound({x: transformState.state.positionX, y: transformState.state.positionY, scale: transformState.state.scale,
    setTransform: transformState.setTransform});
  localStorage.setItem('coordinate',  JSON.stringify({x: result.x, y: result.y}));
}


function isLimitToBound({x: x, y: y, scale: scale, setTransform: setTransform}) {

  // since the transform wrapper cannot detect the size of div
  // it set limitToBounds to false and set custom transformation to prevent move outside interface
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
    setTransform(x, y, scale, 100);
  }

  // return the new value of position when it moves outside the canvas
  // otherwise, return the value from transformState
  return { x: x, y: y, scale: scale};
}





export default Interface