let procesos = [];
const colores = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE'];

function manejarEnter(event, siguienteCampoId) {
    if (event.key === 'Enter') {
        event.preventDefault();
        document.getElementById(siguienteCampoId).focus();
    }
}

function manejarEnterAgregar(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        agregarProceso();
    }
}

function agregarProceso() {
    const id = document.getElementById('processId').value;
    const llegada = parseInt(document.getElementById('arrivalTime').value);
    const rafaga = parseInt(document.getElementById('burstTime').value);

    if (!id || isNaN(llegada) || isNaN(rafaga) || rafaga <= 0) {
        alert('Por favor completa todos los campos correctamente');
        return;
    }

    const proceso = {
        id: id,
        tiempoLlegada: llegada,
        tiempoRafaga: rafaga,
        tiempoEspera: 0,
        tiempoFinalizacion: 0,
        tiempoRetorno: 0,
        color: colores[procesos.length % colores.length]
    };

    procesos.push(proceso);
    mostrarProcesos();
    limpiarFormulario();
    document.getElementById('processId').focus();
}

function eliminarProceso(index) {
    procesos.splice(index, 1);
    mostrarProcesos();
    
    if (procesos.length === 0) {
        document.getElementById('ganttChart').innerHTML = '';
        document.getElementById('metrics').innerHTML = '';
    }
}

function mostrarProcesos() {
    const tabla = document.getElementById('processTable');
    
    if (procesos.length === 0) {
        tabla.innerHTML = '<p>No hay procesos ingresados</p>';
        return;
    }

    let html = '<table><thead><tr>';
    html += '<th>ID</th><th>Tiempo Llegada</th><th>Tiempo CPU (ms)</th>';
    html += '<th>Tiempo Espera</th><th>Tiempo Finalización</th><th>Tiempo Retorno</th>';
    html += '<th>Acciones</th>';
    html += '</tr></thead><tbody>';

    procesos.forEach((p, index) => {
        html += '<tr>';
        html += `<td>${p.id}</td>`;
        html += `<td>${p.tiempoLlegada}</td>`;
        html += `<td>${p.tiempoRafaga}</td>`;
        html += `<td>${p.tiempoEspera}</td>`;
        html += `<td>${p.tiempoFinalizacion}</td>`;
        html += `<td>${p.tiempoRetorno}</td>`;
        html += `<td><button class="delete-btn" onclick="eliminarProceso(${index})">🗑️ Eliminar</button></td>`;
        html += '</tr>';
    });

    html += '</tbody></table>';
    tabla.innerHTML = html;
}

function calcularFIFO() {
    if (procesos.length === 0) {
        alert('Agrega al menos un proceso');
        return;
    }

    procesos.sort((a, b) => a.tiempoLlegada - b.tiempoLlegada);
    let tiempoActual = 0;
    
    procesos.forEach(proceso => {
        if (tiempoActual < proceso.tiempoLlegada) {
            tiempoActual = proceso.tiempoLlegada;
        }

        proceso.tiempoEspera = tiempoActual - proceso.tiempoLlegada;
        tiempoActual += proceso.tiempoRafaga;
        proceso.tiempoFinalizacion = tiempoActual;
        proceso.tiempoRetorno = proceso.tiempoFinalizacion - proceso.tiempoLlegada;
    });

    mostrarProcesos();
    mostrarGantt();
    mostrarMetricas();
}

function mostrarGantt() {
    const gantt = document.getElementById('ganttChart');
    let html = '<div style="display: flex; align-items: center; margin: 20px 0;">';

    let tiempoInicio = 0;
    procesos.forEach(proceso => {
        const inicio = Math.max(tiempoInicio, proceso.tiempoLlegada);
        const ancho = proceso.tiempoRafaga * 50; 

        html += `<div class="gantt-bar" style="width: ${ancho}px; background: ${proceso.color}">`;
        html += `${proceso.id}<br>[${inicio}-${proceso.tiempoFinalizacion}]`;
        html += '</div>';

        tiempoInicio = proceso.tiempoFinalizacion;
    });

    html += '</div>';
    gantt.innerHTML = html;
}

function mostrarMetricas() {
    const metricas = document.getElementById('metrics');
    
    const tiempoEsperaPromedio = procesos.reduce((sum, p) => sum + p.tiempoEspera, 0) / procesos.length;
    const tiempoRetornoPromedio = procesos.reduce((sum, p) => sum + p.tiempoRetorno, 0) / procesos.length;

    let html = '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">';
    html += '<div class="metric-card">';
    html += '<h3>Tiempo de Espera Promedio</h3>';
    html += `<div class="metric-value">${tiempoEsperaPromedio.toFixed(2)}</div>`;
    html += '<p>ms</p>';
    html += '</div>';
    
    html += '<div class="metric-card">';
    html += '<h3>Tiempo de Retorno Promedio</h3>';
    html += `<div class="metric-value">${tiempoRetornoPromedio.toFixed(2)}</div>`;
    html += '<p>ms</p>';
    html += '</div>';
    html += '</div>';

    metricas.innerHTML = html;
}

function limpiarFormulario() {
    document.getElementById('processId').value = '';
    document.getElementById('arrivalTime').value = '';
    document.getElementById('burstTime').value = '';
}

function limpiar() {
    procesos = [];
    document.getElementById('processTable').innerHTML = '';
    document.getElementById('ganttChart').innerHTML = '';
    document.getElementById('metrics').innerHTML = '';
    limpiarFormulario();
}