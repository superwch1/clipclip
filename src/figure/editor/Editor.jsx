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
import { onClickOutsideFigure, onSelectFigure, onChangeSizeAndPosition, figureIsEqual } from '../utils.mjs'


const Editor = memo(({x, y, backgroundColor, width, height, id, url, zIndex, scale, sendWebSocketMessage}) => {
  console.log(`Editor - ${id}`);

  // only run after first render
  useEffect(() => {
    console.log(`Reload quill: ${id}`);

    // Guide on yjs setup - https://docs.yjs.dev/getting-started/a-collaborative-editor
    // Font size and style not save after moving to next line - https://github.com/quilljs/quill/issues/2678 
    var quill = new Quill(document.querySelector(`#${id}-quill`), {
      modules: {
        toolbar: `#${id}-toolbar`
      },
      placeholder: 'Write something here...',
      theme: 'bubble'
    }, [])

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
  }, [x, y, width, height]);

  
  const [sizeAndPosition, setSizeAndPosition] = useState({x: x, y: y, width: width, height: height});
  const wrapperRef = useRef(null);
  onClickOutsideFigure(wrapperRef, id, onClickOutsideFigureBeforeFunction, null);

  return (
    <Rnd enableResizing={Config.objectResizingDirection} size={{ width: sizeAndPosition.width, height: sizeAndPosition.height }} position={{ x: sizeAndPosition.x, y: sizeAndPosition.y }} 
          bounds="#interface" cancel={`.${id}-noDrag`} style={{backgroundColor: `${backgroundColor}`, zIndex: `${zIndex}`}}
          minWidth={Config.figureMinWidth} minHeight={Config.figureMinHeight} maxWidth={Config.figureMaxWidth} maxHeight={Config.figureMaxHeight} 
          onMouseDown={(event) => onSelectFigure(event, id, onSelectFigureBeforeFunction, null)} scale={scale} className='figure'
          onDragStop={(e, data) => onChangeSizeAndPosition(sizeAndPosition, { x: data.x, y: data.y, width: sizeAndPosition.width, height: sizeAndPosition.height}, setSizeAndPosition, id, sendWebSocketMessage)} 
          onResizeStop={(e, direction, ref, delta, position) => onChangeSizeAndPosition(sizeAndPosition, { x: position.x, y: position.y, width: ref.style.width.replace("px", ""), height: ref.style.height.replace("px", "") }, setSizeAndPosition, id, sendWebSocketMessage)}>
      
      { /* onMouseUp can't be placed inside rnd because of bug https://github.com/bokuweb/react-rnd/issues/647 */ }
      <div id={id} ref={wrapperRef} style={{width: "100%", height: "100%"}} onMouseUp={(event) => onMouseUp(id)}
       className='editor'> {/* editor is needed for check not creating new figure in pasting */}
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
  const container = document.querySelector(`#${id}-quill`);
  const quill = Quill.find(container)
  quill.setSelection(null);
}