//express to create a web server
const express = require('express');
//mysql to connect to the database
const mysql = require('mysql2');
// body parser to parse incoming request bodies
const bodyParser = require('body-parser');
// path module to work with file and directory paths
const path = require('path');


const app = express();

// telling app to use body parser to read data from request body.
app.use(bodyParser.urlencoded({ extended: true }));


// path to serve static files.
app.use(express.static(path.join(__dirname, 'public')));


// create a connection pool to the MySQL database
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'mysql',
    database: 'minecraft_mods'
});

// connect to the database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the MySQL database');
});


// route to handle form submission
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
// app.get("/leadership", (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'leadership.html'));
// });
app.get("/add", (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'add.html'));
});
app.get("/mods", (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'mods.html'));
});

// post rtoute to handle form submission
app.post('/addplayer', (req, res) => {
    const { username, xp, level, health, gamemode, pfp } = req.body;
    const query = "insert into players (username, xp, level, health, gamemode, pfp) values (?, ?, ?, ?, ?, ?)";
    db.query(query, [username, xp, level, health, gamemode, pfp], (err, result) => {
        if (err) {
            console.error('Error inserting user:', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        console.log('User registered successfully:', result);
        res.send('<h1>User registered successfully</h1><a href="/">Go back</a>');
    });
});

app.get('/leadership', (req, res) => {

    db.query("Select * From players", (err, result) => {
        if (err) {
            console.log("mango error:", err)
        }
        let page = `
        <!DOCTYPE html>
        <html>
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Minecraft Leaderboard</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-sRIl4kxILFvY47J16cr9ZwB07vP4J8+LH7qKQnuqkuIAvNWLzeN8tE5YBujZqJLB" crossorigin="anonymous">
        </head>
        <body>
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container-fluid">
            <a class="navbar-brand" href="/">Minecraft Mods</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto">
                    <li class="nav-item">
                        <a class="nav-link" href="/">Home</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="/mods">Mods</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link active" href="/leadership">Leaderboard</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="/add">Add Player</a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
        <div class="container mt-5">
        <h1 class="text-center mb-4">Player Leaderboard</h1>
        <div class="row">
        `;
        result.forEach(row => {
            page += `
            <div class="col-md-4 col-sm-6 mb-4">
  <div class="card h-100 shadow-sm">
    <img src="${row.pfp}" class="card-img-top" style="height: 300px; object-fit: cover;">
    <div class="card-body d-flex flex-column">
      <h4 class="card-title text-center mb-3">${row.username}</h4>
      <p class="card-subtitle text-center text-muted mb-3">
        <i class="bi bi-controller"></i> Plays in <strong>${row.gamemode}</strong> mode
      </p>
      <div class="mt-auto">
        <ul class="list-group list-group-flush">
          <li class="list-group-item d-flex justify-content-between align-items-center">
            <span>⭐ XP</span>
            <span class="badge bg-primary rounded-pill">${row.xp}</span>
          </li>
          <li class="list-group-item d-flex justify-content-between align-items-center">
            <span>🎯 Level</span>
            <span class="badge bg-success rounded-pill">${row.level}</span>
          </li>
          <li class="list-group-item d-flex justify-content-between align-items-center">
            <span>❤️ Health</span>
            <span class="badge bg-danger rounded-pill">${row.health}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</div>
            `;

             page += `
        </div>
        </div>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
        </body>
        </html>
        `;
        });
        
       

        res.send(page);

    })
})

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000/');
});
