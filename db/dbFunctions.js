const inquirer = require("inquirer");
const index = require("../index");
const { query } = require("./connection");
const connection = require("./connection");

// ADD VALIDATION

class DB {
    // create functions here
    async viewDepartments() {
        await connection.query("SELECT name AS Department FROM department", (err, results) => {
            if (err) throw err;
            console.table(results);
            setTimeout(() => {
                console.log("\n", "-".repeat(80), "\n")
                index.loadPrompts();
            }, 1000)
        });
    }
    async viewEmployees() {
        let query = "CREATE TEMPORARY TABLE empInfo AS SELECT employee.id, CONCAT(first_name,' ', last_name) AS Employee, role.title AS Role, role.salary AS Salary, department.name AS Department, manager_id FROM ((employee  INNER JOIN role ON employee.role_id = role.id) INNER JOIN department ON role.department_id = department.id)"
        await connection.query(query, (err, results) => {
            if (err) throw err;
        });
        query = "CREATE TEMPORARY TABLE managers AS SELECT id , CONCAT(first_name,' ', last_name) AS Manager FROM employee where manager_id IS NULL"
        await connection.query(query, (err, results) => {
            if (err) throw err;
        });
        query = "SELECT empinfo.id, Employee, Role, Salary, Department, Manager FROM empInfo LEFT JOIN managers ON empInfo.manager_id = managers.id"
        await connection.query(query, (err, results) => {
            if (err) throw err;
            console.table(results);
            setTimeout(() => {
                console.log("\n", "-".repeat(80), "\n")
                index.loadPrompts();
            }, 1000)
        });
    }
    async viewRoles() {
        let query = "CREATE TEMPORARY TABLE roleInfo AS SELECT role.title AS Role, role.salary AS Salary, department.name AS Department FROM role INNER JOIN department ON role.department_id = department.id"
        await connection.query(query, (err, results) => {
            if (err) throw err;

        });
        query = "SELECT * FROM roleInfo"
        await connection.query(query, (err, results) => {
            if (err) throw err;
            console.table(results);
            setTimeout(() => {
                console.log("\n", "-".repeat(80), "\n")
                index.loadPrompts();
            }, 1000)
        });
    }
    addDepartment() {
        inquirer.prompt({
            type: "input",
            name: "newDept",
            message: "What new department would you like to add?"

        })
            .then(answer => {
                query = "INSERT INTO department SET ?"
                connection.query(query,
                    {
                        name: answer.newDept
                    },
                    (err, results) => {
                        if (err) throw err;
                        console.log("The department has been added!")
                        setTimeout(() => {
                            console.log("\n", "-".repeat(80), "\n")
                            index.loadPrompts();
                        }, 1000)
                    })
            });
    }

    addEmployee() {
        const roles = [];
        let query = "SELECT * FROM role"
        connection.query(query, (err, roleList) => {
            if (err) throw err
            for (var i = 0; i < roleList.length; i++) {
                roles.push(roleList[i].title)
            }
        })
        const managers = [];
        query = "SELECT CONCAT(first_name,' ', last_name) AS Manager FROM employee WHERE manager_id IS NULL"
        connection.query(query, (err, managerList) => {
            if (err) throw err
            for (var i = 0; i < managerList.length; i++) {
                managers.push(managerList[i].Manager)
            }
            managers.push("None")
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
                query = "SELECT id FROM role WHERE title = ?"
                connection.query(query, answer.role, (err, results) => {
                    if (err) throw err;
                    const roleId = results[0].id
                    const manager = answer.manager.split(" ");
                    query = "SELECT * FROM employee WHERE first_name = ? AND last_name =?"
                    connection.query(query, [manager[0], manager[1]], (err, managerResult) => {
                        if (err) throw err;
                        let managerID;
                        if (answer.manager === "None") {
                            managerID = null
                        }
                        else {
                            managerID = managerResult[0].id
                        }
                        query = "INSERT INTO employee SET ?"
                        connection.query(query,
                            {
                                first_name: answer.firstName,
                                last_name: answer.lastName,
                                role_id: roleId,
                                manager_id: managerID
                            })
                        console.log("The new employee has been added!");
                        setTimeout(() => {
                            console.log("\n", "-".repeat(80), "\n")
                            index.loadPrompts();
                        }, 1000)
                    });
                });
            });
    }

    addRole() {
        const departments = [];
        let query = "SELECT * FROM department"
        connection.query(query, (err, depList) => {
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
                query = "SELECT id FROM department WHERE name = ?"
                connection.query(query, answer.deptName, (err, results) => {
                    if (err) throw err;
                    query = "INSERT INTO role SET ?"
                    connection.query(query,
                        {
                            title: answer.title,
                            salary: answer.salary,
                            department_id: JSON.parse(results[0].id)
                        },
                        (err, res) => {
                            if (err) throw err;
                            console.log("The new role has been added!")
                            setTimeout(() => {
                                console.log("\n", "-".repeat(80), "\n")
                                index.loadPrompts();
                            }, 1000)
                        })
                })
            });
    }


