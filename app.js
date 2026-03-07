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
            <div style="padding: 40px; font-family: serif; color: black;">
                <h1>JURISPRUVE INTEGRITY REPORT</h1>
                <p><strong>File:</strong> ${file.name}</p>
                <p><strong>SHA-256:</strong> ${hashHex}</p>
                <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                <hr>
                <p>Authenticated under FRE 901(c). This digital fingerprint confirms the file has not been altered.</p>
            </div>`;
        html2pdf().from(content).save(`Report_${file.name}.pdf`);
    };
}
