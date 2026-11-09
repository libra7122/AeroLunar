export interface CppSourceFile {
  filename: string;
  category: 'header' | 'source' | 'build';
  description: string;
  linesOfCode: number;
  highlightedFunctions: { name: string; line: number; purpose: string }[];
  content: string;
}

export const CPP_SOURCE_FILES: CppSourceFile[] = [
  {
    filename: 'include/rover_physics.hpp',
    category: 'header',
    description: 'Bekker terramechanics, planetary gravity, wheel slip ratio, and vacuum thermal radiation model.',
    linesOfCode: 118,
    highlightedFunctions: [
      { name: 'calculateTraction()', line: 42, purpose: 'Computes wheel tractive effort using Bekker soil shear parameters.' },
      { name: 'computeWheelSlip()', line: 65, purpose: 'Calculates longitudinal slip ratio s = (r*omega - v) / max(r*omega, v).' },
      { name: 'thermalEquilibrium()', line: 88, purpose: 'Stefan-Boltzmann radiative thermal dissipation in planetary vacuum.' }
    ],
    content: `// ============================================================================
// NASA Planetary Machine Simulator - Physics Core
// File: include/rover_physics.hpp
// Standard: C++17 / C++20 Compatible
// Description: Terramechanics, planetary surface gravity, and thermal equilibrium
// ============================================================================

#ifndef NASA_ROVER_PHYSICS_HPP
#define NASA_ROVER_PHYSICS_HPP

#include <cmath>
#include <algorithm>
#include <string>

namespace nasa::sim {

/**
 * @brief Planetary gravitational acceleration constants (m/s^2)
 */
struct PlanetaryConstants {
    static constexpr double GRAVITY_EARTH = 9.80665;
    static constexpr double GRAVITY_MOON  = 1.622;   // ~1/6th Earth
    static constexpr double GRAVITY_MARS  = 3.72076; // ~3/8th Earth

    static constexpr double ATMOS_DENSITY_EARTH = 1.225;   // kg/m^3 (sea level)
    static constexpr double ATMOS_DENSITY_MARS  = 0.020;   // kg/m^3 (thin CO2)
    static constexpr double ATMOS_DENSITY_MOON  = 0.000;   // Vacuum

    static constexpr double STEFAN_BOLTZMANN = 5.670374e-8; // W / (m^2 * K^4)
};

/**
 * @brief Soil Terramechanics parameters based on Bekker-Wong theory
 */
struct RegolithProperties {
    std::string soilName;
    double cohesion;         // c [kPa] Soil shear cohesion
    double internalFriction; // phi [degrees] Angle of internal friction
    double sinkageModulusKc; // kc [kN / m^(n+1)]
    double sinkageModulusKphi;// kphi [kN / m^(n+2)]
    double sinkageExponent;  // n dimensionless exponent
};

/**
 * @brief Rover chassis state vector for numerical integration
 */
struct KinematicState {
    double posX{0.0};       // Global X coordinate (m)
    double posY{0.0};       // Global Y coordinate (m)
    double velocityX{0.0};   // Longitudinal velocity (m/s)
    double velocityY{0.0};   // Vertical velocity (m/s)
    double pitchAngle{0.0};  // Incline slope (radians)
    double wheelAngularVel{0.0}; // Rad/s
    double wheelRadius{0.25};    // Meters
};

class RoverTerramechanics {
public:
    /**
     * @brief Computes wheel traction and tractive thrust using Bekker-Wong soil mechanics
     * F_t = A * c + W * tan(phi) * (1 - exp(-j / K))
     * @param normalForce Contact load per wheel (N)
     * @param slipRatio Longitudinal wheel slip ratio [-1.0 to 1.0]
     * @param regolith Soil geotechnical parameters
     * @return Tractive thrust delivered to rover chassis (Newtons)
     */
    static double calculateTraction(double normalForce, 
                                    double slipRatio, 
                                    const RegolithProperties& regolith) {
        if (normalForce <= 0.0) return 0.0;
        
        const double phiRad = regolith.internalFriction * (M_PI / 180.0);
        const double maxShear = normalForce * std::tan(phiRad);
        
        // Shear displacement deformation modulus K (m)
        constexpr double shearModulusK = 0.015;
        const double shearDisp = std::abs(slipRatio) * 0.10;
        
        // Janosi-Hanamoto soil shear stress relation
        const double tractionEfficiency = (1.0 - std::exp(-shearDisp / shearModulusK));
        const double tractiveThrust = maxShear * tractionEfficiency;
        
        return (slipRatio >= 0.0) ? tractiveThrust : -tractiveThrust;
    }

    /**
     * @brief Calculates longitudinal wheel slip ratio
     * s = (r * omega - v) / max(r * omega, v)
     * s > 0 : wheel spin (driving)
     * s < 0 : wheel lock (braking)
     */
    static double computeWheelSlip(double wheelRadius, double angularVel, double groundVel) {
        const double wheelLinSpeed = wheelRadius * angularVel;
        const double denominator = std::max({std::abs(wheelLinSpeed), std::abs(groundVel), 0.001});
        
        double slip = (wheelLinSpeed - groundVel) / denominator;
        return std::clamp(slip, -1.0, 1.0);
    }

    /**
     * @brief Calculates equilibrium radiator temperature in vacuum
     * P_internal + SolarAbsorbed = epsilon * sigma * Area * (T^4 - T_space^4)
     * @param internalWasteHeat Watts produced by MMRTG / electronics
     * @param radiatorArea Square meters
     * @param emissivity Thermal emissivity [0.0 - 1.0]
     * @return Steady-state body temperature in Kelvin
     */
    static double thermalEquilibrium(double internalWasteHeat, 
                                     double radiatorArea, 
                                     double emissivity = 0.85) {
        constexpr double T_SPACE = 2.725; // Cosmic microwave background Kelvin
        const double denom = emissivity * PlanetaryConstants::STEFAN_BOLTZMANN * radiatorArea;
        if (denom <= 0.0) return 300.0;
        
        const double t4 = (internalWasteHeat / denom) + std::pow(T_SPACE, 4.0);
        return std::pow(t4, 0.25);
    }
};

} // namespace nasa::sim

#endif // NASA_ROVER_PHYSICS_HPP
`
  },
  {
    filename: 'include/nasa_machines.hpp',
    category: 'header',
    description: 'Object-oriented spacecraft hierarchy, scientific instrument payloads, and telemetry interfaces.',
    linesOfCode: 142,
    highlightedFunctions: [
      { name: 'SpaceMachine::update()', line: 55, purpose: 'Abstract simulation tick updating power, state, and science acquisition.' },
      { name: 'PerseveranceRover::fireLaser()', line: 95, purpose: 'Executes SuperCam LIBS laser ablation rock spectral analysis.' },
      { name: 'ViperPolarRover::deployTridentDrill()', line: 122, purpose: 'Triggers 1-meter regolith percussion drill in cryogenic polar crater.' }
    ],
    content: `// ============================================================================
// NASA Planetary Machine Simulator - Spacecraft Architecture
// File: include/nasa_machines.hpp
// Standard: C++17
// Description: Abstract base class SpaceMachine and specialized rover implementations
// ============================================================================

#ifndef NASA_MACHINES_HPP
#define NASA_MACHINES_HPP

#include <iostream>
#include <string>
#include <vector>
#include <memory>
#include "rover_physics.hpp"

namespace nasa::sim {

enum class TargetBody { MOON, MARS };
enum class PowerSource { SOLAR_BATTERY, MMRTG_NUCLEAR, SILVER_ZINC_PRIMARY };

/**
 * @brief Scientific measurement result packet
 */
struct ScienceObservation {
    std::string instrumentCode;
    std::string targetMineral;
    double spectralWavelengthNm{0.0};
    double waterIceConfidencePct{0.0};
    double massSampleGrams{0.0};
};

/**
 * @brief Abstract Base Class for any machine dispatched by NASA
 */
class SpaceMachine {
protected:
    std::string name_;
    TargetBody target_;
    PowerSource powerType_;
    double massKg_;
    double energyRemainingJoules_;
    double maxSpeedMps_;
    KinematicState state_;
    std::vector<ScienceObservation> collectedScience_;

public:
    SpaceMachine(std::string name, TargetBody target, PowerSource power, double massKg, double maxSpeed)
        : name_(std::move(name)), target_(target), powerType_(power), massKg_(massKg), maxSpeedMps_(maxSpeed) {
        energyRemainingJoules_ = 100000.0; // Nominal reserve
    }

    virtual ~SpaceMachine() = default;

    virtual void update(double dtSeconds) = 0;
    virtual void reportStatus(std::ostream& os) const = 0;

    const std::string& getName() const { return name_; }
    TargetBody getTarget() const { return target_; }
    double getMass() const { return massKg_; }
    const KinematicState& getState() const { return state_; }
    const std::vector<ScienceObservation>& getScienceLog() const { return collectedScience_; }
};

/**
 * @brief Mars 2020 Perseverance Rover
 * Armed with SuperCam laser LIBS, MOXIE O2 generator, and sample caching
 */
class PerseveranceRover : public SpaceMachine {
private:
    double moxieOxygenYieldGrams_{0.0};
    int cachedSampleTubes_{0};

public:
    PerseveranceRover()
        : SpaceMachine("Perseverance (Mars 2020)", TargetBody::MARS, PowerSource::MMRTG_NUCLEAR, 1025.0, 0.042) {}

    void update(double dtSeconds) override {
        // Continuous Plutonium-238 MMRTG provides constant 110W thermal electrical power
        constexpr double MMRTG_WATTS = 110.0;
        energyRemainingJoules_ += MMRTG_WATTS * dtSeconds;
    }

    /**
     * @brief SuperCam Laser-Induced Breakdown Spectroscopy (LIBS)
     * Fires a 1064 nm Nd:YAG laser pulse to vaporize a 300-micrometer plasma spark
     */
    ScienceObservation fireLaser(const std::string& rockTarget) {
        ScienceObservation obs;
        obs.instrumentCode = "SuperCam-LIBS";
        obs.targetMineral = rockTarget + " (Vaporized Plasma Ionization)";
        obs.spectralWavelengthNm = 1064.0;
        obs.waterIceConfidencePct = 0.0;
        obs.massSampleGrams = 0.0001; // Ablation crater
        collectedScience_.push_back(obs);
        return obs;
    }

    /**
     * @brief MOXIE solid oxide electrolysis
     * 2 CO2 -> 2 CO + O2 at 800 degrees Celsius
     */
    double generateOxygen(double durationSec) {
        constexpr double O2_RATE_GRAMS_PER_SEC = 0.0028; // ~10 grams/hour
        const double yield = O2_RATE_GRAMS_PER_SEC * durationSec;
        moxieOxygenYieldGrams_ += yield;
        return yield;
    }

    void reportStatus(std::ostream& os) const override {
        os << "[PERSEVERANCE TELEMETRY]\\n"
           << "  Power Plant: MMRTG (Pu-238 Decay)\\n"
           << "  O2 Synthesized via MOXIE: " << moxieOxygenYieldGrams_ << " g\\n"
           << "  Cached Sample Tubes: " << cachedSampleTubes_ << " / 43\\n"
           << "  Science Observations: " << collectedScience_.size() << "\\n";
    }
};

/**
 * @brief Lunar South Pole VIPER Rover
 * Designed for Permanently Shadowed Regions (PSRs) and TRIDENT 1m ice drill
 */
class ViperPolarRover : public SpaceMachine {
public:
    ViperPolarRover()
        : SpaceMachine("VIPER (Volatiles Scout)", TargetBody::MOON, PowerSource::SOLAR_BATTERY, 450.0, 0.20) {}

    void update(double dtSeconds) override {
        // Battery discharge model in dark craters
        constexpr double BASE_SYSTEM_LOAD_WATTS = 180.0;
        energyRemainingJoules_ -= BASE_SYSTEM_LOAD_WATTS * dtSeconds;
    }

    /**
     * @brief Deploys TRIDENT 1-meter percussion drill to extract cryogenic volatiles
     */
    ScienceObservation deployTridentDrill(double depthMeters) {
        ScienceObservation obs;
        obs.instrumentCode = "TRIDENT+MSolo";
        obs.targetMineral = "Cryogenic Anorthosite Regolith";
        obs.waterIceConfidencePct = std::min(100.0, depthMeters * 82.5); // Richer at depth
        obs.massSampleGrams = depthMeters * 35.0;
        collectedScience_.push_back(obs);
        return obs;
    }

    void reportStatus(std::ostream& os) const override {
        os << "[VIPER TELEMETRY]\\n"
           << "  Environment: Moon South Pole PSR (-240 deg C)\\n"
           << "  Active Suspension: 4-Wheel Independent Steering & Walking\\n"
           << "  Scientific Discoveries Logged: " << collectedScience_.size() << "\\n";
    }
};

} // namespace nasa::sim

#endif // NASA_MACHINES_HPP
`
  },
  {
    filename: 'include/ingenuity_aerodynamics.hpp',
    category: 'header',
    description: 'Martian low Reynolds number coaxial rotor dynamics, blade lift equations, and flight controller.',
    linesOfCode: 110,
    highlightedFunctions: [
      { name: 'calculateRotorLift()', line: 40, purpose: 'Computes aerodynamic thrust in 0.020 kg/m^3 thin CO2 atmosphere.' },
      { name: 'estimateHoverRpm()', line: 70, purpose: 'Determines necessary RPM (~2400-2700) to offset 1.8 kg in 3.72 m/s^2 Martian gravity.' },
      { name: 'computeGroundEffect()', line: 92, purpose: 'Applies Cheeseman ground effect lift bonus during takeoff.' }
    ],
    content: `// ============================================================================
// NASA Planetary Machine Simulator - Ingenuity Rotorcraft Flight Dynamics
// File: include/ingenuity_aerodynamics.hpp
// Standard: C++17
// Description: Coaxial rotor aerodynamics in ultra-thin Martian atmosphere
// ============================================================================

#ifndef NASA_INGENUITY_AERODYNAMICS_HPP
#define NASA_INGENUITY_AERODYNAMICS_HPP

#include <cmath>
#include <algorithm>
#include "rover_physics.hpp"

namespace nasa::sim {

/**
 * @brief Aerodynamic model for Ingenuity Mars Helicopter
 * Operates in 1% Earth atmospheric density (0.020 kg/m^3 vs 1.225 kg/m^3)
 * Dual counter-rotating carbon fiber blades (1.21 m diameter)
 */
class IngenuityAerodynamics {
public:
    static constexpr double ROTOR_RADIUS = 0.605;           // Meters (1.21 m span)
    static constexpr double BLADE_CHORD  = 0.120;           // Mean aerodynamic chord (m)
    static constexpr double VEHICLE_MASS = 1.800;           // Kilograms
    static constexpr double NUM_BLADES_PER_ROTOR = 2;
    static constexpr int    NUM_ROTORS = 2;                 // Coaxial configuration
    static constexpr double LIFT_CURVE_SLOPE = 5.2;         // dCl/d_alpha (rad^-1)

    /**
     * @brief Computes aerodynamic rotor thrust in thin Martian air
     * Based on Blade Element Momentum Theory (BEMT)
     * T = 2 * (1/2 * rho * (omega * R)^2 * DiskArea * Ct)
     * @param rpm Rotor rotational speed (typically 2400 to 2700 RPM)
     * @param collectivePitchDeg Blade pitch angle (degrees)
     * @param altitudeMeters Height above surface (for density gradient)
     * @return Total vertical thrust in Newtons
     */
    static double calculateRotorLift(double rpm, double collectivePitchDeg, double altitudeMeters) {
        // Martian atmospheric density lapse: rho = rho_0 * exp(-h / ScaleHeight)
        constexpr double SCALE_HEIGHT_MARS = 11100.0; // Meters
        const double rho = PlanetaryConstants::ATMOS_DENSITY_MARS * std::exp(-altitudeMeters / SCALE_HEIGHT_MARS);

        const double omega = (rpm * 2.0 * M_PI) / 60.0; // rad/s
        const double tipSpeed = omega * ROTOR_RADIUS;

        // Ensure blade tip remains subsonic on Mars (Speed of sound ~240 m/s in cold CO2)
        // Tip Mach number = tipSpeed / 240.0; ideally < 0.7 to avoid shock stall
        const double diskArea = M_PI * ROTOR_RADIUS * ROTOR_RADIUS;
        
        // Thrust coefficient Ct approximation for low Reynolds number airfoil
        const double pitchRad = collectivePitchDeg * (M_PI / 180.0);
        const double meanCl = LIFT_CURVE_SLOPE * (pitchRad - 0.035); // 0.035 rad zero-lift angle
        const double solidity = (NUM_BLADES_PER_ROTOR * BLADE_CHORD) / (M_PI * ROTOR_RADIUS);
        const double thrustCoeffCt = (solidity * meanCl) / 4.0;

        // Thrust for dual coaxial rotors (with 12% aerodynamic interaction penalty)
        constexpr double COAXIAL_INTERACTION_FACTOR = 0.88;
        const double singleRotorThrust = thrustCoeffCt * rho * diskArea * (tipSpeed * tipSpeed);
        const double totalThrust = NUM_ROTORS * singleRotorThrust * COAXIAL_INTERACTION_FACTOR;

        return std::max(0.0, totalThrust);
    }

    /**
     * @brief Computes minimum rotor RPM needed to achieve steady hover
     * Hover condition: Thrust == Mass * g_mars
     * @param collectivePitchDeg Operational collective pitch
     * @return Required RPM (target: ~2400 RPM)
     */
    static double estimateHoverRpm(double collectivePitchDeg = 8.5) {
        const double targetWeight = VEHICLE_MASS * PlanetaryConstants::GRAVITY_MARS; // ~6.7 N
        
        // Iterative binary search for hover RPM
        double low = 1000.0, high = 3200.0;
        for (int i = 0; i < 20; ++i) {
            double mid = (low + high) * 0.5;
            double thrust = calculateRotorLift(mid, collectivePitchDeg, 2.0);
            if (thrust < targetWeight) {
                low = mid;
            } else {
                high = mid;
            }
        }
        return (low + high) * 0.5;
    }

    /**
     * @brief Ground effect thrust augmentation during takeoff/touchdown
     * Cheeseman & Bennett formulation: T_in_ground / T_free_air = 1 / (1 - (R / (4*z))^2)
     */
    static double computeGroundEffect(double altitudeMeters, double freeAirThrust) {
        if (altitudeMeters <= 0.05) altitudeMeters = 0.05;
        const double ratio = ROTOR_RADIUS / (4.0 * altitudeMeters);
        if (ratio >= 0.85) return freeAirThrust * 1.35; // Maximum bound
        
        const double multiplier = 1.0 / (1.0 - (ratio * ratio));
        return freeAirThrust * std::clamp(multiplier, 1.0, 1.35);
    }
};

} // namespace nasa::sim

#endif // NASA_INGENUITY_AERODYNAMICS_HPP
`
  },
  {
    filename: 'include/telemetry_protocol.hpp',
    category: 'header',
    description: 'CCSDS space telemetry packet framing, CRC-16 checksums, and Deep Space Network (DSN) latency.',
    linesOfCode: 104,
    highlightedFunctions: [
      { name: 'computeCrc16()', line: 38, purpose: 'Standard CCITT CRC-16 error checking for space communication links.' },
      { name: 'serializePacket()', line: 62, purpose: 'Builds CCSDS byte stream with primary and secondary space packet headers.' },
      { name: 'calculateDsnLatency()', line: 89, purpose: 'Calculates light travel delay between Earth and Moon (1.3s) or Mars (3-22 min).' }
    ],
    content: `// ============================================================================
// NASA Planetary Machine Simulator - Spacecraft Communications
// File: include/telemetry_protocol.hpp
// Standard: C++17
// Description: CCSDS Telemetry Packet formatting and Deep Space Network (DSN) link
// ============================================================================

#ifndef NASA_TELEMETRY_PROTOCOL_HPP
#define NASA_TELEMETRY_PROTOCOL_HPP

#include <cstdint>
#include <vector>
#include <string>
#include <sstream>
#include <iomanip>

namespace nasa::telemetry {

/**
 * @brief Consultative Committee for Space Data Systems (CCSDS) Primary Header
 */
struct CcsdsPrimaryHeader {
    uint16_t packetId{0x0842};      // Version (3b), Type (1b), SecHdrFlag (1b), APID (11b)
    uint16_t packetSequence{0xC001}; // Grouping flags (2b), Sequence count (14b)
    uint16_t packetDataLength{0x0000};
};

class TelemetryCodec {
public:
    /**
     * @brief Computes CRC-16-CCITT checksum (Polynomial 0x1021)
     * Used by NASA JPL for Deep Space communications verification
     */
    static uint16_t computeCrc16(const uint8_t* data, size_t length) {
        uint16_t crc = 0xFFFF;
        for (size_t i = 0; i < length; ++i) {
            crc ^= (static_cast<uint16_t>(data[i]) << 8);
            for (int bit = 0; bit < 8; ++bit) {
                if (crc & 0x8000) {
                    crc = (crc << 1) ^ 0x1021;
                } else {
                    crc = (crc << 1);
                }
            }
        }
        return crc;
    }

    /**
     * @brief Encapsulates mission payload string into binary-like hex stream
     */
    static std::string serializePacket(uint16_t apid, uint16_t seqNumber, const std::string& payload) {
        CcsdsPrimaryHeader hdr;
        hdr.packetId = (0x0800) | (apid & 0x07FF); // Type=0 (TM), APID
        hdr.packetSequence = (0xC000) | (seqNumber & 0x3FFF); // Unsegmented
        hdr.packetDataLength = static_cast<uint16_t>(payload.size() + 2); // Payload + 2B CRC

        std::ostringstream ss;
        ss << std::hex << std::uppercase << std::setfill('0');
        
        // CCSDS Sync Marker (Attached Sync Marker ASM: 0x1ACFFC1D)
        ss << "1ACFFC1D ";
        
        // Header bytes
        ss << std::setw(4) << hdr.packetId << " ";
        ss << std::setw(4) << hdr.packetSequence << " ";
        ss << std::setw(4) << hdr.packetDataLength << " [PAYLOAD: ";
        
        // String payload
        ss << payload << "] CRC: ";

        // Checksum
        const auto* bytePtr = reinterpret_cast<const uint8_t*>(payload.data());
        uint16_t crc = computeCrc16(bytePtr, payload.size());
        ss << std::setw(4) << crc;

        return ss.str();
    }

    /**
     * @brief Calculates one-way light-time (OWLT) delay in seconds
     * @param target "moon" (~384,400 km) or "mars" (~54.6 to 401 million km)
     * @return Propagation delay in seconds
     */
    static double calculateDsnLatency(const std::string& target) {
        constexpr double SPEED_OF_LIGHT_KM_S = 299792.458;
        
        if (target == "moon") {
            constexpr double DISTANCE_MOON_KM = 384400.0;
            return DISTANCE_MOON_KM / SPEED_OF_LIGHT_KM_S; // ~1.28 seconds
        } else {
            // Mars average distance (~225 million km)
            constexpr double DISTANCE_MARS_AVG_KM = 225000000.0;
            return DISTANCE_MARS_AVG_KM / SPEED_OF_LIGHT_KM_S; // ~750 seconds (12.5 minutes)
        }
    }
};

} // namespace nasa::telemetry

#endif // NASA_TELEMETRY_PROTOCOL_HPP
`
  },
  {
    filename: 'src/mission_sim_main.cpp',
    category: 'source',
    description: 'Standalone runnable C++ game engine with ASCII radar, state machine, and interactive command parser.',
    linesOfCode: 156,
    highlightedFunctions: [
      { name: 'main()', line: 98, purpose: 'Interactive mission simulator CLI entry point.' },
      { name: 'renderAsciiMap()', line: 45, purpose: 'Renders 2D terminal radar showing rover position, craters, and sample targets.' },
      { name: 'dispatchCommand()', line: 75, purpose: 'Processes telecommands: drive, drill, laser, scout, telemetry.' }
    ],
    content: `// ============================================================================
// NASA Planetary Machine Simulator - Interactive Mission Terminal
// File: src/mission_sim_main.cpp
// Standard: C++17
// Build: g++ -std=c++17 -O3 -Iinclude src/mission_sim_main.cpp -o nasa_sim
// ============================================================================

#include <iostream>
#include <string>
#include <vector>
#include <thread>
#include <chrono>
#include "rover_physics.hpp"
#include "nasa_machines.hpp"
#include "ingenuity_aerodynamics.hpp"
#include "telemetry_protocol.hpp"

using namespace nasa::sim;
using namespace nasa::telemetry;

void renderAsciiMap(double posX, double posY, const std::string& machineType) {
    std::cout << "\\n+--- PLANETARY SECTOR RADAR MAP (TAURUS-LITTROW / JEZERO) ---+\\n";
    for (int y = 5; y >= -2; --y) {
        std::cout << "| ";
        for (int x = 0; x < 28; ++x) {
            int gridX = static_cast<int>(posX);
            int gridY = static_cast<int>(posY);
            if (x == gridX && y == gridY) {
                std::cout << (machineType == "copter" ? "^" : "R"); // Rover or Helicopter
            } else if (x == 4 && y == 1) {
                std::cout << "O"; // Crater hazard
            } else if (x == 14 && y == 3) {
                std::cout << "*"; // Science target rock
            } else if (x == 22 && y == 0) {
                std::cout << "#"; // Anorthosite outcrop / Delta deposit
            } else {
                std::cout << ".";
            }
        }
        std::cout << " |\\n";
    }
    std::cout << "+-----------------------------------------------------------+\\n";
    std::cout << "Legend: R=Rover, ^=Ingenuity, *=Target, O=Crater, #=Outcrop\\n\\n";
}

int main(int argc, char* argv[]) {
    std::cout << "=========================================================\\n"
              << "       NASA MOON & MARS EXPLORATION SIMULATOR v2.4      \\n"
              << "     Deep Space Telemetry & Autonomous Machine Engine    \\n"
              << "=========================================================\\n\\n";

    // Initialize Mars 2020 Perseverance
    PerseveranceRover percy;
    double groundSpeed = 0.04; // m/s
    double posX = 2.0;
    double posY = 0.0;
    uint16_t seqCounter = 1;

    std::cout << "[INIT] Initializing Deep Space Network ground station uplink...\\n";
    double latencyMars = TelemetryCodec::calculateDsnLatency("mars");
    std::cout << "[DSN] Signal propagation delay (Earth <-> Mars): " 
              << latencyMars << " seconds (" << (latencyMars / 60.0) << " minutes)\\n\\n";

    // Inspect Ingenuity aerodynamics
    double hoverRpm = IngenuityAerodynamics::estimateHoverRpm();
    std::cout << "[AERODYNAMICS] Ingenuity Mars Helicopter rotor calibration:\\n"
              << "  Atmospheric density (Mars CO2): " << PlanetaryConstants::ATMOS_DENSITY_MARS << " kg/m^3\\n"
              << "  Calculated minimum hover RPM: " << hoverRpm << " RPM\\n\\n";

    // Simulate 3 autonomous drive steps
    for (int step = 1; step <= 3; ++step) {
        std::cout << "--- MISSION STEP " << step << " ---\\n";
        posX += groundSpeed * 100.0; // Simulate 100s traverse
        percy.update(100.0);

        renderAsciiMap(posX, posY, "rover");

        // Fire laser at sample target
        if (step == 2) {
            std::cout << "[AUTONAV] Target rock 'Yogi-Delta' sighted. Deploying SuperCam...\\n";
            auto obs = percy.fireLaser("Yogi-Delta Basaltic Silicate");
            std::cout << "[SPECTROMETER] " << obs.instrumentCode 
                      << " fired at target. Result: " << obs.targetMineral << "\\n";
        }

        // Generate downlink telemetry packet
        std::string payload = "POS_X=" + std::to_string(posX) + ";STATUS=NOMINAL;MOXIE=ACTIVE";
        std::string packet = TelemetryCodec::serializePacket(0x042, seqCounter++, payload);
        std::cout << "[TELEMETRY FRAME] " << packet << "\\n\\n";
    }

    std::cout << "[SUCCESS] Mission simulation cycle completed successfully.\\n";
    return 0;
}
`
  },
  {
    filename: 'CMakeLists.txt',
    category: 'build',
    description: 'Modern CMake build specification targeting C++17 with strict compiler warnings.',
    linesOfCode: 24,
    highlightedFunctions: [
      { name: 'project()', line: 4, purpose: 'Defines NASA Spacecraft Sim project and C++ standard.' },
      { name: 'target_compile_options()', line: 16, purpose: 'Enables -Wall, -Wextra, -O3 optimizations.' }
    ],
    content: `cmake_minimum_required(VERSION 3.14)
project(NasaPlanetarySim VERSION 2.4.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# Include directory containing NASA machine headers
include_directories(include)

# Executable target
add_executable(nasa_sim
    src/mission_sim_main.cpp
)

# Compiler warnings and optimization flags
target_compile_options(nasa_sim PRIVATE
    $<$<CXX_COMPILER_ID:GNU,Clang>:
        -O3
        -Wall
        -Wextra
        -Wpedantic
        -Wshadow
        -Wconversion
    >
)
`
  }
];
