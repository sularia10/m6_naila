import { Tauler } from "./model.js";
import { vaixellsJSON } from "./vaixells.js";
import { mostrarTaulerInteractiu, mostrarVaixellsPerSeleccio, mostrarMissatge, mostrarFormulariDispar } from "./vista.js";
import { desarPartida, carregarPartida, recuperaTaulersApi, llistarPartides } from './indexAPI.js';

const FILES = 10;
const COLUMNES = 10;

export let taulerJugador = new Tauler(FILES, COLUMNES);
export let taulerIA = new Tauler(FILES, COLUMNES);
taulerIA.colocarVaixellsAleatoris(vaixellsJSON);

let vaixellSeleccionat = null;
let vaixellsColocats = 0;
let orientacioHoritzontal = true;

const botoJugar = document.getElementById("jugar");
botoJugar.disabled = true;

function actualitzarTaulers() {
    const vistaJugador = taulerJugador.caselles.map(fila => 
        fila.map(casella => {
            if (casella.vaixell && !casella.disparat) return { vaixell: true };
            if (casella.disparat) return casella.vaixell ? "X" : "aigua";
            return null;
        })
    );

    const vistaIA = taulerIA.caselles.map(fila =>
        fila.map(casella => {
            if (!casella.disparat) return null;
            return casella.vaixell ? "X" : "aigua";
        })
    );

    mostrarTaulerInteractiu("jugador", vistaJugador, colocarVaixell, vaixellsColocats < vaixellsJSON.length);
    mostrarTaulerInteractiu("ia", vistaIA, jugarTornJugador, vaixellsColocats === vaixellsJSON.length);
}

function colocarVaixell(fila, columna) {
    if (!vaixellSeleccionat) {
        mostrarMissatge("Si us plau, selecciona primer un vaixell");
        return;
    }

    const exitColocacio = taulerJugador.colocarVaixell(
        fila, 
        columna, 
        vaixellSeleccionat, 
        orientacioHoritzontal
    );

    if (exitColocacio) {
        vaixellsColocats++;
        vaixellSeleccionat = null;
        actualitzarTaulers();

        if (vaixellsColocats === vaixellsJSON.length) {
            botoJugar.disabled = false;
            mostrarMissatge("Tots els vaixells col·locats! Pots començar a jugar.");
        }
    } else {
        mostrarMissatge("No es pot col·locar el vaixell aquí");
    }
}

async function jugarTornJugador(fila, columna) {
    if (vaixellsColocats < vaixellsJSON.length) return;

    const resultat = taulerIA.processarDispar(fila, columna);
    if (!resultat) {
        mostrarMissatge("Ja has disparat aquí!");
        return;
    }

    let missatge = "";
    switch (resultat.tipus) {
        case 'aigua':
            missatge = "Aigua!";
            break;
        case 'tocat':
            missatge = "Tocat!";
            break;
        case 'enfonsat':
            missatge = `Has enfonsat el ${resultat.vaixell.tipus}!`;
            break;
    }

    mostrarMissatge(missatge);
    actualitzarTaulers();
    
    if (taulerIA.totsVaixellsEnfonsats()) {
        mostrarMissatge("Has guanyat! Tots els vaixells enemics han estat enfonsats!");
        return;
    }

    // Torn IA
    await new Promise(resolve => setTimeout(resolve, 1000));
    jugarTornIA();
}

function jugarTornIA() {
    let fila, columna;
    do {
        fila = Math.floor(Math.random() * FILES);
        columna = Math.floor(Math.random() * COLUMNES);
    } while (taulerJugador.caselles[fila][columna].disparat);

    const resultat = taulerJugador.processarDispar(fila, columna);
    let missatge = "L'IA ha disparat a " + `(${fila}, ${columna}): `;
    
    switch (resultat.tipus) {
        case 'aigua':
            missatge += "Aigua!";
            break;
        case 'tocat':
            missatge += "Tocat!";
            break;
        case 'enfonsat':
            missatge += `Ha enfonsat el teu ${resultat.vaixell.tipus}!`;
            break;
    }

    mostrarMissatge(missatge);
    actualitzarTaulers();

    if (taulerJugador.totsVaixellsEnfonsats()) {
        mostrarMissatge("Has perdut! L'IA ha enfonsat tots els teus vaixells!");
    }
}

async function actualitzarLlistaPartides() {
    const llistaPartides = document.getElementById('llista-partides');
    
    try {
        const partides = await llistarPartides();
        
        if (!partides || partides.length === 0) {
            llistaPartides.innerHTML = '<p>No hi ha partides desades</p>';
            return;
        }

        llistaPartides.innerHTML = partides.map(partida => `
            <div class="targeta-partida">
                <div class="info-partida">
                    <span><strong>Jugador:</strong> ${partida.jugador}</span>
                    <span><strong>ID:</strong> ${partida.id}</span>
                </div>
                <button class="boto-carregar" onclick="window.carregarPartidaDesada('${partida.id}')">
                    Carregar Partida
                </button>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error al carregar llista de partides:', error);
        mostrarMissatge('Error al carregar llista de partides');
    }
}

function inicialitzarControls() {
    window.addEventListener("keydown", (event) => {
        if (event.key.toLowerCase() === "h") {
            orientacioHoritzontal = true;
            mostrarMissatge("Orientació canviada a Horitzontal");
        } else if (event.key.toLowerCase() === "v") {
            orientacioHoritzontal = false;
            mostrarMissatge("Orientació canviada a Vertical");
        }
    });

    document.getElementById('desarPartida').addEventListener('click', async () => {
        const nomJugador = prompt('Introdueix el teu nom:', 'Jugador1');
        if (!nomJugador) return;

        try {
            const dadesPartida = {
                jugador: nomJugador,
                taulerJugador,
                taulerIA
            };

            const idPartida = await desarPartida(dadesPartida);
            mostrarMissatge(`Partida desada amb èxit. ID: ${idPartida}`);
            await actualitzarLlistaPartides();
        } catch (error) {
            console.error('Error al desar:', error);
            mostrarMissatge('Error al desar la partida');
        }
    });

    document.getElementById('carregarPartida').addEventListener('click', async () => {
        const id = prompt("Introdueix l'ID de la partida:");
        if (!id) return;
        
        try {
            await carregarPartidaDesada(id);
        } catch (error) {
            console.error('Error al carregar:', error);
            mostrarMissatge('Error al carregar la partida');
        }
    });

    mostrarVaixellsPerSeleccio(vaixellsJSON, vaixell => {
        vaixellSeleccionat = vaixell;
        mostrarMissatge(`Has seleccionat: ${vaixell.nom}`);
    });
}

window.carregarPartidaDesada = async (id) => {
    try {
        const partida = await carregarPartida(id);
        const { tableroJugador, tableroIA } = partida;
        
        taulerJugador = Tauler.fromJSON({ tableroJugador });
        taulerIA = Tauler.fromJSON({ tableroIA });
        
        vaixellsColocats = taulerJugador.vaixells.length;
        
        if (vaixellsColocats === vaixellsJSON.length) {
            document.getElementById('jugar').disabled = false;
        }
        
        actualitzarTaulers();
        mostrarMissatge(`Partida carregada correctament`);
    } catch (error) {
        console.error('Error al carregar:', error);
        mostrarMissatge('Error al carregar la partida');
    }
};

// Inicialitzar el joc
document.addEventListener('DOMContentLoaded', () => {
    inicialitzarControls();
    actualitzarTaulers();
    actualitzarLlistaPartides();
});