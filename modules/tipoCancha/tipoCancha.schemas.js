const { z } = require("zod");

const idParamsSchema = z.strictObject({
    id: z.coerce.number().int("id debe ser entero").positive("id debe ser positivo"),
});

const listQuerySchema = z.strictObject({
    offset: z.coerce.number().int("offset debe ser entero").min(0, "offset no puede ser negativo"),
    limit: z.coerce.number().int("limit debe ser entero").positive("limit debe ser mayor a 0"),
});

const createSchema = z.strictObject({
    nombre: z.string().trim().min(1, "nombre es obligatorio"),
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
