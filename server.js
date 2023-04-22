const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

const path = require('path');
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(bodyParser.json());

app.set('port', (process.env.PORT || 8080));

require('dotenv').config();
const url = process.env.MONGODB_URI;
const MongoClient = require("mongodb").MongoClient;
const client = new MongoClient(url);
client.connect(console.log("mongodb connected"));
var ObjectId = require('mongodb').ObjectId; 

const sgMail = require('@sendgrid/mail');
const { title } = require('process');
const { start } = require('repl');
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

app.use((req, res, next) =>
{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers','Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods','GET, POST, PATCH, DELETE, OPTIONS');
    next();
});

// need to configure database stuff (apis and file as whole)
app.post('/api/login', async (req, res) =>
{
  // incoming: email, password
  // outgoing: _id, firstName, lastName, error
  var error = '';
  const { email, password } = req.body;
  const db = client.db('COP4331');
  const results = await db.collection('users').find({email:email, password:password}).toArray();
  var id = -1;
  var fn = '';
  var ln = '';
  var ret;
  if( results.length > 0 )
    {
    id = results[0]._id;
    fn = results[0].firstName;
    ln = results[0].lastName;

    try
      {
        const token = require("./createJWT.js");
        tk = token.createToken( fn, ln, id);
        ret = {id:id, jwsToken:tk}
      }
      catch(e)
      {
        ret = {error:e.message};
      }
    }
  else
    {
      ret = {error:'Invalid email or password'};
    }
  res.status(200).json(ret);
});

app.post('/api/emailVer', async(req,res)=>{
  // incoming: email address
  // outgoing: 
  var error = '';
  const email = req.body
  const randomCode = Math.floor(100000 + Math.random() * 900000)
  console.log(randomCode)
  const msg = {
    to: email, // Change to your recipient
    from: 'sunnysideupplanner@gmail.com', // Change to your verified sender
    subject: 'SSU Email Verification',
    text: 'EmailVar',
    html: 'Thank you for registering, please input this code:' + String(randomCode),
  }
  sgMail
    .send(msg)
    .then(() => {
      console.log('Email sent')
      var ret = {error: error, code: randomCode};
      res.status(200).json(ret);
    })
    .catch((error) => {
      console.error(error)
      error = "400"
      var ret = {error: error, code: randomCode};
      res.status(200).json(ret);
    })
})

app.post('/api/register', async(req,res)=>{
  
    // incoming: firstName, lastName, email, password
    // outgoing: error (if applicable)
  
    var error = '';
    const {firstName, lastName, email, password} = req.body;
    eventsA = []
    contactsA = []
    todoA = []
    notesA = []
    // check if any fields are empty
    if (!firstName || !lastName || !email || !password) {
        error = 'All fields are required';
        var ret = {error: error};
        res.status(400).json(ret);
        return;
    }
    //check if the email is unique 
    //const newUser = {firstName:firstName, lastName:lastName, email:email, password:password};
    const db = client.db("COP4331");
    const userCheck = await db.collection("users").findOne({email:email});
    if (userCheck != null){
      error = 'Email taken';
      var ret = {error: error};
      res.status(400).json(ret);
      return;
    }
    const newUser = {firstName:firstName, lastName:lastName, email:email, password:password, events:eventsA, contacts:contactsA, todo:todoA, notes:notesA};
    try
    {
      db.collection("users").insertOne(newUser);
    }
    catch(e)
    {
      error = e.toString();
    }
  
    var ret = {error: error};
    res.status(200).json(ret);
  })

