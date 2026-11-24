// ============================================================
// UI DEL ASISTENTE IA (chat + voz)
// ============================================================

import { iaService } from '../services/iaService.js';
import { vozService } from '../services/vozService.js';

export function abrirAsistenteIA(contexto) {
  const { horario, planificacion, semanaActual } = contexto;

  // Si ya existe, eliminar
  const existente = document.getElementById('modal-ia');
  if (existente) existente.remove();

  const modal = document.createElement('div');
  modal.id = 'modal-ia';
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-contenido modal-ia">
      <div class="ia-header">
        <div class="ia-titulo">
          <span class="ia-emoji">🤖</span>
          <span>Asistente IA</span>
        </div>
        <button class="ia-cerrar" id="ia-cerrar">✕</button>
      </div>

      <div class="ia-chat" id="ia-chat">
        <div class="ia-mensaje ia-bot">
          ¡Hola! Soy tu asistente académico. 🎓<br><br>
          Pregúntame cosas como:<br>
          • <em>"¿Qué clase tengo ahora?"</em><br>
          • <em>"¿Qué tema toca esta semana?"</em><br>
          • <em>"¿Cuántas horas tengo mañana?"</em>
        </div>
      </div>

      <div class="ia-controles">
        <button class="ia-btn-mic" id="ia-mic">🎙️</button>
        <input 
          type="text" 
          id="ia-input" 
          class="ia-input" 
          placeholder="Escribe o habla..."
        />
        <button class="ia-btn-enviar" id="ia-enviar">➤</button>
      </div>

      <div class="ia-status" id="ia-status"></div>
    </div>
  `;

  document.body.appendChild(modal);

  // Referencias
  const chat = document.getElementById('ia-chat');
  const input = document.getElementById('ia-input');
  const btnMic = document.getElementById('ia-mic');
  const btnEnviar = document.getElementById('ia-enviar');
  const btnCerrar = document.getElementById('ia-cerrar');
  const status = document.getElementById('ia-status');

  // ============================================================
  // FUNCIONES
  // ============================================================

  function agregarMensaje(texto, tipo = 'user') {
    const div = document.createElement('div');
    div.className = `ia-mensaje ia-${tipo}`;
    div.innerHTML = texto;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
  }

  function mostrarStatus(texto) {
    status.textContent = texto;
    status.style.display = texto ? 'block' : 'none';
  }

  async function enviarPregunta(pregunta) {
    if (!pregunta.trim()) return;

    agregarMensaje(pregunta, 'user');
    input.value = '';
    mostrarStatus('🤔 Pensando...');

    try {
      const respuesta = await iaService.preguntar(
        pregunta,
        horario,
        planificacion,
        semanaActual
      );
      agregarMensaje(respuesta, 'bot');
      mostrarStatus('');
      // Hablar respuesta
      await vozService.hablar(respuesta);
    } catch (error) {
      agregarMensaje('❌ Error: ' + error.message, 'bot');
      mostrarStatus('');
    }
  }

  async function activarMicrofono() {
    if (!iaService.tieneApiKey()) {
      agregarMensaje('⚠️ Primero configura tu API Key de Gemini. Ve a Ajustes.', 'bot');
      return;
    }

    try {
      mostrarStatus('🎙️ Escuchando...');
      btnMic.classList.add('activo');
      const texto = await vozService.escuchar();
      btnMic.classList.remove('activo');
      mostrarStatus('');

      if (texto) {
        await enviarPregunta(texto);
      } else {
        mostrarStatus('No se reconoció ninguna voz.');
        setTimeout(() => mostrarStatus(''), 2000);
      }
    } catch (error) {
      btnMic.classList.remove('activo');
      mostrarStatus('Error: ' + error.message);
      setTimeout(() => mostrarStatus(''), 3000);
    }
  }

  // ============================================================
  // EVENTOS
  // ============================================================

  btnCerrar.onclick = () => {
    modal.remove();
    vozService.detener();
  };

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
      vozService.detener();
    }
  });

  btnEnviar.onclick = () => enviarPregunta(input.value);

  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') enviarPregunta(input.value);
  });

  btnMic.onclick = activarMicrofono;

  // Focus al input
  setTimeout(() => input.focus(), 300);
}