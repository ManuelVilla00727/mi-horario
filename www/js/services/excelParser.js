import * as XLSX from 'xlsx';

/**
 * Parser profesional multi-hoja del Excel maestro.
 *
 * Detecta y procesa 3 hojas:
 *   - HORARIO:       Día | Hora Inicio | Hora Fin | Materia | Código
 *   - PLANIFICACION: Código | Semana | Unidad | Tema
 *   - SILABOS:       Código | Nombre PDF | Temas (opcional)
 *
 * Devuelve un objeto con los datos de las 3 hojas.
 */
export async function parseExcelMaestro(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: 'array' });

                console.log('📊 Hojas detectadas:', workbook.SheetNames);

                // Extraer cada hoja por nombre (case-insensitive)
                const hojaHorario = buscarHoja(workbook, ['horario', 'horarios']);
                const hojaPlanificacion = buscarHoja(workbook, ['planificacion', 'planificación', 'planificaciones']);
                const hojaSilabos = buscarHoja(workbook, ['silabos', 'sílabos', 'silabo', 'sílabo']);

                // Validar hoja HORARIO (obligatoria)
                if (!hojaHorario) {
                    return reject(new Error('No se encontró la hoja "HORARIO" en el Excel.'));
                }

                // Parsear cada hoja
                const horario = parsearHojaHorario(hojaHorario);
                const planificacion = hojaPlanificacion ? parsearHojaPlanificacion(hojaPlanificacion) : {};
                const silabos = hojaSilabos ? parsearHojaSilabos(hojaSilabos) : {};

                if (!horario.length) {
                    return reject(new Error('La hoja HORARIO está vacía.'));
                }

                console.log(`✅ Horario: ${horario.length} bloques`);
                console.log(`✅ Planificación: ${Object.keys(planificacion).length} materias`);
                console.log(`✅ Sílabos: ${Object.keys(silabos).length} materias`);

                resolve({
                    horario,
                    planificacion,
                    silabos
                });

            } catch (error) {
                console.error('Error al procesar el Excel:', error);
                reject(new Error('Error al leer el Excel: ' + error.message));
            }
        };

        reader.onerror = () => reject(new Error('Error al leer el archivo.'));
        reader.readAsArrayBuffer(file);
    });
}

// ─────────────────────────────────────────────────────────
// UTILIDADES
// ─────────────────────────────────────────────────────────

/**
 * Busca una hoja por múltiples nombres posibles.
 */
function buscarHoja(workbook, nombresPosibles) {
    for (const nombre of workbook.SheetNames) {
        const nombreLower = nombre.toLowerCase().trim();
        if (nombresPosibles.some(p => nombreLower.includes(p))) {
            return workbook.Sheets[nombre];
        }
    }
    return null;
}

/**
 * Parsea la hoja HORARIO (formato matricial o plano).
 */
function parsearHojaHorario(sheet) {
    const filas = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

    if (!filas.length) return [];

    // Detectar formato
    const primeraFila = (filas[0] || []).map(c => String(c).trim().toUpperCase());
    const esMatricial = primeraFila[0] === 'HORAS' && primeraFila.includes('LUNES');

    if (esMatricial) {
        console.log('🎯 Formato HORARIO: MATRICIAL');
        return parsearMatricial(sheet);
    }

    console.log('🎯 Formato HORARIO: PLANO');
    return parsearPlano(filas);
}

/**
 * Parser MATRICIAL (SIGUTAC) con celdas combinadas.
 */
function parsearMatricial(sheet) {
    const filas = expandirCeldasCombinadas(sheet);
    const encabezados = (filas[0] || []).map(c => String(c).trim());

    const columnasDia = [];
    for (let i = 1; i < encabezados.length; i++) {
        const dia = encabezados[i];
        if (dia && dia.toUpperCase() !== 'HORAS') {
            columnasDia.push({ idx: i, dia: normalizarDia(dia) });
        }
    }

    const resultado = [];

    for (const { idx, dia } of columnasDia) {
        let buffer = null;

        for (let rowIdx = 1; rowIdx < filas.length; rowIdx++) {
            const horaRaw = filas[rowIdx] ? filas[rowIdx][0] : '';
            const hora = normalizarHora(horaRaw);
            if (!hora) continue;

            const materiaRaw = filas[rowIdx] ? filas[rowIdx][idx] : '';
            const materia = String(materiaRaw || '').trim();

            if (materia) {
                if (buffer && buffer.materia === materia) {
                    buffer.horaFin = calcularHoraFin(hora);
                } else {
                    if (buffer) resultado.push(buffer.aFila());
                    buffer = new BloqueBuffer(dia, hora, materia);
                }
            } else {
                if (buffer) {
                    resultado.push(buffer.aFila());
                    buffer = null;
                }
            }
        }

        if (buffer) resultado.push(buffer.aFila());
    }

    return resultado;
}

/**
 * Parser PLANO (Día | Hora Inicio | Hora Fin | Materia | Código).
 */
