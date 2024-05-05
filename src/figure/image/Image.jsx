import { useEffect, useState, useRef, memo } from 'react'
import './Image.css'
import '../../config/Config.css'
import Config from '../../config/Config'
import OptionBar from '../optionBar/OptionBar'
import { Rnd } from "react-rnd";
import { onClickOutsideFigure, onSelectFigure, onChangeSizeAndPosition, figureIsEqual } from '../utils.mjs'


const Image = memo(({x, y, backgroundColor, width, height, id, url, zIndex, scale, sendWebSocketMessage}) => {

  console.log(`Image - ${id}`);

  // run when change in value of x, y, width, height
  useEffect(() => {
    console.log(`Resize Image - ${id}`);
    setSizeAndPosition({x: x, y: y, width: width, height: height})
  }, [x, y, width, height]);  

  const [sizeAndPosition, setSizeAndPosition] = useState({x: x, y: y, width: width, height: height});
  const wrapperRef = useRef(null);
  onClickOutsideFigure(wrapperRef, id, null, null);  


  return (
    <Rnd enableResizing={Config.objectResizingDirection} size={{ width: sizeAndPosition.width, height: sizeAndPosition.height }} position={{ x: sizeAndPosition.x, y: sizeAndPosition.y }} 
      bounds="#interface" lockAspectRatio={true} style={{zIndex: `${zIndex}`}} cancel={`.${id}-noDrag`}
      minWidth={Config.figureMinWidth} minHeight={Config.figureMinHeight} maxWidth={Config.figureMaxWidth} maxHeight={Config.figureMaxHeight} 
      onMouseDown={(event) => onSelectFigure(event, id, null, null)} scale={scale} className='figure'
      onResizeStop={(e, direction, ref, delta, position) => onChangeSizeAndPosition(sizeAndPosition, { x: position.x, y: position.y, width: ref.style.width.replace("px", ""), height: ref.style.height.replace("px", "") }, setSizeAndPosition, id, sendWebSocketMessage)}
      onDragStop={(e, data) => onChangeSizeAndPosition(sizeAndPosition, { x: data.x, y: data.y, width: sizeAndPosition.width, height: sizeAndPosition.height}, setSizeAndPosition, id, sendWebSocketMessage)}>
      
      <div id={`${id}`} className='image' ref={wrapperRef} >
        <OptionBar id={id} backgroundColor={backgroundColor} sendWebSocketMessage={sendWebSocketMessage} />
        <img draggable={false} src={`${Config.url}/image/?url=${url}`} alt="Downloaded" style={{ width: '100%', height: '100%', objectFit: 'contain'}} />
      </div>
    </Rnd>
  )
}, figureIsEqual);



export default Image
