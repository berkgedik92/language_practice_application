package project.languageapp.Language.RestController;

import project.languageapp.Language.Model.*;
import project.languageapp.Language.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import javax.servlet.http.HttpServletRequest;
import java.util.*;
import java.util.logging.Logger;

/*
    This controller will be used by the client (mobile phone application). There is one endpoint ("/api/client/loaddata")
    which will be called by the mobile application when a user wants to update the database on phone (to fetch data for
    this user)
*/

@RestController
@RequestMapping("api/client")
public class ClientController {

    @Autowired private LanguageRepository languageRepository;
    @Autowired private WordRepository wordRepository;
    @Autowired private CategoryRepository categoryRepository;

    private final static Logger LOGGER = Logger.getLogger(Logger.GLOBAL_LOGGER_NAME);

    @ModelAttribute("userdata")
    public User getUserdata(HttpServletRequest request) {
        return (User) request.getAttribute("userdata");
    }

    /*
        Input
        -----

        user: Userdata for the user that sends the request (we need it to know what language the user is practicing and
              which words have been assigned to him)

        Output
        ------

        Map in the following structure:

        {
            "language": (Language object for the language that the user is currently practicing)
            "categories": {
                "category1ID": (Category object for the category with id = category1ID),
                "category2ID": (Category object for the category with id = category2ID),
                ...
            },
            "words": {
                "word1ID": (WordMessage object for the word with id = word1ID),
                "word2ID": (WordMessage object for the word with id = word2ID),
            }
        }
    */

    @RequestMapping(value = "/loaddata", method = RequestMethod.GET)
    public ResponseEntity<?> loadWords(@ModelAttribute("userdata") User user) {

        //Check if this user has a main language and a current language.
        if (user.getCurrentLanguageIDs() == null ||
            user.getMainLanguageIDs() == null ||
            user.getCurrentLanguageIDs().isEmpty() ||
            user.getMainLanguageIDs().isEmpty()) {

            LOGGER.severe("No language is selected for the user " + user.getUsername());
            return new ResponseEntity<>("No language is selected for the user " + user.getUsername(), HttpStatus.BAD_REQUEST);
        }

        String mainLanguageID = user.getMainLanguageIDs().get(0);
        Language mainLanguage = languageRepository.findById(mainLanguageID).orElse(null);
        if (mainLanguage == null) {
            LOGGER.severe("Main language is null for the user " + user.getUsername());
            return new ResponseEntity<>("Main language is null for the user " + user.getUsername(), HttpStatus.BAD_REQUEST);
        }

        //Checks are done, start building the response...
        Map<String, Object> response = new HashMap<>();

        //Get the data about the current language (the language that the user is currently practicing) of the user
        String currentLanguageID = user.getCurrentLanguageIDs().get(0);
        Language currentLanguage = languageRepository.findById(currentLanguageID).orElse(null);
        if (currentLanguage == null) {
            LOGGER.severe("Current language is null for the user " + user.getUsername());
            return new ResponseEntity<>("Current language is null for the user " + user.getUsername(), HttpStatus.BAD_REQUEST);
        }
        response.put("language", currentLanguage);

        //Get word categories
        Map<String, Category> categories = new HashMap<>();
        categoryRepository.findAll().forEach(category -> {
            categories.put(category.getId(), category);
        });
        response.put("categories", categories);

        //Get word data
        Map<String, WordMessage> words = new HashMap<>();
        user.getAssignedWords(currentLanguageID).forEach(wordID -> {
            wordRepository.findById(wordID).ifPresent(word -> {
                words.put(wordID, new WordMessage(word, currentLanguageID, mainLanguageID));
            });
        });
        response.put("words", words);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
