import { Filesystem, Directory } from '@capacitor/filesystem';
import { StorageService } from './storageService.js';

export class SilaboService {
    static async guardarSilabo(horario, materiaId, archivo, temas) {
        const materia = horario.find(m => m.id === materiaId);
        if (!materia) throw new Error('Materia no encontrada.');

        let rutaArchivo = null;
        let nombreArchivo = null;

        if (archivo) {
            const base64 = await this._archivoABase64(archivo);
            nombreArchivo = `silabo_${materia.codigo}_${Date.now()}.${archivo.name.split('.').pop()}`;
            rutaArchivo = `silabos/${nombreArchivo}`;

            await Filesystem.writeFile({
                path: rutaArchivo,
                data: base64,
                directory: Directory.Documents,
                recursive: true
            });
        }

        materia.silabo = {
            archivo: nombreArchivo,
            ruta: rutaArchivo,
            temas: temas.filter(t => t.trim() !== ''),
            fechaCarga: new Date().toISOString()
        };

        await StorageService.guardarHorario(horario);
        return materia;
    }

    static _archivoABase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
}