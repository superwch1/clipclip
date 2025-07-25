import Dashboard from '../dashboard/Dashboard'
import { useState, useEffect, useRef } from 'react'
import Menu from '../dashboard/menu/Menu'
import Zoom from '../dashboard/zoom/Zoom'
import Cursors from '../dashboard/cursors/Cursors'
import './App.css'
import Config from '../config/Config'
import { TransformWrapper, TransformComponent} from "react-zoom-pan-pinch"
import * as rdd from 'react-device-detect'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './quill.bubble.css' // https://cdn.jsdelivr.net/npm/quill@2.0.2/dist/quill.bubble.css - prevent CORS issue of screenshot, remove last line for mapping issue
import { useLocation } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid';
import { isInputOrEditorFocused } from '../utlis.mjs'
import CopyHotKey from '../dashboard/hotKey/CopyHotKey'
import PasteHotKey from '../dashboard/hotKey/PasteHotKey'
import CutHotKey from '../dashboard/hotKey/CutHotKey'
import DeleteHotKey from '../dashboard/hotKey/DeleteHotKey'



function App() {

  const location = useLocation();
  const boardIdRef = useRef(location.pathname.slice(7).replace(/[^a-z0-9_-]/g, '')); // Removes the leading '/'

  // set the position, scale and cursor into storage if no value is found
  var boardProps = JSON.parse(localStorage.getItem(`${boardIdRef.current}_props`));
  if (boardProps === null) {
    boardProps = {};
    boardProps.scale = 1;
    boardProps.position = {x: (-Config.interfaceWidth + window.innerWidth) / 2, y: (-Config.interfaceHeight + window.innerHeight) / 2};
    boardProps.cursor = {x: 0, y: 0};
    localStorage.setItem(`${boardIdRef.current}_props`, JSON.stringify(boardProps));
  }

  const [scale, setScale] = useState(boardProps.scale);

  // ensure the stored position is inside the bound
  var verifiedPosition = checkInsideBound({x: boardProps.position.x, y: boardProps.position.y, scale: scale});
  const positionRef = useRef({x: verifiedPosition.x, y: verifiedPosition.y})
  const cursorRef = useRef({x: 0, y: 0});
   

  
  // allows scroll wheel to move up and down and reposition the inteface after resize of web browser
  const canvasRef = useRef(null);
  useEffect(() => {
    // recalculate the position after adjusting the screen size (incl. open and close F12 developer console)
    function resize(event) {
      var state = canvasRef.current.instance.transformState;
      checkInsideBoundAndStorePosition({x: state.positionX, y: state.positionY, scale: state.scale, setScale: null, setTransform: canvasRef.current.setTransform, positionRef: positionRef, cursorRef: cursorRef, boardIdRef: boardIdRef});
    }

    // event run only on scrolling wheel and zooming on mousepad
    // ctrl + wheel will not trigger wheel event
    function handleWheel(event) {
      // just scrolling
      if(event.ctrlKey === false && isInputOrEditorFocused() === false) {
        var state = canvasRef.current.instance.transformState;
        var verifiedPosition = checkInsideBound({x: state.positionX - event.deltaX, y: state.positionY - event.deltaY, scale: state.scale})
        canvasRef.current.setTransform(verifiedPosition.x, verifiedPosition.y, state.scale, 0);

        // it needs to save position to storage since it does not use checkInsideBoundAndStorePosition function
        localStorage.setItem(`${boardIdRef.current}_props`, JSON.stringify({scale: scale, position: verifiedPosition, cursor: cursorRef.current}));

        positionRef.current.x = verifiedPosition.x;
        positionRef.current.y = verifiedPosition.y;
      }

      // zooming on keyboard
      // implement inside Zoom.jsx
    }
    window.addEventListener("wheel", handleWheel);
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("resize", resize);
    };
  }, [canvasRef]);
  

  
  useEffect(() => {
    // prevent use of ctrl with wheel or ctrl with +- to scale up and down for the whole web page
    const handleWheel = (event) => {
      if (event.ctrlKey === true) {
        event.preventDefault();
      }
    };

    const handleKeyDown = (event) => {
      if (event.ctrlKey && (event.key === '+' || event.key === '-'|| event.key==='=')) {
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


  // unmounted and create a new instance of Component by changing the key of interface
  const [interfaceKey, setInterfaceKey] = useState(uuidv4());
  if (rdd.isMobile) {
    useEffect(() => {
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          setInterfaceKey(uuidv4());
        }
      };  
      document.addEventListener('visibilitychange', handleVisibilityChange);
  
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }, []);
  }



  // store the reversed actions after performing create / update / delete figures
  // the actions will be manipulated inside reverse.jsx inside menu
  const reverseActionsRef = useRef([]);


  const figuresRef = useRef([])
  

  return (
    // return to the original location if the virtual keyboard has caused shifted right or bottom on the screen
    <div id={"app"} style={{position: 'fixed'}}>

      { /* even the picture is larger than vw and vh, it still constrain everything in the view part of web browser  
           solution for that is to set limitToBounds to false */}
      <TransformWrapper limitToBounds={false} initialPositionX={positionRef.current.x} initialPositionY={positionRef.current.y}

        // keys for activiation - https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values
        ref={canvasRef} initialScale={scale} minScale={rdd.isMobile === true ? Config.interfaceMinZoomScaleForMobile : Config.interfaceMinZoomScaleForDesktop} maxScale={Config.interfaceMaxZoomScale} 
        onZoom={(transformState) => onZooming(transformState, setScale, positionRef, cursorRef, boardIdRef)} zoomAnimation={{ disabled: true, size: 0.1 }} // set disable true to prevent zoom out of canvas because of library bug
        onPanning={(transformState) => onPanning(transformState, positionRef, cursorRef, boardIdRef)} panning={{allowRightClickPan: true, excluded: ['figure', 'optionbar', 'toolbar'], velocityDisabled: true }} // disable panning velocity to prevent residual movement after panning
        doubleClick={{disabled: true}} pinch={{excluded: ['figure', 'optionbar', 'toolbar']}} wheel={{activationKeys: ["Control", "Meta"]}} > 

        <TransformComponent>
          {/* when cursor event is set to none, the cursor will not be respond to mouse event, it needs to create another div */}
          <div id="interface" key={interfaceKey} style={{ width: `${Config.interfaceWidth}px`, height: `${Config.interfaceHeight}px`}}>
            <Dashboard scale={scale} reverseActionsRef={reverseActionsRef} boardIdRef={boardIdRef} figuresRef={figuresRef} />  
            <Cursors scale={scale} positionRef={positionRef} cursorRef={cursorRef} boardIdRef={boardIdRef} /> {/* cursor needs to stay inside interface otherwise the position will be incorrect */}
          </div>
        </TransformComponent>

        { /* the following components are placed on top of the Canvas */ }
        <div id='control' style={{touchAction: "none"}}>
          <Menu scale={scale} reverseActionsRef={reverseActionsRef} boardIdRef={boardIdRef} positionRef={positionRef} />
          <PasteHotKey scale={scale} reverseActionsRef={reverseActionsRef} boardIdRef={boardIdRef} cursorRef={cursorRef} positionRef={positionRef}/>
          <CopyHotKey figuresRef={figuresRef}/>
          <CutHotKey reverseActionsRef={reverseActionsRef} figuresRef={figuresRef}/>
          <DeleteHotKey reverseActionsRef={reverseActionsRef} figuresRef={figuresRef}/>
          {rdd.isDesktop === true && <Zoom scale={scale} setScale={setScale} checkInsideBoundAndStorePosition={checkInsideBoundAndStorePosition} boardIdRef={boardIdRef} cursorRef={cursorRef} positionRef={positionRef} />}
        </div>
      </TransformWrapper>
      <ToastContainer position="bottom-left" autoClose={5000} draggable theme="light" />
    </div>
  )
}

function onPanning (transformState, positionRef, cursorRef, boardIdRef) {
  checkInsideBoundAndStorePosition({ x: transformState.state.positionX, y: transformState.state.positionY, scale: transformState.state.scale, 
    setScale: null, setTransform: transformState.setTransform, positionRef: positionRef, cursorRef: cursorRef, boardIdRef: boardIdRef});
}

function onZooming(transformState, setScale, positionRef, cursorRef, boardIdRef) {
  // the scale has effects on position so it needs to be saved together
  checkInsideBoundAndStorePosition({ x: transformState.state.positionX, y: transformState.state.positionY, scale: transformState.state.scale, 
    setScale: setScale, setTransform: transformState.setTransform, positionRef: positionRef, cursorRef: cursorRef, boardIdRef: boardIdRef});
}


// check whether the positionX and positionY is inside or outside the canvas
// if it is outside the canvas, call the setTranform function
// save the x, y and scale value to the local storage
function checkInsideBoundAndStorePosition({x: x, y: y, scale: scale, setScale: setScale, setTransform: setTransform, positionRef: positionRef, cursorRef: cursorRef, boardIdRef: boardIdRef}) {
  var x = x;
  var y = y;
  var scale = scale;

  var verifiedPosition = checkInsideBound({x: x, y: y, scale: scale});
 
  // it is true when the value is not inside bound
  if (x !== verifiedPosition.x || y !== verifiedPosition.y) {
    // return the new value of position when it moves outside the canvas
    setTransform(verifiedPosition.x, verifiedPosition.y, scale, 0);
  }

  localStorage.setItem(`${boardIdRef.current}_props`, JSON.stringify({scale: scale, position: verifiedPosition, cursor: cursorRef.current}));

  positionRef.current = { x: verifiedPosition.x, y: verifiedPosition.y };

  // no need to update the scale if it is not zooming
  if (setScale !== null) {
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