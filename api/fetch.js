import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'No URL' });

    try {
        const response = await axios.get(url, { timeout: 5000, headers: { 'User-Agent': 'Mozilla/5.0' } });
        const $ = cheerio.load(response.data);
        const title = $('meta[property="og:title"]').attr('content') || $('h1').first().text().trim() || "Item Found";
        const image = $('meta[property="og:image"]').attr('content') || "";
        return res.status(200).json({ success: true, title, image });
    } catch (e) {
        return res.status(200).json({ success: false, title: "Listing Detected" });
    }
}
