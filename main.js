import { Tablero, Barco } from "./modelo.js";
import { barcosJSON } from "./barcos.js";
import { mostrarTableroInteractivo, mostrarBarcosParaSeleccion, mostrarMensaje, mostrarFormularioDisparo } from "./vista.js";

const filas = 10;
const columnas = 10;

let tableroJugador = new Tablero(filas, columnas);
let tableroIA = new Tablero(filas, columnas);
tableroIA.colocarBarcosAleatorio(barcosJSON);

let barcoSeleccionado = null;
let colocados = 0;

const botonJugar = document.getElementById("jugar");
botonJugar.disabled = true;

function actualizarTableros() {
  // Actualizamos tablero del jugador
  let vistaJugador = [];
  for (let i = 0; i < tableroJugador.celdas.length; i++) {
    let filaVista = [];
    for (let j = 0; j < tableroJugador.celdas[i].length; j++) {
      let celda = tableroJugador.celdas[i][j];
      if (celda.barco && !celda.disparado) filaVista.push({ barco: true });
      else if (celda.barco && celda.disparado) filaVista.push("X");
      else if (!celda.barco && celda.disparado) filaVista.push("agua");
      else filaVista.push(null);
    }
    vistaJugador.push(filaVista);
  }

  mostrarTableroInteractivo("jugador", vistaJugador, colocarBarcoClick, colocados < barcosJSON.length);

  // Actualizamos tablero de la IA (solo disparos visibles)
  let vistaIA = tableroIA.obtenerVistaOculta();
  mostrarTableroInteractivo("ia", vistaIA, null, false);
}

function colocarBarcoClick(fila, col) {
  if (!barcoSeleccionado) {
    mostrarMensaje("Primero selecciona un barco.");
    return;
  }
  let barco = new Barco(barcoSeleccionado.name, barcoSeleccionado.size);
  let exito = tableroJugador.colocarBarcoManual(barco, fila, col, horizontal);
  if (exito) {
    colocados++;
    mostrarMensaje("Barco " + barco.nombre + " colocado.");
    barcoSeleccionado = null; // deseleccionamos el barco
    if (colocados === barcosJSON.length) {
      mostrarMensaje("¡Todos los barcos colocados! Puedes jugar.");
      botonJugar.disabled = false;
      deshabilitarColocacion();
      mostrarFormularioDisparo(jugarTurnoJugador);
    }
  } else {
    mostrarMensaje("Posición no válida para ese barco.");
  }
  actualizarTableros();
}

function deshabilitarColocacion() {
  let tableroSoloBarcos = [];
  for (let i = 0; i < tableroJugador.celdas.length; i++) {
    let fila = [];
    for (let j = 0; j < tableroJugador.celdas[i].length; j++) {
      let celda = tableroJugador.celdas[i][j];
      if (celda.barco) fila.push({ barco: true });
      else if (celda.disparado) fila.push(celda.barco ? "X" : "agua");
      else fila.push(null);
    }
    tableroSoloBarcos.push(fila);
  }
  mostrarTableroInteractivo("jugador", tableroSoloBarcos, null, false);
}

mostrarBarcosParaSeleccion(barcosJSON, function(barco) {
  barcoSeleccionado = barco;
  mostrarMensaje("Seleccionaste: " + barco.name);
});

function jugarTurnoJugador(fila, col) {
  let resultado = tableroIA.recibirDisparo(fila, col);
  if (resultado === null) {
    mostrarMensaje("Ya disparaste ahí. Elige otra posición.");
    return;
  }
  actualizarTableros();

  if (resultado === "agua") {
    mostrarMensaje("¡Agua! Ahora le toca a la IA.");
    turnoIA();
  } else if (resultado === "tocado") {
    mostrarMensaje("¡Tocado! Puedes disparar otra vez.");
  } else if (resultado === "hundido") {
    mostrarMensaje("¡Hundido! Puedes disparar otra vez.");
  }

  if (tableroIA.todosHundidos()) {
    mostrarMensaje("¡Ganaste! Hundiste toda la flota enemiga.");
    botonJugar.disabled = true;
  }
}

function turnoIA() {
  let dispararDeNuevo = true;
  while (dispararDeNuevo) {
    let coordenadas = tableroJugador.casillaAleatoriaNoDisparada();
    let fila = coordenadas[0];
    let col = coordenadas[1];
    let resultado = tableroJugador.recibirDisparo(fila, col);
    actualizarTableros();

    if (resultado === "agua") {
      mostrarMensaje("La IA disparó en " + fila + "," + col + ": Agua. Tu turno.");
      dispararDeNuevo = false;
    } else if (resultado === "tocado") {
      mostrarMensaje("La IA disparó en " + fila + "," + col + ": Tocado. Sigue la IA.");
    } else if (resultado === "hundido") {
      mostrarMensaje("La IA disparó en " + fila + "," + col + ": Hundido. Sigue la IA.");
    }
    if (tableroJugador.todosHundidos()) {
      mostrarMensaje("¡La IA ganó! Perdiste toda tu flota.");
      botonJugar.disabled = true;
      dispararDeNuevo = false;
    }
  }
}

botonJugar.onclick = function() {
  mostrarMensaje("Comienza la partida. Introduce coordenadas y dispara.");
  mostrarFormularioDisparo(jugarTurnoJugador);
};

actualizarTableros();

let horizontal = true;

window.addEventListener("keydown", function(event) {
  if (event.key.toLowerCase() === "h") {
    horizontal = true;
    mostrarMensaje("La orientación cambió a Horizontal.");
  } else if (event.key.toLowerCase() === "v") {
    horizontal = false;
    mostrarMensaje("La orientación cambió a Vertical.");
  }
});
