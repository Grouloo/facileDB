//facileDB 2020 - MIT

//Imports
const fs = require('fs');

class facileDB {

  /**
   * Constructor
   * @param {Object} params Parameters
   */
  constructor(params = {showErrorMessages: true, enableCache: true, enableLogs: true, compressDatasets: true}){

    this.allDB = [];
    this.operators = ['', '>', '<', '!', '=']

    //Parameters
    this.showErrorMessages = (params.showErrorMessages == null) ? true : !!params.showErrorMessages;
    this.enableCache = (params.enableCache == null) ? true : !!params.enableCache;
    this.enableLogs = (params.enableLogs == null) ? true : !!params.enableLogs;

    this.compressDatasets = (params.compressDatasets || params.compressDatasets == null) ? null : 2;
    this.directory = params.path ? (params.path.toString()) : (__dirname);
    this.path = this.directory + '/DB/'

    //Checking if any file isn't missing
    const directories = fs.readdirSync(this.directory)
    if (directories.indexOf('DB') == - 1) fs.mkdirSync(this.path);
    if (directories.indexOf('logs.txt') == - 1) fs.writeFileSync(this.directory + '/logs.txt', "", function (err){
      if(err) throw err;
    });

    //Reading the DB directory to find datasets
    fs.readdirSync(this.path).forEach(file => {
      this.allDB.push(file)
    });

    this.allDB.length ? this.showError("Datasets found : " + this.allDB) : this.showError("No dataset found.");

  }

  /**
   * Displays error message on console
   * @param {*} error_message Error message to display
   *
   */
  showError(error_message){

    if(this.showErrorMessages) console.log("[facileDB] " + error_message);

    if(this.enableLogs){
      const date = new Date()

      fs.appendFileSync(this.directory + '/logs.txt', `${date} : ${error_message} \n`)
    }

  }

  /**
   * Check if a dataset exists
   * @param {String} dataset_name Name of the DB that the user wants to check.
   * @returns {Bool} Returns true if the dataset exists.
   */
  doesDatasetExists(dataset_name){

    for(var i = 0; i < this.allDB.length; i++){
      if(this.allDB[i] == dataset_name){
        return true;
      }
    }

  }

  /**
   * Compare 2 values
   * @param {String} operator
   * @param {*} value1 Value of the entry
   * @param {*} value2 Value of the router
   * @returns {Bool} Returns a
   */
  allOperatorsConditions(operator, value1, value2){

    var result;

    switch(operator){
      case '>':
        result = (value1 > value2)
        break;

      case '<':
        result = (value1 < value2)
        break;

      case '!':
        result = (value1 != value2)
        break;

      case '=':
        result = (value1 == value2)
        break;

      default:
        result = (value1 === value2)
        break;
    }

    return result;
  }


  /**
   * Format a value for a field
   * @param {String} type
   * @param {*} value
   */
  formatValue(type, value){
    switch(type){
      case 'bool':
        value = !!value;
        break;

      case 'int':
        value = parseInt(value);
        break;

      case 'float':
        value = parseFloat(value);
        break;

      case 'string':
        value = value.toString();
        break;

      case 'date':
        value = value.toString();
        break;
    }

    return value
  }

