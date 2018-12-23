package IntegrationTests;

import MockMRP.MPRServiceMocker;
import MockRepositories.CategoryRepositoryMocker;
import MockRepositories.LanguageRepositoryMocker;
import MockRepositories.UserRepositoryMocker;
import MockRepositories.WordRepositoryMocker;
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
import project.languageapp.Language.Repository.CategoryRepository;
import project.languageapp.Language.Repository.LanguageRepository;
import project.languageapp.Language.Repository.UserRepository;
import project.languageapp.Language.Repository.WordRepository;
import project.languageapp.Language.RestController.ClientController;
import project.languageapp.Login.UserLoginRequest;
import project.languageapp.ServerApplication;
import project.languageapp.Wrappers.MPRService;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Map;

import static org.junit.Assert.assertEquals;

@RunWith(SpringRunner.class)
@SpringBootTest(classes = ServerApplication.class, webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class ClientIntegrationTest {

    @MockBean
    private WordRepository wordRepository;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private LanguageRepository languageRepository;

    @MockBean
    private CategoryRepository categoryRepository;

    @MockBean
    private MPRService wrapperService;

    @Autowired
    private ClientController clientController;

    @Autowired
    private Environment environment;

    @Autowired
    private LoginController loginController;

    private TestRestTemplate restTemplate = new TestRestTemplate();

    @Before
    public void setUp() throws Exception {
        WordRepositoryMocker.mockRepository(wordRepository);
        UserRepositoryMocker.mockRepository(userRepository);
        LanguageRepositoryMocker.mockRepository(languageRepository);
        CategoryRepositoryMocker.mockRepository(categoryRepository);
        MPRServiceMocker.mockMPRService(wrapperService);
    }

    @Test
    public void getData() throws Exception {
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
                    return execution.execute(request, body);
                }));

        ResponseEntity<?> res =this.restTemplate.getForEntity(
                "http://localhost:" + port + "/api/client/loaddata", Map.class);

        assertEquals(res.getStatusCode(), HttpStatus.OK);

        Map<String, Object> data = (Map<String, Object>)res.getBody();
    }

    @Test
    public void tryToGetDataForBadUser1() throws Exception {
        User user = new User();
        user.setUsername("baduser");
        user.setPassword("baduser");

        userRepository.save(user);

        String port = environment.getProperty("local.server.port");

        ResponseEntity<?> response = loginController.login(UserLoginRequest.builder()
                .username("baduser")
                .password("baduser")
                .build());

        String token = ((Map<String,String>)response.getBody()).get("token");
        HttpStatus status = response.getStatusCode();
        assertEquals(HttpStatus.OK, status);

        restTemplate.getRestTemplate().setInterceptors(
                Collections.singletonList((request, body, execution) -> {
                    request.getHeaders().add("Auth", token);
                    return execution.execute(request, body);
                }));

        ResponseEntity<?> res = this.restTemplate.getForEntity(
                "http://localhost:" + port + "/api/client/loaddata", String.class);

        assertEquals(res.getStatusCode(), HttpStatus.BAD_REQUEST);
    }

    @Test
    public void tryToGetDataForBadUser2() throws Exception {
        User user = new User();
        user.setUsername("baduser");
        user.setPassword("baduser");
        user.setCurrentLanguageIDs(new ArrayList<>(Arrays.asList("INVALID_ID")));

        userRepository.save(user);

        String port = environment.getProperty("local.server.port");

        ResponseEntity<?> response = loginController.login(UserLoginRequest.builder()
                .username("baduser")
                .password("baduser")
                .build());

        String token = ((Map<String,String>)response.getBody()).get("token");
        HttpStatus status = response.getStatusCode();
        assertEquals(HttpStatus.OK, status);

        restTemplate.getRestTemplate().setInterceptors(
                Collections.singletonList((request, body, execution) -> {
                    request.getHeaders().add("Auth", token);
                    return execution.execute(request, body);
                }));

        ResponseEntity<?> res =this.restTemplate.getForEntity(
                "http://localhost:" + port + "/api/client/loaddata", String.class);

        assertEquals(res.getStatusCode(), HttpStatus.BAD_REQUEST);
    }

    @Test
    public void tryToGetDataForBadUser3() throws Exception {
        User user = new User();
        user.setUsername("baduser");
        user.setPassword("baduser");
        user.setMainLanguageIDs(new ArrayList<>(Arrays.asList("INVALID_ID")));

        userRepository.save(user);

        String port = environment.getProperty("local.server.port");

        ResponseEntity<?> response = loginController.login(UserLoginRequest.builder()
                .username("baduser")
                .password("baduser")
                .build());

        String token = ((Map<String,String>)response.getBody()).get("token");
        HttpStatus status = response.getStatusCode();
        assertEquals(HttpStatus.OK, status);

        restTemplate.getRestTemplate().setInterceptors(
                Collections.singletonList((request, body, execution) -> {
                    request.getHeaders().add("Auth", token);
                    return execution.execute(request, body);
                }));

        ResponseEntity<?> res =this.restTemplate.getForEntity(
                "http://localhost:" + port + "/api/client/loaddata", String.class);

        assertEquals(res.getStatusCode(), HttpStatus.BAD_REQUEST);
    }
}
