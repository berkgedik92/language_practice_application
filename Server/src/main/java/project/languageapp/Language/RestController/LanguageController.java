package project.languageapp.Language.RestController;

import project.languageapp.Language.Model.Language;
import project.languageapp.Language.Repository.*;
import project.languageapp.Language.Requests.LanguageCURequest;
import project.languageapp.Language.RestController.BaseClasses.ImageManager;
import project.languageapp.Language.Service.LanguageService;
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

@RestController
@RequestMapping("api/language")
public class LanguageController extends ImageManager {

    @Value("${languageFolder}")
    private String languageFolder;

    @Autowired
    private LanguageRepository languageRepository;

    @Autowired
    private LanguageService languageService;

    @Autowired
    private MPRService wrapperService;

    private final static Logger LOGGER = Logger.getLogger(Logger.GLOBAL_LOGGER_NAME);

    @RequestMapping(value = "/load", method = RequestMethod.GET)
    public ResponseEntity<?> loadLanguages() {
        List<Language> languages = languageRepository.findAll();
        LOGGER.info("Languages load request has been handled.");
        return new ResponseEntity<>(languages, HttpStatus.OK);
    }

    @RequestMapping(value = "/delete", method = RequestMethod.POST)
    public ResponseEntity<?> deleteLanguage(@RequestBody String id) {
        Language language = languageRepository.findById(id).orElse(null);
        if (language == null)  {
            LOGGER.severe("Language with ID " + id + " cannot be deleted (Language with this ID does not exist)");
            return new ResponseEntity<>("Language with ID " + id + " cannot be deleted (Language with this ID does not exist)", HttpStatus.NO_CONTENT);
        }

        RemoveImage(language, "language");

        languageService.RemoveLanguageFromUsers(id);
        languageService.RemoveLanguageFromWords(id);
        languageRepository.removeById(id);

        LOGGER.info("Language with ID " + id + " has been removed");
        return new ResponseEntity<>("Language with ID " + id + " has been removed", HttpStatus.OK);
    }

    @RequestMapping(value = "/save", method = RequestMethod.POST)
    public ResponseEntity<?> createOrEditLanguage(MultipartHttpServletRequest request) {
        MPRWrapper wrapper = wrapperService.createInstance(request);
        LanguageCURequest data;
        Boolean isPictureUploaded;
        Boolean isEditing;
        Language language;
        String id;

        try {
            isPictureUploaded = wrapper.getBoolean("pictureUploaded");
            isEditing = wrapper.getBoolean("editing");
            data = wrapper.convertToObject(LanguageCURequest.class);
            if (!data.isValid())
                return new ResponseEntity<>("Cannot parse the language data due to missing field(s). Check server logs for more details.", HttpStatus.BAD_REQUEST);
        }
        catch (Exception e) {
            LOGGER.severe("Cannot parse LanguageCURequest. Error : " + e.toString());
            return new ResponseEntity<>("Cannot parse the language data. Check server logs for more details.", HttpStatus.BAD_REQUEST);
        }

        if (isEditing) {
            id = wrapper.getString("id");
            language = languageRepository.findById(id).orElse(null);
            if (language == null) {
                LOGGER.severe("Language cannot be edited : Language with id " + id + " does not exists!");
                return new ResponseEntity<>("Language cannot be edited : Language with id " + id + " does not exists!", HttpStatus.BAD_REQUEST);
            }
            language.edit(data);
        }
        else
            language = new Language(data);

        language = languageRepository.save(language);

        if (isPictureUploaded)
            language = SaveImage(language, wrapper, languageRepository, "languages");

        LOGGER.info("Language saved. (ID : " + language.getId() + ")");
        Map<String, String> response = new HashMap<>();
        response.put("id", language.getId());
        response.put("pictureURL", language.getPictureURL());
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
