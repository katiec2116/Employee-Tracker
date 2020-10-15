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
        logoColor: 'bold-cyan',
        borderColor: 'bold-magenta'
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

            switch (answer.action) {
                case "View All Departments":
                    return DB.viewDepartments();

                case "View All Roles":
                    return DB.viewRoles();

                case "View All Employees":
                    return DB.viewEmployees();

                case "Add New Department":
                    return DB.addDepartment();

                case "Add New Role":
                    return DB.addRole();

                case "Add New Employee":
                    return DB.addEmployee();

                case "Update Employee Role":
                    return DB.updateEmployee();

                case "Update Employees Manager":
                    return DB.updateManager();

                case "View Employees by Manager":
                    return DB.employeesByManager();

                case "Delete Department":
                    return DB.deleteDepartment();

                case "Delete Role":
                    return DB.deleteRole();

                case "Delete Employee":
                    return DB.deleteEmployee();

                case "View Departments Utilized Budget":
                    return DB.departmentBudget();

                case "Exit":
                    connection.end();
            }
        })
}

init();
// function init()

module.exports.loadPrompts = loadPrompts;