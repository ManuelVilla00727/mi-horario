// ============================================================
// ALARM SERVICE - Con notificaciones persistentes + voz
// ============================================================

import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { LocalNotifications } from '@capacitor/local-notifications';

export class AlarmService {
    constructor() {
        this.activo = false;
        this.minutosAnticipacion = 5;
        this.intervalId = null;
        this.alarmasEmitidas = new Set();
        this.horario = [];
    }

    // ============================================================
    // INICIALIZACIÓN
    // ============================================================
    async inicializar() {
        try {
            const { Preferences } = Capacitor.Plugins;

            // 1. Verificar si el canal ya fue creado en sesiones anteriores
            const { value: canalExiste } = await Preferences.get({ key: 'canal_creado' });

            if (!canalExiste) {
                // Solo crear el canal la primera vez
                await this._crearCanal();
                await Preferences.set({ key: 'canal_creado', value: 'true' });
                console.log('✅ Canal de notificaciones creado (primera vez)');
            } else {
                console.log('ℹ️ Canal ya existía, no se recrea');
            }

            // 2. Pedir permisos de notificación
            const permiso = await LocalNotifications.requestPermissions();
            if (permiso.display !== 'granted') {
                console.warn('⚠️ Permisos de notificación denegados.');
            }

            // 3. Escuchar cuando llegue una notificación para hablar
            LocalNotifications.removeAllListeners();
            LocalNotifications.addListener('localNotificationReceived', async (notif) => {
                console.log('📩 Notificación recibida:', notif);
                const texto = notif.extra?.voz || notif.body || notif.title;
                if (texto) {
                    await this._hablar(texto);
                }
            });

            console.log('✅ AlarmService inicializado');
        } catch (e) {
            console.error('Error al inicializar:', e);
        }
    }

    // ============================================================
    // CREAR CANAL DE NOTIFICACIÓN
    // ============================================================
    async _crearCanal() {
        try {
            await LocalNotifications.createChannel({
                id: 'alarmas-clase',
                name: 'Alarmas de Clase',
                description: 'Avisos de inicio y fin de clases',
                importance: 5,        // URGENTE (máxima prioridad)
                visibility: 1,        // Visible en pantalla de bloqueo
                vibration: true,      // Vibración
                sound: 'default',     // Sonido por defecto
            });
            console.log('🔔 Canal de notificación creado');
        } catch (e) {
            console.warn('Canal ya existe o error:', e);
        }
    }

    // ============================================================
    // CONFIGURACIÓN
    // ============================================================
    setHorario(horario) {
        this.horario = horario;
        this.alarmasEmitidas.clear();
    }

    setMinutosAnticipacion(min) {
        this.minutosAnticipacion = min;
        this.alarmasEmitidas.clear();
    }

    // ============================================================
    // ACTIVAR / DESACTIVAR
    // ============================================================
    activar() {
        if (this.activo) return;
        this.activo = true;

        // Programar TODAS las notificaciones de la semana (funciona con app cerrada)
        this._programarNotificacionesSemana();

        // Y además verificar cada 30 segundos (para la voz en vivo con app abierta)
        this.intervalId = setInterval(() => this._verificar(), 30000);
        this._verificar();

        console.log('✅ Alarmas activadas');
    }

    desactivar() {
        this.activo = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        // Cancelar notificaciones programadas
        this._cancelarNotificaciones();
        console.log('🔕 Alarmas desactivadas');
    }

    // ============================================================
    // PROGRAMAR NOTIFICACIONES PARA LOS PRÓXIMOS 7 DÍAS
    // ============================================================
    async _programarNotificacionesSemana() {
        try {
            // Cancelar las previas
            await this._cancelarNotificaciones();

            const notifs = [];
            let idCounter = 1;
            const DIAS_JS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

            for (let offset = 0; offset < 7; offset++) {
                const fecha = new Date();
                fecha.setDate(fecha.getDate() + offset);
                const diaNombre = DIAS_JS[fecha.getDay()];

                const bloquesDelDia = this.horario.filter(b => b.dia === diaNombre);

                for (const b of bloquesDelDia) {
                    // ========================================
                    // Aviso de INICIO
                    // ========================================
                    const [hIni, mIni] = b.inicio.split(':').map(Number);
                    const fechaInicio = new Date(fecha);
                    fechaInicio.setHours(hIni, mIni, 0, 0);
                    const avisoInicio = new Date(fechaInicio.getTime() - this.minutosAnticipacion * 60000);

                    if (avisoInicio > new Date()) {
                        notifs.push({
                            id: idCounter++,
                            title: `🔔 En ${this.minutosAnticipacion} min: ${b.materia}`,
                            body: `Clase a las ${b.inicio}${b.codigo ? ' · ' + b.codigo : ''}`,
                            schedule: { at: avisoInicio, allowWhileIdle: true },
                            channelId: 'alarmas-clase',
                            smallIcon: 'ic_stat_icon_config_sample',
                            extra: {
                                voz: `Atención. En ${this.minutosAnticipacion} minutos inicia ${b.materia}. Código ${b.codigo || ''}.`,
                            },
                        });
                    }

                    // ========================================
                    // Aviso de FIN
                    // ========================================
                    const [hFin, mFin] = b.fin.split(':').map(Number);
                    const fechaFin = new Date(fecha);
                    fechaFin.setHours(hFin, mFin, 0, 0);

                    if (fechaFin > new Date()) {
                        notifs.push({
                            id: idCounter++,
                            title: `⏰ Fin de clase: ${b.materia}`,
                            body: `Terminó a las ${b.fin}`,
                            schedule: { at: fechaFin, allowWhileIdle: true },
                            channelId: 'alarmas-clase',
                            smallIcon: 'ic_stat_icon_config_sample',
                            extra: {
                                voz: `Atención. Finalizó la clase de ${b.materia}.`,
                            },
                        });
                    }
                }
            }

            if (notifs.length === 0) {
                console.log('ℹ️ No hay alarmas próximas para programar');
                return;
            }

            await LocalNotifications.schedule({ notifications: notifs });
            console.log(`✅ ${notifs.length} notificaciones programadas para la semana`);
        } catch (e) {
            console.error('Error programando notificaciones:', e);
        }
    }

