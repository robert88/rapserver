var fs = require('fs');
var archiver = require('@/lib/rap.archiver.js');
var zlib= require("zlib");
var archive = archiver();
exports = module.exports = {
	zipOne: function (outpath, file) {
		return new Promise(function (resolve) {
			var gzip = zlib.createGzip();
			var out = fs.createWriteStream(outpath, {encoding: 'utf-8', bufferSize: 11});
			var inp = fs.createReadStream(file, {encoding: 'utf-8', bufferSize: 11});
			inp.pipe(gzip).pipe(out);
			inp.on("end", function () {
				resolve();
			})
		})
	},
	zip: function (outPath, files) {
		return archive.pack(outPath,files);
	},
	unzip: function (zipFile, outPath) {
		return archive.unpack(zipFile,outPath);
	}
};
