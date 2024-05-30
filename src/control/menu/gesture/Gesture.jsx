import EditorButton from './editorButton.png'

function Gesture() {
  return (
    <div id="control-gesture" style={{display: "flex", flexDirection: "row", gap: "10px"}}>
      <div>
          <img style={{width: "60px", height: "60px"}} src={EditorButton} />
      </div>
      <div>
          <img style={{width: "60px", height: "60px"}} src={EditorButton} />
      </div>
    </div>
  )
}

export default Gesture