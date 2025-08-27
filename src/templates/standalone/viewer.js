// Standalone Panorama Viewer
// Core functionality without management tools

class StandalonePanoramaViewer {
    constructor() {
        this.viewer = null;
        this.scenes = {};
        this.currentScene = null;
        this.projectData = null;
        this.rotationAngle = 0;
        this.miniMapState = {
            isMinimized: false,
            position: { x: 20, y: 20 },
            zoomLevel: 1,
            panOffset: { x: 0, y: 0 }
        };
        
        this.init();
    }
    
    async init() {
        try {
            // Load project data
            const projectDataElement = document.getElementById('project-data');
            this.projectData = JSON.parse(projectDataElement.textContent);
            
            // Wait for Marzipano to load
            if (typeof Marzipano === 'undefined') {
                await this.waitForMarzipano();
            }
            
            // Initialize viewer
            this.initViewer();
            
            // Render components
            this.renderLogo();
            this.renderMiniMap();
            this.renderControls();
            
            // Load initial scene
            if (this.projectData.config && this.projectData.config.scenes.length > 0) {
                const initialScene = this.projectData.config.scenes[0];
                await this.loadScene(initialScene.id);
            }
            
            // Hide loading screen
            this.hideLoadingScreen();
            
        } catch (error) {
            console.error('Failed to initialize viewer:', error);
            this.showError('Failed to load panorama viewer');
        }
    }
    
    waitForMarzipano() {
        return new Promise((resolve) => {
            const checkMarzipano = () => {
                if (typeof Marzipano !== 'undefined') {
                    resolve();
                } else {
                    setTimeout(checkMarzipano, 100);
                }
            };
            checkMarzipano();
        });
    }
    
    initViewer() {
        const panoElement = document.getElementById('pano');
        
        // Marzipano viewer options
        const viewerOpts = {
            controls: {
                mouseViewMode: 'drag'
            }
        };
        
        this.viewer = new Marzipano.Viewer(panoElement, viewerOpts);
        
        // Add click handler for tap hint (if needed)
        panoElement.addEventListener('click', () => {
            // Handle panorama clicks if needed
        });
    }
    
    async loadScene(sceneId) {
        try {
            const sceneData = this.projectData.config.scenes.find(s => s.id === sceneId);
            if (!sceneData) {
                throw new Error(`Scene ${sceneId} not found`);
            }
            
            // Create scene if not exists
            if (!this.scenes[sceneId]) {
                const source = Marzipano.ImageUrlSource.fromString(sceneData.imageUrl);
                const geometry = new Marzipano.EquirectGeometry([{ width: 4096 }]);
                const view = new Marzipano.RectilinearView(
                    sceneData.initialViewParameters || { yaw: 0, pitch: 0, fov: Math.PI / 4 }
                );
                
                const scene = this.viewer.createScene({
                    source: source,
                    geometry: geometry,
                    view: view,
                    pinFirstLevel: true
                });
                
                this.scenes[sceneId] = {
                    scene: scene,
                    data: sceneData,
                    hotspots: []
                };
                
                // Add hotspots for scene navigation
                this.addNavigationHotspots(sceneId, sceneData);
            }
            
            // Switch to scene
            this.scenes[sceneId].scene.switchTo();
            this.currentScene = sceneId;
            
            // Update minimap
            this.updateMiniMap();
            
        } catch (error) {
            console.error('Failed to load scene:', error);
            this.showError(`Failed to load scene: ${sceneId}`);
        }
    }
    
    addNavigationHotspots(sceneId, sceneData) {
        if (!sceneData.hotspots) return;
        
        sceneData.hotspots.forEach(hotspot => {
            if (hotspot.type === 'scene') {
                const hotspotElement = this.createHotspotElement(hotspot);
                const hotspotObj = this.scenes[sceneId].scene.hotspotContainer().createHotspot(
                    hotspotElement,
                    { yaw: hotspot.yaw, pitch: hotspot.pitch }
                );
                
                hotspotElement.addEventListener('click', () => {
                    this.loadScene(hotspot.target);
                });
                
                this.scenes[sceneId].hotspots.push(hotspotObj);
            }
        });
    }
    
    createHotspotElement(hotspot) {
        const element = document.createElement('div');
        element.className = 'hotspot navigation-hotspot';
        element.innerHTML = `
            <div class="hotspot-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12,8 16,12 12,16"/>
                    <line x1="8" y1="12" x2="16" y2="12"/>
                </svg>
            </div>
        `;
        
        // Add styles
        Object.assign(element.style, {
            width: '48px',
            height: '48px',
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(12px)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.35)'
        });
        
        // Hover effects
        element.addEventListener('mouseenter', () => {
            element.style.background = 'rgba(0, 0, 0, 0.85)';
            element.style.transform = 'scale(1.1)';
            element.style.borderColor = 'rgba(255, 255, 255, 0.5)';
        });
        
