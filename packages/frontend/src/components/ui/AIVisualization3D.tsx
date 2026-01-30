import { useRef, useEffect } from 'react';
import * as THREE from 'three';

export default function AIVisualization3D() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // --- SETUP ---
        const scene = new THREE.Scene();
        // Use a very subtle fog to fade distant connections
        scene.fog = new THREE.FogExp2(0xffffff, 0.05);

        const camera = new THREE.PerspectiveCamera(50, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 100);
        camera.position.z = 8;
        camera.position.y = 2;

        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            powerPreference: "high-performance" // Important for smooth lines
        });
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Clear previous
        while (containerRef.current.firstChild) {
            containerRef.current.removeChild(containerRef.current.firstChild);
        }
        containerRef.current.appendChild(renderer.domElement);

        const group = new THREE.Group();
        scene.add(group);


        // --- NEURAL NETWORK SETTINGS ---
        const particleCount = 100; // Optimal for performance/visual balance
        const connectionDistance = 2.5;
        const particlesData: { velocity: THREE.Vector3, mesh: THREE.Mesh }[] = [];

        // 1. PARTICLES (The Nodes)
        // We use simple spheres for nodes
        const particleGeo = new THREE.SphereGeometry(0.05, 8, 8);
        const particleMat = new THREE.MeshBasicMaterial({ color: 0x1e293b }); // Slate 800 (Dark Gray/Black)

        const particleGroup = new THREE.Group();
        group.add(particleGroup);

        // Create particles
        for (let i = 0; i < particleCount; i++) {
            const particle = new THREE.Mesh(particleGeo, particleMat);

            // Random Position in a cloud
            const x = Math.random() * 8 - 4;
            const y = Math.random() * 8 - 4;
            const z = Math.random() * 8 - 4;

            particle.position.set(x, y, z);

            // Random Velocity
            const vx = (Math.random() - 0.5) * 0.02;
            const vy = (Math.random() - 0.5) * 0.02;
            const vz = (Math.random() - 0.5) * 0.02;

            particleGroup.add(particle);
            particlesData.push({
                velocity: new THREE.Vector3(vx, vy, vz),
                mesh: particle
            });
        }

        // 2. CONNECTIONS (The Synapses)
        // We use LineSegments for high performance rendering of many lines
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x94a3b8, // Slate 400
            transparent: true,
            opacity: 0.3,
            blending: THREE.NormalBlending // Normal blending for sharper lines
        });

        const linesGeometry = new THREE.BufferGeometry();
        const linePos = new Float32Array(particleCount * particleCount * 3); // Max possible lines
        linesGeometry.setAttribute('position', new THREE.BufferAttribute(linePos, 3));

        const linesMesh = new THREE.LineSegments(linesGeometry, lineMaterial);
        group.add(linesMesh);


        // MOUSE INTERACTION
        let mouseX = 0;
        let mouseY = 0;
        const onMouseMove = (event: MouseEvent) => {
            mouseX = (event.clientX / window.innerWidth) * 2 - 1;
            mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
        };
        window.addEventListener('mousemove', onMouseMove);


        // --- ANIMATION LOOP ---
        let animationId: number;
        const animate = () => {
            animationId = requestAnimationFrame(animate);

            // Update Particles
            let vertexIndex = 0;
            const positions = (linesMesh.geometry.attributes.position as THREE.BufferAttribute).array as Float32Array;
            let numConnected = 0;

            for (let i = 0; i < particleCount; i++) {
                const data = particlesData[i];

                // Move
                data.mesh.position.add(data.velocity);

                // Bounce off boundaries (keep them in a box)
                if (Math.abs(data.mesh.position.x) > 4) data.velocity.x = -data.velocity.x;
                if (Math.abs(data.mesh.position.y) > 4) data.velocity.y = -data.velocity.y;
                if (Math.abs(data.mesh.position.z) > 4) data.velocity.z = -data.velocity.z;

                // Check Connections
                for (let j = i + 1; j < particleCount; j++) {
                    const dataB = particlesData[j];
                    const dist = data.mesh.position.distanceTo(dataB.mesh.position);

                    if (dist < connectionDistance) {
                        // Start Point
                        positions[vertexIndex++] = data.mesh.position.x;
                        positions[vertexIndex++] = data.mesh.position.y;
                        positions[vertexIndex++] = data.mesh.position.z;

                        // End Point
                        positions[vertexIndex++] = dataB.mesh.position.x;
                        positions[vertexIndex++] = dataB.mesh.position.y;
                        positions[vertexIndex++] = dataB.mesh.position.z;

                        numConnected++;
                    }
                }
            }

            // Update Lines Draw Range to only render active lines
            linesMesh.geometry.setDrawRange(0, numConnected * 2);
            linesMesh.geometry.attributes.position.needsUpdate = true;

            // Gentle global rotation
            group.rotation.y += 0.001;

            // Mouse Parallax
            const targetRotX = mouseY * 0.2;
            const targetRotY = mouseX * 0.2;
            group.rotation.x += 0.05 * (targetRotX - group.rotation.x);
            group.rotation.y += 0.05 * (targetRotY - group.rotation.y);

            renderer.render(scene, camera);
        };

        animate();

        const handleResize = () => {
            if (!containerRef.current) return;
            const width = containerRef.current.clientWidth;
            const height = containerRef.current.clientHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationId);
            if (containerRef.current && renderer.domElement) {
                containerRef.current.removeChild(renderer.domElement);
            }
            renderer.dispose(); // Clean up WebGL context
            particleGeo.dispose();
            particleMat.dispose();
            linesGeometry.dispose();
            lineMaterial.dispose();
        };
    }, []);

    return <div ref={containerRef} className="w-full h-full min-h-[400px]" />;
}