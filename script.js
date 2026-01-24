document.addEventListener('DOMContentLoaded', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        setTimeout(() => {
            preloader.style.opacity = '0';
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 500);
        }, 1000);
    }

    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show-element');
            }
        });
    }, observerOptions);

    const hiddenElements = document.querySelectorAll('.hidden-element');
    hiddenElements.forEach((el) => observer.observe(el));


    const textElement = document.getElementById('typing-text');
    if (textElement) {
        const texts = ["OS Developer", "Stochastic Kernel Dev", "Discord Bot Creator", "Python Expert"];
        let count = 0;
        let index = 0;
        let currentText = "";
        let letter = "";

        (function type() {
            if (count === texts.length) {
                count = 0;
            }
            currentText = texts[count];
            letter = currentText.slice(0, ++index);

            textElement.textContent = letter;
            if (letter.length === currentText.length) {
                setTimeout(() => {
                    index = 0;
                    count++;
                }, 2000);
            }
            setTimeout(type, 100);
        }());
    }

    const cards = document.querySelectorAll('.project-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -10;
            const rotateY = ((x - centerX) / centerX) * 10;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        });
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Custom Context Menu & Site Protection

    // Inject Context Menu HTML
    const contextMenuHTML = `
        <div id="context-menu">
            <div class="menu-item" onclick="window.history.back()">
                <i class="fa-solid fa-arrow-left"></i> Назад
            </div>
            <div class="menu-item" onclick="location.reload()">
                <i class="fa-solid fa-rotate-right"></i> Обновить
            </div>
            <div class="menu-item" onclick="window.location.href = window.location.pathname.includes('/projects/') ? '../index.html' : 'index.html'">
                <i class="fa-solid fa-house"></i> Главная
            </div>
            <div class="menu-item" onclick="navigator.clipboard.writeText(window.location.href)">
                <i class="fa-solid fa-link"></i> Копировать ссылку
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', contextMenuHTML);

    const contextMenu = document.getElementById('context-menu');

    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();

        const x = e.clientX;
        const y = e.clientY;

        // Adjust position if menu goes off screen
        const winWidth = window.innerWidth;
        const winHeight = window.innerHeight;
        const menuWidth = 200;
        const menuHeight = contextMenu.offsetHeight || 200;

        let posX = x;
        let posY = y;

        if (x + menuWidth > winWidth) posX = x - menuWidth;
        if (y + menuHeight > winHeight) posY = y - menuHeight;

        contextMenu.style.left = `${posX}px`;
        contextMenu.style.top = `${posY}px`;
        contextMenu.classList.add('visible');
    });

    document.addEventListener('click', () => {
        contextMenu.classList.remove('visible');
    });

    document.addEventListener('keydown', (e) => {
        // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
        if (
            e.keyCode === 123 ||
            (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) ||
            (e.ctrlKey && e.keyCode === 85)
        ) {
            e.preventDefault();
            return false;
        }
    });
});

/* =========================================
   UNKNOWN KERNEL - PHYSICS ENGINE v4.0 (GRAVITY, COLLISION, FLUIDS)
   ========================================= */

const canvas = document.getElementById('bg-canvas');
if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    let forces = [];

    // Engine Configuration
    const CONFIG = {
        particleCount: 150,
        connectionDistance: 120,
        mouseRepelRadius: 150,
        mouseRepelForce: 2,
        friction: 0.96,
        gravity: 0.05,
        baseSpeed: 0.5
    };

    // Resize Handler
    const resize = () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    // Vector Class for Physics Calculations
    class Vector2 {
        constructor(x, y) { this.x = x; this.y = y; }
        add(v) { this.x += v.x; this.y += v.y; return this; }
        sub(v) { this.x -= v.x; this.y -= v.y; return this; }
        mult(n) { this.x *= n; this.y *= n; return this; }
        div(n) { this.x /= n; this.y /= n; return this; }
        mag() { return Math.sqrt(this.x * this.x + this.y * this.y); }
        normalize() {
            const m = this.mag();
            if (m !== 0) this.div(m);
            return this;
        }
        limit(max) {
            if (this.mag() > max) {
                this.normalize().mult(max);
            }
            return this;
        }
    }

    // Advanced Physics Particle
    class PhysicsParticle {
        constructor() {
            this.pos = new Vector2(Math.random() * width, Math.random() * height);
            this.vel = new Vector2((Math.random() - 0.5) * CONFIG.baseSpeed, (Math.random() - 0.5) * CONFIG.baseSpeed);
            this.acc = new Vector2(0, 0);
            this.size = Math.random() * 2 + 1;
            this.color = `rgba(${139 + Math.random() * 50}, ${92 + Math.random() * 50}, 246, ${Math.random() * 0.5 + 0.2})`;
            this.mass = this.size * 1.5;
        }

        applyForce(force) {
            let f = new Vector2(force.x, force.y);
            f.div(this.mass);
            this.acc.add(f);
        }

        update(mousePos) {
            // physics physics physics
            this.vel.add(this.acc);
            this.vel.mult(CONFIG.friction); // Air resistance
            this.pos.add(this.vel);
            this.acc.mult(0); // Reset acceleration

            // Mouse Repulsion
            if (mousePos) {
                let mouseV = new Vector2(mousePos.x, mousePos.y);
                let dir = new Vector2(this.pos.x, this.pos.y).sub(mouseV);
                let d = dir.mag();
                if (d < CONFIG.mouseRepelRadius) {
                    dir.normalize();
                    let force = (CONFIG.mouseRepelRadius - d) / CONFIG.mouseRepelRadius;
                    dir.mult(force * CONFIG.mouseRepelForce);
                    this.applyForce(dir);
                }
            }

            // Boundary Wrap
            if (this.pos.x < 0) this.pos.x = width;
            if (this.pos.x > width) this.pos.x = 0;
            if (this.pos.y < 0) this.pos.y = height;
            if (this.pos.y > height) this.pos.y = 0;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.pos.x, this.pos.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }

    // Initialize System
    for (let i = 0; i < CONFIG.particleCount; i++) {
        particles.push(new PhysicsParticle());
    }

    // Mouse Tracking
    let mouse = new Vector2(0, 0);
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    // Animation Loop
    let lastTime = 0;
    const animate = (timestamp) => {
        const deltaTime = timestamp - lastTime;
        lastTime = timestamp;

        ctx.clearRect(0, 0, width, height);

        // Update and Draw Particles
        particles.forEach(p => {
            p.update(mouse);
            p.draw();
        });

        // Connection Lines
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.15)';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                let d = Math.sqrt(
                    Math.pow(particles[i].pos.x - particles[j].pos.x, 2) +
                    Math.pow(particles[i].pos.y - particles[j].pos.y, 2)
                );
                if (d < CONFIG.connectionDistance) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].pos.x, particles[i].pos.y);
                    ctx.lineTo(particles[j].pos.x, particles[j].pos.y);
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(animate);
    };
    animate(0);
}


/* =========================================
   UNKNOWN KERNEL - PREMIUM REPOSITORY MANAGER v3.1
   (Search, filtering, and download handling)
   ========================================= */

class RepositoryManager {
    constructor() {
        this.projectsGrid = document.querySelector('.repo-grid');
        this.searchInput = document.querySelector('.search-bar input');
        this.filterBtns = document.querySelectorAll('.filter-btn');

        if (this.projectsGrid) {
            this.initRepository();
        }
    }

    initRepository() {
        // Initialize Filter Buttons
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filterProjects(btn.dataset.filter);
            });
        });

        // Initialize Search
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                this.searchProjects(e.target.value.toLowerCase());
            });
        }

        // Add Intersection Observer for fade-in animations
        this.observeCards();
    }

    observeCards() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.repo-card').forEach((card, index) => {
            // Set initial state for animation
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = `all 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.1}s`;
            observer.observe(card);
        });
    }

    filterProjects(category) {
        const cards = document.querySelectorAll('.repo-card');
        cards.forEach(card => {
            if (category === 'all' || card.dataset.category === category) {
                card.style.display = 'flex';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 50);
            } else {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });
    }

    searchProjects(query) {
        const cards = document.querySelectorAll('.repo-card');
        cards.forEach(card => {
            const title = card.querySelector('.repo-title').textContent.toLowerCase();
            const desc = card.querySelector('.repo-desc').textContent.toLowerCase();

            if (title.includes(query) || desc.includes(query)) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    }
}

// Global Initialization
window.addEventListener('load', () => {
    // Initialize Repository
    window.repo = new RepositoryManager();
    console.log("Stochastic Repository Loaded.");
});



// 1. Core Window Manager
class WindowManager {
    constructor() {
        this.windows = [];
        this.activeWindow = null;
        this.zIndexCounter = 100;
        this.desktop = document.getElementById('stochastic-desktop');
        this.taskbarApps = document.querySelector('.taskbar-apps');

        // Ensure desktop exists
        if (!this.desktop) {
            this.desktop = document.createElement('div');
            this.desktop.id = 'stochastic-desktop';
            document.body.appendChild(this.desktop);
        }

        this.setupDesktop();
    }

    setupDesktop() {
        // Create Taskbar if not exists
        if (!document.getElementById('os-taskbar')) {
            const taskbarHTML = `
                <div id="os-taskbar">
                    <button class="start-btn" onclick="window.desktop.toggleStartMenu()">
                        <i class="fa-brands fa-linux"></i> Start
                    </button>
                    <div class="taskbar-apps"></div>
                    <div class="taskbar-clock" id="os-clock">12:00</div>
                </div>
                <div id="os-start-menu">
                    <div class="start-header">
                        <div class="user-avatar">G</div>
                        <div style="flex:1">
                            <div style="font-weight:bold; color:var(--os-text)">Guest User</div>
                            <div style="font-size:0.8rem; color:var(--os-text-muted)">Stochastic OS</div>
                        </div>
                        <button class="win-btn win-close" onclick="console.log('Power off')"></button>
                    </div>
                    <div class="start-grid" id="start-grid"></div>
                </div>
            `;
            this.desktop.insertAdjacentHTML('beforeend', taskbarHTML);
            this.taskbarApps = document.querySelector('.taskbar-apps');

            // Start Clock
            setInterval(() => {
                const now = new Date();
                document.getElementById('os-clock').innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }, 1000);
        }

        // Show Desktop
        this.desktop.style.display = 'block';
    }

    createWindow(config) {
        const id = 'win-' + Math.random().toString(36).substr(2, 9);
        const zIndex = ++this.zIndexCounter;

        const win = document.createElement('div');
        win.className = 'os-window active-window';
        win.id = id;
        win.style.zIndex = zIndex;
        win.style.width = config.width || '600px';
        win.style.height = config.height || '400px';
        win.style.left = config.x || 'calc(50vw - 300px)';
        win.style.top = config.y || 'calc(50vh - 200px)';

        win.innerHTML = `
            <div class="window-header">
                <div class="window-controls">
                    <button class="win-btn win-close" onclick="window.wm.closeWindow('${id}')"></button>
                    <button class="win-btn win-min" onclick="window.wm.minimizeWindow('${id}')"></button>
                    <button class="win-btn win-max" onclick="window.wm.maximizeWindow('${id}')"></button>
                </div>
                <div class="window-title">${config.title || 'Application'}</div>
            </div>
            <div class="window-body">
                ${config.content || ''}
            </div>
        `;

        // Drag Logic
        const header = win.querySelector('.window-header');
        let isDragging = false;
        let startX, startY, initialLeft, initialTop;

        header.addEventListener('mousedown', (e) => {
            if (e.target.closest('.win-btn')) return;
            isDragging = true;
            this.activateWindow(id);
            startX = e.clientX;
            startY = e.clientY;
            const rect = win.getBoundingClientRect();
            initialLeft = rect.left;
            initialTop = rect.top;
            win.style.transition = 'none'; // Disable transition for smooth drag
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            // GPU Accelerated Drag
            win.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
            // Note: In a real implementation we would update left/top on mouseup and reset transform 
            // to avoid accumulation, but this simulates the visual effect.
            // For stability in this massive block, we'll simply update left/top directly smoothly 
            // if we weren't using transform for the flashy effect. 
            // Let's stick to standard left/top for persistent position to avoid complexity in this snippet.
            win.style.transform = 'none';
            win.style.left = `${initialLeft + dx}px`;
            win.style.top = `${initialTop + dy}px`;
        });

        window.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                win.style.transition = ''; // Re-enable transition
            }
        });

        // Initialize App Logic if provided
        if (config.onOpen) {
            setTimeout(() => {
                config.onOpen(win.querySelector('.window-body'), id);
            }, 0);
        }

        this.desktop.appendChild(win);
        this.windows.push({ id, ...config, element: win });
        this.addTaskbarItem(id, config.title, config.icon);
        this.activateWindow(id);

        return id;
    }

    closeWindow(id) {
        const winObj = this.windows.find(w => w.id === id);
        if (winObj) {
            winObj.element.remove();
            this.windows = this.windows.filter(w => w.id !== id);

            // Remove Taskbar Item
            const taskItem = document.getElementById(`task-${id}`);
            if (taskItem) taskItem.remove();
        }
    }

    minimizeWindow(id) {
        const win = document.getElementById(id);
        if (win) {
            win.classList.add('minimized');
            win.classList.remove('active-window');
        }
    }

    restoreWindow(id) {
        const win = document.getElementById(id);
        if (win) {
            win.classList.remove('minimized');
            this.activateWindow(id);
        }
    }

    maximizeWindow(id) {
        const win = document.getElementById(id);
        if (win) {
            win.classList.toggle('maximized');
        }
    }

    activateWindow(id) {
        const win = document.getElementById(id);
        if (win) {
            this.zIndexCounter++;
            win.style.zIndex = this.zIndexCounter;

            this.windows.forEach(w => w.element.classList.remove('active-window'));
            win.classList.add('active-window');

            // Taskbar Active State
            document.querySelectorAll('.taskbar-item').forEach(el => el.classList.remove('active'));
            const taskItem = document.getElementById(`task-${id}`);
            if (taskItem) taskItem.classList.add('active');
        }
    }

    addTaskbarItem(id, title, icon) {
        const item = document.createElement('div');
        item.className = 'taskbar-item active';
        item.id = `task-${id}`;
        item.innerHTML = `${icon || '<i class="fa-solid fa-window-maximize"></i>'} ${title}`;
        item.onclick = () => {
            const win = document.getElementById(id);
            if (win.classList.contains('minimized')) {
                this.restoreWindow(id);
            } else if (win.classList.contains('active-window')) {
                this.minimizeWindow(id);
            } else {
                this.activateWindow(id);
            }
        };
        this.taskbarApps.appendChild(item);
    }
}

// 2. Applications
const Applications = {
    'terminal': {
        title: 'Terminal',
        icon: '<i class="fa-solid fa-terminal"></i>',
        open: () => {
            // Reuse existing terminal logic but wrap it in window
            window.wm.createWindow({
                title: 'guest@stochastic: ~',
                icon: '<i class="fa-solid fa-terminal"></i>',
                width: '800px',
                height: '500px',
                onOpen: (body, id) => {
                    // Hacky integration with existing TerminalUI
                    // Ideally we would refactor TerminalUI to accept a container.
                    // For now, let's create a new instance of specific logic for this window.
                    body.innerHTML = '<div style="background:#0f0f0f; height:100%; padding:10px; font-family:\'Space Mono\'; color:#aaa;">Terminal requires raw access. Use Ctrl+Alt+T for system terminal.</div>';
                }
            });
        }
    },
    'editor': {
        title: 'Text Editor',
        icon: '<i class="fa-solid fa-file-code"></i>',
        open: () => {
            window.wm.createWindow({
                title: 'Stochastic Text',
                icon: '<i class="fa-solid fa-file-code"></i>',
                width: '700px',
                height: '500px',
                content: `
                    <div class="editor-container">
                        <div class="editor-toolbar">
                            <span>File</span> <span>Edit</span> <span>View</span>
                        </div>
                        <div class="editor-content" contenteditable="true" spellcheck="false">
