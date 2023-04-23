function takeScreenshot() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { type: "takeScreenshot" });
  });
  window.close();
}

document
  .getElementById("screenshot_button")
  .addEventListener("click", (e) => {
    takeScreenshot();
  });
