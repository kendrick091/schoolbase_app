// ----- URL & UI -----
const urlParams = new URLSearchParams(window.location.search);
const userId = Number(urlParams.get("id"));

import { tog } from "./toggle.js";
import { DB_NAME, DB_VERSION } from "./app.js";

const regSubject = document.getElementById("regSubject");
const dismise = document.getElementById("dismise");
const registerFormDiv = document.getElementById("registerFormDiv");

regSubject.addEventListener("click", () => tog(registerFormDiv));
dismise.addEventListener("click", () => tog(registerFormDiv));

let db;

// ----- DB OPEN -----
const request = indexedDB.open(DB_NAME, DB_VERSION);

request.onupgradeneeded = (event) => {
  db = event.target.result;
};

request.onerror = () => {
  console.error("Error opening database");
};

request.onsuccess = async (event) => {
  db = event.target.result;
  displayRecharge(); // Show gems on load
  displayCheckbox();
  studentNameDisplay();
  await displayTable();
  await attInfo();
};

// ======== Show Recharge (Gems) ========

function displayRecharge() {
  const tx = db.transaction("school", "readonly");
  const store = tx.objectStore("school");
  const req = store.get(1);

  req.onsuccess = () => {
    const data = req.result;
    const rechargeElem = document.getElementById("recharge-info");
    if (rechargeElem) {
      rechargeElem.textContent = data ? data.recharge : 0;
      rechargeElem.style.color = "#007bff"; // blue
      rechargeElem.style.fontWeight = "bold";
    }
  };
  req.onerror = () => {
    console.error("Error reading recharge");
  };
}


// ======== Helpers ========

// Get the *latest* student's sessionID (mirrors your original logic)
function getCurrentSessionId() {
  return new Promise((resolve, reject) => {
    const tx = db.transaction("students", "readonly");
    const store = tx.objectStore("students");
    const req = store.get(userId); // get by ID

    req.onsuccess = () => {
      if (!req.result) {
        return;
      }
      resolve(req.result.sessionID);
    };
    req.onerror = () => reject(new Error("Failed to read students store"));
  });
}

function getCurrentClassId() {
  return new Promise((resolve, reject) => {
    const tx = db.transaction("students", "readonly");
    const store = tx.objectStore("students");
    const req = store.get(userId); // get by ID

    req.onsuccess = () => {
      if (!req.result) {
        return;
      }
      resolve(req.result.classID);
    };
    req.onerror = () => reject(new Error("Failed to read students store"));
  });
}

function toInt(value, fallback = 0) {
  const n = parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
}

function getGrade(totalScore) {
  if (totalScore >= 75) return "A1";
  else if (totalScore >= 70) return "B2";
  else if (totalScore >= 65) return "B3";
  else if (totalScore >= 60) return "C4";
  else if (totalScore >= 55) return "C5";
  else if (totalScore >= 50) return "C6";
  else if (totalScore >= 45) return "D7";
  else if (totalScore >= 40) return "E8";
  else return "F9";
}

// ======== Subjects Checkbox ========

function displayCheckbox() {
  const transaction = db.transaction("subjectStore", "readonly");
  const subjectsStore = transaction.objectStore("subjectStore");

  const container = document.getElementById("checkboxContainer");
  container.innerHTML = ""; // clear

  subjectsStore.openCursor().onsuccess = function (event) {
    const cursor = event.target.result;
    if (cursor) {
      const subject = cursor.value;

      const label = document.createElement("label");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = subject.id;
      checkbox.name = "subjectCheckbox";

      label.appendChild(checkbox);
      label.appendChild(document.createTextNode(" " + subject.subjects));
      container.appendChild(label);

      container.appendChild(document.createElement("br"));
      cursor.continue();
    }
  };
}

