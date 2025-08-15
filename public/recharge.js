let db;
let gems = 0;

const gemDisplay = document.getElementById('gem-count');
const rewardMsg = document.getElementById('reward-msg');
const adContainer = document.getElementById('ad-container');
const viewAdBtn = document.getElementById('view-ad-btn');
const timerDisplay = document.getElementById('timer');

//open indexedDB
import { DB_NAME, DB_VERSION } from './app.js';

const request = indexedDB.open(DB_NAME, DB_VERSION);

request.onupgradeneeded = (event)=>{
    db = event.target.result
}

request.onsuccess = function(e) {
    db = e.target.result;
    loadGems();
}

request.onerror = function (){
    console.log("Error opening database");
}

//Load gems from indexedDB
function loadGems(){
    const tx = db.transaction('school', 'readonly');
    const store = tx.objectStore('school');
    const getReq = store.get(1);

    getReq.onsuccess = function(){
        if (getReq.result){
            gems = getReq.result.recharge || 0; //Ensure number
        }else{
            gems = 0;
            saveGems(); //Create entry if missing
        }
        gemDisplay.textContent = gems;
        viewAdBtn.disabled = false; //enable button after loading
    }
};

//Save gems to IndexedDB
function saveGems(){
    const tx = db.transaction("school", "readwrite");
    const store = tx.objectStore("school");
    store.put({id: 1, recharge: Number(gems)})
}

//Button click event
viewAdBtn.addEventListener('click', ()=>{
    rewardMsg.textContent = "";
    adContainer.style.display = "block";
    viewAdBtn.disabled = true;

    let countdown = 5;
    timerDisplay.textContent = countdown;

    let interval = setInterval(()=>{
        countdown--;
        timerDisplay.textContent = countdown;

        if(countdown <= 0){
            clearInterval(interval);
            adContainer.style.display = "none";
            giveReward(7);
            viewAdBtn.disabled = false;
        }
    }, 1000)
});

function giveReward(amount){
    gems += amount;
    saveGems();
    gemDisplay.textContent = gems;
    rewardMsg.textContent = `You earned ${amount} gems!`;
}
