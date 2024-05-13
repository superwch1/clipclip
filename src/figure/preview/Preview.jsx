import { useEffect, useState, useRef, memo } from 'react'
import './Preview.css'
import '../../config/Config.css'
import Config from '../../config/Config'
import OptionBar from '../optionBar/OptionBar'
import { Rnd } from "react-rnd";
import { onClickOutsideFigure, onSelectFigure, onChangeSizeAndPosition, figureIsEqual, unselectOtherFigures } from '../utils.mjs'
import axios from 'axios';


const Preview = memo(({x, y, backgroundColor, width, height, id, url, zIndex, scale, sendWebSocketMessage}) => {

  // since when the component move or resize, it will rerender once, then the websocket rerender twice
  console.log(`Preview - ${id}`);

  const [sizeAndPosition, setSizeAndPosition] = useState({x: x, y: y, width: width, height: height});
  const [previewData, setPreviewData] = useState(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const getInfo = async () => {
      const response = await axios.get(`${Config.url}/preview`, { params: { id: id} });
      setPreviewData(response.data[0]);
    }
    getInfo();
  }, [url])

  // run when change in value of x, y, width, height
  useEffect(() => {
    console.log(`Resize Preview - ${id}`);
    setSizeAndPosition({x: x, y: y, width: width, height: height});

    // relocate the resizing handle inside the div for detecting clicks
    var resizeHandle = document.getElementsByClassName(`${id}-resizeHandle`);
    var container = document.getElementById(`${id}`);
    container.prepend(resizeHandle[0]); //appendChild();
  }, [x, y, width, height]);

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
  }, []);
  
  // make sure the prevewData elements will not be used or it will crash since element cannot be found
  onClickOutsideFigure(wrapperRef, id, null, null);  
  

  return (
    <Rnd id={`${id}-rnd`}
      enableResizing={Config.objectResizingDirection} size={{ width: sizeAndPosition.width, height: sizeAndPosition.height }} position={{ x: sizeAndPosition.x, y: sizeAndPosition.y }} 
      resizeHandleStyles={{bottomRight: Config.resizeHandleStyle, bottomLeft: Config.resizeHandleStyle, topRight: Config.resizeHandleStyle, topLeft: Config.resizeHandleStyle}}
      resizeHandleWrapperClass={`${id}-resizeHandle`} resizeHandleWrapperStyle={{opacity: '0'}}

      bounds="#interface" cancel={`.${id}-noDrag`} style={{zIndex: `${zIndex}`}} 
      minWidth={Config.figureMinWidth} minHeight={Config.figureMinHeight} maxWidth={Config.figureMaxWidth} maxHeight={Config.figureMaxHeight}  
      draggable={false} scale={scale} className='figure'
      onResizeStop={(e, direction, ref, delta, position) => onChangeSizeAndPosition(sizeAndPosition, { x: position.x, y: position.y, width: ref.style.width.replace("px", ""), height: ref.style.height.replace("px", "") }, setSizeAndPosition, id, sendWebSocketMessage)}
      onDragStop={(e, data) => onChangeSizeAndPosition(sizeAndPosition, { x: data.x, y: data.y, width: sizeAndPosition.width, height: sizeAndPosition.height}, setSizeAndPosition, id, sendWebSocketMessage)}>

      <div id={id} ref={wrapperRef} className='preview-container preview' style={{backgroundColor: `${backgroundColor}`}}>
        <OptionBar id={id} backgroundColor={backgroundColor} sendWebSocketMessage={sendWebSocketMessage} />
        {previewData !== null && previewData !== undefined && 
        <>
          <img src={previewData.image} className='preview-media'draggable={false} />
          <a className={`${id}-noDrag preview-content`} target="_blank" href={previewData.url}>
            <p className='preview-text preview-title'>{previewData.title}</p>
            {/* <p className='preview-text'>{previewData.description}</p> */}
            <p className='preview-text'>{previewData.url}</p>
          </a>
        </>}
      </div>   
    </Rnd>
  )

  
}, figureIsEqual);


export default Preview
