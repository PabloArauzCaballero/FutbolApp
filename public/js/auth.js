(function () {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const feedback = document.getElementById('auth-feedback');

    function showFeedback(message, type = 'danger') {
        feedback.className = `alert alert-${type}`;
        feedback.textContent = message;
        feedback.classList.remove('d-none');
    }

    function hideFeedback() {
        feedback.classList.add('d-none');
        feedback.textContent = '';
    }

    async function fetchJson(url, options = {}) {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {}),
            },
            credentials: 'same-origin',
            ...options,
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.message || 'Ocurrió un error.');
        }

        return data;
    }

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        hideFeedback();

        const payload = {
            email: loginForm.email.value,
            contrasena: loginForm.contrasena.value,
        };

        try {
            await fetchJson('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify(payload),
            });

            window.location.href = window.__APP_CONFIG__.homePath;
        } catch (error) {
            showFeedback(error.message, 'danger');
        }
    });

    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        hideFeedback();

        const payload = {
            nombre: registerForm.nombre.value,
            email: registerForm.email.value,
            contrasena: registerForm.contrasena.value,
            rol: registerForm.rol.value,
        };

        try {
            await fetchJson('/api/auth/register', {
                method: 'POST',
                body: JSON.stringify(payload),
            });

            showFeedback('Usuario registrado correctamente. Ya puedes iniciar sesión.', 'success');
            registerForm.reset();
        } catch (error) {
            showFeedback(error.message, 'danger');
        }
    });
})();
