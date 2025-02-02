export async function modifyFiles() {
  const handle = await window.showDirectoryPicker();
  const output = document.getElementById("output");
  output.textContent = "Processing files...\n";

  for await (const entry of handle.values()) {
    if (entry.kind === "file") {
      await processFile(entry);
      output.textContent += `Updated: ${entry.name}\n`;
    }
  }

  output.textContent += "Done!";
}

async function processFile(entry) {
  const file = await entry.getFile();
  let text = await file.text();
  text += "\nModified by AI";

  const writable = await entry.createWritable();
  await writable.write(text);
  await writable.close();
}
