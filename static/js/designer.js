document.addEventListener('DOMContentLoaded', function() {
    const gridContainer = document.getElementById('grid-container');
    const colorPicker = document.getElementById('colorPicker');
    const clearBtn = document.getElementById('clear-btn');
    const saveBtn = document.getElementById('save-aliens');
    
    let currentGrid = 0;
    const alienDesigns = [{}, {}, {}, {}];
    
    // Create 4 grids
    for (let g = 0; g < 4; g++) {
        const grid = document.createElement('div');
        grid.className = 'grid';
        grid.dataset.gridId = g;
        
        for (let i = 0; i < 64; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.index = i;
            
            cell.addEventListener('click', function() {
                const gridId = parseInt(this.parentElement.dataset.gridId);
                const index = parseInt(this.dataset.index);
                const color = colorPicker.value;
                
                this.style.backgroundColor = color;
                alienDesigns[gridId][index] = color;
            });
            
            grid.appendChild(cell);
        }
        
        gridContainer.appendChild(grid);
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