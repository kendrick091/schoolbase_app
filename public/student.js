let addStudent = document.getElementById('addStudent');
let dismise = document.getElementById('dismise');
let toggleFormAddForm = document.getElementById('toggleFormAddForm');

import {tog} from './toggle.js';

addStudent.addEventListener('click', function(){
    tog(toggleFormAddForm)
})
dismise.addEventListener('click', function(){
    tog(toggleFormAddForm)
})

let db;
import { DB_NAME,DB_VERSION } from './app.js';

const request = indexedDB.open(DB_NAME, DB_VERSION);

request.onupgradeneeded = (event)=>{
    db = event.target.result;
}

//SUCCESS
request.onsuccess = (event)=>{
    db = event.target.result;
    console.log('StudentDB opened')
    displayData();
    loadSelectData();
}

request.onerror = (event)=>{
    console.log('Error', event.target.result);
}

document.getElementById("formInput").addEventListener("submit", function(e){
    e.preventDefault();
    if(!db){
        alert("DataBase not ready");
        return;
    }
    //RANDOM NUMBER
    // const num = Math.floor(Math.random() * 999) + 1;
    const firstNameInput = document.getElementById('firstNameInput').value;
    const surNameInput = document.getElementById('surNameInput').value;
    const otherNameInput = document.getElementById('otherNameInput').value;
    const phoneNumberInput = document.getElementById('phoneNumberInput').value;
    const selectGender = document.getElementById('selectGender').value;
    const selectClass = parseInt(document.getElementById('selectClass').value);

    const transaction = db.transaction("students", "readwrite");
    const store = transaction.objectStore("students");

    if(!selectGender){
        alert("Gender should not be empty!")
    }else{
    const data = { 
        firstName: firstNameInput, 
        surName: surNameInput, 
        otherName:  otherNameInput,
        phoneNumber: phoneNumberInput,
        gender: selectGender,
        classID: selectClass,
        sessionID: ''
    }

    const addInput = store.add(data);

    addInput.onsuccess = function(){
        console.log("Student Added to DB successfully!");
        location.reload()
    }

    addInput.onerror = function(){
        alert("Error adding Student");
    }
}
})

//load into select tag
function loadSelectData(){
    const tx = db.transaction('classes', 'readonly');
    const store = tx.objectStore('classes');

    store.openCursor().onsuccess = function(event){
        
        const cursor = event.target.result;
        if(cursor){
        const option = document.createElement('option');
        option.value = cursor.value.id;
        option.textContent = cursor.value.className;

        document.getElementById('selectClass').appendChild(option);
        cursor.continue();
    }
}
}

//Table code
function displayData(){
    let transaction = db.transaction(['students'], 'readonly');
    let objectStore = transaction.objectStore('students');
    const studentRequest = objectStore.getAll();

studentRequest.onsuccess = function(){
    const students = studentRequest.result;

    // Sort alphabetically by firstName
        students.sort((a, b) => a.firstName.localeCompare(b.firstName));

    let StudentTable = document.querySelector('#student-table tbody');
    StudentTable.innerHTML = '';
    
    
    students.forEach((student) =>{
            const row =  document.createElement('tr');

            const cellID = document.createElement('td');
            cellID.textContent = student.id;
            row.appendChild(cellID);

            //Editable firstname
            const cellFirstName = document.createElement('td');
            const editFirstName = document.createElement('input');
            editFirstName.value = student.firstName;
            cellFirstName.appendChild(editFirstName);

            row.appendChild(cellFirstName);

            //Editable Second NAME
            const cellSurName = document.createElement('td');
            const editSurName = document.createElement('input');
            editSurName.value = student.surName;
            cellSurName.appendChild(editSurName);

            row.appendChild(cellSurName);

            //Editable OTHER name
            const cellOtherName = document.createElement('td');
            const editOtherName = document.createElement('input');
            editOtherName.value = student.otherName;
            cellOtherName.appendChild(editOtherName);

            row.appendChild(cellOtherName);

            //Editable phone No.
            const cellPhoneNumber = document.createElement('td');
            const editPhoneNumber = document.createElement('input');
            editPhoneNumber.value = student.phoneNumber;
            cellPhoneNumber.appendChild(editPhoneNumber);

            row.appendChild(cellPhoneNumber);

            //AddBtn
            const cellAction = document.createElement('td');
            const editBtn = document.createElement('button');
            editBtn.textContent = "Edit";

            editBtn.onclick = function(){
                let updateStudent = {
                    id: student.id,
                    firstName: editFirstName.value,
                    surName: editSurName.value,
                    otherName: editOtherName.value,
                    phoneNumber: editPhoneNumber.value,
                    gender: student.gender,
                    classID: student.classID,
                    sessionID: student.sessionID
                };

                const studentUpdate = db.transaction('students', 'readwrite');
                const store = studentUpdate.objectStore('students');
                const updateRequest = store.put(updateStudent);

                updateRequest.onsuccess = function(){
                    alert('Student updated')
                    console.log('Student updated')
                }
                updateRequest.onerror = function(){
                    console.log('failed to update Student')
                }
            }
            cellAction.appendChild(editBtn);

            const cellInfo = document.createElement('button');
            cellInfo.textContent = 'Info';
            cellInfo.style.background = 'green';

            cellInfo.onclick = function(){
                window.location.href = `studentInfo.html?id=${student.id}`;
            }

            cellAction.appendChild(cellInfo);

            //DeleteBtn
            const cellDelete = document.createElement('button');
            cellDelete.textContent = 'Del';
            cellDelete.style.background = 'red';
            cellDelete.style.border = 'none'
            cellDelete.onclick = function(){
                const deleteSub = db.transaction('students', 'readwrite');
                const store = deleteSub.objectStore('students');
                const subjectDel = store.delete(student.id);

                subjectDel.onsuccess = ()=>{
                    alert('Student Deleted!')
                    location.reload();
                }
                subjectDel.onerror = ()=>{
                    console.error('Subject delete Error')
                }
            }

            cellAction.appendChild(cellDelete);
            row.appendChild(cellAction);

            StudentTable.appendChild(row);
        })
        }
        }
    