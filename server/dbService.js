// back-end that interacts with mysql
const mysql = require('mysql');
const dotenv = require('dotenv');
//const moment = require('moment');
let instance = null;
dotenv.config();

const connection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port: process.env.DB_PORT
});

connection.connect((err) => {
    if (err) {
        console.log(err.message);
    }
    // console.log('db ' + connection.state);
});


class DbService {
    static getDbServiceInstance() {
        return instance ? instance : new DbService();
    }

    async getAllData() {
    try {
        const response = await new Promise((resolve, reject) => {
            const query = "SELECT * FROM exercises;";

            connection.query(query, (err, results) => {
                if (err) reject(new Error(err.message));
                resolve(results);
            })
        });
        // console.log(response);
        return response;
    } catch (error) {
        console.log(error);
    }
}

// insert new user (Currently only prevents users from entering data already in use on the database however it will not notify them that)
async insertNewUser(username, email, password) {
    return new Promise((resolve, reject) => {
      const query = "SELECT * FROM user_info WHERE user_name = ? OR user_email = ?";
      connection.query(query, [username, email], (error, results) => {
        if (error) {
          console.error(error);
          return resolve({ success: false, message: 'An error occurred. Please try again later.' });
        }
  
        if (results.length > 0) {
          return resolve({ success: false, message: 'Username or email is already in use.' });
        } else {
          const insertQuery = "INSERT INTO user_info (user_name, user_email, user_password) VALUES (?, ?, ?)";
          connection.query(insertQuery, [username, email, password], (error, result) => {
            if (error) {
              console.error(error);
              return resolve({ success: false, message: 'An error occurred. Please try again later.' });
            }
            return resolve({ success: true, message: 'User registration successful.' });
          });
        }
      });
    });
  }

// user login
async checkLoginCredentials(username, password) {
  try {
    const query = "SELECT * FROM user_info WHERE user_name = ? AND user_password = ?";
    const rows = await new Promise((resolve, reject) => {
      connection.query(query, [username, password], (err, rows) => {
        if (err) reject(new Error(err.message));
        resolve(rows);
      });
    });
    if (rows.length === 1) {
      console.log("Login successful.");
    } else {
      console.log("Invalid username or password.");
    }
  } catch (error) {
    console.log(error);
  }
}

async insertNewName(name, sets, reps) {
    try {
      const moment = require('moment');
      const dateAdded = moment().utc().format("YYYY-MM-DD HH:mm:ss");
      const insertId = await new Promise((resolve, reject) => {
        const query = "INSERT INTO exercises (name, sets, reps, date_added) VALUES (?,?,?,?);";
  
        connection.query(query, [name, sets, reps, dateAdded], (err, result) => {
          if (err) reject(new Error(err.message));
          resolve(result.insertId);
        });
      });
      const result = await new Promise((resolve, reject) => {
        const query = "SELECT * FROM exercises WHERE id = ?;";
        connection.query(query, [insertId], (err, rows) => {
          if (err) reject(new Error(err.message));
          const formattedDate = moment.utc(rows[0].date_added).local().format("M/D/YYYY, h:mmA");
          rows[0].date_added = formattedDate;
          resolve(rows[0]);
        });
      });
      return result;
    } catch (error) {
      console.log(error);
    }
}

    async deleteRowById(id) {
        try {
            id = parseInt(id, 10); 
            const response = await new Promise((resolve, reject) => {
                const query = "DELETE FROM exercises WHERE id = ?";
    
                connection.query(query, [id] , (err, result) => {
                    if (err) reject(new Error(err.message));
                    resolve(result.affectedRows);
                })
            });
    
            return response === 1 ? true : false;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    async updateNameById(id, name, sets, reps) {
        try {
            id = parseInt(id, 10);
            let query = "UPDATE exercises SET";
            let params = [];
    
            if (name) {
                query += " name = ?,";
                params.push(name);
            }
    
            if (sets) {
                query += " sets = ?,";
                params.push(parseInt(sets, 10));
            }
    
            if (reps) {
                query += " reps = ?,";
                params.push(parseInt(reps, 10));
            }
    
            query = query.slice(0, -1); // Remove the trailing comma
            query += " WHERE id = ?";
    
            params.push(id);
    
            const response = await new Promise((resolve, reject) => {
                connection.query(query, params, (err, result) => {
                    if (err) reject(new Error(err.message));
                    resolve(result.affectedRows);
                })
            });
    
            return response === 1 ? true : false;
        } catch (error) {
            console.log(error);
            return false;
        }
    }
    

    async searchByName(name) {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = "SELECT * FROM exercises WHERE name LIKE ?;";
                const partialName = `%${name}%`;
    
                connection.query(query, [partialName], (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                })
            });
    
            return response;
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = DbService;