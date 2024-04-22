import { useEffect, useState, useRef, memo } from 'react'
import './Preview.css'
import '../../config/Config.css'
import Config from '../../config/Config'
import OptionBar from '../optionBar/OptionBar'
import { Rnd } from "react-rnd";
import { ReactTinyLink } from 'react-tiny-link'
import { onClickOutsideFigure, onSelectFigure, onChangeSizeAndPosition, figureIsEqual } from '../utils.mjs'


const Preview = memo(({x, y, backgroundColor, width, height, id, url, zIndex, scale, sendWebSocketMessage}) => {

  // since when the component move or resize, it will rerender once, then the websocket rerender twice
  console.log(`Preview - ${id}`);

  // run when change in value of x, y, width, height
  useEffect(() => {
    console.log(`Resize Preview - ${id}`);
    setSizeAndPosition({x: x, y: y, width: width, height: height})
  }, [x, y, width, height]);

  useEffect(() => {
    const object = document.getElementById(`${id}`);
    const previewContent = object.getElementsByClassName('react_tinylink_card_content_wrapper');
    previewContent[0].style.backgroundColor = `${backgroundColor}`;
    previewContent[0].classList.add(`${id}-noDrag`);
  });

  const [sizeAndPosition, setSizeAndPosition] = useState({x: x, y: y, width: width, height: height});
  const wrapperRef = useRef(null);
  onClickOutsideFigure(wrapperRef, id, null, null);  

  return (
    <Rnd enableResizing={Config.objectResizingDirection} size={{ width: sizeAndPosition.width, height: sizeAndPosition.height }} position={{ x: sizeAndPosition.x, y: sizeAndPosition.y }} 
      bounds="#interface" cancel={`.${id}-noDrag`} style={{zIndex: `${zIndex}`}}
      minWidth={Config.figureMinWidth} minHeight={Config.figureMinHeight} maxWidth={Config.figureMaxWidth} maxHeight={Config.figureMaxHeight}  
      onMouseDown={(event) => onSelectFigure(event, id, null, null)} draggable={false} scale={scale}
      onResizeStop={(e, direction, ref, delta, position) => onChangeSizeAndPosition(sizeAndPosition, { x: position.x, y: position.y, width: ref.style.width.replace("px", ""), height: ref.style.height.replace("px", "") }, setSizeAndPosition, id, sendWebSocketMessage)}
      onDragStop={(e, data) => onChangeSizeAndPosition(sizeAndPosition, { x: data.x, y: data.y, width: sizeAndPosition.width, height: sizeAndPosition.height}, setSizeAndPosition, id, sendWebSocketMessage)}>

      <div id={id} ref={wrapperRef} style={{height: "100%", width: "100%", overflow: "hidden"}} >
        <OptionBar id={id} backgroundColor={backgroundColor} sendWebSocketMessage={sendWebSocketMessage} />
        <ReactTinyLink cardSize="large" width={sizeAndPosition.width} height={sizeAndPosition.height} showGraphic={true} url={url} proxyUrl={`${Config.url}/proxy`} />
      </div>    
    </Rnd>
  )
}, figureIsEqual);


export default Preview
