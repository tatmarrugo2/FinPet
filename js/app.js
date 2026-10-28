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
        actualizarTodo();
}

// ===== 7. CERRAR SESIÓN =====
document.getElementById("btn-salir").addEventListener("click", function () {
    localStorage.removeItem("finpet_sesion");
    pantallaApp.hidden = true;
    pantallaAcceso.hidden = false;
});

// ===== 9. MENÚ: CAMBIAR DE SECCIÓN =====
const botonesMenu = document.querySelectorAll(".menu-btn");

botonesMenu.forEach(function (boton) {
    boton.addEventListener("click", function () {
        mostrarVista(boton.dataset.vista);
    });
});

function mostrarVista(idVista) {
    // Oculta todas las vistas y muestra solo la elegida
    document.querySelectorAll(".vista").forEach(v => v.hidden = true);
    document.getElementById(idVista).hidden = false;

    // Marca en verde el botón activo del menú
    botonesMenu.forEach(b => b.classList.toggle("activo", b.dataset.vista === idVista));
}

// ===== 10. CATEGORÍAS (RF4) =====
const CATEGORIAS = {
    gasto: ["Comida", "Comida fuera de casa", "Transporte", "Entretenimiento", "Estudio", "Servicios", "Ropa", "Salud", "Otros"],
    ingreso: ["Salario", "Mesada", "Trabajo extra", "Ventas", "Otros"]
};

const selTipo = document.getElementById("mov-tipo");
const selCategoria = document.getElementById("mov-categoria");

// Llena la lista de categorías según si es gasto o ingreso
function cargarCategorias() {
    selCategoria.innerHTML = "";
    CATEGORIAS[selTipo.value].forEach(function (cat) {
        const opcion = document.createElement("option");
        opcion.value = cat;
        opcion.textContent = cat;
        selCategoria.appendChild(opcion);
    });
}

selTipo.addEventListener("change", cargarCategorias);
cargarCategorias();

// ===== 11. REGISTRAR MOVIMIENTOS (RF2, RF3) =====

// Fecha de hoy en formato AAAA-MM-DD (hora de Colombia)
function hoy() {
    const d = new Date();
    const mes = String(d.getMonth() + 1).padStart(2, "0");
    const dia = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + mes + "-" + dia;
}

document.getElementById("mov-fecha").value = hoy();

// Devuelve solo los movimientos del usuario que inició sesión
function misMovimientos() {
    const correo = leer("finpet_sesion", null);
    return leer("finpet_movimientos", []).filter(m => m.correo === correo);
}

document.getElementById("form-movimiento").addEventListener("submit", function (e) {
    e.preventDefault();

    const monto = Number(document.getElementById("mov-monto").value);
    const fecha = document.getElementById("mov-fecha").value;
    const error = document.getElementById("mov-error");

    if (!monto || monto <= 0) {
        error.textContent = "Escribe un monto mayor a 0.";
        return;
    }
    if (!fecha) {
        error.textContent = "Elige una fecha.";
        return;
    }

    const movimiento = {
        id: Date.now(),                       // número único para identificarlo
        correo: leer("finpet_sesion", null),  // de quién es
        tipo: selTipo.value,                  // "gasto" o "ingreso"
        monto: monto,
        categoria: selCategoria.value,
        fecha: fecha,
        descripcion: document.getElementById("mov-desc").value.trim()
    };

    const todos = leer("finpet_movimientos", []);
    todos.push(movimiento);
    guardar("finpet_movimientos", todos);

    // Limpia el formulario y vuelve al inicio
    error.textContent = "";
    document.getElementById("mov-monto").value = "";
    document.getElementById("mov-desc").value = "";
    actualizarTodo();
    mensajeMascota(movimiento);
    mostrarVista("vista-inicio");
});

// ===== 12. ACTUALIZAR PANTALLAS =====
// Muestra un número como pesos colombianos: 15000 → $ 15.000
function pesos(numero) {
    return numero.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
}

// Suma los montos de una lista de movimientos de un tipo
function sumar(lista, tipo) {
    return lista.filter(m => m.tipo === tipo).reduce((total, m) => total + m.monto, 0);
}

