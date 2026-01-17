import { PrismaClient } from "@prisma/client";

const client = new PrismaClient();

async function createUser() {
  await client.user.create({
    data: {
      username: "aditya",
      name: "Aditya",
      email: "aditya@email.com",
      password: "aditya@123"
    }
  })
}

createUser();










// import { Client } from "pg";
// import express from "express";

// const app = express();
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// const pgClient = new Client("postgresql://flowboard_app:dirtySecret@localhost:5432/flowboard");


// pgClient.connect();

// // async function main() {
// //   try {

// //     const userquery = 
// //     const response = await pgClient.query("SELECT * FROM users;");
// //     console.log(response.rows);
// //   } catch (error) {
// //     console.error("Database error:", error);
// //   } finally {
// //     await pgClient.end();
// //   }
// // }

// app.post("/users", function (req, res) {
//   async function main() {
//     try {
//       const username = req.body.username;
//       const email = req.body.email;
//       const password = req.body.password;

//       const city = req.body.city;
//       const country = req.body.country;
//       const pincode = req.body.pincode;

//       const userquery = await `INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id`;
//       const addressquery = await `INSERT INTO adresses ()`
//       // const userquery = `INSERT INTO users (username, email, password) VALUES (${username}, ${email}, ${password}) RETURNING id`;
//       const response = await pgClient.query(userquery, [username, email, password]);
//       // const response = pgClient.query(userquery, 'username', 'email', 'password');
//       res.send("You signed up");
//     } catch (e) {
//       res.send("You didn't signed up");
//     } finally {
//       // pgClient.end();
//     }
//   }
//   main();


// })

// app.listen(3000);

