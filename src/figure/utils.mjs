import { useEffect } from 'react'
import FigureApi from '../services/webServer/figureApi.mjs'
import { ToastContainer, toast } from 'react-toastify';


function onClickOutsideFigure(containerRef, barRef, id, beforeFunction, afterFunction) {
  useEffect(() => {
    function handleClickOutside (event) {

      // all returns true when the click is not inside either in container or bar div
      if (containerRef.current && barRef.current && !containerRef.current.contains(event.target) && !barRef.current.contains(event.target)) {

        if (beforeFunction !== null) {
          beforeFunction(id);
        }
          
        document.getElementById(`${id}`).classList.remove('selected-object');
        const bar = document.getElementById(`${id}-bar`);
        bar.style.display = "none";
  
        var resizeWrapperClass = document.getElementsByClassName(`${id}-resizeHandle`);
        resizeWrapperClass[0].style.opacity = '0';
  
        if (afterFunction !== null) {
          afterFunction(id);
        }
      }  
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    };
  }, [containerRef, barRef]);
}



function onSelectFigure(id, beforeFunction, afterFunction) {
  if (beforeFunction !== null) {
    beforeFunction(id);
  }

  document.getElementById(`${id}`).classList.add('selected-object');
  const bar = document.getElementById(`${id}-bar`);
  bar.style.display = "initial";

  const resizeWrapperClass = document.getElementsByClassName(`${id}-resizeHandle`);
  resizeWrapperClass[0].style.opacity = "1";

  if (afterFunction !== null) {
    afterFunction(id);
  }
}



function hideOptionBarAndToolBar(id) {
  const bar = document.getElementById(`${id}-bar`);
  bar.style.display = "none";
}



function showOptionBarAndToolBar(id) {
  const bar = document.getElementById(`${id}-bar`);
  bar.style.display = "initial";
}



async function onChangeSizeAndPosition(originalSizeAndPosition, newSizeAndPosition, setSizeAndPosition, id, reverseActions) {
  // there will be 0.001 difference for between the position (x, y) value for original and new position
  if (Math.abs(originalSizeAndPosition.x - newSizeAndPosition.x) < 0.01 && Math.abs(originalSizeAndPosition.y - newSizeAndPosition.y) < 0.01
    && originalSizeAndPosition.width === newSizeAndPosition.width && originalSizeAndPosition.height === newSizeAndPosition.height) {
    return;
  }

  showOptionBarAndToolBar(id); //option will be hided during dragging, it needs to show again after finished

  // update the position and size for bar and figure
  var barElement = document.getElementById(`${id}-bar`);
  barElement.style.transform = `translate(${newSizeAndPosition.x}px, ${newSizeAndPosition.y}px)`;
  setSizeAndPosition({ x: newSizeAndPosition.x, y: newSizeAndPosition.y, width: newSizeAndPosition.width, height: newSizeAndPosition.height });

  newSizeAndPosition.x = newSizeAndPosition.x.toFixed(2);
  newSizeAndPosition.y = newSizeAndPosition.y.toFixed(2);  
  var response = await FigureApi.updatePositionAndSize(id, newSizeAndPosition.x, newSizeAndPosition.y, newSizeAndPosition.width, newSizeAndPosition.height);

  // return to original position and size if there is connection error
  if (response.status !== 200) {
    var optionBarElement = document.getElementById(`${id}-bar`);
    optionBarElement.style.transform = `translate(${originalSizeAndPosition.x}px, ${originalSizeAndPosition.y}px)`;

    setSizeAndPosition({ x: originalSizeAndPosition.x, y: originalSizeAndPosition.y, width: originalSizeAndPosition.width, height: originalSizeAndPosition.height });
    toast(response.data);
  }

  else {
    if (reverseActions.current.length === 20) {
      reverseActions.current.shift();
    }

    reverseActions.current.push({action: "update-positionAndSize", id: id, x: originalSizeAndPosition.x, y: originalSizeAndPosition.y, width: originalSizeAndPosition.width, height: originalSizeAndPosition.height});
  }
}



function figureHasEqualProps(prevProps, nextProps) {
  // check whether it needs to rerender because of having different props
  var isEqualComponenet = prevProps.id === nextProps.id && prevProps.x === nextProps.x && prevProps.y === nextProps.y &&
    prevProps.backgroundColor === nextProps.backgroundColor && prevProps.width === nextProps.width && prevProps.scale === nextProps.scale &&
    prevProps.height === nextProps.height && prevProps.url === nextProps.url && prevProps.zIndex === nextProps.zIndex && prevProps.isPinned === nextProps.isPinned;

  return isEqualComponenet;
}




export { onClickOutsideFigure, onSelectFigure, onChangeSizeAndPosition, figureHasEqualProps, hideOptionBarAndToolBar }