  /**
   * Searches an entry of a dataset by field
   * @param {String} dataset_name Dataset to search
   * @param {*} field Field of the model where the user wants to find a correspondance
   * @param {*} value The value for the field set.
   * @returns {Array} Returns an array of objects
  */
  searchInDataset(dataset_name, field, value){

    var dataset_length = []
    var response = []

    var field = (field.split('')[0] == "[") ? JSON.parse(field) : field

    if(!Array.isArray(field)){
      field = [field]
      var value = [value]
    }else{
      var value = value
    }

    var operator = []

    for(var i = 0; i < field.length; i++){

      operator.push(field[i].split('')[field[i].split('').length - 1])

      if(operator[i] == (">" || "<" || "!" || "=")){
        field[i] = (field[i].replace(operator[i], ''))
      }else{
        operator[i] = ""
      }


      var rawRouter = fs.readFileSync(this.path + dataset_name + '/indexes/router/' + field[i] + '/' + field[i] + operator[i] + '.json', function read(err, data) {
        if (err) {
          throw err;
        }
      })

      //Parsing the Router
      var parsedRouter = JSON.parse(rawRouter)


      //If there is a route, then we search in the corresponding index
      if(parsedRouter && parsedRouter[value[i]]){

        var entries_to_search = []

        //Reading the index directory
        fs.readdirSync(this.path + dataset_name + '/indexes/' + parsedRouter[value[i]]).forEach(file => {

          //Reading the entry
          var rawEntry = fs.readFileSync(this.path + dataset_name + '/indexes/' + parsedRouter[value[i]] + '/' + file, function read(err, data) {
            if (err) {
              throw err;
            }
          });

          //Parsing the entry
          var parsedEntry = JSON.parse(rawEntry)

          entries_to_search.push(parsedEntry.index)

        })

        //Reading all entries in the index
        entries_to_search.forEach(entry => {

          //Reading the entry
          var rawEntry = fs.readFileSync(this.path + dataset_name + '/data/' + entry + '.json', function read(err, data) {
            if (err) {
              throw err;
            }
          });

          //Parsing the entry
          var parsedEntry = JSON.parse(rawEntry)

          response.push(parsedEntry)
        })

         //Delete duplicates
         var map = {}
         var array = []
         for(var i = 0; i < response.length; i++){

           if(!map[JSON.stringify(response[i])]){
             array.push(response[i]);
             map[JSON.stringify(response[i])] = true;
           }

         }

      //If there is no route
      }else{

        //Reading the data directory
        fs.readdirSync(this.path + dataset_name + '/data').forEach(file => {

          //Reading the entry
          var rawEntry = fs.readFileSync(this.path + dataset_name + '/data/' + file, function read(err, data) {
            if (err) {
              throw err;
            }
          });

          //Parsing the entry
          var parsedEntry = JSON.parse(rawEntry)

          //Checking if this is an entry that we want
          var truth_table = [];
          for(var i = 0; i < field.length; i++){
            if(this.allOperatorsConditions(operator[i], parsedEntry[field[i]], value[i])){
              if(i == field.length - 1){
                response.push(parsedEntry)
              }
            }else{
              break;
            }
          }

        });

        //Delete duplicates
        var map = {}
        var array = []
        for(var i = 0; i < response.length; i++){

          if(!map[JSON.stringify(response[i])]){
            array.push(response[i]);
            map[JSON.stringify(response[i])] = true;
          }

        }

        response = array

        //Creation of a new route and a new index
        if(this.enableCache && (field[i] + operator[i]) && (value[i])){
          this.createIndex(dataset_name, {title: 'auto_' + field[i] + operator[i] + '_' + value[i], field: field[i] + operator[i], value: value[i]})
        }
      }

    //}
      return response

    }
  }

  /**
   * Gets the number of entries in a dataset
   * @param {String} dataset_name Name of the dataqet
   * @returns {int} Returns the length of the dataset
  */
  lengthOfDataset(dataset_name){

    var dataset_length = 0


    //Get dataset length
    var allEntries = fs.readdirSync(this.path + dataset_name + '/data')

    if(allEntries[allEntries.length - 1]){
      dataset_length = parseInt(allEntries[allEntries.length - 1].replace('.json', '')) + 1
    }else{
      dataset_length = 0
    }

    return dataset_length;

  }


  /**
   * Get the number of entries of an index
   * @param {String} dataset_name Name of the dataqet
   * @returns {int} Length of the dataset
  */
 lengthOfIndex(dataset_name, index_name){

  var index_length = 0

  //Get dataset length
  fs.readdirSync(this.path + dataset_name + '/indexes/' + index_name, (err, files) => {
    index_length = files.length;
  });

  return index_length;

}


