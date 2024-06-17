const Schema = require('mongoose').Schema

const PendingInviteSchema = new Schema({
    type: {
        type: String,
        enum : ['certificate', 'governance', 'invite_user', 'invite_admin' ],
        default: 'certificate'
    },
    from: String,
    to: String, 
    emailFrom: String,
    emailTo: String,
    data : {
        // user_data : {},
        // public_field : {},
        // ca_photo : String,
        // tid : String,
        // cid : String
        // wa_admin : String
    },
    status:  {
        type: String,
        enum : ['active', 'inactive', 'accepted' ],
        default: 'active'
    },
},
{ collection: 'pending_invites', versionKey: false })

PendingInviteSchema.set('timestamps', true);

// Duplicate the ID field.
PendingInviteSchema.virtual('public_field').get(function(){
    return (this.data && this.data.userData.public_field) ?  this.data.userData.public_field : {};
});

// Ensure virtual fields are serialised.
PendingInviteSchema.set('toJSON', {
    virtuals: true
});


module.exports = PendingInviteSchema