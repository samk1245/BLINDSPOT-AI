import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Multi-Chromatic Constellation Particles
function EvidenceStarfield({ count = 300 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null!);

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const cols = new Float32Array(count * 3);
    const colorIndigo = new THREE.Color('#6366f1');
    const colorEmerald = new THREE.Color('#10b981');
    const colorAmber = new THREE.Color('#f59e0b');
    const colorRose = new THREE.Color('#f43f5e');

    for (let i = 0; i < count; i++) {
      const r = 3.2 + Math.random() * 4.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;

      pos[i * 3] = r * Math.cos(theta) * Math.cos(phi);
      pos[i * 3 + 1] = r * Math.sin(phi);
      pos[i * 3 + 2] = r * Math.sin(theta) * Math.cos(phi);

      const dice = Math.random();
      const mixedColor = dice < 0.35 ? colorIndigo : dice < 0.65 ? colorEmerald : dice < 0.85 ? colorAmber : colorRose;
      cols[i * 3] = mixedColor.r;
      cols[i * 3 + 1] = mixedColor.g;
      cols[i * 3 + 2] = mixedColor.b;
    }
    return [pos, cols];
  }, [count]);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.035;
      pointsRef.current.rotation.x += delta * 0.012;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.045}
        vertexColors
        transparent
        opacity={0.7}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Multi-Chromatic Gyroscopic Rings
function OrbitalRings() {
  const ring1Ref = useRef<THREE.Group>(null!);
  const ring2Ref = useRef<THREE.Group>(null!);
  const ring3Ref = useRef<THREE.Group>(null!);

  useFrame((state, delta) => {
    if (ring1Ref.current) ring1Ref.current.rotation.z += delta * 0.2;
    if (ring2Ref.current) ring2Ref.current.rotation.x += delta * 0.15;
    if (ring3Ref.current) ring3Ref.current.rotation.y -= delta * 0.18;
  });

  return (
    <>
      {/* Outer Indigo Ring */}
      <group ref={ring1Ref} rotation={[Math.PI / 4, 0, 0]}>
        <mesh>
          <torusGeometry args={[2.2, 0.012, 16, 100]} />
          <meshBasicMaterial color="#6366f1" transparent opacity={0.55} />
        </mesh>
      </group>

      {/* Middle Emerald Ring */}
      <group ref={ring2Ref} rotation={[0, Math.PI / 3, Math.PI / 6]}>
        <mesh>
          <torusGeometry args={[2.0, 0.01, 16, 100]} />
          <meshBasicMaterial color="#10b981" transparent opacity={0.65} />
        </mesh>
      </group>

      {/* Inner Amber Tech Ring */}
      <group ref={ring3Ref} rotation={[-Math.PI / 3, 0, Math.PI / 4]}>
        <mesh>
          <torusGeometry args={[1.8, 0.008, 16, 100]} />
          <meshBasicMaterial color="#f59e0b" transparent opacity={0.5} />
        </mesh>
      </group>
    </>
  );
}

// Core Distorting Evidence Core
function CoreIntelligenceSphere() {
  const sphereRef = useRef<THREE.Mesh>(null!);
  const innerRef = useRef<THREE.Mesh>(null!);

  useFrame((state, delta) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.y += delta * 0.18;
      sphereRef.current.rotation.x += delta * 0.07;
    }
    if (innerRef.current) {
      innerRef.current.rotation.y -= delta * 0.12;
    }
  });

  return (
    <group>
      {/* Inner Solid Core */}
      <mesh ref={innerRef}>
        <sphereGeometry args={[1.0, 24, 24]} />
        <meshStandardMaterial
          color="#0f172a"
          emissive="#6366f1"
          emissiveIntensity={0.3}
          roughness={0.3}
          metalness={0.9}
        />
      </mesh>

      {/* Outer Holographic Mesh Cage */}
      <Sphere ref={sphereRef} args={[1.35, 32, 32]}>
        <MeshDistortMaterial
          color="#090d16"
          emissive="#10b981"
          emissiveIntensity={0.5}
          roughness={0.15}
          metalness={0.85}
          distort={0.28}
          speed={1.8}
          wireframe={true}
        />
      </Sphere>
    </group>
  );
}

export const ThreeEvidenceGlobe: React.FC<{ className?: string }> = ({ className = "h-80 w-full" }) => {
  return (
    <div className={`relative ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 4.8], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ pointerEvents: 'none' }}
      >
        <ambientLight intensity={0.9} />
        <directionalLight position={[10, 10, 5]} intensity={1.6} color="#6366f1" />
        <pointLight position={[-10, -10, -5]} intensity={1.3} color="#10b981" />
        <pointLight position={[0, 5, -5]} intensity={0.9} color="#f59e0b" />
        
        <EvidenceStarfield />
        <OrbitalRings />
        <CoreIntelligenceSphere />
      </Canvas>
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#0b0f17] via-transparent to-transparent opacity-80" />
    </div>
  );
};
