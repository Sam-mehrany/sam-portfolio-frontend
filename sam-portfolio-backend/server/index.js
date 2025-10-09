const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const app = express();
const port = process.env.PORT || 3000;

// --- DYNAMIC PATHS for Local vs. Production ---
const isProduction = process.env.NODE_ENV === 'production';
const dataDir = isProduction ? '/app/uploads' : path.join(__dirname, 'uploads');

// Ensure directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// --- Config ---
const JWT_SECRET = 'your-super-secret-key-that-is-long-and-random';
const ADMIN_USER = { username: 'sam', password: 'alien20xi3300' };

// --- Middleware Setup ---
const allowedOrigins = [
    'http://localhost:3000',
    'https://sam-portfolio-frontend.liara.run',
    'https://sammehrany.com'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Static file serving
app.use('/uploads', express.static(dataDir, {
  maxAge: '1d',
  etag: false
}));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// --- Health Check Route ---
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Server is healthy',
    uploadsDir: dataDir,
    isProduction 
  });
});

// --- Multer Setup for File Uploads ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, dataDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// --- Database Setup ---
const dbPath = path.join(dataDir, 'cms.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error("DB Connection Error:", err.message);
  else console.log('✅ Connected to the SQLite database at:', dbPath);
});

db.serialize(() => {
  // Projects table
  db.run(`CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    slug TEXT NOT NULL UNIQUE, 
    title TEXT NOT NULL, 
    year TEXT, 
    blurb TEXT, 
    tags TEXT, 
    thumbnail TEXT, 
    images TEXT, 
    outcome TEXT, 
    challenge TEXT, 
    solution TEXT, 
    content TEXT
  )`);

  // Pages table
  db.run(`CREATE TABLE IF NOT EXISTS pages (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    slug TEXT NOT NULL UNIQUE, 
    title TEXT, 
    content TEXT
  )`);

  // Messages table
  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    project_description TEXT NOT NULL, 
    contact_info TEXT NOT NULL, 
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Blog posts table
  db.run(`CREATE TABLE IF NOT EXISTS blog_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    date TEXT,
    excerpt TEXT,
    tags TEXT,
    content TEXT
  )`);

  // ⭐ NEW: Settings table
  db.run(`CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL
  )`, (err) => {
    if (err) {
      console.error("Error creating settings table:", err.message);
    } else {
      console.log('✅ Settings table created or already exists');
    }
  });

  // ⭐ Insert default settings
 const defaultSettings = [
  { key: 'site_name', value: 'Sam Mehrany' },
  { key: 'site_title', value: 'Sam Mehrany - Portfolio' }, // ⭐ ADD THIS LINE
  { key: 'nav_links', value: JSON.stringify([
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/projects', label: 'Projects' },
    { href: '/blog', label: 'Blog' }
  ]) }
];

  const settingsStmt = db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)");
  defaultSettings.forEach(s => {
    settingsStmt.run(s.key, s.value, (err) => {
      if (err) console.error(`Error inserting setting ${s.key}:`, err.message);
    });
  });
  settingsStmt.finalize();

  // ⭐ UPDATED: Default homepage content with h1 field
  const defaultHomepageContent = JSON.stringify({
    hero: { 
      h1: "Sam Mehrany",
      availability: "Open to collaborations", 
      headline: "Marketing strategist and UX writer specializing in B2B transitions, AI-powered campaigns, and high-impact brand storytelling.", 
      skills: "B2B Marketing, UX Writing, AI Video Production" 
    },
    snapshot: { 
      role: "Creative technologist", 
      location: "Tehran, Iran", 
      focus: "Product Design", 
      socials: { 
        instagram: "https://www.instagram.com/", 
        linkedin: "https://www.linkedin.com/", 
        email: "mailto:email@example.com" 
      } 
    },
    work: { 
      title: "Selected Work", 
      subtitle: "Key highlights from my portfolio", 
      selectedProjects: [] 
    }
  });

  const defaultAboutPageContent = JSON.stringify({
    summary: "Experienced UI/UX Designer with a passion for creating intuitive and engaging digital experiences...",
    experiences: [
      { 
        id: 1, 
        role: "Senior UI/UX Designer & Marketing Strategist", 
        company: "Ronix Tools", 
        period: "2021 – Present", 
        points: "Spearheaded B2B website redesign for German market, developed AI-powered video campaigns, managed multi-channel content strategy..." 
      }
    ],
    skills: { 
      technical: ["Design Systems", "Figma", "Adobe Suite"], 
      soft: ["Empathy", "Communication", "Problem Solving"], 
      tools: ["Figma", "Sketch", "Adobe XD"] 
    },
    educations: [
      { 
        id: 1, 
        degree: "Bachelor of Arts in Graphic Design", 
        university: "Islamic Azad University", 
        period: "2017 – 2021" 
      }
    ]
  });

  const defaultPages = [
    { slug: 'home', title: 'Homepage Content', content: defaultHomepageContent },
    { slug: 'about', title: 'About Me', content: defaultAboutPageContent },
    { slug: 'contact', title: 'Contact Us', content: 'This is the default contact page content.' }
  ];

  const stmt = db.prepare("INSERT OR IGNORE INTO pages (slug, title, content) VALUES (?, ?, ?)");
  defaultPages.forEach(page => stmt.run(page.slug, page.title, page.content));
  stmt.finalize();
});

