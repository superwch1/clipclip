export default class Config {

  // figure configuration
  static figureMinWidth = 50;
  static figureMinHeight = 50;

  static figureMaxWidth = 1500;
  static figureMaxHeight = 1500;


  // interface configuration
  static interfaceWidth = 5000;
  static interfaceHeight = 5000;

  static interfaceMinZoomScaleForMobile = 0.3;
  static interfaceMinZoomScaleForDesktop = (window.screen.width > 2000 || window.screen.height > 2000) ? 1 : 0.5;
  static interfaceMaxZoomScale = 2;


  static url = `https://clipclip.superwch1.com`; 
  //static url = `http://192.168.50.111/`;
  // static url = `http://localhost:1234`;

  static ws = `wss://clipclip.superwch1.com`; 
  //static ws = `ws://192.168.50.111`; 
  // static ws = `ws://localhost:1234`;

  /* not allow to resize on topLeft to prevent it overlaps while changing text color in editor toolbar */
  static enableResizingDirection = {bottomLeft: true, bottomRight: true, topLeft: true, topRight: true };
  static disableResizingDirection = {bottomLeft: false, bottomRight: false, topLeft: false, topRight: false };
  static resizeHandleStyle = {width: '20px', height: '20px', borderRadius: '20px', margin: '3px', backgroundColor: 'white', border: '2px solid black'};
}