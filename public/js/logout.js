(function () {
    document.addEventListener('click', async (event) => {
        const button = event.target.closest('[data-action="logout"]');
        if (!button) {
            return;
        }

        event.preventDefault();

        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'same-origin',
            });
        } finally {
            window.location.href = '/login';
        }
    });
})();
