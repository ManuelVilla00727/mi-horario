// ============================================================
// HORARIO SEMANAL FIJO
// ============================================================
const HORARIO = [
  // LUNES
  { dia: 'Lunes', inicio: '12:00', fin: '14:00', materia: 'INFRAESTRUCTURA, SEGURIDAD Y GESTION DE RIESGO EN LAS TI (IISC_8_A)' },
  { dia: 'Lunes', inicio: '16:00', fin: '18:00', materia: 'PLANIFICACION ACADEMICA' },
  { dia: 'Lunes', inicio: '18:00', fin: '19:00', materia: 'TUTORIA ACADEMICA' },
  { dia: 'Lunes', inicio: '19:00', fin: '20:00', materia: 'ELABORADOR DE ITEMS: DGE' },
  { dia: 'Lunes', inicio: '20:00', fin: '22:00', materia: 'COMPUTACION EN LA NUBE, ARQUITECTURA Y SEGURIDAD DE LOS SISTEMAS DE INFORMACION (IISC_7_A)' },

  // MARTES
  { dia: 'Martes', inicio: '13:00', fin: '14:00', materia: 'ELABORADOR DE ITEMS: DGE' },
  { dia: 'Martes', inicio: '14:00', fin: '16:00', materia: 'INFRAESTRUCTURA, SEGURIDAD Y GESTION DE RIESGO EN LAS TI (IISC_8_A)' },
  { dia: 'Martes', inicio: '17:00', fin: '18:00', materia: 'PLANIFICACION ACADEMICA' },
  { dia: 'Martes', inicio: '18:00', fin: '19:00', materia: 'TUTOR CIENTIFICO' },
  { dia: 'Martes', inicio: '19:00', fin: '20:00', materia: 'CONTROL Y AUDITORIA INFORMATICA (IISC_7_A)' },
  { dia: 'Martes', inicio: '20:00', fin: '22:00', materia: 'COMPUTACION EN LA NUBE, ARQUITECTURA Y SEGURIDAD DE LOS SISTEMAS DE INFORMACION (IISC_7_A)' },

  // MIÉRCOLES
  { dia: 'Miércoles', inicio: '10:00', fin: '11:00', materia: 'TUTOR CIENTIFICO' },
  { dia: 'Miércoles', inicio: '11:00', fin: '12:00', materia: 'PLANIFICACION ACADEMICA' },
  { dia: 'Miércoles', inicio: '12:00', fin: '15:00', materia: 'SISTEMAS OPERATIVOS Y CONFIGURACION DE SERVICIOS (IISC_6_A)' },
  { dia: 'Miércoles', inicio: '16:00', fin: '19:00', materia: 'CONTROL Y AUDITORIA INFORMATICA (IISC_7_A)' },

  // JUEVES
  { dia: 'Jueves', inicio: '07:00', fin: '09:00', materia: 'GESTION DE PLATAFORMAS OPERATIVAS (ISOF_5_A)' },
  { dia: 'Jueves', inicio: '09:00', fin: '10:00', materia: 'PLANIFICACION ACADEMICA' },
  { dia: 'Jueves', inicio: '10:00', fin: '12:00', materia: 'JEFE TECNICO CARRERA DE SOFTWARE' },
  { dia: 'Jueves', inicio: '13:00', fin: '15:00', materia: 'JEFE TECNICO CARRERA DE SOFTWARE' },
  { dia: 'Jueves', inicio: '15:00', fin: '16:00', materia: 'PLANIFICACION ACADEMICA' },

  // VIERNES
  { dia: 'Viernes', inicio: '08:00', fin: '09:00', materia: 'TUTORIA ACADEMICA' },
  { dia: 'Viernes', inicio: '09:00', fin: '10:00', materia: 'ELABORADOR DE ITEMS: DGE' },
  { dia: 'Viernes', inicio: '11:00', fin: '13:00', materia: 'GESTION DE PLATAFORMAS OPERATIVAS (ISOF_5_A)' },
  { dia: 'Viernes', inicio: '13:00', fin: '14:00', materia: 'ELABORADOR DE ITEMS: DGE' },
  { dia: 'Viernes', inicio: '15:00', fin: '18:00', materia: 'SISTEMAS OPERATIVOS Y CONFIGURACION DE SERVICIOS (IISC_6_A)' },
];

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
const DIAS_JS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const URL_SISTEMA_UTC = 'https://aplicaciones.utc.edu.ec/sith/public/login';

