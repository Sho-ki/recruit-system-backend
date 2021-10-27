const util = require('util');
const bcrypt = require('bcrypt');
const connection = require('../DB/db');
const supabasejs = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = supabasejs.createClient(supabaseUrl, supabaseKey);

async function verifyPass(passA, passB) {
  let passwordCheck = await bcrypt.compare(passA, passB);
  return passwordCheck;
}

function supabaseErrorCheck(e) {
  if (e) throw e.message;
}

const Quiz = {
  signIn: async (username, password) => {
    try {
      let hashed_password = bcrypt.hashSync(password, 10);

      let { data: checkIfExists, error } = await supabase
        .from('admin')
        .select()
        .match({ username });

      if (checkIfExists.length > 0) throw 'User already exists';
      let { data, error2 } = await supabase
        .from('admin')
        .insert({ username, password: hashed_password });
      supabaseErrorCheck(error2);

      return data;
    } catch (e) {
      throw e;
    }
  },

  login: async (username, password) => {
    try {
      let { data, error } = await supabase
        .from('admin')
        .select()
        .match({ username });
      supabaseErrorCheck(error);

      if (data.length <= 0) {
        return false;
      }
      const storedPassword = data[0].password;
      const checkResult = await verifyPass(password, storedPassword);

      return checkResult;
    } catch (e) {
      throw e;
    }
  },

  listQuizes: async () => {
    try {
      let { data: quizes, error } = await supabase.from('list_quizes');

      supabaseErrorCheck(error);

      return quizes;
    } catch (e) {
      throw e;
    }
  },

  getQuiz: async (id) => {
    try {
      let { data: getQuiz, error } = await supabase.from('get_quiz');
      supabaseErrorCheck(error);

      let isValidEdit = true;
      let candidatesUsingQuiz = [];
      getQuiz.map((quiz) => {
        if (quiz.id === Number(id)) {
          isValidEdit = false;
          if (candidatesUsingQuiz.indexOf(quiz.candidates_id) < 0) {
            candidatesUsingQuiz.push(quiz.candidates_id);
          }
        }
      });
      let { data: getQuiz2, error: error2 } = await supabase
        .from('get_quiz2')
        .select()
        .match({ id });
      supabaseErrorCheck(error2);

      return { result: getQuiz2, isValidEdit, candidatesUsingQuiz };
    } catch (e) {
      throw e;
    }
  },

  createQuiz: async (quiz) => {
    const category = quiz.category;
    const quiz_text = quiz.quizText;
    const is_active = quiz.isActive;
    const is_correct = quiz.isCorrect;
    const choices = quiz.options;
    const index_number = quiz.indexNumber;

    try {
      let { data: insertQuiz, error } = await supabase
        .from('quizes')
        .insert({ category, quiz_text, is_active, index_number });
      supabaseErrorCheck(error);

      const newId = insertQuiz[0].id;

      let insertData = [];
      for (let i in choices) {
        let choice = {
          is_correct: is_correct === i,
          choice: choices[i].options,
          quizes_id: newId,
        };
        insertData.push(choice);
      }
      let { error: error2 } = await supabase
        .from('quiz_choices')
        .insert(insertData);
      supabaseErrorCheck(error2);
      return;
    } catch (e) {
      throw e;
    }
  },

  updateQuiz: async (id, category, quiz_text, is_active, index_number) => {
    try {
      let { error } = await supabase
        .from('quizes')
        .update({ category, quiz_text, is_active, index_number })
        .match({ id });
      supabaseErrorCheck(error);
      return;
    } catch (e) {
      throw e;
    }
  },

  updateChoice: async (id, isCorrect, options) => {
    try {
      let { data: findChoice, error } = await supabase
        .from('quiz_choices')
        .select()
        .match({ quizes_id: id });
      supabaseErrorCheck(error);

      let existChoiceLen = findChoice.length;
      let diff = options.length - existChoiceLen;

      if (diff >= 0) {
        let updateList = [];
        for (let i = 0; i < existChoiceLen; i++) {
          let option = {
            id: findChoice[i].id,
            is_correct: Number(isCorrect) === i,
            choice: options[i].options,
            quizes_id: id,
          };
          updateList.push(option);
        }
        let { error: error2 } = await supabase
          .from('quiz_choices')
          .upsert(updateList);
        supabaseErrorCheck(error2);

        let insertList = [];
        for (let i = existChoiceLen; i < diff + existChoiceLen; i++) {
          let option = {
            is_correct: Number(isCorrect) === i,
            choice: options[i].options,
            quizes_id: id,
          };
          insertList.push(option);
        }
        let { error: error3 } = await supabase
          .from('quiz_choices')
          .insert(insertList);
        supabaseErrorCheck(error3);
      } else {
        let updateList = [];
        let deleteList = [];
        let i = 0;
        while (i < options.length) {
          let option = {
            id: findChoice[i].id,
            is_correct: Number(isCorrect) === i,
            choice: options[i].options,
            quizes_id: id,
          };
          updateList.push(option);
          i++;
        }
        let { error: error4 } = await supabase
          .from('quiz_choices')
          .upsert(updateList);
        supabaseErrorCheck(error4);

        while (i < existChoiceLen) {
          deleteList.push(findChoice[i].id);
          i++;
        }

        let { error: error5 } = await supabase
          .from('quiz_choices')
          .delete()
          .in('id', deleteList);
        supabaseErrorCheck(error5);
      }
    } catch (e) {
      throw e;
    }
  },

  deleteQuiz: async (id) => {
    try {
      let isValidDelete = true;
      let candidatesUsingQuiz = [];

      const { data: getUsedQuizes, error } = await supabase.from(
        'get_used_quizes'
      );
      supabaseErrorCheck(error);

      getUsedQuizes.map((quiz, i) => {
        if (quiz.id === Number(id)) {
          isValidDelete = false;
          if (candidatesUsingQuiz.indexOf(quiz.candidates_id) < 0) {
            candidatesUsingQuiz.push(quiz.candidates_id);
          }
        }
      });
      if (!isValidDelete) {
        return { isValidDelete, candidatesUsingQuiz };
      }

      let { error: error2 } = await supabase
        .from('quizes')
        .delete()
        .match({ id });
      supabaseErrorCheck(error2);

      return { isValidDelete, candidatesUsingQuiz };
    } catch (e) {
      throw e;
    }
  },

  listActiveQuizes: async () => {
    try {
      let { data, error } = await supabase.from('get_active_quiz');
      supabaseErrorCheck(error);

      return data;
    } catch (e) {
      throw new Error(e);
    }
  },

  createCandidate: async (firstname, lastname, email) => {
    try {
      let { data, error } = await supabase
        .from('candidates')
        .insert({ firstname, lastname, email, score: null });
      supabaseErrorCheck(error);

      return data;
    } catch (e) {
      throw e;
    }
  },

  createCandidateAnswer: async (currentCandidateId, answeredIdList, score) => {
    try {
      let { error } = await supabase
        .from('candidates')
        .update({ score })
        .match({ id: currentCandidateId });
      supabaseErrorCheck(error);
      let queryValues = [];
      answeredIdList.map((id) => {
        let map = { quiz_choices_id: id, candidates_id: currentCandidateId };
        queryValues.push(map);
      });

      let { error: error2 } = await supabase
        .from('candidate_answers')
        .insert(queryValues);
      supabaseErrorCheck(error2);

      return;
    } catch (e) {
      throw e;
    }
  },

  listCandidates: async () => {
    try {
      let { data, error } = await supabase.from('candidates').select();
      supabaseErrorCheck(error);

      return data;
    } catch (e) {
      throw e;
    }
  },

  deleteCandidate: async (id) => {
    try {
      let { error } = await supabase.from('candidates').delete().match({ id });
      supabaseErrorCheck(error);

      return;
    } catch (e) {
      throw new Error(e);
    }
  },

  getCandidate: async (id) => {
    try {
      const { data, error } = await supabase
        .from('get_candidate')
        .select()
        .match({ id });
      supabaseErrorCheck(error);

      let correctAnswerIds = [];
      data.map((ans) => {
        let map = 'id.eq.' + ans.quizid;
        correctAnswerIds.push(map);
      });

      correctAnswerIds = correctAnswerIds.join(',');

      const { data: data2, error: error2 } = await supabase
        .from('get_candidate2')
        .select()
        .or(`${correctAnswerIds}`);
      supabaseErrorCheck(error2);

      return [data, data2];
    } catch (e) {
      throw new Error(e);
    }
  },
};

