import ReverseButton from './reverseButton.png'

function Reverse() {
  return (
    <div id="control-reverse" style={{display: "flex", flexDirection: "row", gap: "10px"}}>
      <img style={{width: "60px", height: "60px"}} src={ReverseButton} />
    </div>
  )
}

export default Reverse