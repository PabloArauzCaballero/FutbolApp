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
    tipo_id: z.coerce.number().int("tipo_id debe ser entero").positive("tipo_id debe ser positivo"),
    precio_por_hora: z.coerce.number().positive("precio_por_hora debe ser mayor a 0"),
    estado: z
        .string()
        .trim()
        .transform((value) => value.toLowerCase())
        .refine((value) => value === "activa" || value === "inactiva", {
            message: "estado debe ser 'activa' o 'inactiva'",
        })
        .transform((value) => value.charAt(0).toUpperCase() + value.slice(1)),
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