// Add selected subjects to secondTerm
document.getElementById("submitSubjects").addEventListener("click", async function () {
  const checkboxes = document.querySelectorAll("input[name='subjectCheckbox']:checked");

  if (checkboxes.length === 0) {
    alert("No subjects selected.");
    return;
  }

  let sessionID;
  let classID;
  try {
    sessionID = await getCurrentSessionId();
    classID = await getCurrentClassId();
  } catch (err) {
    alert(err.message);
    return;
  }

  const tx = db.transaction("secondTerm", "readwrite");
  const store = tx.objectStore("secondTerm");

  checkboxes.forEach((checkbox) => {
    store.add({
      subjectID: toInt(checkbox.value),
      studentID: toInt(userId),
      classID: toInt(classID),
      ca1: 0,
      ca2: 0,
      ca3: 0,
      ca4: 0,
      exam: 0,
      session: toInt(sessionID),
    });
  });

  tx.oncomplete = async () => {
    alert("Selected subjects saved.");
    await displayTable(); // refresh table only (no full page reload)
  };

  tx.onerror = () => {
    alert("Failed to save selected subjects.");
  };
});

// ======== Student Name ========

function studentNameDisplay() {
  const transaction = db.transaction("students", "readonly");
  const studentName = transaction.objectStore("students");

  studentName.openCursor().onsuccess = (event) => {
    const cursor = event.target.result;
    if (cursor) {
      const result = cursor.value;
      if (result.id === userId) {
        const student = document.getElementById("studentName");
        student.textContent = `${result.firstName} ${result.surName}`;
      }
      cursor.continue();
    }
  };
}

// ======== Table Display ========

