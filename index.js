let db;

import { DB_NAME, DB_VERSION } from "./app.js";

const request = indexedDB.open(DB_NAME, DB_VERSION);

request.onerror = () => {
  console.log("Error opening database");
};

request.onsuccess = (event) => {
  db = event.target.result;
  countStudentsByGender();
};

function countStudentsByGender() {
  const tx = db.transaction("students", "readonly");
  const store = tx.objectStore("students");

  let total = 0;
  let boys = 0;
  let girls = 0;

  store.openCursor().onsuccess = function (event) {
    const cursor = event.target.result;
    if (cursor) {
      const student = cursor.value;
      total++;

      const gender = student.gender?.toLowerCase(); // Ensure it's lowercase
      if (gender === "male" || gender === "boy") {
        boys++;
      } else if (gender === "female" || gender === "girl") {
        girls++;
      }

      cursor.continue();
    } else {
      // Finished looping — you can display or return the counts
      console.log("Total Students:", total);
      console.log("Boys:", boys);
      console.log("Girls:", girls);

      // Example: Display in HTML
      document.getElementById("totalCount").textContent = total;
      document.getElementById("boyCount").textContent = boys;
      document.getElementById("girlCount").textContent = girls;
    }
  };
}
