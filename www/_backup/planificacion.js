// ============================================================
// PLANIFICACIÓN 16 SEMANAS - CICLO 2026-2027
// ============================================================

const CICLO = {
  fechaInicio: new Date(2026, 9, 12), // 12 oct 2026
  fechaFin: new Date(2027, 1, 1),      // 1 feb 2027
  totalSemanas: 16,
};

const CALENDARIO = [
  { semana: 1,  inicio: new Date(2026, 9, 12),  fin: new Date(2026, 9, 18) },
  { semana: 2,  inicio: new Date(2026, 9, 19),  fin: new Date(2026, 9, 25) },
  { semana: 3,  inicio: new Date(2026, 9, 26),  fin: new Date(2026, 10, 1) },
  { semana: 4,  inicio: new Date(2026, 10, 2),  fin: new Date(2026, 10, 8) },
  { semana: 5,  inicio: new Date(2026, 10, 9),  fin: new Date(2026, 10, 15) },
  { semana: 6,  inicio: new Date(2026, 10, 16), fin: new Date(2026, 10, 22) },
  { semana: 7,  inicio: new Date(2026, 10, 23), fin: new Date(2026, 10, 29) },
  { semana: 8,  inicio: new Date(2026, 10, 30), fin: new Date(2026, 11, 6) },
  { semana: 9,  inicio: new Date(2026, 11, 7),  fin: new Date(2026, 11, 13) },
  { semana: 10, inicio: new Date(2026, 11, 14), fin: new Date(2026, 11, 20) },
  { semana: 11, inicio: new Date(2026, 11, 21), fin: new Date(2026, 11, 27) },
  { semana: 12, inicio: new Date(2026, 11, 28), fin: new Date(2027, 0, 3) },
  { semana: 13, inicio: new Date(2027, 0, 4),  fin: new Date(2027, 0, 10) },
  { semana: 14, inicio: new Date(2027, 0, 11), fin: new Date(2027, 0, 17) },
  { semana: 15, inicio: new Date(2027, 0, 18), fin: new Date(2027, 0, 24) },
  { semana: 16, inicio: new Date(2027, 0, 25), fin: new Date(2027, 0, 31) },
];

