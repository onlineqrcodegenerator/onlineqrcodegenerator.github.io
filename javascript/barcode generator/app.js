
    /* ================= ACCORDION (FOCUS MODE) ================= */
    function toggleAccordion(id) {
      const targetItem = document.getElementById(id);
      const isOpen = targetItem.classList.contains("active");

      document.querySelectorAll(".accordion-item").forEach(item => {
        item.classList.remove("active");
      });

      if (!isOpen) {
        targetItem.classList.add("active");
      }
    }

    /* ================= MOBILE HAMBURGER MENU ================= */
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

    window.addEventListener("resize", () => {
      if (window.innerWidth > 768) closeMenu();
    });

    /* ================= BARCODE RENDERING & VALIDATION ================= */
    function renderBarcode() {
      const text = document.getElementById("bc-data").value.trim();
      const format = document.getElementById("bc-format").value;
      const displayValue = document.getElementById("bc-display-text").checked;
      const width = parseFloat(document.getElementById("bc-width").value);
      const height = parseInt(document.getElementById("bc-height").value, 10);
      const margin = parseInt(document.getElementById("bc-margin").value, 10);
      const lineColor = document.getElementById("bc-line-color").value;
      const isTransparent = document.getElementById("bc-transparent").checked;
      const background = isTransparent ? "transparent" : document.getElementById("bc-bg-color").value;
      const fontSize = parseInt(document.getElementById("bc-font-size").value, 10);
      const textAlign = document.getElementById("bc-text-align").value;

      const errorBox = document.getElementById("bc-error");
      const errorText = document.getElementById("bc-error-text");
      const inputField = document.getElementById("bc-data");

      if (!text) {
        errorText.textContent = "Please enter barcode data.";
        errorBox.style.display = "flex";
        inputField.classList.add("input-invalid");
        return;
      }

      try {
        JsBarcode("#barcode-svg", text, {
          format: format,
          width: width,
          height: height,
          displayValue: displayValue,
          lineColor: lineColor,
          background: background,
          margin: margin,
          fontSize: fontSize,
          textAlign: textAlign,
          valid: function(valid) {
            if (!valid) {
              throw new Error("Invalid format data");
            }
          }
        });

        // Success: hide errors
        errorBox.style.display = "none";
        inputField.classList.remove("input-invalid");
      } catch (err) {
        errorText.textContent = `Invalid data for ${format}. Please check format requirements.`;
        errorBox.style.display = "flex";
        inputField.classList.add("input-invalid");
      }
    }

    /* ================= DOWNLOAD HANDLERS ================= */
    function downloadBarcodeSVG() {
      const svg = document.getElementById("barcode-svg");
      const serializer = new XMLSerializer();
      let source = serializer.serializeToString(svg);

      // Add xml namespace if missing
      if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
        source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
      }

      const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const downloadLink = document.createElement("a");
      downloadLink.href = url;
      downloadLink.download = "barcode.svg";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);
    }

    function downloadBarcodePNG() {
      const svg = document.getElementById("barcode-svg");
      const serializer = new XMLSerializer();
      let source = serializer.serializeToString(svg);
      const isTransparent = document.getElementById("bc-transparent").checked;
      const bgColor = isTransparent ? "transparent" : document.getElementById("bc-bg-color").value;

      const img = new Image();
      const svgBlob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);

      img.onload = function() {
        const canvas = document.createElement("canvas");
        // Use 2x scaling for extra crisp raster output
        const scale = 2;
        canvas.width = (img.width || 400) * scale;
        canvas.height = (img.height || 200) * scale;
        const ctx = canvas.getContext("2d");

        if (!isTransparent) {
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);

        const a = document.createElement("a");
        a.download = "barcode.png";
        a.href = canvas.toDataURL("image/png");
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      };

      img.src = url;
    }

    /* ================= SETUP FORM LISTENERS ================= */
    function setupFormListeners() {
      // Inputs triggering render
      const textInputs = ["bc-data", "bc-format", "bc-text-align"];
      textInputs.forEach(id => {
        document.getElementById(id).addEventListener("input", renderBarcode);
      });

      document.getElementById("bc-display-text").addEventListener("change", renderBarcode);
      document.getElementById("bc-transparent").addEventListener("change", (e) => {
        document.getElementById("bc-bg-color-wrapper").style.display = e.target.checked ? "none" : "block";
        renderBarcode();
      });

      // Range sliders with label feedback
      const sliders = [
        { id: "bc-width", label: "bc-width-val" },
        { id: "bc-height", label: "bc-height-val" },
        { id: "bc-margin", label: "bc-margin-val" },
        { id: "bc-font-size", label: "bc-font-size-val" }
      ];
      sliders.forEach(s => {
        document.getElementById(s.id).addEventListener("input", (e) => {
          document.getElementById(s.label).textContent = e.target.value;
          renderBarcode();
        });
      });

      // Color pickers with hex text feedback
      const colorPickers = [
        { id: "bc-line-color", label: "bc-line-color-hex" },
        { id: "bc-bg-color", label: "bc-bg-color-hex" }
      ];
      colorPickers.forEach(c => {
        document.getElementById(c.id).addEventListener("input", (e) => {
          document.getElementById(c.label).textContent = e.target.value;
          renderBarcode();
        });
      });
    }

    // Initialize on load
    setupFormListeners();
    renderBarcode();