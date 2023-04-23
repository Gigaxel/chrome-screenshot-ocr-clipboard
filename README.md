# Chrome Screenshot OCR to Clipboard 

This is an extension that allows you to select a portion of a web page i.e. like a portion of an image on a web page, and 
then it'll extract text from there and dispatch it to your clipboard. 

I built this in 2 hours as an exercise to learn more about chrome extensions. If I were to build a more useful version of this 
tool, the obvious decision is to not build it as a browser extension, but as a desktop application. 

The code is horrible, 
as the goal was just to hack something together that's working. I am too lazy to make it clean (don't judge me).

It uses a Tesseract WASM wrapper to do the OCR, and it's loaded with the extension, therefore the speed at which it 
performs is dependent on your machine.

## Demo

![alt text](./demo.gif)

## Usage

You can either use the UI of the extension, or you can trigger the 
extension action execution by using the shortcut `Ctrl+Shift+X` (for mac: `Command+Shift+X`)

## License

This project is licensed under the MIT License - see the LICENSE file for details. Basically, you're free to use
the code as you wish, for commercial and non-commercial use. 




