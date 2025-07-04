let db;

import { DB_NAME, DB_VERSION } from './app.js';

const request = indexedDB.open(DB_NAME, DB_VERSION);

request.onupgradeneeded = (event)=>{
    db = event.target.result
}

request.onerror = (event)=>{
    console.Error('Error', event.target.error)
};

request.onsuccess = (event)=>{
    db = event.target.result;
    console.log('DB open for ATTENDANCE LOADED')
    displayClass();
};

function displayClass() {
    const tx = db.transaction(["classes"], "readonly");
    const classStore = tx.objectStore("classes");
    const classList = document.getElementById('listClass');
    classList.innerHTML = "";

    classStore.openCursor().onsuccess = function(event){
        const cursor = event.target.result;
        if(cursor){
            const {id, className} = cursor.value;
            const li = document.createElement('li');
            const btnDiv = document.createElement('div');

            const infoBtn = document.createElement('button');
            infoBtn.textContent = `${className}`,
            infoBtn.onclick = function(){
                window.location.href = `classAttendance3.html?id=${id}`
            }

            btnDiv.appendChild(infoBtn)
            li.appendChild(btnDiv);

            classList.appendChild(li);
            cursor.continue();
        }
    }
}
