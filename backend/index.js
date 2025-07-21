import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import multer from 'multer';
import AWS from 'aws-sdk';

dotenv.config();
const PORT = process.env.PORT || 5000
const MONGO_URI = process.env.MONGODB_URL || 'mongodb://localhost:27017/aws-blog'

const app = express();

app.use(express.json());
app.use(cors());

mongoose.connect(MONGO_URI)
.then(() => {
    console.log('MongoDB connected successfully');
}).catch((err) => {
    console.error("Error connecting to MongoDB: ", err)
})

const postSchema = new mongoose.Schema({
    title: String,
    content: String,
    imageUrl: String
})

const Post = mongoose.model('Post', postSchema)

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
})

const storage = multer.memoryStorage();
const upload = multer({storage: storage});

app.post("/posts", upload.single("image"), async(req, res) => {
    const { title, content } = req.body
    const s3params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `featured_image/${Date.now().toString()}` + "-" + req.file.originalname,
        Body: req.file.buffer,
        ContentType: req.file.mimetype, 
    }
    console.log('s3params: ', s3params)
    try {
        const s3Result = await s3.upload(s3params).promise()
        console.log('s3 uploaded: ', s3Result)
        const newPost = new Post({
            title,
            content,
            imageUrl: s3Result.Location
        })
        await newPost.save()
        console.log('post saved: ', newPost)
        res.status(200).json(newPost)
    } catch(error) {
        console.error("Error uploading to S3 or saving post: ", error)
        res.status(400).json({error: "Error uploading to S3 or saving post"})
    }
})

app.get("/posts", async(req, res) => {
    try{
        const posts = await Post.find()
        res.status(200).json(posts)
    } catch(err) {
        console.error("Error fetching posts: ", err)
    } 
})

app.delete("/posts/:id", async(req, res) => {
    try{
        const post = await Post.findById(req.params.id)
        if(!post) return res.status(400).json({message: 'Post not found'})

        const imageUrl = post.imageUrl
        const key = imageUrl.split('.com/')[1]
        console.log('urlParts: ', key)

        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key
        }
        await s3.deleteObject(params).promise()

        await Post.findByIdAndDelete(req.params.id)
        res.status(200).json({message: 'Post deleted'})
    } catch(err) {
        console.error('error deleting post: ', err)
    }
})

app.listen(PORT, (err) => {
    if(err) {
        console.error(`Error starting server: ${err}`)
    }
    console.log(`Server is connected at PORT: ${PORT}`)
})
