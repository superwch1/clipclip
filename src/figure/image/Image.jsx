import { useEffect, useState, useRef, memo } from 'react'
import './Image.css'
import '../../config/Config.css'
import Config from '../../config/Config'
import OptionBar from '../optionBar/OptionBar'
import { Rnd } from "react-rnd";
import axios from 'axios';
import { Buffer } from "buffer";
import { onClickOutsideFigure, onSelectFigure, hideOptionBarAndToolBar, onChangeSizeAndPosition, figureIsEqual } from '../utils.mjs'


const Image = memo(({x, y, backgroundColor, width, height, id, url, zIndex, scale, sendWebSocketMessage}) => {

  console.log(`Image - ${id}`);

  const [sizeAndPosition, setSizeAndPosition] = useState({x: x, y: y, width: width, height: height});
  const containerRef = useRef(null);
  const barRef = useRef(null);
  onClickOutsideFigure(containerRef, barRef, id, null, null);  

  useEffect(() => {
    // the resize handles need to trigger mousedown and event propagation manually
    // unselect all figures by dispatching event then run onSelectFigure
    addEventForResizeHandle(id);

    // reason for converting src to base64 here is because oncopy can't process axios or else it return [] for types
    var imageElement = document.getElementById(`${id}-image`);
    axios.get(`${Config.url}/image/?url=${url}`, { responseType: 'arraybuffer' }).then(response => {
      const base64Data = Buffer.from(response.data, 'binary').toString('base64');
      const contentType = response.headers['content-type'] || response.headers['Content-Type'];
      const base64 = `data:${contentType};base64,${base64Data}`;
      imageElement.src = base64;
    });
  }, []);

  // run when change in value of x, y, width, height
  useEffect(() => {
    setSizeAndPosition({x: x, y: y, width: width, height: height})
  }, [x, y, width, height]);  

  return (
    // Rnd cannot be used to pass the ref
    // reason for using onDrag and onResize instead of start is because even clicking figure will invoke start event
    <>
      <Rnd
        id={`${id}-rnd`} 
        enableResizing={Config.objectResizingDirection} size={{ width: sizeAndPosition.width, height: sizeAndPosition.height }} position={{ x: sizeAndPosition.x, y: sizeAndPosition.y }} 
        resizeHandleStyles={{bottomRight: Config.resizeHandleStyle, bottomLeft: Config.resizeHandleStyle, topRight: Config.resizeHandleStyle, topLeft: Config.resizeHandleStyle}}
        resizeHandleWrapperClass={`${id}-resizeHandle`} resizeHandleWrapperStyle={{opacity: '0'}}
        
        bounds="#interface" lockAspectRatio={true} style={{zIndex: `${zIndex}`}} cancel={`.${id}-noDrag`}
        minWidth={Config.figureMinWidth} minHeight={Config.figureMinHeight} maxWidth={Config.figureMaxWidth} maxHeight={Config.figureMaxHeight} 
        scale={scale} className='figure'
        onMouseDown={(e) => onSelectFigure(id, null, null)}
        onDrag={(e, data) => hideOptionBarAndToolBar(id)}
        onResize={(e, direction, ref, delta, position) => hideOptionBarAndToolBar(id)}
        onDragStop={async (e, data) => await onChangeSizeAndPosition(sizeAndPosition, { x: data.x, y: data.y, width: sizeAndPosition.width, height: sizeAndPosition.height}, setSizeAndPosition, id, sendWebSocketMessage)}
        onResizeStop={async (e, direction, ref, delta, position) => await onChangeSizeAndPosition(sizeAndPosition, { x: position.x, y: position.y, width: parseInt(ref.style.width.replace("px", "")), height: parseInt(ref.style.height.replace("px", ""))}, setSizeAndPosition, id, sendWebSocketMessage)}>
        
        <div id={`${id}`} className='image' ref={containerRef} style={{ width: '100%', height: '100%'}}
            data-type={"image"} data-x={x} data-y={y} data-zindex={zIndex} data-width={width} data-height={height} data-url={url} data-backgroundcolor={backgroundColor}>
          
          <img id={`${id}-image`} draggable={false} alt="Downloaded" style={{ width: '100%', height: '100%', objectFit: 'contain'}} />
        </div>
      </Rnd>
      <div id={`${id}-bar`} ref={barRef} style={{zIndex: '100', position: 'absolute', transform: `translate(${sizeAndPosition.x}px, ${sizeAndPosition.y}px)`}}>
        <OptionBar id={id} backgroundColor={backgroundColor} sendWebSocketMessage={sendWebSocketMessage} sizeAndPosition={sizeAndPosition} />
      </div>
    </>
  )
}, figureIsEqual);


function addEventForResizeHandle(id) {
  var resizeHandle = document.getElementsByClassName(`${id}-resizeHandle`)[0];

  resizeHandle.addEventListener('mousedown', (event) => {
    const outerEvent = new Event('mousedown', { bubbles: true });
    document.dispatchEvent(outerEvent); // it needs to use document here and nother parent of resize handle, or else it will become shakey in resizing
    onSelectFigure(id, null, null); // it need to be last to select again after having identified as clicking outside
  });
  
  resizeHandle.addEventListener('touchstart', (event) => { 
    const outerEvent = new Event('touchstart', { bubbles: true });
    document.dispatchEvent(outerEvent);
    onSelectFigure(id, null, null);
  });
}


export default Image
