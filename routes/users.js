'use strict';

const express = require('express');

// Construct a router instance.
const router = express.Router();
const { Users } = require('../models');
const { authenticateUser } = require('../middleware/auth-user');

// Handler function to wrap each route.
function asyncHandler(cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next);
    } catch (error) {
      // Forward error to the global error handler
      next(error);
    }
  }
}

// Route that returns a list of users.
// router.get('/', authenticateUser, asyncHandler(async (req, res) => {
router.get('/', authenticateUser, asyncHandler(async (req, res) => {
  // let users = await Users.findAll();
  res.json(req.currentUser);
}));

// Send a PUT request to /courses/:id to UPDATE a user
router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const user = await Users.findByPk(req.params.id);
    console.log(user);
    if (user) {
      const updatedCourse = req.body;
      const selector = { 
        where: { id: user.id }
      };
      await Users.update(updatedCourse, selector);
      res.status(204).end();
    } else {
      res.status(404).json({ message: "Users not found." });
    }
  })
);

// Route that creates a new user.
router.post('/', authenticateUser, asyncHandler(async (req, res) => {
    try {
    console.log(req.body)
      await Users.create(req.body);
      res.status(201).location('/').end();
    } catch (error) {
      if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
        const errors = error.errors.map(err => err.message);
        res.status(400).json({ errors });   
      } else {
        throw error;
      }
    }
  }));


module.exports = router;

