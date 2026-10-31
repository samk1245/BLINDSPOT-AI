import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function ParticleConstellation({ count = 120 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null!);

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const cols = new Float32Array(count * 3);
    const colorCyan = new THREE.Color('#38bdf8');
    const colorViolet = new THREE.Color('#a855f7');

    for (let i = 0; i < count; i++) {
      // Fibonacci sphere distribution
      const phi = Math.acos(-1 + (2 * i) / count);
      const theta = Math.sqrt(count * Math.PI) * phi;
      const radius = 2.4 + (Math.random() - 0.5) * 0.4;

      pos[i * 3] = radius * Math.cos(theta) * Math.sin(phi);
      pos[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
      pos[i * 3 + 2] = radius * Math.cos(phi);

      const mixedColor = colorCyan.clone().lerp(colorViolet, Math.random());
      cols[i * 3] = mixedColor.r;
      cols[i * 3 + 1] = mixedColor.g;
      cols[i * 3 + 2] = mixedColor.b;
    }
    return [pos, cols];
  }, [count]);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.12;
      pointsRef.current.rotation.x += delta * 0.05;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.065}
        vertexColors
        transparent
        opacity={0.85}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function CoreIntelligenceSphere() {
  const sphereRef = useRef<THREE.Mesh>(null!);

  useFrame((state, delta) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <Sphere ref={sphereRef} args={[1.5, 32, 32]}>
      <MeshDistortMaterial
        color="#0e172a"
        emissive="#0284c7"
        emissiveIntensity={0.3}
        roughness={0.2}
        metalness={0.8}
        distort={0.25}
        speed={1.5}
        wireframe={true}
      />
    </Sphere>
  );
}

export const ThreeEvidenceGlobe: React.FC<{ className?: string }> = ({ className = "h-80 w-full" }) => {
  return (
    <div className={`relative ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
        style={{ pointerEvents: 'none' }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 10, 5]} intensity={1.2} color="#38bdf8" />
        <pointLight position={[-10, -10, -5]} intensity={0.8} color="#a855f7" />
        <CoreIntelligenceSphere />
        <ParticleConstellation />
      </Canvas>
      {/* Subtle depth lighting overlay */}
      <div className="absolute inset-0 bg-radial from-transparent via-[#080c14]/30 to-[#080c14] pointer-events-none" />
    </div>
  );
};
