/**
 * Validaciones básicas de formularios
 * EJS Puro - No es una SPA, solo validaciones antes de submit
 */

// Confirmar eliminaciones
function confirmarEliminacion(event) {
    if (!confirm('¿Estás seguro de eliminar este registro? Esta acción no se puede deshacer.')) {
        event.preventDefault();
        return false;
    }
    return true;
}

// Validar contraseñas en formularios de usuario
function validarFormularioUsuario(form) {
    const contrasena = form.querySelector('[name="contrasena"]');
    const isEdit = form.querySelector('[name="_method"]')?.value === 'PUT' || 
                   form.action.includes('/editar');
    
    // En edición, la contraseña puede estar vacía (no se cambia)
    if (isEdit && !contrasena?.value) {
        return true;
    }
    
    // En creación, validar que tenga al menos 6 caracteres
    if (contrasena && contrasena.value.length < 6) {
        alert('La contraseña debe tener al menos 6 caracteres');
        return false;
    }
    
    return true;
}

// Auto-ocultar mensajes flash después de 5 segundos
document.addEventListener('DOMContentLoaded', function() {
    const flashes = document.querySelectorAll('.flash');
    flashes.forEach(function(flash) {
        setTimeout(function() {
            flash.style.opacity = '0';
            flash.style.transition = 'opacity 0.5s';
            setTimeout(function() {
                flash.style.display = 'none';
            }, 500);
        }, 5000);
    });
    
    // Confirmar todos los links de eliminación
    const deleteLinks = document.querySelectorAll('a[href*="/eliminar"]');
    deleteLinks.forEach(function(link) {
        link.addEventListener('click', confirmarEliminacion);
    });
});
