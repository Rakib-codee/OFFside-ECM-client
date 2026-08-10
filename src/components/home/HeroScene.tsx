"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { isFinePointer, prefersReducedMotion } from "@/lib/motion";

const PARTICLE_COUNT = 1800;
const ACCENT = 0xff3b30;
const ACCENT_ALT = 0x007aff;

/**
 * Three.js hero backdrop: a low-poly football wrapped in a glowing wireframe,
 * orbited by a particle field, lit by the brand's red and blue. Mouse-reactive
 * on fine pointers; renders a single static frame for reduced-motion users.
 * Pure decoration — pointer-events: none, aria-hidden.
 */
export default function HeroScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) {
      return;
    }

    const reduced = prefersReducedMotion();
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      55,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100,
    );
    camera.position.z = 7;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    // Everything lives in one group so parallax moves the whole composition
    const group = new THREE.Group();
    scene.add(group);
    const isWide = mount.clientWidth >= 1024;
    group.position.x = isWide ? 2.4 : 0;
    group.position.y = isWide ? 0 : 0.6;

    // The ball: dark faceted core + glowing wireframe shell
    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.9, 1),
      new THREE.MeshStandardMaterial({
        color: 0x15151a,
        flatShading: true,
        metalness: 0.35,
        roughness: 0.55,
      }),
    );
    group.add(core);

    const shell = new THREE.Mesh(
      new THREE.IcosahedronGeometry(2.15, 1),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
        transparent: true,
        opacity: 0.28,
      }),
    );
    group.add(shell);

    const halo = new THREE.Mesh(
      new THREE.IcosahedronGeometry(2.65, 1),
      new THREE.MeshBasicMaterial({
        color: ACCENT,
        wireframe: true,
        transparent: true,
        opacity: 0.07,
      }),
    );
    group.add(halo);

    // Particle field on a spherical shell around the ball
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const radius = 3.2 + Math.random() * 4.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi) - 1.5;
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particles = new THREE.Points(
      particleGeometry,
      new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.025,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    group.add(particles);

    // Brand lighting: red one side, electric blue the other
    const redLight = new THREE.PointLight(ACCENT, 60, 30);
    redLight.position.set(4, 3, 4);
    scene.add(redLight);
    const blueLight = new THREE.PointLight(ACCENT_ALT, 45, 30);
    blueLight.position.set(-4, -2, 3);
    scene.add(blueLight);
    scene.add(new THREE.AmbientLight(0xffffff, 0.25));

    // Mouse parallax (fine pointers only)
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    const handleMouseMove = (event: MouseEvent) => {
      target.x = (event.clientX / window.innerWidth - 0.5) * 2;
      target.y = (event.clientY / window.innerHeight - 0.5) * 2;
    };
    if (isFinePointer() && !reduced) {
      window.addEventListener("mousemove", handleMouseMove, { passive: true });
    }

    const clock = new THREE.Clock();
    let frame = 0;
    const renderFrame = () => {
      const elapsed = clock.getElapsedTime();
      core.rotation.y = elapsed * 0.18;
      core.rotation.x = Math.sin(elapsed * 0.22) * 0.15;
      shell.rotation.y = -elapsed * 0.12;
      shell.rotation.z = elapsed * 0.05;
      halo.rotation.y = elapsed * 0.06;
      particles.rotation.y = elapsed * 0.02;

      current.x += (target.x - current.x) * 0.04;
      current.y += (target.y - current.y) * 0.04;
      group.rotation.y = current.x * 0.25;
      group.rotation.x = current.y * 0.18;

      // Lights breathe slowly
      redLight.intensity = 55 + Math.sin(elapsed * 0.8) * 12;
      blueLight.intensity = 42 + Math.cos(elapsed * 0.6) * 10;

      renderer.render(scene, camera);
    };

    if (reduced) {
      renderFrame();
    } else {
      const loop = () => {
        renderFrame();
        frame = requestAnimationFrame(loop);
      };
      frame = requestAnimationFrame(loop);
    }

    const handleResize = () => {
      const { clientWidth, clientHeight } = mount;
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight);
      group.position.x = clientWidth >= 1024 ? 2.4 : 0;
      group.position.y = clientWidth >= 1024 ? 0 : 0.6;
    };
    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      renderer.dispose();
      particleGeometry.dispose();
      [core, shell, halo].forEach((mesh) => {
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
      });
      (particles.material as THREE.Material).dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
    />
  );
}
