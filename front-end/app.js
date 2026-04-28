// -------- CONFIG --------
const SEARCH_API = "https://5r274evtng.execute-api.us-east-1.amazonaws.com/prod/search";

const SEARCH_API_KEY = "kZkV3Nb1G95bABvyFRGfd7hK4YlGeNEr9mFJVOhY";

const UPLOAD_API_BASE = "https://aczjc9yqfh.execute-api.us-east-1.amazonaws.com/dev";

const UPLOAD_API_KEY = "5pqRk7HYR95PaRHVOoKBs27WlaUyz41w4zINZOct";

// -------- DOM --------
const searchInput = document.getElementById("searchInput");
const photoInput = document.getElementById("photoInput");
const customLabelsInput = document.getElementById("customLabelsInput");

const searchBtn = document.getElementById("searchBtn");
const uploadBtn = document.getElementById("uploadBtn");

const searchStatus = document.getElementById("searchStatus");
const uploadStatus = document.getElementById("uploadStatus");

const resultsDiv = document.getElementById("results");
const emptyMessage = document.getElementById("emptyMessage");


// -------- EVENTS --------
searchBtn.addEventListener("click", handleSearch);
uploadBtn.addEventListener("click", handleUpload);

searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    handleSearch();
  }
});


// -------- SEARCH --------
async function handleSearch() {
  const query = searchInput.value.trim();

  if (!query) {
    setStatus(searchStatus, "Please enter a search term.", "error");
    return;
  }

  try {
    searchBtn.disabled = true;
    setStatus(searchStatus, "Searching...", "");

    const data = await searchPhotos(query);
    console.log("Search response:", data);

    displayResults(data);

    setStatus(searchStatus, "Search completed ✅", "success");
  } catch (error) {
    console.error("SEARCH ERROR:", error);
    setStatus(searchStatus, "Search failed ❌ Check console.", "error");
  } finally {
    searchBtn.disabled = false;
  }
}


async function searchPhotos(query) {
  const url = `${SEARCH_API}?q=${encodeURIComponent(query)}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "x-api-key": SEARCH_API_KEY
    }
  });

  const text = await response.text();
  console.log("Raw search response:", text);

  if (!response.ok) {
    throw new Error(`Search failed: ${response.status} ${text}`);
  }

  return JSON.parse(text);
}


// -------- UPLOAD --------
async function handleUpload() {
  const file = photoInput.files[0];
  const customLabels = customLabelsInput.value.trim();

  if (!file) {
    setStatus(uploadStatus, "Please choose a photo first.", "error");
    return;
  }

  try {
    uploadBtn.disabled = true;
    setStatus(uploadStatus, "Uploading...", "");

    const result = await uploadPhoto(file, customLabels);
    console.log("Upload result:", result);

    setStatus(
      uploadStatus,
      `Uploaded ${result.filename} ✅ Wait 20–30 seconds, then search.`,
      "success"
    );

    photoInput.value = "";
    customLabelsInput.value = "";
  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    setStatus(uploadStatus, "Upload failed ❌ Check console.", "error");
  } finally {
    uploadBtn.disabled = false;
  }
}


async function uploadPhoto(file, customLabels) {
  const filename = encodeURIComponent(file.name);
  const uploadUrl = `${UPLOAD_API_BASE}/photos/${filename}`;

  const labelsHeader = customLabels
    .split(",")
    .map(label => label.trim())
    .filter(label => label.length > 0)
    .join(", ");

  console.log("Uploading to:", uploadUrl);
  console.log("Content-Type:", file.type || "application/octet-stream");
  console.log("Custom labels:", labelsHeader);

  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type || "application/octet-stream",
      "x-amz-meta-customLabels": labelsHeader,
      "x-api-key": UPLOAD_API_KEY
    },
    body: file
  });

  const text = await response.text();
  console.log("Upload response status:", response.status);
  console.log("Upload response body:", text);

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status} ${text}`);
  }

  return {
    success: true,
    filename: file.name,
    customLabels: labelsHeader
  };
}


// -------- DISPLAY RESULTS --------
function displayResults(data) {
  resultsDiv.innerHTML = "";

  const photos = normalizePhotoResponse(data);

  if (!photos || photos.length === 0) {
    emptyMessage.textContent = "No photos found.";
    emptyMessage.style.display = "block";
    return;
  }

  emptyMessage.style.display = "none";

  photos.forEach(photo => {
    const card = document.createElement("div");
    card.className = "photo-card";

    const imageUrl =
      photo.url ||
      photo.imageUrl ||
      photo.s3Url ||
      photo.objectUrl;

    const labels =
      photo.labels ||
      photo.Labels ||
      photo.customLabels ||
      [];

    const img = document.createElement("img");
    img.src = imageUrl || "";
    img.alt = photo.objectKey || photo.key || "Search result";

    img.onerror = function () {
      this.src = "https://dummyimage.com/300x200/cccccc/000000&text=Image+Not+Available";
    };

    const info = document.createElement("div");
    info.className = "photo-info";

    info.innerHTML = `
      <strong>${photo.objectKey || photo.key || "Photo"}</strong>
      <span>Labels: ${Array.isArray(labels) ? labels.join(", ") : labels}</span>
    `;

    card.appendChild(img);
    card.appendChild(info);
    resultsDiv.appendChild(card);
  });
}


// -------- NORMALIZE RESPONSE --------
function normalizePhotoResponse(data) {
  if (Array.isArray(data)) return data;

  if (Array.isArray(data.results)) return data.results;
  if (Array.isArray(data.photos)) return data.photos;

  if (data.body) {
    try {
      const body =
        typeof data.body === "string" ? JSON.parse(data.body) : data.body;

      if (Array.isArray(body)) return body;
      if (Array.isArray(body.results)) return body.results;
      if (Array.isArray(body.photos)) return body.photos;
    } catch (error) {
      console.error("Could not parse response body:", error);
    }
  }

  return [];
}


// -------- STATUS --------
function setStatus(element, message, type) {
  element.textContent = message;
  element.className = `status ${type}`;
}# demo
