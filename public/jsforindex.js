

let data,phrasesData, groups;
(async () => {
  const res = await fetch("/getAllSongAndLyrics");
  const res2 = await fetch("/getAllGroups");
  const res3 = await fetch("/getAllPhrases");
  data = await res.json();
  groups = await res2.json();
  phrasesData = await res3.json();
})();

function openTab(tabName) {
  var i, tabcontent, tabbuttons;
  tabcontent = document.getElementsByClassName("tab-content");
  tabbuttons = document.getElementsByClassName("tab-button");

  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  for (i = 0; i < tabbuttons.length; i++) {
    tabbuttons[i].classList.remove("active-tab");
  }

  document.getElementById(tabName).style.display = "block";
  document
    .querySelector(`[onclick="openTab('${tabName}')"]`)
    .classList.add("active-tab");
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
  document.getElementById("overlay").style.display = "none";
  document
    .getElementById("indexesTableContainer")
    .classList.add("hidden");
  document.getElementById("indexesTableContainer").style.display = "none";
}

function showModalCreationAndDelete(title) {
const modal = document.getElementById("modal");
const modalMessage = document.getElementById("modalMessage");
modalMessage.textContent = title; // Set the text content of modal message
const closeButton = document.createElement("button");
closeButton.textContent = "Close";
closeButton.className = "text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:bg-gradient-to-l focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2";
closeButton.onclick = function() {
  modal.style.display = "none"; // Hide the modal when close button is clicked
};

// Clear previous modal contents (especially important if there are previous buttons)
modal.innerHTML = '';
modal.appendChild(modalMessage);
modal.appendChild(closeButton);

modal.style.display = "block"; // Show the modal
}

function showGroupSelectorModal() {
  // Creating the select element for group selection
  document.querySelector('.abc').addEventListener('click', closeModal);
  const selectGroup = document.createElement("select");
  selectGroup.id = "groupSelect";
  groups.forEach((group) => {
    const option = document.createElement("option");
    option.value = group;
    option.textContent = group;
    selectGroup.appendChild(option);
  });

  // Clearing any existing content in the modal and setting up new content
  const modalMessageDiv = document.getElementById("modalMessage");
  modalMessageDiv.innerHTML = "Choose Group:"; // Clears previous content
  modalMessageDiv.appendChild(selectGroup);

  // Creating the submit button
  const submitButton = document.createElement("button");
  submitButton.textContent = "Submit";
  submitButton.className =
    "text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:bg-gradient-to-l focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2";
  submitButton.onclick = function () {
    (async () => {
      const groupName = document.getElementById("groupSelect").value;
      const res = await fetch("/IndexesForGroupWords", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          groupName,
        }),
      });
      const arr = await res.json();
      if (arr.length == 0) {
        showModalCreationAndDelete("Group has no words!");
      }
      else showModalWithData(arr);
    })();

    closeModal(); // Assuming you want to close the modal after submission
  };

  // Adding the submit button to the modal
  modalMessageDiv.appendChild(submitButton);

  // Displaying the modal
  showModal("Select a Group");
}

function showModalWithData(indexData) {
  const data = indexData;
  const tableBody = document.getElementById("tableForGroupWordIndexes");
  groupNameDisplay.innerText = "Indexes of words for the group '"+data[0].group_name+"'"; // Clear existing rows

  
  data.forEach((item) => {
    const tr = document.createElement("tr");
    const tdSongName = document.createElement("td");
    const tdRow = document.createElement("td");
    const tdColumn = document.createElement("td");
    const tdWord = document.createElement("td");
    tr.className = "bg-blue-600 border-b border-blue-400";
    tdSongName.textContent = item.song_name;
    tdRow.textContent = item.row;
    tdColumn.textContent = item.column;
    tdWord.textContent = item.word;
    tdSongName.className =
      "px-6 py-4 font-medium bg-blue-500 text-blue-50 whitespace-nowrap dark:text-blue-100";
    tdColumn.className =
      "px-6 py-4 font-medium bg-blue-500 text-blue-50 whitespace-nowrap dark:text-blue-100";
    tdRow.className =
    "px-6 py-4 font-medium bg-blue-500 text-blue-50 whitespace-nowrap dark:text-blue-100";
    tdWord.className =
    "px-6 py-4 font-medium bg-blue-500 text-blue-50 whitespace-nowrap dark:text-blue-100";
    
    tr.appendChild(tdSongName);
    tr.appendChild(tdWord);
    tr.appendChild(tdRow);
    tr.appendChild(tdColumn);

    tableBody.appendChild(tr);
  });

  // Show the modal and overlay
  // Ensure the table is visible
  // document
  //   .getElementById("indexesTableContainer")
  //   .classList.remove("hidden");
  document.getElementById("indexesTableContainer").style.display =
    "block";
  document
    .getElementById("indexesTableContainer")
    .classList.remove("hidden");

  document.getElementById("overlay").style.display = "block";
}

