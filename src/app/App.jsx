import Canvas from '../figure/Canvas'
import { useState, useEffect, useRef } from 'react'
import React, {  } from "react";
import Menu from '../control/menu/Menu'
import Zoom from '../control/zoom/Zoom'
import Cursors from '../cursors/Cursors'
import CopyAndPaste from '../control/copyAndPaste/CopyAndPaste';
import CutAndDelete from '../control/cutAndDelete/CutAndDelete';
import './App.css'
import Config from '../config/Config'
import { TransformWrapper, TransformComponent} from "react-zoom-pan-pinch";
import * as rdd from 'react-device-detect';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



function App() {

  // set the position and scale into storage if no value is found
  var storedScale = JSON.parse(localStorage.getItem('scale'));
  if (storedScale === null) {
    localStorage.setItem('scale', 1);
    storedScale = 1;
  }

  var storedPosition = JSON.parse(localStorage.getItem('position'));
  if (storedPosition === null) {
    localStorage.setItem('position',  JSON.stringify({x: (-Config.interfaceWidth + window.innerWidth) / 2, y: (-Config.interfaceHeight + window.innerHeight) / 2}));
    storedPosition = {x: (-Config.interfaceWidth + window.innerWidth) / 2, y: (-Config.interfaceHeight + window.innerHeight) / 2};
  }
  // ensure the stored position is inside the bound
  storedPosition = checkInsideBound({x: storedPosition.x, y: storedPosition.y, scale: storedScale});

  const [scale, setScale] = useState(storedScale);
  

  
  // allows scroll wheel to move up and down and reposition the inteface after resize of web browser
  const canvasRef = useRef(null);
  useEffect(() => {
    // recalculate the position after adjusting the screen size (incl. open and close F12 developer console)
    function resize(event) {
      var state = canvasRef.current.instance.transformState;
      checkInsideBoundAndStorePosition({x: state.positionX, y: state.positionY, scale: state.scale, setScale: null, setTransform: canvasRef.current.setTransform});
    }

    function handleWheel(event) {
      if(event.ctrlKey === false) {
        var state = canvasRef.current.instance.transformState;
        var position = checkInsideBound({x: state.positionX - event.deltaX, y: state.positionY - event.deltaY, scale: state.scale})
        canvasRef.current.setTransform(position.x, position.y, state.scale, 0);

        // it needs to save position to storage since it does not use checkInsideBoundAndStorePosition function
        localStorage.setItem('position',  JSON.stringify({x: position.x, y: position.y}));
      }
    }
    window.addEventListener("wheel", handleWheel);
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("resize", resize);
    };
  }, [canvasRef]);



  // prevent use of ctrl with wheel or ctrl with +- to scale up and down for the whole web page
  useEffect(() => {
    const handleWheel = (event) => {
      if (event.ctrlKey === true) {
        event.preventDefault();
      }
    };

    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && (event.key === '+' || event.key === '-'|| event.key==='=')) {
        event.preventDefault();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel, { passive: false });
      window.removeEventListener('keydown', handleKeyDown, { passive: false });
    };
  }, []);



  // store the reversed actions after performing create / update / delete figures
  // the actions will be manipulated inside reverse.jsx inside menu
  const reverseActions = useRef([]);


  return (
    // return to the original location if the virtual keyboard has caused shifted right or bottom on the screen
    <div id={"app"} style={{position: 'fixed'}}>

      { /* even the picture is larger than vw and vh, it still constrain everything in the view part of web browser  
           solution for that is to set limitToBounds to false */}
      <TransformWrapper limitToBounds={false} initialPositionX={storedPosition.x} initialPositionY={storedPosition.y}

        // keys for activiation - https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values
        ref={canvasRef} initialScale={scale} minScale={rdd.isMobile === true ? Config.interfaceMinZoomScaleForMobile : Config.interfaceMinZoomScaleForDesktop} maxScale={Config.interfaceMaxZoomScale} 
        onZoom={(transformState) => onZooming(transformState, setScale)} zoomAnimation={{ disabled: true, size: 0.1 }} // set disable true to prevent zoom out of canvas because of library bug
        doubleClick={{disabled: true}} pinch={{excluded: ['figure', 'optionbar', 'toolbar']}} wheel={{activationKeys: ["Control"]}}
        onPanning={(transformState) => onPanning(transformState)} panning={{allowRightClickPan: true, excluded: ['figure', 'optionbar', 'toolbar'] }} >

        <TransformComponent>
          <div id="interface" style={{ width: `${Config.interfaceWidth}px`, height: `${Config.interfaceHeight}px`}}>
            <Canvas scale={scale} reverseActions={reverseActions} />  
            <Cursors scale={scale}/> {/* cursor needs to stay inside interface otherwise the position will be incorrect */}
          </div>
        </TransformComponent>

        { /* the following components are placed on top of the Canvas */ }
        <div id='control'>
          <Menu scale={scale} reverseActions={reverseActions} />
          <CopyAndPaste scale={scale} reverseActions={reverseActions} />
          <CutAndDelete reverseActions={reverseActions} />
          {rdd.isDesktop === true && <Zoom scale={scale} setScale={setScale} checkInsideBoundAndStorePosition={checkInsideBoundAndStorePosition}/>}
        </div>
      </TransformWrapper>
      <ToastContainer position="bottom-left" autoClose={5000} draggable theme="light" />
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


export default App