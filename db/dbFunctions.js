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
        const roles = [];
        connection.query("SELECT * FROM role", function (err, roleList) {
            if (err) throw err
            for (var i = 0; i < roleList.length; i++) {
                roles.push(roleList[i].title)
            }
        })
        const managers = [];
        connection.query("SELECT first_name, last_name FROM employee WHERE manager_id IS NULL", function (err, managerList) {
            if (err) throw err
            for (var i = 0; i < managerList.length; i++) {
                managers.push(managerList[i].first_name + " " + managerList[i].last_name)
            }
        })
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
        const departments = [];
        connection.query("SELECT * FROM department", function (err, depList) {
            if (err) throw err
            for (var i = 0; i < depList.length; i++) {
                departments.push(depList[i].name)
            }
        })
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