const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const os = require('os');
const { LoggerError } = require('./errors');

const LEVEL_WEIGHTS = Object.freeze({
  debug: 10,
  log: 20,
  info: 30,
  warn: 40,
  error: 50,
  silent: 99,
});

class Logger {
  static VALID_TYPES = Object.freeze([
    'string',
    'boolean',
    'number',
    'integer',
    'object',
    'array',
    'timestamp',
    'any',
  ]);

  #writeChain = Promise.resolve();

  constructor(moduleName, filePath = null, columnsModel = {}, options = {}) {
    const normalized = this.#validateConstructorEntries(moduleName, filePath, columnsModel, options);

    this.moduleName = normalized.moduleName;
    this.columnsModel = Object.freeze({ ...normalized.columnsModel });
    this.options = normalized.options;
    this.logsDir = this.options.logsDir;
    this.filePath = normalized.filePath;
    this.hostname = this.options.includeHostname ? os.hostname() : undefined;

    this.#ensureLogFileExistsSync();
  }

  debug(payload = {}) {
    return this.#write('debug', payload);
  }

  log(payload = {}) {
    return this.#write('log', payload);
  }

  info(payload = {}) {
    return this.#write('info', payload);
  }

  warn(payload = {}) {
    return this.#write('warn', payload);
  }

  error(payload = {}) {
    return this.#write('error', payload);
  }

  flush() {
    return this.#writeChain;
  }

  close() {
    return this.flush();
  }

  child(bindings = {}) {
    this.#assertPlainObject(bindings, 'bindings', { allowEmpty: true });

    const parent = this;
    return Object.freeze({
      debug(payload = {}) {
        return parent.debug({ ...bindings, ...payload });
      },
      log(payload = {}) {
        return parent.log({ ...bindings, ...payload });
      },
      info(payload = {}) {
        return parent.info({ ...bindings, ...payload });
      },
      warn(payload = {}) {
        return parent.warn({ ...bindings, ...payload });
      },
      error(payload = {}) {
        return parent.error({ ...bindings, ...payload });
      },
      flush() {
        return parent.flush();
      },
      close() {
        return parent.close();
      },
    });
  }

  #validateConstructorEntries(moduleName, filePath, columnsModel, options) {
    this.#assertString(moduleName, 'moduleName');

    if (filePath !== null && filePath !== undefined) {
      this.#assertString(filePath, 'filePath');
    }

    this.#assertPlainObject(columnsModel, 'columnsModel', { allowEmpty: true });
    this.#validateColumnTypes(columnsModel);

    this.#assertPlainObject(options, 'options', { allowEmpty: true });
    const normalizedOptions = this.#normalizeOptions(options);

    const resolvedFilePath = filePath
      ? path.resolve(filePath.trim())
      : path.join(normalizedOptions.logsDir, `${moduleName.trim()}.jsonl`);

