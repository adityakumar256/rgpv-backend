const express = require('express');
const router = express.Router();
const SubjectResource = require('../models/SubjectResource');

// ✅ Upload JSON data (with year & semester)
// Ye tera working code hai:
router.post('/upload', async (req, res) => {
  // Ye body mein aayega:
  const { subjectName, branch, notesUrls, pyqBookUrl, yearWisePYQs, semesterWiseResources, playlistUrls, tutorialLinks } = req.body;

  if (!subjectName || !branch) {
    return res.status(400).json({ error: 'subjectName and branch are required' });
  }

  // Mongo me check karega: already hai kya?
  let existing = await SubjectResource.findOne({ subjectName, branch });

  if (existing) {
    // Agar hai toh update karo
    if (Array.isArray(notesUrls)) existing.notesUrl.push(...notesUrls);
    if (pyqBookUrl) existing.pyqBookUrl = pyqBookUrl;
    if (Array.isArray(yearWisePYQs)) existing.yearWisePYQs.push(...yearWisePYQs);
    if (Array.isArray(semesterWiseResources)) existing.semesterWiseResources.push(...semesterWiseResources);
    if (Array.isArray(playlistUrls)) existing.playlistUrls.push(...playlistUrls);
    if (Array.isArray(tutorialLinks)) existing.tutorialLinks.push(...tutorialLinks);

    await existing.save();
    return res.json({ message: 'Resource updated', resource: existing });
  }

  // Nahi toh naya bana do
  const newResource = new SubjectResource({
    subjectName,
    branch,
    notesUrl: Array.isArray(notesUrls) ? notesUrls : [],
    pyqBookUrl,
    yearWisePYQs: Array.isArray(yearWisePYQs) ? yearWisePYQs : [],
    semesterWiseResources: Array.isArray(semesterWiseResources) ? semesterWiseResources : [],
    playlistUrls: Array.isArray(playlistUrls) ? playlistUrls : [],
    tutorialLinks: Array.isArray(tutorialLinks) ? tutorialLinks : []
  });

  await newResource.save();
  res.status(201).json({ message: 'Resource uploaded', resource: newResource });
});


// ✅ Get one resource by subject + branch + year + semester
router.get('/', async (req, res) => {
  const { subject, branch, year, semester } = req.query;

  if (!subject || !branch) {
    return res.status(400).json({ error: "subject and branch are required" });
  }

  try {
    const filter = { subjectName: subject, branch };
    if (year) filter.year = Number(year);
    if (semester) filter.semester = Number(semester);

    const resource = await SubjectResource.findOne(filter);

    if (!resource) {
      return res.status(404).json({ error: "Resource not found" });
    }

    res.json(resource);
  } catch (err) {
    console.error("Error fetching resource:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Get all subjects (filtered by branch + year + semester)
router.get('/list', async (req, res) => {
  const { branch, year, semester } = req.query;

  if (!branch) {
    return res.status(400).json({ error: 'branch is required' });
  }

  const filter = { branch };
  if (year) filter.year = Number(year);
  if (semester) filter.semester = Number(semester);

  try {
    const subjects = await SubjectResource.find(filter).select('subjectName -_id');
    res.json({ subjects });
  } catch (err) {
    console.error("Error fetching subjects:", err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
