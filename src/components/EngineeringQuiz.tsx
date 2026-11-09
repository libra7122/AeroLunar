import React, { useState } from 'react';
import { 
  Award, CheckCircle2, XCircle, RotateCcw, ArrowRight, 
  HelpCircle, Sparkles, BookOpen, ChevronRight
} from 'lucide-react';
import { sounds } from '../utils/audio';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  sourceFact: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "Why did the Apollo 17 astronauts have to fashion a makeshift fender out of lunar geology maps and duct tape?",
    options: [
      "To prevent solar radiation glare from blinding the camera",
      "To stop abrasive lunar dust kicked up by wire mesh wheels from overheating the battery radiators",
      "To balance the rover's aerodynamic profile against lunar gusts",
      "To shield the astronauts from falling micrometeorites"
    ],
    correctIndex: 1,
    explanation: "Gene Cernan accidentally snapped the rear fender with a hammer. Without atmosphere, wheels kicked high rooster tails of fine, highly abrasive regolith directly onto the batteries, causing critical heat build-up until the crew taped four geology maps together with duct tape and clamps.",
    sourceFact: "Apollo 17 Mission Archive (December 1972)"
  },
  {
    id: 2,
    question: "Why does the Ingenuity Mars Helicopter require its counter-rotating blades to spin at over 2,400 RPM?",
    options: [
      "Martian gravity is four times stronger than Earth's",
      "Martian atmospheric density is only ~1% of Earth's (equivalent to 100,000 ft altitude on Earth)",
      "High RPM is needed to resist Mars' supersonic planetary winds",
      "The rotors must generate magnetic shielding against solar wind"
    ],
    correctIndex: 1,
    explanation: "At the Martian surface, atmospheric density is only ~0.020 kg/m³ compared to Earth's 1.225 kg/m³. To generate enough lift (6.7 N) to overcome the helicopter's 1.8 kg weight in 3.72 m/s² gravity, oversized carbon fiber blades must spin at 2,400–2,700 RPM.",
    sourceFact: "NASA JPL Ingenuity Aerodynamics Team"
  },
  {
    id: 3,
    question: "What geologic feature discovered by Opportunity at Meridiani Planum proved ancient liquid water once soaked Mars?",
    options: [
      "Subsurface liquid geysers erupting near craters",
      "Small hematite spherules nicknamed 'blueberries' formed in groundwater",
      "Granite riverbeds with fossilized algae filaments",
      "Pure liquid nitrogen ponds beneath sand dunes"
    ],
    correctIndex: 1,
    explanation: "Opportunity discovered gray hematite mineral concretions nicknamed 'blueberries' embedded in rock matrix. These spherules grow slowly inside porous rocks soaked in mineral-rich acidic water.",
    sourceFact: "NASA Mars Exploration Rover Opportunity (2004)"
  },
  {
    id: 4,
    question: "Why do Curiosity and Perseverance use Plutonium-238 MMRTG nuclear generators instead of solar panels?",
    options: [
      "Nuclear generators weigh less than 5 kilograms",
      "Continuous electrical and thermal power survives planet-wide dust storms and freezing Martian winters (-90°C)",
      "Solar panels are prohibited under the Outer Space Treaty",
      "Mars has zero sunlight at all times of the year"
    ],
    correctIndex: 1,
    explanation: "Spirit and Opportunity were crippled by dust accumulation on solar arrays during Martian dust storms. The MMRTG uses radioactive decay of Plutonium-238 to continuously produce 110W of electricity plus vital waste heat to keep sensitive computers warm.",
    sourceFact: "NASA Mars Science Laboratory Power Architecture"
  },
  {
    id: 5,
    question: "Which technology demonstration on Perseverance successfully extracted pure oxygen directly from the Martian atmosphere?",
    options: [
      "RIMFAX Ground Radar",
      "PIXL X-Ray Spectrometer",
      "MOXIE (Mars Oxygen ISRU Experiment)",
      "SHERLOC UV Raman System"
    ],
    correctIndex: 2,
    explanation: "MOXIE heated Martian carbon dioxide to 800°C and used Solid Oxide Electrolysis to separate CO2 into carbon monoxide (CO) and pure breathable oxygen (O2), generating 122 grams of oxygen across 16 tests.",
    sourceFact: "MIT / NASA JPL MOXIE Experiment (2021–2023)"
  },
  {
    id: 6,
    question: "How does the VIPER lunar polar rover escape from becoming bogged down in deep, fluffy regolith?",
    options: [
      "Deploying hydrazine rocket thrusters",
      "Active four-wheel independent suspension that can lift wheels and 'swim' or inchworm",
      "Deploying an inflatable emergency balloon",
      "Jettisoning its scientific drill payload"
    ],
    correctIndex: 1,
    explanation: "VIPER’s mobility system can steer all four wheels independently and lift wheels individually to perform an inchworm-like 'wheel-walking' motion to climb out of steep, soft lunar dust slopes.",
    sourceFact: "NASA VIPER Terramechanics Mobility Team"
  },
  {
    id: 7,
    question: "What historic milestone did the Viking 1 lander achieve on July 20, 1976?",
    options: [
      "First successful human landing on the Moon",
      "First successful long-duration soft landing and operation on Mars, sending the first surface photo 25 seconds after touchdown",
      "First rover to drive 40 kilometers on Mars",
      "First spacecraft to return Martian soil back to Earth"
    ],
    correctIndex: 1,
    explanation: "Viking 1 safely touched down on Chryse Planitia on July 20, 1976, and operated for over 6 years, establishing humanity's first permanent scientific presence on the surface of Mars.",
    sourceFact: "NASA Viking Project History"
  },
  {
    id: 8,
    question: "Why was the Rocker-Bogie suspension invented for Sojourner and used on all subsequent NASA rovers?",
    options: [
      "It eliminates the need for springs while allowing wheels to climb obstacles larger than the wheel diameter with all wheels touching the ground",
      "It allows the rover to reach highway speeds above 60 km/h",
      "It prevents wheel motors from consuming electrical current",
      "It doubles as a radio communications antenna"
    ],
    correctIndex: 0,
    explanation: "The rocker-bogie mechanism uses a differential pivot without springs. When one wheel climbs a boulder up to twice its diameter, the chassis tilts only half as much, keeping ground contact load distributed evenly to avoid tip-overs.",
    sourceFact: "NASA JPL Mobility Mechanisms"
  }
];

