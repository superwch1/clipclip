import Editor from './figure/editor/Editor'
import Image from './figure/image/Image'
import Preview from './figure/preview/Preview'
import { useState, useRef } from 'react'
import useWebSocket from 'react-use-websocket';
import axios from 'axios';
import Config from './config/Config'


function Canvas({scale}) {

  const [figures, setFigures] = useState([]);
  const isFirstConnection = useRef(true);

  // if connection is lost, messages are queued up and sent after reconnected
  const { sendMessage } = useWebSocket(`${Config.ws}/figure`, {
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
    
    // get all the figures properties from web server if it is not connectedfor  longer than timeout period
    onOpen: async (event) => {
      if (isFirstConnection.current === true) {
        isFirstConnection.current = false;
        var figureList = await getFigureFromServer();
        setFigures(figureList);
      }
      else {
        var figureList = await getFigureFromServer();
        setFigures(figureList);
      }
    }
  });

  return (
    <>
      {figures.map((item, index) => {
        if (item.type === "editor") {
          return ( <Editor key={item.id} id={item.id} x={item.x} y={item.y} width={item.width} height={item.height} url={item.url}
            zIndex={item.zIndex} backgroundColor={item.backgroundColor} sendWebSocketMessage={sendMessage} scale={scale} />)
        }
        else if (item.type === "preview") {
          return ( <Preview key={item.id} id={item.id} x={item.x} y={item.y} width={item.width} height={item.height} url={item.url} 
            zIndex={item.zIndex} backgroundColor={item.backgroundColor} sendWebSocketMessage={sendMessage} scale={scale} />)
        }
        else if (item.type === "image") {
          return (<Image key={item.id} id={item.id} x={item.x} y={item.y} width={item.width} height={item.height} url={item.url}
            zIndex={item.zIndex} backgroundColor={item.backgroundColor} sendWebSocketMessage={sendMessage} scale={scale} />)
        }
      })}
    </>
  );
}


async function getFigureFromServer() {
  const response = await axios.get(`${Config.url}/figures`);

  const figureList = response.data.map((figure, index) => ({
    id: figure._id, type: figure.type, x: figure.x, y: figure.y, width: figure.width,
    height: figure.height, backgroundColor: figure.backgroundColor, url: figure.url, zIndex: figure.zIndex
  }));
  return figureList;
}


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

  else if (message.action === 'create' || message.action === 'copy') {
    createFigure(message.figure, figures, setFigures);
  }

  else if (message.action === 'delete') {
    deleteFigure(message.figure, figures, setFigures)
  }
}


function deleteFigure(deletedFigure, figures, setFigures) {
  const updatedFigures = figures.filter((fig) => fig.id !== deletedFigure._id);
  setFigures(updatedFigures);
}


function createFigure(receivedFigure, figures, setFigures) {
  const newFigure = { id: receivedFigure._id, x: receivedFigure.x, y: receivedFigure.y, width: receivedFigure.width, height: receivedFigure.height, 
    type: receivedFigure.type, backgroundColor: receivedFigure.backgroundColor, url: receivedFigure.url, zIndex: receivedFigure.zIndex };
    setFigures([...figures, newFigure]);
}


function updateFigure(receivedFigure, figures, setFigures) {
  const updatedFigures = figures.map((fig) => {
    if (fig.id === receivedFigure._id) {
      return { id: receivedFigure._id, x: receivedFigure.x, y: receivedFigure.y, width: receivedFigure.width, height: receivedFigure.height, 
        type: receivedFigure.type, backgroundColor: receivedFigure.backgroundColor, url: receivedFigure.url, zIndex: receivedFigure.zIndex 
      };
    }
    return fig;
  });
    
  setFigures(updatedFigures);
}



export default Canvas