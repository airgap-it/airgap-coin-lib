"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
exports.__esModule = true;
var fs_1 = require("fs");
var path_1 = require("path");
var findJsonOnLevel = function (base) { return __awaiter(_this, void 0, void 0, function () {
    var packageJsons, files, _i, files_1, file, path, isDirectory, _a, _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                packageJsons = [];
                files = fs_1.readdirSync(base);
                _i = 0, files_1 = files;
                _d.label = 1;
            case 1:
                if (!(_i < files_1.length)) return [3 /*break*/, 5];
                file = files_1[_i];
                path = base + "/" + file;
                isDirectory = (fs_1.lstatSync(path)).isDirectory();
                if (!isDirectory) return [3 /*break*/, 3];
                _b = (_a = packageJsons.push).apply;
                _c = [packageJsons];
                return [4 /*yield*/, findJsonOnLevel(path)];
            case 2:
                _b.apply(_a, _c.concat([_d.sent()]));
                return [3 /*break*/, 4];
            case 3:
                if (file.endsWith('json')) {
                    packageJsons.push(path);
                    try {
                        fs_1.mkdirSync(path_1.dirname(path), { recursive: true });
                    }
                    catch (error) {
                        if (error.code === 'EEXIST') { }
                        else {
                            throw error;
                        }
                    }
                    fs_1.copyFileSync(path, path.replace('./src', './dist'));
                }
                _d.label = 4;
            case 4:
                _i++;
                return [3 /*break*/, 1];
            case 5: return [2 /*return*/, packageJsons];
        }
    });
}); };
findJsonOnLevel('./src/dependencies/src').then(function () { })["catch"](console.error);
