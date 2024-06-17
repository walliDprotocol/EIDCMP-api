const Schema = require('mongoose').Schema
const crypto = require('crypto');


//crypto randonBytes
const CaSchema = new Schema({
    name: {
        type: String,
        default : 'NA'
    },
    code: {
        type : String,
        default :  ( () => {
            return '0x' +  crypto.randomBytes(32).toString('hex')
        })
    },
    admin_email : String,
    creatorWA: {
        type: String
    },
    contract_address: {
        type : String,
        default : '0x99999999'
    },
    img_url : String,
    admin : [String]
},
{ collection: 'certAuthority', versionKey: false })

CaSchema.set('timestamps', true);
// CaSchema.index({ name: 1, creatorWA: 1 }, { unique: true });


// Duplicate the ID field.
CaSchema.virtual('cid').get(function(){
    return this._id.toHexString();
});

// Ensure virtual fields are serialised.
CaSchema.set('toJSON', {
    virtuals: true
});

module.exports = CaSchema