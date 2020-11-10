# facileDB

Basic NodeJS noSQL DB manager

## Initialize

### Syntax

``new facileDB(parameters)`` 

#### Parameters {Object}

```JSON
{
	path: {String}, /* Path to the directory of the DB. By default, the DB will be stocked in the DB directory of the module. */
	
	showErrorMessages : {Bool}, /* If set on true, display error messages in the console. Set on true by default. */
	
	enableCache: {Bool}, /* If set on true, results from queries will be automatically indexed. Set on true by default */
	
	enableLogs: {Bool}, /* If set on true, all error messages and warnings will be conserved in a file. Set on true by default */
	
	compressDatasets: {Bool} /* If set on true, all entries in the DB will be minified. Set on true by default. */
}
```

### Examples

#### Using the default values

```JavaScript
const facileDB = require('facileDB')

const myDB = new facileDB()
```

#### Disabling all parameters

```JavaScript
const facileDB = require('facileDB')

const myDB = new facileDB({
	path: './myDB', 
	showErrorMessages: false, 
	enableCache: false, 
	enableLogs: false, 
	compressDatasets: false
})
```

## Create a Dataset

### Syntax

```JavaScript
facileDB.createDataset(name, model)
```

#### Parameters

##### name {String}

The name of your new Dataset

##### model {Object}

```JavaScript
{
	[field]: type {String},
	[...]
}
```

**types**

```
bool
int
float
string
array
date
```

### Example

Let's create a Dataset to store our users' informations.

```JavaScript
const facileDB = require('facileDB')

const myDB = new facileDB()

myDB.createDataset('users', {
	firstname: "string",
	lastname: "string",
	age: "int",
	registration_date: "date"
})

/*
Console : 
[facileDB] Dataset "users" has been successfully created 
*/
```

## Remove a Dataset

### Syntax

```JavaScript
facileDB.removeDataset(name)
```

####Parameters

##### name {String}

The name of your new Dataset

### Example

Let's create a Dataset to stock our users' informations.

```JavaScript
const facileDB = require('facileDB')

const myDB = new facileDB()

myDB.removeDataset('users')

/*
Console : 
[facileDB] Dataset "users" has been successfully removed 
*/
```


## Post content into a Dataset

### Syntax

```JavaScript
facileDB.post(name, query)
```

#### Parameters

##### name {String}

Name of the Dataset

##### query {Array}

Array containing the Entries to post into the Dataset

```JavaScript
[
	{
		[field]: value {*},
		[...]
	},
	[...]
]
```

### Examples

Let's insert something into our Dataset *users*

```JavaScript
const facileDB = require('facileDB')

const myDB = new facileDB()

myDB.post('users', [{
	firstname: "Thurston",
	lastname: "Waffles",
	age: 10,
	registration_date: new Date()
}]

```

We can also insert more than one entry at once :

```JavaScript
const facileDB = require('facileDB')

const myDB = new facileDB()

myDB.post('users', [
	{
		firstname: "John",
		lastname: "Smith",
		age: 24,
		registration_date: new Date()
	},
	{
		firstname: "Jane",
		lastname: "Doe",
		age: 32,
		registration_date: new Date()
	}
])
```

## Get entries from a Dataset

### Syntax

```JavaScript
facileDB.get(name, query, parameters (optionnal))
```

#### Parameters

##### name {String}

Name of the Dataset

##### query {Object|String}

To get selected Entries

```JavaScript
{
	[field]: value {*},
	[field] + ">"|"<"|"!"|"=": value {*}
	[...] 
}
```

To get all Entries in the Dataset

```JavaScript
"*"
```

##### parameters {Object} (Optionnal)

```JavaScript
{
	sortedBy: field {String},
	
	sortOrder: "ASC"|"DESC",
	
	rangeMin: {int},
	
	rangeMax: {int} > rangeMin 
}
```

### Examples

Getting all entries in the Dataset :

```JavaScript
const facileDB = require('facileDB')

const myDB = new facileDB()

const users = myDB.get('users', '*')
console.log(users)

/*
Console :
[
	{
		index: 0,
		firstname: "Thurston",
		lastname: "Waffles",
		age: 10,
		registration_date: "Fri Nov 06 2020 12:00:00 GMT+0100"
	},
	{
		index: 1,
		firstname: "John",
		lastname: "Smith",
		age: 24,
		registration_date: "Fri Nov 06 2020 12:00:00 GMT+0100"
	},
	{
		index: 2,
		firstname: "Jane",
		lastname: "Doe",
		age: 32,
		registration_date: "Fri Nov 06 2020 12:00:00 GMT+0100"
	}
]
*/ 
```

