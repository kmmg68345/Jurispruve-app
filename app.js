// JURISPRUVE CORE ENGINE
async function processEvidence(file) {
    const statusEl = document.getElementById('status');
    const resultEl = document.getElementById('result');
    
    statusEl.innerText = "Securing file with SHA-256 Hashing...";

    try {
        // 1. Generate the Cryptographic Fingerprint
        const arrayBuffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // 2. Display the Result and the Rule 901(c) Button
        statusEl.innerText = "Integrity Seal Generated.";
        resultEl.innerHTML = `
            <div style="background: #1a1c23; padding: 20px; border-radius: 8px; border: 1px solid #30363d; margin-top: 20px;">
                <p style="color: #8b949e; font-size: 0.8rem; margin-bottom: 5px;">FILE FINGERPRINT (SHA-256)</p>
                <code style="color: #00ff88; word-break: break-all; font-size: 0.9rem;">${hashHex}</code>
                
                <button id="downloadBtn" class="btn-download" style="background:#00ff88; color:#000; border:none; padding:12px; border-radius:6px; cursor:pointer; font-weight:bold; width:100%; margin-top:20px;">
                    Generate Rule 901(c) Report
                </button>
            </div>
        `;
        
        // 3. Attach the PDF trigger to the new button
        document.getElementById('downloadBtn').addEventListener('click', () => {
            generateCertificate(file.name, hashHex);
        });

    } catch (err) {
        statusEl.innerText = "Error: Protocol Interrupted.";
        console.error(err);
    }
}

// PDF GENERATION LOGIC
function generateCertificate(fileName, hashHex) {
    const timestamp = new Date().toLocaleString();
    const template = `
        <div style="padding: 50px; font-family: serif; color: #000; line-height: 1.6;">
            <h1 style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px;">JURISPRUVE INTEGRITY REPORT</h1>
            <p style="text-align: right;"><strong>Date:</strong> ${timestamp}</p>
            <p><strong>Evidence Description:</strong> ${fileName}</p>
            <p><strong>Cryptographic Hash (SHA-256):</strong></p>
            <p style="font-family: monospace; background: #eee; padding: 10px; border: 1px solid #ccc;">${hashHex}</p>
            <hr>
            <h3>ADMISSIBILITY STATEMENT</h3>
            <p>This report certifies that the digital evidence described above has been processed via the Jurispruve Integrity Protocol. 
            The cryptographic hash provided above creates a unique digital fingerprint. Any alteration to the original file will 
            render this hash invalid, satisfying the authentication requirements of <strong>Federal Rule of Evidence 901(c)</strong>.</p>
        </div>`;
    
    html2pdf().from(template).save(`Jurispruve_901c_Report_${fileName}.pdf`);
}

// LISTEN FOR FILE UPLOAD
document.getElementById('evidenceInput').addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        processEvidence(e.target.files[0]);
    }
});