  /**
   *
   * @param {String} dataset_name
  */
  createRouter(dataset_name){

    //Getting the model of the dataset
    var rawModel = fs.readFileSync(this.path + dataset_name + '/model.json', function read(err, data) {
      if (err) {
          throw err;
      }
    })

    var parsedModel = JSON.parse(rawModel)

    //Creation of the router directory
    fs.mkdirSync(this.path + dataset_name + '/indexes/router', function(err) {
      if (err) {
        console.log(err)
      }
    })

    //Content of the router file
    //var router = {index: {}};

    for(var field in parsedModel){

      //Creation of the field's directory
      fs.mkdirSync(this.path + dataset_name + '/indexes/router/' + field, function(err) {
        if (err) {
          console.log(err)
        }
      })

      //Creating a file for each file and each operator
      this.operators.forEach(operator => {

        fs.writeFileSync(this.path + dataset_name + '/indexes/router/' + field + '/' + field + operator + '.json', JSON.stringify({}), function (err) {
          if (err) throw err;
          console.log(req);
        })

      })

    }

  }


  /**
   * Sorts a response by Ascending or Descending order
   * @param {Object} model
   * @param {Object} response
   * @param {Object} parameters
  */
  sortResponse(model, response, parameters){

    //If parameters are specified...
    if(parameters){

      var array_to_return = response;

      if(parameters.sortedBy && parameters.sortOrder && typeof parameters.sortedBy == 'string'){

        switch(parameters.sortOrder){

          //Ascending order
          case 'ASC':

            if(model[parameters.sortedBy] == 'date'){

              array_to_return = response.sort(function(a, b){
                return new Date(a[parameters.sortedBy]) - new Date(b[parameters.sortedBy])
              })

            }else{

              array_to_return = response.sort(function(a, b){
                return a[parameters.sortedBy] > b[parameters.sortedBy]
              })

            }

            break;

          //Descending order
          case 'DESC':

            if(model[parameters.sortedBy] == 'date'){

              array_to_return = response.sort(function(a, b){
                return new Date(b[parameters.sortedBy]) - new Date(a[parameters.sortedBy])
              })

            }else{

              array_to_return = response.sort(function(a, b){
                return b[parameters.sortedBy] > a[parameters.sortedBy]
              })

            }

            break;

        }

      }

      //If a range is precised we return only the entries specified
      if(parameters.rangeMax){

        if(!parameters.rangeMin) parameters.rangeMin = 0

        array_to_return = array_to_return.slice(parameters.rangeMin, parameters.rangeMax)

      }

      return array_to_return


    }

  }


  /**
   * Creates a new Dataset
   * @param {String} dataset_name Name of the new dataset.
   * @param {Object} model Model of the Dataset. Format : {field: type} Ex : {"id": "int", ...}
   * @returns console.log
   */
  createDataset(dataset_name, model){

    //The user must provides a name for the DB
    if(dataset_name){

      //The DB name musn't be associated with another DB
      if(!this.doesDatasetExists(dataset_name)){

        //The model provided must be an object
        if(typeof model == 'object'){

          //Push dataset_name in the allDB arg
          this.allDB.push(dataset_name);

          //Creation of the data and indexes directory
          var directories = [dataset_name, dataset_name + '/data', dataset_name + '/indexes']

          directories.forEach(directory =>

            fs.mkdirSync(this.path + directory, function(err) {
              if (err) {
                console.log(err)
              }
            })

          )

          //Creation of the model file
          fs.writeFileSync(this.path + dataset_name + '/model.json', JSON.stringify(model, null, this.compressDatasets), function (err) {
            if (err) throw err;
            console.log(req);
          })

          //Creation of the Router file
          this.createRouter(dataset_name)

          this.showError("Dataset \"" + dataset_name + "\" has been successfully created.")

        }else this.showError("Model of the dataset must be an Object.")

      }else this.showError("Another dataset named \"" + dataset_name + "\" already exists.");

    }else this.showError("Dataset name is null.");

  }


  /**
   * Removes a dataset
   * @param {String} dataset_name Name of the dataset to be removed.
   * @returns console.log
   */
  removeDataset(dataset_name){

    //The user must provides a name for the DB
    if(dataset_name){

      //The DB name musn't be associated with another DB
      if(this.doesDatasetExists(dataset_name)){

          //Removing dataset_name in the allDB arg
          this.allDB.filter(eleemnt => element != dataset_name);

          //Removing the Dataset
          fs.rmdirSync(this.path + dataset_name, { recursive: true }, function (err) {
            if (err) throw err;
            console.log(req);
          })

          this.showError("Dataset \"" + dataset_name + "\" successfully removed.")


      }else this.showError("Dataset \"" + dataset_name + "\" doesn't exist.");

    }else this.showError("Dataset name is null.");
  }


