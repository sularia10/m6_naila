// Clase Barco (Barco es el barco que el jugador o la IA tiene)
export class Barco {
  constructor(nombre, tamaño) {
    this.nombre = nombre;  // Nombre del barco
    this.tamaño = tamaño;  // Tamaño del barco
    this.posiciones = [];   // Lista de posiciones ocupadas por el barco
    this.hits = 0;          // Contador de impactos en el barco
  }

  // Establece las posiciones que ocupa el barco
  setPosiciones(posiciones) {
    this.posiciones = posiciones;
  }

  // Recibe un impacto en una posición, marca si es un impacto válido
  recibirImpacto(fila, col) {
    for (let i = 0; i < this.posiciones.length; i++) {
      if (this.posiciones[i].fila === fila && this.posiciones[i].col === col) {
        this.hits++;
        return true; // El impacto fue exitoso
      }
    }
    return false; // No hubo impacto
  }

  // Verifica si el barco está hundido (si recibió tantos impactos como su tamaño)
  estaHundido() {
    return this.hits >= this.tamaño;
  }
}

// Clase Tablero (El tablero donde los barcos están colocados)
export class Tablero {
  constructor(filas, columnas) {
    this.filas = filas;       // Número de filas en el tablero
    this.columnas = columnas; // Número de columnas en el tablero
    this.celdas = [];         // Matriz de celdas
    this.barcos = [];         // Lista de barcos colocados

    // Inicializamos las celdas como vacías
    for (let i = 0; i < filas; i++) {
      let fila = [];
      for (let j = 0; j < columnas; j++) {
        fila.push({ barco: null, disparado: false }); // Cada celda está vacía y no disparada
      }
      this.celdas.push(fila);
    }
  }

  // Coloca un barco manualmente en el tablero, devuelve true si se coloca con éxito
  colocarBarcoManual(barco, filaInicio, colInicio, horizontal) {
    if (!this.puedeColocar(barco.tamaño, filaInicio, colInicio, horizontal)) {
      return false; // No se puede colocar el barco
    }

    let posiciones = [];
    for (let i = 0; i < barco.tamaño; i++) {
      const fila = horizontal ? filaInicio : filaInicio + i;
      const col = horizontal ? colInicio + i : colInicio;
      this.celdas[fila][col].barco = barco; // Coloca el barco en las celdas
      posiciones.push({ fila, col }); // Guarda las posiciones
    }
    barco.setPosiciones(posiciones);
    this.barcos.push(barco);
    return true;
  }

  // Revisa si un barco puede ser colocado en las posiciones dadas
  puedeColocar(tamaño, filaInicio, colInicio, horizontal) {
    for (let i = 0; i < tamaño; i++) {
      const fila = horizontal ? filaInicio : filaInicio + i;
      const col = horizontal ? colInicio + i : colInicio;
      if (fila < 0 || fila >= this.filas || col < 0 || col >= this.columnas || this.celdas[fila][col].barco !== null) {
        return false; // El barco se sale del tablero o se superpone con otro barco
      }
    }
    return true; // El barco puede ser colocado
  }

  // Coloca todos los barcos aleatoriamente (solo para la IA)
  colocarBarcosAleatorio(barcosData) {
    for (let i = 0; i < barcosData.length; i++) {
      let colocado = false;
      while (!colocado) {
        const horizontal = Math.random() < 0.5; // Decide si el barco será horizontal o vertical
        const filaInicio = Math.floor(Math.random() * this.filas);  // Fila aleatoria
        const colInicio = Math.floor(Math.random() * this.columnas); // Columna aleatoria
        const barco = new Barco(barcosData[i].name, barcosData[i].size);
        colocado = this.colocarBarcoManual(barco, filaInicio, colInicio, horizontal); // Intenta colocar el barco
      }
    }
  }

  // Recibe un disparo en una posición, devuelve 'agua', 'tocado' o 'hundido'
  recibirDisparo(fila, col) {
    if (this.celdas[fila][col].disparado) {
      return null; // Ya se disparó en esta casilla
    }
    this.celdas[fila][col].disparado = true; // Marca la celda como disparada
    const barco = this.celdas[fila][col].barco;
    if (!barco) {
      return "agua"; // No hay barco en esta casilla
    }
    barco.recibirImpacto(fila, col); // Marca el impacto en el barco
    if (barco.estaHundido()) {
      return "hundido"; // El barco está hundido
    }
    return "tocado"; // El barco está tocado
  }

  // Devuelve una casilla aleatoria que no ha sido disparada
  casillaAleatoriaNoDisparada() {
    let fila, col;
    do {
      fila = Math.floor(Math.random() * this.filas);  // Selecciona fila aleatoria
      col = Math.floor(Math.random() * this.columnas); // Selecciona columna aleatoria
    } while (this.celdas[fila][col].disparado); // Repite si la casilla ya fue disparada
    return [fila, col];
  }

  // Verifica si todos los barcos han sido hundidos
  todosHundidos() {
    for (let i = 0; i < this.barcos.length; i++) {
      if (!this.barcos[i].estaHundido()) {
        return false; // Si algún barco no está hundido, retorna false
      }
    }
    return true; // Todos los barcos están hundidos
  }

  // Devuelve una vista del tablero para mostrar a la IA, sin mostrar los barcos no tocados
  obtenerVistaOculta() {
    let vista = [];
    for (let f = 0; f < this.filas; f++) {
      let fila = [];
      for (let c = 0; c < this.columnas; c++) {
        const celda = this.celdas[f][c];
        if (!celda.disparado) {
          fila.push(null); // No mostrar barcos no tocados
        } else if (celda.barco) {
          fila.push("X"); // Mostrar "X" si el barco está tocado
        } else {
          fila.push("agua"); // Mostrar "agua" si el disparo fue en una casilla vacía
        }
      }
      vista.push(fila);
    }
    return vista;
  }
}
