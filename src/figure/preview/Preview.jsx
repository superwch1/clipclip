import { useEffect, useState, useRef, memo } from 'react'
import './Preview.css'
import '../../config/Config.css'
import Config from '../../config/Config'
import OptionBar from '../optionBar/OptionBar'
import { Rnd } from "react-rnd";
import { ReactTinyLink } from 'react-tiny-link'
import { onClickOutsideFigure, onSelectFigure, onChangeSizeAndPosition, figureIsEqual } from '../utils.mjs'
import axios from 'axios';


const Preview = memo(({x, y, backgroundColor, width, height, id, url, zIndex, scale, sendWebSocketMessage}) => {

  // since when the component move or resize, it will rerender once, then the websocket rerender twice
  console.log(`Preview - ${id}`);

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
    setSizeAndPosition({x: x, y: y, width: width, height: height})
  }, [x, y, width, height]);

  const [sizeAndPosition, setSizeAndPosition] = useState({x: x, y: y, width: width, height: height});
  const [previewData, setPreviewData] = useState();
  const wrapperRef = useRef(null);
  
  // check for click outside from the figure
  // it updates the reference of wrapperRef after loading the previewData
  useEffect( () => {
    function handleClickOutside (event) { 
      if (previewData !== null && wrapperRef.current) {

        if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
          document.getElementById(`${id}`).classList.remove('selected-object');
          const optionBar = document.getElementById(`${id}-optionbar`);
          optionBar.classList.add('hide-optionbar');
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef, previewData]);
  

  if (previewData == null) {
    return (<div></div>)
  }
  else {
    return (
      <Rnd enableResizing={Config.objectResizingDirection} size={{ width: sizeAndPosition.width, height: sizeAndPosition.height }} position={{ x: sizeAndPosition.x, y: sizeAndPosition.y }} 
        bounds="#interface" cancel={`.${id}-noDrag`} style={{zIndex: `${zIndex}`}} 
        minWidth={Config.figureMinWidth} minHeight={Config.figureMinHeight} maxWidth={Config.figureMaxWidth} maxHeight={Config.figureMaxHeight}  
        onMouseDown={(event) => onSelectFigure(event, id, null, null)} draggable={false} scale={scale} className='figure'
        onResizeStop={(e, direction, ref, delta, position) => onChangeSizeAndPosition(sizeAndPosition, { x: position.x, y: position.y, width: ref.style.width.replace("px", ""), height: ref.style.height.replace("px", "") }, setSizeAndPosition, id, sendWebSocketMessage)}
        onDragStop={(e, data) => onChangeSizeAndPosition(sizeAndPosition, { x: data.x, y: data.y, width: sizeAndPosition.width, height: sizeAndPosition.height}, setSizeAndPosition, id, sendWebSocketMessage)}>
  
        <div id={id} ref={wrapperRef} className='preview-container preview' style={{backgroundColor: `${backgroundColor}`}}>
          <OptionBar id={id} backgroundColor={backgroundColor} sendWebSocketMessage={sendWebSocketMessage} />
          <img src={previewData.image} className='preview-media'draggable={false} />
          <a className={`${id}-noDrag preview-content`} target="_blank" href={previewData.url}>
            <p className='preview-text preview-title'>{previewData.title}</p>
            <p className='preview-text'>{previewData.description}</p>
            <p className='preview-text'>{previewData.url}</p>
          </a>
        </div>   
      </Rnd>
    )
  }

  
}, figureIsEqual);


export default Preview
