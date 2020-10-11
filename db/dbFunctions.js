const inquirer = require("inquirer");
const connection = require("./connection");


class DB {
    // create functions here
    viewDepartments() {
        connection.query("SELECT * FROM department", function (err, results) {
            if (err) throw err;
            console.table(results);
        });
    }
    viewEmployees() {
        connection.query("SELECT * FROM employee", function (err, results) {
            if (err) throw err;
            console.table(results);
        });
    }
    viewRoles() {
        connection.query("SELECT * FROM role", function (err, results) {
            if (err) throw err;
            console.table(results);
        });
    }
    addDepartment() {
        inquirer.prompt({
            type: "input",
            name: "newDept",
            message: "What new department would you like to add?"

        })
            .then(answer => {
                connection.query("INSERT INTO department SET ?",
                    {
                        name: answer.newDept
                    },
                    function (err, results) {
                        if (err) throw err;
                    })
            });
    }

    addEmployee() {
        
        inquirer.prompt([{
            type: "input",
            name: "firstName",
            message: "What is the employee's first name?"

        },
        {
            type: "input",
            name: "lastName",
            message: "What is the employee's last name?"
        },
        {
            type: "list",
            name: "role",
            message: "What is the employee's role?" + roles,
            choices: roles
        },
        {
            type: "list",
            name: "manager",
            message: "Who is the employee's manager?",
            choices: managers
        }])
            

    }
    addRole() {
        
        inquirer.prompt([{
            type: "input",
            name: "title",
            message: "What is the title?"

        },
        {
            type: "input",
            name: "salary",
            message: "What is the salary?"

        },
        {
            type: "list",
            name: "deptName",
            message: "What department will the role be under?",
            choices: departments

        }])
            
    }
}


module.exports = new DB();