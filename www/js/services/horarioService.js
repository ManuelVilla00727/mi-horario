export function calcularDuracion(horaInicio, horaFin) {
    const [h1, m1] = horaInicio.split(':').map(Number);
    const [h2, m2] = horaFin.split(':').map(Number);
    const minutosInicio = h1 * 60 + m1;
    const minutosFin = h2 * 60 + m2;

    if (minutosFin <= minutosInicio) {
        throw new Error(`Horario inválido: ${horaInicio} - ${horaFin}`);
    }

    return (minutosFin - minutosInicio) / 60;
}

export function normalizarHorario(filas) {
    return filas.map((fila, index) => {
        const dia = String(fila['Día'] || '').trim();
        const inicio = String(fila['Hora Inicio'] || '').trim();
        const fin = String(fila['Hora Fin'] || '').trim();
        const materia = String(fila['Materia'] || '').trim();
        const codigo = String(fila['Código'] || '').trim();

        if (!dia || !inicio || !fin || !materia || !codigo) {
            throw new Error(`Fila ${index + 2}: campos vacíos.`);
        }

        const duracion = calcularDuracion(inicio, fin);

        return {
            id: crypto.randomUUID(),
            dia, inicio, fin, materia, codigo, duracion,
            silabo: null
        };
    });
}

export function validarSolapamientos(horario) {
    const porDia = horario.reduce((acc, bloque) => {
        acc[bloque.dia] = acc[bloque.dia] || [];
        acc[bloque.dia].push(bloque);
        return acc;
    }, {});

    for (const dia in porDia) {
        const bloques = porDia[dia].sort((a, b) => a.inicio.localeCompare(b.inicio));
        for (let i = 0; i < bloques.length - 1; i++) {
            if (bloques[i].fin > bloques[i + 1].inicio) {
                throw new Error(`Solapamiento el ${dia}: "${bloques[i].materia}" y "${bloques[i + 1].materia}".`);
            }
        }
    }
}