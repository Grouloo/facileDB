const facileDB = require('../dist/index.js')

const myDB = new facileDB({
  path: (__dirname + '/exampleDB')
})

myDB.createDataset('users', {
  firstname: "string",
  lastname: "string",
  age: "int",
  registration_date: "date"
})

myDB.post('users', [
  {
    firstname: "Thurston",
    lastname: "Waffles",
    age: "10",
    registration_date: new Date()
  },
  {
    firstname: "John",
    lastname: "Smith",
    age: "24",
    registration_date: new Date(),
  },
  {
    firstname: "Jane",
    lastname: "Doe",
    age: "32",
    registration_date: new Date()
  }
])

const users = myDB.get('users', '*')
console.log(users)

