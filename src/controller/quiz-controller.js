const Quiz = require('../model/quizes');

module.exports = {
  signIn: async (req, res) => {
    try {
      const username = req.body.username;
      const password = req.body.password;
      const result = await Quiz.signIn(username, password);

      res.status(201).json(result);
    } catch (e) {
      res.status(500).send({ message: e });
    }
  },

  login: async (req, res) => {
    try {
      const username = req.body.username;
      const password = req.body.password;
      const result = await Quiz.login(username, password);

      res.status(201).json(result);
    } catch (e) {
      res.status(500).send({ message: e });
    }
  },

  listQuizes: async (req, res) => {
    try {
      const result = await Quiz.listQuizes();

      res.status(201).json(result);
    } catch (e) {
      res.status(500).send({ message: e });
    }
  },

  getQuiz: async (req, res) => {
    const quizId = req.params.id;

    try {
      const { result, isValidEdit, candidatesUsingQuiz } = await Quiz.getQuiz(
        quizId
      );

      if (result.length === 0) throw Error('NO USERS');

      res.status(201).json({ result, isValidEdit, candidatesUsingQuiz });
    } catch (e) {
      res.status(500).send({ error: e });
    }
  },

  createQuiz: async (req, res) => {
    const quiz = req.body;

    try {
      await Quiz.createQuiz(quiz);

      res.status(204).send();
    } catch (e) {
      res.status(500).send({ error: e });
    }
  },

  updateQuiz: async (req, res) => {
    const id = req.params.id;
    const category = req.body.category;
    const quizText = req.body.quizText;
    const isActive = req.body.isActive;
    const isCorrect = req.body.isCorrect;
    const options = req.body.options;
    const indexNumber = req.body.indexNumber;

    try {
      await Quiz.updateQuiz(id, category, quizText, isActive, indexNumber);
      await Quiz.updateChoice(id, isCorrect, options);

      res.status(204).send();
    } catch (e) {
      res.status(500).send({ error: e });
    }
  },

  deleteQuiz: async (req, res) => {
    try {
      const id = req.params.id;

      const { isValidDelete, candidatesUsingQuiz } = await Quiz.deleteQuiz(id);

      res.status(201).send({ isValidDelete, candidatesUsingQuiz });
    } catch (e) {
      res.status(500).send({ error: e });
    }
  },

  listActiveQuizes: async (req, res) => {
    try {
      const result = await Quiz.listActiveQuizes();

      res.status(201).json(result);
    } catch (e) {
      res.status(500).send({ message: e });
    }
  },

  createCandidate: async (req, res) => {
    try {
      const firstname = req.body.firstname;
      const lastname = req.body.lastname;
      const email = req.body.email;
      const result = await Quiz.createCandidate(firstname, lastname, email);

      res.status(201).json(result);
    } catch (e) {
      res.status(500).send({ message: e });
    }
  },

  createCandidateAnswer: async (req, res) => {
    try {
      const currentCandidateId = req.body.currentCandidateId;
      const answeredIdList = req.body.answeredIdList;
      const score = req.body.score;

      await Quiz.createCandidateAnswer(
        currentCandidateId,
        answeredIdList,
        score
      );

      res.status(204).send();
    } catch (e) {
      res.status(500).send({ message: e });
    }
  },

  listCandidates: async (req, res) => {
    try {
      const result = await Quiz.listCandidates();

      res.status(201).json(result);
    } catch (e) {
      res.status(500).send({ message: e });
    }
  },

  deleteCandidate: async (req, res) => {
    try {
      const id = req.params.id;

      await Quiz.deleteCandidate(id);

      res.status(204).send();
    } catch (e) {
      res.status(500).send({ error: e });
    }
  },

  getCandidate: async (req, res) => {
    try {
      const id = req.params.id;
      const [candidateAnswers, correctAnswers] = await Quiz.getCandidate(id);

      res.status(201).send({ candidateAnswers, correctAnswers });
    } catch (e) {
      res.status(500).send({ message: e });
    }
  },
};
