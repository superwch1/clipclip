import { useState, useRef, useEffect, memo } from 'react'
import useWebSocket from 'react-use-websocket';
import Config from '../config/Config'
import * as rdd from 'react-device-detect';
import cursorImage from './cursor.png'
import { v4 as uuidv4 } from 'uuid';

/** 
 * show all the cursors within the same boardId
 * @param {*} scale
 * @param {*} boardIdRef
 * @param {*} positionRef
 * @param {*} cursorRef
 * @returns div with image of cursors
 */
function Cursors({scale, boardIdRef, positionRef, cursorRef}) {

  const cursorPositionRef = useRef({x: 0, y: 0});
  const previousCursorPositionRef = useRef(null);

  const translatePosition = useRef({x: 0, y: 0});
  const previousTranslatePosition = useRef(null);

  const [state, setState] = useState("");

  const cursorUUIDRef = useRef(uuidv4());
  const cursorsMapRef = useRef(new Map());
  var cursorsArray = Array.from(cursorsMapRef.current, ([key, value]) => ({ key, value }));

  // if connection is lost, unsent messages will be discarded
  const { sendMessage } = useWebSocket(`${Config.ws}/cursors?uuid=${cursorUUIDRef.current}&isDesktop=${rdd.isDesktop}&boardId=${boardIdRef.current}`, {
    onMessage: (event) => processMessageFromWebSocket(event, cursorUUIDRef, cursorsMapRef, setState),
    shouldReconnect: (closeEvent) => true, // it will attempt to reconnect after the connection is closed
    reconnectInterval: () => 1000,
    filter: (message) => false, // prevent rerender every time it receives a message from websocket

    // no need to heartbeat since after reconnection, the cursor position will be updated automatcially in next incoming message
  });

  // only for desktop user to keep sending cusor location
  if (rdd.isDesktop) {
    useEffect(() => {  
        const handleMouseMove = (event) => {
          cursorPositionRef.current = { x: event.clientX, y: event.clientY };
          cursorRef.current = { x: event.clientX, y: event.clientY };

          localStorage.setItem(`${boardIdRef.current}_props`, JSON.stringify({scale: scale, position: positionRef.current, cursor: cursorRef.current}));
        };
        document.onmousemove = handleMouseMove;
    
        let id = setInterval(() => {
          translatePosition.current = { x: -positionRef.current.x, y: -positionRef.current.y};
                  
          if (previousCursorPositionRef.current === null) {
            previousCursorPositionRef.current = { x: cursorPositionRef.current.x, y: cursorPositionRef.current.y }
          }

          if (previousTranslatePosition.current === null) {
            previousTranslatePosition.current = { x: translatePosition.current.x, y: translatePosition.current.y} 
          }
    
          // send the updated position of cursor when translate or cursor posotion is different with the previous
          if (previousCursorPositionRef.current.x !== cursorPositionRef.current.x || previousCursorPositionRef.current.y !== cursorPositionRef.current.y ||
            previousTranslatePosition.current.x !== translatePosition.current.x || previousTranslatePosition.current.y !== translatePosition.current.y) {

            previousCursorPositionRef.current = { x: cursorPositionRef.current.x, y: cursorPositionRef.current.y };
            previousTranslatePosition.current = { x: translatePosition.current.x, y: translatePosition.current.y };

            // chaning scale will not affect cursor position unless cursor move
            var x = (translatePosition.current.x + cursorPositionRef.current.x) / scale;
            var y = (translatePosition.current.y + cursorPositionRef.current.y) / scale;
                    
            // unsent message will be discarded when the connection is lost
            const jsonString = JSON.stringify({uuid: cursorUUIDRef.current, x: x, y: y, boardId: boardIdRef.current});
            sendMessage(jsonString, false);
          }
        }, 100)
        return () => clearInterval(id);    

    }, [scale]);
  }

  var cursorSize = 20 / scale;

  return (
    <div>
      { 
        cursorsArray.map((item, index) => {
          return <img key={`${item.key}`} id={`${item.key}`} src={cursorImage} className='cursor'
                      style={{transform: `translate(${item.value.x}px, ${item.value.y}px)`, position: 'absolute', left: '0px', top: '0px', width: `${cursorSize}px`, height: `${cursorSize}px`, zIndex: '100'}}/>
        })
      }
    </div>
  );
};


/** 
 * process the message from websocket and update the cursor position
 * @param {*} event
 * @param {*} cursorUUIDRef used to update state value to rerender the cursor div
 * @param {*} cursorsMapRef
 * @param {*} setState set state to a new value
 * @returns null
 */
function processMessageFromWebSocket(event, cursorUUIDRef, cursorsMapRef, setState) {
  var cursorsInfoArray = JSON.parse(event.data).cursors;

  var cursorsCopiedMap = new Map(cursorsMapRef.current);
  var needRerender = false;

  for (var i = 0; i < cursorsInfoArray.length; i++) {

    // ignore for the position of cursor form this client
    if (cursorsInfoArray[i].key === cursorUUIDRef.current) {
      continue;
    }
   
    // if there is an existing cursor uuid, check location then delete that one in the copied map
    if (cursorsCopiedMap.has(cursorsInfoArray[i].key) === true) {
      
      // if the x and y value is different, it means some user has changed cursor location but no need rerender
      var cursorCoordinate = cursorsMapRef.current.get(cursorsInfoArray[i].key);
      if (cursorCoordinate.x !== cursorsInfoArray[i].value.x || cursorCoordinate.y !== cursorsInfoArray[i].value.y) {
        cursorsMapRef.current.set(cursorsInfoArray[i].key, { x: cursorsInfoArray[i].value.x, y: cursorsInfoArray[i].value.y })
        document.getElementById(`${cursorsInfoArray[i].key}`).style.transform = `translate(${cursorsInfoArray[i].value.x}px, ${cursorsInfoArray[i].value.y}px)`;
      }
      cursorsCopiedMap.delete(cursorsInfoArray[i].key);
    }

    // if there are cursor cannot be found in Map, it means that new user has connected to clipclip
    else {
      needRerender = true;
      break;
    }
  }

  // if there are more than 1 items left in Map, it means that old user has disconnected from clipclip
  if (cursorsCopiedMap.size > 0) {
    needRerender = true;
  }

  // needRerender will be true when 
  // 1. new user join clipclip, 2. old user leave clipclip
  if (needRerender === true) {
    var cursorsNewMap = new Map();
    for (var i = 0; i < cursorsInfoArray.length; i++) {
      if (cursorsInfoArray[i].key === cursorUUIDRef.current) {
        continue;
      }
      cursorsNewMap.set(cursorsInfoArray[i].key, cursorsInfoArray[i].value);
    }
    cursorsMapRef.current = cursorsNewMap;
    
    // setState need a different value than before to trigger rerender
    setState(uuidv4());
  }
}


export default Cursors