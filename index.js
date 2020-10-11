// require statements
const inquirer = require("inquirer");
const mysql = require("mysql");
const DB = require("./db/dbFunctions.js")

init();
// function init()

function init() {
    // load prompts
    loadPrompts();
}

function loadPrompts() {
    inquirer.prompt([
        {
            type: "list",
            name: "action",
            message: "What would you like to do?",
            choices: ["View All Departments", "View All Employees", "View All Roles", "Add New Department", "Add  New Employee", "Add New Role", "Update Employee Role"]
        }])

        .then(answer=> {

            switch (answer.action) {
                case "View All Departments":
                    return DB.viewDepartments();

                case "View All Employees":
                    return DB.viewEmployees();

                case "View All Roles":
                    return DB.viewRoles();

                case "Add New Department":
                    return addDepartment();

                case "Add New Employee":
                    return addEmployee();

                case "Add New Role":
                    return addRole();

                case "Update Employee Role":
                    return updateEmployee();
            }
        })}
