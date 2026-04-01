class Validator {
    #VALID_TYPES = ["string", "number", "object", "date", "boolean"];

    #isValidString(value) {
        return (
            typeof value === "string" &&
            value.trim() !== ""
        );
    }

    #isValidNumber(value) {
        return (
            typeof value === "number" &&
            Number.isFinite(value)
        );
    }

    #isValidObject(value) {
        return (
            value !== null &&
            typeof value === "object" &&
            !Array.isArray(value) &&
            Object.keys(value).length > 0
        );
    }

    #isValidDate(value) {
        if (value instanceof Date) {
            return !Number.isNaN(value.getTime());
        }

        if (this.#isValidString(value)) {
            const parsedDate = new Date(value);
            return !Number.isNaN(parsedDate.getTime());
        }

        return false;
    }

    #isValidBoolean(value) {
        return typeof value === "boolean";
    }

    #isValidCallback(callback) {
        return typeof callback === "function";
    }

    #validateConstructorParams(validatorName, modelObject, modelCallback, options) {
        if (!this.#isValidString(validatorName)) {
            throw new Error(
                "Error: invalid input for validatorName. Expected a non-empty string."
            );
        }

        if (!this.#isValidObject(modelObject)) {
            throw new Error(
                "Error: invalid input for modelObject. Expected a non-empty plain object."
            );
        }

        if (
            !this.#isValidObject(modelCallback) ||
            !Object.values(modelCallback).every((callback) => this.#isValidCallback(callback))
        ) {
            throw new Error(
                "Error: invalid input for modelCallback. Expected a non-empty object containing only valid callbacks."
            );
        }

        if (
            options !== undefined &&
            (options === null || typeof options !== "object" || Array.isArray(options))
        ) {
            throw new Error(
                "Error: invalid input for options. Expected a plain object."
            );
        }

        const modelObjectFields = Object.keys(modelObject);
        const modelCallbackFields = Object.keys(modelCallback);

        for (const column of modelObjectFields) {
            if (!modelCallbackFields.includes(column)) {
                throw new Error(
                    `Error: missing callback for field "${column}" in modelCallback. Each field in modelObject must have a corresponding callback in modelCallback.`
                );
            }
        }

        for (const column of modelCallbackFields) {
            if (!modelObjectFields.includes(column)) {
                throw new Error(
                    `Error: unexpected callback for field "${column}" in modelCallback. Only fields present in modelObject can have callbacks in modelCallback.`
                );
            }
        }

        for (const [fieldName, fieldType] of Object.entries(modelObject)) {
            if (!this.#isValidString(fieldName)) {
                throw new Error(
                    `Error: invalid field name in modelObject. Received: ${fieldName}`
                );
            }

            if (!this.#isValidString(fieldType) || !this.#VALID_TYPES.includes(fieldType)) {
                throw new Error(
                    `Error: invalid type for field "${fieldName}". Expected one of: ${this.#VALID_TYPES.join(", ")}. Received: ${fieldType}`
                );
            }
        }
    }

    #validateType(fieldValue, expectedType) {
        switch (expectedType) {
            case "string":
                return this.#isValidString(fieldValue);

            case "number":
                return this.#isValidNumber(fieldValue);

            case "object":
                return this.#isValidObject(fieldValue);

            case "date":
                return this.#isValidDate(fieldValue);

            case "boolean":
                return this.#isValidBoolean(fieldValue);

            default:
                return false;
        }
    }

    constructor(validatorName, modelObject, modelCallback, options = {}) {
        this.#validateConstructorParams(validatorName, modelObject, modelCallback, options);

        this.validatorName = validatorName;
        this.modelObject = Object.freeze({ ...modelObject });
        this.modelCallback = Object.freeze({ ...modelCallback });
        this.options = Object.freeze({
            allowPartial: Boolean(options.allowPartial),
        });
    }

    validateInput(payload) {
        if (!this.#isValidObject(payload)) {
            return {
                status: false,
                message: "Invalid input: payload must be a non-empty plain object."
            };
        }

        const modelObjectKeys = Object.keys(this.modelObject);
        const payloadObjectKeys = Object.keys(payload);

        for (const columnName of payloadObjectKeys) {
            if (!modelObjectKeys.includes(columnName)) {
                return {
                    status: false,
                    message: `Unexpected param: ${columnName}. Expected params: ${modelObjectKeys.join(", ")}`
                };
            }
        }

        for (const columnName of modelObjectKeys) {
            const columnIsPresent = payloadObjectKeys.includes(columnName);

            if (!columnIsPresent) {
                if (this.options.allowPartial) {
                    continue;
                }

                return {
                    status: false,
                    message: `Missing required param: ${columnName}.`
                };
            }

            const expectedType = this.modelObject[columnName];
            const receivedValue = payload[columnName];

            if (!this.#validateType(receivedValue, expectedType)) {
                return {
                    status: false,
                    message: `Invalid type for param "${columnName}". Expected: ${expectedType}. Received: ${receivedValue}`
                };
            }

            const callbackResult = this.modelCallback[columnName](receivedValue);

            if (typeof callbackResult !== "boolean") {
                return {
                    status: false,
                    message: `Validation callback for param "${columnName}" must return a boolean.`
                };
            }

            if (!callbackResult) {
                return {
                    status: false,
                    message: `Validation failed for param "${columnName}" with value "${receivedValue}".`
                };
            }
        }

        return {
            status: true,
            message: "Validation successful."
        };
    }
}

module.exports = Validator;
