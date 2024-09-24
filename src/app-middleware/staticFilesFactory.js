const express = require('express');
const path = require('path');

module.exports = function staticFilesFactory() {
  return [
    // express.static(path.join(__dirname, 'uploads')),
    express.static(path.join(__dirname, 'webapp')),
  ];
};
