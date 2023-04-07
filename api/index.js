const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User.js');
const Place = require('./models/Place.js');
const Booking = require('./models/Booking.js');
const cookieParser = require('cookie-parser');
const imageDownloader = require('image-downloader');
const {S3Client, PutObjectCommand} = require('@aws-sdk/client-s3');
const multer = require('multer');
const fs = require('fs');
const mime = require('mime-types');


require('dotenv').config();
const app = express();

const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = 'fasefraw4r5r3wq45wdfgw34twdfg';
const bucket = 'stuniverse';

app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname+'/uploads'));
app.use(cors({
  credentials: true,
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Length', 'Authorization'],
}));

// app.use(cors({
//   credentials: true,
//   origin: 'https://stuniverse-b4qe25efg-l2579904133-gmailcom.vercel.app',
//   // origin: 'http://localhost:5173',
//   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//   headers: 'Content-Type, Authorization'
// }));

// app.use(cors({
//   credentials: true,
//   origin: 'https://stuniverse.vercel.app',
//   // origin: 'http://localhost:5173',
// }));

async function uploadToS3(path, originalFilename, mimetype) {
  const client = new S3Client({
    region: 'us-east-1',
    credentials: {
      accessKeyId: 'AKIA3W3DPPU5HEDXWY76',
      secretAccessKey: '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',
    },
  });
  const parts = originalFilename.split('.');
  const ext = parts[parts.length - 1];
  const newFilename = Date.now() + '.' + ext;
  await client.send(new PutObjectCommand({
    Bucket: bucket,
    Body: fs.readFileSync(path),
    Key: newFilename,
    ContentType: mimetype,
    ACL: 'public-read',
  }));
  return `https://${bucket}.s3.amazonaws.com/${newFilename}`;
}

function getUserDataFromReq(req) {
  return new Promise((resolve, reject) => {
    jwt.verify(req.cookies.token, jwtSecret, {}, async (err, userData) => {
      if (err) throw err;
      resolve(userData);
    });
  });
}

console.log(process.env.MONGO_URL)
mongoose.set('strictQuery', true);
mongoose.connect('mongodb+srv://l2579904133:Ll352513@cluster0.wedn4mq.mongodb.net/?retryWrites=true&w=majority');
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB successfully.');
});

app.get('/api/test', (req,res) => {
  mongoose.connect('mongodb+srv://l2579904133:Ll352513@cluster0.wedn4mq.mongodb.net/?retryWrites=true&w=majority');
  res.json('test ok');
});

app.post('/api/register', async (req,res) => {
  mongoose.connect('mongodb+srv://l2579904133:Ll352513@cluster0.wedn4mq.mongodb.net/?retryWrites=true&w=majority');
  const {name,email,password} = req.body;
  res.json({name,email,password})
  // res.json(userDoc);

  try {
    const userDoc = await User.create({
      name,
      email,
      password:bcrypt.hashSync(password, bcryptSalt),
    });
    res.json(userDoc);
  } catch (e) {
    res.status(422).json(e);
  }

});

app.post('/api/login', async (req,res) => {
  mongoose.connect('mongodb+srv://l2579904133:Ll352513@cluster0.wedn4mq.mongodb.net/?retryWrites=true&w=majority');
  const {email,password} = req.body;
  const userDoc = await User.findOne({email});
  if (userDoc) {
    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (passOk) {
      jwt.sign({
        email:userDoc.email,
        id:userDoc._id
      }, jwtSecret, {}, (err,token) => {
        if (err) throw err;
        res.cookie('token', token).json(userDoc);
      });
    } else {
      res.status(422).json('pass not ok');
    }
  } else {
    res.json('not found');
  }
});

app.get('/api/profile', (req,res) => {
  mongoose.connect('mongodb+srv://l2579904133:Ll352513@cluster0.wedn4mq.mongodb.net/?retryWrites=true&w=majority');
  const {token} = req.cookies;
  if (token) {
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
      if (err) throw err;
      const {name,email,_id} = await User.findById(userData.id);
      res.json({name,email,_id});
    });
  } else {
    res.json(null);
  }
});

app.post('/api/logout', (req,res) => {
  res.cookie('token', '').json(true);
});


