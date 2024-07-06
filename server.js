const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');
const cheerio = require('cheerio');
const natural = require('natural');
const cors = require('cors');

const tokenizer = new natural.WordTokenizer();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: (origin, callback) => {
            const allowedOrigins = ['http://localhost', 'http://127.0.0.1:3000'];
            if (!origin || allowedOrigins.indexOf(origin) !== -1) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ["GET", "POST"]
    }
});

const allowedOrigins = ['http://localhost', 'http://127.0.0.1:3000'];

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
};

app.use(cors(corsOptions));
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

const scrapeSiteContent = async (url) => {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const textContent = $('body p').first().text().trim(); // Extract first paragraph only
        return textContent;
    } catch (error) {
        console.error(`Error fetching site content from ${url}: ${error.message}`);
        return 'Error fetching site content.';
    }
};

const findRelevantContent = (query, content) => {
    const queryTokens = tokenizer.tokenize(query.toLowerCase());
    const relevantContent = content.filter(text => {
        const textTokens = tokenizer.tokenize(text.toLowerCase());
        return queryTokens.some(token => textTokens.includes(token));
    });
    return relevantContent;
};

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    socket.on('chat message', async (msgData) => {
        const { message, siteUrl } = msgData;

        console.log('Received msgData:', msgData);

        if (!message || !siteUrl) {
            console.error('Invalid msgData:', msgData);
            socket.emit('chat message', 'Invalid message data.');
            return;
        }

        console.log(`Scraping content from: ${siteUrl}`);
        const siteContent = await scrapeSiteContent(siteUrl);
        console.log(`Content fetched from ${siteUrl}:`, siteContent);

        if (siteContent) {
            const readMoreLink = `<a href="${siteUrl}" target="_blank">Read More</a>`;
            socket.emit('chat message', `${siteContent}\n\n${readMoreLink}`);
        } else {
            socket.emit('chat message', 'Sorry, I could not find any relevant information.');
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
