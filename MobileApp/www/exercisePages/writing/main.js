
let writeQuestionAnswer = "";
let writeQuestionCurrentLetter = 0;

let writerpageRenderer = function(pageIndex, viewDict) {
    let manager = managerr.getDataManager();
    let word = manager.getWord(pageIndex);
    let alphabet = manager.getAlphabet();

    SetPicture(viewDict.picture, word.pictureURL);

    viewDict.questionTitle.innerHTML = word.mainMeaning;

    for (let i = 0; i < 10; i++) {
        let button = viewDict["button" + i];

        button.addEventListener("touchend", function() {
            let element = this;
            let index = parseInt(element.getAttribute("index"));
            if (writeQuestionAnswer.length <= writeQuestionCurrentLetter) 
                return;
            if (writeQuestionAnswer[writeQuestionCurrentLetter].localeCompare(element.innerHTML) == 0) {
                writeQuestionCurrentLetter++;
                let par = element.parentNode.parentNode.querySelector("div.answerContainer");
                let letter = par.querySelector("[slider-data-attr=letter" + (writeQuestionCurrentLetter - 1) + "]");
                letter.classList.add("correct");
                if (writeQuestionCurrentLetter == writeQuestionAnswer.length) {
                    setTimeout(function() {
                        if (pageSlider.isLastPage())
                            window.location.href = "../../index.html";
                        else
                            pageSlider.GoNextPageWithAnim();
                    }, 400);
                }
                //else if (writeQuestionAnswer[writeQuestionCurrentLetter].localeCompare(" ") == 0)
                //    writeQuestionCurrentLetter++;
            }
            else {
                element.classList.add("wrong");
                setTimeout(function() {
                    element.classList.remove("wrong");
                }, 200);
            }
        });
    }

    let answer;

    let possibilities = [];
    let data = word.otherData.data;
    let keys = Object.keys(data);

    if (word.type.localeCompare("VERB") == 0) {
        for (let i = 0; i < keys.length; i++)
            for (let j = 0; j < data[keys[i]].length; j++)
                if (data[keys[i]][j].length > 0)
                    possibilities.push(i + "_" + j);

        let select = Math.floor(Math.random() * possibilities.length);
        let selected = possibilities[select].split("_");

        let selectedTense = manager.getVerbTypes()[selected[0]].name;
        let selectedPronoun = manager.getRandomPronoun(selected[1]);
        viewDict.questionDetail.innerHTML = selectedTense + "-" + selectedPronoun;
        answer = data[keys[selected[0]]][selected[1]];
    }
    else if (word.type.localeCompare("NOUN") == 0) {
        for (let i = 0; i < keys.length; i++)
            if (data[keys[i]].length > 0)
                possibilities.push(i);

        let select = Math.floor(Math.random() * possibilities.length);
        let selected = possibilities[select];
        let selectedNoun = manager.getNounTypes()[keys[selected]].name;
        viewDict.questionDetail.innerHTML = selectedNoun;
        answer = data[selected];
    }
    else if (word.type.localeCompare("ADJECTIVE") == 0) {
        for (let i = 0; i < keys.length; i++)
            if (data[keys[i]].length > 0)
                possibilities.push(i);

        let select = Math.floor(Math.random() * possibilities.length);
        let selected = possibilities[select];
        let selectedNoun = manager.getAdjectiveTypes()[keys[selected]].name;
        viewDict.questionDetail.innerHTML = selectedNoun;
        answer = data[selected];
    }

    for (let i = 0; i <= 19; i++)
    {
        let currentLetter = viewDict["letter" + i];
        currentLetter.classList.remove("correct");
        currentLetter.classList.remove("show");
        currentLetter.innerHTML = "";

        if (answer.length <= i) {
            currentLetter.style["display"] = "none";
        }
        else {
            currentLetter.style["display"] = "inline-block";
            currentLetter.innerHTML = answer[i];
        }
    }

    let answerLetters = [];
    let otherLetters;
    let selectedLetters = [];

    for (let i = 0; i < answer.length; i++)
        //if (answer[i].localeCompare(" ") != 0 && answerLetters.indexOf(answer[i]) == -1) {
        if (answerLetters.indexOf(answer[i]) == -1) {
            answerLetters.push(answer[i]);
            selectedLetters.push(answer[i]);
        }

    if (selectedLetters.length < 10) {
        otherLetters = alphabet.diff(answerLetters);
        let rem = 10 - selectedLetters.length;
        for (let j = 0; j < rem; j++) {
            let rand = Math.floor(Math.random() * otherLetters.length);
            selectedLetters.push(otherLetters[rand]);
            otherLetters.remove(otherLetters[rand]);
        }
    }

    selectedLetters = selectedLetters.shuffle();

    for (let i = 0; i < 10; i++) {
        viewDict["button" + i].innerHTML = selectedLetters[i];
    }
}

let writershowPageCallback = function(pageIndex, viewDict) {
    writeQuestionCurrentLetter = 0;
    writeQuestionAnswer = "";

    for (let i = 0; i <= 19; i++) {
        let currentLetter = viewDict["letter" + i];
        if (currentLetter.innerHTML.length == 0)
            break;
        writeQuestionAnswer += currentLetter.innerHTML;
    }
}

/*
    TODO: We create 19 letterDOMs for the template and clone it. Instead of doing that, create 
    necessary number of letterDOMs in each page render
*/

let managerr = new ExerciseManager({
    templatePageID: "writeTemplate", 
    pageRenderer: writerpageRenderer, 
    showPageCallback: writershowPageCallback, 
    isDraggable: false
});