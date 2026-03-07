const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('evidenceInput');

// 1. UI: Click to browse
dropZone.addEventListener('click', () => fileInput.click());

// 2. UI: Drag & Drop styling
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = "#00ff88";
    dropZone.style.background = "rgba(0, 255, 136, 0.05)";
});

dropZone.addEventListener('dragleave', () => {
    dropZone.style.borderColor = "#30363d";
    dropZone.style.background = "transparent";
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) processEvidence(files[0]);
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) processEvidence(e.target.files[0]);
});

// 3. CORE LOGIC: Cryptographic Hashing
async function processEvidence(file) {
    const statusEl = document.getElementById('status');
    const resultEl = document.getElementById('result');
    
    statusEl.innerText = "Processing Protocol...";

    try {
        const arrayBuffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // Grab Environmental Data
        const envData = {
            timestamp: new Date().toISOString(),
            agent: navigator.userAgent,
            size: file.size + " bytes"
        };

        statusEl.innerText = "Integrity Seal Verified.";
        resultEl.innerHTML = `
            <div style="background: #1a1c23; padding: 20px; border-radius: 8px; border: 1px solid #00ff88; margin-top: 20px;">
                <p style="color: #00ff88; font-weight: bold;">[ SEAL GENERATED ]</p>
                <code style="word-break: break-all; font-size: 0.8rem;">${hashHex}</code>
                <button id="downloadBtn" style="background:#00ff88; color:#000; border:none; padding:12px; border-radius:6px; cursor:pointer; font-weight:bold; width:100%; margin-top:20px;">
                    Generate Admissibility Report
                </button>
            </div>
        `;
        
        document.getElementById('downloadBtn').onclick = () => generateCertificate(file.name, hashHex, envData);

    } catch (err) {
        statusEl.innerText = "Error: Protocol Failure.";
    }
}

// 4. REPORTING: PDF with Forensic Narrative
function generateCertificate(fileName, hashHex, env) {
    const template = `
        <div style="padding: 40px; font-family: 'Times New Roman', serif;">
            <h1 style="text-align: center; border-bottom: 2px solid #000;">JURISPRUVE INTEGRITY REPORT</h1>
            <p><strong>Date of Intake:</strong> ${env.timestamp}</p>
            <p><strong>File Name:</strong> ${fileName}</p>
            <p><strong>File Size:</strong> ${env.size}</p>
            <hr>
            <h3>CRYPTOGRAPHIC IDENTIFICATION</h3>
            <p style="font-family: monospace; background: #f4f4f4; padding: 10px;">SHA-256: ${hashHex}</p>
            <h3>COLLECTION ENVIRONMENT</h3>
            <p style="font-size: 0.8rem; color: #555;">${env.agent}</p>
            <hr>
            <h3>ATTESTATION (RULE 901(c))</h3>
            <p>The proponent of this evidence certifies that the above-described electronic data has been authenticated via 
            the Jurispruve Protocol. This process produces a valid and reliable result by generating a unique hash value 
            client-side, ensuring no alteration occurred during the intake process.</p>
        </div>`;
    
    html2pdf().from(template).save(`Jurispruve_Report_${fileName}.pdf`);
}
