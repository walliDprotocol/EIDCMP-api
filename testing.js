const fs = require('fs'); 
const multer = require('multer');
const express = require('express');
const readXlsxFile = require('read-excel-file/node');
const app = express();
 
global.__basedir = __dirname;

//https://grokonez.com/node-js/nodejs-express-restapi-upload-import-excel-file-to-mysql-using-read-excel-file-multer
 
// -> Multer Upload Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
     cb(null, __basedir + '/uploads/')
  },
  filename: (req, file, cb) => {
     cb(null, file.fieldname + "-" + Date.now() + "-" + file.originalname)
  }
});
 
const upload = multer({storage: storage});
 
// -> Express Upload RestAPIs
app.post('/api/uploadfile', upload.single("uploadfile"), (req, res) =>{
  // console.log('File info ', req.file)
  importExcelData2MySQL(__basedir + '/uploads/' + req.file.filename, (err, data) => 
  {
    res.json({
      data : data
    });
  });

});
 
// -> Import Excel Data to MySQL database
function importExcelData2MySQL(filePath, next)
{
  // File path.
  readXlsxFile(filePath).then((rows) => {
    // `rows` is an array of rows
    // each row being an array of cells.   
    // console.log('file row' , rows);

   
    /**
    [ [ 'Id', 'Name', 'Address', 'Age' ],
    [ 1, 'Jack Smith', 'Massachusetts', 23 ],
    [ 2, 'Adam Johnson', 'New York', 27 ],
    [ 3, 'Katherin Carter', 'Washington DC', 26 ],
    [ 4, 'Jack London', 'Nevada', 33 ],
    [ 5, 'Jason Bourne', 'California', 36 ] ] 
    */
   
    // Remove Header ROW
    //  rows.shift();
     console.log(rows);
     let finalArray = []
     let header = [];
     let i = 0;
     rows.forEach(elem => {
        if( i ==0 ){
          header = elem;
        }
        else{
          let valIdx =0;
          let o = {}
          elem.forEach(val => {
            o[header[valIdx++]] = val
          })
          finalArray.push(o)
        }
        i++;
     });
     console.log('Final Result ' ,finalArray );
     next(null, finalArray);
   
    // Create a connection to the database
    // const connection = mysql.createConnection({
    //   host: 'localhost',
    //   user: 'root',
    //   password: '12345',
    //   database: 'testdb'
    // });
   
    // Open the MySQL connection
    // connection.connect((error) => {
    //   if (error) {
    //     console.error(error);
    //   } else {
    //     let query = 'INSERT INTO customer (id, address, name, age) VALUES ?';
    //     connection.query(query, [rows], (error, response) => {
    //     console.log(error || response);
 
    //     /**
    //     OkPacket {
    //     fieldCount: 0,
    //     affectedRows: 5,
    //     insertId: 0,
    //     serverStatus: 2,
    //     warningCount: 0,
    //     message: '&amp;Records: 5  Duplicates: 0  Warnings: 0',
    //     protocol41: true,
    //     changedRows: 0 } 
    //     */
    //     });
    //   }
    // });
  })
}
 
// // Create a Server
// let server = app.listen(8080, function () {
 
//   let host = server.address().address
//   let port = server.address().port
 
//   console.log("App listening at http://%s:%s", host, port) 
// })

var Excel = require('exceljs');
const { timeStamp } = require('console');
var workbook = new Excel.Workbook();

var options = {
  filename: __dirname+'/templates/'+"benfica.csv",
  useStyles: true,
  useSharedStrings: true
};

// var workbook = new Excel.stream.xlsx.WorkbookWriter(options);

// var worksheet = workbook.addWorksheet('Credential Template',{properties:{tabColor:{argb:'FFC0000'}}});

// worksheet.columns = [
//   { header: 'column 1', key: 'array key', width: 35},
//   { header: 'column 2', key: 'array key', width: 35},
//   { header: 'column 3', key: 'array key', width: 20},
//   ];

// S3 BUCKET 


let pessoa = function(){
  this.nome = 'Vitor';
  this.apelido = 'viana';
  this.idade = 3;
}
pessoa.prototype.idade = function(i){
    this.idade = i;
    return this.idade;
}
pessoa.prototype.carro = function(){
  return "Vitor Pedro";
}


let carlos = new pessoa();
carlos.idade(99);

let c = Object.assign({}, carlos )
let str = JSON.stringify(c);
let parsed = JSON.parse(str);

console.log('Carlos ', carlos );
console.log('Obj ', parsed );
console.log('Obj idade ', parsed );
