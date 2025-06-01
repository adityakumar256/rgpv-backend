const mongoose = require("mongoose");

const subjectResourceSchema = new mongoose.Schema({
  subjectName: { type: String, required: true, unique: true },
  branch: { type: String, required: true },
  notesUrl: [{ type: String }],
  pyqBookUrl: { type: String },
  yearWisePYQs: [
    { year: Number, pdfUrl: String }
  ],
  semesterWiseResources: [
    { semester: Number, notesUrl: String }
  ],
  
  playlistUrls: [
    {
      name: { type: String, required: true },
      link: { type: String, required: true }
    }
  ],
  tutorialLinks: [
    {
      name: { type: String, required: true },
      link: { type: String, required: true }
    }
  ],
});

module.exports = mongoose.model("SubjectResource", subjectResourceSchema);