module.exports = Quiz;

// When using mysql
// const util = require("util");
// const bcrypt = require("bcrypt");
// const connection = require("../DB/db");

// async function verifyPass(passA, passB) {
//   let passwordCheck = await bcrypt.compare(passA, passB);
//   return passwordCheck;
// }

// const Quiz = {
//   signIn: async (username, password) => {
//     try {
//       let hashed_password = bcrypt.hashSync(password, 10);
//       const result = await util.promisify(connection.execute).bind(connection)(
//         `INSERT INTO admin (username, password) VALUES ('${username}', '${hashed_password}')`
//       );

//       return result;
//     } catch (e) {
//       throw new Error(e);
//     }
//   },

//   login: async (username, password) => {
//     try {
//       const result = await util.promisify(connection.execute).bind(connection)(
//         `SELECT * FROM admin WHERE username='${username}'`
//       );
//       if (result.length <= 0) {
//         return false;
//       }
//       const storedPassword = result[0].password;
//       const checkResult = await verifyPass(password, storedPassword);

//       return checkResult;
//     } catch (e) {
//       throw new Error(e);
//     }
//   },

//   listQuizes: async () => {
//     try {
//       const result = await util.promisify(connection.execute).bind(connection)(
//         `SELECT quizes.*, GROUP_CONCAT(quiz_choices.choice SEPARATOR '  /  ') as choices, GROUP_CONCAT(quiz_choices.is_correct SEPARATOR '  /  ') as is_correct FROM quizes LEFT JOIN quiz_choices ON quizes.id = quiz_choices.quizes_id group by quizes.id ORDER BY index_number ASC`
//       );
//       return result;
//     } catch (e) {
//       throw new Error(e);
//     }
//   },

