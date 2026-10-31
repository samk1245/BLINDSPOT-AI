import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Cosmic Nebula & Starfield background particles
function CyberStarfield({ count = 350 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null!);

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const cols = new Float32Array(count * 3);
    const colorCyan = new THREE.Color('#00d2ff');
    const colorGold = new THREE.Color('#e2b65c');
    const colorViolet = new THREE.Color('#9a6cff');

    for (let i = 0; i < count; i++) {
      // Cylindrical & spherical dispersion
      const r = 3.5 + Math.random() * 4.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;

      pos[i * 3] = r * Math.cos(theta) * Math.cos(phi);
      pos[i * 3 + 1] = r * Math.sin(phi);
      pos[i * 3 + 2] = r * Math.sin(theta) * Math.cos(phi);

      const dice = Math.random();
      const mixedColor = dice < 0.45 ? colorCyan : dice < 0.75 ? colorGold : colorViolet;
      cols[i * 3] = mixedColor.r;
      cols[i * 3 + 1] = mixedColor.g;
      cols[i * 3 + 2] = mixedColor.b;
    }
    return [pos, cols];
  }, [count]);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.04;
      pointsRef.current.rotation.x += delta * 0.015;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        vertexColors
        transparent
        opacity={0.65}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Sphinx Gyroscopic Orbital Rings
function OrbitalRings() {
  const ring1Ref = useRef<THREE.Group>(null!);
  const ring2Ref = useRef<THREE.Group>(null!);
  const ring3Ref = useRef<THREE.Group>(null!);

  useFrame((state, delta) => {
    if (ring1Ref.current) ring1Ref.current.rotation.z += delta * 0.25;
    if (ring2Ref.current) ring2Ref.current.rotation.x += delta * 0.18;
    if (ring3Ref.current) ring3Ref.current.rotation.y -= delta * 0.22;
  });

  return (
    <>
      {/* Outer Cyan Ring */}
      <group ref={ring1Ref} rotation={[Math.PI / 4, 0, 0]}>
        <mesh>
          <torusGeometry args={[2.2, 0.015, 16, 100]} />
          <meshBasicMaterial color="#00d2ff" transparent opacity={0.6} />
        </mesh>
      </group>

      {/* Middle Gold Ring */}
      <group ref={ring2Ref} rotation={[0, Math.PI / 3, Math.PI / 6]}>
        <mesh>
          <torusGeometry args={[2.0, 0.012, 16, 100]} />
          <meshBasicMaterial color="#e2b65c" transparent opacity={0.7} />
        </mesh>
      </group>

      {/* Inner Violet Tech Ring */}
      <group ref={ring3Ref} rotation={[-Math.PI / 3, 0, Math.PI / 4]}>
        <mesh>
          <torusGeometry args={[1.8, 0.01, 16, 100]} />
          <meshBasicMaterial color="#9a6cff" transparent opacity={0.5} />
        </mesh>
      </group>
    </>
  );
}

// Core Holographic Intelligence Core
function CoreIntelligenceSphere() {
  const sphereRef = useRef<THREE.Mesh>(null!);
  const innerRef = useRef<THREE.Mesh>(null!);

  useFrame((state, delta) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.y += delta * 0.2;
      sphereRef.current.rotation.x += delta * 0.08;
    }
    if (innerRef.current) {
      innerRef.current.rotation.y -= delta * 0.15;
    }
  });

  return (
    <group>
      {/* Inner Pulsing Solid Core */}
      <mesh ref={innerRef}>
        <sphereGeometry args={[1.0, 24, 24]} />
        <meshStandardMaterial
          color="#060a17"
          emissive="#e2b65c"
          emissiveIntensity={0.35}
          roughness={0.3}
          metalness={0.9}
        />
      </mesh>

      {/* Outer Distorting Cyber Holographic Cage */}
      <Sphere ref={sphereRef} args={[1.35, 32, 32]}>
        <MeshDistortMaterial
          color="#030712"
          emissive="#00d2ff"
          emissiveIntensity={0.6}
          roughness={0.1}
          metalness={0.9}
          distort={0.32}
          speed={2.2}
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
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 5]} intensity={1.8} color="#00d2ff" />
        <pointLight position={[-10, -10, -5]} intensity={1.4} color="#e2b65c" />
        <pointLight position={[0, 5, -5]} intensity={0.9} color="#9a6cff" />
        
        <CyberStarfield />
        <OrbitalRings />
        <CoreIntelligenceSphere />
      </Canvas>
      {/* Ambient Radial Underglow */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#02040a] via-transparent to-transparent opacity-80" />
    </div>
  );
};
