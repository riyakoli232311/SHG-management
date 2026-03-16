const express = require("express");
const router = express.Router();

// temporary meeting storage
let meetings = [];

// GET all meetings
router.get("/", (req, res) => {
  res.json(meetings);
});

// CREATE meeting
router.post("/create", (req, res) => {

  const { date, topic } = req.body;

  const newMeeting = {
    id: Date.now(),
    date: date,
    topic: topic
  };

  meetings.push(newMeeting);

  res.json({
    message: "Meeting created successfully",
    meeting: newMeeting
  });

});

module.exports = router;