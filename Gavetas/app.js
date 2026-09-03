// Gaveta — somente Firebase Realtime Database + Firebase Authentication
// As fotos são redimensionadas/comprimidas no navegador e salvas como Base64 no RTDB.

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getDatabase, ref, push, set, remove, onValue } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

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

const drawers = document.querySelector("#drawers");
const itemCount = document.querySelector("#itemCount");
const searchInput = document.querySelector("#searchInput");
const dialog = document.querySelector("#itemDialog");
const form = document.querySelector("#itemForm");
const newItemBtn = document.querySelector("#newItemBtn");
const loginBtn = document.querySelector("#loginBtn");
const logoutBtn = document.querySelector("#logoutBtn");
const userEmail = document.querySelector("#userEmail");
const loginNotice = document.querySelector("#loginNotice");
const closeDialog = document.querySelector("#closeDialog");
const cancelBtn = document.querySelector("#cancelBtn");
const deleteBtn = document.querySelector("#deleteBtn");
const statusEl = document.querySelector("#formStatus");
const currentPhoto = document.querySelector("#currentPhoto");
const photoStatus = document.querySelector("#photoStatus");
const removePhotoRow = document.querySelector("#removePhotoRow");
const removePhoto = document.querySelector("#removePhoto");
const typeInput = document.querySelector("#type");
const tagsInput = document.querySelector("#tags");
const favoriteInput = document.querySelector("#favorite");

let items = {};
let currentUser = null;

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
}

function resetPhotoUI() {
  currentPhoto.classList.add("hidden"); currentPhoto.innerHTML = "";
  removePhotoRow.classList.add("hidden"); removePhoto.checked = false;
  photoStatus.textContent = "";
}

function openNew() {
  form.reset(); document.querySelector("#itemId").value = "";
  document.querySelector("#dialogTitle").textContent = "Nova gaveta";
  deleteBtn.classList.add("hidden"); statusEl.textContent = "";
  resetPhotoUI(); typeInput.value = "note"; favoriteInput.checked = false;
  dialog.showModal();
}

function openEdit(id) {
  const item = items[id]; if (!item) return;
  document.querySelector("#itemId").value = id;
  document.querySelector("#title").value = item.title || "";
  document.querySelector("#address").value = item.address || "";
  typeInput.value = item.type || "note";
  tagsInput.value = Array.isArray(item.tags) ? item.tags.join(", ") : "";
  favoriteInput.checked = !!item.favorite;
  document.querySelector("#text").value = item.text || "";
  document.querySelector("#photo").value = "";
  document.querySelector("#dialogTitle").textContent = "Editar gaveta";
  deleteBtn.classList.remove("hidden"); statusEl.textContent = ""; resetPhotoUI();
  if (item.photoData) {
    currentPhoto.classList.remove("hidden");
    currentPhoto.innerHTML = `<small>Foto atual</small><br><img src="${escapeHTML(item.photoData)}" alt="Foto atual"><div class="photo-actions"><a class="secondary" href="${escapeHTML(item.photoData)}" download="${escapeHTML((item.title || "foto") + ".jpg")}">Baixar foto</a></div>`;
    removePhotoRow.classList.remove("hidden");
  }
  dialog.showModal();
}

function render() {
  if (!currentUser) return;
  const term = searchInput.value.trim().toLowerCase();
  const filtered = Object.entries(items).filter(([, item]) => (item.title || "").toLowerCase().includes(term)).sort((a,b) => (b[1].createdAt || 0) - (a[1].createdAt || 0));
  itemCount.textContent = `${filtered.length} ${filtered.length === 1 ? "item" : "itens"}`;
  if (!filtered.length) { drawers.innerHTML = `<div class="empty-state"><strong>${term ? "Nada encontrado." : "Nenhuma gaveta aberta."}</strong><span>${term ? "Tente outro título." : "Crie a primeira para começar."}</span></div>`; return; }
  drawers.innerHTML = filtered.map(([id,item]) => `
    <article class="drawer" data-id="${escapeHTML(id)}">
      <div class="drawer-front"><div class="drawer-tab"></div><div class="drawer-title">${escapeHTML(item.title || "Sem título")}${item.favorite ? "<span class=\"favorite-star\">★</span>" : ""}</div>
      <div class="drawer-meta"><span class="drawer-type">${escapeHTML(item.type || "note")}</span>${item.address ? "Endereço guardado" : "Arquivo pessoal"}${item.photoData ? " · Foto" : ""}${item.tags?.length ? " · " + escapeHTML(item.tags.join(", ")) : ""}</div><button class="open-drawer" type="button">ABRIR</button></div>
      <div class="drawer-preview">
        ${item.address ? `<div class="preview-address">⌖ ${escapeHTML(item.address)}</div>` : ""}
        ${item.text ? `<div>${escapeHTML(item.text)}</div>` : "<em>Nenhum texto nesta gaveta.</em>"}
        ${item.photoData ? `<img class="preview-image" src="${escapeHTML(item.photoData)}" alt="Foto guardada"><div class="preview-actions"><a class="secondary" href="${escapeHTML(item.photoData)}" download="${escapeHTML((item.title || "foto") + ".jpg")}">Baixar foto</a></div>` : ""}
        <div class="preview-actions"><button class="secondary edit-item" type="button">Editar</button></div>
      </div>
    </article>`).join("");
  drawers.querySelectorAll(".open-drawer").forEach(btn => btn.addEventListener("click", () => btn.closest(".drawer").classList.toggle("is-open")));
  drawers.querySelectorAll(".edit-item").forEach(btn => btn.addEventListener("click", () => openEdit(btn.closest(".drawer").dataset.id)));
}

