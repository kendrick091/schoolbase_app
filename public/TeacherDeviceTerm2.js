let db;
import { DB_NAME,DB_VERSION } from './app.js';

const request = indexedDB.open(DB_NAME, DB_VERSION);
const STORES = ["secondTerm", "attendance2"];

request.onupgradeneeded = (event)=>{
    db = event.target.result;
}

request.onsuccess = (event)=>{
    db = event.target.result;
    console.log(`Database opened successfully`)
}

request.onerror = ()=>{
    console.log("Error opening database!")
}

// ====== EXPORT FUNCTION (Teacher) ======
function exportsecondTermData() {
    const request = indexedDB.open(DB_NAME);

    request.onsuccess = event => {
        const db = event.target.result;
        const exportData = {};
        let completed = 0;

        STORES.forEach(storeName => {
            if (!db.objectStoreNames.contains(storeName)) {
                exportData[storeName] = [];
                if (++completed === STORES.length) saveFile(exportData);
                return;
            }

            const tx = db.transaction(storeName, "readonly");
            const store = tx.objectStore(storeName);
            const getAllReq = store.getAll();

            getAllReq.onsuccess = () => {
                exportData[storeName] = getAllReq.result;
                if (++completed === STORES.length) saveFile(exportData);
            };
        });
    };
}

function saveFile(data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${DB_NAME} SecondTermData.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// ====== IMPORT & MERGE FUNCTION (Admin) ======
function importAndMergesecondTerm(data) {
    const request = indexedDB.open(DB_NAME);

    request.onsuccess = event => {
        const db = event.target.result;

        STORES.forEach(storeName => {
            if (!data[storeName] || !Array.isArray(data[storeName])) return;

            const tx = db.transaction(storeName, "readwrite");
            const store = tx.objectStore(storeName);

            data[storeName].forEach(record => {
                const getReq = store.get(record.id);

                getReq.onsuccess = () => {
                    if (getReq.result) {
                        // Update existing record
                        const updated = { ...getReq.result, ...record };
                        store.put(updated);
                    } else {
                        // Add new record
                        store.add(record);
                    }
                };
            });
        });

        alert("Second Term Data merged successfully!");
    };
}

// ====== EVENT LISTENERS ======
document.getElementById("exportBtn2")?.addEventListener("click", exportsecondTermData);


document.getElementById("importsecondTermBtn")?.addEventListener("click", () => {
    document.getElementById("importsecondTermFile").click();
});

document.getElementById("importsecondTermFile")?.addEventListener("change", async e => {
    const file = e.target.files[0];
    if (!file) return;

    try {
        const text = await file.text();
        const data = JSON.parse(text);
        importAndMergesecondTerm(data);
    } catch {
        alert("Invalid file format!");
    }
});