import { SilaboService } from '../services/silaboService.js';

export function abrirModalMateria(bloque, horario, onGuardar) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    overlay.innerHTML = `
        <div class="modal">
            <header>
                <h2>${bloque.materia}</h2>
                <button class="cerrar">✕</button>
            </header>

            <section class="info">
                <p><strong>Código:</strong> ${bloque.codigo}</p>
                <p><strong>Día:</strong> ${bloque.dia}</p>
                <p><strong>Horario:</strong> ${bloque.inicio} - ${bloque.fin} (${bloque.duracion}h)</p>
            </section>

            <section class="silabo">
                <h3>📄 Sílabo</h3>
                <input type="file" id="inputSilabo" accept=".pdf,.doc,.docx">
                <p id="nombreArchivo">${bloque.silabo?.archivo || 'Sin archivo cargado'}</p>

                <h3>📝 Temas del sílabo</h3>
                <textarea id="temas" rows="8" placeholder="Un tema por línea...">${
                    (bloque.silabo?.temas || []).join('\n')
                }</textarea>
            </section>

            <footer>
                <button id="btnGuardar" class="btn-primary">💾 Guardar</button>
                <button class="btn-secondary cerrar">Cancelar</button>
            </footer>
        </div>
    `;

    document.getElementById('contenedorModal').appendChild(overlay);

    const cerrar = () => overlay.remove();
    overlay.querySelectorAll('.cerrar').forEach(b => b.addEventListener('click', cerrar));
    overlay.addEventListener('click', (e) => { if (e.target === overlay) cerrar(); });

    overlay.querySelector('#btnGuardar').addEventListener('click', async () => {
        const archivo = overlay.querySelector('#inputSilabo').files[0];
        const temas = overlay.querySelector('#temas').value.split('\n');

        try {
            await SilaboService.guardarSilabo(horario, bloque.id, archivo, temas);
            onGuardar(horario);
            cerrar();
        } catch (error) {
            alert('Error: ' + error.message);
        }
    });
}