function parsearPlano(filas) {
    const encabezados = (filas[0] || []).map(c => String(c).trim());
    const idxDia = encabezados.findIndex(h => /d[ií]a/i.test(h));
    const idxInicio = encabezados.findIndex(h => /inicio/i.test(h));
    const idxFin = encabezados.findIndex(h => /fin/i.test(h));
    const idxMateria = encabezados.findIndex(h => /materia/i.test(h));
    const idxCodigo = encabezados.findIndex(h => /c[oó]digo/i.test(h));

    if (idxDia === -1 || idxInicio === -1 || idxFin === -1 || idxMateria === -1) {
        throw new Error('Formato no reconocido. Faltan columnas.');
    }

    const resultado = [];
    for (let i = 1; i < filas.length; i++) {
        const fila = filas[i];
        const dia = normalizarDia(fila[idxDia]);
        const inicio = normalizarHora(fila[idxInicio]);
        const fin = normalizarHora(fila[idxFin]);
        const materiaRaw = String(fila[idxMateria] || '').trim();
        const codigoRaw = idxCodigo >= 0 ? String(fila[idxCodigo] || '').trim() : '';

        if (!dia || !inicio || !fin || !materiaRaw) continue;

        const { nombre, codigo } = codigoRaw
            ? { nombre: materiaRaw, codigo: codigoRaw }
            : extraerMateriaYCodigo(materiaRaw);

        resultado.push({
            'Día': dia,
            'Hora Inicio': inicio,
            'Hora Fin': fin,
            'Materia': nombre,
            'Código': codigo || 'SIN_COD'
        });
    }
    return resultado;
}

/**
 * Parsea la hoja PLANIFICACION.
 * Devuelve un objeto indexado por código.
 */
function parsearHojaPlanificacion(sheet) {
    const filas = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    if (!filas.length) return {};

    const planificacion = {};

    filas.forEach(fila => {
        const codigo = String(fila['Código'] || fila['Código'] || '').trim();
        const semana = parseInt(fila['Semana'] || 0, 10);
        const unidad = String(fila['Unidad'] || '').trim();
        const tema = String(fila['Tema'] || '').trim();

        if (!codigo || !semana || !tema) return;

        if (!planificacion[codigo]) {
            planificacion[codigo] = {
                codigo,
                semanas: []
            };
        }

        planificacion[codigo].semanas.push({
            numero: semana,
            unidad,
            tema
        });
    });

    // Ordenar semanas
    Object.values(planificacion).forEach(p => {
        p.semanas.sort((a, b) => a.numero - b.numero);
    });

    return planificacion;
}

/**
 * Parsea la hoja SILABOS.
 */
function parsearHojaSilabos(sheet) {
    const filas = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    if (!filas.length) return {};

    const silabos = {};

    filas.forEach(fila => {
        const codigo = String(fila['Código'] || '').trim();
        const archivo = String(fila['Nombre PDF'] || fila['Archivo'] || '').trim();
        const temas = String(fila['Temas'] || '').split(';').map(t => t.trim()).filter(Boolean);

        if (!codigo) return;

        silabos[codigo] = {
            archivo,
            temas
        };
    });

    return silabos;
}

// ─────────────────────────────────────────────────────────
// UTILIDADES DE HORAS Y MATERIAS
// ─────────────────────────────────────────────────────────

class BloqueBuffer {
    constructor(dia, horaInicio, materia) {
        this.dia = dia;
        this.horaInicio = horaInicio;
        this.horaFin = calcularHoraFin(horaInicio);
        this.materia = materia;
    }

    aFila() {
        const { nombre, codigo } = extraerMateriaYCodigo(this.materia);
        return {
            'Día': this.dia,
            'Hora Inicio': this.horaInicio,
            'Hora Fin': this.horaFin,
            'Materia': nombre,
            'Código': codigo
        };
    }
}

function expandirCeldasCombinadas(sheet) {
    const filas = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    const merges = sheet['!merges'] || [];

    console.log(`🔗 Celdas combinadas: ${merges.length}`);

    for (const merge of merges) {
        const { s, e } = merge;
        const valorOrigen = filas[s.r] ? filas[s.r][s.c] : '';

        for (let r = s.r; r <= e.r; r++) {
            if (!filas[r]) filas[r] = [];
            for (let c = s.c; c <= e.c; c++) {
                filas[r][c] = valorOrigen;
            }
        }
    }

    return filas;
}

function extraerMateriaYCodigo(texto) {
    const match = texto.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
    if (match) {
        return { nombre: match[1].trim(), codigo: match[2].trim() };
    }
    return { nombre: texto.trim(), codigo: 'SIN_COD' };
}

function normalizarHora(hora) {
    if (!hora && hora !== 0) return '';
    let str = String(hora).trim();

    if (/^\d+(\.\d+)?$/.test(str)) {
        const num = parseFloat(str);
        if (num > 1) {
            const s = String(Math.floor(num)).padStart(6, '0');
            return `${s.slice(0, 2)}:${s.slice(2, 4)}`;
        }
        const totalMin = Math.round(num * 24 * 60);
        return `${String(Math.floor(totalMin / 60)).padStart(2, '0')}:${String(totalMin % 60).padStart(2, '0')}`;
    }

    const partes = str.split(':');
    if (partes.length >= 2) {
        return `${String(partes[0]).padStart(2, '0')}:${String(partes[1]).padStart(2, '0')}`;
    }
    return '';
}

function calcularHoraFin(horaInicio) {
    const [hh, mm] = horaInicio.split(':').map(Number);
    const totalMin = hh * 60 + mm + 60;
    return `${String(Math.floor(totalMin / 60) % 24).padStart(2, '0')}:${String(totalMin % 60).padStart(2, '0')}`;
}

function normalizarDia(dia) {
    if (!dia) return '';
    const str = String(dia).trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const mapa = {
        'lunes': 'Lunes', 'martes': 'Martes', 'miercoles': 'Miércoles',
        'jueves': 'Jueves', 'viernes': 'Viernes',
        'sabado': 'Sábado', 'domingo': 'Domingo'
    };
    return mapa[str] || dia;
}