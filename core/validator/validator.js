class Validator {
    #VALID_TYPES = ['string', 'number', 'object', 'date', 'boolean', 'array', 'time'];
    #UNKNOWN_FIELD_POLICIES = ['reject', 'strip', 'allow'];

    #isNonEmptyString(value) {
        return typeof value === 'string' && value.trim() !== '';
    }

    #isPlainObject(value) {
        return value !== null && typeof value === 'object' && !Array.isArray(value);
    }

    #isFiniteNumber(value) {
        return typeof value === 'number' && Number.isFinite(value);
    }

    #isValidDateObject(value) {
        return value instanceof Date && !Number.isNaN(value.getTime());
    }

    #isValidTimeString(value) {
        return typeof value === 'string' && /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))$/.test(value.trim());
    }

    #validateDateOnlyString(value) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            return false;
        }

        const [year, month, day] = value.split('-').map(Number);
        const date = new Date(Date.UTC(year, month - 1, day));

        return (
            date.getUTCFullYear() === year &&
            date.getUTCMonth() === month - 1 &&
            date.getUTCDate() === day
        );
    }

    #validateIsoDateTimeString(value) {
        const isoDateTimePattern =
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/;

        if (!isoDateTimePattern.test(value)) {
            return false;
        }

        return this.#isValidDateObject(new Date(value));
    }

    #buildError(message, code = 'VALIDATION_ERROR', field = null, details = null) {
        const error = { code, message };

        if (field !== null) {
            error.field = field;
        }

        if (details !== null) {
            error.details = details;
        }

        return error;
    }

    #isValidCallback(callback) {
        return typeof callback === 'function';
    }

    #validateConstructorParams(validatorName, modelObject, modelCallback, options) {
        if (!this.#isNonEmptyString(validatorName)) {
            throw new Error('Error: invalid input for validatorName. Expected a non-empty string.');
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
    }

    #validateType(fieldValue, expectedType) {
        switch (expectedType) {
            case 'string':
                return typeof fieldValue === 'string';
            case 'number':
                return this.#isFiniteNumber(fieldValue);
            case 'object':
                return this.#isPlainObject(fieldValue);
            case 'date':
                return (
                    this.#isValidDateObject(fieldValue) ||
                    (typeof fieldValue === 'string' &&
                        (this.#validateDateOnlyString(fieldValue.trim()) ||
                            this.#validateIsoDateTimeString(fieldValue.trim())))
                );
            case 'boolean':
                return typeof fieldValue === 'boolean';
            case 'array':
                return Array.isArray(fieldValue);
            case 'time':
                return this.#isValidTimeString(fieldValue);
            default:
                return false;
        }
    }

    #runCallback(fieldName, callback, receivedValue) {
        try {
            const callbackResult = callback(receivedValue, {
                fieldName,
                expectedType: this.modelObject[fieldName],
                validatorName: this.validatorName,
                options: this.options,
            });

            if (typeof callbackResult === 'boolean') {
                return callbackResult
                    ? { ok: true }
                    : {
                        ok: false,
                        message: `Validation failed for param "${fieldName}" with value "${receivedValue}".`,
                        code: 'CALLBACK_VALIDATION_FAILED',
                    };
            }

            if (this.#isPlainObject(callbackResult) && typeof callbackResult.ok === 'boolean') {
                return {
                    ok: callbackResult.ok,
                    message:
                        callbackResult.message ||
                        (callbackResult.ok
                            ? null
                            : `Validation failed for param "${fieldName}" with value "${receivedValue}".`),
                    code: callbackResult.code || 'CALLBACK_VALIDATION_RESULT',
                };
            }

            return {
                ok: false,
                message: `Validation callback for param "${fieldName}" must return a boolean or an object with shape { ok, message?, code? }.` ,
                code: 'INVALID_CALLBACK_RETURN',
            };
        } catch (error) {
            return {
                ok: false,
                message: `Validation callback for param "${fieldName}" threw an error: ${error.message}`,
                code: 'CALLBACK_ERROR',
            };
        }
    }

    constructor(validatorName, modelObject, modelCallback = {}, options = {}) {
        this.#validateConstructorParams(validatorName, modelObject, modelCallback, options);

        this.validatorName = validatorName;
        this.modelObject = Object.freeze({ ...modelObject });
        this.modelCallback = Object.freeze({ ...modelCallback });
        this.options = Object.freeze({
            allowPartial: Boolean(options.allowPartial),
            allowEmptyPayload:
                options.allowEmptyPayload !== undefined
                    ? Boolean(options.allowEmptyPayload)
                    : Boolean(options.allowPartial),
            unknownFieldsPolicy: options.unknownFieldsPolicy ?? 'reject',
            stopAtFirstError: options.stopAtFirstError !== false,
        });
    }

    validateInput(payload) {
        if (!this.#isPlainObject(payload)) {
            return {
                status: false,
                message: 'Invalid input: payload must be a plain object.',
                errors: [this.#buildError('Payload must be a plain object.', 'INVALID_PAYLOAD')],
            };
        }

        const payloadKeys = Object.keys(payload);

        if (!this.options.allowEmptyPayload && payloadKeys.length === 0) {
            return {
                status: false,
                message: 'Invalid input: payload must not be empty.',
                errors: [this.#buildError('Payload must not be empty.', 'EMPTY_PAYLOAD')],
            };
        }

        const modelKeys = Object.keys(this.modelObject);
        const errors = [];

        for (const columnName of payloadKeys) {
            const isKnownField = modelKeys.includes(columnName);

            if (isKnownField) {
                continue;
            }

            if (this.options.unknownFieldsPolicy === 'strip' || this.options.unknownFieldsPolicy === 'allow') {
                continue;
            }

            errors.push(
                this.#buildError(
                    `Unexpected param: ${columnName}. Expected params: ${modelKeys.join(', ')}`,
                    'UNKNOWN_FIELD',
                    columnName
                )
            );

            if (this.options.stopAtFirstError) {
                return {
                    status: false,
                    message: errors[0].message,
                    errors,
                };
            }
        }

        for (const columnName of modelKeys) {
            const columnIsPresent = Object.prototype.hasOwnProperty.call(payload, columnName);

            if (!columnIsPresent) {
                if (this.options.allowPartial) {
                    continue;
                }

                errors.push(
                    this.#buildError(
                        `Missing required param: ${columnName}.`,
                        'MISSING_REQUIRED_FIELD',
                        columnName
                    )
                );

                if (this.options.stopAtFirstError) {
                    return {
                        status: false,
                        message: errors[0].message,
                        errors,
                    };
                }

                continue;
            }

            const expectedType = this.modelObject[columnName];
            const receivedValue = payload[columnName];

            if (!this.#validateType(receivedValue, expectedType)) {
                errors.push(
                    this.#buildError(
                        `Invalid type for param "${columnName}". Expected: ${expectedType}.`,
                        'INVALID_TYPE',
                        columnName,
                        { receivedValue }
                    )
                );

                if (this.options.stopAtFirstError) {
                    return {
                        status: false,
                        message: errors[0].message,
                        errors,
                    };
                }

                continue;
            }

            if (!Object.prototype.hasOwnProperty.call(this.modelCallback, columnName)) {
                continue;
            }

            const callbackResult = this.#runCallback(columnName, this.modelCallback[columnName], receivedValue);

            if (!callbackResult.ok) {
                errors.push(
                    this.#buildError(
                        callbackResult.message,
                        callbackResult.code,
                        columnName
                    )
                );

                if (this.options.stopAtFirstError) {
                    return {
                        status: false,
                        message: errors[0].message,
                        errors,
                    };
                }
            }
        }

        if (errors.length > 0) {
            return {
                status: false,
                message: errors[0].message,
                errors,
            };
        }

        return {
            status: true,
            message: 'Validation successful.',
            errors: [],
        };
    }
}

module.exports = Validator;
