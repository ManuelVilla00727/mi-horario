// ============================================================
// GESTIÓN DE ARCHIVOS (EXCEL + SÍLABOS + CHECK LIST)
// ============================================================

const MATERIAS_CON_SILABO = [
  {
    id: 'auditoria',
    nombre: 'CONTROL Y AUDITORIA INFORMATICA (IISC_7_A)',
  },
  {
    id: 'infraestructura',
    nombre: 'INFRAESTRUCTURA, SEGURIDAD Y GESTION DE RIESGO (IISC_8_A)',
  },
  {
    id: 'nube',
    nombre: 'COMPUTACION EN LA NUBE, ARQUITECTURA Y SEGURIDAD (IISC_7_A)',
  },
];

let ESTADO_SILABOS = {};

// ============================================================
// HELPERS
// ============================================================
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ============================================================
// ESTADO DE SÍLABOS
// ============================================================
async function cargarEstadoSilabos() {
  try {
    const { Preferences } = Capacitor.Plugins;
    const { value } = await Preferences.get({ key: 'estado_silabos' });
    if (value) {
      ESTADO_SILABOS = JSON.parse(value);
      console.log('📂 Estado de sílabos cargado:', ESTADO_SILABOS);
    }
  } catch (e) {
    console.error('Error cargando estado:', e);
  }
}

async function guardarEstadoSilabos() {
  try {
    const { Preferences } = Capacitor.Plugins;
    await Preferences.set({
      key: 'estado_silabos',
      value: JSON.stringify(ESTADO_SILABOS),
    });
  } catch (e) {
    console.error('Error guardando estado:', e);
  }
}

// ============================================================
// SÍLABOS
// ============================================================
async function subirSilabo(materiaId, archivo) {
  try {
    const { Filesystem } = Capacitor.Plugins;

    const base64 = await fileToBase64(archivo);
    const nombreArchivo = `silabo_${materiaId}.pdf`;

    const resultado = await Filesystem.writeFile({
      path: `silabos/${nombreArchivo}`,
      data: base64,
      directory: 'DOCUMENTS',
      recursive: true,
    });

    ESTADO_SILABOS[materiaId] = {
      subido: true,
      fecha: new Date().toLocaleDateString('es-EC'),
      hora: new Date().toLocaleTimeString('es-EC'),
      archivo: nombreArchivo,
      ruta: resultado.uri,
      tamaño: archivo.size,
    };

    await guardarEstadoSilabos();
    return true;
  } catch (e) {
    console.error('Error subiendo sílabo:', e);
    return false;
  }
}

async function abrirSilabo(materiaId) {
  try {
    const { Filesystem } = Capacitor.Plugins;
    const info = ESTADO_SILABOS[materiaId];

    if (!info || !info.archivo) {
      alert('No hay sílabo guardado para esta materia');
      return;
    }

    const resultado = await Filesystem.getUri({
      path: `silabos/${info.archivo}`,
      directory: 'DOCUMENTS',
    });

    window.open(resultado.uri, '_system');
  } catch (e) {
    console.error('Error abriendo PDF:', e);
    alert('No se pudo abrir el PDF: ' + e.message);
  }
}

async function eliminarSilabo(materiaId) {
  if (!confirm('¿Eliminar el sílabo guardado?')) return;

  try {
    const { Filesystem } = Capacitor.Plugins;
    const info = ESTADO_SILABOS[materiaId];

    if (info && info.archivo) {
      await Filesystem.deleteFile({
        path: `silabos/${info.archivo}`,
        directory: 'DOCUMENTS',
      });
    }

    delete ESTADO_SILABOS[materiaId];
    await guardarEstadoSilabos();
    renderSeccionSilabos();
    alert('🗑 Sílabo eliminado');
  } catch (e) {
    console.error('Error eliminando:', e);
  }
}

// ============================================================
// EXCEL DEL HORARIO
// ============================================================
async function subirExcelHorario(archivo) {
  try {
    const { Filesystem, Preferences } = Capacitor.Plugins;

    const base64 = await fileToBase64(archivo);
    const nombreArchivo = `horario_${Date.now()}.xlsx`;

    const resultado = await Filesystem.writeFile({
      path: `horarios/${nombreArchivo}`,
      data: base64,
      directory: 'DOCUMENTS',
      recursive: true,
    });

    await Preferences.set({
      key: 'ultimo_excel',
      value: JSON.stringify({
        nombre: archivo.name,
        fecha: new Date().toLocaleDateString('es-EC'),
        hora: new Date().toLocaleTimeString('es-EC'),
        ruta: resultado.uri,
      }),
    });

    return true;
  } catch (e) {
    console.error('Error subiendo Excel:', e);
    return false;
  }
}

