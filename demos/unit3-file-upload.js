// ============================================================
// Syllabus Unit 3: File Upload Demonstration
// Uploads an emergency scene attachment to the server
// Run: node demos/unit3-file-upload.js
// ============================================================

const fs = require('fs');
const path = require('path');

async function testFileUpload() {
  console.log('=== Unit 3 Demo: File Upload to Express/Multer ===');

  // Create a sample emergency scene report text file
  const sampleFilePath = path.join(__dirname, 'sample-field-report.txt');
  fs.writeFileSync(sampleFilePath, 'EMERGENCY SCENE REPORT\nPatient vitals stabilized. Transporting to City Hospital.');

  const form = new FormData();
  form.append('incidentId', '1');
  form.append('uploadedBy', 'Paramedic Unit 4');
  const fileBlob = new Blob([fs.readFileSync(sampleFilePath)], { type: 'text/plain' });
  form.append('attachment', fileBlob, 'sample-field-report.txt');

  try {
    const res = await fetch('http://localhost:5000/api/upload', {
      method: 'POST',
      body: form
    });
    const data = await res.json();
    console.log('Upload Result:', data);
  } catch (err) {
    console.log('Note: Ensure server is running on port 5000 (npm start) to test live HTTP upload.');
    console.log('Server endpoint: POST /api/upload with multer middleware');
  }

  // Cleanup test file
  if (fs.existsSync(sampleFilePath)) fs.unlinkSync(sampleFilePath);
}

if (require.main === module) {
  testFileUpload();
}

module.exports = testFileUpload;
