package project.languageapp.Language.RestController;

import project.languageapp.Language.Model.User;
import project.languageapp.Language.Repository.UserRepository;
import project.languageapp.Language.Requests.UserCURequest;
import project.languageapp.Language.Requests.UserLanguageEditRequest;
import project.languageapp.Language.RestController.BaseClasses.ImageManager;
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
@RequestMapping("api/user")
public class UserController extends ImageManager {

    @Value("${languageFolder}")
    private String languageFolder;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MPRService wrapperService;

    private final static Logger LOGGER = Logger.getLogger(Logger.GLOBAL_LOGGER_NAME);

    @RequestMapping(value = "/load", method = RequestMethod.GET)
    public ResponseEntity<?> loadUsers() {
        LOGGER.info("User load request has been received");
        List<User> allUsers = userRepository.findAll();
        LOGGER.info("User load request has been handled.");
        return new ResponseEntity<>(allUsers, HttpStatus.OK);
    }

    @RequestMapping(value = "/delete", method = RequestMethod.POST)
    public ResponseEntity<?> deleteUser(@RequestBody String userID) {
        User user = userRepository.findById(userID).orElse(null);
        if (user == null) {
            LOGGER.severe("User with ID " + userID + " cannot be deleted (User with this ID does not exist)");
            return new ResponseEntity<>("User with ID " + userID + " cannot be deleted (User with this ID does not exist)", HttpStatus.NO_CONTENT);
        }

        RemoveImage(user, "user");

        userRepository.removeById(userID);
        LOGGER.info("User with ID " + userID + " has been removed");
        return new ResponseEntity<>("User with ID " + userID + " has been removed", HttpStatus.OK);
    }

    @RequestMapping(value = "/save", method = RequestMethod.POST)
    public ResponseEntity<?> createOrEditUser(MultipartHttpServletRequest request) {
        MPRWrapper wrapper = wrapperService.createInstance(request);
        UserCURequest data;
        Boolean isPictureUploaded;
        Boolean isEditing;
        User user;
        String id;

        try {
            isPictureUploaded = wrapper.getBoolean("pictureUploaded");
            isEditing = wrapper.getBoolean("editing");
            data = wrapper.convertToObject(UserCURequest.class);
            if (!data.isValid())
                return new ResponseEntity<>("Cannot parse the user data due to missing field(s). Check server logs for more details.", HttpStatus.BAD_REQUEST);
        }
        catch(Exception e) {
            LOGGER.severe("Cannot parse UserCURequest. Error : " + e.toString());
            return new ResponseEntity<>("Cannot parse the user data. Check server logs for more details.", HttpStatus.BAD_REQUEST);
        }

        if (isEditing) {
            id = wrapper.getString("id");
            user = userRepository.findById(id).orElse(null);
            if (user == null) {
                LOGGER.severe("User cannot be edited : User with id " + id + " does not exists!");
                return new ResponseEntity<>("User cannot be edited : User with id " + id + " does not exists!", HttpStatus.BAD_REQUEST);
            }
            user.edit(data);
        }
        else
            user = new User(data);

        user = userRepository.save(user);

        if (isPictureUploaded)
            user = SaveImage(user, wrapper, userRepository, "users");

        LOGGER.info("User saved. (ID : " + user.getId() + ")");
        Map<String, String> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("pictureURL", user.getPictureURL());
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    /*
        For a user and a language pair, add or remove words to practice.
     */

    @RequestMapping(value = "/saveuserlanguage", method = RequestMethod.POST)
    public ResponseEntity<?> saveUserLanguage(@RequestBody UserLanguageEditRequest data) {

        if (!data.isValid())
            return new ResponseEntity<>("Cannot parse the userLanguage data due to missing field(s). Check server logs for more details.", HttpStatus.BAD_REQUEST);

        User user = userRepository.findById(data.getUserID()).orElse(null);

        if (user == null) {
            LOGGER.severe("/saveuserlanguage: User with id " + data.getUserID() + " does not exist");
            return new ResponseEntity<>("User with id " + data.getUserID() + " does not exist", HttpStatus.NO_CONTENT);
        }

        if (!user.getLanguages().containsKey(data.getLanguageID())) {
            LOGGER.severe("/saveuserlanguage: Language with id " + data.getLanguageID() + " does not exist for user with id " + data.getUserID());
            return new ResponseEntity<>("Language with id " + data.getLanguageID() + " does not exist for user with id " + data.getUserID(), HttpStatus.NO_CONTENT);
        }

        user.userLanguageUpdater(data.getLanguageID(), data.getAddedWordIDs(), data.getRemovedWordIDs());
        userRepository.save(user);
        LOGGER.info("User language data has been updated (User ID : " + data.getUserID() + ", Language ID " + data.getLanguageID() + "");
        return new ResponseEntity<>("User language data has been updated (User ID : " + data.getUserID() + ", Language ID " + data.getLanguageID() + "", HttpStatus.OK);
    }
}