let diaSeleccionado = DIAS.includes(DIAS_JS[new Date().getDay()])
  ? DIAS_JS[new Date().getDay()]
  : 'Lunes';

// ============================================================
// UTILIDADES
// ============================================================
const aMinutos = (h) => {
  const [hh, mm] = h.split(':').map(Number);
  return hh * 60 + mm;
};

const ahoraMinutos = () => {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
};

const diaHoy = () => DIAS_JS[new Date().getDay()];

// ============================================================
// LÓGICA DE HORARIO
// ============================================================
function claseActual() {
  const dia = diaHoy();
  const min = ahoraMinutos();
  return HORARIO.find(c => c.dia === dia && min >= aMinutos(c.inicio) && min < aMinutos(c.fin));
}

function proximaClase() {
  const dia = diaHoy();
  const min = ahoraMinutos();
  let proxima = HORARIO.find(c => c.dia === dia && aMinutos(c.inicio) > min);
  if (proxima) return proxima;

  const idxHoy = DIAS_JS.indexOf(dia);
  for (let i = 1; i <= 7; i++) {
    const diaSig = DIAS_JS[(idxHoy + i) % 7];
    const encontrada = HORARIO.find(c => c.dia === diaSig);
    if (encontrada) return encontrada;
  }
  return null;
}

// ============================================================
// RENDER
// ============================================================
function renderEstadoCiclo() {
  const el = document.getElementById('estado-ciclo');
  if (el) el.textContent = textoEstadoCiclo();
}

function renderActual() {
  const el = document.getElementById('tarjeta-actual');
  const c = claseActual();
  if (!c) { el.innerHTML = ''; return; }

  const semana = semanaActual();
  const temaInfo = temaDeMateria(c.materia, semana);
  const temaHtml = temaInfo
    ? `<div class="tema-tarjeta">📖 ${temaInfo.tema}</div>`
    : '';

  el.innerHTML = `
    <div class="tarjeta-actual">
      <div class="titulo">🔴 EN CLASE AHORA</div>
      <div class="materia">${c.materia}</div>
      <div class="hora">${c.inicio} - ${c.fin} · ${c.dia}</div>
      ${temaHtml}
    </div>`;
}

function renderProxima() {
  const el = document.getElementById('tarjeta-proxima');
  const c = proximaClase();
  if (!c) { el.innerHTML = ''; return; }

  const semana = semanaActual();
  const temaInfo = temaDeMateria(c.materia, semana);
  const temaHtml = temaInfo
    ? `<div class="tema-tarjeta">📖 ${temaInfo.tema}</div>`
    : '';

  el.innerHTML = `
    <div class="tarjeta-proxima">
      <div class="titulo">⏭ PRÓXIMA CLASE</div>
      <div class="materia">${c.materia}</div>
      <div class="hora">${c.dia} · ${c.inicio} - ${c.fin}</div>
      ${temaHtml}
    </div>`;
}

function renderSelector() {
  const el = document.getElementById('selector-dias');
  el.innerHTML = DIAS.map(d =>
    `<button class="${d === diaSeleccionado ? 'activo' : ''}" onclick="seleccionarDia('${d}')">${d}</button>`
  ).join('');
}

function renderDia() {
  const cont = document.getElementById('lista-clases');
  const clases = HORARIO.filter(c => c.dia === diaSeleccionado);

  if (!clases.length) {
    cont.innerHTML = '<div class="vacio">🎈 Sin clases este día</div>';
    return;
  }

  const hoy = diaHoy();
  const min = ahoraMinutos();
  const semana = semanaActual();

  cont.innerHTML = clases.map((c, idx) => {
    const enCurso = c.dia === hoy && min >= aMinutos(c.inicio) && min < aMinutos(c.fin);
    const temaInfo = temaDeMateria(c.materia, semana);
    const temaHtml = temaInfo ? `<div class="tema-clase">📖 ${temaInfo.tema}</div>` : '';
    const clickable = temaInfo ? 'clickable' : '';

    return `
      <div class="clase ${enCurso ? 'en-curso' : ''} ${clickable}"
           onclick="abrirModalClase('${diaSeleccionado}', ${idx})">
        <div class="hora-bloque">
          <div class="h">${c.inicio}</div>
          <div class="h2">${c.fin}</div>
        </div>
        <div class="info">
          <div class="materia">${c.materia}</div>
          ${temaHtml}
          ${enCurso ? '<span class="badge">En curso 🔴</span>' : ''}
        </div>
      </div>`;
  }).join('');
}

