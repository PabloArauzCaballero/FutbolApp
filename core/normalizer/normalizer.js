class Normalizer {
    #VALID_TYPES = ['string', 'number', 'object', 'date', 'boolean', 'array', 'time'];
    #UNKNOWN_FIELD_POLICIES = ['strip', 'reject', 'passthrough'];
    #EMPTY_STRING_POLICIES = ['keep', 'reject', 'remove'];

    #isNonEmptyString(value) {
        return typeof value === 'string' && value.trim() !== '';
    }

    #isPlainObject(value) {
        return value !== null && typeof value === 'object' && !Array.isArray(value);
    }

    #isFiniteNumber(value) {
        return typeof value === 'number' && Number.isFinite(value);
    }

    #isValidBoolean(value) {
        return typeof value === 'boolean';
    }

    #isValidCallback(callback) {
        return typeof callback === 'function';
    }

    #isValidDateObject(value) {
        return value instanceof Date && !Number.isNaN(value.getTime());
    }

    #isValidTimeString(value) {
        if (typeof value !== 'string') {
            return false;
        }

        return /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))$/.test(value);
    }

    #normalizeTimeString(value) {
        if (typeof value !== 'string') {
            return null;
        }

        const trimmedValue = value.trim();

        const hhmmPattern = /^([01]\d|2[0-3]):([0-5]\d)$/;
        const hhmmssPattern = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;

        if (hhmmPattern.test(trimmedValue)) {
            return `${trimmedValue}:00`;
        }

        if (hhmmssPattern.test(trimmedValue)) {
            return trimmedValue;
        }

        return null;
    }

    #validateDateOnlyString(value) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            return null;
        }

        const [year, month, day] = value.split('-').map(Number);
        const date = new Date(Date.UTC(year, month - 1, day));

        if (
            date.getUTCFullYear() !== year ||
            date.getUTCMonth() !== month - 1 ||
            date.getUTCDate() !== day
        ) {
            return null;
        }

        return date;
    }

    #validateIsoDateTimeString(value) {
        const isoDateTimePattern =
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/;

        if (!isoDateTimePattern.test(value)) {
            return null;
        }

        const parsedDate = new Date(value);
        return this.#isValidDateObject(parsedDate) ? parsedDate : null;
    }

    #parseDate(value) {
        if (this.#isValidDateObject(value)) {
            return new Date(value.getTime());
        }

        if (typeof value !== 'string') {
            return null;
        }

        const trimmedValue = value.trim();

        if (trimmedValue === '') {
            return null;
        }

        if (!this.options.strictDateParsing) {
            const parsedDate = new Date(trimmedValue);
            return this.#isValidDateObject(parsedDate) ? parsedDate : null;
        }

        return (
            this.#validateDateOnlyString(trimmedValue) ||
            this.#validateIsoDateTimeString(trimmedValue)
        );
    }

    #normalizeUnknownValue(value) {
        if (value === null || value === undefined) {
            return undefined;
        }

        if (typeof value === 'string') {
            const normalizedString = this.options.trimStrings ? value.trim() : value;

            if (normalizedString === '') {
                if (this.options.emptyStringPolicy === 'remove') {
                    return undefined;
                }

                return normalizedString;
            }

            return normalizedString;
        }

        if (this.#isFiniteNumber(value) || this.#isValidBoolean(value)) {
            return value;
        }

        if (this.#isValidDateObject(value)) {
            return new Date(value.getTime());
        }

        if (Array.isArray(value)) {
            return this.#normalizeArray(value);
        }

        if (this.#isPlainObject(value)) {
            return this.#normalizeLooseObject(value);
        }

        return value;
    }

    #normalizeArray(values) {
        const normalizedArray = [];

        for (const item of values) {
            const normalizedItem = this.#normalizeUnknownValue(item);

            if (normalizedItem === undefined) {
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

            if (normalizedValue === undefined) {
                continue;
            }

            normalizedObject[key] = normalizedValue;
        }

        return normalizedObject;
    }

    #buildError(message, code = 'NORMALIZATION_ERROR', field = null, details = null) {
        const error = { code, message };

        if (field !== null) {
            error.field = field;
        }

        if (details !== null) {
            error.details = details;
        }

        return error;
    }

    #validateConstructorParams(normalizerName, modelObject, modelCallback, options) {
        if (!this.#isNonEmptyString(normalizerName)) {
            throw new Error('Error: invalid input for normalizerName. Expected a non-empty string.');
        }

        if (!this.#isPlainObject(modelObject) || Object.keys(modelObject).length === 0) {
            throw new Error('Error: invalid input for modelObject. Expected a non-empty plain object.');
        }

        if (modelCallback !== undefined && !this.#isPlainObject(modelCallback)) {
            throw new Error('Error: invalid input for modelCallback. Expected a plain object.');
        }

        if (options !== undefined && !this.#isPlainObject(options)) {
            throw new Error('Error: invalid input for options. Expected a plain object.');
        }

        for (const [fieldName, fieldType] of Object.entries(modelObject)) {
            if (!this.#isNonEmptyString(fieldName)) {
                throw new Error(`Error: invalid field name in modelObject. Received: ${fieldName}`);
            }

            if (!this.#isNonEmptyString(fieldType) || !this.#VALID_TYPES.includes(fieldType)) {
                throw new Error(
                    `Error: invalid type for field "${fieldName}". Expected one of: ${this.#VALID_TYPES.join(', ')}. Received: ${fieldType}`
                );
            }
        }

        for (const [fieldName, callback] of Object.entries(modelCallback || {})) {
            if (!Object.prototype.hasOwnProperty.call(modelObject, fieldName)) {
                throw new Error(`Error: unexpected callback for field "${fieldName}" in modelCallback.`);
            }

            if (!this.#isValidCallback(callback)) {
                throw new Error(`Error: invalid callback for field "${fieldName}" in modelCallback.`);
            }
        }

        if (
            options?.unknownFieldsPolicy !== undefined &&
            !this.#UNKNOWN_FIELD_POLICIES.includes(options.unknownFieldsPolicy)
        ) {
            throw new Error(
                `Error: invalid unknownFieldsPolicy. Expected one of: ${this.#UNKNOWN_FIELD_POLICIES.join(', ')}.`
            );
        }

        if (
            options?.emptyStringPolicy !== undefined &&
            !this.#EMPTY_STRING_POLICIES.includes(options.emptyStringPolicy)
        ) {
            throw new Error(
                `Error: invalid emptyStringPolicy. Expected one of: ${this.#EMPTY_STRING_POLICIES.join(', ')}.`
            );
        }
    }

    #normalizeString(value) {
        if (typeof value !== 'string') {
            return { ok: false, message: `Expected a string. Received: ${typeof value}` };
        }

        const normalizedValue = this.options.trimStrings ? value.trim() : value;

        if (normalizedValue === '') {
            if (this.options.emptyStringPolicy === 'reject') {
                return { ok: false, message: 'Empty strings are not allowed by current policy.' };
            }

            if (this.options.emptyStringPolicy === 'remove') {
                return { ok: true, value: undefined };
            }
        }

        return { ok: true, value: normalizedValue };
    }

    #normalizeNumber(value) {
        if (this.#isFiniteNumber(value)) {
            return { ok: true, value };
        }

        if (typeof value !== 'string') {
            return { ok: false, message: `Expected a finite number. Received: ${typeof value}` };
        }

        const trimmedValue = value.trim();
        const numericPattern = /^[-+]?\d+(?:\.\d+)?$/;

        if (!numericPattern.test(trimmedValue)) {
            return { ok: false, message: `Expected a finite number. Received: ${value}` };
        }

        const parsedValue = Number(trimmedValue);

        if (!Number.isFinite(parsedValue)) {
            return { ok: false, message: `Expected a finite number. Received: ${value}` };
        }

        return { ok: true, value: parsedValue };
    }

    #normalizeBoolean(value) {
        if (this.#isValidBoolean(value)) {
            return { ok: true, value };
        }

        if (typeof value !== 'string' || !this.options.coerceBooleanStrings) {
            return { ok: false, message: `Expected a boolean. Received: ${typeof value}` };
        }

        const normalizedValue = value.trim().toLowerCase();
        const trueSet = new Set(['true', '1', 'yes']);
        const falseSet = new Set(['false', '0', 'no']);

        if (trueSet.has(normalizedValue)) {
            return { ok: true, value: true };
        }

        if (falseSet.has(normalizedValue)) {
            return { ok: true, value: false };
        }

        return { ok: false, message: `Expected a boolean. Received: ${value}` };
    }

    #normalizeDate(value) {
        const parsedDate = this.#parseDate(value);

        if (!parsedDate) {
            return { ok: false, message: `Expected a valid date input. Received: ${value}` };
        }

        return { ok: true, value: parsedDate };
    }

    #normalizeTime(value) {
        const parsedTime = this.#normalizeTimeString(value);

        if (!parsedTime) {
            return { ok: false, message: `Expected a valid time input. Received: ${value}` };
        }

        return { ok: true, value: parsedTime };
    }

    #normalizeObject(value) {
        if (!this.#isPlainObject(value)) {
            return { ok: false, message: `Expected a plain object. Received: ${typeof value}` };
        }

        return { ok: true, value: this.#normalizeLooseObject(value) };
    }

    #normalizeTypedArray(value) {
        if (!Array.isArray(value)) {
            return { ok: false, message: `Expected an array. Received: ${typeof value}` };
        }

        return { ok: true, value: this.#normalizeArray(value) };
    }

    #normalizeType(fieldValue, expectedType) {
        switch (expectedType) {
            case 'string':
                return this.#normalizeString(fieldValue);
            case 'number':
                return this.#normalizeNumber(fieldValue);
            case 'object':
                return this.#normalizeObject(fieldValue);
            case 'date':
                return this.#normalizeDate(fieldValue);
            case 'boolean':
                return this.#normalizeBoolean(fieldValue);
            case 'array':
                return this.#normalizeTypedArray(fieldValue);
            case 'time':
                return this.#normalizeTime(fieldValue);
            default:
                return { ok: false, message: `Unsupported type: ${expectedType}` };
        }
    }

    #isCompatibleFinalValue(value, expectedType) {
        switch (expectedType) {
            case 'string':
                return typeof value === 'string';
            case 'number':
                return this.#isFiniteNumber(value);
            case 'object':
                return this.#isPlainObject(value);
            case 'date':
                return this.#isValidDateObject(value);
            case 'boolean':
                return this.#isValidBoolean(value);
            case 'array':
                return Array.isArray(value);
            case 'time':
                return this.#isValidTimeString(value);
            default:
                return false;
        }
    }

    #applyUnknownFieldPolicy(payload, normalizedPayload, errors) {
        if (this.options.unknownFieldsPolicy === 'strip') {
            return normalizedPayload;
        }

        const resultPayload = { ...normalizedPayload };
        const allowedFields = new Set(Object.keys(this.modelObject));

        for (const [fieldName, rawValue] of Object.entries(payload)) {
            if (allowedFields.has(fieldName)) {
                continue;
            }

            if (this.options.unknownFieldsPolicy === 'reject') {
                errors.push(
                    this.#buildError(
                        `Unexpected param: ${fieldName}.`,
                        'UNKNOWN_FIELD',
                        fieldName
                    )
                );
                continue;
            }

            resultPayload[fieldName] = this.#normalizeUnknownValue(rawValue);
        }

        return resultPayload;
    }

    #invokeCustomCallback(fieldName, callback, rawValue, normalizedValue) {
        try {
            return {
                ok: true,
                value: callback(rawValue, normalizedValue, {
                    fieldName,
                    expectedType: this.modelObject[fieldName],
                    options: this.options,
                    normalizerName: this.normalizerName,
                }),
            };
        } catch (error) {
            return {
                ok: false,
                message: `Normalization callback for param "${fieldName}" threw an error: ${error.message}`,
            };
        }
    }

    constructor(normalizerName, modelObject, modelCallback = {}, options = {}) {
        this.#validateConstructorParams(normalizerName, modelObject, modelCallback, options);

        this.normalizerName = normalizerName;
        this.modelObject = Object.freeze({ ...modelObject });
        this.modelCallback = Object.freeze({ ...modelCallback });
        this.options = Object.freeze({
            unknownFieldsPolicy: options.unknownFieldsPolicy ?? 'strip',
            emptyStringPolicy: options.emptyStringPolicy ?? 'keep',
            trimStrings: options.trimStrings !== false,
            strictDateParsing: options.strictDateParsing !== false,
            coerceBooleanStrings: options.coerceBooleanStrings !== false,
            allowEmptyPayload: Boolean(options.allowEmptyPayload),
        });
    }

    normalizeInput(payload) {
        if (!this.#isPlainObject(payload)) {
            return {
                status: false,
                message: 'Invalid input: payload must be a plain object.',
                data: null,
                errors: [this.#buildError('Payload must be a plain object.', 'INVALID_PAYLOAD')],
            };
        }

        if (!this.options.allowEmptyPayload && Object.keys(payload).length === 0) {
            return {
                status: false,
                message: 'Invalid input: payload must not be empty.',
                data: null,
                errors: [this.#buildError('Payload must not be empty.', 'EMPTY_PAYLOAD')],
            };
        }

        const errors = [];
        let normalizedPayload = {};

        for (const [fieldName, expectedType] of Object.entries(this.modelObject)) {
            if (!Object.prototype.hasOwnProperty.call(payload, fieldName)) {
                continue;
            }

            const rawValue = payload[fieldName];
            const normalizedByTypeResult = this.#normalizeType(rawValue, expectedType);

            if (!normalizedByTypeResult.ok) {
                errors.push(
                    this.#buildError(
                        `Normalization failed for param "${fieldName}". ${normalizedByTypeResult.message}`,
                        'TYPE_NORMALIZATION_FAILED',
                        fieldName
                    )
                );
                continue;
            }

            let finalValue = normalizedByTypeResult.value;

            if (finalValue === undefined) {
                continue;
            }

            if (Object.prototype.hasOwnProperty.call(this.modelCallback, fieldName)) {
                const callbackResult = this.#invokeCustomCallback(
                    fieldName,
                    this.modelCallback[fieldName],
                    rawValue,
                    finalValue
                );

                if (!callbackResult.ok) {
                    errors.push(this.#buildError(callbackResult.message, 'CALLBACK_ERROR', fieldName));
                    continue;
                }

                finalValue = callbackResult.value;
            }

            if (finalValue === undefined) {
                errors.push(
                    this.#buildError(
                        `Normalization result for param "${fieldName}" returned undefined.`,
                        'UNDEFINED_NORMALIZATION_RESULT',
                        fieldName
                    )
                );
                continue;
            }

            if (!this.#isCompatibleFinalValue(finalValue, expectedType)) {
                errors.push(
                    this.#buildError(
                        `Normalization result for param "${fieldName}" returned an incompatible value for expected type "${expectedType}".`,
                        'INCOMPATIBLE_NORMALIZATION_RESULT',
                        fieldName
                    )
                );
                continue;
            }

            normalizedPayload[fieldName] = finalValue;
        }

        normalizedPayload = this.#applyUnknownFieldPolicy(payload, normalizedPayload, errors);

        if (errors.length > 0) {
            return {
                status: false,
                message: errors[0].message,
                data: null,
                errors,
            };
        }

        return {
            status: true,
            message: 'Normalization successful.',
            data: normalizedPayload,
            errors: [],
        };
    }
}

module.exports = Normalizer;
