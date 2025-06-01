const express = require('express');
const multer = require('multer');
const cloudinary = require('../utils/cloudinary');
const fs = require('fs');
const SubjectResource = require('../models/SubjectResource');

const router = express.Router();

// Configure multer storage
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

const upload = multer({ storage, limits: { fileSize: 200 * 1024 * 1024 } }); // limit 200MB

// POST /api/upload
router.post('/', upload.single('file'), async (req, res) => {
  const { subjectName, branch, type, year, semester } = req.body;

  console.log('Received body:', req.body);
  console.log('Received file:', req.file);

  if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
  if (!subjectName || !type || !branch) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    return res.status(400).json({ error: 'subjectName, type and branch are required.' });
  }

  try {
    // Upload file to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: 'raw',
      folder: `rgpv-pdfs/${subjectName}/${type}`,
      chunk_size: 6 * 1024 * 1024,
      public_id: type === 'yearWisePYQ' && year ? `${year}` : undefined,
    });

    // Delete file locally after upload
    fs.unlinkSync(req.file.path);

    // Find existing SubjectResource by subjectName
    let subject = await SubjectResource.findOne({ subjectName });

    if (!subject) {
      // Create new if not found
      subject = new SubjectResource({ subjectName, branch, notesUrl: [] });
    } else {
      // Update branch if changed
      subject.branch = branch;
    }

    // Update URLs based on type
    switch (type) {
      case 'notes':
        subject.notesUrl.push(result.secure_url);
        break;
      case 'pyqBook':
        subject.pyqBookUrl = result.secure_url;
        break;
      case 'yearWisePYQ':
        if (year) {
          subject.yearWisePYQs.push({ year: Number(year), pdfUrl: result.secure_url });
        }
        break;
      case 'semesterWise':
        if (semester) {
          subject.semesterWiseResources.push({ semester: Number(semester), notesUrl: result.secure_url });
        }
        break;
      default:
        // You can handle other types or return error if needed
        break;
    }

    await subject.save();

    res.json({ message: 'Upload & save successful!', url: result.secure_url, subject });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
 