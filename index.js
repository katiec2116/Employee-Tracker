// require statements
const inquirer = require("inquirer");
const { exit } = require("process");
const DB = require("./db/dbFunctions.js")

const init = () => {
    // load prompts
    loadPrompts();
}

const loadPrompts = () => {
    inquirer.prompt([
        {
            type: "list",
            name: "action",
            message: "What would you like to do?",
            choices: ["View All Departments", "View All Employees", "View All Roles", "Add New Department", "Add New Employee", "Add New Role", "Update Employee Role", "Update Employees Manager", "View Employees by Manager", "Delete Department", "Delete Employee", "Delete Role", "Exit"]
        }])

        .then(answer => {

            switch (answer.action) {
                case "View All Departments":
                    return DB.viewDepartments();

                case "View All Employees":
                    return DB.viewEmployees();

                case "View All Roles":
                    return DB.viewRoles();

                case "Add New Department":
                    return DB.addDepartment();

                case "Add New Employee":
                    return DB.addEmployee();

                case "Add New Role":
                    return DB.addRole();

                case "Update Employee Role":
                    return DB.updateEmployee();

                case "Update Employees Manager":
                    return DB.updateEmployee();

                case "View Employees by Manager":
                    return DB.updateEmployee();

                case "Delete Department":
                    return DB.updateEmployee();

                case "Delete Employee":
                    return DB.updateEmployee();

                case "Delete Role":
                    return DB.updateEmployee();

                case "Exit":
                    exit();
            }
        })
}

init();
// function init()

module.exports = loadPrompts;