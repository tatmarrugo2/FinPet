// ===== 1. IMPORTAR FIREBASE =====
import { auth, db } from "./firebase.js";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    query,
    where,
    writeBatch
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
 
// Copia en memoria de los movimientos del usuario (se llena desde Firestore)
let movimientos = [];
 
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
 
// Traduce los errores de Firebase al español
function traducirError(codigo) {
    const errores = {
        "auth/email-already-in-use": "Ya existe una cuenta con ese correo.",
        "auth/invalid-email": "El correo no es válido.",
        "auth/weak-password": "La contraseña debe tener mínimo 6 caracteres.",
        "auth/invalid-credential": "Correo o contraseña incorrectos.",
        "auth/wrong-password": "Correo o contraseña incorrectos.",
        "auth/user-not-found": "Correo o contraseña incorrectos.",
        "auth/too-many-requests": "Demasiados intentos. Espera un momento y vuelve a intentar.",
        "auth/network-request-failed": "No hay conexión a internet."
    };
    return errores[codigo] || "Ocurrió un error (" + codigo + ").";
}
 
// ===== 4. CREAR CUENTA (Firebase Authentication) =====
formRegistro.addEventListener("submit", async function (e) {
    e.preventDefault();
 
    const nombre = document.getElementById("reg-nombre").value.trim();
    const correo = document.getElementById("reg-correo").value.trim().toLowerCase();
    const clave = document.getElementById("reg-clave").value;
    const error = document.getElementById("registro-error");
 
    if (nombre === "" || correo === "" || clave === "") {
        error.textContent = "Completa todos los campos.";
        return;
    }
    if (clave.length < 6) {
        error.textContent = "La contraseña debe tener mínimo 6 caracteres.";
        return;
    }
 
    try {
        const credencial = await createUserWithEmailAndPassword(auth, correo, clave);
        await updateProfile(credencial.user, { displayName: nombre });
        document.getElementById("usuario-nombre").textContent = nombre;
        error.textContent = "";
    } catch (err) {
        error.textContent = traducirError(err.code);
    }
});
 
// ===== 5. INICIAR SESIÓN =====
formLogin.addEventListener("submit", async function (e) {
    e.preventDefault();
 
    const correo = document.getElementById("login-correo").value.trim().toLowerCase();
    const clave = document.getElementById("login-clave").value;
    const error = document.getElementById("login-error");
 
    try {
        await signInWithEmailAndPassword(auth, correo, clave);
        error.textContent = "";
    } catch (err) {
        error.textContent = traducirError(err.code);
    }
});
 
// ===== 6. CERRAR SESIÓN =====
document.getElementById("btn-salir").addEventListener("click", function () {
    signOut(auth);
});
 
// ===== 7. MENÚ: CAMBIAR DE SECCIÓN =====
const botonesMenu = document.querySelectorAll(".menu-btn");
 
botonesMenu.forEach(function (boton) {
    boton.addEventListener("click", function () {
        mostrarVista(boton.dataset.vista);
    });
});
 
function mostrarVista(idVista) {
    document.querySelectorAll(".vista").forEach(v => v.hidden = true);
    document.getElementById(idVista).hidden = false;
    botonesMenu.forEach(b => b.classList.toggle("activo", b.dataset.vista === idVista));
}
 
// ===== 8. CATEGORÍAS (RF4) =====
const CATEGORIAS = {
    gasto: ["Comida", "Comida fuera de casa", "Transporte", "Entretenimiento", "Estudio", "Servicios", "Ropa", "Salud", "Otros"],
    ingreso: ["Salario", "Mesada", "Trabajo extra", "Ventas", "Otros"]
};
 
const selTipo = document.getElementById("mov-tipo");
const selCategoria = document.getElementById("mov-categoria");
 
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
 
// ===== 9. LEER MOVIMIENTOS DE LA BASE DE DATOS =====
function hoy() {
    const d = new Date();
    const mes = String(d.getMonth() + 1).padStart(2, "0");
    const dia = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + mes + "-" + dia;
}
 
document.getElementById("mov-fecha").value = hoy();
 
async function cargarMovimientos() {
    // Trae solo los movimientos cuyo uid es el del usuario que inició sesión
    const consulta = query(collection(db, "movimientos"), where("uid", "==", auth.currentUser.uid));
    const resultado = await getDocs(consulta);
    movimientos = resultado.docs.map(d => ({ id: d.id, ...d.data() }));
    actualizarTodo();
}
 
