const Pool = require("pg").Pool; //requiring the pg library

const pool = new Pool({ //creating a new instance 
    user: "postgres", //postgres user
    password: "Titos355", //postgress password
    host: "localhost",
    port: 5432, //default postgres
    database:"onlineshop" //the postgres database created in database.sql
});

module.exports = pool;