const urlParams = new URLSearchParams(window.location.search);
const userId = Number(urlParams.get("id"));

let takeAttendance3 = document.getElementById('takeAttendance3');
let dismise = document.getElementById('dismise');
let registerFormDiv = document.getElementById('registerFormDiv');

import {tog} from './toggle.js';

takeAttendance3.addEventListener('click', ()=>{
    tog(registerFormDiv)
})

dismise.addEventListener('click', function(){
    tog(registerFormDiv)
})

let db;

import { DB_NAME, DB_VERSION } from './app.js';

const request = indexedDB.open(DB_NAME, DB_VERSION);

request.onupgradeneeded = (event) =>{
    db = event.target.result;
}

request.onerror = () =>{
    console.log('Error opening attendance3 database')
}

request.onsuccess = (event) =>{
    db = event.target.result;
    displayCheckbox();
    classNameDisplay();
    renderCombinedAttendance3();
}

  //Add time and date
function getCurrentData(){
    const now = new Date();
    return now.toISOString().split("T")[0]; //E.g "2025-06-16"
}

function getCurrentTime() {
    const now = new Date();
    return now.toLocaleDateString(); //e.g '09-45-23 AM
}

function displayCheckbox(){
    let transaction = db.transaction('students', 'readonly');
    let studentStore = transaction.objectStore('students');

    let container = document.getElementById('checkboxContainer');
    container.innerHTML = ''; //clear

    studentStore.openCursor().onsuccess = function(event){
        let cursor = event.target.result;
        if(cursor){
            let student = cursor.value;

            if(userId === student.classID){
            let label = document.createElement('label');
            let checkbox = document.createElement('input');
            checkbox.type = "checkbox";
            checkbox.value = student.id;
            checkbox.name = "studentCheckbox";

            label.appendChild(checkbox);

            let studentName = `${student.firstName} ${student.surName}`

            label.appendChild(document.createTextNode(studentName));
            container.appendChild(label);

            container.appendChild(document.createElement("br"));
            }
            cursor.continue();
        }
    }
}

//Add to Attendance3
document.getElementById('submitAttendance3').addEventListener('click', function(){
    let checkboxes = document.querySelectorAll("input[name='studentCheckbox']:checked");

    let transaction = db.transaction("attendance3", "readwrite");
    let store = transaction.objectStore("attendance3");

    checkboxes.forEach((checkbox)=> {
        let studentID = parseInt(checkbox.value);

        const date = getCurrentData();
        const time = getCurrentTime();

        //Save student ID into selectedStudents store
        store.add({studentID: parseInt(studentID), classID: parseInt(userId),
            date: date, status: "Present", time: time});
            console.log(`${time} ${date}`)

            transaction.onsuccess = () => {
                alert("Selected student present")
            }

            transaction.onerror = () =>{
                alert("Failed to save present")
            }
    })
})

function classNameDisplay(){
    let transaction = db.transaction('classes', 'readonly');
    let studentName = transaction.objectStore('classes');

    studentName.openCursor().onsuccess = (event)=>{
        const cursor = event.target.result;

        if(cursor){
            let result = cursor.value;
           
            if(result.id === userId){
            console.log(result.className)
            let classesName = document.getElementById('selectedClassName');
            classesName.textContent = `${result.className}`;
            }
            cursor.continue();
        }
    }
}

function renderCombinedAttendance3() {
    const tableBody = document.querySelector('#attendance3Combined tbody');
    tableBody.innerHTML = '';

    const tx = db.transaction(['students', 'attendance3'], 'readonly');
    const studentStore = tx.objectStore('students');
    const attendance3Store = tx.objectStore('attendance3');

    const today = new Date().toISOString().split('T')[0];
    const presentMap = new Map();
    const allStudents = [];

    // Step 1: Collect today's attendance3
    attendance3Store.openCursor().onsuccess = function(event) {
        const cursor = event.target.result;
        if (cursor) {
            const record = cursor.value;
            if (record.date === today) {
                presentMap.set(record.studentID, record.status);  // studentID => status ("Present")
            }
            cursor.continue();
        } else {
            // Step 2: Get all students
            studentStore.openCursor().onsuccess = function(event) {
                const cursor = event.target.result;
                if (cursor) {
                    allStudents.push(cursor.value);
                    cursor.continue();
                } else {
                    // Step 3: Merge data and render
                    allStudents.sort((a, b) => a.firstName.localeCompare(b.firstName)); // optional: sort alphabetically
                    allStudents.forEach(student => {

                        if(student.classID === userId){
                        const row = document.createElement('tr');

                        const nameCell = document.createElement('td');
                        nameCell.textContent = `${student.firstName} ${student.surName}`;
                        row.appendChild(nameCell);

                        const dateCell = document.createElement('td');
                        dateCell.textContent = today;
                        row.appendChild(dateCell);

                        const statusCell = document.createElement('td');
                        if (presentMap.has(student.id)) {
                            statusCell.textContent = "Present";
                            statusCell.style.color = "green";
                        } else {
                            statusCell.textContent = "Absent";
                            statusCell.style.color = "red";
                        }
                        row.appendChild(statusCell);

                        tableBody.appendChild(row);
                    }
                    });
                }
            };
        }
    };
}
