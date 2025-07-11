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
    console.log('Session opened')
    displayData();
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
    const num = Math.floor(Math.random() * 999) + 1;
    const sessionInput = document.getElementById('sessionInput').value;

    const transaction = db.transaction("session", "readwrite");
    const store = transaction.objectStore("session");

    if(!sessionInput){
        alert("Session should not be empty!")
    }else{
    const data = {
        id: num,
        session: sessionInput
    }

    const addInput = store.add(data);

    addInput.onsuccess = function(){
        console.log("Session Added to DB successfully!");
        location.reload()
    }

    addInput.onerror = function(){
        alert("Error adding Session");
    }
}
})

//Table code
function displayData(){
    let transaction = db.transaction(['session'], 'readonly');
    let objectStore = transaction.objectStore('session');
    const sessionRequest = objectStore.getAll();

sessionRequest.onsuccess = function(){
    const session = sessionRequest.result;

    let SessionTable = document.querySelector('#session-table tbody');
    SessionTable.innerHTML = '';
    
    
    session.forEach((session) =>{
            const row =  document.createElement('tr');

            const cellID = document.createElement('td');
            cellID.textContent = session.id;
            row.appendChild(cellID);

            //Editable firstname
            const cellSession = document.createElement('td');
            const editCellSession = document.createElement('input');
            editCellSession.value = session.session;
            cellSession.appendChild(editCellSession);

            row.appendChild(cellSession);

            //AddBtn
            const cellAction = document.createElement('td');
            const editBtn = document.createElement('button');
            editBtn.textContent = "Edit";

            editBtn.onclick = function(){
                let updateSession = {
                    id: session.id,
                    session: editCellSession.value,
                    
                };

                const sessionUpdate = db.transaction('session', 'readwrite');
                const store = sessionUpdate.objectStore('session');
                const updateRequest = store.put(updateSession);

                updateRequest.onsuccess = function(){
                    alert('Session updated')
                    console.log('Session updated')
                }
                updateRequest.onerror = function(){
                    console.log('failed to update Session')
                }
            }
            cellAction.appendChild(editBtn);

            const useSession = document.createElement('button');
            useSession.textContent = 'Activate'
            useSession.style.background = 'rgb(160, 219, 155)';
            useSession.style.color = 'rgb(20, 92, 14)';

            useSession.onclick = function () {
            const sessionID = session.id;

            // Update all student records with the activated session ID
            const tx = db.transaction('students', 'readwrite');
            const studentStore = tx.objectStore('students');
            const studentReq = studentStore.getAll();

            studentReq.onsuccess = function () {
                const students = studentReq.result;
                students.forEach((student) => {
                    student.sessionID = sessionID;
                    studentStore.put(student);
                });
            };

            tx.onerror = function () {
                alert("Failed to update students with session ID");
            };

            tx.oncomplete = function () {
                alert(`Activated session ${session.session} (ID: ${sessionID}) assigned to all students.`);
            };
        };


            cellAction.appendChild(useSession);

            //DeleteBtn
            const cellDelete = document.createElement('button');
            cellDelete.textContent = 'Del';
            cellDelete.style.background = 'red';
            cellDelete.style.border = 'none'
            cellDelete.onclick = function(){
                const deleteSub = db.transaction('session', 'readwrite');
                const store = deleteSub.objectStore('session');
                const subjectDel = store.delete(session.id);

                subjectDel.onsuccess = ()=>{
                    alert('Session Deleted!')
                    location.reload();
                }
                subjectDel.onerror = ()=>{
                    console.error('Subject delete Error')
                }
            }

            cellAction.appendChild(cellDelete);
            row.appendChild(cellAction);

            SessionTable.appendChild(row);
        })
        }
        }
    