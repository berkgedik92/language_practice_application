
let matchElementRemaining;

let wordChosepageRenderer = function(pageIndex, viewDict) {
    let manager = managerr.getDataManager();
    let word = manager.getWord(pageIndex);

    for (let i = 0; i < 4; i++) {
        let button = viewDict["answer" + i];
        button.addEventListener("touchend", function() {
            let element = this;
            let correct = element.getAttribute("correct").localeCompare("true") == 0;
            if (correct) {
                element.classList.add("correct");
                setTimeout(function() {
                    element.classList.remove("correct");
                    if (!pageSlider.isLastPage())
                        pageSlider.GoNextPageWithAnim();
                    else
                        window.location.href = "../../index.html";
                }, 400);
            }
            else {
                element.classList.add("wrong");
                setTimeout(function() {
                    element.classList.remove("wrong");
                }, 400);
            }
        });
    }

    SetPicture(viewDict.picture, word.pictureURL);
    
    let selectedAnswers = [word];
    let candidateWords = manager.getWords();
    candidateWords = candidateWords.shuffle();

    for (let candidate of candidateWords) {
        if (selectedAnswers.length == 4)
            break;
        if (word.wordID.localeCompare(candidate.wordID) == 0) 
            continue;
        selectedAnswers.push(candidate);
    }

    selectedAnswers = selectedAnswers.shuffle();
    let correctIndex = 0;

    for (let i = 0; i < selectedAnswers.length; i++)
        if (selectedAnswers[i].wordID.localeCompare(word.wordID) == 0) {
            correctIndex = i;
            break;
        }

    for (let i = 0; i < 4; i++) {
        viewDict["answer" + i].style["visibility"] = "hidden";
        viewDict["answer" + i].setAttribute("correct", "false");
    }

    viewDict.name.innerHTML = word.mainMeaning;
    for (let i = 0; i < selectedAnswers.length; i++) {
        viewDict["answer" + i].innerHTML = selectedAnswers[i].currentMeaning;
        viewDict["answer" + i].style["visibility"] = "visible";
    }
    viewDict["answer" + correctIndex].setAttribute("correct", "true");
}

let managerr = new ExerciseManager({
    templatePageID: "wordChoseTemplate",
    isDraggable: false,
    pageRenderer: wordChosepageRenderer
});