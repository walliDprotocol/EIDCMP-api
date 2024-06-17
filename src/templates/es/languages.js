

module.exports = function(details){

     module.inviteUser = {
        title   : `Recibiste una nueva credencial`,
        subject : `${details.ca}: Recibiste una nueva credencial ${details.template} `
    },
    module.sendEmailApprove = {
        subject : `WalliD: A sua credencial ${details.template} foi aprovada`
    },
    module.pendingAprovals = {
        subject : `WalliD: Tienes credenciales esperando aprobación en la plataforma WalliD`
    },
    module.credentialRevoke = {
        subject : `WalliD: Tu credencial ${details.template} de ${details.ca} ha sido derogada`
    }

    return module;
}