"use strict";
exports.__esModule = true;
var fs_1 = require("fs");
var path_1 = require("path");
exports.createFolderIfNotExists = function (path) {
    var dir = path_1.dirname(path);
    try {
        fs_1.mkdirSync(dir, { recursive: true });
    }
    catch (e) {
        if (e.code === 'ENOENT') {
            exports.createFolderIfNotExists(dir);
            exports.createFolderIfNotExists(dir + '/whyYouNoWork');
        }
        else if (e.code === 'EEXIST') {
            // do nothing
        }
        else {
            throw e;
        }
    }
};
exports.copyFileAndCreateFolder = function (src, dest) {
    exports.createFolderIfNotExists(dest);
    fs_1.copyFileSync(src, dest);
};
exports.writeFileAndCreateFolder = function (path, data) {
    exports.createFolderIfNotExists(path);
    var content = typeof data === 'string' ? data : JSON.stringify(data, null, 4);
    fs_1.writeFileSync(path, content);
};
