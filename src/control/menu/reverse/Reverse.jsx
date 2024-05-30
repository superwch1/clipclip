import EditorButton from './editorButton.png'

function Reverse() {
  return (
    <div id="control-reverse" style={{display: "flex", flexDirection: "row", gap: "10px"}}>
      <div>
          <img style={{width: "60px", height: "60px"}} src={EditorButton} />
      </div>
    </div>
  )
}

export default Reverse