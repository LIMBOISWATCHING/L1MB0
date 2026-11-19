// Gaveta — Firebase Realtime Database + Authentication
// Fotos: redimensionadas/comprimidas no navegador e armazenadas como Base64 no RTDB.

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getDatabase, ref, push, set, remove, onValue } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBVKOtUqA0FxfE0a5jazGbcJb_H8R0nv3g",
  authDomain: "banco-de-dados-geral-l1mb0.firebaseapp.com",
  databaseURL: "https://banco-de-dados-geral-l1mb0-default-rtdb.firebaseio.com",
  projectId: "banco-de-dados-geral-l1mb0",
  storageBucket: "banco-de-dados-geral-l1mb0.firebasestorage.app",
  messagingSenderId: "1003127787463",
  appId: "1:1003127787463:web:1bc1e4e06e6d895f3b93e2",
  measurementId: "G-E8C2ZQ2VNG"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const itemsRef = ref(db, "gaveta/items");

const $ = s => document.querySelector(s);
const drawers = $("#drawers");
const itemCount = $("#itemCount");
const searchInput = $("#searchInput");
const clearSearch = $("#clearSearch");
const typeFilter = $("#typeFilter");
const favoriteFilter = $("#favoriteFilter");
const sortSelect = $("#sortSelect");
const dialog = $("#itemDialog");
const form = $("#itemForm");
const newItemBtn = $("#newItemBtn");
const loginBtn = $("#loginBtn");
const logoutBtn = $("#logoutBtn");
const userEmail = $("#userEmail");
const loginNotice = $("#loginNotice");
const closeDialog = $("#closeDialog");
const cancelBtn = $("#cancelBtn");
const deleteBtn = $("#deleteBtn");
const statusEl = $("#formStatus");
const currentPhoto = $("#currentPhoto");
const selectedPhotos = $("#selectedPhotos");
const photoInput = $("#photo");
const photoDrop = $("#photoDrop");
const photoStatus = $("#photoStatus");
const removePhotoRow = $("#removePhotoRow");
const removePhoto = $("#removePhoto");
const typeInput = $("#type");
const tagsInput = $("#tags");
const favoriteInput = $("#favorite");
const toast = $("#toast");
const exportBtn = $("#exportBtn");
const importInput = $("#importInput");
const importBtn = $("#importBtn");
const draftNotice = $("#draftNotice");

let items = {};
let currentUser = null;
let unsubscribeItems = null;
let lightboxPhotos = [];
let lightboxIndex = 0;
let pendingPhotos = [];
let editingRemovedPhotoIds = new Set();
let toastTimer = null;
let draftTimer = null;

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
}

function normalizePhotos(item) {
  if (item?.photos && typeof item.photos === "object") {
    return Object.entries(item.photos).map(([id, photo]) => ({ id, ...photo }));
  }
  if (item?.photoData) return [{ id: "legacy", data: item.photoData, name: `${item.title || "foto"}.jpg` }];
  return [];
}

function photoDownloadName(item, photo, index = 1) {
  const base = (item?.title || "foto").replace(/[^a-z0-9À-ÿ _-]/gi, "_").trim() || "foto";
  const original = photo?.name ? photo.name.replace(/[^a-z0-9À-ÿ._ -]/gi, "_") : `${base}-${index}.jpg`;
  return original.includes(".") ? original : `${original}.jpg`;
}

function showToast(message, type = "ok") {
  toast.textContent = message;
  toast.dataset.type = type;
  toast.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add("hidden"), 3000);
}

function friendlyFirebaseError(error) {
  const code = error?.code || "erro-desconhecido";
  if (code.includes("permission-denied")) return "Permissão negada pelo Firebase. Confira as Security Rules e se o e-mail desta conta está autorizado.";
  if (code.includes("network-request-failed")) return "Falha de conexão. Verifique a internet e tente novamente.";
  if (code.includes("unauthorized-domain")) return "Este domínio ainda não está autorizado no Firebase Authentication.";
  return `${code}: ${error?.message || "erro desconhecido"}`;
}

