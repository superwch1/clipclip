import axios from 'axios'
import Config from '../config/Config'

export default class figureApi {

  /** 
   * get the properties of figures within same boardId
   * @returns 200 - Okay
   * @returns 202 - invalid data in body or parameters (since iisnode provide default value for 400)
   * @returns 404 - no connection to server or Internet
   * @returns 500 - server error
  */
  static async readFigures(boardId) {
    try {
      var response = await axios.get(`${Config.url}/figures`, {params: {boardId: boardId}});
      return response;
    }
    catch (axiosError) {
      // no connect to internet or server closed will be have "ERR_NETWORK" and no response
      if(axiosError.code === "ERR_NETWORK"){ 
        return { status: 404, data: "no connection" };
      }
      return { status: 500, data: "server error" };
    }
  }


  /** 
   * create an editor
   * @returns 200 - Okay
   * @returns 202 - invalid data in body or parameters (since iisnode provide default value for 400)
   * @returns 404 - no connection to server or Internet
   * @returns 500 - server error
  */
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
        return { status: 404, data: "no connection" };
      }
      return { status: 500, data: "server error" };
    }
  }


  /** 
   * create an editor with specific id (used in reverse action only)
   * @returns 200 - Okay
   * @returns 202 - invalid data in body or parameters (since iisnode provide default value for 400)
   * @returns 404 - no connection to server or Internet
   * @returns 500 - server error
  */
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
        return { status: 404, data: "no connection" };
      }
      return { status: 500, data: "server error" };
    }
  }


  /** 
   * create a preview
   * @returns 200 - Okay
   * @returns 202 - invalid data in body or parameters (since iisnode provide default value for 400)
   * @returns 404 - no connection to server or Internet
   * @returns 500 - server error
  */
  static async createPreview(boardId, x, y, width, height, type, backgroundColor, url, zIndex, isPinned){  
    try {
      var response = await axios.post(`${Config.url}/preview`, {figure: {boardId: boardId, x: x, y: y, width: width, height: height, type: type, backgroundColor: backgroundColor, url: url, zIndex: zIndex, isPinned: isPinned }});
      return response;
    }
    catch (axiosError) {
      // no connect to internet or server closed will be have "ERR_NETWORK" and no response
      if(axiosError.code === "ERR_NETWORK"){ 
        return { status: 404, data: "no connection" };
      }
      return { status: 500, data: "server error" };
    }
  }


  /** 
   * create a preview with specific id (used in reverse action only)
   * @returns 200 - Okay
   * @returns 202 - invalid data in body or parameters (since iisnode provide default value for 400)
   * @returns 404 - no connection to server or Internet
   * @returns 500 - server error
  */
  static async createPreviewWithId(id, boardId, x, y, width, height, type, backgroundColor, url, zIndex, isPinned){  
    try {
      var response = await axios.post(`${Config.url}/previewWithId`, {figure: {id: id, boardId: boardId, x: x, y: y, width: width, height: height, type: type, backgroundColor: backgroundColor, url: url, zIndex: zIndex, isPinned: isPinned }});
      return response;
    }
    catch (axiosError) {
      // no connect to internet or server closed will be have "ERR_NETWORK" and no response
      if(axiosError.code === "ERR_NETWORK"){ 
        return { status: 404, data: "no connection" };
      }
      return { status: 500, data: "server error" };
    }
  }


  /** 
   * create an image
   * @returns 200 - Okay
   * @returns 202 - invalid data in body or parameters (since iisnode provide default value for 400)
   * @returns 404 - no connection to server or Internet
   * @returns 500 - server error
  */
  static async createImage(boardId, x, y, width, height, type, backgroundColor, url, zIndex, isPinned, base64, isDefaultSize){
    try {
      var response = await axios.post(`${Config.url}/image`, {figure: {boardId: boardId, x: x, y: y, width: width, height: height, type: type, backgroundColor: backgroundColor, url: url, zIndex: zIndex, isPinned: isPinned }, base64: base64, isDefaultSize: isDefaultSize});
      return response;
    }
    catch (axiosError) {
      // no connect to internet or server closed will be have "ERR_NETWORK" and no response
      if(axiosError.code === "ERR_NETWORK"){ 
        return { status: 404, data: "no connection" };
      }
      return { status: 500, data: "server error" };
    }
  }


  /** 
   * create an image with specific id (used in reverse action only)
   * @returns 200 - Okay
   * @returns 202 - invalid data in body or parameters (since iisnode provide default value for 400)
   * @returns 404 - no connection to server or Internet
   * @returns 500 - server error
  */
  static async createImageWithId(id, boardId, x, y, width, height, type, backgroundColor, url, zIndex, isPinned, base64, isDefaultSize){
    try {
      var response = await axios.post(`${Config.url}/imageWithId`, {figure: {id: id, boardId: boardId, x: x, y: y, width: width, height: height, type: type, backgroundColor: backgroundColor, url: url, zIndex: zIndex, isPinned: isPinned }, base64: base64, isDefaultSize: isDefaultSize});
      return response;
    }
    catch (axiosError) {
      // no connect to internet or server closed will be have "ERR_NETWORK" and no response
      if(axiosError.code === "ERR_NETWORK"){ 
        return { status: 404, data: "no connection" };
      }
      return { status: 500, data: "server error" };
    }
  }


  /** 
   * update the position and size of the figure
   * @returns 200 - Okay
   * @returns 202 - invalid data in body or parameters (since iisnode provide default value for 400)
   * @returns 404 - no connection to server or Internet
   * @returns 500 - server error
  */
  static async updatePositionAndSize(id, x, y, width, height) {
    try {
      var response = await axios.put(`${Config.url}/positionAndSize`, {figure: {id: id, x: x, y: y, width: width, height: height}});
      return response;
    }
    catch (axiosError) {
      // no connect to internet or server closed will be have "ERR_NETWORK" and no response
      if(axiosError.code === "ERR_NETWORK"){ 
        return { status: 404, data: "no connection" };
      }
      return { status: 500, data: "server error" };
    }
  }


  /** 
   * update the background color of the figure
   * @returns 200 - Okay
   * @returns 202 - invalid data in body or parameters (since iisnode provide default value for 400)
   * @returns 404 - no connection to server or Internet
   * @returns 500 - server error
  */
  static async updateBackgroundColor(id, backgroundColor) {
    try {
      var response = await axios.put(`${Config.url}/backgroundColor`, {figure: { id: id, backgroundColor: backgroundColor }});
      return response;
    }
    catch (axiosError) {
      // no connect to internet or server closed will be have "ERR_NETWORK" and no response
      if(axiosError.code === "ERR_NETWORK"){ 
        return { status: 404, data: "no connection" };
      }
      return { status: 500, data: "server error" };
    }
  }


  /** 
   * update the layer of the figure
   * @returns 200 - Okay
   * @returns 202 - invalid data in body or parameters (since iisnode provide default value for 400)
   * @returns 404 - no connection to server or Internet
   * @returns 500 - server error
  */
  static async updateLayer(id, action) {
    try {
      var response = await axios.put(`${Config.url}/layer`, {id: id, action: action});
      return response;
    }
    catch (axiosError) {
      // no connect to internet or server closed will be have "ERR_NETWORK" and no response
      if(axiosError.code === "ERR_NETWORK"){ 
        return { status: 404, data: "no connection" };
      }
      return { status: 500, data: "server error" };
    }
  }


  /** 
   * update the pin status of the figure
   * @returns 200 - Okay
   * @returns 202 - invalid data in body or parameters (since iisnode provide default value for 400)
   * @returns 404 - no connection to server or Internet
   * @returns 500 - server error
  */
  static async updatePinStatus(id, isPinned) {
    try {
      var response = await axios.put(`${Config.url}/pin`, {id: id, isPinned: isPinned});
      return response;
    }
    catch (axiosError) {
      // no connect to internet or server closed will be have "ERR_NETWORK" and no response
      if(axiosError.code === "ERR_NETWORK"){ 
        return { status: 404, data: "no connection" };
      } 
      return { status: 500, data: "server error" };
    }
  }


  /** 
   * delete the figure
   * @returns 200 - Okay
   * @returns 202 - invalid data in body or parameters (since iisnode provide default value for 400)
   * @returns 404 - no connection to server or Internet
   * @returns 500 - server error
  */
  static async deleteFigure(id) {
    try {
      var response = await axios.delete(`${Config.url}/figure`, {data: { id: id }});
      return response;
    }
    catch (axiosError) {
      // no connect to internet or server closed will be have "ERR_NETWORK" and no response
      if(axiosError.code === "ERR_NETWORK"){ 
        return { status: 404, data: "no connection" };
      }
      return { status: 500, data: "server error" };
    }
  }
}
