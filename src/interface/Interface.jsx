import Canvas from '../Canvas'
import { useEffect, useState, useRef } from 'react'
import React, {  } from "react";
import Create from '../control/create/Create'
import Zoom from '../control/zoom/Zoom'
import './Interface.css'
import Config from '../config/Config'
import { TransformWrapper, TransformComponent, useTransformContext } from "react-zoom-pan-pinch";


function Interface() {
  const [scale, setScale] = useState(1);

  const handlePanningStop = (transformState) => {
    var element = document.getElementsByClassName('react-transform-component');
    var style = window.getComputedStyle(element[0]);
    var matrix = new WebKitCSSMatrix(style.transform);
    localStorage.setItem('coordinate',  JSON.stringify({x: -matrix.m41, y: -matrix.m42}));
  };

  const customPanningTransform = (x, y, scale) => {
    // since the transform wrapper cannot detect the size of div
    // it set limitToBounds to false and set custom transformation to prevent move outside interface
    x = (x / scale >= 0) ? 0 : x;
    x = ((x - window.screen.width) / scale <= -Config.interfaceWidth) ? -Config.interfaceWidth * scale + window.screen.width : x;

    y = (y / scale >= 0) ? 0 : y;
    y = ((y - window.screen.height) / scale <= -Config.interfaceHeight) ? -Config.interfaceHeight * scale + window.screen.height : y;

    return `translate(${x}px, ${y}px) scale(${scale})`;
  };

  return (
    <div>
      <TransformWrapper limitToBounds={false} initialPositionX={-15000} initialPositionY={-15000} customTransform={customPanningTransform}
        initialScale={1} minScale={0.5} maxScale={2} onZoomStop={(event) => setScale(event.state.scale)} 
        zoomAnimation={{ disabled: true }} // prevent scale smaller than minScale while zooming out with ctrl and wheel
        doubleClick={{disabled: true}} panning={{allowLeftClickPan: false, allowRightClickPan: false }} onPanningStop={handlePanningStop}>
      
        <TransformComponent>
          <div id="interface" style={{ width: `${Config.interfaceWidth}px`, height: `${Config.interfaceHeight}px`}}>
            <Canvas scale={scale} />
          </div>
        </TransformComponent>
      </TransformWrapper>

      { /* these component are placed on top of the Canvas */ }
      <Create scale={scale} />
      <Zoom scale={scale} setScale={setScale}/>
    </div>
  )
}




export default Interface