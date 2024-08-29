import Editor from './editor/Editor'
import Image from './image/Image'
import Preview from './preview/Preview'
import { useState, useRef, useEffect } from 'react'
import useWebSocket from 'react-use-websocket'
import Config from '../config/Config'
import figureApi from '../server/figureApi.mjs'

/** 
 * render the figures within the same boardId and update figure properties continuously
 * @param {*} scale
 * @param {*} reverseActions   
 * @param {*} boardId
 * @returns null
 */
function Canvas({scale, reverseActions, boardId}) {

  const [figures, setFigures] = useState([]);
  const isFirstConnection = useRef(true);

  // if connection is lost, messages are queued up and sent after reconnected
  const { sendMessage } = useWebSocket(`${Config.ws}/figures?boardId=${boardId}`, {
    onMessage: (event) => processMessageFromWebSocket(event, figures, setFigures),
    shouldReconnect: (closeEvent) => true, // it will attempt to reconnect after the connection is closed
    reconnectInterval: () => 5000,
    filter: (message) => false, // prevent rerender every time it receives a message from websocket

    heartbeat: {
      message: 'ping',
      returnMessage: 'pong',
      timeout: 10000, // 10 seconds, if no response is received, the connection will be closed
      interval: 5000, // every 5 seconds, a ping message will be sent
    }, 
    
    // get all the figures properties from web server if it is not connected for longer than timeout period
    onOpen: async (event) => {
      if (isFirstConnection.current === true) {
        isFirstConnection.current = false;
        var figureList = await getFigureFromServer(boardId);
        setFigures(figureList);
      }
      else {
        var figureList = await getFigureFromServer(boardId);
        setFigures(figureList);
      }
    }
  });
 
  return (
    <>
      {figures.map((item, index) => {
        if (item.type === "editor") {
          return ( <Editor key={item.id} scale={scale} id={item.id} x={item.x} y={item.y} width={item.width} height={item.height} url={item.url} 
            zIndex={item.zIndex} backgroundColor={item.backgroundColor} isPinned={item.isPinned} reverseActions={reverseActions} boardId={boardId} />)
        }
        else if (item.type === "preview") {
          return ( <Preview key={item.id} scale={scale} id={item.id} x={item.x} y={item.y} width={item.width} height={item.height} url={item.url} 
            zIndex={item.zIndex} backgroundColor={item.backgroundColor} isPinned={item.isPinned} reverseActions={reverseActions} boardId={boardId} />)
        }
        else if (item.type === "image") {
          return (<Image key={item.id} scale={scale} id={item.id} x={item.x} y={item.y} width={item.width} height={item.height} url={item.url}
            zIndex={item.zIndex} backgroundColor={item.backgroundColor} isPinned={item.isPinned} reverseActions={reverseActions} boardId={boardId} />)
        }
      })}
    </>
  );
}


/** 
 * get the figures within the boardId and map the response into an array 
 * @param {*} boardId
 * @returns figureList or []
 */
async function getFigureFromServer(boardId) {
  const response = await figureApi.readFigures(boardId);

  if (response.status === 200) {
    const figureList = response.data.map((figure, index) => ({
      id: figure._id, type: figure.type, x: figure.x, y: figure.y, width: figure.width, height: figure.height, backgroundColor: figure.backgroundColor, 
      url: figure.url, zIndex: figure.zIndex, isPinned: figure.isPinned
    }));
    return figureList;
  }
  else {
    return [];
  }
}


/** 
 * process the message from websocket then create / update /delete figure in canvas
 * @param {*} event
 * @param {*} figures
 * @param {*} setFigures
 * @returns null
 */
function processMessageFromWebSocket(event, figures, setFigures) {
  if (!event.data) {
    return;
  }

  const message = JSON.parse(event.data);
  if (message.action === 'update') {     
    var matchedFigure = figures.find((x) => x.id === message.figure._id);
    
    if(matchedFigure) {
      updateFigure(message.figure, figures, setFigures)
    }
    else {
      createFigure(message.figure, figures, setFigures)
    }
  }

  else if (message.action === 'create') {
    createFigure(message.figure, figures, setFigures);
  }

  else if (message.action === 'delete') {
    deleteFigure(message.figure, figures, setFigures)
  }
}


/** 
 * delete the figure in figures then rerender
 * @param {*} deletedFigure
 * @param {*} figures
 * @param {*} setFigures
 * @returns null
 */
function deleteFigure(deletedFigure, figures, setFigures) {
  const updatedFigures = figures.filter((fig) => fig.id !== deletedFigure._id);
  setFigures(updatedFigures);
}


/** 
 * put the figure in figures then rerender
 * @param {*} receivedFigure
 * @param {*} figures
 * @param {*} setFigures
 * @returns null
 */
function createFigure(receivedFigure, figures, setFigures) {
  const newFigure = { id: receivedFigure._id, x: receivedFigure.x, y: receivedFigure.y, width: receivedFigure.width, height: receivedFigure.height, 
    type: receivedFigure.type, backgroundColor: receivedFigure.backgroundColor, url: receivedFigure.url, zIndex: receivedFigure.zIndex, isPinned: receivedFigure.isPinned };
    setFigures([...figures, newFigure]);
}


/** 
 * update the figure properties in figures then rerender
 * @param {*} receivedFigure
 * @param {*} figures
 * @param {*} setFigures
 * @returns null
 */
function updateFigure(receivedFigure, figures, setFigures) {
  const updatedFigures = figures.map((fig) => {
    if (fig.id === receivedFigure._id) {
      return { id: receivedFigure._id, x: receivedFigure.x, y: receivedFigure.y, width: receivedFigure.width, height: receivedFigure.height, 
        type: receivedFigure.type, backgroundColor: receivedFigure.backgroundColor, url: receivedFigure.url, zIndex: receivedFigure.zIndex, isPinned: receivedFigure.isPinned 
      };
    }
    return fig;
  });
    
  setFigures(updatedFigures);
}


export default Canvas