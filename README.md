# SSS Institution Website (HTML + CSS + JavaScript + Node.js + MySQL)

A responsive institute website with course cards, student registration, MySQL storage, and a password-protected admin page.

## 1. Install the required software

Install **Node.js LTS**, **MySQL Server**, and **Visual Studio Code**. You can use MySQL Workbench to run SQL commands. Start the MySQL service before testing the site.

## 2. Open the project in VS Code

Extract this ZIP. In VS Code, choose **File → Open Folder** and select the `sss-institution` folder.

## 3. Create the database

Open MySQL Workbench, connect to your local MySQL server, open `schema.sql` from this project, and execute it (lightning icon). It creates the `sss_institution` database and `students` table.

Alternatively, in a MySQL terminal run:

```sql
SOURCE /full/path/to/sss-institution/schema.sql;
```

Replace the path with the real path on your computer.

## 4. Configure the database and admin password

In the VS Code terminal, from the project folder:

```bash
npm install
```

Copy `.env.example` to a new file named `.env` in the project root. On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Edit `.env` and set your real local MySQL password in `DB_PASSWORD`. If your MySQL root account has no password, leave `DB_PASSWORD=` blank. Set `ADMIN_PASSWORD` to a strong password you will remember and change `SESSION_SECRET` to a long random string. Do not share `.env` or upload it to GitHub.

## 5. Start the website

In the VS Code terminal, run:

```bash
npm start
```

Open **http://localhost:3000** in your browser. Keep the terminal running while you use the site. If you edit the backend and need to restart it, stop with `Ctrl+C` and run `npm start` again.

## 6. Test the database connection

Open **http://localhost:3000/api/health**. A successful connection returns JSON similar to:

```json
{"ok":true,"database":"connected"}
```

If it fails, check that MySQL is running and the `.env` host, username, password and database match your local MySQL setup.

## 7. Submit and view student registrations

1. Open `http://localhost:3000`.
2. Fill in the registration form and submit it.
3. Open `http://localhost:3000/admin`.
4. Sign in using the `ADMIN_PASSWORD` you set in `.env`.
5. Search registrations, refresh the list, or delete a record if needed.

## Project structure

```text
sss-institution/
├── public/
│   ├── index.html       # Public website and registration form
│   ├── styles.css       # Theme and responsive styling
│   ├── app.js           # Frontend interactions and form submission
│   ├── admin.html       # Admin login and student table
│   └── admin.js         # Admin dashboard behavior
├── schema.sql           # Database and table setup
├── server.js            # Express API and MySQL connection
├── package.json
├── .env.example
└── README.md
```

## Important notes

- The frontend never connects directly to MySQL; it sends form data to the Express backend.
- SQL queries use placeholders for user input. Server-side validation checks form fields.
- The included session store is Express's default in-memory store, suitable for local learning only. Before public deployment, use HTTPS, a production session store, CSRF protection/rate limiting, secure secret management, and a proper admin user/password-hashing system. Do not expose the development server directly to the public internet.
- The courses and branding are sample content for the starter project. Replace the course list and institute contact details with verified SSS Institution information before publishing. No phone/address has been invented.