function actualizarTodo() {
    const movimientos = misMovimientos();
    const mesActual = hoy().slice(0, 7); // ejemplo: "2026-10"
    const delMes = movimientos.filter(m => m.fecha.slice(0, 7) === mesActual);

    const ingresos = sumar(delMes, "ingreso");
    const gastos = sumar(delMes, "gasto");
    const saldo = ingresos - gastos;

    // Resumen del mes
    document.getElementById("total-ingresos").textContent = pesos(ingresos);
    document.getElementById("total-gastos").textContent = pesos(gastos);
    const saldoEl = document.getElementById("saldo");
    saldoEl.textContent = pesos(saldo);
    saldoEl.style.color = saldo < 0 ? "var(--rojo)" : "var(--texto)";

    actualizarMascota(movimientos, ingresos, gastos);
    dibujarGrafico(movimientos);
}

// ===== 13. LA MASCOTA (RF6) =====
function actualizarMascota(movimientos, ingresos, gastos) {
    let cara, estado, mensaje;

    if (movimientos.length === 0) {
        cara = "😐"; estado = "tranquilo";
        mensaje = "¡Hola! Registra tu primer movimiento y empezamos.";
    } else if (ingresos === 0 && gastos > 0) {
        cara = "😢"; estado = "triste";
        mensaje = "Este mes solo hay gastos. ¿Registraste tus ingresos?";
    } else {
        const porcentaje = ingresos > 0 ? Math.round((gastos / ingresos) * 100) : 0;

        if (porcentaje <= 70) {
            cara = "😄"; estado = "feliz";
            mensaje = "¡Vas muy bien! Has gastado el " + porcentaje + "% de tus ingresos este mes.";
        } else if (porcentaje <= 100) {
            cara = "😐"; estado = "preocupado";
            mensaje = "Cuidado, ya gastaste el " + porcentaje + "% de lo que te entró este mes.";
        } else {
            cara = "😢"; estado = "triste";
            mensaje = "Este mes gastas más de lo que te entra (" + porcentaje + "%). ¡Revisemos juntos!";
        }
    }

    document.getElementById("mascota").textContent = cara;
    document.getElementById("mascota-estado").textContent = estado;
    document.getElementById("mascota-mensaje").textContent = mensaje;
}

// ===== 14. MENSAJE AL REGISTRAR (RF7) =====
function mensajeMascota(movimiento) {
    let mensaje;

    if (movimiento.tipo === "ingreso") {
        mensaje = "¡Entró dinero! 🎉 Intenta guardar una parte antes de gastarla.";
    } else if (movimiento.categoria === "Comida fuera de casa" || movimiento.categoria === "Entretenimiento") {
        mensaje = "Anotado: " + pesos(movimiento.monto) + " en " + movimiento.categoria + ". Ojo, esa categoría crece rápido 👀";
    } else {
        mensaje = "¡Bien! Registraste " + pesos(movimiento.monto) + " en " + movimiento.categoria + ". Así se crea el hábito 💪";
    }

    document.getElementById("mascota-mensaje").textContent = mensaje;

    // Animación de salto
    const mascota = document.getElementById("mascota");
    mascota.classList.remove("salta");
    void mascota.offsetWidth; // reinicia la animación
    mascota.classList.add("salta");
}

// ===== 15. GRÁFICO DE COMPARACIÓN MENSUAL =====
function dibujarGrafico(movimientos) {
    const meses = [];
    const ahora = new Date();

    // Arma la lista de los últimos 6 meses
    for (let i = 5; i >= 0; i--) {
        const d = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
        const clave = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
        const delMes = movimientos.filter(m => m.fecha.slice(0, 7) === clave);
        meses.push({
            nombre: d.toLocaleString("es-CO", { month: "short" }),
            ingresos: sumar(delMes, "ingreso"),
            gastos: sumar(delMes, "gasto")
        });
    }

    // El valor más alto define el 100% de altura
    const maximo = Math.max(1, ...meses.map(m => Math.max(m.ingresos, m.gastos)));

    let html = "";
    meses.forEach(function (m) {
        const altoIng = (m.ingresos / maximo) * 100;
        const altoGas = (m.gastos / maximo) * 100;
        html += `
            <div class="mes">
                <div class="barras">
                    <div class="barra-ing" style="height:${altoIng}%" title="Ingresos: ${pesos(m.ingresos)}"></div>
                    <div class="barra-gas" style="height:${altoGas}%" title="Gastos: ${pesos(m.gastos)}"></div>
                </div>
                <span class="mes-nombre">${m.nombre}</span>
            </div>`;
    });

    document.getElementById("grafico").innerHTML = html;
}

// ===== 8. AL ABRIR LA PÁGINA =====
// Si ya había alguien con sesión abierta, entra directo
if (leer("finpet_sesion", null)) {
    mostrarApp();
}