app.post('/api/addNote', async(req,res)=>{

  // incoming: id(of user), title, content, jwtToken
  // outgoing: error (if applicable)

  var error = '';
  const {_id, title, content, jwtToken} = req.body;

  // Ensure the jwt is not expired
  var token = require('./createJWT.js');
  try
  {
    if( token.isExpired(jwtToken))
    {
      var r = {error:'The JWT is no longer valid', jwtToken: ''};
      res.status(200).json(r);
      return;
    }
  }
  catch(e)
  {
    console.log(e.message);
  }

  // check if any fields are empty
  if (!title){
      error = 'Please add a title';
      var ret = {error: error};
      res.status(400).json(ret);
      return;
  }

  // Connect to db and get id
  const db = client.db("COP4331");
  var o_id = new ObjectId(_id);

  // push the new note object into the notes array
  const results = await db.collection('users').findOneAndUpdate({ _id: o_id }, {$push:{notes:{title:title, content:content}}});

  // If results == null, no user found for that id, so no changes made.
  if(results == null){
    error = 'Invalid userId';
    var ret = {error: error};
    res.status(400).json(ret);
    return;
  }

  // refresh the jwt
  var refreshedToken = null;
  try
  {
    refreshedToken = token.refresh(jwtToken);
  }
  catch(e)
  {
    console.log(e.message);
  }

  // return error and refreshedToken
  var ret = { error: error, jwtToken: refreshedToken };
  res.status(200).json(ret);
})

app.post('/api/delNote', async(req,res)=>{

  // incoming: id(of user), title, jwtToken
  // outgoing: error (if applicable)

  var error = '';
  const {_id, title, jwtToken} = req.body;

  // Ensure the jwt is not expired
  var token = require('./createJWT.js');
  try
  {
    if( token.isExpired(jwtToken))
    {
      var r = {error:'The JWT is no longer valid', jwtToken: ''};
      res.status(200).json(r);
      return;
    }
  }
  catch(e)
  {
    console.log(e.message);
  }

  // check if any fields are empty
  if (!title){
      error = 'Please add a title';
      var ret = {error: error};
      res.status(400).json(ret);
      return;
  }

  const db = client.db("COP4331");
  var o_id = new ObjectId(_id);
  const results = await db.collection('users').findOneAndUpdate({ _id: o_id }, {$pull:{notes:{title:title}}});
  if(results == null){
    error = 'No Note Found';
    var ret = {error: error};
    res.status(400).json(ret);
    return;
  }

  var refreshedToken = null;
  try
  {
    refreshedToken = token.refresh(jwtToken);
  }
  catch(e)
  {
    console.log(e.message);
  }

  var ret = {error: error, jwtToken: refreshedToken};
  res.status(200).json(ret);
})

app.post('/api/searchNote', async(req,res)=>{

  // incoming: id(of user), title, content, jwtToken
  // outgoing: error (if applicable), array of notes that match criteria

  var error = '';
  const {_id, title, jwtToken} = req.body;

  // Ensure the jwt is not expired
  var token = require('./createJWT.js');
  try
  {
    if( token.isExpired(jwtToken))
    {
      var r = {error:'The JWT is no longer valid', jwtToken: ''};
      res.status(200).json(r);
      return;
    }
  }
  catch(e)
  {
    console.log(e.message);
  }

  // connect to database and get id
  const db = client.db("COP4331");
  var o_id = new ObjectId(_id);

  // search for all notes that match citeria 
  const result = await db.collection('users').findOne({ _id: o_id});
  const allNotesResults = result.notes;
  console.log(allNotesResults)
  const searchedNotesResults = allNotesResults.filter(allNotesResults => allNotesResults.title.includes(title));

  // refresh token
  var refreshedToken = null;
  try
  {
    refreshedToken = token.refresh(jwtToken);
  }
  catch(e)
  {
    console.log(e.message);
  }

  var ret = {error: error, results:searchedNotesResults, jwtToken: refreshedToken};
  res.status(200).json(ret);
})

