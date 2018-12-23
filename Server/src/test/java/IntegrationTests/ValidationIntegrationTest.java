package IntegrationTests;

import MockRepositories.UserRepositoryMocker;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.util.LinkedMultiValueMap;
import project.languageapp.Controllers.LoginController;
import project.languageapp.Language.Model.User;
import project.languageapp.Language.Repository.UserRepository;
import project.languageapp.Login.UserLoginRequest;
import project.languageapp.ServerApplication;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.junit.Assert.assertEquals;

@RunWith(SpringRunner.class)
@SpringBootTest(classes = ServerApplication.class, webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class ValidationIntegrationTest {

    @MockBean
    private UserRepository userRepository;

    @Autowired
    private LoginController loginController;

    private TestRestTemplate restTemplate = new TestRestTemplate();

    @Autowired
    private Environment environment;

    @Before
    public void setUp() {
        UserRepositoryMocker.mockRepository(userRepository);
    }

    @Test
    public void testValidation() throws Exception {

        String port = environment.getProperty("local.server.port");

        ResponseEntity<?> response = loginController.login(UserLoginRequest.builder()
                                                             .username("user1")
                                                             .password("user1")
                                                             .build());

        String token = ((Map<String,String>)response.getBody()).get("token");
        HttpStatus status = response.getStatusCode();
        assertEquals(HttpStatus.OK, status);

        restTemplate.getRestTemplate().setInterceptors(
            Collections.singletonList((request, body, execution) -> {
                request.getHeaders().add("Auth", token);
                request.getHeaders().add("Content-Type", "application/json");
                return execution.execute(request, body);
            }));

        User user = this.restTemplate.postForEntity(
                "http://localhost:" + port + "/token/validate",
                new LinkedMultiValueMap<String, Object>(), User.class).getBody();

        User actualUser = userRepository.findUser("user1");
        assertEquals(user.getUsername(), actualUser.getUsername());
        assertEquals(user.getPassword(), actualUser.getPassword());
        assertEquals(user.getRealName(), actualUser.getRealName());
    }

    @Test(expected = Exception.class)
    public void testValidationWithoutHeader() {
        restTemplate.getRestTemplate().setInterceptors(
            Collections.singletonList((request, body, execution) -> {
                request.getHeaders().add("Content-Type", "application/json");
                return execution.execute(request, body);
            }));

        String port = environment.getProperty("local.server.port");

        User user = this.restTemplate.postForEntity(
                "http://localhost:" + port + "/token/validate",
                new LinkedMultiValueMap<String, Object>(), User.class).getBody();


    }

    @Test(expected = Exception.class)
    public void testValidationWithInvalidToken() {
        restTemplate.getRestTemplate().setInterceptors(
            Collections.singletonList((request, body, execution) -> {
                request.getHeaders().add("Auth", "INVALID_TOKEN");
                request.getHeaders().add("Content-Type", "application/json");
                return execution.execute(request, body);
            }));

        String port = environment.getProperty("local.server.port");

        User user = this.restTemplate.postForEntity(
                "http://localhost:" + port + "/token/validate",
                new LinkedMultiValueMap<String, Object>(), User.class).getBody();
    }

    @Test
    public void accessAPIWithToken() throws Exception {
        String port = environment.getProperty("local.server.port");

        ResponseEntity<?> response = loginController.login(UserLoginRequest.builder()
                .username("user1")
                .password("user1")
                .build());

        String token = ((Map<String,String>)response.getBody()).get("token");
        HttpStatus status = response.getStatusCode();
        assertEquals(HttpStatus.OK, status);

        restTemplate.getRestTemplate().setInterceptors(
                Collections.singletonList((request, body, execution) -> {
                    request.getHeaders().add("Auth", token);
                    request.getHeaders().add("Content-Type", "application/json");
                    return execution.execute(request, body);
                }));

        ResponseEntity<?> res = this.restTemplate.getForEntity(
                "http://localhost:" + port + "/api/words/load", List.class);

        assertEquals(res.getStatusCode(), HttpStatus.OK);
    }

    @Test(expected = Exception.class)
    public void accessAPIWithoutToken() {

        String port = environment.getProperty("local.server.port");

        restTemplate.getRestTemplate().setInterceptors(
                Collections.singletonList((request, body, execution) -> {
                    request.getHeaders().add("Content-Type", "application/json");
                    return execution.execute(request, body);
                }));

        ResponseEntity<?> res = this.restTemplate.getForEntity(
                "http://localhost:" + port + "/api/words/load", List.class);
    }

    @Test(expected = Exception.class)
    public void accessAPIWithInvalidToken() {

        String port = environment.getProperty("local.server.port");

        restTemplate.getRestTemplate().setInterceptors(
            Collections.singletonList((request, body, execution) -> {
                request.getHeaders().add("Auth", "INVALID_TOKEN");
                request.getHeaders().add("Content-Type", "application/json");
                return execution.execute(request, body);
            }));

        ResponseEntity<?> res = this.restTemplate.getForEntity(
                "http://localhost:" + port + "/api/words/load", List.class);
    }
}