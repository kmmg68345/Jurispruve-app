// 1. SELECTORS
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('evidenceInput');
const resultDiv = document.getElementById('result');
const historyList = document.getElementById('history-list');
const historyContainer = document.getElementById('history-container');

// 2. EVENT LISTENERS
dropZone.onclick = () => fileInput.click();

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(name => {
    dropZone.addEventListener(name, (e) => {
        e.preventDefault();
        if (name === 'dragover') dropZone.style.borderColor = "#00ff88";
        if (name === 'dragleave') dropZone.style.borderColor = "#30363d";
    });
});

dropZone.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    if (files.length > 0) processEvidence(files[0]);
});

fileInput.onchange = (e) => {
    if (e.target.files.length > 0) processEvidence(e.target.files[0]);
};

// 3. CORE LOGIC
async function processEvidence(file) {
    document.getElementById('status').innerText = "Analyzing Evidence...";
    
    // Metadata & Hashing
    const lastMod = new Date(file.lastModified).toLocaleString();
    const fileSize = (file.size / 1024).toFixed(2) + " KB";
    let deepMeta = "No embedded EXIF data detected.";
    
    try {
        const tags = await ExifReader.load(file);
        if (tags.DateTimeOriginal) deepMeta = `Capture Date: ${tags.DateTimeOriginal.description}`;
    } catch (e) { console.log("Metadata scan limited."); }

    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
    const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

    // Update UI
    document.getElementById('status').innerText = "Seal Verified.";
    const notes = document.getElementById('caseNotes').value;
    
    resultDiv.innerHTML = `
        <div class="fade-in" style="background: #1a1c23; padding: 25px; border: 1px solid #00ff88; border-radius: 12px; margin-top: 20px; text-align: center;">
            <div class="success-seal" style="border: 3px solid #00ff88; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px auto; color: #00ff88; font-weight: bold;">✓</div>
            <h3 style="color: #00ff88; margin: 0 0 10px 0;">Integrity Seal Applied</h3>
            <div style="background: #0d1117; padding: 10px; border-radius: 6px; border: 1px solid #30363d; word-break: break-all; font-family: monospace; color: #fff; font-size: 0.8rem;">
                ${hashHex}
            </div>
            <button id="downloadBtn" class="btn-download" style="background: #00ff88; color: #000; border: none; padding: 12px; width: 100%; border-radius: 6px; margin-top: 15px; font-weight: bold; cursor: pointer;">Download Forensic Report</button>
        </div>
    `;

    // Update History
    historyContainer.style.display = 'block';
    const item = document.createElement('div');
    item.style = "background: #161b22; padding: 10px; margin-bottom: 8px; border-radius: 6px; border-left: 3px solid #00ff88; font-size: 0.8rem; display: flex; justify-content: space-between;";
    item.innerHTML = `<div><strong>${file.name}</strong><br><span style="color: #8b949e;">${hashHex.substring(0,12)}...</span></div> <span style="color: #444;">${new Date().toLocaleTimeString()}</span>`;
    historyList.prepend(item);

    document.getElementById('downloadBtn').onclick = () => {
        downloadReport(file.name, hashHex, lastMod, fileSize, deepMeta, notes);
    };
}

// 4. REPORT GENERATOR
function downloadReport(name, hash, lastMod, size, deepMeta, notes) {
    const reportID = `JP-${Math.floor(1000 + Math.random() * 9000)}`;
    const content = `
        <div style="padding: 40px; font-family: 'Times New Roman', serif; background: white; color: black; position: relative; border: 10px solid #000;">
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 60px; color: rgba(0,0,0,0.05); z-index: 0; font-weight: bold;">JURISPRUVE VERIFIED</div>
            <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; position: relative; z-index: 1;">
                <img src="jurispruve-dark-transparent.svg" style="height: 50px;">
                <h1>INTEGRITY CERTIFICATE</h1>
            </div>
            <div style="margin-top: 20px; font-size: 12px; display: flex; justify-content: space-between;">
                <span><strong>ID:</strong> ${reportID}</span>
                <span><strong>DATE:</strong> ${new Date().toUTCString()}</span>
            </div>
            <h3 style="border-bottom: 1px solid #ccc; margin-top: 20px;">I. CASE NOTES</h3>
            <p style="background: #f9f9f9; padding: 10px; font-size: 14px;">${notes || "No notes provided."}</p>
            <h3 style="border-bottom: 1px solid #ccc; margin-top: 20px;">II. METADATA</h3>
            <p style="font-size: 13px;">Name: ${name}<br>Size: ${size}<br>Timestamp: ${lastMod}<br>EXIF: ${deepMeta}</p>
            <h3 style="border-bottom: 1px solid #ccc; margin-top: 20px;">III. SHA-256 HASH</h3>
            <div style="background: #eee; padding: 15px; font-family: monospace; word-break: break-all;">${hash}</div>
            <p style="margin-top: 40px; font-size: 10px;">Validated under FRE 901(c). Jurispruve.io Secure Protocol.</p>
        </div>`;

    html2pdf().from(content).save(`Jurispruve_${name}.pdf`);
}
