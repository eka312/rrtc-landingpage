// untuk mengambil data
       
async function refreshList() {
  try {
    const res = await axios.get("http://127.0.0.1:8000/api/berita"); 
    console.log("Hasil API:", res.data);
          
    const articles = res.data.data ?? res.data;
    const tbody = document.getElementById("articlesTableBody");
    tbody.innerHTML = "";
          
    articles.forEach((item, index) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${item.judul}</td>
        <td class="text-center">${formatTanggal(item.tanggal_terbit)}</td>
        <td class="text-center">
          <span class="badge ${item.status === "published" ? "bg-success" : "bg-secondary"}">
            ${item.status}
          </span>
        </td>
        <td class="text-end ">
          <button 
            class="btn btn-sm btn-secondary m-1" 
            onclick="openEditModal(${item.id_berita}, '${item.judul}', '${item.penulis}', '${item.tanggal_terbit}', '${item.status}', '${item.gambar}', \`${item.isi}\`)"
            data-bs-toggle="modal" 
            data-bs-target="#editModal" 
            >
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-danger m-1" onclick="setDelete(${item.id_berita})" data-bs-toggle="modal" data-bs-target="#deleteModal">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Gagal load data:", err);
    alert("Gagal ambil data berita");
  }
}
// untuk mengambil data  end-->

          
// Format tanggal YYYY-MM-DD → DD-MM-YYYY
function formatTanggal(tgl) {
  if (!tgl) return "-";
  const [year, month, day] = tgl.split("-");
  return `${day}-${month}-${year}`;
}

          
// Auto refresh list waktu halaman pertama kali kebuka
document.addEventListener("DOMContentLoaded", refreshList);
        

// menambahkan data start
async function handleSubmit(event) {
  event.preventDefault();

  const form = document.getElementById("articleForm");
  const formData = new FormData(form);

  try {
    const res = await axios.post("http://127.0.0.1:8000/api/berita", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "Accept": "application/json"
        // kalau sudah pakai token auth tambahin di sini
        // "Authorization": "Bearer <token>"
      }
    });

    console.log("tambah data response", res.data);

    if (res.status === 201 || res.data.status === true) {
      form.reset();
      document.getElementById("coverPreview").classList.add("d-none");
      refreshList();

    } else{
      alert(res.data.message || "Gagal menambahkan artikel");
    }
  } catch(err) {
    console.error("Error tambah data:", err);
    alert("Terjadi error saat menambahkan artikel");
  }  
}

function previewImage(event) {
  const input = event.target;
  const preview = document.getElementById("coverPreview");

  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      preview.src = e.target.result;
      preview.classList.remove("d-none");
    }
    reader.readAsDataURL(input.files[0]);
  } else {
    preview.src = "";
    preview.classList.add("d-none");
  }
}
        
// menambahkan data end

// mengedit data start
async function handleUpdate(event) {
  event.preventDefault(); // cegah reload

  const form = document.getElementById("editArticleForm");
  const formData = new FormData(form);

  const id = document.getElementById("edit_id").value; // ambil ID artikel

  try {
    const res = await axios.post(`http://127.0.0.1:8000/api/berita/${id}?_method=PUT`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "Accept": "application/json"
      }
    });

    console.log("Update response:", res.data);

    if (res.status === 200 || res.data.status === true) {

      // Tutup modal
      const modal = bootstrap.Modal.getInstance(document.getElementById("editModal"));
      modal.hide();

      // Refresh tabel artikel
      refreshList();
    } else {
      alert(res.data.message || "Gagal update artikel ❌");
    }
  } catch (err) {
    console.error("Error update:", err);
    alert("Terjadi error saat update artikel");
  }
}
//mengedit data end


// buka modal edit dan isi data
function openEditModal(id, judul, penulis, tanggal, status, gambar, isi) {
  // isi field di modal
  document.getElementById("edit_id").value = id;
  document.getElementById("edit_judul").value = judul;
  document.getElementById("edit_penulis").value = penulis || "";
  document.getElementById("edit_tanggal").value = tanggal || "";
  document.getElementById("edit_status").value = status || "draft";
  document.getElementById("edit_isi").value = isi || "";

  // tampilkan gambar saat ini kalau ada
  if (gambar) {
    document.getElementById("currentImageContainer").style.display = "block";
  
    // tambahin base URL Laravel + "storage/"
    let imageUrl = `http://127.0.0.1:8000/storage/${gambar}`;
    document.getElementById("currentImage").src = imageUrl;
  } else {
    document.getElementById("currentImageContainer").style.display = "none";
    document.getElementById("currentImage").src = "";
  }

  // reset preview baru (biar ga keikut dari edit sebelumnya)
  document.getElementById("edit_coverPreview").classList.add("d-none");
  document.getElementById("edit_coverPreview").src = "";
  document.getElementById("edit_cover").value = "";
}

// preview gambar baru pas ganti file
function previewEditImage(event) {
  const input = event.target;
  const preview = document.getElementById("edit_coverPreview");

  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = e => {
      preview.src = e.target.result;
      preview.classList.remove("d-none");
    };
    reader.readAsDataURL(input.files[0]);
  } else {
    preview.src = "";
    preview.classList.add("d-none");
  }
}
// buka modal edit dan isi data end



// menghapus data
       
let deleteId = null;

function setDelete(id) {
  deleteId = id;
}

document.getElementById("confirmDeleteBtn").addEventListener("click", async () => {

  if (!deleteId) return;

  try {
    const res = await axios.delete(`http://127.0.0.1:8000/api/berita/${deleteId}`, {
      headers: {
          "Accept": "application/json"
          // kalau pakai token auth tambahin di sini
          // "Authorization": "Bearer <token>"
      }
    });

    console.log("Delete response:", res.data);

    if (res.status === 200) {
      // Tutup modal
      const modal = bootstrap.Modal.getInstance(document.getElementById("deleteModal"));
      modal.hide();

      // Reset ID
      deleteId = null;

      // Refresh list
      refreshList();
    } else {
      alert(res.data.message || "Gagal menghapus artikel");
    }
  } catch (err) {
      console.error("Error delete:", err);
      alert("Terjadi error saat menghapus");
  }
});
        
// mengahapus data end







