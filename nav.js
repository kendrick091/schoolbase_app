let navUl = document.getElementById('navUl');

let feesList = document.createElement('li');
let teacherList = document.createElement('li');
let studentList = document.createElement('li');
let subjectList = document.createElement('li');
let classesList = document.createElement('li');
let attendanceList = document.createElement('li');

let feesListBtn = document.createElement('button')
let teacherListBtn = document.createElement('button')
let studentListBtn = document.createElement('button')
let subjectListBtn = document.createElement('button')
let classesListBtn = document.createElement('button')
let attendanceBtn = document.createElement('button')

feesListBtn.textContent = 'FEES/Management';
// myButton.classList.add("my-styled-button"); // Add a class
teacherListBtn.textContent = 'TEACHERS';
studentListBtn.textContent = 'STUDENTS';
subjectListBtn.textContent = 'SUBJECTS';
classesListBtn.textContent = 'CLASSES';
attendanceBtn.textContent = 'ATTENDANCE';

feesList.appendChild(feesListBtn);
classesList.appendChild(classesListBtn);
teacherList.appendChild(teacherListBtn);
studentList.appendChild(studentListBtn);
subjectList.appendChild(subjectListBtn);
attendanceList.appendChild(attendanceBtn);

feesListBtn.addEventListener('click', function(){
    window.location.href = `index.html`;
})

classesListBtn.addEventListener('click', function(){
    window.location.href = `classes.html`;
})

teacherListBtn.addEventListener('click', function(){
    window.location.href = `teacher.html`;
})

studentListBtn.addEventListener('click', function(){
    window.location.href = `student.html`;
})

subjectListBtn.addEventListener('click', function(){
    window.location.href = `subject.html`;
})

attendanceBtn.addEventListener('click', function(){
    window.location.href = `attendanceEntry.html`;
})

navUl.appendChild(feesList);
navUl.appendChild(classesList)
navUl.appendChild(teacherList)
navUl.appendChild(subjectList)
navUl.appendChild(studentList)
navUl.appendChild(attendanceList)

// nav.js
const links = document.querySelectorAll('.nav-link');
links.forEach(link => {
  if (link.href === window.location.href) {
    link.classList.add('active');
  }
});



