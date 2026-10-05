'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import * as THREE from 'three';
import { XORAZM_ORIGIN, ABROAD_STUDENTS } from '@/data/abroadStudents';
import {
  Globe as GlobeIcon,
  GraduationCap,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Building2,
  Award,
  RotateCcw,
  Users,
} from 'lucide-react';

// Dynamically import Globe to prevent SSR issues
const Globe = dynamic(() => import('react-globe.gl'), { ssr: false });

export default function GlobalRadar3D() {
  const globeRef = useRef();
  const [currentIndex, setCurrentIndex] = useState(null);
  const [countries, setCountries] = useState({ features: [] });
  const [mounted, setMounted] = useState(false);

  // Custom Sky Blue Globe Material for Oceans
  const customGlobeMaterial = useMemo(() => {
    return new THREE.MeshPhongMaterial({
      color: new THREE.Color('#38bdf8'), // Vibrant Sky Blue ocean sphere
      shininess: 12,
    });
  }, []);

  // Fetch world country border polygons
  useEffect(() => {
    setMounted(true);
    fetch(
      'https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson'
    )
      .then((res) => res.json())
      .then((data) => setCountries(data))
      .catch((err) => console.error('Error loading world borders:', err));
  }, []);

  const activeStudent = currentIndex !== null ? ABROAD_STUDENTS[currentIndex] : null;

  // Camera handling
  useEffect(() => {
    if (globeRef.current) {
      if (activeStudent) {
        globeRef.current.pointOfView(
          { lat: activeStudent.lat, lng: activeStudent.lng, altitude: 2.1 },
          1000
        );
      } else {
        globeRef.current.pointOfView(
          { lat: 40, lng: 80, altitude: 2.5 },
          1000
        );
      }
    }
  }, [currentIndex, activeStudent]);

  const handleChipClick = (index) => {
    if (currentIndex === index) {
      setCurrentIndex(null);
    } else {
      setCurrentIndex(index);
    }
  };

  const handleNext = () => {
    if (currentIndex === null) {
      setCurrentIndex(0);
    } else {
      setCurrentIndex((prev) => (prev + 1) % ABROAD_STUDENTS.length);
    }
  };

  const handlePrev = () => {
    if (currentIndex === null) {
      setCurrentIndex(ABROAD_STUDENTS.length - 1);
    } else {
      setCurrentIndex((prev) =>
        prev === 0 ? ABROAD_STUDENTS.length - 1 : prev - 1
      );
    }
  };

  // Static unmoving single arc line
  const singleArcData = activeStudent
    ? [
        {
          startLat: XORAZM_ORIGIN.lat,
          startLng: XORAZM_ORIGIN.lng,
          endLat: activeStudent.lat,
          endLng: activeStudent.lng,
          color: '#d97706',
        },
      ]
    : [];

  // Flat surface dots
  const pointsData = [
    {
      lat: XORAZM_ORIGIN.lat,
      lng: XORAZM_ORIGIN.lng,
      size: 0.8,
      color: '#059669',
      name: 'Xorazm Base',
    },
    ...ABROAD_STUDENTS.map((s, idx) => {
      const isSelected = idx === currentIndex;
      return {
        lat: s.lat,
        lng: s.lng,
        size: isSelected ? 1.0 : 0.6,
        color: isSelected ? '#d97706' : '#1e40af',
        studentIndex: idx,
      };
    }),
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b theme-border">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold uppercase mb-2">
            <GlobeIcon className="w-3.5 h-3.5" /> Global Acceptance Radar
          </div>
          <h2 className="text-3xl font-serif font-bold theme-text-primary">
            Graduates Across The World
          </h2>
        </div>

        {/* Country Selector Chips */}
        <div className="flex flex-wrap items-center gap-2">
          {ABROAD_STUDENTS.map((s, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={s.id}
                onClick={() => handleChipClick(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-2 border ${
                  isActive
                    ? 'bg-amber-500/20 border-amber-500 text-amber-400 font-bold shadow-sm'
                    : 'theme-bg-card theme-border theme-text-secondary hover:theme-text-primary'
                }`}
              >
                <span>{s.flag}</span>
                <span>{s.city.split(',')[1]}</span>
              </button>
            );
          })}

          {currentIndex !== null && (
            <button
              onClick={() => setCurrentIndex(null)}
              className="px-3 py-1.5 rounded-xl text-xs font-mono bg-white/5 border theme-border text-emerald-400 hover:bg-emerald-500/10 flex items-center gap-1 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Show All
            </button>
          )}
        </div>
      </div>

      {/* Split View Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* LEFT SIDE: 3D Globe with Sky-Blue Oceans */}
        <div className="lg:col-span-7 relative w-full h-[480px] rounded-3xl theme-bg-card border theme-border overflow-hidden flex items-center justify-center">
          {mounted ? (
            <Globe
              ref={globeRef}
              backgroundColor="rgba(0,0,0,0)"
              globeMaterial={customGlobeMaterial} // Fixes black sphere -> Sky Blue Ocean!
              width={650}
              height={480}
              showAtmosphere={true}
              atmosphereColor="#60a5fa"
              atmosphereAltitude={0.12}
              
              // Vector Polygon Landmasses (Off-White/Grey)
              polygonsData={countries.features}
              polygonCapColor={() => '#f8fafc'} // Crisp off-white land
              polygonSideColor={() => '#e2e8f0'}
              polygonStrokeColor={() => '#64748b'} // Clear border lines
              
              // Static arc line
              arcsData={singleArcData}
              arcColor="color"
              arcDashLength={1}
              arcDashGap={0}
              arcDashAnimateTime={0}
              arcStroke={2.5}
              
              // Flat surface dots
              pointsData={pointsData}
              pointColor="color"
              pointRadius="size"
              pointAltitude={0.01}
              pointResolution={32}
              onPointClick={(pt) => {
                if (pt.studentIndex !== undefined) {
                  if (currentIndex === pt.studentIndex) {
                    setCurrentIndex(null);
                  } else {
                    setCurrentIndex(pt.studentIndex);
                  }
                }
              }}
            />
          ) : (
            <div className="text-xs font-mono text-emerald-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 animate-spin" /> Rendering Vector 3D Globe...
            </div>
          )}
        </div>

        {/* RIGHT SIDE: Information Showcase Panel */}
        <div className="lg:col-span-5 h-full flex flex-col justify-between p-8 rounded-3xl theme-bg-card border theme-border space-y-6">
          {activeStudent ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b theme-border">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{activeStudent.flag}</span>
                  <div>
                    <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider font-bold">
                      Destination #{currentIndex + 1} of {ABROAD_STUDENTS.length}
                    </span>
                    <h3 className="text-2xl font-serif font-bold theme-text-primary">
                      {activeStudent.studentName}
                    </h3>
                  </div>
                </div>
              </div>

              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold theme-text-primary text-base">
                      {activeStudent.university}
                    </p>
                    <p className="text-xs theme-text-secondary flex items-center gap-1 mt-0.5 font-mono">
                      <MapPin className="w-3 h-3 text-amber-400" /> {activeStudent.city}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <GraduationCap className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs theme-text-secondary">Degree & Major</p>
                    <p className="font-mono font-medium theme-text-primary">
                      {activeStudent.major}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Award className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs theme-text-secondary">Scholarship Award</p>
                    <span className="inline-block mt-1 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold">
                      {activeStudent.scholarship}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-3 pb-4 border-b theme-border">
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold theme-text-primary">
                    Global Network Overview
                  </h3>
                  <p className="text-xs theme-text-secondary">
                    {ABROAD_STUDENTS.length} graduates currently studying abroad
                  </p>
                </div>
              </div>

              <p className="text-xs theme-text-secondary leading-relaxed">
                Click on any country dot on the globe or use the country chips above to inspect individual student acceptances, universities, and full scholarship awards.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-2xl theme-bg-page border theme-border font-mono text-xs space-y-1">
                  <span className="text-[10px] theme-text-secondary uppercase">Destinations</span>
                  <p className="text-base font-bold text-amber-400">5 Countries</p>
                </div>
                <div className="p-3 rounded-2xl theme-bg-page border theme-border font-mono text-xs space-y-1">
                  <span className="text-[10px] theme-text-secondary uppercase">Avg. Funding</span>
                  <p className="text-base font-bold text-emerald-400">Full Ride</p>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Back / Next Navigation Controls */}
          <div className="pt-6 border-t theme-border flex items-center justify-between gap-4">
            <button
              onClick={handlePrev}
              className="px-5 py-3 rounded-2xl theme-bg-page border theme-border hover:border-emerald-500/50 theme-text-primary text-xs font-mono font-bold flex items-center gap-2 transition-all group"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back
            </button>

            <span className="text-xs font-mono theme-text-secondary">
              {currentIndex !== null ? `${currentIndex + 1} / ${ABROAD_STUDENTS.length}` : 'All Places'}
            </span>

            <button
              onClick={handleNext}
              className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-mono font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 group"
            >
              Next
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}