window.seleccionarDia = (dia) => {
  diaSeleccionado = dia;
  renderSelector();
  renderDia();
};

function renderTodo() {
  renderEstadoCiclo();
  renderActual();
  renderProxima();
  renderSelector();
  renderDia();
}

// ============================================================
// MODAL: DETALLE DE CLASE
// ============================================================
window.abrirModalClase = (dia, idx) => {
  const clases = HORARIO.filter(c => c.dia === dia);
  const c = clases[idx];
  if (!c) return;

  const semana = semanaActual();
  const temaInfo = temaDeMateria(c.materia, semana);

  const modal = document.getElementById('modal-clase');
  const info = document.getElementById('modal-info');

  let html = `
    <h2 class="modal-materia">${c.materia}</h2>
    <div class="modal-detalle">
      <div>📅 <strong>${c.dia}</strong> · ${c.inicio} - ${c.fin}</div>
      <div>📌 <strong>Semana ${semana} de 16</strong></div>
      <div>🗓 ${rangoSemana(semana)}</div>
    </div>
  `;

  if (temaInfo) {
    html += `
      <div class="modal-seccion">
        <div class="modal-titulo-seccion">📖 TEMA DE ESTA SEMANA</div>
        <div class="modal-tema">${temaInfo.tema}</div>
      </div>
      <div class="modal-horas">
        <div class="hora-item">
          <div class="hora-icono">🎓</div>
          <div class="hora-label">Docencia</div>
          <div class="hora-valor">${temaInfo.docencia}h</div>
        </div>
        <div class="hora-item">
          <div class="hora-icono">🔬</div>
          <div class="hora-label">Prácticas</div>
          <div class="hora-valor">${temaInfo.practicas}h</div>
        </div>
      </div>
    `;
  } else {
    html += `
      <div class="modal-seccion">
        <div class="modal-info-sin-tema">
          ℹ️ Esta materia no tiene planificación semanal asignada.
        </div>
      </div>
    `;
  }

  info.innerHTML = html;
  modal.style.display = 'flex';
};

window.cerrarModal = () => {
  document.getElementById('modal-clase').style.display = 'none';
};

// ============================================================
// MODAL: PLANIFICACIÓN COMPLETA
// ============================================================
window.abrirPlanificacion = () => {
  const modal = document.getElementById('modal-planificacion');
  const cont = document.getElementById('planificacion-contenido');
  const semana = semanaActual();

  let html = '';
  for (const [materia, temas] of Object.entries(TEMAS)) {
    html += `<h3 class="plan-materia">📘 ${materia}</h3>`;
    html += '<div class="plan-lista">';
    for (const t of temas) {
      const esActual = t.semana === semana ? 'plan-actual' : '';
      html += `
        <div class="plan-semana ${esActual}">
          <div class="plan-s">S${t.semana}</div>
          <div class="plan-info">
            <div class="plan-tema">${t.tema}</div>
            <div class="plan-rango">${rangoSemana(t.semana)}</div>
          </div>
          <div class="plan-horas">${t.docencia}h + ${t.practicas}h</div>
        </div>
      `;
    }
    html += '</div>';
  }

  cont.innerHTML = html;
  modal.style.display = 'flex';
};

window.cerrarPlanificacion = () => {
  document.getElementById('modal-planificacion').style.display = 'none';
};

