/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Gamepad2, Code2, Radio, Award, Sparkles, Rocket, 
  ExternalLink, Github, Terminal, ArrowRight, Compass,
  Volume2, VolumeX, ShieldCheck
} from 'lucide-react';
import { GameCanvas } from './components/GameCanvas';
import { CppCodeWorkbench } from './components/CppCodeWorkbench';
import { MachineExplorer } from './components/MachineExplorer';
import { EngineeringQuiz } from './components/EngineeringQuiz';
import { NASA_MACHINES } from './data/nasaMachines';
import { sounds } from './utils/audio';

type ActiveTab = 'simulator' | 'cpp-code' | 'machines' | 'quiz';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('simulator');
  const [selectedMachineId, setSelectedMachineId] = useState<string>('perseverance');
  const [cppTargetFile, setCppTargetFile] = useState<string>('include/rover_physics.hpp');
  const [cppTargetFunc, setCppTargetFunc] = useState<string | undefined>(undefined);

  const handleOpenCppFromGame = (filename: string, functionName?: string) => {
    setCppTargetFile(filename);
    setCppTargetFunc(functionName);
    setActiveTab('cpp-code');
    sounds.playTelemetryBeep(920, 0.05);
  };

  const handleSelectAndPlay = (machineId: string) => {
    setSelectedMachineId(machineId);
    setActiveTab('simulator');
    sounds.playTelemetryBeep(1020, 0.06);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* 1. TOP BAR CONTRACT (§2) */}
      <header className="flex items-center justify-between gap-8 px-6 lg:px-12 py-4 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        {/* Zone 1: Single Wordmark */}
        <a 
          href="/" 
          onClick={(e) => { e.preventDefault(); setActiveTab('simulator'); }}
          className="text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 flex items-center gap-2"
        >
          <span className="text-cyan-400 font-mono">/</span>
          <span>AeroLunar</span>
        </a>

        {/* Zone 2: 4 Single-Line Text Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <button
            onClick={() => { setActiveTab('simulator'); sounds.playTelemetryBeep(700, 0.03); }}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'simulator' ? 'text-cyan-400 font-semibold' : ''
            }`}
          >
            Mission Simulator
          </button>
          <button
            onClick={() => { setActiveTab('cpp-code'); sounds.playTelemetryBeep(750, 0.03); }}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'cpp-code' ? 'text-cyan-400 font-semibold' : ''
            }`}
          >
            C++ Physics Engine
          </button>
          <button
            onClick={() => { setActiveTab('machines'); sounds.playTelemetryBeep(800, 0.03); }}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'machines' ? 'text-cyan-400 font-semibold' : ''
            }`}
          >
            Spacecraft Archive
          </button>
          <button
            onClick={() => { setActiveTab('quiz'); sounds.playTelemetryBeep(850, 0.03); }}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'quiz' ? 'text-cyan-400 font-semibold' : ''
            }`}
          >
            Engineering Quiz
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              if (activeTab === 'simulator') {
                setActiveTab('cpp-code');
              } else {
                setActiveTab('simulator');
              }
              sounds.playTelemetryBeep(980, 0.05);
            }}
            className="px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm"
          >
            {activeTab === 'simulator' ? 'Inspect C++ Engine' : 'Launch Simulator'}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        {/* Editorial Hero Banner */}
        <section className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/60 p-6 md:p-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
            <div className="max-w-2xl space-y-3">
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                <span className="text-cyan-400">NASA EXPLORATION SYSTEMS</span>
                <span aria-hidden="true">·</span>
                <span>MOON & MARS IN SITU ROBOTICS</span>
                <span aria-hidden="true">·</span>
                <span>C++ SIMULATION</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight" style={{ textWrap: 'balance' }}>
                NASA Planetary Machines & C++ Physics Simulator
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
                Explore the engineering behind NASA’s robotic explorers—from Apollo's wire-mesh lunar buggy to Curiosity's laser-firing chemistry lab and Ingenuity's ultra-thin atmosphere Martian rotor dynamics.
              </p>
            </div>

            {/* Quick Stats Strip */}
            <div className="grid grid-cols-3 gap-3 w-full lg:w-auto shrink-0 font-mono">
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-center">
                <div className="text-xs text-slate-500 uppercase">Cataloged</div>
                <div className="text-xl font-bold text-cyan-400 mt-0.5">10</div>
                <div className="text-[11px] text-slate-400">Spacecraft</div>
              </div>
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-center">
                <div className="text-xs text-slate-500 uppercase">C++ Lines</div>
                <div className="text-xl font-bold text-emerald-400 mt-0.5">550+</div>
                <div className="text-[11px] text-slate-400">Production Code</div>
              </div>
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-center">
                <div className="text-xs text-slate-500 uppercase">Environments</div>
                <div className="text-xl font-bold text-amber-400 mt-0.5">2 Worlds</div>
                <div className="text-[11px] text-slate-400">Moon & Mars</div>
              </div>
            </div>
          </div>
        </section>

        {/* Segmented Workspace Navigation Tabs (Functional interactive buttons) */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl w-full sm:w-fit overflow-x-auto">
          <button
            onClick={() => { setActiveTab('simulator'); sounds.playTelemetryBeep(700, 0.03); }}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'simulator'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Interactive Simulator</span>
          </button>

          <button
            onClick={() => { setActiveTab('cpp-code'); sounds.playTelemetryBeep(750, 0.03); }}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'cpp-code'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>C++ Source Studio & Terminal</span>
          </button>

          <button
            onClick={() => { setActiveTab('machines'); sounds.playTelemetryBeep(800, 0.03); }}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'machines'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Spacecraft Registry ({NASA_MACHINES.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('quiz'); sounds.playTelemetryBeep(850, 0.03); }}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'quiz'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Engineering Assessment</span>
          </button>
        </div>

        {/* Tab View Container */}
        <section className="w-full">
          {activeTab === 'simulator' && (
            <GameCanvas
              selectedMachineId={selectedMachineId}
              onSelectMachine={setSelectedMachineId}
              onOpenCppFile={handleOpenCppFromGame}
            />
          )}

          {activeTab === 'cpp-code' && (
            <CppCodeWorkbench
              initialFilename={cppTargetFile}
              targetFunction={cppTargetFunc}
            />
          )}

          {activeTab === 'machines' && (
            <MachineExplorer
              onSelectAndPlay={handleSelectAndPlay}
              onOpenCppFile={(filename, className) => {
                setCppTargetFile(filename);
                setCppTargetFunc(className);
                setActiveTab('cpp-code');
                sounds.playTelemetryBeep(920, 0.05);
              }}
            />
          )}

          {activeTab === 'quiz' && (
            <EngineeringQuiz />
          )}
        </section>
      </main>

      {/* Clean Editorial Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 px-6 lg:px-12 py-8 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">AeroLunar Exploration Systems</span>
            <span aria-hidden="true">·</span>
            <span>Historical telemetry and payload data derived from NASA JPL archives</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Lunar 1.62 m/s²</span>
            <span aria-hidden="true">·</span>
            <span>Martian 3.72 m/s²</span>
            <span aria-hidden="true">·</span>
            <span>C++17 Simulator Standard</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
