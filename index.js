// require statements
const inquirer = require("inquirer");
const connection = require("./db/connection.js");
const DB = require("./db/dbFunctions.js")

const init = () => {
    // load prompts
    loadPrompts();
}

function loadPrompts(){
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
                    return DB.updateManager();

                case "View Employees by Manager":
                    return DB.employeesByManager();

                case "Delete Department":
                    return DB.deleteDepartment();

                case "Delete Employee":
                    return DB.deleteEmployee();

                case "Delete Role":
                    return DB.deleteRole();

                case "Exit":
                    connection.end();
            }
        })
}

init();
// function init()

module.exports.loadPrompts = loadPrompts;