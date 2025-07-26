let db;

import { DB_NAME, DB_VERSION } from "./app.js";


    window.onload = function () {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = function (e) {
        db = e.target.result;
      };

      request.onsuccess = function (e) {
        db = e.target.result;
        loadSchoolInfo();
      };

      request.onerror = function (e) {
        console.error("DB error:", e.target.error);
      };

      document.getElementById("saveButton").addEventListener("click", saveSchoolInfo);
    };

    function saveSchoolInfo() {
      const name = document.getElementById("schoolName").value;
      const logoFile = document.getElementById("logoInput").files[0];
      const extraFile = document.getElementById("extraImageInput").files[0];

      if (!name || !logoFile || !extraFile) {
        alert("Please provide all fields.");
        return;
      }

      const reader1 = new FileReader();
      const reader2 = new FileReader();

      reader1.onload = function (e1) {
        const logoBlob = new Blob([e1.target.result], { type: logoFile.type });

        reader2.onload = function (e2) {
          const extraBlob = new Blob([e2.target.result], { type: extraFile.type });

          const transaction = db.transaction(["school"], "readwrite");
          const store = transaction.objectStore("school");

          const data = {
            name,
            logo: logoBlob,
            extra: extraBlob,
            recharge: 50
        };
        store.put(data, 1);  // ✅ supplies the key manually

          transaction.oncomplete = loadSchoolInfo;
        };

        reader2.readAsArrayBuffer(extraFile);
      };

      reader1.readAsArrayBuffer(logoFile);
    }

    function loadSchoolInfo() {
      const transaction = db.transaction(["school"], "readonly");
      const store = transaction.objectStore("school");
      const request = store.get(1);

      request.onsuccess = function (e) {
        const data = e.target.result;
        if (data) {
          document.getElementById("storedName").textContent = data.name;
          document.getElementById("storedLogo").src = URL.createObjectURL(data.logo);
          document.getElementById("storedExtraImage").src = URL.createObjectURL(data.extra);
        }
      };
    }