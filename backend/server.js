
const app=require("./app");
const dotenv= require("dotenv");
const connectDatabase= require("./db/Database.js");


process.on("uncaughtException",(err)=>{
    console.log(`Error:${err.message}`);
    console.log(`Shutting down the server for Handling uncaught Exception`)
})
dotenv.config({
    path:"backend/config/.env"
})
connectDatabase();

const server=app.listen(process.env.PORT,()=>{
console.log(`Server is working on http://localhost:${process.env.PORT}`)
})

process.on("unhandledRejection",(err)=>{
    console.log(`Shutting down the server for ${err.message}`);
    console.log(`Shutting down the server for due to Unhandled promise rejection`);
    server.close(()=>{
        process.exit(1)
    })
});