// when .ql-tooltip move outside .ql-bubble, some of the properties on default css are not working
// it provides the css propeties for toolbar buttons and options
import './QuillToolbar.css' 

function QuillToolbar ({id}) {

  // when adding new options or button, make sure the format is supported in Editor.jsx
  return (
    <div id={`${id}-toolbar`} className={`${id}-noDrag, toolbar`}>
      <select className="ql-font"></select>
      <select className="ql-size" defaultValue="small">
        <option value="small"></option>
        <option value="large"></option>
        <option value="huge"></option>
      </select>
      
      <button className="ql-bold"></button>
      <button className="ql-italic"></button>
      <button className="ql-underline"></button>
      <button className="ql-strike"></button>
      <select className="ql-align"></select>
      
      <select className="ql-color">
        <option value="#000000">Black</option>
        <option value="#FFFF77">Yellow</option>
        <option value="#77C9FF">Blue</option>
        <option value="#AEFF77">Green</option>
        <option value="#FFAE77">Orange</option>
        <option value="#FF7792">Red</option>
      </select>
      <select className="ql-background"> 
        <option value="rgba(0, 0, 0, 0)">Transparent</option>
        <option value="#FFFF77">Yellow</option>
        <option value="#77C9FF">Blue</option>
        <option value="#AEFF77">Green</option>
        <option value="#FFAE77">Orange</option>
        <option value="#FF7792">Red</option>
      </select>

      <button className="ql-clean"></button>
    </div>
  )
}

export default QuillToolbar;