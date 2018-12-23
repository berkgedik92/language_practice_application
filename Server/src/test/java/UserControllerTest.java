import MockMRP.MPRServiceMocker;
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
import org.springframework.web.multipart.MultipartHttpServletRequest;
import project.languageapp.Language.Model.User;
import project.languageapp.Language.Repository.UserRepository;
import project.languageapp.Language.Requests.UserCURequest;
import project.languageapp.Language.RestController.UserController;
import project.languageapp.Wrappers.MPRService;
import java.util.*;

import static junit.framework.TestCase.assertTrue;
import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.mock;

@RunWith(MockitoJUnitRunner.Silent.class)
public class UserControllerTest {

    @InjectMocks
    private static UserController userController;

    @Mock
    private static UserRepository userRepository;

    @Mock
    private static MPRService wrapperService;

    @Before
    public void setUp() throws Exception {
        MockitoAnnotations.initMocks(this);
        UserRepositoryMocker.mockRepository(userRepository);
        MPRServiceMocker.mockMPRService(wrapperService);
    }

    private List<User> checkUserAmountAndReturnList(long expectedLength) {
        ResponseEntity<?> response = userController.loadUsers();
        List<User> users = (List<User>) response.getBody();
        HttpStatus status = response.getStatusCode();
        assertEquals(HttpStatus.OK, status);
        assertEquals(expectedLength, users.size());
        return users;
    }

    @Test
    public void checkIfSameWithInitialDB() {
        List<User> words = checkUserAmountAndReturnList(1);
        assertEquals("user1", words.get(0).getUsername());
    }

    @Test
    public void deleteExistingUser() {
        ResponseEntity<?> response = userController.deleteUser("0");
        String result = (String) response.getBody();
        HttpStatus status = response.getStatusCode();
        assertEquals(HttpStatus.OK, status);
        checkUserAmountAndReturnList(0);
    }

    @Test
    public void tryToDeleteNonExistingUser() {
        ResponseEntity<?> response = userController.deleteUser("INVALID_ID");
        String result = (String) response.getBody();
        HttpStatus status = response.getStatusCode();
        assertEquals(HttpStatus.NO_CONTENT, status);
        checkIfSameWithInitialDB();
    }

    @Test
    public void saveANewUser() {

        Map<String, Object> request = new HashMap<>();

        request.put("data", UserCURequest.builder()
                .username("user2")
                .password("user2")
                .realName("User 2")
                .languageIDs(new ArrayList<>())
                .currentLanguageIDs(new ArrayList<>())
                .mainLanguageIDs(new ArrayList<>())
                .build());

        request.put("pictureUploaded", false);
        request.put("editing", false);
        MPRServiceMocker.setRequest(request);

        userController.createOrEditUser(mock(MultipartHttpServletRequest.class));

        List<User> users = checkUserAmountAndReturnList(2);
        Optional<User> myUser = users.stream().filter(user -> user.getRealName().equals("User 2")).findFirst();

        assertTrue(myUser.isPresent());
        User u = myUser.get();

        assertEquals(u.getUsername(), "user2");
    }

    @Test
    public void editAUser() {

        User wInit = userRepository.findUser("user1");

        Map<String, Object> request = new HashMap<>();

        request.put("data", UserCURequest.builder()
                .username("user1")
                .password("user1")
                .realName("New Name")
                .languageIDs(Arrays.asList("1", "2"))
                .currentLanguageIDs(Arrays.asList("1"))
                .mainLanguageIDs(Arrays.asList("2"))
                .build());

        request.put("pictureUploaded", false);
        request.put("editing", true);
        request.put("id", wInit.getId());
        MPRServiceMocker.setRequest(request);

        userController.createOrEditUser(mock(MultipartHttpServletRequest.class));

        List<User> users = checkUserAmountAndReturnList(1);
        Optional<User> myUser = users.stream().filter(user -> user.getUsername().equals("user1")).findFirst();

        assertTrue(myUser.isPresent());
        User u = myUser.get();

        assertEquals(u.getRealName(), "New Name");
    }

    @Test
    public void editANonExistingWord() {

        Map<String, String> meanings = new HashMap<>();

        Map<String, Object> request = new HashMap<>();

        request.put("data", UserCURequest.builder()
                .username("user1")
                .password("user1")
                .realName("New Name")
                .languageIDs(Arrays.asList("1", "2"))
                .currentLanguageIDs(Arrays.asList("1"))
                .mainLanguageIDs(Arrays.asList("2"))
                .build());

        request.put("pictureUploaded", false);
        request.put("editing", true);
        request.put("id", "INVALID_ID");
        MPRServiceMocker.setRequest(request);

        ResponseEntity<?> response = userController.createOrEditUser(mock(MultipartHttpServletRequest.class));
        assertEquals(response.getStatusCode(), HttpStatus.BAD_REQUEST);

        checkIfSameWithInitialDB();
    }
}