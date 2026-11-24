// ============================================================
// SERVICIO DE VOZ (reconocimiento + síntesis)
// ============================================================

import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';

export class VozService {
  constructor() {
    this.escuchando = false;
  }

  async verificarPermisos() {
    try {
      const { available } = await SpeechRecognition.available();
      return available;
    } catch (e) {
      console.error('Error verificando permisos:', e);
      return false;
    }
  }

  async pedirPermisos() {
    try {
      const permiso = await SpeechRecognition.requestPermissions();
      return permiso.speechRecognition === 'granted';
    } catch (e) {
      console.error('Error pidiendo permisos:', e);
      return false;
    }
  }

  async escuchar() {
    try {
      const disponible = await this.verificarPermisos();
      if (!disponible) {
        throw new Error('Reconocimiento de voz no disponible en este dispositivo');
      }

      await this.pedirPermisos();

      if (this.escuchando) {
        await SpeechRecognition.stop();
      }

      this.escuchando = true;

      const resultado = await SpeechRecognition.start({
        language: 'es-EC',
        maxResults: 1,
        prompt: 'Habla ahora...',
        partialResults: false,
        popup: false,
      });

      this.escuchando = false;

      if (resultado.matches && resultado.matches.length > 0) {
        return resultado.matches[0];
      }
      return '';
    } catch (error) {
      this.escuchando = false;
      console.error('Error en reconocimiento:', error);
      throw error;
    }
  }

  async detener() {
    try {
      if (this.escuchando) {
        await SpeechRecognition.stop();
        this.escuchando = false;
      }
    } catch (e) {
      console.error(e);
    }
  }

  async hablar(texto) {
    try {
      await TextToSpeech.speak({
        text: texto,
        lang: 'es-ES',
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0,
      });
    } catch (e) {
      console.error('Error al hablar:', e);
    }
  }
}

export const vozService = new VozService();