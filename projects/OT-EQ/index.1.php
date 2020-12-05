<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Orateur Typographié</title>
  <link type="text/css" rel='stylesheet' href="style.css">
</head>
<body>
<!-- 
  <div class="words" id="boitetexte" contenteditable>
    <input type="button" value="test" onclick="michel()">
    <div class="fin" id="fin"></div>
  </div>
  
-->
<div>
  
       <div id='warped'>
          <div class="words" id="navbar">
            </div>


       <div id="fin"></div>

<div id='bottom'></div>
</div>
</div>
<script>  
 window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.interimResults = true;
  recognition.lang = '';


 
  

  var img = document.createElement("img");
 
  img.src = "rond-rouge.png";
  var src = document.getElementById("navbar");
 img.width="20";

  

  let p = document.createElement('p');
  
  const words = document.querySelector('.words');
  words.appendChild(p);
  recognition.addEventListener('result', e => {
    const transcript = Array.from(e.results)
      .map(result => result[0])
      .map(result => result.transcript)
      .join('')
      
      
      const poopScript = transcript.replace(/point d'exclamation/, '!');
      p.textContent = poopScript;
      if (e.results[0].isFinal) {
        console.log(p.textContent);
        creerspan(p.textContent);
      }
  });
  recognition.addEventListener('end', recognition.start);
  recognition.start();
  
  
  </script>
<script type="text/javascript" src="code.js">

</script>


</body>
</html>