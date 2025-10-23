import { DB_NAME, DB_VERSION } from "./app.js";

let db;

// Open or create the database
const request = indexedDB.open(DB_NAME, DB_VERSION);

request.onupgradeneeded = (event) => {
  db = event.target.result;

  // Create store if missing
  if (!db.objectStoreNames.contains("termResumption")) {
    const store = db.createObjectStore("termResumption", {
      keyPath: "id",
      autoIncrement: true,
    });
    store.createIndex("sessionID", "sessionID", { unique: true });
  }
};

request.onsuccess = (event) => {
  db = event.target.result;
  loadSessions();
};

request.onerror = () => {
  console.error("❌ Error opening DB for termResumption");
};

// ================================
// Load session dropdown
// ================================
function loadSessions() {
  const tx = db.transaction("session", "readonly");
  const store = tx.objectStore("session");
  const request = store.openCursor();

  const sessionSelect = document.getElementById("sessionID");
  sessionSelect.innerHTML = `<option value="">Select Session</option>`;

  request.onsuccess = (event) => {
    const cursor = event.target.result;
    if (cursor) {
      const option = document.createElement("option");
      option.value = cursor.value.id;
      option.textContent = cursor.value.session;
      sessionSelect.appendChild(option);
      cursor.continue();
    }
  };
}

// ================================
// Save dates to DB
// ================================
document.getElementById("saveResumptionDate").addEventListener("click", () => {
  const sessionID = document.getElementById("sessionID").value;

  if (!sessionID) {
    alert("Please select a session!");
    return;
  }

  const data = {
    sessionID: Number(sessionID),
    firstTerm: {
      vacation: document.getElementById("vacationDate").value,
      resumption: document.getElementById("resumptionDate").value,
    },
    secondTerm: {
      vacation: document.getElementById("vacationDate2").value,
      resumption: document.getElementById("resumptionDate2").value,
    },
    thirdTerm: {
      vacation: document.getElementById("vacationDate3").value,
      resumption: document.getElementById("resumptionDate3").value,
    },
    savedAt: new Date().toISOString(),
  };

  const tx = db.transaction("termResumption", "readwrite");
  const store = tx.objectStore("termResumption");
  const index = store.index("sessionID");
  const checkRequest = index.get(Number(sessionID));

  checkRequest.onsuccess = (e) => {
    const existing = e.target.result;

    if (existing) {
      data.id = existing.id; // keep ID to overwrite
      store.put(data);
      alert("✅ Updated vacation & resumption dates successfully!");
    } else {
      store.add(data);
      alert("✅ Saved vacation & resumption dates successfully!");
    }

    // Refresh display after saving
    setTimeout(() => loadExistingData(), 300);
  };
});

// ================================
// Load existing data automatically into form
// ================================
function loadExistingData() {
  const sessionID = Number(document.getElementById("sessionID").value);
  if (!sessionID) return;

  const tx = db.transaction("termResumption", "readonly");
  const store = tx.objectStore("termResumption");
  const index = store.index("sessionID");
  const req = index.get(sessionID);

  req.onsuccess = (event) => {
    const record = event.target.result;

    if (record) {
      document.getElementById("vacationDate").value = record.firstTerm?.vacation || "";
      document.getElementById("resumptionDate").value = record.firstTerm?.resumption || "";
      document.getElementById("vacationDate2").value = record.secondTerm?.vacation || "";
      document.getElementById("resumptionDate2").value = record.secondTerm?.resumption || "";
      document.getElementById("vacationDate3").value = record.thirdTerm?.vacation || "";
      document.getElementById("resumptionDate3").value = record.thirdTerm?.resumption || "";
    } else {
      document.querySelectorAll('input[type="text"]').forEach((i) => (i.value = ""));
    }
  };
}

// ================================
// Auto-load when session changes
// ================================
document.getElementById("sessionID").addEventListener("change", () => {
  loadExistingData();
});
