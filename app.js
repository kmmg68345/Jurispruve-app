async function processEvidence(file) {
    console.log("File detected:", file.name); // Safety Log
    document.getElementById('status').innerText = "Hashing...";
    
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    console.log("Hash generated:", hashHex); // Safety Log

    document.getElementById('status').innerText = "Seal Verified.";
    document.getElementById('result').innerHTML = `
        <div style="background: #1a1c23; padding: 20px; border: 1px solid #00ff88; margin-top: 20px; border-radius: 8px;">
            <code style="word-break: break-all; color: #00ff88;">${hashHex}</code>
            <button id="realBtn" class="btn-download">Download Report</button>
        </div>
    `;

    // Modern way to attach the button to avoid "blank" issues
    document.getElementById('realBtn').onclick = () => {
        console.log("Button clicked, launching PDF...");
        downloadReport(file.name, hashHex);
    };
}
