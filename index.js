const morgan = require("morgan");
const express = require("express");
const cors = require("cors");
const pg = require("pg");
const client = new pg.Client("postgres://localhost/players_api");
const app = express();
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.get("/api/players", async (req, res, next) => {
  try {
    const SQL = `
            SELECT *
            FROM players
        `;
    const response = await client.query(SQL);
    res.send(response.row);
  } catch (error) {
    next(error);
  }
});

app.get("/api/player/:id", async (req, res, next) => {
  try {
    const SQL = `
            SELECT *
            FROM players
            WHERE id = $1
        `;
    const response = await client.query(SQL, [req.params.id]);
    if (response.rows.length === 0) {
      throw new Error("ID does not exist");
    }
    res.send(response.rows[0]);
  } catch (error) {
    next(error);
  }
});

app.delete("/api/players/:id", async (req, res, next) => {
  try {
    const SQL = `
            DELETE
            FROM players
            WHERE id=$1
        `;
    const response = await client.query(SQL, [req.params.id]);
    res.send(response.rows);
  } catch (error) {
    next(error);
  }
});

app.post("/api/players/:id", async (req, res, next) => {
  const body = req.body;
  try {
    const SQL = `
            INSERT INTO players(name, position, number)
            VALUES($1, $2, $3)
            RETURNING *
        `;
    const response = await client.query(SQL, [
      req.body.name,
      req.body.position,
      req.body.number,
    ]);
    res.send(response.rows);
  } catch (error) {
    next(error);
  }
});

app.put("/api/players/:id", async (req, res, next) => {
  const body = req.body;
  try {
    const SQL = `
            UPDATE players
            SET name = $1, position = $2, number = $3
            WHERE id = $4 
            RETURNING *
        `;
    const response = await client.query(SQL, [
      req.body.name,
      req.body.position,
      req.body.number,
      req.params.id,
    ]);
    res.send(response.rows);
  } catch (error) {
    next(error);
  }
});

app.use("*", (req, res, next) => {
  res.status(404).send("Invalid Route");
});

app.use((err, req, res, next) => {
  console.log("error handler");
  res.status(500).send(err.message);
});

const start = async () => {
  await client.connect();
  console.log("connected to db");
  const SQL = `
    DROP TABLE IF EXIST players;
    CREATE TABLE players(
        id SRIAL PRIMARY KEY,
        name VARCHAR(100),
        position VARCHAR(100)
        number INT
    );
    INSERT INTO player (name, position, number) VALUES('Russell Wilson', 'Quarterback', 3);
    INSERT INTO player (name, position, number) VALUES('Marshawn Lynch', 'Halfback/Fullback', 8);
    INSERT INTO player (name, position, number) VALUES('Doug Baldwin','Wide Reciever', 89);
  `;
  await client.query(SQL);
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`listening on ${PORT}`);
  });
};

start();
