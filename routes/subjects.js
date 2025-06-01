const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');  
router.get('/subjects', async (req, res) => {
  const { year, semester, branch } = req.query;
  if (!year || !semester || !branch) {
    return res.status(400).json({ error: 'year, semester, and branch are required' });
  }

  try {
    const subjects = await Subject.find({
      year: Number(year),
      semester: Number(semester),
      branch
    }).select('subjectName -_id'); 

    res.json({ subjects });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