function openLightbox(photos, index = 0) {
  if (!photos.length) return;
  lightboxPhotos = photos;
  lightboxIndex = Math.max(0, Math.min(index, photos.length - 1));
  updateLightbox();
  $("#photoLightbox").classList.remove("hidden");
  document.body.classList.add("lightbox-open");
}
function closeLightbox() {
  $("#photoLightbox").classList.add("hidden");
  document.body.classList.remove("lightbox-open");
  lightboxPhotos = [];
}
function updateLightbox() {
  const photo = lightboxPhotos[lightboxIndex];
  if (!photo) return;
  $("#lightboxImage").src = photo.data;
  $("#lightboxImage").alt = `Foto ${lightboxIndex + 1}`;
  $("#lightboxCounter").textContent = lightboxPhotos.length > 1 ? `${lightboxIndex + 1} / ${lightboxPhotos.length}` : "";
  $("#lightboxDownload").href = photo.data;
  $("#lightboxDownload").download = photo.name || `foto-${lightboxIndex + 1}.jpg`;
  $("#lightboxPrev").classList.toggle("hidden", lightboxPhotos.length < 2);
  $("#lightboxNext").classList.toggle("hidden", lightboxPhotos.length < 2);
}

function renderPhotoList(container, photos, item, label, editable = false, pending = false) {
  if (!photos.length) { container.classList.add("hidden"); container.innerHTML = ""; return; }
  container.classList.remove("hidden");
  container.innerHTML = `<small>${escapeHTML(label)}</small><div class="photo-grid">${photos.map((photo, index) => `
    <div class="photo-card" draggable="${pending ? "true" : "false"}" data-photo-id="${escapeHTML(photo.id || "")}">
      <button type="button" class="photo-thumb" data-photo-index="${index}" aria-label="Ampliar foto ${index + 1}"><img src="${escapeHTML(photo.data)}" alt="Foto ${index + 1}"><span class="zoom-hint">Ampliar</span></button>
      <div class="photo-card-actions">
        <a class="secondary" href="${escapeHTML(photo.data)}" download="${escapeHTML(photoDownloadName(item, photo, index + 1))}">Baixar</a>
        ${editable && photo.id !== "legacy" ? `<button type="button" class="secondary remove-selected-photo" data-photo-id="${escapeHTML(photo.id)}">Remover</button>` : ""}
        ${pending ? `<span class="drag-hint">Arraste para reordenar</span>` : ""}
      </div>
    </div>`).join("")}</div>`;
  container.querySelectorAll(".photo-thumb").forEach(btn => btn.addEventListener("click", () => openLightbox(photos, Number(btn.dataset.photoIndex))));
  if (pending) wirePhotoDrag(container);
}

function wirePhotoDrag(container) {
  let dragged = null;
  container.querySelectorAll(".photo-card").forEach(card => {
    card.addEventListener("dragstart", () => { dragged = card; card.classList.add("dragging"); });
    card.addEventListener("dragend", () => { card.classList.remove("dragging"); dragged = null; savePendingOrder(container); });
    card.addEventListener("dragover", e => {
      e.preventDefault();
      if (!dragged || dragged === card) return;
      const rect = card.getBoundingClientRect();
      const before = e.clientX < rect.left + rect.width / 2;
      container.querySelector(".photo-grid").insertBefore(dragged, before ? card : card.nextSibling);
    });
  });
}
function savePendingOrder(container) {
  const ids = [...container.querySelectorAll(".photo-card")].map(x => x.dataset.photoId);
  pendingPhotos.sort((a,b) => ids.indexOf(a.id) - ids.indexOf(b.id));
}

function resetPhotoUI() {
  currentPhoto.classList.add("hidden"); currentPhoto.innerHTML = "";
  selectedPhotos.classList.add("hidden"); selectedPhotos.innerHTML = "";
  removePhotoRow.classList.add("hidden"); removePhoto.checked = false;
  photoStatus.textContent = ""; photoInput.value = "";
  pendingPhotos = []; editingRemovedPhotoIds = new Set();
  photoDrop.classList.remove("drag-over");
}