app.post('/api/editNote', async(req,res)=>{

  // incoming: id(of user), prevTitle, newTitle, newContent, jwtToken
  // outgoing: error (if applicable)

  var error = '';
  const {_id, prevTitle, newTitle, newContent, jwtToken} = req.body;

  // Ensure the jwt is not expired
  var token = require('./createJWT.js');
  try
  {
    if( token.isExpired(jwtToken))
    {
      var r = {error:'The JWT is no longer valid', jwtToken: ''};
      res.status(200).json(r);
      return;
    }
  }
  catch(e)
  {
    console.log(e.message);
  }

  // check if any fields are empty
  if (!newTitle){
    error = 'Please add a title';
    var ret = {error: error};
    res.status(400).json(ret);
    return;
  }
  // edit note
  const db = client.db("COP4331");
  var o_id = new ObjectId(_id);
  const results = await db.collection('users').findOneAndUpdate({ _id: o_id, "notes.title":prevTitle}, {$set:{"notes.$.title":newTitle, "notes.$.content":newContent}});
  if(results == null){
    error = 'No Note Found';
    var ret = {error: error};
    res.status(400).json(ret);
    return;
  }

  // refresh token
  var refreshedToken = null;
  try
  {
    refreshedToken = token.refresh(jwtToken);
  }
  catch(e)
  {
    console.log(e.message);
  }

  var ret = {error: error, jwtToken: refreshedToken};
  res.status(200).json(ret);
})

app.post('/api/addEvent', async(req,res)=>{

  // incoming: id(of user), title, startTime, endTime, jwtToken
  // outgoing: error (if applicable)

  var error = '';
  const {_id, title, startTime, endTime, jwtToken} = req.body;

  // Ensure the jwt is not expired
  var token = require('./createJWT.js');
  try
  {
    if( token.isExpired(jwtToken))
    {
      var r = {error:'The JWT is no longer valid', jwtToken: ''};
      res.status(200).json(r);
      return;
    }
  }
  catch(e)
  {
    console.log(e.message);
  }

  // check if any fields are empty
  if (!title){
      error = 'Please add a title';
      var ret = {error: error};
      res.status(400).json(ret);
      return;
  }
  if (!startTime){
    error = 'Please add a starting time';
    var ret = {error: error};
    res.status(400).json(ret);
    return;
  }
  if (!endTime){
    error = 'Please add a ending time';
    var ret = {error: error};
    res.status(400).json(ret);
    return;
  }

  const dateStartTime = new Date(startTime)
  const dateEndTime = new Date(endTime)

  // Connect to database and get User ID
  const db = client.db("COP4331");
  var o_id = new ObjectId(_id);

  // Find user and push new event
  const results = await db.collection('users').findOneAndUpdate({ _id: o_id }, {$push :{events:{title:title, startTime:dateStartTime, endTime:dateEndTime, isHoliday:0}}});
  if(results == null){
    error = 'Not Not added, no user id found';
    var ret = {error: error};
    res.status(400).json(ret);
    return;
  }

  // refresh token
  var refreshedToken = null;
  try
  {
    refreshedToken = token.refresh(jwtToken);
  }
  catch(e)
  {
    console.log(e.message);
  }

  var ret = {error: error, jwtToken: refreshedToken};
  res.status(200).json(ret);
})

app.post('/api/searchMonthlyEvent', async(req,res)=>{

  // incoming: id(of user), searchTitle firstOfMonth, lastOfMonth, jwtToken
  // outgoing: error (if applicable), array of events that match the criteria

  var error = '';
  const {_id, searchTitle, firstOfMonth, lastOfMonth, jwtToken} = req.body;

  // Ensure the jwt is not expired
  var token = require('./createJWT.js');
  try
  {
    if( token.isExpired(jwtToken))
    {
      var r = {error:'The JWT is no longer valid', jwtToken: ''};
      res.status(200).json(r);
      return;
    }
  }
  catch(e)
  {
    console.log(e.message);
  }

  // Connect to database and get userId
  const db = client.db("COP4331");
  var o_id = new ObjectId(_id);

  const dateFirstOfMonth = new Date(firstOfMonth)
  const dateLastOfMonth = new Date(lastOfMonth)

  // Find the array of all events
  const result = await db.collection('users').findOne({ _id: o_id});
  const allEventsResults = result.events;

  // Filter the array of all results, as long as the title includes searchTitle, and falls inbetween the firstOfMonth and lastOfMonth 
  const searchedEventsResults = allEventsResults.filter(allEventsResults => ( allEventsResults.title.includes(searchTitle) && dateFirstOfMonth  <= allEventsResults.startTime && allEventsResults.endTime <= dateLastOfMonth));
  
  // refresh token
  var refreshedToken = null;
  try
  {
    refreshedToken = token.refresh(jwtToken);
  }
  catch(e)
  {
    console.log(e.message);
  }
  
  // Return filtered events
  var ret = {error: error, results:searchedEventsResults, jwtToken: refreshedToken};
  res.status(200).json(ret);
})