// ===== 10. REGISTRAR MOVIMIENTOS (RF2, RF3) =====
const formMovimiento = document.getElementById("form-movimiento");
 
formMovimiento.addEventListener("submit", async function (e) {
    e.preventDefault();
 
    const monto = Number(document.getElementById("mov-monto").value);
    const fecha = document.getElementById("mov-fecha").value;
    const error = document.getElementById("mov-error");
    const boton = formMovimiento.querySelector("button[type=submit]");
 
    if (!monto || monto <= 0) {
        error.textContent = "Escribe un monto mayor a 0.";
        return;
    }
    if (!fecha) {
        error.textContent = "Elige una fecha.";
        return;
    }
 
    const movimiento = {
        uid: auth.currentUser.uid,
        tipo: selTipo.value,
        monto: monto,
        categoria: selCategoria.value,
        fecha: fecha,
        descripcion: document.getElementById("mov-desc").value.trim()
    };
 
    boton.disabled = true;
    boton.textContent = "Guardando...";
 
    try {
        const referencia = await addDoc(collection(db, "movimientos"), movimiento);
        movimientos.push({ id: referencia.id, ...movimiento });
 
        error.textContent = "";
        document.getElementById("mov-monto").value = "";
        document.getElementById("mov-desc").value = "";
        actualizarTodo();
        mensajeMascota(movimiento);
        mostrarVista("vista-inicio");
    } catch (err) {
        console.error(err);
        error.textContent = "No se pudo guardar. Revisa tu conexión a internet.";
    } finally {
        boton.disabled = false;
        boton.textContent = "Guardar movimiento";
    }
});
 
// ===== 11. DASHBOARD (RF5) =====
function pesos(numero) {
    return numero.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
}
 
function sumar(lista, tipo) {
    return lista.filter(m => m.tipo === tipo).reduce((total, m) => total + m.monto, 0);
}
 
function actualizarTodo() {
    const mesActual = hoy().slice(0, 7);
    const delMes = movimientos.filter(m => m.fecha.slice(0, 7) === mesActual);
 
    const ingresos = sumar(delMes, "ingreso");
    const gastos = sumar(delMes, "gasto");
    const saldo = ingresos - gastos;
 
    document.getElementById("total-ingresos").textContent = pesos(ingresos);
    document.getElementById("total-gastos").textContent = pesos(gastos);
    const saldoEl = document.getElementById("saldo");
    saldoEl.textContent = pesos(saldo);
    saldoEl.style.color = saldo < 0 ? "var(--rojo)" : "var(--texto)";
 
    actualizarMascota(ingresos, gastos);
    dibujarGrafico();
    dibujarHistorial();
    revisarRecordatorio();
}
 
// ===== 12. LA MASCOTA (RF6) =====
function actualizarMascota(ingresos, gastos) {
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
 
// ===== 13. MENSAJE AL REGISTRAR (RF7) =====
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
 
    const mascota = document.getElementById("mascota");
    mascota.classList.remove("salta");
    void mascota.offsetWidth;
    mascota.classList.add("salta");
}
 
