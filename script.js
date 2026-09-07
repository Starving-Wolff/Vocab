const speakButton = document.getElementById("speakButton");

speakButton.onclick = function () {

    const speech = new SpeechSynthesisUtterance();

    speech.text = "Hello, welcome to Vocabify";

    speech.lang = "en-US";
    speech.rate = 0.8;
    speech.volume = 1;
    speech.pitch = 1;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(speech);
};