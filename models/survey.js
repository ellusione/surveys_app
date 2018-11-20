"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
var sequelize_typescript_1 = require("sequelize-typescript")
var Survey = /** @class */ (function () {
    function Survey(sequelize) {
        var a = sequelize.define('survey', {
            id: sequelize_typescript_1.Sequelize.NUMBER,
            created_at: sequelize_typescript_1.Sequelize.DATE
        })
    }
    
    return Survey
}())
exports.Survey = Survey
