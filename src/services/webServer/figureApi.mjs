import axios from 'axios'
import Config from '../../config/Config'

export default class figureApi {

  static async readFigures(boardId) {
    try {
      var response = await axios.get(`${Config.url}/figures`, {params: {boardId: boardId}});
      return response;
    }
    catch (axiosError) {
      // no connect to internet or server closed will be have "ERR_NETWORK" and no response
      if(axiosError.code === "ERR_NETWORK"){ 
        return { status: 404, data: "No connection" };
      }
      else if (axiosError.status === 400) {
        return { status: 400, data: axiosError.response.data };
      }
      return { status: 500, data: "Server Error" };
    }
  }



  static async createEditor(boardId, x, y, width, height, type, backgroundColor, url, zIndex, isPinned, plainText, quillDelta) {
    try {
      var response = await axios.post(`${Config.url}/editor`, 
      { 
        figure: { boardId: boardId, x: x, y: y, width: width, height: height, type: type, backgroundColor: backgroundColor, url: url, zIndex: zIndex, isPinned: isPinned }, 
        plainText: plainText, 
        quillDelta: quillDelta 
      });
      return response;
    }
    catch (axiosError) {
      // no connect to internet or server closed will be have "ERR_NETWORK" and no response
      if(axiosError.code === "ERR_NETWORK"){ 
        return { status: 404, data: "No connection" };
      }
      else if (axiosError.status === 400) {
        return { status: 400, data: axiosError.response.data };
      }
      return { status: 500, data: "Server Error" };
    }
  }



  static async createEditorWithId(id, boardId, x, y, width, height, type, backgroundColor, url, zIndex, isPinned, plainText, quillDelta) {
    try {
      var response = await axios.post(`${Config.url}/editorWithId`, 
      { 
        figure: { id: id, boardId: boardId, x: x, y: y, width: width, height: height, type: type, backgroundColor: backgroundColor, url: url, zIndex: zIndex, isPinned: isPinned }, 
        plainText: plainText, 
        quillDelta: quillDelta 
      });
      return response;
    }
    catch (axiosError) {
      // no connect to internet or server closed will be have "ERR_NETWORK" and no response
      if(axiosError.code === "ERR_NETWORK"){ 
        return { status: 404, data: "No connection" };
      }
      else if (axiosError.status === 400) {
        return { status: 400, data: axiosError.response.data };
      }
      return { status: 500, data: "Server Error" };
    }
  }



  static async createPreview(boardId, x, y, width, height, type, backgroundColor, url, zIndex, isPinned){  
    try {
      var response = await axios.post(`${Config.url}/preview`, {figure: {boardId: boardId, x: x, y: y, width: width, height: height, type: type, backgroundColor: backgroundColor, url: url, zIndex: zIndex, isPinned: isPinned }, url: url});
      return response;
    }
    catch (axiosError) {
      // no connect to internet or server closed will be have "ERR_NETWORK" and no response
      if(axiosError.code === "ERR_NETWORK"){ 
        return { status: 404, data: "No connection" };
      }
      else if (axiosError.status === 400) {
        return { status: 400, data: axiosError.response.data };
      }
      return { status: 500, data: "Server Error" };
    }
  }



  static async createPreviewWithId(id, boardId, x, y, width, height, type, backgroundColor, url, zIndex, isPinned){  
    try {
      var response = await axios.post(`${Config.url}/previewWithId`, {figure: {id: id, boardId: boardId, x: x, y: y, width: width, height: height, type: type, backgroundColor: backgroundColor, url: url, zIndex: zIndex, isPinned: isPinned }, url: url});
      return response;
    }
    catch (axiosError) {
      // no connect to internet or server closed will be have "ERR_NETWORK" and no response
      if(axiosError.code === "ERR_NETWORK"){ 
        return { status: 404, data: "No connection" };
      }
      else if (axiosError.status === 400) {
        return { status: 400, data: axiosError.response.data };
      }
      return { status: 500, data: "Server Error" };
    }
  }



  static async createImage(boardId, x, y, width, height, type, backgroundColor, url, zIndex, isPinned, base64, isDefaultSize){
    try {
      var response = await axios.post(`${Config.url}/image`, {figure: {boardId: boardId, x: x, y: y, width: width, height: height, type: type, backgroundColor: backgroundColor, url: url, zIndex: zIndex, isPinned: isPinned }, base64: base64, isDefaultSize: isDefaultSize});
      return response;
    }
    catch (axiosError) {
      // no connect to internet or server closed will be have "ERR_NETWORK" and no response
      if(axiosError.code === "ERR_NETWORK"){ 
        return { status: 404, data: "No connection" };
      }
      else if (axiosError.status === 400) {
        return { status: 400, data: axiosError.response.data };
      }
      return { status: 500, data: "Server Error" };
    }
  }



