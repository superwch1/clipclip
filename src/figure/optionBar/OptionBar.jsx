import './OptionBar.css'
import copyButton from './copy.png'
import deleteButton from './delete.png'
import layerupButton from './layerup.png'
import layerdownButton from './layerdown.png'
import pinnedButton from './pinned.png'
import notpinnedButton from './notpinned.png'
import { debounce } from 'lodash';
import { RgbaColorPicker } from "react-colorful";
import { useEffect, useRef } from 'react'
import FigureApi from '../../services/webServer/figureApi.mjs'
import { ToastContainer, toast } from 'react-toastify';


function OptionBar({id, backgroundColor, props}) {

  // execute the function after it has not been called for 200 milliseconds. 
  const changeColor = debounce(async (newColor) => {
    const figure = { id: id, backgroundColor: newColor }
    await FigureApi.updateBackgroundColor(figure);
  }, 200);

  const wrapperRef = useRef(null);
  onClickOutsideColorPicker(wrapperRef, id);
  const rgba = backgroundColor.replace(/rgba|\(|\)/g, '').split(',');

  return (
    <div id={`${id}-optionbar`} className={`optionbar ${id}-noDrag`}>
      <img src={props.isPinned === true ? pinnedButton : notpinnedButton} className='option' style={{height: "32px", width: "26px"}} alt="pin" onClick={async (event) => await FigureApi.updatePinStatus(id)} />
      <div className='option-backgroundColor' style={{background: `${backgroundColor}`}} 
           onClick={(event) => document.getElementById(`${id}-colorpicker`).classList.remove('colorpicker-hide')}></div>
      <img src={copyButton} className='option' alt="copy" onClick={async (event) => copyFigure(id, props)} />
      <img src={deleteButton} className='option' alt="delete" onClick={async (event) => await FigureApi.deleteFigure(id) } />
      <img src={layerupButton} className='option' alt="layerup" onClick={async (event) => await FigureApi.updateLayer(id, "up")} />
      <img src={layerdownButton} className='option' alt="layerdown" onClick={async (event) => await FigureApi.updateLayer(id, "down")} />
      <img src={layerdownButton} className='option' alt="layerdown" onClick={(event) => toast("hello")} />
      
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

async function copyFigure(id, props){
  var response = await FigureApi.copyFigure(id);
  if (response.status && response.status === 200){
    console.log(response.data);
  }
  else {
    toast(response.data);
  }
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