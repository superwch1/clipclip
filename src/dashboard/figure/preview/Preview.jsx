import { useEffect, useState, useRef, memo } from 'react'
import './Preview.css'
import '../../../config/Config.css'
import Config from '../../../config/Config'
import OptionBar from '../optionBar/OptionBar'
import { Rnd } from "react-rnd"
import { onClickOutsideFigure, onSelectFigure, hideOptionBarAndToolBar, onChangeSizeAndPosition, figureHasEqualProps } from '../utils.mjs'
import figureApi from '../../../api/figureApi.mjs'

/** 
 * show the link preview, option bar
 * @returns div with preview and option bar
 */
const Preview = memo(({x, y, backgroundColor, width, height, id, url, zIndex, isPinned, scale, reverseActionsRef, boardId}) => {

  // x, y, width, height, enableResizing, disableDragging are used for react rnd in div
  // (x, y, width, height) and (enableResizing, disableDragging) have their own useEffect for receiving udpates
  const [sizeAndPosition, setSizeAndPosition] = useState({x: x, y: y, width: width, height: height});
  const [pin, setPin] = useState({enableResizing: isPinned === true ? Config.disableResizingDirection : Config.enableResizingDirection, disableDragging: isPinned});

  useEffect(() => {
    setPin({enableResizing: isPinned === true ? Config.disableResizingDirection : Config.enableResizingDirection, disableDragging: isPinned});
  }, [isPinned]);

  // run when change in value of x, y, width, height
  useEffect(() => {
    setSizeAndPosition({x: x, y: y, width: width, height: height});
  }, [x, y, width, height]);
  

  // containerRef and barRef are used to check whether the click are inside the rnd and bar 
  const containerRef = useRef(null);
  const barRef = useRef(null);
  const imageRef = useRef(null);
  onClickOutsideFigure(containerRef, barRef, id, null, null);  


  useEffect(() => {
    // keep getting the preview data every second if there are no response from server
    function getInfo() {
      figureApi.readPreview(id)
        .then(response => {
          if (response.status === 200) {
            setPreviewData(response.data);
          } else {
            setTimeout(getInfo, 1000);
          }
        })
        .catch(error => {
          setTimeout(getInfo, 1000); 
        }
      );
    }

    // the resize handles need to trigger mousedown and event propagation manually
    addEventForResizeHandle(id);
    getInfo();

  }, []);


  // get the previewData after rendering the initial figure, value is null for default
  const [previewData, setPreviewData] = useState(null);
 
  
  // Rnd cannot be used to pass the ref
  // reason for using onDrag and onResize instead of onDragStart and onResizeStart is because even clicking figure will invoke start event
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
        onResizeStop={async (e, direction, ref, delta, position) => await onChangeSizeAndPosition(sizeAndPosition, { x: position.x, y: position.y, width: parseInt(ref.style.width.replace("px", "")), height: parseInt(ref.style.height.replace("px", "")) }, setSizeAndPosition, id, reverseActionsRef)}
        onDragStop={async (e, data) => await onChangeSizeAndPosition(sizeAndPosition, { x: data.x, y: data.y, width: sizeAndPosition.width, height: sizeAndPosition.height}, setSizeAndPosition, id, reverseActionsRef)}>

        <div id={id} ref={containerRef} className='preview' style={{backgroundColor: `${backgroundColor}`}}
            data-id={id} data-type={"preview"} data-x={x} data-y={y} data-zindex={zIndex} data-width={width} data-height={height} data-url={url} 
            data-backgroundcolor={backgroundColor} data-ispinned={isPinned} data-boardid={boardId}> 
          
          {previewData !== null && previewData !== undefined && 
          <>
            <img src={previewData.image} className='preview-media' draggable={false} ref={imageRef} onError={(event) => imageOnError(event, imageRef)}/>
            <a className={`${id}-noDrag preview-content`} target="_blank" href={previewData.url}>
              <p className='preview-text preview-title'>{previewData.title}</p>
              {/* <p className='preview-text'>{previewData.description}</p> */}
              <p className='preview-text'>{previewData.url}</p>
            </a>
          </>}
        </div>   
      </Rnd>

      <div id={`${id}-bar`} className={`${id}-noDrag`} ref={barRef} style={{zIndex: '100', position: 'absolute', transform: `translate(${sizeAndPosition.x}px, ${sizeAndPosition.y}px)`, touchAction: "none", display: "none"}}>
        <OptionBar id={id} backgroundColor={backgroundColor} isPinned={isPinned} reverseActionsRef={reverseActionsRef} />
      </div>
    </>
  )
}, figureHasEqualProps);


/** 
 * attempt to reload the picture when there are no response from server
 * @param {*} event
 * @param {*} ref
 * @returns null
 */
async function imageOnError(event, ref) {
  setTimeout(() => ref.current.src = ref.current.src, 1000);
}


/** 
 * resizeHandle unable to trigger an click event that it need to simulate it manually  
 * create a click by dispatching an event to unselect other figure and select current figure
 * @param {*} id 
 * @returns null
 */
function addEventForResizeHandle(id) {
  var resizeHandle = document.getElementsByClassName(`${id}-resizeHandle`)[0];

  // use document.dispatchEvent() instead of resizeHandle.dispatchEvent() or else it will keep looping for event
  resizeHandle.addEventListener('mousedown', (event) => {
    const outerEvent = new Event('mousedown', { bubbles: true });
    document.dispatchEvent(outerEvent); 
    onSelectFigure(id, null, null);
  });
  
  resizeHandle.addEventListener('touchstart', (event) => { 
    const outerEvent = new Event('touchstart', { bubbles: true });
    document.dispatchEvent(outerEvent);
    onSelectFigure(id, null, null);
  });
}


export default Preview
