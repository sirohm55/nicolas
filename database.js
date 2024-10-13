const express = require('express')
const app = express()
const port = process.env.PORT || 3000;
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { jwtDecode } = require('jwt-decode');
const rateLimitMiddleware = require("./rateLimiter");


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.set ('trust proxy' , 1)


const swaggerUi = require ("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "MyVMS API",
            version: "1.0.0",
        },
    },
    apis: ["./routes/*.js"],
};
const swaggerSpec = swaggerJsdoc (options);
app.use("/api-docs", swaggerUi.serve,swaggerUi.setup(swaggerSpec));

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
 })



 
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const credentials = './X509-cert-6489261263702062411.pem'

const client = new MongoClient('mongodb+srv://vms.vbsh1ml.mongodb.net/?authSource=%24external&authMechanism=MONGODB-X509&retryWrites=true&w=majority&appName=vms', {
    tlsCertificateKeyFile: credentials,
    serverApi: ServerApiVersion.v1
  });

//global variables
var jwt_token;  
var token_state 
var id;
var role;
var state = 0;
var supersecret

const fs = require('fs'); 
// Path to the file you want to read 
const filePath = './super_secret.txt'; 
// Read the file and store its contents into a string 

function create_jwt (payload){
    fs.readFile(filePath, 'utf8', (err, data) => { 
        if (err) { 
          console.error('Error reading the file:', err); 
          return; 
        } 
          supersecret = data; 
      });
    jwt_token = jwt.sign(payload, supersecret , {expiresIn: "30m"});
    return 
}

async function login(Username,Password){  //user and host login

    const option={projection:{password:0}}  //pipeline to project usernamne and email

    const result = await client.db("user").collection("host").findOne({
        $and:[
            {username:{$eq:Username}},
            {password:{$eq:Password}}
            ]
    },option)

    if(result){
        host = result.username
        console.log(result)
        console.log("Successfully Login")
        create_jwt ({id: result._id, role: result.role})
        return result.username + " Successfully Login"
        //details(result.role)
        
    }
    else {
        const option={projection:{password:0}}  //pipeline to project usernamne and email

        const result = await client.db("user").collection("security").findOne({
            $and:[
                {username:{$eq:Username}},
                {password:{$eq:Password}}
                ]
        },option)

        if(result){
            console.log(result)
            console.log("Successfully Login")
            create_jwt ({id: result._id, role: result.role})
            return result.username + " Successfully Login"
            //details(result.role)
            
        }
        else{
            state = 1
            return "User not found or password error"
        }
    } 
}

//visitor api

async function delete_pass (del_visitor_pass){

    var mongo = require ("mongodb")
    const o_id_visitor = new mongo.ObjectId(del_visitor_pass)
    const o_id_host = new mongo.ObjectId(id)

    if (!(await client.db("user").collection("visitor").findOne({_id : o_id_visitor, "host_id": id}))){
        return "Invalid visitor id"
    }
    else {
        if(await client.db("user").collection("host").findOne({_id: o_id_host})){
                let visitor_data = await client.db("user").collection("visitor").findOne({_id : o_id_visitor,"host_id": id})
                let host_data = await client.db("user").collection("host").findOne({_id : o_id_host})
                if(!(await client.db("user").collection("host").findOne({_id: o_id_host, "visitor._id": o_id_visitor,"visitor.name": visitor_data.username})))
                    return "the visitor pass you issued is not in the list"
                await client.db("user").collection("host").updateOne({
                    _id:{$eq:o_id_host}
                },{$pull:{visitor:{_id: o_id_visitor, name: visitor_data.username}}},{upsert:true})
                
                await client.db("user").collection("visitor").updateOne({
                    _id:{$eq:o_id_visitor},"host_id":{$eq:id}
                },{$pull:{host:{_id: o_id_host, name: host_data.username}}},{upsert:true})
                console.log("The visitor pass is removed successfully")
                return "The visitor pass is removed successfully"
                
            }
        else
            return "you have not login"
        }
}

async function host_list (){
    var mongo = require ("mongodb")
    const o_id_visitor = new mongo.ObjectId(id)
    const option={projection:{"host":1}}
    const answer = await client.db("user").collection("visitor").findOne({_id: o_id_visitor},option)
    console.log (answer.host)
    return answer.host
}

