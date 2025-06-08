class Casella {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vaixell = null;
        this.disparat = false;
    }

    estaOcupada() {
        return this.vaixell !== null;
    }

    marcarDispar() {
        this.disparat = true;
        return this.estaOcupada();
    }

    toJSON() {
        return {
            x: this.x,
            y: this.y,
            disparat: this.disparat,
            vaixell: this.vaixell ? {
                tipus: this.vaixell.tipus,
                mida: this.vaixell.mida,
                color: this.vaixell.color
            } : null
        };
    }
}

export class Vaixell {
    constructor(tipus, mida, color) {
        this.tipus = tipus;
        this.mida = mida;
        this.color = color;
        this.posicions = [];
        this.enfonsat = false;
    }

    estaEnfonsat() {
        return this.posicions.every(pos => pos.disparat);
    }

    toJSON() {
        return {
            tipus: this.tipus,
            mida: this.mida,
            color: this.color,
            enfonsat: this.enfonsat,
            // Save positions as coordinates only
            posicions: this.posicions.map(p => ({ x: p.x, y: p.y }))
        };
    }
}

export class Tauler {
    constructor(files = 10, columnes = 10) {
        this.files = files;
        this.columnes = columnes;
        this.caselles = this.inicialitzarCaselles();
        this.vaixells = [];
    }

    inicialitzarCaselles() {
        return Array(this.files).fill().map((_, i) => 
            Array(this.columnes).fill().map((_, j) => new Casella(i, j))
        );
    }

    colocarVaixellAleatori(vaixell) {
        let intents = 0;
        const maxIntents = 100;

        while (intents < maxIntents) {
            const horitzontal = Math.random() < 0.5;
            const x = Math.floor(Math.random() * this.files);
            const y = Math.floor(Math.random() * this.columnes);

            if (this.potColocarVaixell(x, y, vaixell.mida, horitzontal)) {
                this.colocarVaixell(x, y, vaixell, horitzontal);
                return true;
            }
            intents++;
        }
        return false;
    }

    colocarVaixellsAleatoris(vaixellsJSON) {
        vaixellsJSON.forEach(v => {
            const vaixell = new Vaixell(v.nom, v.mida, v.color);
            this.colocarVaixellAleatori(vaixell);
        });
    }

    processarDispar(fila, columna) {
        const casella = this.caselles[fila][columna];
        if (casella.disparat) return null;

        const impacte = casella.marcarDispar();
        if (impacte && casella.vaixell) {
            const vaixell = this.vaixells.find(v => 
                v.posicions.includes(casella)
            );
            if (vaixell.estaEnfonsat()) {
                vaixell.enfonsat = true;
                return { tipus: 'enfonsat', vaixell };
            }
            return { tipus: 'tocat' };
        }
        return { tipus: 'aigua' };
    }

    toJSON() {
        return {
            caselles: this.caselles.map(fila => 
                fila.map(casella => casella.toJSON())
            ),
            vaixells: this.vaixells
        };
    }

    static fromJSON(json) {
        const tauler = new Tauler();
        const data = json.tableroJugador || json.tableroIA || json;
        
        if (!data || !data.caselles) {
            throw new Error("Format de dades invàlid");
        }

        const vaixells = (data.vaixells || []).map(v => {
            const vaixell = new Vaixell(v.tipus, v.mida, v.color);
            vaixell.enfonsat = v.enfonsat || false;
            return vaixell;
        });

        tauler.caselles = data.caselles.map((fila, i) =>
            fila.map((c, j) => {
                const casella = new Casella(i, j);
                casella.disparat = c.disparat;
                if (c.vaixell) {
                    // Find matching ship
                    casella.vaixell = vaixells.find(v => 
                        v.tipus === c.vaixell.tipus && 
                        v.mida === c.vaixell.mida
                    );
                    // Add position to ship
                    if (casella.vaixell) {
                        casella.vaixell.posicions.push(casella);
                    }
                }
                return casella;
            })
        );

        tauler.vaixells = vaixells;
        return tauler;
    }

    potColocarVaixell(fila, columna, mida, horitzontal) {
        // Comprovar si el vaixell surt del tauler
        if (horitzontal) {
            if (columna + mida > this.columnes) return false;
        } else {
            if (fila + mida > this.files) return false;
        }

        // Comprovar si hi ha altres vaixells a prop
        for (let i = -1; i <= mida; i++) {
            for (let j = -1; j <= 1; j++) {
                const novaFila = fila + (horitzontal ? j : i);
                const novaColumna = columna + (horitzontal ? i : j);

                if (novaFila >= 0 && novaFila < this.files && 
                    novaColumna >= 0 && novaColumna < this.columnes) {
                    if (this.caselles[novaFila][novaColumna].estaOcupada()) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    colocarVaixell(fila, columna, vaixell, horitzontal) {
        if (!this.potColocarVaixell(fila, columna, vaixell.mida, horitzontal)) {
            return false;
        }

        const nouVaixell = new Vaixell(vaixell.nom, vaixell.mida, vaixell.color);
        
        for (let i = 0; i < vaixell.mida; i++) {
            const novaFila = fila + (horitzontal ? 0 : i);
            const novaColumna = columna + (horitzontal ? i : 0);
            const casella = this.caselles[novaFila][novaColumna];
            
            casella.vaixell = nouVaixell;
            nouVaixell.posicions.push(casella);
        }

        this.vaixells.push(nouVaixell);
        return true;
    }

    totsVaixellsEnfonsats() {
        return this.vaixells.every(vaixell => vaixell.estaEnfonsat());
    }
}