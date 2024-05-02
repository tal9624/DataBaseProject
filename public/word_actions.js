  // Function to show the paragraph texts in the modal
  function showParagraphs(paragraphs, word) {
    const displayDiv = document.getElementById("paragraphDisplay");
    const contentDiv = displayDiv.querySelector(".paragraph-content");
    contentDiv.innerHTML = ""; // Clear previous content

    paragraphs.forEach((item) => {
      const para = document.createElement("p");
      const regex = new RegExp(
        `(^|\\s)${word}(\\s|$)|(^|\\s)${word}[.,!?;]`,
        "gi"
      );
      // Replace occurrences with bolded version using $& which represents the matched substring
      const formattedText = item.paragraph_text.replace(
        regex,
        " <strong>$&</strong> "
      );
      if (formattedText !== item.paragraph_text) {
      para.innerHTML = formattedText; // Use innerHTML to parse the strong tag
      para.className = "paragraph-text";
      contentDiv.appendChild(para);
      }
      // Optionally, add double <br> for spacing if needed, as shown previously
    });

    displayDiv.style.display = "block"; // Show the display div
  }

  // Function to close the display
  function closeParagraphDisplay() {
    document.getElementById("paragraphDisplay").style.display = "none";
  }

  async function handleBothFunctions() {
    await showIndexOfAWord(); // Wait for this function to complete
    showRowInParagraph(); // Then call the second function
  }

  function ShowAllWordsInText() {
    (async () => {
      let songName = document.getElementById("songSelection").value.trim();
      if (songName === "") {
        // Handle the case where no song name is provided
        const response = await fetch("/ShowAllWordsInSongs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ songName: null }),
        });
        const words = await response.json();
        showModalTable(words);
      } else {
        // Handle the case where one or more song names are provided
        let songNameArr = songName.split(",").map((name) => name.trim());

        for (let i = 0; i < songNameArr.length; i++) {
          try {
            const response = await fetch("/ShowAllWordsInSongs", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ songName: songNameArr[i] }),
            });
            if (!response.ok)
              throw new Error("Network response was not ok");
            const words = await response.json();
            showModalTable(words);
          } catch (error) {
            console.error("Fetch error:", error);
          }
        }
      }

      // Reset the input field only after all processing is complete
      document.getElementById("songSelection").value = "";
    })();
  }
  function showIndexOfAWord() {
    // Return a new Promise with resolve and reject functions properly defined
    return new Promise((resolve, reject) => {
      let word = document.getElementById("wordIndex").value.trim();
      fetch("/showIndexOfAWord", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ word }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          showModalWithData(data, "modalTableBodyForIndexes", word);
          resolve(); // Call resolve() when the fetch and processing are successful
        })
        .catch((error) => {
          console.error("Error in showIndexOfAWord:", error);
          reject(error); // Call reject() if there's an error
        });
    });
  }

  function showRowInParagraph() {
    return new Promise((resolve, reject) => {
        (async () => {
            try {
                // Fetch initial stats to build paragraph mapping
                const statsRes = await fetch("/getLinesInParagraphStats");
                const rawData = await statsRes.json();

                let paragraphNumber = 1;
                let currentRow = rawData[0].row;
                let currentSong = rawData[0].song_name;
                let songRowToParagraphMapping = {};
                let rowInParagraph = 1; // Track row numbers within each paragraph

                rawData.forEach((item, index) => {
                    if (item.song_name !== currentSong) {
                        // Reset for a new song
                        currentSong = item.song_name;
                        paragraphNumber = 1;
                        currentRow = item.row;
                        rowInParagraph = 1;
                    }

                    if (item.row !== currentRow) {
                        // New paragraph
                        paragraphNumber++;
                        currentRow = item.row;
                        rowInParagraph = 1; // Reset row in paragraph
                    } else {
                        // Continuing in the same paragraph
                        rowInParagraph++;
                    }

                    // Create or update the mapping entry for this song
                    if (!songRowToParagraphMapping[currentSong]) {
                        songRowToParagraphMapping[currentSong] = {};
                    }

                    songRowToParagraphMapping[currentSong][item.row] = {
                        paragraphNumber: paragraphNumber,
                        rowInParagraph: rowInParagraph
                    };

                    // Increment row number to the next expected sequential row
                    currentRow++;
                });

                // Now, use the songRowToParagraphMapping to enhance data fetched by word
                let word = document.getElementById("wordIndex").value.trim();
                const response = await fetch("/showRowInParagraph", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ word }),
                });

                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }

                const data = await response.json();

                // Enhance data with paragraph info
                const enhancedData = data.map(item => ({
                    song_name: item.song_name,
                    paragraph_num: songRowToParagraphMapping[item.song_name][item.row].paragraphNumber,
                    row_in_paragraph: songRowToParagraphMapping[item.song_name][item.row].rowInParagraph
                }));

                console.log(enhancedData); // You can replace this with your actual data displaying logic
                showModalWithData(enhancedData, "modalTableBodyForRows", word);
                resolve(); // Resolve the promise when everything is completed
            } catch (error) {
                console.error("Error in showRowInParagraph:", error);
                reject(error); // Reject the promise if there is an error
            } finally {
                // Clear the input field after the promise is initialized
                document.getElementById("wordIndex").value = "";
            }
        })();
    });
}




  function showModalWithData(indexData, modalTableBodyFor, word) {
    const data = indexData;
    const tableBody = document.getElementById(modalTableBodyFor);
    tableBody.innerHTML = ""; // Clear existing rows

    data.forEach((item) => {
      const tr = document.createElement("tr");
      const tdSongName = document.createElement("td");
      const tdRow = document.createElement("td");
      const tdColumn = document.createElement("td");
      tr.className = "bg-blue-600 border-b border-blue-400";
      tdSongName.textContent = item.song_name;
      if (item.row != null) tdRow.textContent = item.row;
      if (item.paragraph_num != null)
        tdRow.textContent = item.paragraph_num;
      if (item.column != null) tdColumn.textContent = item.column;
      if (item.row_in_paragraph != null) 
        tdColumn.textContent = item.row_in_paragraph;

      tdSongName.className =
        "px-6 py-4 font-medium bg-blue-500 text-blue-50 whitespace-nowrap dark:text-blue-100";
      tdColumn.className =
        "px-6 py-4 font-medium bg-blue-500 text-blue-50 whitespace-nowrap dark:text-blue-100";
      tdRow.className =
        "px-6 py-4 font-medium bg-blue-500 text-blue-50 whitespace-nowrap dark:text-blue-100";

      tr.appendChild(tdSongName);
      tr.appendChild(tdRow);
      tr.appendChild(tdColumn);

      tableBody.appendChild(tr);
    });

    // Show the modal and overlay
    document.getElementById("modalTableForIndexes").style.display = "block";
    document.getElementById("overlay").style.display = "block";
  }

  function closeModal() {
    document.getElementById("modalTableForIndexes").style.display = "none";
    document.getElementById("modal").style.display = "none";
    document.getElementById("overlay").style.display = "none";
    document.getElementById("modalTable").style.display = "none";
    document.getElementById("overlayTable").style.display = "none";
  }

  function showModal(message) {
    document.getElementById("modalMessage").textContent = message;
    document.getElementById("modal").style.display = "block";
    document.getElementById("overlay").style.display = "block";
  }
  function showModalTable(words) {

    const modalMessage = document.getElementById("modalMessage");
    modalMessage.innerHTML = "Data submitted successfully!";

    const tableBody = document.querySelector("#modalTable tbody");
    tableBody.innerHTML = ""; // Clear existing table rows

    words.forEach((item) => {
      if (!item.song_name || !item.word) {
        console.error("Invalid item data:", item);
        return; // Skip this item if the required properties are not present
      }
      const tr = document.createElement("tr");
      tr.className = "bg-blue-600 border-b border-blue-400";

      const td1 = document.createElement("td");
      td1.className =
        "px-6 py-4 font-medium bg-blue-500 text-blue-50 whitespace-nowrap dark:text-blue-100";
      td1.textContent = item.song_name; // Access song_name property
      tr.appendChild(td1);

      // Second column for the word, as a button
      const td2 = document.createElement("td");
      td2.className = "px-6 py-4";
      const button = document.createElement("button");
      button.textContent = item.word;
      button.className =
        "text-white bg-blue-500 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-opacity-50 rounded-lg text-sm px-5 py-2.5 text-center";
      button.type = "button";
      // Optionally, add an onclick event to the button
      button.onclick = function () {
        closeModal();
        (async () => {
          let songName = item.song_name;
          let word = item.word;
          // Handle the case where no song name is provided
          const response = await fetch("/ShowReference", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ songName, word }),
          });
          const paragraph = await response.json();
          console.log(paragraph);
          showParagraphs(paragraph, word);
        })();
      };
      td2.appendChild(button);
      tr.appendChild(td2);

      document.querySelector("#modalTable tbody").appendChild(tr);
    });

    document.getElementById("modalTable").style.display = "block";
    document.getElementById("overlayTable").style.display = "block";
  }

  function submitLocateByIndex() {
    (async () => {
      var songName = document.getElementById("fileName").value;
      var row = document.getElementById("rowNumber").value;
      var column = document.getElementById("colNumber").value;
      const response = await fetch("/getWordByIndex", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          songName,
          row,
          column,
        }),
      });
      const word = await response.json();
      if (word.length==0) { showModal("Not a match"); return;}
      showModal("The word is: " + word[0].word);
    })();
    songName = "";
    row = "";
    column = "";
    document.getElementById("fileName").value = "";
    document.getElementById("rowNumber").value = "";
    document.getElementById("colNumber").value = "";
  }