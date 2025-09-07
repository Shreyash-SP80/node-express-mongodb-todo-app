import express from 'express'

// To add colors for command line text
import colors from 'colors'

// To resolve an public path
import path from 'path'

// To connect with mongodb
import { MongoClient, ObjectId } from 'mongodb'
// import { connect } from 'http2'

const app = express()

// resolve and public path to serve an static folders using express js middle ware 
const publicPath = path.resolve('public')
app.use(express.static(publicPath))

// We are using ejs so 1st we have to specify it
app.set("view engine", "ejs")

// To connect the local mongodb we required following things
const dbName = "node-project"
const collectionName = "todo"
const url = "mongodb://localhost:27017/"
const client = new MongoClient(url)


// connection() the can cannect with mongodb and returns the object
const connection = async () => {
    const conect = await client.connect();
    return await conect.db(dbName)
}

// middleware that can encode the url usefull when we passes the data using post method
app.use(express.urlencoded({extended:false}))


// Routs
app.get("/", async ( req, res ) => {
    const db = await connection()
    const collection = db.collection(collectionName)
    const result = await collection.find().toArray();
    // console.log(result)
    // Rendering the list of tasks
    res.render("list", { result })
})

// To add data
app.get("/add", ( req, res ) => {
    res.render("add")
})

// To update the data
// app.get("/update", ( req, res ) => {
//     res.render("update")
// })

// app.post("/update", ( req, res ) => {
//     res.redirect("/")
// })


// store the data in the mongodb
app.post("/add",async ( req, res ) => {
    const db = await connection()
    const collection = db.collection(collectionName)
    const result = collection.insertOne(req.body)
    if (result) {
        res.redirect("/")
    } else {
        res.redirect("/add")
    }
})

// Delete the data from database
app.get("/delete/:id",async ( req, res ) => {
    const db = await connection()
    const collection = db.collection(collectionName)
    const result = collection.deleteOne({_id: new ObjectId(req.params.id)})
    if (result) {
        res.redirect("/")
    } else {
        res.sned("Some error")
    }
})


// 1st the data form data base and send to update page form 
app.get("/update/:id",async ( req, res ) => {
    const db = await connection()
    const collection = db.collection(collectionName)
    const result = await collection.findOne({_id: new ObjectId(req.params.id)})
    // console.log(result)
    if (result) {
        res.render("update", { result })
    } else {
        res.sned("Some error")
    }
})

// Update the data into database
app.post("/update/:id",async ( req, res ) => {
    const db = await connection()
    const collection = db.collection(collectionName)
    const filter = {_id: new ObjectId(req.params.id)}
    const updatedData = {$set:{title: req.body.title, description: req.body.description}}
    const result = await collection.updateOne(filter, updatedData)
    // console.log(result)
    if (result) {
        res.redirect("/")
    } else {
        res.sned("Some error")
    }
})


// Used to delete multiple taska
app.post("/multi-delete",async ( req, res ) => {
    const db = await connection()
    const collection = db.collection(collectionName)
    // console.log(req.body.selectedTask);
    let selectedTask = undefined

    // If comming data is array the apply map function to convert the id into mongodb object id's
    if (Array.isArray(req.body.selectedTask)) {
        selectedTask = req.body.selectedTask.map((id) => new ObjectId(id))
    } else {
        selectedTask = [new ObjectId(req.body.selectedTask)]
    }

    // delete form database
    const result = await collection.deleteMany({_id: {$in:selectedTask}})
 
    if (result) {
        res.redirect("/")
    } else {
        res.sned("Some error")
    }
})


// Server listing on this port
app.listen(4800, () =>  {
    console.log("Server is running on: http://localhost:4800".green)
})