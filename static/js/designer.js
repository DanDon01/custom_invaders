document.addEventListener('DOMContentLoaded', function() {
    const gridContainer = document.getElementById('grid-container');
    const colorPicker = document.getElementById('colorPicker');
    const clearBtn = document.getElementById('clear-btn');
    const saveBtn = document.getElementById('save-aliens');
    const preDesignedContainer = document.getElementById('pre-designed-aliens');
    
    let currentGrid = 0;
    const alienDesigns = [{}, {}, {}, {}];
    let isMouseDown = false;
    
    // Add mouse down/up listeners to document
    document.addEventListener('mousedown', () => isMouseDown = true);
    document.addEventListener('mouseup', () => isMouseDown = false);
    
    // Pre-designed aliens
    const preDesignedAliens = [
        {
            0: '#00ff00', 1: '#00ff00', 2: '#00ff00', 3: '#00ff00',
            8: '#00ff00', 11: '#00ff00', 12: '#00ff00', 15: '#00ff00',
            16: '#00ff00', 19: '#00ff00', 20: '#00ff00', 23: '#00ff00',
            24: '#00ff00', 27: '#00ff00', 28: '#00ff00', 31: '#00ff00',
            32: '#00ff00', 35: '#00ff00', 36: '#00ff00', 39: '#00ff00',
            40: '#00ff00', 43: '#00ff00', 44: '#00ff00', 47: '#00ff00',
            48: '#00ff00', 51: '#00ff00', 52: '#00ff00', 55: '#00ff00',
            56: '#00ff00', 59: '#00ff00', 60: '#00ff00', 63: '#00ff00'
        },
        {
            1: '#ff0000', 2: '#ff0000', 9: '#ff0000', 10: '#ff0000',
            17: '#ff0000', 18: '#ff0000', 25: '#ff0000', 26: '#ff0000',
            33: '#ff0000', 34: '#ff0000', 41: '#ff0000', 42: '#ff0000',
            49: '#ff0000', 50: '#ff0000', 57: '#ff0000', 58: '#ff0000'
        },
        {
            0: '#0000ff', 3: '#0000ff', 8: '#0000ff', 11: '#0000ff',
            16: '#0000ff', 19: '#0000ff', 24: '#0000ff', 27: '#0000ff',
            32: '#0000ff', 35: '#0000ff', 40: '#0000ff', 43: '#0000ff',
            48: '#0000ff', 51: '#0000ff', 56: '#0000ff', 59: '#0000ff'
        }
    ];
    
    // Create pre-designed alien elements
    preDesignedAliens.forEach((design, index) => {
        const alienElement = document.createElement('div');
        alienElement.className = 'pre-designed-alien';
        alienElement.dataset.designId = index;
        
        for (let i = 0; i < 64; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.style.backgroundColor = design[i] || '#000';
            alienElement.appendChild(cell);
        }
        
        alienElement.addEventListener('click', function() {
            const gridId = currentGrid;
            alienDesigns[gridId] = { ...design };
            updateGrid(gridId);
        });
        
        preDesignedContainer.appendChild(alienElement);
    });
    
    // Create 4 grids
    for (let g = 0; g < 4; g++) {
        const grid = document.createElement('div');
        grid.className = 'grid';
        grid.dataset.gridId = g;
        
        for (let i = 0; i < 64; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.index = i;
            
            // Handle both click and drag
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
        
        gridContainer.appendChild(grid);
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