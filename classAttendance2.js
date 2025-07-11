const urlParams = new URLSearchParams(window.location.search);
const userId = Number(urlParams.get("id"));

let takeAttendance2 = document.getElementById('takeAttendance2');
let dismise = document.getElementById('dismise');
let registerFormDiv = document.getElementById('registerFormDiv');

import {tog} from './toggle.js';

takeAttendance2.addEventListener('click', ()=>{
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
    console.log('Error opening attendance2 database')
}

request.onsuccess = (event) =>{
    db = event.target.result;
    displayCheckbox();
    classNameDisplay();
    renderCombinedAttendance2();
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

//Add to Attendance2
//Add to Attendance2
document.getElementById('submitAttendance2').addEventListener('click', function () {
    const checkboxes = document.querySelectorAll("input[name='studentCheckbox']:checked");

    if (checkboxes.length === 0) {
        alert("No students selected.");
        return;
    }

    // Step 1: Get latest studentsID from studentsStore
    const studentsTx = db.transaction("students", "readonly");
    const studentsStore = studentsTx.objectStore("students");
    const studentsRequest = studentsStore.openCursor(null, 'prev'); // get latest students (assuming students ID is auto-incremented)

    studentsRequest.onsuccess = function (event) {
        const cursor = event.target.result;
        if (!cursor) {
            alert("No students available. Please create a students first.");
            return;
        }

        const studentsID = cursor.value.studentsID; // or adjust if field name is different
        console.log(cursor.value.sessionID)

        // Step 2: Proceed to save attendance2
        const attendance2Tx = db.transaction("attendance2", "readwrite");
        const attendance2Store = attendance2Tx.objectStore("attendance2");

        const date = getCurrentData();
        const time = getCurrentTime();

        checkboxes.forEach((checkbox) => {
            const studentID = parseInt(checkbox.value);

            const attendance2Record = {
                studentID: studentID,
                classID: parseInt(userId),
                date: date,
                time: time,
                status: "Present",
                sessionID: cursor.value.sessionID // Added studentsID here
            };

            attendance2Store.add(attendance2Record);
        });

        attendance2Tx.oncomplete = () => {
            alert("Attendance2 recorded with students ID: " + cursor.value.sessionID);
        };

        attendance2Tx.onerror = () => {
            alert("Failed to record attendance2.");
        };
    };

    studentsRequest.onerror = function () {
        alert("Error retrieving students ID.");
    };
});

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

function renderCombinedAttendance2() {
    const tableBody = document.querySelector('#attendance2Combined tbody');
    tableBody.innerHTML = '';

    const tx = db.transaction(['students', 'attendance2'], 'readonly');
    const studentStore = tx.objectStore('students');
    const attendance2Store = tx.objectStore('attendance2');

    const today = new Date().toISOString().split('T')[0];
    const presentMap = new Map();
    const allStudents = [];

    // Step 1: Collect today's attendance2
    attendance2Store.openCursor().onsuccess = function(event) {
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