// --- AUTHENTICATION ---
const protectRoute = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Unauthorized: No token provided' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    res.cookie('token', '', { expires: new Date(0), path: '/' });
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER.username && password === ADMIN_USER.password) {
    const token = jwt.sign({ username: ADMIN_USER.username }, JWT_SECRET, { expiresIn: '8h' });
    res.cookie('token', token, { httpOnly: true, secure: isProduction, path: '/', sameSite: isProduction ? 'none' : 'lax' });
    return res.status(200).json({ success: true, message: 'Logged in successfully' });
  } else {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

app.post('/api/logout', (req, res) => {
  res.cookie('token', '', { expires: new Date(0), path: '/' });
  res.status(200).json({ success: true, message: 'Logged out' });
});

app.get('/api/verify', protectRoute, (req, res) => {
  res.status(200).json({ success: true, message: 'Token is valid' });
});

// ⭐⭐⭐ NEW: SETTINGS API ROUTES ⭐⭐⭐
app.get('/api/settings', (req, res) => {
  db.all("SELECT * FROM settings", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    
    const settings = {};
    rows.forEach(row => {
      // Parse JSON for nav_links
      if (row.key === 'nav_links') {
        try {
          settings[row.key] = JSON.parse(row.value);
        } catch (e) {
          settings[row.key] = [];
        }
      } else {
        settings[row.key] = row.value;
      }
    });
    
    res.json(settings);
  });
});

app.put('/api/settings', protectRoute, (req, res) => {
  const { site_name, site_title, nav_links } = req.body; // ⭐ ADD site_title
  
  // Update site_name
  db.run("UPDATE settings SET value = ? WHERE key = 'site_name'", [site_name], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // ⭐ ADD: Update site_title
    db.run("UPDATE settings SET value = ? WHERE key = 'site_title'", [site_title], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      
      // Update nav_links
      db.run("UPDATE settings SET value = ? WHERE key = 'nav_links'", [JSON.stringify(nav_links)], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        
        res.json({ 
          success: true, 
          message: 'Settings updated successfully' 
        });
      });
    });
  });
});

// --- BLOG API ROUTES ---
const parsePostRow = (row) => {
  if (!row) return null;
  return { 
    ...row, 
    tags: JSON.parse(row.tags || '[]'),
    content: JSON.parse(row.content || '[]')
  };
};

app.get('/api/posts', (req, res) => {
    db.all("SELECT id, slug, title, date, excerpt, tags FROM blog_posts ORDER BY date DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ "error": err.message });
        res.json(rows.map(parsePostRow));
    });
});