        element.addEventListener('mouseleave', () => {
            element.style.background = 'rgba(0, 0, 0, 0.65)';
            element.style.transform = 'scale(1)';
            element.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        });
        
        return element;
    }
    
    renderLogo() {
        const logoContainer = document.getElementById('logo-container');
        if (!this.projectData.config || !this.projectData.config.logo) return;
        
        const logo = this.projectData.config.logo;
        const logoElement = document.createElement('div');
        logoElement.className = 'panorama-logo';
        
        if (logo.image) {
            logoElement.innerHTML = `<img src="${logo.image}" alt="Logo" />`;
        } else if (logo.text) {
            logoElement.innerHTML = `<span>${logo.text}</span>`;
        }
        
        // Apply logo styles
        Object.assign(logoElement.style, {
            position: 'absolute',
            top: '20px',
            left: '20px',
            zIndex: '1000',
            maxWidth: '200px',
            maxHeight: '60px'
        });
        
        if (logoElement.querySelector('img')) {
            Object.assign(logoElement.querySelector('img').style, {
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain'
            });
        }
        
        logoContainer.appendChild(logoElement);
    }
    
    renderMiniMap() {
        const miniMapContainer = document.getElementById('minimap-container');
        const miniMapElement = document.createElement('div');
        miniMapElement.className = 'minimap';
        miniMapElement.id = 'minimap';
        
        // MiniMap HTML structure
        miniMapElement.innerHTML = `
            <div class="minimap-header">
                <span class="minimap-title">Floor Plan</span>
                <button class="minimap-toggle" onclick="viewer.toggleMiniMap()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="18,15 12,9 6,15"></polyline>
                    </svg>
                </button>
            </div>
            <div class="minimap-content" id="minimap-content">
                <div class="minimap-scenes" id="minimap-scenes"></div>
            </div>
        `;
        
        // Apply minimap styles
        this.applyMiniMapStyles(miniMapElement);
        
        miniMapContainer.appendChild(miniMapElement);
        
        // Render scenes in minimap
        this.renderMiniMapScenes();
        
        // Make minimap draggable
        this.makeMiniMapDraggable(miniMapElement);
    }
    
    applyMiniMapStyles(element) {
        Object.assign(element.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '280px',
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '14px',
            color: 'white',
            zIndex: '1000',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.35)',
            transition: 'all 0.3s ease'
        });
    }
    
    renderMiniMapScenes() {
        const scenesContainer = document.getElementById('minimap-scenes');
        if (!scenesContainer || !this.projectData.config) return;
        
        scenesContainer.innerHTML = '';
        
        this.projectData.config.scenes.forEach(scene => {
            const sceneElement = document.createElement('div');
            sceneElement.className = 'minimap-scene';
            sceneElement.innerHTML = `
                <div class="scene-dot ${scene.id === this.currentScene ? 'active' : ''}"></div>
                <span class="scene-name">${scene.name || scene.id}</span>
            `;
            
            sceneElement.addEventListener('click', () => {
                this.loadScene(scene.id);
            });
            
            // Apply scene styles
            Object.assign(sceneElement.style, {
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                cursor: 'pointer',
                borderRadius: '8px',
                transition: 'background 0.2s ease'
            });
            
            sceneElement.addEventListener('mouseenter', () => {
                sceneElement.style.background = 'rgba(255, 255, 255, 0.1)';
            });
            
            sceneElement.addEventListener('mouseleave', () => {
                sceneElement.style.background = 'transparent';
            });
            
            scenesContainer.appendChild(sceneElement);
        });
    }
    
    makeMiniMapDraggable(element) {
        let isDragging = false;
        let dragOffset = { x: 0, y: 0 };
        
        const header = element.querySelector('.minimap-header');
        
        header.addEventListener('mousedown', (e) => {
            isDragging = true;
            const rect = element.getBoundingClientRect();
            dragOffset.x = e.clientX - rect.left;
            dragOffset.y = e.clientY - rect.top;
            
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        });
        
        const handleMouseMove = (e) => {
            if (!isDragging) return;
            
            const newX = e.clientX - dragOffset.x;
            const newY = e.clientY - dragOffset.y;
            
            const maxX = window.innerWidth - element.offsetWidth;
            const maxY = window.innerHeight - element.offsetHeight;
            
            element.style.left = Math.max(0, Math.min(newX, maxX)) + 'px';
            element.style.top = Math.max(0, Math.min(newY, maxY)) + 'px';
            element.style.right = 'auto';
            element.style.bottom = 'auto';
        };
        
        const handleMouseUp = () => {
            isDragging = false;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }
    
    renderControls() {
        const controlsContainer = document.getElementById('controls-container');
        
        if (this.projectData.config && this.projectData.config.scenes.length > 1) {
            this.createLightweightControls();
        }
    }
    
    /**
     * Create lightweight control panel
     */
    createLightweightControls() {
        const controlsContainer = document.getElementById('controls-container');
        if (!controlsContainer || !this.projectData.config.scenes) return;

        // Create control panel container
        const controlPanel = document.createElement('div');
        controlPanel.className = 'lightweight-control-panel';
        
        // Create floor selector button
        const floorButton = document.createElement('div');
        floorButton.className = 'control-button';
        floorButton.innerHTML = `
            <button class="control-btn" id="floors-btn" title="Floor Selector">
                <svg class="control-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9,22 9,12 15,12 15,22"></polyline>
                </svg>
            </button>
            <div class="control-panel-content" id="floors-panel" style="display: none;">
                <div class="panel-header">
                    <h3>Floor Selector</h3>
                    <button class="close-btn" onclick="this.closest('.control-panel-content').style.display='none'">&times;</button>
                </div>
                <div class="floor-list">
                    ${this.projectData.config.scenes.map(scene => `
                        <button 
                            class="floor-button ${scene.id === this.currentScene ? 'active' : ''}" 
                            data-scene-id="${scene.id}"
                            title="${scene.name || `Scene ${scene.id}`}"
                        >
                            <span class="floor-name">${scene.name || `Floor ${scene.id}`}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        // Add click handlers
        const floorsBtn = floorButton.querySelector('#floors-btn');
        const floorsPanel = floorButton.querySelector('#floors-panel');
        
        floorsBtn.addEventListener('click', () => {
            const isVisible = floorsPanel.style.display !== 'none';
            floorsPanel.style.display = isVisible ? 'none' : 'block';
        });

        floorButton.addEventListener('click', (e) => {
            const button = e.target.closest('.floor-button');
            if (button && button.dataset.sceneId) {
                this.loadScene(button.dataset.sceneId);
                
                // Update active state
                floorButton.querySelectorAll('.floor-button').forEach(btn => 
                    btn.classList.remove('active')
                );
                button.classList.add('active');
                
                // Close panel after selection
                floorsPanel.style.display = 'none';
            }
        });

        // Apply control styles
        Object.assign(controlPanel.style, {
            position: 'fixed',
            top: '20px',
            right: '80px',
            zIndex: '1000'
        });

        controlPanel.appendChild(floorButton);
        controlsContainer.appendChild(controlPanel);
    }
    
    updateFloorList() {
        const floorButtons = document.querySelectorAll('.floor-button');
        
        floorButtons.forEach(button => {
            const sceneId = button.dataset.sceneId;
            if (sceneId === this.currentScene) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }
    
    toggleMiniMap() {
        const minimap = document.getElementById('minimap');
        const content = document.getElementById('minimap-content');
        
        this.miniMapState.isMinimized = !this.miniMapState.isMinimized;
        
        if (this.miniMapState.isMinimized) {
            content.style.display = 'none';
            minimap.style.width = '60px';
            minimap.style.height = '60px';
        } else {
            content.style.display = 'block';
            minimap.style.width = '280px';
            minimap.style.height = 'auto';
        }
    }
    
    toggleFloorSelector() {
        const panel = document.getElementById('floors-panel');
        if (panel) {
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        }
    }
    
    hideFloorSelector() {
        const panel = document.getElementById('floors-panel');
        if (panel) {
            panel.style.display = 'none';
        }
    }
    
    updateMiniMap() {
        // Update active scene in minimap
        const sceneDots = document.querySelectorAll('.minimap-scene .scene-dot');
        const sceneElements = document.querySelectorAll('.minimap-scene');
        
        sceneElements.forEach((element, index) => {
            const scene = this.projectData.config.scenes[index];
            const dot = element.querySelector('.scene-dot');
            
            if (scene.id === this.currentScene) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
        
        // Update floor selector
        this.updateFloorList();
    }
    
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
    }
    
    showError(message) {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.innerHTML = `
                <div style="text-align: center;">
                    <div style="color: #ef4444; font-size: 24px; margin-bottom: 10px;">⚠</div>
                    <div>${message}</div>
                    <button onclick="location.reload()" style="
                        margin-top: 15px;
                        padding: 8px 16px;
                        background: rgba(255, 255, 255, 0.1);
                        border: 1px solid rgba(255, 255, 255, 0.3);
                        border-radius: 6px;
                        color: white;
                        cursor: pointer;
                    ">Retry</button>
                </div>
            `;
        }
    }
}

// Initialize viewer when DOM is loaded
let viewer;
document.addEventListener('DOMContentLoaded', () => {
    viewer = new StandalonePanoramaViewer();
});

// Make viewer globally accessible for button callbacks
window.viewer = viewer;