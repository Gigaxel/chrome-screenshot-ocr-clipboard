chrome.commands.onCommand.addListener((command, tab) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { type: "takeScreenshot" });
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  chrome.tabs.captureVisibleTab(
    sender.tab.windowId,
    { format: "png" },
    (image) => {
      chrome.tabs.sendMessage(sender.tab.id, {
        type: "screenshotTaken",
        img: image,
        areaData: message,
      });
    }
  );
});
