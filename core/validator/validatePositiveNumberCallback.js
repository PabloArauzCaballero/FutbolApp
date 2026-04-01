module.exports = (value) =>{
    return Number.isSafeInteger(value) && value > 0;
}