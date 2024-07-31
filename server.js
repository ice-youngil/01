const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = 4000;

app.use(cors());

app.get('/sketchfab-model/:uid', async (req, res) => {
  const modelUid = req.params.uid;
  const apiToken = 'fc1b240b8d654c33975501d1156587f3'; // Sketchfab API 토큰

  try {
    const response = await axios.get(`https://api.sketchfab.com/v3/models/${modelUid}/download`, {
      headers: {
        'Authorization': `Bearer ${apiToken}`
      }
    });
    if (response.data.gltf) {
      console.log('Model download URL:', response.data.gltf.url); // 응답 확인
      res.json({ url: response.data.gltf.url });
    } else {
      res.status(404).json({ message: 'Model download URL not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching model', error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Proxy server running at http://localhost:${port}`);
});
