let dimDiv, screenshotCanvas, originalBodyStyle;

chrome.runtime.onMessage.addListener((action) => {
  switch (action["type"]) {
    case "takeScreenshot":
      return handleTakeScreenshot();
    case "screenshotTaken":
      return handleScreenshotTaken({
        imgData: action.img,
        areaData: action.areaData,
      });
  }
});

function copyTextToClipboard(text) {
  //Create a textbox field where we can insert text to.
  var copyFrom = document.createElement("textarea");

  //Set the text content to be the text you wished to copy.
  copyFrom.textContent = text;

  //Append the textbox field into the body as a child.
  //"execCommand()" only works when there exists selected text, and the text is inside
  //document.body (meaning the text is part of a valid rendered HTML element).
  document.body.appendChild(copyFrom);

  //Select all the text!
  copyFrom.select();

  //Execute command
  document.execCommand("copy");

  //(Optional) De-select the text using blur().
  copyFrom.blur();

  //Remove the textbox field from the document.body, so no other JavaScript nor
  //other elements can get access to this.
  document.body.removeChild(copyFrom);
}

async function copyTextFromImageToClipboard(croppedImage) {
    const { createWorker } = Tesseract;
    const worker = await createWorker();
    await worker.loadLanguage("eng");
    await worker.initialize("eng");
    await worker.setParameters({
      preserve_interword_spaces: "1",
    });
    const data = await worker.recognize(croppedImage);
    await worker.terminate();

    copyTextToClipboard(data.data.text);
    alert("copied to clipboard");
}

function handleScreenshotTaken({ imgData, areaData }) {
  const img = new Image();
  img.onload = function () {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = areaData.width;
    canvas.height = areaData.height;
    ctx.drawImage(
      img,
      areaData.x,
      areaData.y,
      areaData.width,
      areaData.height,
      0,
      0,
      areaData.width,
      areaData.height
    );

    const croppedImage = canvas.toDataURL("image/png");

    copyTextFromImageToClipboard(croppedImage);
  };
  img.src = imgData;
  console.log(imgData);
  document.body.removeChild(screenshotCanvas);
  document.body.style.cssText = originalBodyStyle;
}

function getCursorPosition(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  return { x, y };
}

function handleTakeScreenshot() {
  dimDiv = document.createElement("div");
  dimDiv.style.cssText =
    "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0, 0, 0, 0.5);z-index:9999";

  document.body.insertBefore(dimDiv, document.body.firstChild);
  originalBodyStyle = document.body.style.cssText;
  document.body.style.cssText += "overflow:hidden;";

  const canvas = document.createElement("canvas");
  canvas.setAttribute("id", "screenshot_canvas");
  canvas.style.cssText =
    "cursor:crosshair;position:fixed;top:0;left:0;width:100%;height:100%;z-index:10000;";

  document.body.insertBefore(canvas, dimDiv);

  screenshotCanvas = document.getElementById("screenshot_canvas");
  screenshotCanvas.width = screenshotCanvas.offsetWidth;
  screenshotCanvas.height = screenshotCanvas.offsetHeight;
  const ctx = screenshotCanvas.getContext("2d");

  let isDown = false;

  let lastMouseX = 0;
  let lastMouseY = 0;
  let mouseX = 0;
  let mouseY = 0;

  // Add a mousedown event listener to start the rectangle drawing
  screenshotCanvas.addEventListener("mousedown", (event) => {
    event.preventDefault();
    event.stopPropagation();
    const mousePosition = getCursorPosition(screenshotCanvas, event);
    lastMouseX = mousePosition.x;
    lastMouseY = mousePosition.y;

    isDown = true;
  });

  // Add a mouseup event listener to finish the rectangle drawing
  screenshotCanvas.addEventListener("mouseup", (event) => {
    event.preventDefault();
    event.stopPropagation();

    const width = mouseX - lastMouseX;
    const height = mouseY - lastMouseY;
    const screenshotDimensions = {
      x: lastMouseX,
      y: lastMouseY,
      width,
      height,
    };
    document.body.removeChild(dimDiv);
    chrome.runtime.sendMessage(screenshotDimensions);

    ctx.clearRect(0, 0, screenshotCanvas.width, screenshotCanvas.height);
    isDown = false;
  });

  // Add a mousemove event listener to draw the rectangle as the mouse moves
  screenshotCanvas.addEventListener("mousemove", (event) => {
    event.preventDefault();
    event.stopPropagation();

    const pos = getCursorPosition(screenshotCanvas, event);
    mouseX = pos.x;
    mouseY = pos.y;

    if (!isDown) {
      return;
    }

    // get the current mouse position
    ctx.clearRect(0, 0, screenshotCanvas.width, screenshotCanvas.height);
    ctx.beginPath();

    const width = mouseX - lastMouseX;
    const height = mouseY - lastMouseY;

    ctx.strokeStyle = "white";
    ctx.lineWidth = 1;

    ctx.rect(lastMouseX, lastMouseY, width, height);
    ctx.stroke();
  });
}
