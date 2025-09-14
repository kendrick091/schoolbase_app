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
  loadAttendance();
};

//School logo
function renderSchoolHeaderAndFooter() {
  const tx = db.transaction("school", "readonly");
  const store = tx.objectStore("school");
  const request = store.get(1); // assuming id = 1

  request.onsuccess = () => {
    const school = request.result;
    if (!school) return;

    // Header (top of result)
    const headerDiv = document.createElement("div");
    headerDiv.classList = 'logoHeader'

    const subHeaderDiv = document.createElement("div");
    subHeaderDiv.classList = 'centerHeader'
    
    const lastHeaderDiv = document.createElement("div");
    lastHeaderDiv.classList = 'logoHeader'

    const logoImg = document.createElement("img");
    logoImg.src = URL.createObjectURL(school.logo);
    logoImg.alt = "School Logo";
    logoImg.style.width = "90%";
    logoImg.style.height = "90%";
    logoImg.style.objectFit = "contain";
    logoImg.style.display = "block";
    logoImg.style.margin = "0 auto 5px";

    const schoolName = document.createElement("h1");
    schoolName.textContent = school.name;
    schoolName.style.margin = "0";
    schoolName.style.fontSize = "25px";

    const schoolAddress = document.createElement('h2');
    schoolAddress.textContent = school.address;
    schoolAddress.style.margin = "0";
    schoolAddress.style.fontSize = "18px";
    
    
    headerDiv.appendChild(logoImg);
    subHeaderDiv.appendChild(schoolName);
    subHeaderDiv.appendChild(schoolAddress);

    document.getElementById('schoolLogoDiv').appendChild(headerDiv)
    document.getElementById('schoolLogoDiv').appendChild(subHeaderDiv)
    document.getElementById('schoolLogoDiv').appendChild(lastHeaderDiv)

    // resultDiv.prepend(headerDiv); // ✅ Add to top of resultDiv
  };
}


function loadStudentInfo() {
  const transaction = db.transaction(['students', 'classes', 'session', 'session_students'], 'readonly');

  let studentTh = document.getElementById('studentTh');
  let studentTh2 = document.getElementById('studentTh2');
  
  // Student
  const studentStore = transaction.objectStore('students');
  studentStore.get(studentId).onsuccess = (e) => {
    const student = e.target.result;

      let tableRowFirstName = document.createElement('tr');
      let title = document.createElement('td')
      let firstNameTable = document.createElement('td')
      title.textContent = `First Name:`;
      firstNameTable.textContent = `${student.firstName}`;
      tableRowFirstName.appendChild(title)
      tableRowFirstName.appendChild(firstNameTable);

      let tableRowSurName = document.createElement('tr');
      let titleSurName = document.createElement('td')
      let surNameTable = document.createElement('td')
      titleSurName.textContent = `Sur Name:`;
      surNameTable.textContent = `${student.surName}`;
      tableRowSurName.appendChild(titleSurName)
      tableRowSurName.appendChild(surNameTable)
      
       let tableRowOtherName = document.createElement('tr');
      let titleOtherName = document.createElement('td')
      let otherNameTable = document.createElement('td')
      titleOtherName.textContent = `Other Name:`;
      otherNameTable.textContent = `${student.otherName}`;
      tableRowOtherName.appendChild(titleOtherName);
      tableRowOtherName.appendChild(otherNameTable)

      studentTh.appendChild(tableRowFirstName);
      studentTh.appendChild(tableRowSurName)
      studentTh.appendChild(tableRowOtherName)
  };

  // Session
  const sessionStore = transaction.objectStore('session');
  sessionStore.get(sessionId).onsuccess = (s) => {
    
      let tableRowSession = document.createElement('tr');
      let titleSession = document.createElement('td')
      let sessionTable = document.createElement('td')
      titleSession.textContent = `Session:`;
      sessionTable.textContent = `${s.target.result.session}`;
      tableRowSession.appendChild(titleSession)
      tableRowSession.appendChild(sessionTable)

      studentTh2.appendChild(tableRowSession)
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
          let tableRowClass = document.createElement('tr');
          let titleClass = document.createElement('td')
          let classTable = document.createElement('td')
          titleClass.textContent = `Class:`;
          classTable.textContent = `${c.target.result.className}`;
          tableRowClass.appendChild(titleClass)
          tableRowClass.appendChild(classTable)

          studentTh2.appendChild(tableRowClass)
      };
      return; // stop after finding
    }
    cursor.continue();
  } else {
    document.getElementById("classInfo").textContent = "Class: Not Found for this session";
  }
};


  // Term
  function termDefined(terms) {
    if(terms == 1) return "1st"
    if(terms == 2) return "2nd"
    if(terms == 3) return "3rd"

    console.log(terms)
  }

  let tableRowTerm = document.createElement('tr');
      let titleTerm = document.createElement('td')
      let termTable = document.createElement('td')
      titleTerm.textContent = `Term:`;
      termTable.textContent = `${termDefined(term)} Term`;
      tableRowTerm.appendChild(titleTerm)
      tableRowTerm.appendChild(termTable)

      studentTh2.appendChild(tableRowTerm)
}

