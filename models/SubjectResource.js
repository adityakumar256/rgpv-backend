// models/SubjectResource.js
const mongoose = require('mongoose');

const SubjectResourceSchema = new mongoose.Schema({
  subjectName: { type: String, required: true },
  branch: { type: String, required: true },
  year: Number,      // Optional but you added ✅
  semester: Number,  // Optional but you added ✅
  notesUrl: [String],
  pyqBookUrl: String,
  yearWisePYQs: [
    {
      year: Number,
      pdfUrl: String
    }
  ],
  semesterWiseResources: [
    {
      semester: Number,
      notesUrl: String
    }
  ],
  playlistUrls: [
    {
      name: String,
      link: String
    }
  ],
  tutorialLinks: [
    {
      name: String,
      link: String
    }
  ]
});

// ✅✅✅ IMPORTANT: Compound unique index
SubjectResourceSchema.index({ subjectName: 1, branch: 1 }, { unique: true });

module.exports = mongoose.model('SubjectResource', SubjectResourceSchema);
