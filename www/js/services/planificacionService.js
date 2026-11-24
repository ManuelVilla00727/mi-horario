/**
 * Servicio de planificación.
 * Los datos vienen del Excel, no están hardcodeados.
 */
export class PlanificacionService {
    constructor() {
        this.planificacion = {};
    }

    /**
     * Carga la planificación (desde el Excel).
     */
    cargar(planificacion) {
        this.planificacion = planificacion || {};
    }

    /**
     * Obtiene la planificación de una materia por código.
     */
    obtenerPorCodigo(codigo) {
        return this.planificacion[codigo] || null;
    }

    /**
     * Verifica si existe planificación para un código.
     */
    existe(codigo) {
        return codigo in this.planificacion;
    }

    /**
     * Obtiene todas las planificaciones.
     */
    obtenerTodas() {
        return this.planificacion;
    }
}

// Instancia única (Singleton)
export const planificacionService = new PlanificacionService();