function collectDraft() {
  return {
    title: $("#title").value,
    address: $("#address").value,
    text: $("#text").value,
    type: typeInput.value,
    tags: tagsInput.value,
    favorite: favoriteInput.checked
  };
}
function draftKey() { return `gaveta-draft-${currentUser?.uid || "anon"}`; }
function saveDraft() {
  if (!currentUser || !dialog.open) return;
  try { localStorage.setItem(draftKey(), JSON.stringify(collectDraft())); draftNotice.textContent = "Rascunho salvo neste navegador."; } catch {}
}
function clearDraft() { try { localStorage.removeItem(draftKey()); } catch {} draftNotice.textContent = ""; }
function restoreDraftIfAvailable() {
  try {
    const raw = localStorage.getItem(draftKey());
    if (!raw) return false;
    const d = JSON.parse(raw);
    if (d.title || d.address || d.text || d.tags) {
      $("#title").value = d.title || ""; $("#address").value = d.address || ""; $("#text").value = d.text || "";
      typeInput.value = d.type || "note"; tagsInput.value = d.tags || ""; favoriteInput.checked = !!d.favorite;
      draftNotice.textContent = "Rascunho recuperado deste navegador.";
      return true;
    }
  } catch {}
  return false;
}

function openNew() {
  form.reset(); $("#itemId").value = "";
  $("#dialogTitle").textContent = "Nova gaveta"; deleteBtn.classList.add("hidden"); statusEl.textContent = "";
  resetPhotoUI(); typeInput.value = "note"; favoriteInput.checked = false;
  restoreDraftIfAvailable();
  dialog.showModal();
}

function openEdit(id) {
  const item = items[id]; if (!item) return;
  $("#itemId").value = id; $("#title").value = item.title || ""; $("#address").value = item.address || "";
  typeInput.value = item.type || "note"; tagsInput.value = Array.isArray(item.tags) ? item.tags.join(", ") : "";
  favoriteInput.checked = !!item.favorite; $("#text").value = item.text || "";
  $("#dialogTitle").textContent = "Editar gaveta"; deleteBtn.classList.remove("hidden"); statusEl.textContent = ""; draftNotice.textContent = "";
  resetPhotoUI();
  const existingPhotos = normalizePhotos(item);
  renderPhotoList(currentPhoto, existingPhotos, item, existingPhotos.length === 1 ? "Foto atual" : "Fotos atuais", true, false);
  if (existingPhotos.length) removePhotoRow.classList.remove("hidden");
  dialog.showModal();
}

function wireCurrentPhotoButtons(id) {
  currentPhoto.querySelectorAll(".remove-selected-photo").forEach(btn => btn.addEventListener("click", () => {
    const item = items[id]; if (!item) return;
    editingRemovedPhotoIds.add(btn.dataset.photoId);
    const remaining = normalizePhotos(item).filter(photo => !editingRemovedPhotoIds.has(photo.id));
    renderPhotoList(currentPhoto, remaining, item, remaining.length === 1 ? "Foto atual" : "Fotos atuais", true, false);
    removePhotoRow.classList.toggle("hidden", remaining.length === 0);
    showToast("Foto marcada para remoção. Ela será apagada ao guardar.");
  }));
}

function getFilteredEntries() {
  const term = searchInput.value.trim().toLowerCase();
  const type = typeFilter.value;
  const fav = favoriteFilter.checked;
  const entries = Object.entries(items).filter(([, item]) => {
    const title = (item.title || "").toLowerCase();
    return (!term || title.includes(term)) && (!type || (item.type || "note") === type) && (!fav || !!item.favorite);
  });
  switch (sortSelect.value) {
    case "oldest": return entries.sort((a,b) => (a[1].createdAt || 0) - (b[1].createdAt || 0));
    case "title": return entries.sort((a,b) => String(a[1].title || "").localeCompare(String(b[1].title || ""), "pt-BR"));
    case "updated": return entries.sort((a,b) => (b[1].updatedAt || 0) - (a[1].updatedAt || 0));
    default: return entries.sort((a,b) => (b[1].createdAt || 0) - (a[1].createdAt || 0));
  }
}

