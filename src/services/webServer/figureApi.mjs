import axios from 'axios'
import Config from '../../config/Config'

export default class figureApi {

  static async createEditor(figure, plainText, quillDelta){
    try {
      var response = await axios.post(`${Config.url}/editor`, {figure: figure, plainText: plainText, quillDelta: quillDelta});
      return response;
    }
    catch (axiosError) { // status code 400 or 500 will throw error
      if(axiosError.code === "ERR_NETWORK"){ // no connection to the network
        return { data: "No connection to the server" };
      }
      return axiosError.response;
    }
  }

  static async createPreview(figure, url){  
    try {
      var response = await axios.post(`${Config.url}/preview`, {figure: figure, url: url});
      return response;
    }
    catch (axiosError) { // status code 400 or 500 will throw error
      if(axiosError.code === "ERR_NETWORK"){ // no connection to the network
        return { data: "No connection to the server" };
      }
      return axiosError.response;
    }
  }

  static async createImage(figure, base64, isDefaultSize){
    try {
      var response = await axios.post(`${Config.url}/image`, {figure: figure, base64: base64, isDefaultSize: isDefaultSize});
      return response;
    }
    catch (axiosError) { // status code 400 or 500 will throw error
      if(axiosError.code === "ERR_NETWORK"){ // no connection to the network
        return { data: "No connection to the server" };
      }
      return axiosError.response;
    }
  }

  static async updatePositionAndSize(figure) {
    try {
      var response = await axios.put(`${Config.url}/positionAndSize`, {figure: figure});
      return response;
    }
    catch (axiosError) { // status code 400 or 500 will throw error
      if(axiosError.code === "ERR_NETWORK"){ // no connection to the network
        return { data: "No connection to the server" };
      }
      return axiosError.response;
    }
  }

  static async updateBackgroundColor(figure) {
    try {
      var response = await axios.put(`${Config.url}/backgroundColor`, {figure: figure});
      return response;
    }
    catch (axiosError) { // status code 400 or 500 will throw error
      if(axiosError.code === "ERR_NETWORK"){ // no connection to the network
        return { data: "No connection to the server" };
      }
      return axiosError.response;
    }
  }

  static async updateLayer(id, action) {
    try {
      var response = await axios.put(`${Config.url}/layer`, {id: id, action: action});
      return response;
    }
    catch (axiosError) { // status code 400 or 500 will throw error
      if(axiosError.code === "ERR_NETWORK"){ // no connection to the network
        return { data: "No connection to the server" };
      }
      return axiosError.response;
    }
  }

  static async updatePinStatus(id) {
    try {
      var response = await axios.put(`${Config.url}/pin`, {id: id});
      return response;
    }
    catch (axiosError) { // status code 400 or 500 will throw error
      if(axiosError.code === "ERR_NETWORK"){ // no connection to the network
        return { data: "No connection to the server" };
      }
      return axiosError.response;
    }
  }

  static async copyFigure(id) {
    try {
      // it needs to use copyFigure since figure is used for creating new figure
      var response = await axios.post(`${Config.url}/copyFigure`, {id: id});
      return response;
    }
    catch (axiosError) { // status code 400 or 500 will throw error
      if(axiosError.code === "ERR_NETWORK"){ // no connection to the network
        return { data: "No connection to the server" };
      }
      return axiosError.response;
    }
  }

  static async deleteFigure(id) {
    try {
      var response = await axios.delete(`${Config.url}/figure`, {data: { id: id }});
      return response;
    }
    catch (axiosError) { // status code 400 or 500 will throw error
      if(axiosError.code === "ERR_NETWORK"){ // no connection to the network
        return { data: "No connection to the server" };
      }
      return axiosError.response;
    }
  }
}
