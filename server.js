const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

const PORT = 3000;


// ================= MIDDLEWARE =================

app.use(
    express.json({
        limit: "10mb"
    })
);


app.use(
    cors({
        origin:"*"
    })
);


// ================= FRONTEND =================

app.use(
    express.static(
        path.join(__dirname,"..","frontend")
    )
);



// ================= CONFIG =================

const SECRET = "secret123";

const AI_SERVER = "http://127.0.0.1:5000";



// ================= TEMP DATABASE =================

const users=[];



// ================= HOME =================

app.get("/",(req,res)=>{

    res.sendFile(
        path.join(
            __dirname,
            "..",
            "frontend",
            "index.html"
        )
    );

});



// ================= REGISTER =================


app.post("/register",async(req,res)=>{


try{


const {
name,
email,
password
}=req.body;



if(!name || !email || !password){

return res.status(400).json({

message:"All fields required"

});

}




const existingUser =
users.find(
user=>user.email===email
);



if(existingUser){

return res.status(400).json({

message:"User already exists"

});

}




const hashedPassword =
await bcrypt.hash(
password,
10
);



users.push({

name,

email,

password:hashedPassword

});



console.log(
"✅ New User:",
email
);



res.json({

message:"Register success"

});



}

catch(error){


res.status(500).json({

message:error.message

});


}



});






// ================= LOGIN =================


app.post("/login",async(req,res)=>{


try{


const {
email,
password
}=req.body;




const user =
users.find(
u=>u.email===email
);



if(!user){

return res.status(404).json({

message:"User not found"

});

}




const check =
await bcrypt.compare(
password,
user.password
);



if(!check){

return res.status(401).json({

message:"Wrong password"

});

}




const token =
jwt.sign(

{
email:user.email,
name:user.name
},

SECRET,

{
expiresIn:"1h"
}

);




res.json({

message:"Login success",

token

});



}

catch(error){


res.status(500).json({

message:error.message

});


}


});







// ================= EMOTION AI =================


app.post(
"/detect-emotion",
async(req,res)=>{


try{


const {image}=req.body;



if(!image){

return res.json({

emotion:"No image"

});

}




console.log(
"📸 Image received"
);



const response =
await axios.post(

`${AI_SERVER}/detect`,

{
image
}

);



console.log(
"🤖 AI:",
response.data
);



res.json({

emotion:
response.data.emotion

});



}


catch(error){


console.log(
"❌ AI ERROR:",
error.message
);



res.status(500).json({

emotion:"SERVER ERROR"

});


}



});






// ================= PROTECTED TEST =================


app.get("/profile",(req,res)=>{


res.json({

message:"Profile API working"

});


});







// ================= 404 =================


app.use((req,res)=>{


res.status(404).json({

message:"Route not found"

});


});







// ================= START =================


app.listen(
PORT,
"0.0.0.0",
()=>{


console.log(
`🚀 Backend running on http://localhost:${PORT}`
);


console.log(
`🧠 AI Server: ${AI_SERVER}`
);


}

);