// ===== 14. GRÁFICO DE COMPARACIÓN MENSUAL =====
function dibujarGrafico() {
    const meses = [];
    const ahora = new Date();
 
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
 
// ===== 15. HISTORIAL CON FILTROS (RF9) =====
const fTipo = document.getElementById("f-tipo");
const fCategoria = document.getElementById("f-categoria");
const fMes = document.getElementById("f-mes");
 
const todasCategorias = new Set([...CATEGORIAS.gasto, ...CATEGORIAS.ingreso]);
todasCategorias.forEach(function (cat) {
    const opcion = document.createElement("option");
    opcion.value = cat;
    opcion.textContent = cat;
    fCategoria.appendChild(opcion);
});
 
// Evita que un texto escrito por el usuario se interprete como código HTML
function escapar(texto) {
    const div = document.createElement("div");
    div.textContent = texto;
    return div.innerHTML;
}
 
function dibujarHistorial() {
    let lista = [...movimientos];
 
    if (fTipo.value) lista = lista.filter(m => m.tipo === fTipo.value);
    if (fCategoria.value) lista = lista.filter(m => m.categoria === fCategoria.value);
    if (fMes.value) lista = lista.filter(m => m.fecha.slice(0, 7) === fMes.value);
 
    lista.sort((a, b) => b.fecha.localeCompare(a.fecha));
 
    const tabla = document.getElementById("tabla-historial");
 
    if (lista.length === 0) {
        tabla.innerHTML = '<tr><td colspan="6" class="gris">No hay movimientos con esos filtros.</td></tr>';
        return;
    }
 
    tabla.innerHTML = lista.map(m => `
        <tr>
            <td>${m.fecha}</td>
            <td>${m.tipo === "gasto" ? "Gasto" : "Ingreso"}</td>
            <td>${escapar(m.categoria)}</td>
            <td>${m.descripcion ? escapar(m.descripcion) : "—"}</td>
            <td class="${m.tipo === "gasto" ? "rojo" : "verde"}">
                ${m.tipo === "gasto" ? "-" : "+"} ${pesos(m.monto)}
            </td>
            <td><button class="btn-borrar" data-id="${m.id}">🗑</button></td>
        </tr>`).join("");
}
 
fTipo.addEventListener("change", dibujarHistorial);
fCategoria.addEventListener("change", dibujarHistorial);
fMes.addEventListener("change", dibujarHistorial);
 
// Eliminar un movimiento de la base de datos
document.getElementById("tabla-historial").addEventListener("click", async function (e) {
    const boton = e.target.closest(".btn-borrar");
    if (!boton) return;
    if (!confirm("¿Eliminar este movimiento?")) return;
 
    const id = boton.dataset.id;
    try {
        await deleteDoc(doc(db, "movimientos", id));
        movimientos = movimientos.filter(m => m.id !== id);
        actualizarTodo();
    } catch (err) {
        console.error(err);
        alert("No se pudo eliminar. Revisa tu conexión.");
    }
});
 
// ===== 16. RECORDATORIO DIARIO (RF8) =====
function revisarRecordatorio() {
    const registroHoy = movimientos.some(m => m.fecha === hoy());
    document.getElementById("recordatorio").hidden = registroHoy;
}
 
// ===== 17. DATOS DE EJEMPLO PARA LA DEMO =====
document.getElementById("btn-ejemplo").addEventListener("click", async function () {
    const boton = this;
    boton.disabled = true;
    boton.textContent = "Cargando...";
 
    const uid = auth.currentUser.uid;
    const lote = writeBatch(db); // guarda todo de una sola vez
    const ahora = new Date();
 
    const gastosMes = [
        ["Comida", 280000, 3, "Mercado"],
        ["Transporte", 120000, 5, "Recargas TransCaribe"],
        ["Comida fuera de casa", 150000, 12, "Almuerzos"],
        ["Entretenimiento", 90000, 15, "Cine y salidas"],
        ["Servicios", 85000, 8, "Plan de celular"],
        ["Estudio", 60000, 20, "Fotocopias y materiales"]
    ];
 
    for (let i = 5; i >= 0; i--) {
        const d = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
        const mes = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
        const diaMax = i === 0 ? ahora.getDate() : 28;
        const fecha = dia => mes + "-" + String(Math.min(dia, diaMax)).padStart(2, "0");
 
        lote.set(doc(collection(db, "movimientos")), {
            uid, tipo: "ingreso", monto: 1200000, categoria: "Salario",
            fecha: fecha(1), descripcion: "Pago del mes"
        });
 
        gastosMes.forEach(function (g, j) {
            const variacion = 1 + ((i * 7 + j * 3) % 5 - 2) / 10;
            lote.set(doc(collection(db, "movimientos")), {
                uid, tipo: "gasto", monto: Math.round(g[1] * variacion / 1000) * 1000,
                categoria: g[0], fecha: fecha(g[2]), descripcion: g[3]
            });
        });
    }
 
    try {
        await lote.commit();
        await cargarMovimientos();
        mostrarVista("vista-inicio");
    } catch (err) {
        console.error(err);
        alert("No se pudieron cargar los datos de ejemplo.");
    } finally {
        boton.disabled = false;
        boton.textContent = "Cargar datos de ejemplo";
    }
});
 
// ===== 18. AL ABRIR LA PÁGINA: ¿HAY ALGUIEN CON SESIÓN? =====
// Firebase avisa cada vez que alguien entra o sale
onAuthStateChanged(auth, async function (usuario) {
    if (usuario) {
        document.getElementById("usuario-nombre").textContent = usuario.displayName || usuario.email;
        pantallaAcceso.hidden = true;
        pantallaApp.hidden = false;
        mostrarVista("vista-inicio");
        try {
            await cargarMovimientos();
        } catch (err) {
            console.error(err);
            alert("No se pudieron cargar tus datos. Revisa las reglas de Firestore o tu conexión.");
        }
    } else {
        movimientos = [];
        pantallaApp.hidden = true;
        pantallaAcceso.hidden = false;
    }
});