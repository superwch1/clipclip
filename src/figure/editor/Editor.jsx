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
import { onClickOutsideFigure, onSelectFigure, hideOptionBarAndToolBar, onChangeSizeAndPosition, figureHasEqualProps } from '../utils.mjs'


const Editor = memo(({x, y, backgroundColor, width, height, id, url, zIndex, isPinned, scale}) => {

  // easier to pass the properties of figure
  var props = { x: x, y: y, backgroundColor: backgroundColor, width: width, height: height, id: id, url: url, zIndex: zIndex, isPinned: isPinned }; 

  // x, y, width, height, enableResizing, disableDragging are used for react rnd in div
  // (x, y, width, height) and (enableResizing, disableDragging) have their own useEffect for receiving udpates
  const [sizeAndPosition, setSizeAndPosition] = useState({x: x, y: y, width: width, height: height});
  const [pin, setPin] = useState({enableResizing: isPinned === true ? Config.disableResizingDirection : Config.enableResizingDirection, disableDragging: isPinned});

  useEffect(() => {
    setPin({enableResizing: isPinned === true ? Config.disableResizingDirection : Config.enableResizingDirection, disableDragging: isPinned});
  }, [isPinned]);

  useEffect(() => {
    setSizeAndPosition({x: x, y: y, width: width, height: height})
  }, [x, y, width, height]);



  // containerRef and barRef are used to check whether the click are inside the rnd and bar 
  const containerRef = useRef(null);
  const barRef = useRef(null);
  onClickOutsideFigure(containerRef, barRef, id, onClickOutsideFigureBeforeFunction, null);

  

  
  useEffect(() => {
    // the resize handles need to trigger mousedown and event propagation manually
    addEventForResizeHandle(id);    

    // Guide on yjs setup - https://docs.yjs.dev/getting-started/a-collaborative-editor
    // font size and style will not be saved after entering next line - https://github.com/quilljs/quill/issues/2678 
    var quill = new Quill(document.querySelector(`#${id}-quill`), {
      modules: {
        toolbar: `#${id}-toolbar`
      },
      placeholder: 'Write something here...',
      formats: [
        'background', 'bold', 'color', 'font', 'italic', 'link', 'size', 'strike', 
        'script', 'underline', 'header', 'align'], // not allow user to pasteimage or video
      theme: 'bubble',
      // not sure it purpose??
      bounds: '#interface' // prevent the quill option being moved up after double click / select text then (due to the property of css ql-flip)  
    }, [])

    const ydoc = new Y.Doc();
    const ytext = ydoc.getText('quill');
    const binding = new QuillBinding(ytext, quill);
    const provider = new WebsocketProvider(`${Config.ws}`, `${id}`, ydoc);

    // move the DOM location of ql-tooltip as a children of bar
    var barElement = document.getElementById(`${id}-bar`);
    var toolbarElement = document.getElementById(`${id}`).getElementsByClassName(`ql-tooltip`)[0];
    barElement.appendChild(toolbarElement);

    // not allow to edit and select text before having the second click in quill
    const quillEditor = document.getElementById(`${id}`).getElementsByClassName('ql-editor')[0];
    quillEditor.classList.add(`move-cursor`);
    quillEditor.setAttribute('contenteditable', false);
    quillEditor.style.userSelect = 'none';

    // set auto display for quill toolbar
    const quillTooltip = barElement.getElementsByClassName('ql-tooltip')[0];
    quillTooltip.classList.add('ql-display')
    
    return () => {
      // the reference of quill will be removed by it self for garbage collection
      // https://github.com/quilljs/quill/blob/9cf0285caa6514356a7bba9db132ec7229eb254c/docs/guides/upgrading-to-1-0.md
      provider.destroy();
    }
  }, []);

  

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
      <div id={`${id}-bar`} ref={barRef} style={{zIndex: '100', position: 'absolute', transform: `translate(${sizeAndPosition.x}px, ${sizeAndPosition.y}px)`, touchAction: "none", display: "none"}}>
        <OptionBar id={id} backgroundColor={backgroundColor} props={props}/>
      </div>
    </>
  )
}, figureHasEqualProps);


export default Editor



// simulate on clicking outside to unselect other figures then select current figure
// it needs to use document insted of resizeHandle to dispatch event or else it will keep looping for event
function addEventForResizeHandle(id) {
  var resizeHandle = document.getElementsByClassName(`${id}-resizeHandle`)[0];

  resizeHandle.addEventListener('mousedown', (event) => {
    const outerEvent = new Event('mousedown', { bubbles: true });
    document.dispatchEvent(outerEvent);
    onSelectFigure(id, onSelectFigureBeforeFunction, null);
  });
  
  resizeHandle.addEventListener('touchstart', (event) => { 
    const outerEvent = new Event('touchstart', { bubbles: true });
    document.dispatchEvent(outerEvent); 
    onSelectFigure(id, onSelectFigureBeforeFunction, null);
  });
}



function onSelectFigureBeforeFunction(id) {
  const figure = document.getElementById(`${id}`);

  // check whether this is the second click of the figure
  if(figure.classList.contains('selected-object')) {

    const quillEditor = figure.getElementsByClassName('ql-editor')[0];
    quillEditor.classList.add(`${id}-noDrag`); // .${id}-noDrag disable for drag in rnd but outer part can continue to be dragged in rnd
    quillEditor.setAttribute('contenteditable', true);

    // allow the user to select text
    figure.style.userSelect = 'auto';
  }
}



// change cursor status after finish dragging figure
function onMouseUp(id) {
  const figure = document.getElementById(`${id}`);
  const quillEditor = figure.getElementsByClassName('ql-editor')[0];
  quillEditor.classList.remove(`move-cursor`); // change cursor back to pointer, default is move
}



function onClickOutsideFigureBeforeFunction(id) {
  const figure = document.getElementById(`${id}`);
  const quillEditor = figure.getElementsByClassName('ql-editor')[0];
  quillEditor.classList.remove(`${id}-noDrag`); // .${id}-noDrag disable for drag in rnd but outer part can continue to be dragged in rnd
  quillEditor.classList.add(`move-cursor`);
  quillEditor.setAttribute('contenteditable', false);
  
  // unselect the text inside quill and not allow use to select text
  quillEditor.style.userSelect = 'none';
}