// ============================================================
// RENDER: SÍLABOS
// ============================================================
function renderSeccionSilabos() {
  const cont = document.getElementById('lista-silabos');
  if (!cont) return;

  cont.innerHTML = MATERIAS_CON_SILABO.map(m => {
    const estado = ESTADO_SILABOS[m.id];
    const subido = estado && estado.subido;

    return `
      <div class="silabo-item ${subido ? 'subido' : 'pendiente'}">
        <div class="silabo-icono">${subido ? '✅' : '⬜'}</div>
        <div class="silabo-info">
          <div class="silabo-materia">${m.nombre}</div>
          ${subido
            ? `<div class="silabo-estado">Subido el ${estado.fecha} a las ${estado.hora}</div>`
            : `<div class="silabo-estado pendiente">Pendiente de subir</div>`
          }
        </div>
        <div class="silabo-acciones">
          ${subido
            ? `
              <button class="btn-icono" onclick="abrirSilabo('${m.id}')" title="Ver">👁</button>
              <button class="btn-icono" onclick="eliminarSilabo('${m.id}')" title="Eliminar">🗑</button>
            `
            : `
              <label class="btn-subir" for="input-${m.id}">📤 Subir</label>
              <input type="file" id="input-${m.id}" accept=".pdf"
                     style="display:none;"
                     onchange="handleSubirSilabo('${m.id}', this)">
            `
          }
        </div>
      </div>
    `;
  }).join('');

  const subidos = Object.keys(ESTADO_SILABOS).length;
  const total = MATERIAS_CON_SILABO.length;
  const resumen = document.getElementById('resumen-silabos');
  if (resumen) {
    resumen.textContent = `${subidos} de ${total} sílabos subidos`;
  }
}

// ============================================================
// HANDLER: SUBIR SÍLABO
// ============================================================
window.handleSubirSilabo = async (materiaId, input) => {
  if (!input.files || !input.files[0]) return;
  const archivo = input.files[0];

  if (!archivo.name.toLowerCase().endsWith('.pdf')) {
    alert('⚠️ Solo se permiten archivos PDF');
    return;
  }

  if (archivo.size > 10 * 1024 * 1024) {
    alert('⚠️ El archivo es muy grande (máximo 10 MB)');
    return;
  }

  const exito = await subirSilabo(materiaId, archivo);
  if (exito) {
    alert('✅ Sílabo subido correctamente');
    renderSeccionSilabos();
  } else {
    alert('❌ Error al subir el sílabo');
  }

  input.value = '';
};

// ============================================================
// INFO DEL EXCEL SUBIDO
// ============================================================
async function actualizarInfoExcel() {
  try {
    const { Preferences } = Capacitor.Plugins;
    const { value } = await Preferences.get({ key: 'ultimo_excel' });

    const infoDiv = document.getElementById('excel-uploaded-info');

    if (value) {
      const info = JSON.parse(value);
      document.getElementById('excel-nombre').textContent = info.nombre;
      document.getElementById('excel-fecha').textContent =
        `Subido el ${info.fecha} a las ${info.hora}`;
      infoDiv.style.display = 'block';
    } else {
      infoDiv.style.display = 'none';
    }
  } catch (e) {
    console.error(e);
  }
}

// ============================================================
// CHECK LIST
// ============================================================
async function renderCheckList() {
  const cont = document.getElementById('checklist-contenido');
  if (!cont) return;

  const { Preferences } = Capacitor.Plugins;
  const { value: excelInfo } = await Preferences.get({ key: 'ultimo_excel' });

  const items = [
    {
      titulo: '📊 Excel del horario',
      estado: excelInfo ? 'ok' : 'pendiente',
      detalle: excelInfo
        ? `Subido (${JSON.parse(excelInfo).fecha})`
        : 'Pendiente de subir',
    },
    ...MATERIAS_CON_SILABO.map(m => {
      const est = ESTADO_SILABOS[m.id];
      return {
        titulo: `📄 Sílabo: ${m.nombre}`,
        estado: est && est.subido ? 'ok' : 'pendiente',
        detalle: est && est.subido
          ? `Subido (${est.fecha})`
          : 'Pendiente de subir',
      };
    }),
    {
      titulo: '🔔 Recordatorios activos',
      estado: 'info',
      detalle: 'Verificar cada domingo',
    },
    {
      titulo: '📱 Notificaciones permitidas',
      estado: 'info',
      detalle: 'Ajustes → Apps → Mi Horario',
    },
  ];

  const ok = items.filter(i => i.estado === 'ok').length;
  const total = items.filter(i => i.estado !== 'info').length;

  cont.innerHTML = `
    <div class="check-resumen">
      📊 ${ok} de ${total} documentos subidos
    </div>
    ${items.map(i => `
      <div class="check-item">
        <div class="check-box">${i.estado === 'ok' ? '✅' : i.estado === 'pendiente' ? '⬜' : 'ℹ️'}</div>
        <div class="check-texto">
          <div class="check-titulo">${i.titulo}</div>
          <div class="check-estado ${i.estado}">${i.detalle}</div>
        </div>
      </div>
    `).join('')}
  `;
}