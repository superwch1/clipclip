import { useEffect, useState, useRef, memo } from 'react'
import './Editor.css'
import '../../config/Config.css'
import Config from '../../config/Config'
import Quill from 'quill'
import QuillToolbar from './QuillToolbar'
import OptionBar from '../optionBar/OptionBar'
import * as Y from 'yjs'
import { QuillBinding } from 'y-quill'
import { WebsocketProvider } from 'y-websocket'
import { Rnd } from "react-rnd";
import { onClickOutsideFigure, onSelectFigure, onChangeSizeAndPosition, figureIsEqual, unselectOtherFigures } from '../utils.mjs'


const Editor = memo(({x, y, backgroundColor, width, height, id, url, zIndex, scale, sendWebSocketMessage}) => {

  console.log(`Editor - ${id}`);
 
  const [sizeAndPosition, setSizeAndPosition] = useState({x: x, y: y, width: width, height: height});
  const wrapperRef = useRef(null);
  onClickOutsideFigure(wrapperRef, id, onClickOutsideFigureBeforeFunction, null);

  // only run after first render
  useEffect(() => {

    // reason for using addEventListener instead of onMouseDown in props is because of clicking resize corner won't trigger event
    // click the resizing corner won't have mouse down event that can't unselect other figure
    // it may has set something for the event propagation
    document.getElementById(`${id}-rnd`).addEventListener('mousedown', (event) => {
      unselectOtherFigures(id);
      onSelectFigure(event, id, onSelectFigureBeforeFunction, null)
    });
    document.getElementById(`${id}-rnd`).addEventListener('touchstart', (event) => {
      unselectOtherFigures(id);
      onSelectFigure(event, id, onSelectFigureBeforeFunction, null)
    });

    // Guide on yjs setup - https://docs.yjs.dev/getting-started/a-collaborative-editor
    // Font size and style not save after moving to next line - https://github.com/quilljs/quill/issues/2678 
    var quill = new Quill(document.querySelector(`#${id}-quill`), {
      modules: {
        toolbar: `#${id}-toolbar`
      },
      placeholder: 'Write something here...',
      theme: 'bubble',
      bounds: '#interface' // prevent the ql-flip css appears when double click and text selection cause having not enough space
    }, [])

    setInterval(() => {
      const range = quill.getSelection();
      console.log(`Range:${range?.index} ${range?.length} ${quill.hasFocus()}`);
    }, 1000);



    const ydoc = new Y.Doc();
    const ytext = ydoc.getText('quill');
    const binding = new QuillBinding(ytext, quill);
    const provider = new WebsocketProvider(`${Config.ws}`, `${id}`, ydoc);
    
    return () => {
      // the reference of quill will be removed by it self for garbage collection
      // https://github.com/quilljs/quill/blob/9cf0285caa6514356a7bba9db132ec7229eb254c/docs/guides/upgrading-to-1-0.md
      provider.destroy();
    }
  }, []);

  // run when change in value of x, y, width, height
  useEffect(() => {
    console.log(`Resize Editor - ${id}`);
    setSizeAndPosition({x: x, y: y, width: width, height: height})

    // relocate the resizing handle inside the div for detecting clicks
    // resolving the issue of either allow to select color in quill toolbar or showing the resizing handle if they are not nested together
    var resizeHandle = document.getElementsByClassName(`${id}-resizeHandle`);
    var container = document.getElementById(`${id}`);
    container.prepend(resizeHandle[0]); //appendChild();
  }, [x, y, width, height]);

  // there will be vibrant shaking while resizing on topLeft or bottomLeft corner due to rapid translation and resizing
  return (
    <Rnd id={`${id}-rnd`}
      enableResizing={Config.objectResizingDirection} size={{ width: sizeAndPosition.width, height: sizeAndPosition.height }} position={{ x: sizeAndPosition.x, y: sizeAndPosition.y }} 
      resizeHandleStyles={{bottomRight: Config.resizeHandleStyle, bottomLeft: Config.resizeHandleStyle, topRight: Config.resizeHandleStyle, topLeft: Config.resizeHandleStyle}}
      resizeHandleWrapperClass={`${id}-resizeHandle`} resizeHandleWrapperStyle={{opacity: '0'}}
      bounds="#interface" cancel={`.${id}-noDrag`} style={{zIndex: `${zIndex}`}}
      minWidth={Config.figureMinWidth} minHeight={Config.figureMinHeight} maxWidth={Config.figureMaxWidth} maxHeight={Config.figureMaxHeight} 
      scale={scale} className='figure'
      onDragStop={(e, data) => onChangeSizeAndPosition(sizeAndPosition, { x: data.x, y: data.y, width: sizeAndPosition.width, height: sizeAndPosition.height}, setSizeAndPosition, id, sendWebSocketMessage)} 
      onResizeStop={(e, direction, ref, delta, position) => onChangeSizeAndPosition(sizeAndPosition, { x: position.x, y: position.y, width: ref.style.width.replace("px", ""), height: ref.style.height.replace("px", "") }, setSizeAndPosition, id, sendWebSocketMessage)}>
      
      { /* onMouseUp can't be placed inside rnd because of bug https://github.com/bokuweb/react-rnd/issues/647 */ }
      { /* it needs to use zIndex and position relative to allow QuillToolbar to show higher than the resizing corner*/ }
      <div id={id} ref={wrapperRef} style={{width: "100%", height: "100%", backgroundColor: `${backgroundColor}`, position: 'relative', zIndex: '10'}} onMouseUp={(event) => onMouseUp(id)}
       className='editor' data-type={"editor"} data-x={x} data-y={y} data-zindex={zIndex} data-width={width} data-height={height} data-url={url} data-backgroundcolor={backgroundColor}> {/* editor is needed for check not creating new figure in pasting */}
        <OptionBar id={id} backgroundColor={backgroundColor} sendWebSocketMessage={sendWebSocketMessage} />
        <QuillToolbar id={id} />
        <div id={`${id}-quill`} style={{padding: "12px 15px 12px 15px"}}></div>
      </div>     
    </Rnd>
  )
}, figureIsEqual);


