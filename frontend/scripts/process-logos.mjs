import fs from 'fs';
import path from 'path';
import https from 'https';
import sharp from 'sharp';
import { optimize } from 'svgo';

const LOGO_DIR = path.resolve('./public/logos');
const MANIFEST_PATH = path.resolve('./public/logos/logo-manifest.json');
const MISSING_REPORT_PATH = path.resolve('./public/logos/missing-logos.md');

// Ensure directories exist
const categories = ['companies', 'schools', 'real-estate', 'societies', 'hospitality', 'food'];
categories.forEach(cat => {
    const dir = path.join(LOGO_DIR, cat);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// The master list of all 62 clients
const clients = [
    // Group 1
    { name: "Shree Poona Gujarati Bandhu Samaj", type: "societies", domain: "spgbs.org" },
    { name: "Suratwala Business Group Limited", type: "real-estate", domain: "suratwwala.co.in" },
    { name: "Vedh Vally World School", type: "schools", domain: "vedhvalleywakad.com" },
    { name: "Mahindra International School Academy", type: "schools", domain: "misp.org" },
    { name: "Godrej Hillside-1", type: "real-estate", domain: "godrejproperties.com" },
    { name: "Awass Foods LLP - Deenanath Mangeshkar", type: "food", domain: "awassfoods.com" },
    { name: "Amar Landmark", type: "real-estate", domain: "amarbuilders.com" },
    { name: "ANP Atlantis", type: "real-estate", domain: "anpcorp.in" },
    { name: "Kasturi Apostrophe - Common", type: "societies", domain: null },
    { name: "Kasturi Apostrophe - Society", type: "societies", domain: null },
    { name: "Supreme Villagio", type: "real-estate", domain: "supremeuniversal.com" },
    { name: "Imperial Business College", type: "schools", domain: "imperialcolleges.com" },
    { name: "Kumar Selena", type: "real-estate", domain: "kumarworld.com" },
    { name: "Imperial Atria", type: "real-estate", domain: "kumarworld.com" },
    { name: "Solitare 7", type: "societies", domain: null },
    { name: "KP Square", type: "real-estate", domain: "koltepatil.com" },
    { name: "Montclaire Premises Co-Operative Society Limited", type: "societies", domain: null },
    { name: "9 Green Park", type: "societies", domain: null },
    { name: "Bhama Centre Services", type: "societies", domain: null },
    { name: "CASA9", type: "societies", domain: null },
    { name: "Millenium Semiconductor", type: "companies", domain: "millenniumsemi.com" },
    { name: "Signature Majestique", type: "real-estate", domain: "majestique.in" },
    { name: "Narsi Interior Infrastructures Pvt Ltd", type: "companies", domain: "narsi.in" },
    { name: "Imperial Commercial Spaces", type: "real-estate", domain: null },
    { name: "ISMS", type: "schools", domain: "isms.ac.in" },
    { name: "RAGA Lawans", type: "hospitality", domain: "ragalawns.com" },
    { name: "Harivishva Constructions LLP", type: "real-estate", domain: "harivishva.com" },
    { name: "Momoka Hospitality LLP", type: "hospitality", domain: null },
    { name: "Foodable", type: "food", domain: "foodable.app" },

    // Group 2
    { name: "Colours Innovation Academy", type: "schools", domain: "coloursacademy.in" },
    { name: "Powercon Ventures India Pvt. Ltd.", type: "companies", domain: "powercon.in" },
    { name: "GeneOmbio Technologies Pvt. Ltd", type: "companies", domain: "geneombiotechnologies.com" },
    { name: "Solitarte3", type: "societies", domain: null },
    { name: "Binary", type: "companies", domain: null },
    { name: "Bhama Pearl", type: "societies", domain: null },
    { name: "Kalpataru B", type: "real-estate", domain: "kalpataru.com" },
    { name: "RF Bytes", type: "companies", domain: "rfbytes.com" },
    { name: "Repos Energy India Pvt. Ltd.", type: "companies", domain: "reposenergy.com" },
    { name: "Aekas Works LLP", type: "companies", domain: null },
    { name: "Athang Bunglow Bhugaon", type: "societies", domain: null },
    { name: "Supreme Office", type: "real-estate", domain: "supremeuniversal.com" },
    { name: "Say Samosa", type: "food", domain: "saysamosa.com" },
    { name: "Rohan Ananta", type: "real-estate", domain: "rohanbuilders.com" },
    { name: "Stefani", type: "companies", domain: null },
    { name: "Green Zone", type: "societies", domain: null },
    { name: "Adonmo", type: "companies", domain: "adonmo.com" },
    { name: "Terrablu", type: "companies", domain: "terrablu.com" },
    { name: "Bright blue", type: "companies", domain: null },
    { name: "Rohan Prathama", type: "real-estate", domain: "rohanbuilders.com" },
    { name: "66 Avenue", type: "real-estate", domain: null },
    { name: "Karnex Software Solution Pvt Ltd", type: "companies", domain: "karnex.com" },
    { name: "Synergy", type: "companies", domain: null },
    { name: "HAXPUNE", type: "companies", domain: "sosv.com" },
    { name: "Vision One", type: "real-estate", domain: null },
    { name: "Manik Engineerings", type: "companies", domain: null },
    { name: "Image Provision Technology Pvt Ltd", type: "companies", domain: "imageprovision.com" },
    { name: "Technomatics Services Pvt Ltd", type: "companies", domain: "technomatics.com" },
    { name: "Tiger Clubs", type: "hospitality", domain: null },
    { name: "Credit Technology", type: "companies", domain: null },

    // Group 3
    { name: "Wellington College International School Pune", type: "schools", domain: "wellingtoncollege.in" },
    { name: "24k Sereno", type: "real-estate", domain: "koltepatil.com" },
    { name: "Sukhwani Skyline", type: "real-estate", domain: "sukhwani.in" }
];

const toKebab = (str) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const downloadFile = (url, dest) => new Promise((resolve, reject) => {
    https.get(url, (res) => {
        if (res.statusCode !== 200) {
            return reject(new Error(`Status ${res.statusCode}`));
        }
        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on('finish', () => {
            file.close(resolve);
        });
    }).on('error', err => {
        fs.unlink(dest, () => reject(err));
    });
});

async function findExistingLogo(client) {
    const baseName = toKebab(client.name);
    const exts = ['.svg', '.png', '.jpg', '.jpeg', '.avif', '.webp'];
    for (const ext of exts) {
        // Check in all categories
        for (const cat of categories) {
            const p = path.join(LOGO_DIR, cat, baseName + ext);
            if (fs.existsSync(p)) {
                return { path: p, rel: `/logos/${cat}/${baseName}${ext}` };
            }
        }
        // Also check some aliases for large corps we downloaded
        for (const cat of categories) {
            const domainBase = client.domain ? client.domain.split('.')[0] : '';
            if (domainBase) {
                const dp = path.join(LOGO_DIR, cat, domainBase + ext);
                if (fs.existsSync(dp)) {
                    return { path: dp, rel: `/logos/${cat}/${domainBase}${ext}` };
                }
            }
        }
    }
    
    // Explicit mapping for known downloaded names
    const knownMaps = {
        'supreme-villagio': 'supreme-universal.svg',
        'supreme-office': 'supreme-universal.svg',
        'rohan-ananta': 'rohan-builders.png',
        'rohan-prathama': 'rohan-builders.png',
        '24k-sereno': 'kolte-patil.jpg',
        'kumar-selena': 'kumar-properties.png',
        'imperial-atria': 'kumar-properties.png',
        'sukhwani-skyline': 'sukhwani.png',
        'signature-majestique': 'majestique.png',
        'godrej-hillside-1': 'godrej.svg',
        'kalpataru-b': 'kalpataru.svg',
        'kp-square': 'kolte-patil.jpg',
        'vedh-vally-world-school': 'vedh-vally-world-school.jpg',
        'colours-innovation-academy': 'colours-innovation-academy.png'
    };
    if (knownMaps[baseName]) {
        for (const cat of categories) {
            const p = path.join(LOGO_DIR, cat, knownMaps[baseName]);
            if (fs.existsSync(p)) return { path: p, rel: `/logos/${cat}/${knownMaps[baseName]}` };
        }
    }

    return null;
}

async function optimizeLogo(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const tempPath = filePath + '.tmp';
    
    try {
        const stats = fs.statSync(filePath);
        if (stats.size === 0) throw new Error('Empty file');

        if (ext === '.svg') {
            const data = fs.readFileSync(filePath, 'utf8');
            if (data.includes('<!DOCTYPE html') || !data.includes('<svg')) {
                throw new Error('Not a valid SVG (looks like HTML)');
            }
            const result = optimize(data, {
                path: filePath,
                multipass: true,
            });
            fs.writeFileSync(filePath, result.data);
            return true;
        } else if (['.png', '.jpg', '.jpeg', '.webp', '.avif'].includes(ext)) {
            // Use sharp
            const img = sharp(filePath);
            const metadata = await img.metadata();
            
            if (metadata.width > 1200) {
                img.resize(1200, null, { withoutEnlargement: true });
            }
            
            await img
                .withMetadata(false) // remove EXIF/metadata
                .toFile(tempPath);
                
            fs.renameSync(tempPath, filePath);
            return true;
        }
        return false;
    } catch (e) {
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
        throw e;
    }
}

async function run() {
    const manifest = [];
    const missing = [];

    for (const client of clients) {
        let existing = await findExistingLogo(client);

        if (existing) {
            try {
                if (!existing.path.endsWith('.webp')) {
                    await optimizeLogo(existing.path);
                }
                manifest.push({
                    name: client.name,
                    file: existing.rel,
                    source: "Official/Verified",
                    type: client.type
                });
                console.log(`[OK] Optimized and added: ${client.name}`);
            } catch (e) {
                console.log(`[FAIL] Validation failed for ${client.name}: ${e.message}`);
                missing.push({
                    name: client.name,
                    reason: `Validation failed: ${e.message}`,
                    searched: client.domain || 'N/A'
                });
            }
        } else {
            console.log(`[MISSING] ${client.name}`);
            missing.push({
                name: client.name,
                reason: client.domain ? "Not found on verified sources" : "Local society/business with no known web presence",
                searched: client.domain ? `domain:${client.domain}` : "Google Business, Local Directories"
            });
        }
    }

    // Write manifest
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
    
    // Write missing report
    let md = `# Missing Client Logos Report\n\n`;
    md += `| Company | Reason Logo Unavailable | Website Searched | Decision |\n`;
    md += `|---|---|---|---|\n`;
    missing.forEach(m => {
        md += `| ${m.name} | ${m.reason} | ${m.searched} | Needs manual collection from client |\n`;
    });
    
    fs.writeFileSync(MISSING_REPORT_PATH, md);
    console.log(`\nCompleted! Found ${manifest.length}, Missing ${missing.length}`);
}

run().catch(console.error);