function showModal(title) {
  // document.getElementById("modalTitle").textContent = title;
  document.getElementById("modal").style.display = "block";
  document.getElementById("overlay").style.display = "block";
}

function showPhraseModal() {
  const songs = [];
  let i = 0;
  for (const [k, v] of Object.entries(data)) {
    songs.push({ name: k, lyrics: v, id: ++i });
  }
  const selectSong = document.createElement("select");
  selectSong.id = "songSelect";
  songs.forEach((song) => {
    const option = document.createElement("option");
    option.value = song.id;
    option.textContent = song.name;
    selectSong.appendChild(option);
  });

  const modalMessageDiv = document.getElementById("modalMessage");
 
  modalMessageDiv.innerHTML = "Choose a song to get a phrase from:";
  modalMessageDiv.appendChild(selectSong);
  
  // Create and append the Choose button
  const chooseButton = document.createElement("button");
  chooseButton.textContent = "Choose!";
  chooseButton.className =
    "text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:bg-gradient-to-l focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2";
  chooseButton.onclick = function () {
    const selectedSongId = document.getElementById("songSelect").value;
    
    const selectedSong = songs.find(
      (song) => song.id.toString() === selectedSongId
    );
    const selectedSongName = selectedSong.name ;
    // Create a lyrics box and set its content
    const lyricsBox = document.createElement("div");
    lyricsBox.className = "lyrics-box";
    lyricsBox.style.whiteSpace = 'pre-wrap';
    lyricsBox.textContent = selectedSong.lyrics; // Display the lyrics

    // Split lyrics into words and filter out duplicates
    const selectPhrase = document.createElement("input");
    selectPhrase.type = "text"; // Ensure it's set as a text input
    selectPhrase.placeholder = "Enter phrase"; // Set placeholder text
    selectPhrase.id = "phraseInput"; // Assign an ID for easy access
    // Clear previous dynamic content and display new ones
    modalMessageDiv.innerHTML = "Choose a song to get a phrase from:";
    modalMessageDiv.appendChild(selectSong); // Re-add select to keep it visible
    modalMessageDiv.appendChild(chooseButton);
    modalMessageDiv.appendChild(lyricsBox);
    modalMessageDiv.appendChild(selectPhrase);

    // Create and append the Add Word button only after a song is chosen
    const addPhraseButton = document.createElement("button");
    addPhraseButton.textContent = "Add Phrase";
    addPhraseButton.className =
      "text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:bg-gradient-to-l focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2";
    addPhraseButton.onclick = function () {
      let phrase = document.getElementById('phraseInput').value.trim();
     
      //check for illegal phrases with regex
      let escapedPhrase = phrase.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      let regex = new RegExp(`(^|\\s)${escapedPhrase}(\\s|$)`, 'i'); 
      if (!regex.test(lyricsBox.textContent)) {
        showModalCreationAndDelete("illegal phrase");
        return;
      }
          // Check if the phrase contains a space
    if (!phrase.trim().includes(" ")) {
      showModalCreationAndDelete("Phrase must contain at least two words.");
      return;
    }
      // check if phrase already exists
      const phraseExists = phrasesData.some(phraseItem =>
         phraseItem.phrase_txt.toLowerCase() === phrase);
      if (phraseExists) {
        showModalCreationAndDelete("Duplicate phrase failed to create.");
        phrase = "";
        return;
      }
      let songName = selectedSongName;
      console.log(songName);
      let songId = selectedSongId;
      (async () => {
        const res = await fetch("/addPhrase", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            songName,
            phrase,
          }),
        });


      const object = await res.json();
      showModalCreationAndDelete(object.message);
      })();
     
    };
    
    modalMessageDiv.appendChild(addPhraseButton); // Now the button appears only after choosing a song
  };

  modalMessageDiv.appendChild(chooseButton);

  // Display the modal with the appropriate settings
  showModal("Select a Song to choose a Phrase from");
}