function render() {
  if (!currentUser) return;
  const filtered = getFilteredEntries();
  itemCount.textContent = `${filtered.length} ${filtered.length === 1 ? "item" : "itens"}`;
  clearSearch.classList.toggle("hidden", !searchInput.value);
  if (!filtered.length) {
    drawers.innerHTML = `<div class="empty-state"><strong>${searchInput.value || typeFilter.value || favoriteFilter.checked ? "Nada encontrado." : "Nenhuma gaveta aberta."}</strong><span>${searchInput.value || typeFilter.value || favoriteFilter.checked ? "Tente mudar os filtros." : "Crie a primeira para começar."}</span></div>`;
    return;
  }
  drawers.innerHTML = filtered.map(([id,item]) => {
    const photos = normalizePhotos(item);
    return `<article class="drawer" data-id="${escapeHTML(id)}">
      <div class="drawer-front"><div class="drawer-tab"></div><div class="drawer-title">${escapeHTML(item.title || "Sem título")}${item.favorite ? "<span class=\"favorite-star\">★</span>" : ""}</div>
      <div class="drawer-meta"><span class="drawer-type">${escapeHTML(item.type || "note")}</span>${item.address ? "Endereço guardado" : "Arquivo pessoal"}${photos.length ? " · " + photos.length + (photos.length === 1 ? " foto" : " fotos") : ""}${item.tags?.length ? " · " + escapeHTML(item.tags.join(", ")) : ""}</div><button class="open-drawer" type="button">ABRIR</button></div>
      <div class="drawer-preview">
        ${item.address ? `<div class="preview-address" title="Clique para copiar">⌖ <span class="copy-address" data-address="${escapeHTML(item.address)}">${escapeHTML(item.address)}</span></div>` : ""}
        ${item.text ? `<div>${escapeHTML(item.text)}</div>` : "<em>Nenhum texto nesta gaveta.</em>"}
        ${photos.length ? `<div class="preview-photo-grid">${photos.map((photo,index) => `<div class="preview-photo"><button type="button" class="preview-photo-button" data-photo-index="${index}"><img class="preview-image" src="${escapeHTML(photo.data)}" alt="Foto ${index + 1}"><span class="zoom-hint">Ampliar</span></button><div class="preview-actions"><a class="secondary" href="${escapeHTML(photo.data)}" download="${escapeHTML(photoDownloadName(item, photo, index + 1))}">Baixar foto ${index + 1}</a></div></div>`).join("")}</div>` : ""}
        <div class="preview-actions"><button class="secondary edit-item" type="button">Editar</button></div>
      </div>
    </article>`;
  }).join("");
  drawers.querySelectorAll(".open-drawer").forEach(btn => btn.addEventListener("click", () => btn.closest(".drawer").classList.toggle("is-open")));
  drawers.querySelectorAll(".edit-item").forEach(btn => btn.addEventListener("click", () => openEdit(btn.closest(".drawer").dataset.id)));
  drawers.querySelectorAll(".preview-photo-button").forEach(btn => btn.addEventListener("click", () => {
    const item = items[btn.closest(".drawer").dataset.id]; openLightbox(normalizePhotos(item), Number(btn.dataset.photoIndex));
  }));
  drawers.querySelectorAll(".copy-address").forEach(el => el.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(el.dataset.address); const old = el.textContent; el.textContent = "Endereço copiado"; setTimeout(() => el.textContent = old, 1200); }
    catch { showToast("Não foi possível copiar o endereço automaticamente.", "error"); }
  }));
}

async function compressImage(file) {
  if (!file.type.startsWith("image/")) throw new Error("O arquivo escolhido não é uma imagem.");
  let bitmap = await createImageBitmap(file);
  const maxDimension = 1400;
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  let width = Math.max(1, Math.round(bitmap.width * scale));
  let height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas"); canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext("2d", {alpha:false}); ctx.drawImage(bitmap, 0, 0, width, height); bitmap.close();
  let quality = 0.78; const maxBytes = 1.6 * 1024 * 1024;
  let data = canvas.toDataURL("image/jpeg", quality);
  while (data.length * 0.75 > maxBytes && quality > 0.45) { quality -= 0.07; data = canvas.toDataURL("image/jpeg", quality); }
  while (data.length * 0.75 > maxBytes && width > 700) {
    width = Math.round(width * 0.82); height = Math.round(height * 0.82); canvas.width = width; canvas.height = height;
    bitmap = await createImageBitmap(file); ctx.drawImage(bitmap, 0, 0, width, height); bitmap.close();
    quality = Math.max(0.55, quality - 0.03); data = canvas.toDataURL("image/jpeg", quality);
  }
  return { data, width, height, approxBytes: Math.round(data.length * 0.75) };
}

