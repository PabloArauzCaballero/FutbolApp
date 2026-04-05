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
    email: z.string().trim().email("email inválido"),
    contrasena: z.string().trim().min(6, "contrasena debe tener al menos 6 caracteres"),
    rol: z
        .string()
        .trim()
        .transform((value) => value.toLowerCase())
        .refine((value) => value === "admin" || value === "cliente", {
            message: "rol debe ser 'admin' o 'cliente'",
        }),
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
