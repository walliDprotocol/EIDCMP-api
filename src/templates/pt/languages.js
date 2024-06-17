

module.exports =  function(details){

    module.inviteUser = {
        title   : `A sua credential está pronta`,
        subject : `${details.ca}: Recebeu uma nova credencial  ${details.template}`
    },
    module.sendEmailApprove = {
        subject : `WalliD: A sua credencial ${details.template} foi aprovada`
    },
    module.pendingAprovals = {
        subject : `WalliD: Tem credenciais à espera da sua aprovação na plataforma WalliD.`
    },
    module.credentialRevoke = {
        subject : `WalliD: A sua credencial ${details.template} da ${details.ca} foi revogada`
    }
    return module;
}