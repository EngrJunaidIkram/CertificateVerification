/* ============================================
   ISO GLOBAL STANDARDS - Main JavaScript
   ============================================ */

// ---- Sticky Header ----
(function() {
  const header = document.getElementById('siteHeader');
  if (!header) return;

  let lastScroll = 0;
  window.addEventListener('scroll', function() {
    const currentScroll = window.pageYOffset;
    if (currentScroll > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    lastScroll = currentScroll;
  }, { passive: true });
})();

// ---- Mobile Menu ----
(function() {
  const toggle = document.getElementById('mobileMenuToggle');
  const mobileNav = document.getElementById('mobileNav');
  if (!toggle || !mobileNav) return;

  toggle.addEventListener('click', function() {
    toggle.classList.toggle('active');
    mobileNav.classList.toggle('open');
  });

  // Close on link click
  mobileNav.querySelectorAll('.mobile-nav-link').forEach(function(link) {
    link.addEventListener('click', function() {
      toggle.classList.remove('active');
      mobileNav.classList.remove('open');
    });
  });

  // Close on outside click
  document.addEventListener('click', function(e) {
    if (!toggle.contains(e.target) && !mobileNav.contains(e.target)) {
      toggle.classList.remove('active');
      mobileNav.classList.remove('open');
    }
  });
})();

// ---- Certificate Verification ----
async function verifyCode() {
  const code = document.getElementById("code").value.trim();
  const status = document.getElementById("status");
  const modal = document.getElementById("certificateModal");
  const img = document.getElementById("certImage");
  const verifyBtn = document.getElementById("verifyBtn");

  if (!verifyBtn) return;

  const btnText = verifyBtn.querySelector(".btn-text");
  const btnLoader = verifyBtn.querySelector(".btn-loader");

  // Hide modal and clear status
  if (modal) modal.classList.remove("show");
  if (status) {
    status.className = "verify-status";
    status.textContent = "";
  }

  // Validate input
  if (!code) {
    if (status) {
      status.textContent = "Please enter company verification code";
      status.classList.add("error");
    }
    shakeInput();
    return;
  }

  // Show loading state
  if (status) {
    status.textContent = "Verifying access credentials...";
    status.classList.add("loading");
  }
  verifyBtn.disabled = true;
  if (btnText) btnText.classList.add("hidden");
  if (btnLoader) btnLoader.classList.remove("hidden");

  try {
    const res = await fetch("/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code })
    });

    const data = await res.json();

    // Reset button state
    verifyBtn.disabled = false;
    if (btnText) btnText.classList.remove("hidden");
    if (btnLoader) btnLoader.classList.add("hidden");

    if (!res.ok) {
      if (status) {
        status.textContent = data.message;
        status.className = "verify-status error";
      }
      shakeInput();
      return;
    }

    // Success state
    if (status) {
      status.textContent = "Access granted! Opening certificate...";
      status.className = "verify-status success";
    }

    // Load and display certificate in modal
    if (img) img.src = data.fileUrl;

    // Show modal with animation delay
    setTimeout(function() {
      openModal();
    }, 500);

  } catch (error) {
    // Network error
    verifyBtn.disabled = false;
    if (btnText) btnText.classList.remove("hidden");
    if (btnLoader) btnLoader.classList.add("hidden");

    if (status) {
      status.textContent = "Connection error. Please try again.";
      status.className = "verify-status error";
    }
    shakeInput();
  }
}

// ---- Modal Controls ----
function openModal() {
  const modal = document.getElementById("certificateModal");
  if (!modal) return;
  modal.classList.remove("hidden");
  setTimeout(function() {
    modal.classList.add("show");
  }, 10);
  document.body.style.overflow = "hidden";
}

function closeModal() {
  const modal = document.getElementById("certificateModal");
  if (!modal) return;
  modal.classList.remove("show");
  setTimeout(function() {
    modal.classList.add("hidden");
  }, 300);
  document.body.style.overflow = "";
}

// ---- Shake Animation ----
function shakeInput() {
  const input = document.getElementById("code");
  if (!input) return;
  input.style.animation = "none";
  setTimeout(function() {
    input.style.animation = "shake 0.5s";
  }, 10);
  setTimeout(function() {
    input.style.animation = "";
  }, 500);
}

// ---- Certificate Protection ----
document.addEventListener('DOMContentLoaded', function() {
  // Disable right-click on images
  document.addEventListener('contextmenu', function(e) {
    if (e.target.tagName === 'IMG' && e.target.closest('.cert-image-wrapper')) {
      e.preventDefault();
      showProtectionMessage();
      return false;
    }
  });

  // Keyboard shortcuts: ESC to close modal, block devtools on cert page
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      var modal = document.getElementById("certificateModal");
      if (modal && modal.classList.contains("show")) {
        closeModal();
      }
      return;
    }

    // Only block devtools on verify page (if modal exists)
    if (!document.getElementById("certificateModal")) return;

    if (e.keyCode === 123 ||
        (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) ||
        (e.ctrlKey && e.keyCode === 85)) {
      e.preventDefault();
      return false;
    }

    if (e.ctrlKey && e.keyCode === 83) {
      e.preventDefault();
      showProtectionMessage();
      return false;
    }
  });

  // Disable drag on cert images
  document.addEventListener('dragstart', function(e) {
    if (e.target.tagName === 'IMG' && e.target.closest('.cert-image-wrapper')) {
      e.preventDefault();
      return false;
    }
  });
});

// ---- Toast Notification ----
function showProtectionMessage() {
  var existing = document.querySelector('.protection-toast');
  if (existing) return;

  var toast = document.createElement("div");
  toast.className = "toast protection-toast";
  toast.innerHTML = '<i class="fas fa-shield-halved"></i> This certificate is protected and cannot be saved';
  document.body.appendChild(toast);

  setTimeout(function() {
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";
  }, 10);

  setTimeout(function() {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(20px)";
    setTimeout(function() {
      toast.remove();
    }, 300);
  }, 2500);
}

// ---- Auto-focus on verify page ----
window.addEventListener("load", function() {
  var codeInput = document.getElementById("code");
  if (codeInput) codeInput.focus();
});
