const urlParams = new URLSearchParams(window.location.search);
const userId = Number(urlParams.get("id"));

let db;

import { DB_NAME, DB_VERSION } from "./app.js";

const request = indexedDB.open(DB_NAME, DB_VERSION);

request.onerror = () => {
  console.log("Error opening database");
};

request.onsuccess = (event) => {
  db = event.target.result;
  displayResult();
};

function displayResult() {
  const studentTx = db.transaction("students", "readonly");
  const studentStore = studentTx.objectStore("students");
  const studentRequest = studentStore.get(userId);

  studentRequest.onsuccess = () => {
    const student = studentRequest.result;
    if (!student) {
      alert("Student not found.");
      return;
    }

    // Load session name from sessionStore
    const sessionTx = db.transaction("session", "readonly");
    const sessionStore = sessionTx.objectStore("session");
    const sessionRequest = sessionStore.get(student.sessionID);

    sessionRequest.onsuccess = () => {
      const session = sessionRequest.result;
      const sessionName = session ? session.session : "Unknown";

      // Load class name from classStore
      const classTx = db.transaction("classes", "readonly");
      const classStore = classTx.objectStore("classes");
      const classRequest = classStore.get(student.classID);

      classRequest.onsuccess = () => {
        const classData = classRequest.result;
        const className = classData ? classData.className : "Unknown";

        // Load subjects next
        const subjectTx = db.transaction("subjectStore", "readonly");
        const subjectStore = subjectTx.objectStore("subjectStore");
        const subjectsMap = new Map();

        subjectStore.openCursor().onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            subjectsMap.set(cursor.value.id, cursor.value.subjects);
            cursor.continue();
          } else {
            // Now show results with resolved names
            loadAndDisplayResults(student, subjectsMap, className, sessionName);
          }
        };
      };
    };
  };
}

function loadAndDisplayResults(student, subjectsMap, className, sessionName) {
  const secondTermTx = db.transaction("secondTerm", "readonly");
  const secondTermStore = secondTermTx.objectStore("secondTerm");

  const resultDiv = document.getElementById("resultDiv");
  resultDiv.innerHTML = "";

  // Top Student Info Table
  const infoTable = document.createElement("table");
  infoTable.border = "1";
infoTable.style.marginBottom = "15px";
infoTable.style.width = "50%"; // ✅ Make the table narrower
infoTable.style.fontSize = "14px"; // ✅ Smaller text
infoTable.style.borderCollapse = "collapse";
  infoTable.innerHTML = `
    <tr><th colspan="2">Student Information</th></tr>
    <tr><td>Student ID</td><td>**${student.id}</td></tr>
    <tr><td>First Name</td><td>${student.firstName}</td></tr>
    <tr><td>Surname</td><td>${student.surName}</td></tr>
    <tr><td>Class</td><td>${className}</td></tr>
    <tr><td>Session</td><td>${sessionName}</td></tr>
  `;
  resultDiv.appendChild(infoTable);

  // Result Table
  const resultTable = document.createElement("table");
  resultTable.border = "1";
  resultTable.innerHTML = `
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

  let totalScore = 0;
  let subjectCount = 0;

  secondTermStore.openCursor().onsuccess = (event) => {
    const cursor = event.target.result;
    if (cursor) {
      const record = cursor.value;
      if (
        record.studentID === student.id &&
        record.session === student.sessionID
      ) {
        const subjectName = subjectsMap.get(record.subjectID) || "Unknown";
        const total =
          Number(record.ca1 || 0) +
          Number(record.ca2 || 0) +
          Number(record.ca3 || 0) +
          Number(record.exam || 0);

        const grade = getGrade(total);

        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${subjectName}</td>
          <td>${record.ca1}</td>
          <td>${record.ca2}</td>
          <td>${record.ca3}</td>
          <td>${record.exam}</td>
          <td>${total}</td>
          <td>${grade}</td>
        `;
        resultTable.appendChild(row);

        totalScore += total;
        subjectCount++;
      }
      cursor.continue();
    } else {
      resultDiv.appendChild(resultTable);

      // Summary Table
    const percentage = subjectCount > 0 ? totalScore / (subjectCount * 100) * 100 : 0;
const finalGrade = getGrade(percentage);
const totalAverage = subjectCount > 0 ? totalScore / subjectCount : 0;

const summaryTable = document.createElement("table");
summaryTable.border = "1";
summaryTable.style.marginTop = "15px";
summaryTable.style.width = "50%"; // ✅ Make the table narrower
summaryTable.style.fontSize = "14px"; // ✅ Smaller text
summaryTable.style.borderCollapse = "collapse";
summaryTable.innerHTML = `
  <tr><th colspan="2">Status</th></tr>
  <tr><td>Total Score</td><td>${totalScore}</td></tr>
 <!--- <tr><td>Average</td><td>${totalAverage.toFixed(2)}</td></tr> ----->
  <tr><td>Percentage</td><td>${percentage.toFixed(2)}%</td></tr>
  <tr><td>Grade</td><td>${finalGrade}</td></tr>
`;
resultDiv.appendChild(summaryTable);

      const printBtn = document.createElement("button");
      printBtn.textContent = "Print Result";
      printBtn.onclick = () => window.print();
      resultDiv.appendChild(printBtn);
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
