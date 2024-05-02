import { readFileAsText } from "./util/index.js";

export async function bulkPost() {
  const fileInput = document.getElementById("bulkInput");
  const file = fileInput.files[0];
  const content = await readFileAsText(file);

  await fetch("/bulk", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ xml: content }),
  });
}