async function showSearchPhraseModal() {
    const res3 = await fetch("/getAllPhrases");
    const phrases = await res3.json();

  const modalMessageDiv2 = document.getElementById("modalMessage");
  // Proceed with other modal setup as already defined

  // Create the select element for songs
  const selectPhrase = document.createElement("select");
  selectPhrase.id = "selectPhrase";
  phrases.forEach((phrase) => {
    const option = document.createElement("option");
    option.value = phrase.phrase_ID;
    option.textContent = phrase.phrase_txt;
    selectPhrase.appendChild(option);
  });

  // Clear previous contents and append the new selects
  const modalMessageDiv = document.getElementById("modalMessage");
  modalMessageDiv.innerHTML = "Choose a phrase to see its performances:";
  modalMessageDiv.appendChild(selectPhrase);

  // Create and append the Choose button
  const chooseButton = document.createElement("button");
  chooseButton.textContent = "Choose!";
  chooseButton.className =
    "text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:bg-gradient-to-l focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2";
  chooseButton.onclick = function () {
    const selectedPhraseId = selectPhrase.value;  // Get the selected phrase ID from the dropdown
    const selectedPhraseValue = selectPhrase.options[selectPhrase.selectedIndex].text; // Get the selected phrase text
    // Create a lyrics box and set its content
    const lyricsBox = document.createElement("div");
    lyricsBox.className = "lyrics-box";
 (async () => {
       const res =  await fetch("/showPhrase", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            selectedPhraseId,
            selectedPhraseValue,
          }),
        });
        const object = await res.json();
        console.log(object);
        for (let i = 0 ; i < object.length ; i++){
          let paragraphText = object[i].text;
          console.log(paragraphText);
// Replace the selected phrase in the paragraph with the same phrase wrapped in <strong> tags
// This assumes 'selectedPhraseValue' is the phrase you want to bold
// Use a regular expression to replace all instances of the phrase, case-insensitive
const regex = new RegExp(`(${selectedPhraseValue})`, 'gi');  // 'g' for global, 'i' for case-insensitive
const highlightedText = paragraphText.replace(regex, '<strong>$1</strong>');
          const para = document.createElement('p');  // Create a paragraph element for each text block
para.innerHTML = highlightedText;  // Set text content
lyricsBox.appendChild(para);  // Append the paragraph to the l
      }
      })();

    // Clear previous dynamic content and display new ones
    modalMessageDiv.innerHTML = "Choose a phrase to see its performances:";
    modalMessageDiv.appendChild(selectPhrase);
    modalMessageDiv.appendChild(selectPhrase); // Re-add select to keep it visible
    modalMessageDiv.appendChild(chooseButton);
    modalMessageDiv.appendChild(lyricsBox);
    
  };

  modalMessageDiv.appendChild(chooseButton);

  // Display the modal with the appropriate settings
  showModal("Select a Phrase to see it's performances");
}


function showSongsModal() {
  const songs = [];
  console.log(data);
  let i = 0;
  for (const [k, v] of Object.entries(data)) {
    let formattedLyrics = v.replace(/\n\n/g, '\n\n'); // Ensure double newline for paragraph breaks
    songs.push({ name: k, lyrics: formattedLyrics, id: ++i });
  }

  const modalMessageDiv2 = document.getElementById("modalMessage");
  const selectSong = document.createElement("select");
  selectSong.id = "songSelect";
  songs.forEach((song) => {
    const option = document.createElement("option");
    option.value = song.id;
    option.textContent = song.name;
    selectSong.appendChild(option);
  });

  // Create the select element for groups with a placeholder
  const selectGroup = document.createElement("select");
  selectGroup.id = "groupSelect";
  // Add a default disabled option as the placeholder
  const defaultOption = document.createElement("option");
  defaultOption.textContent = "Choose a group";
  defaultOption.value = "";
  defaultOption.disabled = true;
  defaultOption.selected = true;
  selectGroup.appendChild(defaultOption);

  groups.forEach((group) => {
    const option = document.createElement("option");
    option.value = group;
    option.textContent = group;
    selectGroup.appendChild(option);
  });

  // Create the input element for entering a word
  const inputWord = document.createElement("input");
  inputWord.type = "text";
  inputWord.placeholder = "Word to insert";
  inputWord.id = "wordInput";

  // Clear previous contents and append the new selects
  const modalMessageDiv = document.getElementById("modalMessage");
  modalMessageDiv.innerHTML = "Choose a song to add words from:";
  modalMessageDiv.appendChild(selectSong);

  // Create and append the Choose button
  const chooseButton = document.createElement("button");
  chooseButton.textContent = "Choose!";
  chooseButton.className =
    "text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:bg-gradient-to-l focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2";
  chooseButton.onclick = function () {
    const selectedSongId = document.getElementById("songSelect").value;
    const selectedSong = songs.find(
      (song) => song.id.toString() === selectedSongId
    );

    // Create a lyrics box and set its content
    const lyricsBox = document.createElement("div");
    lyricsBox.className = "lyrics-box";
    lyricsBox.style.whiteSpace = 'pre-wrap';
    lyricsBox.textContent = selectedSong.lyrics; // Display the lyrics

    // Split lyrics into words and filter out duplicates
    const wordSet = new Set(selectedSong.lyrics.match(/\b[\w'-]+\b/g));
    const selectWord = document.createElement("select");
    selectWord.id = "wordSelect";
    wordSet.forEach((word) => {
      const option = document.createElement("option");
      option.value = word;
      option.textContent = word;
      selectWord.appendChild(option);
    });
    // Clear previous dynamic content and display new ones
    modalMessageDiv.innerHTML = "Choose a song to add words from:";
    modalMessageDiv.appendChild(selectSong); // Re-add select to keep it visible
    modalMessageDiv.appendChild(chooseButton);
    modalMessageDiv.appendChild(lyricsBox);
    modalMessageDiv.appendChild(selectGroup);
    modalMessageDiv.appendChild(selectWord); // Add the select word element

    // Create and append the Add Word button only after a song is chosen
    const addWordButton = document.createElement("button");
    addWordButton.textContent = "Add Word";
    addWordButton.className =
      "text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:bg-gradient-to-l focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2";
    addWordButton.onclick = function () {
      var selectedGroup = document.getElementById("groupSelect").value;
      if (selectedGroup == "")
      {
        showModalCreationAndDelete("illegal group");
        return;
      }
      var selectedWord = document.getElementById("wordSelect").value;

      (async () => {
        await fetch("/addWordToGroup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            groupName: selectedGroup,
            word: selectedWord,
          }),
        });
      })();

      showModalCreationAndDelete("word added");
      selectedGroup = "";
      selectedWord = "";
    };
    
    modalMessageDiv.appendChild(addWordButton); // Now the button appears only after choosing a song
  };

  modalMessageDiv.appendChild(chooseButton);

  // Display the modal with the appropriate settings
  showModal("Select a Song to Add to a Group");
}

