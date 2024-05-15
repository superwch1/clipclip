import { useEffect, useState, useRef, memo } from 'react'
import './Image.css'
import '../../config/Config.css'
import Config from '../../config/Config'
import OptionBar from '../optionBar/OptionBar'
import { Rnd } from "react-rnd";
import axios from 'axios';
import { Buffer } from "buffer";
import { onClickOutsideFigure, onSelectFigure, onChangeSizeAndPosition, figureIsEqual, unselectOtherFigures } from '../utils.mjs'


const Image = memo(({x, y, backgroundColor, width, height, id, url, zIndex, scale, sendWebSocketMessage}) => {

  console.log(`Image - ${id}`);

  const [sizeAndPosition, setSizeAndPosition] = useState({x: x, y: y, width: width, height: height});
  const wrapperRef = useRef(null);
  onClickOutsideFigure(wrapperRef, id, null, null);  

  // reason for using addEventListener instead of onMouseDown in props is because of clicking resize corner won't trigger event
  // click the resizing corner won't have mouse down event that can't unselect other figure
  useEffect(() => {
    document.getElementById(`${id}-rnd`).addEventListener('mousedown', (event) => {
      unselectOtherFigures(id);
      onSelectFigure(event, id, null, null)
    });
    document.getElementById(`${id}-rnd`).addEventListener('touchstart', (event) => {
      unselectOtherFigures(id);
      onSelectFigure(event, id, null, null)
    });

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
    console.log(`Resize Image - ${id}`);
    setSizeAndPosition({x: x, y: y, width: width, height: height})

    // relocate the resizing handle inside the div for detecting clicks
    var resizeHandle = document.getElementsByClassName(`${id}-resizeHandle`);
    var container = document.getElementById(`${id}`);
    container.prepend(resizeHandle[0]);
  }, [x, y, width, height]);  

  return (
    // Rnd cannot be used to pass the ref
    <Rnd
      id={`${id}-rnd`} 
      enableResizing={Config.objectResizingDirection} size={{ width: sizeAndPosition.width, height: sizeAndPosition.height }} position={{ x: sizeAndPosition.x, y: sizeAndPosition.y }} 
      resizeHandleStyles={{bottomRight: Config.resizeHandleStyle, bottomLeft: Config.resizeHandleStyle, topRight: Config.resizeHandleStyle, topLeft: Config.resizeHandleStyle}}
      resizeHandleWrapperClass={`${id}-resizeHandle`} resizeHandleWrapperStyle={{opacity: '0'}}
      
      bounds="#interface" lockAspectRatio={true} style={{zIndex: `${zIndex}`}} cancel={`.${id}-noDrag`}
      minWidth={Config.figureMinWidth} minHeight={Config.figureMinHeight} maxWidth={Config.figureMaxWidth} maxHeight={Config.figureMaxHeight} 
      scale={scale} className='figure'
      onResizeStop={(e, direction, ref, delta, position) => onChangeSizeAndPosition(sizeAndPosition, { x: position.x, y: position.y, width: ref.style.width.replace("px", ""), height: ref.style.height.replace("px", "") }, setSizeAndPosition, id, sendWebSocketMessage)}
      onDragStop={(e, data) => onChangeSizeAndPosition(sizeAndPosition, { x: data.x, y: data.y, width: sizeAndPosition.width, height: sizeAndPosition.height}, setSizeAndPosition, id, sendWebSocketMessage)}>
      
      <div id={`${id}`} className='image' ref={wrapperRef} 
           data-type={"image"} data-x={x} data-y={y} data-zindex={zIndex} data-width={width} data-height={height} data-url={url} data-backgroundcolor={backgroundColor}>
        <OptionBar id={id} backgroundColor={backgroundColor} sendWebSocketMessage={sendWebSocketMessage} />
        <img id={`${id}-image`} src={`${Config.url}/image/?url=${url}`} draggable={false} alt="Downloaded" style={{ width: '100%', height: '100%', objectFit: 'contain'}} />
      </div>
    </Rnd>
  )
}, figureIsEqual);



export default Image
