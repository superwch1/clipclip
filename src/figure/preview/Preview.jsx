import { useEffect, useState, useRef, memo } from 'react'
import './Preview.css'
import '../../config/Config.css'
import Config from '../../config/Config'
import OptionBar from '../optionBar/OptionBar'
import { Rnd } from "react-rnd";
import { onClickOutsideFigure, onSelectFigure, hideOptionBarAndToolBar, onChangeSizeAndPosition, figureIsEqual } from '../utils.mjs'
import axios from 'axios';


const Preview = memo(({x, y, backgroundColor, width, height, id, url, zIndex, isPinned, scale}) => {

  // console.log(`Preview - ${id}`);

  const [sizeAndPosition, setSizeAndPosition] = useState({x: x, y: y, width: width, height: height});
  const [previewData, setPreviewData] = useState(null);
  const [pin, setPin] = useState({enableResizing: !isPinned === true ? Config.objectResizingDirection : false, disableDragging: isPinned});
  const containerRef = useRef(null);
  const barRef = useRef(null);

  // use props to retain original properties of figure
  var props = { x: x, y: y, backgroundColor: backgroundColor, width: width, height: height, id: id, url: url, zIndex: zIndex, isPinned: isPinned }; 

  useEffect(() => {
    // the resize handles need to trigger mousedown and event propagation manually
    // unselect all figures by dispatching event then run onSelectFigure
    addEventForResizeHandle(id);
  }, []);

  useEffect(() => {
    const getInfo = async () => {
      const response = await axios.get(`${Config.url}/preview`, { params: { id: id} });
      setPreviewData(response.data[0]);
    }
    getInfo();
  }, [url])

  useEffect(() => {
    setPin({enableResizing: !isPinned === true ? Config.objectResizingDirection : false, disableDragging: isPinned});
  }, [isPinned]);

  // run when change in value of x, y, width, height
  useEffect(() => {
    setSizeAndPosition({x: x, y: y, width: width, height: height});
  }, [x, y, width, height]);
  
  // make sure the prevewData elements will not be used or it will crash since element cannot be found
  onClickOutsideFigure(containerRef, barRef, id, null, null);  
  

  // reason for using onDrag and onResize instead of start is because even clicking figure will invoke start event
  return (
    <>
      <Rnd id={`${id}-rnd`} enableResizing={pin.enableResizing} disableDragging={pin.disableDragging}
        size={{ width: sizeAndPosition.width, height: sizeAndPosition.height }} position={{ x: sizeAndPosition.x, y: sizeAndPosition.y }} 
        resizeHandleStyles={{bottomRight: Config.resizeHandleStyle, bottomLeft: Config.resizeHandleStyle, topRight: Config.resizeHandleStyle, topLeft: Config.resizeHandleStyle}}
        resizeHandleWrapperClass={`${id}-resizeHandle`} resizeHandleWrapperStyle={{opacity: '0'}}
        
        bounds="#interface" cancel={`.${id}-noDrag`} style={{zIndex: `${zIndex}`, touchAction: "none"}} 
        minWidth={Config.figureMinWidth} minHeight={Config.figureMinHeight} maxWidth={Config.figureMaxWidth} maxHeight={Config.figureMaxHeight}  
        scale={scale} className='figure'
        onMouseDown={(e) => onSelectFigure(id, null, null)}
        onDrag={(e, data) => hideOptionBarAndToolBar(id)}
        onResize={(e, direction, ref, delta, position) => hideOptionBarAndToolBar(id)}
        onResizeStop={async (e, direction, ref, delta, position) => await onChangeSizeAndPosition(sizeAndPosition, { x: position.x, y: position.y, width: parseInt(ref.style.width.replace("px", "")), height: parseInt(ref.style.height.replace("px", "")) }, setSizeAndPosition, id)}
        onDragStop={async (e, data) => await onChangeSizeAndPosition(sizeAndPosition, { x: data.x, y: data.y, width: sizeAndPosition.width, height: sizeAndPosition.height}, setSizeAndPosition, id)}>

        <div id={id} ref={containerRef} className='preview' style={{backgroundColor: `${backgroundColor}`}}
            data-type={"preview"} data-x={x} data-y={y} data-zindex={zIndex} data-width={width} data-height={height} data-url={url} data-backgroundcolor={backgroundColor} data-ispinned={isPinned}> 
          
          {previewData !== null && previewData !== undefined && 
          <>
            <img src={previewData.image} className='preview-media' draggable={false} />
            <a className={`${id}-noDrag preview-content`} target="_blank" href={previewData.url}>
              <p className='preview-text preview-title'>{previewData.title}</p>
              {/* <p className='preview-text'>{previewData.description}</p> */}
              <p className='preview-text'>{previewData.url}</p>
            </a>
          </>}
        </div>   
      </Rnd>
      <div id={`${id}-bar`} ref={barRef} style={{zIndex: '100', position: 'absolute', transform: `translate(${sizeAndPosition.x}px, ${sizeAndPosition.y}px)`, touchAction: "none"}}>
        <OptionBar id={id} backgroundColor={backgroundColor} props={props} />
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


export default Preview