async function retrieve_pass (retrieve_host, visitor_id){

    var mongo = require ("mongodb")
    const o_id_visitor = new mongo.ObjectId(visitor_id)
    const o_id_host = new mongo.ObjectId(retrieve_host)

    if(!(await client.db("user").collection("host").findOne({_id: o_id_host})))
        return "host not found"

    if(!(await client.db("user").collection("visitor").findOne({_id: o_id_visitor})))
        return "visitor not found"    

    let visitor_data = await client.db("user").collection("visitor").findOne({_id : o_id_visitor})
    let host_data = await client.db("user").collection("host").findOne({_id : o_id_host})
    const option={projection:{visitor:1, _id: 0}}
    let host_data_visitor = await client.db("user").collection("host").findOne({_id : o_id_host},option)
    

    if(await client.db("user").collection("waiting").findOne({"visitor_name": visitor_data.username, "host_name": host_data.username, "host_unit_number": host_data.unit_number, "host_contact_number": host_data.contact_number})){
        return "Your visitor pass is waiting for approval"
    }

    if(!(await client.db("user").collection("host").findOne({_id: o_id_host, "visitor._id": o_id_visitor,"visitor.name": visitor_data.username}))){
        return "host does not issue pass to this visitor"
    }

    await client.db("user").collection("host").updateOne({
        _id: o_id_host
    },{$pull:{visitor:{name:visitor_data.username},visitor:{_id: o_id_visitor}}},{upsert:true})

    
    await client.db("user").collection("visitor").updateOne({
        _id: o_id_visitor
    },{$pull:{host:{name:host_data.username,_id: o_id_host}}},{upsert:true})

    await client.db("user").collection("waiting").insertOne({
        "visitor_name": visitor_data.username, "host_name": host_data.username, "host_unit_number": host_data.unit_number, "host_contact_number": host_data.contact_number
    })

    let host_data_visitor_info = host_data_visitor.visitor [0]

    return "Visitor "+visitor_data.username+" is successfully retrieve the pass, host is located at unit number " + host_data.unit_number+ "\ntime: " + host_data_visitor_info.time+"\ndate: "+ host_data_visitor_info.date+ "\nPlease wait for the approval from the security"
}

//host api


async function visitor_display (){

    const option={projection:{host:0}}

    var mongo = require ("mongodb")
    const o_id_host = new mongo.ObjectId(id)
    const result = await client.db("user").collection("visitor").find ({host_id: id}, option).toArray (function(err, result){
        if (err) throw err;
    })
    console.log (result)
    return result
}

async function add_visitor(create_username, create_email, create_ic, create_contact){

    var mongo = require ("mongodb")
    const o_id_host = new mongo.ObjectId(id)

    const result = await client.db("user").collection("visitor").findOne({
        $and:[
            {username:{$eq:create_username}},
            {ic:{$eq:create_ic}},
            {email:{$eq:create_email}}
            ]
        })
    
    if (result)
        return "Visitor is already in list"
    
    await client.db("user").collection("visitor").insertOne({
        "ic":create_ic,
        "username":create_username,
        "email":create_email,
        "contact_number": create_contact,
        "host_id": id,
        "role":"visitor"
    })
    
    return create_username + " added successfully"
}

async function visitor_list (){
    var mongo = require ("mongodb")
    const o_id_host = new mongo.ObjectId(id)
    const option={projection:{"visitor":1}}
    const answer = await client.db("user").collection("host").findOne({_id: o_id_host},option)
    console.log (answer.visitor)
    return answer.visitor

}

async function deleteVisitor(Id, Username, Email){

    var mongo = require ("mongodb")
    const visitor_id = new mongo.ObjectId(Id)
    const host_id = new mongo.ObjectId(id)

    const result = await client.db("user").collection("visitor").findOne({
        $and:[
            {username:{$eq:Username}},
            {_id:{$eq:visitor_id}},
            {email:{$eq:Email}},
            {host_id:{$eq:id}}
            ]
        })
    
    if (!result)
        return "Visitor not found"
    
    while (await client.db("user").collection("host").findOne({"visitor._id" : visitor_id, _id: host_id})){
        await client.db("user").collection("host").updateOne({
            "visitor._id" : visitor_id, _id: host_id
        },{$pull:{visitor:{name:result.username,_id: visitor_id}}},{upsert:true})
    }

    let visitor_data = await client.db("user").collection("visitor").findOne({_id : visitor_id})
    let host_data = await client.db("user").collection("host").findOne({_id : host_id})
    
    await client.db("user").collection("visitor").deleteOne({
            _id:{$eq:visitor_id}
        })

        if (await client.db("user").collection("waiting").findOne({"visitor_name": visitor_data.username, "host_name": host_data.username, "host_unit_number": host_data.unit_number, "host_contact_number": host_data.contact_number}))
            await client.db("user").collection("waiting").deleteOne({
                "visitor_name": visitor_data.username, "host_name": host_data.username, "host_unit_number": host_data.unit_number, "host_contact_number": host_data.contact_number
            })
    
    return result.username + " deleted successfully"
}

