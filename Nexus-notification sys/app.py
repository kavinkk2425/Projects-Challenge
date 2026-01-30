from flask import Flask, render_template, request, redirect, session, url_for, flash
import sqlite3

app = Flask(__name__)
app.secret_key = "college_secret"

DB = "college.db"

# ---------------- DATABASE ----------------
def get_db():
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    return conn

def log_activity(admin_user, action, details):
    with get_db() as conn:
        conn.execute(
            "INSERT INTO activities (admin_user, action, details) VALUES (?, ?, ?)",
            (admin_user, action, details)
        )

def init_db():
    with get_db() as conn:
        conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT,
            password TEXT,
            role TEXT
        )
        """)

        conn.execute("""
        CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            message TEXT,
            category TEXT,
            urgency TEXT,
            target_years TEXT,
            target_depts TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        """)

        conn.execute("""
        CREATE TABLE IF NOT EXISTS placements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            company TEXT,
            role TEXT,
            package TEXT,
            deadline TEXT,
            status TEXT
        )
        """)

        conn.execute("""
        CREATE TABLE IF NOT EXISTS activities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            admin_user TEXT,
            action TEXT,
            details TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        """)

        conn.execute("""
        CREATE TABLE IF NOT EXISTS admin_details (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            department TEXT,
            year_node TEXT,
            hod_context TEXT,
            class_advisor TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        """)

        # Default Admin
        admin = conn.execute("SELECT * FROM users WHERE role='admin'").fetchone()
        if not admin:
            conn.execute(
                "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
                ("admin", "admin123", "admin")
            )

init_db()

# ---------------- LOGIN ----------------
@app.route("/", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        user = request.form["username"]
        pwd = request.form["password"]

        conn = get_db()
        data = conn.execute(
            "SELECT * FROM users WHERE username=? AND password=?",
            (user, pwd)
        ).fetchone()

        if data:
            session["role"] = data["role"]
            session["username"] = data["username"]
            if data["role"] == "admin":
                return redirect("/admin")
            else:
                return redirect("/student")

    # Fetch latest admin details to display on login page
    conn = get_db()
    admin_details = conn.execute("SELECT * FROM admin_details ORDER BY id DESC LIMIT 1").fetchone()
    return render_template("login.html", admin_details=admin_details)

# ---------------- REGISTER ----------------
@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        user = request.form["username"]
        pwd = request.form["password"]
        role = request.form["role"]

        with get_db() as conn:
            # Check if user already exists
            existing = conn.execute("SELECT * FROM users WHERE username=?", (user,)).fetchone()
            if existing:
                return "User already exists!"
            
            conn.execute(
                "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
                (user, pwd, role)
            )
        return redirect("/")

    return render_template("register.html")

# ---------------- ADMIN ----------------
@app.route("/admin")
def admin_dashboard():
    if session.get("role") != "admin":
        return redirect("/")
    
    conn = get_db()
    activities = conn.execute("SELECT * FROM activities ORDER BY id DESC LIMIT 15").fetchall()
    return render_template("admin_dashboard.html", activities=activities)

@app.route("/post", methods=["GET", "POST"])
def post_notification():
    if session.get("role") != "admin":
        return redirect("/")

    if request.method == "POST":
        title = request.form["title"]
        msg = request.form["message"]
        cat = request.form.get("category", "Administrative")
        urgency = request.form.get("urgency", "Medium")
        years = ",".join(request.form.getlist("years"))
        depts = ",".join(request.form.getlist("depts"))

        with get_db() as conn:
            conn.execute(
                "INSERT INTO notifications (title, message, category, urgency, target_years, target_depts) VALUES (?, ?, ?, ?, ?, ?)",
                (title, msg, cat, urgency, years, depts)
            )
        
        log_activity(session.get("username", "Admin"), "Broadcast Posted", f"Notice: {title}")
        flash("Successfully broadcasted to campus!", "success")
        return redirect("/admin")

    return render_template("post_notification.html")

# ---------------- STUDENT ----------------
@app.route("/student")
def student_dashboard():
    if session.get("role") != "student":
        return redirect("/")

    conn = get_db()
    notices = conn.execute("SELECT * FROM notifications ORDER BY id DESC").fetchall()
    # Fetch latest admin details to display on student dashboard
    admin_details = conn.execute("SELECT * FROM admin_details ORDER BY id DESC LIMIT 1").fetchone()
    return render_template("student_dashboard.html", notices=notices, admin_details=admin_details)

# ---------------- PLACEMENT HUB ----------------
@app.route("/placement")
def placement_hub():
    if session.get("role") != "admin":
        return redirect("/")
    
    conn = get_db()
    drives = conn.execute("SELECT * FROM placements ORDER BY id DESC").fetchall()
    return render_template("placement.html", drives=drives)

@app.route("/placement/add", methods=["POST"])
def add_placement():
    if session.get("role") != "admin":
        return redirect("/")
    
    company = request.form["company"]
    role = request.form["role"]
    package = request.form["package"]
    deadline = request.form["deadline"]
    status = request.form.get("status", "OPEN")

    with get_db() as conn:
        conn.execute(
            "INSERT INTO placements (company, role, package, deadline, status) VALUES (?, ?, ?, ?, ?)",
            (company, role, package, deadline, status)
        )
    
    log_activity(session.get("username", "Admin"), "Placement Added", f"{company} - {role}")
    return redirect("/placement")

@app.route("/placement/edit/<int:id>", methods=["POST"])
def edit_placement(id):
    if session.get("role") != "admin":
        return redirect("/")
    
    company = request.form["company"]
    role = request.form["role"]
    package = request.form["package"]
    deadline = request.form["deadline"]
    status = request.form["status"]

    with get_db() as conn:
        conn.execute(
            "UPDATE placements SET company=?, role=?, package=?, deadline=?, status=? WHERE id=?",
            (company, role, package, deadline, status, id)
        )
    
    log_activity(session.get("username", "Admin"), "Placement Updated", f"ID: {id}")
    return redirect("/placement")

@app.route("/placement/delete/<int:id>")
def delete_placement(id):
    if session.get("role") != "admin":
        return redirect("/")
    
    with get_db() as conn:
        conn.execute("DELETE FROM placements WHERE id=?", (id,))
    
    log_activity(session.get("username", "Admin"), "Placement Deleted", f"ID: {id}")
    return redirect("/placement")

# ---------------- ADMIN DETAILS ----------------
@app.route("/admin/details", methods=["POST"])
def save_admin_details():
    if session.get("role") != "admin":
        return redirect("/")
    
    department = request.form.get("dept", "")
    year_node = request.form.get("year", "")
    hod_context = request.form.get("hod", "")
    class_advisor = request.form.get("advisor", "")

    with get_db() as conn:
        conn.execute(
            "INSERT INTO admin_details (department, year_node, hod_context, class_advisor) VALUES (?, ?, ?, ?)",
            (department, year_node, hod_context, class_advisor)
        )
    
    log_activity(session.get("username", "Admin"), "Access Point Updated", f"Dept: {department}, Year: {year_node}")
    return redirect("/admin")

# ---------------- LOGOUT ----------------
@app.route("/logout")
def logout():
    session.clear()
    return redirect("/")

if __name__ == "__main__":
    app.run(debug=True)
