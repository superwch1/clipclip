export default class Interface {

  static figureMinWidth = 50;
  static figureMinHeight = 50;

  static figureMaxWidth = 1500;
  static figureMaxHeight = 1500;

  static interfaceWidth = 30000;
  static interfaceHeight = 30000;


   static url = `https://clipclip.superwch1.com`; 
  // static url = `http://localhost:1234`;

   static ws = `wss://clipclip.superwch1.com`; 
  // static ws = `wss://localhost:1234`;

  /* not allow to resize on topLeft to prevent it overlaps while changing text color in editor toolbar */
  static objectResizingDirection = {bottomLeft: true, bottomRight: true };
}