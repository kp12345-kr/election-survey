const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;
const DATA_FILE = path.join(__dirname, 'survey-responses.json');

app.use(bodyParser.json());
app.use(cors());

app.use(express.static(__dirname));

const loadSurveyResponses = () => {
    if (fs.existsSync(DATA_FILE)) {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    }
    return [];
};

const saveSurveyResponses = (responses) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(responses, null, 2));
};

let surveyResponses = loadSurveyResponses();

app.post('/submit-survey', (req, res) => {
    const response = req.body;
    surveyResponses.push(response);
    saveSurveyResponses(surveyResponses);
    res.status(200).send('Survey response submitted successfully');
});

app.get('/survey-results', (req, res) => {
    res.json(surveyResponses);
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'homepage.html'));
});

app.get('/results', (req, res) => {
    res.sendFile(path.join(__dirname, 'results.html'));
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