async function registerUser (regIC,regUsername,regPassword,regEmail,regUnit,regContact){

    const punctuation= '~`!@#$%^&*()-_+={}[]|\;:"<>,./?';
    let Punch = 0
    let Capital = 0

    if (regPassword.length < 8)
        return "Password must be at least 8 characters long"

    for (i=0; i<(regPassword.length); i++){
        if (punctuation.includes(regPassword[i])){
            Punch = 1;
            continue
        }
        if ((regPassword [i].toUpperCase()) == regPassword [i]){
            Capital = 1;
            continue}
    }

    if ((Punch == 0) || (Capital == 0))
        return "Password must contains Special character and Capital letter"


    if (await client.db("user").collection("register").findOne({ic:regIC,username:regUsername,unit_number:regUnit,email:regEmail,contact_number: regContact})){
        return "request pending"
    }

    if (await client.db("user").collection("host").findOne({ic:regIC}) || await client.db("user").collection("register").findOne({ic:regIC})){
        return "Your IC has already registered in the system"
    }
    
    
    else {
        if(await client.db("user").collection("host").findOne({username: regUsername}) || await client.db("user").collection("register").findOne({username: regUsername})){
            return "Your username already exist. Please use other username"
        }

        else if(await client.db("user").collection("host").findOne({unit_number: regUnit}) || await client.db("user").collection("register").findOne({unit_number: regUnit})){
            return "Your unit number already registered. Please try again"
        }

        else if(await client.db("user").collection("host").findOne({email: regEmail}) || await client.db("user").collection("register").findOne({email: regEmail})){
            return "Your email already exist. Please use other email"
        }

        else if(await client.db("user").collection("host").findOne({contact_number: regContact}) || await client.db("user").collection("register").findOne({contact_number: regContact})){
            return "Your contact number already exist. Please use other contact number"
        }
        
        else{
            await client.db("user").collection("register").insertOne({
                "ic":regIC,
                "username":regUsername,
                "password":password,
                "email":regEmail,
                "contact_number": regContact,
                "unit_number": regUnit,
                "role":"host"
            })
            let data = regUsername + " is successfully register"
            return data
        }
    }
}

async function issue_pass (issue_num, visit_date, visit_time){

    var mongo = require ("mongodb")
    const o_id_visitor = new mongo.ObjectId(issue_num)
    const o_id_host = new mongo.ObjectId(id)

    if (!(await client.db("user").collection("visitor").findOne({_id : o_id_visitor, host_id: id}))){
        return "Invalid visitor id"
    }
    else {
        if(await client.db("user").collection("host").findOne({_id: o_id_host})){

                let visitor_data = await client.db("user").collection("visitor").findOne({_id : o_id_visitor})
                let host_data = await client.db("user").collection("host").findOne({_id : o_id_host})

                if(await client.db("user").collection("host").findOne({_id: o_id_host, "visitor._id": o_id_visitor,"visitor.name": visitor_data.username}))
                    return "the visitor pass you issued has already in the list"

                if(await client.db("user").collection("waiting").findOne({"visitor_name": visitor_data.username, "host_name": host_data.username, "host_unit_number": host_data.unit_number, "host_contact_number": host_data.contact_number})){
                    return "Your visitor pass is waiting for approval"
                }

                await client.db("user").collection("host").updateOne({
                    _id:{$eq:o_id_host}
                },{$push:{visitor:{_id: o_id_visitor, name: visitor_data.username, date: visit_date, time: visit_time}}},{upsert:true})
                
                await client.db("user").collection("visitor").updateOne({
                    _id:{$eq:o_id_visitor}
                },{$push:{host:{_id: o_id_host, name: host_data.username, date: visit_date, time: visit_time}}},{upsert:true})
                console.log("The visitor is added successfully")
                return "The visitor is added successfully"
                
            }
            

            return "you have not login"

        }
}