function submitCreateGroup() {
  var input = document.getElementById("createGroup");
  console.log(input.value);
  if (input.value.trim() == ''){
    showModalCreationAndDelete("Unvalid group name");
    return;
  }
  (async () => {
    await fetch("/addGroup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ groupName: input.value }),
    });
  })();
  if (!groups.includes(input.value)) {
    groups.push(input.value);
    showModalCreationAndDelete("New group created successfully.");
    input.value = "";
  } else {
    showModalCreationAndDelete("Duplicate group failed to create.");
    input.value = "";
  }
}

function addWordToGroup() {
  var selectedGroup = document.getElementById("groupSelect").value;
  var selectedWord = document.getElementById("wordSelect").value;
  (async () => {
    await fetch("/addWordToGroup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        groupName: selectedGroup,
        word: selectedWord,
      }),
    });
  })();

  input.value = "";

  showModal("word added to group");
  input.value = "";
}

function submitDeleteGroup() {
  var input = document.getElementById("deleteGroup");
  (async () => {
    await fetch("/removeGroup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ groupName: input.value }),
    });
  })();
  if (groups.includes(input.value)) {
    groups = groups.filter((g) => g != input.value);
    showModalCreationAndDelete("group " + input.value + " removed successfully.");
    input.value = "";
  } else {
    showModalCreationAndDelete("cannot delete a nonexisting group");
    input.value = "";
  }
}

window.onload = function () {
  var tab = getParameterByName("tab");
  if (tab) {
    openTab(tab);
  } else {
    openTab("groupingOptions");
  }
};

function getParameterByName(name, url = window.location.href) {
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}
function exportXML() {
  fetch('/exportXML')
      .then(response => response.blob())  // Convert the response to a Blob (binary large object)
      .then(blob => {
          const url = window.URL.createObjectURL(blob);  // Create a URL for the blob
          const a = document.createElement('a');  // Create a download link
          a.href = url;
          a.download = "export.xml";  // Set the filename
          a.style.display = 'none';  // Ensure the element doesn't show up
          document.body.appendChild(a);  // Append the link to the document
          a.click();  // Simulate a click on the link to start download
          a.remove();  // Remove the link immediately
          window.URL.revokeObjectURL(url);  // Clean up the URL object
      })
      .catch(error => console.error('Error downloading the XML file:', error));
}

function triggerFileInput() {
  document.getElementById('fileInput').click();  // Simulate click on the hidden file input
}

function importXML() {
  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];  // Get the file from the file input

  if (file) {
      const formData = new FormData();
      formData.append('xmlFile', file);

      fetch('/importXML', {
          method: 'POST',
          body: formData
      })
      .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
      })
      .then(data => {
          console.log('Success:', data);
          alert('File uploaded and data imported successfully!');
      })
      .catch((error) => {
          console.error('Error:', error);
          alert('Failed to upload and import data. ' + error.message);
      });
  } else {
      alert('Please select a file to upload.');
  }
}