function loadAttendance() {
  const tx = db.transaction("attendance", "readonly");
  const store = tx.objectStore("attendance");
  const index = store.openCursor();

  index.onsuccess = (event) => {
    const cursor = event.target.result;
    if (cursor) {
      const record = cursor.value;
      if (
        record.studentID === studentId &&
        record.sessionID === sessionId &&
        record.term === term
      ) {
        document.getElementById("attendanceDiv").innerHTML = `
          <table style="width: 100%; font-size: 12px;
          text-align: left">
          <h3 style="text-align: left">Attendance</h3>
          <tr>
          <th>Total Days</th>
          <th>Present</th>
          <th>Absent</th>
          </tr>
          <tr>
          <td>${record.totalDays}</td>
          <td>${record.presentDays}</td>
          <td>${record.absentDays}</td>
          </tr>
          </table>
        `;
        return;
      }
      cursor.continue();
    }
  };
}


function loadResult() {
  let storeName;
  if (term === 1) storeName = 'firstTerm';
  if (term === 2) storeName = 'secondTerm';
  if (term === 3) storeName = 'thirdTerm';

  const transaction = db.transaction(storeName, 'readonly');
  const termStore = transaction.objectStore(storeName);

  renderSchoolHeaderAndFooter()

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
        // document.getElementById("summary").textContent =
        //   `Total: ${totalOverall} | Average: ${average}`;
          const totalScore = document.getElementById('totalScore');
          const averageScore = document.getElementById('averageScore');
          const gradeScore = document.getElementById('gradeScore');

          const totalTd = document.createElement('td')
          const totalTd2 = document.createElement('td')
          totalTd.textContent = `Total Score`;
          totalTd2.textContent = `${totalOverall}`;
          
          const averageTd = document.createElement('td')
          const averageTd2 = document.createElement('td')
          averageTd.textContent = `Average`;
          averageTd2.textContent = `${average}`;
          
          const gradeTd = document.createElement('td')
          const gradeTd2 = document.createElement('td')
          gradeTd.textContent = `Grade`;
          gradeTd2.textContent = `${getGrade(average)}`;

          totalScore.appendChild(totalTd);
          totalScore.appendChild(totalTd2);
          averageScore.appendChild(averageTd)
          averageScore.appendChild(averageTd2)
          gradeScore.appendChild(gradeTd)
          gradeScore.appendChild(gradeTd2)
      } else {
        document.getElementById("summary").textContent =
          "No result found for this session and term.";
      }
    }
  };
}

document.getElementById('printBtn').addEventListener('click', ()=>{
  window.print();
})



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
