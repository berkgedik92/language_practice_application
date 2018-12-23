function WordsDataManager(f) {

    //TODO: Check if variables defined by "let" are static...
    let callback = f;
    let storage;

    //Map<WordID (String) -> Word Object>
    let words;

    //Map<CategoryID (String) -> List Of WordIDs (Array of String)
    let categoryToWords;

    //List of WordIDs (Array of String)
    let currentWordIDs = [];

    //Map <Pronoun Group ID (Integer) -> List of Pronouns (List of String)
    let pronouns;
    //List of all pronoun group IDs
    let pronounGroupIDs;

    /*
        Structure of nouns, adjectives and verbs in 
        the current language in the following format

        [{name: "..."}, {name: "..."}, ...]
    */
    let nouns;
    let adjectives;
    let verbs;

    //Array of letters
    let alphabet;

    let categories;

    this.setCurrentWordIDs = function(wordIDs) {
        currentWordIDs = wordIDs;
    }

    this.getWordsOfCategory = function(categoryID) {
        return categoryToWords[categoryID].deepCopy();
    }

    this.getCategories = function() {
        return categories.deepCopy();
    }

    this.getWord = function(index) {
        return words[currentWordIDs[index]];
    }

    this.getWords = function() {
        let res = [];
        for (let wordID of currentWordIDs)
            res.push(words[wordID]);
        return res.deepCopy();
    }

    this.getAlphabet = function() {
        return alphabet.deepCopy();
    }

    this.getNumberOfNounTypes = function () {
        return nouns.length;
    }

    this.getNumberOfAdjectiveTypes = function () {
        return adjectives.length;
    }

    this.getNumberOfVerbTypes = function () {
        return verbs.length;
    }

    this.getNounTypes = function() {
        return nouns.deepCopy();
    }

    this.getVerbTypes = function() {
        return verbs.deepCopy();
    }

    this.getAdjectiveTypes = function() {
        return adjectives.deepCopy();
    }

    this.getRandomPronoun = function(groupID) {
        let randomIndex = Math.floor(Math.random() * pronouns[groupID].length);
        return pronouns[groupID][randomIndex];
    }

    this.getPronouns = function() {
        let res = [];
        for (let groupID of pronounGroupIDs)
            res.push(pronouns[groupID][0]);
        return res;
    }

    this.getNumberOfPronounGroups = function() {
        return pronounGroupIDs.length;
    }

    let LoadWords = function() {
        storage.get("userdata", function(obj) {
            
            database = JSON.parse(obj);
    
            words = database.words;
    
            nouns = database.language.nouns;
            adjectives = database.language.adjectives;
            verbs = database.language.tenses;
            alphabet = [];
            for (let i = 0; i < database.language.alphabet.length; i++)
                alphabet.push(database.language.alphabet[i]);

            //Pronouns
            pronouns = {};
            for (let i = 0; i < database.language.pronouns.length; i++) {
                let group = database.language.pronouns[i].group;
                let name = database.language.pronouns[i].name;
                if (pronouns[group] == undefined)
                    pronouns[group] = [];
                pronouns[group].push(name);
            }
    
            pronounGroupIDs = Object.keys(pronouns);

            categories = database.categories;
            let categoryKeys = Object.keys(categories);
    
            /*Create categoryID -> wordList*/
            categoryToWords = {};
            for (let i = 0; i < categoryKeys.length; i++)
                categoryToWords[categoryKeys[i]] = [];
            categoryToWords["ALL"] = [];
    
            let wordKeys = Object.keys(words);
            for (let i = 0; i < wordKeys.length; i++){
                let id = wordKeys[i];
                let categoryOfWord = words[id].categories;
                if (!words[id].otherData) 
                    continue;
                for (let j = 0; j < categoryOfWord.length; j++)
                    categoryToWords[categoryOfWord[j]].push(id);
                categoryToWords["ALL"].push(id);
            }
            callback();
        }, function(err) {
            window.location.href = "updater.html";
        });
    }    

    setTimeout(function() {
        storage = new Storage();

        storage.get("serverURL", function(obj) {
            SetFileLoaderURL(obj);
            FileSystemInit(LoadWords);
        }, function() {
            alert("Error when getting 'serverURL' from storage (wordsDataManager.js)!");
        });
    }, 0);
}








