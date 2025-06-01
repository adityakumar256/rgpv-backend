const express = require('express');
const router = express.Router();
const SubjectResource = require('../models/SubjectResource');
const Subject = require('../models/Subject');
router.post('/upload', async (req, res) => {
  try {
    const {
      subjectName,
      branch,
      notesUrls,
      pyqBookUrl,
      yearWisePYQs,
      semesterWiseResources,
      playlistUrls,
      tutorialLinks
    } = req.body;

    if (!subjectName || !branch) {
      return res.status(400).json({ error: 'subjectName and branch are required' });
    }

    let existing = await SubjectResource.findOne({ subjectName });

    if (existing) {
      
      if (Array.isArray(notesUrls)) existing.notesUrl.push(...notesUrls);
      if (pyqBookUrl) existing.pyqBookUrl = pyqBookUrl;
      if (Array.isArray(yearWisePYQs)) existing.yearWisePYQs.push(...yearWisePYQs);
      if (Array.isArray(semesterWiseResources)) existing.semesterWiseResources.push(...semesterWiseResources);
      if (Array.isArray(playlistUrls)) existing.playlistUrls.push(...playlistUrls);
      if (Array.isArray(tutorialLinks)) existing.tutorialLinks.push(...tutorialLinks);

      await existing.save();
      return res.json({ message: 'Resource updated', resource: existing });
    }

  
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/", async (req, res) => {
  const { subject } = req.query;

  if (!subject) {
    return res.status(400).json({ error: "Subject is required" });
  }

  try {
    const resource = await SubjectResource.findOne({ subjectName: subject });

    if (!resource) {
      return res.status(404).json({ error: "Resource not found" });
    }

    res.json(resource);
  } catch (err) {
    console.error("Error fetching resource:", err);
    res.status(500).json({ error: "Server error" });
  }
});



router.get('/list', async (req, res) => {
  const { year, semester, branch } = req.query;

  if (!year || !semester || !branch) {
    return res.status(400).json({ error: 'year, semester, and branch are required' });
  }

  try {
    // Find subjects matching the filters
    const subjects = await SubjectResource.find({
      branch,
     
    }).select('subjectName -_id'); 

    res.json({ subjects });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get("/", async (req, res) => {
  const { subject } = req.query;

  if (!subject) {
    return res.status(400).json({ error: "Subject is required" });
  }

  try {
    console.log(" Searching for subject:", subject); 
    const resource = await SubjectResource.findOne({ subjectName: subject });

    if (!resource) {
      console.log(" Resource not found in DB!");
      return res.status(404).json({ error: "Resource not found" });
    }

    console.log("Found resource:", resource);
    res.json(resource);
  } catch (err) {
    console.error("Error fetching resource:", err);
    res.status(500).json({ error: "Server error" });
  }
});


module.exports = router;