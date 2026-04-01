const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

class Logger {
    #VALID_TYPES = ["string", "boolean", "number", "object", "array", "timestamp"];
    #writeChain = Promise.resolve();

    #validatePlainObject(objectInput, fieldName) {
        if (
            objectInput === null ||
            typeof objectInput !== "object" ||
            Array.isArray(objectInput) ||
            Object.keys(objectInput).length === 0
        ) {
            throw new Error(`Invalid entry for ${fieldName}. Received entry: ${objectInput}`);
        }
    }

    #validatePlainString(stringInput, fieldName) {
        if (
            typeof stringInput !== "string" ||
            stringInput.trim() === ""
        ) {
            throw new Error(`Invalid entry for ${fieldName}. Received entry: ${stringInput}`);
        }
    }

    #validateValidTypes(columnsModel) {
        const isValid = Object.keys(columnsModel).every((col) =>
            this.#VALID_TYPES.includes(columnsModel[col])
        );

        if (!isValid) {
            throw new Error(
                `Invalid dataType for input columnsModel (received input: ${JSON.stringify(columnsModel)}). ` +
                `The allowed dataTypes are: ${this.#VALID_TYPES.join(", ")}.`
            );
        }
    }

    #validateConstructorEntries(moduleName, filePath, columnsModel) {
        this.#validatePlainString(moduleName, "moduleName");

        if (filePath !== null && filePath !== undefined) {
            this.#validatePlainString(filePath, "filePath");
        }

        this.#validatePlainObject(columnsModel, "columnsModel");
        this.#validateValidTypes(columnsModel);

        return {
            moduleName: moduleName.trim(),
            filePath: filePath ? filePath.trim() : null,
            columnsModel,
        };
    }

    #generateUniqueId() {
        return crypto.randomUUID();
    }

    #getCurrentTimestamp() {
        return new Date().toISOString();
    }

    #isValidTimestamp(value) {
        if (value instanceof Date && !Number.isNaN(value.getTime())) {
            return true;
        }

        if (typeof value === "string" && !Number.isNaN(Date.parse(value))) {
            return true;
        }

        return false;
    }

    #matchesExpectedType(value, expectedType) {
        switch (expectedType) {
            case "string":
                return typeof value === "string";

            case "boolean":
                return typeof value === "boolean";

            case "number":
                return typeof value === "number" && Number.isFinite(value);

            case "object":
                return (
                    value !== null &&
                    typeof value === "object" &&
                    !Array.isArray(value) &&
                    !(value instanceof Date)
                );

            case "array":
                return Array.isArray(value);

            case "timestamp":
                return this.#isValidTimestamp(value);

            default:
                return false;
        }
    }

    #validateTypes(inputPayload) {
        this.#validatePlainObject(inputPayload, "inputPayload");

        const payloadKeys = Object.keys(inputPayload);

        for (const column of payloadKeys) {
            if (!Object.prototype.hasOwnProperty.call(this.columnsModel, column)) {
                throw new Error(`Unexpected field "${column}" in payload.`);
            }

            const expectedType = this.columnsModel[column];
            const value = inputPayload[column];

            if (!this.#matchesExpectedType(value, expectedType)) {
                throw new Error(
                    `Invalid type for field "${column}". ` +
                    `Expected "${expectedType}" but received "${Array.isArray(value) ? "array" : typeof value}".`
                );
            }
        }

        return true;
    }

    #ensureLogFileExists() {
        const targetDir = path.dirname(this.filePath);

        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        if (!fs.existsSync(this.filePath)) {
            fs.writeFileSync(this.filePath, "", "utf8");
        }
    }

    #normalizePayload(payload) {
        return Object.fromEntries(
            Object.entries(payload).map(([key, value]) => {
                if (value instanceof Date) {
                    return [key, value.toISOString()];
                }
                return [key, value];
            })
        );
    }

    #buildLogEntry(level, payload) {
        this.#validateTypes(payload);

        return {
            idReg: this.#generateUniqueId(),
            currentTimestamp: this.#getCurrentTimestamp(),
            moduleName: this.moduleName,
            level,
            ...this.#normalizePayload(payload),
        };
    }

    async #write(level, payload) {
        const logEntry = this.#buildLogEntry(level, payload);

        const currentWrite = this.#writeChain
            .catch(() => undefined)
            .then(async () => {
                await fs.promises.appendFile(this.filePath, `${JSON.stringify(logEntry)}\n`, "utf8");
                return logEntry;
            });

        this.#writeChain = currentWrite.catch(() => undefined);
        return currentWrite;
    }

    constructor(moduleName, filePath = null, columnsModel = {}) {
        const {
            moduleName: moduleNameVld,
            filePath: filePathVld,
            columnsModel: columnsModelVld,
        } = this.#validateConstructorEntries(moduleName, filePath, columnsModel);

        this.moduleName = moduleNameVld;
        this.columnsModel = columnsModelVld;
        this.logsDir = path.join(process.cwd(), "logs");
        this.filePath = filePathVld ?? path.join(this.logsDir, `${this.moduleName}.jsonl`);

        this.#ensureLogFileExists();
    }

    log(payload) {
        return this.#write("log", payload);
    }

    info(payload){
        return this.#write("info", payload);
    }

    warn(payload) {
        return this.#write("warn", payload);
    }

    error(payload) {
        return this.#write("error", payload);
    }

    flush() {
        return this.#writeChain;
    }
}

module.exports = Logger;
