import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { body, query, validationResult } from 'express-validator'
import fs from 'fs'

const app = express()
app.use(bodyParser.json())
app.use(cors())


const PORT = process.env.PORT || 3000
const SECRET = "SIMPLE_SECRET"

interface dbSchema {
  users : User[]
}

interface User {
  username: string;
  password: string;
  firstname: string;
  lastname: string;
  balance: number;
}

interface JWTPayload {
  username: string;
  password: string;
  firstname: string;
  lastname: string;
  balance: number;
}

app.get('/',(req,res)=>{
  res.json('HELLO')
});


app.post('/login',
  (req, res) => {
    const { username, password} = req.body
    const raw = fs.readFileSync('db.json', 'utf8')
    const db : dbSchema = JSON.parse(raw)
    // Use username and password to create token.
    const user = db.users.find(user => user.username === username)
    if (!user) {
      res.status(400).json({"message": "Invalid username or password"
      })
      return
    }
    if (user?.password !== password) {
      res.status(400).json({"message": "Invalid username or password"
      })
      return
    }
    const token = jwt.sign({username: username, password: password},'SIMPLE_SECRET')
    return res.status(200).json({"message": 'Login succesfully',"token": token})
  })

app.post('/register', 
  (req, res) => {
    const { username, password, firstname, lastname, balance } = req.body
    const raw = fs.readFileSync('db.json', 'utf8')
    const db : dbSchema = JSON.parse(raw)
    const user = db.users.find(user => user.username === username)
    if (user) {
      res.status(400).json({"message": "Username is already in used"
      })
      return
    }
    else {
      db.users.push({
        username, 
        password, 
        firstname, 
        lastname, 
        balance 
      })
      fs.writeFileSync('db.json', JSON.stringify(db))
      res.status(200).json({"message": "Register successfully"})
    }
  })

app.get('/balance',
  (req, res) => {
    const token = req.query.token as string
    try {
      const { username } = jwt.verify(token, SECRET) as JWTPayload
      const raw = fs.readFileSync('db.json', 'utf8')
      const db : dbSchema = JSON.parse(raw)
      const user = db.users.find(user => user.username === username)
      if (user) {
        res.status(200).json({
          "name": username,
          "balance": user.balance
        })
        return
      }
    }
    catch (e) {
      //response in case of invalid token
      res.status(401).json({
        "message": "Invalid token"
      })
    }
  })

app.post('/deposit',
  body('amount').isInt({ min: 1 }),
  (req, res) => {
    //Is amount <= 0 ?
    if (!validationResult(req).isEmpty())
      return res.status(400).json({ message: "Invalid data" })

  })

app.post('/withdraw',
  (req, res) => {
    const token = req.query.token as string
    try {
      const { username } = jwt.verify(token, SECRET) as JWTPayload
      const raw = fs.readFileSync('db.json', 'utf8')
      const db : dbSchema = JSON.parse(raw)
      const user = db.users.find(user => user.username === username)
    }
    catch (e) {
      //response in case of invalid token
      res.status(401).json({
        "message": "Invalid token"
      })
    }
  })

app.delete('/reset', (req, res) => {

  //code your database reset here
  const raw = fs.readFileSync('db_blank.json', 'utf8')
  const db : dbSchema = JSON.parse(raw)
  fs.writeFileSync('db.json', JSON.stringify(db))
  
  return res.status(200).json({
    "message": 'Reset database successfully'
  })
})

app.get('/me', (req, res) => {
  res.status(200).json({
    "firstname": "Wisarut",
    "lastname" : "Tipbung",
    "code" : 620610807,
    "gpa" : 4.00
  })
})

app.get('/demo', (req, res) => {
  return res.status(200).json({
    message: 'This message is returned from demo route.'
  })
})

app.listen(PORT, () => console.log(`Server is running at ${PORT}`))