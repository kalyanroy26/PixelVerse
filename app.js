import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

const API_URL = "https://api.pexels.com/v1";
const Authorization = "s94v6VdmYYKYPqZ9ZYaT3bvgIZgCDTiUTEADeQbxj2A8eOwMIoJV7sp6";

const config = {
    headers: { Authorization: Authorization },
};

let current_page = 1;
let currentQuery = '';

// Reset currentQuery but preserve current_page on homepage
app.get('/', async (req, res) => {
    try {
        currentQuery = '';

        const apiUrl = currentQuery ? `${API_URL}/search` : `${API_URL}/curated`;
        const response = await axios.get(apiUrl, {
            headers: config.headers,
            params: {
                query: currentQuery,
                page: current_page,
                per_page: 9,
            },
        });
        
        console.log(response.data);
        res.render('home', { data: response.data, query: currentQuery });
    } catch (error) {
        console.log('error fetching data', error);
        res.status(500).send('Error fetching data');
    }
});



app.post('/search', async (req, res) => {
    try {
        current_page = 1;
        currentQuery = req.body.query;
        res.redirect('/search-results');
    } catch (error) {
        console.log('error fetching data', error);
        res.status(500).send('Error fetching data');
    }
});

app.get('/search-results', async (req, res) => {
    try {
        const response = await axios.get(`${API_URL}/search`, {
            headers: config.headers,
            params: {
                query: currentQuery,
                page: current_page,
                per_page: 9,
            },
        });
        console.log(response.data);
        res.render('home', { data: response.data, query: currentQuery });

    } catch (error) {
        console.log('error fetching data', error);
        res.status(500).send('Error fetching data');
    }
});

app.get('/more-data', async (req,res)=>{
    try {
        current_page++;

        const apiUrl = currentQuery ? `${API_URL}/search` : `${API_URL}/curated`;
        const response = await axios.get(apiUrl, {
            headers: config.headers,
            params: {
                query: currentQuery,
                page: current_page,
                per_page: 21,
            },
        });

        const newData = response.data;
        res.json(newData); 

    } catch (error) {
        console.log('error fetching data', error);
        res.status(500).send('Error fetching data');
    }
});

app.get('/contact', (req, res)=>{
    res.render('contact.ejs')
});

app.get('/about', (req, res)=>{
    res.render('about.ejs')
})

app.get('/download/:id', async (req, res) => {
    try {
        const photoId = req.params.id;
        const size = req.query.size || 'portrait';

        // Fetch image data from Pexels API based on photoId
        const response = await axios.get(`${API_URL}/photos/${photoId}`, {
            headers: config.headers
        });


        if (!response.data || !response.data.src || !response.data.src[size]) {
            return res.status(404).send('Image not found');
        }

        const imageUrl = response.data.src[size];
        const imageStream = await axios.get(imageUrl, {
            responseType: 'stream'
        });

        // Set Content-Disposition header for download
        res.setHeader('Content-Disposition', `attachment; filename=${photoId}-${size}.jpg`);
        res.setHeader('Content-Type', 'image/jpeg');  // Assuming JPEG

        // Pipe the image data to the response
        imageStream.data.pipe(res);
    } catch (error) {
        console.log('error downloading image', error);
        res.status(500).send('Error downloading image');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