    return {
      moduleName: moduleName.trim(),
      filePath: resolvedFilePath,
      columnsModel,
      options: normalizedOptions,
    };
  }

  #normalizeOptions(options) {
    const defaults = {
      logsDir: path.join(process.cwd(), 'logs'),
      minLevel: 'debug',
      includePid: true,
      includeHostname: true,
      defaultRedactKeys: [
        'password',
        'pass',
        'token',
        'authorization',
        'secret',
        'apikey',
        'apiKey',
        'accessToken',
        'refreshToken',
        'clientSecret',
      ],
      redactPaths: [],
      rotation: {
        maxBytes: 5 * 1024 * 1024,
        maxFiles: 5,
      },
    };

    const minLevel = options.minLevel ?? defaults.minLevel;
    if (!Object.prototype.hasOwnProperty.call(LEVEL_WEIGHTS, minLevel)) {
      throw new LoggerError(
        `Invalid minLevel "${minLevel}". Allowed values: ${Object.keys(LEVEL_WEIGHTS).join(', ')}.`,
        'INVALID_MIN_LEVEL',
      );
    }

    const rawLogsDir = options.logsDir ?? defaults.logsDir;
    if (typeof rawLogsDir !== 'string' || rawLogsDir.trim() === '') {
      throw new LoggerError('Invalid logsDir. Expected a non-empty string.', 'INVALID_LOGS_DIR');
    }
    const logsDir = path.resolve(rawLogsDir.trim());

    const includePid = options.includePid ?? defaults.includePid;
    const includeHostname = options.includeHostname ?? defaults.includeHostname;

    if (typeof includePid !== 'boolean' || typeof includeHostname !== 'boolean') {
      throw new LoggerError('includePid and includeHostname must be boolean values.', 'INVALID_BOOLEAN_OPTION');
    }

    const normalizedDefaultRedactKeys = this.#normalizeStringArray(
      options.defaultRedactKeys ?? defaults.defaultRedactKeys,
      'defaultRedactKeys',
    );
    const normalizedRedactPaths = this.#normalizeStringArray(options.redactPaths ?? defaults.redactPaths, 'redactPaths');

    const inputRotation = options.rotation ?? defaults.rotation;
    this.#assertPlainObject(inputRotation, 'rotation', { allowEmpty: true });
    const maxBytes = inputRotation.maxBytes ?? defaults.rotation.maxBytes;
    const maxFiles = inputRotation.maxFiles ?? defaults.rotation.maxFiles;

    if (!Number.isInteger(maxBytes) || maxBytes < 0) {
      throw new LoggerError('rotation.maxBytes must be an integer greater than or equal to 0.', 'INVALID_ROTATION_MAX_BYTES');
    }

    if (!Number.isInteger(maxFiles) || maxFiles < 1) {
      throw new LoggerError('rotation.maxFiles must be an integer greater than or equal to 1.', 'INVALID_ROTATION_MAX_FILES');
    }

    return Object.freeze({
      logsDir,
      minLevel,
      includePid,
      includeHostname,
      defaultRedactKeys: normalizedDefaultRedactKeys,
      redactPaths: normalizedRedactPaths,
      rotation: Object.freeze({
        maxBytes,
        maxFiles,
      }),
    });
  }

  #normalizeStringArray(input, fieldName) {
    if (!Array.isArray(input)) {
      throw new LoggerError(`${fieldName} must be an array of strings.`, 'INVALID_STRING_ARRAY');
    }

    return Object.freeze(
      input.map((item, index) => {
        if (typeof item !== 'string' || item.trim() === '') {
          throw new LoggerError(
            `${fieldName}[${index}] must be a non-empty string.`,
            'INVALID_STRING_ARRAY_ITEM',
          );
        }

        return item.trim();
      }),
    );
  }

  #assertPlainObject(value, fieldName, { allowEmpty = false } = {}) {
    const isPlainObject = value !== null && typeof value === 'object' && !Array.isArray(value);
    if (!isPlainObject) {
      throw new LoggerError(`Invalid entry for ${fieldName}. Expected a plain object.`, 'INVALID_OBJECT', { fieldName });
    }

    if (!allowEmpty && Object.keys(value).length === 0) {
      throw new LoggerError(`Invalid entry for ${fieldName}. Object cannot be empty.`, 'EMPTY_OBJECT', { fieldName });
    }
  }

  #assertString(value, fieldName) {
    if (typeof value !== 'string' || value.trim() === '') {
      throw new LoggerError(`Invalid entry for ${fieldName}. Expected a non-empty string.`, 'INVALID_STRING', { fieldName });
    }
  }

  #validateColumnTypes(columnsModel) {
    const invalidEntry = Object.entries(columnsModel).find(([, dataType]) => !Logger.VALID_TYPES.includes(dataType));

    if (invalidEntry) {
      const [columnName, dataType] = invalidEntry;
      throw new LoggerError(
        `Invalid dataType for columnsModel.${columnName}. Received "${dataType}". Allowed types: ${Logger.VALID_TYPES.join(', ')}.`,
        'INVALID_COLUMN_TYPE',
        { columnName, dataType },
      );
    }
  }

  #isValidTimestamp(value) {
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      return true;
    }

    if (typeof value === 'string') {
      const parsedValue = Date.parse(value);
      return !Number.isNaN(parsedValue);
    }

    return false;
  }

  #matchesExpectedType(value, expectedType) {
    switch (expectedType) {
      case 'string':
        return typeof value === 'string';
      case 'boolean':
        return typeof value === 'boolean';
      case 'number':
        return typeof value === 'number' && Number.isFinite(value);
      case 'integer':
        return Number.isInteger(value);
      case 'object':
        return value !== null && typeof value === 'object' && !Array.isArray(value);
      case 'array':
        return Array.isArray(value);
      case 'timestamp':
        return this.#isValidTimestamp(value);
      case 'any':
        return true;
      default:
        return false;
    }
  }

  #validatePayload(payload) {
    this.#assertPlainObject(payload, 'payload', { allowEmpty: true });

    for (const [fieldName, value] of Object.entries(payload)) {
      if (!Object.prototype.hasOwnProperty.call(this.columnsModel, fieldName)) {
        throw new LoggerError(`Unexpected field "${fieldName}" in payload.`, 'UNKNOWN_FIELD', { fieldName });
      }

      const expectedType = this.columnsModel[fieldName];
      if (!this.#matchesExpectedType(value, expectedType)) {
        const receivedType = Array.isArray(value)
          ? 'array'
          : value instanceof Date
            ? 'date'
            : typeof value;
        throw new LoggerError(
          `Invalid type for field "${fieldName}". Expected "${expectedType}" but received "${receivedType}".`,
          'INVALID_FIELD_TYPE',
          { fieldName, expectedType, receivedType },
        );
      }
    }
  }

  #ensureLogFileExistsSync() {
    const targetDir = path.dirname(this.filePath);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, '', 'utf8');
    }
  }

  #shouldWrite(level) {
    return LEVEL_WEIGHTS[level] >= LEVEL_WEIGHTS[this.options.minLevel];
  }

  #generateLogId() {
    return crypto.randomUUID();
  }

  #getCurrentTimestamp() {
    return new Date().toISOString();
  }

  #shouldRedact(pathKey, propertyName) {
    const normalizedPath = pathKey.toLowerCase();
    const normalizedProperty = propertyName.toLowerCase();

    return this.options.redactPaths.some((item) => item.toLowerCase() === normalizedPath)
      || this.options.defaultRedactKeys.some((item) => item.toLowerCase() === normalizedProperty);
  }

  #serializeValue(value, currentPath = '', seen = new WeakSet(), depth = 0) {
    if (value === undefined) {
      return undefined;
    }

    if (value === null) {
      return null;
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    if (value instanceof Error) {
      return {
        name: value.name,
        message: value.message,
        code: value.code ?? null,
        stack: value.stack ?? null,
        cause: value.cause ? this.#serializeValue(value.cause, `${currentPath}.cause`, seen, depth + 1) : null,
      };
    }

    if (typeof value === 'bigint') {
      return value.toString();
    }

    if (Buffer.isBuffer(value)) {
      return {
        type: 'Buffer',
        base64: value.toString('base64'),
      };
    }

    if (typeof value === 'function' || typeof value === 'symbol') {
      return String(value);
    }

    if (Array.isArray(value)) {
      return value.map((item, index) => {
        const serializedItem = this.#serializeValue(item, `${currentPath}[${index}]`, seen, depth + 1);
        return serializedItem === undefined ? null : serializedItem;
      });
    }

    if (typeof value === 'object') {
      if (seen.has(value)) {
        return '[Circular]';
      }

      if (depth > 8) {
        return '[MaxDepthExceeded]';
      }

      seen.add(value);
      const output = {};

      for (const [key, nestedValue] of Object.entries(value)) {
        const nextPath = currentPath ? `${currentPath}.${key}` : key;
        if (this.#shouldRedact(nextPath, key)) {
          output[key] = '[REDACTED]';
          continue;
        }

        const serializedValue = this.#serializeValue(nestedValue, nextPath, seen, depth + 1);
        if (serializedValue !== undefined) {
          output[key] = serializedValue;
        }
      }

      seen.delete(value);
      return output;
    }

    return value;
  }

  #normalizePayload(payload) {
    return this.#serializeValue(payload) ?? {};
  }

  #buildLogEntry(level, payload) {
    this.#validatePayload(payload);

    const logEntry = {
      id: this.#generateLogId(),
      timestamp: this.#getCurrentTimestamp(),
      moduleName: this.moduleName,
      level,
      ...this.#normalizePayload(payload),
    };

    if (this.options.includePid) {
      logEntry.pid = process.pid;
    }

    if (this.options.includeHostname) {
      logEntry.hostname = this.hostname;
    }

    return logEntry;
  }

  async #rotateIfNeeded(nextLine) {
    const { maxBytes, maxFiles } = this.options.rotation;
    if (maxBytes === 0) {
      return;
    }

    let stats;
    try {
      stats = await fs.promises.stat(this.filePath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        await fs.promises.mkdir(path.dirname(this.filePath), { recursive: true });
        await fs.promises.writeFile(this.filePath, '', 'utf8');
        return;
      }
      throw error;
    }

    const nextBytes = Buffer.byteLength(nextLine, 'utf8');
    if (stats.size + nextBytes <= maxBytes) {
      return;
    }

    const oldestFile = `${this.filePath}.${maxFiles}`;
    await fs.promises.rm(oldestFile, { force: true });

    for (let index = maxFiles - 1; index >= 1; index -= 1) {
      const source = `${this.filePath}.${index}`;
      const destination = `${this.filePath}.${index + 1}`;
      try {
        await fs.promises.rename(source, destination);
      } catch (error) {
        if (error.code !== 'ENOENT') {
          throw error;
        }
      }
    }

    if (stats.size > 0) {
      await fs.promises.rename(this.filePath, `${this.filePath}.1`);
    } else {
      await fs.promises.rm(this.filePath, { force: true });
    }

    await fs.promises.writeFile(this.filePath, '', 'utf8');
  }

  async #write(level, payload) {
    if (!this.#shouldWrite(level)) {
      return null;
    }

    const logEntry = this.#buildLogEntry(level, payload);
    const line = `${JSON.stringify(logEntry)}\n`;

    const currentWrite = this.#writeChain
      .catch(() => undefined)
      .then(async () => {
        await this.#rotateIfNeeded(line);
        await fs.promises.appendFile(this.filePath, line, 'utf8');
        return logEntry;
      });

    this.#writeChain = currentWrite.catch(() => undefined);
    return currentWrite;
  }
}

module.exports = {
  Logger,
  LEVEL_WEIGHTS,
};
