import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
    // 1. Set CORS headers so your website can talk to this API
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'No URL provided' });

    // 2. Your ScrapingBee Credentials
    const SB_KEY = "HEPV5Z6E0VC66R4GI78UN8AOH78ZJ9O82B7DUUOJ49ALZT5CT8NVUU17FAZCZ8H3TVPBUL8W5YLT57WS";

    try {
        // 3. Routing the request through ScrapingBee's "Stealth" Browser
        // render_js=true: Loads the page like a human (beats Cloudflare)
        // premium_proxy=true: Uses SA residential IPs (beats IP blocks)
        const scraperUrl = `https://app.scrapingbee.com/api/v1/?api_key=${SB_KEY}&url=${encodeURIComponent(url)}&render_js=true&premium_proxy=true&country_code=za`;

        const response = await axios.get(scraperUrl, { timeout: 20000 }); // Increased timeout for JS rendering

        const $ = cheerio.load(response.data);

        // 4. Extracting Metadata
        const title = $('meta[property="og:title"]').attr('content') || 
                      $('h1').first().text().trim() || 
                      "Item Found";
                      
        const image = $('meta[property="og:image"]').attr('content') || 
                      $('meta[name="twitter:image"]').attr('content') || 
                      "";

        return res.status(200).json({ 
            success: true, 
            title: title, 
            image: image 
        });

    } catch (e) {
        console.error('ScrapingBee Error:', e.message);
        
        // 5. Fallback: If ScrapingBee hits an issue, we still tell the frontend 
        // to show the manual input box so the user isn't stuck.
        return res.status(200).json({ 
            success: false, 
            message: "Direct fetch failed, switching to manual mode.",
            title: "Listing Detected"
        });
    }
}
