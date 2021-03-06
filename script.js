$('.navTrigger').click(function () {
    $(this).toggleClass('active');
    $("#mainListDiv").toggleClass("show_list");
    $("#mainListDiv").fadeIn();
});

$(window).scroll(function () {
    if ($(document).scrollTop() > 50) {
        $('.nav').addClass('affix');
    } else {
        $('.nav').removeClass('affix');
    }
});

$(function() {
  $('.chart').easyPieChart({
    scaleColor: "#ecf0f1",
    lineWidth: 20,
    lineCap: 'butt',
    barColor: function( localPercent ) {
      localPercent /= 100;
      return "rgb(" + Math.round(250 * (1- localPercent )) + ", "+ Math.round(200 * localPercent ) +"," + Math.round(250  *localPercent )+ " )";
    },
    trackColor:	"#ecf0f1",
    size: 200,
    animate: 1500
  });
});

$(".rootme").click(function() {
  window.location = $(".rootme").data("location");
  return false;
});

$(".twitter").click(function() {
  window.location = $(".twitter").data("location");
  return false;
});

$(".linkedin").click(function() {
  window.location = $(".linkedin").data("location");
  return false;
});

$(".github").click(function() {
  window.location = $(".github").data("location");
  return false;
});

$(".oteq").click(function() {
  window.location.href = 'projects/OT-EQ/index.html';
  return false;
});

$(".stegosaurus").click(function() {
  window.location.href= "projects/Stegosaurus/index.html";
  return false;
});

$(".monopong").click(function() {
  window.location.href = 'projects/Neuroevolution1/index.html';
  return false;
});

$(".dataviz").click(function() {
  window.location.href = 'projects/dataviz/index.html';
  return false;
});






window.addEventListener('load', function() {
ctx.font = '6cm ZapfinoForteLTPro'; ctx.lineWidth = 1; ctx.fillStyle = '#000'; ctx.strokeStyle='white';

  setTimeout(()=>{writingAnimation();setInterval(writingAnimation, 7000);}, 1000);
});

var ctx = document.querySelector('canvas').getContext('2d');
var brushWidth = 600;
var brushOffset = brushWidth;
var speed = 4;
var txt = "Robin";
var x = -10, i = 0;
  

async function writingAnimation(){
    ctx.clearRect(0,0,1200,400);
 
    (function draw() { ctx.setLineDash([brushWidth - brushOffset, brushOffset - speed]); brushOffset -= speed; ctx.strokeText(txt[i], x, 240);
                      
    if (brushOffset > 0) requestAnimationFrame(draw); else {
    brushOffset = brushWidth;
    x += ctx.measureText(txt[i++]).width + ctx.lineWidth * Math.random();
    if (i < txt.length) requestAnimationFrame(draw); }
                        
    })() ;
}


class TextScramble {
    constructor(el) {
      this.el = el;
      this.chars = '!<>-_\\/[]{}—=+*^?#________';
      this.update = this.update.bind(this);
    }
    setText(newText) {
      const oldText = this.el.innerText;
      const length = Math.max(oldText.length, newText.length);
      const promise = new Promise(resolve => this.resolve = resolve);
      this.queue = [];
      for (let i = 0; i < length; i++) {
        const from = oldText[i] || '';
        const to = newText[i] || '';
        const start = Math.floor(Math.random() * 40);
        const end = start + Math.floor(Math.random() * 40);
        this.queue.push({ from, to, start, end });
      }
      cancelAnimationFrame(this.frameRequest);
      this.frame = 0;
      this.update();
      return promise;
    }
    update() {
      let output = '';
      let complete = 0;
      for (let i = 0, n = this.queue.length; i < n; i++) {
        let { from, to, start, end, char } = this.queue[i];
        if (this.frame >= end) {
          complete++;
          output += to;
        } else if (this.frame >= start) {
          if (!char || Math.random() < 0.28) {
            char = this.randomChar();
            this.queue[i].char = char;
          }
          output += `<span class="dud">${char}</span>`;
        } else {
          output += from;
        }
      }
      this.el.innerHTML = output;
      if (complete === this.queue.length) {
        this.resolve();
      } else {
        this.frameRequest = requestAnimationFrame(this.update);
        this.frame++;
      }
    }
    randomChar() {
      return this.chars[Math.floor(Math.random() * this.chars.length)];
    }}
  
  
  // ——————————————————————————————————————————————————
  // Example
  // ——————————————————————————————————————————————————
  
const projectWords = [
  "< Mes projets />",
];
const aboutWords = [
    "< à propos />",
];
const contactWords = [
  "< Mes réseaux />",
];
  
  const el = document.querySelector('.titreProject');
  const el2 = document.querySelector('.titreAbout');
  const el3 = document.querySelector('.titreContact');

  const fx = new TextScramble(el);
  const fx2 = new TextScramble(el2);
  const fx3 = new TextScramble(el3);
  
  let counter = 0;
  const next = () => {
    fx.setText(projectWords[counter]).then(() => {
      setTimeout(next, 2400);
    });
    fx2.setText(aboutWords[counter]).then(() => {
        setTimeout(next, 2400);
    });
    fx3.setText(contactWords[counter]).then(() => {
        setTimeout(next, 2400);
    });
    counter = (counter + 1) % projectWords.length;
  };
  
  next();
