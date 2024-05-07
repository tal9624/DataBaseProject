function submitShowTextFile() {
    var words = document.getElementById("textFileWords").value;
    wordsArray = words.split(",").map(function (word) {
      return word.trim();
    });
    if (words == '') wordsArray = null;
    var songName = document.getElementById("songNameInput2").value;
    if (songName == "") songName = null;
    var artistName = document.getElementById("artistNameInput2").value;
    if (artistName == "") artistName = null;
    var releaseDate = document.getElementById("releaseDateInput2").value;
    if (releaseDate == "") releaseDate = null;
    var albumName = document.getElementById("albumNameInput2").value;
    if (albumName == "") albumName = null;
    var writerName = document.getElementById("writerNameInput2").value;
    if (writerName == "") writerName = null;
    var source = document.getElementById("source2").value;
    if (source == "") source = null;

    // Create and append the new select dropdown
    var select = document.createElement("select");
    select.id = "additionalInfoSelect";
    select.style.margin = "10px 0"; // Style the select for better appearance
    var hm = {};
    (async () => {
      const res = await fetch("/getSongByStructData", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wordsToInclude: words,
          songName,
          writerName,
          source,
          albumName,
          artistName,
          releaseDate,
        }),
      });
      hm = await res.json();
      Object.keys(hm).forEach(function (songTitle) {
        if (songTitle == "youtubeVideoId") {
          return;
        }
        var option = document.createElement("option");
        option.value = songTitle;
        option.text = songTitle;
        select.appendChild(option);
      });

      // Clear the modal content first and then append the select
      var modalContent = document.getElementById("modal");
      modalContent.innerHTML = ""; // Clear any previous content
      modalContent.appendChild(select);

      const iframe = document.createElement('iframe');
      iframe.style.display = "none";
      modalContent.appendChild(iframe)

      if (Object.keys(hm.youtubeVideoId).includes(select.value)) {
        const youtubeVideoId = hm.youtubeVideoId[select.value];
        iframe.src = `https://www.youtube.com/embed/${youtubeVideoId}`;
        iframe.style.display = "block";
        modalContent.style.display = "ruby";
      }
      
      modalContent.addEventListener('change', () => {
        modalContent.style.display = "ruby";
        if(Object.keys(hm.youtubeVideoId).includes(select.value)) {
          const youtubeVideoId = hm.youtubeVideoId[select.value];
          iframe.src = `https://www.youtube.com/embed/${youtubeVideoId}`;
          iframe.style.display = "block";
        } else {
          iframe.src = "";
          iframe.style.display = "none";
        }
      })
      

      // Create and append the Choose button
      var chooseButton = document.createElement("button");
      chooseButton.textContent = "Choose!";
      chooseButton.className =
        "text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:bg-gradient-to-l focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2";
      chooseButton.onclick = function () {
        var selectedKey = select.value; // Get the selected key from the dropdown
        var text = hm[selectedKey]; // Fetch the corresponding value from the hm object
        console.log(text);
        var filename = selectedKey + ".txt"; // Name the file after the selected key

        // Create a Blob with the text
        var blob = new Blob([text], { type: "text/plain" });

        // Create a link and trigger the download
        var link = document.createElement("a");
        link.download = filename;
        link.href = window.URL.createObjectURL(blob);
        link.style.display = "none";
        document.body.appendChild(link);

        link.click(); // Automatically click the link to trigger the download

        // Clean up by removing the link
        document.body.removeChild(link);
      };
      modalContent.appendChild(chooseButton);

      // Show the modal and overlay
      showModal("Select your option");
    })();
  }
    // Object.keys(hm).forEach(function (songTitle) {
    //   var option = document.createElement("option");
    //   option.value = songTitle;
    //   option.text = songTitle;
    //   select.appendChild(option);
    // });

    // // Clear the modal content first and then append the select
    // var modalContent = document.getElementById("modal");
    // modalContent.innerHTML = ""; // Clear any previous content
    // modalContent.appendChild(select);

    // // Create and append the Choose button
    // var chooseButton = document.createElement("button");
    // chooseButton.textContent = "Choose!";
    // chooseButton.className =
    //   "text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:bg-gradient-to-l focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2";
    // chooseButton.onclick = function () {
    //   var selectedKey = select.value; // Get the selected key from the dropdown
    //   var text = hm[selectedKey]; // Fetch the corresponding value from the hm object
    //   var filename = selectedKey + ".txt"; // Name the file after the selected key

    //   // Create a Blob with the text
    //   var blob = new Blob([text], { type: "text/plain" });

    //   // Create a link and trigger the download
    //   var link = document.createElement("a"); tal mizrahi din cohen
    //   link.download = filename;
    //   link.href = window.URL.createObjectURL(blob);
    //   link.style.display = "none";
    //   document.body.appendChild(link);

    //   link.click(); // Automatically click the link to trigger the download

    //   // Clean up by removing the link
    //   document.body.removeChild(link);
    // };
    // modalContent.appendChild(chooseButton);

    // // Show the modal and overlay
    // showModal("Select your option");

  document
    .getElementById("customFileButton")
    .addEventListener("click", function () {
      document.getElementById("fileInput").click(); // Trigger the hidden file input
    });

  document
    .getElementById("bulkInsertButton")
    .addEventListener("click", function () {
      document.getElementById("bulkInput").click(); // Trigger the hidden file input
    });

  document.getElementById("uploadBulk").addEventListener("click", () => {
    document.getElementById("uploadBulk").style.display = "none";
    document.getElementById("bulkFileNameDisplay").textContent =
      "bulk uploaded";
  });

  document
    .getElementById("bulkInput")
    .addEventListener("change", function () {
      var fileInput = document.getElementById("bulkInput");
      var fileNameDisplay = document.getElementById("bulkFileNameDisplay");
      if (fileInput.files.length > 0) {
        document.getElementById("uploadBulk").style.display = "inline";
        var file = fileInput.files[0];
        fileNameDisplay.textContent = "Selected file: " + file.name;
      } else {
        fileNameDisplay.textContent = "No file selected";
      }
    });

  document
    .getElementById("fileInput")
    .addEventListener("change", function () {
      var fileInput = document.getElementById("fileInput");
      var fileNameDisplay = document.getElementById("fileNameDisplay");
      if (fileInput.files.length > 0) {
        var file = fileInput.files[0];
        fileNameDisplay.textContent = "Selected file: " + file.name;
      } else {
        fileNameDisplay.textContent = "No file selected";
      }
    });

  function closeModal() {
    document.getElementById("modal").style.display = "none";
    document.getElementById("overlay").style.display = "none";
  }

  function showModal(message) {
    document.getElementById("modalMessage").textContent = message;
    document.getElementById("modal").style.display = "block";
    document.getElementById("overlay").style.display = "block";
  }

  function submitStructuredData() {
    var songName = document.getElementById("songNameInput").value;
    var artist = document.getElementById("artist").value;
    var releaseDate = document.getElementById("releaseDate").value;
    var albumName = document.getElementById("albumName").value;
    var writerName = document.getElementById("writerName").value;
    var source = document.getElementById("source").value;
    var youtubeLink = document.getElementById("youtubeLink").value;
    console.log(
      "Structured Data:",
      songName,
      artist,
      releaseDate,
      albumName,
      writerName,
      source,
      youtubeLink
    );
    showModal("Structured data submitted successfully.");
    document.getElementById("songNameInput").value = "";
    document.getElementById("artist").value = "";
    document.getElementById("releaseDate").value = "";
    document.getElementById("albumName").value = "";
    document.getElementById("writerName").value = "";
    document.getElementById("source").value = "";
    document.getElementById("youtubeLink").value = "";
    var fileInput = document.getElementById("fileInput");
    if (fileInput.files.length > 0) {
      var file = fileInput.files[0];
      var reader = new FileReader();
      reader.onload = function (e) {
        var fileContent = e.target.result;
        document.getElementById("songText").value = fileContent;
        document.getElementById("fileName").value = file.name;
        showModal("File uploaded successfully: " + file.name);
        fileInput.value = ""; // Clear the file input after reading
        document.getElementById("fileNameDisplay").textContent = ""; // Clear the file name display
      };
      reader.readAsText(file); // Read the file as text
    } else {
      showModal("No file selected.");
    }
  }