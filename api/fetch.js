import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'No URL' });

    const SB_KEY = "HEPV5Z6E0VC66R4GI78UN8AOH78ZJ9O82B7DUUOJ49ALZT5CT8NVUU17FAZCZ8H3TVPBUL8W5YLT57WS";

    try {
        // ULTRA-LEAN SETTINGS:
        // 1. Removed premium_proxy (saves ~5 seconds)
        // 2. Kept stealth_proxy (still bypasses most blocks)
        // 3. render_js remains false
        const scraperUrl = `https://app.scrapingbee.com/api/v1/?api_key=${SB_KEY}&url=${encodeURIComponent(url)}&stealth_proxy=true`;

        // Setting a slightly shorter timeout to ensure we fail gracefully before Vercel kills us
        const response = await axios.get(scraperUrl, { timeout: 8500 }); 

        const $ = cheerio.load(response.data);
        
        // Grab title from OG tags first, then H1
        const title = $('meta[property="og:title"]').attr('content') || 
                      $('h1').first().text().trim() || 
                      "Item Found";
                      
        const image = $('meta[property="og:image"]').attr('content') || "";

        return res.status(200).json({ success: true, title, image });

    } catch (e) {
        console.error('Final Speed Attempt Error:', e.message);
        // If it's still too slow, trigger the manual fallback in the frontend
        return res.status(200).json({ 
            success: false, 
            message: "Marketplace responded too slowly.",
            title: "Manual Entry Required"
        });
    }
}
