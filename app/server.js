let express = require('express');
let path = require('path');
let cors = require('cors');
let MongoClient = require('mongodb').MongoClient;
let bodyParser = require('body-parser');
let fs = require('fs');
let app = express();

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(cors());


app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, "index.html"));
  });

app.get('/profile-picture', function (req, res) {
  // let img = fs.readFileSync(path.join(__dirname, "img/Cute_dog.jpeg"));
  // res.writeHead(200, {'Content-Type': 'image/jpg' });
  // res.end(img, 'binary');
  res.sendFile(path.join(__dirname, "img/Cute_dog.jpeg"));
});



// use when starting application locally
let mongoUrlLocal = "mongodb://admin:password@localhost:27017";

// use when starting application as docker container
let mongoUrlDocker = "mongodb://admin:password@mongodb";

let mongoClientOptions = { useNewUrlParser: true, useUnifiedTopology: true };

// "user-account" in demo with docker. "my-db" in demo with docker-compose
let databaseName = "my-db";
let userId = 1;

let con;
const connect = async () => {
  // always use try/catch to handle any exception
  try {
    con = await MongoClient.connect(
      mongoUrlLocal,
      { useNewUrlParser: true, useUnifiedTopology: true },
    );
    return con;
  } catch (err) {
    console.log(err.message);
    return err;
  }
};
/**
 *
 * @returns the database attached to this MongoDB connection
 */
const getDB = async () => {
  // test if there is an active connection
  if (!con) {
    await connect();
  }
  // check that we are connected to the db
  const db = await con.db(databaseName);
  console.log(`connected to db: ${databaseName}`);
  return db;
};

const closeMongoDBConnection = async () => {
  await con.close();
};

app.get('/get_profile', async function (req, res) {
  try{
  	 const db = await getDB();
	 const result = await db.collection('users').find({}).toArray();
	 res.send(result);
    }
   catch (err) {
   	throw err;
   }
});


app.post('/add_profile', async(req, res) => {
	let userObj = req.body;
	try{
		const db = await getDB();
		userObj.userId = userId;
		userId += 1;
		db.collection('users').insertOne(userObj, async(err, result) => {
			if (err) {
        		throw err;
      		}
      		await closeMongoDBConnection();
    	  }
  		);
  		res.redirect('/');
	} catch (err) {
		throw err;
	}
});


app.put('/update_profile', async(req, res) => {
	let query = {userId : req.body.userId};
	try{
		const db = await getDB();
		userObj.userId = userId;
		db.collection('users').updateOne(
		query,       
		{
         $set: {
          	Name:req.body.Name,
          	Email:req.body.Email,
          },
    	}, async(err, result) => {
			if (err) {
        		throw err;
      		}
      		await closeMongoDBConnection();
    	  }
  		);
  		res.redirect('/');
	} catch (err) {
		throw err;
	}
});


app.listen(3000, function () {
  console.log("app listening on port 3000!");
});






