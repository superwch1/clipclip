import './OptionBar.css'
import copyButton from './copy.png'
import deleteButton from './delete.png'
import layerupButton from './layerup.png'
import layerdownButton from './layerdown.png'
import { debounce } from 'lodash';
import { RgbaColorPicker } from "react-colorful";
import { useEffect, useRef } from 'react'


function OptionBar({id, backgroundColor, sendWebSocketMessage}) {

  // execute the function after it has not been called for 100 milliseconds. 
  const changeColor = debounce((newColor) => {
    const message = { action: "backgroundcolor", id: id, backgroundColor: newColor }
    const jsonString = JSON.stringify(message);
    sendWebSocketMessage(jsonString);
  }, 200);

  const wrapperRef = useRef(null);
  onClickOutsideColorPicker(wrapperRef, id);
  const rgba = backgroundColor.replace(/rgba|\(|\)/g, '').split(',');


  return (
    <div id={`${id}-optionbar`} className={`optionbar hide-optionbar ${id}-noDrag`} >
      <div className='option-backgroundColor' style={{background: `${backgroundColor}`}} 
           onClick={(event) => document.getElementById(`${id}-colorpicker`).classList.remove('colorpicker-hide')}></div>
      <img src={copyButton} className='option' alt="copy" onClick={(event) => sendWebSocketMessage(JSON.stringify({ action: "copy", id: id }))} />
      <img src={deleteButton} className='option' alt="delete" onClick={(event) => sendWebSocketMessage(JSON.stringify({ action: "delete", id: id }))} />
      <img src={layerupButton} className='option' alt="layerup" onClick={(event) => sendWebSocketMessage(JSON.stringify({ action: "layerup", id: id }))} />
      <img src={layerdownButton} className='option' alt="layerdown" onClick={(event) => sendWebSocketMessage(JSON.stringify({ action: "layerdown", id: id }))} />
      
      <div ref={wrapperRef} id={`${id}-colorpicker`} className={'colorpicker-hide'} style={{position: "absolute", left: "7px", top: "60px", width: "200px", height: "200px"}}>
        <RgbaColorPicker color={{r: parseInt(rgba[0]), g: parseInt(rgba[1]), b: parseInt(rgba[2]), a: parseFloat(rgba[3])}}
          // reason for not using useState in figure is because once it rerender after setState, the changeColor function will be keep invoking
          onChange={(event) => {
            changeColor(`rgba(${event.r},${event.g},${event.b},${event.a})`)
            document.getElementById(id).style.backgroundColor = `rgba(${event.r},${event.g},${event.b},${event.a})`;
          }} />
      </div>
    </div>
  )
}


function onClickOutsideColorPicker(ref, id) {
  useEffect( () => {
    function handleClickOutside (event) {
      if (ref.current && !ref.current.contains(event.target)) {
        document.getElementById(`${id}-colorpicker`).classList.add('colorpicker-hide');
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);
}

export default OptionBar;