async function prepareFiles(files) {
  photoStatus.textContent = `Preparando ${files.length} ${files.length === 1 ? "foto" : "fotos"}...`;
  const results = [];
  for (let i = 0; i < files.length; i++) {
    photoStatus.textContent = `Reduzindo foto ${i + 1} de ${files.length}...`;
    const result = await compressImage(files[i]);
    results.push({ ...result, name: files[i].name, id: `new-${crypto.randomUUID ? crypto.randomUUID() : Date.now() + "-" + i}` });
  }
  pendingPhotos.push(...results);
  renderPhotoList(selectedPhotos, pendingPhotos, { title: $("#title").value || "foto" }, "Fotos novas", false, true);
  const totalMB = pendingPhotos.reduce((sum,r) => sum + r.approxBytes, 0) / 1024 / 1024;
  photoStatus.textContent = `${pendingPhotos.length} ${pendingPhotos.length === 1 ? "foto pronta" : "fotos prontas"} — aproximadamente ${totalMB.toFixed(2)} MB. Arraste para reordenar.`;
}

async function handleFiles(files) {
  const valid = files.filter(f => f.type.startsWith("image/"));
  if (!valid.length) { photoStatus.textContent = "Escolha arquivos de imagem."; return; }
  try { await prepareFiles(valid); }
  catch (err) { console.error(err); photoStatus.textContent = "Não foi possível processar uma das imagens."; showToast("Falha ao preparar uma foto.", "error"); }
}

loginBtn.addEventListener("click", async () => {
  try { await signInWithPopup(auth, provider); }
  catch (error) { console.error(error); alert(`Não foi possível entrar.\n\n${friendlyFirebaseError(error)}`); }
});
logoutBtn.addEventListener("click", () => signOut(auth));

onAuthStateChanged(auth, user => {
  currentUser = user;
  const logged = !!user;
  loginBtn.classList.toggle("hidden", logged); logoutBtn.classList.toggle("hidden", !logged); newItemBtn.classList.toggle("hidden", !logged);
  exportBtn.classList.toggle("hidden", !logged); importBtn.classList.toggle("hidden", !logged);
  userEmail.textContent = logged ? user.email : ""; loginNotice.classList.toggle("hidden", logged);
  if (unsubscribeItems) { unsubscribeItems(); unsubscribeItems = null; }
  if (!logged) {
    items = {}; itemCount.textContent = "0 itens";
    drawers.innerHTML = `<div class="empty-state"><strong>Faça login para abrir as gavetas.</strong><span>O banco fica bloqueado para visitantes.</span></div>`;
    return;
  }
  unsubscribeItems = onValue(itemsRef, snapshot => { items = snapshot.val() || {}; render(); }, error => {
    console.error(error);
    drawers.innerHTML = `<div class="empty-state"><strong>Acesso recusado.</strong><span>${escapeHTML(friendlyFirebaseError(error))}</span></div>`;
  });
});

searchInput.addEventListener("input", render);
clearSearch.addEventListener("click", () => { searchInput.value = ""; searchInput.focus(); render(); });
typeFilter.addEventListener("change", render); favoriteFilter.addEventListener("change", render); sortSelect.addEventListener("change", render);
newItemBtn.addEventListener("click", openNew);
closeDialog.addEventListener("click", () => dialog.close());
cancelBtn.addEventListener("click", () => dialog.close());

photoInput.addEventListener("change", async e => { const files = Array.from(e.target.files || []); e.target.value = ""; if (files.length) await handleFiles(files); });
photoDrop.addEventListener("dragover", e => { e.preventDefault(); photoDrop.classList.add("drag-over"); });
photoDrop.addEventListener("dragleave", () => photoDrop.classList.remove("drag-over"));
photoDrop.addEventListener("drop", async e => { e.preventDefault(); photoDrop.classList.remove("drag-over"); await handleFiles(Array.from(e.dataTransfer.files || [])); });

form.addEventListener("input", () => { clearTimeout(draftTimer); draftTimer = setTimeout(saveDraft, 350); });

