import Canvas from '../Canvas'
import { useState, useEffect } from 'react'
import React, {  } from "react";
import Create from '../control/create/Create'
import Zoom from '../control/zoom/Zoom'
import './Interface.css'
import Config from '../config/Config'
import { TransformWrapper, TransformComponent} from "react-zoom-pan-pinch";


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

  return (
    <div>
      <TransformWrapper limitToBounds={false} initialPositionX={storedCoordinate.x} initialPositionY={storedCoordinate.y} customTransform={customTransform}
        initialScale={scale} minScale={Config.interfaceMinZoomScale} maxScale={Config.interfaceMaxZoomScale} onZoomStop={(transformState) => onZoomStop(transformState, setScale)} 
        zoomAnimation={{ disabled: true, size: 0.1 }} // prevent scale smaller than minScale while zooming out with ctrl and wheel
        doubleClick={{disabled: true}} pinch={{excluded: ['figure']}} 
        panning={{allowLeftClickPan: false, allowRightClickPan: false, excluded: ['figure'] }} onPanningStop={onPanningStop}>

      {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
        <>
          <TransformComponent>
            <div id="interface" style={{ width: `${Config.interfaceWidth}px`, height: `${Config.interfaceHeight}px`}}>
              <Canvas scale={scale} />
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
  // the scale has effects on coordinate so it needs to be modified together
  var element = document.getElementsByClassName('react-transform-component');
  var style = window.getComputedStyle(element[0]);
  var matrix = new WebKitCSSMatrix(style.transform);
  localStorage.setItem('coordinate',  JSON.stringify({x: matrix.m41, y: matrix.m42}));

  localStorage.setItem('scale', transformState.state.scale);
  setScale(transformState.state.scale);
}


function onPanningStop (transformState) {
  var element = document.getElementsByClassName('react-transform-component');
  var style = window.getComputedStyle(element[0]);
  var matrix = new WebKitCSSMatrix(style.transform);
  localStorage.setItem('coordinate',  JSON.stringify({x: matrix.m41, y: matrix.m42}));
}


function customTransform (x, y, scale) {
  // since the transform wrapper cannot detect the size of div
  // it set limitToBounds to false and set custom transformation to prevent move outside interface
  x = (x / scale >= 0) ? 0 : x;
  x = ((x - window.screen.width) / scale <= -Config.interfaceWidth) ? -Config.interfaceWidth * scale + window.screen.width : x;

  y = (y / scale >= 0) ? 0 : y;
  y = ((y - window.screen.height) / scale <= -Config.interfaceHeight) ? -Config.interfaceHeight * scale + window.screen.height : y;

  return `translate(${x}px, ${y}px) scale(${scale})`;
};




export default Interface