function fileToDataURL(file, type, quality) {
  return new Promise((resolve,reject) => { const reader = new FileReader(); reader.onload=()=>resolve(reader.result); reader.onerror=reject; reader.readAsDataURL(file); });
}

async function compressImage(file) {
  if (!file.type.startsWith("image/")) throw new Error("O arquivo escolhido não é uma imagem.");
  const bitmap = await createImageBitmap(file);
  const maxDimension = 1400;
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  let width = Math.max(1, Math.round(bitmap.width * scale));
  let height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas"); canvas.width=width; canvas.height=height;
  const ctx = canvas.getContext("2d", {alpha:false}); ctx.drawImage(bitmap,0,0,width,height); bitmap.close();
  let quality = 0.78;
  let data = canvas.toDataURL("image/jpeg", quality);
  const maxBytes = 1.6 * 1024 * 1024;
  while (data.length * 0.75 > maxBytes && quality > 0.45) { quality -= 0.07; data = canvas.toDataURL("image/jpeg", quality); }
  if (data.length * 0.75 > maxBytes) {
    const factor = 0.72; canvas.width=Math.max(1,Math.round(width*factor)); canvas.height=Math.max(1,Math.round(height*factor));
    ctx.drawImage(await createImageBitmap(file),0,0,canvas.width,canvas.height); data=canvas.toDataURL("image/jpeg",0.65);
  }
  return { data, width: canvas.width, height: canvas.height, approxBytes: Math.round(data.length * 0.75) };
}

loginBtn.addEventListener("click", async () => {
  try { await signInWithPopup(auth, provider); } catch (error) { console.error(error); alert("Não foi possível entrar. Confira se o Google está habilitado no Firebase Authentication e se o domínio está autorizado."); }
});
logoutBtn.addEventListener("click", () => signOut(auth));

onAuthStateChanged(auth, user => {
  currentUser = user;
  const logged = !!user;
  loginBtn.classList.toggle("hidden", logged); logoutBtn.classList.toggle("hidden", !logged); newItemBtn.classList.toggle("hidden", !logged);
  userEmail.textContent = logged ? user.email : ""; loginNotice.classList.toggle("hidden", logged);
  if (!logged) { items={}; itemCount.textContent="0 itens"; drawers.innerHTML=`<div class="empty-state"><strong>Faça login para abrir as gavetas.</strong><span>O banco fica bloqueado para visitantes.</span></div>`; return; }
  onValue(itemsRef, snapshot => { items = snapshot.val() || {}; render(); }, error => { console.error(error); drawers.innerHTML=`<div class="empty-state"><strong>Acesso recusado.</strong><span>Confira as Security Rules e se sua conta foi autorizada.</span></div>`; });
});

searchInput.addEventListener("input", render); newItemBtn.addEventListener("click", openNew); closeDialog.addEventListener("click",()=>dialog.close()); cancelBtn.addEventListener("click",()=>dialog.close());

document.querySelector("#photo").addEventListener("change", async e => {
  const file=e.target.files[0]; if(!file) return; photoStatus.textContent="Preparando e reduzindo a foto...";
  try { const result=await compressImage(file); photoStatus.textContent=`Foto reduzida para aproximadamente ${(result.approxBytes/1024/1024).toFixed(2)} MB (${result.width}×${result.height}).`; }
  catch(err){ console.error(err); photoStatus.textContent="Não foi possível processar esta imagem."; e.target.value=""; }
});

form.addEventListener("submit", async event => {
  event.preventDefault(); if(!currentUser) return;
  const id=document.querySelector("#itemId").value; const title=document.querySelector("#title").value.trim(); const address=document.querySelector("#address").value.trim(); const text=document.querySelector("#text").value.trim(); const file=document.querySelector("#photo").files[0];
  if(!title) return; statusEl.textContent="Guardando...";
  try {
    const itemId=id || push(itemsRef).key; const old=items[itemId] || {}; let photoData=old.photoData || "";
    if(removePhoto.checked) photoData="";
    if(file) { const result=await compressImage(file); photoData=result.data; }
    const data={ title,address,text,photoData,type:typeInput.value,tags:tagsInput.value.split(",").map(x=>x.trim()).filter(Boolean),favorite:favoriteInput.checked,createdAt:old.createdAt||Date.now(),updatedAt:Date.now(),updatedBy:currentUser.uid };
    await set(ref(db,`gaveta/items/${itemId}`),data); dialog.close();
  } catch(error) { console.error(error); statusEl.textContent="Não foi possível guardar. Confira o login e as Security Rules."; }
});

deleteBtn.addEventListener("click", async () => {
  const id=document.querySelector("#itemId").value; const item=items[id]; if(!id||!item) return; if(!confirm(`Excluir "${item.title}"?`)) return; statusEl.textContent="Excluindo...";
  try { await remove(ref(db,`gaveta/items/${id}`)); dialog.close(); } catch(error){ console.error(error); statusEl.textContent="Não foi possível excluir."; }
});
