const inquirer = require("inquirer");
const connection = require("./connection");


class DB {
    // create functions here
    viewDepartments() {
        connection.query("SELECT * FROM department", function (err, res) {
            if (err) throw err;
            console.table(res);
        });
    }
    viewEmployees() {
        connection.query("SELECT * FROM employee", function (err, res) {
            if (err) throw err;
            console.table(res);
        });
    }
    viewRoles() {
        connection.query("SELECT * FROM role", function (err, res) {
            if (err) throw err;
            console.table(res);
        });
    }
    addDepartment() {
        inquirer.prompt({
            type: "input",
            name: "newDept",
            message: "What new department would you like to add?"
        
        })
        .then(answer =>{
        connection.query("INSERT INTO DEPARTMENT name VALUES = ?", answer, function (err, res) {
            if (err) throw err;
            console.table(res);
        })
        });
    }
    addEmployee() {
        connection.query("INSERT INTO DEPARTMENT name VALUES ", function (err, res) {
            if (err) throw err;
            console.table(res);
        });
    }
    addRole() {
        connection.query("SELECT * FROM department", function (err, res) {
            if (err) throw err;
            console.table(res);
        });
    }
}


module.exports = new DB();