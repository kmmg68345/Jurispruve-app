// Connect the HTML elements to the Script
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('evidenceInput');

// 1. CLICK TO BROWSE
dropZone.addEventListener('click', () => {
    console.log("Box clicked!");
    fileInput.click();
});

// 2. DRAG AND DROP LOGIC
// We have to tell the browser NOT to just open the file in the tab
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => e.preventDefault());
});

dropZone.addEventListener('dragover', () => dropZone.classList.add('active'));
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('active'));

dropZone.addEventListener('drop', (e) => {
    dropZone.classList.remove('active');
    const files = e.dataTransfer.files;
    if (files.length > 0) processEvidence(files[0]);
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) processEvidence(e.target.files[0]);
});

// 3. GENERATE CRYPTOGRAPHIC HASH
async function processEvidence(file) {
    console.log("Processing:", file.name);
    document.getElementById('status').innerText = "Hashing " + file.name + "...";
    
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    document.getElementById('status').innerText = "Seal Verified.";
    document.getElementById('result').innerHTML = `
        <div style="background: #1a1c23; padding: 20px; border: 1px solid #00ff88; margin-top: 20px; border-radius: 8px;">
            <p style="font-size: 0.7rem; color: #8b949e;">SHA-256 FINGERPRINT</p>
            <code style="word-break: break-all; color: #00ff88;">${hashHex}</code>
            <button onclick="downloadReport('${file.name}', '${hashHex}')" class="btn-download">Download Rule 901(c) Report</button>
        </div>
    `;
}

// 4. DOWNLOAD PDF
function downloadReport(name, hash) {
    const date = new Date().toLocaleString();
    const content = `
        <div style="padding: 40px; font-family: serif;">
            <h1 style="border-bottom: 2px solid #000;">JURISPRUVE AUTHENTICATION</h1>
            <p><strong>Evidence:</strong> ${name}</p>
            <p><strong>Hash:</strong> ${hash}</p>
            <p><strong>Timestamp:</strong> ${date}</p>
            <p>This document attests to the integrity of the electronic data under FRE 901(c).</p>
        </div>`;
    html2pdf().from(content).save('Jurispruve-Report.pdf');
}
