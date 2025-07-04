const urlParams = new URLSearchParams(window.location.search);
const userId = Number(urlParams.get("id"));

let regSubject = document.getElementById('regSubject');
let dismise = document.getElementById('dismise');
let registerFormDiv = document.getElementById('registerFormDiv');

import {tog} from './toggle.js';

regSubject.addEventListener('click', ()=>{
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
    console.log('Error opening secondTerm database')
}

request.onsuccess = (event) =>{
    db = event.target.result;
    displayCheckbox();
    studentNameDisplay();
    displayTable();
}

function displayCheckbox(){
    let transaction = db.transaction('subjectStore', 'readonly');
    let subjectsStore = transaction.objectStore('subjectStore');

    let container = document.getElementById('checkboxContainer');
    container.innerHTML = ''; //clear

    subjectsStore.openCursor().onsuccess = function(event){
        let cursor = event.target.result;
        if(cursor){
            let subject = cursor.value;

            let label = document.createElement('label');
            let checkbox = document.createElement('input');
            checkbox.type = "checkbox";
            checkbox.value = subject.id;
            checkbox.name = "subjectCheckbox";

            label.appendChild(checkbox);

            label.appendChild(document.createTextNode(subject.subjects));
            container.appendChild(label);

            container.appendChild(document.createElement("br"));

            cursor.continue();
        }
    }
}

//Add to subjects secondTerm
document.getElementById('submitSubjects').addEventListener('click', function(){
    let checkboxes = document.querySelectorAll("input[name='subjectCheckbox']:checked");

    let transaction = db.transaction("secondTerm", "readwrite");
    let store = transaction.objectStore("secondTerm");

    checkboxes.forEach((checkbox)=> {
        let subjectID = parseInt(checkbox.value);

        //Save student ID into selectedStudents store
        store.add({subjectID: parseInt(subjectID), studentID: parseInt(userId),
            ca1: 0, ca2: 0, ca3: 0, ca4: 0, exam: 0});

            transaction.oncomplete = () => {
                alert("Selected Subjects Saved")
            }

            transaction.onerror = () =>{
                alert("Failed to save Selected Subjects")
            }
    })
})

function studentNameDisplay(){
    let transaction = db.transaction('students', 'readonly');
    let studentName = transaction.objectStore('students');

    studentName.openCursor().onsuccess = (event)=>{
        const cursor = event.target.result;

        if(cursor){
            let result = cursor.value;
           
            if(result.id == userId){
            console.log(result.id)
            console.log(result.secondName)
            let student = document.getElementById('studentName');
            student.textContent = `${result.firstName} ${result.surName}`;
            }
            cursor.continue();
        }
    }
}

function displayTable(){
    let transaction = db.transaction('secondTerm', 'readonly');
    let secondTermStore = transaction.objectStore('secondTerm');

    let studentsecondTerm = document.querySelector('#student-secondTerm tbody');
    studentsecondTerm.innerHTML = '';

    secondTermStore.openCursor().onsuccess = (event)=>{
        const cursor = event.target.result;

        if(cursor){
        let result = cursor.value;
        let subjectID = result.subjectID;

        //Get the subject name from the subjects store
        let subjectTx = db.transaction("subjectStore", "readonly");
        let subjectStore = subjectTx.objectStore("subjectStore");
        let subjectRequest = subjectStore.get(parseInt(subjectID));

        console.log(subjectID)

        subjectRequest.onsuccess = () =>{
            const subject = subjectRequest.result;
            if(userId == parseInt(result.studentID)){

            const subjectName = subject ? subject.subjects : "unknown subject";

            let catotal = (result.ca1 || 0) + (result.ca2 || 0) + (result.ca3 || 0) + (result.ca4 || 0);
            const grandtotal = (catotal || 0) + (result.exam || 0);
            let grade = getGrade(grandtotal);

            const row = document.createElement('tr');

            const id = document.createElement('td');
            id.textContent = result.id;
            row.appendChild(id)

            const subjectList = document.createElement('td');
            subjectList.textContent = subjectName;
            row.appendChild(subjectList);

            const ca1 = document.createElement('td');
            const editca1 = document.createElement('input');
            editca1.value = result.ca1;
            ca1.appendChild(editca1);
            row.appendChild(ca1);

            const ca2 = document.createElement('td');
            const editca2 = document.createElement('input');
            editca2.value = result.ca2;
            ca2.append(editca2);
            row.appendChild(ca2)

            const ca3 = document.createElement('td');
            const editca3 = document.createElement('input');
            editca3.value = result.ca3;
            ca3.appendChild(editca3);
            row.appendChild(ca3)

            const ca4 = document.createElement('td');
            const editca4 = document.createElement('input');
            editca4.value = result.ca4;
            ca4.appendChild(editca4);
            row.appendChild(ca4);

            let caSum = document.createElement('td');
            caSum.textContent = catotal;
            caSum.style.fontWeight = 'bold';
            row.appendChild(caSum);

            let exam = document.createElement('td');
            let editExam = document.createElement('input');
            editExam.value = result.exam;
            exam.appendChild(editExam);
            row.appendChild(exam);

            let cellGrandTotal = document.createElement('td');
            cellGrandTotal.textContent = grandtotal;
            cellGrandTotal.style.fontWeight = 'bold';
            row.appendChild(cellGrandTotal);

            let cellGrade = document.createElement('td');
            cellGrade.textContent = grade;
            row.appendChild(cellGrade);

            const action = document.createElement('td');
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Edit';
            editBtn.onclick = function(){
                let updatesecondTerm = {
                    id: parseInt(result.id),
                    studentID: parseInt(userId),
                    subjectID: parseInt(subjectID),
                    ca1: parseInt(editca1.value),
                    ca2: parseInt(editca2.value),
                    ca3: parseInt(editca3.value),
                    ca4: parseInt(editca4.value),
                    exam: parseInt(editExam.value)
                };

                const transaction = db.transaction('secondTerm', 'readwrite');
                const secondTerm = transaction.objectStore('secondTerm');
                const updateRequest = secondTerm.put(updatesecondTerm);

                updateRequest.onsuccess = () =>{
                    console.log('Update made on secondTerm Result')
                    location.reload();
                }

                updateRequest.onerror = () =>{
                    alert('Error updating Score');
                    console.error('Error updating Score')
                }
            }
            action.appendChild(editBtn)

             //DeleteBtn
            const cellDelete = document.createElement('button');
            cellDelete.textContent = 'Delete';
            cellDelete.style.background = 'red';
            cellDelete.style.border = 'none'
            cellDelete.onclick = function(){
                const deleteTerm = db.transaction('secondTerm', 'readwrite');
                const store = deleteTerm.objectStore('secondTerm');
                const termDel = store.delete(parseInt(result.id));

                termDel.onsuccess = ()=>{
                    alert('Subject Deleted!')
                    location.reload();
                }
                termDel.onerror = ()=>{
                    console.error('Subject delete Error')
                }
            }
            action.appendChild(cellDelete);
            row.appendChild(action)

            studentsecondTerm.appendChild(row);
            }
        }
        cursor.continue();
        }
    }
}


    //Code for grade
    function getGrade(totalScore) {
        if(totalScore >= 75) return "A1";
        else if(totalScore >= 70) return "B2";
        else if(totalScore >= 65) return "B3";
        else if(totalScore >= 60) return "C4";
        else if(totalScore >= 55) return "C5";
        else if(totalScore >= 50) return "C6";
        else if(totalScore >= 45) return "D7";
        else if(totalScore >= 40) return "E8";
        else if(totalScore >= 40) return "E8";
        else return "F9";
    }