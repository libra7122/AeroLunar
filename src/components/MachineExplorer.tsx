import React, { useState } from 'react';
import { 
  Compass, Radio, Zap, Play, Code2, Award, Info, 
  ExternalLink, ChevronDown, ChevronUp, Sparkles, Filter
} from 'lucide-react';
import { NASA_MACHINES, NasaMachine } from '../data/nasaMachines';
import { sounds } from '../utils/audio';

interface MachineExplorerProps {
  onSelectAndPlay: (machineId: string) => void;
  onOpenCppFile: (filename: string, className?: string) => void;
}

export const MachineExplorer: React.FC<MachineExplorerProps> = ({
  onSelectAndPlay,
  onOpenCppFile
}) => {
  const [targetFilter, setTargetFilter] = useState<'all' | 'moon' | 'mars'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'rover' | 'rotorcraft' | 'lander' | 'orbiter'>('all');
  const [expandedMachineId, setExpandedMachineId] = useState<string | null>(NASA_MACHINES[0].id);

  const filteredMachines = NASA_MACHINES.filter(m => {
    if (targetFilter !== 'all' && m.target !== targetFilter) return false;
    if (typeFilter !== 'all' && m.type !== typeFilter) return false;
    return true;
  });

  const toggleExpand = (id: string) => {
    setExpandedMachineId(prev => (prev === id ? null : id));
    sounds.playTelemetryBeep(850, 0.04);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Filter and Overview Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex flex-col gap-1">
          <div className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400" />
            <span>NASA Deep Space Machine Registry</span>
          </div>
          <div className="text-xs text-slate-400">
            {filteredMachines.length} authenticated lunar & martian spacecraft cataloged from NASA archives.
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Target Body Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg">
            {(['all', 'moon', 'mars'] as const).map(target => (
              <button
                key={target}
                onClick={() => setTargetFilter(target)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors capitalize ${
                  targetFilter === target
                    ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {target === 'all' ? 'All Targets' : target}
              </button>
            ))}
          </div>

          {/* Machine Type Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg">
            {(['all', 'rover', 'rotorcraft', 'lander', 'orbiter'] as const).map(type => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors capitalize ${
                  typeFilter === type
                    ? 'bg-slate-800 text-cyan-300 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {type === 'all' ? 'All Types' : type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Machine Cards List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredMachines.map(machine => {
          const isExpanded = expandedMachineId === machine.id;

          return (
            <div 
              key={machine.id}
              className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden transition-all duration-200"
            >
              {/* Card Banner / Primary Summary Header */}
              <div 
                onClick={() => toggleExpand(machine.id)}
                className="flex flex-wrap items-center justify-between gap-4 p-4 cursor-pointer hover:bg-slate-850 transition-colors select-none"
              >
                <div className="flex items-center gap-4">
                  {/* Thumbnail or Badge */}
                  {machine.image ? (
                    <div className="w-16 h-12 rounded-lg overflow-hidden border border-slate-700 shrink-0 bg-slate-950">
                      <img 
                        src={machine.image} 
                        alt={machine.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-12 rounded-lg border border-slate-700 bg-slate-950 flex items-center justify-center text-cyan-400 font-mono text-xs shrink-0">
                      NASA
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-slate-100">
                        {machine.name}
                      </h3>
                      <span className="text-xs font-mono text-cyan-400">
                        ({machine.callsign})
                      </span>
                    </div>
                    {/* Unboxed metadata with typographic separators */}
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                      <span className="uppercase text-amber-300 font-mono">{machine.target}</span>
                      <span aria-hidden="true">·</span>
                      <span className="capitalize">{machine.type}</span>
                      <span aria-hidden="true">·</span>
                      <span>Launched {machine.launchYear}</span>
                      <span aria-hidden="true">·</span>
                      <span>Mass: {machine.massKg} kg</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {machine.playable && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectAndPlay(machine.id);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors shadow-sm"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Launch in Simulator</span>
                    </button>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenCppFile('include/nasa_machines.hpp', machine.cppClass);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono rounded-lg transition-colors border border-slate-700"
                    title="View C++ class implementation"
                  >
                    <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>C++ Class</span>
                  </button>

                  <div className="text-slate-400 p-1">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>
              </div>

              {/* Expanded Technical Details Drawer */}
              {isExpanded && (
                <div className="border-t border-slate-800 p-5 bg-slate-950/70 space-y-6">
                  {/* Hero Photo if available */}
                  {machine.image && (
                    <div className="relative w-full h-64 rounded-xl overflow-hidden border border-slate-800">
                      <img 
                        src={machine.image} 
                        alt={machine.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                      <div className="absolute bottom-3 left-3 text-xs text-slate-300 font-mono bg-slate-950/80 px-2.5 py-1 rounded border border-slate-800">
                        Landing Site: {machine.landingSite}
                      </div>
                    </div>
                  )}

                  {/* Specifications Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg">
                      <div className="text-[11px] uppercase tracking-wider text-slate-400 font-mono">
                        Power System
                      </div>
                      <div className="text-xs font-semibold text-slate-200 mt-1">
                        {machine.powerSystem}
                      </div>
                      <div className="text-xs font-mono text-cyan-400 mt-0.5">
                        {machine.powerWatts}
                      </div>
                    </div>

                    <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg">
                      <div className="text-[11px] uppercase tracking-wider text-slate-400 font-mono">
                        Physical Dimensions
                      </div>
                      <div className="text-xs font-semibold text-slate-200 mt-1">
                        {machine.dimensions}
                      </div>
                      <div className="text-xs font-mono text-slate-400 mt-0.5">
                        Dry/Landed Mass: {machine.massKg} kg
                      </div>
                    </div>

                    <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg">
                      <div className="text-[11px] uppercase tracking-wider text-slate-400 font-mono">
                        Operational Mobility
                      </div>
                      <div className="text-xs font-semibold text-slate-200 mt-1">
                        {machine.topSpeedOrCeiling}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Duration: {machine.missionDuration}
                      </div>
                    </div>
                  </div>

                  {/* Scientific Payload Instruments */}
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-slate-400 font-mono mb-2.5">
                      Scientific Payload & Instrument Suite ({machine.instruments.length} Instruments)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {machine.instruments.map((inst, i) => (
                        <div key={i} className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-mono font-bold text-cyan-400">{inst.code}</span>
                              {inst.specs && (
                                <span className="text-[10px] text-slate-500 font-mono">{inst.specs}</span>
                              )}
                            </div>
                            <div className="text-xs font-semibold text-slate-200 mt-0.5">
                              {inst.fullName}
                            </div>
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                              {inst.function}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Discoveries and Engineering Quirks */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Key Discoveries */}
                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                      <div className="text-xs uppercase tracking-wider text-emerald-400 font-mono font-semibold">
                        Major Scientific Discoveries
                      </div>
                      <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                        {machine.keyDiscoveries.map((disc, idx) => (
                          <li key={idx} className="leading-relaxed">{disc}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Historical Fact / Engineering Innovation */}
                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                      <div className="text-xs uppercase tracking-wider text-amber-400 font-mono font-semibold">
                        Historical Mission Story
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed italic">
                        "{machine.historicalFact}"
                      </p>
                      <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                        <strong className="text-slate-300 font-mono">Innovation: </strong>
                        {machine.engineeringInnovations[0]}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
