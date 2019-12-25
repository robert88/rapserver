const crypto = require('crypto');

function SHA1(str){
    var sha1 = crypto.createHash('sha1');
    sha1.update(str);
    return sha1.digest('hex');
}

exports = module.exports= SHA1;

