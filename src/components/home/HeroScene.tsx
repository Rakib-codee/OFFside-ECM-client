"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { isFinePointer, prefersReducedMotion } from "@/lib/motion";

// Model: "neymar 3d free football model #free + animation" (https://skfb.ly/oGwZE)
// by Ltti....................Ttg — CC Attribution 4.0
const MODEL_URL = "/models/neymar.glb";
const PARTICLE_COUNT = 1600;
const ACCENT = 0xff3b30;
const ACCENT_ALT = 0x007aff;
const PLAYER_HEIGHT = 4.3;
const FLOOR_Y = -2.15;

/** Soft radial contact shadow with a faint brand-red rim. */
function makeShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(128, 128, 10, 128, 128, 126);
  gradient.addColorStop(0, "rgba(0,0,0,0.85)");
  gradient.addColorStop(0.55, "rgba(120,10,20,0.35)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(canvas);
}

/**
 * Three.js hero: rigged footballer (CC-BY, see MODEL_URL note) playing its
 * embedded animation on a slow turntable, lit with ACES tone mapping + room
 * environment, inside the brand particle field. Mouse parallax on fine
 * pointers; static frame for reduced motion. Decorative only.
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
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    // Neutral studio reflections so PBR materials read as real surfaces
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;

    const group = new THREE.Group();
    scene.add(group);
    const placeGroup = (width: number) => {
      group.position.x = width >= 1024 ? 2.6 : 0;
      group.position.y = width >= 1024 ? -0.2 : 0.35;
      group.scale.setScalar(width >= 1024 ? 1 : 0.8);
    };
    placeGroup(mount.clientWidth);

    const player = new THREE.Group();
    group.add(player);

    /* ---------- Ground: soft contact shadow ---------- */
    const shadowTexture = makeShadowTexture();
    const shadowMaterial = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 3.4), shadowMaterial);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = FLOOR_Y + 0.01;
    group.add(shadow);

    /* ---------- The footballer ---------- */
    let isDisposed = false;
    let mixer: THREE.AnimationMixer | null = null;
    const loader = new GLTFLoader();
    loader.load(
      MODEL_URL,
      (gltf) => {
        if (isDisposed) {
          return;
        }
        const model = gltf.scene;

        model.traverse((node) => {
          if (node instanceof THREE.Mesh && node.material instanceof THREE.MeshStandardMaterial) {
            node.material.envMapIntensity = 0.85;
          }
        });

        // Embedded animation (mixamo). Zero the hips' X/Z translation so the
        // action plays in place instead of wandering off the pedestal.
        if (gltf.animations.length > 0) {
          for (const track of gltf.animations[0].tracks) {
            if (track.name.endsWith(".position") && track.name.includes("Hips")) {
              for (let i = 0; i < track.values.length; i += 3) {
                track.values[i] = 0;
                track.values[i + 2] = 0;
              }
            }
          }
          mixer = new THREE.AnimationMixer(model);
          const action = mixer.clipAction(gltf.animations[0]);
          action.play();
          mixer.update(0);
          if (reduced) {
            mixer = null;
          }
        }

        // Normalize height and stand the feet on the floor — measured on the
        // animated first frame, not the bind pose
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const scale = PLAYER_HEIGHT / size.y;
        model.scale.setScalar(scale);
        box.setFromObject(model);
        model.position.y = FLOOR_Y - box.min.y;
        model.position.x = -(box.min.x + box.max.x) / 2;
        model.position.z = -(box.min.z + box.max.z) / 2;

        player.add(model);
        if (reduced) {
          renderFrame();
        }
      },
      undefined,
      () => {
        // Model failed to load — the particle field still carries the scene
      },
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
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    group.add(particles);

    /* ---------- Lights ---------- */
    const redLight = new THREE.PointLight(ACCENT, 55, 30);
    redLight.position.set(4, 3, 4);
    scene.add(redLight);
    const blueLight = new THREE.PointLight(ACCENT_ALT, 40, 30);
    blueLight.position.set(-4, 1.5, 3);
    scene.add(blueLight);
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    keyLight.position.set(2, 4, 5);
    scene.add(keyLight);
    scene.add(new THREE.AmbientLight(0xffffff, 0.25));

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
      const delta = clock.getDelta();
      const elapsed = clock.elapsedTime;

      if (mixer) {
        mixer.update(delta);
      }
      // Slow turntable
      player.rotation.y = elapsed * 0.3;

      particles.rotation.y = elapsed * 0.02;
      shadowMaterial.opacity = 0.5 + Math.sin(elapsed * 1.5) * 0.05;

      // Mouse parallax on the whole composition
      current.x += (target.x - current.x) * 0.04;
      current.y += (target.y - current.y) * 0.04;
      group.rotation.y = current.x * 0.2;
      group.rotation.x = current.y * 0.08;

      redLight.intensity = 50 + Math.sin(elapsed * 0.8) * 12;
      blueLight.intensity = 38 + Math.cos(elapsed * 0.6) * 10;

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
      isDisposed = true;
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      mixer?.stopAllAction();
      scene.traverse((node) => {
        if (node instanceof THREE.Mesh || node instanceof THREE.Points) {
          node.geometry.dispose();
          const materials = Array.isArray(node.material) ? node.material : [node.material];
          materials.forEach((material) => {
            Object.values(material).forEach((value) => {
              if (value instanceof THREE.Texture) {
                value.dispose();
              }
            });
            material.dispose();
          });
        }
      });
      envTexture.dispose();
      pmrem.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div ref={mountRef} aria-hidden="true" className="pointer-events-none absolute inset-0" />
  );
}
