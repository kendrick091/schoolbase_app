let db;

import { DB_NAME, DB_VERSION } from "./app.js";

const request = indexedDB.open(DB_NAME, DB_VERSION);

request.onerror = () => {
  console.log("Error opening database");
};

request.onsuccess = (event) => {
  db = event.target.result;
  printAllResults();
};

function printAllResults() {
  const studentsTx = db.transaction("students", "readonly");
  const studentsStore = studentsTx.objectStore("students");
  const students = [];

  studentsStore.openCursor().onsuccess = (event) => {
    const cursor = event.target.result;
    if (cursor) {
      students.push(cursor.value);
      cursor.continue();
    } else {
      // Load all subjects into a Map first
      const subjectTx = db.transaction("subjectStore", "readonly");
      const subjectStore = subjectTx.objectStore("subjectStore");
      const subjectsMap = new Map();

      subjectStore.openCursor().onsuccess = (event) => {
        const subjectCursor = event.target.result;
        if (subjectCursor) {
          subjectsMap.set(subjectCursor.value.id, subjectCursor.value.subjects);
          subjectCursor.continue();
        } else {
          renderAllResults(students, subjectsMap);
        }
      };
    }
  };
}

function renderAllResults(students, subjectsMap) {
  const resultDiv = document.getElementById("allResultsDiv");
  resultDiv.innerHTML = "";

  const firstTermTx = db.transaction("firstTerm", "readonly");
  const firstTermStore = firstTermTx.objectStore("firstTerm");

  const allResults = [];

  firstTermStore.openCursor().onsuccess = (event) => {
    const cursor = event.target.result;
    if (cursor) {
      allResults.push(cursor.value);
      cursor.continue();
    } else {
      // Done loading results, render for each student
      students.forEach((student) => {
        const studentResults = allResults.filter(
          (r) => r.studentID === student.id && r.session === student.sessionID
        );

        if (studentResults.length > 0) {
          const section = document.createElement("div");
          section.style.pageBreakAfter = "always";
          section.innerHTML = `<h2>${student.firstName} ${student.surName}</h2>`;

          const table = document.createElement("table");
          table.border = "1";
          table.style.marginBottom = "20px";
          table.innerHTML = `
            <tr>
              <th>Subject</th>
              <th>CA1</th>
              <th>CA2</th>
              <th>CA3</th>
              <th>Exam</th>
              <th>Total</th>
              <th>Grade</th>
            </tr>
          `;

          studentResults.forEach((r) => {
            const subjectName = subjectsMap.get(r.subjectID) || "Unknown";
            const total =
              Number(r.ca1 || 0) +
              Number(r.ca2 || 0) +
              Number(r.ca3 || 0) +
              Number(r.exam || 0);
            const grade = getGrade(total);

            const row = document.createElement("tr");
            row.innerHTML = `
              <td>${subjectName}</td>
              <td>${r.ca1}</td>
              <td>${r.ca2}</td>
              <td>${r.ca3}</td>
              <td>${r.exam}</td>
              <td>${total}</td>
              <td>${grade}</td>
            `;
            table.appendChild(row);
          });

          section.appendChild(table);
          resultDiv.appendChild(section);
        }
      });

      // After rendering all, trigger print
      window.print();
    }
  };
}

function getGrade(score) {
  if (score >= 70) return "A";
  if (score >= 60) return "B";
  if (score >= 50) return "C";
  if (score >= 45) return "D";
  if (score >= 40) return "E";
  return "F";
}
