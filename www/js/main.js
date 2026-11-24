// ============================================================
// MAIN - Punto de entrada de la aplicación
// ============================================================

import { parseExcelMaestro } from './services/excelParser.js';
import { normalizarHorario, validarSolapamientos } from './services/horarioService.js';
import { StorageService } from './services/storageService.js';
import { AlarmService } from './services/alarmService.js';
import { planificacionService } from './services/planificacionService.js';
import { iaService } from './services/iaService.js';
import { renderizarHorario } from './ui/tablaHorario.js';
import { abrirModalMateria } from './ui/modalMateria.js';
import { renderizarControles } from './ui/controles.js';
import { renderizarVistaSemanal } from './ui/vistaSemanal.js';
import { abrirAsistenteIA } from './ui/asistenteIA.js';

// ============================================================
// REFERENCIAS DEL DOM
// ============================================================
const contenedorTabla = document.getElementById('tablaHorario');
const contenedorControles = document.getElementById('controles');
const reloj = document.getElementById('relojActual');
const vistaHorario = document.getElementById('vistaHorario');
const vistaPlanificacion = document.getElementById('vistaPlanificacion');
const planificacionSemanal = document.getElementById('planificacionSemanal');
const tabs = document.querySelectorAll('.tab');

// ============================================================
// ESTADO GLOBAL
// ============================================================
let horarioActual = [];
let alarmasActivas = false;

const alarmService = new AlarmService();

// ============================================================
// INICIALIZACIÓN
// ============================================================
async function init() {
    console.log('🚀 Iniciando app...');

    // 1. Inicializar servicio de alarmas
    await alarmService.inicializar();

    // 2. Reloj en vivo
    setInterval(() => {
        if (reloj) reloj.textContent = new Date().toLocaleTimeString('es-EC');
    }, 1000);

    // 3. Renderizar controles
    renderizarControles(contenedorControles, {
        onExcel: manejarExcel,
        onReset: resetear,
        onAlarmas: toggleAlarmas,
        onAnticipacion: (e) => alarmService.setMinutosAnticipacion(Number(e.target.value)),
    });

    // 4. Manejo de pestañas (FIX: clase .hidden universal)
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            if (tab.dataset.vista === 'horario') {
                vistaHorario.classList.remove('hidden');
                vistaPlanificacion.classList.add('hidden');
            } else {
                vistaHorario.classList.add('hidden');
                vistaPlanificacion.classList.remove('hidden');
                renderizarVistaSemanal(
                    horarioActual,
                    planificacionSemanal,
                    planificacionService
                );
            }
        });
    });

    // 5. Cargar datos guardados
    horarioActual = await StorageService.cargarHorario();
    const planificacion = await StorageService.cargarPlanificacion();
    planificacionService.cargar(planificacion);

    // 🔍 Diagnóstico
    console.log('📊 Horario cargado:', horarioActual.length, 'bloques');
    console.log('📚 Planificación cargada:', Object.keys(planificacion).length, 'materias');

    // 6. Renderizar
    renderizarHorario(horarioActual, contenedorTabla, manejarClickMateria);
    alarmService.setHorario(horarioActual);

    // 7. Crear botón flotante del asistente IA
    crearBotonAsistenteIA();

    console.log('✅ App lista');
}

// ============================================================
// MANEJO DEL EXCEL
// ============================================================
async function manejarExcel(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
        const { horario, planificacion, silabos } = await parseExcelMaestro(file);

        const horarioNormalizado = normalizarHorario(horario);
        validarSolapamientos(horarioNormalizado);

        horarioActual = horarioNormalizado;

        // Guardar todo
        await StorageService.guardarHorario(horarioActual);
        await StorageService.guardarPlanificacion(planificacion);
        await StorageService.guardarSilabos(silabos);

        // Cargar en el servicio
        planificacionService.cargar(planificacion);

        // Renderizar
        renderizarHorario(horarioActual, contenedorTabla, manejarClickMateria);
        alarmService.setHorario(horarioActual);

        const totalSemanas = Object.values(planificacion).reduce(
            (s, p) => s + p.semanas.length,
            0
        );

        alert(`✅ Excel cargado:
        • ${horarioActual.length} bloques de horario
        • ${Object.keys(planificacion).length} materias con planificación
        • ${totalSemanas} semanas en total`);

    } catch (error) {
        console.error(error);
        alert('❌ ' + error.message);
    }
}