  /**
   * Creates an index in a dataset
   * @param {String} dataset_name Name of the dataset
   * @param {Object} query {title: [Index title], field: [Field], value: [Value]}
   */
  createIndex(dataset_name, query){

    if(this.doesDatasetExists(dataset_name)){

      if(typeof query == 'object'){

        if(query.title){

          if(query.field && query.value){

            var field;
            var operator = query.field.split('')[query.field.split('').length - 1]

            if(operator == ('>' || '<' || '!' || "=")){
              field = query.field.replace(operator, '')
            }else{
              field = query.field
            }

            //Creation of the index directory
            fs.mkdirSync(this.path + dataset_name + '/indexes/' + query.title, function(err) {
              if (err) {
                console.log(err)
              }
            })

            //Searching the entries to index
            if(query.response){
              var entries_to_index = query.response
            }else{
              //We have to disable the cache for this
              const enableCache = this.enableCache
              this.enableCache = false

              var entries_to_index = this.searchInDataset(dataset_name, query.field, query.value)

              this.enableCache = enableCache
            }


            //Indexing all the entries found
            for(var i in entries_to_index){

              var entry_content = {index: entries_to_index[i].index}

              fs.writeFileSync(this.path + dataset_name + '/indexes/' + query.title + '/' + entry_content.index + '.json', JSON.stringify(entry_content, null, this.compressDatasets), function(err) {
                if (err) {
                  console.log(err)
                }
              })
            }

            //Reading the router file
            var rawRouter = fs.readFileSync(this.path + dataset_name + '/indexes/router/' + field + '/' + query.field + '.json', function(err) {
              if (err) {
                console.log(err)
              }
            })
            var parsedRouter = JSON.parse(rawRouter)

            console.log(query.value)

            //Adding the route to the Router
            parsedRouter[query.value] = query.title

            //Writing the router file
            fs.writeFileSync(this.path + dataset_name + '/indexes/router/' + field + '/' + query.field + '.json', JSON.stringify(parsedRouter, null, this.compressDatasets), function(err) {
              if (err) {
                console.log(err)
              }
            })

            this.showError("Index \"" + query.title + "\" successfully created in \"" + dataset_name + "\".")

          }else this.showError("A Field and a Value must be assigned to the Index")

        }else this.showError("A title must be assigned to the Index.");

      }else this.showError("Query must be an Object.");

    }else this.showError("Dataset \"" + dataset_name + "\" doesn't exist.");
  }


  /**
   * Gets entries from a dataset
   * @param {String} dataset_name
   * @param {Object || String} query "*" to return full content, {field: value} to get specific elements
   * @param {Array} parameters {sortedBy: {String}, sortOrder: "ASC" | "DESC", rangeMin: {int}, rangeMax: {int}}
   * @returns {Array} Array of objects
   */
  get(dataset_name, query = "*", parameters){

    if(this.doesDatasetExists(dataset_name)){

      //Read model file
      var rawModel = fs.readFileSync(this.path + dataset_name + '/model.json', function read(err, data) {
        if (err) {
            throw err;
        }
      })


      var parsedModel = JSON.parse(rawModel)

      if(typeof query == 'object'){

        var array_to_return = [];

        for(var element in query){
          var result = this.searchInDataset(dataset_name, element, query[element]);
          array_to_return = array_to_return.concat(result)
        }

        this.sortResponse(parsedModel, array_to_return, parameters)

        return(array_to_return)


      }else if(query == '*'){

        //Get all entries in the dataset
        var allEntries = []
        var response = []

        //Getting all entries in the data directory
        fs.readdirSync(this.path + dataset_name + '/data').forEach(file => {
          allEntries.push(file)
        });

        //Parsing all entries contents and pushing them into a returnable array
        for(var index in allEntries){

          var rawEntry = fs.readFileSync(this.path + dataset_name + '/data/' + allEntries[index], function read(err, data) {
            if (err) {
                throw err;
            }
          });

          var parsedEntry = JSON.parse(rawEntry)

          response.push(parsedEntry)
        }

        this.sortResponse(parsedModel, response, parameters)

        //Returning all the entries from the dataset
        return(response)

      }else this.showError("Query must be an Object or '*'");

    }else this.showError("Dataset \"" + dataset_name + "\" doesn't exist.");

  }


