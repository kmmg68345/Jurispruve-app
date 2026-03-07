const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('evidenceInput');

dropZone.onclick = () => fileInput.click();

['dragover', 'dragleave', 'drop'].forEach(name => {
    dropZone.addEventListener(name, (e) => {
        e.preventDefault();
        dropZone.style.borderColor = (name === 'dragover') ? "#00ff88" : "#30363d";
    });
});

dropZone.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    if (files.length > 0) processEvidence(files[0]);
});

fileInput.onchange = (e) => {
    if (e.target.files.length > 0) processEvidence(e.target.files[0]);
};

async function processEvidence(file) {
    document.getElementById('status').innerText = "Sealing Evidence...";
    
    // Metadata & Hash
    const lastMod = new Date(file.lastModified).toLocaleString();
    const fileSize = (file.size / 1024).toFixed(2) + " KB";
    let deepMeta = "No EXIF detected.";
    
    try {
        const tags = await ExifReader.load(file);
        if (tags.DateTimeOriginal) deepMeta = `Captured: ${tags.DateTimeOriginal.description}`;
    } catch (e) { console.warn("EXIF skipped."); }

    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
    const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

    // Update UI
    const notes = document.getElementById('caseNotes').value;
    document.getElementById('result').innerHTML = `
        <div style="background: #1a1c23; padding: 20px; border: 1px solid #00ff88; border-radius: 12px; margin-top: 20px;">
            <h3 style="color: #00ff88; margin-top: 0;">✓ Integrity Seal Applied</h3>
            <div style="background: #0d1117; padding: 10px; border-radius: 6px; word-break: break-all; font-family: monospace; font-size: 0.8rem; color: #fff;">
                ${hashHex}
            </div>
            <button id="downloadBtn" class="btn-download">Download Forensic Report</button>
        </div>`;

    // History Log
    document.getElementById('history-container').style.display = 'block';
    const item = document.createElement('div');
    item.className = 'history-item';
    item.innerHTML = `<div><strong>${file.name}</strong><br><small>${hashHex.substring(0,12)}...</small></div><span>${new Date().toLocaleTimeString()}</span>`;
    document.getElementById('history-list').prepend(item);

    document.getElementById('downloadBtn').onclick = () => {
        downloadReport(file.name, hashHex, lastMod, fileSize, deepMeta, notes);
    };
    document.getElementById('status').innerText = "Drag & Drop Evidence to Seal";
}

function downloadReport(name, hash, lastMod, size, deepMeta, notes) {
    const reportID = `JP-${Math.floor(Math.random() * 9000 + 1000)}`;
    const content = `
        <div style="padding: 40px; font-family: 'Times New Roman', serif; background: white; color: black; border: 10px solid #000; position: relative;">
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 60px; color: rgba(0,0,0,0.03); font-weight: bold; white-space: nowrap;">JURISPRUVE VERIFIED</div>
            <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px;">
                <img src="jurispruve-dark-transparent.svg" style="height: 50px;">
                <h1 style="margin: 5px 0;">INTEGRITY CERTIFICATE</h1>
            </div>
            <p><strong>ID:</strong> ${reportID} | <strong>DATE:</strong> ${new Date().toUTCString()}</p>
            <h3>I. CASE ATTESTATION</h3>
            <p style="background: #f0f0f0; padding: 10px;">${notes || "No notes provided."}</p>
            <h3>II. METADATA</h3>
            <p>File: ${name}<br>Size: ${size}<br>Timestamp: ${lastMod}<br>Data: ${deepMeta}</p>
            <h3>III. SHA-256 HASH</h3>
            <div style="background: #eee; padding: 15px; font-family: monospace; word-break: break-all; border: 1px dashed #000;">${hash}</div>
            <p style="margin-top: 40px; font-size: 10px; color: #666;">Standard: NIST FIPS 180-4 | Admissibility: FRE 901(c)</p>
        </div>`;

    html2pdf().from(content).set({ margin: 0.5, filename: `Jurispruve_${name}.pdf` }).save();
}
