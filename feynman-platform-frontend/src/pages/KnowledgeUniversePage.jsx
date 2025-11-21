import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { forceSimulation, forceManyBody, forceCenter, forceLink } from 'd3-force-3d';
import apiClient from '../api/axios';

function KnowledgeUniversePage() {
    const mountRef = useRef(null);
    const [knowledgePoints, setKnowledgePoints] = useState([]);
    const [graphLinks, setGraphLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedInfo, setSelectedInfo] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [kpRes, graphRes] = await Promise.all([
                    apiClient.get('/knowledge-points'),
                    apiClient.get('/graph/knowledge-map'),
                ]);
                setKnowledgePoints(kpRes.data || []);
                setGraphLinks(graphRes.data?.links || []);
            } catch (err) {
                console.error('加载知识宇宙数据失败:', err);
                setError(err.response?.data?.msg || '无法加载知识宇宙数据，请稍后再试。');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount || !knowledgePoints.length) return;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x030712);

        const camera = new THREE.PerspectiveCamera(
            60,
            mount.clientWidth / mount.clientHeight,
            0.1,
            2000
        );
        camera.position.set(0, 0, 400);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(mount.clientWidth, mount.clientHeight);
        mount.appendChild(renderer.domElement);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
        const pointLight = new THREE.PointLight(0xffffff, 1.2);
        pointLight.position.set(150, 200, 150);
        scene.add(ambientLight);
        scene.add(pointLight);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.08;
        controls.rotateSpeed = 0.4;

        const nodeMeshes = [];
        const nodeMeshMap = new Map();
        const colorPalette = [0x00bcd4, 0xff6b6b, 0xffc107, 0x8bc34a, 0x9c27b0];
        const sphereGeometry = new THREE.SphereGeometry(6, 32, 32);

        const simulationNodes = knowledgePoints.map((kp, index) => {
            const color = kp.reviewList ? 0xffa726 : colorPalette[index % colorPalette.length];
            const material = new THREE.MeshStandardMaterial({
                color,
                emissive: color,
                emissiveIntensity: 0.25,
            });
            const sphere = new THREE.Mesh(sphereGeometry, material);
            sphere.position.set(
                (Math.random() - 0.5) * 300,
                (Math.random() - 0.5) * 300,
                (Math.random() - 0.5) * 300
            );
            sphere.userData = {
                id: kp._id,
                title: kp.title || '未命名知识点',
                content: kp.content || '',
                baseColor: color,
            };
            scene.add(sphere);
            nodeMeshes.push(sphere);
            nodeMeshMap.set(kp._id, sphere);
            return {
                id: kp._id,
                x: sphere.position.x,
                y: sphere.position.y,
                z: sphere.position.z,
            };
        });

        const simulationLinks = (graphLinks || []).map((link) => ({
            source: link.source,
            target: link.target,
        }));

        const simulation = forceSimulation(simulationNodes)
            .numDimensions(3)
            .force('charge', forceManyBody().strength(-120))
            .force('center', forceCenter(0, 0, 0))
            .force(
                'link',
                forceLink(simulationLinks)
                    .id((d) => d.id)
                    .distance(160)
                    .strength(0.15)
            );

        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x5dade2,
            transparent: true,
            opacity: 0.35,
        });

        const linkLines = simulationLinks.map((link) => {
            const geometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(),
                new THREE.Vector3(),
            ]);
            const line = new THREE.Line(geometry, lineMaterial);
            line.userData = {
                source: typeof link.source === 'object' ? link.source.id : link.source,
                target: typeof link.target === 'object' ? link.target.id : link.target,
            };
            scene.add(line);
            return line;
        });

        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2();
        let highlightedMesh = null;
        let animationId;

        const animate = () => {
            animationId = requestAnimationFrame(animate);
            simulation.tick();

            simulationNodes.forEach((node) => {
                const mesh = nodeMeshMap.get(node.id);
                if (mesh) {
                    mesh.position.set(node.x || 0, node.y || 0, node.z || 0);
                }
            });

            linkLines.forEach((line) => {
                const sourceMesh = nodeMeshMap.get(line.userData.source);
                const targetMesh = nodeMeshMap.get(line.userData.target);
                if (sourceMesh && targetMesh) {
                    line.geometry.setFromPoints([sourceMesh.position, targetMesh.position]);
                }
            });

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

        const handleClick = (event) => {
            const rect = renderer.domElement.getBoundingClientRect();
            pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            raycaster.setFromCamera(pointer, camera);

            const intersects = raycaster.intersectObjects(nodeMeshes);
            if (intersects.length > 0) {
                const mesh = intersects[0].object;
                if (highlightedMesh && highlightedMesh !== mesh) {
                    highlightedMesh.material.color.set(highlightedMesh.userData.baseColor);
                }
                highlightedMesh = mesh;
                highlightedMesh.material.color.set(0xff5555);
                setSelectedInfo({
                    title: mesh.userData.title,
                    content: mesh.userData.content,
                });
            } else if (highlightedMesh) {
                highlightedMesh.material.color.set(highlightedMesh.userData.baseColor);
                highlightedMesh = null;
                setSelectedInfo(null);
            }
        };
        renderer.domElement.addEventListener('click', handleClick);

        return () => {
            window.removeEventListener('resize', handleResize);
            renderer.domElement.removeEventListener('click', handleClick);
            cancelAnimationFrame(animationId);
            controls.dispose();
            renderer.dispose();
            scene.traverse((child) => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach((mat) => mat.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });
            mount.removeChild(renderer.domElement);
        };
    }, [knowledgePoints, graphLinks]);

    if (loading) {
        return <p>正在召唤知识宇宙...</p>;
    }

    if (error) {
        return <p className="text-red-500">{error}</p>;
    }

    if (!knowledgePoints.length) {
        return (
            <div>
                <h1 className="text-2xl font-semibold mb-4">知识宇宙</h1>
                <p>还没有知识点可以展示，快去创建你的第一颗知识星球吧！</p>
            </div>
        );
    }

    return (
        <div className="relative">
            <div className="mb-4">
                <h1 className="text-3xl font-semibold">知识宇宙</h1>
                <p className="text-gray-500">
                    数据驱动的3D知识图谱。拖拽或滚动以探索，点击星球查看详情。
                </p>
            </div>
            <div
                ref={mountRef}
                style={{ width: '100%', height: '70vh', borderRadius: '12px', overflow: 'hidden' }}
            />
            {selectedInfo && (
                <div className="absolute top-8 right-8 bg-white bg-opacity-90 shadow-lg rounded-lg p-4 w-72">
                    <h2 className="text-xl font-semibold mb-2">{selectedInfo.title}</h2>
                    <p className="text-sm text-gray-700 whitespace-pre-line">
                        {selectedInfo.content?.slice(0, 200) || '暂无内容'}
                    </p>
                    <button
                        className="mt-3 text-sm text-blue-600 hover:underline"
                        onClick={() => setSelectedInfo(null)}
                    >
                        收起
                    </button>
                </div>
            )}
        </div>
    );
}

export default KnowledgeUniversePage;

