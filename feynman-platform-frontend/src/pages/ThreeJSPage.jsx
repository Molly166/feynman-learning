import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import apiClient from '../api/axios';

function ThreeJSPage() {
    const mountRef = useRef(null);
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchGraphData = async () => {
            try {
                const response = await apiClient.get('/graph/knowledge-map');
                setGraphData(response.data);
            } catch (err) {
                console.error('加载知识图谱数据失败:', err);
                setError(err.response?.data?.msg || '无法加载图谱数据，请稍后再试。');
            } finally {
                setLoading(false);
            }
        };
        fetchGraphData();
    }, []);

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount || !graphData.nodes.length) return;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x070b16);

        const camera = new THREE.PerspectiveCamera(
            60,
            mount.clientWidth / mount.clientHeight,
            0.1,
            1000
        );
        camera.position.set(0, 0, 12);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(mount.clientWidth, mount.clientHeight);
        mount.appendChild(renderer.domElement);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        const pointLight = new THREE.PointLight(0xffffff, 1);
        pointLight.position.set(10, 10, 10);
        scene.add(ambientLight);
        scene.add(pointLight);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;

        const sphereGeometry = new THREE.SphereGeometry(0.3, 32, 32);
        const nodeObjects = new Map();
        const colorPalette = [0x8e44ad, 0xe67e22, 0x1abc9c, 0x3498db, 0xf1c40f];

        graphData.nodes.forEach((node, index) => {
            const color = node.reviewList ? 0xf39c12 : colorPalette[index % colorPalette.length];
            const material = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.2 });
            const mesh = new THREE.Mesh(sphereGeometry, material);
            mesh.position.set(
                (Math.random() - 0.5) * 12,
                (Math.random() - 0.5) * 12,
                (Math.random() - 0.5) * 12
            );
            mesh.userData = { id: node.id, name: node.name };
            scene.add(mesh);
            nodeObjects.set(node.id, mesh);
        });

        const lineMaterial = new THREE.LineBasicMaterial({ color: 0xaaaaaa, transparent: true, opacity: 0.4 });
        graphData.links.forEach((link) => {
            const sourceNode = nodeObjects.get(link.source);
            const targetNode = nodeObjects.get(link.target);
            if (!sourceNode || !targetNode) return;

            const points = [sourceNode.position, targetNode.position];
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, lineMaterial);
            scene.add(line);
        });

        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            camera.aspect = mount.clientWidth / mount.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(mount.clientWidth, mount.clientHeight);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            controls.dispose();
            renderer.dispose();
            mount.removeChild(renderer.domElement);
        };
    }, [graphData]);

    if (loading) {
        return <p>正在加载3D知识宇宙...</p>;
    }

    if (error) {
        return <p className="text-red-500">{error}</p>;
    }

    if (!graphData.nodes.length) {
        return (
            <div>
                <h1 className="text-2xl font-semibold mb-4">3D 知识宇宙</h1>
                <p>当前没有可视化的数据，请先创建一些知识点吧。</p>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-2xl font-semibold mb-2">3D 知识宇宙</h1>
            <p className="text-gray-600 mb-4">拖动、缩放来探索知识星球及其连接。</p>
            <div ref={mountRef} style={{ width: '100%', height: '70vh', borderRadius: '12px', overflow: 'hidden' }} />
        </div>
    );
}

export default ThreeJSPage;

