// ============================================================
// TABLA DEL HORARIO - Con temas de la semana actual
// ============================================================

import { planificacionService } from '../services/planificacionService.js';

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const HORAS = ['07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00',
               '15:00','16:00','17:00','18:00','19:00','20:00','21:00'];

// Configuración del ciclo
const CICLO_INICIO = new Date(2026, 9, 12);  // 12 de octubre de 2026

// ============================================================
// UTILIDADES
// ============================================================

/**
 * Calcula la semana actual del ciclo (1-16).
 */
function calcularSemanaActual() {
    const hoy = new Date();
    if (hoy < CICLO_INICIO) return 0;
    const dias = Math.floor((hoy - CICLO_INICIO) / (1000 * 60 * 60 * 24));
    return Math.floor(dias / 7) + 1;
}

/**
 * Obtiene el tema de la semana actual para una materia.
 */
function obtenerTemaDeSemana(codigo, semanaActual) {
    const plan = planificacionService.obtenerPorCodigo(codigo);
    if (!plan || !plan.semanas) return null;

    const semanaInfo = plan.semanas.find(s => s.numero === semanaActual);
    return semanaInfo ? semanaInfo.tema : null;
}

/**
 * Determina si una materia tiene planificación asociada.
 */
function tienePlanificacion(codigo) {
    return planificacionService.existe(codigo);
}

// ============================================================
// RENDER
// ============================================================

export function renderizarHorario(horario, contenedor, onMateriaClick) {
    contenedor.innerHTML = '';

    if (!horario.length) {
        contenedor.innerHTML = '<p class="sin-datos">📭 No hay horario cargado. Sube un Excel para comenzar.</p>';
        return;
    }

    // Semana actual (una sola vez)
    const semanaActual = calcularSemanaActual();

    const tabla = document.createElement('table');
    tabla.className = 'tabla-horario';

    const thead = document.createElement('thead');
    thead.innerHTML = `<tr><th>HORAS</th>${DIAS.map(d => `<th>${d}</th>`).join('')}</tr>`;
    tabla.appendChild(thead);

    const tbody = document.createElement('tbody');
    const ocupadas = new Set();

    HORAS.forEach(hora => {
        const fila = document.createElement('tr');
        fila.innerHTML = `<td class="hora">${hora}</td>`;

        DIAS.forEach(dia => {
            const key = `${dia}-${hora}`;
            if (ocupadas.has(key)) return;

            const bloque = horario.find(b => b.dia === dia && b.inicio === hora);

            if (bloque) {
                const td = document.createElement('td');
                td.rowSpan = bloque.duracion;
                td.className = 'materia clickeable';
                td.dataset.id = bloque.id;

                // 🔥 TEMA DE LA SEMANA ACTUAL (solo si la materia tiene planificación)
                const tienePlan = tienePlanificacion(bloque.codigo);
                let temaHtml = '';

                if (tienePlan && semanaActual >= 1 && semanaActual <= 16) {
                    const tema = obtenerTemaDeSemana(bloque.codigo, semanaActual);
                    if (tema) {
                        temaHtml = `<div class="tema-celda">📖 ${tema}</div>`;
                    }
                }

                td.innerHTML = `
                    <strong>${bloque.materia}</strong>
                    <small>(${bloque.codigo})</small>
                    ${temaHtml}
                    ${bloque.silabo
                        ? '<span class="badge badge-silabo">📄 Sílabo</span>'
                        : '<span class="badge badge-sin">Sin sílabo</span>'}
                `;
                td.addEventListener('click', () => onMateriaClick(bloque));
                fila.appendChild(td);

                for (let i = 1; i < bloque.duracion; i++) {
                    const h = HORAS[HORAS.indexOf(hora) + i];
                    if (h) ocupadas.add(`${dia}-${h}`);
                }
            } else if (!horario.some(b => b.dia === dia && b.inicio < hora && b.fin > hora)) {
                const td = document.createElement('td');
                td.className = 'vacio';
                fila.appendChild(td);
            }
        });

        tbody.appendChild(fila);
    });

    tabla.appendChild(tbody);
    contenedor.appendChild(tabla);
}