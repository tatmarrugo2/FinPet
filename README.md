# 🦉 FinPet

**FinPet** es una aplicación web para registrar, categorizar y consultar ingresos y gastos personales, acompañada por **Pepo**, un búho virtual que reacciona a los hábitos financieros del usuario y le da mensajes de motivación.

Proyecto de aula de **Ingeniería de Software**.

**Integrantes:** Alejandro Agamez · Tatiana Marrugo · Esteban Ramírez

🔗 **Aplicación en línea:** https://tatmarrugo2.github.io/FinPet/

---

## El problema

Muchos jóvenes y adultos jóvenes no llevan un registro de sus ingresos y gastos: no saben cuánto gastan al mes, en qué categorías se les va el dinero ni cómo cambia su gasto de un mes a otro. Las aplicaciones existentes suelen ser frías y el usuario las abandona a los pocos días.

FinPet busca crear el **hábito de registrar** con una experiencia amigable y una mascota que da retroalimentación inmediata.

## Funcionalidades

| Módulo | Qué hace | Requisito |
|---|---|---|
| **Cuenta de usuario** | Crear cuenta, iniciar y cerrar sesión, recuperar la contraseña por correo. | RF1 |
| **Registro de movimientos** | Registrar gastos e ingresos con monto, categoría, fecha y descripción. | RF2, RF3, RF4 |
| **Editar y eliminar** | Corregir o borrar cualquier movimiento (CRUD completo). | RF2, RF3 |
| **Dashboard** | Balance del mes, total de ingresos y gastos. | RF5 |
| **Comparación mensual** | Gráfico de barras de ingresos y gastos de los últimos 6 meses. | RF5 |
| **Gastos por categoría** | Gráfico de torta del mes con monto y porcentaje por categoría. | RF5 |
| **Pepo, la mascota** | Cambia de ánimo (feliz, tranquilo, preocupado, triste) según el porcentaje de los ingresos que se ha gastado. | RF6 |
| **Mensajes de Pepo** | Reacciona con un mensaje y una animación cada vez que se registra un movimiento. | RF7 |
| **Recordatorio diario** | Aviso cuando el usuario no ha registrado nada en el día. | RF8 |
| **Historial** | Tabla de movimientos con filtros por tipo, categoría y mes. | RF9 |
| **Exportar a Excel** | Descarga en CSV el historial filtrado, con totales. | RF9 |
| **Presupuesto por categoría** | Tope mensual por categoría con barra verde, amarilla (80 %) o roja (excedido). Pepo avisa al acercarse al límite. | Nuevo |
| **Metas de ahorro** | Metas con valor objetivo, abonos y barra de progreso. Pepo celebra cuando se cumplen. | Nuevo |

### Cómo decide Pepo su estado de ánimo

| Gastos del mes frente a los ingresos | Pepo está |
|---|---|
| 70 % o menos | 😄 feliz |
| Entre 70 % y 100 % | 😐 preocupado |
| Más del 100 % | 😢 triste |
| Va bien en general, pero se pasó del presupuesto en alguna categoría | 😐 preocupado |

## Tecnologías

| Capa | Tecnología |
|---|---|
| Interfaz | HTML5, CSS3 (diseño responsive), JavaScript (módulos ES) |
| Autenticación | Firebase Authentication (correo y contraseña) |
| Base de datos | Cloud Firestore (base de datos NoSQL en la nube) |
| Gráficos | Barras hechas con CSS · torta con Chart.js |
| Publicación | GitHub Pages |
| Gestión del proyecto | GitHub (código) · Trello (tareas) · Scrum |

## Estructura del proyecto

```
FinPet/
├── index.html        Pantallas de la app (acceso, inicio, registrar, presupuesto, metas, historial)
├── css/
│   └── estilos.css   Diseño, colores, mascota y versión para celular
├── js/
│   ├── firebase.js   Conexión con el proyecto de Firebase
│   └── app.js        Lógica de la aplicación
└── README.md
```

## Base de datos

Firestore guarda tres colecciones. Cada documento lleva el `uid` del usuario dueño:

| Colección | Campos |
|---|---|
| `movimientos` | `uid`, `tipo` (gasto / ingreso), `monto`, `categoria`, `fecha`, `descripcion` |
| `presupuestos` | `uid`, `categoria`, `limite` |
| `metas` | `uid`, `nombre`, `objetivo`, `ahorrado` |

### Seguridad

- Las contraseñas las gestiona **Firebase Authentication**: nunca se guardan en el código ni en la base de datos.
- Las **reglas de seguridad de Firestore** solo permiten que un usuario lea, cree, edite o borre los documentos que tienen su propio `uid`.
- Las llaves de `firebase.js` son públicas por diseño de Firebase. La protección de los datos está en las reglas de seguridad.

## Cómo ejecutarlo en local

1. Clonar el repositorio o descargarlo como ZIP.
2. Abrir la carpeta en **Visual Studio Code**.
3. Instalar la extensión **Live Server**.
4. Clic derecho en `index.html` → **Open with Live Server**.

La app necesita conexión a internet porque los datos están en Firebase. No funciona abriendo el `index.html` con doble clic, porque los módulos de JavaScript requieren un servidor (Live Server o GitHub Pages).

## Cómo probarla rápido

1. Crear una cuenta.
2. Ir a **Historial** → **Cargar datos de ejemplo**. Se crean 6 meses de movimientos, tres presupuestos y una meta de ahorro.
3. Volver a **Inicio** para ver el dashboard, los gráficos y a Pepo.

## Próximas mejoras

- App instalable en el celular (PWA).
- Panel de administrador para gestionar usuarios y categorías.
