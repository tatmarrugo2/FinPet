// ===== 1. IMPORTAR FIREBASE =====
import { auth, db } from "./firebase.js";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    query,
    where,
    writeBatch,
    setDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
 
// Copia en memoria de los movimientos del usuario (se llena desde Firestore)
let movimientos = [];
// Copia en memoria de los presupuestos del usuario
let presupuestos = [];
// Copia en memoria de las metas de ahorro del usuario
let metas = [];
 
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
 
// ===== 5B. RECUPERAR CONTRASEÑA =====
auth.languageCode = "es"; // el correo de Firebase llega en español
 
document.getElementById("olvide-clave").addEventListener("click", async function (e) {
    e.preventDefault();
 
    const correo = document.getElementById("login-correo").value.trim().toLowerCase();
    const error = document.getElementById("login-error");
    const info = document.getElementById("login-info");
    error.textContent = "";
    info.textContent = "";
 
    if (correo === "") {
        error.textContent = "Escribe tu correo arriba y vuelve a dar clic en \"¿Olvidaste tu contraseña?\".";
        return;
    }
 
    try {
        await sendPasswordResetEmail(auth, correo);
        // Por seguridad no se dice si el correo existe o no
        info.textContent = "Si hay una cuenta con " + correo + ", te enviamos un enlace para crear una nueva contraseña. " +
                           "Revisa también la carpeta de spam.";
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
        if (editandoId && boton.dataset.vista !== "vista-registrar") salirDeEdicion();
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
 
// ===== 10. REGISTRAR Y EDITAR MOVIMIENTOS (RF2, RF3) =====
const formMovimiento = document.getElementById("form-movimiento");
const tituloMovimiento = formMovimiento.querySelector("h2");
const botonGuardar = formMovimiento.querySelector("button[type=submit]");
 
// Si tiene un id, el formulario está editando ese movimiento; si es null, está creando uno nuevo
let editandoId = null;
 
// Llena el formulario con un movimiento existente para editarlo
function editarMovimiento(id) {
    const m = movimientos.find(m => m.id === id);
    if (!m) return;
 
    editandoId = id;
    selTipo.value = m.tipo;
    cargarCategorias();                 // carga las categorías de ese tipo
    selCategoria.value = m.categoria;
    document.getElementById("mov-monto").value = m.monto;
    document.getElementById("mov-fecha").value = m.fecha;
    document.getElementById("mov-desc").value = m.descripcion || "";
    document.getElementById("mov-error").textContent = "";
 
    tituloMovimiento.textContent = "Editar movimiento";
    botonGuardar.textContent = "Guardar cambios";
    document.getElementById("mov-cancelar").hidden = false;
    mostrarVista("vista-registrar");
}
 
// Vuelve el formulario a "Nuevo movimiento"
function salirDeEdicion() {
    editandoId = null;
    tituloMovimiento.textContent = "Nuevo movimiento";
    botonGuardar.textContent = "Guardar movimiento";
    document.getElementById("mov-cancelar").hidden = true;
    document.getElementById("mov-monto").value = "";
    document.getElementById("mov-desc").value = "";
    document.getElementById("mov-fecha").value = hoy();
    document.getElementById("mov-error").textContent = "";
}
 
document.getElementById("mov-cancelar").addEventListener("click", function () {
    salirDeEdicion();
    mostrarVista("vista-historial");
});
 
formMovimiento.addEventListener("submit", async function (e) {
    e.preventDefault();
 
    const monto = Number(document.getElementById("mov-monto").value);
    const fecha = document.getElementById("mov-fecha").value;
    const error = document.getElementById("mov-error");
    const boton = botonGuardar;
 
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
 
    const textoBoton = boton.textContent;
    boton.disabled = true;
    boton.textContent = "Guardando...";
 
    try {
        if (editandoId) {
            // --- EDITAR: actualiza el documento que ya existe ---
            await updateDoc(doc(db, "movimientos", editandoId), movimiento);
            const indice = movimientos.findIndex(m => m.id === editandoId);
            movimientos[indice] = { id: editandoId, ...movimiento };
 
            salirDeEdicion();
            actualizarTodo();
            document.getElementById("mascota-mensaje").textContent = "Listo, actualicé el movimiento ✏️";
            mostrarVista("vista-historial");
            return;
        }
 
        // --- CREAR: agrega un documento nuevo ---
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
        if (boton.textContent === "Guardando...") boton.textContent = textoBoton;
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
    dibujarPresupuestos();
    dibujarTorta();
    dibujarMetas();
}
 
// ===== 12. LA MASCOTA (RF6) =====
function actualizarMascota(ingresos, gastos) {
    let estado, mensaje;
 
    if (movimientos.length === 0) {
        estado = "tranquilo";
        mensaje = "¡Hola! Registra tu primer movimiento y empezamos.";
    } else if (ingresos === 0 && gastos > 0) {
        estado = "triste";
        mensaje = "Este mes solo hay gastos. ¿Registraste tus ingresos?";
    } else {
        const porcentaje = ingresos > 0 ? Math.round((gastos / ingresos) * 100) : 0;
 
        if (porcentaje <= 70) {
            estado = "feliz";
            mensaje = "¡Vas muy bien! Has gastado el " + porcentaje + "% de tus ingresos este mes.";
        } else if (porcentaje <= 100) {
            estado = "preocupado";
            mensaje = "Cuidado, ya gastaste el " + porcentaje + "% de lo que te entró este mes.";
        } else {
            estado = "triste";
            mensaje = "Este mes gastas más de lo que te entra (" + porcentaje + "%). ¡Revisemos juntos!";
        }
    }
 
    // Aunque vaya bien en general, si se pasó en alguna categoría, Pepo se preocupa
    const excedidos = presupuestos.filter(p => gastadoEnMes(p.categoria) > p.limite);
    if (excedidos.length > 0 && estado === "feliz") {
        estado = "preocupado";
        mensaje = "Vas bien en general, pero te pasaste del presupuesto en: " +
                  excedidos.map(p => p.categoria).join(", ") + ".";
    }
 
    document.getElementById("mascota").dataset.animo = estado;
    document.getElementById("mascota-estado").textContent = estado;
    document.getElementById("mascota-mensaje").textContent = mensaje;
}
 
// ===== 13. MENSAJE AL REGISTRAR (RF7) =====
function mensajeMascota(movimiento) {
    let mensaje;
    // Si es un gasto, revisa cómo va el presupuesto de esa categoría
    const pres = movimiento.tipo === "gasto" ? estadoPresupuesto(movimiento.categoria) : null;
 
    if (pres && pres.porcentaje > 100) {
        mensaje = "¡Uy! Te pasaste del presupuesto de " + movimiento.categoria + ": llevas " +
                  pesos(pres.gastado) + " de " + pesos(pres.limite) + " 😟";
    } else if (pres && pres.porcentaje >= 80) {
        mensaje = "Cuidado: ya usaste el " + pres.porcentaje + "% de tu presupuesto de " +
                  movimiento.categoria + ". Te quedan " + pesos(pres.limite - pres.gastado) + ".";
    } else if (movimiento.tipo === "ingreso") {
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
 
// Aplica los filtros elegidos (la usan la tabla y la exportación a Excel)
function movimientosFiltrados() {
    let lista = [...movimientos];
 
    if (fTipo.value) lista = lista.filter(m => m.tipo === fTipo.value);
    if (fCategoria.value) lista = lista.filter(m => m.categoria === fCategoria.value);
    if (fMes.value) lista = lista.filter(m => m.fecha.slice(0, 7) === fMes.value);
 
    return lista.sort((a, b) => b.fecha.localeCompare(a.fecha));
}
 
function dibujarHistorial() {
    const lista = movimientosFiltrados();
 
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
            <td class="acciones">
                <button class="btn-editar" data-id="${m.id}" title="Editar">✏️</button>
                <button class="btn-borrar" data-id="${m.id}" title="Eliminar">🗑</button>
            </td>
        </tr>`).join("");
}
 
fTipo.addEventListener("change", dibujarHistorial);
fCategoria.addEventListener("change", dibujarHistorial);
fMes.addEventListener("change", dibujarHistorial);
 
// Botones de cada fila: editar o eliminar
document.getElementById("tabla-historial").addEventListener("click", async function (e) {
    const btnEditar = e.target.closest(".btn-editar");
    if (btnEditar) {
        editarMovimiento(btnEditar.dataset.id);
        return;
    }
 
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
 
// ===== 15B. EXPORTAR A EXCEL (CSV) =====
document.getElementById("btn-exportar").addEventListener("click", function () {
    const lista = movimientosFiltrados();
 
    if (lista.length === 0) {
        alert("No hay movimientos para exportar con esos filtros.");
        return;
    }
 
    // Encierra cada valor entre comillas para que las comas o ; del texto no dañen las columnas
    const celda = valor => '"' + String(valor).replace(/"/g, '""') + '"';
 
    const filas = [["Fecha", "Tipo", "Categoría", "Descripción", "Monto"]];
    lista.forEach(function (m) {
        filas.push([m.fecha, m.tipo === "gasto" ? "Gasto" : "Ingreso", m.categoria, m.descripcion || "", m.monto]);
    });
 
    // Totales al final
    const ingresos = sumar(lista, "ingreso");
    const gastos = sumar(lista, "gasto");
    filas.push([]);
    filas.push(["", "", "", "Total ingresos", ingresos]);
    filas.push(["", "", "", "Total gastos", gastos]);
    filas.push(["", "", "", "Balance", ingresos - gastos]);
 
    // Excel en español usa ; para separar columnas.
    // El \uFEFF al inicio hace que Excel lea bien las tildes y la ñ.
    const contenido = "\uFEFF" + filas.map(f => f.map(celda).join(";")).join("\r\n");
 
    // Crea el archivo y lo descarga
    const archivo = new Blob([contenido], { type: "text/csv;charset=utf-8" });
    const enlace = document.createElement("a");
    enlace.href = URL.createObjectURL(archivo);
    enlace.download = "finpet-historial-" + hoy() + ".csv";
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    setTimeout(() => URL.revokeObjectURL(enlace.href), 1000);
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
 
    // Presupuestos de ejemplo (el id combina usuario y categoría)
    [["Comida fuera de casa", 160000], ["Entretenimiento", 85000], ["Transporte", 150000]]
        .forEach(function (p) {
            lote.set(doc(db, "presupuestos", uid + "_" + p[0]), { uid, categoria: p[0], limite: p[1] });
        });
 
    // Meta de ahorro de ejemplo (id fijo para que no se duplique)
    lote.set(doc(db, "metas", uid + "_ejemplo"), {
        uid, nombre: "Portátil nuevo", objetivo: 2500000, ahorrado: 900000
    });
 
    try {
        await lote.commit();
        await cargarPresupuestos();
        await cargarMetas();
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
 
// ===== 18. PRESUPUESTO POR CATEGORÍA =====
const selPresCategoria = document.getElementById("pres-categoria");
 
// Solo las categorías de gasto tienen presupuesto
CATEGORIAS.gasto.forEach(function (cat) {
    const opcion = document.createElement("option");
    opcion.value = cat;
    opcion.textContent = cat;
    selPresCategoria.appendChild(opcion);
});
 
// Cuánto se ha gastado este mes en una categoría
function gastadoEnMes(categoria) {
    const mesActual = hoy().slice(0, 7);
    return movimientos
        .filter(m => m.tipo === "gasto" && m.categoria === categoria && m.fecha.slice(0, 7) === mesActual)
        .reduce((total, m) => total + m.monto, 0);
}
 
// Devuelve { limite, gastado, porcentaje } o null si la categoría no tiene presupuesto
function estadoPresupuesto(categoria) {
    const p = presupuestos.find(p => p.categoria === categoria);
    if (!p) return null;
    const gastado = gastadoEnMes(categoria);
    return { limite: p.limite, gastado: gastado, porcentaje: Math.round((gastado / p.limite) * 100) };
}
 
// Trae de Firestore los presupuestos del usuario
async function cargarPresupuestos() {
    const consulta = query(collection(db, "presupuestos"), where("uid", "==", auth.currentUser.uid));
    const resultado = await getDocs(consulta);
    presupuestos = resultado.docs.map(d => ({ id: d.id, ...d.data() }));
}
 
// Guardar o actualizar un presupuesto
document.getElementById("form-presupuesto").addEventListener("submit", async function (e) {
    e.preventDefault();
 
    const categoria = selPresCategoria.value;
    const limite = Number(document.getElementById("pres-limite").value);
    const error = document.getElementById("pres-error");
 
    if (!limite || limite <= 0) {
        error.textContent = "Escribe un límite mayor a 0.";
        return;
    }
 
    // El id combina usuario y categoría: así cada categoría tiene un solo presupuesto
    // y si se guarda otra vez, se actualiza en lugar de duplicarse
    const id = auth.currentUser.uid + "_" + categoria;
    const datos = { uid: auth.currentUser.uid, categoria: categoria, limite: limite };
 
    try {
        await setDoc(doc(db, "presupuestos", id), datos);
        presupuestos = presupuestos.filter(p => p.categoria !== categoria);
        presupuestos.push({ id: id, ...datos });
 
        error.textContent = "";
        document.getElementById("pres-limite").value = "";
        actualizarTodo();
    } catch (err) {
        console.error(err);
        error.textContent = "No se pudo guardar. Revisa las reglas de Firestore o tu conexión.";
    }
});
 
// Dibuja la lista de presupuestos con su barra de progreso
function dibujarPresupuestos() {
    const contenedor = document.getElementById("lista-presupuestos");
 
    if (presupuestos.length === 0) {
        contenedor.innerHTML = '<p class="gris">Aún no tienes presupuestos. Crea el primero arriba.</p>';
        return;
    }
 
    // Primero los que van más llenos
    const lista = presupuestos
        .map(p => ({ ...p, ...estadoPresupuesto(p.categoria) }))
        .sort((a, b) => b.porcentaje - a.porcentaje);
 
    contenedor.innerHTML = lista.map(function (p) {
        let nivel, texto;
        if (p.porcentaje > 100) {
            nivel = "excedido";
            texto = "Te pasaste por " + pesos(p.gastado - p.limite);
        } else if (p.porcentaje >= 80) {
            nivel = "alerta";
            texto = "Ojo: te quedan " + pesos(p.limite - p.gastado);
        } else {
            nivel = "ok";
            texto = "Te quedan " + pesos(p.limite - p.gastado);
        }
 
        return `
            <div class="pres-item ${nivel}">
                <div class="pres-cabeza">
                    <b>${escapar(p.categoria)}</b>
                    <span>${pesos(p.gastado)} de ${pesos(p.limite)} (${p.porcentaje}%)</span>
                </div>
                <div class="pres-pista">
                    <div class="pres-barra" style="width:${Math.min(p.porcentaje, 100)}%"></div>
                </div>
                <div class="pres-pie">
                    <span>${texto}</span>
                    <button class="btn-borrar" data-id="${p.id}" title="Eliminar presupuesto">🗑</button>
                </div>
            </div>`;
    }).join("");
}
 
// Eliminar un presupuesto
document.getElementById("lista-presupuestos").addEventListener("click", async function (e) {
    const boton = e.target.closest(".btn-borrar");
    if (!boton) return;
    if (!confirm("¿Eliminar este presupuesto?")) return;
 
    const id = boton.dataset.id;
    try {
        await deleteDoc(doc(db, "presupuestos", id));
        presupuestos = presupuestos.filter(p => p.id !== id);
        actualizarTodo();
    } catch (err) {
        console.error(err);
        alert("No se pudo eliminar. Revisa tu conexión.");
    }
});
 
// ===== 19. GRÁFICO DE TORTA: GASTOS POR CATEGORÍA =====
// Usa la librería Chart.js (se carga en el index.html)
let graficoTorta = null;
 
const COLORES_CATEGORIA = {
    "Comida": "#0C7A5E",
    "Comida fuera de casa": "#D2543A",
    "Transporte": "#F2B33D",
    "Entretenimiento": "#7B61C9",
    "Estudio": "#2F80C9",
    "Servicios": "#3BA99C",
    "Ropa": "#E07BB0",
    "Salud": "#8B5E3C",
    "Otros": "#9AA8A3"
};
 
function dibujarTorta() {
    const canvas = document.getElementById("grafico-torta");
    const vacio = document.getElementById("torta-vacio");
    const mesActual = hoy().slice(0, 7);
 
    // Suma los gastos del mes por categoría
    const totales = {};
    movimientos
        .filter(m => m.tipo === "gasto" && m.fecha.slice(0, 7) === mesActual)
        .forEach(m => totales[m.categoria] = (totales[m.categoria] || 0) + m.monto);
 
    // De la categoría más grande a la más pequeña
    const categorias = Object.keys(totales).sort((a, b) => totales[b] - totales[a]);
 
    // Borra el gráfico anterior antes de dibujar uno nuevo
    if (graficoTorta) {
        graficoTorta.destroy();
        graficoTorta = null;
    }
 
    if (categorias.length === 0) {
        canvas.hidden = true;
        vacio.hidden = false;
        return;
    }
    canvas.hidden = false;
    vacio.hidden = true;
 
    if (typeof Chart === "undefined") return; // la librería no cargó (sin internet)
 
    graficoTorta = new Chart(canvas, {
        type: "doughnut",
        data: {
            labels: categorias,
            datasets: [{
                data: categorias.map(c => totales[c]),
                backgroundColor: categorias.map(c => COLORES_CATEGORIA[c] || "#9AA8A3"),
                borderColor: "#FFFFFF",
                borderWidth: 2
            }]
        },
        options: {
            cutout: "55%",
            plugins: {
                legend: { position: "bottom" },
                tooltip: {
                    callbacks: {
                        // Muestra el monto en pesos y el porcentaje del total
                        label: function (ctx) {
                            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                            const porcentaje = Math.round((ctx.parsed / total) * 100);
                            return " " + ctx.label + ": " + pesos(ctx.parsed) + " (" + porcentaje + "%)";
                        }
                    }
                }
            }
        }
    });
}
 
// ===== 20. METAS DE AHORRO =====
async function cargarMetas() {
    const consulta = query(collection(db, "metas"), where("uid", "==", auth.currentUser.uid));
    const resultado = await getDocs(consulta);
    metas = resultado.docs.map(d => ({ id: d.id, ...d.data() }));
}
 
// Pepo habla en el inicio y también en la sección de metas
function pepoDice(texto) {
    document.getElementById("mascota-mensaje").textContent = texto;
    const burbujaMetas = document.getElementById("metas-mensaje");
    burbujaMetas.textContent = "🦉 " + texto;
    burbujaMetas.hidden = false;
 
    const mascota = document.getElementById("mascota");
    mascota.classList.remove("salta");
    void mascota.offsetWidth;
    mascota.classList.add("salta");
}
 
// Crear una meta nueva
document.getElementById("form-meta").addEventListener("submit", async function (e) {
    e.preventDefault();
 
    const nombre = document.getElementById("meta-nombre").value.trim();
    const objetivo = Number(document.getElementById("meta-objetivo").value);
    const error = document.getElementById("meta-error");
 
    if (nombre === "") {
        error.textContent = "Ponle un nombre a tu meta.";
        return;
    }
    if (!objetivo || objetivo <= 0) {
        error.textContent = "Escribe un valor objetivo mayor a 0.";
        return;
    }
 
    const datos = { uid: auth.currentUser.uid, nombre: nombre, objetivo: objetivo, ahorrado: 0 };
 
    try {
        const referencia = await addDoc(collection(db, "metas"), datos);
        metas.push({ id: referencia.id, ...datos });
 
        error.textContent = "";
        document.getElementById("meta-nombre").value = "";
        document.getElementById("meta-objetivo").value = "";
        dibujarMetas();
        pepoDice("¡Nueva meta: " + nombre + "! Vamos por esos " + pesos(objetivo) + " 💪");
    } catch (err) {
        console.error(err);
        error.textContent = "No se pudo guardar. Revisa las reglas de Firestore o tu conexión.";
    }
});
 
// Dibuja las tarjetas de las metas con su barra de progreso
function dibujarMetas() {
    const contenedor = document.getElementById("lista-metas");
 
    if (metas.length === 0) {
        contenedor.innerHTML = '<p class="gris">Aún no tienes metas. Crea la primera arriba.</p>';
        return;
    }
 
    contenedor.innerHTML = metas.map(function (m) {
        const porcentaje = Math.round((m.ahorrado / m.objetivo) * 100);
        const completa = m.ahorrado >= m.objetivo;
 
        const abajo = completa
            ? '<p class="meta-cumplida">🎉 ¡Meta cumplida!</p>'
            : `<div class="meta-abono">
                   <input type="number" id="abono-${m.id}" placeholder="Monto a abonar">
                   <button class="btn-abonar" data-id="${m.id}">Abonar</button>
               </div>`;
 
        return `
            <div class="meta-item ${completa ? "completa" : ""}">
                <div class="pres-cabeza">
                    <b>${escapar(m.nombre)}</b>
                    <button class="btn-borrar" data-id="${m.id}" title="Eliminar meta">🗑</button>
                </div>
                <div class="pres-pista">
                    <div class="meta-barra" style="width:${Math.min(porcentaje, 100)}%"></div>
                </div>
                <div class="pres-pie">
                    <span>${pesos(m.ahorrado)} de ${pesos(m.objetivo)} (${porcentaje}%)</span>
                    <span>${completa ? "" : "Te faltan " + pesos(m.objetivo - m.ahorrado)}</span>
                </div>
                ${abajo}
            </div>`;
    }).join("");
}
 
// Botones de cada meta: abonar o eliminar
document.getElementById("lista-metas").addEventListener("click", async function (e) {
    // --- Abonar ---
    const btnAbonar = e.target.closest(".btn-abonar");
    if (btnAbonar) {
        const id = btnAbonar.dataset.id;
        const meta = metas.find(m => m.id === id);
        const monto = Number(document.getElementById("abono-" + id).value);
 
        if (!monto || monto <= 0) {
            pepoDice("Escribe cuánto quieres abonar a " + meta.nombre + ".");
            return;
        }
 
        const nuevoAhorrado = meta.ahorrado + monto;
        btnAbonar.disabled = true;
 
        try {
            await updateDoc(doc(db, "metas", id), { ahorrado: nuevoAhorrado });
            meta.ahorrado = nuevoAhorrado;
            dibujarMetas();
 
            if (nuevoAhorrado >= meta.objetivo) {
                pepoDice("🎉 ¡Lo lograste! Cumpliste tu meta: " + meta.nombre + ". ¡Estoy muy orgulloso!");
            } else {
                const porcentaje = Math.round((nuevoAhorrado / meta.objetivo) * 100);
                pepoDice("¡Abonaste " + pesos(monto) + " a " + meta.nombre + "! Ya vas en el " + porcentaje + "%.");
            }
        } catch (err) {
            console.error(err);
            alert("No se pudo guardar el abono. Revisa tu conexión.");
            btnAbonar.disabled = false;
        }
        return;
    }
 
    // --- Eliminar ---
    const btnBorrar = e.target.closest(".btn-borrar");
    if (btnBorrar) {
        if (!confirm("¿Eliminar esta meta?")) return;
        const id = btnBorrar.dataset.id;
        try {
            await deleteDoc(doc(db, "metas", id));
            metas = metas.filter(m => m.id !== id);
            dibujarMetas();
        } catch (err) {
            console.error(err);
            alert("No se pudo eliminar. Revisa tu conexión.");
        }
    }
});
 
// ===== 21. AL ABRIR LA PÁGINA: ¿HAY ALGUIEN CON SESIÓN? =====
// Firebase avisa cada vez que alguien entra o sale
onAuthStateChanged(auth, async function (usuario) {
    if (usuario) {
        document.getElementById("usuario-nombre").textContent = usuario.displayName || usuario.email;
        pantallaAcceso.hidden = true;
        pantallaApp.hidden = false;
        mostrarVista("vista-inicio");
        try {
            await cargarPresupuestos();
            await cargarMetas();
            await cargarMovimientos();
        } catch (err) {
            console.error(err);
            alert("No se pudieron cargar tus datos. Revisa las reglas de Firestore o tu conexión.");
        }
    } else {
        movimientos = [];
        presupuestos = [];
        metas = [];
        salirDeEdicion();
        pantallaApp.hidden = true;
        pantallaAcceso.hidden = false;
    }
});