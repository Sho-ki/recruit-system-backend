
# Recruit-Test System Backend

Combined with [Recruit-Test System Frontend](https://github.com/Sho-ki/recruit-system-frontend).

## 📝Description
This application is a system for testing candidates for corporate employment.
You can create questions in text and they will be displayed on the test screen.

## 🚀Demo
https://recruit-system-frontend.vercel.app/admin/home


## 🤖Tech Stack

**Client:** React, Next.js

**Server:** Node, Express

**Databse:** PostgreSQL

## Installation
```
git clone https://github.com/Sho-ki/recruit-system-backend.git
cd recruit-system-backend
npm i
```
## Getting Started 
```
npm run dev
```


## 🧐API References

#### Create a user
```
  POST /signIn
```

#### Login
```
  POST /login
```

#### Create a quiz
```
  POST /quiz-api
```
#### Get a quiz

```
  GET /quiz-api/:quiz-id
```

#### Update a quiz
```
  POST /quiz-api/:quiz-id
```

#### Delete a quiz
```
  POST /quiz-api/:quiz-id
```

#### Get all quizes
```
  GET /quiz-api
```

#### Get active quizes
```
  GET /active-quiz-api
```

#### Create a candidate
```
  POST /candidate-api
```

#### Create a candidate answer
```
  POST /candidate-answer-api
```

#### Get a candidates and answer
```
  GET /candidate-api/:candidate-id
```

#### Delete a candidates and answer
```
  Delete /candidate-api/:candidate-id
```

#### Get all candidates
```
  GET /candidate-api
```