  /**
   * Pushes a new entry into a dataset
   * @param {String} dataset_name Name of the DB
   * @param {Array} query Array contening the entries to add to the DB
   */
  post(dataset_name, query){

    if(this.doesDatasetExists(dataset_name)){

      //Checking the query format
      if(Array.isArray(query)){

        var operators = ['', '>', '<', '!', '=']

        var rawModel = fs.readFileSync(this.path + dataset_name + '/model.json', function read(err, data) {
          if (err) {
              throw err;
          }
        })

        var parsedModel = JSON.parse(rawModel)

        //Get dataset length
        var db_index = this.lengthOfDataset(dataset_name)


        //Pushing each new entry in the DB separately
        for(var i = 0; i < query.length; i++){

          var new_entry = {index: db_index}

          //Formating the new entry according to the model
          for(var field in parsedModel){

            var value = query[i][field];

            //Formating the values according to the model
            if(value){

              value = this.formatValue(parsedModel[field], value)
              new_entry[field] = value;

            }else{

              value = this.formatValue(parsedModel[field], "")
              new_entry[field] = value;

            }

          }


          //Pushing the new entry in the dataset
          fs.writeFileSync(this.path + dataset_name + '/data/' + db_index + '.json', JSON.stringify(new_entry, null, this.compressDatasets), function (err) {
            if (err) throw err;
            console.log(req);
          })

          //Pushing the new entry in the indexes
          fs.readdirSync(this.path + dataset_name + '/indexes/router').forEach(field => {

            operators.forEach(operator => {

              //Reading the Router file
              var rawRouter = fs.readFileSync(this.path + dataset_name + '/indexes/router/' + field + '/' + field + operator + '.json', function read(err, data) {
                if (err) {
                    throw err;
                }
              })

              //Parsing the Router file
              var parsedRouter = JSON.parse(rawRouter)

              for(var value in parsedRouter){

                if(this.allOperatorsConditions(operator, value, new_entry[field])){

                  //Get the length of the Index
                  var index_length = this.lengthOfIndex(dataset_name, parsedRouter[value])

                  //Pushing the new entry in the index
                  fs.writeFileSync(this.path + dataset_name + '/indexes/' + parsedRouter[value] + '/' + db_index + '.json', JSON.stringify({index: db_index}, null, this.compressDatasets), function (err) {
                    if (err) throw err;
                    console.log(req);
                  })

                }
              }

            })

          })

          db_index += 1

        }

      }else this.showError("Query must be an Array of Objects.")

    }else this.showError("Dataset \"" + dataset_name + "\" doesn't exist.");

  }


