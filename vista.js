export function mostrarTaulerInteractiu(id, estat, funcioClick, permetreClick = true) {
    const contenidor = document.getElementById(id);
    contenidor.innerHTML = '';
    contenidor.style.display = 'grid';
    contenidor.style.gridTemplateColumns = `repeat(${estat[0].length}, 30px)`;
    contenidor.style.gap = '2px';

    estat.forEach((fila, i) => {
        fila.forEach((casella, j) => {
            const div = document.createElement('div');
            div.style.width = '30px';
            div.style.height = '30px';
            div.style.border = '1px solid #999';
            
            if (casella === 'aigua') {
                div.style.backgroundColor = '#99ccff';
            } else if (casella === 'X') {
                div.style.backgroundColor = '#ff6666';
            } else if (casella?.vaixell) {
                div.style.backgroundColor = '#666666';
            } else {
                div.style.backgroundColor = '#eee';
            }

            if (permetreClick) {
                div.style.cursor = 'pointer';
                div.onclick = () => funcioClick(i, j);
            }
            
            contenidor.appendChild(div);
        });
    });
}

export function mostrarVaixellsPerSeleccio(vaixells, onSeleccio) {
    const contenidor = document.getElementById('vaixells');
    contenidor.innerHTML = '';
    
    vaixells.forEach(vaixell => {
        const boto = document.createElement('button');
        boto.textContent = `${vaixell.nom} (${vaixell.mida})`;
        boto.style.margin = '5px';
        boto.style.padding = '10px';
        boto.style.backgroundColor = vaixell.color;
        boto.style.color = 'white';
        boto.style.border = 'none';
        boto.style.borderRadius = '5px';
        boto.onclick = () => onSeleccio(vaixell);
        contenidor.appendChild(boto);
    });
}

export function mostrarMissatge(text, tipus = 'normal') {
    const contenidor = document.getElementById('missatge');
    
    // Eliminar classes anteriors
    contenidor.className = '';
    contenidor.id = 'missatge';
    
    // Afegir classe segons el tipus de missatge
    if (tipus === 'victoria') {
        contenidor.classList.add('victoria');
        text = `🎉 ${text} 🎉`;
    } else if (tipus === 'derrota') {
        contenidor.classList.add('derrota');
        text = `💥 ${text} 💥`;
    }
    
    contenidor.textContent = text;
}

export function mostrarFormulariDispar(onDispar) {
    const contenidor = document.getElementById('formulariDispar');
    contenidor.innerHTML = `
        <div style="margin: 10px">
            <label>Fila (0-9): <input type="number" id="fila" min="0" max="9"></label>
            <label>Columna (0-9): <input type="number" id="columna" min="0" max="9"></label>
            <button id="disparar">Disparar</button>
        </div>
    `;

    document.getElementById('disparar').onclick = () => {
        const fila = parseInt(document.getElementById('fila').value);
        const columna = parseInt(document.getElementById('columna').value);
        if (fila >= 0 && fila < 10 && columna >= 0 && columna < 10) {
            onDispar(fila, columna);
        } else {
            mostrarMissatge('Coordenades no vàlides');
        }
    };
}