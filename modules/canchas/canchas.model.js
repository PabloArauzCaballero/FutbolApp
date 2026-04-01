const {name, attributes, metadata} = require("./model.prototype");

module.exports = (sequelize) => {
    const Cancha = sequelize.define(
        name,
        attributes,
        metadata
    );

    return Cancha;
};