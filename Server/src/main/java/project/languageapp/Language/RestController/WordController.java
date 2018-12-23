package project.languageapp.Language.RestController;

import project.languageapp.Language.Model.*;
import project.languageapp.Language.Repository.WordRepository;
import project.languageapp.Language.Requests.WordCURequest;
import project.languageapp.Language.RestController.BaseClasses.ImageManager;
import project.languageapp.Language.Service.WordService;
import project.languageapp.Wrappers.MPRWrapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartHttpServletRequest;
import project.languageapp.Wrappers.MPRService;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;
import java.util.stream.Collectors;

@RestController
@RequestMapping("api/words")
public class WordController extends ImageManager {

    @Value("${languageFolder}")
    private String languageFolder;

    @Autowired
    private WordRepository wordRepository;

    @Autowired
    private WordService wordService;

    @Autowired
    private MPRService wrapperService;

    private final static Logger LOGGER = Logger.getLogger(Logger.GLOBAL_LOGGER_NAME);

    @RequestMapping(value = "/load", method = RequestMethod.GET)
    public ResponseEntity<?> loadWords() {
        LOGGER.info("Word load request has been received");
        List<Word> words = wordRepository.findAll();
        LOGGER.info("Word load request has been handled");
        return new ResponseEntity<>(words, HttpStatus.OK);
    }

    @RequestMapping(value = "/delete", method = RequestMethod.POST)
    public ResponseEntity<?> deleteWord(@RequestBody String wordID) {
        Word word = wordRepository.findById(wordID).orElse(null);
        if (word == null)  {
            LOGGER.severe("Word with ID " + wordID + " cannot be deleted (Word with this ID does not exist)");
            return new ResponseEntity<>("Word with ID " + wordID + " cannot be deleted (Word with this ID does not exist)", HttpStatus.NO_CONTENT);
        }

        RemoveImage(word, "words");

        wordService.RemoveWordFromUsers(wordID);
        wordService.RemoveWordFromAllCategories(word);
        wordRepository.removeById(wordID);

        LOGGER.info("Word with ID " + wordID + " has been deleted");
        return new ResponseEntity<>("Word with ID " + wordID + " has been deleted", HttpStatus.OK);
    }

    @RequestMapping(value = "/save", method = RequestMethod.POST)
    public ResponseEntity<?> createOrEditWord(MultipartHttpServletRequest request) {
        MPRWrapper wrapper = wrapperService.createInstance(request);
        WordCURequest requestData;
        Word word;
        Boolean isPictureUploaded;
        Boolean isEditing;
        String id;

        try {
            isPictureUploaded = wrapper.getBoolean("pictureUploaded");
            isEditing = wrapper.getBoolean("editing");
            requestData = wrapper.convertToObject(WordCURequest.class);
            if (!requestData.isValid())
                return new ResponseEntity<>("Cannot parse the word data due to missing field(s). Check server logs for more details.", HttpStatus.BAD_REQUEST);
        }
        catch (Exception e) {
            LOGGER.severe("Cannot parse WordCURequest. Error : " + e.toString());
            return new ResponseEntity<>("Cannot parse the word data. Check server logs for more details.", HttpStatus.BAD_REQUEST);
        }

        if (isEditing) {
            id = wrapper.getString("id");
            word = wordRepository.findById(id).orElse(null);
            if (word == null) {
                LOGGER.severe("Word cannot be edited : Word with id " + id + " does not exists!");
                return new ResponseEntity<>("Word cannot be edited : Word with id " + id + " does not exists!", HttpStatus.BAD_REQUEST);
            }

            /*
                If the client sent an edit request for a word, detect which word categories are added and removed
                for this word, and then apply necessary changes in Word object
             */

            final List<String> dataCategories = requestData.getCategories();
            final List<String> wordCategories = word.getCategories();

            List<String> addedCategories = dataCategories.stream().filter(elem -> !wordCategories.contains(elem)).collect(Collectors.toList());
            List<String> removedCategories = wordCategories.stream().filter(elem -> !dataCategories.contains(elem)).collect(Collectors.toList());

            wordService.AddWordToCategories(word.getId(), addedCategories);
            wordService.RemoveWordFromCategories(word.getId(), removedCategories);
            word.edit(requestData);
            word = wordRepository.save(word);
        }
        else {
            word = new Word(requestData);
            word = wordRepository.save(word);
            wordService.AddWordToCategories(word.getId(), word.getCategories());
        }

        if (isPictureUploaded)
            word = SaveImage(word, wrapper, wordRepository, "words");

        LOGGER.info("Word saved. (ID : " + word.getId() + ")");
        Map<String, String> response = new HashMap<>();
        response.put("id", word.getId());
        response.put("pictureURL", word.getPictureURL());
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}