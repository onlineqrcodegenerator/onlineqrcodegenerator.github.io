
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
      if (window.innerWidth > 768) closeMenu();
    });

    /* ================= PASSWORD VISIBILITY ================= */
    function togglePasswordVisibility() {
      const passInput = document.getElementById("wifi-pass");
      const toggleBtn = document.getElementById("pass-toggle");
      if (passInput.type === "password") {
        passInput.type = "text";
        toggleBtn.textContent = "🙈";
      } else {
        passInput.type = "password";
        toggleBtn.textContent = "👁️";
      }
    }

    /* ================= WI-FI PROTOCOL & QR LOGIC ================= */
    let logoDataUrl = "";
    let isSimpleMode = false;

    // Helper to escape special characters for WIFI QR specs: \, ;, ,, :
    function escapeWifiString(str) {
      return str.replace(/\\/g, "\\\\")
                .replace(/;/g, "\\;")
                .replace(/,/g, "\\,")
                .replace(/:/g, "\\:");
    }

    // Format: WIFI:T:WPA;S:MyNetwork;P:MyPassword;H:false;;
    function buildWifiString() {
      const ssid = document.getElementById("wifi-ssid").value.trim();
      const type = document.getElementById("wifi-type").value;
      const pass = document.getElementById("wifi-pass").value;
      const isHidden = document.getElementById("wifi-hidden").checked;

      if (!ssid) return null;
      if (type !== "nopass" && pass.length < 8 && type === "WPA") {
        return { error: "WPA passwords must be at least 8 characters long." };
      }

      let wifiString = `WIFI:T:${type};S:${escapeWifiString(ssid)};`;
      if (type !== "nopass") {
        wifiString += `P:${escapeWifiString(pass)};`;
      }
      if (isHidden) {
        wifiString += `H:true;`;
      }
      wifiString += ";";
      return { data: wifiString };
    }

    // Initialize QR instance
    const qrCode = new QRCodeStyling({
      width: 250,
      height: 250,
      type: "canvas",
      data: "WIFI:T:WPA;S:Home-Network;P:supersecret123;;",
      image: "",
      dotsOptions: { color: "#0284c7", type: "rounded" },
      backgroundOptions: { color: "#ffffff" },
      imageOptions: { crossOrigin: "anonymous", margin: 4, imageSize: 0.25 },
      cornersSquareOptions: { type: "extra-rounded", color: "#0284c7" },
      cornersDotOptions: { type: "dot", color: "#0284c7" },
      qrOptions: { errorCorrectionLevel: "H" }
    });

    qrCode.append(document.getElementById("qr-preview"));

    function validateAndUpdateQR() {
      const result = buildWifiString();
      const errorBox = document.getElementById("wifi-error");
      const errorText = document.getElementById("wifi-error-text");
      const ssidInput = document.getElementById("wifi-ssid");
      const passInput = document.getElementById("wifi-pass");

      if (!result) {
        errorText.textContent = "Please provide a Network SSID name.";
        errorBox.style.display = "flex";
        ssidInput.classList.add("input-invalid");
        return;
      }

      if (result.error) {
        errorText.textContent = result.error;
        errorBox.style.display = "flex";
        passInput.classList.add("input-invalid");
        return;
      }

      errorBox.style.display = "none";
      ssidInput.classList.remove("input-invalid");
      passInput.classList.remove("input-invalid");

      qrCode.update(getOptions(250, 250, result.data));
    }

    /* ================= OPTION COMPILATION ================= */
    function getOptions(renderWidth = 250, renderHeight = 250, dataOverride = null) {
      const wifiResult = buildWifiString();
      const data = dataOverride || (wifiResult && wifiResult.data) || "WIFI:T:WPA;S:Home-Network;P:supersecret123;;";

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

    /* ================= SETUP FORM LISTENERS ================= */
    function setupFormListeners() {
      // WiFi Inputs
      document.getElementById("wifi-ssid").addEventListener("input", validateAndUpdateQR);
      document.getElementById("wifi-pass").addEventListener("input", validateAndUpdateQR);
      document.getElementById("wifi-hidden").addEventListener("change", validateAndUpdateQR);

      // Encryption selection toggle
      document.getElementById("wifi-type").addEventListener("change", (e) => {
        const passGroup = document.getElementById("wifi-pass-group");
        if (e.target.value === "nopass") {
          passGroup.style.display = "none";
        } else {
          passGroup.style.display = "block";
        }
        validateAndUpdateQR();
      });

      // Simple Mode Checkbox
      document.getElementById("simple-qr-toggle").addEventListener("change", (e) => {
        isSimpleMode = e.target.checked;
        if (isSimpleMode) {
          document.body.classList.add("is-simple");
        } else {
          document.body.classList.remove("is-simple");
        }
        validateAndUpdateQR();
      });

      // Styling selectors & sliders
      const liveInputs = [
        "dots-style", "corner-square-style", "corner-dot-style", 
        "logo-size", "logo-margin"
      ];
      liveInputs.forEach(id => {
        document.getElementById(id).addEventListener("input", validateAndUpdateQR);
      });

      // Color pickers
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

      // Logo File Upload
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
      const wifiResult = buildWifiString();
      const errorBox = document.getElementById("wifi-error");
      const errorText = document.getElementById("wifi-error-text");

      if (!wifiResult || wifiResult.error) {
        errorText.textContent = wifiResult ? wifiResult.error : "Please enter a valid Network SSID before downloading.";
        errorBox.style.display = "flex";
        return;
      }

      const resolutionSelect = document.getElementById("export-res");
      const size = isSimpleMode ? 1200 : parseInt(resolutionSelect.value, 10);
      const downloadOptions = getOptions(size, size, wifiResult.data);

      const exportInstance = new QRCodeStyling({
        ...downloadOptions,
        type: extension === "svg" ? "svg" : "canvas"
      });

      await exportInstance.download({
        name: "wifi-network",
        extension: extension
      });
    }

    // Initialize
    setupFormListeners();
    validateAndUpdateQR();
