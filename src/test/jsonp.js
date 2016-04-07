module.exports = function(req, res, next) {
  // get callback name
    var callbackName = req.query.callback;
    var json = require('./mock.json');
    var retStr = ''+callbackName+'('+JSON.stringify(json)+');'
    //set return http header
    res.type('text/javascript;charset=utf-8');
    res.send(retStr);
};