app.post('/api/searchDailyEvent', async(req,res)=>{

  // incoming: id(of user), searchTitle firstOfMonth, lastOfMonth, jwtToken
  // outgoing: error (if applicable), array of events that match the criteria

  var error = '';
  const {_id, searchTitle, beginningOfDay, endOfDay, jwtToken} = req.body;

  // Ensure the jwt is not expired
  var token = require('./createJWT.js');
  try
  {
    if( token.isExpired(jwtToken))
    {
      var r = {error:'The JWT is no longer valid', jwtToken: ''};
      res.status(200).json(r);
      return;
    }
  }
  catch(e)
  {
    console.log(e.message);
  }

  // Connect to database and get userId
  const db = client.db("COP4331");
  var o_id = new ObjectId(_id);

  const dateBeginningOfDay = new Date(beginningOfDay)
  const dateEndOfDay = new Date(endOfDay)

  // Find the array of all events
  const result = await db.collection('users').findOne({ _id: o_id});
  const allEventsResults = result.events;

  // Filter the array of all results, as long as the title includes searchTitle, and falls inbetween the firstOfMonth and lastOfMonth 
  const searchedEventsResults = allEventsResults.filter(allEventsResults => ( allEventsResults.title.includes(searchTitle) && dateBeginningOfDay <= allEventsResults.startTime && allEventsResults.endTime <= endOfDay));
  
  // refresh token
  var refreshedToken = null;
  try
  {
    refreshedToken = token.refresh(jwtToken);
  }
  catch(e)
  {
    console.log(e.message);
  }
  
  // Return filtered events
  var ret = {error: error, results:searchedEventsResults, jwtToken: refreshedToken};
  res.status(200).json(ret);
})

app.post('/api/editEvent', async(req, res)=>{
  // incoming: id (of user), prevTitle, newTitle, prevStartDate, newStartDate, newEndDate, jwtToken
  // outgoing: error ()

  // Get user input 
  var error = '';
  const {_id, prevTitle, newTitle, prevStartTime, newStartTime, newEndTime, jwtToken} = req.body;

  // Ensure the jwt is not expired
  var token = require('./createJWT.js');
  try
  {
    if( token.isExpired(jwtToken))
    {
      var r = {error:'The JWT is no longer valid', jwtToken: ''};
      res.status(200).json(r);
      return;
    }
  }
  catch(e)
  {
    console.log(e.message);
  }

  // Connect to database and get user Id
  const db = client.db("COP4331");
  var o_id = new ObjectId(_id);

  const datePrevStartTime = new Date(prevStartTime)
  const dateNewStartTime = new Date(newStartTime)
  const dateNewEndTime = new Date(newEndTime)

  
  // Pull event where title = prevTitle and startTIme == prevStartTime
  await db.collection('users').findOneAndUpdate({_id: o_id, "events.title":prevTitle, "events.startTime":datePrevStartTime}, {$set:{"events.$.title":newTitle, "events.$.startTime":dateNewStartTime, "events.$.endTime":dateNewEndTime}});

  // refresh token
  var refreshedToken = null;
  try
  {
    refreshedToken = token.refresh(jwtToken);
  }
  catch(e)
  {
    console.log(e.message);
  }

  // return error if applicable
  var ret = {error:error, jwtToken: refreshedToken};
  res.status(200).json(ret);
})

