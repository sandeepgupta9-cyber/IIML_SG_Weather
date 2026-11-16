# WeatherNow — Weather & Explore

A responsive Next.js 14 weather and destination discovery app designed for GitHub + Vercel.

## Features
- Search cities and towns worldwide using Open-Meteo geocoding.
- Current weather, feels-like temperature, humidity, wind and precipitation.
- Hourly (next 24 hours), daily and weekly forecasts.
- Extended outlook up to 16 days in the monthly view. **A reliable daily 30-day forecast is not available from the free forecast endpoint**, so the UI clearly explains the limit instead of fabricating data.
- Destination local time and India Standard Time (IST), with live clocks.
- Sunrise, sunset and UV index.
- Nearby attraction suggestions using Wikipedia geosearch.
- Weather-aware activity suggestions that adapt to rain, heat, cold and wind.
- Responsive desktop and mobile layout.

## Run locally
Requirements: Node.js 18.17+.

```bash
npm install
npm run dev
```
Open http://localhost:3000.

## Deploy with GitHub + Vercel
1. Create a GitHub repository (for example `weathernow`).
2. Extract this ZIP and push the contents to the repository root:
   ```bash
   git init
   git add .
   git commit -m "Initial WeatherNow app"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
   git push -u origin main
   ```
3. In Vercel, choose **Add New → Project**, import the GitHub repository, and keep the detected Next.js settings.
4. Click **Deploy**. No API keys or environment variables are required.

## Data providers
- Weather + geocoding: Open-Meteo (https://open-meteo.com/)
- Nearby attractions: Wikipedia geosearch API (https://www.mediawiki.org/wiki/API:Geosearch)

## Notes
- Weather is fetched in the browser. A network connection is required.
- Attraction listings are nearby Wikipedia pages, not a curated or ranked tourism database. Verify opening hours, ticketing, safety and access with official sources before travelling.
- Forecast availability depends on the upstream provider and forecast horizon.