form.addEventListener("submit", async event => {
  event.preventDefault(); if (!currentUser) return;
  const id = $("#itemId").value; const title = $("#title").value.trim();
  if (!title) { showToast("Dê um título para a gaveta.", "error"); return; }
  statusEl.textContent = "Guardando...";
  try {
    const itemId = id || push(itemsRef).key; const old = items[itemId] || {};
    let photos = old.photos && typeof old.photos === "object" ? { ...old.photos } : {};
    if (!Object.keys(photos).length && old.photoData) photos.legacy = { data: old.photoData, name: `${title}.jpg` };
    if (removePhoto.checked) photos = {};
    for (const removedId of editingRemovedPhotoIds) delete photos[removedId];
    for (const photo of pendingPhotos) {
      const photoId = push(ref(db, `gaveta/items/${itemId}/photos`)).key;
      photos[photoId] = { data: photo.data, name: photo.name, width: photo.width, height: photo.height, approxBytes: photo.approxBytes };
    }
    const data = {
      title, address: $("#address").value.trim(), text: $("#text").value.trim(), type: typeInput.value,
      tags: tagsInput.value.split(",").map(x => x.trim()).filter(Boolean), favorite: favoriteInput.checked,
      createdAt: old.createdAt || Date.now(), updatedAt: Date.now(), updatedBy: currentUser.uid
    };
    if (Object.keys(photos).length) data.photos = photos;
    await set(ref(db, `gaveta/items/${itemId}`), data);
    clearDraft(); dialog.close(); showToast(id ? "Gaveta atualizada." : "Gaveta guardada.");
  } catch(error) {
    console.error(error); statusEl.textContent = `Não foi possível guardar: ${friendlyFirebaseError(error)}`;
    showToast("Não foi possível guardar a gaveta.", "error");
  }
});

deleteBtn.addEventListener("click", async () => {
  const id = $("#itemId").value; const item = items[id]; if (!id || !item) return;
  if (!confirm(`Excluir "${item.title}"? Essa ação não pode ser desfeita.`)) return;
  statusEl.textContent = "Excluindo...";
  try { await remove(ref(db, `gaveta/items/${id}`)); clearDraft(); dialog.close(); showToast("Gaveta excluída."); }
  catch(error) { console.error(error); statusEl.textContent = `Não foi possível excluir: ${friendlyFirebaseError(error)}`; showToast("Não foi possível excluir.", "error"); }
});

function exportData() {
  const payload = { exportedAt: new Date().toISOString(), app: "Gaveta", version: 6, items };
  const blob = new Blob([JSON.stringify(payload)], {type:"application/json"});
  const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `gaveta-backup-${new Date().toISOString().slice(0,10)}.json`; a.click(); URL.revokeObjectURL(url);
  showToast("Backup exportado.");
}
async function importData(file) {
  try {
    const text = await file.text(); const payload = JSON.parse(text); const imported = payload.items || payload;
    if (!imported || typeof imported !== "object" || Array.isArray(imported)) throw new Error("Formato de backup inválido.");
    if (!confirm(`Importar ${Object.keys(imported).length} gaveta(s)? Isso adicionará/substituirá itens com os mesmos IDs.`)) return;
    for (const [id, item] of Object.entries(imported)) await set(ref(db, `gaveta/items/${id}`), item);
    showToast("Backup importado.");
  } catch (error) { console.error(error); showToast(`Falha ao importar: ${error.message || "arquivo inválido"}`, "error"); }
  finally { importInput.value = ""; }
}
exportBtn.addEventListener("click", exportData);
importBtn.addEventListener("click", () => importInput.click());
importInput.addEventListener("change", () => { const file = importInput.files?.[0]; if (file) importData(file); });

$("#lightboxClose").addEventListener("click", closeLightbox);
$("#lightboxPrev").addEventListener("click", () => { if (lightboxPhotos.length > 1) { lightboxIndex = (lightboxIndex - 1 + lightboxPhotos.length) % lightboxPhotos.length; updateLightbox(); } });
$("#lightboxNext").addEventListener("click", () => { if (lightboxPhotos.length > 1) { lightboxIndex = (lightboxIndex + 1) % lightboxPhotos.length; updateLightbox(); } });
$("#photoLightbox").addEventListener("click", e => { if (e.target.id === "photoLightbox") closeLightbox(); });
document.addEventListener("keydown", e => {
  if (!$("#photoLightbox").classList.contains("hidden")) {
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft" && lightboxPhotos.length > 1) { lightboxIndex = (lightboxIndex - 1 + lightboxPhotos.length) % lightboxPhotos.length; updateLightbox(); }
    if (e.key === "ArrowRight" && lightboxPhotos.length > 1) { lightboxIndex = (lightboxIndex + 1) % lightboxPhotos.length; updateLightbox(); }
  }
});
window.addEventListener("beforeunload", e => {
  if (dialog.open && (collectDraft().title || collectDraft().text || collectDraft().address || pendingPhotos.length)) { e.preventDefault(); e.returnValue = ""; }
});
