
module.exports = (value) => {
    if (value === undefined || value === null) {
        return value;
    }
    
    if (typeof value === "string") {
        const trimmedValue = value.trim();
        
        if (trimmedValue === "") {
            return trimmedValue;
        }
        
        if (!/^\d+$/.test(trimmedValue)) {
            return trimmedValue;
        }
        
        return Number(trimmedValue);
    }
    return value;   
};