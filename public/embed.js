(function() {
    var script = document.createElement('script');
    script.src = 'http://127.0.0.1:3000/socket.io/socket.io.js';
    
    script.onload = function() {
        var chatbox = document.createElement('div');
        chatbox.id = 'chatbox';
        chatbox.style.position = 'fixed';
        chatbox.style.bottom = '0';
        chatbox.style.right = '0';
        chatbox.style.width = '300px';
        chatbox.style.background = '#fff';
        chatbox.style.border = '1px solid #ccc';
        chatbox.style.boxShadow = '0px 0px 10px rgba(0,0,0,0.1)';
        chatbox.style.padding = '10px';
        chatbox.innerHTML = `
            <div id="messages"></div>
            <input id="input" autocomplete="off" /><button id="send">Send</button>
        `;
        document.body.appendChild(chatbox);

        var socket = io('http://127.0.0.1:3000');
        var input = document.getElementById('input');
        var messages = document.getElementById('messages');
        
        function getSiteUrl() {
            return window.location.origin;
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
            item.textContent = msg;
            messages.appendChild(item);
            window.scrollTo(0, document.body.scrollHeight);
        });
    };
    document.head.appendChild(script);
})();
