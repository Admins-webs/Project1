// Ganti dengan milikmu!
const SUPABASE_URL = "https://iomdzwcclpgswzuesayj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvbWR6d2NjbHBnc3d6dWVzYXlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3Nzg4NDYsImV4cCI6MjA2NjM1NDg0Nn0.xdGO_h7WGOmCdmEIawFEMqxEDn4qF4XDXspMNWXs5iA";

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function uploadMedia() {
  const file = document.getElementById("fileInput").files[0];
  const title = document.getElementById("title").value;
  const description = document.getElementById("description").value;
  const tags = document.getElementById("tags").value.split(",").map(tag => tag.trim());

  if (!file || !title) return alert("Wajib isi judul dan pilih file!");

  const filePath = Date.now() + "_" + file.name;
  const { data, error } = await supabase.storage.from("media").upload(filePath, file);
  if (error) return alert("Gagal upload: " + error.message);

  const { data: urlData } = supabase.storage.from("media").getPublicUrl(filePath);
  const type = file.type.startsWith("video") ? "video" : "image";

  await supabase.from("media").insert([{
    title, description, tags, url: urlData.publicUrl, type
  }]);

  alert("Berhasil diupload!");
  loadGallery();
}

async function loadGallery() {
  const { data, error } = await supabase.from("media").select("*").order("created_at", { ascending: false });
  const gallery = document.getElementById("gallery");
  gallery.innerHTML = "";

  data.forEach(item => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      ${item.type === "image" ? `<img src="${item.url}" />` : `<video src="${item.url}" controls></video>`}
      <h3>${item.title}</h3>
      <p>${item.description || ""}</p>
      <small>${item.tags.join(", ")}</small>
    `;
    gallery.appendChild(card);
  });
}

async function filterByTag() {
  const tag = document.getElementById("searchTag").value.trim().toLowerCase();
  if (!tag) return loadGallery();

  const { data, error } = await supabase.from("media").select("*");
  const filtered = data.filter(item => item.tags.map(t => t.toLowerCase()).includes(tag));

  const gallery = document.getElementById("gallery");
  gallery.innerHTML = "";
  filtered.forEach(item => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      ${item.type === "image" ? `<img src="${item.url}" />` : `<video src="${item.url}" controls></video>`}
      <h3>${item.title}</h3>
      <p>${item.description || ""}</p>
      <small>${item.tags.join(", ")}</small>
    `;
    gallery.appendChild(card);
  });
}

window.onload = loadGallery;
