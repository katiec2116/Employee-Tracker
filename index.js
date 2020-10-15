// require statements
const inquirer = require("inquirer");
const connection = require("./db/connection.js");
const DB = require("./db/dbFunctions.js");
const logo = require("asciiart-logo");
const chalk = require('chalk');

const init = () => {
    const logoText = logo({
        name: "Employee Manager",
        padding: 2,
        margin: 3,
        logoColor: 'cyan',
        borderColor: 'magenta'
    }).render();
    console.log(logoText)
    setTimeout(() => {
        console.log("\n")
        loadPrompts();
    }, 1000)
}



function loadPrompts() {
    inquirer.prompt([
        {
            type: "list",
            name: "action",
            message: "What would you like to do?",
            choices: [chalk.cyan("View All Departments"), chalk.cyan("View All Roles"), chalk.cyan("View All Employees"), chalk.magenta("Add New Department"), chalk.magenta("Add New Role"), chalk.magenta("Add New Employee"), chalk.yellow("Update Employee Role"), chalk.yellow("Update Employees Manager"),  chalk.blue("Delete Department"), chalk.blue("Delete Role"), chalk.blue("Delete Employee"), chalk.white("View Employees by Manager"), chalk.white("View Departments Utilized Budget"), chalk.red("Exit")]
        }])

        .then(answer => {
            console.log(answer.action)

            switch (answer.action) {
                case chalk.cyan("View All Departments"):
                    return DB.viewDepartments();

                case chalk.cyan("View All Roles"):
                    return DB.viewRoles();

                case chalk.cyan("View All Employees"):
                    return DB.viewEmployees();

                case chalk.magenta("Add New Department"):
                    return DB.addDepartment();

                case chalk.magenta("Add New Role"):
                    return DB.addRole();

                case chalk.magenta("Add New Employee"):
                    return DB.addEmployee();

                case chalk.yellow("Update Employee Role"):
                    return DB.updateEmployee();

                case chalk.yellow("Update Employees Manager"):
                    return DB.updateManager();

                case chalk.white("View Employees by Manager"):
                    return DB.employeesByManager();

                case chalk.blue("Delete Department"):
                    return DB.deleteDepartment();

                case chalk.blue("Delete Role"):
                    return DB.deleteRole();

                case chalk.blue("Delete Employee"):
                    return DB.deleteEmployee();

                case chalk.white("View Departments Utilized Budget"):
                    return DB.departmentBudget();

                case chalk.red("Exit"):
                    connection.end();
            }
        })
}

init();
// function init()
        
module.exports.loadPrompts = loadPrompts;