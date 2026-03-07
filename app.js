function downloadReport(d, qrImg) {
    const reportID = `CERT-${Math.floor(Math.random() * 900000 + 100000)}`;
    const content = `
        <div style="padding: 50px; font-family: 'Times New Roman', serif; background: #fff; color: #1a2b48; border: 15px double #1a2b48; position: relative; line-height: 1.4;">
            
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 80px; color: rgba(26, 43, 72, 0.03); font-weight: bold; z-index:0; white-space: nowrap;">VERIFIED BY JURISPRUVE</div>

            <div style="text-align: center; border-bottom: 2px solid #c5a059; padding-bottom: 20px; position:relative; z-index:1;">
                <h1 style="margin: 0; font-size: 26px; text-transform: uppercase; letter-spacing: 2px;">Certificate of Forensic Integrity</h1>
                <p style="margin: 5px 0 0 0; font-size: 10px; font-weight: bold; color: #666;">Standardized Protocol CC2A | NIST FIPS 180-4 Compliant</p>
            </div>

            <div style="margin-top:20px; font-size:11px; display:flex; justify-content:space-between; font-weight: bold;">
                <span>MATTER ID: ${d.case}</span>
                <span>CERTIFICATE ID: ${reportID}</span>
                <span>UTC TIMESTAMP: ${verifiedTime}</span>
            </div>

            <h3 style="border-bottom: 1px solid #1a2b48; margin-top: 30px; font-size: 14px; text-transform: uppercase;">I. Custodial Declaration</h3>
            <p style="font-size: 12px; font-style: italic; background: #f8f9fa; padding: 15px; border-left: 4px solid #c5a059;">
                "I, ${d.custodian}, an authorized custodian of evidence, do hereby certify under penalty of perjury pursuant to **28 U.S.C. § 1746** and **Rule 902(14)** that the digital file identified below was ingested into the Jurispruve system. I attest that the SHA-256 hash value provided represents a bit-for-bit identical duplicate of the source material."
            </p>

            <h3 style="border-bottom: 1px solid #1a2b48; margin-top: 25px; font-size: 14px; text-transform: uppercase;">II. Evidence Metadata</h3>
            <table style="width: 100%; font-size: 11px; border-collapse: collapse;">
                <tr><td style="width: 25%; padding: 5px; font-weight: bold;">Original Filename:</td><td>${d.name}</td></tr>
                <tr><td style="padding: 5px; font-weight: bold;">File Bit-Size:</td><td>${d.size}</td></tr>
                <tr><td style="padding: 5px; font-weight: bold;">Capture Context:</td><td>${d.meta}</td></tr>
            </table>

            <h3 style="border-bottom: 1px solid #1a2b48; margin-top: 25px; font-size: 14px; text-transform: uppercase;">III. Cryptographic Integrity Seal</h3>
            <div style="margin-top: 10px; background: #1a2b48; color: #fff; padding: 20px; font-family: 'Courier New', monospace; word-break: break-all; font-size: 14px; text-align: center; border: 2px solid #c5a059;">
                ${d.hash}
            </div>

            <div style="margin-top: 30px; font-size: 9px; color: #444; border: 1px solid #ddd; padding: 10px;">
                <strong>ADMISSIBILITY CITATIONS:</strong><br>
                • <strong>FRE 902(14):</strong> Self-authenticating digital records.<br>
                • <strong>FRE 1002:</strong> Proof of original status via hash identity.<br>
                • <strong>CC2A Standard:</strong> Point-of-Ingest cryptographic baseline.
            </div>

            <div style="margin-top: 50px; display: flex; justify-content: space-between; align-items: flex-end;">
                <div style="width: 45%;">
                    <div style="border-bottom: 1.5px solid #1a2b48; height: 30px;"></div>
                    <p style="font-size: 11px; margin-top: 5px; font-weight:bold;">${d.custodian.toUpperCase()}</p>
                    <p style="font-size: 9px;">AUTHORIZED SIGNATURE</p>
                </div>

                <div style="width: 90px; height: 90px; background: #c5a059; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; border: 3px double #fff; box-shadow: 0 4px 6px rgba(0,0,0,0.2); transform: rotate(-10deg);">
                    <div style="border: 1px solid rgba(255,255,255,0.5); border-radius: 50%; width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; text-align: center; line-height: 1;">
                        OFFICIAL<br>FORENSIC<br>SEAL
                    </div>
                </div>

                <div style="text-align: right;">
                    <img src="${qrImg}" style="width: 70px; height: 70px; border: 1px solid #1a2b48;">
                    <p style="font-size: 6px; margin-top: 5px;">VERIFY VIA SECURE PORTAL</p>
                </div>
            </div>
        </div>`;

    html2pdf().from(content).set({ 
        margin: 0.2, 
        filename: `Forensic_Certificate_${d.case}.pdf`, 
        html2canvas: { scale: 3 },
        jsPDF: { unit: 'in', format: 'letter' }
    }).save();
}