    updateEmployee() {
        const employees = [];
        const roles = [];
        let query = "SELECT * FROM employee INNER JOIN role ON employee.role_id = role.id "
        connection.query(query, (err, results) => {
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
                    let query = "SELECT id FROM employee WHERE first_name = ? AND last_name =?"
                    connection.query(query, [employee[0], employee[1]], (err, employeeResult) => {
                        query = "SELECT id FROM role WHERE title = ?"
                        connection.query(query, answer.newRole, (err, results) => {
                            if (err) throw err;
                            query = "UPDATE employee SET role_id = ? WHERE id =?"
                            connection.query(query, [results[0].id, employeeResult[0].id])
                            console.log("The employee has been updated!");
                            setTimeout(() => {
                                console.log("\n", "-".repeat(80), "\n")
                                index.loadPrompts();
                            }, 1000)
                        });
                    });
                });
        });
    }

    employeesByManager() {
        const managers = [];
        let query = "CREATE TEMPORARY TABLE temp AS SELECT id , CONCAT(first_name,' ', last_name) AS Manager FROM employee where manager_id IS NULL;"
        connection.query(query, (err, results) => {
            if (err) throw err;
        })
        query = "SELECT Manager FROM temp"
        connection.query(query, (err, results) => {
            if (err) throw err;
            for (var i = 0; i < results.length; i++) {
                managers.push(results[i].Manager)
            }
            inquirer.prompt([{
                type: "list",
                name: "manager",
                message: "Which managers employees do you want to see?",
                choices: managers,
            }])
                .then(answer => {
                    const chosenManager = answer.manager;
                    console.log(chosenManager)
                    query = "SELECT id FROM temp WHERE Manager =?"
                    connection.query(query, [chosenManager], (err, managerResult) => {
                        query = "CREATE TEMPORARY TABLE temp2 AS SELECT CONCAT(first_name,' ', last_name) AS Employee, title AS Role, salary AS Salary, name AS Department FROM ((employee INNER JOIN role ON employee.role_id = role.id) INNER JOIN department ON role.department_id = department.id) WHERE manager_id = ?"
                        connection.query(query, [managerResult[0].id], (err, results) => {
                            if (err) throw err;
                            query = "SELECT * FROM temp2"
                            connection.query(query, [managerResult[0].id], (err, results) => {
                                if (err) throw err;
                                console.table(results);
                                setTimeout(() => {
                                    console.log("\n", "-".repeat(80), "\n")
                                    index.loadPrompts();
                                }, 1000)
                            });
                        });
                    });
                });
        })
    }


    deleteEmployee() {
        const employees = [];
        let query = "CREATE TEMPORARY TABLE temp AS SELECT id , CONCAT(first_name,' ', last_name) AS employee FROM employee;"
        connection.query(query, (err, results) => {
            if (err) throw err;

            query = "SELECT employee FROM temp"
            connection.query("SELECT employee FROM temp", (err, results) => {
                if (err) throw err;
                for (var i = 0; i < results.length; i++) {
                    employees.push(results[i].employee)
                }
                inquirer.prompt({
                    type: "list",
                    name: "employee",
                    message: "Which employee do you want to delete?",
                    choices: employees

                })
                    .then(answer => {
                        query = "SELECT id FROM temp WHERE Employee =?"
                        connection.query(query, answer.employee, (err, results) => {
                            if (err) throw err;
                            const empId = results[0].id
                            query = "DELETE FROM employee WHERE id =?";
                            connection.query(query, empId, (err, results) => {
                                if (err) throw err;
                                console.log("This employee has been deleted!")
                                setTimeout(() => {
                                    console.log("\n", "-".repeat(80), "\n")
                                    index.loadPrompts();
                                }, 1000)
                            })
                        });
                    });

            })

        })

    }
    deleteRole() {
        var roles = [];
        query = "SELECT role FROM roles"
        connection.query(query, (err, results) => {
            if (err) throw err;
            for (var i = 0; i < results.length; i++) {
                roles.push(results[i].role)
            }
            inquirer.prompt({
                type: "list",
                name: "role",
                message: "Which role do you want to delete?",
                choices: employees

            })
                .then(answer => {
                    query = "SELECT id FROM roles WHERE role =?"
                    connection.query(query, answer.role, (err, results) => {
                        if (err) throw err;
                        const roleID = results[0].id
                        query = "DELETE FROM employee WHERE id =?";
                        connection.query(query, roleID, (err, results) => {
                            if (err) throw err;
                            console.log("This employee has been deleted!")
                            setTimeout(() => {
                                console.log("\n", "-".repeat(80), "\n")
                                index.loadPrompts();
                            }, 1000)
                        })
                    });
                });

        })
    }

    deleteDepartment() {
        var departments = [];
        query = "SELECT name FROM department"
        connection.query(query, (err, results) => {
            if (err) throw err;
            for (var i = 0; i < results.length; i++) {
                departments.push(results[i].name)
            }
            inquirer.prompt({
                type: "list",
                name: "department",
                message: "Which department do you want to delete?",
                choices: departments

            })
                .then(answer => {
                    query = "SELECT id FROM departments WHERE name =?"
                    connection.query(query, answer.department, (err, results) => {
                        if (err) throw err;
                        const depID = results[0].id
                        query = "DELETE FROM departments WHERE id =?";
                        connection.query(query, depID, (err, results) => {
                            if (err) throw err;
                            console.log("This department has been deleted!")
                            setTimeout(() => {
                                console.log("\n", "-".repeat(80), "\n")
                                index.loadPrompts();
                            }, 1000)
                        })
                    });
                });

        })
    }



    async departmentBudget() {
        let query = "CREATE TEMPORARY TABLE depBudget AS SELECT employee.id AS Employee, role.salary AS Salary, department.name AS Department, department_id FROM ((employee  LEFT JOIN role ON employee.role_id = role.id) RIGHT JOIN department ON role.department_id = department.id);"
        await connection.query(query, (err, results) => {
            if (err) throw err;
            query = "SELECT Department, SUM(Salary), COUNT(Employee) AS NumberOfEmployees FROM depBudget GROUP BY Department;"
            await connection.query(query, (err, results) => {
                if (err) throw err;
                console.table(results);
                setTimeout(() => {
                    console.log("\n", "-".repeat(80), "\n")
                    index.loadPrompts();
                }, 1000)
            });
        });
    }
}






module.exports = new DB();