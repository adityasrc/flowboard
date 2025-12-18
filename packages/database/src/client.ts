import { Client } from "pg";

const pgClient = new Client("postgresql://flowboard_app:dirtySecret@localhost:5432/flowboard");

async function main() {
  try {
    await pgClient.connect();

    const response = await pgClient.query("SELECT * FROM users;");
    console.log(response.rows);
  } catch (error) {
    console.error("Database error:", error);
  } finally {
    await pgClient.end();
  }
}

main();