  static async createImageWithId(id, boardId, x, y, width, height, type, backgroundColor, url, zIndex, isPinned, base64, isDefaultSize){
    try {
      var response = await axios.post(`${Config.url}/imageWithId`, {figure: {id: id, boardId: boardId, x: x, y: y, width: width, height: height, type: type, backgroundColor: backgroundColor, url: url, zIndex: zIndex, isPinned: isPinned }, base64: base64, isDefaultSize: isDefaultSize});
      return response;
    }
    catch (axiosError) {
      // no connect to internet or server closed will be have "ERR_NETWORK" and no response
      if(axiosError.code === "ERR_NETWORK"){ 
        return { status: 404, data: "No connection" };
      }
      else if (axiosError.status === 400) {
        return { status: 400, data: axiosError.response.data };
      }
      return { status: 500, data: "Server Error" };
    }
  }



  static async updatePositionAndSize(id, x, y, width, height) {
    try {
      var response = await axios.put(`${Config.url}/positionAndSize`, {figure: {id: id, x: x, y: y, width: width, height: height}});
      return response;
    }
    catch (axiosError) {
      // no connect to internet or server closed will be have "ERR_NETWORK" and no response
      if(axiosError.code === "ERR_NETWORK"){ 
        return { status: 404, data: "No connection" };
      }
      else if (axiosError.status === 400) {
        return { status: 400, data: axiosError.response.data };
      }
      return { status: 500, data: "Server Error" };
    }
  }



  static async updateBackgroundColor(id, backgroundColor) {
    try {
      var response = await axios.put(`${Config.url}/backgroundColor`, {figure: { id: id, backgroundColor: backgroundColor }});
      return response;
    }
    catch (axiosError) {
      // no connect to internet or server closed will be have "ERR_NETWORK" and no response
      if(axiosError.code === "ERR_NETWORK"){ 
        return { status: 404, data: "No connection" };
      }
      else if (axiosError.status === 400) {
        return { status: 400, data: axiosError.response.data };
      }
      return { status: 500, data: "Server Error" };
    }
  }



  static async updateLayer(id, action) {
    try {
      var response = await axios.put(`${Config.url}/layer`, {id: id, action: action});
      return response;
    }
    catch (axiosError) {
      // no connect to internet or server closed will be have "ERR_NETWORK" and no response
      if(axiosError.code === "ERR_NETWORK"){ 
        return { status: 404, data: "No connection" };
      }
      else if (axiosError.status === 400) {
        return { status: 400, data: axiosError.response.data };
      }
      return { status: 500, data: "Server Error" };
    }
  }



  static async updatePinStatus(id, isPinned) {
    try {
      var response = await axios.put(`${Config.url}/pin`, {id: id, isPinned: isPinned});
      return response;
    }
    catch (axiosError) {
      // no connect to internet or server closed will be have "ERR_NETWORK" and no response
      if(axiosError.code === "ERR_NETWORK"){ 
        return { status: 404, data: "No connection" };
      }
      else if (axiosError.status === 400) {
        return { status: 400, data: axiosError.response.data };
      }
      return { status: 500, data: "Server Error" };
    }
  }


  
  static async copyFigure(id) {
    try {
      // it needs to use copyFigure since figure is used for creating new figure
      var response = await axios.post(`${Config.url}/copyFigure`, {id: id});
      return response;
    }
    catch (axiosError) {
      // no connect to internet or server closed will be have "ERR_NETWORK" and no response
      if(axiosError.code === "ERR_NETWORK"){ 
        return { status: 404, data: "No connection" };
      }
      else if (axiosError.status === 400) {
        return { status: 400, data: axiosError.response.data };
      }
      return { status: 500, data: "Server Error" };
    }
  }



  static async deleteFigure(id) {
    try {
      var response = await axios.delete(`${Config.url}/figure`, {data: { id: id }});
      return response;
    }
    catch (axiosError) {
      // no connect to internet or server closed will be have "ERR_NETWORK" and no response
      if(axiosError.code === "ERR_NETWORK"){ 
        return { status: 404, data: "No connection" };
      }
      else if (axiosError.status === 400) {
        return { status: 400, data: axiosError.response.data };
      }
      return { status: 500, data: "Server Error" };
    }
  }
}
