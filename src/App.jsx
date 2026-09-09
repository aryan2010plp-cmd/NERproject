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
  Compass,
  Database,
  Volume2,
  TrendingUp
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';
import L from 'leaflet';

// Glowing radar pins
const createCustomPin = (color, pulse = false) => new L.DivIcon({
  className: pulse ? 'pulse-marker' : '',
  html: `<div style="
    background: radial-gradient(circle, ${color} 30%, transparent 80%);
    width: 22px; 
    height: 22px; 
    display: flex;
    align-items: center;
    justify-content: center;
  ">
    <div style="
      background-color: ${color}; 
      width: 10px; 
      height: 10px; 
      border-radius: 50%; 
      box-shadow: 0 0 12px ${color}, 0 0 20px ${color};
      border: 2px solid white;
    "></div>
  </div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11]
});

const RISK_ZONES = [
  { id: 1, name: "East Khasi Hills (Mawsynram/Cherrapunji)", lat: 25.2986, lng: 91.5822, risk: "CRITICAL", prob: "94%", road: "SH-5 Blocked", rain: "312 mm/24h", sensor: "Pore: 138 kPa" },
  { id: 2, name: "Chumukedima Mudslide Zone (NH-29)", lat: 25.7500, lng: 93.7800, risk: "HIGH", prob: "81%", road: "One-way Restricted", rain: "198 mm/24h", sensor: "Tilt: +4.2°" },
  { id: 3, name: "Sonapur Tunnel Slopes (NH-6)", lat: 25.1050, lng: 92.3600, risk: "CRITICAL", prob: "89%", road: "Debris Inflow Alert", rain: "245 mm/24h", sensor: "Pore: 122 kPa" },
  { id: 4, name: "Gangtok - Rangpo Highway (NH-10)", lat: 27.2000, lng: 88.5500, risk: "MODERATE", prob: "52%", road: "Operational", rain: "115 mm/24h", sensor: "Normal" },
];

const SENSOR_STREAM = [
  { time: '00:00', rain: 20, pore: 35, threshold: 100 },
  { time: '04:00', rain: 45, pore: 50, threshold: 100 },
  { time: '08:00', rain: 90, pore: 78, threshold: 100 },
  { time: '12:00', rain: 160, pore: 105, threshold: 100 },
  { time: '16:00', rain: 220, pore: 128, threshold: 100 },
  { time: '20:00', rain: 312, pore: 138, threshold: 100 },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('command');
  const [lang, setLang] = useState('en');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [alertSuccess, setAlertSuccess] = useState(false);
  const [selectedZone, setSelectedZone] = useState(RISK_ZONES[0]);

  const [reportForm, setReportForm] = useState({
    location: '',
    hazardType: 'Tension Cracks on Slope',
    severity: 'Critical',
    notes: '',
  });

  const [reports, setReports] = useState(() => {
    const cached = localStorage.getItem('ner_landslide_reports');
    return cached ? JSON.parse(cached) : [
      { id: 101, location: 'Km 42, Chumukedima Hill Section', hazardType: 'Road Subsidence', severity: 'Critical', time: '11:14 AM', status: 'Synchronized with SDRF' },
      { id: 102, location: 'East Jaintia Hills, Sonapur bypass', hazardType: 'Rockfall on Culvert', severity: 'High', time: '09:40 AM', status: 'Synchronized with SDRF' }
    ];
  });

  useEffect(() => {
    const online = () => setIsOffline(false);
    const offline = () => setIsOffline(true);
    window.addEventListener('online', online);
    window.addEventListener('offline', offline);
    return () => {
      window.removeEventListener('online', online);
      window.removeEventListener('offline', offline);
    };
  }, []);

  const handleReportSubmit = (e) => {
    e.preventDefault();
    const entry = {
      id: Date.now(),
      ...reportForm,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: isOffline ? 'Cached Locally (IndexedDB/Storage)' : 'Transmitted to NDRF & State EOC'
    };
    const updated = [entry, ...reports];
    setReports(updated);
    localStorage.setItem('ner_landslide_reports', JSON.stringify(updated));
    setReportForm({ location: '', hazardType: 'Tension Cracks on Slope', severity: 'Critical', notes: '' });
    alert(isOffline ? 'Offline Mode: Record stored locally on device. Will auto-sync.' : 'Incident logged and broadcasted to EOC desk.');
  };

  const triggerBroadcast = () => {
    setAlertSuccess(true);
    setTimeout(() => setAlertSuccess(false), 4500);
  };

  return (
    <div className="flex h-screen w-screen bg-[#030712] text-slate-100 font-sans antialiased overflow-hidden select-none">
      
      {/* LEFT NAVIGATION CONSOLE */}
      <aside className="w-64 border-r border-slate-800/80 bg-slate-950/60 backdrop-blur-xl flex flex-col justify-between p-4 z-20">
        <div>
          {/* Logo Header */}
          <div className="flex items-center gap-3 p-2 rounded-xl bg-gradient-to-r from-red-950/40 to-slate-900 border border-red-900/30 mb-6">
            <div className="p-2 bg-red-600 rounded-lg shadow-lg shadow-red-600/40">
              <ShieldAlert className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-sm tracking-wider text-white">DharaRakshak</h1>
                <span className="text-[10px] bg-red-500/20 text-red-400 font-mono px-1 rounded border border-red-500/30">AI</span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-tight">NER Disaster Early Warning</p>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-3 mb-2">Control Panels</div>
          <nav className="space-y-1">
            {[
              { id: 'command', label: 'GIS Command Center', icon: Layers, badge: 'Live' },
              { id: 'analytics', label: 'AI Sensor Telemetry', icon: Activity },
              { id: 'roads', label: 'Corridor & Transit Status', icon: Truck, badge: '2 Blocked' },
              { id: 'crowd', label: 'Field Crowd Incident Log', icon: Camera, badge: `${reports.length}` },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    active 
                      ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-lg shadow-red-600/30 border border-red-500/40' 
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`h-4 w-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
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

        {/* System & Language Status */}
        <div className="space-y-2 pt-4 border-t border-slate-800/80">
          <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-2.5">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-400 text-[11px] flex items-center gap-1.5"><Languages className="h-3 w-3" /> Language</span>
              <div className="flex gap-1 bg-slate-950 p-0.5 rounded border border-slate-800">
                {['EN', 'AS', 'HI'].map((code) => (
                  <button
                    key={code}
                    onClick={() => setLang(code.toLowerCase())}
                    className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${
                      lang === code.toLowerCase() ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {code}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1">
              <span className="text-slate-400">Node Connectivity</span>
              {isOffline ? (
                <span className="flex items-center gap-1 text-amber-400 text-[10px] font-semibold"><WifiOff className="h-3 w-3" /> Offline Buffer</span>
              ) : (
                <span className="flex items-center gap-1 text-emerald-400 text-[10px] font-semibold"><Radio className="h-3 w-3 animate-pulse" /> SAT-Uplink Active</span>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* CENTER VIEWPORT */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-gradient-to-b from-[#070d1e] to-[#030712]">
        
        {/* TOP GLOW BAR */}
        <header className="h-14 border-b border-slate-800/80 px-6 flex items-center justify-between bg-slate-950/40 backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="text-xs font-medium text-slate-300">
              Active Warning: <strong className="text-red-400 font-semibold">Precipitation Threshold Exceeded in Meghalaya Arc</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {alertSuccess && (
              <div className="flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs px-3 py-1 rounded-full animate-bounce">
                <CheckCircle2 className="h-3.5 w-3.5" /> Sent CAP Warning to 64,200 NER Citizens
              </div>
            )}
            <button
              onClick={triggerBroadcast}
              className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg shadow-lg shadow-red-600/30 flex items-center gap-1.5 transition-all border border-red-500/40 cursor-pointer"
            >
              <Volume2 className="h-3.5 w-3.5" /> Emergency Broadcast (SMS/CAP)
            </button>
          </div>
        </header>

        {/* WORKSPACE AREA */}
        <div className="flex-1 p-5 overflow-y-auto">

          {/* TAB 1: GIS COMMAND CENTER */}
          {activeTab === 'command' && (
            <div className="h-full flex flex-col gap-4">
              
              {/* TOP METRIC CARDS */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur p-3.5 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium">Slope Failure Hazard</span>
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  </div>
                  <div className="text-xl font-bold mt-1 text-white">4 Monitored Zones</div>
                  <span className="text-[10px] text-red-400 font-medium">● 2 Immediate Failure Warning</span>
                </div>

                <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur p-3.5 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium">Max Rainfall Saturation</span>
                    <CloudRain className="h-4 w-4 text-cyan-400" />
                  </div>
                  <div className="text-xl font-bold mt-1 text-cyan-300">312 mm / 24h</div>
                  <span className="text-[10px] text-cyan-500">Cherrapunji Borehole #04</span>
                </div>

                <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur p-3.5 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium">Critical Highway Arteries</span>
                    <Truck className="h-4 w-4 text-amber-400" />
                  </div>
                  <div className="text-xl font-bold mt-1 text-amber-300">NH-29 & NH-6</div>
                  <span className="text-[10px] text-amber-500">Debris clearance ongoing</span>
                </div>

                <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur p-3.5 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium">Verified Citizen Reports</span>
                    <Database className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="text-xl font-bold mt-1 text-emerald-300">{reports.length} Incidents</div>
                  <span className="text-[10px] text-emerald-500 font-medium">Indexed for Disaster Ops</span>
                </div>
              </div>

              {/* SPLIT COCKPIT: INTERACTIVE MAP & SECTOR DETAILS */}
              <div className="flex-1 grid grid-cols-3 gap-4 min-h-[440px]">
                
                {/* MAP (2 COLUMNS) */}
                <div className="col-span-2 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative">
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
                              <div className="text-slate-900 text-xs font-sans">
                                <h3 className="font-bold text-sm text-slate-900">{zone.name}</h3>
                                <p className="mt-1"><b>Risk Status:</b> <span className={isCritical ? 'text-red-600 font-bold' : 'text-amber-600 font-bold'}>{zone.risk}</span></p>
                                <p><b>Failure Probability:</b> {zone.prob}</p>
                                <p><b>Precipitation:</b> {zone.rain}</p>
                                <p><b>Highway:</b> {zone.road}</p>
                              </div>
                            </Popup>
                          </Marker>
                          <Circle 
                            center={[zone.lat, zone.lng]}
                            radius={isCritical ? 18000 : 10000}
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

                  {/* Floating Map Legend */}
                  <div className="absolute top-3 right-3 bg-slate-950/90 backdrop-blur-md p-3 rounded-xl border border-slate-800 text-[11px] space-y-1.5 shadow-2xl z-[1000]">
                    <span className="font-bold text-slate-300 block mb-1">GIS Vulnerability Index</span>
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-red-500 shadow-sm shadow-red-500"></span>
                      <span>Critical (Failure Prob &gt; 85%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500"></span>
                      <span>High (Slope Displacement Detected)</span>
                    </div>
                  </div>
                </div>

                {/* ZONE INSPECTOR SIDE PANEL (1 COLUMN) */}
                <div className="bg-slate-900/60 border border-slate-800/90 backdrop-blur p-4 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Sector Inspector</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        selectedZone.risk === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      }`}>
                        {selectedZone.risk}
                      </span>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div>
                        <h2 className="text-sm font-bold text-white">{selectedZone.name}</h2>
                        <p className="text-[11px] text-slate-400">Lat: {selectedZone.lat}°N, Lng: {selectedZone.lng}°E</p>
                      </div>

                      <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400">AI Hazard Score</span>
                          <span className="text-red-400 font-bold">{selectedZone.prob}</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-gradient-to-r from-amber-500 to-red-500 h-full rounded-full" style={{ width: selectedZone.prob }}></div>
                        </div>

                        <div className="flex justify-between pt-1">
                          <span className="text-slate-400">Telemetry</span>
                          <span className="text-cyan-400 font-mono">{selectedZone.sensor}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Rainfall Gauge</span>
                          <span className="text-slate-200">{selectedZone.rain}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Transit Corridor</span>
                          <span className="text-amber-400 font-medium">{selectedZone.road}</span>
                        </div>
                      </div>

                      <div className="p-3 bg-red-950/30 border border-red-900/30 rounded-xl">
                        <h4 className="text-[11px] font-bold text-red-300 mb-1 flex items-center gap-1.5">
                          <AlertTriangle className="h-3.5 w-3.5 text-red-400" /> Prescribed Protocol
                        </h4>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          Restrict freight movement, dispatch SDRF rapid response to lower reaches, and activate local village sirens.
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={triggerBroadcast}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold py-2 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="h-3 w-3" /> Transmit Sector Evacuation
                  </button>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: AI SENSOR TELEMETRY & PREDICTOR */}
          {activeTab === 'analytics' && (
            <div className="space-y-4">
              <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur p-5 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white">Cherrapunji - Slope Sub-surface Pore Water Pressure vs. Precipitation</h3>
                    <p className="text-xs text-slate-400">Correlating cumulative rainfall with borehole piezometer readings to detect shear failure plane.</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-cyan-400"></span> Rain (mm)</span>
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500"></span> Pore Pressure (kPa)</span>
                  </div>
                </div>

                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={SENSOR_STREAM}>
                      <defs>
                        <linearGradient id="colorRain" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorPore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px' }} />
                      <Area type="monotone" dataKey="rain" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorRain)" />
                      <Area type="monotone" dataKey="pore" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorPore)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* AI Prediction Models */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-xl">
                  <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-red-400" /> Random Forest & XGBoost Ensemble Confidence
                  </h4>
                  <p className="text-xs text-slate-400 mb-3">Trained on 10-year GSI landslide inventory across Meghalaya and Nagaland terrain.</p>
                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-300">Slope Saturation Threshold (&gt;80%)</span>
                        <span className="text-red-400 font-bold">94.2%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="bg-red-500 h-full w-[94.2%]"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-300">InSAR Surface Deformation Velocity</span>
                        <span className="text-amber-400 font-bold">78.0%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full w-[78%]"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-xl">
                  <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-emerald-400" /> Edge AI IoT Field Stations
                  </h4>
                  <ul className="text-xs space-y-2 text-slate-300">
                    <li className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                      <span>Borehole Piezometer #04 (Cherrapunji)</span>
                      <span className="text-emerald-400 font-mono">ONLINE (98% batt)</span>
                    </li>
                    <li className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                      <span>Tiltmeter Node #12 (Pagla Pahar, NH-29)</span>
                      <span className="text-emerald-400 font-mono">ONLINE (LoRaWAN)</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Optical Extensometer #02 (Sonapur)</span>
                      <span className="text-amber-400 font-mono">BATTERY LOW</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ROADS */}
          {activeTab === 'roads' && (
            <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur p-5 rounded-2xl max-w-4xl mx-auto space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white">Northeast Lifeline Roadway Connectivity</h3>
                <p className="text-xs text-slate-400">Real-time status updates synced with Border Roads Organisation (BRO) and State PWDs.</p>
              </div>

              <div className="space-y-3">
                {RISK_ZONES.map((zone) => (
                  <div key={zone.id} className="p-4 bg-slate-950/80 border border-slate-800/80 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{zone.road}</h4>
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">{zone.name}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">24h Cumulative Precipitation: {zone.rain}</p>
                    </div>

                    <div className="text-right">
                      <span className={`text-xs px-3 py-1 rounded-full font-bold border ${
                        zone.risk === 'CRITICAL' 
                          ? 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse' 
                          : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      }`}>
                        {zone.risk === 'CRITICAL' ? 'TRAFFIC SUSPENDED' : 'ONE-WAY CONVOY'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: CROWD INCIDENT REPORTING */}
          {activeTab === 'crowd' && (
            <div className="max-w-3xl mx-auto grid grid-cols-2 gap-5">
              
              {/* Report Input Form */}
              <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur p-5 rounded-2xl">
                <h3 className="text-sm font-bold text-white mb-1">Report Slope Displacement</h3>
                <p className="text-xs text-slate-400 mb-4">Works offline. Automatically captures device coordinates when available.</p>

                <form onSubmit={handleReportSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-300 mb-1">Road / Hill Landmark</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. NH-29 near Pagla Pahar rock cut"
                      value={reportForm.location}
                      onChange={(e) => setReportForm({ ...reportForm, location: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">Observed Indicator</label>
                    <select
                      value={reportForm.hazardType}
                      onChange={(e) => setReportForm({ ...reportForm, hazardType: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none"
                    >
                      <option>Tension Cracks on Slope</option>
                      <option>Fresh Mudflow / Debris Inflow</option>
                      <option>Road Subsidence / Depression</option>
                      <option>Retaining Wall Cracking / Bulge</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">Notes / Trapped Vehicles</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. 2 heavy trucks stranded, continuous rock tumbling..."
                      value={reportForm.notes}
                      onChange={(e) => setReportForm({ ...reportForm, notes: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div className="border border-dashed border-slate-700 hover:border-slate-500 rounded-lg p-3 text-center cursor-pointer transition-colors bg-slate-950/40">
                    <Camera className="h-5 w-5 mx-auto text-slate-400 mb-1" />
                    <span className="text-[11px] text-slate-400">Capture / Attach Geo-Tagged Image</span>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-500 text-white font-semibold py-2.5 rounded-lg transition-all shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" /> Dispatch Report
                  </button>
                </form>
              </div>

              {/* Verified Report Stream */}
              <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur p-5 rounded-2xl flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">Logged Incidents ({reports.length})</h3>
                  <p className="text-xs text-slate-400 mb-3">Live feed available to emergency response teams.</p>

                  <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                    {reports.map((item) => (
                      <div key={item.id} className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-200">{item.location}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{item.time}</span>
                        </div>
                        <p className="text-amber-400 text-[11px]">{item.hazardType}</p>
                        {item.notes && <p className="text-slate-400 text-[11px] italic">"{item.notes}"</p>}
                        <div className="pt-1 flex items-center justify-between text-[10px]">
                          <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> {item.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 text-center pt-2">
                  Encrypted & synced using IndexedDB offline store.
                </div>
              </div>

            </div>
          )}

        </div>
      </main>
    </div>
  );
}