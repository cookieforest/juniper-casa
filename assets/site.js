// Juniper's Corner: signup via Kit (inline, with a plain form-post fallback), gentle reveals, click counts.
(function () {
  document.documentElement.classList.add("js");

  function track(name) {
    if (window.goatcounter && window.goatcounter.count) {
      window.goatcounter.count({ path: name, title: name, event: true });
    }
  }

  // Kit accepts a JSON post from the page; if it ever refuses (CORS, outage), the form posts normally instead.
  document.querySelectorAll("form.signup[data-kit]").forEach(function (form) {
    if (!form.dataset.kit) return;
    var input = form.querySelector("input[type=email]");
    var button = form.querySelector("button");
    var status = form.querySelector(".signup__status");
    var fallback = false;
    form.addEventListener("submit", function (e) {
      if (fallback) return;
      e.preventDefault();
      status.className = "signup__status";
      if (!input.value || !input.checkValidity()) {
        status.textContent = "That email doesn't look quite right. Mind checking it?";
        status.classList.add("is-err");
        input.focus();
        return;
      }
      button.disabled = true;
      status.textContent = "Sending...";
      track("signup-submit");
      fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data && data.status === "success") {
            form.classList.add("is-done");
            status.textContent = "Almost there! Check your inbox and tap Confirm; your free piece follows right after.";
            status.classList.add("is-ok");
            track("signup-ok");
          } else {
            throw new Error("kit");
          }
        })
        .catch(function () {
          fallback = true;
          form.submit();
        });
    });
  });

  // "Get it free" jumps to the top form and puts the cursor in the email field.
  document.querySelectorAll("[data-focus]").forEach(function (a) {
    a.addEventListener("click", function () {
      var target = document.getElementById(a.dataset.focus);
      if (target && !target.disabled) setTimeout(function () { target.focus({ preventScroll: true }); }, 450);
    });
  });

  document.querySelectorAll("[data-track]").forEach(function (a) {
    a.addEventListener("click", function () { track(a.dataset.track); });
  });

  var items = document.querySelectorAll(".section-head, .week__inner, .way, .about__inner, .faq details, .closing__inner");
  if (!("IntersectionObserver" in window)) return;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
    });
  }, { rootMargin: "0px 0px -8% 0px" });
  items.forEach(function (el) {
    el.classList.add("reveal");
    if (el.classList.contains("way")) el.style.transitionDelay = Array.prototype.indexOf.call(el.parentNode.children, el) * 90 + "ms";
    io.observe(el);
  });
})();
