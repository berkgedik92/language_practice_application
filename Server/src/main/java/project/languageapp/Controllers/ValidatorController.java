package project.languageapp.Controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import project.languageapp.Language.Model.User;
import project.languageapp.Language.Repository.UserRepository;
import javax.servlet.http.HttpServletRequest;

/*
    Validator Controller: Works on /token/validate endpoint. A client is supposed to send a POST request into this endpoint
    with empty body and with a header {"Auth": <JWT_token>}.

    If JWT_token is valid, the end point will return a UserData object
    which contains user information of the owner of this JWT_token (username of the owner of the token is embedded in
    the token).

    Otherwise, JWTFilter component will interrupt the request and the client will get an error response.
 */

@Controller
@RequestMapping("token")
public class ValidatorController {

    @Autowired
    private UserRepository userRepository;

    @ModelAttribute("userdata")
    public User getUserdata(HttpServletRequest request) {
        return (User)request.getAttribute("userdata");
    }

    @RequestMapping(value = "/validate", method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity<User> validate(@ModelAttribute("userdata") User userdata) {
        return new ResponseEntity<>(userdata, HttpStatus.OK);
    }
}
