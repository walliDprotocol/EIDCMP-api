module.exports = (details) => {
  const { template, ca, from } = details;

  return {
    inviteUser: {
      title: `Your ${template} is ready`,
      subject: `${template} sent by ${ca}`,
    },
    demoInvite: {
      title: 'Your private beta credentials - WalliD for issuers',
      subject: 'Your private beta credentials - WalliD for issuers',
    },
    sendEmailApprove: {
      subject: `WalliD: Your ${template} is approved`,
    },
    pendingAprovals: {
      subject: 'WalliD: You have credentials waiting your approval on WalliD.',
    },
    credentialRevoke: {
      subject: `WalliD: Your ${template} by ${ca} credential is revoked`,
    },
    adminInvite: {
      subject: `WalliD: Invite from ${ca}`,
      message: `You have been invited by <b>${from}</b> to become an administrator of ${ca}`,
    },
  };
};
