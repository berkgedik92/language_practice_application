package project.languageapp.Services;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import project.languageapp.Language.Model.User;
import project.languageapp.Language.Repository.UserRepository;

import javax.servlet.ServletException;
import java.util.Date;
import java.util.logging.Logger;

/*
    Token Manager

    Responsible of creating tokens and checking whether a token is valid or not

 */
@Service
public class TokenManager {

    @Value("${JWTKey}")
    private String JWTKey;

    private final static Logger LOGGER = Logger.getLogger(Logger.GLOBAL_LOGGER_NAME);

    @Autowired
    private UserRepository userRepository;

    public String produce (String username) throws Exception {

        User user = userRepository.findUser(username);

        if (user == null) {
            LOGGER.severe("TokenManager produce method : There is no user with username " + username);
            throw new ServletException("No user with username " + username);
        }

        Claims claims = Jwts.claims();
        claims.setSubject("logintoken");
        claims.put("username", username);

        return Jwts.builder().setSubject("logintoken")
                .setIssuedAt(new Date())
                .setClaims(claims)
                .signWith(SignatureAlgorithm.HS256, JWTKey)
                .compact();
    }

    public User check (String token) throws ServletException {

        Claims claims;

        //If the token is invalid (corrupted or fake), reject the request
        try {
            claims = Jwts.parser().setSigningKey(JWTKey).parseClaimsJws(token).getBody();
        } catch (Exception e) {
            LOGGER.severe("Invalid token is received!");
            throw new ServletException("The token is invalid!");
        }

        //If the owner of token is not in DB (maybe this user has been removed), reject the request
        String username = (String) claims.get("username");
        User user = userRepository.findUser(username);

        if (user == null) {
            LOGGER.severe("The owner of this token is not a valid user (username : " + username + ")");
            throw new ServletException("The owner of this token does not exist");
        }

        return user;
    }
}
