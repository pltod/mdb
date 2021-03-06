Utility for starting MongoDB in any directory and init/reinit db/collection from json files.


# How to Install

* dependencies with ```npm i``` 

* register the module with ```npm link``` 

* put the default values in config.json

* use commands like ```mdb start```, ```mdb init db```, ```mdb init collection```

* run ```node mdb help``` to see all commands and how to use it


# How to Use

**USAGE:**

* ```node mdb help``` or ```node mdb --help```

> Shows help
  
* ```node mdb started```

> Shows running mongo processes
  
* ```node mdb start {--in LOCATION}```

> Starts mongodb in specified location only if this location exists. 
> Otherwise mongodb is started in default location.
> If 'in' parameter is not specified mongodb is started in the default location.
> Default location must be specified in config.json.

* node mdb init collection {--name COLLECTION NAME}

> Inserts data from data.json in defulat collection or the one specified in 'name' parameter.

node mdb reinit collection {--name COLLECTION NAME}

> The same as init collection but drops the collection first.

* node mdb init db {--name DB NAME}

> Inserts all json files from data directory into default db or db with specified name.
> The collections will have the same names as files.

* node mdb reinit db {--name DB NAME}

> The same as previous but it first drop the db and insert from scratch.
  
    
    
**NOTE:** 

If you register the module with "npm link" command it can be used directly 'mdb [COMMAND]'

