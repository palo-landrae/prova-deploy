from flask import Flask, render_template, request, json, jsonify, url_for, redirect
from flask_cors import CORS, cross_origin
import pymssql
import pandas as pd
import gpd

app = Flask(__name__, static_url_path='/static')
url = "https://cycle-path-finder.herokuapp.com"
# connessione al database
conn = pymssql.connect(
    server="213.140.22.237\SQLEXPRESS",
    user="palo.loui",
    password="xxx123##",
    database="palo.loui",
)

cursor = conn.cursor()

query = '''
IF NOT EXISTS (
  SELECT *
  FROM INFORMATION_SCHEMA.TABLES
  WHERE TABLE_SCHEMA = 'cyclepathfinder' AND TABLE_NAME = 'users') 
BEGIN 
	CREATE TABLE cyclepathfinder.users (
		UserId int IDENTITY(1, 1) PRIMARY KEY,
		UserName varchar(255) NOT NULL,
		UserPassword varchar(255) NOT NULL,
	);
END
'''
cursor.execute(query)
conn.commit()

cors = CORS(app)

@app.route(f"{url}/")
@cross_origin()
def home():
    return redirect(url_for('login'))

@app.route('/cycle-path-finder')
def cyclepathfinder():
    return render_template('index.html')

@app.route("/login", methods=["POST", "GET"])
def login():
    msg = ""
    # Check if "username" and "password" POST requests exist (user submitted form)
    if (request.method == "POST" and "username" in request.form and "password" in request.form):
      # Create variables for easy access
      username = request.form["username"]
      password = request.form["password"]
      
      query = ("SELECT UserName, UserPassword FROM cyclepathfinder.users WHERE UserName = '%s' AND UserPassword = '%s'" % (username,password,))
      current_user = pd.read_sql_query(query, conn)
      if not current_user.empty:
        return redirect(url_for('cyclepathfinder'))
      else:
        return render_template("login.html", msg='User not found')
    else:
      return render_template("login.html", msg='')

@app.route("/register", methods=["POST", "GET"])
def register():
    if (request.method == "POST" and "username" in request.form and "password" in request.form):
          # Create variables for easy access
      username = request.form["username"]
      password = request.form["password"]
      
      query = ("SELECT UserName, UserPassword FROM cyclepathfinder.users WHERE UserName = '%s'" % (username,))
      current_user = pd.read_sql_query(query, conn)

      if current_user.empty:
        query = "INSERT INTO cyclepathfinder.users (UserName, UserPassword) VALUES ('%s', '%s');" % (username,password)
        cursor.execute(query)
        conn.commit()
        return render_template('login.html')
      else:
        return render_template('register.html', msg = 'User exist')
    else:
      return render_template('register.html', msg = '')

@app.route('/_get_post_json/', methods=['POST'])
def get_post_json():
    data = request.get_json()
    gpd.update_json(data)
    return jsonify(state='success', data=data)

if __name__ == "__setup__":
    app.run(host='localhost', port=5000)
