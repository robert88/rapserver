
const crypto = require('crypto');
exports = module.exports = {
    md5:function (str) {
		const hash = crypto.createHash('sha256');
		hash.update(str);
		return hash.digest('hex')
	}
}
