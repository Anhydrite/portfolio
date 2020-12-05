/*
  function michel() {
    
  window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.interimResults = true;
  recognition.lang = '';
  
  let p = document.createElement('p');
  var words = 'salut';
  creerspan(words);

  p.appendChild(words);
  document.getElementById('boitetexte').appendChild(p);
  var currentdiv = document.getElementById('fin');



    document.insertBefore(p,currentdiv);
  
  recognition.addEventListener('result', e => {
    const transcript = Array.from(e.results)
      .map(result => result[0])
      .map(result => result.transcript)
      .join('');
      const poopScript = transcript.replace(/poop|poo|shit|dump/gi, '💩');
      p.textContent = poopScript;
      if (e.results[0].isFinal) {
        console.log(p);
        p.textContent.push(' ');
        p = document.createElement('p');
        words.appendChild(p);
      }
  });
  recognition.addEventListener('end', recognition.start);
  recognition.start();
  
  }
*/




var down = 40;
function testd(){
  var texte = document.getElementById("inserer").value;

var temp = "";
if(texte.length < 40 ){
for(var i = 0 ; i<texte.length ; i++){
  document.getElementById('w'+i).innerHTML= texte[i];
}}
else{
  for(var i = 0 ; i < texte.length - 41 ; i++){
  temp += texte[i];
  }
for(var i = 40 ; i>=0; i--){
  document.getElementById('w'+(40-i)).innerHTML= texte[texte.length-i-1];
}
document.getElementById('w').innerHTML = temp;
}
}


function creerspan(texte){

if(texte.length!=0){
  if(texte.match("^comment") || texte.match("est-ce") || texte.match("^quand") || texte.match("^suis-je") || texte.match("^pourquoi") || texte.match("^où") || texte.match("^where") || texte.match("^who") || texte.match("^why") || texte.match("^how") || texte.match("^when") || texte.match("^what")){
    texte+=" ?";
    }else if(texte.match("!$")){}
    else{
      texte+=".";
    }

for(var i = 0 ; i<texte.length; i++){
var newDiv = document.createElement("span");
var newContent = document.createTextNode(texte[i]);
newDiv.appendChild(newContent);
document.getElementById('warped').appendChild(newDiv);
var currentDiv = document.getElementById('fin');
document.getElementById('warped').insertBefore(newDiv,currentDiv);
newDiv.id="w"+i;
newDiv.classList.add('w'+i);
newDiv.style.top= down+194.8+"px";

}
down+=240;



if(texte.indexOf('?')!=-1){
console.log("je bouge haut");
bougehaut(texte);
}else if(texte.indexOf('!')!=-1){
console.log("je suis gros");

       bougegros(texte);
}
else{
console.log("je bouge bas");

     bougebas(texte);
}
}
window.scrollBy(0,1000);
}




function bougehaut(texte){
var left = 27.5;
if(texte.length>=40){

      for(var i = 0 ; i<texte.length-40; i++, left += 40){
      //document.getElementById('w'+i).style.transform = "translateX("+(-(i*(i/12)))+"px)";
      if(document.getElementById('w'+i).innerHTML=='a' ||  document.getElementById('w'+i).innerHTML=='i')
            document.getElementById('w'+i).style.left=left+5+"px";
            else
            document.getElementById('w'+i).style.left=left+"px";
      //document.getElementById('w'+i).innerHTML="";
      document.getElementById('w'+i).classList.add('horizTranslate');

      document.getElementById('w'+i).id="old";
      }
    for(var i = texte.length-40, j = 0; i<=texte.length-1; i++,left+=40, j++){
            document.getElementById('w'+i).style.transform = "translateY("+(-(j*(j/12)))+"px)"+" rotate("+(-j/2.2)+"deg)";
            if(document.getElementById('w'+i).innerHTML=='a' ||  document.getElementById('w'+i).innerHTML=='i')
            document.getElementById('w'+i).style.left=left+5+"px";
            else
            document.getElementById('w'+i).style.left=left+"px";
            document.getElementById('w'+i).classList.add('horizTranslate');

            //document.getElementById('w'+i).innerHTML="";
            document.getElementById('w'+i).id="old";
}
}else{
for(var i = 0 ; i<texte.length; i++, left+=40){
            document.getElementById('w'+i).style.transform = "translateY("+(-(i*(i/12)))+"px)"+" rotate("+(-i/5)+"deg)";
            //document.getElementById('w'+i).innerHTML="";
            document.getElementById('w'+i).classList.add('horizTranslate');
            if(document.getElementById('w'+i).innerHTML=='a' ||  document.getElementById('w'+i).innerHTML=='i')
            document.getElementById('w'+i).style.left=left+5+"px";
            else
            document.getElementById('w'+i).style.left=left+"px";
            document.getElementById('w'+i).id="old";
}
}
}


