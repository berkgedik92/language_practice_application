import MockRepositories.UserRepositoryMocker;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import project.languageapp.Controllers.LoginController;
import project.languageapp.Language.Model.User;
import project.languageapp.Language.Repository.UserRepository;
import project.languageapp.Login.UserLoginRequest;
import project.languageapp.Services.TokenManager;
import java.util.*;

import static org.junit.Assert.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;

@RunWith(MockitoJUnitRunner.Silent.class)
public class LoginControllerTest {

    @InjectMocks
    private static LoginController loginController;

    @Mock
    private TokenManager tokenManager;

    @Mock
    private UserRepository userRepository;

    private static Map<String, String> usernameToToken;
    private static Map<String, String> tokenToUsername;

    @Before
    public void setUp() throws Exception {

        MockitoAnnotations.initMocks(this);
        UserRepositoryMocker.mockRepository(userRepository);
        usernameToToken = new HashMap<>();
        tokenToUsername = new HashMap<>();

        List<User> users = userRepository.findAll();
        for (int a = 0; a < users.size(); a++) {
            String username = users.get(a).getUsername();
            String token = "token_" + Integer.toString(a);
            usernameToToken.put(username, token);
            tokenToUsername.put(token, username);
        }

        doAnswer(invocation -> {
            String username = invocation.getArgument(0);
            if (usernameToToken.containsKey(username))
                return usernameToToken.get(username);
            return null;
        }).when(tokenManager).produce(any(String.class));
    }

    @Test
    public void loginWithValidUser() throws Exception {
        ResponseEntity<?> response = loginController.login(UserLoginRequest.builder()
                                                            .username("user1")
                                                            .password("user1")
                                                             .build());

        String token = ((Map<String,String>)response.getBody()).get("token");
        HttpStatus status = response.getStatusCode();
        assertEquals(HttpStatus.OK, status);
        assertEquals(token, usernameToToken.get("user1"));
    }

    @Test
    public void loginWithWrongPassword() throws Exception {
        ResponseEntity<?> response = loginController.login(UserLoginRequest.builder()
                .username("user1")
                .password("wrong_password")
                .build());

        String token = (String)response.getBody();
        HttpStatus status = response.getStatusCode();
        assertEquals(HttpStatus.UNAUTHORIZED, status);
    }

    @Test
    public void loginWithNoPassword() throws Exception {
        ResponseEntity<?> response = loginController.login(UserLoginRequest.builder()
                .username("user1")
                .build());

        String token = (String)response.getBody();
        HttpStatus status = response.getStatusCode();
        assertEquals(HttpStatus.UNAUTHORIZED, status);
    }

    @Test
    public void loginWithNoUserName() throws Exception {
        ResponseEntity<?> response = loginController.login(UserLoginRequest.builder()
                .password("user1")
                .build());

        String token = (String)response.getBody();
        HttpStatus status = response.getStatusCode();
        assertEquals(HttpStatus.UNAUTHORIZED, status);
    }

    @Test
    public void loginWithNonExistingUser() throws Exception {
        ResponseEntity<?> response = loginController.login(UserLoginRequest.builder()
                .username("nonexisting_user")
                .password("user_password")
                .build());

        String token = (String)response.getBody();
        HttpStatus status = response.getStatusCode();
        assertEquals(HttpStatus.UNAUTHORIZED, status);
    }


}