//   getQuiz: async (id) => {
//     try {
//       const usedQuizesByCandidates = await util
//         .promisify(connection.execute)
//         .bind(connection)(
//         `SELECT quizes.id, candidate_answers.candidates_id FROM candidate_answers LEFT JOIN quiz_choices ON quiz_choices.id = candidate_answers.quiz_choices_id LEFT JOIN quizes ON quizes.id = quiz_choices.quizes_id ;
//       `
//       );

//       let isValidEdit = true;
//       let candidatesUsingQuiz = [];
//       usedQuizesByCandidates.map((quiz, i) => {
//         if (quiz.id === Number(id)) {
//           isValidEdit = false;
//           if (candidatesUsingQuiz.indexOf(quiz.candidates_id) < 0) {
//             candidatesUsingQuiz.push(quiz.candidates_id);
//           }
//         }
//       });

//       const query = `SELECT quizes.*, GROUP_CONCAT(quiz_choices.id SEPARATOR '  /  ') as ids, GROUP_CONCAT(quiz_choices.choice SEPARATOR '  /  ') as choices, GROUP_CONCAT(quiz_choices.is_correct SEPARATOR '  /  ') as is_correct FROM quizes LEFT JOIN quiz_choices ON quizes.id = quiz_choices.quizes_id GROUP by quizes.id Having id = ${id}`;

//       const result = await util.promisify(connection.execute).bind(connection)(
//         query
//       );