async function registerUserTest (regIC,regUsername,regPassword,regEmail,regUnit,regContact){

    const punctuation= '~`!@#$%^&*()-_+={}[]|\;:"<>,./?';
    let Punch = 0
    let Capital = 0

    if (regPassword.length < 8)
        return "Password must be at least 8 characters long"

    for (i=0; i<(regPassword.length); i++){
        if (punctuation.includes(regPassword[i])){
            Punch = 1;
            continue
        }
        if ((regPassword [i].toUpperCase()) == regPassword [i]){
            Capital = 1;
            continue}
    }

    if ((Punch == 0) || (Capital == 0))
        return "Password must contains Special character and Capital letter"

    if (await client.db("user").collection("host").findOne({ic:regIC}) || await client.db("user").collection("register").findOne({ic:regIC})){
        return "Your IC has already registered in the system"
    }
    
    else {
        if(await client.db("user").collection("host").findOne({username: regUsername}) || await client.db("user").collection("register").findOne({username: regUsername})){
            return "Your username already exist. Please use other username"
        }

        else if(await client.db("user").collection("host").findOne({unit_number: regUnit}) || await client.db("user").collection("register").findOne({unit_number: regUnit})){
            return "Your unit number already registered. Please try again"
        }

        else if(await client.db("user").collection("host").findOne({email: regEmail}) || await client.db("user").collection("register").findOne({email: regEmail})){
            return "Your email already exist. Please use other email"
        }

        else if(await client.db("user").collection("host").findOne({contact_number: regContact}) || await client.db("user").collection("register").findOne({contact_number: regContact})){
            return "Your contact number already exist. Please use other contact number"
        }

        else{
            await client.db("user").collection("host").insertOne({
                "ic":regIC,
                "username":regUsername,
                "password":regPassword,
                "email":regEmail,
                "contact_number": regContact,
                "unit_number": regUnit,
                "role":"host"
            })
            let data = regUsername + " is successfully register"
            return data
        }
    }
}
//security function

async function registration_display (){

    const option={projection:{password:0}}

    const result = await client.db("user").collection("register").findOn({}, option)

    return result
}

async function host_approval (regID){
    var mongo = require ("mongodb")
    const host_id = new mongo.ObjectId(regID)
    const option={projection:{_id:0}}

    const result = await client.db("user").collection("register").findOne({_id:host_id}, option)

    console.log (result)
    if (!result)
        return "host registration id not found"

    await client.db("user").collection("host").insertOne({
        "ic":result.ic,
        "username": result.username,
        "password": result.password,
        "email": result.email,
        "contact_number": result.contact_number,
        "unit_number": result.unit_number,
        "role": "host"
    })
    await client.db("user").collection("register").deleteOne({
        _id:{$eq:host_id}
    })
    return "host registered successfully"
}

async function host_rejection (regID){
    var mongo = require ("mongodb")
    const host_id = new mongo.ObjectId(regID)
    const option={projection:{_id:0}}

    const result = await client.db("user").collection("register").findOne({_id:host_id}, option)

    console.log (result)
    if (!result)
        return "host registration id not found"

    await client.db("user").collection("register").deleteOne({
        _id:{$eq:host_id}
    })
    return "host rejected successfully"
}

async function pass_display (){

    const option={projection:{host_unit_number: 0,host_contact_number: 0}}

    const result = await client.db("user").collection("waiting").find ({},option).toArray (function(err, result){
        if (err) throw err;
    })
    console.log (result)
    return result
}

async function pass_verification (ref_num){
    var mongo = require ("mongodb")
    const ref = new mongo.ObjectId(ref_num)
    const option={projection:{_id:0}}

    const result = await client.db("user").collection("waiting").findOne({_id:ref})

    if(!result)
        return "visitor pass not found"

    await client.db("user").collection("waiting").deleteOne({
        _id: ref
    })

    return "visitor pass is verified\n" + result.host_unit_number +" host contact number is\n"+ result.host_contact_number

}

async function user_display (){
    const option={projection:{password:0,ic:0,visitor:0, email: 0}}
    const result = await client.db("user").collection("host").find ({},option).toArray (function(err, result){
        if (err) throw err;
    })
    console.log (result)
    return result
}

