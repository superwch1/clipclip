import { useState, useRef, useEffect, memo } from 'react'
import useWebSocket from 'react-use-websocket';
import Config from '../config/Config'
import * as rdd from 'react-device-detect';
import cursorImage from './cursor.png'


function Cursors({scale}) {

  const cursorPosition = useRef({x: 0, y: 0});
  const originalCursorPosition = useRef(null);
  const [state, setState] = useState("");

  const cursorUUID = useRef(self.crypto.randomUUID());
  const cursorsMap = useRef(new Map());
  var cursorsArray = Array.from(cursorsMap.current, ([key, value]) => ({ key, value }))

  // if connection is lost, unsent messages will be discarded
  const { sendMessage } = useWebSocket(`${Config.ws}/cursor?uuid=${cursorUUID.current}`, {
    onMessage: (event) => processMessageFromWebSocket(event, cursorUUID, cursorsMap, setState),
    shouldReconnect: (closeEvent) => true, // it will attempt to reconnect after the connection is closed
    reconnectInterval: () => 5000,
    filter: (message) => false, // prevent rerender every time it receives a message from websocket

    // no need to heartbeat since after reconnection, the cursor position will be updated automatcially in next incoming message
  });

  // only for desktop user to keep sending cusor location
  if (rdd.isDesktop) {
    useEffect(() => {  
        const handleMouseMove = (event) => {
          cursorPosition.current.x = event.clientX;
          cursorPosition.current.y = event.clientY;
        };
        document.onmousemove = handleMouseMove;
    
        let id = setInterval(() => {
          var coordiante = JSON.parse(localStorage.getItem('coordinate'));
    
          var x = (-coordiante.x + cursorPosition.current.x) / scale;
          var y = (-coordiante.y + cursorPosition.current.y) / scale;
    
          if (originalCursorPosition.current === null) {
            originalCursorPosition.current = { x: x, y: y }
          }
    
          // send the updated position of cursor when posotion is different with the previous position
          if (originalCursorPosition.current.x !== cursorPosition.current.x || originalCursorPosition.current.y !== cursorPosition.current.y) {
            originalCursorPosition.current.x = cursorPosition.current.x;
            originalCursorPosition.current.y = cursorPosition.current.y;
            const jsonString = JSON.stringify({uuid: cursorUUID.current, x: x, y: y});
            
            // unsent message will be discarded when the connection is lost
            sendMessage(jsonString, false);
          }
        }, 100)
        return () => clearInterval(id);    

    }, [scale]);
  }

  return (
    <div>
      { 
        cursorsArray.map((item, index) => {
          return <img key={`${item.key}`} id={`${item.key}`} src={cursorImage} style={{transform: `translate(${item.value.x}px, ${item.value.y}px)`, 
            position: 'absolute', left: '0px', top: '0px', width: '20px', height: '20px', zIndex: '100'}}/>
        })
      }
    </div>
  );

// no need to rerender since the scale change has no effect on the cursors location
};


function processMessageFromWebSocket(event, cursorUUID, cursorsMap, setState) {
  var cursorsInfoArray = JSON.parse(event.data).cursors;

  var cursorsCopiedMap = new Map(cursorsMap.current);
  var needRerender = false;

  for (var i = 0; i < cursorsInfoArray.length; i++) {

    // ignore for the position of cursor form this client
    if (cursorsInfoArray[i].key === cursorUUID.current) {
      continue;
    }
   
    // if there is an existing cursor uuid, check location then delete that one in the copied map
    if (cursorsCopiedMap.has(cursorsInfoArray[i].key) === true) {
      
      // if the x and y value is different, it means some user has changed cursor location but no need rerender
      var cursorCoordinate = cursorsMap.current.get(cursorsInfoArray[i].key);
      if (cursorCoordinate.x !== cursorsInfoArray[i].value.x || cursorCoordinate.y !== cursorsInfoArray[i].value.y) {
        cursorsMap.current.set(cursorsInfoArray[i].key, { x: cursorsInfoArray[i].value.x, y: cursorsInfoArray[i].value.y })
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
  // 1. new user join clipclip, 2. some user leave clipclip
  if (needRerender === true) {
    var cursorsNewMap = new Map();
    for (var i = 0; i < cursorsInfoArray.length; i++) {
      if (cursorsInfoArray[i].key === cursorUUID.current) {
        continue;
      }
      cursorsNewMap.set(cursorsInfoArray[i].key, cursorsInfoArray[i].value);
    }
    cursorsMap.current = cursorsNewMap;
    
    // setState need a different value than before to trigger rerender
    setState(self.crypto.randomUUID());
  }
}

export default Cursors