// ============================================================
// CALLBACKS
// ============================================================
function manejarClickMateria(bloque) {
    abrirModalMateria(bloque, horarioActual, async (horarioActualizado) => {
        horarioActual = horarioActualizado;
        await StorageService.guardarHorario(horarioActual);
        renderizarHorario(horarioActual, contenedorTabla, manejarClickMateria);
    });
}

async function resetear() {
    if (!confirm('¿Seguro que deseas resetear todo el horario?')) return;
    horarioActual = [];
    await StorageService.limpiarTodo();
    renderizarHorario([], contenedorTabla, manejarClickMateria);
    alarmService.setHorario([]);
    alert('🗑️ Todo reseteado.');
}

function toggleAlarmas() {
    const btn = document.getElementById('btnAlarmas');
    if (alarmasActivas) {
        alarmService.desactivar();
        alarmasActivas = false;
        btn.textContent = '🔔 Activar alarmas';
        btn.classList.remove('activo');
    } else {
        if (!horarioActual.length) {
            alert('⚠️ Primero carga un horario.');
            return;
        }
        alarmService.setHorario(horarioActual);
        alarmService.activar();
        alarmasActivas = true;
        btn.textContent = '🔕 Desactivar alarmas';
        btn.classList.add('activo');
    }
}

// ============================================================
// BOTÓN FLOTANTE DEL ASISTENTE IA - FIX DEFINITIVO
// ============================================================
function crearBotonAsistenteIA() {
    // Buscar el botón que YA existe en el HTML
    const btn = document.getElementById('btn-asistente-ia');

    if (!btn) {
        console.error('❌ Botón IA no encontrado en el HTML');
        return;
    }

    console.log('✅ Botón IA encontrado en el DOM');

    btn.onclick = () => {
        console.log('🤖 Botón IA presionado');

        // Verificar API Key
        if (!iaService.tieneApiKey()) {
            const key = prompt(
                '🔑 Pega tu API Key de Gemini:\n\n' +
                '(Obtenla gratis en: https://aistudio.google.com/app/apikey)'
            );

            if (key && key.length > 10) {
                iaService.setApiKey(key);
                localStorage.setItem('gemini_api_key', key);
                alert('✅ API Key guardada correctamente');
            } else {
                return;
            }
        }

        // Verificar que haya horario cargado
        if (!horarioActual.length) {
            alert('⚠️ Primero carga un horario para que pueda ayudarte.');
            return;
        }

        console.log('🚀 Abriendo asistente IA...');
        abrirAsistenteIA({
            horario: horarioActual,
            planificacion: planificacionService.obtenerTodas(),
            semanaActual: calcularSemanaActualIA(),
        });
    };

    // Cargar API Key guardada
    const keyGuardada = localStorage.getItem('gemini_api_key');
    if (keyGuardada) {
        iaService.setApiKey(keyGuardada);
        console.log('🔑 API Key cargada desde localStorage');
    }

    console.log('✅ Botón IA listo y conectado');
}

// ============================================================
// CÁLCULO DE SEMANA ACTUAL
// ============================================================
function calcularSemanaActualIA() {
    const CICLO_INICIO = new Date(2026, 9, 12); // 12 oct 2026
    const hoy = new Date();
    if (hoy < CICLO_INICIO) return 1;
    const dias = Math.floor((hoy - CICLO_INICIO) / (1000 * 60 * 60 * 24));
    return Math.min(Math.floor(dias / 7) + 1, 16);
}

// ============================================================
// ARRANCAR
// ============================================================
init();