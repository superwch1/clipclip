/** 
 * check whether the input (link) on preview or ql-tooltip or editor has been focused
 * @returns true or false
 */
function isInputOrEditorFocused() {
  var focusedElement = document.activeElement;
  if (focusedElement.id === "control-url-input" || focusedElement.classList.contains("ql-editor") || focusedElement.classList.contains("ql-tooltip-input")) {
    return true;
  }
  else {
    return false;
  }
}

export { isInputOrEditorFocused }