// ============================================================
// VOZ (TEXT-TO-SPEECH)
// ============================================================
async function hablar(texto) {
  try {
    const { TextToSpeech } = Capacitor.Plugins;
    if (!TextToSpeech) return;

    await TextToSpeech.speak({
      text: texto,
      lang: 'es-ES',
      rate: 0.9,
      pitch: 1.0,
      volume: 1.0,
    });
  } catch (e) {
    console.error('Error TTS:', e);
  }
}

// ============================================================
// NOTIFICACIONES CON VOZ
// ============================================================
async function activarRecordatorios() {
  try {
    const { LocalNotifications } = Capacitor.Plugins;
    if (!LocalNotifications) {
      alert('Plugin no disponible');
      return;
    }

    const hoy = new Date();
    if (hoy < CICLO.fechaInicio) {
      alert('⏳ El ciclo comienza el 12 de octubre de 2026.');
      return;
    }
    if (semanaActual() > CICLO.totalSemanas) {
      alert('🎓 El ciclo ya terminó.');
      return;
    }

    let permiso = await LocalNotifications.checkPermissions();
    if (permiso.display !== 'granted') {
      permiso = await LocalNotifications.requestPermissions();
    }
    if (permiso.display !== 'granted') {
      alert('❌ Activa las notificaciones en Ajustes');
      return;
    }

    try {
      const pendientes = await LocalNotifications.getPending();
      if (pendientes.notifications && pendientes.notifications.length > 0) {
        await LocalNotifications.cancel({
          notifications: pendientes.notifications.map(n => ({ id: n.id })),
        });
      }
    } catch (e) {
      console.warn('Error cancelando:', e);
    }

    try {
      await LocalNotifications.createChannel({
        id: 'horario-clases',
        name: 'Recordatorios de Clases',
        description: 'Avisos 3 minutos antes de cada clase',
        importance: 5,
        vibration: true,
      });
    } catch (e) {
      console.warn('Error canal:', e);
    }

    const notifs = [];
    let idCounter = 1;

    for (let offset = 0; offset < 7; offset++) {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() + offset);
      if (fecha > CICLO.fechaFin) break;

      const diaNombre = DIAS_JS[fecha.getDay()];
      const semanaFecha = semanaActual(fecha);

      const clasesDelDia = HORARIO.filter(c => c.dia === diaNombre);
      for (const c of clasesDelDia) {
        const [hh, mm] = c.inicio.split(':').map(Number);
        const inicio = new Date(fecha);
        inicio.setHours(hh, mm, 0, 0);

        const aviso = new Date(inicio.getTime() - 3 * 60 * 1000);
        if (aviso <= new Date()) continue;

        const temaInfo = temaDeMateria(c.materia, semanaFecha);
        const cuerpoVoz = temaInfo
          ? `Atención. En tres minutos comienza ${c.materia}. Tema: ${temaInfo.tema}. Hora de inicio: ${c.inicio}.`
          : `Atención. En tres minutos comienza ${c.materia}. Hora de inicio: ${c.inicio}.`;

        notifs.push({
          id: idCounter++,
          title: '🔔 En 3 minutos: ' + c.materia.substring(0, 50),
          body: temaInfo ? `📖 ${temaInfo.tema}\n⏰ ${c.inicio}` : `⏰ Comienza a las ${c.inicio}`,
          schedule: { at: aviso, allowWhileIdle: true },
          channelId: 'horario-clases',
          smallIcon: 'ic_stat_icon_config_sample',
          sound: null,
          extra: { voz: cuerpoVoz },
        });
      }
    }

    if (notifs.length === 0) {
      alert('No hay clases próximas para programar');
      return;
    }

    await LocalNotifications.schedule({ notifications: notifs });

    LocalNotifications.removeAllListeners();
    LocalNotifications.addListener('localNotificationReceived', async (notif) => {
      const texto = notif.extra?.voz || notif.title;
      await hablar(texto);
    });

    document.getElementById('btn-recordatorios').textContent =
      `✅ ${notifs.length} recordatorios activos`;
    document.getElementById('btn-recordatorios').classList.add('activo');
    alert(`✅ ${notifs.length} recordatorios programados con voz`);
  } catch (e) {
    console.error('ERROR:', e);
    alert('Error: ' + e.message);
  }
}

