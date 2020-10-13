const inquirer = require("inquirer");
const index = require("../index");
const { query } = require("./connection");
const connection = require("./connection");



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
    viewRoles() {
        let query = "CREATE TEMPORARY TABLE roleInfo AS SELECT role.title AS Role, role.salary AS Salary, department.name AS Department FROM role INNER JOIN department ON role.department_id = department.id"
        connection.query(query, (err, results) => {
            if (err) throw err;

        });
        query = "SELECT * FROM roleInfo"
        connection.query(query, (err, results) => {
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






module.exports = new DB();