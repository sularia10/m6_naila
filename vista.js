// Función para pintar un tablero interactivo
export function mostrarTableroInteractivo(idDiv, celdas, funcionClick, habilitarClick = true) {
  const div = document.getElementById(idDiv);
  div.innerHTML = ""; // Limpiar el contenido

  div.setAttribute("role", "grid"); // Para accesibilidad

  // Recorremos las filas del tablero
  for (let fila = 0; fila < celdas.length; fila++) {
    const filaDiv = document.createElement("div");
    filaDiv.style.display = "flex"; // Mostrar las celdas en fila
    filaDiv.setAttribute("role", "row"); // Para accesibilidad
    
    // Recorremos las columnas de cada fila
    for (let col = 0; col < celdas[fila].length; col++) {
      const celda = document.createElement("div");
      celda.style.width = "30px";
      celda.style.height = "30px";
      celda.style.border = "1px solid black";
      celda.style.textAlign = "center";
      celda.style.lineHeight = "30px";
      celda.style.userSelect = "none"; // Evita seleccionar el texto
      celda.style.cursor = habilitarClick ? "pointer" : "default"; // Si se puede hacer click, cambiar el cursor
      celda.setAttribute("role", "gridcell"); // Para accesibilidad
      celda.setAttribute("aria-label", `Celda ${fila},${col}`); // Etiqueta para accesibilidad

      const valor = celdas[fila][col];
      
      // Dependiendo del valor, cambiar el estilo de la celda
      if (valor === null) {
        celda.style.backgroundColor = "lightblue"; // Agua sin disparar
      } else if (valor === "agua") {
        celda.style.backgroundColor = "blue";
        celda.textContent = ""; // Celda de agua disparada
      } else if (valor === "X") {
        celda.style.backgroundColor = "red";
        celda.textContent = "X"; // Marca de impacto
      } else if (typeof valor === "object" && valor.barco) {
        celda.style.backgroundColor = "gray"; // Barco visible para el jugador
      }

      // Si se habilita el click, añadir el evento
      if (habilitarClick) {
        celda.addEventListener("click", function() {
          funcionClick(fila, col); // Llamamos a la función cuando se hace clic
        });
      }

      filaDiv.appendChild(celda); // Añadimos la celda a la fila
    }
    div.appendChild(filaDiv); // Añadimos la fila al div principal
  }
}

// Función para mostrar los barcos y permitir su selección
export function mostrarBarcosParaSeleccion(barcos, funcionSeleccion) {
  const div = document.getElementById("barcos");
  div.innerHTML = ""; // Limpiar el contenido previo
  let selectedButton = null; // Variable para almacenar el botón seleccionado

  // Crear un botón por cada barco
  for (let i = 0; i < barcos.length; i++) {
    const barco = barcos[i];
    const btn = document.createElement("button");
    btn.textContent = `${barco.name} (${barco.size})`; // Mostrar nombre y tamaño del barco

    // Cuando se haga clic en un barco, lo seleccionamos
    btn.onclick = function() {
      if (selectedButton) selectedButton.style.backgroundColor = ""; // Desmarcar el anterior
      btn.style.backgroundColor = "yellow"; // Resaltar el barco seleccionado
      selectedButton = btn;
      funcionSeleccion(barco); // Llamamos a la función de selección
    };
    
    div.appendChild(btn); // Añadir el botón al div
  }
}

// Función para mostrar un mensaje en pantalla
export function mostrarMensaje(texto) {
  const div = document.getElementById("mensaje");
  div.textContent = texto; // Cambiar el texto del div
}

// Función para mostrar el formulario para disparar
export function mostrarFormularioDisparo(funcionDisparo) {
  const div = document.getElementById("formularioDisparo");
  div.innerHTML = `
    <label for="inputFila">Fila:</label>
    <input type="number" id="inputFila" placeholder="Fila (0-9)" min="0" max="9" style="width:60px;" />
    <label for="inputCol">Columna:</label>
    <input type="number" id="inputCol" placeholder="Columna (0-9)" min="0" max="9" style="width:60px;" />
    <button id="botonDisparar">Disparar</button>
  `;

  const boton = document.getElementById("botonDisparar");
  
  // Cuando se haga clic en el botón disparar
  boton.onclick = function() {
    const inputFila = document.getElementById("inputFila");
    const inputCol = document.getElementById("inputCol");
    
    // Obtener los valores de fila y columna
    const fila = parseInt(inputFila.value);
    const col = parseInt(inputCol.value);

    // Verificar si las coordenadas son válidas
    if (
      Number.isInteger(fila) && fila >= 0 && fila < 10 &&
      Number.isInteger(col) && col >= 0 && col < 10
    ) {
      funcionDisparo(fila, col); // Llamar a la función de disparo
      inputFila.value = ""; // Limpiar el campo de fila
      inputCol.value = ""; // Limpiar el campo de columna
    } else {
      mostrarMensaje("Coordenadas no válidas"); // Mostrar mensaje de error
    }
  };
}
