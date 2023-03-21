'use strict';

const express = require('express');

// Construct a router instance.
const router = express.Router();
const { Course } = require('../models');
const { Users } = require('../models');


const { authenticateUser } = require('../middleware/auth-user');

console.log('test change.')
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

// Route that returns a list of course.
router.get('/', asyncHandler(async (req, res) => {
  let course = await Course.findAll({
    include: [
      {
        model: Users,
        as: 'Users'
      }
    ]
  });
  res.json(course);
}));


// Route that creates a new Course.
router.post('/', authenticateUser, asyncHandler(async (req, res) => {
    try {
    console.log(req.body)
    // Store the created course in a varible to output id to URL
      const course = await Course.create(req.body);
      res.status(201).location(`/api/courses/` + course.id).end();
    } catch (error) {
      console.log('ERROR: ', error.name);
      if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
        const errors = error.errors.map(err => err.message);
        res.status(400).json({ errors });   
      } else {
        throw error;
      }
    }
  }));

// Send a GET request to /courses/:id to READ a single course
router.get("/:id", async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id, {
      include: [
        {
          model: Users,
          as: 'Users'
        }
      ]
    });
    if (course) {
      res.json(course);
    } else {
      res.status(404).json({ message: "Course not found." });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Send a PUT request to /courses/:id to UPDATE a course
router.put(
  "/:id", authenticateUser, (async (req, res) => {
    try {
      const course = await Course.findByPk(req.params.id);
      console.log(course);
      if (course) {
        const updatedCourse = req.body;
        const selector = { 
          where: { id: course.id }
        };
        await Course.update(updatedCourse, selector);
        res.status(204).location('/').end();
      } else {
        res.status(404).json({ message: "Course not found." });
      }
    } catch(error) {
      if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
        const errors = error.errors.map(err => err.message);
        res.status(400).json({ errors });   
      } else {
        throw error;
      }
    }
  })
);

// Send a DELETE request to /quotes/:id to DELETE a course
router.delete("/:id", authenticateUser, async (req, res, next) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (course) {
      await course.destroy(course);
      res.status(204).end();
    } else {
      res.status(404).json({ message: "Course not found." });
    }
  } catch (err) {
    res.status(500).json({message: err.message});
    next(err);
  }
});

module.exports = router;