const { name, attributes, metadata } = require('./model.prototype');


module.exports = (sequelize) => {
    return sequelize.define(
        name, 
        attributes, 
        metadata
    );
}