export default Editor


function onSelectFigureBeforeFunction(id) {
  if(document.getElementById(`${id}`).classList.contains('selected-object')) {
    const figure = document.getElementById(`${id}`);
    const quillEditor = figure.getElementsByClassName('ql-editor');

    // only add noDrag class to the ql-editor since the div take up the whole size of Rnd and not able to drag on the border
    quillEditor[0].classList.add(`${id}-noDrag`);
    quillEditor[0].setAttribute('contenteditable', true);
  }

  const quillTooltip = document.getElementById(`${id}`).getElementsByClassName('ql-tooltip');
  quillTooltip[0].classList.add('ql-display')
}

function onMouseUp(id) {
  const figure = document.getElementById(`${id}`);
  const quillEditor = figure.getElementsByClassName('ql-editor');
  quillEditor[0].classList.remove(`drag-started`);
}


function onClickOutsideFigureBeforeFunction(id) {
  const figure = document.getElementById(`${id}`);
  const quillEditor = figure.getElementsByClassName('ql-editor');
  quillEditor[0].classList.remove(`${id}-noDrag`);
  quillEditor[0].classList.add(`drag-started`);
  quillEditor[0].setAttribute('contenteditable', false);

  const quillTooltip = figure.getElementsByClassName('ql-tooltip');
  quillTooltip[0].classList.remove('ql-display')
  
  // remove highlighted text after click outside since selected text is draggable and cause error
  // this cause user can't copy text after right click to show the menu
  /*
  const container = document.querySelector(`#${id}-quill`);
  const quill = Quill.find(container)
  quill.setSelection(null);
  */
}