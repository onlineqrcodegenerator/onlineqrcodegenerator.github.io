
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

    /* ================= HERO QR (ENCODED WITH YOUR GITHUB PAGES URL) ================= */
    const heroQR = new QRCodeStyling({
      width: 190,
      height: 190,
      type: "canvas",
      data: "https://onlineqrcodegenerator.github.io",
      dotsOptions: { color: "#0284c7", type: "rounded" },
      backgroundOptions: { color: "#ffffff" },
      cornersSquareOptions: { type: "extra-rounded", color: "#0284c7" },
      cornersDotOptions: { type: "dot", color: "#0284c7" },
      qrOptions: { errorCorrectionLevel: "M" }
    });

    heroQR.append(document.getElementById("hero-qr"));