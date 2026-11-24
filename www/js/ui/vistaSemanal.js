/**
 * Renderiza la vista de planificación semanal.
 *
 * @param {Array} horario - Lista de bloques del horario
 * @param {HTMLElement} contenedor - Elemento donde se renderiza
 * @param {PlanificacionService} planificacionService - Servicio de planificación
 */
export function renderizarVistaSemanal(horario, contenedor, planificacionService) {
    contenedor.innerHTML = '';

    const materiasUnicas = agruparMateriasUnicas(horario);

    contenedor.appendChild(crearHeader());

    materiasUnicas.forEach(materia => {
        // Saltar actividades administrativas (no tienen planificación)
        if (esActividadAdministrativa(materia.codigo)) {
            return;
        }

        contenedor.appendChild(crearCardMateria(materia, planificacionService));
    });
}

/**
 * Verifica si un código corresponde a una actividad administrativa.
 */
function esActividadAdministrativa(codigo) {
    return ['PLAN_', 'TUT_', 'ELAB_', 'JEFE_'].some(prefijo =>
        codigo.startsWith(prefijo)
    );
}

/**
 * Agrupa el horario por materias únicas.
 */
function agruparMateriasUnicas(horario) {
    const mapa = new Map();

    horario.forEach(bloque => {
        if (!mapa.has(bloque.materia)) {
            mapa.set(bloque.materia, {
                materia: bloque.materia,
                codigo: bloque.codigo,
                apariciones: []
            });
        }
        mapa.get(bloque.materia).apariciones.push({
            dia: bloque.dia,
            inicio: bloque.inicio,
            fin: bloque.fin
        });
    });

    return Array.from(mapa.values());
}

/**
 * Crea el header de la vista.
 */
function crearHeader() {
    const header = document.createElement('div');
    header.className = 'planificacion-header';
    header.innerHTML = `
        <h2>📅 Planificación Semanal</h2>
        <p class="subtitulo">Semanas con contenido académico</p>
    `;
    return header;
}

/**
 * Crea la tarjeta de una materia con sus semanas.
 */
function crearCardMateria(materia, planificacionService) {
    const planificacion = planificacionService.obtenerPorCodigo(materia.codigo);

    const card = document.createElement('div');
    card.className = 'materia-card';

    const horariosHtml = materia.apariciones
        .map(a => `<span class="badge-dia">${a.dia} ${a.inicio}-${a.fin}</span>`)
        .join('');

    const semanasHtml = planificacion
        ? renderizarSemanas(planificacion.semanas)
        : '<p class="sin-planificacion">Sin planificación cargada.</p>';

    card.innerHTML = `
        <div class="materia-header">
            <h3>${materia.materia}</h3>
            <span class="codigo">${materia.codigo}</span>
        </div>
        <div class="materia-horarios">${horariosHtml}</div>
        <div class="semanas-grid">${semanasHtml}</div>
    `;

    return card;
}

/**
 * Renderiza la lista de semanas.
 */
function renderizarSemanas(semanas) {
    return semanas.map(semana => `
        <div class="semana-item">
            <div class="semana-numero">S${semana.numero}</div>
            <div class="semana-contenido">
                <div class="semana-unidad">Unidad ${semana.unidad}</div>
                <div class="semana-tema">${semana.tema}</div>
            </div>
        </div>
    `).join('');
}