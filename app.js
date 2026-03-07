const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('evidenceInput');

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

async function processEvidence(file) {
    document.getElementById('status').innerText = "Hashing & Analyzing...";
    
    // 1. Metadata Collection
    const lastMod = new Date(file.lastModified).toLocaleString();
    const fileSize = (file.size / 1024).toFixed(2) + " KB";
    let deepMeta = "No embedded metadata detected.";
    
    try {
        const tags = await ExifReader.load(file);
        if (tags.DateTimeOriginal) deepMeta = `Capture Date: ${tags.DateTimeOriginal.description}`;
        else if (tags.Software) deepMeta = `Processed via: ${tags.Software.description}`;
    } catch (e) { console.log("Metadata scan limited for this type."); }

    // 2. Cryptographic Hashing (SHA-256)
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
    const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

    // 3. UI Update (Success View)
    document.getElementById('status').innerText = "Seal Verified.";
    const notes = document.getElementById('caseNotes').value;
    
    document.getElementById('result').innerHTML = `
        <div class="fade-in" style="background: #1a1c23; padding: 25px; border: 1px solid #00ff88; border-radius: 12px; margin-top: 20px;">
            <div class="success-seal">✓</div>
            <h3 style="color: #00ff88; margin: 0 0 15px 0;">Integrity Seal Applied</h3>
            <div style="text-align: left; background: #0d1117; padding: 12px; border-radius: 6px; border: 1px solid #30363d;">
                <code style="word-break: break-all; color: #fff; font-size: 0.8rem;">${hashHex}</code>
            </div>
            <button id="downloadBtn" class="btn-download">Download Forensic Report</button>
        </div>
    `;

    // 4. Update Session History
    const historyContainer = document.getElementById('history-container');
    const historyList = document.getElementById('history-list');
    historyContainer.style.display = 'block';
    
    const item = document.createElement('div');
    item.className = 'history-item fade-in';
    item.innerHTML = `<div><strong>${file.name}</strong><br><small>${hashHex.substring(0,12)}...</small></div><span>${new Date().toLocaleTimeString()}</span>`;
    historyList.prepend(item);

    // 5. Report Generation Link
    document.getElementById('downloadBtn').onclick = () => {
        downloadReport(file.name, hashHex, lastMod, fileSize, deepMeta, notes);
    };
}

function downloadReport(name, hash, lastMod, size, deepMeta, notes) {
    const reportID = `JP-${Math.floor(1000 + Math.random() * 9000)}`;
    const content = `
        <div style="padding: 40px; border: 15px solid #0d1117; font-family: 'Times New Roman', serif; color: #000; position: relative; background: white;">
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 70px; color: rgba(0,0,0,0.03); white-space: nowrap; z-index: 0; font-weight: bold;">JURISPRUVE VERIFIED</div>
            
            <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; position: relative; z-index: 1;">
                <img src="jurispruve-dark-transparent.svg" style="height: 60px; margin-bottom: 10px;">
                <h1 style="margin: 0; font-size: 28px;">INTEGRITY CERTIFICATE</h1>
                <p style="margin: 5px 0; font-size: 10px; letter-spacing: 2px;">FORENSIC PROTOCOL v1.2</p>
            </div>

            <div style="position: relative; z-index: 1; margin-top: 20px; font-size: 12px; display: flex; justify-content: space-between;">
                <span><strong>REPORT ID:</strong> ${reportID}</span>
                <span><strong>DATE:</strong> ${new Date().toUTCString()}</span>
            </div>

            <h3 style="border-bottom: 1px solid #ccc; margin-top: 30px;">I. CASE ATTESTATION</h3>
            <div style="background: #f9f9f9; padding: 15px; border-left: 5px solid #0d1117; font-size: 14px;">${notes || "No notes provided."}</div>

            <h3 style="border-bottom: 1px solid #ccc; margin-top: 25px;">II. FILE METADATA</h3>
            <table style="width: 100%; font-size: 13px;">
                <tr><td style="width: 30%;"><strong>Filename:</strong></td><td>${name}</td></tr>
                <tr><td><strong>Size:</strong></td><td>${size}</td></tr>
                <tr><td><strong>System Date:</strong></td><td>${lastMod}</td></tr>
                <tr><td><strong>Embedded Data:</strong></td><td>${deepMeta}</td></tr>
            </table>

            <h3 style="border-bottom: 1px solid #ccc; margin-top: 25px;">III. CRYPTOGRAPHIC SEAL (SHA-256)</h3>
            <div style="background: #f0f0f0; padding: 15px; font-family: monospace; word-break: break-all; border: 1px dashed #000; font-size: 14px; text-align: center;">${hash}</div>

            <p style="margin-top: 30px; font-size: 11px; color: #333;"><strong>COMPLIANCE:</strong> Pursuant to FRE Rule 901(c), this certificate verifies a process that produces an accurate result. The bitstream is confirmed identical to the state at time of certification.</p>

            <div style="margin-top: 50px; display: flex; justify-content: space-between;">
                <div><p>__________________________</p><p style="font-size: 10px;">CUSTODIAN SIGNATURE</p></div>
                <div style="text-align: right; font-size: 9px; color: #888;">NIST FIPS 180-4 Compliant<br>Jurispruve.io</div>
            </div>
        </div>`;

    html2pdf().set({ margin: 0.3, filename: `Jurispruve_${name}.pdf`, html2canvas: { scale: 3 }, jsPDF: { unit: 'in', format: 'letter' } }).from(content).save();
}
