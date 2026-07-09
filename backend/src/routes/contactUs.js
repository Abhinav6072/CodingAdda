const express = require('express');
const contactRouter = express.Router();
const { submitContact } = require('../controllers/contactUs');

// POST /contact/submit
contactRouter.post("/submit", submitContact);

module.exports = contactRouter;
