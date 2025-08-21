let db;

import { DB_NAME, DB_VERSION } from './app.js';

const urlParams = new URLSearchParams(window.location.search);
const studentId = Number(urlParams.get("id"));
const term = Number(urlParams.get("term"));
const sessionId = Number(urlParams.get("session"));


const request = indexedDB.open(DB_NAME, DB_VERSION);

request.onerror = () =>{
  console.log('Error opening db')
}

request.onsuccess = (event) => {
  db = event.target.result;
  loadStudentInfo();
  loadResult();
};

function loadStudentInfo() {
  const transaction = db.transaction(['students', 'classes', 'session', 'session_students'], 'readonly');

  // Student
  const studentStore = transaction.objectStore('students');
  studentStore.get(studentId).onsuccess = (e) => {
    const student = e.target.result;
    document.getElementById("studentName").textContent =
      `${student.surName} ${student.firstName} ${student.otherName || ""}`;
  };

  // Session
  const sessionStore = transaction.objectStore('session');
  sessionStore.get(sessionId).onsuccess = (s) => {
    document.getElementById("sessionInfo").textContent =
      `Session: ${s.target.result.session}`;
  };

  const mapStore = transaction.objectStore('session_students');
const request = mapStore.openCursor();

request.onsuccess = (event) => {
  const cursor = event.target.result;
  if(cursor) {
    const record = cursor.value;
    if(record.studentID === studentId && record.sessionID === sessionId) {
      const classStore = db.transaction('classes', 'readonly').objectStore('classes');
      classStore.get(record.classID).onsuccess = (c) => {
        document.getElementById("classInfo").textContent =
          `Class: ${c.target.result.className}`;
      };
      return; // stop after finding
    }
    cursor.continue();
  } else {
    document.getElementById("classInfo").textContent = "Class: Not Found for this session";
  }
};


  // Term
  document.getElementById("termInfo").textContent = `Term: ${term} Term`;
}


function loadResult() {
  let storeName;
  if (term === 1) storeName = 'firstTerm';
  if (term === 2) storeName = 'secondTerm';
  if (term === 3) storeName = 'thirdTerm';

  const transaction = db.transaction(storeName, 'readonly');
  const termStore = transaction.objectStore(storeName);

  const tableBody = document.querySelector("#resultTable tbody");
  tableBody.innerHTML = "";

  let totalOverall = 0;
  let subjectCount = 0;

  termStore.openCursor().onsuccess = (event) => {
    const cursor = event.target.result;
    if (cursor) {
      const result = cursor.value;

      // check correct student + session
      if (result.studentID === studentId && result.session === sessionId) {
        const { ca1, ca2, ca3, exam, subjectID } = result;
        const subjectTotal = (ca1 || 0) + (ca2 || 0) + (ca3 || 0) + (exam || 0);
        subjectCount++;
        totalOverall += subjectTotal;

        // get subject name from subjects store
        const subTransaction = db.transaction('subjectStore', 'readonly');
        const subjectStore = subTransaction.objectStore('subjectStore');
        subjectStore.get(subjectID).onsuccess = (s) => {
          const subject = s.target.result;

          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${subject ? subject.subjects : "Unknown"}</td>
            <td>${ca1 ?? 0}</td>
            <td>${ca2 ?? 0}</td>
            <td>${ca3 ?? 0}</td>
            <td>${exam ?? 0}</td>
            <td>${subjectTotal}</td>
            <td>${getGrade(subjectTotal)}</td>
            <td>${getRemark(subjectTotal)}</td>
          `;
          tableBody.appendChild(row);
        };
      }
      cursor.continue();
    } else {
      if (subjectCount > 0) {
        const average = (totalOverall / subjectCount).toFixed(2);
        document.getElementById("summary").textContent =
          `Total: ${totalOverall} | Average: ${average}`;
      } else {
        document.getElementById("summary").textContent =
          "No result found for this session and term.";
      }
    }
  };
}



function getGrade(score) {
  if(score >= 70) return "A";
  if(score >= 60) return "B";
  if(score >= 50) return "C";
  if(score >= 45) return "D";
  if(score >= 40) return "E";
  return "F";
}

function getRemark(score) {
  if(score >= 70) return "Excellent";
  if(score >= 60) return "Very Good";
  if(score >= 50) return "Good";
  if(score >= 45) return "Fair";
  if(score >= 40) return "Pass";
  return "Fail";
}
