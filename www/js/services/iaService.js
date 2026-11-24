// ============================================================
// SERVICIO DE IA CONVERSACIONAL (Google Gemini)
// Con sistema de fallback automático entre múltiples modelos
// ============================================================

export class IAService {
    constructor() {
        this.apiKey = 'TU_API_KEY_AQUI';

        // Lista de modelos en orden de preferencia (fallback automático)
        this.modelosFallback = [
            'gemini-2.0-flash',
            'gemini-2.5-flash',
            'gemini-2.0-flash-001',
            'gemini-1.5-flash',
            'gemini-flash-latest',
        ];

        this.modeloActual = 0;
        this.urlBase = 'https://generativelanguage.googleapis.com/v1beta/models';
        this.historial = [];
    }

    /**
     * Obtiene el nombre del modelo actual.
     */
    get modelo() {
        return this.modelosFallback[this.modeloActual];
    }

    /**
     * Establece la API Key.
     */
    setApiKey(key) {
        this.apiKey = key;
    }

    /**
     * Verifica si hay API Key configurada.
     */
    tieneApiKey() {
        return this.apiKey &&
               this.apiKey !== 'TU_API_KEY_AQUI' &&
               this.apiKey.length > 10;
    }

    /**
     * Construye el contexto del horario para enviarlo a Gemini.
     */
    construirContexto(horario, planificacion, semanaActual) {
        const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const diaActual = DIAS[new Date().getDay()];
        const horaActual = new Date().toLocaleTimeString('es-EC', {
            hour: '2-digit',
            minute: '2-digit'
        });

        // Horario resumido
        const horarioTexto = horario.map(b =>
            `- ${b.dia} ${b.inicio}-${b.fin}: ${b.materia} (${b.codigo})`
        ).join('\n');

        // Planificación resumida
        let planTexto = '';
        for (const [codigo, plan] of Object.entries(planificacion)) {
            const semanaInfo = plan.semanas?.find(s => s.numero === semanaActual);
            if (semanaInfo) {
                planTexto += `- ${codigo}: Semana ${semanaActual} = "${semanaInfo.tema}" (Unidad: ${semanaInfo.unidad || 'N/A'})\n`;
            }
        }

        return `
Eres un asistente académico personal del docente MANUEL WILLIAM VILLA QUISHPE.
Responde de forma breve, clara y en español.

FECHA Y HORA ACTUAL:
- Hoy es ${diaActual}
- Hora actual: ${horaActual}
- Semana del ciclo: ${semanaActual} de 16

HORARIO SEMANAL DEL DOCENTE:
${horarioTexto}

PLANIFICACIÓN DE LA SEMANA ACTUAL:
${planTexto || '(Sin planificación cargada)'}

INSTRUCCIONES:
- Responde SIEMPRE con la información COMPLETA, sin cortar frases a la mitad.
- Sé conciso pero no incompleto. Termina siempre tus oraciones con punto.
- Si te preguntan por horas, di el total Y la lista de clases con sus horarios.
- Si te preguntan por una clase, incluye materia, hora y código.
- Si te preguntan por un tema, incluye la semana y el nombre del tema.
- Si no sabes algo, di "No tengo esa información en tu horario".
- No inventes información.
- Habla en primera persona, como si fueras el asistente del docente.
        `.trim();
    }

    /**
     * Envía una pregunta a Gemini y obtiene la respuesta.
     * Prueba con múltiples modelos si el primero falla.
     */
    async preguntar(pregunta, horario, planificacion, semanaActual) {
        if (!this.tieneApiKey()) {
            throw new Error('API Key no configurada. Presiona el botón IA de nuevo para configurarla.');
        }

        const contexto = this.construirContexto(horario, planificacion, semanaActual);

        // Construir historial de conversación
        const contents = [
            {
                role: 'user',
                parts: [{ text: contexto }]
            },
            {
                role: 'model',
                parts: [{ text: 'Entendido. Estoy listo para ayudarte con tu horario.' }]
            },
            ...this.historial,
            {
                role: 'user',
                parts: [{ text: pregunta }]
            }
        ];

        // 🔄 Intentar con cada modelo hasta que uno funcione
        let ultimoError = null;

        for (let i = 0; i < this.modelosFallback.length; i++) {
            const modelo = this.modelosFallback[i];
            console.log(`🤖 Intentando con modelo: ${modelo}`);

            try {
                const url = `${this.urlBase}/${modelo}:generateContent?key=${this.apiKey}`;

                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents,
                        generationConfig: {
                            temperature: 0.7,
                            maxOutputTokens: 800,
                            topP: 0.95,
                            topK: 40,
                        },
                    }),
                });

                // Si el modelo no funciona, probar el siguiente
                if (!response.ok) {
                    const error = await response.json();
                    const errorMsg = error.error?.message || `Error ${response.status}`;
                    console.warn(`⚠️ ${modelo} falló: ${errorMsg}`);
                    ultimoError = new Error(errorMsg);
                    continue;
                }

                const data = await response.json();
                const respuesta = data.candidates?.[0]?.content?.parts?.[0]?.text;

                if (!respuesta) {
                    console.warn(`⚠️ ${modelo} devolvió respuesta vacía`);
                    ultimoError = new Error('Respuesta vacía del modelo');
                    continue;
                }

                // Guardar en historial (máximo 10 mensajes)
                this.historial.push(
                    { role: 'user', parts: [{ text: pregunta }] },
                    { role: 'model', parts: [{ text: respuesta }] }
                );
                if (this.historial.length > 20) {
                    this.historial = this.historial.slice(-20);
                }

                console.log(`✅ Respuesta obtenida con: ${modelo}`);

                // Recordar el modelo que funcionó para la próxima
                this.modeloActual = i;

                return respuesta.trim();

            } catch (error) {
                console.warn(`⚠️ Error con ${modelo}:`, error.message);
                ultimoError = error;
                continue;
            }
        }

        // Si NINGÚN modelo funcionó
        throw new Error(
            ultimoError?.message ||
            'Todos los modelos están ocupados. Intenta de nuevo en 1 minuto.'
        );
    }

    /**
     * Limpia el historial de conversación.
     */
    limpiarHistorial() {
        this.historial = [];
    }
}

// Instancia única (Singleton)
export const iaService = new IAService();