# Proceso de trabajo — Scrum

FinPet se desarrolla con **Scrum**: el trabajo se divide en sprints de una semana y en cada uno se entrega una versión funcional de la app. Todo el proceso se gestiona en este repositorio.

| Qué | Dónde está en GitHub |
|---|---|
| Product Backlog | [`docs/product-backlog.md`](product-backlog.md) e **Issues** (una por historia de usuario) |
| Sprints | **Milestones** (`Sprint 1`, `Sprint 2`, …) |
| Tablero | **Projects** → tablero «FinPet - scrum» |
| Actas de las ceremonias | [`docs/actas/`](actas/) |
| Código revisado | **Pull requests** |

## Roles

| Rol | Integrante | Responsabilidad |
|---|---|---|
| Product Owner | Alejandro Agamez | Escribe y prioriza el backlog, define los criterios de aceptación y acepta las historias. |
| Scrum Master | Esteban Ramírez | Facilita las ceremonias, mantiene el tablero al día y ayuda a quitar bloqueos. |
| Developer | Tatiana Marrugo | Programa, prueba y abre los pull requests de las historias del sprint. |

Los tres integrantes estiman las historias en Planning Poker y revisan el código de los demás.

## Ceremonias

| Ceremonia | Momento | Duración | Resultado |
|---|---|---|---|
| Sprint Planning | Inicio del sprint | 1 h | Objetivo del sprint e historias asignadas al milestone |
| Daily Scrum | Cada día | 15 min | ¿Qué hice?, ¿qué haré?, ¿tengo bloqueos? |
| Sprint Review | Fin del sprint | 30 min | Demostración; historias aceptadas o devueltas al backlog |
| Retrospectiva | Después de la Review | 30 min | Mejoras para el siguiente sprint |

Cada ceremonia deja un acta en `docs/actas/` con la [plantilla](actas/plantilla.md).

## Tablero

Columnas del tablero en **Projects**:

| Columna | Contiene |
|---|---|
| Product Backlog | Historias pendientes, por prioridad |
| Sprint Backlog | Historias del sprint actual |
| En proceso | Lo que alguien está haciendo (máximo 2 por persona) |
| En revisión | Pull request abierto, esperando revisión |
| Finalizado | Historias que cumplen la Definición de Hecho |

## Estimación y prioridad

- **Puntos de historia** con la serie de Fibonacci (1, 2, 3, 5, 8, 13), estimados en Planning Poker. Referencia: HU-05 «Registrar un ingreso» = 2 puntos.
- **Prioridad MoSCoW:** Must (imprescindible), Should (importante), Could (deseable), Won't (fuera del alcance por ahora).

## Flujo de trabajo

1. Tomar una issue del Sprint Backlog, asignársela y moverla a **En proceso**.
2. Crear una rama desde `main`: `feature/HU-27-racha`.
3. Hacer commits con el formato `tipo(HU-27): descripción`. Tipos: `feat`, `fix`, `style`, `docs`, `test`.
4. Abrir un pull request hacia `main` que diga `Closes #número-de-la-issue` y mover la tarjeta a **En revisión**.
5. Otro integrante revisa, prueba y aprueba.
6. Merge a `main`: la issue se cierra sola y GitHub Pages publica la nueva versión.

## Definición de Listo

Una historia entra a un sprint si está escrita como «Como… quiero… para…», tiene criterios de aceptación y está estimada en 8 puntos o menos.

## Definición de Hecho

Una historia está terminada cuando:

- [ ] Cumple todos sus criterios de aceptación.
- [ ] Entró a `main` por un pull request aprobado por otro integrante.
- [ ] Se probó en computador y en celular, sin errores en la consola.
- [ ] Los datos nuevos están protegidos por las reglas de Firestore.
- [ ] Funciona en la versión publicada en GitHub Pages.
