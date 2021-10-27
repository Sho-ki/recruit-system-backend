const express = require("express");
const bodyParser = require("body-parser");
const controller = require("../controller/quiz-controller");
const cors = require("cors");

const router = express.Router();

router.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
router.use(bodyParser.json());

router.use(cors());

// HTTP Methods

router.post("/signIn", controller.signIn);

router.post("/login", controller.login);

router.get("/quiz-api", controller.listQuizes);

router.get("/quiz-api/:id", controller.getQuiz);

router.post("/quiz-api", controller.createQuiz);

router.put("/quiz-api/:id", controller.updateQuiz);

router.delete("/quiz-api/:id", controller.deleteQuiz);

router.get("/active-quiz-api", controller.listActiveQuizes);

router.post("/candidate-api", controller.createCandidate);

router.post("/candidate-answer-api", controller.createCandidateAnswer);

router.get("/candidate-api", controller.listCandidates);

router.delete("/candidate-api/:id", controller.deleteCandidate);

router.get("/candidate-api/:id", controller.getCandidate);

module.exports = router;
