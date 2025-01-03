document.addEventListener('DOMContentLoaded', function() {
    const gridContainer = document.getElementById('grid-container');
    const colorPicker = document.getElementById('colorPicker');
    const clearBtn = document.getElementById('clear-btn');
    const saveBtn = document.getElementById('save-aliens');
    
    let currentGrid = 0;
    const alienDesigns = [{}, {}, {}, {}];
    let isMouseDown = false;
    
    // Add mouse down/up listeners to document
    document.addEventListener('mousedown', () => isMouseDown = true);
    document.addEventListener('mouseup', () => isMouseDown = false);
    
    // Pre-designed aliens - one for each grid
    const preDesignedAliens = [
        { // Classic Space Invader
            8: '#00ff00', 9: '#00ff00', 10: '#00ff00', 11: '#00ff00', 12: '#00ff00', 13: '#00ff00', 14: '#00ff00', 15: '#00ff00',
            16: '#00ff00', 19: '#00ff00', 20: '#00ff00', 23: '#00ff00',
            24: '#00ff00', 27: '#00ff00', 28: '#00ff00', 31: '#00ff00',
            32: '#00ff00', 33: '#00ff00', 34: '#00ff00', 35: '#00ff00', 36: '#00ff00', 37: '#00ff00', 38: '#00ff00', 39: '#00ff00',
            40: '#00ff00', 41: '#00ff00', 42: '#00ff00', 43: '#00ff00', 44: '#00ff00', 45: '#00ff00', 46: '#00ff00', 47: '#00ff00',
            48: '#00ff00', 51: '#00ff00', 52: '#00ff00', 55: '#00ff00'
        },
        { // Crab-like
            17: '#ff0000', 22: '#ff0000',
            25: '#ff0000', 26: '#ff0000', 27: '#ff0000', 28: '#ff0000',
            33: '#ff0000', 34: '#ff0000', 35: '#ff0000', 36: '#ff0000',
            41: '#ff0000', 42: '#ff0000', 43: '#ff0000', 44: '#ff0000'
        },
        { // Squid-like
            19: '#0000ff', 20: '#0000ff',
            26: '#0000ff', 27: '#0000ff', 28: '#0000ff', 29: '#0000ff',
            33: '#0000ff', 34: '#0000ff', 35: '#0000ff', 36: '#0000ff',
            42: '#0000ff', 43: '#0000ff'
        },
        { // Octopus-like
            18: '#ff00ff', 19: '#ff00ff', 20: '#ff00ff', 21: '#ff00ff',
            25: '#ff00ff', 26: '#ff00ff', 27: '#ff00ff', 28: '#ff00ff',
            34: '#ff00ff', 35: '#ff00ff',
            41: '#ff00ff', 44: '#ff00ff'
        }
    ];
    
    // Create grids with pre-designed options
    for (let g = 0; g < 4; g++) {
        const gridWrapper = document.createElement('div');
        gridWrapper.className = 'grid-wrapper';
        
        // Create main grid
        const grid = document.createElement('div');
        grid.className = 'grid';
        grid.dataset.gridId = g;
        
        for (let i = 0; i < 64; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.index = i;
            
            const fillCell = function() {
                const gridId = parseInt(this.parentElement.dataset.gridId);
                const index = parseInt(this.dataset.index);
                const color = colorPicker.value;
                
                this.style.backgroundColor = color;
                alienDesigns[gridId][index] = color;
            };
            
            cell.addEventListener('mousedown', fillCell);
            cell.addEventListener('mouseenter', function() {
                if (isMouseDown) {
                    fillCell.call(this);
                }
            });
            
            grid.appendChild(cell);
        }
        
        // Create pre-designed option
        const preDesigned = document.createElement('div');
        preDesigned.className = 'pre-designed-alien';
        preDesigned.title = 'Click to use this design';
        
        for (let i = 0; i < 64; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.style.backgroundColor = preDesignedAliens[g][i] || '#000';
            preDesigned.appendChild(cell);
        }
        
        preDesigned.addEventListener('click', function() {
            alienDesigns[g] = { ...preDesignedAliens[g] };
            updateGrid(g);
        });
        
        gridWrapper.appendChild(grid);
        gridWrapper.appendChild(preDesigned);
        gridContainer.appendChild(gridWrapper);
    }
    
    function updateGrid(gridId) {
        const gridElement = document.querySelector(`.grid[data-grid-id="${gridId}"]`);
        const cells = gridElement.getElementsByClassName('cell');
        
        for (let i = 0; i < 64; i++) {
            cells[i].style.backgroundColor = alienDesigns[gridId][i] || '#000';
        }
    }
    
    clearBtn.addEventListener('click', function() {
        const currentGridElement = document.querySelector(`.grid[data-grid-id="${currentGrid}"]`);
        const cells = currentGridElement.getElementsByClassName('cell');
        
        for (let cell of cells) {
            cell.style.backgroundColor = '#000';
            delete alienDesigns[currentGrid][cell.dataset.index];
        }
    });
    
    saveBtn.addEventListener('click', async function() {
        const response = await fetch('/save_aliens', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ aliens: alienDesigns })
        });
        
        if (response.ok) {
            window.location.href = '/game';
        }
    });
}); 