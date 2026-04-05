const { z } = require("zod");

const booleanLikeSchema = z.preprocess((value) => {
    if (value === "true") return true;
    if (value === "false") return false;
    return value;
}, z.boolean({
    invalid_type_error: "disponible debe ser booleano",
}));

const timeSchema = z
    .string()
    .trim()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, "la hora debe tener formato HH:mm o HH:mm:ss");

const dateSchema = z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "fecha debe tener formato YYYY-MM-DD");

const idParamsSchema = z.strictObject({
    id: z.coerce.number().int("id debe ser entero").positive("id debe ser positivo"),
});

const listQuerySchema = z.strictObject({
    offset: z.coerce.number().int("offset debe ser entero").min(0, "offset no puede ser negativo"),
    limit: z.coerce.number().int("limit debe ser entero").positive("limit debe ser mayor a 0"),
});

const createSchema = z.strictObject({
    cancha_id: z.coerce.number().int("cancha_id debe ser entero").positive("cancha_id debe ser positivo"),
    fecha: dateSchema,
    hora_inicio: timeSchema,
    hora_fin: timeSchema,
    disponible: booleanLikeSchema,
});

const updateSchema = createSchema
    .partial()
    .refine(
        (data) => Object.keys(data).length > 0,
        { message: "Debes enviar al menos un campo para modificar." }
    );

module.exports = {
    createSchema,
    updateSchema,
    idParamsSchema,
    listQuerySchema,
};
