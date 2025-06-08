import { Tauler } from './model.js';

const API_URL = 'http://localhost:3000';

export async function desarPartida(dadesPartida) {
    if (!dadesPartida || !dadesPartida.taulerJugador || !dadesPartida.taulerIA) {
        throw new Error("Els taulers no estan inicialitzats");
    }

    const partida = {
        id: Date.now().toString(),
        jugador: dadesPartida.jugador,
        tableroJugador: dadesPartida.taulerJugador.toJSON(),
        tableroIA: dadesPartida.taulerIA.toJSON(), 
        fecha: new Date().toISOString() 
    };

    try {
        const response = await fetch(`${API_URL}/partidas`, {  
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(partida)
        });

        if (!response.ok) throw new Error("Error al desar la partida");
        const data = await response.json();
        return data.id;
    } catch (err) {
        console.error("Error:", err);
        throw err;
    }
}

export async function carregarPartida(idPartida) {
    try {
        const response = await fetch(`${API_URL}/partidas/${idPartida}`);
        if (!response.ok) throw new Error("No s'ha trobat la partida");

        const data = await response.json();
        return data;
    } catch (err) {
        console.error("Error:", err);
        throw err;
    }
}

export async function llistarPartides() {
    try {
        const response = await fetch(`${API_URL}/partidas`); 
        if (!response.ok) throw new Error("Error al obtenir les partides");

        const partides = await response.json();
        return partides;
    } catch (err) {
        console.error("Error al llistar partides:", err);
        throw err;
    }
}

export function recuperaTaulersApi(partida) {
    if (!partida) throw new Error("No hi ha dades de partida");
    
    return {
        taulerJugador: Tauler.fromJSON(partida.taulerJugador),
        taulerIA: Tauler.fromJSON(partida.taulerIA),
        nomJugador: partida.jugador
    };
}