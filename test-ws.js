const { io } = require('socket.io-client');

async function main(){
    const username = "test";
    const email = "test@gmail.com";
    const password = "testPassword";
    let loginResult;
    const message = "sending message test";
    const conversationId='a2320c66-5385-40f5-91a2-eb5e712e3269';
    
    
    loginResult = await fetch("http://localhost:3000/auth/login",
            {
                headers:{
                    'Accept':'application/json',
                    'Content-Type': 'application/json'
                },
                method:'POST',
                body:JSON.stringify({username,password}),
            }
        );
    console.log(loginResult);

    const loginData = await loginResult.json();
    console.log(loginData);

    const token = loginData.accessToken;
    console.log(token);
    const socket = io('http://localhost:3001',{auth:{token}});

    socket.on('connect',(...args)=>{
        console.log(`connected succesfully ${args}`);
        socket.emit('joinConversation',{conversationId});
        socket.emit('sendMessage',{conversationId,message});
    });
    socket.on('disconnect',(...args)=>{
        console.log(`disconnected succesfully ${args}`);
    });
    socket.on('newMessage',(...args)=>{
        console.log(`sent message: ${args[0].message}, sender id: ${args[0].senderId}`);
    });
    socket.on('error',(...args)=>{
        console.log(`error ${args}`);
    });
}
    
main();