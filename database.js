"use strict"
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod
    var result = {}
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k]
    result["default"] = mod
    return result
}
Object.defineProperty(exports, "__esModule", { value: true })
var Sequelize = __importStar(require("sequelize"))
var sequelize = new Sequelize({
    database: 'survey',
    dialect: 'postgres',
    username: 'posgres',
    password: '123',
    modelPaths: [__dirname + '/models']
})
function init() {
    return sequelize
        .authenticate()
        .then(function () {
        console.log("db connection successful")
        return sequelize
    })
        .catch(function (err) {
        console.error("db connection unsuccessful", err)
        throw err
    })
}
exports.init = init
