module.exports = function (details) {
  module.inviteUser = {
    title: 'Your credentials is ready',
    subject: `Here is your ${details.template} sent by ${details.ca}.`,
  },
  module.demoInvite = {
    title: 'Your private beta credentials - WalliD for issuers',
    subject: 'Your private beta credentials - WalliD for issuers',
  },
  module.sendEmailApprove = {
    subject: `WalliD: Your credential ${details.template} is approved`,
  },
  module.pendingAprovals = {
    subject: 'WalliD: You have credentials waiting your approval on WalliD.',
  },
  module.credentialRevoke = {
    subject: `WalliD: Your ${details.template} by ${details.ca} credential is revoked`,
  };
  return module;
};