app.post('/api/delEvent', async(req,res)=>{

  // incoming: id(of user), title, jwtToken
  // outgoing: error (if applicable)

  var error = '';
  const {_id, title, startTime, jwtToken} = req.body;

  // Ensure the jwt is not expired
  var token = require('./createJWT.js');
  try
  {
    if( token.isExpired(jwtToken))
    {
      var r = {error:'The JWT is no longer valid', jwtToken: ''};
      res.status(200).json(r);
      return;
    }
  }
  catch(e)
  {
    console.log(e.message);
  }

  // check if any fields are empty
  if (!title)
  {
      error = 'Please add a title';
      var ret = {error: error};
      res.status(400).json(ret);
      return
  }

  // connect to database and get userid
  const db = client.db("COP4331");
  var o_id = new ObjectId(_id);

  // pull events that match criteria
  const results = await db.collection('users').findOneAndUpdate({ _id: o_id }, {$pull:{events:{title:title, startTime:startTime}}});
  if(results == null){
    error = 'No event found';
    var ret = {error: error};
    res.status(400).json(ret);
    return;
  }

  // refresh token
  var refreshedToken = null;
  try
  {
    refreshedToken = token.refresh(jwtToken);
  }
  catch(e)
  {
    console.log(e.message);
  }

  // return 
  var ret = {error: error, jwtToken: refreshedToken};
  res.status(200).json(ret);
})



//Get Current time
app.post('/api/current-time', async (req, res, next) =>{
  //var error = '';
  const { } = req.body;
  var date_ob = new Date();
  var day = ("0" + date_ob.getDate()).slice(-2);
  var month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
  var year = date_ob.getFullYear();
   
  var ret = {year: year, month: month, day: day};
  res.status(200).json(ret);
});

//Password Reset (1st part: forgot password)
app.post('/api/forgot-password', async (req, res) =>
{
  //incoming: email
  //outcoming: error, 6-digit-code, id
  var error = '';
  const {email} = req.body;
  const db = client.db('COP4331');
  const results = await db.collection('users').findOne({email:email});
  if(results == null){
    error = "User Not Exist";
    var ret = {error: error};
    res.status(500).json(ret);
    return;
  }
  const result = await db.collection('users').find({email:email}).toArray();
  const _id = result[0]._id;
  const randomCode = Math.floor(100000 + Math.random() * 900000)
  console.log(randomCode)
  console.log(_id)
  const msg = {
    to: email, // Change to your recipient
    from: 'sunnysideupplanner@gmail.com', // Change to your verified sender
    subject: 'SSU Password Reset',
    text: 'EmailVar',
    html: 'To reset your password, please input this code: ' + String(randomCode),
  }
  sgMail
    .send(msg)
    .then(() => {
      console.log('Email sent')
      var ret = {error: error, code: randomCode, id: _id};
      res.status(200).json(ret);
    })
    .catch((error) => {
      console.error(error)
      error = "400"
      var ret = {error: error, code: randomCode, id: _id};
      res.status(200).json(ret);
    })
});

//Password Reset (2nd part: change password)
app.post('/api/reset-password', async (req, res) =>
{
  //incoming: email
  //outcoming: error
  var error = '';
  const {email, password_new} = req.body;
  const db = client.db("COP4331");
  // var o_id = new ObjectId(_id);
  const results = await db.collection('users').findOne({ email: email });
  if(results == null){
    error = 'Invalid userId';
    var ret = {error: error};
    res.status(500).json(ret);
    return;
  }
  try
  {
    //const result1 = await db.collection('users').find({ email: email }).toArray();//testing
    //console.log("BEFORE: "+result1[0].password);//testing
    await db.collection("users").findOneAndUpdate({email: email}, {"$set":{password: password_new}});
    //db.collection("users").findOneAndUpdate({email: email}, {"$set":{password: password_new}});
  }
  catch(e)
  {
    error = e.toString();
    var ret = {error: error};
    res.status(500).json(ret);
  }
  //const result2 = await db.collection('users').find({ email: email }).toArray();//testing
  //console.log("AFTER: "+result2[0].password);//testing
  var ret = {error: error};
  res.status(200).json(ret);
  
});



// ======= HEROKU DEPLOYMENT (DO NOT MODIFY) ========
// Server static assets if in production
if (process.env.NODE_ENV === 'production')
{
    // Set static folder
    app.use(express.static('frontend/build'));
    app.get('*', (req, res) =>
    {
        res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'));
    });
}

app.listen(PORT, () =>
{
    console.log('Server listening on port ' + PORT);
});
