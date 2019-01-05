let dictionarypageRenderer = function(pageIndex, viewsMap) {
    let manager = managerr.getDataManager();
    let word = manager.getWord(pageIndex);
    SetPicture(viewsMap.picture, word.pictureURL);
    viewsMap.name.innerHTML = word.currentMeaning + " (" + word.mainMeaning + ")";

    let otherData = word.otherData;

    if (word.type.localeCompare("NOUN") == 0) {
        viewsMap.verbContainer.style["display"] = "none";
        viewsMap.adjectiveContainer.style["display"] = "none";
        viewsMap.nounContainer.style["display"] = "inline-block";

        for (let i = 0; i < manager.getNumberOfNounTypes(); i++) {
            let visible = otherData && otherData[i].length > 0;
            viewsMap["noun_container" + i].style["display"] = (visible) ? "block" : "none";
            if (visible)
                viewsMap["noun_data" + i].innerHTML = otherData[i];
        }
    }
    else if (word.type.localeCompare("VERB") == 0) {
        viewsMap.nounContainer.style["display"] = "none";
        viewsMap.adjectiveContainer.style["display"] = "none";
        viewsMap.verbContainer.style["display"] = "inline-block";
        for (let i = 0; i < manager.getNumberOfVerbTypes(); i++)
            for (let j = 0; j < manager.getNumberOfPronounGroups(); j++) {
                viewsMap["verb_data_" + i + "_" + j].innerHTML = otherData && otherData[i][j];
            }
    }
    else if (word.type.localeCompare("ADJECTIVE") == 0) {
        viewsMap.verbContainer.style["display"] = "none";
        viewsMap.nounContainer.style["display"] = "none";
        viewsMap.adjectiveContainer.style["display"] = "inline-block";

        for (let i = 0; i < manager.getNumberOfAdjectiveTypes(); i++) {
            let visible = otherData && otherData[i].length > 0;
            viewsMap["adjective_container" + i].style["display"] = (visible) ? "block" : "none";
            if (visible)
                viewsMap["adjective_data" + i].innerHTML = otherData[i];
        }
    }
}

let mainRenderer = function() {
    let manager = managerr.getDataManager();
    //Build dictionary template page
    let nounTemplate = document.getElementById("nounContainerInner");
    let index = 0;
    for (let noun of manager.getNounTypes()) {

        let nounDiv = document.createElement('div');
        nounDiv.classList.add("nounDataContainer");

        let nounTitle = document.createElement('div');
        nounTitle.classList.add("nounTitle");

        let nounData = document.createElement('div');
        nounData.classList.add("nounData");

        nounDiv.setAttribute("slider-data-attr", "noun_container" + index);
        nounData.setAttribute("slider-data-attr", "noun_data" + index);
        nounDiv.appendChild(nounTitle);
        nounDiv.appendChild(nounData);
        nounTitle.innerHTML = noun.name;
        nounTemplate.appendChild(nounDiv);
        index += 1;
    }

    let adjectiveTemplate = document.getElementById("adjectiveContainerInner");
    index = 0;
    for (let adjective of manager.getAdjectiveTypes()) {

        let adjectiveDiv = document.createElement('div');
        adjectiveDiv.classList.add("adjectiveDataContainer");

        let adjectiveTitle = document.createElement('div');
        adjectiveTitle.classList.add("adjectiveTitle");

        let adjectiveData = document.createElement('div');
        adjectiveData.classList.add("adjectiveData");

        adjectiveDiv.setAttribute("slider-data-attr", "adjective_container" + index);
        adjectiveData.setAttribute("slider-data-attr", "adjective_data" + index);
        adjectiveDiv.appendChild(adjectiveTitle);
        adjectiveDiv.appendChild(adjectiveData);
        adjectiveTitle.innerHTML = adjective.name;
        adjectiveTemplate.appendChild(adjectiveDiv);
        index += 1;
    }

    let verbTemplate = document.getElementById("verbContainerInner");
    index = 0;
    for (let i = 0; i < Math.ceil(manager.getNumberOfVerbTypes() / 2); i++) {
        let table = document.createElement("table");
        table.classList.add("verbTable");
        table.setAttribute("cellspacing", "0");
        table.setAttribute("cellpadding", "0");

        let tr1 = document.createElement("tr");
        let td1 = document.createElement("td");
        td1.classList.add("firstColumn");
        td1.classList.add("firstRow");
        td1.style["line-height"] = "8vh";
        tr1.appendChild(td1);

        for (let j = 0; j < Math.min(2, manager.getNumberOfVerbTypes() - 2 * i); j++) {
            let td2 = document.createElement("td");
            td2.classList.add("rowTitle");
            td2.classList.add("firstRow");
            td2.style["line-height"] = "8vh";
            td2.setAttribute("colspan", "1");
            td2.innerHTML = manager.getVerbTypes()[i*2+j].name;
            tr1.appendChild(td2);
        }
        table.appendChild(tr1);

        let j = 0;
        for (let pronoun of manager.getPronouns()) {
            let tr2 = document.createElement("tr");
            let td3 = document.createElement("td");
            td3.classList.add("firstColumn");
            td3.classList.add("columnTitle");
            td3.classList.add("row");
            td3.style["line-height"] = "6vh";

            td3.innerHTML = pronoun;
            tr2.appendChild(td3);

            for (let k = 0; k < Math.min(2, manager.getNumberOfVerbTypes() - 2 * i); k++) {
                let td4 = document.createElement("td");
                td4.classList.add("cell");
                td4.classList.add("row");
                td4.style["line-height"] = "6vh";
                td4.setAttribute("colspan", "1");
                td4.setAttribute("slider-data-attr", "verb_data_" + (i*2+k) + "_" + j);
                tr2.appendChild(td4);
            }
            table.appendChild(tr2);
            j += 1;
        }
        verbTemplate.appendChild(table);
    }
}

let managerr = new ExerciseManager({
    wordsReadyCallback: mainRenderer, 
    templatePageID: "dictionaryTemplate", 
    pageRenderer: dictionarypageRenderer,
    showPageCallback: null,
    isDraggable: true
});