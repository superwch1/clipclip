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
import { onClickOutsideFigure, onSelectFigure, hideOptionBarAndToolBar, onChangeSizeAndPosition, figureIsEqual } from '../utils.mjs'


const Editor = memo(({x, y, backgroundColor, width, height, id, url, zIndex, isPinned, scale}) => {

  // console.log(`Editor - ${id}`);
 
  const [sizeAndPosition, setSizeAndPosition] = useState({x: x, y: y, width: width, height: height});
  const [pin, setPin] = useState({enableResizing: !isPinned === true ? Config.objectResizingDirection : false, disableDragging: isPinned});
  const containerRef = useRef(null);
  const barRef = useRef(null);
  onClickOutsideFigure(containerRef, barRef, id, onClickOutsideFigureBeforeFunction, null);

  // use props to retain original properties of figure
  var props = { x: x, y: y, backgroundColor: backgroundColor, width: width, height: height, id: id, url: url, zIndex: zIndex, isPinned: isPinned }; 

  // only run after first render
  useEffect(() => {
    // the resize handles need to trigger mousedown and event propagation manually
    // unselect all figures by dispatching event then run onSelectFigure
    addEventForResizeHandle(id);    

    // Guide on yjs setup - https://docs.yjs.dev/getting-started/a-collaborative-editor
    // Font size and style not save after moving to next line - https://github.com/quilljs/quill/issues/2678 
    var quill = new Quill(document.querySelector(`#${id}-quill`), {
      modules: {
        toolbar: `#${id}-toolbar`
      },
      placeholder: 'Write something here...',
      formats: [
        'background', 'bold', 'color', 'font', 'italic', 'link', 'size', 'strike', 
        'script', 'underline', 'header', 'align'], // not allow user to pasteimage or video
      theme: 'bubble',
      bounds: '#interface' // prevent the ql-flip css appears when double click and text selection cause having not enough space
    }, [])

    const ydoc = new Y.Doc();
    const ytext = ydoc.getText('quill');
    const binding = new QuillBinding(ytext, quill);
    const provider = new WebsocketProvider(`${Config.ws}`, `${id}`, ydoc);

    var barElement = document.getElementById(`${id}-bar`);
    var optionBarElement = document.getElementById(`${id}-optionbar`);
    var toolbarElement = document.getElementById(`${id}`).getElementsByClassName(`ql-tooltip`)[0];
    barElement.insertBefore(toolbarElement, optionBarElement);
    
    return () => {
      // the reference of quill will be removed by it self for garbage collection
      // https://github.com/quilljs/quill/blob/9cf0285caa6514356a7bba9db132ec7229eb254c/docs/guides/upgrading-to-1-0.md
      provider.destroy();
    }
  }, []);

  useEffect(() => {
    setPin({enableResizing: !isPinned === true ? Config.objectResizingDirection : false, disableDragging: isPinned});
  }, [isPinned]);

  // run when change in value of x, y, width, height
  useEffect(() => {
    setSizeAndPosition({x: x, y: y, width: width, height: height})
  }, [x, y, width, height]);

  // there will be vibrant shaking while resizing on topLeft or bottomLeft corner due to rapid translation and resizing
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
        onMouseDown={(e) => onSelectFigure(id, onSelectFigureBeforeFunction, null)}
        onDrag={(e, data) => hideOptionBarAndToolBar(id)}
        onResize={(e, direction, ref, delta, position) => hideOptionBarAndToolBar(id)}
        onDragStop={async (e, data) => await onChangeSizeAndPosition(sizeAndPosition, { x: data.x, y: data.y, width: sizeAndPosition.width, height: sizeAndPosition.height}, setSizeAndPosition, id)} 
        onResizeStop={async (e, direction, ref, delta, position) => await onChangeSizeAndPosition(sizeAndPosition, { x: position.x, y: position.y, width: parseInt(ref.style.width.replace("px", "")), height: parseInt(ref.style.height.replace("px", "")) }, setSizeAndPosition, id)}>
        
        { /* onMouseUp can't be placed inside rnd because of bug https://github.com/bokuweb/react-rnd/issues/647 */ }
        <div id={id} ref={containerRef} style={{width: "100%", height: "100%", backgroundColor: `${backgroundColor}`}} onMouseUp={(event) => onMouseUp(id)}
          className='editor' data-type={"editor"} data-x={x} data-y={y} data-zindex={zIndex} data-width={width} data-height={height} data-url={url} data-backgroundcolor={backgroundColor} data-ispinned={isPinned}>
          <div id={`${id}-quill`} style={{padding: "12px 15px 12px 15px"}}></div>
          <QuillToolbar id={id} />
        </div>     
      </Rnd>
      <div id={`${id}-bar`} ref={barRef} style={{zIndex: '100', position: 'absolute', transform: `translate(${sizeAndPosition.x}px, ${sizeAndPosition.y}px)`, touchAction: "none"}}>
        <OptionBar id={id} backgroundColor={backgroundColor} props={props}/>
      </div>
    </>
  )
}, figureIsEqual);


export default Editor

function addEventForResizeHandle(id) {
  var resizeHandle = document.getElementsByClassName(`${id}-resizeHandle`)[0];

  resizeHandle.addEventListener('mousedown', (event) => {
    const outerEvent = new Event('mousedown', { bubbles: true });
    document.dispatchEvent(outerEvent); // it needs to use document here and nother parent of resize handle, or else it will become shakey in resizing
    onSelectFigure(id, onSelectFigureBeforeFunction, null); // it need to be last to select again after having identified as clicking outside
  });
  
  resizeHandle.addEventListener('touchstart', (event) => { 
    const outerEvent = new Event('touchstart', { bubbles: true });
    document.dispatchEvent(outerEvent);
    onSelectFigure(id, onSelectFigureBeforeFunction, null);
  });
}


function onSelectFigureBeforeFunction(id) {
  const figure = document.getElementById(`${id}`);
  if(figure.classList.contains('selected-object')) {

    const quillEditor = figure.getElementsByClassName('ql-editor')[0];

    // only add noDrag class to the ql-editor since the div take up the whole size of Rnd and not able to drag on the border
    quillEditor.classList.add(`${id}-noDrag`);
    quillEditor.setAttribute('contenteditable', true);
  }

  const bar = document.getElementById(`${id}-bar`);
  const quillTooltip = bar.getElementsByClassName('ql-tooltip')[0];
  quillTooltip.classList.add('ql-display')
}


function onMouseUp(id) {
  const figure = document.getElementById(`${id}`);
  const quillEditor = figure.getElementsByClassName('ql-editor')[0];
  quillEditor.classList.remove(`drag-started`);
}


function onClickOutsideFigureBeforeFunction(id) {
  const figure = document.getElementById(`${id}`);
  const quillEditor = figure.getElementsByClassName('ql-editor')[0];
  quillEditor.classList.remove(`${id}-noDrag`);
  quillEditor.classList.add(`drag-started`);
  quillEditor.setAttribute('contenteditable', false);

  const bar = document.getElementById(`${id}-bar`);
  const quillTooltip = bar.getElementsByClassName('ql-tooltip')[0];
  quillTooltip.classList.remove('ql-display');
  
  // remove highlighted text after click outside since selected text is draggable and cause error
  // this cause user can't copy text after right click to show the menu
  /*
  const container = document.getElementById(`${id}-quill`);
  const quill = Quill.find(container)
  quill.setSelection(null); // it set selection to null for all quill editor instead of just the specific editor
  */

  //figure.style.userSelect = 'none';
}