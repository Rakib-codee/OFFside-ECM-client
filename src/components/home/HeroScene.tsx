"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { isFinePointer, prefersReducedMotion } from "@/lib/motion";

const PARTICLE_COUNT = 1600;
const ACCENT = 0xff3b30;
const ACCENT_ALT = 0x007aff;
const JERSEY_RED = 0xd41830;
const SKIN = 0x2b2b33;

/** Canvas texture for the back print: OFFSIDE arc + big number 10. */
function makeBackPrintTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, 512, 512);
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.font = "bold 64px Arial";
  ctx.fillText("O F F S I D E", 256, 120);
  ctx.font = "bold 300px Arial";
  ctx.fillText("10", 256, 430);
  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  return texture;
}

/**
 * Three.js hero: a stylized low-poly footballer standing in the OFFside kit,
 * back print "OFFSIDE 10", slowly turning inside a glowing particle field lit
 * by the brand red/blue. Mouse parallax on fine pointers; static frame for
 * reduced motion. Decorative only — pointer-events: none, aria-hidden.
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
    const camera = new THREE.PerspectiveCamera(50, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(0, 0.4, 8);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);
    const placeGroup = (width: number) => {
      group.position.x = width >= 1024 ? 2.6 : 0;
      group.position.y = width >= 1024 ? -0.2 : 0.35;
      group.scale.setScalar(width >= 1024 ? 1 : 0.8);
    };
    placeGroup(mount.clientWidth);

    const disposables: (THREE.BufferGeometry | THREE.Material | THREE.Texture)[] = [];
    const mesh = (
      geometry: THREE.BufferGeometry,
      material: THREE.Material,
      parent: THREE.Object3D,
      position: [number, number, number],
      rotation?: [number, number, number],
    ) => {
      const m = new THREE.Mesh(geometry, material);
      m.position.set(...position);
      if (rotation) {
        m.rotation.set(...rotation);
      }
      parent.add(m);
      disposables.push(geometry, material);
      return m;
    };

    /* ---------- The player ---------- */
    const player = new THREE.Group();
    group.add(player);

    const jerseyMaterial = new THREE.MeshStandardMaterial({
      color: JERSEY_RED,
      flatShading: true,
      roughness: 0.6,
      metalness: 0.1,
    });
    const darkMaterial = new THREE.MeshStandardMaterial({
      color: 0x17171c,
      flatShading: true,
      roughness: 0.7,
    });
    const skinMaterial = new THREE.MeshStandardMaterial({
      color: SKIN,
      flatShading: true,
      roughness: 0.55,
      metalness: 0.25,
    });
    const whiteMaterial = new THREE.MeshStandardMaterial({
      color: 0xe8e8ee,
      flatShading: true,
      roughness: 0.6,
    });

    // Torso (jersey)
    const torso = mesh(
      new THREE.CylinderGeometry(0.55, 0.68, 1.5, 8),
      jerseyMaterial,
      player,
      [0, 0.55, 0],
    );
    // Collar
    mesh(new THREE.TorusGeometry(0.3, 0.07, 6, 10), whiteMaterial, player, [0, 1.32, 0], [
      Math.PI / 2.3,
      0,
      0,
    ]);
    // Sleeves
    mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.55, 7), jerseyMaterial, player, [-0.78, 1.0, 0], [0, 0, Math.PI / 3.2]);
    mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.55, 7), jerseyMaterial, player, [0.78, 1.0, 0], [0, 0, -Math.PI / 3.2]);
    // Arms
    const leftArm = mesh(new THREE.CylinderGeometry(0.13, 0.11, 0.85, 7), skinMaterial, player, [-1.0, 0.35, 0], [0, 0, Math.PI / 14]);
    const rightArm = mesh(new THREE.CylinderGeometry(0.13, 0.11, 0.85, 7), skinMaterial, player, [1.0, 0.35, 0], [0, 0, -Math.PI / 14]);
    // Head + hair
    mesh(new THREE.IcosahedronGeometry(0.34, 1), skinMaterial, player, [0, 1.78, 0]);
    mesh(new THREE.IcosahedronGeometry(0.3, 1), darkMaterial, player, [0, 1.95, -0.05]);
    // Shorts
    mesh(new THREE.CylinderGeometry(0.62, 0.55, 0.55, 8), darkMaterial, player, [0, -0.45, 0]);
    // Legs
    mesh(new THREE.CylinderGeometry(0.17, 0.14, 1.25, 7), skinMaterial, player, [-0.3, -1.3, 0]);
    mesh(new THREE.CylinderGeometry(0.17, 0.14, 1.25, 7), skinMaterial, player, [0.3, -1.3, 0]);
    // Socks + boots
    mesh(new THREE.CylinderGeometry(0.15, 0.13, 0.45, 7), jerseyMaterial, player, [-0.3, -1.75, 0]);
    mesh(new THREE.CylinderGeometry(0.15, 0.13, 0.45, 7), jerseyMaterial, player, [0.3, -1.75, 0]);
    mesh(new THREE.BoxGeometry(0.3, 0.18, 0.55), darkMaterial, player, [-0.3, -2.05, 0.08]);
    mesh(new THREE.BoxGeometry(0.3, 0.18, 0.55), darkMaterial, player, [0.3, -2.05, 0.08]);

    // Back print: OFFSIDE 10
    const backTexture = makeBackPrintTexture();
    const printMaterial = new THREE.MeshBasicMaterial({
      map: backTexture,
      transparent: true,
      side: THREE.DoubleSide,
    });
    const printGeometry = new THREE.PlaneGeometry(1.0, 1.0);
    disposables.push(backTexture, printMaterial, printGeometry);
    const print = new THREE.Mesh(printGeometry, printMaterial);
    print.position.set(0, 0.62, -0.66);
    print.rotation.y = Math.PI;
    player.add(print);

    // Glow ring under the feet
    const ring = mesh(
      new THREE.RingGeometry(0.9, 1.25, 48),
      new THREE.MeshBasicMaterial({
        color: ACCENT,
        transparent: true,
        opacity: 0.22,
        side: THREE.DoubleSide,
      }),
      group,
      [0, -2.18, 0],
      [-Math.PI / 2, 0, 0],
    );

    /* ---------- Particles ---------- */
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const radius = 3.4 + Math.random() * 4.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.8;
      positions[i * 3 + 2] = radius * Math.cos(phi) - 1.5;
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.025,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    disposables.push(particleGeometry, particleMaterial);
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    group.add(particles);

    /* ---------- Lights ---------- */
    const redLight = new THREE.PointLight(ACCENT, 60, 30);
    redLight.position.set(4, 3, 4);
    scene.add(redLight);
    const blueLight = new THREE.PointLight(ACCENT_ALT, 45, 30);
    blueLight.position.set(-4, 1, 3);
    scene.add(blueLight);
    scene.add(new THREE.AmbientLight(0xffffff, 0.35));

    /* ---------- Interaction + loop ---------- */
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

      // Player turns slowly, breathes, arms sway
      player.rotation.y = elapsed * 0.45;
      torso.scale.y = 1 + Math.sin(elapsed * 1.6) * 0.015;
      player.position.y = Math.sin(elapsed * 1.6) * 0.04;
      leftArm.rotation.z = Math.PI / 14 + Math.sin(elapsed * 1.6) * 0.06;
      rightArm.rotation.z = -Math.PI / 14 - Math.sin(elapsed * 1.6) * 0.06;

      // Ring pulses, particles drift
      const ringMaterial = ring.material as THREE.MeshBasicMaterial;
      ringMaterial.opacity = 0.16 + Math.sin(elapsed * 2) * 0.08;
      ring.scale.setScalar(1 + Math.sin(elapsed * 2) * 0.05);
      particles.rotation.y = elapsed * 0.02;

      // Mouse parallax on the whole composition
      current.x += (target.x - current.x) * 0.04;
      current.y += (target.y - current.y) * 0.04;
      group.rotation.y = current.x * 0.2;
      group.rotation.x = current.y * 0.1;

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
      placeGroup(clientWidth);
    };
    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      renderer.dispose();
      disposables.forEach((resource) => resource.dispose());
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div ref={mountRef} aria-hidden="true" className="pointer-events-none absolute inset-0" />
  );
}
