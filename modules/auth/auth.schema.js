const { z } = require("zod");

const loginSchema = z.strictObject({
    email: z.string().trim().min(1, "email vacío").email("Formato inválido"),
    contrasena: z
        .string()
        .trim()
        .min(6, "contraseña muy corta")
        .regex(
            /^[a-zA-Z0-9@._-]+$/,
            "Solo se permiten letras, números y los símbolos: @ . _ -"
        ),
});

module.exports = {
    loginSchema,
};
