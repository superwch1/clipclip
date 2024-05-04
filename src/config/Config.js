export default class Interface {

  // figure configuration
  static figureMinWidth = 50;
  static figureMinHeight = 50;

  static figureMaxWidth = 1500;
  static figureMaxHeight = 1500;


  // interface configuration
  static interfaceWidth = 5000;
  static interfaceHeight = 5000;

  static interfaceMinZoomScaleForMobile = 0.3;
  static interfaceMinZoomScaleForDesktop = 0.5;
  static interfaceMaxZoomScale = 2;


  // static url = `https://clipclip.superwch1.com`; 
  static url = `http://localhost:1234`;

  // static ws = `wss://clipclip.superwch1.com`; 
  static ws = `ws://localhost:1234`;

  /* not allow to resize on topLeft to prevent it overlaps while changing text color in editor toolbar */
  static objectResizingDirection = {bottomLeft: true, bottomRight: true };
}