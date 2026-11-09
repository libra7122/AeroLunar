export interface Instrument {
  code: string;
  fullName: string;
  function: string;
  specs?: string;
}

export interface NasaMachine {
  id: string;
  name: string;
  callsign: string;
  target: 'moon' | 'mars';
  type: 'rover' | 'rotorcraft' | 'lander' | 'orbiter';
  launchYear: number;
  missionDuration: string;
  landingSite: string;
  massKg: number;
  dimensions: string;
  powerSystem: string;
  powerWatts: string;
  topSpeedOrCeiling: string;
  instruments: Instrument[];
  keyDiscoveries: string[];
  engineeringInnovations: string[];
  historicalFact: string;
  playable: boolean;
  cppClass: string;
  image?: string;
}

export const NASA_MACHINES: NasaMachine[] = [
  {
    id: 'apollo-lrv',
    name: 'Apollo Lunar Roving Vehicle (LRV)',
    callsign: 'Moon Buggy',
    target: 'moon',
    type: 'rover',
    launchYear: 1971,
    missionDuration: 'Apollo 15, 16, 17 (1971–1972)',
    landingSite: 'Hadley Rille, Descartes Highlands, Taurus-Littrow',
    massKg: 210,
    dimensions: '3.0 m × 2.3 m × 1.1 m',
    powerSystem: 'Two 36V non-rechargeable Silver-Zinc KOH batteries (121 Ah each)',
    powerWatts: '4x 0.25 hp (190 W) DC drive motors (1 per wheel)',
    topSpeedOrCeiling: '18.0 km/h (Eugene Cernan record, Apollo 17)',
    instruments: [
      {
        code: 'LCRU',
        fullName: 'Lunar Communications Relay Unit',
        function: 'Direct-to-Earth TV camera and telemetry transmitter with High-Gain dish antenna',
        specs: 'Unified S-band & VHF transceiver'
      },
      {
        code: 'GCTA',
        fullName: 'Ground-Controlled Television Assembly',
        function: 'Remote-controlled color television camera operated from Mission Control in Houston',
        specs: 'Monitored lunar liftoffs and geological traverses'
      },
      {
        code: 'LDP',
        fullName: 'Lunar Drilling Package',
        function: 'Battery-powered rotary percussion drill to acquire 3-meter core samples',
        specs: 'Drilled deep into regolith to measure subsurface thermal flow'
      },
      {
        code: 'ALSEP Support',
        fullName: 'Apollo Lunar Surface Experiments Package Logistics',
        function: 'Transported laser retroreflectors, gravimeters, and seismometers',
        specs: 'Extended astronaut traverse radius from 1 km to over 7.6 km'
      }
    ],
    keyDiscoveries: [
      'Allowed collection of the famous "Genesis Rock" (anorthosite sample 15415, 4.1 billion years old)',
      'Traversed 35.7 km across Apollo 17 without mechanical failure',
      'Discovered orange volcanic glass beads at Shorty Crater indicating ancient lunar pyroclastic eruptions'
    ],
    engineeringInnovations: [
      'Woven zinc-coated steel wire mesh tires with titanium chevron treads for soft regolith traction',
      'Harmonic drive 80:1 gear reduction integrated into each individual wheel hub',
      'Foldable origami chassis designed to pack into a 1.5 m³ triangular quadrant of the Lunar Module descent stage'
    ],
    historicalFact: 'During Apollo 17, Gene Cernan broke the right-rear fender with a hammer. Lunar dust threatened to overheat the batteries until the crew taped four taped lunar geology maps together with duct tape and clamps to craft a replacement fender.',
    playable: true,
    cppClass: 'ApolloLunarRover',
    image: '/src/assets/images/apollo_lunar_rover_moon_1794219864296.jpg'
  },
  {
    id: 'viper',
    name: 'VIPER Lunar Polar Rover',
    callsign: 'Volatiles Scout',
    target: 'moon',
    type: 'rover',
    launchYear: 2025,
    missionDuration: '100 Earth days (designed for polar lunar shadows)',
    landingSite: 'Mons Mouton / Nobile Crater (Lunar South Pole)',
    massKg: 450,
    dimensions: '1.5 m × 1.5 m × 2.5 m',
    powerSystem: 'Solar array + high-density lithium-ion battery (survives 2-week cryogenic darkness)',
    powerWatts: '450 W peak solar generation',
    topSpeedOrCeiling: '0.72 km/h (0.2 m/s)',
    instruments: [
      {
        code: 'TRIDENT',
        fullName: 'The Regolith and Ice Drill for Exploring New Terrains',
        function: '1-meter percussion rotary drill delivering deep icy regolith to the surface',
        specs: 'Hammer-drill action at 100 Hz'
      },
      {
        code: 'MSolo',
        fullName: 'Mass Spectrometer Observing Lunar Operations',
        function: 'Detects volatile gases and water vapor sublimating from drilled cuttings',
        specs: 'Quadrupole mass analyzer'
      },
      {
        code: 'NIRVSS',
        fullName: 'Near-Infrared Volatiles Spectrometer System',
        function: 'Measures surface hydration, ice crystallization state, and mineralogy',
        specs: 'Spectroscopy from 1.2 to 4.0 µm'
      },
      {
        code: 'NSS',
        fullName: 'Neutron Spectrometer System',
        function: 'Maps hydrogen concentration up to 1 meter underground while driving',
        specs: 'Dual-detector helium-3 proportional counters'
      }
    ],
    keyDiscoveries: [
      'Ground-truth characterization of permanently shadowed region (PSR) water ice distribution',
      'Mapping volatile abundance to inform NASA Artemis crewed base camp life-support resource extraction'
    ],
    engineeringInnovations: [
      'Active four-wheel independent steering and suspension capable of "swimming" or inchworming out of deep fluffy soil',
      'High-power LED headlights designed specifically for extreme shadow illumination in vacuum craters'
    ],
    historicalFact: 'The temperature inside Moon South Pole craters drops to -248 °C (-415 °F)—colder than the surface of Pluto! VIPER carries internal radiators and heater loops to survive.',
    playable: true,
    cppClass: 'ViperPolarRover',
    image: '/src/assets/images/nasa_viper_polar_rover_1794219863700.jpg'
  },
  {
    id: 'perseverance',
    name: 'Perseverance Rover (Mars 2020)',
    callsign: 'Percy',
    target: 'mars',
    type: 'rover',
    launchYear: 2020,
    missionDuration: '2021–Present (Over 1,400 Sols)',
    landingSite: 'Jezero Crater (Ancient river delta)',
    massKg: 1025,
    dimensions: '3.0 m × 2.7 m × 2.2 m',
    powerSystem: 'Multi-Mission Radioisotope Thermoelectric Generator (MMRTG, 4.8 kg Plutonium-238)',
    powerWatts: '110 W electrical at landing; continuous thermal output warms electronics in -90°C cold',
    topSpeedOrCeiling: '0.14 km/h (152 m/h autonomous AutoNav drive)',
    instruments: [
      {
        code: 'SuperCam',
        fullName: 'Laser Induced Breakdown Spectrometer & Microphone',
        function: 'Fires infrared laser to vaporize rock targets up to 7 m away; records acoustic shockwaves and wind',
        specs: '1064 nm Nd:YAG pulsed laser at 10 Hz'
      },
      {
        code: 'MOXIE',
        fullName: 'Mars Oxygen In-Situ Resource Utilization Experiment',
        function: 'Extracts breathable O2 from Martian atmospheric CO2 via Solid Oxide Electrolysis at 800°C',
        specs: 'Produced 122 grams of oxygen across 16 tests'
      },
      {
        code: 'PIXL',
        fullName: 'Planetary Instrument for X-ray Lithochemistry',
        function: 'Micro-focus X-ray fluorescence spectrometer to identify chemical elements at salt-grain scale',
        specs: '0.12 mm resolution beam'
      },
      {
        code: 'SHERLOC',
        fullName: 'Scanning Habitable Environments with Raman & Luminescence for Organics',
        function: 'Deep UV laser Raman spectroscopy searching for organic molecules and bio-signatures',
        specs: '248.6 nm pulsed laser with WATSON camera'
      },
      {
        code: 'RIMFAX',
        fullName: 'Radar Imager for Mars Subsurface Experiment',
        function: 'Ground-penetrating radar detecting underground rock strata down to 10+ meters',
        specs: '150–1200 MHz ultra-wideband GPR'
      }
    ],
    keyDiscoveries: [
      'Confirmed Jezero Crater was once filled with a deep lake fed by an energetic river delta',
      'Drilled and sealed over 24 airtight titanium sample tubes for the future Mars Sample Return mission',
      'Successfully extracted pure oxygen from Martian carbon dioxide using MOXIE'
    ],
    engineeringInnovations: [
      'Terrain-Relative Navigation (TRN) during Sky Crane descent to avoid hazardous dunes',
      'AutoNav autonomous driving coprocessor enabling real-time hazard avoidance without waiting for Earth comms'
    ],
    historicalFact: 'Perseverance carries a piece of Martian meteorite that was blasted off Mars millions of years ago, landed in Oman on Earth, and was returned to Mars on the rover as a calibration target for SHERLOC!',
    playable: true,
    cppClass: 'PerseveranceRover',
    image: '/src/assets/images/martian_perseverance_ingenuity_1794219863965.jpg'
  },
  {
    id: 'ingenuity',
    name: 'Ingenuity Mars Helicopter',
    callsign: 'Ginny',
    target: 'mars',
    type: 'rotorcraft',
    launchYear: 2020,
    missionDuration: '2021–2024 (72 flights, designed for only 5)',
    landingSite: 'Octavia E. Butler Landing, Jezero Crater',
    massKg: 1.8,
    dimensions: '0.49 m height, 1.2 m dual rotor diameter',
    powerSystem: 'Solar panel charging 6 Sony lithium-ion cells (35-43 Wh)',
    powerWatts: '350 W peak rotor motor draw during flight',
    topSpeedOrCeiling: 'Max ground speed: 10 m/s (36 km/h); Max altitude: 24 meters',
    instruments: [
      {
        code: 'NavCam',
        fullName: 'Downward Autonomous Navigation Camera',
        function: '0.5 MP grayscale camera tracking surface contrast features at 30 fps for optical flow positioning',
        specs: 'Visual odometry without GPS'
      },
      {
        code: 'RTE',
        fullName: 'Return-to-Earth Color Reconnaissance Camera',
        function: '13 MP high-resolution forward horizon camera scouting terrain obstacles for Perseverance',
        specs: 'Sony IMX214 sensor'
      },
      {
        code: 'IMU & Altimeter',
        fullName: 'Inertial Measurement Unit & Lidar Rangefinder',
        function: 'Dual cell-phone grade MEMS sensors paired with Garmin lidar for precise ground height tracking',
        specs: '500 Hz flight control loop'
      }
    ],
    keyDiscoveries: [
      'First powered, controlled aerodynamic flight on another celestial body in human history',
      'Accumulated over 128 minutes in Martian air and covered 17.0 km across 72 historic flights',
      'Demonstrated aerial scouting saves rovers days of hazardous detour through sand ripples'
    ],
    engineeringInnovations: [
      'Dual counter-rotating carbon fiber rotor blades spinning at 2,400–2,700 RPM to lift in 1% air density',
      'Off-the-shelf Linux-based Snapdragon 801 processor delivering orders of magnitude more computing power than standard space-hardened chips'
    ],
    historicalFact: 'Martian atmospheric density is only 1% of Earth’s at sea level (equivalent to flying at 100,000 feet on Earth). To generate lift, Ingenuity had to be featherlight (1.8 kg) with oversized rigid blades.',
    playable: true,
    cppClass: 'IngenuityHelicopter',
    image: '/src/assets/images/martian_perseverance_ingenuity_1794219863965.jpg'
  },
  {
    id: 'curiosity',
    name: 'Curiosity Rover (Mars Science Laboratory)',
    callsign: 'MSL',
    target: 'mars',
    type: 'rover',
    launchYear: 2011,
    missionDuration: '2012–Present (Over 12 Earth years, 4,000+ Sols)',
    landingSite: 'Bradbury Landing, Gale Crater (Mount Sharp)',
    massKg: 899,
    dimensions: '3.0 m × 2.7 m × 2.2 m',
    powerSystem: 'Multi-Mission Radioisotope Thermoelectric Generator (MMRTG)',
    powerWatts: '110 W electrical generation',
    topSpeedOrCeiling: '0.14 km/h',
    instruments: [
      {
        code: 'ChemCam',
        fullName: 'Chemistry and Camera complex',
        function: 'Vaporizes rock surfaces with pulsed laser to read elemental atomic emission spectrum',
        specs: 'Over 1,000,000 laser shots fired on Mars'
      },
      {
        code: 'SAM',
        fullName: 'Sample Analysis at Mars',
        function: 'Miniaturized chemistry laboratory with gas chromatograph, mass spectrometer, and tunable laser spectrometer',
        specs: '74 sample cups heated up to 1000°C'
      },
      {
        code: 'CheMin',
        fullName: 'Chemistry and Mineralogy instrument',
        function: 'X-ray diffraction and fluorescence analyzer identifying specific crystalline minerals',
        specs: 'Cobalt X-ray source'
      },
      {
        code: 'RAD',
        fullName: 'Radiation Assessment Detector',
        function: 'Measures high-energy cosmic rays and solar particles on the Martian surface to protect future astronauts',
        specs: 'Silicon detector telescope'
      }
    ],
    keyDiscoveries: [
      'Discovered that ancient Gale Crater held fresh water, essential chemical elements (C, H, N, O, P, S), and was habitable for microbial life',
      'Detected ancient organic carbon molecules preserved in 3.5-billion-year-old mudstones',
      'Measured seasonal methane background fluctuations in the Martian atmosphere'
    ],
    engineeringInnovations: [
      'Pioneered the historic Sky Crane touchdown landing method, lowering the rover on nylon tethers directly onto its wheels',
      'Rocker-bogie mobility system that climbs obstacles larger than its wheels without tipping'
    ],
    historicalFact: 'On its first anniversary on Mars, Curiosity used its internal SAM vibration actuator to play the "Happy Birthday" tune to itself—the first and only song sung on Mars.',
    playable: true,
    cppClass: 'CuriosityRover'
  },
  {
    id: 'opportunity',
    name: 'Spirit & Opportunity (MER)',
    callsign: 'Oppy & Spirit',
    target: 'mars',
    type: 'rover',
    launchYear: 2003,
    missionDuration: 'Spirit: 2004–2010; Opportunity: 2004–2018 (14.5 years!)',
    landingSite: 'Meridiani Planum (Opportunity) & Gusev Crater (Spirit)',
    massKg: 185,
    dimensions: '1.6 m × 2.3 m × 1.5 m',
    powerSystem: 'Triple-junction solar cell array generating 140–900 Wh/Sol',
    powerWatts: 'Up to 140 W peak electrical',
    topSpeedOrCeiling: '0.18 km/h (5 cm/s)',
    instruments: [
      {
        code: 'Pancam',
        fullName: 'Panoramic Stereo Camera',
        function: 'High-resolution multispectral stereoscopic color mast cameras',
        specs: '8 filters per eye from 400 to 1100 nm'
      },
      {
        code: 'RAT',
        fullName: 'Rock Abrasion Tool',
        function: 'Diamond-tipped grinding wheel that grinds off 5 mm of weathered crust to reveal fresh rock',
        specs: 'Diamond-matrix abrasive teeth'
      },
      {
        code: 'MI',
        fullName: 'Microscopic Imager',
        function: 'Extreme close-up lens revealing grain boundaries and mineral texture',
        specs: '31 µm/pixel optical resolution'
      },
      {
        code: 'Mini-TES',
        fullName: 'Miniature Thermal Emission Spectrometer',
        function: 'Infrared radiometer diagnosing silicate, carbonate, and hematite minerals from afar',
        specs: 'Michelson interferometer'
      }
    ],
    keyDiscoveries: [
      'Discovered hematite spherules nicknamed "blueberries" proving acidic liquid water once soaked Meridiani Planum',
      'Traveled a record-shattering 45.16 kilometers (a full marathon!) on an alien world',
      'Spirit’s jammed front wheel dragged through soil and churned up 90% pure silica, proving ancient volcanic hot springs existed on Mars'
    ],
    engineeringInnovations: [
      'Inflatable airbag landing cluster that bounced dozens of times before rolling to rest inside Eagle Crater',
      'Dust-cleaning events ("cleaning devils") where Martian dust devils blew panels clean, miraculously extending the 90-day mission to 14.5 years'
    ],
    historicalFact: 'Opportunity’s famous last transmission during a planet-wide dust storm in 2018 was poignantly translated: "My battery is low and it is getting dark."',
    playable: true,
    cppClass: 'MerOpportunityRover'
  },
  {
    id: 'sojourner',
    name: 'Sojourner (Mars Pathfinder)',
    callsign: 'The Pioneer',
    target: 'mars',
    type: 'rover',
    launchYear: 1996,
    missionDuration: 'July 4 – September 27, 1997 (83 Sols)',
    landingSite: 'Ares Vallis (Ancient Martian outflow channel)',
    massKg: 11.5,
    dimensions: '0.65 m × 0.48 m × 0.30 m (Microwave oven size)',
    powerSystem: '0.22 m² solar array + non-rechargeable lithium thionyl chloride battery',
    powerWatts: '16 W peak power',
    topSpeedOrCeiling: '0.04 km/h (1 cm/s)',
    instruments: [
      {
        code: 'APXS',
        fullName: 'Alpha Proton X-ray Spectrometer',
        function: 'Bombards rocks with Curium-244 alpha particles to measure elemental composition',
        specs: 'Detected high silicon content in andesite rock "Barnacle Bill"'
      },
      {
        code: 'Stereo CCD',
        fullName: 'Monochrome and Color Cameras',
        function: 'Front stereo cameras and single rear camera to map path and wheel tracks',
        specs: '768x484 resolution sensors'
      }
    ],
    keyDiscoveries: [
      'First wheeled vehicle to roam another planet',
      'Analyzed rocks "Yogi" and "Barnacle Bill", confirming volcanic basaltic origin and catastrophic ancient flood plain geology'
    ],
    engineeringInnovations: [
      'Invented the 6-wheel rocker-bogie passive suspension now standard on all subsequent NASA rovers',
      'Operated on an ultra-low-power 8-bit Intel 80C85 processor running at 2 MHz with 512 KB RAM'
    ],
    historicalFact: 'Sojourner was named in honor of abolitionist and women’s rights activist Sojourner Truth through a worldwide student essay competition won by 12-year-old Valerie Ambroise of Connecticut.',
    playable: true,
    cppClass: 'SojournerRover'
  },
  {
    id: 'insight',
    name: 'InSight Mars Lander',
    callsign: 'Mars Quake Catcher',
    target: 'mars',
    type: 'lander',
    launchYear: 2018,
    missionDuration: '2018–2022 (Over 1,300 marsquakes recorded)',
    landingSite: 'Elysium Planitia (Smooth volcanic plain)',
    massKg: 358,
    dimensions: '6.0 m wide with twin UltraFlex circular solar arrays deployed',
    powerSystem: 'Twin circular solar panels generating 600–2000 Wh/Sol',
    powerWatts: '700 W at landing, dropped to <100 W due to heavy dust accumulation',
    topSpeedOrCeiling: 'Stationary Geophysical Observatory',
    instruments: [
      {
        code: 'SEIS',
        fullName: 'Seismic Experiment for Interior Structure',
        function: 'Measures marsquakes, meteorite impacts, and thermal cracking under a vacuum dome shield',
        specs: 'Detected vibrations smaller than the radius of a hydrogen atom'
      },
      {
        code: 'HP3',
        fullName: 'Heat Flow and Physical Properties Package ("The Mole")',
        function: 'Self-hammering probe designed to burrow 5 meters into Mars crust to measure geothermal heat flow',
        specs: 'Struggled in unexpectedly cohesive duricrust soil'
      },
      {
        code: 'RISE',
        fullName: 'Rotation and Interior Structure Experiment',
        function: 'Doppler radio tracking of Mars wobble to determine core size and liquid state',
        specs: 'Measured Mars core radius to be 1,830 ± 40 km'
      }
    ],
    keyDiscoveries: [
      'Proved Mars is seismically active, recording a massive magnitude 4.7 marsquake in May 2022',
      'Discovered Mars possesses a molten liquid metal-rich iron-nickel core with high sulfur fraction',
      'Measured crust thickness between 24 and 72 km with multiple stratification layers'
    ],
    engineeringInnovations: [
      'First deployment of a robotic arm lifting a precision instrument directly onto an alien planetary surface covered by a heavy wind-and-thermal shield dome'
    ],
    historicalFact: 'InSight detected the acoustic and seismic shockwaves of a massive meteorite impact that carved a 150-meter crater on Mars and unearthed chunks of pure water ice near the equator.',
    playable: false,
    cppClass: 'InSightLander'
  },
  {
    id: 'lro',
    name: 'Lunar Reconnaissance Orbiter (LRO)',
    callsign: 'Moon Mapper',
    target: 'moon',
    type: 'orbiter',
    launchYear: 2009,
    missionDuration: '2009–Present (Over 15 continuous years in lunar orbit)',
    landingSite: 'Polar Lunar Orbit (50 km altitude above surface)',
    massKg: 1916,
    dimensions: '3.9 m × 2.7 m × 2.6 m with solar array',
    powerSystem: 'Single-axis articulated solar panel generating 1,850 W',
    powerWatts: '1,850 W with lithium-ion battery pack',
    topSpeedOrCeiling: 'Orbital velocity ~1.6 km/s (5,760 km/h)',
    instruments: [
      {
        code: 'LROC',
        fullName: 'Lunar Reconnaissance Orbiter Camera',
        function: 'Narrow Angle Cameras (NAC) resolving surface features down to 0.5 meters/pixel',
        specs: 'Photographed Apollo landing sites with rover tire tracks still visible'
      },
      {
        code: 'LOLA',
        fullName: 'Lunar Orbiter Laser Altimeter',
        function: 'Fires multi-beam laser pulses at 28 Hz to build global high-resolution 3D topographic models',
        specs: 'Over 4 billion elevation measurements'
      },
      {
        code: 'Diviner',
        fullName: 'Diviner Lunar Radiometer Experiment',
        function: 'Maps surface and subsurface temperatures across 9 spectral channels',
        specs: 'Identified cold traps below 35 Kelvin in polar craters'
      },
      {
        code: 'LEND',
        fullName: 'Lunar Exploration Neutron Detector',
        function: 'Counts epithermal neutrons to locate hydrogen water ice trapped in lunar regolith',
        specs: 'Spatial resolution up to 5 km'
      }
    ],
    keyDiscoveries: [
      'Mapped the deepest, coldest permanently shadowed craters on the Moon with confirmed water ice frost',
      'Spotted Apollo 11, 12, 14, 15, 16, and 17 descent stages and astronaut footpaths from 50 km orbit',
      'Revealed the Moon has shrunk by more than 50 meters over the last several hundred million years due to internal cooling, causing thrust faults'
    ],
    engineeringInnovations: [
      'High-bandwidth Ka-band downlink transferring over 460 terabytes of scientific data—more than all other planetary missions combined'
    ],
    historicalFact: 'LRO tracked the exact impact plume of the LCROSS kinetic impactor into Cabeus crater in 2009, which kicked up tons of water vapor and proved ice existed at the lunar south pole.',
    playable: false,
    cppClass: 'LunarOrbiterLRO'
  },
  {
    id: 'viking',
    name: 'Viking 1 & 2 Landers',
    callsign: 'Red Planet Pioneers',
    target: 'mars',
    type: 'lander',
    launchYear: 1975,
    missionDuration: '1976–1982 (Viking 1 operated 6 years and 116 days)',
    landingSite: 'Chryse Planitia (Viking 1) & Utopia Planitia (Viking 2)',
    massKg: 600,
    dimensions: '3.0 m hex chassis with 3 landing legs',
    powerSystem: 'Two SNAP-19 Radioisotope Thermoelectric Generators (RTGs)',
    powerWatts: '70 W continuous power output',
    topSpeedOrCeiling: 'Stationary Biological & Chemical Laboratory',
    instruments: [
      {
        code: 'GCMS',
        fullName: 'Gas Chromatograph Mass Spectrometer',
        function: 'Heated soil to 500°C to analyze organic molecules and atmospheric gases',
        specs: 'Sensitivity down to parts per billion'
      },
      {
        code: 'Biology Package',
        fullName: 'Three Biological Life-Detection Experiments',
        function: 'Pyrolytic Release, Labeled Release, and Gas Exchange experiments feeding nutrients to Martian soil',
        specs: 'Labeled Release gave positive response, but lack of organics led to inconclusive results'
      },
      {
        code: 'Facsimile Cameras',
        fullName: 'Scanning High-Resolution Color Cameras',
        function: 'Rotating mirror mechanical scanners providing first color panoramic photos of Martian surface',
        specs: 'Revealed red iron-oxide dust and salmon-colored sky'
      }
    ],
    keyDiscoveries: [
      'First successful long-duration soft landing and operation on Mars in human history',
      'Characterized Martian atmospheric composition: 95.3% CO2, 2.7% N2, 1.6% Ar, with traces of oxygen and water vapor',
      'Demonstrated Martian soil is rich in iron, magnesium, aluminum, and oxidizing agents'
    ],
    engineeringInnovations: [
      'Terminal descent controlled by 3 throttleable hydrazine monopropellant rocket engines with 18-nozzle showerheads to prevent surface contamination'
    ],
    historicalFact: 'Viking 1 took the very first photograph from the surface of Mars just 25 seconds after touchdown on July 20, 1976—revealing one of the lander’s footpads resting securely in the fine orange-red dust.',
    playable: false,
    cppClass: 'VikingLander'
  }
];
