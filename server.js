const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');
const cheerio = require('cheerio');
const natural = require('natural');
const tokenizer = new natural.WordTokenizer();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

const scrapeSiteContent = async (url) => {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const content = [];
        $('body *').each((index, element) => {
            const text = $(element).text().trim();
            if (text) {
                content.push(text);
            }
        });
        return content;
    } catch (error) {
        console.error(`Error fetching site content: ${error.message}`);
        return [];
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
        const siteContent = await scrapeSiteContent(siteUrl);
        const response = findRelevantContent(message, siteContent);

        if (response.length) {
            socket.emit('chat message', response.join('\n'));
        } else {
            socket.emit('chat message', 'Sorry, I could not find any relevant information.');
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
