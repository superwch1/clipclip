import Canvas from '../Canvas'
import { useEffect, useState } from 'react'
import Create from '../control/create/Create'
import Zoom from '../control/zoom/Zoom'
import './Interface.css'
import Config from '../config/Config'


function Interface() {
  var dragProperty = { isMiddleMouseDown: false, originalCursorPosition: { x: 0, y: 0 }, screenPosition: { x: 0, y: 0 }};
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const storedCoordinates = localStorage.getItem('coordinates');
    if (storedCoordinates) {
      const coordinates = JSON.parse(storedCoordinates);
      var x = Math.abs(Config.interfaceWidth / 2 - coordinates.x) > 2000 ? Config.interfaceWidth / 2 : coordinates.x;
      var y = Math.abs(Config.interfaceHeight / 2 - coordinates.y) > 2000 ? Config.interfaceHeight / 2 : coordinates.y;
      window.scrollTo(x, y);
    }
    else {
      localStorage.setItem('coordinates', JSON.stringify({ x: Config.interfaceWidth / 2, y: Config.interfaceHeight / 2 }));
      window.scrollTo(Config.interfaceWidth / 2, Config.interfaceHeight / 2);
    } 
    
    const storedScale = localStorage.getItem('scale');
    if (storedScale) {
      setScale(parseFloat(storedScale));
    }
    else {
      localStorage.setItem('scale', 1);
    }
  }, [])

  
  useEffect(() => {
    // only addEventListener allow for passive event
    document.addEventListener('wheel', (event) => zoomByScrolling(event, scale, setScale), { passive: false });
    document.addEventListener('mousedown', (event) => mouseDown(event, dragProperty));
    document.addEventListener('mousemove', (event) => mouseMove(scale, event, dragProperty));
    document.addEventListener('mouseup', (event) => mouseUp(event, dragProperty));

    /* when the interface zoom out, the root still preserve its original height and width */
    document.getElementById('interface').style.transform = `scale(${scale})`; // set the zoom ratio
    document.getElementById('interface').style.transformOrigin = `${window.scrollX}px ${window.scrollY}px`; // get the origin as top left corner

    document.getElementById('root').style.height = Config.interfaceHeight * scale + 'px';
    document.getElementById('root').style.width = Config.interfaceWidth * scale + 'px';

    localStorage.setItem('scale', scale.toFixed(1));

    return () => {
      document.removeEventListener('wheel', (event) => zoomByScrolling(event, scale, setScale), { passive: false });
      document.removeEventListener('mousedown', (event) => mouseDown(event, dragProperty));
      document.removeEventListener('mousemove', (event) => mouseMove(scale, event, dragProperty));
      document.removeEventListener('mouseup', (event) => mouseUp(event, dragProperty));
    }
  }, [scale])


  return (
    <>
      { /* pointer event are used to disable all click / drag / select of figures */ }
      <div id="interface" style={{pointerEvents: "initial", width: `${Config.interfaceWidth}px`, height: `${Config.interfaceHeight}px`}}>
        <Canvas scale={scale} />
      </div>

      { /* these component are placed on top of the Canvas */ }
      <Create scale={scale}/>
      <Zoom scale={scale} setScale={setScale}/>
    </> 
  )
}


function mouseDown(event, dragProperty) {
  if (event.button === 1) { // Middle mouse button
    dragProperty.isMiddleMouseDown = true;
    event.preventDefault();

    document.getElementById('interface').style.cursor = 'grab';
    dragProperty.screenPosition = { x: window.scrollX, y: window.scrollY }
    dragProperty.originalCursorPosition = { x: event.clientX, y: event.clientY };
  }
}


function mouseMove(scale, event, dragProperty) {
  if (dragProperty.isMiddleMouseDown) {
    var dragXDistance = dragProperty.screenPosition.x - (event.clientX - dragProperty.originalCursorPosition.x) / scale;
    var dragYDistance = dragProperty.screenPosition.y - (event.clientY - dragProperty.originalCursorPosition.y) / scale;
    window.scrollTo(dragXDistance, dragYDistance);
    
    localStorage.setItem('coordinates', JSON.stringify({ x: window.scrollX, y: window.scrollY }));
    document.getElementById('interface').style.transformOrigin = `${window.scrollX}px ${window.scrollY}px`;
  }
}

function mouseUp(event, dragProperty) {
  if (event.button === 1) {
    dragProperty.isMiddleMouseDown = false;
    document.getElementById('interface').style.cursor = ''; 
  }
}



function zoomByScrolling(event, scale, setScale) {
  if (event.ctrlKey) {
    event.preventDefault();

    var newScale = scale;
    if (event.deltaY < 0 && scale + 0.1 <= 2) { // Zoom in
      newScale = scale + 0.1;
    } else if (event.deltaY > 0 && scale - 0.1 >= 0.3) { // Zoom out
      newScale = scale - 0.1;
    }

    if (scale !== newScale) {
      setScale(newScale); 
    }
  }
}

export default Interface