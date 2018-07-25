//兼容es7
let regeneratorRuntime = require('regenerator-runtime');




let backObj = {};


backObj.run = require('./fns/readyFn');
backObj.loading = require('./fns/loading');
backObj.info = require('./fns/info');






module.exports = backObj;