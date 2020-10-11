const inquirer = require("inquirer");
const connection = require("./connection");


class DB {
    // create functions here
    viewDepartments() {
        connection.query("SELECT * FROM department", (err, results) => {
            if (err) throw err;
            console.table(results);
        });
    }
    viewEmployees() {
        connection.query("SELECT * FROM employee", (err, results) => {
            if (err) throw err;
            console.table(results);
        });
    }
    viewRoles() {
        connection.query("SELECT * FROM role", (err, results) => {
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
                    (err, results) => {
                        if (err) throw err;
                    })
            });
    }

    addEmployee() {
        const roles = [];
        connection.query("SELECT * FROM role", (err, roleList) => {
            if (err) throw err
            for (var i = 0; i < roleList.length; i++) {
                roles.push(roleList[i].title)
            }
        })
        const managers = [];
        connection.query("SELECT first_name, last_name FROM employee WHERE manager_id IS NULL", (err, managerList) => {
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
            message: "What is the employee's role?",
            choices: roles
        },
        {
            type: "list",
            name: "manager",
            message: "Who is the employee's manager?",
            choices: managers
        }])
            .then(answer => {
                connection.query("SELECT id FROM role WHERE title = ?", answer.role, (err, results) => {
                    if (err) throw err;
                    const roleId = results[0].id
                    const manager = answer.manager.split(" ");
                    connection.query("SELECT * FROM employee WHERE first_name = ? AND last_name =?", [manager[0], manager[1]], (err, managerResult) => {
                        if (err) throw err;
                        connection.query("INSERT INTO employee SET ?",
                            {
                                first_name: answer.firstName,
                                last_name: answer.lastName,
                                role_id: roleId,
                                manager_id: managerResult[0].id
                            })
                    });
                });

            });

    }
    addRole() {
        const departments = [];
        connection.query("SELECT * FROM department", (err, depList) => {
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
            .then(answer => {
                connection.query("SELECT id FROM department WHERE name = ?", answer.deptName, (err, results) => {
                    if (err) throw err;
                    connection.query("INSERT INTO role SET ?",
                        {
                            title: answer.title,
                            salary: answer.salary,
                            department_id: JSON.parse(results[0].id)
                        },
                        (err, res) => {
                            if (err) throw err;
                        })
                })
            });
    }


    updateEmployee() {
        const employees = [];
        const roles = [];
        connection.query("SELECT * FROM employee INNER JOIN role ON employee.role_id = role.id ", (err, results) => {
            if (err) throw err;
            for (var i = 0; i < results.length; i++) {
                employees.push(results[i].first_name + " " + results[i].last_name)
            }
            for (var i = 0; i < results.length; i++) {
                roles.push(results[i].title)
            }
            inquirer.prompt([{
                type: "list",
                name: "employee",
                message: "Which employee do you want to update?",
                choices: employees,
            },
            {
                type: "list",
                name: "newRole",
                message: "Which role do you want to give them?",
                choices: roles,
            }])

                .then(answer => {
                    const employee = answer.employee.split(" ");
                    connection.query("SELECT id FROM employee WHERE first_name = ? AND last_name =?", [employee[0], employee[1]], (err, employeeResult) => {

                        connection.query("SELECT id FROM role WHERE title = ?", answer.newRole, (err, results) => {
                            if (err) throw err;
                            connection.query("UPDATE employee SET role_id = ? WHERE id =?", [results[0].id, employeeResult[0].id]
                            )
                        }

                        )

                    })
                })
        })

    }

   
    // pullManagers() {
    //     const managers = [];
    //     connection.query("SELECT first_name, last_name FROM employee WHERE manager_id IS NULL", (err, managerList) => {
    //         if (err) throw err
    //         for (var i = 0; i < managerList.length; i++) {
    //             managers.push(managerList[i].first_name + " " + managerList[i].last_name)
    //         }
    //         console.log(managers)
    //         return managers
    //     })
    // }

}


module.exports = new DB();