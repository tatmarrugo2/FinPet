// ===== 1. GUARDAR Y LEER DATOS EN EL NAVEGADOR =====
function guardar(clave, datos) {
    localStorage.setItem(clave, JSON.stringify(datos));
}

function leer(clave, porDefecto) {
    const texto = localStorage.getItem(clave);
    return texto ? JSON.parse(texto) : porDefecto;
}

// ===== 2. ELEMENTOS DE LA PÁGINA =====
const pantallaAcceso = document.getElementById("pantalla-acceso");
const pantallaApp = document.getElementById("pantalla-app");
const formLogin = document.getElementById("form-login");
const formRegistro = document.getElementById("form-registro");

// ===== 3. CAMBIAR ENTRE "INICIAR SESIÓN" Y "CREAR CUENTA" =====
document.getElementById("ir-registro").addEventListener("click", function (e) {
    e.preventDefault();
    formLogin.hidden = true;
    formRegistro.hidden = false;
});

document.getElementById("ir-login").addEventListener("click", function (e) {
    e.preventDefault();
    formRegistro.hidden = true;
    formLogin.hidden = false;
});

// ===== 4. CREAR CUENTA =====
formRegistro.addEventListener("submit", function (e) {
    e.preventDefault(); // evita que la página se recargue

    const nombre = document.getElementById("reg-nombre").value.trim();
    const correo = document.getElementById("reg-correo").value.trim().toLowerCase();
    const clave = document.getElementById("reg-clave").value;
    const error = document.getElementById("registro-error");

    // Validaciones
    if (nombre === "" || correo === "" || clave === "") {
        error.textContent = "Completa todos los campos.";
        return;
    }
    if (clave.length < 6) {
        error.textContent = "La contraseña debe tener mínimo 6 caracteres.";
        return;
    }

    const usuarios = leer("finpet_usuarios", []);
    const yaExiste = usuarios.find(u => u.correo === correo);
    if (yaExiste) {
        error.textContent = "Ya existe una cuenta con ese correo.";
        return;
    }

    // Guardar el usuario nuevo
    usuarios.push({ nombre: nombre, correo: correo, clave: clave });
    guardar("finpet_usuarios", usuarios);

    error.textContent = "";
    iniciarSesion(correo);
});

// ===== 5. INICIAR SESIÓN =====
formLogin.addEventListener("submit", function (e) {
    e.preventDefault();

    const correo = document.getElementById("login-correo").value.trim().toLowerCase();
    const clave = document.getElementById("login-clave").value;
    const error = document.getElementById("login-error");

    const usuarios = leer("finpet_usuarios", []);
    const usuario = usuarios.find(u => u.correo === correo && u.clave === clave);

    if (!usuario) {
        error.textContent = "Correo o contraseña incorrectos.";
        return;
    }

    error.textContent = "";
    iniciarSesion(correo);
});

function iniciarSesion(correo) {
    guardar("finpet_sesion", correo); // recuerda quién entró
    mostrarApp();
}

// ===== 6. MOSTRAR LA APP O EL LOGIN =====
function mostrarApp() {
    const correo = leer("finpet_sesion", null);
    const usuarios = leer("finpet_usuarios", []);
    const usuario = usuarios.find(u => u.correo === correo);

    document.getElementById("usuario-nombre").textContent = usuario.nombre;
    pantallaAcceso.hidden = true;
    pantallaApp.hidden = false;
}

// ===== 7. CERRAR SESIÓN =====
document.getElementById("btn-salir").addEventListener("click", function () {
    localStorage.removeItem("finpet_sesion");
    pantallaApp.hidden = true;
    pantallaAcceso.hidden = false;
});

// ===== 8. AL ABRIR LA PÁGINA =====
// Si ya había alguien con sesión abierta, entra directo
if (leer("finpet_sesion", null)) {
    mostrarApp();
}