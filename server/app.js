// back-end code that communicates with my database service and sets up my express server (middle-ware)
const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const dbService = require('./dbService');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended : false }));

// insert user info
app.post('/insertUserInfo', (request, response) => {
    const { username, email, password } = request.body;
    //console.log(`Received new user: ${username}, ${email}, ${password}`); // DEBUG
    const db = dbService.getDbServiceInstance();
    
    db.insertNewUser(username, email, password)
    //   .then(data => response.json({ data: data })) // REMOVED THESE LINES BECAUSE IT CAUSES SOME TRASHY SERVER REDIRECT so without its infinite loading but idk if thats an issue for other stuff
    //   .catch(err => console.log(err));
});

// login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const db = dbService.getDbServiceInstance(); // ADDED TO TEST
    try {
        await db.checkLoginCredentials(username, password);
        //res.json({ success: true, message: 'Login successful.' }); // MIGHT NEED TO STOP REDIRECT HERE TOO
    } catch (error) {
        console.error(error);
        //res.json({ success: false, message: 'Invalid username or password.' }); // MIGHT NEED TO STOP REDIRECT HERE TOO
    }
});
  
// create
app.post('/insert', (request, response) => {
    const { name, sets, reps } = request.body;
    const db = dbService.getDbServiceInstance();

    const setsValue = sets ? parseInt(sets) : 0; // checks if sets exist in the request body
    const repsValue = reps ? parseInt(reps) : 0; // checks if sets exist in the request body
    
    const result = db.insertNewName(name, setsValue, repsValue);

    result
        .then(data => response.json({ data: data }))
        .catch(err => console.log(err));
});

// read
app.get('/getAll', (request, response) => {
    const db = dbService.getDbServiceInstance();

    const result = db.getAllData();

    result
        .then(data => response.json({ data: data }))
        .catch(err => console.log(err));
})

// update
app.patch('/update', (request, response) => {
    const { id, name, sets, reps } = request.body;
    const db = dbService.getDbServiceInstance();

    let setsValue;
    if (sets !== "") {
        setsValue = /^\d+$/.test(sets) ? parseInt(sets) : 0;
    }

    let repsValue;
    if (reps !== "") {
        repsValue = /^\d+$/.test(reps) ? parseInt(reps) : 0;
    }

    const result = db.updateNameById(id, name, setsValue, repsValue);

    result
    .then(data => response.json({success : data}))
    .catch(err => console.log(err));
});

// delete
app.delete('/delete/:id', (request, response) => {
    const { id } = request.params;
    const db = dbService.getDbServiceInstance();

    const result = db.deleteRowById(id);
    
    result
    .then(data => response.json({success : data}))
    .catch(err => console.log(err));
});

app.get('/search/:name', (request, response) => {
    const { name } = request.params;
    const db = dbService.getDbServiceInstance();

    const result = db.searchByName(name);
    
    result
    .then(data => response.json({data : data}))
    .catch(err => console.log(err));
})

app.listen(process.env.PORT, () => console.log('app is running'));