async function deleteUser(Id, Username, Email){

    var mongo = require ("mongodb")
    const host_id = new mongo.ObjectId(Id)

    const result = await client.db("user").collection("host").findOne({
        $and:[
            {username:{$eq:Username}},
            {_id:{$eq:host_id}},
            {email:{$eq:Email}}
            ]
        })
    
    if (!result)
        return "Host not found"
    while (await client.db("user").collection("visitor").findOne({"host_id" : Id})){
        await client.db("user").collection("visitor").deleteOne({
            "host_id" : Id
        })
    }
    //
    let host_data = await client.db("user").collection("host").findOne({_id : host_id})

    while (await client.db("user").collection("waiting").findOne({"host_name": host_data.username})){
        await client.db("user").collection("visitor").deleteOne({
            "host_name": host_data.username
        })
    }

    await client.db("user").collection("host").deleteOne({
            _id:{$eq:host_id}
        })
    
    return result.username + " deleted successfully"
}

//admin function

async function login_admin(Username,Password,Secret){

    const result = await client.db("user").collection("admin").findOne({  
        $and:[
            {username:{$eq:Username}},
            {password:{$eq:Password}},
            {secret:{$eq:Secret}}
            ]
    })

    if(result){
        admin = result.username
        console.log(result)
        console.log("Successfully Login")
        create_jwt ({id: result._id, role: result.role})
        return admin + " Successfully Login"
    }

    else{
        state = 1
        return "username/password/secret is incorrect"
    } 


}

async function view_database (){
    
    const result_visitor = await client.db("user").collection("visitor").find ({}).toArray (function(err, result){
        if (err) throw err;
    })

    const result_host = await client.db("user").collection("host").find ({}).toArray (function(err, result){
        if (err) throw err;
    })

    const result_security = await client.db("user").collection("security").find ({}).toArray (function(err, result){
        if (err) throw err;
    })

    console.log (result_visitor.concat(result_host))
    const result = result_visitor.concat(result_host)
    return result.concat(result_security)
}

async function toHostRole(ID){
    var mongo = require ("mongodb")
    const secure_id = new mongo.ObjectId(ID)

    const result = await client.db("user").collection("security").findOne({_id:secure_id})

    if (!result)
        return "security not found"

    if(await client.db("user").collection("host").findOne({ic: result.ic, username: result.username, password: result.password, email: result.email, contact_number: result.contact_number, unit_number: result.unit_number})){
        return "security is already a host"
    }

    await client.db("user").collection("host").insertOne({
        "ic":result.ic,
        "username": result.username,
        "password": result.password,
        "email": result.email,
        "contact_number": result.contact_number,
        "unit_number": result.unit_number,
        "role": "host"
    })

    await client.db("user").collection("security").deleteOne({
        _id:{$eq:secure_id}
    })

    return "security " + result.username + " has successfully became host"

}

async function toSecurityRole(ID){
    var mongo = require ("mongodb")
    const host_id = new mongo.ObjectId(ID)

    const result = await client.db("user").collection("host").findOne({_id:host_id})

    if (!result)
        return "host not found"

    if(await client.db("user").collection("security").findOne({ic: result.ic, username: result.username, password: result.password, email: result.email, contact_number: result.contact_number, unit_number: result.unit_number})){
        return "host is already a security"
    }

    while (await client.db("user").collection("visitor").findOne({"host_id" : ID})){
        await client.db("user").collection("visitor").deleteOne({
            "host_id" : ID
        })
    }

    if (await client.db("user").collection("waiting").findOne({"host_name": result.username, "host_unit_number": result.unit_number, "host_contact_number": result.contact_number}))
            await client.db("user").collection("waiting").deleteOne({
                "host_name": result.username, "host_unit_number": result.unit_number, "host_contact_number": result.contact_number
            })

    await client.db("user").collection("security").insertOne({
        "ic":result.ic,
        "username": result.username,
        "password": result.password,
        "email": result.email,
        "contact_number": result.contact_number,
        "unit_number": result.unit_number,
        "role": "security"
    })

    await client.db("user").collection("host").deleteOne({
        _id:{$eq:host_id}
    })

    return "host " + result.username + " has successfully became security"

}

//HTTP login method


app.post('/login',rateLimitMiddleware, verifyToken, async(req, res) => {   //login
    if(token_state == 0){
        let answer = await login(req.body.username,req.body.password);
        if (state == 0){
            res.cookie("sessid", jwt_token, {
                httpOnly: true,
            });
        }
        res.status(200).send(answer)
    }
    else{
        res.status(200).send("you had logged in as " + role)
    }
    state = 0
})

