# Product Backlog

Épicas: **E1** Gestión de cuenta · **E2** Registro de movimientos · **E3** Consulta y análisis · **E4** Mascota y motivación · **E5** Planeación financiera · **E6** Infraestructura y calidad

## Historias de usuario

| ID | Épica | Historia de usuario | Criterios de aceptación | Req. | Prioridad | Pts | Sprint | Estado |
|---|---|---|---|---|---|---|---|---|
| HU-01 | E1 | Como usuario nuevo, quiero crear una cuenta con mi nombre, correo y contraseña, para guardar mis finanzas de forma privada. | Con datos válidos se crea la cuenta y entro a la app. Con contraseña de menos de 6 caracteres o correo ya usado, se muestra un mensaje y no se crea. | RF1 | Must | 3 | 2 | ✅ Hecho |
| HU-02 | E1 | Como usuario registrado, quiero iniciar y cerrar sesión, para acceder a mis datos desde cualquier dispositivo. | Con datos correctos entro a la app; con datos incorrectos aparece «Correo o contraseña incorrectos». Al cerrar sesión vuelvo a la pantalla de acceso. | RF1 | Must | 2 | 2 | ✅ Hecho |
| HU-03 | E1 | Como usuario que olvidó su contraseña, quiero recibir un enlace en mi correo, para crear una contraseña nueva sin perder mis datos. | Al pedir la recuperación llega un correo con un enlace que permite crear una contraseña nueva. | RF14 | Should | 2 | 7 | ✅ Hecho |
| HU-04 | E2 | Como usuario, quiero registrar un gasto con monto, categoría, fecha y descripción, para saber en qué gasto mi dinero. | El gasto se guarda, aparece en el historial y el balance del mes baja. Un monto vacío o en 0 muestra un error. | RF2 | Must | 3 | 2 | ✅ Hecho |
| HU-05 | E2 | Como usuario, quiero registrar un ingreso, para ver cuánto dinero me entra. | El ingreso se guarda, aparece en el historial y el balance del mes sube. | RF3 | Must | 2 | 2 | ✅ Hecho |
| HU-06 | E2 | Como usuario, quiero elegir una categoría para cada movimiento, para agrupar mis gastos e ingresos. | El formulario muestra categorías de gasto o de ingreso según el tipo, y cada movimiento guarda su categoría. | RF4 | Must | 2 | 2 | ✅ Hecho |
| HU-07 | E2 | Como usuario, quiero escribir los montos con puntos de mil, para leer las cifras con facilidad. | Al escribir 1500000 el campo muestra 1.500.000 y se guarda 1500000. | RNF-01 | Could | 1 | 7 | ✅ Hecho |
| HU-08 | E2 | Como usuario, quiero editar un movimiento ya registrado, para corregir un error sin borrarlo. | El formulario se llena con los datos; al guardar, el historial y el balance muestran el cambio. | RF13 | Should | 3 | 7 | ✅ Hecho |
| HU-09 | E2 | Como usuario, quiero eliminar un movimiento, para quitar registros equivocados. | La app pide confirmación; al aceptar, el movimiento desaparece y el balance se actualiza. | RF2 | Should | 1 | 3 | ✅ Hecho |
| HU-10 | E3 | Como usuario, quiero ver el balance, los ingresos y los gastos del mes, para saber cómo voy este mes. | El inicio muestra los totales del mes en pesos y se actualiza con cada registro. | RF5 | Must | 3 | 3 | ✅ Hecho |
| HU-11 | E3 | Como usuario, quiero comparar mis ingresos y gastos de los últimos 6 meses, para detectar si estoy gastando más. | El inicio muestra un gráfico de barras con 6 meses. | RF5 | Must | 5 | 3 | ✅ Hecho |
| HU-12 | E3 | Como usuario, quiero ver en qué categorías gasto más este mes, para identificar dónde recortar. | El inicio muestra un gráfico de torta con el monto y el porcentaje de cada categoría. | RF12 | Should | 3 | 6 | ✅ Hecho |
| HU-13 | E3 | Como usuario, quiero consultar mi historial y filtrarlo por tipo, categoría y mes, para encontrar un movimiento rápido. | La tabla va del más reciente al más antiguo y se ajusta al cambiar cualquier filtro. | RF9 | Must | 3 | 3 | ✅ Hecho |
| HU-14 | E3 | Como usuario, quiero descargar mi historial en Excel, para analizarlo por mi cuenta. | Se descarga un CSV con los movimientos filtrados y los totales. | RF15 | Could | 2 | 7 | ✅ Hecho |
| HU-15 | E4 | Como usuario, quiero ver una mascota que cambie de ánimo según mis finanzas, para sentir motivación para mejorar. | Feliz si gasté 70 % o menos de mis ingresos, preocupada entre 70 % y 100 %, triste si gasté más de lo que me entró. | RF6 | Must | 5 | 3 | ✅ Hecho |
| HU-16 | E4 | Como usuario, quiero recibir un mensaje de la mascota al registrar, para sentir que la app me acompaña. | Después de cada registro la mascota salta y muestra un mensaje según el movimiento. | RF7 | Must | 3 | 3 | ✅ Hecho |
| HU-17 | E4 | Como usuario, quiero ver un aviso si hoy no he registrado nada, para no olvidar el hábito. | Si no hay movimientos de hoy, aparece un aviso amarillo arriba. | RF8 | Should | 2 | 3 | ✅ Hecho |
| HU-18 | E4 | Como usuario, quiero que la mascota sea un búho ilustrado con expresiones, para conectar más con ella. | Pepo muestra 4 estados: tranquilo, feliz, preocupado y triste. | RF6 | Should | 3 | 5 | ✅ Hecho |
| HU-19 | E5 | Como usuario, quiero definir un tope mensual por categoría, para no gastar de más en lo que más me cuesta. | La barra se pone amarilla al 80 % y roja al superar el tope; la mascota avisa al registrar un gasto. | RF10 | Should | 5 | 5 | ✅ Hecho |
| HU-20 | E5 | Como usuario, quiero crear metas de ahorro y abonarles, para ahorrar para algo concreto. | La meta muestra lo ahorrado, el porcentaje y lo que falta; al 100 % la mascota felicita. | RF11 | Should | 5 | 6 | ✅ Hecho |
| HU-21 | E6 | Como equipo de desarrollo, quiero guardar los datos en Firebase, para que la cuenta funcione desde cualquier dispositivo. | Al iniciar sesión en otro dispositivo aparecen los mismos movimientos. | RNF-04 | Must | 8 | 4 | ✅ Hecho |
| HU-22 | E6 | Como usuario, quiero que nadie más pueda ver mis datos, para proteger mi información financiera. | Las reglas de Firestore solo permiten leer o modificar documentos con el uid del usuario con sesión. | RNF-03 | Must | 3 | 4 | ✅ Hecho |
| HU-23 | E6 | Como usuario, quiero usar la app desde el celular, para registrar mis gastos donde esté. | En pantallas de 400 px todo se ve en una columna, sin desplazamiento horizontal. | RNF-05 | Must | 3 | 3 | ✅ Hecho |
| HU-24 | E6 | Como equipo de desarrollo, quiero publicar la app con un enlace, para que cualquiera pueda probarla. | La app abre en tatmarrugo2.github.io/FinPet. | RNF-04 | Must | 1 | 3 | ✅ Hecho |
| HU-25 | E6 | Como equipo de desarrollo, quiero tener el repositorio y la estructura del proyecto, para trabajar de forma ordenada. | Existe el repositorio con index.html, css/ y js/, y los integrantes como colaboradores. | RNF-07 | Must | 1 | 1 | ✅ Hecho |
| HU-26 | E2 | Como usuario, quiero crear mis propias categorías, para clasificar gastos que no están en la lista. | Puedo crear y eliminar una categoría propia, y aparece en el registro y en los filtros. | RF4 | Should | 5 | 8 | ✅ Hecho |
| HU-27 | E4 | Como usuario, quiero ver cuántos días seguidos llevo registrando, para mantener la constancia. | El inicio muestra «Racha: N días». Si un día no registro nada, la racha vuelve a 0 y Pepo se entristece. | RF7 | Should | 3 | 8 | ✅ Hecho |
| HU-34 | E1 | Como administrador, quiero gestionar usuarios y categorías, para mantener la app en orden. | Existe un panel solo para el administrador con la lista de usuarios y las categorías globales. | — | Won't | 13 | — | Por hacer |

## Sprints

| Sprint | Objetivo | Historias | Puntos | Estado |
|---|---|---|---|---|
| 1 | Repositorio y base del proyecto | HU-25 | 1 | ✅ Terminado |
| 2 | Crear la cuenta y registrar movimientos | HU-01, HU-02, HU-04, HU-05, HU-06 | 12 | ✅ Terminado |
| 3 | MVP: dashboard, mascota, historial y publicación | HU-09, HU-10, HU-11, HU-13, HU-15, HU-16, HU-17, HU-23, HU-24 | 26 | ✅ Terminado |
| 4 | Datos en la nube de forma segura | HU-21, HU-22 | 11 | ✅ Terminado |
| 5 | Pepo como búho y presupuestos | HU-18, HU-19 | 8 | ✅ Terminado |
| 6 | Metas de ahorro y gastos por categoría | HU-12, HU-20 | 8 | ✅ Terminado |
| 7 | Completar el CRUD y mejorar la usabilidad | HU-03, HU-07, HU-08, HU-14 | 8 | ✅ Terminado |
| 8 | Personalización y constancia | HU-26, HU-27 | 8 | ✅ Terminado |
