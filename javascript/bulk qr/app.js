
    /* ================= ACCORDION & HAMBURGER ================= */
    function toggleAccordion(id) {
      const target = document.getElementById(id);
      const isOpen = target.classList.contains("active");
      document.querySelectorAll(".accordion-item").forEach(item => item.classList.remove("active"));
      if (!isOpen) target.classList.add("active");
    }

    const hamburgerBtn = document.getElementById("hamburger-btn");
    const navLinks = document.getElementById("nav-links");
    function toggleMenu() {
      hamburgerBtn.classList.toggle("is-active");
      navLinks.classList.toggle("open");
    }
    function closeMenu() {
      hamburgerBtn.classList.remove("is-active");
      navLinks.classList.remove("open");
    }

    /* ================= STATE ================= */
    let parsedRows = [];
    let fileHeaders = [];
    let logoDataUrl = "";

    // Style Preview Instance
    const sampleQR = new QRCodeStyling({
      width: 180,
      height: 180,
      type: "canvas",
      data: "Sample Preview Code",
      dotsOptions: { color: "#0284c7", type: "rounded" },
      backgroundOptions: { color: "#ffffff" },
      imageOptions: { crossOrigin: "anonymous", margin: 4, imageSize: 0.25 },
      qrOptions: { errorCorrectionLevel: "H" }
    });
    sampleQR.append(document.getElementById("sample-qr"));

    function getStylingOptions(dataString, width = 600, height = 600) {
      const dotsType = document.getElementById("dots-style").value;
      const colorType = document.getElementById("color-type").value;
      const c1 = document.getElementById("dot-color-1").value;
      const c2 = document.getElementById("dot-color-2").value;

      let dotsOptions = { type: dotsType };
      if (colorType === "single") {
        dotsOptions.color = c1;
      } else {
        dotsOptions.gradient = {
          type: "linear",
          rotation: 45,
          colorStops: [{ offset: 0, color: c1 }, { offset: 1, color: c2 }]
        };
      }

      const isTransparent = document.getElementById("bg-transparent").checked;
      const bgColor = isTransparent ? "transparent" : document.getElementById("bg-color").value;
      const logoSize = parseFloat(document.getElementById("logo-size").value);
      const logoMargin = parseInt(document.getElementById("logo-margin").value, 10);

      return {
        width: width,
        height: height,
        data: dataString,
        image: logoDataUrl,
        dotsOptions: dotsOptions,
        backgroundOptions: { color: bgColor },
        imageOptions: {
          crossOrigin: "anonymous",
          imageSize: logoSize,
          margin: logoMargin
        },
        qrOptions: { errorCorrectionLevel: "H" }
      };
    }

    function updateSample() {
      sampleQR.update(getStylingOptions("Sample Preview Code", 180, 180));
    }

    /* ================= SPREADSHEET PARSER (.CSV & .XLSX) ================= */
    document.getElementById("spreadsheet-file-input").addEventListener("change", (e) => {
      const file = e.target.files[0];
      const errorBox = document.getElementById("file-error");
      const errorText = document.getElementById("file-error-text");

      if (!file) return;

      const fileName = file.name.toLowerCase();

      // Excel Files (.xlsx, .xls)
      if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
        const reader = new FileReader();
        reader.onload = function(evt) {
          try {
            const data = new Uint8Array(evt.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            const jsonResults = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

            if (!jsonResults || !jsonResults.length) {
              throw new Error("No data found in the first sheet.");
            }

            parsedRows = jsonResults;
            fileHeaders = Object.keys(jsonResults[0]);
            handleParsedSuccess();
          } catch (err) {
            errorText.textContent = "Error parsing Excel workbook: " + err.message;
            errorBox.style.display = "flex";
          }
        };
        reader.readAsArrayBuffer(file);
      } 
      // CSV Files (.csv)
      else {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: function(results) {
            if (results.errors.length && !results.data.length) {
              errorText.textContent = "Error parsing CSV file.";
              errorBox.style.display = "flex";
              return;
            }

            parsedRows = results.data;
            fileHeaders = results.meta.fields || [];
            handleParsedSuccess();
          }
        });
      }
    });

    function handleParsedSuccess() {
      const errorBox = document.getElementById("file-error");
      if (!parsedRows.length) {
        document.getElementById("file-error-text").textContent = "Spreadsheet contains no data rows.";
        errorBox.style.display = "flex";
        return;
      }

      errorBox.style.display = "none";
      populateDropdowns();
      document.getElementById("status-count").textContent = parsedRows.length;
      document.getElementById("status-msg").textContent = "File Ready";
      document.getElementById("btn-download-zip").disabled = false;
      document.getElementById("btn-print-sheet").disabled = false;
    }

    function populateDropdowns() {
      const dataSelect = document.getElementById("data-column-select");
      const nameSelect = document.getElementById("name-column-select");
      dataSelect.innerHTML = "";
      nameSelect.innerHTML = "";

      fileHeaders.forEach((header) => {
        const opt1 = document.createElement("option");
        opt1.value = header;
        opt1.textContent = header;
        dataSelect.appendChild(opt1);

        const opt2 = document.createElement("option");
        opt2.value = header;
        opt2.textContent = header;
        nameSelect.appendChild(opt2);
      });

      if (fileHeaders.length > 1) {
        nameSelect.selectedIndex = 1;
      }

      document.getElementById("mapping-section").style.display = "block";
    }

    /* ================= BATCH ZIP GENERATION ================= */
    async function generateBatchZip() {
      if (!parsedRows.length) return;

      const dataCol = document.getElementById("data-column-select").value;
      const nameCol = document.getElementById("name-column-select").value;
      const btn = document.getElementById("btn-download-zip");
      const progressContainer = document.getElementById("progress-container");
      const progressFill = document.getElementById("progress-fill");
      const statusMsg = document.getElementById("status-msg");

      btn.disabled = true;
      progressContainer.style.display = "block";
      statusMsg.textContent = "Generating ZIP...";

      const zip = new JSZip();
      const folder = zip.folder("qr-codes");
      const total = parsedRows.length;

      for (let i = 0; i < total; i++) {
        const row = parsedRows[i];
        const qrContent = String(row[dataCol] || "").trim();
        let fileName = String(row[nameCol] || `row-${i + 1}`).trim().replace(/[/\\?%*:|"<>]/g, "-");
        if (!fileName) fileName = `code-${i + 1}`;

        if (qrContent) {
          const qrInstance = new QRCodeStyling({
            ...getStylingOptions(qrContent, 600, 600),
            type: "canvas"
          });

          const blob = await qrInstance.getRawData("png");
          folder.file(`${fileName}.png`, blob);
        }

        const percent = Math.round(((i + 1) / total) * 100);
        progressFill.style.width = percent + "%";
        statusMsg.textContent = `Processing: ${i + 1} / ${total}`;
      }

      statusMsg.textContent = "Compressing archive...";
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "bulk-qr-codes.zip");

      statusMsg.textContent = "Completed!";
      btn.disabled = false;
      setTimeout(() => { progressContainer.style.display = "none"; }, 2000);
    }

    /* ================= PRINTABLE CONTACT SHEET (FIXED) ================= */
    async function generatePrintSheet() {
      if (!parsedRows.length) return;

      const dataCol = document.getElementById("data-column-select").value;
      const nameCol = document.getElementById("name-column-select").value;
      const sheet = document.getElementById("print-sheet");
      const statusMsg = document.getElementById("status-msg");
      sheet.innerHTML = "";

      statusMsg.textContent = "Building Print Sheet...";

      for (let i = 0; i < parsedRows.length; i++) {
        const row = parsedRows[i];
        const content = String(row[dataCol] || "").trim();
        const labelName = String(row[nameCol] || `Item #${i + 1}`).trim();

        if (content) {
          const qrInstance = new QRCodeStyling({
            ...getStylingOptions(content, 220, 220),
            type: "canvas"
          });

          const blob = await qrInstance.getRawData("png");
          const imgUrl = URL.createObjectURL(blob);

          const itemDiv = document.createElement("div");
          itemDiv.className = "sheet-item";
          itemDiv.innerHTML = `
            <img src="${imgUrl}" alt="QR" />
            <span>${labelName}</span>
          `;
          sheet.appendChild(itemDiv);
        }
      }

      statusMsg.textContent = "Opening Print Dialog...";
      
      // Clean cleanup after printing to restore page state
      window.onafterprint = () => {
        sheet.innerHTML = "";
        statusMsg.textContent = "File Ready";
      };

      setTimeout(() => {
        window.print();
      }, 500);
    }

    /* ================= SETUP FORM LISTENERS ================= */
    function setupListeners() {
      ["dots-style", "color-type", "logo-size", "logo-margin"].forEach(id => {
        document.getElementById(id).addEventListener("input", updateSample);
      });

      ["dot-color-1", "dot-color-2", "bg-color"].forEach(id => {
        const picker = document.getElementById(id);
        const hex = document.getElementById(id + "-hex");
        picker.addEventListener("input", () => {
          if (hex) hex.textContent = picker.value;
          updateSample();
        });
      });

      document.getElementById("color-type").addEventListener("change", (e) => {
        document.getElementById("gradient-secondary-group").style.display = 
          e.target.value === "single" ? "none" : "block";
        updateSample();
      });

      document.getElementById("bg-transparent").addEventListener("change", (e) => {
        document.getElementById("bg-color-wrapper").style.display = 
          e.target.checked ? "none" : "block";
        updateSample();
      });

      document.getElementById("logo-size").addEventListener("input", (e) => {
        document.getElementById("logo-size-val").textContent = e.target.value;
      });
      document.getElementById("logo-margin").addEventListener("input", (e) => {
        document.getElementById("logo-margin-val").textContent = e.target.value;
      });

      document.getElementById("logo-file").addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            logoDataUrl = event.target.result;
            updateSample();
          };
          reader.readAsDataURL(file);
        }
      });
    }

    setupListeners();
    updateSample();
