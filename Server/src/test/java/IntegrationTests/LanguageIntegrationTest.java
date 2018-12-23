package IntegrationTests;

import MockMRP.MPRServiceMocker;
import MockRepositories.LanguageRepositoryMocker;
import MockRepositories.UserRepositoryMocker;
import MockRepositories.WordRepositoryMocker;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.junit4.SpringRunner;
import project.languageapp.Language.Model.User;
import project.languageapp.Language.Model.Word;
import project.languageapp.Language.Repository.LanguageRepository;
import project.languageapp.Language.Repository.UserRepository;
import project.languageapp.Language.Repository.WordRepository;
import project.languageapp.Language.RestController.LanguageController;
import project.languageapp.ServerApplication;
import project.languageapp.Wrappers.MPRService;
import java.util.List;

import static junit.framework.TestCase.assertTrue;

@RunWith(SpringRunner.class)
@SpringBootTest(classes = ServerApplication.class)
public class LanguageIntegrationTest {

    @MockBean
    private WordRepository wordRepository;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private MPRService wrapperService;

    @MockBean
    private LanguageRepository languageRepository;

    @Autowired
    private LanguageController languageController;

    @Before
    public void setUp() throws Exception {
        UserRepositoryMocker.mockRepository(userRepository);
        WordRepositoryMocker.mockRepository(wordRepository);
        MPRServiceMocker.mockMPRService(wrapperService);
        LanguageRepositoryMocker.mockRepository(languageRepository);
    }

    @Test
    public void deleteALanguage() {
        List<Word> allWords = wordRepository.findAll();
        for (Word word : allWords) {
            assertTrue(word.getMeanings().containsKey("0"));
            assertTrue(word.getMeanings().get("0").length() > 0);
            assertTrue(word.getData().containsKey("0"));
        }

        List<User> allUsers = userRepository.findAll();
        for (User user : allUsers) {
            assertTrue(user.getLanguages().containsKey("0"));
            assertTrue(user.getCurrentLanguageIDs().contains("0"));
            assertTrue(user.getLanguageIDs().contains("0"));
        }

        languageController.deleteLanguage("0");

        allWords = wordRepository.findAll();
        for (Word word : allWords) {
            assertTrue(!word.getMeanings().containsKey("0"));
            assertTrue(!word.getData().containsKey("0"));
        }

        allUsers = userRepository.findAll();
        for (User user : allUsers) {
            assertTrue(!user.getLanguages().containsKey("0"));
            assertTrue(!user.getCurrentLanguageIDs().contains("0"));
            assertTrue(!user.getLanguageIDs().contains("0"));
        }
    }
}
