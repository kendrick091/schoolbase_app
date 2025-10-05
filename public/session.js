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
import { DB_NAME, DB_VERSION } from './app.js';

const request = indexedDB.open(DB_NAME, DB_VERSION);

//SUCCESS
request.onsuccess = (event) => {
    db = event.target.result;
    console.log('Session opened');
    displayData();
}

request.onerror = (event) => {
    console.log('Error', event.target.result);
}

document.getElementById("formInput").addEventListener("submit", function (e) {
    e.preventDefault();

    if (!db) {
        alert("DataBase not ready");
        return;
    }

    //RANDOM NUMBER
    const num = Math.floor(Math.random() * 999) + 1;
    const sessionInput = document.getElementById('sessionInput').value;

    const transaction = db.transaction("session", "readwrite");
    const store = transaction.objectStore("session");

    if (!sessionInput) {
        alert("Session should not be empty!");
    } else {
        const data = { id: num, session: sessionInput }
        const addInput = store.add(data);

        addInput.onsuccess = function () {
            console.log("Session Added to DB successfully!");
            location.reload();
        }

        addInput.onerror = function () {
            alert("Error adding Session");
        }
    }
});

//Table code
function displayData() {
    let transaction = db.transaction(['session'], 'readonly');
    let objectStore = transaction.objectStore('session');

    const sessionRequest = objectStore.getAll();
    sessionRequest.onsuccess = function () {
        const session = sessionRequest.result;
        let SessionTable = document.querySelector('#session-table tbody');
        SessionTable.innerHTML = '';

        session.forEach((session) => {
            const row = document.createElement('tr');

            const cellID = document.createElement('td');
            cellID.textContent = session.id;
            row.appendChild(cellID);

            //Editable firstname
            const cellSession = document.createElement('td');
            const editCellSession = document.createElement('input');
            editCellSession.value = session.session;
            cellSession.appendChild(editCellSession);
            row.appendChild(cellSession);

            //Action Btns
            const cellAction = document.createElement('td');

            //EDIT
            const editBtn = document.createElement('button');
            editBtn.textContent = "Edit";
            editBtn.onclick = function () {
                let updateSession = {
                    id: session.id,
                    session: editCellSession.value,
                };

                const sessionUpdate = db.transaction('session', 'readwrite');
                const store = sessionUpdate.objectStore('session');
                const updateRequest = store.put(updateSession);

                updateRequest.onsuccess = function () {
                    alert('Session updated');
                    console.log('Session updated');
                }

                updateRequest.onerror = function () {
                    console.log('failed to update Session');
                }
            }
            cellAction.appendChild(editBtn);

            //ACTIVATE
            const useSession = document.createElement('button');
            useSession.textContent = 'Activate';
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
                        // update sessionID on student
                        student.sessionID = sessionID;
                        studentStore.put(student);

                        // also insert into session_students store if not exists
                        const ssTx = db.transaction("session_students", "readwrite");
                        const ssStore = ssTx.objectStore("session_students");

                        const index = ssStore.index("session_student_class");
                        const checkReq = index.get([sessionID, student.id, student.classID]);

                        checkReq.onsuccess = function () {
                            if (!checkReq.result) {
                                // insert new record
                                ssStore.add({
                                    sessionID: sessionID,
                                    studentID: student.id,
                                    classID: student.classID
                                });
                                console.log(`Linked student ${student.id} -> session ${sessionID}`);
                            } else {
                                console.log(`Already linked: student ${student.id}, session ${sessionID}, class ${student.classID}`);
                            }
                        };
                    });
                };

                tx.onerror = function () {
                    alert("Failed to update students with session ID");
                };

                tx.oncomplete = function () {
                    alert(`Activated session ${session.session} (ID: ${sessionID}) assigned to all students.`);
                    // ✅ STEP 2: Update sessionViewer store to hold this active session
        const viewerTx = db.transaction("sessionViewer", "readwrite");
        const viewerStore = viewerTx.objectStore("sessionViewer");

        // We assume sessionViewer contains only one record (or the active one)
        const getAllReq = viewerStore.getAll();

        getAllReq.onsuccess = function () {
            const viewers = getAllReq.result;

            if (viewers.length > 0) {
                // update first record
                const viewer = viewers[0];
                viewer.sessionID = sessionID;

                const updateReq = viewerStore.put(viewer);
                updateReq.onsuccess = function () {
                    console.log(`sessionViewer updated with sessionID ${sessionID}`);
                };
                updateReq.onerror = function () {
                    console.error("Failed to update sessionViewer");
                };
            } else {
                // create a new record if none exists
                const addReq = viewerStore.add({ id: 1, sessionID });
                addReq.onsuccess = function () {
                    console.log(`sessionViewer initialized with sessionID ${sessionID}`);
                };
                addReq.onerror = function () {
                    console.error("Failed to initialize sessionViewer");
                };
            }
        };
                };
            };
            cellAction.appendChild(useSession);

            //DELETE
            const cellDelete = document.createElement('button');
            cellDelete.textContent = 'Del';
            cellDelete.style.background = 'red';
            cellDelete.style.border = 'none';
            cellDelete.onclick = function () {
                const deleteSub = db.transaction('session', 'readwrite');
                const store = deleteSub.objectStore('session');
                const subjectDel = store.delete(session.id);

                subjectDel.onsuccess = () => {
                    alert('Session Deleted!');
                    location.reload();
                }

                subjectDel.onerror = () => {
                    console.error('Subject delete Error');
                }
            }

            cellAction.appendChild(cellDelete);

            row.appendChild(cellAction);

            SessionTable.appendChild(row);
        });
    }
}

    