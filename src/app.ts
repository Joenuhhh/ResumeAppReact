import express, { Request, Response } from 'express';
import path from 'path';
import mysql from 'mysql';
import bodyParser from 'body-parser';

const app = express();
const port = 3000;
//const angularDistPath = path.join(__dirname, '../client/dist/client'); // Adjust the 'client/dist/client' path based on your Angular app's build output
//app.use(express.static(angularDistPath));

const db: mysql.Connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'projects'
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use('/images', express.static('images'));
app.use('/css', express.static('css'));



db.connect((err: mysql.MysqlError | null) => {
  if (err) throw err;
  console.log('Connected to the database.');
});

app.get('/', (req: Request, res: Response) => {
  const sql: string = 'SELECT * FROM projects';
  db.query(sql, (err: mysql.MysqlError | null, results: any) => {
    if (err) throw err;
    res.render('home', { cards: results });
  });
});
app.get('/create', (req, res) => {
  res.render('create');
});

app.get('/edit/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  // Fetch the project details with this ID from the database
  const sql = 'SELECT * FROM projects WHERE id = ?';
  db.query(sql, [id], (err, results) => {
    if (err) throw err;
    if (results.length > 0) {
      res.render('edit', { project: results[0] });
    } else {
      res.status(404).send('Project not found');
    }
  });
});
app.post('/update/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  const { name, language, description, skills, image_filepath, youtube_link } = req.body;

  const sql = 'UPDATE projects SET name = ?, language = ?, description = ?, skills = ?, image_filepath = ?, youtube_link = ? WHERE id = ?';
  db.query(sql, [name, language, description, skills, image_filepath, youtube_link, id], (err, results) => {
    if (err) throw err;
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
// rest API
app.get('/projects', (req: Request, res: Response) => {
  const sql = 'SELECT * FROM projects';
  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json(results);
  });
});

// REST API endpoint to get a single project by ID
app.get('/projects/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  const sql = 'SELECT * FROM projects WHERE id = ?';
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).json({ error: 'Project not found' });
    }
  });
});

//app.get('*', (req: Request, res: Response) => {
 // res.sendFile(path.join(angularDistPath, 'index.html'));
//});

// Configure EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Define a route for the root URL ("/")

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
