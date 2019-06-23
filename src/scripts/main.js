import { brotliDecompressSync } from "zlib";

let draggedEl = document.querySelector(".note"),
    grabPointX,
    grabPointY,
    saveNote,
    deleteNote, 
    notesObj = {};

function onDragStart(ev) {
  let boundingClientRect;
  if(ev.target.classList.contains("note__bar")) {
    draggedEl = this;
    boundingClientRect = draggedEl.getBoundingClientRect();
    grabPointX = boundingClientRect.left - ev.clientX;
    grabPointY = boundingClientRect.top - ev.clientY;
  }
}

function onDrag(ev) {
  if(draggedEl) {
    let posX = ((ev.clientX + grabPointX) < 0)? 0 : (ev.clientX + grabPointX),
        posY = ((ev.clientY + grabPointY) < 0)? 0 : (ev.clientY + grabPointY);
    draggedEl.style.transform = `translate(${posX}px, ${posY}px)`;
  }
}

function onDragEnd() {
  if(draggedEl) {
    //console.log(getNoteObject(draggedEl));
    saveNote(getNoteObject(draggedEl));    
  }
  draggedEl = null;
  grabPointX = null;
  grabPointY = null;
}



function getNoteObject(el) {
  let textarea = el.querySelector(".note__textarea");
  return {
    content: textarea.value,
    id: el.id,
    transformCSSorigin: el.style.transform,
    width: el.offsetWidth,
    height: el.offsetHeight-21
  };
}

function createNote(options) {
  const BOUNDARIES = 400;
  let randomX = Math.random() * BOUNDARIES, randomY = Math.random() * BOUNDARIES,
      calculatedTime = Math.pow(randomX, 2) + Math.pow(randomY, 2),
      noteConfig = options || {
        content: "",
        id: "note_" + new Date().getTime(),
        transformOrigin: `translate(${randomX}px, ${randomY}px)`,
        width: "221",
        height: "120"
      };
  calculatedTime = Math.sqrt(calculatedTime);
  //console.log(noteConfig);
  let noteEl = document.createElement('div'),
      barEl = document.createElement('div'),
      textareaEl = document.createElement('textarea'),
      deleteBtnEl = document.createElement('button');

  function onDelete() {
    deleteNote(noteEl.id);
    noteEl.style.transition = "all 0.3s ease-out";
    noteEl.style.transform += " scale(0)";
    // noteEl.classList.add("deleted");
  }
  function onSave() {
    // console.log(getNoteObject(noteEl));
    saveNote(getNoteObject(noteEl));
  }
  let resizeCounter = 0;
   let onNoteResize = function() {
    if (noteEl.height != noteEl.offsetHeight || noteEl.width != noteEl.offsetWidth) {
      resizeCounter++;
      if(resizeCounter == 10) {
        saveNote(getNoteObject(noteEl));
        resizeCounter = 0;
      }
    }
  };


  noteEl.id = noteConfig.id;
  textareaEl.value = noteConfig.content;

  deleteBtnEl.addEventListener("click", onDelete);
  textareaEl.addEventListener("change", onSave);
  
  noteEl.classList.add("note");
  barEl.classList.add("note__bar");
  textareaEl.classList.add("note__textarea");
  deleteBtnEl.classList.add("note__bar-delete");
  
  deleteBtnEl.innerText = "x";
  barEl.appendChild(deleteBtnEl);
  noteEl.appendChild(barEl);
  noteEl.appendChild(textareaEl);

  noteEl.addEventListener("mousedown", onDragStart, false);



  textareaEl.addEventListener("resize", onNoteResize, false);
  
  document.querySelector(".notes").appendChild(noteEl);
  textareaEl.style.height = noteConfig.height + "px";
  textareaEl.style.width = noteConfig.width + "px";
  noteEl.style.transition = `transform ${(calculatedTime/1000)+0.2}s ease-in`;
  

  let promise = new Promise(function (resolve, reject) {
    setTimeout(() => {
      noteEl.style.transform = noteConfig.transformOrigin;
      setTimeout(() => {
        noteEl.style.transition = "none";
        new ResizeObserver(onNoteResize).observe(textareaEl);
        resolve(noteEl);
      }, (calculatedTime + 300));
    }, 300);
  });
  return promise;
}


function onAddBtnClick() {
  createNote().then(function (note) {
    console.log(note);
    saveNote(getNoteObject(note));
  });
}

function init() {
  const addBtn = document.querySelector(".add-note");
  addBtn.addEventListener("click", onAddBtnClick, false);
  
  document.addEventListener("mousemove", onDrag, false);
  document.addEventListener("mouseup", onDragEnd, false);
}

function testLocalStorage() {
  let foo = "foo";
  try {
    localStorage.setItem(foo, foo);
    localStorage.removeItem(foo);
    return true;
  } catch(err) {
    console.log(err);
    return false;
  }
}

if(testLocalStorage()) {
  saveNote = function(note) {
    if(note) notesObj[note.id] = note;
    localStorage.setItem("notes", JSON.stringify(notesObj));
  };
  deleteNote = function (noteId) {
    delete notesObj[noteId];
    saveNote();
  };
  function loadNotes() {
    notesObj = JSON.parse(localStorage.getItem("notes"));
    notesObj = (!notesObj)? {} : notesObj;
    for(let note in notesObj) {
      createNote({
        id: notesObj[note].id,
        content: notesObj[note].content,
        transformOrigin: notesObj[note].transformCSSorigin,
        width: notesObj[note].width,
        height: notesObj[note].height
      });
    }
  }
  loadNotes();
}


init();