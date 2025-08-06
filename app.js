export const DB_NAME = "DBSchool";
export const DB_VERSION = 1;

let db;

const request = indexedDB.open(DB_NAME, DB_VERSION);

function openDataBase(){

    request.onupgradeneeded = function(event) {
        db = event.target.result;

        //School Name
        if(!db.objectStoreNames.contains('school')){
            const schoolNameStore = db.createObjectStore('school',{keyPath: 'id', autoIncrement: false});
        }

        //Session Store
        if(!db.objectStoreNames.contains('session')){
            const sessionStore = db.createObjectStore('session', {keyPath: 'id', autoIncrement: true});
        }

        //Student Store
        if(!db.objectStoreNames.contains('students')){
            const studentStore = db.createObjectStore('students', {keyPath: 'id', autoIncrement: true});
            studentStore.createIndex('classID', 'classID', {unique: false});
            studentStore.createIndex('sessionID','sessionID',{unique: false});
        }

        //Teacher store
        if(!db.objectStoreNames.contains('teachers')){
            const teacherStore = db.createObjectStore('teachers', {keyPath: 'id', autoIncrement: true});
            teacherStore.createIndex('classID', 'classID', {unique: false})
        }

        //Class store
        if(!db.objectStoreNames.contains('classes')){
            const classStore = db.createObjectStore('classes', {keyPath: 'id', autoIncrement: true});
            classStore.createIndex('className', 'className', {unique: false});
        }

        //Attendance store
        if(!db.objectStoreNames.contains('attendance')){
            const attendanceStore = db.createObjectStore('attendance', {keyPath: 'id', autoIncrement: true})
            attendanceStore.createIndex('studentID', 'studentID', {unique: false});
            attendanceStore.createIndex('date','date',{unique: false});
            attendanceStore.createIndex('sessionID','sessionID',{unique: false});
        }
        if(!db.objectStoreNames.contains('attendance2')){
            const attendanceStore = db.createObjectStore('attendance2', {keyPath: 'id', autoIncrement: true})
            attendanceStore.createIndex('studentID', 'studentID', {unique: false});
            attendanceStore.createIndex('date','date',{unique: false});
            attendanceStore.createIndex('sessionID','sessionID',{unique: false});
        }
        if(!db.objectStoreNames.contains('attendance3')){
            const attendanceStore = db.createObjectStore('attendance3', {keyPath: 'id', autoIncrement: true})
            attendanceStore.createIndex('studentID', 'studentID', {unique: false});
            attendanceStore.createIndex('date','date',{unique: false});
            attendanceStore.createIndex('sessionID','sessionID',{unique: false});
        }

        //Subject store
        if(!db.objectStoreNames.contains('subjectStore')){
            const subjectStore = db.createObjectStore('subjectStore', {keyPath: 'id', autoIncrement: true});
        }

        //FirstTerm store
        if(!db.objectStoreNames.contains('firstTerm')){
            const firstTermStore = db.createObjectStore('firstTerm', {keyPath: 'id', autoIncrement: true});
            firstTermStore.createIndex('studentId', 'studentId', {unique: false});
            firstTermStore.createIndex('subjectId', 'subjectId', {unique: false});
            firstTermStore.createIndex('sessionID','sessionID',{unique: false});

        }

        //secondTerm store
        if(!db.objectStoreNames.contains('secondTerm')){
            const secondTermStore = db.createObjectStore('secondTerm', {keyPath: 'id', autoIncrement: true});
            secondTermStore.createIndex('studentId', 'studentId', {unique: false});
            secondTermStore.createIndex('subjectId', 'subjectId', {unique: false});
            secondTermStore.createIndex('sessionID','sessionID',{unique: false});
        }

        //thirdTerm store
        if(!db.objectStoreNames.contains('thirdTerm')){
            const thirdTermStore = db.createObjectStore('thirdTerm', {keyPath: 'id', autoIncrement: true});
            thirdTermStore.createIndex('studentId', 'studentId', {unique: false});
            thirdTermStore.createIndex('subjectId', 'subjectId', {unique: false});
            thirdTermStore.createIndex('sessionID','sessionID',{unique: false});
        }
    }
    request.onerror = function(event){
        console.error("Database errorL", event.target.error);
    };

    request.onsuccess = function(event){
        db = event.target.result;
        console.log("Database opened successfully")
    }
}

openDataBase();
