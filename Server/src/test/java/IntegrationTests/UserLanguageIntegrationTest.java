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
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.junit4.SpringRunner;
import project.languageapp.Language.Model.User;
import project.languageapp.Language.Repository.CategoryRepository;
import project.languageapp.Language.Repository.LanguageRepository;
import project.languageapp.Language.Repository.UserRepository;
import project.languageapp.Language.Repository.WordRepository;
import project.languageapp.Language.Requests.UserLanguageEditRequest;
import project.languageapp.Language.RestController.UserController;
import project.languageapp.ServerApplication;
import project.languageapp.Wrappers.MPRService;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Set;

import static junit.framework.TestCase.assertEquals;
import static junit.framework.TestCase.assertTrue;

@RunWith(SpringRunner.class)
@SpringBootTest(classes = ServerApplication.class)
public class UserLanguageIntegrationTest {

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
    private UserController userController;

    @Autowired
    private Environment environment;

    @Before
    public void setUp() throws Exception {
        WordRepositoryMocker.mockRepository(wordRepository);
        UserRepositoryMocker.mockRepository(userRepository);
        LanguageRepositoryMocker.mockRepository(languageRepository);
        CategoryRepositoryMocker.mockRepository(categoryRepository);
        MPRServiceMocker.mockMPRService(wrapperService);
    }

    @Test
    public void assignNewWordsToUser() {

        User user = userRepository.findById("0").get();
        Set<String> assignedWordIDs = user.getAssignedWords("0");
        assertTrue(assignedWordIDs.contains("0"));
        assertTrue(!assignedWordIDs.contains("1"));

        userController.saveUserLanguage(UserLanguageEditRequest.builder()
                                                                .userID("0")
                                                                .languageID("0")
                                                                .addedWordIDs(new ArrayList<>(Arrays.asList("1")))
                                                                .removedWordIDs(new ArrayList<>(Arrays.asList("0")))
                                                                .build());

        user = userRepository.findById("0").get();
        assignedWordIDs = user.getAssignedWords("0");
        assertTrue(!assignedWordIDs.contains("0"));
        assertTrue(assignedWordIDs.contains("1"));
    }

    @Test
    public void updateLanguageOfNonExistingUser() {
        ResponseEntity<?> response = userController.saveUserLanguage(UserLanguageEditRequest.builder()
                .userID("INVALID_ID")
                .languageID("0")
                .addedWordIDs(new ArrayList<>(Arrays.asList("1")))
                .removedWordIDs(new ArrayList<>(Arrays.asList("0")))
                .build());

        assertEquals(response.getStatusCode(), HttpStatus.NO_CONTENT);
    }

    @Test
    public void updateNonExistingLanguageOfNUser() {
        ResponseEntity<?> response = userController.saveUserLanguage(UserLanguageEditRequest.builder()
                .userID("0")
                .languageID("INVALID_ID")
                .addedWordIDs(new ArrayList<>(Arrays.asList("1")))
                .removedWordIDs(new ArrayList<>(Arrays.asList("0")))
                .build());

        assertEquals(response.getStatusCode(), HttpStatus.NO_CONTENT);
    }

    @Test
    public void updateByInvalidRequest() {
        ResponseEntity<?> response = userController.saveUserLanguage(UserLanguageEditRequest.builder()
                .userID("0")
                .languageID("0")
                .removedWordIDs(new ArrayList<>(Arrays.asList("0")))
                .build());

        assertEquals(response.getStatusCode(), HttpStatus.BAD_REQUEST);
    }





}
