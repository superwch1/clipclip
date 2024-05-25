import axios from 'axios'
import Config from '../../config/Config'

export default class figureApi {

  static async createEditor(figure, plainText, quillDelta){
    await axios.post(`${Config.url}/editor`, {figure: figure, plainText: plainText, quillDelta: quillDelta});
  }

  static async createPreview(figure, url){
    await axios.post(`${Config.url}/preview`, {figure: figure, url: url});
  }

  static async createImage(figure, base64, isDefaultSize){
    try {
      await axios.post(`${Config.url}/image`, {figure: figure, base64: base64, isDefaultSize: isDefaultSize});
    }
    catch (error) { // status code 400 or 500 will throw error
      console.log(error.response);
    }
  }

  static async updatePositionAndSize(figure) {
    try {
      var response = await axios.put(`${Config.url}/positionAndSize`, {figure: figure});
    }
    catch (error) {
      console.log(error);

    }
  }

  static async updateBackgroundColor(figure) {
    try {
      var response = await axios.put(`${Config.url}/backgroundColor`, {figure: figure});
    }
    catch (error) {
      console.log(error);

    }
  }

  static async updateLayer(id, action) {
    try {
      var response = await axios.put(`${Config.url}/layer`, {id: id, action: action});
    }
    catch (error) {
      console.log(error);

    }
  }
}