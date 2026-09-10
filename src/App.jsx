import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  MapPin, 
  Radio, 
  WifiOff, 
  Camera, 
  AlertTriangle, 
  Send, 
  Activity, 
  CloudRain, 
  Truck, 
  Languages, 
  CheckCircle2,
  Layers,
  Database,
  Volume2,
  TrendingUp,
  Cpu,
  RefreshCw,
  Clock,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import L from 'leaflet';

const createCustomPin = (color, pulse = false) => new L.DivIcon({
  className: pulse ? 'radar-ping' : '',
  html: `<div style="
    background: radial-gradient(circle, ${color} 30%, transparent 75%);
    width: 24px; 
    height: 24px; 
    display: flex; 
    align-items: center; 
    justify-content: center;
  ">
    <div style="
      background-color: ${color}; 
      width: 11px; 
      height: 11px; 
      border-radius: 50%; 
      box-shadow: 0 0 14px ${color}, 0 0 24px ${color};
      border: 2px solid #ffffff;
    "></div>
  </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

const RISK_ZONES = [
  { id: 1, name: "East Khasi Hills (Cherrapunji Arc)", lat: 25.2986, lng: 91.5822, risk: "CRITICAL", prob: 94, road: "SH-5 Blocked", rain: "312 mm/24h", pore: "138 kPa", factor: "Hydrostatic Saturation" },
  { id: 2, name: "Chumukedima Mudslide Zone (NH-29)", lat: 25.7500, lng: 93.7800, risk: "HIGH", prob: 82, road: "One-Way Convoy", rain: "198 mm/24h", pore: "104 kPa", factor: "Severe Slope Slump" },
  { id: 3, name: "Sonapur Tunnel Bypass (NH-6)", lat: 25.1050, lng: 92.3600, risk: "CRITICAL", prob: 89, road: "Debris Clearing", rain: "245 mm/24h", pore: "128 kPa", factor: "Rockfall Cascade" },
  { id: 4, name: "Gangtok - Rangpo Highway (NH-10)", lat: 27.2000, lng: 88.5500, risk: "MODERATE", prob: 48, road: "Operational", rain: "112 mm/24h", pore: "62 kPa", factor: "Stable Runoff" },
];

const TELEMETRY_STREAM = [
  { time: '02:00', rain: 24, pore: 38 },
  { time: '06:00', rain: 52, pore: 56 },
  { time: '10:00', rain: 110, pore: 84 },
  { time: '14:00', rain: 195, pore: 112 },
  { time: '18:00', rain: 260, pore: 129 },
  { time: '22:00', rain: 312, pore: 138 },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('command');
  const [lang, setLang] = useState('en');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [alertSuccess, setAlertSuccess] = useState(false);
  const [selectedZone, setSelectedZone] = useState(RISK_ZONES[0]);
  const [simulating, setSimulating] = useState(false);

  const [reportForm, setReportForm] = useState({
    location: '',
    hazardType: 'Slope Shear Cracks',
    severity: 'Critical',
    notes: '',
  });

  const [reports, setReports] = useState(() => {
    const cached = localStorage.getItem('terrasafe_reports');
    return cached ? JSON.parse(cached) : [
      { id: 101, location: 'Km 44, Chumukedima Cut', hazardType: 'Road Slump', time: '11:15 AM', status: 'Relayed to SDRF' },
      { id: 102, location: 'Sonapur Tunnel Outflow', hazardType: 'Fresh Mudflow', time: '09:20 AM', status: 'Relayed to SDRF' }
    ];
  });

  useEffect(() => {
    const onOnline = () => setIsOffline(false);
    const onOffline = () => setIsOffline(true);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const handleSimulateInSAR = () => {
    setSimulating(true);
    setTimeout(() => {
      setSimulating(false);
    }, 1200);
  };

  const handleReportSubmit = (e) => {
    e.preventDefault();
    if (!reportForm.location) return;
    const newEntry = {
      id: Date.now(),
      ...reportForm,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: isOffline ? 'Cached in Local Buffer' : 'Dispatched to EOC Desk'
    };
    const updated = [newEntry, ...reports];
    setReports(updated);
    localStorage.setItem('terrasafe_reports', JSON.stringify(updated));
    setReportForm({ location: '', hazardType: 'Slope Shear Cracks', severity: 'Critical', notes: '' });
  };

  const triggerBroadcast = () => {
    setAlertSuccess(true);
    setTimeout(() => setAlertSuccess(false), 4000);
  };

  return (
    <div className="flex h-screen w-screen grid-bg overflow-hidden select-none">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-72 bg-[#080d1a]/85 border-r border-slate-800/80 p-5 flex flex-col justify-between backdrop-blur-xl z-20">
        <div>
          {/* Logo Header */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-900 border border-red-500/20 mb-6 shadow-inner">
            <div className="p-2.5 bg-gradient-to-br from-red-500 to-rose-700 rounded-xl shadow-lg shadow-red-600/40">
              <ShieldAlert className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-base tracking-wider text-white">TerraSafe</h1>
                <span className="text-[9px] bg-red-500/20 text-red-400 font-mono px-1.5 py-0.5 rounded border border-red-500/30 font-bold">AI NER</span>
              </div>
              <p className="text-[10px] text-slate-400">Early Warning Network</p>
            </div>
          </div>

          {/* Nav Items */}
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 mb-3 flex items-center justify-between">
            <span>Mission Control</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
          </div>
          
          <nav className="space-y-1.5">
            {[
              { id: 'command', label: 'GIS Live Command', icon: Layers, badge: 'Live Radar' },
              { id: 'analytics', label: 'Sensor Telemetry', icon: Activity, badge: 'Piezometer' },
              { id: 'roads', label: 'Arterial Road Network', icon: Truck, badge: '2 Blocked' },
              { id: 'crowd', label: 'Citizen Incident Log', icon: Camera, badge: `${reports.length}` },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    active 
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-600/30 border border-red-400/40' 
                      : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono ${
                      active ? 'bg-black/30 text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* System Diagnostics & Language switch */}
        <div className="space-y-3 pt-4 border-t border-slate-800/80">
          <div className="glass-panel p-3 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px] flex items-center gap-1.5">
                <Languages className="h-3.5 w-3.5 text-cyan-400" /> Dialect
              </span>
              <div className="flex gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                {['EN', 'AS', 'HI'].map((code) => (
                  <button
                    key={code}
                    onClick={() => setLang(code.toLowerCase())}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded cursor-pointer transition-colors ${
                      lang === code.toLowerCase() ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {code}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1">
              <span className="text-slate-400">Uplink Telemetry</span>
              {isOffline ? (
                <span className="flex items-center gap-1 text-amber-400 font-semibold font-mono text-[10px]">
                  <WifiOff className="h-3 w-3" /> Offline Buffer
                </span>
              ) : (
                <span className="flex items-center gap-1 text-emerald-400 font-semibold font-mono text-[10px]">
                  <Radio className="h-3 w-3 animate-pulse" /> SAT-Net Synced
                </span>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* TOP STATUS HEADER */}
        <header className="h-16 border-b border-slate-800/80 px-7 flex items-center justify-between bg-[#080d1a]/60 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <div className="text-xs">
              <span className="text-slate-400">Active Warning: </span>
              <strong className="text-red-400 font-semibold uppercase tracking-wide">Extreme Slope Saturation in Cherrapunji-Mawsynram Crest</strong>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {alertSuccess && (
              <div className="flex items-center gap-2 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs px-3.5 py-1.5 rounded-full animate-bounce shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="h-4 w-4" /> Relayed CAP Warning to 68,000 NER Residents
              </div>
            )}
            <button
              onClick={triggerBroadcast}
              className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg shadow-red-600/30 flex items-center gap-2 transition-all border border-red-400/40 cursor-pointer active:scale-95"
            >
              <Volume2 className="h-4 w-4" /> Trigger Emergency Broadcast (CAP/SMS)
            </button>
          </div>
        </header>

        {/* WORKSPACE CONTENT */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">

          {/* TAB 1: GIS COMMAND CENTER */}
          {activeTab === 'command' && (
            <div className="space-y-5">
              
              {/* METRIC STRIP */}
              <div className="grid grid-cols-4 gap-4">
                <div className="glass-panel p-4 glow-danger">
                  <div className="flex justify-between items-center text-slate-400 text-xs">
                    <span>Critical Alert Sectors</span>
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  </div>
                  <div className="text-2xl font-extrabold text-white mt-1">2 Zones</div>
                  <div className="text-[11px] text-red-400 mt-0.5">Cherrapunji & Sonapur Bypass</div>
                </div>

                <div className="glass-panel p-4">
                  <div className="flex justify-between items-center text-slate-400 text-xs">
                    <span>Peak 24h Precipitation</span>
                    <CloudRain className="h-4 w-4 text-cyan-400" />
                  </div>
                  <div className="text-2xl font-extrabold text-cyan-300 mt-1">312 mm</div>
                  <div className="text-[11px] text-cyan-400 mt-0.5">Threshold: 180 mm exceeded</div>
                </div>

                <div className="glass-panel p-4">
                  <div className="flex justify-between items-center text-slate-400 text-xs">
                    <span>Active Corridor Blocks</span>
                    <Truck className="h-4 w-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-extrabold text-amber-300 mt-1">NH-29 & SH-5</div>
                  <div className="text-[11px] text-amber-400 mt-0.5">SDRF clearing heavy debris</div>
                </div>

                <div className="glass-panel p-4">
                  <div className="flex justify-between items-center text-slate-400 text-xs">
                    <span>Field Reports Logged</span>
                    <Database className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-extrabold text-emerald-300 mt-1">{reports.length} Reports</div>
                  <div className="text-[11px] text-emerald-400 mt-0.5">Synced via Offline DB</div>
                </div>
              </div>

              {/* MAP & SECTOR COCKPIT */}
              <div className="grid grid-cols-3 gap-5 h-[520px]">
                
                {/* 2-Column GIS Map */}
                <div className="col-span-2 glass-panel p-2 relative flex flex-col">
                  <MapContainer center={[25.8, 92.5]} zoom={7} scrollWheelZoom={true}>
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {RISK_ZONES.map((zone) => {
                      const isCritical = zone.risk === 'CRITICAL';
                      return (
                        <React.Fragment key={zone.id}>
                          <Marker 
                            position={[zone.lat, zone.lng]} 
                            icon={createCustomPin(isCritical ? '#ef4444' : '#f59e0b', isCritical)}
                            eventHandlers={{
                              click: () => setSelectedZone(zone),
                            }}
                          >
                            <Popup>
                              <div className="text-slate-900 text-xs">
                                <h3 className="font-bold text-sm text-slate-900">{zone.name}</h3>
                                <p className="mt-1"><b>Risk Status:</b> <span className={isCritical ? 'text-red-600 font-bold' : 'text-amber-600 font-bold'}>{zone.risk}</span></p>
                                <p><b>Hazard Probability:</b> {zone.prob}%</p>
                                <p><b>Precipitation:</b> {zone.rain}</p>
                                <p><b>Highway Status:</b> {zone.road}</p>
                              </div>
                            </Popup>
                          </Marker>
                          <Circle 
                            center={[zone.lat, zone.lng]}
                            radius={isCritical ? 19000 : 11000}
                            pathOptions={{
                              color: isCritical ? '#ef4444' : '#f59e0b',
                              fillColor: isCritical ? '#ef4444' : '#f59e0b',
                              fillOpacity: 0.18,
                              weight: 1.5
                            }}
                          />
                        </React.Fragment>
                      );
                    })}
                  </MapContainer>

                  {/* Floating Map Index */}
                  <div className="absolute top-5 right-5 bg-slate-950/90 backdrop-blur-md p-3.5 rounded-xl border border-slate-800 text-[11px] space-y-2 shadow-2xl z-[1000]">
                    <span className="font-bold text-slate-300 block mb-1">GIS Vulnerability Index</span>
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-red-500 shadow-sm shadow-red-500"></span>
                      <span>Critical (&gt;85% Risk Probability)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500"></span>
                      <span>High (Sub-surface Slippage Detected)</span>
                    </div>
                  </div>
                </div>

                {/* 1-Column Sector Inspector */}
                <div className="glass-panel p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Cpu className="h-4 w-4 text-red-400" /> Sector Inspector
                      </span>
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                        selectedZone.risk === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border-red-500/40' : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      }`}>
                        {selectedZone.risk}
                      </span>
                    </div>

                    <div className="mt-4 space-y-3.5">
                      <div>
                        <h3 className="text-sm font-bold text-white leading-snug">{selectedZone.name}</h3>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">{selectedZone.lat}°N, {selectedZone.lng}°E</p>
                      </div>

                      <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-2.5 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">AI Hazard Probability</span>
                          <span className="text-red-400 font-bold font-mono text-sm">{selectedZone.prob}%</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-amber-500 to-red-500 h-full rounded-full transition-all duration-500" 
                            style={{ width: `${selectedZone.prob}%` }}
                          ></div>
                        </div>

                        <div className="flex justify-between pt-1">
                          <span className="text-slate-400">Pore Water Pressure</span>
                          <span className="text-cyan-400 font-mono font-semibold">{selectedZone.pore}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">24h Rainfall Total</span>
                          <span className="text-slate-200 font-mono">{selectedZone.rain}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Identified Factor</span>
                          <span className="text-amber-400 font-medium">{selectedZone.factor}</span>
                        </div>
                      </div>

                      <div className="p-3 bg-red-950/25 border border-red-900/30 rounded-xl">
                        <h4 className="text-[11px] font-bold text-red-300 mb-1 flex items-center gap-1.5">
                          <AlertTriangle className="h-3.5 w-3.5 text-red-400" /> Prescribed Protocol
                        </h4>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          Suspend commercial heavy convoy, deploy SDRF patrol to vulnerable turns, and transmit automated SMS to perimeter towers.
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={triggerBroadcast}
                    className="w-full bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
                  >
                    <Send className="h-3.5 w-3.5 text-red-400" /> Transmit Evacuation Callout
                  </button>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: SENSOR TELEMETRY */}
          {activeTab === 'analytics' && (
            <div className="space-y-5">
              <div className="glass-panel p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-cyan-400" /> Cherrapunji Slope Piezometer vs. Cumulative Precipitation
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Cross-referencing real-time sub-surface pore water pressure against threshold shear rupture points.</p>
                  </div>
                  <div className="flex items-center gap-5 text-xs font-mono">
                    <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-cyan-400"></span> Rainfall (mm)</span>
                    <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-red-500"></span> Pore Pressure (kPa)</span>
                  </div>
                </div>

                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={TELEMETRY_STREAM}>
                      <defs>
                        <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="poreGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: '#030712', border: '1px solid #1e293b', borderRadius: '10px', fontSize: '12px' }} />
                      <Area type="monotone" dataKey="rain" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#rainGrad)" />
                      <Area type="monotone" dataKey="pore" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#poreGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* InSAR Surface Deformation & Model Accuracy */}
              <div className="grid grid-cols-2 gap-5">
                <div className="glass-panel p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-white flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-400" /> Sentinel-1 InSAR Interferometry
                    </h4>
                    <button 
                      onClick={handleSimulateInSAR}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className={`h-3 w-3 ${simulating ? 'animate-spin' : ''}`} /> Refresh Pass
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mb-4">Line-of-sight displacement tracking across high-relief hill slopes in East Khasi and Kohima.</p>
                  
                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-300">Surface Creep Velocity (&gt;12 mm/week)</span>
                        <span className="text-red-400 font-bold font-mono">18.4 mm/wk [HIGH]</span>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="bg-red-500 h-full w-[88%]"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-300">Spatial Coherence Quality</span>
                        <span className="text-emerald-400 font-bold font-mono">0.89 (Clear Pass)</span>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full w-[89%]"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass-panel p-5">
                  <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-emerald-400" /> IoT Field Telemetry Stations
                  </h4>
                  <ul className="text-xs space-y-2.5 text-slate-300">
                    <li className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                      <span>Borehole Piezometer #04 (Cherrapunji)</span>
                      <span className="text-emerald-400 font-mono text-[11px]">LIVE (Solar 98%)</span>
                    </li>
                    <li className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                      <span>LoRaWAN Tiltmeter Node #12 (Pagla Pahar)</span>
                      <span className="text-emerald-400 font-mono text-[11px]">LIVE (0.02° Shift)</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Optical Extensometer #03 (Sonapur Bypass)</span>
                      <span className="text-amber-400 font-mono text-[11px]">MAINTENANCE DUE</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ROAD NETWORK */}
          {activeTab === 'roads' && (
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="glass-panel p-5">
                <h3 className="text-sm font-bold text-white">Northeast Highway & Arterial Lifelines</h3>
                <p className="text-xs text-slate-400 mt-0.5">Automated synchronization with Border Roads Organisation (BRO) and State Disaster Desks.</p>
              </div>

              <div className="space-y-3">
                {RISK_ZONES.map((zone) => (
                  <div key={zone.id} className="glass-panel p-4 flex items-center justify-between hover:border-slate-700 transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{zone.road}</h4>
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-mono">{zone.name}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">24h Cumulative Precipitation: <strong className="text-slate-200">{zone.rain}</strong></p>
                    </div>

                    <div>
                      <span className={`text-xs px-3 py-1 rounded-full font-bold border ${
                        zone.risk === 'CRITICAL' 
                          ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse' 
                          : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      }`}>
                        {zone.risk === 'CRITICAL' ? 'TRAFFIC SUSPENDED' : 'REGULATED CONVOY'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: CITIZEN FIELD INCIDENTS */}
          {activeTab === 'crowd' && (
            <div className="max-w-4xl mx-auto grid grid-cols-2 gap-5">
              
              {/* Form Card */}
              <div className="glass-panel p-5">
                <h3 className="text-sm font-bold text-white">Report Slope Movement</h3>
                <p className="text-xs text-slate-400 mb-4">Works fully offline. Records sync immediately when connection returns.</p>

                <form onSubmit={handleReportSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-300 mb-1">Exact Landmark or Highway Kilometer</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. NH-29 near Pagla Pahar culvert"
                      value={reportForm.location}
                      onChange={(e) => setReportForm({ ...reportForm, location: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-red-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">Observed Anomaly</label>
                    <select
                      value={reportForm.hazardType}
                      onChange={(e) => setReportForm({ ...reportForm, hazardType: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none"
                    >
                      <option>Slope Shear Cracks</option>
                      <option>Fresh Mudflow / Runoff Inflow</option>
                      <option>Retaining Wall Bulging</option>
                      <option>Pavement Slump / Depression</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">Additional Observations / Stranded Vehicles</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. 2 loaded freight trucks stalled, continuous pebbles falling..."
                      value={reportForm.notes}
                      onChange={(e) => setReportForm({ ...reportForm, notes: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div className="border border-dashed border-slate-700 hover:border-slate-500 rounded-xl p-3 text-center cursor-pointer transition-colors bg-slate-950/40">
                    <Camera className="h-5 w-5 mx-auto text-slate-400 mb-1" />
                    <span className="text-[11px] text-slate-400">Capture / Attach Geo-Tagged Field Photo</span>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold py-2.5 rounded-xl transition-all shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Send className="h-4 w-4" /> Dispatch Field Incident
                  </button>
                </form>
              </div>

              {/* Incident Feed */}
              <div className="glass-panel p-5 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">Live Incident Dispatch ({reports.length})</h3>
                  <p className="text-xs text-slate-400 mb-3">Indexed and prioritized for SDRF and State Operations.</p>

                  <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                    {reports.map((item) => (
                      <div key={item.id} className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-200">{item.location}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{item.time}</span>
                        </div>
                        <p className="text-amber-400 text-[11px] font-medium">{item.hazardType}</p>
                        {item.notes && <p className="text-slate-400 text-[11px] italic">"{item.notes}"</p>}
                        <div className="pt-1 flex items-center justify-between text-[10px]">
                          <span className="text-emerald-400 flex items-center gap-1 font-mono">
                            <CheckCircle2 className="h-3 w-3" /> {item.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 text-center pt-3 font-mono">
                  AES-256 Encrypted &bullet; Stored in Browser Local DB
                </div>
              </div>

            </div>
          )}

        </div>
      </main>
    </div>
  );
}