app.get('/api/posts/slug/:slug', (req, res) => {
    db.get("SELECT * FROM blog_posts WHERE slug = ?", [req.params.slug], (err, row) => {
        if (err) return res.status(500).json({ "error": err.message });
        if (row) res.json(parsePostRow(row));
        else res.status(404).json({ message: "Post not found." });
    });
});

app.get('/api/posts/:id', protectRoute, (req, res) => {
    db.get("SELECT * FROM blog_posts WHERE id = ?", [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ "error": err.message });
        if (row) res.json(parsePostRow(row));
        else res.status(404).json({ message: "Post not found." });
    });
});

app.post('/api/posts', protectRoute, (req, res) => {
    const { slug, title, date, excerpt, tags, content } = req.body;
    const sql = `INSERT INTO blog_posts (slug, title, date, excerpt, tags, content) VALUES (?,?,?,?,?,?)`;
    const params = [slug, title, date, excerpt, JSON.stringify(tags), JSON.stringify(content)];
    db.run(sql, params, function(err) {
        if (err) return res.status(500).json({ "error": err.message });
        res.status(201).json({ "data": { id: this.lastID } });
    });
});

app.put('/api/posts/:id', protectRoute, (req, res) => {
    const { slug, title, date, excerpt, tags, content } = req.body;
    const sql = `UPDATE blog_posts SET slug = ?, title = ?, date = ?, excerpt = ?, tags = ?, content = ? WHERE id = ?`;
    const params = [slug, title, date, excerpt, JSON.stringify(tags), JSON.stringify(content), req.params.id];
    db.run(sql, params, function(err) {
        if (err) return res.status(500).json({ "error": err.message });
        res.json({ message: "updated", changes: this.changes });
    });
});

app.delete('/api/posts/:id', protectRoute, (req, res) => {
    db.run('DELETE FROM blog_posts WHERE id = ?', req.params.id, function(err) {
        if (err) return res.status(500).json({ "error": err.message });
        res.json({ "message": "deleted", changes: this.changes });
    });
});

// --- MESSAGES API ROUTES ---
app.post('/api/messages', (req, res) => {
    const { projectDescription, contactInfo } = req.body;
    if (!projectDescription || !contactInfo) { 
      return res.status(400).json({ error: "Missing required fields." }); 
    }
    const sql = `INSERT INTO messages (project_description, contact_info) VALUES (?, ?)`;
    db.run(sql, [projectDescription, contactInfo], function(err) {
        if (err) return res.status(500).json({ "error": err.message });
        res.status(201).json({ success: true, id: this.lastID });
    });
});

app.get('/api/messages', protectRoute, (req, res) => {
    db.all("SELECT * FROM messages ORDER BY submitted_at DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ "error": err.message });
        res.json(rows);
    });
});

app.delete('/api/messages/:id', protectRoute, (req, res) => {
    db.run('DELETE FROM messages WHERE id = ?', req.params.id, function(err) {
        if (err) return res.status(500).json({ "error": err.message });
        res.json({ "message": "deleted", changes: this.changes });
    });
});

// --- PAGES API ROUTES ---
const parsePageRow = (row) => {
  if (!row) return null;
  try {
    let content = row.content;
    while (typeof content === 'string') {
      content = JSON.parse(content);
    }
    return { ...row, content: content };
  } catch (e) {
    return row; 
  }
};

app.get('/api/pages', protectRoute, (req, res) => {
    db.all("SELECT id, slug, title FROM pages", [], (err, rows) => {
        if (err) return res.status(500).json({ "error": err.message });
        res.json(rows);
    });
});

app.get('/api/pages/:slug', (req, res) => {
    db.get("SELECT * FROM pages WHERE slug = ?", [req.params.slug], (err, row) => {
        if (err) return res.status(500).json({ "error": err.message });
        if (row) res.json(parsePageRow(row));
        else res.status(404).json({ "message": "Page not found." });
    });
});