export const EngineeringQuiz: React.FC = () => {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState<number>(0);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const currentQ = QUIZ_QUESTIONS[currentIdx];

  const handleSelectOption = (idx: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(idx);
    setShowExplanation(true);

    if (idx === currentQ.correctIndex) {
      setScore(prev => prev + 1);
      sounds.playSampleAcquired();
    } else {
      sounds.playTelemetryBeep(320, 0.15);
    }
  };

  const handleNext = () => {
    if (currentIdx < QUIZ_QUESTIONS.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      sounds.playTelemetryBeep(750, 0.04);
    } else {
      setIsFinished(true);
      sounds.playSampleAcquired();
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowExplanation(false);
    setIsFinished(false);
    sounds.playTelemetryBeep(880, 0.05);
  };

  const getScoreBadge = () => {
    const pct = (score / QUIZ_QUESTIONS.length) * 100;
    if (pct >= 85) return { title: 'NASA Chief Mission Specialist', color: 'text-amber-400', desc: 'Outstanding technical mastery of lunar and martian exploration systems!' };
    if (pct >= 60) return { title: 'Aerospace Flight Controller', color: 'text-cyan-400', desc: 'Solid grasp of NASA machine architectures and deep space engineering.' };
    return { title: 'Planetary Systems Cadet', color: 'text-slate-300', desc: 'Good start! Review the machine field guide and try the simulation again.' };
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100">
              NASA Aerospace Engineering & History Assessment
            </h3>
            <p className="text-xs text-slate-400">
              Test your knowledge of the robotics, terramechanics, and scientific missions sent to the Moon and Mars.
            </p>
          </div>
        </div>

        <div className="text-xs font-mono text-cyan-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
          Question {currentIdx + 1} of {QUIZ_QUESTIONS.length}
        </div>
      </div>

      {!isFinished ? (
        <div className="flex flex-col gap-5 p-6 bg-slate-900 border border-slate-800 rounded-xl">
          {/* Question Text */}
          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-wider font-mono text-cyan-400">
              Engineering Challenge #{currentQ.id}
            </span>
            <h4 className="text-base font-semibold text-slate-100 leading-snug">
              {currentQ.question}
            </h4>
          </div>

          {/* Answer Options */}
          <div className="flex flex-col gap-2.5">
            {currentQ.options.map((option, idx) => {
              const isSelected = selectedAnswer === idx;
              const isCorrect = idx === currentQ.correctIndex;

              let btnStyle = 'bg-slate-950 border-slate-800 text-slate-200 hover:bg-slate-850 hover:border-slate-700';

              if (selectedAnswer !== null) {
                if (isCorrect) {
                  btnStyle = 'bg-emerald-950/60 border-emerald-500/60 text-emerald-200';
                } else if (isSelected) {
                  btnStyle = 'bg-rose-950/60 border-rose-500/60 text-rose-200';
                } else {
                  btnStyle = 'bg-slate-950/40 border-slate-900 text-slate-500 opacity-60';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={selectedAnswer !== null}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border text-left text-xs transition-all ${btnStyle}`}
                >
                  <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center shrink-0 text-[11px] font-mono mt-0.5">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="flex-1 leading-relaxed">{option}</span>
                  {selectedAnswer !== null && isCorrect && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  )}
                  {selectedAnswer !== null && isSelected && !isCorrect && (
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Drawer */}
          {showExplanation && (
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                  Technical Explanation
                </span>
                <span className="font-mono text-[11px] text-slate-500">{currentQ.sourceFact}</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {currentQ.explanation}
              </p>
            </div>
          )}

          {/* Next Button */}
          {selectedAnswer !== null && (
            <div className="flex justify-end pt-2">
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs rounded-xl transition-colors shadow-sm"
              >
                <span>{currentIdx < QUIZ_QUESTIONS.length - 1 ? 'Next Question' : 'Complete Assessment'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Final Score and Certification Card */
        <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs uppercase tracking-wider font-mono text-cyan-400">
              Assessment Complete
            </span>
            <h3 className={`text-xl font-bold mt-1 ${getScoreBadge().color}`}>
              {getScoreBadge().title}
            </h3>
            <p className="text-xs text-slate-400 max-w-md mt-1 leading-relaxed">
              {getScoreBadge().desc}
            </p>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs w-full max-w-xs space-y-1">
            <div className="flex justify-between text-slate-400">
              <span>FINAL SCORE:</span>
              <span className="font-bold text-white tabular-nums">{score} / {QUIZ_QUESTIONS.length}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>ACCURACY:</span>
              <span className="font-bold text-cyan-400 tabular-nums">
                {((score / QUIZ_QUESTIONS.length) * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          <button
            onClick={handleRestart}
            className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs rounded-xl transition-colors shadow-lg shadow-cyan-500/10 mt-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Assessment</span>
          </button>
        </div>
      )}
    </div>
  );
};