async function displayTable() {
  let sessionID;
  try {
    sessionID = await getCurrentSessionId();
  } catch (err) {
    alert(err.message);
    return;
  }

  const transaction = db.transaction("secondTerm", "readonly");
  const secondTermStore = transaction.objectStore("secondTerm");

  const tbody = document.querySelector("#student-secondTerm tbody");
  tbody.innerHTML = "";

  secondTermStore.openCursor().onsuccess = (event) => {
    const cursor = event.target.result;
    if (!cursor) return;

    const record = cursor.value;

    if (toInt(record.studentID) === toInt(userId) && toInt(record.session) === toInt(sessionID)) {
      const row = document.createElement("tr");

      // id cell
      // const id = document.createElement("td");
      // id.textContent = record.id;
      // row.appendChild(id);

      // subject name lookup
      const subjectCell = document.createElement("td");
      row.appendChild(subjectCell);

      const subjectTx = db.transaction("subjectStore", "readonly");
      const subjectStore = subjectTx.objectStore("subjectStore");
      const subjectReq = subjectStore.get(toInt(record.subjectID));
      subjectReq.onsuccess = () => {
        const subject = subjectReq.result;
        subjectCell.textContent = subject ? subject.subjects : "Unknown subject";
      };

      // Editable cells (number inputs)
      const makeNumberInputCell = (value = 0) => {
        const td = document.createElement("td");
        const input = document.createElement("input");
        input.type = "number";
        input.min = "0";
        input.value = toInt(value);
        input.style.width = "4rem";
        td.appendChild(input);
        return { td, input };
      };

      const ca1 = makeNumberInputCell(record.ca1);
      const ca2 = makeNumberInputCell(record.ca2);
      const ca3 = makeNumberInputCell(record.ca3);
      // If you later need ca4, uncomment below and adjust totals
      // const ca4 = makeNumberInputCell(record.ca4);

      row.appendChild(ca1.td);
      row.appendChild(ca2.td);
      row.appendChild(ca3.td);
      // row.appendChild(ca4.td);

      const caSumCell = document.createElement("td");
      const calcCA = () => toInt(ca1.input.value) + toInt(ca2.input.value) + toInt(ca3.input.value); // + toInt(ca4.input.value)
      caSumCell.textContent = calcCA();
      caSumCell.style.fontWeight = "bold";
      row.appendChild(caSumCell);

      const exam = makeNumberInputCell(record.exam);
      row.appendChild(exam.td);

      const grandTotalCell = document.createElement("td");
      const calcGrand = () => calcCA() + toInt(exam.input.value);
      grandTotalCell.textContent = calcGrand();
      grandTotalCell.style.fontWeight = "bold";
      row.appendChild(grandTotalCell);

      const gradeCell = document.createElement("td");
      gradeCell.textContent = getGrade(calcGrand());
      row.appendChild(gradeCell);

      // Live recompute on input
      [ca1.input, ca2.input, ca3.input, exam.input].forEach((inp) =>
        inp.addEventListener("input", () => {
          caSumCell.textContent = calcCA();
          grandTotalCell.textContent = calcGrand();
          gradeCell.textContent = getGrade(calcGrand());
        })
      );

      // Actions
      const action = document.createElement("td");

      // EDIT (save)
      const editBtn = document.createElement("button");
      editBtn.textContent = "Edit";
      editBtn.addEventListener("click", async () => {
        // Require active sessionID (from latest student – your existing approach)
        if (!sessionID) {
          alert("No session registered! Please activate a session.");
          return;
        }

        // Check recharge (Gem)
        const tx = db.transaction("school", "readwrite");
        const store = tx.objectStore("school");
        const rechargeReq = store.get(1);

        rechargeReq.onsuccess = () => {
          const data = rechargeReq.result;
          if (!data) {
            alert("Please register your school.");
            return;
          }

          if (toInt(data.recharge) > 0) {
            // Deduct one gem
            data.recharge = toInt(data.recharge) - 1;
            store.put(data);

            // Update secondTerm record
            const updatesecondTerm = {
              id: toInt(record.id),
              studentID: toInt(userId),
              subjectID: toInt(record.subjectID),
              classID: toInt(record.classID),
              ca1: toInt(ca1.input.value),
              ca2: toInt(ca2.input.value),
              ca3: toInt(ca3.input.value),
              // ca4: toInt(ca4.input.value),
              exam: toInt(exam.input.value),
              session: toInt(sessionID),
            };

            const uTx = db.transaction("secondTerm", "readwrite");
            const secondTerm = uTx.objectStore("secondTerm");
            const putReq = secondTerm.put(updatesecondTerm);

            putReq.onsuccess = async () => {
                displayRecharge(); // refresh gem count
                await displayTable(); // Refresh the row display
            };
            putReq.onerror = () => {
              alert("Error updating score.");
            };
          } else {
            alert("Gem " + data.recharge + " — Please increase Gem.");
          }
        };

        rechargeReq.onerror = () => {
          console.error("Error reading recharge data");
        };
      });
      action.appendChild(editBtn);

      // DELETE
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.style.background = "red";
      deleteBtn.style.border = "none";

      deleteBtn.addEventListener("click", () => {
        const dTx = db.transaction("secondTerm", "readwrite");
        const ft = dTx.objectStore("secondTerm");
        const delReq = ft.delete(toInt(record.id));

        delReq.onsuccess = () => {
          // NOTE: Your original code deducts a gem on delete. Keeping that behavior.
          const tx2 = db.transaction("school", "readwrite");
          const store2 = tx2.objectStore("school");
          const rechargeReq2 = store2.get(1);

          rechargeReq2.onsuccess = async (e2) => {
            const data2 = e2.target.result;
            if (!data2) {
              // no school data
              await displayTable();
              return;
            }

            if (toInt(data2.recharge) > 0) {
              data2.recharge = toInt(data2.recharge) - 1;
              store2.put(data2);
            } else {
              alert("Gem " + data2.recharge + " — Please increase Gem.");
            }

            alert("Subject Deleted!");
            displayRecharge(); // refresh gem count
            await displayTable();
          };

          rechargeReq2.onerror = async () => {
            console.error("Error using recharge data");
            await displayTable();
          };
        };

        delReq.onerror = () => {
          console.error("Subject delete error");
        };
      });
      action.appendChild(deleteBtn);

      row.appendChild(action);
      tbody.appendChild(row);
    }

    cursor.continue();
  };
}
