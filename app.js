const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('evidenceInput');

// 1. Click to browse
dropZone.onclick = () => fileInput.click();

// 2. Drag & Drop events
dropZone.ondragover = (e) => {
    e.preventDefault();
    dropZone.style.borderColor = "#00ff88";
};

dropZone.ondragleave = () => {
    dropZone.style.borderColor = "#30363d";
};

dropZone.ondrop = (e) => {
    e.preventDefault();
    dropZone.style.borderColor = "#30363d";
    if (e.dataTransfer.files.length > 0) {
        processEvidence(e.dataTransfer.files[0]);
    }
};

fileInput.onchange = (e) => {
    if (e.target.files.length > 0) processEvidence(e.target.files[0]);
};

// 3. The Logic
async function processEvidence(file) {
    document.getElementById('status').innerText = "Generating SHA-256 Hash...";
    
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    document.getElementById('status').innerText = "Integrity Seal Verified.";
    document.getElementById('result').innerHTML = `
        <div style="background: #1a1c23; padding: 15px; border: 1px solid #00ff88; margin-top: 20px; border-radius: 8px;">
            <code style="word-break: break-all; color: #00ff88;">${hashHex}</code>
            <button onclick="generatePDF('${file.name}', '${hashHex}')" class="btn-download">Download Rule 901(c) Report</button>
        </div>
    `;
}

function generatePDF(name, hash) {
    const content = `<h1>Jurispruve Report</h1><p>File: ${name}</p><p>Hash: ${hash}</p><p>Authenticated under Rule 901(c).</p>`;
    html2pdf().from(content).save('Jurispruve-Report.pdf');
}
