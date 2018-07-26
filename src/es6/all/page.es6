//兼容es7
let regeneratorRuntime = require('regenerator-runtime');




let backObj = {};


backObj.run = require('./fns/readyFn');
backObj.loading = require('./fns/loading');
backObj.info = require('./fns/info');
backObj.page = require('./fns/openUrl');






module.exports = backObj;