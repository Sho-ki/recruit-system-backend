
# Recruit-Test System Backend

Combined with [Recruit-Test System Frontend](https://github.com/Sho-ki/recruit-system-frontend).

This application is a system for testing candidates for corporate employment.
You can create questions in text and they will be displayed on the test screen.

## 🚀Demo
https://recruit-system-frontend.vercel.app/admin/home


## 🧐A Part of API References

#### Create a user
```http
  POST /signIn
```

#### Login
```http
  POST /login
```

#### Create a quiz
```http
  POST /quiz-api
```
#### Get a quiz

```http
  GET /quiz-api/:quiz-id
```



#### Update a quiz
```http
  POST /quiz-api/:quiz-id
```

#### Delete a quiz
```http
  POST /quiz-api/:quiz-id
```


#### Get all quizes

```http
  GET /quiz-api
```




