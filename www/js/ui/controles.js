export function renderizarControles(contenedor, callbacks) {
    contenedor.innerHTML = `
        <label class="btn-file">
            📥 Subir horario (Excel)
            <input type="file" id="excelInput" accept=".xlsx,.xls,.csv" hidden>
        </label>
        <button id="btnResetear" class="btn-danger">🗑️ Resetear</button>
        <button id="btnAlarmas" class="btn-warning">🔔 Activar alarmas</button>
        <label class="input-min">
            Anticipación:
            <input type="number" id="minAnticipacion" value="5" min="1" max="30"> min
        </label>
    `;

    contenedor.querySelector('#excelInput').addEventListener('change', callbacks.onExcel);
    contenedor.querySelector('#btnResetear').addEventListener('click', callbacks.onReset);
    contenedor.querySelector('#btnAlarmas').addEventListener('click', callbacks.onAlarmas);
    contenedor.querySelector('#minAnticipacion').addEventListener('change', callbacks.onAnticipacion);
}