const inquirer = require("inquirer");
const index = require("../index");
const { query } = require("./connection");
const connection = require("./connection");



class DB {
    // display all departments
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
        // drop temp tables if exist
        connection.query("DROP TABLE IF EXISTS empInfo;", (err, results) => {
            if (err) throw err;
        });
        connection.query("DROP TABLE IF EXISTS managers;", (err, results) => {
            if (err) throw err;
        });
        // create temp tabel to hold join results
        let query = "CREATE TEMPORARY TABLE empInfo AS SELECT employee.id, CONCAT(first_name,' ', last_name) AS Employee, role.title AS Role, role.salary AS Salary, department.name AS Department, manager_id FROM ((employee  INNER JOIN role ON employee.role_id = role.id) INNER JOIN department ON role.department_id = department.id)"
        await connection.query(query, (err, results) => {
            if (err) throw err;
        });
        query = "CREATE TEMPORARY TABLE managers AS SELECT id , CONCAT(first_name,' ', last_name) AS Manager FROM employee where manager_id IS NULL"
        await connection.query(query, (err, results) => {
            if (err) throw err;
        });
        // display all relevant information for each employee
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
        // drop temp table if exists
        await connection.query("DROP TABLE IF EXISTS roleInfo;", (err, results) => {
            if (err) throw err;
        });
        // create temp table to hold join results
        let query = "CREATE TEMPORARY TABLE roleInfo AS SELECT role.title AS Role, role.salary AS Salary, department.name AS Department FROM role INNER JOIN department ON role.department_id = department.id"
        await connection.query(query, (err, results) => {
            if (err) throw err;

        });
        // display each role with department and salary
        query = "SELECT * FROM roleInfo ORDER BY Salary DESC"
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
            message: "What new department would you like to add?",
            validate: answer => {
                if (answer !== "") {
                    return true;
                }
                return "Please enter a department"
            }
        })
            .then(answer => {
                // add new department into database
                const query = "INSERT INTO department SET ?"
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
        // push roles to a list to become options
        connection.query(query, (err, roleList) => {
            if (err) throw err
            for (var i = 0; i < roleList.length; i++) {
                roles.push(roleList[i].title)
            }
        })
        const managers = [];
        // push managers to a list to become options
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
            message: "What is the employee's first name?",
            validate: answer => {
                if (answer !== "") {
                    return true;
                }
                return "Please enter a first name"
            }
        },
        {
            type: "input",
            name: "lastName",
            message: "What is the employee's last name?",
            validate: answer => {
                if (answer !== "") {
                    return true;
                }
                return "Please enter a last name"
            }
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
                // push roles to a list to become options
                query = "SELECT id FROM role WHERE title = ?"
                connection.query(query, answer.role, (err, results) => {
                    if (err) throw err;
                    const roleId = results[0].id
                    // spilt joined manager values from before to pull the id
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
                        // add new employee to the database
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
        // push departments to a list to become options
        let query = "SELECT * FROM department"
        connection.query(query, (err, depList) => {
            if (err) throw err
            for (var i = 0; i < depList.length; i++) {
                departments.push(depList[i].name)
            }
        inquirer.prompt([{
            type: "list",
            name: "deptName",
            message: "What department will the role be under?",
            choices: departments
        },
        {
            type: "input",
            name: "title",
            message: "What is the title?",
            validate: answer => {
                if (answer !== "") {
                    return true;
                }
                return "Please enter a title"
            }

        },
        {
            type: "input",
            name: "salary",
            message: "What is the salary?",
            validate: answer => {
                if (answer !== "" && answer >= 0) {
                    return true;
                }
                return "Please enter a salary"
            }
        }])
            .then(answer => {
                query = "SELECT id FROM department WHERE name = ?"
                connection.query(query, answer.deptName, (err, results) => {
                    if (err) throw err;
                    // add new role to the database
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
                })
            });
    }


    updateEmployee() {
        const employees = [];
        const roles = [];
        // push roles to a list to become options
        let query = "SELECT title FROM role"
        connection.query(query, (err, results) => {
            if (err) throw err;
            for (var i = 0; i < results.length; i++) {
                roles.push(results[i].title)
            }
        });
        // push employees to a list to become options
        query = "SELECT CONCAT(first_name,' ', last_name) AS Employee, title FROM employee INNER JOIN role ON employee.role_id = role.id "
        connection.query(query, (err, results) => {
            if (err) throw err;
            for (var i = 0; i < results.length; i++) {
                employees.push(results[i].Employee + " " + "is currently:" + " " + results[i].title)
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
                    // grab id from split employee value
                    let query = "SELECT id FROM employee WHERE first_name = ? AND last_name =?"
                    connection.query(query, [employee[0], employee[1]], (err, employeeResult) => {
                        query = "SELECT id FROM role WHERE title = ?"
                        // get their role
                        connection.query(query, answer.newRole, (err, results) => {
                            if (err) throw err;
                            // update to a new chosen role
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
        // drop temp table
        connection.query("DROP TABLE IF EXISTS temp;", (err, results) => {
            if (err) throw err;
        });
        let query = "CREATE TEMPORARY TABLE temp AS SELECT id , CONCAT(first_name,' ', last_name) AS Manager FROM employee where manager_id IS NULL;"
        connection.query(query, (err, results) => {
            if (err) throw err;
        })
        // push managers to a list to become options
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
                    connection.query("DROP TABLE IF EXISTS temp2;", (err, results) => {
                        if (err) throw err;
                    });
                    const chosenManager = answer.manager;
                    console.log(chosenManager)
                    query = "SELECT id FROM temp WHERE Manager =?"
                    // create temp tbael to hold joined results
                    connection.query(query, [chosenManager], (err, managerResult) => {
                        query = "CREATE TEMPORARY TABLE temp2 AS SELECT CONCAT(first_name,' ', last_name) AS Employee, title AS Role, salary AS Salary, name AS Department FROM ((employee INNER JOIN role ON employee.role_id = role.id) INNER JOIN department ON role.department_id = department.id) WHERE manager_id = ?"
                        connection.query(query, [managerResult[0].id], (err, results) => {
                            if (err) throw err;
                            query = "SELECT * FROM temp2"
                            // display employees who have the chosen manager
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
        connection.query("DROP TABLE IF EXISTS temp;", (err, results) => {
            if (err) throw err;
        });
        let query = "CREATE TEMPORARY TABLE temp AS SELECT id , CONCAT(first_name,' ', last_name) AS employee FROM employee;"
        connection.query(query, (err, results) => {
            if (err) throw err;
            // push employees to a list to become options
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
                            // grab ID
                            const empId = results[0].id
                            // delete record with mathcign ID
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
        const roles = [];
        let query = "SELECT title FROM role"
        // push roles to a list to become options
        connection.query(query, (err, results) => {
            if (err) throw err;
            for (var i = 0; i < results.length; i++) {
                roles.push(results[i].title)
                console.log(roles)
            }
            inquirer.prompt({
                type: "list",
                name: "role",
                message: "Which role do you want to delete?",
                choices: roles

            })
                .then(answer => {
                    query = "SELECT id FROM role WHERE title =?"
                    connection.query(query, answer.role, (err, results) => {
                        if (err) throw err;
                        // grab ID
                        const roleID = results[0].id
                        // delete record with matching ID
                        query = "DELETE FROM role WHERE id =?";
                        connection.query(query, roleID, (err, results) => {
                            if (err) throw err;
                            console.log("This role has been deleted!")
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
        let query = "SELECT name FROM department"
        // push departments to a list to become options
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
                    query = "SELECT id FROM department WHERE name =?"
                    connection.query(query, answer.department, (err, results) => {
                        if (err) throw err;
                        // grab ID
                        const depID = results[0].id
                        // delete record with matching ID
                        query = "DELETE FROM department WHERE id =?";
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
        await connection.query("DROP TABLE IF EXISTS depBudget;", (err, results) => {
            if (err) throw err;
        });
        // create temp table to hold joined results
        let query = "CREATE TEMPORARY TABLE depBudget AS SELECT employee.id AS Employee, role.salary AS Salary, department.name AS Department, department_id FROM ((employee  LEFT JOIN role ON employee.role_id = role.id) RIGHT JOIN department ON role.department_id = department.id);"
        await connection.query(query, (err, results) => {
            if (err) throw err;
            // sum salaries within each department
            query = "SELECT Department, SUM(Salary), COUNT(Employee) AS NumberOfEmployees FROM depBudget GROUP BY Department;"
            connection.query(query, (err, results) => {
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