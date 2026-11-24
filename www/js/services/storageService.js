import { Preferences } from '@capacitor/preferences';

const KEY_HORARIO = 'horarioDocente';
const KEY_PLANIFICACION = 'planificacionDocente';
const KEY_SILABOS = 'silabosDocente';

export const StorageService = {

    // ──────── HORARIO ────────
    async guardarHorario(horario) {
        await Preferences.set({
            key: KEY_HORARIO,
            value: JSON.stringify(horario)
        });
    },

    async cargarHorario() {
        const { value } = await Preferences.get({ key: KEY_HORARIO });
        return value ? JSON.parse(value) : [];
    },

    // ──────── PLANIFICACION ────────
    async guardarPlanificacion(planificacion) {
        await Preferences.set({
            key: KEY_PLANIFICACION,
            value: JSON.stringify(planificacion)
        });
    },

    async cargarPlanificacion() {
        const { value } = await Preferences.get({ key: KEY_PLANIFICACION });
        return value ? JSON.parse(value) : {};
    },

    // ──────── SILABOS ────────
    async guardarSilabos(silabos) {
        await Preferences.set({
            key: KEY_SILABOS,
            value: JSON.stringify(silabos)
        });
    },

    async cargarSilabos() {
        const { value } = await Preferences.get({ key: KEY_SILABOS });
        return value ? JSON.parse(value) : {};
    },

    // ──────── LIMPIAR TODO ────────
    async limpiarTodo() {
        await Preferences.remove({ key: KEY_HORARIO });
        await Preferences.remove({ key: KEY_PLANIFICACION });
        await Preferences.remove({ key: KEY_SILABOS });
    }
};