  /**
   * Updates an entry of a dataset
   * @param {*} dataset_name
   * @param {Object} existing_value {field: value}
   * @param {Object} replacing_value {field: value}
   */
  update(dataset_name, existing_value, replacing_value){

    if(this.doesDatasetExists(dataset_name)){

      //Checking the query format
      //if(Array.isArray(existing_value)){

      if(typeof existing_value == 'object'){

        var operators = ['', '>', '<', '!', '=']

        //Reading Model file
        var rawModel = fs.readFileSync(this.path + dataset_name + '/model.json', function read(err, data) {
          if (err) {
              throw err;
          }
        })

        //Parsing Model file
        var parsedModel = JSON.parse(rawModel)

        //Get index
        var db_index = this.lengthOfDataset(dataset_name)

        //Checking the query format
        if(typeof replacing_value == 'object'){

          for(var element in existing_value){

            var value_to_replace = this.searchInDataset(dataset_name, element, existing_value[element]);
            //value_to_replace = value_to_replace[0];

            for(var entry in value_to_replace){

              for(var replacing_element in replacing_value){

                value_to_replace[entry][replacing_element] = replacing_value[replacing_element];

                //Indexing
                operators.forEach(operator => {

                  var rawRouter = fs.readFileSync(this.path + dataset_name + '/indexes/router/' + replacing_element + '/' + replacing_element + operator + '.json', function read(err, data) {
                    if (err) {
                        throw err;
                    }
                  })

                  var parsedRouter = JSON.parse(rawRouter)

                  for(var field in parsedRouter){

                    if(this.allOperatorsConditions(operator, value_to_replace[entry][replacing_element], field)){

                      var index_content = {index: value_to_replace[entry].index}

                      fs.writeFileSync(this.path + dataset_name + '/indexes/' + parsedRouter[field] + '/' + value_to_replace[entry].index + '.json', JSON.stringify(index_content, null, this.compressDatasets), function (err) {
                        if (err) throw err;
                        console.log(req)
                      })

                    }else{

                      fs.readdirSync(this.path + dataset_name + '/indexes/' + parsedRouter[field]).forEach(index_file => {
                        if(index_file == (value_to_replace[entry].index + '.json')){
                          fs.unlinkSync(this.path + dataset_name + '/indexes/' + parsedRouter[field] + '/' + value_to_replace[entry].index + '.json', (err) => {
                            if (err) {
                              console.error(err)
                              return
                            }
                          })
                        }
                      })

                    }

                  }

                })

              }

              //Updating the entry in the dataset
              fs.writeFileSync(this.path + dataset_name + '/data/' + value_to_replace[entry].index + '.json', JSON.stringify(value_to_replace[entry], null, this.compressDatasets), function (err) {
                if (err) throw err;
                console.log(req);
              })

            }

          }

        }else this.showError("Existing value must have 2 entries.")


      }else this.showError("Query must be an Object.")

    }else this.showError("Dataset \"" + dataset_name + "\" doesn't exist.");

  }


  /**
   * Removes an entry of a dataset
   * @param {String} dataset_name Name of the dataset
   * @param {Object} query {field: value}
   */
  remove(dataset_name, query){

    if(this.doesDatasetExists(dataset_name)){

      //Checking the query format
      if(typeof query == 'object'){

        //Read Model file
        var rawModel = fs.readFileSync(this.path + dataset_name + '/model.json', function read(err, data) {
          if (err) {
              throw err;
          }
        })

        var parsedModel = JSON.parse(rawModel)

        for(var element in query){

          var entry_to_remove = this.searchInDataset(dataset_name, element, query[element]);

          for(var i in entry_to_remove){

            //Removing the entry from the indexes
            for(var field in parsedModel){

              this.operators.forEach(operator => {

                var rawRouter = fs.readFileSync(this.path + dataset_name + '/indexes/router/' + field + '/' + field + operator + '.json', function read(err, data) {
                  if (err) {
                      throw err;
                  }
                })

                var parsedRouter = JSON.parse(rawRouter)

                for(var value in parsedRouter){

                  if(this.allOperatorsConditions(operator, entry_to_remove[i][field], value)){

                    //Removing the entry from the index
                    fs.unlinkSync(this.path + dataset_name + '/indexes/' + parsedRouter[value] + '/' + entry_to_remove[i].index + '.json')

                  }
                }

              })

            }

            //Removing entry file
            fs.unlinkSync(this.path + dataset_name + '/data/' + entry_to_remove[i].index + ".json")

          }

        }

      }else this.showError("query must be an Object")


    }else this.showError("Dataset \"" + dataset_name + "\" doesn't exist.");
  }


  /**
   * Empties the content of a dataset
   * @param {*} dataset_name Name of the dataset
   */
  empty(dataset_name){

    if(this.doesDatasetExists(dataset_name)){

      //Removing the data and indexes directories and re-creating them
      var directories = ['/data', '/indexes']

      directories.forEach(directory => {

        //Removing
        fs.rmdirSync(this.path + dataset_name + directory, { recursive: true }, (err) => {
          if (err) {
              throw err;
          }
        })

        //Re-creating
        fs.mkdirSync(this.path + dataset_name + directory, function(err) {
          if (err) {
            console.log(err)
          }
        })

      })

      //Re-creating the router
      this.createRouter(dataset_name)

      this.showError("Dataset \"" + dataset_name + "\" has been emptied.")


    }else this.showError("Dataset \"" + dataset_name + "\" doesn't exist.");

  }

}

module.exports = facileDB
