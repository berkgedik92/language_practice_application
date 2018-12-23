package project.languageapp.Controllers;

import project.languageapp.Language.Model.User;
import project.languageapp.Language.Repository.UserRepository;
import project.languageapp.Login.UserLoginRequest;
import project.languageapp.Services.TokenManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.logging.Logger;

/*
    Login Controller: works on /login/token endpoint. Gets username and password, checks if the credentials are correct.
    If so, returns a JWT token to the client.
*/

@Controller
@RequestMapping("login")
public class LoginController {

    @Autowired
    private TokenManager tokenManager;

    @Autowired
    private UserRepository userRepository;

    private final static Logger LOGGER = Logger.getLogger(Logger.GLOBAL_LOGGER_NAME);

    @RequestMapping(value = "/token", method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity<?> login(@RequestBody UserLoginRequest login) throws Exception {

        //Check if username and password are correct
        if (login.getUsername() == null || login.getPassword() == null) {
            LOGGER.severe("Username or password are empty");
            return new ResponseEntity<>("Username or password are empty", HttpStatus.UNAUTHORIZED);
        }

        User user = userRepository.findUser(login.getUsername());

        if (user == null) {
            LOGGER.severe("Wrong username for login! (attempt : " + login.getUsername() + ", " + login.getPassword() + ")");
            return new ResponseEntity<>("Wrong username or password", HttpStatus.UNAUTHORIZED);
        }

        if (!user.getPassword().equals(login.getPassword())) {
            LOGGER.severe("Wrong password for login! (attempt : " + login.getUsername() + ", " + login.getPassword() + ")");
            return new ResponseEntity<>("Wrong username or password", HttpStatus.UNAUTHORIZED);
        }

        //Credentials are correct, so produce and send the JWT token to the client
        String token = tokenManager.produce(login.getUsername());

        LOGGER.info("Login successful for user " + login.getUsername());

        HashMap<String, Object> response = new HashMap<>();
        response.put("token", token);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}