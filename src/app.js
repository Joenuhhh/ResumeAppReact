"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const mysql_1 = __importDefault(require("mysql"));
const body_parser_1 = __importDefault(require("body-parser"));
const app = (0, express_1.default)();
const port = 3000;
const db = mysql_1.default.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'projects'
});
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use('/images', express_1.default.static('images'));
app.use('/css', express_1.default.static('css'));
app.get('/css/stylesheet.css', (req, res) => {
    res.setHeader('Content-Type', 'text/css');
    res.sendFile(path_1.default.join(__dirname, 'css', 'stylesheet.css'));
});
db.connect((err) => {
    if (err)
        throw err;
    console.log('Connected to the database.');
});
app.get('/', (req, res) => {
    const sql = 'SELECT * FROM projects';
    db.query(sql, (err, results) => {
        if (err)
            throw err;
        res.render('home', { cards: results });
    });
});
app.get('/create', (req, res) => {
    res.render('create');
});
app.get('/edit/:id', (req, res) => {
    const id = req.params.id;
    // Fetch the project details with this ID from the database
    const sql = 'SELECT * FROM projects WHERE id = ?';
    db.query(sql, [id], (err, results) => {
        if (err)
            throw err;
        if (results.length > 0) {
            res.render('edit', { project: results[0] });
        }
        else {
            res.status(404).send('Project not found');
        }
    });
});
app.post('/update/:id', (req, res) => {
    const id = req.params.id;
    const { name, language, description, skills, image_filepath, youtube_link } = req.body;
    const sql = 'UPDATE projects SET name = ?, language = ?, description = ?, skills = ?, image_filepath = ?, youtube_link = ? WHERE id = ?';
    db.query(sql, [name, language, description, skills, image_filepath, youtube_link, id], (err, results) => {
        if (err)
            throw err;
        res.redirect('/'); // Redirect to the home page after successful update
    });
});
app.post('/create', (req, res) => {
    const { name, language, description, skills, image_filepath, youtube_link } = req.body;
    const sql = 'INSERT INTO projects (name, language, description, skills, image_filepath, youtube_link) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(sql, [name, language, description, skills, image_filepath, youtube_link], (err, results) => {
        if (err)
            return res.status(500).send('Error creating project');
        res.redirect('/'); // Redirect to the home page after successful creation
    });
});
app.delete('/delete/:id', (req, res) => {
    const id = req.params.id;
    const sql = 'DELETE FROM projects WHERE id = ?';
    db.query(sql, [id], (err, results) => {
        if (err)
            return res.status(500).send('Error deleting project');
        res.status(200).send('Project deleted successfully');
    });
});
// Configure EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path_1.default.join(__dirname, '../views'));
// Define a route for the root URL ("/")
// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
