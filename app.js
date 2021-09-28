//Book Manager v1.0.0


//Code
//app.js file of the Library-Manager.

//Importing all the dependencies.
//bodyParser not used, will remove.
var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var ejs = require("ejs");
var autoIncrement = require("mongodb-autoincrement");
var ObjectId = require('mongodb').ObjectId;    

//Initializing express server.
const app = express();

app.use(bodyParser.json());
app.use(express.static('views'));
app.use(bodyParser.urlencoded({
    extended:true
}));
app.set('view engine','ejs');


//Connecting to the MongoDB database.
//useNew.. UseUnified.. were suggested by the server, don't know what they do.
mongoose.connect('mongodb://localhost:27017/library-db',{
    useNewUrlParser: true,
    useUnifiedTopology: true
});

var db = mongoose.connection;

db.on('error',()=>console.log("Error in Connecting to Database"));
db.once('open',()=>console.log("Connected to Database"));


//Request handling for the first page.
//Not clear about the working of the res.set function. Copied it from someone else's code.

//Setting Username and Password.
var userName = "bilal";
var userPassword = "123";
var userLoginStatus= 0;

//blankResult for passing into get requests.
//This array of object will be used if no results are found, it has blank values and hence can be safely passed to the .ejs file.
//Used this to overcome the "variable not defined" error in the .ejs file.
var blankResult = [{
    _id : " ",
    title : " ",
    author : " ",
    bio : " ",
    genre : " ",
    location : " ",
    rating : " ",
    price : " "
}];


app.get("/",(req,res)=>{
    
    res.set({
        "Allow-access-Allow-Origin": '*'
    });
    //.toArray() is added to the find function to convert the resulting mongoose documents into an Array.
    //Without this the find was returning null or undefined values.
    //There are examples in which even without the .toArray() the function has worked, but this code was not working without it.
    //.sort({field_name: 1/-1}) is added after the find method to sort the results.
    db.collection("books").find({}).sort({title : 1}).toArray( (err, result)=>{
        //Simple error checking.
        if (err){
            throw err;
        }
        
        //If there is no result matching the search criteria the result is replaced with the blankResult.
        if(result.length==0){
            result=blankResult;
        }

        let totalBooks = result.length;
        let totalPrice = result.reduce(function(totalPriceAccum, currentBook){
            return totalPriceAccum + parseInt(currentBook.price);
        },0);

        //Rendering the search.ejs page along with the result passed as the data.
        res.render('list',{
            data : result,
            totalBooks : totalBooks,
            totalPrice : totalPrice
        });
    });
}).listen(3000);
console.log("Listening on PORT 3000");


//All the Routers handling the GET requests for all the pages, GET and POST request both exists for all the pages except the list page.
//GET request of the /list page is listed below because it only had the GET request and no POST request.

app.get("/add",(req,res)=>{
    return res.render('add',{
        message:" "
    });
});

app.get("/delete",(req,res)=>{
    return res.render('delete',{
        success: " ",
        fail : " "
    });
});

app.get("/search",(req,res)=>{
    var blankObject = [];
    res.render('search',{data:blankObject});
});

app.get("/update",(req,res)=>{
    return res.render('update',{
        data:blankResult,
        success : " ",
        fail : " ",
        idFail : " "
    });
});


//Router handle for "/add" requests.
app.post("/add",(req,res)=>{
    
    //Getting all the values from the form field(Now being passed as a parameter in the POST Request).
    var title = req.body.title;
    var author = req.body.author;
    var bio = req.body.bio;
    var genre = req.body.genre;
    var location = req.body.location;
    var rating = req.body.rating;
    var price = req.body.price;

    //Making the first letter of the title capital to maintain ordering in mongoDB.
    title = makeFirstLetterCapital(title);

    
    //autoIncrement used for updating the sequence of ID.
    //Using npm module mongodb-autoincrement.
    autoIncrement.getNextSequence(db, "books", function (err, autoIndex) {
        //Preparing data object to passed into the insert function.
        var data = {
            _id : autoIndex,
            title : title,
            author : author,
            bio : bio,
            genre : genre,
            location : location,
            rating : rating,
            price : price
        }

        //Executing insertOne function
        db.collection('books').insertOne(data,(err,collection)=>{
            //Simple error checking.
            if(err){
                throw err;
            }
            console.log("Record Inserted Successfully");
            return res.render('add',{
                message: "Book Added Succesfully !"
            });
        }); 
    });
});


//Router handle for "/list" requests.
app.get("/list",(req,res)=>{
    
    //.toArray() is added to the find function to convert the resulting mongoose documents into an Array.
    //Without this the find was returning null or undefined values.
    //There are examples in which even without the .toArray() the function has worked, but this code was not working without it.
    //.sort({field_name: 1/-1}) is added after the find method to sort the results.
    db.collection("books").find({}).sort({title : 1}).toArray( (err, result)=>{
        //Simple error checking.
        if (err){
            throw err;
        }
        
        //Setting the value of total books using the result array.
        let totalBooks = result.length;

        //If there is no result matching the search criteria the result is replaced with the blankResult.
        if(result.length==0){
            result=blankResult;
        }

        let totalPrice = result.reduce(function(totalPriceAccum, currentBook){
            return totalPriceAccum + parseInt(currentBook.price);
        },0);

        //Rendering the search.ejs page along with the result passed as the data.
        res.render('list',{
            data : result,
            totalBooks : totalBooks,
            totalPrice : totalPrice
        });
    });
});