//       return { result, isValidEdit, candidatesUsingQuiz };
//     } catch (e) {
//       throw new Error(e);
//     }
//   },

//   createQuiz: async (quiz) => {
//     const category = quiz.category;
//     const quiz_text = quiz.quizText;
//     const is_active = quiz.isActive;
//     const is_correct = quiz.isCorrect;
//     const choices = quiz.options;
//     const index_number = quiz.indexNumber;

//     try {
//       const quizPromise = await util
//         .promisify(connection.execute)
//         .bind(connection)(
//         "INSERT INTO quizes(category, quiz_text, is_active, index_number) VALUES(?,?,?,?);",
//         [category, quiz_text, is_active, index_number]
//       );

//       const newId = quizPromise.insertId;
//       let choice_query = `INSERT INTO quiz_choices(is_correct, choice, quizes_id) VALUES`;
//       for (let i in choices) {
//         choice_query += `('${is_correct === i}', '${
//           choices[i].options
//         }', ${newId}),`;
//       }
//       choice_query = choice_query.slice(0, -1);

//       await util.promisify(connection.execute).bind(connection)(choice_query);
//     } catch (e) {
//       throw new Error(e);
//     }
//   },

//   updateQuiz: async (id, category, quiz_text, is_active, index_number) => {
//     try {
//       await util.promisify(connection.execute).bind(connection)(
//         `UPDATE quizes SET category = '${category}',quiz_text = '${quiz_text}',is_active = '${is_active}',index_number = '${index_number}' WHERE id = ${id};`
//       );
//     } catch (e) {
//       throw new Error(e);
//     }
//   },

//   updateChoice: async (id, isCorrect, options) => {
//     try {
//       const targetChoices = await util
//         .promisify(connection.execute)
//         .bind(connection)(
//         `SELECT id FROM quiz_choices WHERE quizes_id = ${id};`
//       );

//       for (let i = 0; i < options.length; i++) {
//         await util.promisify(connection.execute).bind(connection)(
//           `INSERT INTO quiz_choices (id, is_correct, choice, quizes_id )
//           values (${targetChoices[i] ? targetChoices[i].id : null}, '${
//             Number(isCorrect) === i
//           }' , '${options[i].options}', '${id}')
//          ON DUPLICATE KEY UPDATE is_correct = '${
//            Number(isCorrect) === i
//          }', choice='${options[i].options}',  quizes_id='${id}'`
//         );
//       }

//       if (targetChoices.length > options.length) {
//         let deleteList = [];
//         for (let i = options.length; i < targetChoices.length; i++) {
//           deleteList.push(targetChoices[i].id);
//         }
//         await util.promisify(connection.execute).bind(connection)(
//           `delete FROM quiz_choices where id IN (${deleteList.join(",")})`
//         );
//       }
//     } catch (e) {
//       throw new Error(e);
//     }
//   },

//   deleteQuiz: async (id) => {
//     try {
//       const usedQuizesByCandidates = await util
//         .promisify(connection.execute)
//         .bind(connection)(
//         `SELECT quizes.id, candidate_answers.candidates_id FROM candidate_answers LEFT JOIN quiz_choices ON quiz_choices.id = candidate_answers.quiz_choices_id LEFT JOIN quizes ON quizes.id = quiz_choices.quizes_id ;
//       `
//       );

//       let isValidDelete = true;
//       let candidatesUsingQuiz = [];
//       usedQuizesByCandidates.map((quiz, i) => {
//         if (quiz.id === Number(id)) {
//           isValidDelete = false;
//           if (candidatesUsingQuiz.indexOf(quiz.candidates_id) < 0) {
//             candidatesUsingQuiz.push(quiz.candidates_id);
//           }
//         }
//       });
//       if (!isValidDelete) {
//         return { isValidDelete, candidatesUsingQuiz };
//       }

//       await util.promisify(connection.execute).bind(connection)(
//         `DELETE FROM quizes WHERE id = ${id};`
//       );

