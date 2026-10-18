
    /* ================= ACCORDION (FOCUS MODE) ================= */
    function toggleAccordion(id) {
      const targetItem = document.getElementById(id);
      const isOpen = targetItem.classList.contains("active");

      // Close all accordion panels
      document.querySelectorAll(".accordion-item").forEach(item => {
        item.classList.remove("active");
      });

      // Expand clicked panel if it wasn't already open
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
      if (window.innerWidth > 768) {
        closeMenu();
      }
    });

    /* ================= QR LOGIC ================= */
    let logoDataUrl = "";
    let isSimpleMode = false;

    // Initialize QR code instance
    const qrCode = new QRCodeStyling({
      width: 250,
      height: 250,
      type: "canvas",
      data: "",
      image: "",
      dotsOptions: { color: "#0284c7", type: "rounded" },
      backgroundOptions: { color: "#ffffff" },
      imageOptions: { crossOrigin: "anonymous", margin: 4, imageSize: 0.25 },
      cornersSquareOptions: { type: "extra-rounded", color: "#0284c7" },
      cornersDotOptions: { type: "dot", color: "#0284c7" },
      qrOptions: { errorCorrectionLevel: "H" }
    });

    qrCode.append(document.getElementById("qr-preview"));

    /* ================= VCARD FORMATTER & PARSER ================= */
    function buildVCardString() {
      const first = document.getElementById("vc-first").value.trim();
      const last = document.getElementById("vc-last").value.trim();
      const company = document.getElementById("vc-company").value.trim();
      const title = document.getElementById("vc-title").value.trim();
      const phone = document.getElementById("vc-phone").value.trim();
      const email = document.getElementById("vc-email").value.trim();
      const website = document.getElementById("vc-website").value.trim();
      const address = document.getElementById("vc-address").value.trim();

      // Validation: Needs a name, plus phone or email
      if (!first && !last) return null;
      if (!phone && !email) return null;

      let vcard = "BEGIN:VCARD\nVERSION:3.0\n";
      vcard += `N:${last};${first};;;\n`;
      vcard += `FN:${first} ${last}`.trim() + "\n";
      if (company) vcard += `ORG:${company}\n`;
      if (title) vcard += `TITLE:${title}\n`;
      if (phone) vcard += `TEL;TYPE=CELL:${phone}\n`;
      if (email) vcard += `EMAIL:${email}\n`;
      if (website) vcard += `URL:${website}\n`;
      if (address) vcard += `ADR;TYPE=WORK:;;${address};;;;\n`;
      vcard += "END:VCARD";

      return vcard;
    }

    function parseVCF(content) {
      const lines = content.split(/\r\n|\r|\n/);
      let firstName = "", lastName = "", org = "", title = "", tel = "", email = "", url = "", adr = "";

      lines.forEach(line => {
        const upper = line.toUpperCase();
        if (upper.startsWith("N:") || upper.startsWith("N;")) {
          const parts = line.substring(line.indexOf(":") + 1).split(";");
          lastName = parts[0] || "";
          firstName = parts[1] || "";
        } else if (upper.startsWith("FN:") && !firstName && !lastName) {
          const fullName = line.substring(line.indexOf(":") + 1).trim();
          const parts = fullName.split(" ");
          firstName = parts[0] || "";
          lastName = parts.slice(1).join(" ") || "";
        } else if (upper.startsWith("ORG:") || upper.startsWith("ORG;")) {
          org = line.substring(line.indexOf(":") + 1).replace(/;/g, " ").trim();
        } else if (upper.startsWith("TITLE:") || upper.startsWith("TITLE;")) {
          title = line.substring(line.indexOf(":") + 1).trim();
        } else if (upper.startsWith("TEL:") || upper.startsWith("TEL;")) {
          tel = line.substring(line.indexOf(":") + 1).trim();
        } else if (upper.startsWith("EMAIL:") || upper.startsWith("EMAIL;")) {
          email = line.substring(line.indexOf(":") + 1).trim();
        } else if (upper.startsWith("URL:") || upper.startsWith("URL;")) {
          url = line.substring(line.indexOf(":") + 1).trim();
        } else if (upper.startsWith("ADR:") || upper.startsWith("ADR;")) {
          const parts = line.substring(line.indexOf(":") + 1).split(";");
          adr = parts.filter(p => p.trim().length > 0).join(", ");
        }
      });

      if (firstName) document.getElementById("vc-first").value = firstName;
      if (lastName) document.getElementById("vc-last").value = lastName;
      if (org) document.getElementById("vc-company").value = org;
      if (title) document.getElementById("vc-title").value = title;
      if (tel) document.getElementById("vc-phone").value = tel;
      if (email) document.getElementById("vc-email").value = email;
      if (url) document.getElementById("vc-website").value = url;
      if (adr) document.getElementById("vc-address").value = adr;

      validateAndUpdateQR();
    }

    function validateAndUpdateQR() {
      const vcardData = buildVCardString();
      const errorBox = document.getElementById("vcard-error");

      if (!vcardData) {
        errorBox.style.display = "flex";
        return;
      }

      errorBox.style.display = "none";
      qrCode.update(getOptions(250, 250, vcardData));
    }

    /* ================= OPTION COMPILATION ================= */
    function getOptions(renderWidth = 250, renderHeight = 250, dataOverride = null) {
      const data = dataOverride || buildVCardString() || "BEGIN:VCARD\nVERSION:3.0\nFN:Alex Rivera\nTEL:+1234567890\nEND:VCARD";

      if (isSimpleMode) {
        return {
          width: renderWidth,
          height: renderHeight,
          data: data,
          image: "",
          dotsOptions: { color: "#000000", type: "square", gradient: null },
          backgroundOptions: { color: "#ffffff" },
          cornersSquareOptions: { type: "square", color: "#000000" },
          cornersDotOptions: { type: "square", color: "#000000" },
          qrOptions: { errorCorrectionLevel: "M" }
        };
      }

      const dotsType = document.getElementById("dots-style").value;
      const colorType = document.getElementById("color-type").value;
      const c1 = document.getElementById("dot-color-1").value;
      const c2 = document.getElementById("dot-color-2").value;

      let dotsOptions = { type: dotsType };
      if (colorType === "single") {
        dotsOptions.color = c1;
        dotsOptions.gradient = null;
      } else {
        dotsOptions.gradient = {
          type: colorType,
          rotation: 45,
          colorStops: [
            { offset: 0, color: c1 },
            { offset: 1, color: c2 }
          ]
        };
      }

      const cornerSquareType = document.getElementById("corner-square-style").value;
      const cornerSquareColor = document.getElementById("corner-square-color").value;
      const cornerDotType = document.getElementById("corner-dot-style").value;
      const cornerDotColor = document.getElementById("corner-dot-color").value;

      const isTransparent = document.getElementById("bg-transparent").checked;
      const bgColor = isTransparent ? "transparent" : document.getElementById("bg-color").value;

      const logoSize = parseFloat(document.getElementById("logo-size").value);
      const logoMargin = parseInt(document.getElementById("logo-margin").value, 10);

      return {
        width: renderWidth,
        height: renderHeight,
        data: data,
        image: logoDataUrl,
        dotsOptions: dotsOptions,
        backgroundOptions: { color: bgColor },
        cornersSquareOptions: { type: cornerSquareType, color: cornerSquareColor },
        cornersDotOptions: { type: cornerDotType, color: cornerDotColor },
        imageOptions: {
          crossOrigin: "anonymous",
          imageSize: logoSize,
          margin: logoMargin
        },
        qrOptions: { errorCorrectionLevel: "H" }
      };
    }

    /* ================= SETUP EVENT LISTENERS ================= */
    function setupFormListeners() {
      // VCF File Upload listener
      const vcfInput = document.getElementById("vcard-file-input");
      vcfInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            parseVCF(event.target.result);
          };
          reader.readAsText(file);
        }
      });

      // Contact fields
      const contactFields = [
        "vc-first", "vc-last", "vc-company", "vc-title", 
        "vc-phone", "vc-email", "vc-website", "vc-address"
      ];
      contactFields.forEach(id => {
        document.getElementById(id).addEventListener("input", validateAndUpdateQR);
      });

      // Simple QR Toggle
      document.getElementById("simple-qr-toggle").addEventListener("change", (e) => {
        isSimpleMode = e.target.checked;
        if (isSimpleMode) {
          document.body.classList.add("is-simple");
        } else {
          document.body.classList.remove("is-simple");
        }
        validateAndUpdateQR();
      });

      // Dropdowns & sliders
      const liveInputs = [
        "dots-style", "corner-square-style", "corner-dot-style", 
        "logo-size", "logo-margin"
      ];
      liveInputs.forEach(id => {
        document.getElementById(id).addEventListener("input", validateAndUpdateQR);
      });

      // Colors
      const colors = ["dot-color-1", "dot-color-2", "corner-square-color", "corner-dot-color", "bg-color"];
      colors.forEach(id => {
        const picker = document.getElementById(id);
        const hex = document.getElementById(id + "-hex");
        picker.addEventListener("input", () => {
          if (hex) hex.textContent = picker.value;
          validateAndUpdateQR();
        });
      });

      document.getElementById("color-type").addEventListener("change", (e) => {
        document.getElementById("gradient-secondary-group").style.display = 
          e.target.value === "single" ? "none" : "block";
        validateAndUpdateQR();
      });

      document.getElementById("bg-transparent").addEventListener("change", (e) => {
        document.getElementById("bg-color-wrapper").style.display = 
          e.target.checked ? "none" : "block";
        validateAndUpdateQR();
      });

      document.getElementById("logo-size").addEventListener("input", (e) => {
        document.getElementById("logo-size-val").textContent = e.target.value;
      });
      document.getElementById("logo-margin").addEventListener("input", (e) => {
        document.getElementById("logo-margin-val").textContent = e.target.value;
      });

      // Logo Image File
      const fileInput = document.getElementById("logo-file");
      const removeLogoBtn = document.getElementById("btn-remove-logo");

      fileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            logoDataUrl = event.target.result;
            removeLogoBtn.style.display = "inline-block";
            validateAndUpdateQR();
          };
          reader.readAsDataURL(file);
        }
      });

      removeLogoBtn.addEventListener("click", () => {
        logoDataUrl = "";
        fileInput.value = "";
        removeLogoBtn.style.display = "none";
        validateAndUpdateQR();
      });
    }

    /* ================= EXPORT ================= */
    async function exportQR(extension) {
      const vcardData = buildVCardString();
      const errorBox = document.getElementById("vcard-error");

      if (!vcardData) {
        errorBox.style.display = "flex";
        return;
      }

      const resolutionSelect = document.getElementById("export-res");
      const size = isSimpleMode ? 1200 : parseInt(resolutionSelect.value, 10);
      const downloadOptions = getOptions(size, size, vcardData);

      const exportInstance = new QRCodeStyling({
        ...downloadOptions,
        type: extension === "svg" ? "svg" : "canvas"
      });

      await exportInstance.download({
        name: "vcard-contact",
        extension: extension
      });
    }

    // Initialize
    setupFormListeners();
    validateAndUpdateQR();