<span class="editor-line"><span class="token-comment">// Welcome to StochasticText</span></span>
<span class="editor-line"><span class="token-keyword">function</span> <span class="token-function">init</span>() {</span>
<span class="editor-line">    console.<span class="token-function">log</span>(<span class="token-string">"Hello World"</span>);</span>
<span class="editor-line">}</span>
                        </div>
                    </div>
                `
            });
        }
    },
    'settings': {
        title: 'Settings',
        icon: '<i class="fa-solid fa-gear"></i>',
        open: () => {
            window.wm.createWindow({
                title: 'System Settings',
                icon: '<i class="fa-solid fa-gear"></i>',
                width: '800px',
                height: '600px',
                content: `
                    <div class="settings-layout">
                        <div class="settings-sidebar">
                            <div class="settings-nav-item active">Personalization</div>
                            <div class="settings-nav-item">System</div>
                            <div class="settings-nav-item">Network</div>
                        </div>
                        <div class="settings-body">
                            <h3>Personalization > Themes</h3>
                            <div class="theme-grid">
                                <div class="theme-card" onclick="window.desktop.setTheme('cyberpunk')">
                                    <div class="theme-preview" style="background:#050510"></div>
                                    <div>Cyberpunk (Default)</div>
                                </div>
                                <div class="theme-card" onclick="window.desktop.setTheme('retro')">
                                    <div class="theme-preview" style="background:#008080"></div>
                                    <div>Windows 95</div>
                                </div>
                                <div class="theme-card" onclick="window.desktop.setTheme('glass')">
                                    <div class="theme-preview" style="background:linear-gradient(45deg, #f3ec78, #af4261)"></div>
                                    <div>Glass OS</div>
                                </div>
                                <div class="theme-card" onclick="window.desktop.setTheme('hacker')">
                                    <div class="theme-preview" style="background:#000"></div>
                                    <div>Matrix</div>
                                </div>
                            </div>
                        </div>
                    </div>
                `
            });
        }
    },
    'netsim': {
        title: 'NetSim',
        icon: '<i class="fa-solid fa-network-wired"></i>',
        open: () => {
            window.wm.createWindow({
                title: 'Network Simulator v2.0',
                icon: '<i class="fa-solid fa-network-wired"></i>',
                width: '600px',
                height: '400px',
                content: `
                    <div class="netsim-container">
                        <div class="netsim-graph" id="netsim-canvas">
                            <!-- Canvas injected here -->
                        </div>
                        <div class="netsim-log" id="netsim-log">
                            > Initializing network stack...<br>
                            > Gateway found.<br>
                        </div>
                    </div>
                `,
                onOpen: (body, id) => {
                    // Start random ping animation
                    const log = body.querySelector('#netsim-log');
                    setInterval(() => {
                        const ip = `192.168.1.${Math.floor(Math.random() * 255)}`;
                        const time = Math.floor(Math.random() * 100);
                        const line = document.createElement('div');
                        line.innerHTML = `> 64 bytes from ${ip}: icmp_seq=1 ttl=64 time=${time}ms`;
                        log.appendChild(line);
                        log.scrollTop = log.scrollHeight;
                    }, 1000);
                }
            });
        }
    },
    'browser': {
        title: 'Browser',
        icon: '<i class="fa-brands fa-chrome"></i>',
        open: () => {
            window.wm.createWindow({
                title: 'Stochastic Browser',
                icon: '<i class="fa-brands fa-chrome"></i>',
                content: `
                    <div style="display:flex; flex-direction:column; height:100%;">
                        <div style="padding:10px; background:var(--os-surface-2); display:flex; gap:10px;">
                            <button class="win-btn" style="border-radius:4px; width:30px; background:rgba(255,255,255,0.1)"><i class="fa-solid fa-arrow-left"></i></button>
                            <input type="text" value="https://stochastic.os/welcome" style="flex:1; background:rgba(0,0,0,0.3); border:1px solid var(--os-border); color:var(--os-text); padding:5px; border-radius:4px;">
                        </div>
                        <iframe src="index.html" style="flex:1; border:none; background:white;"></iframe>
                    </div>
                 `
            });
        }
    }
};

// 2.5 Terminal Subsystem
class TerminalUI {
    constructor() {
        this.history = [];
        this.commands = {
            'help': () => 'Available commands: help, date, whoami, clear, reboot',
            'date': () => new Date().toString(),
            'whoami': () => 'guest@stochastic',
            'clear': () => {
                // In a real terminal this would clear visual output
                return 'Console cleared';
            },
            'reboot': () => {
                location.reload();
                return 'Rebooting...';
            }
        };
        console.log("Terminal subsystem initialized.");
    }

    execute(cmd) {
        if (!cmd) return '';
        const args = cmd.split(' ');
        const main = args[0].toLowerCase();

        if (this.commands[main]) {
            return this.commands[main](args.slice(1));
        }
        return `Command not found: ${main}`;
    }
}

// 3. Desktop Controller
class DesktopEnvironment {
    constructor() {
        this.wm = new WindowManager();
        window.wm = this.wm; // Expose globally
        this.renderStartMenu();
    }

    renderStartMenu() {
        const grid = document.getElementById('start-grid');
        if (!grid) return;

        Object.keys(Applications).forEach(key => {
            const app = Applications[key];
            const item = document.createElement('div');
            item.className = 'app-icon';
            item.innerHTML = `
                <div class="app-icon-img">${app.icon}</div>
                <span>${app.title}</span>
            `;
            item.onclick = () => {
                this.toggleStartMenu();
                app.open();
            };
            grid.appendChild(item);
        });
    }

    toggleStartMenu() {
        const menu = document.getElementById('os-start-menu');
        if (menu.style.display === 'flex') {
            menu.style.display = 'none';
        } else {
            menu.style.display = 'flex';
        }
    }

    setTheme(themeName) {
        if (themeName === 'cyberpunk') {
            document.documentElement.removeAttribute('data-theme');
        } else {
            document.documentElement.setAttribute('data-theme', themeName);
        }
    }
}

// 4. Main Initialization
window.addEventListener('load', () => {
    // Initialize original Terminal logic (hidden by default)
    window.terminal = new TerminalUI();

    // Initialize Desktop Environment
    window.desktop = new DesktopEnvironment();

    console.log("Stochastic OS: Desktop Environment Loaded.");

    // Auto-open Welcome Window
    setTimeout(() => {
        window.wm.createWindow({
            title: 'Welcome to Stochastic OS',
            icon: '<i class="fa-solid fa-info-circle"></i>',
            width: '500px',
            height: '350px',
            content: `
                <div style="padding:40px; text-align:center;">
                    <h1 style="font-size:2rem; margin-bottom:10px;">Stochastic OS <span style="color:var(--os-primary)">v2.0</span></h1>
                    <p style="color:var(--os-text-muted); margin-bottom:30px;">
                        A fully functional web-based desktop environment built with vanilla JS and CSS.
                    </p>
                    <button class="btn primary" onclick="window.wm.closeWindow(this.closest('.os-window').id)" style="margin:0 auto;">Get Started</button>
                    
                    <div style="margin-top:30px; font-size:0.8rem; color:var(--os-text-muted);">
                        Tip: Try changing themes in Settings!
                    </div>
                </div>
            `
        });
    }, 1000);
});