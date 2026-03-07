resultEl.innerHTML = `
    <div style="background: #1a1c23; padding: 20px; border-radius: 8px; border-left: 4px solid #00ff88;">
        <p><strong>File:</strong> ${file.name}</p>
        <p><strong>Hash:</strong> <code style="color: #00ff88;">${hashHex}</code></p>
        <button id="downloadBtn" style="background:#00ff88; color:#000; border:none; padding:10px 20px; border-radius:4px; cursor:pointer; font-weight:bold;">
            Generate Rule 901(c) Report
        </button>
    </div>
`;

// Attach the PDF function to the new button
document.getElementById('downloadBtn').addEventListener('click', () => {
    generateCertificate(file.name, hashHex);
});