Looking for a specific entry :

```JavaScript
const facileDB = require('facileDB')

const myDB = new facileDB()

const users = myDB.get('users', {firstname: "John"})
console.log(users)

/*
Console :
[{
	index: 1,
	firstname: "John",
	lastname: "Smith",
	age: 24,
	registration_date: "Fri Nov 06 2020 12:00:00 GMT+0100"
}]
*/ 
```

Using operators :

```JavaScript
const facileDB = require('facileDB')

const myDB = new facileDB()

const users = myDB.get('users', {age>: 10})
console.log(users)

/*
Console :
[
	{
		index: 1,
		firstname: "John",
		lastname: "Smith",
		age: 24,
		registration_date: "Fri Nov 06 2020 12:00:00 GMT+0100"
	},
	{
		index: 2,
		firstname: "Jane",
		lastname: "Doe",
		age: 32,
		registration_date: "Fri Nov 06 2020 12:00:00 GMT+0100"
	}
]
*/ 
```

Fetching entries with *a certain index* **or** *a certain age*

```JavaScript
const facileDB = require('facileDB')

const myDB = new facileDB()

const users = myDB.get('users', {
	index<: 2, 
	age: 32
})
console.log(users)

/*
Console :
[
	{
		index: 0,
		firstname: "Thurston",
		lastname: "Waffles",
		age: 10,
		registration_date: "Fri Nov 06 2020 12:00:00 GMT+0100"
	},
	{
		index: 1,
		firstname: "John",
		lastname: "Smith",
		age: 24,
		registration_date: "Fri Nov 06 2020 12:00:00 GMT+0100"
	},
	{
		index: 2,
		firstname: "Jane",
		lastname: "Doe",
		age: 32,
		registration_date: "Fri Nov 06 2020 12:00:00 GMT+0100"
	}
]
*/ 
```

Fetching entries with *a certain index* **and** *a certain age*

```JavaScript
const facileDB = require('facileDB')

const myDB = new facileDB()

const users = myDB.get('users', {
	JSON.stringify([index>, age<]): [0, 32]
})
console.log(users)

/*
Console :
[
	{
		index: 1,
		firstname: "John",
		lastname: "Smith",
		age: 24,
		registration_date: "Fri Nov 06 2020 12:00:00 GMT+0100"
	}
]
*/ 
```

## Update entries

### Syntax

```JavaScript
facileDB.update(name, query, update)
```

#### Parameters

##### name {String}

Name of the Dataset

##### query {Object|String}

Entries to update

```JavaScript
{
	[field]: value {*},
	[field] + ">"|"<"|"!"|"=": value {*}
	[...] 
}
```

##### update {Object}

Fields to update

```JavaScript
{
	[field]: new_value (*),
	[...]
}
```

### Example

Let's try to update an entry from our Dataset *users*

```JavaScript
const facileDB = require('facileDB')

const myDB = new facileDB()

myDB.update('users', {index: 0}, {age: 12})
```

Now, if we try to get the entry we just updated :

```JavaScript
const facileDB = require('facileDB')

const myDB = new facileDB()

const users = myDB.get('users', {index: 0})
console.log(users)

/*
Console :
[
	{
		index: 0,
		firstname: "Thurston",
		lastname: "Waffles",
		age:12,
		registration_date: "Fri Nov 06 2020 12:00:00 GMT+0100"
	}
]
*/
```

## Remove entries

### Syntax

```JavaScript
facileDB.remove(name, query)
```

#### Parameters

##### name {String}

Name of the Dataset

##### query {Object|String}

Entries to remove

```JavaScript
{
	[field]: value {*},
	[field] + ">"|"<"|"!"|"=": value {*}
	[...] 
}
```

### Example

Removing an entry from our Dataset *users*

Getting all entries in the Dataset :

```JavaScript
const facileDB = require('facileDB')

const myDB = new facileDB()

myDB.remove('users', {index: 1})
```

Now, if we fetch all the entries in *users*...

```JavaScript
const facileDB = require('facileDB')

const myDB = new facileDB()

const users = myDB.get('users', '*')
console.log(users)

/*
Console :
[]
*/ 
```

## Empty a Dataset

### Syntax

```JavaScript
facileDB.empty(name)
```

#### Parameters

##### name {String}

Name of the Dataset to empty.

### Example

```JavaScript
const facileDB = require('facileDB')

const myDB = new facileDB()

myDB.empty('users')
```