app.put('/api/pages/:slug', protectRoute, (req, res) => {
    const { title, content } = req.body;
    const contentToSave = typeof content === 'object' ? JSON.stringify(content) : content;
    db.run(`UPDATE pages SET title = ?, content = ? WHERE slug = ?`, [title, contentToSave, req.params.slug], function(err) {
        if (err) return res.status(500).json({ "error": err.message });
        res.json({ message: "Page updated", changes: this.changes });
    });
});

// --- PROJECTS API ROUTES ---
const parseProjectRow = (row) => {
  if (!row) return null;
  return { 
    ...row, 
    tags: JSON.parse(row.tags || '[]'), 
    images: JSON.parse(row.images || '[]'), 
    content: JSON.parse(row.content || '[]') 
  };
};

app.post('/api/upload', protectRoute, upload.array('images', 10), (req, res) => {
  const paths = req.files.map(file => `/uploads/${file.filename}`);
  console.log('Files uploaded:', paths);
  res.json({ message: 'Files uploaded successfully', paths });
});

app.get('/api/projects', (req, res) => {
  db.all("SELECT * FROM projects ORDER BY year DESC, id DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ "error": err.message });
    res.json(rows.map(parseProjectRow));
  });
});

app.get('/api/projects/slug/:slug', (req, res) => {
  db.get("SELECT * FROM projects WHERE slug = ?", [req.params.slug], (err, row) => {
    if (err) return res.status(500).json({ "error": err.message });
    if (row) res.json(parseProjectRow(row));
    else res.status(404).json({ message: "Project not found." });
  });
});

app.get('/api/projects/:id', protectRoute, (req, res) => {
  db.get("SELECT * FROM projects WHERE id = ?", [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ "error": err.message });
    if (row) res.json(parseProjectRow(row));
    else res.status(404).json({ message: "Project not found." });
  });
});

app.post('/api/projects', protectRoute, (req, res) => {
  const { slug, title, year, blurb, tags, thumbnail, images, outcome, challenge, solution, content } = req.body;
  const sql = `INSERT INTO projects (slug, title, year, blurb, tags, thumbnail, images, outcome, challenge, solution, content) VALUES (?,?,?,?,?,?,?,?,?,?,?)`;
  const params = [slug, title, year, blurb, JSON.stringify(tags), thumbnail, JSON.stringify(images), outcome, challenge, solution, JSON.stringify(content)];
  db.run(sql, params, function(err) {
    if (err) return res.status(500).json({ "error": err.message });
    res.status(201).json({ "data": { id: this.lastID } });
  });
});

app.put('/api/projects/:id', protectRoute, (req, res) => {
  const { slug, title, year, blurb, tags, thumbnail, images, outcome, challenge, solution, content } = req.body;
  const sql = `UPDATE projects SET slug = ?, title = ?, year = ?, blurb = ?, tags = ?, thumbnail = ?, images = ?, outcome = ?, challenge = ?, solution = ?, content = ? WHERE id = ?`;
  const params = [slug, title, year, blurb, JSON.stringify(tags), thumbnail, JSON.stringify(images), outcome, challenge, solution, JSON.stringify(content), req.params.id];
  db.run(sql, params, function(err) {
    if (err) return res.status(500).json({ "error": err.message });
    res.json({ message: "updated", changes: this.changes });
  });
});

app.delete('/api/projects/:id', protectRoute, (req, res) => {
  db.run('DELETE FROM projects WHERE id = ?', req.params.id, function(err) {
    if (err) return res.status(500).json({ "error": err.message });
    res.json({ "message": "deleted", changes: this.changes });
  });
});

app.listen(port, () => {
  console.log(`✅ Express CMS Server running at port ${port}`);
  console.log(`📁 Uploads directory: ${dataDir}`);
  console.log(`🌍 Environment: ${isProduction ? 'Production' : 'Development'}`);
});
