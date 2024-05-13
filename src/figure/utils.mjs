import { parseInt } from 'lodash';
import { useEffect } from 'react'

// it needs to be similar with unselect object in below onClickOutsideFigure function
function unselectOtherFigures(id){
  var selectedObjects = document.getElementsByClassName('selected-object');
  for (var i = 0; i < selectedObjects.length; i++) {
    
    var figureId = selectedObjects[i].id;
    if(figureId === id) {
      continue;
    }
    
    document.getElementById(`${figureId}`).classList.remove('selected-object');
    const optionBar = document.getElementById(`${figureId}-optionbar`); // when you pass selectedObjects[i].id, it will tells you that the properties of id is undefined
    optionBar.classList.add('hide-optionbar');

    const resizeWrapperClass = document.getElementsByClassName(`${figureId}-resizeHandle`);
    resizeWrapperClass[0].style.opacity = '0';
  }
}

// preview has its own onClickOutsideFigure
function onClickOutsideFigure(ref, id, beforeFunction, afterFunction) {
  useEffect( () => {
    function handleClickOutside (event) {

      if (ref.current && !ref.current.contains(event.target)) {
        if (beforeFunction !== null) {
          beforeFunction(id);
        }

        document.getElementById(`${id}`).classList.remove('selected-object');
        const optionBar = document.getElementById(`${id}-optionbar`);
        optionBar.classList.add('hide-optionbar');

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
  }, [ref]);
}



function onSelectFigure(event, id, beforeFunction, afterFunction) {
  if (beforeFunction !== null) {
    beforeFunction(id);
  }

  document.getElementById(`${id}`).classList.add('selected-object');
  const optionBar = document.getElementById(`${id}-optionbar`);
  optionBar.classList.remove('hide-optionbar');

  const resizeWrapperClass = document.getElementsByClassName(`${id}-resizeHandle`);
  resizeWrapperClass[0].style.opacity = "1";

  if (afterFunction !== null) {
    afterFunction(id);
  }
}



function onChangeSizeAndPosition(originalSizeAndPosition, newSizeAndPosition, setSizeAndPosition, id, sendWebSocketMessage) {
  // since enlarge the object using left corner will result in change in position
  // use position.x and position.y of instead of sizeAndPosition.x  
  if (originalSizeAndPosition.x === newSizeAndPosition.x && originalSizeAndPosition.y === newSizeAndPosition.y 
      && originalSizeAndPosition.width === newSizeAndPosition.width && originalSizeAndPosition.height === newSizeAndPosition.height) {
    return;
  }
  setSizeAndPosition({ x: newSizeAndPosition.x, y: newSizeAndPosition.y, width: newSizeAndPosition.width, height: newSizeAndPosition.height });

  // width and height need to be converted to string from int
  const message = { action: "move", id: id, width: parseInt(newSizeAndPosition.width), height: parseInt(newSizeAndPosition.height), x: newSizeAndPosition.x, y: newSizeAndPosition.y }
  const jsonString = JSON.stringify(message);
  sendWebSocketMessage(jsonString);
}


function figureIsEqual(prevProps, nextProps) {
  var isEqualComponenet = prevProps.id === nextProps.id && prevProps.x === nextProps.x && prevProps.y === nextProps.y &&
    prevProps.backgroundColor === nextProps.backgroundColor && prevProps.width === nextProps.width && prevProps.scale === nextProps.scale &&
    prevProps.height === nextProps.height && prevProps.url === nextProps.url && prevProps.zIndex === nextProps.zIndex;

  if (isEqualComponenet) {
    console.log(`No need to rerender - ${prevProps.id}`);
  }

  return isEqualComponenet;
}

export { onClickOutsideFigure, onSelectFigure, onChangeSizeAndPosition, figureIsEqual, unselectOtherFigures }