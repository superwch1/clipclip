import Quill from 'quill'

function isUrlFocusedOrEditorFocused() {
  var controlUrlInputElement = document.getElementById('control-url-input');
  var isUrlFocused = document.activeElement === controlUrlInputElement;

  var selectedObjects = document.getElementsByClassName('selected-object');
  var isEditorFocused = false;

  for (let i = 0; i < selectedObjects.length; i++) {
    if (selectedObjects[i].classList.contains('editor')) {

      const container = document.querySelector(`#${selectedObjects[i].id}-quill`);
      const quill = Quill.find(container);
      isEditorFocused = quill.hasFocus();
    }
  }
  
  // only paste items when user is not pasting url and no editor is current selected
  if (isUrlFocused === false && isEditorFocused === false) {
    return false;
  }
  return true;
}

export { isUrlFocusedOrEditorFocused }