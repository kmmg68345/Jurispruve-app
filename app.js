let currentMode = 'seal';
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('evidenceInput');

// Navigation Logic
function switchMode(mode) {
    currentMode = mode;
    document.getElementById('btnSeal').classList.toggle('active', mode === 'seal');
    document.getElementById('btnVerify').classList.toggle('active', mode === 'verify');
    document.getElementById('sealInputs').style.display = mode === 'seal' ? 'block' : 'none';
    document.getElementById('verifyInputs').style.display = mode === 'verify' ? 'block' : 'none';
    document.getElementById('status').innerText = mode === 'seal' ? "Drop File to Seal" : "Drop File to Verify";
    document.getElementById('result').innerHTML = '';
}

// File Handling
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
    document.getElementById('status').innerText = "Analyzing bitstream...";
    
    // 1. Metadata & Hash
    const lastMod = new Date(file.lastModified).toLocaleString();
    const fileSize = (file.size / 1024).toFixed(2) + " KB";
    let deepMeta = "No embedded EXIF data found.";
    
    try {
        const tags = await ExifReader.load(file);
        if (tags.DateTimeOriginal) deepMeta = `Capture: ${tags.DateTimeOriginal.description} | Device: ${tags.Make?.description || 'Unknown'}`;
    } catch (e) { console.warn("EXIF read skipped."); }

    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
    const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

    // 2. Logic Branch: Seal vs Verify
    if (currentMode === 'verify') {
        const target = document.getElementById('targetHash').value.trim().toLowerCase();
        const isMatch = (hashHex === target);
        showVerificationResult(isMatch, hashHex);
    } else {
        showSealResult(file.name, hashHex, lastMod, fileSize, deepMeta);
    }
    document.getElementById('status').innerText = "Process Complete.";
}

function showSealResult(name, hash, lastMod, size, deepMeta) {
    const notes = document.getElementById('caseNotes').value;
    document.getElementById('result').innerHTML = `
        <div style="background: #1a1c23; padding: 25px; border: 1px solid #00ff88; border-radius: 12px; margin-top: 20px;">
            <div class="success-seal">✓</div>
            <h3 style="color: #00ff88; margin: 0 0 10px 0;">Integrity Seal Applied</h3>
            <code style="display:block; background:#0d1117; padding:10px; border-radius:6px; word-break:break-all; font-size:0.8rem; color:#fff;">${hash}</code>
            <button id="downloadBtn" class="btn-action">Download Certified Report</button>
        </div>`;

    // History Log
    document.getElementById('history-container').style.display = 'block';
    const item = document.createElement('div');
    item.className = 'history-item';
    item.innerHTML = `<div><strong>${name}</strong><br><small style="color:#8b949e;">${hash.substring(0,16)}...</small></div><span>${new Date().toLocaleTimeString()}</span>`;
    document.getElementById('history-list').prepend(item);

    document.getElementById('downloadBtn').onclick = () => downloadReport(name, hash, lastMod, size, deepMeta, notes);
}

function showVerificationResult(isMatch, hash) {
    document.getElementById('result').innerHTML = `
        <div style="background: #1a1c23; padding: 25px; border: 2px solid ${isMatch ? '#00ff88' : '#ff4444'}; border-radius: 12px; margin-top: 20px;">
            <div style="font-size: 40px; margin-bottom:10px;">${isMatch ? '✅' : '❌'}</div>
            <h2 style="color: ${isMatch ? '#00ff88' : '#ff4444'}; margin:0;">${isMatch ? 'MATCH VERIFIED' : 'TAMPER DETECTED'}</h2>
            <p style="font-size:0.9rem;">${isMatch ? 'This file is bit-for-bit identical to the report.' : 'The file bitstream does not match the provided hash.'}</p>
        </div>`;
}