    // ============================================================
    // CANCELAR NOTIFICACIONES PENDIENTES
    // ============================================================
    async _cancelarNotificaciones() {
        try {
            const pendientes = await LocalNotifications.getPending();
            if (pendientes.notifications && pendientes.notifications.length > 0) {
                await LocalNotifications.cancel({
                    notifications: pendientes.notifications.map(n => ({ id: n.id })),
                });
                console.log(`🗑️ ${pendientes.notifications.length} notificaciones canceladas`);
            }
        } catch (e) {
            console.warn('Error cancelando:', e);
        }
    }

    // ============================================================
    // VERIFICACIÓN EN TIEMPO REAL (para la voz cuando la app está abierta)
    // ============================================================
    _verificar() {
        const ahora = new Date();
        const diaActual = this._diaActual(ahora);

        this.horario
            .filter(b => b.dia === diaActual)
            .forEach(bloque => {
                this._verificarEvento(bloque, ahora, 'inicio', bloque.inicio);
                this._verificarEvento(bloque, ahora, 'fin', bloque.fin);
            });
    }

    _verificarEvento(bloque, ahora, tipo, hora) {
        const [h, m] = hora.split(':').map(Number);
        const fechaEvento = new Date(ahora);
        fechaEvento.setHours(h, m, 0, 0);

        const diff = Math.round((fechaEvento - ahora) / 60000);

        // ✅ Rango flexible: si diff está entre anticipacion y anticipacion-1
        // Ej: si minutosAnticipacion=5, dispara cuando diff está entre 4 y 5
        const enRangoAviso = diff <= this.minutosAnticipacion && diff > this.minutosAnticipacion - 1;
        const enHoraExacta = diff === 0 || diff === -1;

        if (enRangoAviso) {
            const key = `${bloque.id}-${tipo}-previo`;
            if (!this.alarmasEmitidas.has(key)) {
                this.alarmasEmitidas.add(key);
                this._emitir(bloque, tipo, 'previo');
            }
        }

        if (enHoraExacta) {
            const key = `${bloque.id}-${tipo}-exacto`;
            if (!this.alarmasEmitidas.has(key)) {
                this.alarmasEmitidas.add(key);
                this._emitir(bloque, tipo, 'exacto');
            }
        }
    }

    // ============================================================
    // EMITIR ALARMA
    // ============================================================
    async _emitir(bloque, tipo, momento) {
        const accion = tipo === 'inicio' ? 'inicia' : 'finaliza';
        const mensaje = momento === 'previo'
            ? `Atención. En ${this.minutosAnticipacion} minutos ${accion} ${bloque.materia}, código ${bloque.codigo || 'sin código'}.`
            : `Atención. Es la hora. ${accion.charAt(0).toUpperCase() + accion.slice(1)} ${bloque.materia}, código ${bloque.codigo || 'sin código'}.`;

        console.log('🔔 Emitiendo alarma:', mensaje);

        // 1. Notificación inmediata
        try {
            await LocalNotifications.schedule({
                notifications: [{
                    id: Math.floor(Math.random() * 100000),
                    title: '🔔 Alarma de clase',
                    body: mensaje,
                    schedule: { at: new Date(Date.now() + 100), allowWhileIdle: true },
                    channelId: 'alarmas-clase',
                    smallIcon: 'ic_stat_icon_config_sample',
                    extra: { voz: mensaje },
                }],
            });
        } catch (e) {
            console.error('Error en notificación:', e);
        }

        // 2. Voz (solo funciona con app abierta)
        await this._hablar(mensaje);
    }

    // ============================================================
    // HABLAR POR VOZ (Text-to-Speech)
    // ============================================================
    async _hablar(texto) {
        try {
            await TextToSpeech.speak({
                text: texto,
                lang: 'es-ES',
                rate: 1.0,
                pitch: 1.0,
                volume: 1.0,
            });
            console.log('🔊 Voz emitida');
        } catch (e) {
            console.error('Error al hablar:', e);
        }
    }

    // ============================================================
    // UTILIDADES
    // ============================================================
    _diaActual(fecha) {
        const d = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        return d[fecha.getDay()];
    }
}