//Router handle for "/search" requests.
app.post("/search",(req,res)=>{
    //Getting the Search Field and Search Value from the form field(Now being passed as a parameter in the POST Request).
    var searchField = req.body.searchField;
    var searchValue = req.body.searchValue;

    //Enhancing search by using regex so that partial search could be done and case sensitivity is also ignored.
    var regexPreparedSearchValue = new RegExp(searchValue,'i');

    //[] are used to make searchField act as a variable and not as an absolute string.
    var searchQuery = { [searchField] : regexPreparedSearchValue };

    console.log(searchQuery);

    //.toArray() is added to the find function to convert the resulting mongoose documents into an Array.
    //Without this the find was resturning null or undefined values.
    //There are examples in which even without the .toArray() the function has worked, but this code was not working without it.
    db.collection("books").find(searchQuery).toArray((err, result) => {
        //Simple error checking.
        if (err){
            throw err;
        }

        //If there is no result matching the search criteria the result is replaced with the blankResult.
        if(result.length==0){
            result=blankResult;
        }
        
        //Rendering the search.ejs page along with the result passed as the data.
        res.render('search',{
            data : result
        });
    });
});


//Router handle for "/update-id" requests.
app.post("/update-id",(req,res)=>{
    //Getting the ID Value of the document to update from the form field (Now being passed as a parameter in the POST Request).
    //using parseInt to get the integer value of the id. As string value was causing issue.
    var id = parseInt(req.body.updateID);

    //Preparing search query for update.
    var searchQuery = { _id : id };
    //Running the findOne() method to get the document having the inputed ID.
    db.collection("books").find(searchQuery).toArray((err, result) => {
        //Simple error checking.
        if (err){
            throw err;
        }

        //If there is no result matching the search criteria the result is replaced with the blankResult.
        //idFail is used to display error message in case of ID not found.
        //Fail and Success are used for showing error or success messages.
        else if(result.length==0){
            result=blankResult;
            res.render('update',{
                data : result,
                success : " ",
                fail : " ",
                idFail : "ID not found !"
            });
        }
        
        //Rendering the update.ejs page along with the result passed as the data.
        res.render('update',{
            data : result,
            success : " ",
            fail : " ",
            idFail : " "
        });
    });
});

//Router handle for "/update" requests.
app.post("/update",(req,res)=>{
    //Getting all the values from the form field to create a new object for update(Now being passed as a parameter in the POST Request).
    //using parseInt to get the integer value of the id. As string value was causing issue.
    var id = parseInt(req.body._id);
    var title = req.body.title;
    var author = req.body.author;
    var bio = req.body.bio;
    var genre = req.body.genre;
    var location = req.body.location;
    var rating = req.body.rating;
    var price = req.body.price;
    var password = req.body.password;

    if(password==userPassword){
        //Preparing data object to passed into the insert function.
        var updatedData = {
            $set: {
                title : title,
                author : author,
                bio : bio,
                genre : genre,
                location : location,
                rating : rating,
                price : price
            }
        }

        //Preparing update query.
        var updateQuery = { _id: id };

        //Executing updateOne function
        db.collection('books').updateOne(updateQuery,updatedData,(err,collection)=>{
            //Simple error checking.
            if(err){
                throw err;
            }
            console.log("Record Updated Successfully");
            return res.render('update',{
                data : blankResult,
                success : "Update Succesfull !",
                fail : " ",
                idFail : " "
            });
        }); 
    }
    else{
        return res.render('update',{
            data : blankResult,
            success : " ",
            fail : "Incorrect Password !",
            idFail : " "
        });
    }
});

//Router handle for "/delete" requests.
app.post("/delete",(req,res)=>{
    //Getting the ID from the form field(Now being passed as a parameter in the POST Request).
    //Using parseInt to get the integer value of the id. As string value was causing issue. (+ operator could also be used)
    var id = parseInt(req.body._id);
    var password = req.body.password;

    //Preparing Delete Query.
    var deleteQuery = { _id: id };

    //Checking if the inputed id points to a stored record.
    db.collection("books").find(deleteQuery).toArray((err, result) => {
        //Simple error checking.
        if (err){
            throw err;
        }

        //If there is no result matching the search criteria it means the inputed id does not point to any record.
        //In this case passing the fail message.
        else if(result.length==0){
            return res.render('delete',{
                fail : "ID entered is incorrect !",
                success : " "
            });
        }
    });


    //Executing delete function
    if(password==userPassword){
        db.collection("books").deleteMany(deleteQuery,(err, obj)=> {
            //Simple error checking.
            if (err) {
                throw err;
            }
            //console.log(obj.result.n + " document(s) deleted");
            return res.render('delete',{
                success : "Deletion Succesfull !",
                fail : " "
            });
        });    
    }
    else{
        return res.render('delete',{
            fail : "Incorrect Password !",
            success : " "
        });
    }
});


//Functions Definition
function makeFirstLetterCapital(str){
    return str[0].toUpperCase()+str.slice(1);
}