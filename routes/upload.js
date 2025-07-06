const express = require('express');
const multer = require('multer');
const fs = require('fs');
const SubjectResource = require('../models/SubjectResource');

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
}); 
const upload = multer({ storage, limits: { fileSize: 200 * 1024 * 1024 } });

router.post('/', upload.single('file'), async (req, res) => {
  const { subjectName, branch, type, year, semester } = req.body;

  if (!subjectName || !branch || !type) {
    return res.status(400).json({ error: 'subjectName, branch, and type are required.' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  try {
    const pdfUrl = req.file.path;

    // ✅ Fix: Find by both subjectName + branch
    let subject = await SubjectResource.findOne({ subjectName, branch });

    if (!subject) {
      subject = new SubjectResource({
        subjectName,
        branch,
        notesUrl: [],
        yearWisePYQs: [],
        semesterWiseResources: []
      });
    }

    switch (type) {
      case 'notes':
        subject.notesUrl = [];
        subject.notesUrl.push(pdfUrl);
        break;

      case 'pyqBook':
        subject.pyqBookUrl = pdfUrl;
        break;

      case 'yearWisePYQ':
        if (year) {
          const existing = subject.yearWisePYQs.find(p => p.year === Number(year));
          if (existing) {
            existing.pdfUrl = pdfUrl;
          } else {
            subject.yearWisePYQs.push({ year: Number(year), pdfUrl });
          }
        }
        break;

      case 'semesterWise':
        if (semester) {
          const existingSem = subject.semesterWiseResources.find(p => p.semester === Number(semester));
          if (existingSem) {
            existingSem.notesUrl = pdfUrl;
          } else {
            subject.semesterWiseResources.push({ semester: Number(semester), notesUrl: pdfUrl });
          }
        }
        break;

      default:
        return res.status(400).json({ error: 'Invalid type provided.' });
    }

    await subject.save();
    res.status(201).json({ message: 'Upload successful', fileUrl: pdfUrl, subject });

  } catch (err) {
    console.error('Upload error:', err);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
