import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'No URL provided' });

    const SB_KEY = "HEPV5Z6E0VC66R4GI78UN8AOH78ZJ9O82B7DUUOJ49ALZT5CT8NVUU17FAZCZ8H3TVPBUL8W5YLT57WS";

    try {
        // OPTIMIZATION: 
        // 1. Removed render_js=true (saves ~10 seconds)
        // 2. Keed premium_proxy=true (still bypasses IP blocks)
        // 3. Added stealth_proxy=true (bypasses bot detection without full JS)
        const scraperUrl = `https://app.scrapingbee.com/api/v1/?api_key=${SB_KEY}&url=${encodeURIComponent(url)}&premium_proxy=true&stealth_proxy=true&country_code=za`;

        // We set timeout to 9s to ensure we return a response BEFORE Vercel kills the function at 10s
        const response = await axios.get(scraperUrl, { timeout: 9000 }); 

        const $ = cheerio.load(response.data);
        const title = $('meta[property="og:title"]').attr('content') || 
                      $('h1').first().text().trim() || 
                      "Item Found";
        const image = $('meta[property="og:image"]').attr('content') || "";

        return res.status(200).json({ success: true, title, image });

    } catch (e) {
        console.error('Speed/Scrape Error:', e.message);
        // Fallback to manual entry if it's too slow or fails
        return res.status(200).json({ 
            success: false, 
            message: "Request timed out or failed",
            title: "Manual Entry Required"
        });
    }
}
