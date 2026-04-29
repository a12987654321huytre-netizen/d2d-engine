import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();
    
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'No URL' });

    try {
        // Determine if it's JunkMail to set the specific referer
        const isJunkMail = url.includes('junkmail.co.za');
        
        const response = await axios.get(url, { 
            timeout: 8000, // Increased timeout for JunkMail's slower response
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': isJunkMail ? 'https://www.junkmail.co.za/' : 'https://www.google.com/',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'cross-site',
                'Upgrade-Insecure-Requests': '1'
            } 
        });

        const $ = cheerio.load(response.data);
        
        // Refined selectors for better accuracy
        const title = $('meta[property="og:title"]').attr('content') || 
                      $('h1').first().text().trim() || 
                      "Item Found";
                      
        const image = $('meta[property="og:image"]').attr('content') || 
                      $('meta[name="twitter:image"]').attr('content') || "";

        return res.status(200).json({ success: true, title, image });

    } catch (e) {
        console.error('Scrape Error:', e.message);
        // Even if it fails, we return success:false so the frontend manual fallback triggers
        return res.status(200).json({ 
            success: false, 
            error: e.message,
            title: "Listing Detected" 
        });
    }
}
