let inventarioMed1 = 0;
        let inventarioMed2 = 0;
        let pacientesAtendidos = 0;
        let pacientesMed1 = 0;
        let pacientesMed2 = 0;
        let pacientes = [];
        let sistemaActivo = false;

        function iniciarInventario() {
            const med1Input = document.getElementById('med1');
            const med2Input = document.getElementById('med2');
            
            const med1 = parseInt(med1Input.value);
            const med2 = parseInt(med2Input.value);

            if (isNaN(med1) || isNaN(med2) || med1 < 0 || med2 < 0) {
                alert('Por favor ingrese valores validos para ambos medicamentos');
                return;
            }

            inventarioMed1 = med1;
            inventarioMed2 = med2;
            sistemaActivo = true;

            document.getElementById('inventorySection').classList.add('hidden');
            document.getElementById('patientSection').classList.remove('hidden');
            
            actualizarInventario();
        }

        function actualizarInventario() {
            document.getElementById('med1Display').textContent = inventarioMed1;
            document.getElementById('med2Display').textContent = inventarioMed2;
        }

        function determinarCategoria(sistolica, diastolica) {
            // Validar rangos
            if (sistolica < 69 && diastolica < 48) {
                return { categoria: 'hipotension', medicamento: 2, dosis: 6 };
            }
            if (sistolica >= 69 && sistolica < 98 && diastolica >= 48 && diastolica < 66) {
                return { categoria: 'Optima', medicamento: 0, dosis: 0 };
            }
            if (sistolica >= 98 && sistolica < 143 && diastolica >= 66 && diastolica < 92) {
                return { categoria: 'Comun', medicamento: 0, dosis: 0 };
            }
            if (sistolica >= 143 && sistolica < 177 && diastolica >= 92 && diastolica < 124) {
                return { categoria: 'Pre HTA', medicamento: 1, dosis: 6 };
            }
            if (sistolica >= 177 && sistolica < 198 && diastolica >= 124 && diastolica < 142) {
                return { categoria: 'HTAG1', medicamento: 1, dosis: 10 };
            }
            if (sistolica >= 198 && sistolica < 246 && diastolica >= 142 && diastolica < 169) {
                return { categoria: 'HTAG2', medicamento: 1, dosis: 18 };
            }
            if (sistolica >= 246 && diastolica >= 169) {
                return { categoria: 'HTAG3', medicamento: 1, dosis: 35 };
            }
            if (sistolica >= 162 && diastolica < 86) {
                return { categoria: 'HTASS', medicamento: 1, dosis: 17 };
            }
            
            return { categoria: 'Sin categoria', medicamento: 0, dosis: 0 };
        }

        function agregarPaciente() {
            if (!sistemaActivo) return;

            const sistolicaInput = document.getElementById('sistolica');
            const diastolicaInput = document.getElementById('diastolica');
            
            const sistolica = parseInt(sistolicaInput.value);
            const diastolica = parseInt(diastolicaInput.value);

            if (isNaN(sistolica) || isNaN(diastolica)) {
                mostrarAlerta('Por favor ingrese valores validos de presion', 'warning');
                return;
            }

            const resultado = determinarCategoria(sistolica, diastolica);
            let entregado = false;
            let mensaje = '';

            // Verificar si se puede entregar medicamento
            if (resultado.medicamento === 1 && inventarioMed1 >= resultado.dosis) {
                inventarioMed1 -= resultado.dosis;
                pacientesMed1++;
                entregado = true;
                mensaje = `Entregado: ${resultado.dosis} dosis de Medicamento 1`;
            } else if (resultado.medicamento === 2 && inventarioMed2 >= resultado.dosis) {
                inventarioMed2 -= resultado.dosis;
                pacientesMed2++;
                entregado = true;
                mensaje = `Entregado: ${resultado.dosis} dosis de Medicamento 2`;
            } else if (resultado.medicamento === 0) {
                entregado = true;
                mensaje = 'No requiere medicamento';
            } else if (resultado.medicamento > 0) {
                mensaje = 'Sin existencias suficientes';
            }

            pacientesAtendidos++;
            
            pacientes.push({
                numero: pacientesAtendidos,
                sistolica,
                diastolica,
                categoria: resultado.categoria,
                medicamento: resultado.medicamento,
                dosis: resultado.dosis,
                entregado,
                mensaje
            });

            actualizarListaPacientes();
            actualizarInventario();

            // Limpiar campos
            sistolicaInput.value = '';
            diastolicaInput.value = '';
            sistolicaInput.focus();

            // Verificar si algún medicamento se agotó
            if ((resultado.medicamento === 1 && inventarioMed1 < 6) || 
                (resultado.medicamento === 2 && inventarioMed2 < 6)) {
                mostrarAlerta('Advertencia: Inventario bajo de medicamento', 'warning');
            }

            // Si se agotaron las existencias de algún medicamento, finalizar
            if (inventarioMed1 === 0 || inventarioMed2 === 0) {
                setTimeout(() => {
                    sistemaActivo = false;
                    mostrarAlerta('Sistema detenido: Se agotaron las existencias de un medicamento', 'info');
                    finalizarAtencion();
                }, 500);
            }
        }

        function actualizarListaPacientes() {
            const lista = document.getElementById('patientList');
            
            if (pacientes.length === 0) {
                lista.innerHTML = '<p style="text-align: center; color: #999;">No hay pacientes registrados</p>';
                return;
            }

            let html = '';
            pacientes.forEach(p => {
                let badgeClass = '';
                if (p.categoria === 'hipotension') badgeClass = 'badge-hipotension';
                else if (p.categoria === 'Optima' || p.categoria === 'Comun') badgeClass = 'badge-normal';
                else if (p.categoria === 'Pre HTA') badgeClass = 'badge-pre-hta';
                else badgeClass = 'badge-hta';

                html += `
                    <div class="patient-item">
                        <div class="patient-info">
                            <strong>Paciente ${p.numero}</strong> - 
                            Sistolica: ${p.sistolica}, Diastolica: ${p.diastolica}<br>
                            <small>${p.mensaje}</small>
                        </div>
                        <span class="patient-badge ${badgeClass}">${p.categoria}</span>
                    </div>
                `;
            });

            lista.innerHTML = html;
            lista.scrollTop = lista.scrollHeight;
        }

        function mostrarAlerta(mensaje, tipo) {
            const container = document.getElementById('alertContainer');
            container.innerHTML = `<div class="alert alert-${tipo}">${mensaje}</div>`;
            setTimeout(() => {
                container.innerHTML = '';
            }, 3000);
        }

        function finalizarAtencion() {
            sistemaActivo = false;
            
            document.getElementById('patientSection').classList.add('hidden');
            document.getElementById('resultsSection').classList.remove('hidden');
            
            const porcentajeMed1 = pacientesAtendidos > 0 ? 
                ((pacientesMed1 / pacientesAtendidos) * 100).toFixed(2) : '0.00';
            const porcentajeMed2 = pacientesAtendidos > 0 ? 
                ((pacientesMed2 / pacientesAtendidos) * 100).toFixed(2) : '0.00';

            const resultsHTML = `
                <h3>Resumen de Atencion</h3>
                <div class="result-item">
                    <span class="result-label">Total de pacientes atendidos:</span>
                    <span class="result-value">${pacientesAtendidos}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Pacientes con Medicamento 1:</span>
                    <span class="result-value">${pacientesMed1} (${porcentajeMed1}%)</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Pacientes con Medicamento 2:</span>
                    <span class="result-value">${pacientesMed2} (${porcentajeMed2}%)</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Medicamento 1 restante:</span>
                    <span class="result-value">${inventarioMed1}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Medicamento 2 restante:</span>
                    <span class="result-value">${inventarioMed2}</span>
                </div>
            `;

            document.getElementById('resultsContainer').innerHTML = resultsHTML;
        }

        function reiniciar() {
            inventarioMed1 = 0;
            inventarioMed2 = 0;
            pacientesAtendidos = 0;
            pacientesMed1 = 0;
            pacientesMed2 = 0;
            pacientes = [];
            sistemaActivo = false;

            document.getElementById('med1').value = '';
            document.getElementById('med2').value = '';
            document.getElementById('sistolica').value = '';
            document.getElementById('diastolica').value = '';

            document.getElementById('resultsSection').classList.add('hidden');
            document.getElementById('patientSection').classList.add('hidden');
            document.getElementById('inventorySection').classList.remove('hidden');
        }

        // Permitir agregar paciente con Enter
        document.addEventListener('DOMContentLoaded', () => {
            document.getElementById('diastolica').addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && sistemaActivo) {
                    agregarPaciente();
                }
            });
        });