// ============================================================
// ALARMA DE VOZ EN TIEMPO REAL
// ============================================================
let ultimaClaseAvisada = '';

function verificarAlarmaVoz() {
  const dia = diaHoy();
  const min = ahoraMinutos();
  const semana = semanaActual();

  HORARIO.filter(c => c.dia === dia).forEach(c => {
    const inicio = aMinutos(c.inicio);
    const diferencia = inicio - min;

    if (diferencia > 0 && diferencia <= 3) {
      const clave = `${dia}-${c.inicio}-${c.materia}`;
      if (ultimaClaseAvisada !== clave) {
        ultimaClaseAvisada = clave;
        const temaInfo = temaDeMateria(c.materia, semana);
        const texto = temaInfo
          ? `Atención. En ${diferencia} minutos comienza ${c.materia}. Tema: ${temaInfo.tema}. Hora de inicio: ${c.inicio}.`
          : `Atención. En ${diferencia} minutos comienza ${c.materia}. Hora de inicio: ${c.inicio}.`;
        hablar(texto);
      }
    }
  });

  if (min === 0) ultimaClaseAvisada = '';
}

// ============================================================
// SISTEMA UTC (WEBVIEW)
// ============================================================
function abrirSistemaUTC() {
  const modal = document.getElementById('modal-sistema');
  const iframe = document.getElementById('iframe-sistema');

  if (iframe.src === 'about:blank' || iframe.src === '') {
    iframe.src = URL_SISTEMA_UTC;
  }

  modal.style.display = 'flex';
}

window.cerrarSistema = () => {
  document.getElementById('modal-sistema').style.display = 'none';
};

// ============================================================
// MODALES DE GESTIÓN
// ============================================================
window.cerrarModalExcel = () => {
  document.getElementById('modal-excel').style.display = 'none';
};
window.cerrarModalSilabos = () => {
  document.getElementById('modal-silabos').style.display = 'none';
};
window.cerrarModalChecklist = () => {
  document.getElementById('modal-checklist').style.display = 'none';
};

// ============================================================
// INICIALIZACIÓN
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
  console.log('✅ App iniciada');

  // Cargar estado de sílabos
  await cargarEstadoSilabos();

  // Cerrar modales al tocar overlay
  ['modal-clase', 'modal-planificacion', 'modal-excel',
   'modal-silabos', 'modal-checklist'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('click', (e) => {
        if (e.target.id === id) el.style.display = 'none';
      });
    }
  });

  // Botones principales
  document.getElementById('btn-refrescar').onclick = renderTodo;
  document.getElementById('btn-recordatorios').onclick = activarRecordatorios;

  document.getElementById('btn-voz-test').onclick = () => {
    hablar('Hola, soy tu asistente de horario. Estoy funcionando correctamente.');
  };

  document.getElementById('btn-planificacion').onclick = abrirPlanificacion;

  // Botones de gestión
  document.getElementById('btn-gestion-excel').onclick = () => {
    document.getElementById('modal-excel').style.display = 'flex';
    actualizarInfoExcel();
  };

  document.getElementById('btn-gestion-silabos').onclick = () => {
    renderSeccionSilabos();
    document.getElementById('modal-silabos').style.display = 'flex';
  };

  document.getElementById('btn-checklist').onclick = () => {
    renderCheckList();
    document.getElementById('modal-checklist').style.display = 'flex';
  };

  // Botón Sistema UTC
  document.getElementById('btn-sistema-utc').onclick = abrirSistemaUTC;

  // Subir Excel
  document.getElementById('input-excel').addEventListener('change', async (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;

    if (!archivo.name.match(/\.(xlsx|xls)$/i)) {
      alert('⚠️ Solo se permiten archivos Excel (.xlsx, .xls)');
      return;
    }

    const exito = await subirExcelHorario(archivo);
    if (exito) {
      alert('✅ Excel guardado correctamente');
      actualizarInfoExcel();
    } else {
      alert('❌ Error al guardar el Excel');
    }
  });

  // Render inicial
  renderTodo();

  // Intervalos
  setInterval(renderTodo, 60_000);
  setInterval(verificarAlarmaVoz, 30_000);

  console.log('✅ App lista');
});