app.post('/api/upload-by-link', async (req,res) => {
  const {link} = req.body;
  console.log(link)
  if (!link) {
    return res.status(400).json({ error: 'The link parameter is required' });
  }
  const newName = 'photo' + Date.now() + '.jpg';
  await imageDownloader.image({
    url: link,
    dest: '/tmp/' +newName,
  });
  const url = await uploadToS3('/tmp/' +newName, newName, mime.lookup('/tmp/' +newName));
  res.json(url);
});

const photosMiddleware = multer({dest:'/tmp'});
app.post('/api/upload', photosMiddleware.array('photos', 100), async (req,res) => {
  const uploadedFiles = [];
  console.log(req.files);
  for (let i = 0; i < req.files.length; i++) {
    const {path,originalname,mimetype} = req.files[i];
    const url = await uploadToS3(path, originalname, mimetype);
    uploadedFiles.push(url);
  }
  res.json(uploadedFiles);
});

app.post('/api/places', (req,res) => {
  mongoose.connect('mongodb+srv://l2579904133:Ll352513@cluster0.wedn4mq.mongodb.net/?retryWrites=true&w=majority');
  const {token} = req.cookies;
  const {
    title,address,addedPhotos,description,price,
    perks,extraInfo,checkIn,checkOut,maxGuests,
  } = req.body;
  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    if (err) throw err;
    const placeDoc = await Place.create({
      owner:userData.id,price,
      title,address,photos:addedPhotos,description,
      perks,extraInfo,checkIn,checkOut,maxGuests,
    });
    res.json(placeDoc);
  });
});

app.get('/api/user-places', (req,res) => {
  mongoose.connect('mongodb+srv://l2579904133:Ll352513@cluster0.wedn4mq.mongodb.net/?retryWrites=true&w=majority');
  const {token} = req.cookies;
  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    const {id} = userData;
    res.json( await Place.find({owner:id}) );
  });
});

app.get('/api/places/:id', async (req,res) => {
  mongoose.connect('mongodb+srv://l2579904133:Ll352513@cluster0.wedn4mq.mongodb.net/?retryWrites=true&w=majority');
  const {id} = req.params;
  res.json(await Place.findById(id));
});

app.put('/api/places', async (req,res) => {
  mongoose.connect('mongodb+srv://l2579904133:Ll352513@cluster0.wedn4mq.mongodb.net/?retryWrites=true&w=majority');
  const {token} = req.cookies;
  const {
    id, title,address,addedPhotos,description,
    perks,extraInfo,checkIn,checkOut,maxGuests,price,
  } = req.body;
  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    if (err) throw err;
    const placeDoc = await Place.findById(id);
    if (userData.id === placeDoc.owner.toString()) {
      placeDoc.set({
        title,address,photos:addedPhotos,description,
        perks,extraInfo,checkIn,checkOut,maxGuests,price,
      });
      await placeDoc.save();
      res.json('ok');
    }
  });
});

app.get('/api/places', async (req,res) => {
  mongoose.connect('mongodb+srv://l2579904133:Ll352513@cluster0.wedn4mq.mongodb.net/?retryWrites=true&w=majority');
  res.json( await Place.find() );
});

app.post('/api/bookings', async (req, res) => {
  mongoose.connect('mongodb+srv://l2579904133:Ll352513@cluster0.wedn4mq.mongodb.net/?retryWrites=true&w=majority');
  const userData = await getUserDataFromReq(req);
  const {
    place,checkIn,checkOut,numberOfGuests,name,phone,price,
  } = req.body;
  Booking.create({
    place,checkIn,checkOut,numberOfGuests,name,phone,price,
    user:userData.id,
  }).then((doc) => {
    res.json(doc);
  }).catch((err) => {
    throw err;
  });
});



app.get('/api/bookings', async (req,res) => {
  mongoose.connect('mongodb+srv://l2579904133:Ll352513@cluster0.wedn4mq.mongodb.net/?retryWrites=true&w=majority');
  const userData = await getUserDataFromReq(req);
  res.json( await Booking.find({user:userData.id}).populate('place') );
});

app.listen(4000);