"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var fs_1 = require("fs");
var https_1 = require("https");
var check_dependencies_fs_1 = require("./check_dependencies_fs");
var semver = require("./check_dependencies_semver");
function httpGet(params) {
    return new Promise(function (resolve, reject) {
        var req = https_1.request(params, function (res) {
            // reject on bad status
            if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
                return reject(new Error('statusCode=' + res.statusCode));
            }
            // cumulate data
            var body = [];
            res.on('data', function (chunk) {
                body.push(chunk);
            });
            // resolve on end
            res.on('end', function () {
                try {
                    body = JSON.parse(Buffer.concat(body).toString());
                }
                catch (e) {
                    body = Buffer.concat(body).toString();
                }
                resolve(body);
            });
        });
        // reject on request error
        req.on('error', function (err) {
            // This is not a "Second reject", just a different sort of failure
            reject(err);
        });
        // IMPORTANT
        req.end();
    });
}
var cliCommand = process.argv[2];
var validCommands = [undefined, 'check'];
if (!validCommands.some(function (validCommand) { return validCommand === cliCommand; })) {
    throw new Error('invalid command');
}
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
function log(color) {
    var message = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        message[_i - 1] = arguments[_i];
    }
    var colors = {
        black: '\x1b[30m',
        red: '\x1b[31m',
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        blue: '\x1b[34m',
        magenta: '\x1b[35m',
        cyan: '\x1b[36m',
        white: '\x1b[37m'
    };
    var hasColor = colors[color];
    if (hasColor) {
        console.log.apply(console, __spreadArrays([colors[color] + "%s\u001B[0m"], message));
    }
    else {
        console.log.apply(console, __spreadArrays([color], message));
    }
}
// tslint:disable:cyclomatic-complexity
exports.validateDepsJson = function (depsFile) { return __awaiter(void 0, void 0, void 0, function () {
    var verificationFailed, packageJson, topLevelPackages, keys, _loop_1, _i, keys_1, prop;
    return __generator(this, function (_a) {
        log("\n#############################\n##                         ##\n## VALIDATING DEPENDENCIES ##\n##                         ##\n#############################\n");
        verificationFailed = function (prop, reason) {
            log('red', prop + " is invalid because " + reason);
            return false;
        };
        packageJson = JSON.parse(fs_1.readFileSync("./package.json", 'utf-8'));
        topLevelPackages = Object.keys(packageJson.localDependencies).map(function (tlp) { return tlp + "-" + packageJson.localDependencies[tlp]; });
        topLevelPackages.forEach(function (pkgName) {
            if (depsFile[pkgName]) {
                log('green', pkgName + " is in deps file");
            }
            else {
                log('red', pkgName + " is NOT in deps file");
            }
        });
        keys = Object.keys(depsFile);
        _loop_1 = function (prop) {
            log('blue', "--- " + prop + " ---");
            var isValid = true;
            if (!prop.endsWith(depsFile[prop].version)) {
                isValid =
                    isValid && verificationFailed(prop, "version in key doesn't match version in json. " + prop + " should end in " + depsFile[prop].version);
            }
            if (!prop.startsWith(depsFile[prop].name)) {
                isValid =
                    isValid &&
                        verificationFailed(prop, "name in key doesn't match name of repository. " + prop + " should start with " + depsFile[prop].name);
            }
            var pkg = JSON.parse(fs_1.readFileSync("./src/dependencies/github/" + prop + "/package.json", 'utf-8'));
            if (!pkg) {
                isValid = isValid && verificationFailed(prop, "package.json not found");
            }
            if (pkg.dependencies) {
                var dependencyKeys = Object.keys(pkg.dependencies);
                var _loop_2 = function (dependency) {
                    var key = keys.find(function (key) { return key.startsWith(dependency + '-'); }); // TODO: Handle packages that start with the same name
                    if (!key) {
                        if (depsFile[prop].ignoredDeps) {
                            var x = depsFile[prop].ignoredDeps.find(function (ignoredDep) { return ignoredDep.module === dependency; });
                            if (x) {
                                log('green', "Ignored \"" + dependency + "\" because " + x.reason);
                            }
                            else {
                                isValid = isValid && verificationFailed(prop, dependency + "@" + pkg.dependencies[dependency] + " not found");
                            }
                        }
                        else {
                            isValid = isValid && verificationFailed(prop, dependency + "@" + pkg.dependencies[dependency] + " not found");
                        }
                    }
                    else {
                        var packageDeps = depsFile[prop].deps;
                        if (!(packageDeps && packageDeps.some(function (dep) { return dep.startsWith(dependency + '-'); }))) {
                            isValid = isValid && verificationFailed(dependency, "is not in deps!");
                        }
                        else {
                            var keyVersion = key.substr(key.lastIndexOf('-') + 1); // TODO: Handle multiple versions
                            var isSatisfied = semver.satisfies(keyVersion, pkg.dependencies[dependency]);
                            if (!isSatisfied && pkg.dependencies[dependency].length < 20) {
                                console.log('FAIL', keyVersion, pkg.dependencies[dependency]);
                                isValid = isValid && verificationFailed(dependency, "version is not satisfied");
                            }
                        }
                    }
                };
                for (var _i = 0, dependencyKeys_1 = dependencyKeys; _i < dependencyKeys_1.length; _i++) {
                    var dependency = dependencyKeys_1[_i];
                    _loop_2(dependency);
                }
            }
            var deps = depsFile[prop].deps;
            if (deps) {
                deps.forEach(function (dep) {
                    if (!depsFile[dep]) {
                        isValid = isValid && verificationFailed(prop, "dependency " + dep + " doesn't exist");
                    }
                });
            }
            var renameFiles = depsFile[prop].renameFiles;
            if (renameFiles) {
                renameFiles.forEach(function (_a) {
                    var source = _a[0], destination = _a[1];
                    if (!depsFile[prop].files.includes(source)) {
                        isValid = isValid && verificationFailed(prop, "renaming file that does not exist in files array " + source);
                    }
                });
            }
            var parentPackages = keys.filter(function (key) {
                var deps = depsFile[key].deps;
                if (deps) {
                    return deps.includes(prop);
                }
                return false;
            });
            if (parentPackages.length === 0) {
                // Check if it's a top level package
                if (!topLevelPackages.includes(prop)) {
                    isValid = isValid && verificationFailed(prop, "is not used in any other package");
                }
            }
            if (isValid) {
                log('green', prop + " is valid");
            }
            else {
                log('blue', "--- " + prop + " ---");
            }
        };
        for (_i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
            prop = keys_1[_i];
            _loop_1(prop);
        }
        return [2 /*return*/];
    });
}); };
var simpleHash = function (s) {
    var h = 0xdeadbeef;
    for (var i = 0; i < s.length; i++) {
        h = Math.imul(h ^ s.charCodeAt(i), 2654435761);
    }
    var code = (h ^ (h >>> 16)) >>> 0;
    var buff = Buffer.from(code.toString());
    return buff
        .toString('base64')
        .split('=')
        .join('');
};
var downloadFile = function (url) { return __awaiter(void 0, void 0, void 0, function () {
    var cachePath, cacheFile, fileExists, response, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                cachePath = './src/dependencies/cache/';
                cacheFile = "" + cachePath + simpleHash(url);
                fileExists = fs_1.existsSync(cacheFile);
                if (!fileExists) return [3 /*break*/, 1];
                log('cyan', "Using cache " + url);
                return [2 /*return*/, fs_1.readFileSync(cacheFile, 'utf-8')];
            case 1:
                _a.trys.push([1, 3, , 4]);
                log('magenta', "Downloading " + url);
                return [4 /*yield*/, httpGet(url)];
            case 2:
                response = _a.sent();
                check_dependencies_fs_1.writeFileAndCreateFolder(cacheFile, response);
                return [2 /*return*/, response];
            case 3:
                error_1 = _a.sent();
                if (error_1.response && error_1.response.status) {
                    log('red', "Error: " + error_1.config.url + " " + error_1.response.status);
                }
                else {
                    throw error_1;
                }
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
// export const checkCacheAndDownload = (cachePath: string, localPath: string, remotePath: string) => {
//   return new Promise((resolve, reject) => {
//     exists(cachePath, exists => {
//       if (!exists) {
//         console.log('DOES NOT EXIST', localPath)
//         downloadFile(remotePath)
//           .then(data => {
//             createFolderIfNotExists(localPath)
//             resolve(data)
//           })
//           .catch((error: AxiosError) => {
//             reject(error)
//           })
//       } else {
//         console.log('ALREADY EXISTS')
//       }
//     })
//   })
// }
exports.getPackageJsonForDepsFiles = function (depsFile) { return __awaiter(void 0, void 0, void 0, function () {
    var _i, _a, prop, localPath, fileExists, urlCommit, data;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _i = 0, _a = Object.keys(depsFile);
                _b.label = 1;
            case 1:
                if (!(_i < _a.length)) return [3 /*break*/, 5];
                prop = _a[_i];
                check_dependencies_fs_1.createFolderIfNotExists("./src/dependencies/github/" + prop + "/");
                localPath = "./src/dependencies/github/" + prop + "/package.json";
                fileExists = fs_1.existsSync(localPath);
                if (!!fileExists) return [3 /*break*/, 3];
                console.log('DOES NOT EXIST', prop);
                urlCommit = "https://raw.githubusercontent.com/" + depsFile[prop].repository + "/" + depsFile[prop].commitHash + "/package.json";
                return [4 /*yield*/, downloadFile(urlCommit)];
            case 2:
                data = _b.sent();
                check_dependencies_fs_1.writeFileAndCreateFolder(localPath, data);
                log('green', prop + " (commit): Saved package.json");
                return [3 /*break*/, 4];
            case 3:
                console.log("ALREADY EXISTS: " + prop);
                _b.label = 4;
            case 4:
                _i++;
                return [3 /*break*/, 1];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.getFilesForDepsFile = function (depsFile) { return __awaiter(void 0, void 0, void 0, function () {
    var _i, _a, prop, _loop_3, _b, _c, file, state_1;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _i = 0, _a = Object.keys(depsFile);
                _d.label = 1;
            case 1:
                if (!(_i < _a.length)) return [3 /*break*/, 6];
                prop = _a[_i];
                _loop_3 = function (file) {
                    var urlCommit, renamedFile, renamedFiles, replaceArray, localPath, localCache, cacheExists, data;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                urlCommit = "https://raw.githubusercontent.com/" + depsFile[prop].repository + "/" + depsFile[prop].commitHash + "/" + file;
                                renamedFile = file;
                                renamedFiles = depsFile[prop].renameFiles;
                                if (renamedFiles) {
                                    replaceArray = renamedFiles.find(function (replace) { return replace[0] === file; });
                                    if (replaceArray) {
                                        renamedFile = replaceArray[1];
                                    }
                                }
                                localPath = "./src/dependencies/src/" + prop + "/" + renamedFile;
                                localCache = "./src/dependencies/github/" + prop + "/" + file;
                                cacheExists = fs_1.existsSync(localCache);
                                if (!!cacheExists) return [3 /*break*/, 2];
                                return [4 /*yield*/, downloadFile(urlCommit)];
                            case 1:
                                data = _a.sent();
                                if (!data) {
                                    return [2 /*return*/, { value: void 0 }];
                                }
                                check_dependencies_fs_1.writeFileAndCreateFolder(localCache, data);
                                log('green', prop + " (commit): Cached file: " + file);
                                _a.label = 2;
                            case 2:
                                // const fileExists = existsSync(localPath)
                                // if (!fileExists) {
                                //   console.log('DOES NOT EXIST, CHECKING CACHE ' + localPath)
                                check_dependencies_fs_1.copyFileAndCreateFolder(localCache, localPath);
                                return [2 /*return*/];
                        }
                    });
                };
                _b = 0, _c = depsFile[prop].files;
                _d.label = 2;
            case 2:
                if (!(_b < _c.length)) return [3 /*break*/, 5];
                file = _c[_b];
                return [5 /*yield**/, _loop_3(file)];
            case 3:
                state_1 = _d.sent();
                if (typeof state_1 === "object")
                    return [2 /*return*/, state_1.value];
                _d.label = 4;
            case 4:
                _b++;
                return [3 /*break*/, 2];
            case 5:
                _i++;
                return [3 /*break*/, 1];
            case 6: return [2 /*return*/];
        }
    });
}); };
var replaceWithinContainer = function (content, before, after) {
    var containers = ["require(\"PLACEHOLDER\")", "require('PLACEHOLDER')", " from \"PLACEHOLDER\"", " from 'PLACEHOLDER'"];
    for (var _i = 0, containers_1 = containers; _i < containers_1.length; _i++) {
        var container = containers_1[_i];
        var searchString = container.split('PLACEHOLDER').join(before);
        var replaceString = container.split('PLACEHOLDER').join(after);
        content = content.split(searchString).join(replaceString);
    }
    return content;
};
var replaceImports = function (depsFile) { return __awaiter(void 0, void 0, void 0, function () {
    var _i, _a, prop, predefinedReplacements, _loop_4, _b, _c, file;
    return __generator(this, function (_d) {
        for (_i = 0, _a = Object.keys(depsFile); _i < _a.length; _i++) {
            prop = _a[_i];
            predefinedReplacements = depsFile[prop].replaceInFiles;
            _loop_4 = function (file) {
                // Rename files
                var renamedFile = file;
                var renamedFiles = depsFile[prop].renameFiles;
                if (renamedFiles) {
                    var replaceArray = renamedFiles.find(function (replace) { return replace[0] === file; });
                    if (replaceArray) {
                        renamedFile = replaceArray[1];
                    }
                }
                var localPath = "./src/dependencies/src/" + prop + "/" + renamedFile;
                var fileContent = fs_1.readFileSync(localPath, 'utf-8');
                // INCLUDE DEFINED REPLACEMENTS
                if (predefinedReplacements) {
                    var replacements = predefinedReplacements.find(function (predefinedReplacement) { return predefinedReplacement.filename === renamedFile; });
                    if (replacements) {
                        replacements.replacements.forEach(function (replacement) {
                            var count = (fileContent.match(new RegExp(escapeRegExp(replacement.from), 'g')) || []).length;
                            if (count === replacement.expectedReplacements) {
                                fileContent = fileContent.split(replacement.from).join(replacement.to);
                            }
                            else {
                                log('red', "EXPECTED " + replacement.expectedReplacements + " MATCHES BUT HAVE " + count);
                            }
                        });
                    }
                }
                var dependencies = depsFile[prop].deps;
                if (dependencies) {
                    for (var _i = 0, dependencies_1 = dependencies; _i < dependencies_1.length; _i++) {
                        var dependency = dependencies_1[_i];
                        var dependencyDefinition = depsFile[dependency];
                        if (!dependencyDefinition) {
                            console.log('WOOPS', dependency);
                        }
                        else {
                            var levels = (file.match(/\//g) || []).length + (prop.includes('/') ? 1 : 0);
                            var levelUpString = '../';
                            if (dependencyDefinition.entrypoint === '') {
                                dependencyDefinition.entrypoint = 'index';
                            }
                            var relativePath = "" + levelUpString.repeat(levels + 1) + dependencyDefinition.name + "-" + dependencyDefinition.version + "/" + dependencyDefinition.entrypoint;
                            fileContent = replaceWithinContainer(fileContent, dependencyDefinition.name, relativePath);
                        }
                    }
                }
                check_dependencies_fs_1.writeFileAndCreateFolder(localPath, fileContent);
            };
            for (_b = 0, _c = depsFile[prop].files; _b < _c.length; _b++) {
                file = _c[_b];
                _loop_4(file);
            }
        }
        return [2 /*return*/];
    });
}); };
{
    var dependencies = fs_1.readFileSync('./src/dependencies/deps.json', 'utf-8');
    var deps_1 = JSON.parse(dependencies);
    check_dependencies_fs_1.createFolderIfNotExists("./src/dependencies/cache/");
    check_dependencies_fs_1.createFolderIfNotExists("./src/dependencies/github/");
    check_dependencies_fs_1.createFolderIfNotExists("./src/dependencies/src/");
    console.log('START');
    exports.getFilesForDepsFile(deps_1).then(function () {
        console.log('MID');
        exports.getPackageJsonForDepsFiles(deps_1).then(function () {
            console.log('END');
            exports.validateDepsJson(deps_1).then(function () {
                console.log('VALIDATED');
                replaceImports(deps_1).then(function () {
                    console.log('REPLACED IMPORTS');
                });
            });
        });
    });
}