function downloadReport(name, hash, lastMod, size, deepMeta, notes) {
    const reportID = `JP-${Math.floor(Math.random() * 9000 + 1000)}`;
    const content = `
        <div style="padding: 45px; font-family: 'Times New Roman', serif; background: white; color: black; border: 12px solid #0d1117; position: relative;">
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 60px; color: rgba(0,0,0,0.03); font-weight: bold; white-space: nowrap; z-index:0;">JURISPRUVE AUTHENTICITY</div>
            
            <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; position:relative; z-index:1;">
                <img src="jurispruve-dark-transparent.svg" style="height: 50px; margin-bottom: 10px;">
                <h1 style="margin: 0; font-size: 24px;">CERTIFICATE OF AUTHENTICATION</h1>
                <p style="margin: 0; font-size: 9px; text-transform: uppercase; color:#555;">Cryptographic Chain of Custody Protocol | NIST FIPS 180-4</p>
            </div>

            <div style="margin-top: 15px; padding: 10px; border: 1px solid #ddd; font-size: 10px; background: #fafafa; display: flex; justify-content: space-around; text-align: center;">
                <div><strong>Evidence Standard</strong><br>FRE 901(b)(9)</div>
                <div><strong>Self-Authentication</strong><br>FRE 902(14)</div>
                <div><strong>Duplicate Integrity</strong><br>FRE 1002</div>
            </div>

            <h3 style="border-bottom: 1px solid #000; margin-top: 25px; font-size: 15px;">I. CUSTODIAL STATEMENT</h3>
            <p style="background: #f4f4f4; padding: 10px; font-size: 13px; font-style: italic; border-left: 3px solid #000;">${notes || "Evidence ingested via secure client-side portal."}</p>

            <h3 style="border-bottom: 1px solid #000; margin-top: 20px; font-size: 15px;">II. FORENSIC IDENTIFIERS</h3>
            <table style="width: 100%; font-size: 12px; line-height:1.6;">
                <tr><td style="width: 30%;"><strong>Filename:</strong></td><td>${name}</td></tr>
                <tr><td><strong>Bit-Size:</strong></td><td>${size}</td></tr>
                <tr><td><strong>System Date:</strong></td><td>${lastMod}</td></tr>
                <tr><td><strong>Embedded Data:</strong></td><td>${deepMeta}</td></tr>
            </table>

            <h3 style="border-bottom: 1px solid #000; margin-top: 20px; font-size: 15px;">III. CRYPTOGRAPHIC SEAL</h3>
            <div style="background: #000; color: #fff; padding: 15px; font-family: monospace; word-break: break-all; font-size: 14px; text-align: center;">${hash}</div>

            <div style="margin-top: 25px; font-size: 10.5px; line-height: 1.4;">
                <p><strong>ATTESTATION:</strong> I certify under penalty of perjury that this report was generated as a record of the original digital bitstream received. This process complies with the Best Evidence Rule (Rule 1002) by establishing a mathematical baseline that ensures the duplicate is identical to the original. Certification ID: ${reportID}</p>
            </div>

            <div style="margin-top: 40px; display: flex; justify-content: space-between; align-items: flex-end;">
                <div style="width: 40%;">
                    <div style="border-bottom: 1px solid #000; height: 30px;"></div>
                    <p style="font-size: 9px; margin-top: 5px;"><strong>AUTHORIZED CUSTODIAN</strong></p>
                </div>
                <div style="width: 80px; height: 80px; border: 2px solid #800; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #800; font-weight: bold; font-size: 10px; text-align: center; transform: rotate(-10deg); border-style: double;">JURISPRUVE<br>OFFICIAL<br>SEAL</div>
                <div style="text-align: right; font-size: 8px; color: #777;">Verified: ${new Date().toUTCString()}<br>Instance ID: JP-SECURE-2026</div>
            </div>
        </div>`;

    html2pdf().from(content).set({ margin: 0.3, filename: `Certified_Report_${name.split('.')[0]}.pdf`, html2canvas: { scale: 3 } }).save();
}
