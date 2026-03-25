
import "dotenv/config"
import pg from "pg"
const {Pool}=pg


// CONNECTER LA BASE DE DONNE 
const pool = new Pool({
    user:process.env.DB_USER,
    host:process.env.DB_HOST,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_NAME,
    port:process.env.DB_PORT
    
})

pool.query("SELECT NOW()",(err,res)=>{
    if(err){
        console.error("warnign",err.message)
    }else{
        console.log("db connected")
    }
})

export default pool