//visitor api

app.post ('/login/visitor/pass', verifyToken, async(req, res) => {
    if (req.body.host_id.length == 24)
        if (req.body.visitor_id.length == 24)
            res.send(await retrieve_pass (req.body.host_id, req.body.visitor_id))
        else
            res.send("invalid visitor id")
    else
        res.send("invalid host id")
})

/* app.get ('/login/visitor/display_pass', verifyToken, async(req, res) => {
//     if (token_state == 1 ){
//         if (role == "visitor"){
//             res.send (await host_list ())
//         }
//         else
//             res.send ("you are not a visitor")
//     }   
//     else
//         res.send ("you have not login yet")
//
 })*/

//host api

app.post("/login/user/add_visitor" ,verifyToken, async (req, res) => {  //register visitor
    if ((token_state == 1) && (role == "host"))
        res.send (await add_visitor (req.body.username, req.body.email, req.body.ic, req.body.contact_number))
    else
        res.send ("You are not a host")
})

app.get('/login/user/visitor_display',verifyToken, async(req, res) => {
    if (token_state == 1 )
        if (role == "host")
            res.send (await visitor_display ())
        else
            res.send ("you are not a host")
    else
        res.send ("you have not login yet")
})

app.delete("/login/user/delete_visitor" ,verifyToken, async (req, res) => {  //register visitor
    if ((token_state == 1) && (role == "host"))
        if (req.body.id.length == 24)
            res.send (await deleteVisitor(req.body.id, req.body.username, req.body.email))
        else
            res.send ("Invalid visitor id")
    else
        res.send ("You are not a host")
})

app.post ('/login/user/issue', verifyToken, async(req, res) => {
    if (token_state == 1 )
        if (role == "host")
            if (req.body.visitor_id.length == 24)
                res.send(await issue_pass (req.body.visitor_id, req.body.date, req.body.time))
            else
                res.send("Invalid visitor id")
        else
            res.send ("you are not a host")
    else
        res.send("you have not login yet")
})

app.delete ('/login/user/delete_pass', verifyToken, async(req, res) => {
    if (token_state == 1 )
        if (role == "host")
            if (req.body.visitor_id.length == 24)
                res.send(await delete_pass (req.body.visitor_id))
            else
                res.send("Invalid visitor id")
        else
            res.send ("you are not a host")
    else
        res.send("you have not login yet")
})


app.get ('/login/user/display_issue_users', verifyToken, async(req, res) => {
    if (token_state == 1 ){
        if (role == "host"){
            res.send (await visitor_list ())
        }
        else
            res.send ("you are not a host")
    }   
    else
        res.send ("you have not login yet")
})

app.post("/register" , async (req, res) => {  //register visitor
    if (req.body.ic.length != 14)
        res.send ("ic number invalid")
    else
        res.send(await registerUser(req.body.ic, req.body.username, req.body.password, req.body.email, req.body.unit_number, req.body.contact_number))
})

//security api

app.get("/login/security/registration_display" ,verifyToken, async (req, res) => {  //register visitor
    if ((token_state == 1) && (role == "security")) 
        res.send(await registration_display ())
    else
        res.send ("You are not a security")

})

app.post("/login/security/registration_approval" ,verifyToken, async (req, res) => {  //register visitor
    if ((token_state == 1) && (role == "security")) {
        if (req.body.registration_id.length == 24)
            res.send(await host_approval(req.body.registration_id))
        else
            res.send ("Invalid host id")
    }
    else
        res.send ("You are not a security")

})

app.post("/login/security/registration_rejection" ,verifyToken, async (req, res) => {  //register visitor
    if ((token_state == 1) && (role == "security")) {
        if (req.body.rejection_id.length == 24)
            res.send(await host_rejection(req.body.rejection_id))
        else
            res.send ("Invalid host id")
    }
    else
        res.send ("You are not a security")

})

app.get("/login/security/pass_display" ,verifyToken, async (req, res) => {  //register visitor
    if ((token_state == 1) && (role == "security"))
        res.send (await pass_display())
    else
        res.send ("You are not a security")
})

app.post("/login/security/verify_pass" ,verifyToken, async (req, res) => {  //register visitor
    if ((token_state == 1) && (role == "security"))
    {
        if (req.body.reference_id.length == 24)
            res.send(await pass_verification(req.body.reference_id))
        else
            res.send ("Invalid reference id")
    }
    else
        res.send ("You are not a security")
})

