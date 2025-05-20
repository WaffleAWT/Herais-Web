// Realistic Earth Globe
class Globe {
    constructor(container) {
        this.container = container;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, container.offsetWidth / container.offsetHeight, 1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.clock = new THREE.Clock();
        this.textureLoader = new THREE.TextureLoader();
        this.init();
    }

    init() {
        // Setup renderer
        this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);

        // Setup camera
        this.camera.position.z = 300;

        // Create Earth
        const radius = 100;
        const segments = 64;
        const earthGeometry = new THREE.SphereGeometry(radius, segments, segments);

        // Load Earth textures
        const earthMaterial = new THREE.MeshPhongMaterial({
            map: this.textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg'),
            bumpMap: this.textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_normal_2048.jpg'),
            bumpScale: 0.5,
            specularMap: this.textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_specular_2048.jpg'),
            specular: new THREE.Color('grey'),
            shininess: 10
        });

        // Create Earth mesh
        this.earth = new THREE.Mesh(earthGeometry, earthMaterial);
        this.scene.add(this.earth);

        // Add clouds
        const cloudGeometry = new THREE.SphereGeometry(radius + 0.5, segments, segments);
        const cloudMaterial = new THREE.MeshPhongMaterial({
            map: this.textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_clouds_1024.png'),
            transparent: true,
            opacity: 0.8
        });

        this.clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
        this.scene.add(this.clouds);

        // Add atmosphere glow
        const atmosphereGeometry = new THREE.SphereGeometry(radius + 1, segments, segments);
        const atmosphereMaterial = new THREE.ShaderMaterial({
            uniforms: {
                color1: { value: new THREE.Color('#6e44ff') },
                color2: { value: new THREE.Color('#ff44aa') },
                time: { value: 0 }
            },
            vertexShader: `
                varying vec3 vNormal;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 color1;
                uniform vec3 color2;
                uniform float time;
                varying vec3 vNormal;
                
                void main() {
                    float intensity = pow(0.65 - dot(vNormal, vec3(0, 0, 1.0)), 4.0);
                    vec3 atmosphere = mix(color1, color2, sin(time * 0.5) * 0.5 + 0.5);
                    gl_FragColor = vec4(atmosphere, 1.0) * intensity;
                }
            `,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            transparent: true
        });

        const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        this.scene.add(atmosphere);

        // Add lights
        const ambientLight = new THREE.AmbientLight(0x333333);
        this.scene.add(ambientLight);

        const sunLight = new THREE.DirectionalLight(0xffffff, 1);
        sunLight.position.set(5, 3, 5);
        this.scene.add(sunLight);

        // Add stars
        const starGeometry = new THREE.BufferGeometry();
        const starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.7,
            transparent: true
        });

        const starVertices = [];
        for (let i = 0; i < 3000; i++) {
            const x = (Math.random() - 0.5) * 2000;
            const y = (Math.random() - 0.5) * 2000;
            const z = (Math.random() - 0.5) * 2000;
            starVertices.push(x, y, z);
        }

        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
        const stars = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(stars);

        // Animation
        this.animate();

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());

        // Make globe interactive
        this.addInteraction();
    }

    addInteraction() {
        let isDragging = false;
        let previousMousePosition = {
            x: 0,
            y: 0
        };

        const toRadians = (angle) => {
            return angle * (Math.PI / 180);
        };

        const container = this.container;

        container.addEventListener('mousedown', (e) => {
            isDragging = true;
            previousMousePosition = {
                x: e.clientX,
                y: e.clientY
            };
        });

        container.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            const deltaMove = {
                x: e.clientX - previousMousePosition.x,
                y: e.clientY - previousMousePosition.y
            };

            const rotationSpeed = 0.01;

            this.earth.rotation.y += toRadians(deltaMove.x * rotationSpeed);
            this.earth.rotation.x += toRadians(deltaMove.y * rotationSpeed);
            this.clouds.rotation.y += toRadians(deltaMove.x * rotationSpeed);
            this.clouds.rotation.x += toRadians(deltaMove.y * rotationSpeed);

            previousMousePosition = {
                x: e.clientX,
                y: e.clientY
            };
        });

        container.addEventListener('mouseup', () => {
            isDragging = false;
        });

        container.addEventListener('mouseleave', () => {
            isDragging = false;
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        const time = this.clock.getElapsedTime();

        // Rotate Earth and clouds if not being dragged
        if (!this.isDragging) {
            this.earth.rotation.y += 0.003;
            this.clouds.rotation.y += 0.0042;
        }

        // Update atmosphere
        const atmosphere = this.scene.children[2];
        atmosphere.material.uniforms.time.value = time;
        
        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        this.camera.aspect = this.container.offsetWidth / this.container.offsetHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
    }
} 