//       return { isValidDelete, candidatesUsingQuiz };
//     } catch (e) {
//       throw new Error(e);
//     }
//   },

//   listActiveQuizes: async () => {
//     try {
//       const result = await util.promisify(connection.execute).bind(connection)(
//         `SELECT quizes.*, GROUP_CONCAT(quiz_choices.choice SEPARATOR '  /  ') as options_list,GROUP_CONCAT(quiz_choices.is_correct) as is_correct_list,GROUP_CONCAT(quiz_choices.id) as options_id_list FROM  mydb.quizes INNER JOIN quiz_choices ON quizes.id = quiz_choices.quizes_id  GROUP BY quizes.id having is_active=1  ORDER BY index_number ASC;
//         `
//       );

//       return result;
//     } catch (e) {
//       throw new Error(e);
//     }
//   },

//   createCandidate: async (firstname, lastname, email) => {
//     try {
//       const result = await util.promisify(connection.execute).bind(connection)(
//         "INSERT INTO candidates(firstname, lastname, email, score) VALUES(?, ?, ?, null)",
//         [firstname, lastname, email]
//       );

//       return result;
//     } catch (e) {
//       throw new Error(e);
//     }
//   },

//   createCandidateAnswer: async (currentCandidateId, answeredIdList, score) => {
//     try {
//       await util.promisify(connection.execute).bind(connection)(
//         "UPDATE candidates SET score = ? WHERE id = ?",
//         [score, currentCandidateId]
//       );

//       let queryValues = "";
//       answeredIdList.map((id, i) => {
//         i < answeredIdList.length - 1
//           ? (queryValues += `(${id}, ${currentCandidateId}),`)
//           : (queryValues += `(${id}, ${currentCandidateId})`);
//       });

//       await util.promisify(connection.execute).bind(connection)(
//         `INSERT INTO candidate_answers(quiz_choices_id, candidates_id) VALUES${queryValues}`
//       );
//     } catch (e) {
//       throw new Error(e);
//     }
//   },

//   listCandidates: async () => {
//     try {
//       const result = await util.promisify(connection.execute).bind(connection)(
//         `SELECT * FROM candidates`
//       );

//       return result;
//     } catch (e) {
//       throw new Error(e);
//     }
//   },

//   deleteCandidate: async (id) => {
//     try {
//       await util.promisify(connection.execute).bind(connection)(
//         `DELETE FROM candidates WHERE id = ${id};`
//       );

//       return;
//     } catch (e) {
//       throw new Error(e);
//     }
//   },

//   getCandidate: async (id) => {
//     try {
//       const candidateAnswers = await util
//         .promisify(connection.execute)
//         .bind(connection)(
//         `SELECT candidates.*, quizes.id , quizes.category,quizes.quiz_text, quiz_choices.is_correct, quiz_choices.choice FROM candidate_answers LEFT JOIN quiz_choices ON quiz_choices.id = candidate_answers.quiz_choices_id LEFT JOIN quizes ON quizes.id = quiz_choices.quizes_id LEFT JOIN candidates ON candidates.id= candidate_answers.candidates_id WHERE candidates_id=${id}  ORDER BY quizes.id ASC;
//           `
//       );

//       let correctAnswerIds = [];
//       candidateAnswers.map((ans) => {
//         correctAnswerIds.push(ans.id);
//       });
//       correctAnswerIds = correctAnswerIds.join(" or quizes.id=");

//       const correctAnswers = await util
//         .promisify(connection.execute)
//         .bind(connection)(
//         `SELECT quizes.id ,quiz_choices.choice FROM quizes LEFT JOIN quiz_choices ON quiz_choices.quizes_id = quizes.id WHERE is_correct='true' and (quizes.id=${correctAnswerIds}) ORDER BY quizes.id ASC;
//         `
//       );

//       return { candidateAnswers, correctAnswers };
//     } catch (e) {
//       throw new Error(e);
//     }
//   },
// };

// module.exports = Quiz;
