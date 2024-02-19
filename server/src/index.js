const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { createPresignedPost } = require('@aws-sdk/s3-presigned-post');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(fileUpload());
app.use(express.json());

// Routes
app.post('/api/signed-url', async (req, res) => {
  const file = req.files?.file;

  if (!file) {
    return res.status(400).json({ error: 'No file found' });
  }

  const s3 = new S3Client({
    region: 'auto',
    endpoint: process.env.AWS_ENDPOINT,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY,
    },
  });

  try {
    const response = await getSignedUrl(s3, new PutObjectCommand({ Bucket: 'favxp', Key: file.name }), {
      expiresIn: 3600,
    });

    res.json({ message: 'Hello World', response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.post('/api/signed-url-v2', async (req, res) => {
  const file = req.files?.file;

  if (!file) {
    return res.status(400).json({ error: 'No file found' });
  }

  const s3 = new S3Client({
    region: 'auto',
    endpoint: process.env.AWS_ENDPOINT,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY,
    },
  });

  try {
    const response = await createPresignedPost(s3, {
      Bucket: 'favxp',
      Key: file.name,
      Conditions: [
        ['content-length-range', 0, 8000000],
        // ['starts-with', '$Content-Type', 'video/'],
      ],
      Fields: {
        acl: 'public-read',
        // 'Content-Type': file.mimetype,
      },
      Expires: 3600,
    });

    res.json({ message: 'Hello World', response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.post('/api/upload', async (req, res) => {
  const signedURL = req.body?.signedURL;

  if (!signedURL) {
    return res.status(400).json({ error: 'No signedURL found' });
  }

  const file = req.files?.file;

  if (!file) {
    return res.status(400).json({ error: 'No file found' });
  }

  try {
    const response = await fetch(signedURL, {
      method: 'PUT',
      body: file.data,
    });

    res.json({ message: 'File uploaded successfully', response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Start server
app.listen(process.env.PORT, () => console.log(`Server is running on port ${process.env.PORT}`));