const TEMAS = {
  'INFRAESTRUCTURA, SEGURIDAD Y GESTION DE RIESGO EN LAS TI (IISC_8_A)': [
    { semana: 1,  tema: 'Fundamentos de Networking y IoT', docencia: 2, practicas: 2 },
    { semana: 2,  tema: 'Edge Computing y Cloud Computing', docencia: 2, practicas: 2 },
    { semana: 3,  tema: 'Administración de Redes y Virtualización', docencia: 2, practicas: 2 },
    { semana: 4,  tema: 'Administración de Redes y Virtualización (continuación)', docencia: 2, practicas: 2 },
    { semana: 5,  tema: 'Seguridad de la Información en IoT y AI', docencia: 2, practicas: 2 },
    { semana: 6,  tema: 'Métodos de Prevención de Riesgos con Machine Learning', docencia: 2, practicas: 2 },
    { semana: 7,  tema: 'Planificación y Políticas de Seguridad', docencia: 2, practicas: 2 },
    { semana: 8,  tema: 'Revisión Normativa de Seguridad (ISO/IEC 17799)', docencia: 2, practicas: 2 },
    { semana: 9,  tema: 'Técnicas Hacking y anatomía de un ataque', docencia: 2, practicas: 2 },
    { semana: 10, tema: 'Técnicas Hacking (continuación)', docencia: 2, practicas: 2 },
    { semana: 11, tema: 'Fraudes y Malware', docencia: 2, practicas: 2 },
    { semana: 12, tema: 'Seguridad en Redes Informáticas', docencia: 2, practicas: 2 },
    { semana: 13, tema: 'Cortafuegos. Sistemas de detección de intrusos', docencia: 2, practicas: 2 },
    { semana: 14, tema: 'VLANs y VPNs', docencia: 2, practicas: 2 },
    { semana: 15, tema: 'Integración de conceptos', docencia: 2, practicas: 2 },
    { semana: 16, tema: 'Cierre del ciclo y retroalimentación', docencia: 2, practicas: 2 },
  ],
  'CONTROL Y AUDITORIA INFORMATICA (IISC_7_A)': [
    { semana: 1,  tema: 'Definiciones y Principios de la Auditoría Informática', docencia: 2, practicas: 1 },
    { semana: 2,  tema: 'Delitos Informáticos (COIP)', docencia: 2, practicas: 1 },
    { semana: 3,  tema: 'Base Legal (Comercio Electrónico, Propiedad Intelectual)', docencia: 2, practicas: 1 },
    { semana: 4,  tema: 'Modelos de Control: COSO', docencia: 3, practicas: 1 },
    { semana: 5,  tema: 'Modelos de Control: ITIL', docencia: 3, practicas: 1 },
    { semana: 6,  tema: 'Modelos de Control: COBIT', docencia: 4, practicas: 1 },
    { semana: 7,  tema: 'Análisis e implementación de Auditoría en PYMES', docencia: 3, practicas: 2 },
    { semana: 8,  tema: 'Desarrollo de etapas de Auditoría (parte 1)', docencia: 3, practicas: 2 },
    { semana: 9,  tema: 'Desarrollo de etapas de Auditoría (parte 2)', docencia: 3, practicas: 1 },
    { semana: 10, tema: 'Desarrollo de etapas de Auditoría (parte 3)', docencia: 3, practicas: 1 },
    { semana: 11, tema: 'Elaboración del Informe de Auditoría (parte 1)', docencia: 3, practicas: 1 },
    { semana: 12, tema: 'Elaboración del Informe de Auditoría (parte 2)', docencia: 3, practicas: 1 },
    { semana: 13, tema: 'Elaboración del Informe de Auditoría (parte 3)', docencia: 3, practicas: 1 },
    { semana: 14, tema: 'Presentación de resultados', docencia: 3, practicas: 1 },
    { semana: 15, tema: 'Seguimiento de recomendaciones', docencia: 3, practicas: 1 },
    { semana: 16, tema: 'Cierre del ciclo y retroalimentación', docencia: 3, practicas: 1 },
  ],
  'COMPUTACION EN LA NUBE, ARQUITECTURA Y SEGURIDAD DE LOS SISTEMAS DE INFORMACION (IISC_7_A)': [
    { semana: 1,  tema: 'Introducción a la computación en la nube', docencia: 2, practicas: 2 },
    { semana: 2,  tema: 'Modelos de servicio (IaaS, PaaS, SaaS)', docencia: 2, practicas: 2 },
    { semana: 3,  tema: 'Modelos de despliegue (pública, privada, híbrida)', docencia: 2, practicas: 2 },
    { semana: 4,  tema: 'Ventajas y desafíos de la computación en la nube', docencia: 2, practicas: 2 },
    { semana: 5,  tema: 'Principales proveedores (AWS, Azure, Google Cloud)', docencia: 2, practicas: 2 },
    { semana: 6,  tema: 'Principios de arquitectura en la nube', docencia: 2, practicas: 2 },
    { semana: 7,  tema: 'Diseño de aplicaciones escalables y resilientes', docencia: 2, practicas: 2 },
    { semana: 8,  tema: 'Gestión y orquestación de recursos en la nube', docencia: 2, practicas: 2 },
    { semana: 9,  tema: 'Contenedores y microservicios (Docker, Kubernetes)', docencia: 2, practicas: 2 },
    { semana: 10, tema: 'Monitoreo y optimización de rendimiento', docencia: 2, practicas: 2 },
    { semana: 11, tema: 'Principios de seguridad en la nube', docencia: 2, practicas: 2 },
    { semana: 12, tema: 'Gestión de identidades y accesos (IAM)', docencia: 2, practicas: 2 },
    { semana: 13, tema: 'Protección de datos y encriptación', docencia: 2, practicas: 2 },
    { semana: 14, tema: 'Cumplimiento y normativas (GDPR, HIPAA)', docencia: 2, practicas: 2 },
    { semana: 15, tema: 'Gestión de incidentes y recuperación', docencia: 2, practicas: 2 },
    { semana: 16, tema: 'Cierre del ciclo y retroalimentación', docencia: 2, practicas: 2 },
  ],
};

// ============================================================
// FUNCIONES DE UTILIDAD
// ============================================================

function semanaActual(fecha = new Date()) {
  if (fecha < CICLO.fechaInicio) return 0;
  const dias = Math.floor((fecha - CICLO.fechaInicio) / (1000 * 60 * 60 * 24));
  const semana = Math.floor(dias / 7) + 1;
  return semana > CICLO.totalSemanas ? CICLO.totalSemanas + 1 : semana;
}

function rangoSemana(numSemana) {
  const info = CALENDARIO.find(c => c.semana === numSemana);
  if (!info) return '';
  const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const f1 = `${info.inicio.getDate()} ${meses[info.inicio.getMonth()]}`;
  const f2 = `${info.fin.getDate()} ${meses[info.fin.getMonth()]} ${info.fin.getFullYear()}`;
  return `${f1} - ${f2}`;
}

function temaDeMateria(materia, numSemana) {
  const lista = TEMAS[materia];
  if (!lista) return null;
  return lista.find(t => t.semana === numSemana) || null;
}

function tieneTema(materia) {
  return !!TEMAS[materia];
}

function textoEstadoCiclo() {
  const hoy = new Date();
  const semana = semanaActual(hoy);

  if (hoy < CICLO.fechaInicio) {
    const diasFaltantes = Math.ceil((CICLO.fechaInicio - hoy) / (1000 * 60 * 60 * 24));
    return `⏳ Ciclo comienza en ${diasFaltantes} días`;
  }
  if (semana > CICLO.totalSemanas) {
    return `🎓 Ciclo finalizado`;
  }
  return `Semana ${semana} de 16 · ${rangoSemana(semana)}`;
}