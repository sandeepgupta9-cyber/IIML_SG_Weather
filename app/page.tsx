 "use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, MapPin, Clock3, Sun, CloudSun, Cloud, CloudRain, CloudSnow, CloudLightning, Wind, Droplets, Sunrise, Sunset, Compass, CalendarDays, Globe2, ThermometerSun, Umbrella, Mountain, Camera, Bike, Waves, Footprints, RefreshCw } from "lucide-react";

type Place = { name: string; country: string; admin1?: string; latitude: number; longitude: number; timezone: string };
type Weather = { current: any; hourly: any; daily: any; timezone: string };
const IST = "Asia/Kolkata";
const codeText = (c:number) => c===0?"Clear sky":c<=2?"Partly cloudy":c===3?"Overcast":c<=48?"Fog":c<=57?"Drizzle":c<=67?"Rain":c<=77?"Snow":c<=82?"Rain showers":c<=86?"Snow showers":c>=95?"Thunderstorm":"Cloudy";
function WeatherIcon({code,size=22}:{code:number,size?:number}) {
  if(code===0) return <Sun size={size}/>;
  if(code<=2) return <CloudSun size={size}/>;
  if(code===3 || code<=48) return <Cloud size={size}/>;
  if(code<=67 || code<=82) return <CloudRain size={size}/>;
  if(code<=86) return <CloudSnow size={size}/>;
  return <CloudLightning size={size}/>;
}
const fmt = (v:number, unit="°") => `${Math.round(v)}${unit}`;
function localTime(date:string, tz:string, opts:Intl.DateTimeFormatOptions={hour:"2-digit",minute:"2-digit"}) {
  return new Intl.DateTimeFormat("en-IN",{...opts,timeZone:tz}).format(new Date(date));
}
function dayName(date:string,tz:string,opts:Intl.DateTimeFormatOptions={weekday:"short",day:"numeric",month:"short"}) {
  return new Intl.DateTimeFormat("en-IN",{...opts,timeZone:tz}).format(new Date(date+"T12:00:00"));
}
function activityIdeas(code:number,temp:number,wind:number) {
  if(code>=95 || wind>45) return [{icon:"indoors",title:"Indoor museums & galleries",desc:"Choose sheltered cultural attractions."},{icon:"food",title:"Local food trail",desc:"Explore cafés, markets and regional cuisine."},{icon:"relax",title:"Spa or wellness",desc:"A relaxed indoor day is the safer choice."}];
  if(code>=51 && code<=86) return [{icon:"umbrella",title:"Covered heritage sites",desc:"Prioritise forts, temples and covered landmarks."},{icon:"food",title:"Food and café hopping",desc:"Enjoy local flavours between showers."},{icon:"museum",title:"Museums & indoor experiences",desc:"Keep a flexible plan and carry an umbrella."}];
  if(temp>=34) return [{icon:"sunrise",title:"Early-morning sightseeing",desc:"Visit outdoor landmarks before the midday heat."},{icon:"water",title:"Waterfront or shaded gardens",desc:"Choose breezy, shaded places and hydrate."},{icon:"museum",title:"Afternoon indoor break",desc:"Plan museums or cafés during peak heat."}];
  if(temp<12) return [{icon:"walk",title:"Short scenic walks",desc:"Layer up and explore in the warmer part of the day."},{icon:"museum",title:"Museums & heritage interiors",desc:"Mix outdoor stops with warm indoor breaks."},{icon:"food",title:"Local cafés and cuisine",desc:"Try seasonal food and warm drinks."}];
  return [{icon:"walk",title:"Walking tours",desc:"Comfortable conditions for exploring neighbourhoods."},{icon:"camera",title:"Viewpoints & photography",desc:"Good conditions for outdoor sightseeing."},{icon:"bike",title:"Cycling or nature trails",desc:"Enjoy parks and scenic routes if trails are open."}];
}
function ActivityIcon({name}:{name:string}) {
  if(name==="umbrella") return <Umbrella/>; if(name==="sunrise") return <Sunrise/>; if(name==="water") return <Waves/>; if(name==="camera") return <Camera/>; if(name==="bike") return <Bike/>; if(name==="walk") return <Footprints/>; return <Compass/>;
}
export default function Home() {
  const [query,setQuery]=useState("Gurugram");
  const [place,setPlace]=useState<Place>({name:"Gurugram",country:"India",admin1:"Haryana",latitude:28.4595,longitude:77.0266,timezone:"Asia/Kolkata"});
  const [results,setResults]=useState<Place[]>([]);
  const [weather,setWeather]=useState<Weather|null>(null);
  const [attractions,setAttractions]=useState<any[]>([]);
  const [tab,setTab]=useState("hourly");
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const [now,setNow]=useState(new Date());
  const [searching,setSearching]=useState(false);

  useEffect(()=>{const t=setInterval(()=>setNow(new Date()),30000);return()=>clearInterval(t)},[]);
  const search=async(e?:React.FormEvent)=>{
    e?.preventDefault(); if(!query.trim()) return;
    setSearching(true);setError("");
    try {
      const r=await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=en&format=json`);
      const d=await r.json(); setResults((d.results||[]).map((x:any)=>({name:x.name,country:x.country||"",admin1:x.admin1,latitude:x.latitude,longitude:x.longitude,timezone:x.timezone||"UTC"})));
      if(!d.results?.length) setError("No matching places found. Try a city or town name.");
    } catch {setError("Location search failed. Please try again.");} finally{setSearching(false);}
  };
  const loadPlace=useCallback(async(p:Place)=>{
    setPlace(p);setQuery(p.name);setResults([]);setLoading(true);setError("");
    try {
      const url=`https://api.open-meteo.com/v1/forecast?latitude=${p.latitude}&longitude=${p.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation_probability,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset,uv_index_max&forecast_days=16&timezone=${encodeURIComponent(p.timezone)}`;
      const [wr,ar]=await Promise.all([
        fetch(url),
        fetch(`https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${p.latitude}|${p.longitude}&gsradius=10000&gslimit=12&format=json&origin=*`)
      ]);
      if(!wr.ok) throw new Error("Weather service unavailable");
      setWeather(await wr.json());
      const ad=await ar.json();setAttractions(ad.query?.geosearch||[]);
    } catch(e:any){setError(e.message||"Could not load this destination.");setWeather(null);}
    finally{setLoading(false);}
  },[]);
  useEffect(()=>{loadPlace(place)},[]); // initial forecast
  const current=weather?.current;
  const hourItems=useMemo(()=>weather?.hourly?.time?.map((t:string,i:number)=>({time:t,temp:weather.hourly.temperature_2m[i],rain:weather.hourly.precipitation_probability[i],code:weather.hourly.weather_code[i],wind:weather.hourly.wind_speed_10m[i]})).filter((x:any)=>new Date(x.time)>=new Date()).slice(0,24)||[],[weather]);
  const days=useMemo(()=>weather?.daily?.time?.map((t:string,i:number)=>({date:t,code:weather.daily.weather_code[i],max:weather.daily.temperature_2m_max[i],min:weather.daily.temperature_2m_min[i],rain:weather.daily.precipitation_probability_max[i],sunrise:weather.daily.sunrise[i],sunset:weather.daily.sunset[i],uv:weather.daily.uv_index_max[i]}))||[],[weather]);
  const ideas=activityIdeas(current?.weather_code??0,current?.temperature_2m??22,current?.wind_speed_10m??0);
  const localNow=new Intl.DateTimeFormat("en-IN",{timeZone:place.timezone,dateStyle:"medium",timeStyle:"medium"}).format(now);
  const istNow=new Intl.DateTimeFormat("en-IN",{timeZone:IST,dateStyle:"medium",timeStyle:"medium"}).format(now);
  const monthlyDays=days.slice(0,16);
  return <main className="shell">
    <header className="topbar"><a className="brand" href="#"><span className="brandmark"><CloudSun/></span><span>Weather<span className="brand-accent">Now</span></span></a><div className="topnote"><Globe2 size={16}/> Weather meets discovery</div></header>
    <section className="hero">
      <div className="hero-copy"><div className="eyebrow">YOUR WEATHER. YOUR NEXT ADVENTURE.</div><h1>Explore the world,<br/><em>one forecast at a time.</em></h1><p>Live conditions, useful forecasts and ideas for making the most of every destination.</p></div>
      <form className="searchbox" onSubmit={search}><Search size={20}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search city, town or destination…"/><button disabled={searching}>{searching?"Searching…":"Search"}</button></form>
      {results.length>0&&<div className="results">{results.map((r,i)=><button key={i} onClick={()=>loadPlace(r)}><MapPin size={16}/><span><b>{r.name}</b><small>{[r.admin1,r.country].filter(Boolean).join(", ")}</small></span><span className="result-tz">{r.timezone}</span></button>)}</div>}
      {error&&<div className="error">{error}</div>}
    </section>
    <section className="place-row"><div><div className="eyebrow muted">CURRENT DESTINATION</div><h2><MapPin size={22}/>{place.name}</h2><p>{[place.admin1,place.country].filter(Boolean).join(", ")}</p></div><button className="refresh" onClick={()=>loadPlace(place)} disabled={loading}><RefreshCw size={16}/>{loading?"Updating":"Refresh"}</button></section>
    <section className="clocks">
      <div className="clock-card"><span><Clock3 size={16}/> LOCAL TIME</span><strong>{localTime(now.toISOString(),place.timezone,{hour:"2-digit",minute:"2-digit",second:"2-digit"})}</strong><small>{localNow}</small></div>
      <div className="clock-card"><span><Globe2 size={16}/> INDIA STANDARD TIME</span><strong>{localTime(now.toISOString(),IST,{hour:"2-digit",minute:"2-digit",second:"2-digit"})}</strong><small>{istNow}</small></div>
      <div className="clock-card timezone"><span>TIME ZONE</span><strong>{place.timezone}</strong><small>Local destination time compared with IST</small></div>
    </section>
    {loading&&!weather?<div className="loading">Loading forecast and destination highlights…</div>:weather&&current&&<>
      <section className="current-grid">
        <div className="current-card">
          <div className="current-head"><span>NOW IN {place.name.toUpperCase()}</span><span className="live-dot">LIVE</span></div>
          <div className="current-main"><div><div className="big-temp">{fmt(current.temperature_2m)}</div><div className="condition">{codeText(current.weather_code)}</div><div className="feels">Feels like {fmt(current.apparent_temperature)}</div></div><div className="weather-symbol"><WeatherIcon code={current.weather_code} size={76}/></div></div>
          <div className="metrics"><div><Droplets/><span>Humidity</span><b>{current.relative_humidity_2m}%</b></div><div><Wind/><span>Wind</span><b>{Math.round(current.wind_speed_10m)} km/h</b></div><div><Umbrella/><span>Precipitation</span><b>{current.precipitation} mm</b></div></div>
        </div>
        <div className="today-card"><div className="card-title">TODAY AT A GLANCE</div><div className="range"><span>High</span><b>{fmt(days[0]?.max??0)}</b><span className="rangebar"><i/></span><b>{fmt(days[0]?.min??0)}</b><span>Low</span></div><div className="sunrow"><div><Sunrise/><span>Sunrise</span><b>{days[0]?.sunrise?localTime(days[0].sunrise,place.timezone):"—"}</b></div><div><Sunset/><span>Sunset</span><b>{days[0]?.sunset?localTime(days[0].sunset,place.timezone):"—"}</b></div></div><div className="uv"><span>Maximum UV index</span><b>{days[0]?.uv??"—"}</b></div></div>
      </section>
      <section className="forecast-section"><div className="section-heading"><div><div className="eyebrow muted">PLAN AHEAD</div><h2>Forecast outlook</h2></div><div className="tabs">{["hourly","daily","weekly","monthly"].map(t=><button key={t} className={tab===t?"active":""} onClick={()=>setTab(t)}>{t[0].toUpperCase()+t.slice(1)}</button>)}</div></div>
        {tab==="hourly"&&<div className="hour-strip">{hourItems.map((h:any,i:number)=><div className="hour" key={h.time}><span>{i===0?"Now":localTime(h.time,place.timezone)}</span><WeatherIcon code={h.code}/><b>{fmt(h.temp)}</b><small><Droplets size={12}/>{h.rain}%</small></div>)}</div>}
        {tab==="daily"&&<div className="daily-list">{days.slice(0,7).map((d:any,i:number)=><div className="daily-row" key={d.date}><b>{i===0?"Today":dayName(d.date,place.timezone,{weekday:"long"})}</b><WeatherIcon code={d.code}/><span>{codeText(d.code)}</span><small><Droplets size={13}/>{d.rain}%</small><div className="minmax"><span>{fmt(d.min)}</span><i><b style={{left:`${Math.max(0,Math.min(85,(d.min+5)*2))}%`,width:`${Math.max(12,Math.min(90,(d.max-d.min)*4))}%`}}/></i><strong>{fmt(d.max)}</strong></div></div>)}</div>}
        {tab==="weekly"&&<div className="week-grid">{days.slice(0,7).map((d:any,i:number)=><div className="week-card" key={d.date}><span>{i===0?"Today":dayName(d.date,place.timezone,{weekday:"short"})}</span><WeatherIcon code={d.code} size={28}/><b>{fmt(d.max)}</b><small>{fmt(d.min)} / min</small><label><Droplets size={12}/>{d.rain}% rain</label></div>)}</div>}
        {tab==="monthly"&&<><div className="month-note"><CalendarDays size={17}/> Extended outlook: daily forecast data is available for the next 16 days. Reliable day-by-day weather forecasts for a full month are not available this far ahead.</div><div className="month-grid">{monthlyDays.map((d:any,i:number)=><div className="month-day" key={d.date}><span>{dayName(d.date,place.timezone,{day:"numeric",month:"short"})}</span><WeatherIcon code={d.code}/><b>{fmt(d.max)}</b><small>{fmt(d.min)}</small></div>)}</div></>}
      </section>
      <section className="discover-grid"><div className="discover-card"><div className="section-heading compact"><div><div className="eyebrow muted">EXPLORE THIS DESTINATION</div><h2>Top nearby attractions</h2></div><Compass/></div><p className="subtext">Popular places around {place.name}, sourced from nearby Wikipedia place listings. Check local access and opening hours before visiting.</p>{attractions.length?<div className="attraction-list">{attractions.slice(0,8).map((a:any)=><a key={a.pageid} href={`https://en.wikipedia.org/?curid=${a.pageid}`} target="_blank" rel="noreferrer"><span className="attraction-icon"><MapPin/></span><span><b>{a.title}</b><small>{(a.dist/1000).toFixed(1)} km away · View details ↗</small></span></a>)}</div>:<div className="empty">No nearby attraction listings were returned for this location.</div>}</div>
      <div className="discover-card activities"><div className="section-heading compact"><div><div className="eyebrow muted">WEATHER-AWARE IDEAS</div><h2>What to do today</h2></div><ThermometerSun/></div><p className="subtext">Suggestions adapt to today's weather, temperature and wind conditions.</p><div className="idea-list">{ideas.map((a,i)=><div className="idea" key={i}><span className="idea-icon"><ActivityIcon name={a.icon}/></span><div><b>{a.title}</b><p>{a.desc}</p></div></div>)}</div><div className="weather-tip"><b>Quick tip</b><p>{current.weather_code>=51?"Rain is possible: carry an umbrella and keep an indoor backup plan.":current.temperature_2m>=34?"It's hot: carry water, use sun protection and schedule outdoor plans early.":current.wind_speed_10m>30?"Windy conditions: check local advisories before outdoor or water activities.":"Check local advisories and attraction timings before setting out."}</p></div></div></section>
    </>}
    <footer><span>WeatherNow</span><span>Weather data: Open-Meteo · Nearby places: Wikipedia</span><span>Times shown in destination local time and IST</span></footer>
  </main>;
}