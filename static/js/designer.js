document.addEventListener('DOMContentLoaded', function() {
    const gridContainer = document.getElementById('grid-container');
    const colorPicker = document.getElementById('colorPicker');
    const clearBtn = document.getElementById('clear-btn');
    const saveBtn = document.getElementById('save-aliens');
    
    let currentGrid = 0;
    const alienDesigns = [{}, {}, {}, {}];
    let isMouseDown = false;
    let isRightMouseDown = false;  // Track right mouse button
    
    // Add mouse down/up listeners to document
    document.addEventListener('mousedown', (e) => {
        if (e.button === 0) isMouseDown = true;        // Left click
        if (e.button === 2) isRightMouseDown = true;   // Right click
    });
    document.addEventListener('mouseup', (e) => {
        if (e.button === 0) isMouseDown = false;
        if (e.button === 2) isRightMouseDown = false;
    });
    
    // Prevent context menu on right click
    document.addEventListener('contextmenu', (e) => {
        if (e.target.classList.contains('cell')) {
            e.preventDefault();
        }
    });
    
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
    
    // Add this after the existing preDesignedAliens array
    const alienSets = {
        classic: preDesignedAliens, // Use the existing preDesignedAliens for classic set
        simpsons: [
            {
                // Grid one Homer
                2: '#ffff00', 3: '#ffff00', 4: '#ffff00', 5: '#ffff00',
                9: '#ffff00', 10: '#ffffff', 11: '#ffff00', 12: '#ffff00', 13: '#ffffff', 14: '#ffff00',
                17: '#ffffff', 19: '#ffffff', 20: '#ffffff', 22: '#ffffff',
                24: '#ffff00', 25: '#ffffff', 27: '#ffffff', 28: '#ffffff', 30: '#ffffff', 31: '#ffff00',
                33: '#ffff00', 34: '#ffffff', 35: '#ffff00', 36: '#ffff00', 37: '#ffffff', 38: '#ffff00',
                41: '#ffff00', 42: '#B39B00', 43: '#B39B00', 44: '#B39B00', 45: '#B39B00', 46: '#ffff00',
                50: '#B39B00', 51: '#B39B00', 52: '#B39B00', 53: '#B39B00', 
                58: '#ffff00', 59: '#B39B00', 60: '#B39B00', 61: '#ffff00'
            },
            {
                // Grid two Bart
                0: '#ffff00', 2: '#ffff00', 4: '#ffff00', 6: '#ffff00',
                9: '#ffff00', 10: '#ffff00', 11: '#ffff00', 12: '#ffff00', 13: '#ffff00',
                17: '#ffffff', 18: '#ffffff', 19: '#ffff00', 20: '#ffffff', 21: '#ffffff', 
                25: '#ffffff', 27: '#ffff00', 29: '#ffff00',
                33: '#ffff00', 34: '#ffff00', 35: '#ffff00', 36: '#ffff00', 37: '#ffff00',
                41: '#ffff00', 42: '#ffffff', 43: '#ffffff', 44: '#ffffff', 45: '#ffff00',
                50: '#ffff00', 51: '#ffffff', 52: '#ffff00',
                59: '#ffff00'
            },
            {
                // Large rectangle of blue in the upper rows
                // Row 1
                8: '#0000ff', 9: '#0000ff', 10: '#0000ff', 11: '#0000ff',
                12: '#0000ff', 13: '#0000ff', 14: '#0000ff', 15: '#0000ff',
                // Row 2
                16: '#0000ff', 17: '#0000ff', 18: '#0000ff', 19: '#0000ff',
                20: '#0000ff', 21: '#0000ff', 22: '#0000ff', 23: '#0000ff',
                // Row 3
                24: '#0000ff', 25: '#0000ff', 26: '#0000ff', 27: '#0000ff',
                28: '#0000ff', 29: '#0000ff', 30: '#0000ff', 31: '#0000ff',
                // Row 4: yellow "belt"
                32: '#ffff00', 33: '#ffff00', 34: '#ffff00', 35: '#ffff00',
                36: '#ffff00', 37: '#ffff00', 38: '#ffff00', 39: '#ffff00',
                // Row 5: white "feet"
                40: '#ffffff', 41: '#ffffff', 42: '#ffffff', 43: '#ffffff',
                44: '#ffffff', 45: '#ffffff', 46: '#ffffff', 47: '#ffffff'
            },
            {
                // Row 1: top row of yellow
                9: '#ffff00', 10: '#ffff00', 11: '#ffff00', 12: '#ffff00',
                // Row 2: big band of yellow
                16: '#ffff00', 17: '#ffff00', 18: '#ffff00', 19: '#ffff00',
                20: '#ffff00', 21: '#ffff00', 22: '#ffff00', 23: '#ffff00',
                // Row 3: white eyes in the middle
                27: '#ffffff', 28: '#ffffff',
                // Row 4: fill more yellow
                32: '#ffff00', 33: '#ffff00', 34: '#ffff00', 35: '#ffff00',
                36: '#ffff00', 37: '#ffff00',
                // Optional row 5 for a chin or neck
                43: '#ffff00'
            }
        ],
        retro: [
            // Simple placeholder designs for now
            { 17: '#ff0000', 18: '#ff0000', 21: '#ff0000', 22: '#ff0000',
              25: '#ff0000', 26: '#ff0000', 29: '#ff0000', 30: '#ff0000' },
            { 16: '#00ff00', 17: '#00ff00', 22: '#00ff00', 23: '#00ff00',
              24: '#00ff00', 25: '#00ff00', 30: '#00ff00', 31: '#00ff00' },
            { 18: '#0000ff', 19: '#0000ff', 20: '#0000ff', 21: '#0000ff',
              26: '#0000ff', 27: '#0000ff', 28: '#0000ff', 29: '#0000ff' },
            { 19: '#ff00ff', 20: '#ff00ff', 27: '#ff00ff', 28: '#ff00ff',
              35: '#ff00ff', 36: '#ff00ff', 43: '#ff00ff', 44: '#ff00ff' }
        ]
    };
    
    // Add this function to handle set selection
    function loadAlienSet(setName) {
        const selectedSet = alienSets[setName];
        if (selectedSet) {
            // Load the designs into the grids
            selectedSet.forEach((design, index) => {
                alienDesigns[index] = { ...design };
                updateGrid(index);
            });
        }
    }
    
    // Function to update selected grid visual feedback
    function updateSelectedGridStyle() {
        document.querySelectorAll('.grid').forEach((grid, index) => {
            if (index === currentGrid) {
                grid.classList.add('selected-grid');
            } else {
                grid.classList.remove('selected-grid');
            }
        });
    }
    
    // First, move the handleTouch function definition to the top level
    function handleTouch(e) {
        e.preventDefault(); // Prevent scrolling
        const touch = e.touches[0];
        const cell = document.elementFromPoint(touch.clientX, touch.clientY);
        
        if (cell && cell.classList.contains('cell')) {
            const fillCell = function() {
                const gridId = parseInt(this.parentElement.dataset.gridId);
                const index = parseInt(this.dataset.index);
                const color = colorPicker.value;
                this.style.backgroundColor = color;
                alienDesigns[gridId][index] = color;
            };
            fillCell.call(cell);
        }
    }
    
    // Create grids with pre-designed options
    for (let g = 0; g < 4; g++) {
        const gridWrapper = document.createElement('div');
        gridWrapper.className = 'grid-wrapper';
        
        const grid = document.createElement('div');
        grid.className = 'grid';
        grid.dataset.gridId = g;
        
        // Add click handler to select grid
        grid.addEventListener('click', function() {
            currentGrid = parseInt(this.dataset.gridId);
            updateSelectedGridStyle();
        });
        
        // Add touch event listeners to the grid
        grid.addEventListener('touchstart', handleTouch, { passive: false });
        grid.addEventListener('touchmove', handleTouch, { passive: false });
        
        for (let i = 0; i < 64; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.index = i;
            
            const fillCell = function(erase = false) {
                const gridId = parseInt(this.parentElement.dataset.gridId);
                const index = parseInt(this.dataset.index);
                
                if (erase) {
                    this.style.backgroundColor = '#000';
                    delete alienDesigns[gridId][index];
                } else {
                    const color = colorPicker.value;
                    this.style.backgroundColor = color;
                    alienDesigns[gridId][index] = color;
                }
            };
            
            // Mouse events
            cell.addEventListener('mousedown', function(e) {
                if (e.button === 0) fillCell.call(this, false);
                if (e.button === 2) fillCell.call(this, true);
            });
            
            cell.addEventListener('mouseenter', function() {
                if (isMouseDown) fillCell.call(this, false);
                if (isRightMouseDown) fillCell.call(this, true);
            });
            
            // Add touch events to individual cells as well
            cell.addEventListener('touchstart', handleTouch, { passive: false });
            cell.addEventListener('touchmove', handleTouch, { passive: false });
            
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
    
    // Initialize the first grid as selected
    updateSelectedGridStyle();
    
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
    
    // Make loadAlienSet function globally accessible
    window.loadAlienSet = loadAlienSet;
}); 