/* PORTAFOLIO · Luisa Fernanda Pérez Selada */

// 1) Foto del inicio: si existe assets/foto.png se muestra sola.
//    (Cambia el nombre en el atributo data-src de <img id="me"> en index.html)
var me = document.getElementById("me");
var ph = document.getElementById("ph");
if (me && ph) {
  var test = new Image();
  test.onload = function () {
    me.src = test.src;
    me.hidden = false;
    ph.style.display = "none";
  };
  test.src = me.getAttribute("data-src");
}

// 2) Aparición suave al hacer scroll (elementos con la clase "in")
var els = document.querySelectorAll(".in");
if ("IntersectionObserver" in window) {
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add("on");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  els.forEach(function (el) { io.observe(el); });
} else {
  els.forEach(function (el) { el.classList.add("on"); });
}

// 3) Imágenes de proyectos: si un elemento tiene data-img="ruta", se muestra esa imagen.
//    Ej.: <div class="pimg" data-img="../assets/proyectos/stand-1.jpg">
document.querySelectorAll("[data-img]").forEach(function (el) {
  var url = el.getAttribute("data-img");
  if (!url) return;
  var im = new Image();
  im.onload = function () {
    el.style.backgroundImage = 'url("' + url + '")';
    el.classList.add("has-img");
  };
  im.src = url;
});

// 4) Ventana emergente de proyecto (abrir, minimizar, ajustar tamaño y cerrar)
var modal = document.getElementById("modal");
if (modal) {
  var win = modal.querySelector(".mwin");
  var mBody = document.getElementById("mBody");
  var dock = document.getElementById("dock");
  var fitBtn = modal.querySelector('[data-act="fit"]');
  var lastBtn = null;

  var lock = function (on) { document.documentElement.style.overflow = on ? "hidden" : ""; };

  var fill = function (card) {
    var title = card.querySelector("h3").textContent;
    var src = card.querySelector(".pimg");
    var tpl = card.querySelector("template");
    mBody.textContent = "";

    var img = document.createElement("div");
    img.className = "mimg" + (src.classList.contains("has-img") ? " has-img" : "");
    img.style.backgroundImage = src.style.backgroundImage;
    var ic = src.querySelector("svg");
    if (ic) img.appendChild(ic.cloneNode(true));

    var info = document.createElement("div");
    info.className = "minfo";
    var h = document.createElement("h2");
    h.id = "mTitle";
    h.textContent = title;
    info.appendChild(h);
    if (tpl) info.appendChild(tpl.content.cloneNode(true));

    mBody.appendChild(img);
    mBody.appendChild(info);
    document.getElementById("dockTitle").textContent = title;
  };

  var openModal = function (card, btn) {
    lastBtn = btn;
    fill(card);
    modal.hidden = false;
    void modal.offsetWidth;
    modal.classList.remove("mini");
    modal.classList.add("open");
    dock.classList.remove("show");
    lock(true);
    win.focus();
  };

  var closeModal = function () {
    modal.classList.remove("open", "mini");
    dock.classList.remove("show");
    lock(false);
    setTimeout(function () { if (!modal.classList.contains("open")) modal.hidden = true; }, 350);
    if (lastBtn) lastBtn.focus();
  };

  var minimize = function () {
    modal.classList.add("mini");
    dock.classList.add("show");
    lock(false);
  };

  var restore = function () {
    modal.classList.remove("mini");
    dock.classList.remove("show");
    lock(true);
    win.focus();
  };

  var fit = function () {
    var big = win.classList.toggle("max");
    fitBtn.setAttribute("aria-pressed", big ? "true" : "false");
    fitBtn.setAttribute("aria-label", big ? "Volver al tamaño normal" : "Ajustar tamaño");
  };

  document.addEventListener("click", function (e) {
    var open = e.target.closest("[data-open]");
    if (open) { openModal(open.closest(".pcard"), open); return; }
    if (e.target.closest("[data-close]")) { closeModal(); return; }
    var act = e.target.closest("[data-act]");
    if (!act) return;
    var a = act.getAttribute("data-act");
    if (a === "close") closeModal();
    else if (a === "min") minimize();
    else if (a === "fit") fit();
    else if (a === "restore") restore();
  });

  document.addEventListener("keydown", function (e) {
    if (modal.hidden || modal.classList.contains("mini")) return;
    if (e.key === "Escape") { closeModal(); return; }
    if (e.key === "Tab") {
      var f = win.querySelectorAll("button, [tabindex='0']");
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === win)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
}

// 5) Carrusel de proyectos (pantallas pequeñas): flechas laterales y arrastre con el mouse
document.querySelectorAll(".carousel").forEach(function (car) {
  var track = car.querySelector(".cascade");
  var prev = car.querySelector('[data-car="-1"]');
  var next = car.querySelector('[data-car="1"]');
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function update() {
    var max = track.scrollWidth - track.clientWidth;
    prev.disabled = track.scrollLeft <= 4;
    next.disabled = track.scrollLeft >= max - 4;
  }
  function step() {
    var c = track.querySelector(".pcard");
    return (c ? c.offsetWidth : 240) + 16;
  }
  [prev, next].forEach(function (b) {
    b.addEventListener("click", function () {
      track.scrollBy({ left: step() * Number(b.getAttribute("data-car")), behavior: reduce ? "auto" : "smooth" });
    });
  });
  track.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();

  var down = false, moved = false, startX = 0, startLeft = 0;
  track.addEventListener("pointerdown", function (e) {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    down = true; moved = false; startX = e.clientX; startLeft = track.scrollLeft;
  });
  window.addEventListener("pointermove", function (e) {
    if (!down) return;
    var dx = e.clientX - startX;
    if (Math.abs(dx) > 5 && !moved) { moved = true; track.style.scrollSnapType = "none"; track.classList.add("drag"); }
    if (moved) track.scrollLeft = startLeft - dx;
  });
  window.addEventListener("pointerup", function () {
    if (!down) return;
    down = false;
    if (moved) { track.classList.remove("drag"); track.style.scrollSnapType = ""; }
  });
  track.addEventListener("click", function (e) {
    if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
  }, true);
});
