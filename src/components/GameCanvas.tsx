import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Play, Pause, RotateCcw, Volume2, VolumeX, Eye, Code2, 
  Compass, Zap, BatteryCharging, CheckCircle2, Crosshair,
  Wind, Award, Flame
} from 'lucide-react';
import { NASA_MACHINES, NasaMachine } from '../data/nasaMachines';
import { sounds } from '../utils/audio';

interface SampleTarget {
  x: number;
  y: number;
  type: string;
  name: string;
  composition: string;
  collected: boolean;
  depthMeters?: number;
  icePct?: number;
}

interface RockHazard {
  x: number;
  width: number;
  height: number;
}

interface GameCanvasProps {
  selectedMachineId: string;
  onSelectMachine: (id: string) => void;
  onOpenCppFile?: (filename: string, functionName?: string) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  selectedMachineId,
  onSelectMachine,
  onOpenCppFile
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const activeMachine = NASA_MACHINES.find(m => m.id === selectedMachineId) || NASA_MACHINES[0];

  // Game state
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showCppInspector, setShowCppInspector] = useState<boolean>(false);
  const [scienceScore, setScienceScore] = useState<number>(0);
  const [collectedSamples, setCollectedSamples] = useState<string[]>([]);
  const [activeMessage, setActiveMessage] = useState<string>(
    activeMachine.target === 'moon' 
      ? 'Explore lunar regolith. Collect geologic samples and inspect C++ physics.' 
      : 'Analyze Martian surface targets with laser and instruments.'
  );
  const [oxygenGeneratedGrams, setOxygenGeneratedGrams] = useState<number>(0);
  const [isDrilling, setIsDrilling] = useState<boolean>(false);
  const [drillProgress, setDrillProgress] = useState<number>(0);

  // Active C++ function highlight in inspector
  const [activeCppSnippet, setActiveCppSnippet] = useState<{
    file: string;
    func: string;
    formula: string;
    explanation: string;
  }>({
    file: 'include/rover_physics.hpp',
    func: 'RoverTerramechanics::calculateTraction()',
    formula: 'F_t = W * tan(phi) * (1 - exp(-j / K))',
    explanation: 'Bekker-Wong terramechanics shear stress equation calculating wheel traction on granular regolith.'
  });

  // Physical simulation variables (held in ref for 60fps canvas loop)
  const simRef = useRef({
    x: 100,
    y: 200,
    vx: 0,
    vy: 0,
    angle: 0,
    angularVel: 0,
    wheelAngle: 0,
    rpm: 0,
    targetRpm: 0,
    isAirborne: false,
    slipRatio: 0.05,
    distanceTraveled: 0,
    batteryPct: 98,
    laserActive: false,
    laserTarget: null as { x: number; y: number } | null,
    laserTimer: 0,
    headlightsOn: true,
    unStuckMode: false,
    keys: {
      left: false,
      right: false,
      up: false,
      down: false,
      action: false
    }
  });

  // Terrain generation
  const terrainRef = useRef<number[]>([]);
  const targetsRef = useRef<SampleTarget[]>([]);
  const hazardsRef = useRef<RockHazard[]>([]);

  // Initialize terrain and targets based on selected machine & body
  const initEnvironment = useCallback(() => {
    const isMoon = activeMachine.target === 'moon';
    const numPoints = 600;
    const terrain: number[] = [];

    // Terrain height generator
    for (let i = 0; i < numPoints; i++) {
      const x = i * 20;
      let height = 280;
      if (isMoon) {
        // Lunar craters and undulating ridges
        height += Math.sin(x * 0.003) * 60 + Math.sin(x * 0.012) * 20;
        // Occasional crater depressions
        if ((x > 600 && x < 900) || (x > 2200 && x < 2600)) {
          height += 45 * Math.sin(((x - 600) / 300) * Math.PI);
        }
      } else {
        // Martian rock-strewn desert and river delta terraces
        height += Math.sin(x * 0.004) * 45 + Math.cos(x * 0.015) * 15;
        if (x > 1400 && x < 1800) {
          height += 35 * Math.sin(((x - 1400) / 400) * Math.PI);
        }
      }
      terrain.push(height);
    }
    terrainRef.current = terrain;

    // Generate targets
    if (isMoon) {
      targetsRef.current = [
        { x: 450, y: 0, type: 'rock', name: 'Genesis Rock (Anorthosite)', composition: 'Plagioclase Feldspar (4.1 Gyr old)', collected: false },
        { x: 1100, y: 0, type: 'ice', name: 'Volatile-Rich Cold Trap Frost', composition: 'H2O / Subsurface Hydrogen (88% pure)', depthMeters: 0.85, icePct: 88, collected: false },
        { x: 1950, y: 0, type: 'soil', name: 'Orange Pyroclastic Beads', composition: 'Titanium-rich Volcanic Glass (Shorty Crater)', collected: false },
        { x: 2800, y: 0, type: 'ice', name: 'Deep Polar Ice Deposit', composition: 'Cryogenic Water Ice Matrix', depthMeters: 1.0, icePct: 94, collected: false }
      ];
    } else {
      targetsRef.current = [
        { x: 480, y: 0, type: 'rock', name: 'Yogi Rock (Delta Outcrop)', composition: 'Basaltic Andesite with Silica Crust', collected: false },
        { x: 1050, y: 0, type: 'rock', name: 'Hematite "Blueberry" Spherules', composition: 'Aqueous Iron Oxide (Liquid Water Proof)', collected: false },
        { x: 1800, y: 0, type: 'rock', name: 'Ancient Mudstone Core Target', composition: 'Clay Minerals with Organic Carbon Chains', collected: false },
        { x: 2600, y: 0, type: 'waypoint', name: 'Jezero Delta Landing Zone', composition: 'Flat Delta Bed for Aeriel Scouting', collected: false }
      ];
    }

    // Set sample Y coordinate to match terrain surface
    targetsRef.current.forEach(t => {
      const idx = Math.floor(t.x / 20);
      t.y = (terrain[idx] || 280) - 10;
    });

    // Reset rover position
    simRef.current.x = 80;
    simRef.current.y = (terrain[4] || 280) - 30;
    simRef.current.vx = 0;
    simRef.current.vy = 0;
    simRef.current.angle = 0;
    simRef.current.distanceTraveled = 0;
    simRef.current.laserActive = false;
    simRef.current.rpm = activeMachine.type === 'rotorcraft' ? 0 : 0;
  }, [activeMachine]);

  useEffect(() => {
    initEnvironment();
    setScienceScore(0);
    setCollectedSamples([]);
    setOxygenGeneratedGrams(0);
  }, [selectedMachineId, initEnvironment]);

  // Keyboard event listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) simRef.current.keys.left = true;
      if (['ArrowRight', 'KeyD'].includes(e.code)) simRef.current.keys.right = true;
      if (['ArrowUp', 'KeyW'].includes(e.code)) simRef.current.keys.up = true;
      if (['ArrowDown', 'KeyS'].includes(e.code)) simRef.current.keys.down = true;
      if (e.code === 'Space') {
        e.preventDefault();
        simRef.current.keys.action = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) simRef.current.keys.left = false;
      if (['ArrowRight', 'KeyD'].includes(e.code)) simRef.current.keys.right = false;
      if (['ArrowUp', 'KeyW'].includes(e.code)) simRef.current.keys.up = false;
      if (['ArrowDown', 'KeyS'].includes(e.code)) simRef.current.keys.down = false;
      if (e.code === 'Space') simRef.current.keys.action = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Primary action triggers
  const executePrimaryAction = useCallback(() => {
    const isHelicopter = activeMachine.type === 'rotorcraft';
    const isViper = activeMachine.id === 'viper';
    const isPercyOrCuriosity = activeMachine.id === 'perseverance' || activeMachine.id === 'curiosity';

    if (isHelicopter) {
      // Rotor spin up
      simRef.current.targetRpm = simRef.current.targetRpm > 1000 ? 0 : 2500;
      sounds.playRotorChop();
      setActiveMessage('Ingenuity: Adjusting collective rotor speed to 2,400 RPM for Martian 1% atmosphere.');
      setActiveCppSnippet({
        file: 'include/ingenuity_aerodynamics.hpp',
        func: 'IngenuityAerodynamics::calculateRotorLift()',
        formula: 'T = 2 * (1/2 * rho * (omega * R)^2 * DiskArea * Ct)',
        explanation: 'Coaxial rotor blade momentum equation offsetting 1.8 kg weight in Martian 0.020 kg/m^3 air.'
      });
      return;
    }

    if (isViper) {
      // Find nearby ice target within 80px
      const nearbyIce = targetsRef.current.find(
        t => !t.collected && t.type === 'ice' && Math.abs(t.x - simRef.current.x) < 80
      );
      if (nearbyIce) {
        setIsDrilling(true);
        sounds.playDrillHum();
        setActiveMessage(`VIPER: TRIDENT 1-meter drill deployed into ${nearbyIce.name}!`);
        setActiveCppSnippet({
          file: 'include/nasa_machines.hpp',
          func: 'ViperPolarRover::deployTridentDrill()',
          formula: 'WaterIceConfidence = min(100.0, depth * 82.5)',
          explanation: 'Rotary percussion drill penetrating 1 meter to extract cryogenic volatiles without sublimating.'
        });

        // Simulate drill sequence
        let progress = 0;
        const interval = setInterval(() => {
          progress += 20;
          setDrillProgress(progress);
          if (progress >= 100) {
            clearInterval(interval);
            setIsDrilling(false);
            setDrillProgress(0);
            nearbyIce.collected = true;
            sounds.playSampleAcquired();
            setScienceScore(prev => prev + 150);
            setCollectedSamples(prev => [...prev, `${nearbyIce.name} (${nearbyIce.icePct}% Ice)`]);
            setActiveMessage(`Discovery! Extracted pure cryogenic water ice core sample at depth ${nearbyIce.depthMeters} m!`);
          }
        }, 300);
      } else {
        // Active wheel walking
        simRef.current.unStuckMode = !simRef.current.unStuckMode;
        sounds.playTelemetryBeep(520, 0.1);
        setActiveMessage(simRef.current.unStuckMode 
          ? 'VIPER Active Suspension: Wheel-walking inchworm mode engaged.' 
          : 'VIPER Suspension: Normal 4WD rolling mode restored.');
      }
      return;
    }

    if (isPercyOrCuriosity) {
      // Fire SuperCam / ChemCam laser
      simRef.current.laserActive = true;
      simRef.current.laserTimer = 18;
      sounds.playLaserShot();

      // Check if target rock in front of rover within 200px
      const targetRock = targetsRef.current.find(
        t => !t.collected && t.x > simRef.current.x && t.x < simRef.current.x + 220
      );

      if (targetRock) {
        simRef.current.laserTarget = { x: targetRock.x, y: targetRock.y };
        targetRock.collected = true;
        sounds.playSampleAcquired();
        setScienceScore(prev => prev + 120);
        setCollectedSamples(prev => [...prev, targetRock.name]);
        setActiveMessage(`SuperCam LIBS: Fired 1064 nm laser pulses! Mineral: ${targetRock.composition}`);
        setActiveCppSnippet({
          file: 'include/nasa_machines.hpp',
          func: 'PerseveranceRover::fireLaser()',
          formula: 'IonizationPlasma(1064nm) -> EmissionSpectroscopy(Fe, Si, Mg)',
          explanation: 'Laser-Induced Breakdown Spectroscopy vaporizing target to analyze emission spectra.'
        });
      } else {
        simRef.current.laserTarget = { x: simRef.current.x + 180, y: simRef.current.y + 10 };
        setActiveMessage('Laser fired at Martian regolith. Background basaltic spectrum recorded.');
      }

      // Also generate MOXIE oxygen if Perseverance
      if (activeMachine.id === 'perseverance') {
        setOxygenGeneratedGrams(prev => +(prev + 0.5).toFixed(1));
      }
      return;
    }

    // Apollo LRV
    const nearbySample = targetsRef.current.find(
      t => !t.collected && Math.abs(t.x - simRef.current.x) < 70
    );
    if (nearbySample) {
      nearbySample.collected = true;
      sounds.playSampleAcquired();
      setScienceScore(prev => prev + 100);
      setCollectedSamples(prev => [...prev, nearbySample.name]);
      setActiveMessage(`Geology Scoop: Collected ${nearbySample.name}! Secured in Apollo sample container.`);
      setActiveCppSnippet({
        file: 'include/rover_physics.hpp',
        func: 'RoverTerramechanics::computeWheelSlip()',
        formula: 's = (r * omega - v) / max(r * omega, v)',
        explanation: 'Evaluates Apollo wire mesh tire traction and regolith excavation mechanics.'
      });
    } else {
      sounds.playTelemetryBeep(700, 0.05);
      setActiveMessage('Apollo LRV: Surface communications relayed through High-Gain S-Band antenna to Houston.');
    }
  }, [activeMachine]);

  // Main Canvas animation & physics loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const gravity = activeMachine.target === 'moon' ? 0.09 : 0.22; // Scaled for 60fps
    const isHelicopter = activeMachine.type === 'rotorcraft';

    const getTerrainHeightAt = (worldX: number) => {
      const terrain = terrainRef.current;
      if (!terrain.length) return 300;
      const index = Math.floor(worldX / 20);
      if (index < 0) return terrain[0];
      if (index >= terrain.length - 1) return terrain[terrain.length - 1];
      const remainder = (worldX % 20) / 20;
      return terrain[index] * (1 - remainder) + terrain[index + 1] * remainder;
    };

    const render = () => {
      if (!isRunning) {
        animId = requestAnimationFrame(render);
        return;
      }

      const sim = simRef.current;
      const width = canvas.width;
      const height = canvas.height;

      // Physics Integration Step
      if (isHelicopter) {
        // Helicopter Flight Physics
        // Ramp RPM
        if (sim.targetRpm > sim.rpm) sim.rpm = Math.min(sim.targetRpm, sim.rpm + 40);
        else if (sim.targetRpm < sim.rpm) sim.rpm = Math.max(sim.targetRpm, sim.rpm - 30);

        // Rotor Thrust based on RPM and pitch
        const thrust = (sim.rpm / 2500) * (gravity * 1.6);
        sim.vy += gravity; // Gravity pull

        if (sim.keys.up) {
          sim.vy -= thrust * 1.5;
        } else {
          sim.vy -= thrust;
        }

        if (sim.keys.left) {
          sim.vx -= 0.12;
          sim.angle = Math.max(-0.35, sim.angle - 0.04);
        } else if (sim.keys.right) {
          sim.vx += 0.12;
          sim.angle = Math.min(0.35, sim.angle + 0.04);
        } else {
          sim.angle *= 0.92; // Auto-level
        }

        // Aerodynamic drag in thin air
        sim.vx *= 0.98;
        sim.vy *= 0.98;

        sim.x += sim.vx;
        sim.y += sim.vy;

        // Ground collision
        const groundY = getTerrainHeightAt(sim.x) - 18;
        if (sim.y >= groundY) {
          sim.y = groundY;
          sim.vy = 0;
          sim.isAirborne = false;
        } else {
          sim.isAirborne = true;
        }
      } else {
        // Ground Rover Terramechanics
        const motorPower = activeMachine.id === 'apollo-lrv' ? 0.35 : 0.14;
        const groundY = getTerrainHeightAt(sim.x);
        const nextY = getTerrainHeightAt(sim.x + 15);
        const slope = Math.atan2(nextY - groundY, 15);

        // Rover gravity
        sim.vy += gravity;

        if (sim.keys.right) {
          const tractionBonus = sim.unStuckMode ? 1.4 : 1.0;
          sim.vx += motorPower * tractionBonus * Math.cos(slope);
          sim.wheelAngle += 0.18;
        } else if (sim.keys.left) {
          sim.vx -= motorPower * 0.8 * Math.cos(slope);
          sim.wheelAngle -= 0.18;
        }

        // Rolling resistance and regolith friction
        sim.vx *= 0.94;
        sim.x += sim.vx;
        sim.y += sim.vy;

        const surfaceY = groundY - 14;
        if (sim.y >= surfaceY) {
          sim.y = surfaceY;
          sim.vy = 0;
          sim.angle = slope * 0.85;
          sim.isAirborne = false;
        } else {
          sim.isAirborne = true;
          sim.angle += 0.01;
        }
      }

      // Clamp X position
      if (sim.x < 30) sim.x = 30;
      if (sim.x > 11000) sim.x = 11000;
      sim.distanceTraveled += Math.abs(sim.vx) * 0.03;

      // Laser duration decay
      if (sim.laserActive) {
        sim.laserTimer--;
        if (sim.laserTimer <= 0) sim.laserActive = false;
      }

      // CAMERA VIEWPORT: Camera follows machine smoothly with lookahead
      const cameraX = sim.x - width * 0.35;
      const cameraY = Math.max(0, sim.y - height * 0.65);

      ctx.save();
      ctx.clearRect(0, 0, width, height);

      // 1. SKY & CELESTIAL BACKGROUND
      if (activeMachine.target === 'moon') {
        // Deep space lunar sky with sharp stars and Earth
        ctx.fillStyle = '#05070D';
        ctx.fillRect(0, 0, width, height);

        // Stars
        ctx.fillStyle = '#FFFFFF';
        for (let i = 0; i < 70; i++) {
          const starX = (i * 137 + 50) % width;
          const starY = (i * 83 + 20) % (height * 0.6);
          const starR = (i % 3 === 0) ? 1.5 : 0.8;
          ctx.beginPath();
          ctx.arc(starX, starY, starR, 0, Math.PI * 2);
          ctx.fill();
        }

        // Distant Earth in black sky
        const earthX = 140 - cameraX * 0.03;
        const earthY = 70;
        const earthGrad = ctx.createRadialGradient(earthX - 4, earthY - 4, 3, earthX, earthY, 22);
        earthGrad.addColorStop(0, '#60A5FA');
        earthGrad.addColorStop(0.5, '#2563EB');
        earthGrad.addColorStop(0.9, '#1E3A8A');
        earthGrad.addColorStop(1, '#020617');
        ctx.fillStyle = earthGrad;
        ctx.beginPath();
        ctx.arc(earthX, earthY, 20, 0, Math.PI * 2);
        ctx.fill();
        // Earth glow
        ctx.strokeStyle = 'rgba(96, 165, 250, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();
      } else {
        // Martian butterscotch/salmon-pink atmosphere
        const marsSky = ctx.createLinearGradient(0, 0, 0, height);
        marsSky.addColorStop(0, '#5C281E');
        marsSky.addColorStop(0.4, '#8E3F27');
        marsSky.addColorStop(0.8, '#C46D4B');
        marsSky.addColorStop(1, '#9C472A');
        ctx.fillStyle = marsSky;
        ctx.fillRect(0, 0, width, height);

        // Distant crater rim mountains (Parallax layer)
        ctx.fillStyle = 'rgba(74, 30, 20, 0.6)';
        ctx.beginPath();
        ctx.moveTo(0, height);
        for (let x = 0; x <= width; x += 40) {
          const worldX = x + cameraX * 0.15;
          const mountainY = height * 0.45 + Math.sin(worldX * 0.002) * 55 + Math.cos(worldX * 0.006) * 20;
          ctx.lineTo(x, mountainY);
        }
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fill();
      }

      // Transform world for camera translation
      ctx.translate(-cameraX, -cameraY);

      // 2. TERRAIN SURFACE RENDERING
      const terrain = terrainRef.current;
      if (terrain.length > 1) {
        ctx.beginPath();
        ctx.moveTo(0, height + 1000);
        ctx.lineTo(0, terrain[0]);

        for (let i = 0; i < terrain.length; i++) {
          ctx.lineTo(i * 20, terrain[i]);
        }
        ctx.lineTo((terrain.length - 1) * 20, height + 1000);
        ctx.closePath();

        if (activeMachine.target === 'moon') {
          // Lunar grey regolith
          const lunarGrad = ctx.createLinearGradient(0, 150, 0, 600);
          lunarGrad.addColorStop(0, '#94A3B8');
          lunarGrad.addColorStop(0.1, '#64748B');
          lunarGrad.addColorStop(0.5, '#334155');
          lunarGrad.addColorStop(1, '#0F172A');
          ctx.fillStyle = lunarGrad;
          ctx.fill();

          // Regolith surface highlight
          ctx.strokeStyle = '#CBD5E1';
          ctx.lineWidth = 2;
          ctx.stroke();
        } else {
          // Martian rusty iron-oxide regolith
          const marsGrad = ctx.createLinearGradient(0, 150, 0, 600);
          marsGrad.addColorStop(0, '#E06D44');
          marsGrad.addColorStop(0.1, '#B94B25');
          marsGrad.addColorStop(0.5, '#7C2D12');
          marsGrad.addColorStop(1, '#431407');
          ctx.fillStyle = marsGrad;
          ctx.fill();

          ctx.strokeStyle = '#FDBA74';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      // 3. SAMPLE TARGETS & DEPOSITS
      targetsRef.current.forEach(target => {
        if (target.collected) {
          // Marked collected flag
          ctx.fillStyle = '#10B981';
          ctx.beginPath();
          ctx.arc(target.x, target.y - 12, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#6EE7B7';
          ctx.font = '10px JetBrains Mono';
          ctx.fillText('ANALYZED', target.x - 22, target.y - 20);
        } else {
          // Uncollected target marker
          const pulse = (Math.sin(Date.now() * 0.005) + 1) * 0.5;
          ctx.save();

          if (target.type === 'ice') {
            // Ice crystal cyan glow
            ctx.fillStyle = '#38BDF8';
            ctx.strokeStyle = `rgba(56, 189, 248, ${0.4 + pulse * 0.6})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(target.x, target.y - 4, 8 + pulse * 4, 0, Math.PI * 2);
            ctx.stroke();

            // Diamond crystal
            ctx.beginPath();
            ctx.moveTo(target.x, target.y - 12);
            ctx.lineTo(target.x + 6, target.y - 4);
            ctx.lineTo(target.x, target.y + 4);
            ctx.lineTo(target.x - 6, target.y - 4);
            ctx.closePath();
            ctx.fill();
          } else {
            // Rock target amber marker
            ctx.fillStyle = '#F59E0B';
            ctx.strokeStyle = `rgba(245, 158, 11, ${0.4 + pulse * 0.6})`;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(target.x, target.y - 6, 8, 0, Math.PI * 2);
            ctx.stroke();

            // Rock shape
            ctx.beginPath();
            ctx.arc(target.x, target.y - 6, 4, 0, Math.PI * 2);
            ctx.fill();
          }

          // Target label
          ctx.fillStyle = '#F1F5F9';
          ctx.font = '11px Plus Jakarta Sans';
          ctx.fillText(target.name, target.x - 30, target.y - 24);
          ctx.restore();
        }
      });

      // 4. ACTIVE MACHINE DRAWING
      ctx.save();
      ctx.translate(sim.x, sim.y);
      ctx.rotate(sim.angle);

      if (isHelicopter) {
        // DRAW INGENUITY HELICOPTER
        // Fuselage box (13.6 cm x 19.5 cm)
        ctx.fillStyle = '#E2E8F0';
        ctx.fillRect(-10, -6, 20, 12);
        ctx.strokeStyle = '#0F172A';
        ctx.lineWidth = 1;
        ctx.strokeRect(-10, -6, 20, 12);

        // Solar panel on top
        ctx.fillStyle = '#1E3A8A';
        ctx.fillRect(-8, -14, 16, 4);

        // Mast
        ctx.strokeStyle = '#94A3B8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -6);
        ctx.lineTo(0, -28);
        ctx.stroke();

        // 4 Carbon fiber landing legs
        ctx.strokeStyle = '#0F172A';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-8, 4);
        ctx.lineTo(-20, 16);
        ctx.moveTo(8, 4);
        ctx.lineTo(20, 16);
        ctx.stroke();

        // Dual counter-rotating blades
        const bladePhase = (Date.now() * 0.08 * (sim.rpm / 2000)) % (Math.PI * 2);
        const bladeWidth = Math.cos(bladePhase) * 36;
        const bladeWidth2 = Math.cos(bladePhase + Math.PI / 2) * 36;

        // Top rotor
        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-bladeWidth, -26);
        ctx.lineTo(bladeWidth, -26);
        ctx.stroke();

        // Bottom rotor
        ctx.beginPath();
        ctx.moveTo(-bladeWidth2, -20);
        ctx.lineTo(bladeWidth2, -20);
        ctx.stroke();
      } else {
        // DRAW ROVER
        const isViper = activeMachine.id === 'viper';
        const isApollo = activeMachine.id === 'apollo-lrv';

        if (isApollo) {
          // Apollo Lunar Roving Vehicle
          // Chassis frame
          ctx.fillStyle = '#E2E8F0';
          ctx.fillRect(-22, -8, 44, 8);
          // High-gain antenna dish
          ctx.strokeStyle = '#F59E0B';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(10, -22, 10, -0.8, 1.2);
          ctx.stroke();
          // Antenna mast
          ctx.beginPath();
          ctx.moveTo(10, -8);
          ctx.lineTo(10, -22);
          ctx.stroke();
          // Seats
          ctx.fillStyle = '#64748B';
          ctx.fillRect(-10, -16, 8, 8);
          ctx.fillRect(-2, -16, 8, 8);
        } else if (isViper) {
          // VIPER Rover with high mast, solar panel & headlights
          ctx.fillStyle = '#334155';
          ctx.fillRect(-20, -18, 40, 18);
          ctx.strokeStyle = '#06B6D4';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(-20, -18, 40, 18);

          // Mast
          ctx.strokeStyle = '#94A3B8';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(-10, -18);
          ctx.lineTo(-10, -36);
          ctx.stroke();
          // Sensor head
          ctx.fillStyle = '#06B6D4';
          ctx.fillRect(-13, -40, 8, 6);

          // Headlights beam
          if (sim.headlightsOn) {
            const beamGrad = ctx.createRadialGradient(20, -10, 2, 80, -10, 140);
            beamGrad.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
            beamGrad.addColorStop(0.5, 'rgba(6, 182, 212, 0.2)');
            beamGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = beamGrad;
            ctx.beginPath();
            ctx.moveTo(20, -14);
            ctx.lineTo(160, -40);
            ctx.lineTo(160, 25);
            ctx.closePath();
            ctx.fill();
          }

          // TRIDENT Drill on front
          ctx.strokeStyle = '#F59E0B';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(16, -2);
          ctx.lineTo(16, isDrilling ? 12 : 2);
          ctx.stroke();
        } else {
          // Curiosity / Perseverance (Mars 2020)
          // Heavy scientific body
          ctx.fillStyle = '#E2E8F0';
          ctx.fillRect(-26, -16, 52, 16);
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(-26, -16, 52, 16);

          // Remote Sensing Mast (SuperCam / ChemCam head)
          ctx.strokeStyle = '#94A3B8';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(12, -16);
          ctx.lineTo(14, -38);
          ctx.stroke();
          // Mast head (Laser aperture)
          ctx.fillStyle = '#1E293B';
          ctx.fillRect(8, -44, 12, 8);
          ctx.fillStyle = '#EF4444';
          ctx.beginPath();
          ctx.arc(17, -40, 2, 0, Math.PI * 2);
          ctx.fill();

          // MMRTG Nuclear Power Unit at rear
          ctx.fillStyle = '#334155';
          ctx.fillRect(-32, -18, 8, 12);
          // High Gain Antenna dish
          ctx.fillStyle = '#F8FAFC';
          ctx.beginPath();
          ctx.arc(-8, -24, 6, 0, Math.PI * 2);
          ctx.fill();

          // Robotic arm folded on front
          ctx.strokeStyle = '#64748B';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(24, -8);
          ctx.lineTo(32, -4);
          ctx.lineTo(30, 2);
          ctx.stroke();
        }

        // Rocker-Bogie Wheel System
        const drawWheel = (wx: number, wy: number) => {
          ctx.save();
          ctx.translate(wx, wy);
          ctx.rotate(sim.wheelAngle);
          ctx.fillStyle = '#1E293B';
          ctx.beginPath();
          ctx.arc(0, 0, 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#94A3B8';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          // Wheel treads
          ctx.beginPath();
          ctx.moveTo(-6, 0);
          ctx.lineTo(6, 0);
          ctx.moveTo(0, -6);
          ctx.lineTo(0, 6);
          ctx.stroke();
          ctx.restore();
        };

        drawWheel(-20, 2);
        drawWheel(0, 2);
        drawWheel(20, 2);
      }

      ctx.restore(); // Machine transform restore

      // 5. LASER BEAM EFFECT (SuperCam / ChemCam)
      if (sim.laserActive && sim.laserTarget) {
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.9)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(sim.x + 16, sim.y - 38);
        ctx.lineTo(sim.laserTarget.x, sim.laserTarget.y);
        ctx.stroke();

        // Laser plasma spark at target
        ctx.fillStyle = '#FEF08A';
        ctx.beginPath();
        ctx.arc(sim.laserTarget.x, sim.laserTarget.y, 6 + Math.random() * 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#F97316';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(sim.laserTarget.x, sim.laserTarget.y, 14, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore(); // World transform restore

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isRunning, activeMachine]);

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Top Status & Machine Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-mono">Mission:</span>
            <span className="text-sm font-semibold text-slate-100">{activeMachine.name}</span>
          </div>
          <span className="text-slate-600">·</span>
          <div className="text-xs text-slate-400">
            Target: <span className="text-cyan-400 font-mono uppercase">{activeMachine.target}</span>
          </div>
          <span className="text-slate-600">·</span>
          <div className="text-xs text-slate-400">
            Gravity: <span className="text-amber-400 font-mono">{activeMachine.target === 'moon' ? '1.62 m/s²' : '3.72 m/s²'}</span>
          </div>
        </div>

        {/* Machine Quick Switcher */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {NASA_MACHINES.filter(m => m.playable).map(machine => (
            <button
              key={machine.id}
              onClick={() => onSelectMachine(machine.id)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                machine.id === selectedMachineId
                  ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              {machine.callsign}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Viewport Canvas */}
      <div 
        ref={containerRef}
        className="relative w-full h-[440px] bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl"
      >
        <canvas
          ref={canvasRef}
          width={1000}
          height={440}
          className="w-full h-full block cursor-crosshair"
          onClick={executePrimaryAction}
        />

        {/* In-Game Telemetry HUD Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none bg-slate-950/80 backdrop-blur-md p-2.5 rounded-lg border border-slate-800/80 text-xs font-mono">
          <div className="flex items-center justify-between gap-4 text-slate-400">
            <span>VELOCITY</span>
            <span className="text-cyan-300 font-bold tabular-nums">
              {(Math.abs(simRef.current.vx) * 3.6).toFixed(1)} km/h
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 text-slate-400">
            <span>ODOMETRY</span>
            <span className="text-slate-200 tabular-nums">
              {simRef.current.distanceTraveled.toFixed(1)} m
            </span>
          </div>
          {activeMachine.type === 'rotorcraft' ? (
            <div className="flex items-center justify-between gap-4 text-slate-400">
              <span>ROTOR RPM</span>
              <span className="text-amber-400 font-bold tabular-nums">
                {Math.round(simRef.current.rpm)} / 2500
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4 text-slate-400">
              <span>WHEEL SLIP</span>
              <span className="text-emerald-400 tabular-nums">
                {(simRef.current.slipRatio * 100).toFixed(0)}%
              </span>
            </div>
          )}
          {activeMachine.id === 'perseverance' && (
            <div className="flex items-center justify-between gap-4 text-slate-400">
              <span>MOXIE O2 YIELD</span>
              <span className="text-cyan-400 font-bold tabular-nums">
                {oxygenGeneratedGrams} g
              </span>
            </div>
          )}
        </div>

        {/* Top Right Score & Audio Controls */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 border border-slate-800 rounded-lg text-xs font-mono text-cyan-300">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>SCIENCE:</span>
            <span className="font-bold text-white tabular-nums">{scienceScore} pts</span>
          </div>

          <button
            onClick={() => {
              const nextMuted = !isMuted;
              setIsMuted(nextMuted);
              sounds.setMuted(nextMuted);
            }}
            aria-label={isMuted ? "Unmute audio" : "Mute audio"}
            className="p-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          <button
            onClick={() => setIsRunning(!isRunning)}
            className="p-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 transition-colors"
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            onClick={initEnvironment}
            title="Reset Simulation"
            className="p-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Live Mission Status Notification Ticker */}
        <div className="absolute bottom-3 left-3 right-3 pointer-events-none flex items-center justify-between gap-4 px-3.5 py-2 bg-slate-950/85 backdrop-blur-md border border-slate-800/80 rounded-lg text-xs">
          <div className="flex items-center gap-2 text-slate-200">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
            <span className="font-mono text-slate-300">{activeMessage}</span>
          </div>

          <button
            onClick={() => setShowCppInspector(!showCppInspector)}
            className="pointer-events-auto flex items-center gap-1.5 px-2.5 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded text-xs font-mono transition-colors whitespace-nowrap"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>{showCppInspector ? 'Hide C++ Logic' : 'Inspect C++ Logic'}</span>
          </button>
        </div>

        {/* Drilling in Progress Modal Indicator */}
        {isDrilling && (
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 p-5 bg-slate-900 border border-cyan-500/40 rounded-xl shadow-2xl max-w-sm text-center">
              <Flame className="w-6 h-6 text-amber-400 animate-bounce" />
              <div className="text-sm font-semibold text-slate-100">TRIDENT Drill Penetrating Regolith...</div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-cyan-400 h-full transition-all duration-300" 
                  style={{ width: `${drillProgress}%` }}
                />
              </div>
              <div className="text-xs text-slate-400 font-mono">Depth: {(drillProgress * 0.01).toFixed(2)} / 1.00 m</div>
            </div>
          </div>
        )}
      </div>

      {/* C++ Logic Inspector Panel (Reveals the C++ function driving this action) */}
      {showCppInspector && (
        <div className="p-4 bg-slate-900/95 border border-cyan-500/30 rounded-xl text-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400 font-mono">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold">
              <Code2 className="w-4 h-4" />
              <span>C++ SOURCE CORRELATION: {activeCppSnippet.func}</span>
            </div>
            <button
              onClick={() => onOpenCppFile && onOpenCppFile(activeCppSnippet.file, activeCppSnippet.func)}
              className="text-xs text-cyan-400 underline hover:text-cyan-300"
            >
              Open {activeCppSnippet.file}
            </button>
          </div>
          <div className="p-2.5 bg-slate-950 rounded-lg font-mono text-cyan-200 border border-slate-800">
            {activeCppSnippet.formula}
          </div>
          <p className="text-slate-300 leading-relaxed">
            {activeCppSnippet.explanation}
          </p>
        </div>
      )}

      {/* Controls & Quick Action Dock */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Drive Instructions */}
        <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between">
          <div className="text-xs text-slate-400">
            <span className="font-semibold text-slate-200">Drive / Pitch:</span> Arrow Keys or [W][A][S][D]
          </div>
          <div className="flex gap-1">
            <span className="px-2 py-1 bg-slate-800 rounded text-[11px] font-mono text-slate-300">W</span>
            <span className="px-2 py-1 bg-slate-800 rounded text-[11px] font-mono text-slate-300">A</span>
            <span className="px-2 py-1 bg-slate-800 rounded text-[11px] font-mono text-slate-300">S</span>
            <span className="px-2 py-1 bg-slate-800 rounded text-[11px] font-mono text-slate-300">D</span>
          </div>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={executePrimaryAction}
          className="flex items-center justify-center gap-2 p-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-xl transition-colors shadow-lg shadow-cyan-500/10"
        >
          {activeMachine.type === 'rotorcraft' ? (
            <>
              <Wind className="w-4 h-4" />
              <span>Throttle Rotors (2400 RPM) [Space]</span>
            </>
          ) : activeMachine.id === 'viper' ? (
            <>
              <Crosshair className="w-4 h-4" />
              <span>Deploy TRIDENT Drill / Unstuck [Space]</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              <span>Fire Laser / Collect Sample [Space]</span>
            </>
          )}
        </button>

        {/* Collected Inventory Preview */}
        <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">COLLECTED SAMPLES:</span>
          <span className="font-semibold text-emerald-400">
            {collectedSamples.length} / 4
          </span>
        </div>
      </div>
    </div>
  );
};