app.get("/login/security/host_display" ,verifyToken, async (req, res) => {  //register visitor
    if ((token_state == 1) && (role == "security"))
        res.send (await user_display ())
    else
        res.send ("You are not a security")
})

app.delete("/login/security/delete_host" ,verifyToken, async (req, res) => {  //register visitor
    if ((token_state == 1) && (role == "security"))
        if (req.body.id.length == 24)
            res.send (await deleteUser(req.body.id, req.body.username, req.body.email))
        else
            res.send ("Invalid host id")
    else
        res.send ("You are not a security")
})



//admin api

app.post('/login/admin_login',verifyToken, async(req, res) => {   //login
    if(token_state == 0){
        let answer = await login_admin(req.body.username,req.body.password, req.body.secret);
        if (state == 0){
            res.cookie("sessid", jwt_token, {
                httpOnly: true,
            });
        }
        res.status(200).send(answer)
    }
    else{
        res.status(200).send("you had logged in as " + role)
    }
    state = 0
})

app.get ('/login/admin/access', verifyToken, async(req, res) => {
    if ((token_state == 1) && (role == "admin"))
        res.send(await view_database ())
    else
        res.send ("you are not admin")
})

app.post ('/login/admin/change_to_security', verifyToken, async(req, res) => {
    if ((token_state == 1) && (role == "admin")){
        if (req.body.host_id.length == 24)
            res.send(await toSecurityRole(req.body.host_id))
        else
            res.send ("Invalid host id")
    }
    else
        res.send ("you are not admin")
})

app.post ('/login/admin/change_to_host', verifyToken, async(req, res) => {
    if ((token_state == 1) && (role == "admin")){
        if (req.body.security_id.length == 24)
            res.send(await toHostRole(req.body.security_id))
        else
            res.send ("Invalid security id")
    }
    else
        res.send ("you are not admin")
})

app.get('/login/logout', (req, res) => {
        console.log ("logout")
        res.clearCookie("sessid").send("You have log out")
})

app.get('/', (req, res) => {
    res.redirect ("/api-docs");
 })

// app.get('/login/user/test/create',verifyToken, async(req, res) => {   //login
//     if(token_state == 0){
//         create_jwt ({id: "658c481cb28bf3cc216e5582", role: "host"})
        
//         res.cookie("sessid", jwt_token, {
//             httpOnly: true,
//         });
        
//         res.status(200).send(answer)
//     }
//     else{
//         res.status(200).send("you had logged in as " + role)
//     }
//     state = 0
// })

app.post("/user/test/create" , async (req, res) => {  //register visitor
    if (req.body.ic.length != 14)
        res.send ("ic number invalid")
    else
        res.send(await registerUserTest(req.body.ic, req.body.username, req.body.password, req.body.email, req.body.unit_number, req.body.contact_number))
})

// app.get('/login/visitor/test',verifyToken, async(req, res) => {   //login
//     if(token_state == 0){
//         create_jwt ({id: "658c488bb28bf3cc216e5584", role: "visitor"})
        
//         res.cookie("sessid", jwt_token, {
//             httpOnly: true,
//         });
        
//         res.status(200).send(answer)
//     }
//     else{
//         res.status(200).send("you had logged in as " + role)
//     }
//     state = 0
// })

function verifyToken (req, res, next){

    fs.readFile(filePath, 'utf8', (err, data) => { 
        if (err) { 
          console.error('Error reading the file:', err); 
          return; 
        } 
          supersecret = data; 
      });

    const token = req.cookies.sessid;
    if (!token){            //no token obtained from cookie
        console.log("no token")
        token_state = 0;    //'0' indicates that the user has not logged in
        return next()
    }

    const user = jwt.verify (token, supersecret , (err,user) => {
        if (err){               //token has been altered
            console.log ("Invalid token")
            token_state = 0;    //'0' indicates that the user has not logged in
            return next()
        }
        token_state = 1;    //'1' indicates that the user has logged in
        req.user = user;
        role = user.role;   //assign role from token to variable role
        id = user.id        //assign id from token to variable id
        console.log(role, id)
        return next()
    });
}

function authenticateToken(req, res, next) {
    // Extract the token from the Authorization header
    

    const token = req.cookies.sessid;
    const decoded = jwtDecode(token);
    console.log (decoded)
    role = decoded.role;
    console.log (role)
    id = decoded.id;
    next();
}
  