function bougegros(texte){
  var left = 27.5;

if(texte.length>=40){

  for(var i = 0 ; i<texte.length-40; i++, left += 40){
    //document.getElementById('w'+i).style.transform = "translateX("+(-(i*(i/12)))+"px)";
    document.getElementById('w'+i).style.left=left+"px";
    //document.getElementById('w'+i).innerHTML="";
    document.getElementById('w'+i).id="old";
    }

     for(var i = texte.length - 40,j=0 ; i<=texte.length-1; i++,left+=40, j++){
            document.getElementById('w'+i).style.transform="translate("+j*10+"px ,"+-j+"px)"
            document.getElementById('w'+i).style.fontSize=j*2+"px";
            if(document.getElementById('w'+i).innerHTML=='a' ||  document.getElementById('w'+i).innerHTML=='i')
            document.getElementById('w'+i).style.left=left+5+"px";
            else
            document.getElementById('w'+i).style.left=left+"px";
            document.getElementById('w'+i).id="old";
            document.getElementById('w'+i).style.left=left+"px";
            document.getElementById('w'+i).classList.add('horizTranslate');


}

}else{
for(var i = 0 ; i<texte.length; i++, left+=40){
            document.getElementById('w'+i).classList.add('horizTranslate');
            document.getElementById('w'+i).style.transform="translate("+i*10+"px ,"+-i+"px)"
            document.getElementById('w'+i).style.fontSize=35+i*2+"px";
            if(document.getElementById('w'+i).innerHTML=='a' ||  document.getElementById('w'+i).innerHTML=='i')
            document.getElementById('w'+i).style.left=left+5+"px";
            else
            document.getElementById('w'+i).style.left=left+"px";
            document.getElementById('w'+i).id="old";
}
}
}


function bougebas(texte){
  var left = 27.5;

if(texte.length>=40){

  for(var i = 0 ; i<texte.length-40; i++, left += 40){
    //document.getElementById('w'+i).style.transform = "translateX("+(-(i*(i/12)))+"px)";
    if(document.getElementById('w'+i).innerHTML=='a' ||  document.getElementById('w'+i).innerHTML=='i')
            document.getElementById('w'+i).style.left=left+5+"px";
            else
            document.getElementById('w'+i).style.left=left+"px";
    //document.getElementById('w'+i).innerHTML="";
    document.getElementById('w'+i).id="old";
    }

     for(var i = texte.length-40, j = 0; i<=texte.length-1; i++,left+=40, j++){
            document.getElementById('w'+i).classList.add('horizTranslate');
            document.getElementById('w'+i).style.transform = "translateY("+(+(j*(j/24)))+"px)"+" rotate("+(+j/9)+"deg)";
            if(document.getElementById('w'+i).innerHTML=='a' ||  document.getElementById('w'+i).innerHTML=='i')
            document.getElementById('w'+i).style.left=left+5+"px";
            else
            document.getElementById('w'+i).style.left=left+"px";
            //document.getElementById('w'+i).innerHTML="";
            document.getElementById('w'+i).id="old";

}
}else{
for(var i = 0 ; i<texte.length; i++, left+=40){

            document.getElementById('w'+i).classList.add('horizTranslate');
            document.getElementById('w'+i).style.transform = "translateY("+(+(i*(i/12)))+"px)"+" rotate("+(+i/7)+"deg)";
            if(document.getElementById('w'+i).innerHTML=='a' ||  document.getElementById('w'+i).innerHTML=='i')
            document.getElementById('w'+i).style.left=left+5+"px";
            else
            document.getElementById('w'+i).style.left=left+"px";
            //document.getElementById('w'+i).innerHTML="";
            document.getElementById('w'+i).id="old";
}
}
}

//var scroll = setInterval(function(){ window.scrollBy(0,1000); }, 2000);

// When the user scrolls the page, execute myFunction 
window.onscroll = function() {myFunction()};

// Get the navbar
var navbar = document.getElementById("navbar");

// Get the offset position of the navbar
var sticky = navbar.offsetTop;

// Add the sticky class to the navbar when you reach its scroll position. Remove "sticky" when you leave the scroll position
function myFunction() {
  if (window.pageYOffset >= sticky) {
    navbar.classList.add("sticky")
  } else {
    navbar.classList.remove("sticky");
  }
}