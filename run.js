const sgMail = require('@sendgrid/mail')


// let key = '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'
// sgMail.setApiKey(key)

// const msg = {
//   to: ["vitor.viana@wallid.io", "filipe.veiga@wallid.io" , "guilherme.arsenio@wallid.io"], // Change to your recipient
//   from: 'credentials@wallid.io', // Change to your verified sender
//   subject: 'Sending with SendGrid is Fun',
//   text: 'and easy to do anywhere, even with Node.js',
//   html: '<strong>and easy to do anywhere, even with Node.js</strong>',
// }

// sgMail
//   .send(msg)
//   .then((m) => {
//     console.log('Email sent ', m)
//   })
//   .catch((error) => {
//     console.error(error)
//   })


// async function paintAxies(axiesData) {
//   const BASE_URL = 'https://api.axieinfinity.com/v1/';
//   const axiesContainer = document.getElementById('axies');
//   const axies = axiesData.axies;
//   axiesContainer.innerHTML = '';
// for (let i = 0; i < axies.length; i += 1) {
//     const axie = axies[i];
// await axios.get(BASE_URL + 'figure/' + axie.id)
//       .then(function(response) {
//         const staticImage = response.data.images.static.idle;
//         const HTML = '<img id="' + axie.id + '" class="axie" src="' + staticImage + '" alt="" />';
//         axiesContainer.insertAdjacentHTML('beforeend', HTML);
//       })
//       .catch(function(error) {
//         console.log(error);
//       })
//   }
// }


const sdk = require('api')('@opensea/v1.0#10ly3a2fkr6dkwq4');

sdk['retrieving-a-single-contract']({asset_contract_address: '0x06012c8cf97bead5deae237070f9587f8e7a266d'})
  .then(res => console.log(res))
  .catch(err => console.error(err));

