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
            // ✅ Count attendance3 before displaying result
          const attendance3Tx = db.transaction("attendance3", "readonly");
          const attendance3Store = attendance3Tx.objectStore("attendance3");

          let attendance3Count = 0;

          attendance3Store.openCursor().onsuccess = (e) => {
            const cur = e.target.result;
            if (cur) {
              const record = cur.value;
              if (record.studentID === student.id) {
                attendance3Count++;
              }
              cur.continue();
            } else {
                  // Now show results with resolved names
            loadAndDisplayResults(student, subjectsMap, className, sessionName, attendance3Count);
          }
        };
      }
    }
      };
    };
  };
}

function renderSchoolHeaderAndFooter(resultDiv) {
  const tx = db.transaction("school", "readonly");
  const store = tx.objectStore("school");
  const request = store.get(1); // assuming id = 1

  request.onsuccess = () => {
    const school = request.result;
    if (!school) return;

    // Header (top of result)
    const headerDiv = document.createElement("div");
    headerDiv.style.textAlign = "center";
    headerDiv.style.marginBottom = "15px";

    const logoImg = document.createElement("img");
    logoImg.src = URL.createObjectURL(school.logo);
    logoImg.alt = "School Logo";
    logoImg.style.width = "80px";
    logoImg.style.height = "80px";
    logoImg.style.objectFit = "contain";
    logoImg.style.display = "block";
    logoImg.style.margin = "0 auto 5px";

    const schoolName = document.createElement("h2");
    schoolName.textContent = school.name;
    schoolName.style.margin = "0";
    schoolName.style.fontSize = "20px";

    headerDiv.appendChild(logoImg);
    headerDiv.appendChild(schoolName);

    resultDiv.prepend(headerDiv); // ✅ Add to top of resultDiv
  };
}


function loadAndDisplayResults(student, subjectsMap, className, sessionName, attendance3Count) {
  const thirdTermTx = db.transaction("thirdTerm", "readonly");
  const thirdTermStore = thirdTermTx.objectStore("thirdTerm");

  const resultDiv = document.getElementById("resultDiv");
  resultDiv.innerHTML = "";

  renderSchoolHeaderAndFooter(resultDiv);

//Term
const termType = document.createElement('h2');
termType.textContent = 'THIRD TERM RESULT';
resultDiv.appendChild(termType)

  // Top Student Info Table
  const infoTable = document.createElement("table");
  infoTable.border = "1";
infoTable.style.marginTop = "0";
infoTable.style.marginBottom = "5px";
infoTable.style.width = "30%"; // ✅ Make the table narrower
infoTable.style.fontSize = "12px"; // ✅ Smaller text
infoTable.style.borderCollapse = "collapse";
  infoTable.innerHTML = `
    <tr><td>Student ID</td><td>**${student.id}</td></tr>
    <tr><td>First Name</td><td>${student.firstName}</td></tr>
    <tr><td>Sur Name</td><td>${student.surName}</td></tr>
    <tr><td>Other Name</td><td>${student.otherName}</td></tr>
  `;

  const infoTable2 = document.createElement("table");
  infoTable2.border = "1";
infoTable2.style.marginTop = "0";
infoTable2.style.marginBottom = "5px";
infoTable2.style.width = "30%"; // ✅ Make the table narrower
infoTable2.style.fontSize = "12px"; // ✅ Smaller text
infoTable2.style.borderCollapse = "collapse";
  infoTable2.innerHTML = `
    <tr><td>Class</td><td>${className}</td></tr>
    <tr><td>Session</td><td>${sessionName}</td></tr>
    <tr><td>Attendance3</td><td>${attendance3Count}</td></tr>
  `;
  const spliterDiv = document.createElement('div');
  spliterDiv.style.display = 'flex';
  spliterDiv.style.justifyContent = 'space-between';

  spliterDiv.appendChild(infoTable);
  spliterDiv.appendChild(infoTable2);

  resultDiv.appendChild(spliterDiv)

  // Result Table
  const resultTable = document.createElement("table");
  resultTable.border = "1";
  resultTable.style.fontSize = "12px"
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

  thirdTermStore.openCursor().onsuccess = (event) => {
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
summaryTable.style.width = "35%"; // ✅ Make the table narrower
summaryTable.style.fontSize = "14px"; // ✅ Smaller text
summaryTable.style.borderCollapse = "collapse";
summaryTable.innerHTML = `
  <tr><th colspan="2">Progress</th></tr>
  <tr><td>Total Score</td><td>${totalScore}</td></tr>
 <tr><td>Average</td><td>${totalAverage.toFixed(2)}</td></tr>
  <!---- <tr><td>Percentage</td><td>${percentage.toFixed(2)}%</td></tr> ----->
  <tr><td>Grade</td><td>${finalGrade}</td></tr>
`;

const teacherComment = document.createElement('div')
teacherComment.innerHTML = `
<h4>Teacher's comment: ____________________________________________________________________________________</h4>
<h4>Head Teacher's comment: ____________________________________________________________________________________</h4>
<br>
<h4>Date: __________________________ Head Teacher's Signature _________________________________</h4>
`;
resultDiv.appendChild(summaryTable);
resultDiv.appendChild(teacherComment)

      const printBtn = document.createElement("button");
      printBtn.textContent = "Print Result";
      printBtn.style.background = 'green'
      printBtn.style.padding = '10px'
      printBtn.style.color = 'white'
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
