(function() {
    var script = document.createElement('script');
    script.src = 'https://webchatboat.onrender.com/socket.io/socket.io.js';
    
    script.onload = function() {
        var chatbox = document.createElement('div');
        chatbox.id = 'chatbox';
        chatbox.innerHTML = `
            <div id="chat-header">Chat Bot</div>
            <div id="messages"></div>
            <div id="input-container">
                <input id="input" autocomplete="off" placeholder="Type your message..." />
                <button id="send">Send</button>
            </div>
        `;
        document.body.appendChild(chatbox);

        var socket = io('https://webchatboat.onrender.com/');
        var input = document.getElementById('input');
        var messages = document.getElementById('messages');
        
        function getSiteUrl() {
            return 'https://parvisor.com/';
        }

        document.getElementById('send').onclick = function() {
            if (input.value) {
                const messageData = {
                    message: input.value,
                    siteUrl: getSiteUrl()
                };
                socket.emit('chat message', messageData);
                input.value = '';
            }
        };

        socket.on('chat message', function(msg){
            var item = document.createElement('div');
            item.className = 'message';
            item.innerHTML = msg.replace(/\n/g, '<br>');  // Break paragraphs by new line
            messages.appendChild(item);
            window.scrollTo(0, document.body.scrollHeight);
        });
    };
    document.head.appendChild(script);

    // Adding CSS styles
    var style = document.createElement('style');
    style.innerHTML = `
        #chatbox {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 350px;
            background: rgba(0, 0, 0, 0.8);
            border: 2px solid #00ff99;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0, 255, 153, 0.5);
            font-family: 'Arial', sans-serif;
            color: white;
            overflow: hidden;
        }

        #chat-header {
            background: linear-gradient(45deg, #00ff99, #0099ff);
            padding: 10px;
            text-align: center;
            font-size: 20px;
            border-bottom: 1px solid #00ff99;
        }

        #messages {
            height: 300px;
            padding: 10px;
            overflow-y: auto;
            scrollbar-width: thin;
            scrollbar-color: #00ff99 #333;
        }

        #messages::-webkit-scrollbar {
            width: 8px;
        }

        #messages::-webkit-scrollbar-track {
            background: #333;
        }

        #messages::-webkit-scrollbar-thumb {
            background-color: #00ff99;
            border-radius: 10px;
        }

        .message {
            background: rgba(0, 255, 153, 0.2);
            padding: 5px 10px;
            margin: 5px 0;
            border-radius: 5px;
        }

        #input-container {
            display: flex;
            border-top: 1px solid #00ff99;
        }

        #input {
            flex: 1;
            padding: 10px;
            border: none;
            outline: none;
            background: rgba(0, 0, 0, 0.6);
            color: white;
            border-top-left-radius: 10px;
        }

        #send {
            background: linear-gradient(45deg, #00ff99, #0099ff);
            border: none;
            padding: 0 20px;
            cursor: pointer;
            color: white;
            font-weight: bold;
            border-top-right-radius: 10px;
        }

        #send:hover {
            background: linear-gradient(45deg, #0099ff, #00ff99);
        }
    `;
    document.head.appendChild(style);
})();
