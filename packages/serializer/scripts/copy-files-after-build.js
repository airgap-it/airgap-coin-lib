'use strict'
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value)
          })
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value))
        } catch (e) {
          reject(e)
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value))
        } catch (e) {
          reject(e)
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected)
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next())
    })
  }
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1]
          return t[1]
        },
        trys: [],
        ops: []
      },
      f,
      y,
      t,
      g
    return (
      (g = { next: verb(0), throw: verb(1), return: verb(2) }),
      typeof Symbol === 'function' &&
        (g[Symbol.iterator] = function () {
          return this
        }),
      g
    )
    function verb(n) {
      return function (v) {
        return step([n, v])
      }
    }
    function step(op) {
      if (f) throw new TypeError('Generator is already executing.')
      while (_)
        try {
          if (
            ((f = 1),
            y &&
              (t = op[0] & 2 ? y['return'] : op[0] ? y['throw'] || ((t = y['return']) && t.call(y), 0) : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t
          if (((y = 0), t)) op = [op[0] & 2, t.value]
          switch (op[0]) {
            case 0:
            case 1:
              t = op
              break
            case 4:
              _.label++
              return { value: op[1], done: false }
            case 5:
              _.label++
              y = op[1]
              op = [0]
              continue
            case 7:
              op = _.ops.pop()
              _.trys.pop()
              continue
            default:
              if (!((t = _.trys), (t = t.length > 0 && t[t.length - 1])) && (op[0] === 6 || op[0] === 2)) {
                _ = 0
                continue
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1]
                break
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1]
                t = op
                break
              }
              if (t && _.label < t[2]) {
                _.label = t[2]
                _.ops.push(op)
                break
              }
              if (t[2]) _.ops.pop()
              _.trys.pop()
              continue
          }
          op = body.call(thisArg, _)
        } catch (e) {
          op = [6, e]
          y = 0
        } finally {
          f = t = 0
        }
      if (op[0] & 5) throw op[1]
      return { value: op[0] ? op[1] : void 0, done: true }
    }
  }
exports.__esModule = true
var fs_1 = require('fs')
var path_1 = require('path')
var findFilesOnLevel = function (base) {
  return __awaiter(void 0, void 0, void 0, function () {
    var files, filesInFolder, _i, filesInFolder_1, file, path, isDirectory, _a, _b, _c
    return __generator(this, function (_d) {
      switch (_d.label) {
        case 0:
          files = []
          filesInFolder = fs_1.readdirSync(base)
          ;(_i = 0), (filesInFolder_1 = filesInFolder)
          _d.label = 1
        case 1:
          if (!(_i < filesInFolder_1.length)) return [3 /*break*/, 5]
          file = filesInFolder_1[_i]
          path = base + '/' + file
          isDirectory = fs_1.lstatSync(path).isDirectory()
          if (!isDirectory) return [3 /*break*/, 3]
          _b = (_a = files.push).apply
          _c = [files]
          return [4 /*yield*/, findFilesOnLevel(path)]
        case 2:
          _b.apply(_a, _c.concat([_d.sent()]))
          return [3 /*break*/, 4]
        case 3:
          if (file.endsWith('json') || file.endsWith('js')) {
            files.push(path)
            path_1
              .dirname(path)
              .split(path_1.sep)
              .reduce(function (prevPath, folder) {
                var currentPath = path_1.join(prevPath, folder, path_1.sep)
                if (currentPath === 'src/') {
                  return 'dist/'
                }
                if (!fs_1.existsSync(currentPath)) {
                  fs_1.mkdirSync(currentPath)
                }
                return currentPath
              }, '')
            console.log('Copying file', path.replace('./src', './dist'))
            fs_1.copyFileSync(path, path.replace('./src', './dist'))
          }
          _d.label = 4
        case 4:
          _i++
          return [3 /*break*/, 1]
        case 5:
          return [2 /*return*/, files]
      }
    })
  })
}
findFilesOnLevel('./src/v2/schemas')
  .then(function () {})
  ['catch'](console.error)
findFilesOnLevel('./src/v3/schemas')
  .then(function () {})
  ['catch'](console.error)
fs_1.copyFileSync('./package.json', './dist/package.json')
fs_1.copyFileSync('./readme.md', './dist/readme.md')
