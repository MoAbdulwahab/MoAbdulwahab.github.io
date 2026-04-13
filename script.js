// ── Mobile nav toggle ────────────────────────────────
const toggle = document.getElementById("nav-toggle");
const links = document.getElementById("nav-links");

toggle.addEventListener("click", () => links.classList.toggle("open"));

// Mobile dropdown toggle
document.querySelectorAll(".nav-dropdown > a").forEach((dropLink) => {
  dropLink.addEventListener("click", (e) => {
    if (window.innerWidth <= 768) {
      e.preventDefault();
      dropLink.closest(".nav-dropdown").classList.toggle("open");
    }
  });
});

links.querySelectorAll("a:not(.nav-dropdown > a)").forEach((link) => {
  link.addEventListener("click", () => links.classList.remove("open"));
});

// ── Scroll: nav background ──────────────────────────
const nav = document.getElementById("nav");
window.addEventListener("scroll", () => {
  nav.classList.toggle("scrolled", window.scrollY > 50);
});

// ── Multi-step Lead Form (Branching) ────────────────
const form = document.getElementById("lead-form");
const progressBar = document.getElementById("progress-bar");
let currentStep = "1";
let currentPath = null; // "invest" or "explore"

function showStep(step) {
  // Remove active from all steps
  document.querySelectorAll(".form-step").forEach((s) => s.classList.remove("active"));
  const target = document.querySelector(`.form-step[data-step="${step}"]`);
  if (target) target.classList.add("active");
  currentStep = step;

  // Disable required on ALL hidden step inputs, enable on active step
  document.querySelectorAll(".form-step:not(.active) input[required]").forEach((input) => {
    input.removeAttribute("required");
    input.dataset.wasRequired = "true";
  });
  document.querySelectorAll(".form-step.active input[data-was-required]").forEach((input) => {
    input.setAttribute("required", "");
  });

  // Update progress bar based on path
  let progress = 33;
  if (step === "1") progress = 33;
  else if (step === "2a") progress = 50;
  else if (step === "2b") progress = 66;
  else if (step === "3") progress = 75;
  else if (step === "4") progress = 100;
  progressBar.style.width = progress + "%";
}

// Mark all required inputs so we can restore them later
document.querySelectorAll(".form-step input[required]").forEach((input) => {
  input.dataset.wasRequired = "true";
});

// Step 1: Intent selection (with branching)
document.querySelectorAll('.form-step[data-step="1"] .form-option').forEach((btn) => {
  btn.addEventListener("click", () => {
    // Visual selection
    document.querySelectorAll('.form-step[data-step="1"] .form-option').forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");

    // Set hidden field
    document.getElementById("intent").value = btn.dataset.value;

    // Branch based on path
    currentPath = btn.dataset.path;
    if (currentPath === "invest") {
      setTimeout(() => showStep("2a"), 300);
    } else {
      setTimeout(() => showStep("2b"), 300);
    }
  });
});

// Step 2A: Budget selection (invest path)
document.querySelectorAll('.form-step[data-step="2a"] .form-option').forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll('.form-step[data-step="2a"] .form-option').forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");
    document.getElementById("budget").value = btn.dataset.value;
    setTimeout(() => showStep("3"), 300);
  });
});

// Back buttons (dynamic using data-back attribute)
document.querySelectorAll(".form-back").forEach((btn) => {
  btn.addEventListener("click", () => {
    const backTo = btn.dataset.back;
    showStep(backTo);
  });
});

// Form submission — Web3Forms (free, no backend needed)
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  const data = {
    access_key: "YOUR_WEB3FORMS_KEY",
    subject: "New Lead — Mohamed Abdulwahab Website",
    from_name: "MA Website",
    intent:  formData.get("intent")  || "",
    budget:  formData.get("budget")  || "",
    name:    formData.get("name")    || "",
    email:   formData.get("email")   || "",
    phone:   formData.get("phone")   || "",
  };

  fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  .then(() => showStep("4"))
  .catch(() => showStep("4"));
});

// ── Scroll: fade-in animations ──────────────────────
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -40px 0px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll(
  ".developer-card, .process-step, .service-card, .diff-item, .testimonial-card, .form-card, .about-content"
).forEach((el) => {
  el.classList.add("fade-in");
  observer.observe(el);
});

// CSS for animations
const style = document.createElement("style");
style.textContent = `
  .fade-in {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.5s ease, transform 0.5s ease;
  }
  .fade-in.visible {
    opacity: 1;
    transform: translateY(0);
  }
  .process-step.fade-in { transition-delay: calc(var(--i, 0) * 0.1s); }
  .service-card.fade-in { transition-delay: calc(var(--i, 0) * 0.06s); }
  .developer-card.fade-in { transition-delay: calc(var(--i, 0) * 0.08s); }
`;
document.head.appendChild(style);

// Stagger delays
document.querySelectorAll(".process-step").forEach((el, i) => el.style.setProperty("--i", i));
document.querySelectorAll(".service-card").forEach((el, i) => el.style.setProperty("--i", i));
document.querySelectorAll(".developer-card").forEach((el, i) => el.style.setProperty("--i", i));
