class Normalizer {
    #VALID_TYPES = ["string", "number", "object", "date", "boolean"];

    #isValidString(value) {
        return typeof value === "string" && value.trim() !== "";
    }

    #isValidNumber(value) {
        return typeof value === "number" && Number.isFinite(value);
    }

    #isPlainObject(value) {
        return value !== null && typeof value === "object" && !Array.isArray(value);
    }

    #isNonEmptyPlainObject(value) {
        return this.#isPlainObject(value) && Object.keys(value).length > 0;
    }

    #isValidDateInput(value) {
        if (value instanceof Date) {
            return !Number.isNaN(value.getTime());
        }

        if (typeof value === "string") {
            const trimmedValue = value.trim();

            if (trimmedValue === "") {
                return false;
            }

            const parsedDate = new Date(trimmedValue);
            return !Number.isNaN(parsedDate.getTime());
        }

        return false;
    }

    #isValidNormalizedDate(value) {
        return value instanceof Date && !Number.isNaN(value.getTime());
    }

    #isValidBoolean(value) {
        return typeof value === "boolean";
    }

    #isValidCallback(callback) {
        return typeof callback === "function";
    }

    #validateConstructorParams(normalizerName, modelObject, modelCallback) {
        if (!this.#isValidString(normalizerName)) {
            throw new Error(
                "Error: invalid input for normalizerName. Expected a non-empty string."
            );
        }

        if (!this.#isNonEmptyPlainObject(modelObject)) {
            throw new Error(
                "Error: invalid input for modelObject. Expected a non-empty plain object."
            );
        }

        if (modelCallback !== undefined && !this.#isPlainObject(modelCallback)) {
            throw new Error(
                "Error: invalid input for modelCallback. Expected a plain object."
            );
        }

        if (
            modelCallback !== undefined &&
            !Object.values(modelCallback).every((callback) => this.#isValidCallback(callback))
        ) {
            throw new Error(
                "Error: invalid input for modelCallback. All provided callbacks must be valid functions."
            );
        }

        const modelObjectFields = Object.keys(modelObject);
        const modelCallbackFields = Object.keys(modelCallback || {});

        for (const column of modelCallbackFields) {
            if (!modelObjectFields.includes(column)) {
                throw new Error(
                    `Error: unexpected callback for field "${column}" in modelCallback.`
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

    #shouldRemoveValue(value) {
        if (value === null || value === undefined) {
            return true;
        }

        if (Array.isArray(value) && value.length === 0) {
            return true;
        }

        if (this.#isPlainObject(value) && Object.keys(value).length === 0) {
            return true;
        }

        return false;
    }

    #normalizeUnknownValue(value) {
        if (value === null || value === undefined) {
            return undefined;
        }

        if (typeof value === "string") {
            return value.trim();
        }

        if (typeof value === "number") {
            return Number.isFinite(value) ? value : undefined;
        }

        if (typeof value === "boolean") {
            return value;
        }

        if (value instanceof Date) {
            return this.#isValidNormalizedDate(value)
                ? new Date(value.getTime())
                : undefined;
        }

        if (Array.isArray(value)) {
            return this.#normalizeArray(value);
        }

        if (this.#isPlainObject(value)) {
            return this.#normalizeLooseObject(value);
        }

        return value;
    }

    #normalizeArray(arrayValue) {
        const normalizedArray = [];

        for (const item of arrayValue) {
            const normalizedItem = this.#normalizeUnknownValue(item);

            if (this.#shouldRemoveValue(normalizedItem)) {
                continue;
            }

            normalizedArray.push(normalizedItem);
        }

        return normalizedArray;
    }

    #normalizeLooseObject(objectValue) {
        const normalizedObject = {};

        for (const [key, rawValue] of Object.entries(objectValue)) {
            const normalizedValue = this.#normalizeUnknownValue(rawValue);

            if (this.#shouldRemoveValue(normalizedValue)) {
                continue;
            }

            normalizedObject[key] = normalizedValue;
        }

        return normalizedObject;
    }

    #normalizeString(value) {
        if (typeof value !== "string") {
            return {
                status: false,
                message: `Expected a string. Received: ${value}`
            };
        }

        return {
            status: true,
            value: value.trim()
        };
    }

    #normalizeNumber(value) {
        if (this.#isValidNumber(value)) {
            return {
                status: true,
                value
            };
        }

        if (typeof value === "string") {
            const trimmedValue = value.trim();

            if (trimmedValue === "") {
                return {
                    status: false,
                    message: `Expected a finite number. Received: ${value}`
                };
            }

            const numericPattern = /^[-+]?\d+(?:\.\d+)?$/;

            if (!numericPattern.test(trimmedValue)) {
                return {
                    status: false,
                    message: `Expected a finite number. Received: ${value}`
                };
            }

            const parsedValue = Number(trimmedValue);

            if (!Number.isFinite(parsedValue)) {
                return {
                    status: false,
                    message: `Expected a finite number. Received: ${value}`
                };
            }

            return {
                status: true,
                value: parsedValue
            };
        }

        return {
            status: false,
            message: `Expected a finite number. Received: ${value}`
        };
    }

    #normalizeBoolean(value) {
        if (!this.#isValidBoolean(value)) {
            return {
                status: false,
                message: `Expected a boolean. Received: ${value}`
            };
        }

        return {
            status: true,
            value
        };
    }

    #normalizeDate(value) {
        if (!this.#isValidDateInput(value)) {
            return {
                status: false,
                message: `Expected a valid date input. Received: ${value}`
            };
        }

        const normalizedValue =
            value instanceof Date
                ? new Date(value.getTime())
                : new Date(value.trim());

        return {
            status: true,
            value: normalizedValue
        };
    }

    #normalizeObject(value) {
        if (!this.#isPlainObject(value)) {
            return {
                status: false,
                message: `Expected a plain object. Received: ${value}`
            };
        }

        return {
            status: true,
            value: this.#normalizeLooseObject(value)
        };
    }

    #normalizeType(fieldValue, expectedType) {
        switch (expectedType) {
            case "string":
                return this.#normalizeString(fieldValue);

            case "number":
                return this.#normalizeNumber(fieldValue);

            case "object":
                return this.#normalizeObject(fieldValue);

            case "date":
                return this.#normalizeDate(fieldValue);

            case "boolean":
                return this.#normalizeBoolean(fieldValue);

            default:
                return {
                    status: false,
                    message: `Unsupported type: ${expectedType}`
                };
        }
    }

    #isCompatibleFinalValue(value, expectedType) {
        switch (expectedType) {
            case "string":
                return typeof value === "string";

            case "number":
                return this.#isValidNumber(value);

            case "object":
                return this.#isPlainObject(value);

            case "date":
                return this.#isValidNormalizedDate(value);

            case "boolean":
                return this.#isValidBoolean(value);

            default:
                return false;
        }
    }

    constructor(normalizerName, modelObject, modelCallback = {}) {
        this.#validateConstructorParams(normalizerName, modelObject, modelCallback);

        this.normalizerName = normalizerName;
        this.modelObject = Object.freeze({ ...modelObject });
        this.modelCallback = Object.freeze({ ...modelCallback });
    }

    normalizeInput(payload) {
        if (!this.#isPlainObject(payload)) {
            return {
                status: false,
                message: "Invalid input: payload must be a plain object."
            };
        }

        const normalizedPayload = {};

        for (const columnName of Object.keys(this.modelObject)) {
            if (!Object.prototype.hasOwnProperty.call(payload, columnName)) {
                continue;
            }

            const rawValue = payload[columnName];
            const expectedType = this.modelObject[columnName];

            const normalizedByTypeResult = this.#normalizeType(rawValue, expectedType);

            if (!normalizedByTypeResult.status) {
                return {
                    status: false,
                    message: `Normalization failed for param "${columnName}". ${normalizedByTypeResult.message}`
                };
            }

            const hasCustomCallback = Object.prototype.hasOwnProperty.call(
                this.modelCallback,
                columnName
            );

            const finalValue = hasCustomCallback
                ? this.modelCallback[columnName](rawValue, normalizedByTypeResult.value)
                : normalizedByTypeResult.value;

            if (finalValue === undefined) {
                return {
                    status: false,
                    message: `Normalization result for param "${columnName}" returned undefined.`
                };
            }

            if (!this.#isCompatibleFinalValue(finalValue, expectedType)) {
                return {
                    status: false,
                    message: `Normalization result for param "${columnName}" returned an incompatible value for expected type "${expectedType}".`
                };
            }

            normalizedPayload[columnName] = finalValue;
        }

        return {
            status: true,
            message: "Normalization successful.",
            data: normalizedPayload
        };
    }
}

module.exports = Normalizer;
