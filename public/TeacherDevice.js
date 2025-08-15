let db;
import { DB_NAME,DB_VERSION } from './app.js';

const request = indexedDB.open(DB_NAME, DB_VERSION);
const STORES = ["firstTerm", "attendance"];
// const STORES2 = ["secondTerm", "attendance2"];

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

 // Click button → open file picker
    document.getElementById("importBtn").addEventListener("click", () => {
        document.getElementById("importFile").click();
    });

    // Handle file selection
    document.getElementById("importFile").addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const text = await file.text();
            const data = JSON.parse(text);
            console.log("File loaded:", data);
            importIndexedDB(DB_NAME, data);
        } catch (err) {
            alert("Invalid file or format!");
            console.error(err);
        }
    });

    function importIndexedDB(DB_NAME, data) {
    const storeNames = Object.keys(data);
    console.log("Stores to import:", storeNames);

    const request = indexedDB.open(DB_NAME, DB_VERSION); // use existing version

    request.onsuccess = event => {
        const db = event.target.result;
        console.log("DB opened successfully for import");

        const tx = db.transaction(storeNames, "readwrite");

        storeNames.forEach(name => {
            if (!db.objectStoreNames.contains(name)) {
                console.error(`Store "${name}" does not exist in DB`);
                return;
            }

            const store = tx.objectStore(name);
            store.clear().onsuccess = () => {
                console.log(`Cleared store: ${name}`);
                if (Array.isArray(data[name])) {
                    data[name].forEach(record => {
                        store.add(record);
                    });
                    console.log(`Added ${data[name].length} records to store: ${name}`);
                }
            };
        });

        tx.oncomplete = () => {
            console.log("✅ Import complete");
            alert("Database updated successfully!");
        };

        tx.onerror = err => {
            console.error("Transaction error:", err);
            alert("Error updating database");
        };
    };

    request.onerror = () => {
        console.error("Error opening database");
        alert("Error opening database!");
    };
}


// ====== EXPORT FUNCTION (Teacher) ======
function exportFirstTermData() {
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
    a.download = `${DB_NAME} firstTermData.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// ====== IMPORT & MERGE FUNCTION (Admin) ======
function importAndMergeFirstTerm(data) {
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

        alert("First Term Data merged successfully!");
    };
}

// ====== EVENT LISTENERS ======
document.getElementById("exportBtn")?.addEventListener("click", exportFirstTermData);


document.getElementById("importFirstTermBtn")?.addEventListener("click", () => {
    document.getElementById("importFirstTermFile").click();
});

document.getElementById("importFirstTermFile")?.addEventListener("change", async e => {
    const file = e.target.files[0];
    if (!file) return;

    try {
        const text = await file.text();
        const data = JSON.parse(text);
        importAndMergeFirstTerm(data);
    } catch {
        alert("Invalid file format!");
    }
});