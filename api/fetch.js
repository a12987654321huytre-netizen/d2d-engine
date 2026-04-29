import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();
    
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'No URL' });

    // Use a pool of high-end User Agents
    const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    ];
    const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)];

    try {
        const response = await axios.get(url, { 
            timeout: 9000,
            headers: { 
                'User-Agent': randomUA,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
                'Referer': 'https://www.google.com/', // Changed to Google to look like search traffic
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'cross-site',
                'Sec-Fetch-Dest': 'document',
                'Upgrade-Insecure-Requests': '1'
            } 
        });

        const $ = cheerio.load(response.data);
        const title = $('meta[property="og:title"]').attr('content') || $('h1').first().text().trim();
        const image = $('meta[property="og:image"]').attr('content') || "";

        if (!title || title === "Item Found") throw new Error("Cloudflare Block Detected");

        return res.status(200).json({ success: true, title, image });

    } catch (e) {
        // Log the 403 specifically to your Vercel logs
        console.log(`[403 BLOCK] JunkMail is blocking Vercel. Falling back to Manual mode.`);
        
        // CRITICAL: We return success: false so your frontend triggers the "Type Name" box
        return res.status(200).json({ 
            success: false, 
            status: 403,
            title: "Manual Entry Required" 
        });
    }
}
