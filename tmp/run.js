const { fromPath } = require("pdf2pic");
var fs = require('fs');
const { resolve } = require("path");



//https://stackoverflow.com/questions/31214724/gm-conversion-issue-in-node-js
// https://www.npmjs.com/package/pdf-image
const convertPdfToImg = async function(pdf_path, proof_id)
{

    var PDFImage = require("pdf-image").PDFImage;
 
    var pdfImage = new PDFImage(pdf_path, {
      convertOptions: {
        "-resize": "1200x650",
        "-quality": "100"
      }
    });

    return await pdfImage.convertPage(0).then(async function (imagePath) {
      console.log('created path ', imagePath);

      // 0-th page (first page) of the slide.pdf is available as slide-0.png
      let exist = fs.existsSync(imagePath) // => true
      console.log('exist ', exist);
      return imagePath;
    });

} 


let pdf_path = './proof_600624bc9c17970012a023de.pdf'
let proof = '12323'

async function ze(){
  console.log('zECA -------  ');
  let c = await   convertPdfToImg(pdf_path,proof ) 
  console.log("c ", c);
}

ze();

// let a = await   convertPdfToImg(pdf_path,proof ) ;

//  console.log('path ', pa);