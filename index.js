const express = require("express");
const app = express();
const cors = require("cors");

require("dotenv").config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

//database api
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9ylecqg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    //database collection
    const usersCollection = client.db("media-facilities").collection("users");
    const postsCollection = client.db("media-facilities").collection("posts");
    const favouritesCollection = client
      .db("media-facilities")
      .collection("favourites");
    const commentsCollection = client
      .db("media-facilities")
      .collection("comments");

    //   get a user
    app.get("/users", async (req, res) => {
      const user = req.query.email;
      const query = { email: user };
      const result = await usersCollection.findOne(query);
      // console.log(result);
      res.send(result);
    });

    //post a user
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const exist = await usersCollection.findOne(query);

      if (exist) {
        return res.send({ message: "user already exists" });
      }

      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    // update a user
    app.put("/users/:id", async (req, res) => {
      const id = req.params.id;
      const userDetails = req.body;

      // console.log(id);

      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedUserDetails = {
        $set: {
          ...userDetails,
        },
      };

      const result = await usersCollection.updateOne(
        filter,
        updatedUserDetails,
        options
      );
      res.send(result);
    });

    // post a comment
    app.post("/comments", async (req, res) => {
      const newComment = req.body;
      const result = await commentsCollection.insertOne(newComment);
      res.send(result);
    });

    // get a comment
    app.get("/comments/:id", async (req, res) => {
      const id = req.params.id;
      //todo here check wheather object id needed or not for postid
      const query = { postId: new ObjectId(id) };
      const result = await commentsCollection.findOne(query);
      res.send(result);
    });

    //get all post
    app.get("/posts", async (req, res) => {
      const result = await postsCollection.find().toArray();
      // const result = await postsCollection.find().sort({ likes: -1 }).toArray();
      //? by the both  way we can do sort
      // Sort the posts in descending order based on likes
      // result.sort((a, b) => b.likes - a.likes);
      res.send(result);
    });

    // post a post
    app.post("/posts", async (req, res) => {
      const newPosts = req.body;
      const result = await postsCollection.insertOne(newPosts);
      res.send(result);
    });

    // update a post
    app.put("/posts/:id", async (req, res) => {
      const id = req.params.id;
      const postDetails = req.body;

      console.log(id);

      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedPostDetails = {
        $set: {
          ...postDetails,
        },
      };

      const result = await postsCollection.updateOne(
        filter,
        updatedPostDetails,
        options
      );
      res.send(result);
    });

    // post a favourite
    app.post("/favourites", async (req, res) => {
      const selectedPost = req.body;
      // console.log(selectedPost);
      const result = await favouritesCollection.insertOne(selectedPost);
      res.send(result);
    });

    // get  all favourite post of a user
    app.get("/favourites", async (req, res) => {
      const userEmail = req.query.email;
      //   console.log(userEmail);

      const query = { userEmail: userEmail };

      const result = await favouritesCollection.find(query).toArray();
      res.send(result);
    });

    // delete a favourite
    app.delete("/favourites/:id", async (req, res) => {
      const postId = req.params.id;
      //todo here check wheather object id needed or not for postid
      const query = { postId: postId };
      const result = await favouritesCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

//test
app.get("/", (req, res) => {
  res.send("Running");
});

app.listen(port, () => {
  console.log(`Running on port ${port}`);
});
