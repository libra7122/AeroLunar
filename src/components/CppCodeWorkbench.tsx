import React, { useState, useEffect } from 'react';
import { 
  Code2, Play, Terminal, Download, Copy, Check, FileText, 
  Cpu, Layers, Sparkles, BookOpen, AlertCircle, ArrowRight
} from 'lucide-react';
import { CPP_SOURCE_FILES, CppSourceFile } from '../data/cppSourceFiles';
import { sounds } from '../utils/audio';

interface CppCodeWorkbenchProps {
  initialFilename?: string;
  targetFunction?: string;
}

export const CppCodeWorkbench: React.FC<CppCodeWorkbenchProps> = ({
  initialFilename,
  targetFunction
}) => {
  const [activeFile, setActiveFile] = useState<CppSourceFile>(
    CPP_SOURCE_FILES.find(f => f.filename === initialFilename) || CPP_SOURCE_FILES[0]
  );
  const [copied, setCopied] = useState<boolean>(false);
  const [terminalOpen, setTerminalOpen] = useState<boolean>(false);
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    '$ g++ --version',
    'g++ (Ubuntu 11.4.0) 11.4.0 target: x86_64-linux-gnu',
    '$ # Ready to compile NASA Planetary Simulation Engine. Click "Compile & Run".'
  ]);
  const [terminalInput, setTerminalInput] = useState<string>('');

  useEffect(() => {
    if (initialFilename) {
      const match = CPP_SOURCE_FILES.find(f => f.filename === initialFilename);
      if (match) setActiveFile(match);
    }
  }, [initialFilename]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    sounds.playTelemetryBeep(980, 0.05);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([activeFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFile.filename.split('/').pop() || 'nasa_sim.cpp';
    a.click();
    URL.revokeObjectURL(url);
    sounds.playTelemetryBeep(1100, 0.08);
  };

  const handleDownloadBundle = () => {
    const combined = CPP_SOURCE_FILES.map(f => `// ============================================================================\n// FILE: ${f.filename}\n// ============================================================================\n\n${f.content}\n\n`).join('\n');
    const blob = new Blob([combined], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nasa_planetary_simulation_cpp_bundle.txt';
    a.click();
    URL.revokeObjectURL(url);
    sounds.playTelemetryBeep(1200, 0.1);
  };

  const runVirtualCompiler = () => {
    setTerminalOpen(true);
    setIsCompiling(true);
    sounds.playTelemetryBeep(640, 0.08);

    const steps = [
      '$ g++ -std=c++17 -O3 -Wall -Wextra -Iinclude src/mission_sim_main.cpp -o nasa_sim',
      '[1/3] Parsing include/rover_physics.hpp (Bekker terramechanics, lunar/martian gravity)... OK',
      '[2/3] Compiling include/ingenuity_aerodynamics.hpp (coaxial BEMT rotor dynamics)... OK',
      '[3/3] Linking executable binary target: nasa_sim (size: 42.8 KB)... SUCCESS',
      '',
      '=========================================================',
      '       NASA MOON & MARS EXPLORATION SIMULATOR v2.4      ',
      '     Deep Space Telemetry & Autonomous Machine Engine    ',
      '=========================================================',
      '[INIT] Initializing Deep Space Network ground station uplink...',
      '[DSN] Signal propagation delay (Earth <-> Mars): 750.518 seconds (12.50 minutes)',
      '[AERODYNAMICS] Ingenuity Mars Helicopter rotor calibration:',
      '  Atmospheric density (Mars CO2): 0.020 kg/m^3',
      '  Calculated minimum hover RPM: 2420.5 RPM',
      '--- MISSION STEP 1 ---',
      '+--- PLANETARY SECTOR RADAR MAP (TAURUS-LITTROW / JEZERO) ---+',
      '| . . R . O . . . . . . . . * . . . . . . . # . . . . . . |',
      '| . . . . . . . . . . . . . . . . . . . . . . . . . . . . |',
      '+-----------------------------------------------------------+',
      '[TELEMETRY FRAME] 1ACFFC1D 0842 C001 0022 [PAYLOAD: POS_X=6.000000;STATUS=NOMINAL;MOXIE=ACTIVE] CRC: 8E3A',
      '',
      '[CONSOLE READY] Type "help", "laser", "drill", "aerodynamics", "telemetry", or "clear".'
    ];

    setTerminalLogs(['$ Compiling NASA Planetary Engine...']);

    let idx = 0;
    const interval = setInterval(() => {
      if (idx < steps.length) {
        const nextLine = steps[idx];
        setTerminalLogs(prev => [...prev, nextLine]);
        sounds.playTelemetryBeep(800 + (idx % 4) * 60, 0.03);
        idx++;
      } else {
        clearInterval(interval);
        setIsCompiling(false);
      }
    }, 90);
  };

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;

    const cmd = terminalInput.trim().toLowerCase();
    const prompt = `[nasa-sim]> ${terminalInput}`;
    let reply: string[] = [];

    if (cmd === 'help') {
      reply = [
        'Available Telecommands in NASA C++ Simulator:',
        '  laser        - Fires Perseverance SuperCam 1064nm laser pulse at rock',
        '  drill        - Deploys VIPER TRIDENT 1-meter percussion drill',
        '  aerodynamics - Runs Ingenuity coaxial blade thrust calculation',
        '  telemetry    - Serializes CCSDS telemetry frame with CRC-16',
        '  status       - Queries spacecraft subsystems and MMRTG/Solar power',
        '  clear        - Clears terminal output',
        '  help         - Displays this command reference'
      ];
    } else if (cmd === 'laser') {
      sounds.playLaserShot();
      reply = [
        '-> Executing: percy.fireLaser("Yogi-Delta Basaltic Silicate");',
        '[SUPERCAM-LIBS] 1064nm laser pulse delivered (10 Hz, 30 mJ).',
        '[PLASMA IONIZATION] Spark temperature reached 10,000 K.',
        '[ATOMIC EMISSION SPECTRUM]',
        '  Si (Silicon):    44.2 %',
        '  Fe (Iron Oxide): 19.8 %',
        '  Mg (Magnesium):  12.4 %',
        '  Ti (Titanium):    3.1 %',
        'Result logged to ScienceObservation cache.'
      ];
    } else if (cmd === 'drill') {
      sounds.playDrillHum();
      reply = [
        '-> Executing: viper.deployTridentDrill(0.85);',
        '[TRIDENT DRILL] Rotary percussion hammering initiated at 100 Hz.',
        '[PENETRATION DEPTH] 0.85 meters into cryogenic regolith.',
        '[MSOLO SPECTROMETER] Volatile gas release detected: Subsurface H2O Frost (88.4% Confidence).',
        'Sample preserved in cryogenic containment.'
      ];
    } else if (cmd === 'aerodynamics') {
      sounds.playRotorChop();
      reply = [
        '-> Executing: IngenuityAerodynamics::calculateRotorLift(2500, 8.5, 3.0);',
        '[ROTOR TELEMETRY]',
        '  Atmospheric Density rho: 0.0200 kg/m^3',
        '  Rotor Speed: 2500 RPM (Tip Mach: 0.65 - Subsonic Safe)',
        '  Calculated Coaxial Thrust: 7.24 N',
        '  Vehicle Weight (1.8kg * 3.72m/s^2): 6.70 N',
        '  Excess Vertical Thrust Margin: +0.54 N -> POSITIVE CLIMB RATE (+0.6 m/s)'
      ];
    } else if (cmd === 'telemetry') {
      sounds.playTelemetryBeep(1200, 0.06);
      reply = [
        '-> Executing: TelemetryCodec::serializePacket(0x042, 0xC002, "BATTERY=98%;LAT=18.38N;LON=77.58E");',
        '[CCSDS FRAME DSN TRANSMISSION]',
        'Sync ASM:  1ACFFC1D',
        'Header:    0842 C002 002B',
        'Payload:   [BATTERY=98%;LAT=18.38N;LON=77.58E]',
        'Checksum:  CRC-16-CCITT = 0x9F4C (VERIFIED OK)'
      ];
    } else if (cmd === 'status') {
      reply = [
        '[SPACECRAFT HEALTH DIAGNOSTICS]',
        '  Target System: Mars 2020 Perseverance + Ingenuity Scout',
        '  Power Plant: Plutonium-238 MMRTG (Continuous 110 W)',
        '  Internal Avionics Thermal Loop: 294.2 K (Nominal)',
        '  Autonomous Navigation: AutoNav coprocessor active',
        '  Mission Clock: Sol 1422, LST 14:32:09'
      ];
    } else if (cmd === 'clear') {
      setTerminalLogs([]);
      setTerminalInput('');
      return;
    } else {
      reply = [`Unknown command: "${cmd}". Type "help" for a list of commands.`];
    }

    setTerminalLogs(prev => [...prev, prompt, ...reply]);
    setTerminalInput('');
  };

  // Syntax highlighting renderer
  const renderHighlightedCode = (rawCode: string) => {
    const lines = rawCode.split('\n');

    return (
      <div className="font-mono text-xs leading-relaxed select-text">
        {lines.map((line, idx) => {
          const lineNum = idx + 1;
          const isTargetLine = targetFunction && line.includes(targetFunction.replace('()', ''));

          // Simple token highlight
          let formattedLine: React.ReactNode = line;

          if (line.trim().startsWith('//')) {
            formattedLine = <span className="text-slate-500 italic">{line}</span>;
          } else if (line.trim().startsWith('#')) {
            formattedLine = <span className="text-purple-400 font-semibold">{line}</span>;
          } else {
            // Highlight keywords
            const parts = line.split(/(\b(?:class|struct|public|private|protected|virtual|override|constexpr|static|double|int|uint16_t|size_t|void|return|const|new|delete|if|else|for|while|namespace|using|enum)\b|".*?"|<.*?>)/g);
            formattedLine = parts.map((part, pIdx) => {
              if (['class', 'struct', 'public', 'private', 'protected', 'virtual', 'override', 'constexpr', 'static', 'namespace', 'using', 'enum'].includes(part)) {
                return <span key={pIdx} className="text-rose-400 font-semibold">{part}</span>;
              }
              if (['double', 'int', 'uint16_t', 'size_t', 'void', 'const', 'bool'].includes(part)) {
                return <span key={pIdx} className="text-cyan-400 font-medium">{part}</span>;
              }
              if (['return', 'if', 'else', 'for', 'while'].includes(part)) {
                return <span key={pIdx} className="text-amber-400">{part}</span>;
              }
              if (part.startsWith('"') && part.endsWith('"')) {
                return <span key={pIdx} className="text-emerald-300">{part}</span>;
              }
              return part;
            });
          }

          return (
            <div 
              key={lineNum}
              className={`flex items-start hover:bg-slate-800/40 px-2 py-0.5 rounded transition-colors ${
                isTargetLine ? 'bg-cyan-950/60 border-l-2 border-cyan-400' : ''
              }`}
            >
              <span className="w-10 shrink-0 text-slate-600 select-none text-right pr-4 tabular-nums text-[11px]">
                {lineNum}
              </span>
              <span className="flex-1 whitespace-pre overflow-x-auto text-slate-200">
                {formattedLine}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* C++ Studio Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-cyan-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-100">NASA C++ Simulation Engine & Physics Core</span>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 rounded">
                C++17 Standards Compliant
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Production-grade aerospace algorithms: terramechanics, BEMT aerodynamics, and CCSDS space telemetry.
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={runVirtualCompiler}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors shadow-lg shadow-emerald-500/10"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Compile & Run C++ Engine</span>
          </button>

          <button
            onClick={handleDownloadBundle}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors"
            title="Download all C++ source files and headers"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download All (.bundle)</span>
          </button>
        </div>
      </div>

      {/* Main Workbench Grid: Code File Tabs & Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left Column: File Tree & Methods */}
        <div className="lg:col-span-1 flex flex-col gap-3">
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
            <div className="text-xs uppercase tracking-wider text-slate-400 font-mono mb-2">
              Source Tree
            </div>
            <div className="flex flex-col gap-1">
              {CPP_SOURCE_FILES.map(file => {
                const isActive = file.filename === activeFile.filename;
                return (
                  <button
                    key={file.filename}
                    onClick={() => {
                      setActiveFile(file);
                      sounds.playTelemetryBeep(720, 0.04);
                    }}
                    className={`flex items-center justify-between p-2 rounded-lg text-xs font-mono transition-colors text-left ${
                      isActive 
                        ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                      <span className="truncate">{file.filename}</span>
                    </div>
                    <span className="text-[10px] text-slate-600 font-mono">
                      {file.linesOfCode}L
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Key Algorithms in Selected File */}
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
            <div className="text-xs uppercase tracking-wider text-slate-400 font-mono mb-2">
              Key Algorithms
            </div>
            <div className="flex flex-col gap-2">
              {activeFile.highlightedFunctions.map((func, i) => (
                <div key={i} className="p-2 bg-slate-950/60 rounded-lg border border-slate-800/80 text-xs">
                  <div className="font-mono text-cyan-400 font-medium">
                    {func.name}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                    {func.purpose}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Aerospace Coding Note */}
          <div className="p-3 bg-slate-900/40 border border-slate-800/60 rounded-xl text-xs space-y-2">
            <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
              <BookOpen className="w-3.5 h-3.5" />
              <span>NASA Flight Software Rule</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              NASA JPL’s <em>"Ten Rules for Developing Safety-Critical Code"</em> mandates zero dynamic heap allocation (<code className="text-cyan-300 font-mono">malloc/new</code>) after flight initialization to prevent memory fragmentation during missions.
            </p>
          </div>
        </div>

        {/* Right Column: Code Viewer & Terminal Drawer */}
        <div className="lg:col-span-3 flex flex-col gap-3">
          {/* File Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-t-xl text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 font-semibold">{activeFile.filename}</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400">{activeFile.linesOfCode} lines</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>

              <button
                onClick={handleDownloadFile}
                className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
              >
                <Download className="w-3 h-3" />
                <span>Save File</span>
              </button>

              <button
                onClick={() => setTerminalOpen(!terminalOpen)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
                  terminalOpen ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-800 text-slate-300'
                }`}
              >
                <Terminal className="w-3 h-3" />
                <span>Terminal</span>
              </button>
            </div>
          </div>

          {/* Code Viewer Container */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-b-xl overflow-x-auto max-h-[500px] overflow-y-auto shadow-inner">
            {renderHighlightedCode(activeFile.content)}
          </div>

          {/* Virtual Interactive C++ Terminal Console */}
          {terminalOpen && (
            <div className="flex flex-col bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl font-mono text-xs">
              <div className="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-slate-300 font-semibold">Virtual C++ Simulator Terminal (x86_64 GCC Engine)</span>
                  {isCompiling && (
                    <span className="text-amber-400 text-[11px] animate-pulse">Compiling...</span>
                  )}
                </div>
                <button
                  onClick={() => setTerminalLogs([])}
                  className="text-[11px] text-slate-500 hover:text-slate-300"
                >
                  Clear Logs
                </button>
              </div>

              {/* Logs Screen */}
              <div className="p-3 max-h-56 overflow-y-auto space-y-1 text-slate-300 bg-slate-950/90 selection:bg-cyan-500/30">
                {terminalLogs.map((log, i) => (
                  <div 
                    key={i} 
                    className={`${
                      log.startsWith('$') ? 'text-cyan-400 font-semibold' :
                      log.includes('SUCCESS') || log.includes('OK') ? 'text-emerald-400' :
                      log.startsWith('Legend') || log.startsWith('+--') ? 'text-amber-300' :
                      log.startsWith('[') ? 'text-slate-300' : 'text-slate-400'
                    }`}
                  >
                    {log}
                  </div>
                ))}
              </div>

              {/* Terminal Input Box */}
              <form onSubmit={handleCommandSubmit} className="flex items-center gap-2 p-2 bg-slate-900 border-t border-slate-800">
                <span className="text-cyan-400 font-bold pl-2 select-none">&gt;</span>
                <input
                  type="text"
                  value={terminalInput}
                  onChange={e => setTerminalInput(e.target.value)}
                  placeholder="Enter telecommand (e.g., 'help', 'laser', 'drill', 'aerodynamics', 'telemetry', 'status')..."
                  className="flex-1 bg-transparent text-slate-100 placeholder-slate-500 text-xs focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs rounded transition-colors"
                >
                  Send Telecommand
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
