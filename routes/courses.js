const {Router} = require("express");
const Course = require("../models/course");
const router = Router();

router.get("/", async (req, res) => {
  const courses = await Course.getAllCourses();
  res.render("courses", {
    title: "Курсы",
    isCourses: true,
    courses
  })
});

router.get("/:id/edit", async (req, res) => {
  if(!req.query.allow) {
    return res.redirect("/");
  }

  const course = await Course.getCourseById(req.params.id);

  res.render("editCourse", {
    title: `Edit: ${course.title}`,
    course
  });
});

router.post("/edit", async (req, res) => {
  await Course.update(req.body);
  res.redirect("/courses");
});

router.get("/:id", async (req, res) => {
  const course = await Course.getCourseById(req.params.id);
  res.render("course", {
    layout: "empty",
    title: `Course: ${course.title}`,
    course
  });
});


module.exports = router;