// 1. Setup the Drop Zone
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('evidenceInput');

dropZone.onclick = () => fileInput.click();
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(name => {
    dropZone.addEventListener(name, (e) => e.preventDefault());
});

dropZone.onboxdrop = (e) => {
    const files = e.dataTransfer.files;
    if (files.length > 0) processEvidence(files[0]);
};

fileInput.onchange = (e) => {
    if (e.target.files.length > 0) processEvidence(e.target.files[0]);
};

// 2. The Logic
async function processEvidence(file) {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    document.getElementById('status').innerText = "Seal Verified.";
    document.getElementById('result').innerHTML = `
        <div style="background: #1a1c23; padding: 20px; border: 1px solid #00ff88; border-radius: 8px;">
            <code style="word-break: break-all; color: #00ff88;">${hashHex}</code>
            <button id="downloadBtn" class="btn-download">Download Rule 901(c) Report</button>
        </div>
    `;

    document.getElementById('downloadBtn').onclick = () => {
        const content = `
    <div style="padding: 40px; border: 5px solid #00ff88; font-family: 'Times New Roman', serif;">
        <h1 style="text-align: center;">JURISPRUVE | INTEGRITY CERTIFICATE</h1>
        <p style="text-align: center; color: #666;">Verification Protocol v1.2</p>
        <hr>
        <h3>I. EVIDENCE SUMMARY</h3>
        <p><strong>Primary Identifier:</strong> ${file.name}</p>
        <p><strong>File Size:</strong> ${file.size} bytes</p>
        <p><strong>Intake Timestamp:</strong> ${new Date().toUTCString()}</p>
        
        <h3>II. CRYPTOGRAPHIC PROOF</h3>
        <p style="background: #f0f0f0; padding: 10px; font-family: monospace;">SHA-256: ${hashHex}</p>
        
        <h3>III. ADMISSIBILITY STATEMENT</h3>
        <p>This document serves as an authentication record under <strong>FRE 901(c)</strong>. The hash above represents a unique digital fingerprint. Any alteration to the original file will result in a mismatch of this value.</p>
        <br><br>
        <p>__________________________</p>
        <p>Attesting Officer</p>
    </div>`;
        html2pdf().from(content).save(`Report_${file.name}.pdf`);
    };
}
